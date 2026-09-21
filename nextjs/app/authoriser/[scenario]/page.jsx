'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { computeRisk } from '@/lib/riskEngine';
import { initialPayouts } from '@/lib/mockData';
import { EXCLUSION_TYPES, formatRegisterDate } from '@/lib/exclusionRegister';

/* ─── Authoriser Scenario Data matching deploy/authoriser_v3.html ─── */
const SCENARIOS = {
  'dual-hit': {
    label: '1. Dual hit',
    payoutNum: '#578',
    dateTime: '14 July 2026 · 7:09 am · Riverside RSL Club',
    statusPill: 'Awaiting authorisation',
    payout: {
      cashAmount: 'AUD 500.00',
      transferAmount: 'AUD 1,000.00',
      txnId: '213',
      machineId: 'EGM-002',
      venue: 'Riverside RSL Club',
      disbursementPolicy: 'Cash + Bank transfer',
      payoutType: 'EGM',
    },
    member: {
      membershipNumber: '3e23e',
      email: 'stacy@gmail.com',
      fullName: 'STACY TESTTWENTY',
      documentType: 'Passport',
    },
    bank: {
      accountName: 'Stacy K',
      bsb: '321-312',
      accountNumber: '213-123-123',
    },
    nameVerification: {
      isMatch: false,
      idName: 'STACY K TESTTWENTY',
      bankName: 'Stacy K',
      approverVerified: true,
    },
    idvRows: [
      { label: 'Government ID', status: 'pass', text: 'Pass' },
      { label: 'ID validation', status: 'pass', text: 'Pass' },
      { label: 'Name match', status: 'pass', text: 'Pass' },
      { label: 'DOB match', status: 'pass', text: 'Pass' },
      { label: 'Venue Blacklist', status: 'pass', text: 'No match' },
    ],
    amlRows: [
      { id: 'blacklist', label: 'Venue Blacklist - Screening', action: 'pill', badgeType: 'pass', badgeText: 'No match' },
      { id: 'pep', label: 'PEP - Active hits', action: 'view', btnText: 'View resolution' },
      { id: 'sanctions', label: 'Sanctions - Active hits', action: 'view', btnText: 'View resolution' },
    ],
    idvHistory: [
      { doc: 'Australia Passport IDV', dateTime: '14 July 2026, 11:41 am', result: 'pass' },
    ],
    collector: {
      initials: 'MS',
      name: 'M.Santos',
      timestamp: '14/07/2026 07:12am',
    },
    approverResolution: {
      verificationOverview: [
        { label: 'Identity verification', value: 'Fully verified', color: 'ok' },
        { label: 'Name match', value: 'Mismatch detected', color: 'warn' },
        { label: 'Confirmation of payee', value: 'Exact match', color: 'ok' },
        { label: 'Venue blacklist', value: 'No match', color: 'ok' },
      ],
      amlTrail: [
        {
          id: 'blacklist',
          label: 'Venue blacklist status',
          sub: 'Automated exclusion check evaluated against venue database.',
          badgeType: 'pass',
          badgeText: 'No match',
        },
        {
          id: 'pep',
          label: 'PEP match status',
          sub: 'User confirmed via secondary ID that this is a domestic PEP match. Proceeding with enhanced due diligence.',
          badgeType: 'warn',
          badgeText: 'Domestic PEP',
        },
        {
          id: 'sanctions',
          label: 'Sanctions match status',
          sub: 'Middle name differs completely. Verified against provided passport copy. False positive.',
          badgeType: 'pass',
          badgeText: 'Not a match',
        },
      ],
      risk: 'Medium',
      riskOverrideNote: 'Patron middle name difference confirmed against physical passport copy. Domestic PEP Class 2 match cleared with supervisory justification.',
    },
    blacklistMatch: false,
    riskSignals: {
      idvPath: 'IDV1',
      documentCountry: 'AU',
      driverLicenceResult: null,
      passportResult: 'pass',
      isPEP: true,
      pepLevel: 2,
      pepUrlReputation: 'medium',
      isSanction: true,
      sanctionEntityReputation: 'Global PEP & Sanctions Database',
      adverseMediaHits: 2,
      adverseMediaUrlReputation: 'medium',
      transactionValue: 1500.00,
      cashRatio: 0.333,
      blacklistMatch: false,
    },
  },
  'manual-kyc': {
    label: '5. Manual KYC',
    payoutNum: '#582',
    dateTime: '14 July 2026 · 10:05 am · Riverside RSL Club',
    statusPill: 'Awaiting authorisation',
    payout: {
      cashAmount: 'AUD 300.00',
      transferAmount: 'AUD 500.00',
      txnId: '217',
      machineId: 'EGM-004',
      venue: 'Riverside RSL Club',
      disbursementPolicy: 'Cash + Bank transfer',
      payoutType: 'EGM',
    },
    member: {
      membershipNumber: '5h66p',
      email: 'chloe@gmail.com',
      fullName: 'CHLOE GALLAGHER',
      documentType: 'Birth Certificate (Manual KYC)',
    },
    bank: {
      accountName: 'CHLOE GALLAGHER',
      bsb: '802-985',
      accountNumber: '789-012-345',
    },
    nameVerification: {
      isMatch: true,
      idName: 'CHLOE GALLAGHER',
      bankName: 'CHLOE GALLAGHER',
    },
    idvRows: [
      { label: 'Venue Blacklist', status: 'pass', text: 'No match' },
    ],
    idvNotice: 'Identity verification is not available for this customer.',
    amlRows: [
      { id: 'blacklist', label: 'Venue Blacklist - Screening', action: 'pill', badgeType: 'pass', badgeText: 'No match' },
    ],
    amlNotice: 'AML screening is not available for this customer.',
    idvHistory: [
      { doc: 'Manual KYC — Birth Certificate', dateTime: '14 July 2026, 10:05 am', result: 'warn' },
    ],
    collector: {
      initials: 'MS',
      name: 'M.Santos',
      timestamp: '14/07/2026 10:05am',
    },
    approverResolution: {
      verificationOverview: [
        { label: 'Identity verification', value: 'Manual KYC', color: 'warn' },
        { label: 'Name match', value: 'Match', color: 'ok' },
        { label: 'Confirmation of payee', value: 'Exact match', color: 'ok' },
        { label: 'Venue blacklist', value: 'No match', color: 'ok' },
      ],
      amlTrail: [
        { id: 'blacklist', label: 'Venue blacklist status', sub: 'Automated exclusion check evaluated against venue database.', badgeType: 'pass', badgeText: 'No match' },
        { id: 'pep', label: 'PEP match status', sub: 'No PEP matches found', badgeType: 'pass', badgeText: 'Clear' },
        { id: 'sanctions', label: 'Sanctions match status', sub: 'No sanctions matches found', badgeType: 'pass', badgeText: 'Clear' },
      ],
      risk: 'Medium',
      approverNote: 'Manual KYC verified via original Australian Birth Certificate. Secondary ID checks confirmed patron identity.',
    },
    blacklistMatch: false,
    riskSignals: {
      idvPath: 'manual_kyc',
      manualKycType: 'Birth Certificate',
      documentCountry: 'AU',
      driverLicenceResult: null,
      passportResult: null,
      isPEP: false,
      isSanction: false,
      adverseMediaHits: 0,
      transactionValue: 800.00,
      cashRatio: 0.375,
      blacklistMatch: false,
    },
  },
  'no-id': {
    label: '6. No ID',
    payoutNum: '#583',
    dateTime: '14 July 2026 · 11:30 am · Riverside RSL Club',
    statusPill: 'Awaiting authorisation',
    payout: {
      cashAmount: 'AUD 500.00',
      transferAmount: 'AUD 500.00',
      txnId: '218',
      machineId: 'EGM-006',
      venue: 'Riverside RSL Club',
      disbursementPolicy: 'Cash + Bank transfer',
      payoutType: 'EGM',
    },
    member: {
      membershipNumber: '7t89u',
      email: 'marcus@gmail.com',
      fullName: 'MARCUS VANCE',
      documentType: 'No ID Provided',
    },
    bank: {
      accountName: 'MARCUS VANCE',
      bsb: '062-000',
      accountNumber: '321-654-987',
    },
    nameVerification: {
      isMatch: true,
      idName: 'MARCUS VANCE',
      bankName: 'MARCUS VANCE',
    },
    idvRows: [
      { label: 'Venue Blacklist', status: 'pass', text: 'No match' },
    ],
    idvNotice: 'Identity verification is not available for this customer.',
    amlRows: [
      { id: 'blacklist', label: 'Venue Blacklist - Screening', action: 'pill', badgeType: 'pass', badgeText: 'No match' },
    ],
    amlNotice: 'AML screening is not available for this customer.',
    idvHistory: [
      { doc: 'No ID Exception Filed', dateTime: '14 July 2026, 11:30 am', result: 'fail' },
    ],
    collector: {
      initials: 'MS',
      name: 'M.Santos',
      timestamp: '14/07/2026 11:30am',
    },
    approverResolution: {
      verificationOverview: [
        { label: 'Identity verification', value: 'Not verified — No ID', color: 'warn' },
        { label: 'Name match', value: 'Unverified', color: 'warn' },
        { label: 'Confirmation of payee', value: 'Exact match', color: 'ok' },
        { label: 'Venue blacklist', value: 'No match', color: 'ok' },
      ],
      amlTrail: [
        { id: 'blacklist', label: 'Venue blacklist status', sub: 'Automated exclusion check evaluated against venue database.', badgeType: 'pass', badgeText: 'No match' },
        { id: 'pep', label: 'PEP match status', sub: 'No PEP matches found', badgeType: 'pass', badgeText: 'Clear' },
        { id: 'sanctions', label: 'Sanctions match status', sub: 'No sanctions matches found', badgeType: 'pass', badgeText: 'Clear' },
      ],
      risk: 'High',
      approverNote: 'Escalated to High risk due to unverified patron identity without government ID documentation.',
    },
    blacklistMatch: false,
    riskSignals: {
      idvPath: 'no_id',
      documentCountry: 'AU',
      driverLicenceResult: null,
      passportResult: null,
      isPEP: false,
      isSanction: false,
      adverseMediaHits: 0,
      transactionValue: 1000.00,
      cashRatio: 0.5,
      blacklistMatch: false,
    },
  },
  'multi-id-pass': {
    label: '7. Multi-ID pass',
    payoutNum: '#584',
    dateTime: '14 July 2026 · 12:00 pm · Riverside RSL Club',
    statusPill: 'Awaiting authorisation',
    payout: {
      cashAmount: 'AUD 1,000.00',
      transferAmount: 'AUD 2,000.00',
      txnId: '219',
      machineId: 'EGM-005',
      venue: 'Riverside RSL Club',
      disbursementPolicy: 'Cash + Bank transfer',
      payoutType: 'EGM',
    },
    member: {
      membershipNumber: '2r12w',
      email: 'james@gmail.com',
      fullName: "JAMES O'SULLIVAN",
      documentType: 'Driver Licence + Medicare',
    },
    bank: {
      accountName: "JAMES O'SULLIVAN",
      bsb: '632-000',
      accountNumber: '111-222-333',
    },
    nameVerification: {
      isMatch: true,
      idName: "JAMES O'SULLIVAN",
      bankName: "JAMES O'SULLIVAN",
    },
    idvRows: [
      { label: 'Government ID', status: 'pass', text: 'Pass' },
      { label: 'ID validation', status: 'pass', text: 'Pass' },
      { label: 'Name match', status: 'pass', text: 'Pass' },
      { label: 'DOB match', status: 'pass', text: 'Pass' },
      { label: 'Venue Blacklist', status: 'pass', text: 'No match' },
    ],
    amlRows: [
      { id: 'blacklist', label: 'Venue Blacklist - Screening', action: 'pill', badgeType: 'pass', badgeText: 'No match' },
      { id: 'pep', label: 'PEP - No matches', action: 'pill', badgeType: 'pass', badgeText: 'Clear' },
      { id: 'sanctions', label: 'Sanctions - No matches', action: 'pill', badgeType: 'pass', badgeText: 'Clear' },
    ],
    idvHistory: [
      { doc: 'Australia Driver Licence IDV', dateTime: '14 July 2026, 12:00 pm', result: 'pass' },
      { doc: 'Medicare Card DVS', dateTime: '14 July 2026, 12:01 pm', result: 'pass' },
    ],
    collector: {
      initials: 'MS',
      name: 'M.Santos',
      timestamp: '14/07/2026 12:00pm',
    },
    approverResolution: {
      verificationOverview: [
        { label: 'Identity verification', value: 'Fully verified', color: 'ok' },
        { label: 'Name match', value: 'Match', color: 'ok' },
        { label: 'Confirmation of payee', value: 'Exact match', color: 'ok' },
        { label: 'Venue blacklist', value: 'No match', color: 'ok' },
      ],
      amlTrail: [
        { id: 'blacklist', label: 'Venue blacklist status', sub: 'Automated exclusion check evaluated against venue database.', badgeType: 'pass', badgeText: 'No match' },
        { id: 'pep', label: 'PEP match status', sub: 'No PEP matches found', badgeType: 'pass', badgeText: 'Clear' },
        { id: 'sanctions', label: 'Sanctions match status', sub: 'No sanctions matches found', badgeType: 'pass', badgeText: 'Clear' },
      ],
      risk: 'Low',
      approverNote: 'Both Driver Licence and Medicare Card verified cleanly via DVS. All AML checks clear.',
    },
    blacklistMatch: false,
    riskSignals: {
      idvPath: 'IDV2',
      documentCountry: 'AU',
      driverLicenceResult: 'pass',
      passportResult: 'pass',
      isPEP: false,
      isSanction: false,
      adverseMediaHits: 0,
      transactionValue: 3000.00,
      cashRatio: 0.333,
      blacklistMatch: false,
    },
  },
  'multi-id-mixed': {
    label: '8. Multi-ID mixed',
    payoutNum: '#585',
    dateTime: '14 July 2026 · 1:15 pm · Riverside RSL Club',
    statusPill: 'Awaiting authorisation',
    payout: {
      cashAmount: 'AUD 800.00',
      transferAmount: 'AUD 1,500.00',
      txnId: '220',
      machineId: 'EGM-003',
      venue: 'Riverside RSL Club',
      disbursementPolicy: 'Cash + Bank transfer',
      payoutType: 'EGM',
    },
    member: {
      membershipNumber: '8u99v',
      email: 'elena@gmail.com',
      fullName: 'ELENA ROSTOVA',
      documentType: 'Driver Licence + Medicare (partial)',
    },
    bank: {
      accountName: 'ELENA ROSTOVA',
      bsb: '733-000',
      accountNumber: '444-555-666',
    },
    nameVerification: {
      isMatch: false,
      idName: 'ELENA ROSTOVA',
      bankName: 'E. Rostova',
      approverVerified: false,
    },
    idvRows: [
      { label: 'Government ID', status: 'pass', text: 'Pass' },
      { label: 'ID validation', status: 'pass', text: 'Pass' },
      { label: 'Name match', status: 'warn', text: 'Partial' },
      { label: 'DOB match', status: 'pass', text: 'Pass' },
      { label: 'Venue Blacklist', status: 'pass', text: 'No match' },
    ],
    amlRows: [
      { id: 'blacklist', label: 'Venue Blacklist - Screening', action: 'pill', badgeType: 'pass', badgeText: 'No match' },
      { id: 'pep', label: 'PEP - No matches', action: 'pill', badgeType: 'pass', badgeText: 'Clear' },
      { id: 'sanctions', label: 'Sanctions - No matches', action: 'pill', badgeType: 'pass', badgeText: 'Clear' },
    ],
    idvHistory: [
      { doc: 'Australia Driver Licence IDV', dateTime: '14 July 2026, 01:15 pm', result: 'pass' },
      { doc: 'Medicare Card DVS', dateTime: '14 July 2026, 01:16 pm', result: 'warn' },
    ],
    collector: {
      initials: 'MS',
      name: 'M.Santos',
      timestamp: '14/07/2026 01:15pm',
    },
    approverResolution: {
      verificationOverview: [
        { label: 'Identity verification', value: 'Partially verified', color: 'warn' },
        { label: 'Name match', value: 'Partial match', color: 'warn' },
        { label: 'Confirmation of payee', value: 'Exact match', color: 'ok' },
        { label: 'Venue blacklist', value: 'No match', color: 'ok' },
      ],
      amlTrail: [
        { id: 'blacklist', label: 'Venue blacklist status', sub: 'Automated exclusion check evaluated against venue database.', badgeType: 'pass', badgeText: 'No match' },
        { id: 'pep', label: 'PEP match status', sub: 'No PEP matches found', badgeType: 'pass', badgeText: 'Clear' },
        { id: 'sanctions', label: 'Sanctions match status', sub: 'No sanctions matches found', badgeType: 'pass', badgeText: 'Clear' },
      ],
      risk: 'Medium',
      approverNote: 'Driver Licence verified. Medicare Card partial mismatch noted and verified with patron.',
    },
    blacklistMatch: false,
    riskSignals: {
      idvPath: 'IDV2',
      documentCountry: 'AU',
      driverLicenceResult: 'pass',
      passportResult: null,
      isPEP: false,
      isSanction: false,
      adverseMediaHits: 0,
      transactionValue: 2300.00,
      cashRatio: 0.347,
      blacklistMatch: false,
    },
  },
  'blacklist-match': {
    label: '9. Blacklist match',
    payoutNum: '#586',
    dateTime: '14 July 2026 · 2:00 pm · Riverside RSL Club',
    statusPill: 'Awaiting authorisation',
    payout: {
      cashAmount: 'AUD 500.00',
      transferAmount: 'AUD 1,000.00',
      txnId: '221',
      machineId: 'EGM-001',
      venue: 'Riverside RSL Club',
      disbursementPolicy: 'Cash + Bank transfer',
      payoutType: 'EGM',
    },
    member: {
      membershipNumber: '1b23c',
      email: 'blacklisted@email.com',
      fullName: 'JOHN PATRON',
      documentType: 'Driver Licence',
    },
    bank: {
      accountName: 'JOHN PATRON',
      bsb: '012-000',
      accountNumber: '987-654-321',
    },
    nameVerification: {
      isMatch: true,
      idName: 'JOHN PATRON',
      bankName: 'JOHN PATRON',
    },
    idvRows: [
      { label: 'Government ID', status: 'pass', text: 'Pass' },
      { label: 'ID validation', status: 'pass', text: 'Pass' },
      { label: 'Name match', status: 'pass', text: 'Pass' },
      { label: 'DOB match', status: 'pass', text: 'Pass' },
      { label: 'Venue Blacklist', status: 'fail', text: 'Match found' },
    ],
    amlRows: [
      { id: 'blacklist', label: 'Venue Blacklist - Screening', action: 'view', btnText: 'View resolution' },
      { id: 'pep', label: 'PEP - No matches', action: 'pill', badgeType: 'pass', badgeText: 'Clear' },
      { id: 'sanctions', label: 'Sanctions - No matches', action: 'pill', badgeType: 'pass', badgeText: 'Clear' },
    ],
    idvHistory: [
      { doc: 'Australia Driver Licence IDV', dateTime: '14 July 2026, 02:00 pm', result: 'pass' },
    ],
    collector: {
      initials: 'MS',
      name: 'M.Santos',
      timestamp: '14/07/2026 02:00pm',
    },
    approverResolution: {
      verificationOverview: [
        { label: 'Identity verification', value: 'Fully verified', color: 'ok' },
        { label: 'Name match', value: 'Match', color: 'ok' },
        { label: 'Confirmation of payee', value: 'Exact match', color: 'ok' },
        { label: 'Venue blacklist', value: 'Match found', color: 'danger' },
      ],
      amlTrail: [
        { id: 'blacklist', label: 'Venue blacklist status', sub: 'Active exclusion order matched in venue blacklist database.', badgeType: 'fail', badgeText: 'Match found' },
        { id: 'pep', label: 'PEP match status', sub: 'No PEP matches found', badgeType: 'pass', badgeText: 'Clear' },
        { id: 'sanctions', label: 'Sanctions match status', sub: 'No sanctions matches found', badgeType: 'pass', badgeText: 'Clear' },
      ],
      risk: 'High',
      approverNote: 'Patron matched active exclusion record. Documented for statutory compliance reporting and supervisory escalation.',
    },
    blacklistMatch: true,
    riskSignals: {
      idvPath: 'IDV1',
      documentCountry: 'AU',
      driverLicenceResult: 'pass',
      passportResult: null,
      isPEP: false,
      isSanction: false,
      adverseMediaHits: 0,
      transactionValue: 1500.00,
      cashRatio: 0.333,
      blacklistMatch: true,
    },
  },
  'high-value': {
    label: '10. High-value ()',
    payoutNum: '#587',
    dateTime: '14 July 2026 · 2:45 pm · Riverside RSL Club',
    statusPill: 'Awaiting authorisation',
    payout: {
      cashAmount: 'AUD 0.00',
      transferAmount: 'AUD 15,000.00',
      txnId: '222',
      machineId: 'EGM-009',
      venue: 'Riverside RSL Club',
      disbursementPolicy: 'Bank transfer only',
      payoutType: 'EGM',
    },
    member: {
      membershipNumber: '6w34z',
      email: 'liam.thornton@email.com',
      fullName: 'LIAM THORNTON',
      documentType: 'Passport',
    },
    bank: {
      accountName: 'LIAM THORNTON',
      bsb: '062-111',
      accountNumber: '556-778-899',
    },
    nameVerification: {
      isMatch: true,
      idName: 'LIAM THORNTON',
      bankName: 'LIAM THORNTON',
      approverVerified: true,
    },
    idvRows: [
      { label: 'Government ID', status: 'pass', text: 'Pass' },
      { label: 'ID validation', status: 'pass', text: 'Pass' },
      { label: 'Name match', status: 'pass', text: 'Pass' },
      { label: 'DOB match', status: 'pass', text: 'Pass' },
      { label: 'Venue Blacklist', status: 'pass', text: 'No match' },
    ],
    amlRows: [
      { id: 'blacklist', label: 'Venue Blacklist - Screening', action: 'pill', badgeType: 'pass', badgeText: 'No match' },
      { id: 'pep', label: 'PEP - Clear', action: 'pill', badgeType: 'pass', badgeText: 'Clear' },
      { id: 'sanctions', label: 'Sanctions - Clear', action: 'pill', badgeType: 'pass', badgeText: 'Clear' },
    ],
    idvHistory: [
      { doc: 'Australia Passport IDV', dateTime: '14 July 2026, 02:45 pm', result: 'pass' },
    ],
    collector: {
      initials: 'MS',
      name: 'M.Santos',
      timestamp: '14/07/2026 02:45pm',
    },
    approverResolution: {
      verificationOverview: [
        { label: 'Identity verification', value: 'Fully verified', color: 'ok' },
        { label: 'Name match', value: 'Exact match', color: 'ok' },
        { label: 'Confirmation of payee', value: 'Exact match', color: 'ok' },
        { label: 'Venue blacklist', value: 'No match', color: 'ok' },
      ],
      amlTrail: [
        { id: 'blacklist', label: 'Venue blacklist status', sub: 'Automated exclusion check evaluated against venue database.', badgeType: 'pass', badgeText: 'No match' },
        { id: 'pep', label: 'PEP match status', sub: 'No PEP matches found', badgeType: 'pass', badgeText: 'Clear' },
        { id: 'sanctions', label: 'Sanctions match status', sub: 'No sanctions matches found', badgeType: 'pass', badgeText: 'Clear' },
      ],
      risk: 'High',
      approverNote: 'High-value transaction ($15,000.00). Source of funds and ID verified. Bank transfer policy enforced.',
    },
    blacklistMatch: false,
    riskSignals: {
      idvPath: 'IDV1',
      documentCountry: 'AU',
      driverLicenceResult: null,
      passportResult: 'pass',
      isPEP: false,
      isSanction: false,
      adverseMediaHits: 0,
      transactionValue: 15000.00,
      cashRatio: 0.0,
      blacklistMatch: false,
    },
  },
};

