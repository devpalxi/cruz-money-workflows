/**
 * Per-state ID verification thresholds set by the super admin.
 *
 * Stored in localStorage because the collector flow and Administration are
 * different pages that both need the same table; localStorage stands in for
 * Strapi, like the other venue settings.
 */

import { DEFAULT_STATE_IDV_THRESHOLDS } from './complianceGate';

const STORE_KEY = 'cruz_state_idv_thresholds';

export function getStateIdvThresholds() {
  if (typeof window === 'undefined') return { ...DEFAULT_STATE_IDV_THRESHOLDS };
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (raw) return { ...DEFAULT_STATE_IDV_THRESHOLDS, ...JSON.parse(raw) };
  } catch (e) {}
  return { ...DEFAULT_STATE_IDV_THRESHOLDS };
}

export function saveStateIdvThresholds(thresholds) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify({ ...DEFAULT_STATE_IDV_THRESHOLDS, ...thresholds }));
  } catch (e) {}
}
