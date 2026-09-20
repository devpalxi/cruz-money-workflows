/**
 * Venue-level CDD capture settings.
 *
 * Between March 2026 and March 2029 pubs and clubs move from plain IDV to the
 * new initial CDD rules at their own pace, so what a venue collects is a per
 * venue choice rather than a single product-wide rule. Occupation is the first
 * of those fields: self-reported, captured alongside the patron's other ID
 * details, and kept on file in case an ECDD is conducted later.
 *
 * Settings live in localStorage rather than component state because the
 * collector flow, the patron's phone and the approver's review all have to read
 * the same value, and none of them render inside Venue settings. localStorage
 * stands in for Strapi here, matching getVenueIntegrationSettings.
 */

const DEFAULT_VENUE_ID = 'venue-riverside-rsl';

// Off by default: a venue opts in when it adopts the new initial CDD rules.
export const DEFAULT_COMPLIANCE_CAPTURE = {
  occupationCaptureEnabled: false,
};

function storageKey(venueId) {
  return `cruz_venue_compliance_${venueId || DEFAULT_VENUE_ID}`;
}

export function getVenueComplianceCapture(venueId = DEFAULT_VENUE_ID) {
  if (typeof window === 'undefined') return { ...DEFAULT_COMPLIANCE_CAPTURE };
  try {
    const raw = localStorage.getItem(storageKey(venueId));
    if (raw) return { ...DEFAULT_COMPLIANCE_CAPTURE, ...JSON.parse(raw) };
  } catch (e) {}
  return { ...DEFAULT_COMPLIANCE_CAPTURE };
}

export function saveVenueComplianceCapture(venueId, settings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      storageKey(venueId),
      JSON.stringify({ ...DEFAULT_COMPLIANCE_CAPTURE, ...settings })
    );
  } catch (e) {}
}

// Every capture point asks this one question, so the field can never appear in
// one place and be missing in another.
export function isOccupationCaptureEnabled(venueId = DEFAULT_VENUE_ID) {
  return getVenueComplianceCapture(venueId).occupationCaptureEnabled;
}

// What the approver and the AUSTRAC helper show. An empty value is not the same
// as never having asked, so the two read differently.
export const OCCUPATION_NOT_COLLECTED = 'Not collected';

export function formatOccupation(occupation) {
  const value = (occupation || '').trim();
  return value === '' ? OCCUPATION_NOT_COLLECTED : value;
}