// Its own preset so the override panel can be exercised without also dealing
// with the blacklist-match case that preset already covers.
SCENARIOS['self-exclusion'] = {
  ...SCENARIOS['blacklist-match'],
  label: '11. Self-exclusion hold',
  payoutNum: '#590',
  dateTime: '14 July 2026 · 3:20 pm · Riverside RSL Club',
  statusPill: 'Exclusion hold',
  exclusion: {
    type: EXCLUSION_TYPES.SELF,
    reason: 'Self-exclusion order #8841',
    source: 'State register',
    expiresAt: '12 Jan 2027',
  },
};

// The same payout the approver side shows as 'foreign-payment' and
// 'second-approval'. Two approvers signed it off, so the resolution panel
// carries one entry per approver in `approvals` instead of a single risk level
// and note. Scenarios without `approvals` keep the single-approver layout.
SCENARIOS['foreign-payment'] = {
  ...SCENARIOS['high-value'],
  label: '12. Foreign payment (2 approvers)',
  payoutNum: '#588',
  dateTime: '14 July 2026 · 4:10 pm · Riverside RSL Club',
  payout: {
    cashAmount: 'AUD 0.00',
    transferAmount: 'AUD 3,200.00',
    txnId: '223',
    machineId: 'EGM-011',
    venue: 'Riverside RSL Club',
    disbursementPolicy: 'Bank transfer only',
    payoutType: 'EGM',
  },
  member: {
    membershipNumber: '8p21k',
    email: 'sofia.almeida@email.com',
    fullName: 'SOFIA ALMEIDA',
    documentType: 'Passport',
  },
  bank: {
    accountName: 'SOFIA ALMEIDA',
    bsb: '062-444',
    accountNumber: '221-334-556',
  },
  nameVerification: {
    isMatch: true,
    idName: 'SOFIA ALMEIDA',
    bankName: 'SOFIA ALMEIDA',
    approverVerified: true,
  },
  idvHistory: [
    { doc: 'Portugal Passport IDV', dateTime: '14 July 2026, 04:10 pm', result: 'pass' },
  ],
  collector: {
    initials: 'MS',
    name: 'M.Santos',
    timestamp: '14/07/2026 04:10pm',
  },
  approverResolution: {
    verificationOverview: [
      { label: 'Identity verification', value: 'Fully verified', color: 'ok' },
      { label: 'Name match', value: 'Exact match', color: 'ok' },
      { label: 'Confirmation of payee', value: 'Exact match', color: 'ok' },
      { label: 'Payment destination', value: 'Foreign payment', color: 'warn' },
    ],
    amlTrail: [
      { id: 'blacklist', label: 'Venue blacklist status', sub: 'Automated exclusion check evaluated against venue database.', badgeType: 'pass', badgeText: 'No match' },
      { id: 'pep', label: 'PEP match status', sub: 'No PEP matches found', badgeType: 'pass', badgeText: 'Clear' },
      { id: 'sanctions', label: 'Sanctions match status', sub: 'No sanctions matches found', badgeType: 'pass', badgeText: 'Clear' },
    ],
    approvals: [
      {
        name: 'D.Walsh',
        role: 'Approver',
        timestamp: '14/07/2026 04:22pm',
        risk: 'Medium',
        note: 'Passport verified against DVS and CoP matched exactly. Foreign destination is the only flag; patron is a visiting contractor with a local membership since 2024.',
      },
      {
        name: 'T.Nguyen',
        role: 'Approver',
        timestamp: '14/07/2026 04:41pm',
        risk: 'Medium',
        note: 'Reviewed the first approval and confirmed the destination account details against the passport. No sanctions or PEP exposure. Agree with Medium risk.',
      },
    ],
  },
  riskSignals: {
    idvPath: 'IDV1',
    documentCountry: 'PT',
    driverLicenceResult: null,
    passportResult: 'pass',
    isPEP: false,
    isSanction: false,
    adverseMediaHits: 0,
    transactionValue: 3200.00,
    cashRatio: 0.0,
    blacklistMatch: false,
    foreignPayment: true,
  },
};

