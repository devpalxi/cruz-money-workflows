/**
 * Patron self-service verification links.
 *
 * In the real system the token is issued server-side, delivered by SMS, and the
 * verification state lives in Strapi. There is no backend in this prototype, so
 * each link is a localStorage record keyed by token - localStorage rather than
 * sessionStorage because the collector terminal and the patron's page are
 * different tabs, and both have to read the same record as it progresses.
 */

const STORE_KEY = 'verificationLinks';

export const LINK_TTL_MINUTES = 30;

export const MAX_ID_ATTEMPTS = 2;
export const MAX_COP_ATTEMPTS = 3;

export const LINK_STATUS = {
  SENT: 'sent',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  STAFF_ACTION: 'staff_action',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
};

export const LINK_STATUS_LABELS = {
  [LINK_STATUS.SENT]: 'Link sent, not opened yet',
  [LINK_STATUS.IN_PROGRESS]: 'Patron is verifying now',
  [LINK_STATUS.COMPLETED]: 'Verification complete',
  [LINK_STATUS.STAFF_ACTION]: 'Needs staff verification',
  [LINK_STATUS.EXPIRED]: 'Link expired',
  [LINK_STATUS.CANCELLED]: 'Switched to manual verification',
};

// What the collector asks the patron to complete on their phone. ID always
// includes the face photo, so it is one unit here. Whatever a type leaves out,
// the collector picks up at the counter once the link completes.
export const LINK_TYPES = [
  { value: 'id', label: 'ID only', includesSecondary: false, includesBank: false },
  { value: 'id_secondary', label: 'ID + secondary ID', includesSecondary: true, includesBank: false },
  { value: 'id_secondary_bank', label: 'ID + secondary ID + bank', includesSecondary: true, includesBank: true },
  { value: 'id_bank', label: 'ID + bank', includesSecondary: false, includesBank: true },
];

export const DEFAULT_LINK_TYPE = 'id_secondary_bank';

// Links issued before link types existed covered everything, so an unknown or
// missing value falls back to the full set rather than silently dropping bank.
export function getLinkType(value) {
  return LINK_TYPES.find((t) => t.value === value) || LINK_TYPES.find((t) => t.value === DEFAULT_LINK_TYPE);
}

// Where the collector continues once the patron is done. Only a completed link
// or a staff hand-back unlocks Continue; anything else returns null and the
// button stays disabled.
//
// A staff hand-back means the electronic ID check failed, so the collector
// verifies in person from Primary ID onwards regardless of the link type.
//
// needsBank is passed in rather than read here: payoutFlow imports this module
// for getPatronCoverage, so importing needsBankStep back would be a cycle.
export function getCollectorResumePath(linkType, status, needsBank = true) {
  if (status === LINK_STATUS.STAFF_ACTION) return '/collector/primary-id';
  if (status !== LINK_STATUS.COMPLETED) return null;
  const type = getLinkType(linkType);
  if (!type.includesSecondary) return '/collector/secondary-id';
  if (!type.includesBank && needsBank) return '/collector/bank-account';
  return '/collector/cheque-details';
}

// Read from the collector's sessionStorage form, which carries the link type
// alongside the token. Pages after Email address use it to skip what the
// patron already covered.
export function getPatronCoverage(form) {
  if (!form || form.verificationMode !== 'link' || !form.verificationToken) {
    return { id: false, secondary: false, bank: false };
  }
  const type = getLinkType(form.linkType);
  return { id: true, secondary: type.includesSecondary, bank: type.includesBank };
}

function readStore() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORE_KEY) || '{}');
  } catch (e) {
    return {};
  }
}

function writeStore(store) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch (e) {}
}

export function generateToken() {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID().replace(/-/g, '').slice(0, 20);
    }
  } catch (e) {}
  return `${Math.random().toString(36).slice(2, 12)}${Math.random().toString(36).slice(2, 12)}`;
}

// A link past its expiry reports as expired without being rewritten, so a
// record that expired while nobody was looking still reads correctly.
function applyExpiry(record) {
  if (!record) return null;
  const isTerminal =
    record.status === LINK_STATUS.COMPLETED ||
    record.status === LINK_STATUS.CANCELLED ||
    record.status === LINK_STATUS.STAFF_ACTION;
  if (!isTerminal && Date.now() > record.expiresAt) {
    return { ...record, status: LINK_STATUS.EXPIRED };
  }
  return record;
}

export function createLink(payout) {
  const token = generateToken();
  const now = Date.now();
  const record = {
    token,
    status: LINK_STATUS.SENT,
    createdAt: now,
    expiresAt: now + LINK_TTL_MINUTES * 60 * 1000,
    sendCount: 1,
    payout,
    result: null,
  };
  const store = readStore();
  store[token] = record;
  writeStore(store);
  return record;
}

export function getLink(token) {
  if (!token) return null;
  return applyExpiry(readStore()[token] || null);
}

export function updateLink(token, patch) {
  const store = readStore();
  const existing = store[token];
  if (!existing) return null;
  const next = { ...existing, ...patch };
  store[token] = next;
  writeStore(store);
  return next;
}

// Reissuing pushes the expiry out and clears an expired state, so a patron who
// ran out of time gets a working link rather than a second dead one.
export function resendLink(token) {
  const store = readStore();
  const existing = store[token];
  if (!existing) return null;
  const next = {
    ...existing,
    status: existing.status === LINK_STATUS.EXPIRED ? LINK_STATUS.SENT : existing.status,
    expiresAt: Date.now() + LINK_TTL_MINUTES * 60 * 1000,
    sendCount: (existing.sendCount || 1) + 1,
  };
  store[token] = next;
  writeStore(store);
  return next;
}

export function cancelLink(token) {
  return updateLink(token, { status: LINK_STATUS.CANCELLED, expiresAt: Date.now() });
}

export function buildVerifyPath(token) {
  return `/verify/${token}`;
}

export function buildVerifyUrl(token) {
  if (typeof window === 'undefined') return buildVerifyPath(token);
  return `${window.location.origin}${buildVerifyPath(token)}`;
}

export function formatExpiry(expiresAt) {
  if (!expiresAt) return '-';
  return new Date(expiresAt).toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
