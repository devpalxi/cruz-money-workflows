/**
 * Gambling exclusion screening.
 *
 * The register holds two different kinds of entry and they are not
 * interchangeable:
 *
 *  - self       A patron-imposed gambling ban. Funds cannot be released until
 *               it expires. Only an Authoriser may override that, and only with
 *               a written reason.
 *  - venue_ban  Barred from the premises for behaviour, or an AML/sanctions
 *               driven listing. Nothing that blocks the payout itself, so an
 *               Approver may proceed with a note.
 *
 * Before this existed the kind of ban lived only in the free-text `reason`, so
 * nothing could tell a self-exclusion apart from a barring order. Everything
 * that screens a patron goes through screenPatron below, so the Collector,
 * Approver and Authoriser cannot reach different conclusions about the same
 * person.
 */

// No import of mockData here: mockData screens its own payout fixtures through
// this module, and importing it back would be a cycle. Callers pass the
// register in, which also lets a venue supply its own list later.

export const EXCLUSION_TYPES = {
  SELF: 'self',
  VENUE_BAN: 'venue_ban',
};

export const EXCLUSION_TYPE_LABELS = {
  [EXCLUSION_TYPES.SELF]: 'Self-exclusion',
  [EXCLUSION_TYPES.VENUE_BAN]: 'Venue ban',
};

export const EXCLUSION_SOURCES = {
  STATE: 'State register',
  VENUE: 'Venue list',
};

// The status a payout carries while a self-exclusion blocks it.
export const EXCLUSION_HOLD_STATUS = 'Exclusion hold';

// Dates in the register are written the way the rest of the prototype writes
// them ("12 Mar 2027"), not as ISO strings, so they need parsing before they
// can be compared.
export function parseRegisterDate(value) {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function formatRegisterDate(value) {
  const parsed = parseRegisterDate(value);
  if (parsed === null) return value || '-';
  return new Date(parsed).toLocaleDateString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// An expiry that has already passed releases the payout on its own. Without
// this a stale entry nobody remembered to close would strand the money
// indefinitely.
export function isExclusionExpired(entry, now = Date.now()) {
  if (!entry || entry.exclusionType !== EXCLUSION_TYPES.SELF) return false;
  const expires = parseRegisterDate(entry.expiresAt);
  return expires !== null && expires <= now;
}

// Name and date of birth are what the register actually holds, so they are what
// screening matches on. Names are compared case- and spacing-insensitively;
// aliases count as a match because that is the whole point of recording them.
function normaliseName(value) {
  return (value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function namesMatch(entry, name) {
  const candidate = normaliseName(name);
  if (candidate === '') return false;
  return normaliseName(entry.name) === candidate || normaliseName(entry.alias) === candidate;
}

/**
 * Screen a patron against the register.
 *
 * Passing a date of birth narrows the match; leaving it out matches on name
 * alone, which is what the Collector has to work with before an ID has been
 * read. Returns null when there is nothing to report.
 */
export function screenPatron({ name, dob } = {}, register = [], now = Date.now()) {
  const entry = register.find((item) => {
    if (item.status !== 'Active') return false;
    if (!namesMatch(item, name)) return false;
    // A supplied DOB has to agree. A blank one is not treated as a mismatch,
    // otherwise an early screen would clear someone it should have flagged.
    if (dob && item.dob && item.dob !== dob) return false;
    return true;
  });

  if (!entry) return null;

  const expired = isExclusionExpired(entry, now);
  const isSelfExclusion = entry.exclusionType === EXCLUSION_TYPES.SELF;

  return {
    entry,
    type: entry.exclusionType,
    typeLabel: EXCLUSION_TYPE_LABELS[entry.exclusionType] || 'Exclusion',
    source: entry.source,
    expiresAt: entry.expiresAt || null,
    expired,
    // Only a live self-exclusion stops the money. Everything else is a warning
    // the Approver can proceed past once they have written down why.
    blocksPayment: isSelfExclusion && !expired,
    // An Approver can never release a self-exclusion, expired or not - an
    // expired one simply never becomes a hold in the first place.
    approverMayProceed: !isSelfExclusion || expired,
    requiresAuthoriserOverride: isSelfExclusion && !expired,
  };
}

// Convenience for the payout pipeline: what a freshly submitted payout should
// be labelled, and when it comes off hold.
export function getExclusionHold(screening) {
  if (!screening || !screening.blocksPayment) return null;
  return {
    exclusionHold: EXCLUSION_TYPES.SELF,
    exclusionEntryId: screening.entry.id,
    exclusionReason: screening.entry.reason,
    fundsReleaseDate: screening.expiresAt,
  };
}
