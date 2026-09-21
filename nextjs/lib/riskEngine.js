/**
 * Riverside Payouts — Automatic Risk Rating Engine (lib/riskEngine.js)
 * 
 * Deterministic rule-based evaluation of FrankieOne AML/IDV signals, blacklist hits,
 * transaction structuring, and venue-configured thresholds.
 * 
 * Designed to provide an auditable trigger trail and transition seamlessly to ML inference later.
 */

export const DEFAULT_VENUE_RISK_CONFIG = {
  routingMode: 'auto', // 'auto' | 'fixed'
  fixedApprovers: 2,
  lowRiskApprovers: 1,
  mediumRiskApprovers: 1, // 1 or 2
  highRiskApprovers: 2,
  lowThreshold: 5000,   // Value >= 5000 triggers Medium
  highThreshold: 10000, // Value >= 10000 triggers High
  enabledSignals: {
    pep: true,
    sanctions: true,
    adverseMedia: true,
    valueThreshold: true,
    idvPath: true,
    blacklist: true,
    cashRatio: true,
    documentCountry: true,
    foreignPayment: true,
    duplicatePayee: true,
  },
  // Conditions that require a second approver whatever the risk rating works
  // out to. Kept separate from the rating on purpose: a foreign payment wants
  // a second pair of eyes, but calling it "High risk" would misdescribe an
  // otherwise clean payout everywhere the rating is shown.
  secondApproverConditions: {
    foreignPayment: true,
  },
};

/**
 * Computes risk rating, fired trigger conditions, and recommended approvers.
 * 
 * @param {Object} signals - Input signals from FrankieOne, payout details, and venue
 * @param {Object} [customConfig] - Venue-level threshold & routing settings
 * @returns {Object} { rating: 'Low'|'Medium'|'High', score: number, triggers: Array, recommendedApprovers: number, requiresSecondApprover: boolean, routingReason: string }
 */
