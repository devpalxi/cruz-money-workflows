/**
 * Venue statement reference: a short code that starts the bank statement
 * description, so two venues with similar names ("Cleveland Sands" and
 * "Cleveland Tavern") are still told apart when the bank cuts the text off.
 *
 * The super admin sets it at venue setup and it must be unique. It is kept in
 * the same per-venue localStorage record as the other venue settings, which
 * stands in for Strapi here. The seeds cover the demo venues.
 */

import { initialVenues } from './mockData';
import { getVenueComplianceCapture } from './venueCompliance';

export const STATEMENT_REF_MIN = 3;
export const STATEMENT_REF_MAX = 8;

const SEED_STATEMENT_REFS = {
  'venue-riverside-rsl': 'RVRSL',
  'venue-riverside-bowling': 'RVRBC',
  'venue-riverside-lounge': 'RVRLB',
  'venue-northside-leagues': 'NSLC',
  'venue-northside-sports': 'NSSC',
  'venue-harbourview-hotel': 'HVHTL',
  'venue-harbourview-bistro': 'HVBST',
  'venue-grand-bistro': 'RGBST',
};

// Capital letters and digits only, cut to the maximum length.
export function normaliseStatementRef(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, STATEMENT_REF_MAX);
}

export function getStatementRef(venueId) {
  const stored = getVenueComplianceCapture(venueId).statementReference;
  return stored || SEED_STATEMENT_REFS[venueId] || '';
}

export function getStatementRefByVenueName(venueName) {
  const venue = initialVenues.find((v) => v.name === venueName);
  return venue ? getStatementRef(venue.id) : '';
}

// Returns an error message, or '' when the code is usable for this venue.
export function validateStatementRef(code, venueId) {
  const value = String(code || '');
  if (!value) return 'Enter a statement reference.';
  if (value.length < STATEMENT_REF_MIN || value.length > STATEMENT_REF_MAX) {
    return `Statement reference must be ${STATEMENT_REF_MIN} to ${STATEMENT_REF_MAX} characters.`;
  }
  if (value !== normaliseStatementRef(value)) {
    return 'Use capital letters and digits only.';
  }
  const ids = new Set([...initialVenues.map((v) => v.id), ...Object.keys(SEED_STATEMENT_REFS)]);
  for (const id of ids) {
    if (id !== venueId && getStatementRef(id) === value) {
      const other = initialVenues.find((v) => v.id === id);
      return `Already used by ${other ? other.name : 'another venue'}.`;
    }
  }
  return '';
}

// The code goes first so it survives truncation.
export function buildStatementDescription(ref, payoutNumber) {
  return [ref, 'PAYOUT', payoutNumber].filter(Boolean).join(' ');
}
