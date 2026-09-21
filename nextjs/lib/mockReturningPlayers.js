// mockReturningPlayers.js — Lookup database & helper for Returning Player Recognition & IDV Reuse

export const returningPlayersDatabase = [
  {
    id: 'RET-001',
    email: 'sarah.jenkins@example.com',
    aliases: ['sarah.jenkins@gmail.com', 'uat@palxi.com', 'sarah@riversidersl.com.au'],
    membership: 'MEM-10884',
    firstName: 'Sarah',
    middleName: 'Jane',
    lastName: 'Jenkins',
    fullName: 'Sarah Jane Jenkins',
    dob: '14/08/1988',
    phone: '+61 433 991 204',
    country: 'Australia',
    docType: 'licence',
    docTypeLabel: 'NSW Driver Licence',
    state: 'NSW',
    licNumber: '20984124',
    cardNumber: '981245781',
    // Secondary ID on file
    medicareSelected: true,
    secondaryDoc: 'medicare',
    medicareNumber: '2950 12345 1',
    irn: '1',
    cardColor: 'Green',
    cardExpiryText: '05/2028',
    // Address
    unitNumber: '4',
    streetNumber: '12',
    streetName: 'Riverside Avenue',
    suburb: 'Parramatta',
    addrState: 'NSW',
    postcode: '2150',
    addressSearch: '4/12 Riverside Avenue, Parramatta NSW 2150',
    // Bank details on file
    accountName: 'Sarah Jane Jenkins',
    bsb: '062-000',
    accountNumber: '12345678',
    // Verification Metadata
    verifiedDate: '12 Apr 2026',
    verifiedMonthsAgo: 4,
    timeAgoText: 'Verified 4 months ago',
    verificationSource: 'FrankieOne DVS Electronic Verification (IDV1)',
    dvsResult: 'PASS',
    reuseWindowMonths: 12,
    isEligibleForReuse: true,
    // Last payout at a venue: how long ago, and whether ID and screening were
    // clear (not a manual ID or No-ID). Drives the returning winner rule.
    lastPayoutDaysAgo: 34,
    lastPayoutClear: true,
    notes: 'Returning winner with valid DVS verification on file.',
  },
  {
    id: 'RET-002',
    email: 'david.chen@gmail.com',
    aliases: ['david.chen@outlook.com', 'd.chen@example.com'],
    membership: 'MEM-99102',
    firstName: 'David',
    middleName: 'Wei',
    lastName: 'Chen',
    fullName: 'David Wei Chen',
    dob: '22/11/1982',
    phone: '+61 426 339 102',
    country: 'Australia',
    docType: 'passport',
    docTypeLabel: 'Australian Passport',
    passNumber: 'PA1234567',
    passExpiryText: '14/03/2029',
    // Secondary ID on file
    medicareSelected: true,
    secondaryDoc: 'medicare',
    medicareNumber: '2190 88712 2',
    irn: '2',
    cardColor: 'Green',
    cardExpiryText: '11/2027',
    // Address
    unitNumber: '',
    streetNumber: '88',
    streetName: 'George Street',
    suburb: 'Sydney',
    addrState: 'NSW',
    postcode: '2000',
    addressSearch: '88 George Street, Sydney NSW 2000',
    // Bank details on file
    accountName: 'DAVID WEI CHEN',
    bsb: '032-024',
    accountNumber: '443322119',
    // Verification Metadata
    verifiedDate: '10 Jan 2026',
    verifiedMonthsAgo: 7,
    timeAgoText: 'Verified 7 months ago',
    verificationSource: 'FrankieOne Passport DVS Verification (IDV1)',
    dvsResult: 'PASS',
    reuseWindowMonths: 12,
    isEligibleForReuse: true,
        lastPayoutDaysAgo: 120,
    lastPayoutClear: true,
    notes: 'Regular patron with valid electronic passport check on file.',
  },
  {
    id: 'RET-003',
    email: 'expired.player@example.com',
    aliases: ['expired@riverside.test'],
    membership: 'MEM-00912',
    firstName: 'Robert',
    middleName: 'John',
    lastName: 'Taylor',
    fullName: 'Robert John Taylor',
    dob: '05/06/1975',
    phone: '+61 411 223 344',
    country: 'Australia',
    docType: 'licence',
    docTypeLabel: 'NSW Driver Licence',
    state: 'NSW',
    licNumber: '44819201',
    cardNumber: '119283741',
    medicareSelected: false,
    unitNumber: '',
    streetNumber: '15',
    streetName: 'Beach Road',
    suburb: 'Bondi',
    addrState: 'NSW',
    postcode: '2026',
    addressSearch: '15 Beach Road, Bondi NSW 2026',
    accountName: 'ROBERT J TAYLOR',
    bsb: '012-003',
    accountNumber: '88776655',
    verifiedDate: '15 Jun 2025',
    verifiedMonthsAgo: 14,
    timeAgoText: 'Verified 14 months ago (Expired)',
    verificationSource: 'FrankieOne DVS Electronic Verification',
    dvsResult: 'PASS',
    reuseWindowMonths: 12,
    isEligibleForReuse: false,
        lastPayoutDaysAgo: 45,
    lastPayoutClear: false, // last payout used a manual ID
    notes: 'Previous verification exceeds 12-month venue reuse window — re-verification required.',
  }
];

/**
 * Find returning player profile by email
 * @param {string} email
 * @returns {object|null}
 */
export function findReturningPlayer(email) {
  if (!email || typeof email !== 'string') return null;
  const cleanEmail = email.trim().toLowerCase();
  return (
    returningPlayersDatabase.find(
      (p) =>
        p.email.toLowerCase() === cleanEmail ||
        (p.aliases && p.aliases.some((a) => a.toLowerCase() === cleanEmail))
    ) || null
  );
}
