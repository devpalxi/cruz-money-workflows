(function () {
  'use strict';

  const STORAGE_KEY = 'riversideVenueBlacklist';
  const AUDIT_STORAGE_KEY = 'riversideBlacklistAuditLog';

  const DEFAULT_BLACKLIST = [
    {
      id: 'BLK-2601',
      venueId: 'venue-riverside-rsl',
      venueName: 'Riverside RSL Club',
      patronName: 'VICTOR M BARRISTER',
      dob: '12/04/1975',
      docType: 'Passport',
      docNumber: 'PA7841920',
      frankieEntityId: 'entity-fk-99214',
      searchRef: 'Fr99482104',
      reasonCategory: 'FrankieOne Sanctions Match',
      notes: 'Patron confirmed on DFAT & international sanctions watch-list. Immediate exclusion from electronic jackpot payouts per AML policy.',
      status: 'Active',
      addedBy: 'D. Walsh',
      addedRole: 'Approver',
      addedAt: '10 Jul 2026, 14:22',
      removedBy: null,
      removedRole: null,
      removedAt: null,
      removalReason: null
    },
    {
      id: 'BLK-2602',
      venueId: 'venue-riverside-rsl',
      venueName: 'Riverside RSL Club',
      patronName: 'STACY K TESTTWENTY',
      dob: '15/08/1980',
      docType: 'Passport',
      docNumber: 'PA-BLK-9876',
      frankieEntityId: 'entity-blk-557788',
      searchRef: 'Fr-SCEN-09',
      reasonCategory: 'FrankieOne PEP Match',
      notes: 'Class 2 PEP high-risk match with unresolved beneficial ownership alert. Automated disbursements barred pending EDD compliance review.',
      status: 'Active',
      addedBy: 'D. Walsh',
      addedRole: 'Approver',
      addedAt: '14 Jul 2026, 09:15',
      removedBy: null,
      removedRole: null,
      removedAt: null,
      removalReason: null
    },
    {
      id: 'BLK-2605',
      venueId: 'venue-riverside-rsl',
      venueName: 'Riverside RSL Club',
      patronName: 'GEOFFREY D CHANDLER',
      dob: '29/01/1968',
      docType: 'Driver Licence',
      docNumber: 'DL5581029',
      frankieEntityId: 'entity-fk-11029',
      searchRef: 'Fr11029381',
      reasonCategory: 'DVS Document Fraud / Fake ID',
      notes: 'DVS document integrity failure. Tampered hologram observed during floor collection.',
      status: 'Active',
      addedBy: 'K. Lee',
      addedRole: 'Authoriser',
      addedAt: '22 Jul 2026, 19:45',
      removedBy: null,
      removedRole: null,
      removedAt: null,
      removalReason: null
    },
    {
      id: 'BLK-2606',
      venueId: 'venue-riverside-rsl',
      venueName: 'Riverside RSL Club',
      patronName: 'NATHANIEL S DRAKE',
      dob: '14/06/1985',
      docType: 'Passport',
      docNumber: 'PA4491028',
      frankieEntityId: 'entity-fk-66201',
      searchRef: 'Fr66201948',
      reasonCategory: 'Self-Exclusion / Venue Barred',
      notes: 'NSW ClubSAFE multi-venue self-exclusion scheme registration active through Dec 2027.',
      status: 'Active',
      addedBy: 'J. Chen',
      addedRole: 'Venue Admin',
      addedAt: '03 Aug 2026, 10:15',
      removedBy: null,
      removedRole: null,
      removedAt: null,
      removalReason: null
    },
    {
      id: 'BLK-2603',
      venueId: 'venue-northside-leagues',
      venueName: 'Northside Leagues Club',
      patronName: 'ARTHUR P PENDLETON',
      dob: '03/11/1982',
      docType: 'Driver Licence',
      docNumber: 'DL9918231',
      frankieEntityId: 'entity-fk-44102',
      searchRef: 'Fr44102983',
      reasonCategory: 'DVS Document Fraud / Fake ID',
      notes: 'Attempted DVS verification with fraudulent NSW driver licence credential numbers.',
      status: 'Active',
      addedBy: 'K. Lee',
      addedRole: 'Authoriser',
      addedAt: '28 Jul 2026, 16:40',
      removedBy: null,
      removedRole: null,
      removedAt: null,
      removalReason: null
    },
    {
      id: 'BLK-2607',
      venueId: 'venue-northside-leagues',
      venueName: 'Northside Leagues Club',
      patronName: 'SAMANTHA L VANCE',
      dob: '08/12/1991',
      docType: 'Passport',
      docNumber: 'PA8820194',
      frankieEntityId: 'entity-fk-88201',
      searchRef: 'Fr88201948',
      reasonCategory: 'Adverse Media Match',
      notes: 'Significant media linkage to syndicated gaming fraud and structured cash placement investigation.',
      status: 'Active',
      addedBy: 'D. Walsh',
      addedRole: 'Approver',
      addedAt: '05 Aug 2026, 13:50',
      removedBy: null,
      removedRole: null,
      removedAt: null,
      removalReason: null
    },
    {
      id: 'BLK-2604',
      venueId: 'venue-harbourview-hotel',
      venueName: 'Harbourview Hotel',
      patronName: 'MARCUS H STERLING',
      dob: '21/09/1988',
      docType: 'Passport',
      docNumber: 'PA1102938',
      frankieEntityId: 'entity-fk-77192',
      searchRef: 'Fr77192019',
      reasonCategory: 'Self-Exclusion / Venue Barred',
      notes: 'Patron registered on NSW ClubSAFE self-exclusion scheme. Barred from all gaming disbursements.',
      status: 'Active',
      addedBy: 'J. Chen',
      addedRole: 'Venue Admin',
      addedAt: '01 Aug 2026, 11:05',
      removedBy: null,
      removedRole: null,
      removedAt: null,
      removalReason: null
    },
    {
      id: 'BLK-2608',
      venueId: 'venue-harbourview-hotel',
      venueName: 'Harbourview Hotel',
      patronName: 'DMITRI A VOLKOV',
      dob: '17/03/1979',
      docType: 'Passport',
      docNumber: 'PA9901827',
      frankieEntityId: 'entity-fk-99018',
      searchRef: 'Fr99018273',
      reasonCategory: 'FrankieOne Sanctions Match',
      notes: 'AUSTRAC designated sanctions listing match. Mandatory exclusion from all high-value disbursements.',
      status: 'Active',
      addedBy: 'K. Lee',
      addedRole: 'Authoriser',
      addedAt: '08 Aug 2026, 15:20',
      removedBy: null,
      removedRole: null,
      removedAt: null,
      removalReason: null
    },
    {
      id: 'BLK-2599',
      venueId: 'venue-riverside-rsl',
      venueName: 'Riverside RSL Club',
      patronName: 'ELENA R ROSTOVA',
      dob: '19/02/1990',
      docType: 'Driver Licence',
      docNumber: 'DL3391024',
      frankieEntityId: 'entity-fk-33910',
      searchRef: 'Fr33910281',
      reasonCategory: 'Adverse Media Match',
      notes: 'Flagged for financial crime press mention.',
      status: 'Removed',
      addedBy: 'D. Walsh',
      addedRole: 'Approver',
      addedAt: '02 Jul 2026, 10:11',
      removedBy: 'J. Chen',
      removedRole: 'Venue Admin',
      removedAt: '18 Jul 2026, 15:30',
      removalReason: 'Identity verification appeal upheld with certified statutory declaration and clean AUSTRAC clearance.'
    }
  ];

  const DEFAULT_AUDIT_LOG = [
    {
      id: 'AUD-BLK-106',
      timestamp: '08 Aug 2026, 15:20',
      action: 'ADDED_TO_BLACKLIST',
      recordId: 'BLK-2608',
      patronName: 'DMITRI A VOLKOV',
      venueName: 'Harbourview Hotel',
      venueId: 'venue-harbourview-hotel',
      actor: 'K. Lee',
      role: 'Authoriser',
      notes: 'AUSTRAC designated sanctions listing match. Mandatory exclusion from all high-value disbursements.',
      frankieRef: 'Fr99018273'
    },
    {
      id: 'AUD-BLK-105',
      timestamp: '05 Aug 2026, 13:50',
      action: 'ADDED_TO_BLACKLIST',
      recordId: 'BLK-2607',
      patronName: 'SAMANTHA L VANCE',
      venueName: 'Northside Leagues Club',
      venueId: 'venue-northside-leagues',
      actor: 'D. Walsh',
      role: 'Approver',
      notes: 'Significant media linkage to syndicated gaming fraud and structured cash placement investigation.',
      frankieRef: 'Fr88201948'
    },
    {
      id: 'AUD-BLK-104',
      timestamp: '03 Aug 2026, 10:15',
      action: 'ADDED_TO_BLACKLIST',
      recordId: 'BLK-2606',
      patronName: 'NATHANIEL S DRAKE',
      venueName: 'Riverside RSL Club',
      venueId: 'venue-riverside-rsl',
      actor: 'J. Chen',
      role: 'Venue Admin',
      notes: 'NSW ClubSAFE multi-venue self-exclusion scheme registration active through Dec 2027.',
      frankieRef: 'Fr66201948'
    },
    {
      id: 'AUD-BLK-103',
      timestamp: '01 Aug 2026, 11:05',
      action: 'ADDED_TO_BLACKLIST',
      recordId: 'BLK-2604',
      patronName: 'MARCUS H STERLING',
      venueName: 'Harbourview Hotel',
      venueId: 'venue-harbourview-hotel',
      actor: 'J. Chen',
      role: 'Venue Admin',
      notes: 'Patron registered on NSW ClubSAFE self-exclusion scheme. Barred from all gaming disbursements.',
      frankieRef: 'Fr77192019'
    },
    {
      id: 'AUD-BLK-102',
      timestamp: '28 Jul 2026, 16:40',
      action: 'ADDED_TO_BLACKLIST',
      recordId: 'BLK-2603',
      patronName: 'ARTHUR P PENDLETON',
      venueName: 'Northside Leagues Club',
      venueId: 'venue-northside-leagues',
      actor: 'K. Lee',
      role: 'Authoriser',
      notes: 'Attempted DVS verification with fraudulent NSW driver licence credential numbers.',
      frankieRef: 'Fr44102983'
    },
    {
      id: 'AUD-BLK-101',
      timestamp: '22 Jul 2026, 19:45',
      action: 'ADDED_TO_BLACKLIST',
      recordId: 'BLK-2605',
      patronName: 'GEOFFREY D CHANDLER',
      venueName: 'Riverside RSL Club',
      venueId: 'venue-riverside-rsl',
      actor: 'K. Lee',
      role: 'Authoriser',
      notes: 'DVS document integrity failure. Tampered hologram observed during floor collection.',
      frankieRef: 'Fr11029381'
    },
    {
      id: 'AUD-BLK-100',
      timestamp: '18 Jul 2026, 15:30',
      action: 'REMOVED_FROM_BLACKLIST',
      recordId: 'BLK-2599',
      patronName: 'ELENA R ROSTOVA',
      venueName: 'Riverside RSL Club',
      venueId: 'venue-riverside-rsl',
      actor: 'J. Chen',
      role: 'Venue Admin',
      notes: 'Identity verification appeal upheld with certified statutory declaration and clean AUSTRAC clearance.',
      frankieRef: 'Fr33910281'
    }
  ];

  function getStorage() {
    try {
      return window.localStorage || window.sessionStorage;
    } catch (e) {
      return null;
    }
  }

  function readRecords() {
    const storage = getStorage();
    if (!storage) return DEFAULT_BLACKLIST;
    try {
      const data = storage.getItem(STORAGE_KEY);
      if (!data) {
        storage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_BLACKLIST));
        return DEFAULT_BLACKLIST;
      }
      let parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        storage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_BLACKLIST));
        return DEFAULT_BLACKLIST;
      }
      let modified = false;
      parsed = parsed.filter(r => {
        if (r.id === 'BLK-2602' && r.docNumber !== 'PA-BLK-9876') {
          r.docNumber = 'PA-BLK-9876';
          r.frankieEntityId = 'entity-blk-557788';
          modified = true;
        }
        if (r.docNumber === 'PA9876543' && r.id.startsWith('BLK-')) {
          modified = true;
          return false;
        }
        return true;
      });

      // Automatically backfill any new default records
      DEFAULT_BLACKLIST.forEach(def => {
        if (!parsed.some(r => r.id === def.id)) {
          parsed.push(def);
          modified = true;
        }
      });

      if (modified) {
        writeRecords(parsed);
      }
      return parsed;
    } catch (e) {
      return DEFAULT_BLACKLIST;
    }
  }

  function writeRecords(records) {
    const storage = getStorage();
    if (storage) {
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(records));
      } catch (e) {}
    }
  }

  function readAuditLog() {
    const storage = getStorage();
    if (!storage) return DEFAULT_AUDIT_LOG;
    try {
      const data = storage.getItem(AUDIT_STORAGE_KEY);
      if (!data) {
        storage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(DEFAULT_AUDIT_LOG));
        return DEFAULT_AUDIT_LOG;
      }
      let parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        storage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(DEFAULT_AUDIT_LOG));
        return DEFAULT_AUDIT_LOG;
      }
      let modified = false;
      DEFAULT_AUDIT_LOG.forEach(def => {
        if (!parsed.some(l => l.id === def.id)) {
          parsed.push(def);
          modified = true;
        }
      });
      if (modified) {
        writeAuditLog(parsed);
      }
      return parsed;
    } catch (e) {
      return DEFAULT_AUDIT_LOG;
    }
  }

  function writeAuditLog(logs) {
    const storage = getStorage();
    if (storage) {
      try {
        storage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs));
      } catch (e) {}
    }
  }

  function logAuditEvent(event) {
    const logs = readAuditLog();
    const newEvent = {
      id: 'AUD-BLK-' + Date.now().toString().slice(-4),
      timestamp: formatNow(),
      ...event
    };
    logs.unshift(newEvent);
    writeAuditLog(logs);
    return newEvent;
  }

  function formatNow() {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return day + ' ' + month + ' ' + year + ', ' + hours + ':' + mins;
  }

  function normalize(str) {
    return (str || '').toString().trim().toUpperCase();
  }

  function checkBlacklistMatch(patron, venueId) {
    if (!patron) return { isMatch: false, record: null };
    const records = readRecords();
    const targetVenue = normalize(venueId);

    const match = records.find(rec => {
      if (rec.status !== 'Active') return false;
      if (targetVenue && targetVenue !== 'ALL') {
        const recVenueId = normalize(rec.venueId);
        const recVenueName = normalize(rec.venueName);
        if (recVenueId !== targetVenue && recVenueName !== targetVenue) {
          return false;
        }
      }

      if (patron.frankieEntityId && rec.frankieEntityId && normalize(patron.frankieEntityId) === normalize(rec.frankieEntityId)) {
        return true;
      }
      if (patron.docNumber && rec.docNumber && normalize(patron.docNumber) === normalize(rec.docNumber)) {
        if (!patron.docType || !rec.docType || normalize(patron.docType) === normalize(rec.docType)) {
          return true;
        }
      }
      return false;
    });

    return {
      isMatch: Boolean(match),
      record: match || null
    };
  }

  function addBlacklistRecord(data) {
    const records = readRecords();
    const newId = 'BLK-' + Math.floor(2600 + records.length + Math.random() * 100);
    const newRecord = {
      id: newId,
      venueId: data.venueId || 'venue-riverside-rsl',
      venueName: data.venueName || 'Riverside RSL Club',
      patronName: (data.patronName || '').trim().toUpperCase(),
      dob: data.dob || '-',
      docType: data.docType || 'Passport',
      docNumber: data.docNumber || '-',
      frankieEntityId: data.frankieEntityId || 'entity-' + Math.random().toString(36).substring(2, 9),
      searchRef: data.searchRef || 'Fr' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      reasonCategory: data.reasonCategory || 'FrankieOne Screening Match',
      notes: data.notes || 'Added to venue blacklist.',
      status: 'Active',
      addedBy: data.addedBy || data.actor || 'Supervisor',
      addedRole: data.addedRole || data.role || 'Approver',
      addedAt: formatNow(),
      removedBy: null,
      removedRole: null,
      removedAt: null,
      removalReason: null
    };

    records.unshift(newRecord);
    writeRecords(records);

    logAuditEvent({
      action: 'ADDED_TO_BLACKLIST',
      recordId: newRecord.id,
      patronName: newRecord.patronName,
      venueName: newRecord.venueName,
      venueId: newRecord.venueId,
      actor: newRecord.addedBy,
      role: newRecord.addedRole,
      notes: newRecord.notes,
      frankieRef: newRecord.searchRef
    });

    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        window.dispatchEvent(new CustomEvent('blacklist:changed', { detail: { action: 'added', record: newRecord } }));
      } catch (e) {}
    }
    return newRecord;
  }

  function removeBlacklistRecord(recordId, removalData) {
    const records = readRecords();
    const idx = records.findIndex(r => r.id === recordId);
    if (idx === -1) return null;

    const current = records[idx];
    current.status = 'Removed';
    current.removedBy = removalData.actor || 'Supervisor';
    current.removedRole = removalData.role || 'Approver';
    current.removedAt = formatNow();
    current.removalReason = removalData.reason || 'Record removed from venue blacklist.';

    writeRecords(records);

    logAuditEvent({
      action: 'REMOVED_FROM_BLACKLIST',
      recordId: current.id,
      patronName: current.patronName,
      venueName: current.venueName,
      venueId: current.venueId,
      actor: current.removedBy,
      role: current.removedRole,
      notes: current.removalReason,
      frankieRef: current.searchRef
    });

    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        window.dispatchEvent(new CustomEvent('blacklist:changed', { detail: { action: 'removed', record: current } }));
      } catch (e) {}
    }
    return current;
  }

  function getRecordsByVenue(venueId, statusFilter) {
    const records = readRecords();
    const target = normalize(venueId);
    return records.filter(rec => {
      if (target && target !== 'ALL') {
        if (normalize(rec.venueId) !== target && normalize(rec.venueName) !== target) return false;
      }
      if (statusFilter && statusFilter !== 'all') {
        if (normalize(rec.status) !== normalize(statusFilter)) return false;
      }
      return true;
    });
  }

  function getAllRecords() {
    return readRecords();
  }

  function getVenueRecords(venueName) {
    return getRecordsByVenue(venueName);
  }

  function getAllAuditLogs() {
    return readAuditLog();
  }

  function getVenueAuditLogs(venueName) {
    const logs = readAuditLog();
    const target = normalize(venueName);
    if (!target || target === 'ALL') return logs;
    return logs.filter(l => normalize(l.venueName) === target || normalize(l.venueId) === target);
  }

  function resetToDefault() {
    const storage = getStorage();
    if (storage) {
      storage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_BLACKLIST));
      storage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(DEFAULT_AUDIT_LOG));
    }
    return DEFAULT_BLACKLIST;
  }

  window.VenueBlacklistService = {
    readRecords,
    getAllRecords,
    getVenueRecords,
    getRecordsByVenue,
    checkBlacklistMatch,
    addBlacklistRecord,
    removeBlacklistRecord,
    removeRecord: removeBlacklistRecord,
    readAuditLog,
    getAllAuditLogs,
    getVenueAuditLogs,
    logAuditEvent,
    resetToDefault
  };
}());