// Bank details reused from an earlier payout. Same clean payout as
// 'multi-id-pass' so the reused-account line is the only thing that differs.
SCENARIOS['reused-account'] = {
  ...SCENARIOS['multi-id-pass'],
  label: '13. Reused bank account',
  payoutNum: '#592',
  bank: {
    ...SCENARIOS['multi-id-pass'].bank,
    reusedFrom: 'last verified 12 Apr 2026',
  },
};

/* ─── Payout total helper ─── */
function formatTotalAmount(cashAmount, transferAmount) {
  const parse = (value) => Number(String(value).replace(/[^0-9.]/g, '')) || 0;
  const total = parse(cashAmount) + parse(transferAmount);
  return `AUD ${total.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/* ─── PEP Mock Results Dataset (matching deploy/authoriser_v3.html) ─── */
const PEP_MOCK_RESULTS = [
  {
    keyData: {
      'Full Name': 'Stacy Test-Twenty',
      'AKA': 'Testtwenty, Stacy Testtwenty, Stacy',
      'Date of Birth': 'Not provided',
      'Countries': 'AU',
      'Addresses': '1 Example St, Demotown, VIC 3465, AUS\nUnit 4/42 Testing Abbey, Brisbane, QLD 4000, AUS',
      'Associates': 'Spouse: JANE TESTTWENTYTWO',
    },
    media: [
      {
        date: '15-08-2024',
        source: 'Clark County Municipal Court cases',
        title: 'Regional Government Member involved in municipal proceedings',
        excerpt: 'Stacy Test-Twenty, Senior executive of a regional governmental body, was noted in recent municipal proceedings regarding regional zoning and related compliance...',
      },
    ],
    listing: {
      badge: 'PEP Class 2',
      badgeVariant: 'warn',
      sourceName: 'Australian Regional Executives',
      details: {
        'Source URL': 'https://djsir.vic.gov.au/about-us',
        'Source Listing Ended': '-',
        'Country Codes': 'AU',
        'AML Types': 'pep-class-2',
        'Nationality': 'Australian',
        'Active Start Date': '2024-01-01',
        'Political Position': 'Senior executive of a regional governmental body',
        'Chamber': 'Department of jobs, skills, industry and regions executive',
        'Function': 'Chief executive officer',
        'Institution Type': 'Body under regional executive',
      },
    },
  },
  {
    keyData: {
      'Full Name': 'Stacy M. Test',
      'AKA': 'Stacy Test',
      'Date of Birth': '12-04-1979',
      'Countries': 'AU, US',
      'Addresses': '14 Example Drive, Melbourne, VIC 3000, AUS',
      'Associates': '-',
    },
    media: [],
    listing: {
      badge: 'PEP Class 3',
      badgeVariant: 'fail',
      sourceName: 'Global PEP Data',
      details: {
        'Source URL': 'https://example.com/pep/123',
        'Source Listing Ended': '2022-12-31',
        'Country Codes': 'AU',
        'AML Types': 'pep-class-3',
        'Nationality': 'Australian',
        'Active Start Date': '2018-05-10',
        'Political Position': 'Former Board Member',
        'Chamber': 'Local Water Authority',
        'Function': 'Director',
        'Institution Type': 'Local Government Entity',
      },
    },
  },
  {
    keyData: {
      'Full Name': 'S. Test-Twenty',
      'AKA': 'Stacy Test Twenty',
      'Date of Birth': '15-08-1980',
      'Countries': 'AU',
      'Addresses': '-',
      'Associates': '-',
    },
    media: [
      {
        date: '04-09-2024',
        source: 'Thestar | kpcnews.com',
        title: 'Judge sentences 18 for criminal offenses',
        excerpt: 'S. Test-Twenty was placed on probation for one year. Sentence included community service and compliance with regional authority regulations.',
      },
      {
        date: '26-08-2024',
        source: 'Selbyville weapons incident',
        title: 'Man charged in Selbyville',
        excerpt: 'The State Police have charged S. Test-Twenty with multiple offenses after an incident. The incident occurred at approximately 1 AM.',
      },
    ],
    listing: {
      badge: 'PEP Class 2',
      badgeVariant: 'warn',
      sourceName: 'Historical Foreign Diplomatic Missions',
      details: {
        'Source URL': 'https://example.com/mission/456',
        'Source Listing Ended': '2015-01-01',
        'Country Codes': 'AU',
        'AML Types': 'pep-class-2',
        'Nationality': 'Australian',
        'Active Start Date': '2014-11-06',
        'Political Position': 'Member of a Diplomatic Mission',
        'Chamber': 'Historical Foreign Diplomatic Missions',
        'Function': 'ASST. MILITARY ATTACHE',
        'Institution Type': 'International Representatives',
      },
    },
  },
];

/* ─── Atomic Components matching deploy/authoriser_v3.html ─── */

function Pill({ variant, children, onClick }) {
  const base = 'inline-block text-[13px] font-bold px-[10px] py-[3px] rounded-[20px] whitespace-nowrap border select-none';
  const variants = {
    pass: 'text-[#059669] bg-[#ecfdf5] border-[#a7f3d0]',
    fail: 'text-[#e53e3e] bg-[#fff5f5] border-[#fed7d7]',
    warn: 'text-[#b45309] bg-[#fffbeb] border-[#fde68a]',
    neutral: 'text-[#334155] bg-[#f1f5f9] border-[#e2e8f0]',
  };
  return (
    <span
      className={`${base} ${variants[variant] || variants.neutral} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {children}
    </span>
  );
}

