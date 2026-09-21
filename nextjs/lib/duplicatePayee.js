/**
 * Duplicate payee alerting.
 *
 * Compares a payout with earlier ones and flags the same person, bank account
 * or address turning up again inside a time window. It only ever warns: the
 * result goes to the risk engine and the review screens, it never blocks a
 * payout by itself.
 *
 * "Earlier" is measured from the payout's own created time, not from now, so
 * mock history behaves the same whenever the prototype is opened.
 */

import { initialVenues } from './mockData';
import { getVenueComplianceCapture } from './venueCompliance';

// Alert when this payout plus the earlier matches reach the threshold.
export const DEFAULT_DUPLICATE_CONFIG = {
  dailyThreshold: 2,
  monthlyThreshold: 3,
  acrossVenues: true,
};

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTH_MS = 30 * DAY_MS;

// A payout that never went through does not count as being paid.
const IGNORED_STATUSES = new Set(['Rejected', 'Failed', 'Draft', 'Cancelled']);

export function getDuplicateConfig(venueId) {
  const capture = getVenueComplianceCapture(venueId);
  return {
    dailyThreshold: capture.duplicateDailyThreshold ?? DEFAULT_DUPLICATE_CONFIG.dailyThreshold,
    monthlyThreshold: capture.duplicateMonthlyThreshold ?? DEFAULT_DUPLICATE_CONFIG.monthlyThreshold,
    acrossVenues: capture.duplicateAcrossVenues ?? DEFAULT_DUPLICATE_CONFIG.acrossVenues,
  };
}

function toTime(value) {
  if (typeof value === 'number') return value;
  const text = String(value || '').replace(/(\d)(AM|PM)/i, '$1 $2');
  const time = Date.parse(text);
  return Number.isNaN(time) ? null : time;
}

// First and last word, so "Sarah Jane Jenkins" and "SARAH JENKINS" match.
function nameKey(name) {
  const words = String(name || '')
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return '';
  return `${words[0]} ${words[words.length - 1]}`;
}

function accountKey(item) {
  const bsb = String(item.bsb || '').replace(/[^0-9]/g, '');
  const account = String(item.accountNumber || '').replace(/[^0-9]/g, '');
  return bsb && account ? `${bsb}-${account}` : '';
}

