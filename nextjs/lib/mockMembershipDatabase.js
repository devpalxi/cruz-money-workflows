// mockMembershipDatabase.js — Simulation engine for Club Membership System Integration (Max Gaming, LMO)
// Provides prefill lookup by membership card / barcode or Name + DOB, and write-back synchronization.

export const MOCK_CLUB_MEMBERS = [
  {
    memberNumber: 'MEM-10884',
    cardBarcode: '88219010884',
    firstName: 'Sarah',
    middleName: 'Jane',
    lastName: 'Jenkins',
    fullName: 'Sarah Jane Jenkins',
    dob: '14/08/1988',
    email: 'sarah.jenkins@example.com',
    phone: '+61 433 991 204',
    membershipTier: 'Gold Member',
    membershipStatus: 'Active/Financial',
    joinedDate: '15/03/2021',
    system: 'Max Gaming',
    address: {
      unitNumber: '4',
      streetNumber: '12',
      streetName: 'Riverside Avenue',
      suburb: 'Parramatta',
      state: 'NSW',
      postcode: '2150',
      formatted: '4/12 Riverside Avenue, Parramatta NSW 2150'
    },
    idDocOnFile: {
      type: 'licence',
      typeLabel: 'NSW Driver Licence',
      number: '20984124',
      state: 'NSW'
    },
    bankDetailsOnFile: {
      accountName: 'Sarah Jane Jenkins',
      bsb: '062-000',
      accountNumber: '12345678'
    },
    lastUpdated: '02/08/2026'
  },
  {
    memberNumber: 'MEM-99102',
    cardBarcode: '99102008811',
    firstName: 'David',
    middleName: 'Wei',
    lastName: 'Chen',
    fullName: 'David Wei Chen',
    dob: '22/11/1982',
    email: 'david.chen@gmail.com',
    phone: '+61 426 339 102',
    membershipTier: 'Platinum VIP',
    membershipStatus: 'Active/Financial',
    joinedDate: '08/11/2019',
    system: 'Max Gaming',
    address: {
      unitNumber: '',
      streetNumber: '88',
      streetName: 'George Street',
      suburb: 'Sydney',
      state: 'NSW',
      postcode: '2000',
      formatted: '88 George Street, Sydney NSW 2000'
    },
    idDocOnFile: {
      type: 'passport',
      typeLabel: 'Australian Passport',
      number: 'PA1234567',
      state: 'AU'
    },
    bankDetailsOnFile: {
      accountName: 'DAVID WEI CHEN',
      bsb: '032-024',
      accountNumber: '443322119'
    },
    lastUpdated: '14/06/2026'
  },
  {
    memberNumber: 'MEM-44219',
    cardBarcode: '44219871100',
    firstName: 'Alexander',
    middleName: 'James',
    lastName: 'Ross',
    fullName: 'Alexander James Ross',
    dob: '05/04/1979',
    email: 'alex.r@gmail.com',
    phone: '+61 411 789 234',
    membershipTier: 'Silver Member',
    membershipStatus: 'Active/Financial',
    joinedDate: '20/01/2023',
    system: 'LMO',
    address: {
      unitNumber: '2B',
      streetNumber: '45',
      streetName: 'Church Street',
      suburb: 'Parramatta',
      state: 'NSW',
      postcode: '2150',
      formatted: '2B/45 Church Street, Parramatta NSW 2150'
    },
    idDocOnFile: {
      type: 'licence',
      typeLabel: 'NSW Driver Licence',
      number: '33498120',
      state: 'NSW'
    },
    bankDetailsOnFile: {
      accountName: 'ALEXANDER ROSS',
      bsb: '062-111',
      accountNumber: '445566778'
    },
    lastUpdated: '10/05/2026'
  },
  {
    memberNumber: 'MEM-77881',
    cardBarcode: '77881099231',
    firstName: 'Marcus',
    middleName: 'Anthony',
    lastName: 'Santos',
    fullName: 'Marcus Anthony Santos',
    dob: '19/09/1991',
    email: 'm.santos.winner@example.com',
    phone: '+61 402 119 554',
    membershipTier: 'Diamond Patron',
    membershipStatus: 'Active/Financial',
    joinedDate: '01/09/2018',
    system: 'Max Gaming',
    address: {
      unitNumber: '',
      streetNumber: '14',
      streetName: 'Macquarie Street',
      suburb: 'Liverpool',
      state: 'NSW',
      postcode: '2170',
      formatted: '14 Macquarie Street, Liverpool NSW 2170'
    },
    idDocOnFile: {
      type: 'licence',
      typeLabel: 'NSW Driver Licence',
      number: '48201994',
      state: 'NSW'
    },
    bankDetailsOnFile: {
      accountName: 'MARCUS A SANTOS',
      bsb: '082-901',
      accountNumber: '88771122'
    },
    lastUpdated: '19/07/2026'
  }
];

/**
 * Lookup member by Card Number or Barcode
 */
export function lookupMemberByCard(query, system = 'Max Gaming') {
  if (!query) return null;
  const clean = query.toString().trim().toUpperCase();
  return (
    MOCK_CLUB_MEMBERS.find((m) => {
      const memMatch = m.memberNumber.toUpperCase() === clean || m.memberNumber.replace(/[^0-9]/g, '') === clean.replace(/[^0-9]/g, '');
      const barcodeMatch = m.cardBarcode === clean;
      return memMatch || barcodeMatch;
    }) || null
  );
}

/**
 * Lookup member by Name and DOB fallback
 */
export function lookupMemberByNameAndDob(nameQuery, dobQuery) {
  if (!nameQuery) return null;
  const cleanName = nameQuery.trim().toLowerCase();
  const cleanDob = (dobQuery || '').trim();

  return (
    MOCK_CLUB_MEMBERS.find((m) => {
      const nameMatch =
        m.fullName.toLowerCase().includes(cleanName) ||
        `${m.firstName} ${m.lastName}`.toLowerCase().includes(cleanName) ||
        m.lastName.toLowerCase().includes(cleanName);
      const dobMatch = !cleanDob || m.dob === cleanDob;
      return nameMatch && dobMatch;
    }) || null
  );
}

/**
 * Get venue integration settings from localStorage with sane defaults
 */
export function getVenueIntegrationSettings(venueId = 'venue-riverside-rsl') {
  if (typeof window === 'undefined') {
    return {
      system: 'Max Gaming',
      endpointUrl: 'https://api.maxgaming.com.au/v1/members',
      apiKey: '••••••••••••••••••••••••',
      connectionStatus: 'Connected',
      writeBackEnabled: true,
      iframeEnabled: false,
      iframeUrl: 'https://console.maxgaming.com.au/embed/lookup',
      lastSync: 'Today, 10:14 AEST'
    };
  }

  try {
    const raw = localStorage.getItem(`cruz_venue_integration_${venueId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  return {
    system: 'Max Gaming',
    endpointUrl: 'https://api.maxgaming.com.au/v1/members',
    apiKey: '••••••••••••••••••••••••',
    connectionStatus: 'Connected',
    writeBackEnabled: true,
    iframeEnabled: false,
    iframeUrl: 'https://console.maxgaming.com.au/embed/lookup',
    lastSync: 'Today, 10:14 AEST'
  };
}

/**
 * Persist venue integration settings to localStorage
 */
export function saveVenueIntegrationSettings(venueId, settings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`cruz_venue_integration_${venueId}`, JSON.stringify(settings));
  } catch (e) {}
}