function ActionButton({ variant = 'view', children, onClick }) {
  const variants = {
    view: 'text-[#0f172a] bg-white border-[#e2e8f0] hover:bg-[#f4f4f4]',
    warn: 'text-[#b45309] bg-transparent border-[#b45309] hover:bg-[#fffbeb]',
    pass: 'text-[#059669] bg-transparent border-[#059669] hover:bg-[#ecfdf5]',
    fail: 'text-[#e53e3e] bg-transparent border-[#e53e3e] hover:bg-[#fff5f5]',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 h-[38px] px-4 min-w-[150px] rounded-[6px] text-[15px] font-bold border cursor-pointer transition-all duration-200 text-center whitespace-nowrap font-sans select-none flex-shrink-0 ${variants[variant] || variants.view}`}
    >
      {children}
    </button>
  );
}

function StatusPill({ children }) {
  return (
    <div className="inline-flex items-center px-3.5 py-1 rounded-full text-[13px] font-bold bg-[#fffbeb] text-[#78350f] border border-[#fcd34d]">
      {children}
    </div>
  );
}

function AccordionItem({ icon, title, children, isOpen, onToggle }) {
  return (
    <div className="border-t first:border-t-0 border-[#edf2f7]">
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center gap-[14px] bg-none border-none cursor-pointer px-[22px] py-[17px] text-left transition-colors duration-150 font-sans ${isOpen ? 'bg-white' : 'hover:bg-white'}`}
      >
        <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-[#0f172a]">{icon}</span>
        <span className="text-[18.5px] font-bold text-[#0f172a] flex-1 tracking-[-0.01em]">{title}</span>
        <svg
          className={`w-[17px] h-[17px] text-[#475569] transition-transform duration-250 flex-shrink-0 ${isOpen ? 'rotate-180 text-[#0f172a]' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-[22px] pb-5 pt-1 bg-white">{children}</div>
      )}
    </div>
  );
}

// One approver's own sign-off. The header carries who and what they decided so
// the Authoriser can read the gist without opening it.
function ApproverSection({ label, approval, isOpen, onToggle }) {
  const riskVariant = approval.risk === 'High' ? 'fail' : approval.risk === 'Medium' ? 'warn' : 'pass';
  return (
    <div className="border-t first:border-t-0 border-[#edf2f7]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center gap-3 bg-none border-none cursor-pointer py-4 text-left font-sans group"
      >
        <span className="text-[15px] font-bold text-[#0f172a] group-hover:text-[#0d9488] transition-colors">
          {label}
        </span>
        <span className="text-[14px] text-[#475569] flex-1">
          {approval.name} &middot; {approval.role}
        </span>
        <Pill variant={riskVariant}>{approval.risk} risk</Pill>
        <svg
          className={`w-[17px] h-[17px] text-[#475569] transition-transform duration-250 flex-shrink-0 ${isOpen ? 'rotate-180 text-[#0f172a]' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {isOpen && (
        <div className="pb-4">
          <div className="flex items-center justify-between p-[10px_0] border-b border-[#edf2f7]">
            <span className="text-[14.5px] font-bold text-[#475569]">Approved by</span>
            <span className="text-[15px] font-bold text-[#0f172a]">{approval.name} &middot; {approval.role}</span>
          </div>
          <div className="flex items-center justify-between p-[10px_0] border-b border-[#edf2f7]">
            <span className="text-[14.5px] font-bold text-[#475569]">Approved at</span>
            <span className="text-[14.5px] font-mono text-[#0f172a]">{approval.timestamp}</span>
          </div>
          <div className="flex items-center justify-between p-[10px_0] border-b border-[#edf2f7]">
            <span className="text-[14.5px] font-bold text-[#475569]">Determined risk level</span>
            <Pill variant={riskVariant}>{approval.risk} risk</Pill>
          </div>
          <div className="pt-3">
            <div className="text-[14.5px] font-bold text-[#475569] mb-1.5">Approver note</div>
            <p className="text-[15px] text-[#334155] leading-relaxed m-0">{approval.note}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionHead({ children }) {
  return (
    <div className="flex items-center gap-2 text-[13px] font-bold tracking-[0.1em] text-[#475569] mb-2.5">
      {children}
      <div className="flex-1 h-px bg-[#edf2f7]" />
    </div>
  );
}

function RiskBadge({ risk }) {
  const variants = {
    Low: 'bg-[#f0fdf4] border-[#86efac] text-[#166534]',
    Medium: 'bg-[#fffbeb] border-[#fcd34d] text-[#92400e]',
    High: 'bg-[#fef2f2] border-[#fca5a5] text-[#991b1b]',
  };
  const dots = {
    Low: 'bg-[#22c55e]',
    Medium: 'bg-[#f59e0b]',
    High: 'bg-[#ef4444]',
  };
  return (
    <div className="flex items-center gap-3 mt-1.5 mb-4">
      <div className={`inline-flex items-center gap-2 p-[7px_14px_7px_10px] rounded-full text-[14px] font-bold uppercase tracking-[0.07em] border-[1.5px] ${variants[risk] || variants.Medium}`}>
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dots[risk] || dots.Medium}`} />
        {risk} risk
      </div>
    </div>
  );
}

/* ─── Read-Only Modals matching deploy/authoriser_v3.html ─── */

/* 1. PEP View Modal (Read-Only) */
function PepViewModal({ open, onClose, onOpenAddBlacklist }) {
  const [tab, setTab] = useState('key');
  const [resultIdx, setResultIdx] = useState(0);

  if (!open) return null;

  const currentResult = PEP_MOCK_RESULTS[resultIdx] || PEP_MOCK_RESULTS[0];

  return (
    <div className="fixed inset-0 z-50 bg-[#12132b]/55 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-[20px] border border-[#e2e8f0] w-full max-w-[750px] max-h-[calc(100vh-40px)] flex flex-col overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#edf2f7] bg-white flex-shrink-0">
          <div className="text-[20px] font-bold text-[#0f172a] tracking-[-0.01em]">PEP match resolution</div>
          <button type="button" onClick={onClose} className="w-[30px] h-[30px] border-none bg-transparent text-[#334155] hover:text-black cursor-pointer text-[22px] flex items-center justify-center leading-none">
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-[18px_22px] flex flex-col gap-3">
          {/* Result Nav */}
          <div className="flex justify-between items-center pb-2">
            <div className="font-bold text-[#0f172a] text-[15px]">Result {resultIdx + 1} of {PEP_MOCK_RESULTS.length}</div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={resultIdx === 0}
                onClick={() => setResultIdx(p => Math.max(0, p - 1))}
                className="h-[34px] px-3 rounded-[6px] border border-[#e2e8f0] bg-white text-[#1a202c] hover:bg-[#f4f4f4] disabled:opacity-40 disabled:cursor-not-allowed text-[14px] font-bold cursor-pointer font-sans"
              >
                &lsaquo; Prev
              </button>
              <button
                type="button"
                disabled={resultIdx === PEP_MOCK_RESULTS.length - 1}
                onClick={() => setResultIdx(p => Math.min(PEP_MOCK_RESULTS.length - 1, p + 1))}
                className="h-[34px] px-3 rounded-[6px] border border-[#e2e8f0] bg-white text-[#1a202c] hover:bg-[#f4f4f4] disabled:opacity-40 disabled:cursor-not-allowed text-[14px] font-bold cursor-pointer font-sans"
              >
                Next &rsaquo;
              </button>
            </div>
          </div>

          {/* Global Context Header (cmp-table) */}
          <table className="w-full border-collapse mb-4">
            <thead>
              <tr>
                <th className="w-[110px] text-left text-[12.5px] font-bold text-[#475569] pb-2 border-b-[1.5px] border-[#edf2f7]"></th>
                <th className="text-left text-[12.5px] font-bold text-[#0f172a] px-3 pb-2 border-b-[1.5px] border-[#edf2f7]">Search Details</th>
                <th className="text-left text-[12.5px] font-bold text-[#0f172a] px-3 pb-2 border-b-[1.5px] border-[#edf2f7]">Returned Details (Match {resultIdx + 1})</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-[13px] font-bold text-[#334155] py-2 border-b border-[#edf2f7]">Name</td>
                <td className="text-[14.5px] font-bold text-[#0f172a] px-3 py-2 border-b border-[#edf2f7]">STACY TESTTWENTY</td>
                <td className="text-[14.5px] font-bold text-[#0f172a] px-3 py-2 border-b border-[#edf2f7]">{currentResult.keyData['Full Name']}</td>
              </tr>
              <tr>
                <td className="text-[13px] font-bold text-[#334155] py-2 border-b border-[#edf2f7]">Year of Birth</td>
                <td className="text-[14.5px] font-bold text-[#0f172a] px-3 py-2 border-b border-[#edf2f7]">1980</td>
                <td className="text-[14.5px] font-bold text-[#0f172a] px-3 py-2 border-b border-[#edf2f7]">{currentResult.keyData['Date of Birth']}</td>
              </tr>
              <tr>
                <td className="text-[13px] font-bold text-[#334155] py-2 border-b-0">Countries</td>
                <td className="text-[14.5px] font-bold text-[#0f172a] px-3 py-2 border-b-0">All</td>
                <td className="text-[14.5px] font-bold text-[#0f172a] px-3 py-2 border-b-0">{currentResult.keyData['Countries']}</td>
              </tr>
            </tbody>
          </table>

          {/* Result Tabs with clear selection highlight */}
          <div className="flex gap-4 border-b border-[#e2e8f0] mb-4">
            <button
              type="button"
              onClick={() => setTab('key')}
              className={`bg-none border-none pb-2 text-[14px] cursor-pointer -mb-[1px] border-b-2 font-sans transition-colors ${tab === 'key' ? 'text-[#0f172a] border-[#0f172a] font-bold' : 'text-[#64748b] hover:text-[#0f172a] border-transparent font-semibold'}`}
            >
              Key Data
            </button>
            <button
              type="button"
              onClick={() => setTab('media')}
              className={`bg-none border-none pb-2 text-[14px] cursor-pointer -mb-[1px] border-b-2 font-sans transition-colors ${tab === 'media' ? 'text-[#0f172a] border-[#0f172a] font-bold' : 'text-[#64748b] hover:text-[#0f172a] border-transparent font-semibold'}`}
            >
              Adverse Media
            </button>
            <button
              type="button"
              onClick={() => setTab('listing')}
              className={`bg-none border-none pb-2 text-[14px] cursor-pointer -mb-[1px] border-b-2 font-sans transition-colors ${tab === 'listing' ? 'text-[#0f172a] border-[#0f172a] font-bold' : 'text-[#64748b] hover:text-[#0f172a] border-transparent font-semibold'}`}
            >
              Data Sources
            </button>
          </div>

          {/* Tab Content Panels */}
          {tab === 'key' && (
            <div className="flex flex-col mb-4">
              {Object.entries(currentResult.keyData).map(([lbl, val], i) => (
                <div key={i} className="flex py-3 px-4 border-b border-[#edf2f7] last:border-b-0">
                  <span className="w-[180px] text-[14.5px] font-medium text-[#475569] flex-shrink-0 font-sans">{lbl}</span>
                  <span className="flex-1 text-[14.5px] font-medium text-[#0f172a] whitespace-pre-line leading-relaxed font-sans">
                    {val === 'Not provided' ? '—' : val}
                  </span>
                </div>
              ))}
            </div>
          )}

          {tab === 'media' && (
            <div className="flex flex-col gap-3 mb-4">
              {currentResult.media.length > 0 ? (
                currentResult.media.map((m, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 border border-[#e2e8f0] rounded-[6px]">
                    <div className="text-[12px] text-[#475569] mb-1 font-sans">Published {m.date} · {m.source}</div>
                    <a href="#" className="text-[#0d9488] font-bold text-[14.5px] underline block mb-1 font-sans">{m.title}</a>
                    <div className="text-[13.5px] text-[#334155] leading-relaxed font-sans">{m.excerpt}</div>
                  </div>
                ))
              ) : (
                <div className="text-[14px] text-[#475569] italic py-3 font-sans">No adverse media on record for this result.</div>
              )}
            </div>
          )}

          {tab === 'listing' && (
            <div className="mb-4 p-4 bg-slate-50 border border-[#e2e8f0] rounded-[6px]">
              <div className="mb-3">
                <Pill variant={currentResult.listing.badgeVariant}>
                  {currentResult.listing.badge}
                </Pill>
                <div className="text-[16px] font-bold text-[#0f172a] mt-2 font-sans">{currentResult.listing.sourceName}</div>
                <div className="text-[13px] text-[#475569] mt-0.5 font-sans">Currently on active listing</div>
              </div>
              <div className="grid grid-cols-[160px_1fr] gap-x-3 gap-y-2 text-[14.5px] pt-3 border-t border-[#e2e8f0] font-sans">
                {Object.entries(currentResult.listing.details).map(([k, v], i) => (
                  <React.Fragment key={i}>
                    <span className="text-[#475569] font-bold font-sans">{k}</span>
                    <span className="text-[#0f172a] font-medium break-all font-sans">{v}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Screening summary Card */}
          <div className="bg-transparent border-none p-0 mb-0">
            <div className="text-[16.5px] font-bold text-[#0f172a] mb-3 tracking-[-0.01em] font-sans">Screening summary</div>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-start gap-2.5 text-[15.5px] text-[#0f172a] leading-[1.45] font-sans">
                <svg className="w-[18px] h-[18px] text-[#0f172a] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                <div>Date of birth matches - 15/08/1980</div>
              </div>
              <div className="flex items-start gap-2.5 text-[15.5px] text-[#0f172a] leading-[1.45] font-sans">
                <svg className="w-[18px] h-[18px] text-[#d97706] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01" /></svg>
                <div>Name matched as &quot;similar&quot;, not exact</div>
              </div>
              <div className="flex items-start gap-2.5 text-[15.5px] text-[#0f172a] leading-[1.45] font-sans">
                <svg className="w-[18px] h-[18px] text-[#d97706] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01" /></svg>
                <div>International organisation PEP - High/Medium-High risk: Regional Government Members, Ambassadors, High Commissioners.</div>
              </div>
              <div className="flex items-start gap-2.5 text-[15.5px] text-[#0f172a] leading-[1.45] font-sans">
                <svg className="w-[18px] h-[18px] text-[#6d28d9] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                <div>Associate on record: Jane TESTTWENTYTWO (Wife) - due diligence can extend to associates.</div>
              </div>
            </div>

            {/* Collapsible Audit Details 1 (Consistent sans-serif typography) */}
            <details className="mt-3.5 pt-2.5 border-t border-[#edf2f7] group">
              <summary className="inline-flex items-center gap-1.5 text-[15px] font-bold text-[#0f172a] cursor-pointer select-none py-1 list-none font-sans">
                <svg className="w-3.5 h-3.5 transition-transform duration-200 group-open:rotate-90 text-[#0f172a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
                <span className="font-sans">Show audit details</span>
              </summary>
              <div className="mt-2.5 bg-white border border-[#e2e8f0] rounded-[6px] p-3.5 font-sans">
                <div className="grid grid-cols-[150px_1fr] gap-x-3 gap-y-2 text-[15px] leading-[1.45] font-sans">
                  <span className="text-[#334155] font-bold font-sans">Case ID</span><span className="text-[#0f172a] font-bold font-sans">ca_searchid_testing</span>
                  <span className="text-[#334155] font-bold font-sans">Search reference</span><span className="text-[#0f172a] font-bold font-sans">Fr57rftufTKUYTF</span>
                  <span className="text-[#334155] font-bold font-sans">Entity ID</span><span className="text-[#0f172a] font-bold font-sans">99887766f</span>
                  <span className="text-[#334155] font-bold font-sans">Check ID</span><span className="text-[#0f172a] font-bold font-sans">c9fb44aa-4927-4b72-a72d-1bcde21980ef</span>
                  <span className="text-[#334155] font-bold font-sans">Check source (PEP)</span><span className="text-[#0f172a] font-bold font-sans">c6 intelligence · confidence 95</span>
                  <span className="text-[#334155] font-bold font-sans">Also known as</span><span className="text-[#0f172a] font-bold font-sans">Testtwenty, Stacy</span>
                  <span className="text-[#334155] font-bold font-sans">Checked</span><span className="text-[#0f172a] font-bold font-sans">2026-07-23T17:51:44.370Z</span>
                </div>
              </div>
            </details>

            {/* Collapsible Audit Details 2 */}
            <details className="mt-2.5 pt-2.5 border-t border-[#edf2f7] group">
              <summary className="inline-flex items-center gap-1.5 text-[15px] font-bold text-[#0f172a] cursor-pointer select-none py-1 list-none font-sans">
                <svg className="w-3.5 h-3.5 transition-transform duration-200 group-open:rotate-90 text-[#0f172a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
                <span className="font-sans">Political &amp; entity details</span>
              </summary>
              <div className="mt-2.5 bg-white border border-[#e2e8f0] rounded-[6px] p-3.5 font-sans">
                <div className="grid grid-cols-[150px_1fr] gap-x-3 gap-y-2 text-[15px] leading-[1.45] font-sans">
                  <span className="text-[#334155] font-bold font-sans">Country</span><span className="text-[#0f172a] font-bold font-sans">Australia</span>
                  <span className="text-[#334155] font-bold font-sans">Original country text</span><span className="text-[#0f172a] font-bold font-sans">Australia</span>
                  <span className="text-[#334155] font-bold font-sans">Political position</span><span className="text-[#0f172a] font-bold font-sans">Senior executive of a regional governmental body</span>
                  <span className="text-[#334155] font-bold font-sans">Chamber</span><span className="text-[#0f172a] font-bold font-sans">Department of jobs, skills, industry and regions executive</span>
                  <span className="text-[#334155] font-bold font-sans">Function</span><span className="text-[#0f172a] font-bold font-sans">Chief executive officer</span>
                  <span className="text-[#334155] font-bold font-sans">Institution type</span><span className="text-[#0f172a] font-bold font-sans">Body under regional executive</span>
                  <span className="text-[#334155] font-bold font-sans">Other info</span><span className="text-[#0f172a] font-bold font-sans">Victorian skills authority</span>
                  <span className="text-[#334155] font-bold font-sans">Region</span><span className="text-[#0f172a] font-bold font-sans">Victoria</span>
                  <span className="text-[#334155] font-bold font-sans">Location url</span>
                  <a href="#" className="text-[#0d9488] font-bold underline font-sans">
                    www.vic.gov.au/victorian-skills-authority
                  </a>
                </div>
              </div>
            </details>
          </div>

          {/* Resolution status */}
          <div className="flex flex-col gap-2 mt-5 font-sans">
            <label className="text-[14px] font-bold tracking-[0.06em] text-[#0f172a]">Resolution status</label>
            <div>
              <span className="inline-block text-[13px] font-bold px-[10px] py-[3px] rounded-[20px] text-[#b45309] bg-[#fffbeb] border border-[#fde68a]">
                Domestic PEP
              </span>
            </div>
          </div>

          {/* Approver notes */}
          <div className="flex flex-col gap-2 mt-3 font-sans">
            <label className="text-[14px] font-bold tracking-[0.06em] text-[#0f172a]">Approver notes</label>
            <div className="text-[16px] text-[#0f172a] leading-[1.6] font-medium font-sans">
              User confirmed via secondary ID that this is a domestic PEP match. Proceeding with enhanced due diligence.
            </div>
          </div>

          {/* Evidence Link */}
          <div className="flex flex-col gap-2 mt-3 font-sans">
            <label className="text-[14px] font-bold tracking-[0.06em] text-[#0f172a]">Evidence</label>
            <div>
              <a href="#" className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-transparent border border-[#0d9488]/30 text-[15.5px] font-bold text-[#0f172a] hover:bg-[#0d9488]/10 transition-colors">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" /></svg>
                OSI_Research_Doc.pdf
              </a>
            </div>
          </div>

          <div className="text-[14.5px] text-[#475569] text-right border-t border-[#edf2f7] pt-3 italic mt-4 font-sans">
            Resolved by M. Santos &nbsp;·&nbsp; 14 Jul 2026, 08:30 am
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-[22px] py-3.5 border-t border-[#edf2f7] bg-white flex-shrink-0">
          <button
            type="button"
            onClick={() => onOpenAddBlacklist && onOpenAddBlacklist({ type: 'pep' })}
            className="h-[42px] px-4 rounded-[6px] border border-[#fed7d7] text-[#e53e3e] bg-white hover:bg-[#fff5f5] text-[15px] font-bold cursor-pointer inline-flex items-center justify-center gap-1.5 font-sans"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            Add to Venue Blacklist
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-[42px] px-5 rounded-[6px] border border-[#e2e8f0] bg-white text-[#1a202c] hover:bg-[#f4f4f4] text-[15px] font-bold cursor-pointer font-sans"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* 2. Sanctions View Modal (Read-Only) */
function SancViewModal({ open, onClose, onOpenAddBlacklist }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#12132b]/55 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-[20px] border border-[#e2e8f0] w-full max-w-[750px] max-h-[calc(100vh-40px)] flex flex-col overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#edf2f7] bg-white flex-shrink-0">
          <div className="text-[20px] font-bold text-[#0f172a] tracking-[-0.01em]">Sanctions match resolution</div>
          <button type="button" onClick={onClose} className="w-[30px] h-[30px] border-none bg-transparent text-[#334155] hover:text-black cursor-pointer text-[22px] flex items-center justify-center leading-none">
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-[18px_22px] flex flex-col gap-3">
          {/* Comparison Table */}
          <table className="w-full border-collapse mb-4">
            <thead>
              <tr>
                <th className="w-[90px] text-left text-[12.5px] font-bold text-[#475569] pb-2.5 border-b-[1.5px] border-[#edf2f7]"></th>
                <th className="text-left text-[12.5px] font-bold text-[#0f172a] px-3 pb-2.5 border-b-[1.5px] border-[#edf2f7]">Player data</th>
                <th className="text-left text-[12.5px] font-bold text-[#0f172a] px-3 pb-2.5 border-b-[1.5px] border-[#edf2f7]">Matched record (WorldCheck)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-[13px] font-bold text-[#334155] py-2 border-b border-[#edf2f7]">Match type</td>
                <td className="text-[14.5px] font-bold text-[#0f172a] px-3 py-2 border-b border-[#edf2f7]">—</td>
                <td className="text-[14.5px] font-bold text-[#e53e3e] px-3 py-2 border-b border-[#edf2f7]">Token match (98%)</td>
              </tr>
              <tr>
                <td className="text-[13px] font-bold text-[#334155] py-2 border-b border-[#edf2f7]">Name</td>
                <td className="text-[14.5px] font-bold text-[#0f172a] px-3 py-2 border-b border-[#edf2f7]">STACY TESTTWENTY</td>
                <td className="text-[14.5px] font-bold text-[#0f172a] px-3 py-2 border-b border-[#edf2f7]">STACY TEST</td>
              </tr>
              <tr>
                <td className="text-[13px] font-bold text-[#334155] py-2 border-b border-[#edf2f7]">DOB</td>
                <td className="text-[14.5px] font-bold text-[#0f172a] px-3 py-2 border-b border-[#edf2f7]">15/08/1980</td>
                <td className="text-[14.5px] font-bold text-[#0f172a] px-3 py-2 border-b border-[#edf2f7]">15/08/1980</td>
              </tr>
              <tr>
                <td className="text-[13px] font-bold text-[#334155] py-2 border-b-0">Location</td>
                <td className="text-[14.5px] font-bold text-[#0f172a] px-3 py-2 border-b-0">Sydney, AU</td>
                <td className="text-[14.5px] font-bold text-[#0f172a] px-3 py-2 border-b-0">USA</td>
              </tr>
            </tbody>
          </table>

          {/* Screening summary */}
          <div className="bg-transparent border-none p-0 mb-0">
            <div className="text-[16.5px] font-bold text-[#0f172a] mb-3 tracking-[-0.01em]">Screening summary</div>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-start gap-2.5 text-[15.5px] text-[#0f172a] leading-[1.45]">
                <svg className="w-[18px] h-[18px] text-[#0f172a] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                <div>Date of birth matches - 15/08/1980</div>
              </div>
              <div className="flex items-start gap-2.5 text-[15.5px] text-[#0f172a] leading-[1.45]">
                <svg className="w-[18px] h-[18px] text-[#d97706] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01" /></svg>
                <div>Name matched as &quot;similar&quot;, not exact</div>
              </div>
              <div className="flex items-start gap-2.5 text-[15.5px] text-[#0f172a] leading-[1.45]">
                <svg className="w-[18px] h-[18px] text-[#d97706] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01" /></svg>
                <div>Searched countries do not match the record&apos;s countries</div>
              </div>
            </div>

            {/* Collapsible Audit Details 1 (Consistent sans-serif typography) */}
            <details className="mt-3.5 pt-2.5 border-t border-[#edf2f7] group">
              <summary className="inline-flex items-center gap-1.5 text-[15px] font-bold text-[#0f172a] cursor-pointer select-none py-1 list-none font-sans">
                <svg className="w-3.5 h-3.5 transition-transform duration-200 group-open:rotate-90 text-[#0f172a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
                <span className="font-sans">Show audit details</span>
              </summary>
              <div className="mt-2.5 bg-white border border-[#e2e8f0] rounded-[6px] p-3.5 font-sans">
                <div className="grid grid-cols-[150px_1fr] gap-x-3 gap-y-2 text-[15px] leading-[1.45] font-sans">
                  <span className="text-[#334155] font-bold font-sans">Case ID</span><span className="text-[#0f172a] font-bold font-sans">ca_searchid_testing</span>
                  <span className="text-[#334155] font-bold font-sans">Search reference</span><span className="text-[#0f172a] font-bold font-sans">Fr57rftufTKUYTF</span>
                  <span className="text-[#334155] font-bold font-sans">Entity ID</span><span className="text-[#0f172a] font-bold font-sans">55778899g</span>
                  <span className="text-[#334155] font-bold font-sans">Check ID</span><span className="text-[#0f172a] font-bold font-sans">7d2c56ed-6390-99f1-8f2a-cea3187e6ba4</span>
                  <span className="text-[#334155] font-bold font-sans">Check source (Sanctions)</span><span className="text-[#0f172a] font-bold font-sans">c6 intelligence · confidence 98</span>
                  <span className="text-[#334155] font-bold font-sans">Also known as</span><span className="text-[#0f172a] font-bold font-sans">Testtwenty, Stacy Testtwenty, Stacy</span>
                  <span className="text-[#334155] font-bold font-sans">Addresses on file</span><span className="text-[#0f172a] font-bold font-sans">1 Example St, Demotown, VIC 3465, AUS<br />Unit 4/42 Testing Abbey, Brisbane, QLD 4000, AUS</span>
                  <span className="text-[#334155] font-bold font-sans">Checked</span><span className="text-[#0f172a] font-bold font-sans">2026-07-23T17:51:44.370Z</span>
                </div>
              </div>
            </details>

            {/* Collapsible Audit Details 2 */}
            <details className="mt-2.5 pt-2.5 border-t border-[#edf2f7] group">
              <summary className="inline-flex items-center gap-1.5 text-[15px] font-bold text-[#0f172a] cursor-pointer select-none py-1 list-none font-sans">
                <svg className="w-3.5 h-3.5 transition-transform duration-200 group-open:rotate-90 text-[#0f172a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
                <span className="font-sans">Show screening parameters</span>
              </summary>
              <div className="mt-2.5 bg-white border border-[#e2e8f0] rounded-[6px] p-3.5 font-sans">
                <div className="grid grid-cols-[150px_1fr] gap-x-3 gap-y-2 text-[15px] leading-[1.45] font-sans">
                  <span className="text-[#334155] font-bold font-sans">Search string</span><span className="text-[#0f172a] font-medium font-sans">STACY TESTTWENTY</span>
                  <span className="text-[#334155] font-bold font-sans">Search type</span><span className="text-[#0f172a] font-medium font-sans">Sanction / Watchlist (Individual)</span>
                  <span className="text-[#334155] font-bold font-sans">Threshold</span><span className="text-[#0f172a] font-medium font-sans">85% match confidence score</span>
                  <span className="text-[#334155] font-bold font-sans">Database coverage</span><span className="text-[#0f172a] font-medium font-sans">UN, OFAC, EU, DFAT, UK HMT</span>
                </div>
              </div>
            </details>
          </div>

          {/* Resolution status */}
          <div className="flex flex-col gap-2 mt-5 font-sans">
            <label className="text-[14px] font-bold tracking-[0.06em] text-[#0f172a]">Resolution status</label>
            <div>
              <span className="inline-block text-[13px] font-bold px-[10px] py-[3px] rounded-[20px] text-[#059669] bg-[#ecfdf5] border border-[#a7f3d0]">
                Not a match
              </span>
            </div>
          </div>

          {/* Approver notes */}
          <div className="flex flex-col gap-2 mt-3 font-sans">
            <label className="text-[14px] font-bold tracking-[0.06em] text-[#0f172a]">Approver notes</label>
            <div className="text-[16px] text-[#0f172a] leading-[1.6] font-medium font-sans">
              Middle name differs completely. Verified against provided passport copy. False positive.
            </div>
          </div>

          {/* Evidence */}
          <div className="flex flex-col gap-2 mt-3 font-sans">
            <label className="text-[14px] font-bold tracking-[0.06em] text-[#0f172a]">Evidence</label>
            <div className="text-[14px] text-[#64748b] italic font-normal font-sans">
              No supporting document provided.
            </div>
          </div>

          <div className="text-[14.5px] text-[#475569] text-right border-t border-[#edf2f7] pt-3 italic mt-4 font-sans">
            Resolved by M. Santos &nbsp;·&nbsp; 14 Jul 2026, 08:32 am
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-[22px] py-3.5 border-t border-[#edf2f7] bg-white flex-shrink-0">
          <button
            type="button"
            onClick={() => onOpenAddBlacklist && onOpenAddBlacklist({ type: 'sanctions' })}
            className="h-[42px] px-4 rounded-[6px] border border-[#fed7d7] text-[#e53e3e] bg-white hover:bg-[#fff5f5] text-[15px] font-bold cursor-pointer inline-flex items-center justify-center gap-1.5 font-sans"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            Add to Venue Blacklist
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-[42px] px-5 rounded-[6px] border border-[#e2e8f0] bg-white text-[#1a202c] hover:bg-[#f4f4f4] text-[15px] font-bold cursor-pointer font-sans"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* 3. Blacklist View Modal */
function BlacklistViewModal({ open, onClose, scenario }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-[#12132b]/55 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-[20px] border border-[#e2e8f0] w-full max-w-[650px] max-h-[calc(100vh-40px)] flex flex-col overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#edf2f7] bg-white flex-shrink-0">
          <div>
            <div className="text-[19px] font-bold text-[#0f172a] tracking-[-0.01em]">Blacklist exclusion record</div>
            <div className="text-[13.5px] text-[#475569] mt-0.5">Automated exclusion check evaluated against venue database</div>
          </div>
          <button type="button" onClick={onClose} className="w-[30px] h-[30px] border-none bg-transparent text-[#334155] hover:text-black cursor-pointer text-[21px] flex items-center justify-center leading-none">
            &times;
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1 p-[18px_24px] flex flex-col gap-4">
          {/* Matched Record Section (Flat unboxed definition grid) */}
          <div className="font-sans pb-3 border-b border-[#edf2f7]">
            <div className="text-[13px] font-bold uppercase tracking-[0.06em] text-[#475569] mb-2.5">Matched blacklist record</div>
            <div className="grid grid-cols-[140px_1fr] gap-x-3 gap-y-2 text-[14.5px] leading-[1.45]">
              <span className="text-[#475569] font-bold">Patron name</span>
              <span className="text-[#0f172a] font-bold">{scenario?.member?.fullName || 'JOHN PATRON'}</span>
              <span className="text-[#475569] font-bold">Record reference</span>
              <span className="text-[#0f172a] font-bold font-mono">Ref #BL-0041</span>
              <span className="text-[#475569] font-bold">Severity level</span>
              <span className="text-[#b45309] font-bold">High</span>
              <span className="text-[#475569] font-bold">Listed reason</span>
              <span className="text-[#0f172a]">Self-exclusion order #8841</span>
              <span className="text-[#475569] font-bold">Venue scope</span>
              <span className="text-[#0f172a]">Riverside RSL Club (Active since 12 Jan 2026)</span>
            </div>
          </div>

          {/* Approver Determination Section (Flat unboxed) */}
          <div className="font-sans pb-3 border-b border-[#edf2f7]">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[13px] font-bold uppercase tracking-[0.06em] text-[#475569]">Approver determination</div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[13px] font-bold bg-[#fffbeb] text-[#78350f] border border-[#fde68a]">
                Override exclusion
              </span>
            </div>
            <div className="flex flex-col gap-2 text-[14.5px]">
              <div className="flex items-center gap-2 text-[13.5px] text-[#475569]">
                <span className="font-bold text-[#0f172a]">D. Walsh (Approver)</span>
                <span>·</span>
                <span>14/07/2026 02:05pm</span>
              </div>
              <div className="text-[14.5px] text-[#0f172a] leading-relaxed">
                Patron identity verified against statutory declaration. Exclusion order determined to be historical self-exclusion with current eligibility clearance.
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[13.5px] text-[#059669]">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                <span className="font-bold">Supporting document: Verification_evidence.pdf (Verified)</span>
              </div>
            </div>
          </div>

          {/* Compliance Notice (Clean flat note) */}
          <p className="text-[13.5px] text-[#475569] leading-relaxed m-0 font-sans">
            Approver has evaluated this exclusion match. Authorising this payout records the determination in statutory AUSTRAC compliance reporting.
          </p>
        </div>

        <div className="flex items-center justify-end px-[22px] py-3.5 border-t border-[#edf2f7] bg-white flex-shrink-0">
          <button type="button" onClick={onClose} className="h-10 px-5 border border-[#e2e8f0] bg-white text-[#1a202c] hover:bg-[#f4f4f4] rounded-[6px] text-[15px] font-bold cursor-pointer font-sans">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* 4. Add Patron to Venue Blacklist Modal (Authoriser) */
function AddBlacklistModal({ open, onClose, onConfirm, scenario, contextType = 'pep' }) {
  const [reasonCategory, setReasonCategory] = useState(
    contextType === 'sanctions'
      ? 'FrankieOne Sanctions Match'
      : 'FrankieOne PEP Match'
  );
  const [severity, setSeverity] = useState('High');
  const [state, setState] = useState('NSW');
  const [alias, setAlias] = useState('');
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    if (open) {
      setReasonCategory(
        contextType === 'sanctions'
          ? 'FrankieOne Sanctions Match'
          : 'FrankieOne PEP Match'
      );
      setSeverity('High');
      setState('NSW');
      setAlias('');
      setNotes('');
    }
  }, [open, contextType]);

  if (!open) return null;

  const isConfirmDisabled = !notes.trim();

  const handleConfirm = (e) => {
    e.preventDefault();
    onConfirm({
      name: scenario?.member?.fullName || 'Patron',
      alias,
      reasonCategory,
      severity,
      state,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] bg-[#12132b]/60 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-[16px] border border-[#e2e8f0] max-w-[540px] w-full p-6 shadow-2xl space-y-4 font-sans" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#edf2f7]">
          <div>
            <h3 className="text-[18px] font-bold text-[#0f172a] m-0">Add Patron to Venue Blacklist</h3>
            <p className="text-[13px] text-[#475569] mt-0.5 mb-0">Record automated exclusion in venue compliance register</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#475569] hover:text-[#0f172a] text-xl transition-colors bg-transparent border-none cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Target Patron Summary */}
        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] p-3 text-[13.5px]">
          <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#64748b] mb-1.5">Target patron &amp; venue scope</div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#0f172a] text-[14.5px]">{scenario?.member?.fullName || 'Patron'}</span>
            <span className="text-[#475569] font-medium font-mono text-[12.5px]">DOB: 15/08/1980</span>
          </div>
          <div className="text-[13px] text-[#475569] mt-1">
            Scope: <strong className="text-[#0f172a]">{scenario?.payout?.venue || 'Riverside RSL Club'}</strong>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleConfirm} className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="text-[13px] font-bold text-[#0f172a]">Exclusion reason category <span className="text-[#e53e3e]">*</span></label>
            <select
              value={reasonCategory}
              onChange={e => setReasonCategory(e.target.value)}
              className="w-full h-10 px-3 border border-[#cbd5e1] rounded-md text-[14px] text-[#0f172a] bg-white outline-none focus:border-[#0f172a]"
            >
              <option value="FrankieOne PEP Match">FrankieOne PEP Match</option>
              <option value="FrankieOne Sanctions Match">FrankieOne Sanctions Match</option>
              <option value="DVS Document Fraud / Invalid ID">DVS Document Fraud / Invalid ID</option>
              <option value="Self-Exclusion Order (Statutory)">Self-Exclusion Order (Statutory)</option>
              <option value="Suspicious Transaction Structuring">Suspicious Transaction Structuring</option>
              <option value="Adverse Media Match">Adverse Media Match</option>
              <option value="Venue Policy Exclusion">Venue Policy Exclusion</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[13px] font-bold text-[#0f172a]">Severity level <span className="text-[#e53e3e]">*</span></label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value)}
                className="w-full h-10 px-3 border border-[#cbd5e1] rounded-md text-[14px] text-[#0f172a] bg-white outline-none focus:border-[#0f172a]"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[13px] font-bold text-[#0f172a]">Jurisdiction state <span className="text-[#e53e3e]">*</span></label>
              <select
                value={state}
                onChange={e => setState(e.target.value)}
                className="w-full h-10 px-3 border border-[#cbd5e1] rounded-md text-[14px] text-[#0f172a] bg-white outline-none focus:border-[#0f172a]"
              >
                <option value="NSW">NSW</option>
                <option value="VIC">VIC</option>
                <option value="QLD">QLD</option>
                <option value="SA">SA</option>
                <option value="WA">WA</option>
                <option value="TAS">TAS</option>
                <option value="ACT">ACT</option>
                <option value="NT">NT</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[13px] font-bold text-[#0f172a]">Known alias (optional)</label>
            <input
              type="text"
              value={alias}
              onChange={e => setAlias(e.target.value)}
              placeholder="e.g. Mark Vance"
              className="w-full h-10 px-3 border border-[#cbd5e1] rounded-md text-[14px] text-[#0f172a] bg-white outline-none focus:border-[#0f172a]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[13px] font-bold text-[#0f172a]">Investigation notes &amp; justification <span className="text-[#e53e3e]">*</span></label>
            <textarea
              rows={3}
              required
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Provide audit rationale for adding this patron to the venue blacklist..."
              className="w-full p-2.5 border border-[#cbd5e1] rounded-md text-[14px] text-[#0f172a] bg-white outline-none focus:border-[#0f172a] resize-vertical leading-[1.5]"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#edf2f7]">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-[6px] border border-[#cbd5e1] bg-white text-[#1a202c] hover:bg-[#f4f4f4] text-[14.5px] font-bold cursor-pointer font-sans"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isConfirmDisabled}
              className={`h-10 px-5 rounded-[6px] text-[14.5px] font-bold border-none transition-all font-sans text-white
                ${isConfirmDisabled
                  ? 'bg-[#dc2626] opacity-40 cursor-not-allowed'
                  : 'bg-[#dc2626] hover:bg-[#b91c1c] cursor-pointer'}`}
            >
              Confirm &amp; add to blacklist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* 5. Docket Modal */
function DocketModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[2000] bg-[#12132b]/55 backdrop-blur-md flex items-center justify-center p-6" onClick={onClose}>
      <div className="bg-white rounded-[16px] shadow-2xl max-w-[520px] w-full overflow-hidden flex flex-col max-h-[calc(100vh-48px)]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0] flex-shrink-0">
          <div className="text-[17px] font-bold text-[#0f172a]">Payout Docket</div>
          <button type="button" onClick={onClose} className="bg-transparent border-none cursor-pointer text-[#475569] hover:text-[#0f172a] p-1 rounded-[6px] flex items-center text-lg">
            ✕
          </button>
        </div>
        <div className="p-4 text-center overflow-hidden flex-1 flex items-center justify-center bg-slate-50">
          <img
            src="/dummy-docket.png"
            alt="Payout Docket"
            className="max-w-full max-h-[calc(100vh-160px)] w-auto h-auto object-contain rounded-[8px] border border-[#e2e8f0] block shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}

/* 6. Cancel Modal */
function CancelModal({ open, onClose, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9999] bg-[#12132b]/45 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-[16px] border border-[#e2e8f0] shadow-xl w-full max-w-[420px] p-[24px_28px]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-2.5">
          <div className="text-[19px] font-bold text-[#1e293b]">Cancel payout</div>
          <button type="button" onClick={onClose} className="bg-transparent border-none text-[#94a3b8] hover:text-[#1e293b] cursor-pointer p-1 rounded-[6px] text-lg">
            ✕
          </button>
        </div>
        <div className="text-[15px] text-[#64748b] leading-[1.5] mb-6">
          Are you sure you want to cancel this payout? Any unsaved changes will be lost.
        </div>
        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-[6px] border border-[#cbd5e1] bg-white text-[#334155] text-[15px] font-bold cursor-pointer hover:bg-[#f8fafc] transition-all font-sans"
          >
            Keep reviewing
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-10 px-[18px] rounded-[6px] border border-[#ef4444] bg-[#ef4444] text-white text-[15px] font-bold cursor-pointer hover:bg-[#dc2626] shadow-[0_2px_8px_rgba(239,68,68,0.25)] transition-all font-sans"
          >
            Cancel payout
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Authoriser Page Component ─── */
export default function AuthoriserScenarioPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const scenarioKey = (params?.scenario || 'dual-hit');
  const scenario = SCENARIOS[scenarioKey] || SCENARIOS['dual-hit'];

  // The scenario body is still canned data, but when a dashboard row sent us
  // here its status is the one thing we can report truthfully. Without this the
  // pill prints the scenario's hardcoded 'Awaiting authorisation' for every record.
  const payoutId = searchParams.get('payout');
  const payoutRecord = payoutId
    ? initialPayouts.find((p) => p.id === payoutId)
    : null;
  const statusPill = payoutRecord?.status || scenario.statusPill;

  const computedRisk = useMemo(() => computeRisk(scenario.riskSignals || {}), [scenario]);
  const isOverridden = Boolean(scenario.approverResolution?.risk && scenario.approverResolution.risk !== computedRisk.rating);

  const [authConfirmed, setAuthConfirmed] = useState(false);
  const [blacklistOverride, setBlacklistOverride] = useState(false);
  const [isRiskCalculationExpanded, setIsRiskCalculationExpanded] = useState(false);
  const [openApprovers, setOpenApprovers] = useState({ 0: false, 1: false });

  // A scenario carries `approvals` only when more than one approver signed it
  // off; everything else keeps the single determined-risk-and-note layout.
  const approvals = scenario.approverResolution?.approvals || [];
  const hasMultipleApprovers = approvals.length > 1;

  // Managed controlled accordion states
  const [openSections, setOpenSections] = useState({
    payout: false,
    member: false,
    bank: false,
    name: false,
    verification: false,
    history: false,
    collector: false,
  });

  const isAllExpanded = Object.values(openSections).every(Boolean);

  const toggleAll = () => {
    const next = !isAllExpanded;
    setOpenSections({
      payout: next,
      member: next,
      bank: next,
      name: next,
      verification: next,
      history: next,
      collector: next,
    });
  };

  const toggleSection = (key) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Modals
  const [pepModalOpen, setPepModalOpen] = useState(false);
  const [sancModalOpen, setSancModalOpen] = useState(false);
  const [blacklistModalOpen, setBlacklistModalOpen] = useState(false);
  const [addBlacklistModalOpen, setAddBlacklistModalOpen] = useState(false);
  const [addBlacklistContext, setAddBlacklistContext] = useState('pep');
  const [blacklistToast, setBlacklistToast] = useState(null);
  const [docketModalOpen, setDocketModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const [authoriseStatus, setAuthoriseStatus] = useState(null); // 'authorised' | 'rejected' | 'cancelled' | null

  // Releasing a self-exclusion early is the Authoriser's alone, and it is never
  // a single click: the reason is written down and kept with the payout.
  const [exclusionOverrideReason, setExclusionOverrideReason] = useState('');

  const handleOpenModal = (id) => {
    if (id === 'pep') setPepModalOpen(true);
    else if (id === 'sanctions' || id === 'sanc') setSancModalOpen(true);
    else if (id === 'blacklist') setBlacklistModalOpen(true);
  };

  const handleOpenAddBlacklist = ({ type }) => {
    setAddBlacklistContext(type);
    setAddBlacklistModalOpen(true);
  };

  const handleConfirmAddBlacklist = (data) => {
    setAddBlacklistModalOpen(false);
    setPepModalOpen(false);
    setSancModalOpen(false);
    setBlacklistToast(`Patron ${data.name} has been added to venue blacklist.`);
    setTimeout(() => setBlacklistToast(null), 4000);
  };

  const exclusion = scenario.exclusion || null;
  const isSelfExclusion = exclusion?.type === EXCLUSION_TYPES.SELF;

  const isAuthoriseDisabled =
    !authConfirmed ||
    (scenario.blacklistMatch && !blacklistOverride) ||
    (isSelfExclusion && exclusionOverrideReason.trim() === '');

  return (
    <>
      <PepViewModal open={pepModalOpen} onClose={() => setPepModalOpen(false)} onOpenAddBlacklist={handleOpenAddBlacklist} />
      <SancViewModal open={sancModalOpen} onClose={() => setSancModalOpen(false)} onOpenAddBlacklist={handleOpenAddBlacklist} />
      <BlacklistViewModal open={blacklistModalOpen} onClose={() => setBlacklistModalOpen(false)} scenario={scenario} />
      <AddBlacklistModal
        open={addBlacklistModalOpen}
        onClose={() => setAddBlacklistModalOpen(false)}
        onConfirm={handleConfirmAddBlacklist}
        scenario={scenario}
        contextType={addBlacklistContext}
      />
      <DocketModal open={docketModalOpen} onClose={() => setDocketModalOpen(false)} />
      <CancelModal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={() => {
          setCancelModalOpen(false);
          setAuthoriseStatus('cancelled');
        }}
      />

      <div className="bg-[#f7fafc] min-h-screen text-[#0f172a] font-sans antialiased">
        <div className="max-w-[840px] mx-auto px-6 pt-8 pb-20">

          {/* Back Navigation Link */}
          <div className="mb-4">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-[#627d98] hover:text-[#102a43] transition-colors"
            >
              &larr; Back to Payouts Dashboard
            </Link>
          </div>

          {/* Scenario Switcher Bar */}
          <div className="flex items-center justify-between gap-3 bg-white border border-[#e2e8f0] rounded-[6px] px-2 py-1.5 mb-7 flex-wrap">
            <span className="text-[13.5px] font-bold uppercase tracking-[0.08em] text-[#0f172a] pl-3">
              Scenario presets
            </span>
            <div className="flex gap-1 flex-wrap">
              {Object.entries(SCENARIOS).map(([key, sc]) => (
                <Link
                  key={key}
                  href={`/authoriser/${key}`}
                  className={`text-[14.5px] font-bold no-underline px-3.5 py-1.5 rounded-[6px] border transition-all duration-150
                    ${scenarioKey === key
                      ? 'text-[#0f172a] bg-transparent border-[#0d9488]/30'
                      : 'text-[#334155] border-transparent hover:text-[#0f172a] hover:bg-white'}`}
                >
                  {sc.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Blacklist Confirmation Toast */}
          {blacklistToast && (
            <div className="mb-6 bg-[#ecfdf5] border border-[#6ee7b7] rounded-lg p-4 text-[#065f46] font-bold flex items-center justify-between">
              <span>✓ {blacklistToast}</span>
              <button type="button" onClick={() => setBlacklistToast(null)} className="text-[#065f46] hover:underline cursor-pointer bg-transparent border-none font-bold">Dismiss</button>
            </div>
          )}

          {/* Toast / Status banner */}
          {authoriseStatus === 'authorised' && (
            <div className="mb-6 bg-[#ecfdf5] border border-[#6ee7b7] rounded-lg p-4 text-[#065f46] font-bold flex items-center justify-between">
              <span>✓ Payout {scenario.payoutNum} successfully authorised. Funds disbursement scheduled.</span>
              <button type="button" onClick={() => setAuthoriseStatus(null)} className="text-[#065f46] hover:underline cursor-pointer bg-transparent border-none font-bold">Dismiss</button>
            </div>
          )}
          {authoriseStatus === 'cancelled' && (
            <div className="mb-6 bg-[#fef2f2] border border-[#fca5a5] rounded-lg p-4 text-[#991b1b] font-bold flex items-center justify-between">
              <span>✕ Payout {scenario.payoutNum} authorisation cancelled.</span>
              <button type="button" onClick={() => setAuthoriseStatus(null)} className="text-[#991b1b] hover:underline cursor-pointer bg-transparent border-none font-bold">Dismiss</button>
            </div>
          )}

          {/* Header */}
          <header className="flex items-start justify-between gap-4 mb-8 flex-wrap">
            <div className="flex flex-col gap-1.5">
              <span className="inline-flex items-center text-[10.5px] font-bold uppercase tracking-wider text-[#1d4ed8] bg-[#eff6ff] border border-[#bfdbfe] rounded-md px-2 py-0.5 w-fit shadow-2xs">
                Authorisation review
              </span>
              <h1 className="text-[34px] font-bold text-[#0f172a] tracking-[-0.02em] leading-tight m-0">
                Payout {scenario.payoutNum}
              </h1>
              <p className="text-[15.5px] text-[#334155] font-medium m-0">{scenario.dateTime}</p>
            </div>
            <StatusPill>{statusPill}</StatusPill>
          </header>

          {/* Toolbar */}
          <div className="flex justify-end mb-3.5">
            <button
              type="button"
              onClick={toggleAll}
              className="flex items-center gap-1.5 text-[15px] font-bold cursor-pointer px-3.5 py-1.5 rounded-[6px] text-[#0f172a] bg-transparent border border-[#0d9488]/30 hover:bg-[#0d9488]/10 transition-all font-sans"
            >
              <svg className={`w-3.5 h-3.5 transition-transform duration-250 ${isAllExpanded ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 15l7-7 7 7" />
              </svg>
              <span>{isAllExpanded ? 'Collapse all' : 'Expand all'}</span>
            </button>
          </div>

          {/* Accordion Shell */}
          <div className="bg-white/50 border border-[#e2e8f0] rounded-[10px] p-[3px] mb-5">
            <div className="bg-white rounded-[7px] overflow-hidden">

              {/* 1. Payout details (2-col Grid without internal borders) */}
              <AccordionItem
                isOpen={openSections.payout}
                onToggle={() => toggleSection('payout')}
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[15px] h-[15px]"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>}
                title="Payout details"
              >
                <div className="grid grid-cols-2 gap-0 pb-3 mb-3">
                  <div className="p-[11px_14px] flex flex-col gap-[3px]">
                    <span className="text-[14.5px] font-bold text-[#475569]">Cash amount</span>
                    <span className="text-[16px] font-medium text-[#0f172a]">{scenario.payout.cashAmount}</span>
                  </div>
                  <div className="p-[11px_14px] flex flex-col gap-[3px]">
                    <span className="text-[14.5px] font-bold text-[#475569]">Transfer amount</span>
                    <span className="text-[16px] font-medium text-[#0f172a]">{scenario.payout.transferAmount}</span>
                  </div>
                  <div className="p-[11px_14px] flex flex-col gap-[3px]">
                    <span className="text-[14.5px] font-bold text-[#475569]">Total amount</span>
                    <span className="text-[16px] font-medium text-[#0f172a]">{formatTotalAmount(scenario.payout.cashAmount, scenario.payout.transferAmount)}</span>
                  </div>
                  <div className="p-[11px_14px] flex flex-col gap-[3px]">
                    <span className="text-[14.5px] font-bold text-[#475569]">Internal txn ID</span>
                    <span className="text-[15.5px] font-mono tabular-nums font-medium text-[#0f172a]">{scenario.payout.txnId}</span>
                  </div>
                  <div className="p-[11px_14px] flex flex-col gap-[3px]">
                    <span className="text-[14.5px] font-bold text-[#475569]">Machine ID</span>
                    <span className="text-[15.5px] font-mono tabular-nums font-medium text-[#0f172a]">{scenario.payout.machineId}</span>
                  </div>
                  <div className="p-[11px_14px] flex flex-col gap-[3px]">
                    <span className="text-[14.5px] font-bold text-[#475569]">Venue</span>
                    <span className="text-[16px] font-medium text-[#0f172a]">{scenario.payout.venue}</span>
                  </div>
                  <div className="p-[11px_14px] flex flex-col gap-[3px]">
                    <span className="text-[14.5px] font-bold text-[#475569]">Disbursement policy</span>
                    <span className="text-[16px] font-medium text-[#0f172a]">{scenario.payout.disbursementPolicy}</span>
                  </div>
                  <div className="p-[11px_14px] flex flex-col gap-[3px]">
                    <span className="text-[14.5px] font-bold text-[#475569]">Payout type</span>
                    <span className="text-[16px] font-medium text-[#0f172a]">{scenario.payout.payoutType}</span>
                  </div>
                </div>

                {/* Docket Row */}
                <div className="flex items-center justify-between gap-4 pt-3.5 border-t border-[#e2e8f0]">
                  <div className="flex flex-col gap-[3px]">
                    <span className="text-[16px] font-bold text-[#0f172a]">Payout docket</span>
                    <span className="text-[14px] text-[#475569]">Submitted docket image from collector</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDocketModalOpen(true)}
                    className="inline-flex items-center justify-center gap-[7px] h-[38px] px-5 rounded-[6px] border border-[#e2e8f0] bg-white text-[#1a202c] hover:bg-[#f4f4f4] text-[15.5px] font-bold cursor-pointer whitespace-nowrap flex-shrink-0 font-sans"
                  >
                    View docket
                  </button>
                </div>
              </AccordionItem>

              {/* 2. Member identification (2-col Grid without internal borders) */}
              <AccordionItem
                isOpen={openSections.member}
                onToggle={() => toggleSection('member')}
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[15px] h-[15px]"><circle cx="12" cy="7" r="4" /><path d="M5.5 21a7.5 7.5 0 0113 0" /></svg>}
                title="Member identification"
              >
                <div className="grid grid-cols-2 gap-0">
                  <div className="p-[11px_14px] flex flex-col gap-[3px]">
                    <span className="text-[14.5px] font-bold text-[#475569]">Membership number</span>
                    <span className="text-[15.5px] font-mono tabular-nums font-medium text-[#0f172a]">{scenario.member.membershipNumber}</span>
                  </div>
                  <div className="p-[11px_14px] flex flex-col gap-[3px]">
                    <span className="text-[14.5px] font-bold text-[#475569]">Email</span>
                    <span className="text-[16px] font-medium text-[#0f172a]">{scenario.member.email}</span>
                  </div>
                  <div className="p-[11px_14px] flex flex-col gap-[3px]">
                    <span className="text-[14.5px] font-bold text-[#475569]">Full name</span>
                    <span className="text-[16px] font-medium text-[#0f172a]">{scenario.member.fullName}</span>
                  </div>
                  <div className="p-[11px_14px] flex flex-col gap-[3px]">
                    <span className="text-[14.5px] font-bold text-[#475569]">Document type</span>
                    <span className="text-[16px] font-medium text-[#0f172a]">{scenario.member.documentType}</span>
                  </div>
                </div>
              </AccordionItem>

              {/* 3. Bank account details (3-col Grid without internal borders) */}
              <AccordionItem
                isOpen={openSections.bank}
                onToggle={() => toggleSection('bank')}
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[15px] h-[15px]"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>}
                title="Bank account details"
              >
                <div className="grid grid-cols-3 gap-0">
                  <div className="p-[11px_14px] flex flex-col gap-[3px]">
                    <span className="text-[14.5px] font-bold text-[#475569]">Account name</span>
                    <span className="text-[16px] font-medium text-[#0f172a]">{scenario.bank.accountName}</span>
                  </div>
                  <div className="p-[11px_14px] flex flex-col gap-[3px]">
                    <span className="text-[14.5px] font-bold text-[#475569]">BSB number</span>
                    <span className="text-[15.5px] font-mono tabular-nums font-medium text-[#0f172a]">{scenario.bank.bsb}</span>
                  </div>
                  <div className="p-[11px_14px] flex flex-col gap-[3px]">
                    <span className="text-[14.5px] font-bold text-[#475569]">Account number</span>
                    <span className="text-[15.5px] font-mono tabular-nums font-medium text-[#0f172a]">{scenario.bank.accountNumber}</span>
                  </div>
                </div>
                {scenario.bank.reusedFrom && (
                  <p className="px-[14px] pb-[11px] m-0 text-[14px] text-[#475569]">
                    Bank details reused from a previous payout ({scenario.bank.reusedFrom}). Confirmation of payee was run again on this payout.
                  </p>
                )}
              </AccordionItem>

              {/* 4. Name verification */}
              <AccordionItem
                isOpen={openSections.name}
                onToggle={() => toggleSection('name')}
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[15px] h-[15px]"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><polyline points="17 11 19 13 23 9" /></svg>}
                title="Name verification"
              >
                <div className="flex flex-col gap-1 p-[4px_14px]">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="m-0 text-[16px] font-bold text-[#0f172a]">Name comparison</h4>
                    <Pill variant={scenario.nameVerification.isMatch ? 'pass' : 'fail'}>
                      {scenario.nameVerification.isMatch ? 'Match' : 'Not a match'}
                    </Pill>
                  </div>
                  <div className="flex flex-col gap-4 mb-5">
                    <div className="flex items-center justify-start gap-8">
                      <span className="text-[12.5px] font-bold text-[#64748b] tracking-[0.05em] w-[220px] flex-shrink-0">Verified ID document</span>
                      <span className="text-[15.5px] font-bold text-[#0f172a]">{scenario.nameVerification.idName}</span>
                    </div>
                    <div className="flex items-center justify-start gap-8">
                      <span className="text-[12.5px] font-bold text-[#64748b] tracking-[0.05em] w-[220px] flex-shrink-0">Provided bank account</span>
                      <span className={`text-[15.5px] font-bold ${scenario.nameVerification.isMatch ? 'text-[#0f172a]' : 'text-[#b45309]'}`}>
                        {scenario.nameVerification.bankName}
                      </span>
                    </div>
                  </div>
                  {scenario.nameVerification.approverVerified && (
                    <div className="flex items-center gap-2 pt-3 border-t border-[#edf2f7] text-[#0d9488] text-[14.5px] font-bold font-sans">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                      <span>Third-party authorization document verified by Approver</span>
                    </div>
                  )}
                </div>
              </AccordionItem>

              {/* 5. Verification results */}
              <AccordionItem
                isOpen={openSections.verification}
                onToggle={() => toggleSection('verification')}
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[15px] h-[15px]"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>}
                title="Verification results"
              >
                <SectionHead>Identity verification</SectionHead>
                <div className="flex flex-col mb-2">
                  {scenario.idvRows.map((row, i) => (
                    <div key={i} className="flex items-center justify-between p-[11px_14px]">
                      <span className="text-[16.5px] font-bold text-[#0f172a]">{row.label}</span>
                      <Pill variant={row.status === 'pass' ? 'pass' : row.status === 'fail' ? 'fail' : 'warn'}>
                        {row.text}
                      </Pill>
                    </div>
                  ))}
                </div>
                {scenario.idvNotice && (
                  <div className="text-[14px] text-[#64748b] px-[14px] mb-6">
                    {scenario.idvNotice}
                  </div>
                )}

                <SectionHead>AML screening</SectionHead>
                <div className="flex flex-col mb-2">
                  {scenario.amlRows.map((row, i) => (
                    <div
                      key={i}
                      className="w-full flex items-center justify-between gap-3 p-[11px_14px] hover:bg-[#f8fafc] text-left transition-colors font-sans"
                    >
                      <div className="text-[16px] font-bold text-[#0f172a]">{row.label}</div>
                      <div className="flex items-center gap-2">
                        {row.action === 'pill' ? (
                          <Pill variant={row.badgeType}>{row.badgeText}</Pill>
                        ) : (
                          <ActionButton variant="view" onClick={() => handleOpenModal(row.id)}>{row.btnText}</ActionButton>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {scenario.amlNotice && (
                  <div className="text-[14px] text-[#64748b] px-[14px]">
                    {scenario.amlNotice}
                  </div>
                )}
              </AccordionItem>

              {/* 6. Identity verification (IDV) history */}
              <AccordionItem
                isOpen={openSections.history}
                onToggle={() => toggleSection('history')}
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[15px] h-[15px]"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
                title="Identity verification (IDV) history"
              >
                <table className="w-full border-collapse text-[16px]">
                  <thead>
                    <tr>
                      <th className="text-left p-[9px_14px] text-[13px] font-bold tracking-[0.06em] text-[#475569]">Country + document + IDV</th>
                      <th className="text-left p-[9px_14px] text-[13px] font-bold tracking-[0.06em] text-[#475569]">Date &amp; time</th>
                      <th className="text-left p-[9px_14px] text-[13px] font-bold tracking-[0.06em] text-[#475569]">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scenario.idvHistory.map((row, i) => (
                      <tr key={i}>
                        <td className="p-[11px_14px] font-medium text-[#0f172a]">{row.doc}</td>
                        <td className="p-[11px_14px] font-medium text-[#0f172a]">{row.dateTime}</td>
                        <td className="p-[11px_14px]">
                          <Pill variant={row.result === 'pass' ? 'pass' : row.result === 'fail' ? 'fail' : 'warn'}>
                            {row.result === 'pass' ? 'Pass' : row.result === 'fail' ? 'Fail' : 'Manual'}
                          </Pill>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </AccordionItem>

              {/* 7. Collector */}
              <AccordionItem
                isOpen={openSections.collector}
                onToggle={() => toggleSection('collector')}
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[15px] h-[15px]"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>}
                title="Collector"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full flex-shrink-0 bg-gradient-to-br from-[#14b8a6] to-[#0d9488] flex items-center justify-center text-white text-[19px] font-bold">
                    {scenario.collector.initials}
                  </div>
                  <div>
                    <div className="text-[17px] font-bold text-[#0f172a]">{scenario.collector.name}</div>
                    <div className="text-[16px] text-[#334155] mt-0.5">{scenario.collector.timestamp}</div>
                  </div>
                </div>
              </AccordionItem>

            </div>
          </div>

          {/* Approver resolution (Read Only Panel matching deploy) */}
          <div className="bg-white/50 border border-[#e2e8f0] rounded-[10px] p-[3px] mb-5">
            <div className="bg-white rounded-[7px] p-[28px_28px_24px]">
              <div className="text-[18px] font-bold text-[#0f172a] pb-3 border-b border-[#edf2f7] mb-4">
                Approver resolution
              </div>

              {/* Verification Overview */}
              <div className="mt-4 mb-6">
                <div className="text-[15px] font-bold text-[#0f172a] mb-2.5">Verification overview</div>
                <div className="grid grid-cols-1 mb-6">
                  {scenario.approverResolution.verificationOverview.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-[12px_14px] border-b border-[#edf2f7] last:border-b-0">
                      <span className="text-[14.5px] font-bold text-[#475569]">{item.label}</span>
                      <span className={`text-[16px] font-bold ${item.color === 'ok' ? 'text-[#059669]' : item.color === 'warn' ? 'text-[#b45309]' : item.color === 'danger' ? 'text-[#e53e3e]' : 'text-[#0f172a]'}`}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AML Audit Trail */}
              <div className="mt-6 mb-6">
                <div className="text-[15px] font-bold text-[#0f172a] mb-2.5">AML &amp; compliance audit trail</div>
                <div className="grid grid-cols-1">
                  {scenario.approverResolution.amlTrail.map((row, i) => (
                    <div key={i} className="flex items-center justify-between p-[12px_14px] border-b border-[#edf2f7] last:border-b-0">
                      <div className="flex flex-col gap-[3px] max-w-[70%]">
                        <span className="text-[14.5px] font-bold text-[#475569]">{row.label}</span>
                        <span className="text-[14px] text-[#334155] leading-normal">{row.sub}</span>
                      </div>
                      <Pill variant={row.badgeType}>{row.badgeText}</Pill>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Risk Assessment (Computed by Risk Engine) */}
              <div className="mt-8 pt-6 border-t border-[#edf2f7]">
                <button
                  type="button"
                  onClick={() => setIsRiskCalculationExpanded(prev => !prev)}
                  className="w-full flex items-center justify-between gap-3 text-left bg-none border-none p-0 cursor-pointer font-sans select-none group"
                  aria-expanded={isRiskCalculationExpanded}
                >
                  <span className="text-[15px] font-bold text-[#0f172a] group-hover:text-[#0d9488] transition-colors">
                    Automatic risk rating engine assessment
                  </span>
                  <div className="flex items-center gap-3">
                    <Pill variant={computedRisk.rating === 'High' ? 'fail' : computedRisk.rating === 'Medium' ? 'warn' : 'pass'}>
                      {computedRisk.rating} risk
                    </Pill>
                    <svg
                      className={`w-[17px] h-[17px] text-[#475569] transition-transform duration-250 flex-shrink-0 ${isRiskCalculationExpanded ? 'rotate-180 text-[#0f172a]' : 'group-hover:text-[#0f172a]'}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>
                </button>

                {/* Collapsible trigger conditions */}
                {isRiskCalculationExpanded && (
                  <div className="mt-3.5 border-t border-[#edf2f7]">
                    <div className="grid grid-cols-1">
                      {computedRisk.triggers.length > 0 ? (
                        computedRisk.triggers.map((trigger, idx) => (
                          <div
                            key={trigger.id || idx}
                            className="flex items-center justify-between p-[12px_14px] border-b border-[#edf2f7] last:border-b-0"
                          >
                            <div className="flex flex-col gap-[3px] max-w-[75%]">
                              <span className="text-[14.5px] font-bold text-[#0f172a]">
                                {trigger.label}
                              </span>
                              <span className="text-[13.5px] text-[#475569] leading-normal">
                                {trigger.detail}
                              </span>
                            </div>
                            <Pill
                              variant={
                                trigger.severity === 'high'
                                  ? 'fail'
                                  : trigger.severity === 'medium'
                                  ? 'warn'
                                  : 'pass'
                              }
                            >
                              {trigger.severity === 'high'
                                ? 'High trigger'
                                : trigger.severity === 'medium'
                                ? 'Medium trigger'
                                : 'Low signal'}
                            </Pill>
                          </div>
                        ))
                      ) : (
                        <div className="p-[12px_14px] text-[14px] text-[#475569] leading-normal">
                          No elevated AML, IDV, or threshold triggers fired. Standard Low Risk baseline.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {hasMultipleApprovers ? (
                <div className="mt-6 pt-6 border-t border-[#edf2f7]">
                  <div className="text-[15px] font-bold text-[#0f172a]">
                    Approver sign-offs
                  </div>
                  <p className="text-[14px] text-[#475569] mt-1 mb-3 leading-normal">
                    {computedRisk.recommendedApprovers} approvers were required: {computedRisk.routingReason}
                  </p>
                  <div>
                    {approvals.map((approval, i) => (
                      <ApproverSection
                        key={i}
                        label={`Approver ${i + 1}`}
                        approval={approval}
                        isOpen={openApprovers[i]}
                        onToggle={() => setOpenApprovers((prev) => ({ ...prev, [i]: !prev[i] }))}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {/* Approver Determined Risk Level */}
                  <div className="mt-6 pt-6 border-t border-[#edf2f7]">
                    <div className="flex items-center justify-between">
                      <div className="text-[15px] font-bold text-[#0f172a]">
                        Approver determined risk level
                      </div>
                      <Pill variant={scenario.approverResolution.risk === 'High' ? 'fail' : scenario.approverResolution.risk === 'Medium' ? 'warn' : 'pass'}>
                        {scenario.approverResolution.risk} risk
                      </Pill>
                    </div>
                  </div>

                  {/* Approver Note */}
                  <div className="mt-6 pt-6 border-t border-[#edf2f7]">
                    <div className="text-[14px] font-bold tracking-[0.06em] text-[#0f172a] mb-2">
                      Approver note
                    </div>
                    <p className="text-[15px] text-[#334155] leading-relaxed m-0">
                      {scenario.approverResolution.riskOverrideNote || scenario.approverResolution.approverNote || 'Approver confirmed all identity, AML, and risk parameters and approved payout for secondary authorisation.'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Shell — Authorise Payout */}
          <div className="bg-white/50 border border-[#e2e8f0] rounded-[10px] p-[3px]">
            <div className="bg-white rounded-[7px] p-[28px_28px_24px]">
              <div className="text-[18px] font-bold text-[#0f172a] pb-3 border-b border-[#edf2f7] mb-2">
                Authorise payout
              </div>
              <div className="text-[16px] text-[#334155] mb-5 leading-[1.5]">
                Review all information above before authorising. This action cannot be undone.
              </div>

              {/* Self-exclusion override - the only way funds move before expiry */}
              {isSelfExclusion && (
                <div className="mb-6 p-4 rounded-[8px] bg-[#fef2f2] border border-[#fca5a5]">
                  <div className="text-[15.5px] font-bold text-[#991b1b]">
                    Gambling self-exclusion - funds are held
                  </div>
                  <div className="text-[14.5px] text-[#334155] leading-[1.5] mt-1 mb-3">
                    {exclusion.reason} ({exclusion.source}). These funds release on their own on{' '}
                    <span className="font-bold text-[#0f172a]">
                      {formatRegisterDate(exclusion.expiresAt)}
                    </span>
                    . An Approver cannot release them sooner. As Authoriser you may override that,
                    and your reason is recorded against the payout.
                  </div>
                  <label className="text-[13px] font-bold text-[#0f172a] block mb-1">
                    Reason for releasing before the exclusion ends{' '}
                    <span className="text-[#e53e3e]">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={exclusionOverrideReason}
                    onChange={(e) => setExclusionOverrideReason(e.target.value)}
                    placeholder="Explain why these funds are being released before the self-exclusion expires."
                    className="w-full p-2.5 border border-[#fca5a5] rounded-md text-[14px] text-[#0f172a] outline-none focus:border-[#e53e3e] bg-white"
                  />
                </div>
              )}

              {/* Blacklist Warning Notice if matched (Unboxed) */}
              {scenario.blacklistMatch && (
                <div className="mb-6 flex flex-col gap-1.5">
                  <div className="text-[15.5px] font-bold text-[#e53e3e]">Venue blacklist match warning</div>
                  <div className="text-[14.5px] text-[#334155] leading-[1.5] mb-2">
                    This patron matches an active exclusion record. Authorisation will release funds despite the venue blacklist match. Ensure executive compliance approval is documented.
                  </div>
                  <label className="flex items-start gap-3.5 p-0 bg-transparent border-none mb-2 cursor-pointer hover:opacity-80 transition-opacity">
                    <input
                      type="checkbox"
                      checked={blacklistOverride}
                      onChange={e => setBlacklistOverride(e.target.checked)}
                      className="w-5 h-5 accent-black cursor-pointer mt-0.5 flex-shrink-0"
                    />
                    <span className="text-[15.5px] font-semibold text-[#e53e3e] leading-[1.5]">
                      I acknowledge the active venue blacklist match and confirm statutory compliance authorization to release these funds.
                    </span>
                  </label>
                </div>
              )}

              {/* Authoriser Confirm Checkbox */}
              <label className="flex items-start gap-3.5 p-0 bg-transparent border-none mb-8 cursor-pointer hover:opacity-80 transition-opacity">
                <input
                  type="checkbox"
                  checked={authConfirmed}
                  onChange={e => setAuthConfirmed(e.target.checked)}
                  className="w-5 h-5 accent-black cursor-pointer mt-0.5 flex-shrink-0"
                />
                <span className="text-[16px] text-[#0f172a] leading-[1.6] font-medium">
                  I confirm I have reviewed all payout details, member identification, verification results, and approver resolutions, and I authorise this payout to proceed.
                </span>
              </label>

              {/* Button Row */}
              <div className="flex items-center justify-between gap-3 w-full mt-9 pt-6 border-t border-[#edf2f7]">
                <button
                  type="button"
                  className="h-11 px-[26px] rounded-[6px] text-[17px] font-bold cursor-pointer bg-white border border-[#e2e8f0] text-[#1a202c] hover:bg-[#f4f4f4] transition-all font-sans"
                >
                  Back
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCancelModalOpen(true)}
                    className="h-11 px-[26px] rounded-[6px] text-[17px] font-bold cursor-pointer bg-white border border-[#fca5a5] text-[#ef4444] hover:bg-[#fef2f2] hover:border-[#f87171] transition-all font-sans"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isAuthoriseDisabled}
                    onClick={() => setAuthoriseStatus('authorised')}
                    className={`h-11 px-7 rounded-[6px] text-[17px] font-bold border-none transition-all font-sans flex items-center justify-center gap-2.5
                      ${!isAuthoriseDisabled
                        ? 'bg-[#0d9488] hover:bg-[#0b7a6f] text-white cursor-pointer'
                        : 'bg-[#0d9488] opacity-40 cursor-not-allowed text-white'}`}
                  >
                    Authorise payout
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  );
}