function addressKey(item) {
  return String(item.address || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function venueClient(venueName) {
  return initialVenues.find((v) => v.name === venueName)?.clientId || null;
}

function inScope(payout, other, acrossVenues) {
  if (payout.venue === other.venue) return true;
  if (!acrossVenues) return false;
  const client = venueClient(payout.venue);
  return Boolean(client) && client === venueClient(other.venue);
}

function matchRow(item) {
  return {
    id: item.id,
    created: item.created,
    venue: item.venue,
    amount: item.amount,
    accountName: item.accountName,
  };
}

/**
 * @param {object} payout - { id, created, venue, accountName, bsb, accountNumber, dob?, address? }
 * @param {Array} history - earlier payouts in the same shape, plus status and amount
 * @param {object} [config] - see DEFAULT_DUPLICATE_CONFIG
 * @returns {{ alerts: Array, hasAlert: boolean, severity: 'high'|'medium'|null, summary: string }}
 */
export function findDuplicatePayees(payout, history = [], config = {}) {
  const cfg = { ...DEFAULT_DUPLICATE_CONFIG, ...config };
  const now = toTime(payout.created);
  if (now === null) return { alerts: [], hasAlert: false, severity: null, summary: '' };

  const earlier = history.filter((item) => {
    if (String(item.id) === String(payout.id)) return false;
    if (IGNORED_STATUSES.has(item.status)) return false;
    const time = toTime(item.created);
    if (time === null || time >= now || now - time > MONTH_MS) return false;
    return inScope(payout, item, cfg.acrossVenues);
  });

  const isDay = (item) => now - toTime(item.created) <= DAY_MS;
  const alerts = [];

  const consider = (field, label, matches) => {
    if (matches.length === 0) return;
    const dayTotal = matches.filter(isDay).length + 1;
    const monthTotal = matches.length + 1;
    const overDay = dayTotal >= cfg.dailyThreshold;
    const overMonth = monthTotal >= cfg.monthlyThreshold;
    if (!overDay && !overMonth) return;
    const window = overDay ? 'day' : 'month';
    const count = overDay ? dayTotal : monthTotal;
    alerts.push({
      field,
      severity: 'medium',
      window,
      count,
      text: `${label}: ${count} payouts in ${window === 'day' ? '24 hours' : '30 days'}`,
      matches: matches.map(matchRow),
    });
  };

  const personKey = nameKey(payout.accountName);
  const byPerson = earlier.filter((item) => {
    if (!personKey || nameKey(item.accountName) !== personKey) return false;
    return !(payout.dob && item.dob) || payout.dob === item.dob;
  });
  consider('person', 'Same person', byPerson);

  const payoutAccount = accountKey(payout);
  const byAccount = payoutAccount ? earlier.filter((item) => accountKey(item) === payoutAccount) : [];
  const otherNames = byAccount.filter((item) => nameKey(item.accountName) !== personKey);
  if (otherNames.length > 0) {
    // One account paid out under several names is stronger than a repeat, so
    // it is raised whatever the thresholds are.
    const names = new Set([personKey, ...otherNames.map((item) => nameKey(item.accountName))]);
    alerts.push({
      field: 'account_shared',
      severity: 'high',
      window: 'month',
      count: names.size,
      text: `One bank account used under ${names.size} different names`,
      matches: byAccount.map(matchRow),
    });
  } else {
    consider('account', 'Same bank account', byAccount);
  }

  const payoutAddress = addressKey(payout);
  const byAddress = payoutAddress ? earlier.filter((item) => addressKey(item) === payoutAddress) : [];
  consider('address', 'Same address', byAddress);

  const severity = alerts.some((a) => a.severity === 'high') ? 'high' : alerts.length > 0 ? 'medium' : null;
  return {
    alerts,
    hasAlert: alerts.length > 0,
    severity,
    summary: alerts.map((a) => a.text).join('. '),
  };
}

// Fixed examples for the approver and authoriser presets, so each case shows
// the same result every time the prototype is opened.
const DEMO_PAYOUT = {
  id: '596',
  created: 'Jul 14, 2026 12:00PM',
  venue: 'Riverside RSL Club',
  accountName: "James O'Sullivan",
  bsb: '632-000',
  accountNumber: '111-222-333',
};

const DEMO_HISTORY = {
  person: [
    { id: '571', created: 'Jul 14, 2026 09:15AM', venue: 'Riverside RSL Club', accountName: "James O'Sullivan", bsb: '032-001', accountNumber: '87654321', amount: 2400, status: 'Payment Completed' },
  ],
  account: [
    { id: '552', created: 'Jul 3, 2026 07:40PM', venue: 'Riverside Bowling Club', accountName: "James O'Sullivan", bsb: '632-000', accountNumber: '111-222-333', amount: 1800, status: 'Payment Completed' },
    { id: '531', created: 'Jun 25, 2026 03:05PM', venue: 'Riverside RSL Club', accountName: "James O'Sullivan", bsb: '632-000', accountNumber: '111-222-333', amount: 950, status: 'Payment Completed' },
  ],
  shared: [
    { id: '548', created: 'Jul 9, 2026 08:20PM', venue: 'Riverside RSL Club', accountName: 'Marcus Lee', bsb: '632-000', accountNumber: '111-222-333', amount: 3100, status: 'Payment Completed' },
    { id: '540', created: 'Jul 1, 2026 05:10PM', venue: 'Riverside Bowling Club', accountName: 'Tanya Brooks', bsb: '632-000', accountNumber: '111-222-333', amount: 1250, status: 'Payment Completed' },
  ],
};

export function runDuplicateDemo(kind) {
  return findDuplicatePayees(DEMO_PAYOUT, DEMO_HISTORY[kind] || [], DEFAULT_DUPLICATE_CONFIG);
}