export function computeRisk(signals = {}, customConfig = {}) {
  const config = {
    ...DEFAULT_VENUE_RISK_CONFIG,
    ...customConfig,
    enabledSignals: {
      ...DEFAULT_VENUE_RISK_CONFIG.enabledSignals,
      ...(customConfig.enabledSignals || {})
    },
    secondApproverConditions: {
      ...DEFAULT_VENUE_RISK_CONFIG.secondApproverConditions,
      ...(customConfig.secondApproverConditions || {})
    }
  };

  const triggers = [];
  let score = 0; // 0-34: Low, 35-69: Medium, 70+: High

  const {
    idvPath = 'IDV1', // 'IDV1' | 'IDV2' | 'IDV3' | 'manual_kyc' | 'no_id' | 'reused'
    documentCountry = 'AU',
    driverLicenceResult = null, // 'pass' | 'fail' | null
    passportResult = null,      // 'pass' | 'fail' | null
    isPEP = false,
    pepLevel = null,            // 1 | 2 | 3 | null
    pepUrlReputation = null,    // 'high' | 'medium' | 'low' | null
    pepEntityReputation = null,
    isSanction = false,
    sanctionUrlReputation = null,
    sanctionEntityReputation = null,
    adverseMediaHits = 0,
    adverseMediaUrlReputation = null,
    transactionValue = 0,
    cashRatio = 0,              // 0.0 to 1.0 (cashAmount / totalAmount)
    blacklistMatch = false,
    foreignPayment = false,
    duplicatePayee = null,      // result of findDuplicatePayees, or null when not checked
    manualKycType = null,
    sessionTime = null,
    isPDocketImage = true,
  } = signals;

  // 1. Blacklist Match (Immediate High)
  if (config.enabledSignals.blacklist && blacklistMatch) {
    score += 80;
    triggers.push({
      id: 'blacklist',
      label: 'Venue Blacklist active match',
      severity: 'high',
      category: 'Venue Exclusion',
      detail: 'Patron matches an active statutory or venue self-exclusion order.'
    });
  }

  // 2. Sanctions Hit (Immediate High)
  if (config.enabledSignals.sanctions && isSanction) {
    score += 75;
    triggers.push({
      id: 'sanction',
      label: 'Sanctions listing match',
      severity: 'high',
      category: 'AML Screening',
      detail: sanctionEntityReputation
        ? 'Match identified on global sanctions register: ' + sanctionEntityReputation
        : 'Active match detected on international or Australian sanctions database.'
    });
  }

  // 3. PEP Hit (Granular evaluation by Class)
  if (config.enabledSignals.pep && isPEP) {
    if (pepLevel === 1) {
      score += 70;
      triggers.push({
        id: 'pep-class-1',
        label: 'Politically Exposed Person (PEP Class 1 - Foreign / Head of State)',
        severity: 'high',
        category: 'AML Screening',
        detail: 'Direct match with high-profile foreign political or military office holder.'
      });
    } else if (pepLevel === 2) {
      score += 45;
      triggers.push({
        id: 'pep-class-2',
        label: 'Politically Exposed Person (PEP Class 2 - Domestic Senior Official)',
        severity: 'medium',
        category: 'AML Screening',
        detail: 'Match with Australian regional executive, judicial member, or senior bureaucrat.'
      });
    } else if (pepLevel === 3) {
      score += 35;
      triggers.push({
        id: 'pep-class-3',
        label: 'Politically Exposed Person (PEP Class 3 - Local / Municipal)',
        severity: 'medium',
        category: 'AML Screening',
        detail: 'Match with local council official, municipal board member, or associate.'
      });
    } else {
      score += 50;
      triggers.push({
        id: 'pep-generic',
        label: 'Politically Exposed Person (PEP match)',
        severity: 'medium',
        category: 'AML Screening',
        detail: 'Active match recorded on PEP surveillance database.'
      });
    }
  }

  // 4. Adverse Media Hits
  if (config.enabledSignals.adverseMedia && adverseMediaHits > 0) {
    if (adverseMediaUrlReputation === 'high') {
      score += 40;
      triggers.push({
        id: 'adverse-media-high',
        label: 'Adverse media hits (' + adverseMediaHits + ' verified items)',
        severity: 'high',
        category: 'Reputational AML',
        detail: 'Credible media records linked to financial crime, fraud, or serious offenses.'
      });
    } else {
      score += 25;
      triggers.push({
        id: 'adverse-media-med',
        label: 'Adverse media hits (' + adverseMediaHits + ' article' + (adverseMediaHits > 1 ? 's' : '') + ')',
        severity: 'medium',
        category: 'Reputational AML',
        detail: 'Public records or news references identified requiring supervisor review.'
      });
    }
  }

  // 5. IDV Path Evaluation
  if (config.enabledSignals.idvPath) {
    if (idvPath === 'no_id') {
      score += 75;
      triggers.push({
        id: 'idv-no-id',
        label: 'No ID provided (Unverified patron)',
        severity: 'high',
        category: 'Identity Verification',
        detail: 'Patron unable to produce government identification documents.'
      });
    } else if (idvPath === 'IDV3') {
      score += 65;
      triggers.push({
        id: 'idv3-failed-dvs',
        label: 'IDV3 Escalation — Electronic DVS verification failed',
        severity: 'high',
        category: 'Identity Verification',
        detail: 'Primary electronic verification failed; secondary manual documents captured.'
      });
    } else if (idvPath === 'manual_kyc') {
      score += 35;
      triggers.push({
        id: 'idv-manual-kyc',
        label: 'Manual KYC used (' + (manualKycType || 'Non-standard ID') + ')',
        severity: 'medium',
        category: 'Identity Verification',
        detail: 'Document verified physically by staff without automated DVS clearance.'
      });
    } else if (idvPath === 'IDV2') {
      score += 25;
      triggers.push({
        id: 'idv2-multi-pass',
        label: 'IDV2 Multi-document verification required',
        severity: 'medium',
        category: 'Identity Verification',
        detail: 'Initial document check required secondary government document verification.'
      });
    }

    if (driverLicenceResult === 'fail') {
      score += 20;
      triggers.push({
        id: 'dl-failed',
        label: 'Driver Licence DVS validation failed',
        severity: 'medium',
        category: 'Document Check',
        detail: 'Document details did not match state transport agency database records.'
      });
    }

    if (passportResult === 'fail') {
      score += 20;
      triggers.push({
        id: 'passport-failed',
        label: 'Passport DVS validation failed',
        severity: 'medium',
        category: 'Document Check',
        detail: 'Passport number or expiry did not match Department of Home Affairs records.'
      });
    }
  }

  // 6. Transaction Value Thresholds
  if (config.enabledSignals.valueThreshold && transactionValue > 0) {
    if (transactionValue >= config.highThreshold) {
      score += 55;
      triggers.push({
        id: 'value-high',
        label: 'High-value payout ($' + transactionValue.toLocaleString('en-AU', { minimumFractionDigits: 2 }) + ' ≥ $' + config.highThreshold.toLocaleString('en-AU') + ')',
        severity: 'high',
        category: 'Threshold Control',
        detail: 'Transaction exceeds venue high-value compliance threshold, requiring dual sign-off.'
      });
    } else if (transactionValue >= config.lowThreshold) {
      score += 30;
      triggers.push({
        id: 'value-med',
        label: 'Elevated payout value ($' + transactionValue.toLocaleString('en-AU', { minimumFractionDigits: 2 }) + ' ≥ $' + config.lowThreshold.toLocaleString('en-AU') + ')',
        severity: 'medium',
        category: 'Threshold Control',
        detail: 'Payout exceeds venue medium-tier threshold.'
      });
    }
  }

  // 7. Cash Ratio / Structuring Signal
  if (config.enabledSignals.cashRatio && cashRatio > 0.8 && transactionValue > 1000) {
    score += 25;
    triggers.push({
      id: 'cash-ratio',
      label: 'Predominantly cash disbursement (' + Math.round(cashRatio * 100) + '% cash)',
      severity: 'medium',
      category: 'Disbursement Analysis',
      detail: 'High ratio of cash disbursement on transaction exceeding $1,000 threshold.'
    });
  }

  // 8. Foreign Document Country
  if (config.enabledSignals.documentCountry && documentCountry && documentCountry !== 'AU') {
    score += 20;
    triggers.push({
      id: 'foreign-doc',
      label: 'Foreign document presented (' + documentCountry + ')',
      severity: 'medium',
      category: 'Jurisdiction',
      detail: 'Non-Australian government identity document requires enhanced scrutiny.'
    });
  }

  // 9. Foreign Payment
  if (config.enabledSignals.foreignPayment && foreignPayment) {
    score += 30;
    triggers.push({
      id: 'foreign-payment',
      label: 'Foreign payment',
      severity: 'medium',
      category: 'Jurisdiction',
      detail: 'Payout is directed outside Australia and carries cross-border AML exposure.'
    });
  }

  // 10. Duplicate payee: the same person, account or address paid repeatedly.
  // One account under several names is High, an ordinary repeat is Medium.
  if (config.enabledSignals.duplicatePayee && duplicatePayee && duplicatePayee.hasAlert) {
    const isHigh = duplicatePayee.severity === 'high';
    score += isHigh ? 60 : 30;
    triggers.push({
      id: 'duplicate-payee',
      label: 'Duplicate payee',
      severity: isHigh ? 'high' : 'medium',
      category: 'Repeat activity',
      detail: duplicatePayee.summary
    });
  }

  // Derive Rating from score and high-severity triggers
  let rating = 'Low';
  const hasHighTrigger = triggers.some((t) => t.severity === 'high');
  const hasMediumTrigger = triggers.some((t) => t.severity === 'medium');

  if (hasHighTrigger || score >= 60) {
    rating = 'High';
  } else if (hasMediumTrigger || score >= 30) {
    rating = 'Medium';
  } else {
    rating = 'Low';
  }

  // Calculate Recommended Approvers based on Venue Routing Mode
  let recommendedApprovers = 1;
  let routingReason = '';

  if (config.routingMode === 'fixed') {
    recommendedApprovers = config.fixedApprovers || 2;
    routingReason = 'Fixed venue policy (' + recommendedApprovers + ' approvers required)';
  } else {
    // Dynamic Maker-Checker Rule
    if (rating === 'High') {
      recommendedApprovers = config.highRiskApprovers || 2;
      routingReason = 'Auto-escalated: High risk rating requires ' + recommendedApprovers + ' approver sign-offs';
    } else if (rating === 'Medium') {
      recommendedApprovers = config.mediumRiskApprovers || 1;
      routingReason = 'Medium risk rating: ' + recommendedApprovers + ' approver required by venue policy';
    } else {
      recommendedApprovers = config.lowRiskApprovers || 1;
      routingReason = 'Low risk: Single approver fast-track';
    }
  }

  // Conditions that demand a second approver regardless of what the rating
  // came out as. These are applied after the rating-based count so a clean
  // payout keeps its honest rating and still gets the extra sign-off.
  // A condition only counts while its signal is switched on: with the signal
  // off nothing about it appears in the trigger list, so forcing an extra
  // sign-off would leave the approver with a reason they cannot see evidence
  // for anywhere on the page.
  const forcedConditions = [];
  if (config.enabledSignals.foreignPayment && config.secondApproverConditions.foreignPayment && foreignPayment) {
    forcedConditions.push('foreign payment');
  }

  if (forcedConditions.length > 0) {
    const conditionText = forcedConditions.join(', ');
    if (recommendedApprovers < 2) {
      recommendedApprovers = 2;
      routingReason = 'Second approver required: ' + conditionText;
    } else {
      routingReason += ' (also flagged: ' + conditionText + ')';
    }
  }

  return {
    rating,
    score,
    triggers,
    recommendedApprovers,
    requiresSecondApprover: recommendedApprovers >= 2,
    routingReason,
  };
}
