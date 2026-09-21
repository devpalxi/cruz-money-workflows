/**
 * Compliance Gate Logic & Regional Cash Limits
 * 
 * Enforces:
 * 1. Statutory Australian state gaming cash payout caps
 * 2. National AUSTRAC AML threshold ($5,000 AUD) requiring IDV + Screening + CoP
 * 3. Optional venue-level opt-in for IDV/Screening below $5,000
 */

export const STATE_CASH_LIMITS = {
  ACT: 1200,
  NSW: 5000,
  VIC: 2000,
  NT: 500,
  QLD: null, // Venue-configured (no statutory fixed limit)
  SA: 2000,
  TAS: 1500,
  WA: null, // N/A — pokies banned outside casino at pubs/clubs
};

export const STATE_LABELS = {
  ACT: 'Australian Capital Territory',
  NSW: 'New South Wales',
  VIC: 'Victoria',
  NT: 'Northern Territory',
  QLD: 'Queensland',
  SA: 'South Australia',
  TAS: 'Tasmania',
  WA: 'Western Australia',
};

// National AML threshold — statutory fixed value (AUD)
export const AML_THRESHOLD = 5000;

// Amount at which ID verification and screening become mandatory, per state.
// Every state starts at the national AML amount. These are platform defaults:
// the super admin can change them (see lib/idvThresholds.js) and a venue can
// only go lower. The real figures need confirming with compliance.
export const DEFAULT_STATE_IDV_THRESHOLDS = {
  ACT: AML_THRESHOLD,
  NSW: AML_THRESHOLD,
  VIC: AML_THRESHOLD,
  NT: AML_THRESHOLD,
  QLD: AML_THRESHOLD,
  SA: AML_THRESHOLD,
  TAS: AML_THRESHOLD,
  WA: AML_THRESHOLD,
};

/**
 * The amount at or above which a venue requires ID and screening.
 *
 * @param {string} venueState
 * @param {object} [stateThresholds] - state overrides, defaults to the built-in table
 * @param {object} [venuePolicy]
 * @param {'all'|'skip'} [venuePolicy.idvPolicy] - 'all' requires ID on every payout
 * @param {number} [venuePolicy.idvSkipThreshold] - venue amount, only ever lowers the state figure
 * @returns {number} 0 means every payout needs ID
 */
export function getIdvThreshold(venueState = 'NSW', stateThresholds = DEFAULT_STATE_IDV_THRESHOLDS, venuePolicy = {}) {
  const stateAmount = Number(stateThresholds?.[venueState] ?? DEFAULT_STATE_IDV_THRESHOLDS[venueState] ?? AML_THRESHOLD);
  if (venuePolicy.idvPolicy === 'all') return 0;
  const venueAmount = Number(venuePolicy.idvSkipThreshold);
  if (venuePolicy.idvPolicy === 'skip' && venueAmount > 0) return Math.min(stateAmount, venueAmount);
  return stateAmount;
}

/**
 * Calculates the effective cash cap for a venue.
 * 
 * @param {object} venueConfig
 * @param {string} [venueConfig.venueState='NSW']
 * @param {number} [venueConfig.noEFTLimit] - Venue's internal cash limit (if set)
 * @param {number} [venueConfig.qldCashLimitOverride=1000] - QLD custom limit
 * @returns {number|null} Effective cash limit or null if no cap applies
 */
export function getEffectiveCashCap(venueConfig = {}) {
  const venueState = venueConfig.venueState || 'NSW';
  const stateCashLimit = venueState === 'QLD'
    ? (venueConfig.qldCashLimitOverride != null ? Number(venueConfig.qldLimitOverride ?? venueConfig.qldCashLimitOverride) : 1000)
    : (STATE_CASH_LIMITS[venueState] ?? null);

  if (stateCashLimit === null) return null;

  const internalLimit = venueConfig.noEFTLimit != null ? Number(venueConfig.noEFTLimit) : Infinity;
  return Math.min(stateCashLimit, internalLimit);
}

/**
 * Evaluates compliance checklist and cash limits for a given win amount and venue config.
 * 
 * @param {number} winAmount - Gross payout amount in AUD
 * @param {object} venueConfig - Configuration object
 * @returns {object} Gate evaluation results
 */
export function computeComplianceGate(winAmount = 0, venueConfig = {}) {
  const win = Number(winAmount) || 0;
  const venueState = venueConfig.venueState || 'NSW';
  const isAMLThresholdMet = win >= AML_THRESHOLD;
  const optIn = Boolean(venueConfig.requireIDVBelowAMLThreshold);

  const requiresIDV = isAMLThresholdMet || optIn;
  const requiresScreening = isAMLThresholdMet || optIn;
  const requiresCoP = true; // Always required for any electronic/payout processing

  let triggerReason = '';
  if (isAMLThresholdMet) {
    triggerReason = 'Mandatory AML threshold (≥ $5,000 AUD)';
  } else if (optIn) {
    triggerReason = 'Venue compliance policy (all payouts)';
  } else {
    triggerReason = 'Below AML threshold ($5,000 AUD)';
  }

  const stateCashLimit = venueState === 'QLD'
    ? (venueConfig.qldCashLimitOverride != null ? Number(venueConfig.qldCashLimitOverride) : 1000)
    : (STATE_CASH_LIMITS[venueState] ?? null);

  const effectiveCashCap = getEffectiveCashCap(venueConfig);

  return {
    requiresIDV,
    requiresScreening,
    requiresCoP,
    triggerReason,
    stateCashLimit,
    effectiveCashCap,
    isAMLThresholdMet,
    venueState,
    stateLabel: STATE_LABELS[venueState] || venueState,
    isVenueCashLimitOverridden: venueState === 'QLD',
  };
}
