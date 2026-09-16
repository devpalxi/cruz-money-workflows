(function () {
  'use strict';

  const METHODS = Object.freeze({
    CASH: 'cash',
    BANK_TRANSFER: 'bank_transfer',
    CHEQUE: 'cheque'
  });

  const LABELS = Object.freeze({
    cash: 'Cash',
    bank_transfer: 'Bank transfer',
    cheque: 'Cheque'
  });

  const DEFAULT_POLICY = Object.freeze({
    chequeEnabled: false,
    allowedMethods: ['cash', 'bank_transfer']
  });

  function uniqueMethods(methods) {
    return [...new Set((Array.isArray(methods) ? methods : []).filter(method => LABELS[method]))];
  }

  function normalize(policy) {
    const next = policy || {};
    const methods = uniqueMethods(next.allowedMethods || DEFAULT_POLICY.allowedMethods);
    return {
      chequeEnabled: next.chequeEnabled === true || methods.includes(METHODS.CHEQUE),
      allowedMethods: methods.length ? methods : [...DEFAULT_POLICY.allowedMethods],
      updatedAt: next.updatedAt || null
    };
  }

  function validate(policy) {
    const normalized = normalize(policy);
    const methods = normalized.allowedMethods;
    const hasBank = methods.includes(METHODS.BANK_TRANSFER);
    const hasCheque = methods.includes(METHODS.CHEQUE);
    const hasCash = methods.includes(METHODS.CASH);
    const errors = [];

    if (!normalized.chequeEnabled && hasCheque) errors.push('Cheque must be enabled before it can be selected.');
    if (hasBank && hasCheque) errors.push('Bank transfer and cheque cannot be enabled together.');
    if (hasCash && hasBank && hasCheque) errors.push('Cash, bank transfer, and cheque cannot all be enabled together.');

    return { valid: errors.length === 0, errors, policy: normalized };
  }

  function readVenuePolicy(venueId, fallback) {
    let stored = null;
    try {
      const config = JSON.parse(sessionStorage.getItem('venueConfigData') || 'null');
      if (!venueId || !config?.venueId || config.venueId === venueId || config.venueName) stored = config;
    } catch (error) { /* use defaults */ }

    if (!stored && window.SuperAdminData) {
      const data = window.SuperAdminData.read();
      const venue = (data.venues || []).find(item => item.id === venueId || item.name === venueId);
      stored = venue?.disbursementPolicy || null;
    }
    return normalize(stored || fallback || DEFAULT_POLICY);
  }

  function saveVenuePolicy(venueId, policy) {
    const result = validate(policy);
    if (!result.valid) return result;
    const saved = { ...result.policy, venueId, updatedAt: new Date().toISOString() };
    try {
      const current = JSON.parse(sessionStorage.getItem('venueConfigData') || '{}');
      sessionStorage.setItem('venueConfigData', JSON.stringify({ ...current, venueId, disbursementPolicy: saved, ...saved }));
    } catch (error) { /* session storage is optional in static preview */ }

    if (window.SuperAdminData && venueId) {
      const data = window.SuperAdminData.read();
      const index = (data.venues || []).findIndex(item => item.id === venueId);
      if (index >= 0) {
        data.venues[index].disbursementPolicy = saved;
        window.SuperAdminData.write(data);
      }
    }
    return { valid: true, policy: saved, errors: [] };
  }

  function methodLabel(method) { return LABELS[method] || method; }

  window.RiversideDisbursement = {
    METHODS,
    LABELS,
    DEFAULT_POLICY,
    normalize,
    validate,
    readVenuePolicy,
    saveVenuePolicy,
    methodLabel
  };
}());
