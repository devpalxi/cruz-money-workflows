/**
 * How the Approver and Authoriser scenario presets are grouped, and what each
 * one shows. Both pages read this, so a preset is described once. Presets a
 * page does not have are skipped, and any preset missing from here still shows
 * up under "Other" so it is never lost.
 */

export const SCENARIO_GROUPS = [
  { name: 'Clear payouts', keys: ['all-clear', 'multi-id-pass'] },
  { name: 'Identity checks', keys: ['name-mismatch', 'manual-kyc', 'no-id', 'multi-id-mixed'] },
  { name: 'Screening matches', keys: ['dual-hit', 'single-hit'] },
  { name: 'Exclusions', keys: ['blacklist-match', 'self-exclusion', 'venue-ban'] },
  { name: 'Value and approvals', keys: ['high-value', 'foreign-payment', 'second-approval'] },
  { name: 'Conditional checks', keys: ['over-threshold', 'under-threshold', 'returning-winner'] },
  {
    name: 'Bank and payee',
    keys: ['reused-account', 'duplicate-person', 'duplicate-account', 'duplicate-shared'],
  },
];

export const SCENARIO_DESCRIPTIONS = {
  'all-clear': 'Licence verified, with no screening or exclusion matches. The simplest approval.',
  'multi-id-pass': 'Driver licence and Medicare both verified. A clean payout backed by two documents.',
  'name-mismatch': 'Passport verified but the name does not match, with PEP and sanctions matches to review.',
  'manual-kyc': 'Electronic ID was not possible, so a birth certificate was checked by hand.',
  'no-id': 'The winner had no ID. Needs a supervisor decision.',
  'multi-id-mixed': 'Licence and Medicare, where one document only partly matched.',
  'dual-hit': 'A PEP match and a sanctions match on the same winner, both waiting for review.',
  'single-hit': 'One screening match to review. The other screening check is clear.',
  'blacklist-match': 'The winner matches the venue blacklist. The record can be viewed from the payout.',
  'self-exclusion': 'A live self-exclusion order. The funds cannot be released.',
  'venue-ban': 'A venue ban match. The approver can proceed once they write down why.',
  'high-value': 'A $15,000 payout rated high risk, needing more than one sign-off.',
  'foreign-payment': 'A payout going outside Australia. A second approver is required.',
  'second-approval': 'The second approver\'s view of the foreign payment, with the first approval on record.',
  'over-threshold': 'An $8,000 payout at or above the state threshold, so ID, screening and the bank check all ran.',
  'under-threshold': 'A $1,200 payout under the state threshold. Only the bank check ran.',
  'returning-winner': 'A winner paid cleanly 34 days ago. Only the bank check ran.',
  'reused-account': 'Bank details reused from a previous payout, with the bank check run again.',
  'duplicate-person': 'The same person paid twice within 24 hours.',
  'duplicate-account': 'The same bank account used for three payouts across venues in 30 days.',
  'duplicate-shared': 'One bank account used under three different names. A high alert.',
};
