'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Check } from 'lucide-react';
import { computeRisk } from '@/lib/riskEngine';
import { formatOccupation } from '@/lib/venueCompliance';
import { EXCLUSION_TYPES, formatRegisterDate } from '@/lib/exclusionRegister';
import { initialPayouts } from '@/lib/mockData';

/* ─── Scenario Data matching deploy/approver_v3.html ─── */
const SCENARIOS = {
  'dual-hit': {
    label: '1. Dual hit',
    payoutNum: '#578',
    dateTime: '14 July 2026 · 7:09 am · Riverside RSL Club',
    statusPill: 'Awaiting approval',
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
      occupation: 'Electrician',
      source: 'max-gaming',
      isPrefilled: true,
      writeBackStatus: null,
    },
    bank: {
      accountName: 'STACY K TESTTWENTY',
      bsb: '321-312',
      accountNumber: '213-123-123',
    },
    nameVerification: {
      isMatch: true,
      idName: 'STACY K TESTTWENTY',
      bankName: 'STACY K TESTTWENTY',
    },
    idvRows: [
      { label: 'Government ID', status: 'pass', text: 'Pass' },
      { label: 'ID validation', status: 'pass', text: 'Pass' },
      { label: 'Name match', status: 'pass', text: 'Pass' },
      { label: 'DOB match', status: 'pass', text: 'Pass' },
      { label: 'Venue Blacklist', status: 'pass', text: 'No match' },
    ],
    amlRows: [
      { id: 'blacklist', label: 'Venue Blacklist - Screening', badgeType: 'pass', badgeText: 'No match', action: 'pill' },
      { id: 'pep', label: 'PEP - Active hits', badgeType: 'warn', badgeText: 'Action required', action: 'btn' },
      { id: 'sanctions', label: 'Sanctions - Active hits', badgeType: 'warn', badgeText: 'Action required', action: 'btn' },
    ],
    idvHistory: [
      { doc: 'Australia Passport IDV', dateTime: '14 July 2026, 11:41 am', result: 'pass' },
    ],
    collector: {
      initials: 'MS',
      name: 'M.Santos',
      timestamp: '14/07/2026 07:12am',
    },
    execSummary: [
      { label: 'Identity verification', value: 'Fully verified', color: 'ok' },
      { label: 'Name match', value: 'Mismatch detected', color: 'warn' },
      { label: 'Confirmation of payee', value: 'Exact match', color: 'ok' },
      { label: 'Venue blacklist', value: 'No match', color: 'ok' },
    ],
    amlAuditRows: [
      { id: 'blacklist', label: 'Venue blacklist status', sub: 'Automated exclusion check evaluated against venue database.', badgeType: 'pass', badgeText: 'No match', action: 'pill' },
      { id: 'pep', label: 'PEP match status', sub: 'Pending determination in AML screening', badgeType: 'warn', badgeText: 'Action required', action: 'btn' },
      { id: 'sanctions', label: 'Sanctions match status', sub: 'Pending determination in AML screening', badgeType: 'warn', badgeText: 'Action required', action: 'btn' },
    ],
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
  'single-hit': {
    label: '2. Single hit',
    payoutNum: '#579',
    dateTime: '14 July 2026 · 8:15 am · Riverside RSL Club',
    statusPill: 'Awaiting approval',
    payout: {
      cashAmount: 'AUD 1,200.00',
      transferAmount: 'AUD 3,000.00',
      txnId: '214',
      machineId: 'EGM-004',
      venue: 'Riverside RSL Club',
      disbursementPolicy: 'Cash + Bank transfer',
      payoutType: 'EGM',
    },
    member: {
      membershipNumber: '9k12m',
      email: 'alex.r@gmail.com',
      fullName: 'ALEXANDER ROSS',
      documentType: 'Driver Licence',
      occupation: 'Registered nurse',
      source: 'max-gaming',
      isPrefilled: true,
      writeBackStatus: null,
    },
    bank: {
      accountName: 'ALEXANDER ROSS',
      bsb: '062-111',
      accountNumber: '445-566-778',
    },
    nameVerification: {
      isMatch: true,
      idName: 'ALEXANDER ROSS',
      bankName: 'ALEXANDER ROSS',
    },
    idvRows: [
      { label: 'Government ID', status: 'pass', text: 'Pass' },
      { label: 'ID validation', status: 'pass', text: 'Pass' },
      { label: 'Name match', status: 'pass', text: 'Pass' },
      { label: 'DOB match', status: 'pass', text: 'Pass' },
      { label: 'Venue Blacklist', status: 'pass', text: 'No match' },
    ],
    amlRows: [
      { id: 'blacklist', label: 'Venue Blacklist - Screening', badgeType: 'pass', badgeText: 'No match', action: 'pill' },
      { id: 'pep', label: 'PEP - Active hits', badgeType: 'warn', badgeText: 'Action required', action: 'btn' },
      { id: 'sanctions', label: 'Sanctions - Clear', badgeType: 'pass', badgeText: 'No match', action: 'pill' },
    ],
    idvHistory: [
      { doc: 'Australia Driver Licence IDV', dateTime: '14 July 2026, 08:15 am', result: 'pass' },
    ],
    collector: {
      initials: 'MS',
      name: 'M.Santos',
      timestamp: '14/07/2026 08:15am',
    },
    execSummary: [
      { label: 'Identity verification', value: 'Fully verified', color: 'ok' },
      { label: 'Name match', value: 'Exact match', color: 'ok' },
      { label: 'Confirmation of payee', value: 'Exact match', color: 'ok' },
      { label: 'Venue blacklist', value: 'No match', color: 'ok' },
    ],
    amlAuditRows: [
      { id: 'blacklist', label: 'Venue blacklist status', sub: 'Automated exclusion check evaluated against venue database.', badgeType: 'pass', badgeText: 'No match', action: 'pill' },
      { id: 'pep', label: 'PEP match status', sub: 'Pending determination in AML screening', badgeType: 'warn', badgeText: 'Action required', action: 'btn' },
      { id: 'sanctions', label: 'Sanctions match status', sub: 'No sanctions matches found.', badgeType: 'pass', badgeText: 'Clear', action: 'pill' },
    ],
    riskSignals: {
      idvPath: 'IDV1',
      documentCountry: 'AU',
      driverLicenceResult: 'pass',
      passportResult: null,
      isPEP: true,
      pepLevel: 2,
      pepUrlReputation: 'medium',
      isSanction: false,
      adverseMediaHits: 0,
      transactionValue: 4200.00,
      cashRatio: 0.285,
      blacklistMatch: false,
    },
  },
  'name-mismatch': {
    label: '3. Name mismatch',
    payoutNum: '#580',
    dateTime: '14 July 2026 · 8:45 am · Riverside RSL Club',
    statusPill: 'Awaiting approval',
    payout: {
      cashAmount: 'AUD 500.00',
      transferAmount: 'AUD 1,000.00',
      txnId: '215',
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
      occupation: 'Hospitality manager',
      source: 'manual',
      isPrefilled: false,
      writeBackStatus: 'updated',
    },
    bank: {
      accountName: 'Stacy K',
      bsb: '321-312',
      accountNumber: '213-123-123',
    },
    nameVerification: {
      isMatch: false,
      idName: 'STACY TESTTWENTY',
      bankName: 'Stacy K',
    },
    idvRows: [
      { label: 'Government ID', status: 'pass', text: 'Pass' },
      { label: 'ID validation', status: 'pass', text: 'Pass' },
      { label: 'Name match', status: 'warn', text: 'Mismatch' },
      { label: 'DOB match', status: 'pass', text: 'Pass' },
      { label: 'Venue Blacklist', status: 'pass', text: 'No match' },
    ],
    amlRows: [
      { id: 'blacklist', label: 'Venue Blacklist - Screening', badgeType: 'pass', badgeText: 'No match', action: 'pill' },
      { id: 'pep', label: 'PEP - Active hits', badgeType: 'warn', badgeText: 'Action required', action: 'btn' },
      { id: 'sanctions', label: 'Sanctions - Active hits', badgeType: 'warn', badgeText: 'Action required', action: 'btn' },
    ],
    idvHistory: [
      { doc: 'Australia Passport IDV', dateTime: '14 July 2026, 08:45 am', result: 'pass' },
    ],
    collector: {
      initials: 'MS',
      name: 'M.Santos',
      timestamp: '14/07/2026 08:45am',
    },
    execSummary: [
      { label: 'Identity verification', value: 'Fully verified', color: 'ok' },
      { label: 'Name match', value: 'Mismatch detected', color: 'warn' },
      { label: 'Confirmation of payee', value: 'Exact match', color: 'ok' },
      { label: 'Venue blacklist', value: 'No match', color: 'ok' },
    ],
    amlAuditRows: [
      { id: 'blacklist', label: 'Venue blacklist status', sub: 'Automated exclusion check evaluated against venue database.', badgeType: 'pass', badgeText: 'No match', action: 'pill' },
      { id: 'pep', label: 'PEP match status', sub: 'Pending determination in AML screening', badgeType: 'warn', badgeText: 'Action required', action: 'btn' },
      { id: 'sanctions', label: 'Sanctions match status', sub: 'Pending determination in AML screening', badgeType: 'warn', badgeText: 'Action required', action: 'btn' },
    ],
    riskSignals: {
      idvPath: 'IDV1',
      documentCountry: 'AU',
      driverLicenceResult: null,
      passportResult: 'pass',
      isPEP: true,
      pepLevel: 2,
      isSanction: true,
      adverseMediaHits: 2,
      adverseMediaUrlReputation: 'medium',
      transactionValue: 1500.00,
      cashRatio: 0.333,
      blacklistMatch: false,
    },
  },
  'all-clear': {
    label: '4. All clear',
    payoutNum: '#581',
    dateTime: '14 July 2026 · 9:30 am · Riverside RSL Club',
    statusPill: 'Awaiting approval',
    payout: {
      cashAmount: 'AUD 200.00',
      transferAmount: 'AUD 800.00',
      txnId: '216',
      machineId: 'EGM-001',
      venue: 'Riverside RSL Club',
      disbursementPolicy: 'Cash + Bank transfer',
      payoutType: 'EGM',
    },
    member: {
      membershipNumber: '4f78k',
      email: 'sarah.m@gmail.com',
      fullName: 'SARAH MILLER',
      documentType: 'Driver Licence',
      occupation: 'Retired',
      source: 'max-gaming',
      isPrefilled: true,
      writeBackStatus: null,
    },
    bank: {
      accountName: 'SARAH MILLER',
      bsb: '083-004',
      accountNumber: '654-321-098',
    },
    nameVerification: {
      isMatch: true,
      idName: 'SARAH MILLER',
      bankName: 'SARAH MILLER',
    },
    idvRows: [
      { label: 'Government ID', status: 'pass', text: 'Pass' },
      { label: 'ID validation', status: 'pass', text: 'Pass' },
      { label: 'Name match', status: 'pass', text: 'Pass' },
      { label: 'DOB match', status: 'pass', text: 'Pass' },
      { label: 'Venue Blacklist', status: 'pass', text: 'No match' },
    ],
    amlRows: [
      { id: 'blacklist', label: 'Venue Blacklist - Screening', badgeType: 'pass', badgeText: 'No match', action: 'pill' },
      { id: 'pep', label: 'PEP - No matches', badgeType: 'pass', badgeText: 'Clear', action: 'pill' },
      { id: 'sanctions', label: 'Sanctions - No matches', badgeType: 'pass', badgeText: 'Clear', action: 'pill' },
    ],
    idvHistory: [
      { doc: 'Australia Driver Licence IDV', dateTime: '14 July 2026, 09:30 am', result: 'pass' },
    ],
    collector: {
      initials: 'MS',
      name: 'M.Santos',
      timestamp: '14/07/2026 09:30am',
    },
    execSummary: [
      { label: 'Identity verification', value: 'Fully verified', color: 'ok' },
      { label: 'Name match', value: 'Exact match', color: 'ok' },
      { label: 'Confirmation of payee', value: 'Exact match', color: 'ok' },
      { label: 'Venue blacklist', value: 'No match', color: 'ok' },
    ],
    amlAuditRows: [
      { id: 'blacklist', label: 'Venue blacklist status', sub: 'Automated exclusion check evaluated against venue database.', badgeType: 'pass', badgeText: 'No match', action: 'pill' },
      { id: 'pep', label: 'PEP match status', sub: 'No PEP matches found.', badgeType: 'pass', badgeText: 'Clear', action: 'pill' },
      { id: 'sanctions', label: 'Sanctions match status', sub: 'No sanctions matches found.', badgeType: 'pass', badgeText: 'Clear', action: 'pill' },
    ],
    riskSignals: {
      idvPath: 'IDV1',
      documentCountry: 'AU',
      driverLicenceResult: 'pass',
      passportResult: null,
      isPEP: false,
      isSanction: false,
      adverseMediaHits: 0,
      transactionValue: 1000.00,
      cashRatio: 0.2,
      blacklistMatch: false,
    },
  },
  'manual-kyc': {
    label: '5. Manual KYC',
    payoutNum: '#582',
    dateTime: '14 July 2026 · 10:05 am · Riverside RSL Club',
    statusPill: 'Awaiting approval',
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
      occupation: 'Self-employed builder',
      source: 'none',
      isPrefilled: false,
      writeBackStatus: null,
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
      { id: 'blacklist', label: 'Venue Blacklist - Screening', badgeType: 'pass', badgeText: 'No match', action: 'pill' },
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
    execSummary: [
      { label: 'Identity verification', value: 'Manual KYC', color: 'warn' },
      { label: 'Name match', value: 'Match', color: 'ok' },
      { label: 'Confirmation of payee', value: 'Exact match', color: 'ok' },
      { label: 'Venue blacklist', value: 'No match', color: 'ok' },
    ],
    amlAuditRows: [
      { id: 'blacklist', label: 'Venue blacklist status', sub: 'Automated exclusion check evaluated against venue database.', badgeType: 'pass', badgeText: 'No match', action: 'pill' },
      { id: 'pep', label: 'PEP match status', sub: 'No PEP matches found.', badgeType: 'pass', badgeText: 'Clear', action: 'pill' },
      { id: 'sanctions', label: 'Sanctions match status', sub: 'No sanctions matches found.', badgeType: 'pass', badgeText: 'Clear', action: 'pill' },
    ],
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
    statusPill: 'Awaiting approval',
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
      source: 'none',
      isPrefilled: false,
      writeBackStatus: null,
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
      { id: 'blacklist', label: 'Venue Blacklist - Screening', badgeType: 'pass', badgeText: 'No match', action: 'pill' },
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
    execSummary: [
      { label: 'Identity verification', value: 'Not verified — No ID', color: 'warn' },
      { label: 'Name match', value: 'Unverified', color: 'warn' },
      { label: 'Confirmation of payee', value: 'Exact match', color: 'ok' },
      { label: 'Venue blacklist', value: 'No match', color: 'ok' },
    ],
    amlAuditRows: [
      { id: 'blacklist', label: 'Venue blacklist status', sub: 'Automated exclusion check evaluated against venue database.', badgeType: 'pass', badgeText: 'No match', action: 'pill' },
      { id: 'pep', label: 'PEP match status', sub: 'No PEP matches found.', badgeType: 'pass', badgeText: 'Clear', action: 'pill' },
      { id: 'sanctions', label: 'Sanctions match status', sub: 'No sanctions matches found.', badgeType: 'pass', badgeText: 'Clear', action: 'pill' },
    ],
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
    statusPill: 'Awaiting approval',
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
      occupation: 'Truck driver',
      source: 'max-gaming',
      isPrefilled: true,
      writeBackStatus: null,
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
      { id: 'blacklist', label: 'Venue Blacklist - Screening', badgeType: 'pass', badgeText: 'No match', action: 'pill' },
      { id: 'pep', label: 'PEP - No matches', badgeType: 'pass', badgeText: 'Clear', action: 'pill' },
      { id: 'sanctions', label: 'Sanctions - No matches', badgeType: 'pass', badgeText: 'Clear', action: 'pill' },
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
    execSummary: [
      { label: 'Identity verification', value: 'Fully verified', color: 'ok' },
      { label: 'Name match', value: 'Match', color: 'ok' },
      { label: 'Confirmation of payee', value: 'Exact match', color: 'ok' },
      { label: 'Venue blacklist', value: 'No match', color: 'ok' },
    ],
    amlAuditRows: [
      { id: 'blacklist', label: 'Venue blacklist status', sub: 'Automated exclusion check evaluated against venue database.', badgeType: 'pass', badgeText: 'No match', action: 'pill' },
      { id: 'pep', label: 'PEP match status', sub: 'No PEP matches found.', badgeType: 'pass', badgeText: 'Clear', action: 'pill' },
      { id: 'sanctions', label: 'Sanctions match status', sub: 'No sanctions matches found.', badgeType: 'pass', badgeText: 'Clear', action: 'pill' },
    ],
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
    statusPill: 'Awaiting approval',
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
      occupation: 'Accountant',
      source: 'manual',
      isPrefilled: false,
      writeBackStatus: 'updated',
    },
    bank: {
      accountName: 'E. Rostova',
      bsb: '733-000',
      accountNumber: '444-555-666',
    },
    nameVerification: {
      isMatch: false,
      idName: 'ELENA ROSTOVA',
      bankName: 'E. Rostova',
    },
    idvRows: [
      { label: 'Government ID', status: 'pass', text: 'Pass' },
      { label: 'ID validation', status: 'pass', text: 'Pass' },
      { label: 'Name match', status: 'warn', text: 'Partial' },
      { label: 'DOB match', status: 'pass', text: 'Pass' },
      { label: 'Venue Blacklist', status: 'pass', text: 'No match' },
    ],
    amlRows: [
      { id: 'blacklist', label: 'Venue Blacklist - Screening', badgeType: 'pass', badgeText: 'No match', action: 'pill' },
      { id: 'pep', label: 'PEP - No matches', badgeType: 'pass', badgeText: 'Clear', action: 'pill' },
      { id: 'sanctions', label: 'Sanctions - No matches', badgeType: 'pass', badgeText: 'Clear', action: 'pill' },
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
    execSummary: [
      { label: 'Identity verification', value: 'Partially verified', color: 'warn' },
      { label: 'Name match', value: 'Partial match', color: 'warn' },
      { label: 'Confirmation of payee', value: 'Exact match', color: 'ok' },
      { label: 'Venue blacklist', value: 'No match', color: 'ok' },
    ],
    amlAuditRows: [
      { id: 'blacklist', label: 'Venue blacklist status', sub: 'Automated exclusion check evaluated against venue database.', badgeType: 'pass', badgeText: 'No match', action: 'pill' },
      { id: 'pep', label: 'PEP match status', sub: 'No PEP matches found.', badgeType: 'pass', badgeText: 'Clear', action: 'pill' },
      { id: 'sanctions', label: 'Sanctions match status', sub: 'No sanctions matches found.', badgeType: 'pass', badgeText: 'Clear', action: 'pill' },
    ],
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
    statusPill: 'Awaiting approval',
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
      source: 'max-gaming',
      isPrefilled: true,
      writeBackStatus: null,
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
      { id: 'blacklist', label: 'Venue Blacklist - Screening', badgeType: 'warn', badgeText: 'Action required', action: 'btn-warn' },
      { id: 'pep', label: 'PEP - No matches', badgeType: 'pass', badgeText: 'Clear', action: 'pill' },
      { id: 'sanctions', label: 'Sanctions - No matches', badgeType: 'pass', badgeText: 'Clear', action: 'pill' },
    ],
    idvHistory: [
      { doc: 'Australia Driver Licence IDV', dateTime: '14 July 2026, 02:00 pm', result: 'pass' },
    ],
    collector: {
      initials: 'MS',
      name: 'M.Santos',
      timestamp: '14/07/2026 02:00pm',
    },
    execSummary: [
      { label: 'Identity verification', value: 'Fully verified', color: 'ok' },
      { label: 'Name match', value: 'Match', color: 'ok' },
      { label: 'Confirmation of payee', value: 'Exact match', color: 'ok' },
      { label: 'Venue blacklist', value: 'Match found', color: 'danger' },
    ],
    amlAuditRows: [
      { id: 'blacklist', label: 'Venue blacklist status', sub: 'Active exclusion order matched in venue blacklist database.', badgeType: 'warn', badgeText: 'Action required', action: 'btn-warn' },
      { id: 'pep', label: 'PEP match status', sub: 'No PEP matches found.', badgeType: 'pass', badgeText: 'Clear', action: 'pill' },
      { id: 'sanctions', label: 'Sanctions match status', sub: 'No sanctions matches found.', badgeType: 'pass', badgeText: 'Clear', action: 'pill' },
    ],
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
    statusPill: 'Awaiting approval',
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
      occupation: 'Cash-intensive business owner',
      source: 'none',
      isPrefilled: false,
      writeBackStatus: null,
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
    },
    idvRows: [
      { label: 'Government ID', status: 'pass', text: 'Pass' },
      { label: 'ID validation', status: 'pass', text: 'Pass' },
      { label: 'Name match', status: 'pass', text: 'Pass' },
      { label: 'DOB match', status: 'pass', text: 'Pass' },
      { label: 'Venue Blacklist', status: 'pass', text: 'No match' },
    ],
    amlRows: [
      { id: 'blacklist', label: 'Venue Blacklist - Screening', badgeType: 'pass', badgeText: 'No match', action: 'pill' },
      { id: 'pep', label: 'PEP - Clear', badgeType: 'pass', badgeText: 'Clear', action: 'pill' },
      { id: 'sanctions', label: 'Sanctions - Clear', badgeType: 'pass', badgeText: 'Clear', action: 'pill' },
    ],
    idvHistory: [
      { doc: 'Australia Passport IDV', dateTime: '14 July 2026, 02:45 pm', result: 'pass' },
    ],
    collector: {
      initials: 'MS',
      name: 'M.Santos',
      timestamp: '14/07/2026 02:45pm',
    },
    execSummary: [
      { label: 'Identity verification', value: 'Fully verified', color: 'ok' },
      { label: 'Name match', value: 'Exact match', color: 'ok' },
      { label: 'Confirmation of payee', value: 'Exact match', color: 'ok' },
      { label: 'Venue blacklist', value: 'No match', color: 'ok' },
    ],
    amlAuditRows: [
      { id: 'blacklist', label: 'Venue blacklist status', sub: 'Automated exclusion check evaluated against venue database.', badgeType: 'pass', badgeText: 'No match', action: 'pill' },
      { id: 'pep', label: 'PEP match status', sub: 'No PEP matches found.', badgeType: 'pass', badgeText: 'Clear', action: 'pill' },
      { id: 'sanctions', label: 'Sanctions match status', sub: 'No sanctions matches found.', badgeType: 'pass', badgeText: 'Clear', action: 'pill' },
    ],
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
  'foreign-payment': {
    label: '11. Foreign payment (1st approver)',
    payoutNum: '#588',
    dateTime: '14 July 2026 · 4:10 pm · Riverside RSL Club',
    statusPill: 'Awaiting approval',
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
      occupation: 'Software engineer',
      source: 'none',
      isPrefilled: false,
      writeBackStatus: null,
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
    },
    idvRows: [
      { label: 'Government ID', status: 'pass', text: 'Pass' },
      { label: 'ID validation', status: 'pass', text: 'Pass' },
      { label: 'Name match', status: 'pass', text: 'Pass' },
      { label: 'DOB match', status: 'pass', text: 'Pass' },
      { label: 'Venue Blacklist', status: 'pass', text: 'No match' },
    ],
    amlRows: [
      { id: 'blacklist', label: 'Venue Blacklist - Screening', badgeType: 'pass', badgeText: 'No match', action: 'pill' },
      { id: 'pep', label: 'PEP - Clear', badgeType: 'pass', badgeText: 'Clear', action: 'pill' },
      { id: 'sanctions', label: 'Sanctions - Clear', badgeType: 'pass', badgeText: 'Clear', action: 'pill' },
    ],
    idvHistory: [
      { doc: 'Portugal Passport IDV', dateTime: '14 July 2026, 04:10 pm', result: 'pass' },
    ],
    collector: {
      initials: 'MS',
      name: 'M.Santos',
      timestamp: '14/07/2026 04:10pm',
    },
    execSummary: [
      { label: 'Identity verification', value: 'Fully verified', color: 'ok' },
      { label: 'Name match', value: 'Exact match', color: 'ok' },
      { label: 'Confirmation of payee', value: 'Exact match', color: 'ok' },
      { label: 'Payment destination', value: 'Foreign payment', color: 'warn' },
    ],
    amlAuditRows: [
      { id: 'blacklist', label: 'Venue blacklist status', sub: 'Automated exclusion check evaluated against venue database.', badgeType: 'pass', badgeText: 'No match', action: 'pill' },
      { id: 'pep', label: 'PEP match status', sub: 'No PEP matches found.', badgeType: 'pass', badgeText: 'Clear', action: 'pill' },
      { id: 'sanctions', label: 'Sanctions match status', sub: 'No sanctions matches found.', badgeType: 'pass', badgeText: 'Clear', action: 'pill' },
    ],
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
  },
  'second-approval': {
    label: '12. Foreign payment (2nd approver)',
    payoutNum: '#588',
    dateTime: '14 July 2026 · 4:10 pm · Riverside RSL Club',
    statusPill: 'Awaiting 2nd approval',
    // The first sign-off is already on the record, so this screen renders as
    // the second approver's view of the same payout as 'foreign-payment'.
    firstApproval: {
      name: 'D.Walsh',
      role: 'Approver',
      timestamp: '14/07/2026 04:22pm',
      determination: 'Medium risk',
      notes: 'Passport verified against DVS and CoP matched exactly. Foreign destination is the only flag; patron is a visiting contractor with a local membership since 2024.',
    },
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
      occupation: 'Software engineer',
      source: 'none',
      isPrefilled: false,
      writeBackStatus: null,
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
    },
    idvRows: [
      { label: 'Government ID', status: 'pass', text: 'Pass' },
      { label: 'ID validation', status: 'pass', text: 'Pass' },
      { label: 'Name match', status: 'pass', text: 'Pass' },
      { label: 'DOB match', status: 'pass', text: 'Pass' },
      { label: 'Venue Blacklist', status: 'pass', text: 'No match' },
    ],
    amlRows: [
      { id: 'blacklist', label: 'Venue Blacklist - Screening', badgeType: 'pass', badgeText: 'No match', action: 'pill' },
      { id: 'pep', label: 'PEP - Clear', badgeType: 'pass', badgeText: 'Clear', action: 'pill' },
      { id: 'sanctions', label: 'Sanctions - Clear', badgeType: 'pass', badgeText: 'Clear', action: 'pill' },
    ],
    idvHistory: [
      { doc: 'Portugal Passport IDV', dateTime: '14 July 2026, 04:10 pm', result: 'pass' },
    ],
    collector: {
      initials: 'MS',
      name: 'M.Santos',
      timestamp: '14/07/2026 04:10pm',
    },
    execSummary: [
      { label: 'Identity verification', value: 'Fully verified', color: 'ok' },
      { label: 'Name match', value: 'Exact match', color: 'ok' },
      { label: 'Confirmation of payee', value: 'Exact match', color: 'ok' },
      { label: 'Payment destination', value: 'Foreign payment', color: 'warn' },
    ],
    amlAuditRows: [
      { id: 'blacklist', label: 'Venue blacklist status', sub: 'Automated exclusion check evaluated against venue database.', badgeType: 'pass', badgeText: 'No match', action: 'pill' },
      { id: 'pep', label: 'PEP match status', sub: 'No PEP matches found.', badgeType: 'pass', badgeText: 'Clear', action: 'pill' },
      { id: 'sanctions', label: 'Sanctions match status', sub: 'No sanctions matches found.', badgeType: 'pass', badgeText: 'Clear', action: 'pill' },
    ],
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
  },
};

// Exclusion register presets. Kept separate from the blacklist-match preset so
// each one tests a single thing: the self-exclusion preset proves an Approver
// cannot release the funds, the venue-ban preset proves they can proceed once
// they have written down why.
SCENARIOS['self-exclusion'] = {
  ...SCENARIOS['blacklist-match'],
  label: '11. Self-exclusion hold',
  payoutNum: '#590',
  dateTime: '14 July 2026 · 3:20 pm · Riverside RSL Club',
  statusPill: 'Exclusion hold',
  member: {
    ...SCENARIOS['blacklist-match'].member,
    fullName: 'MARCUS VANCE',
    email: 'm.vance@email.com',
  },
  exclusion: {
    type: EXCLUSION_TYPES.SELF,
    reason: 'Self-exclusion order #8841',
    source: 'State register',
    expiresAt: '12 Jan 2027',
  },
};

SCENARIOS['venue-ban'] = {
  ...SCENARIOS['blacklist-match'],
  label: '12. Venue ban',
  payoutNum: '#591',
  dateTime: '14 July 2026 · 3:45 pm · Riverside RSL Club',
  statusPill: 'Awaiting approval',
  member: {
    ...SCENARIOS['blacklist-match'].member,
    fullName: 'CHLOE GALLAGHER',
    email: 'c.gallagher@email.com',
  },
  exclusion: {
    type: EXCLUSION_TYPES.VENUE_BAN,
    reason: 'Club barring order 12-months',
    source: 'Venue list',
    expiresAt: null,
  },
};


/* ─── Payout total helper ─── */
function formatTotalAmount(cashAmount, transferAmount) {
  const parse = (value) => Number(String(value).replace(/[^0-9.]/g, '')) || 0;
  const total = parse(cashAmount) + parse(transferAmount);
  return `AUD ${total.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/* ─── PEP Mock Results Dataset (matching deploy/approver_v3.html) ─── */
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

/* ─── Atomic Components matching deploy/approver_v3.html ─── */

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

function ActionButton({ variant = 'warn', children, onClick }) {
  const variants = {
    warn: 'text-[#b45309] bg-transparent border-[#b45309] hover:bg-[#fffbeb]',
    pass: 'text-[#059669] bg-transparent border-[#059669] hover:bg-[#ecfdf5]',
    fail: 'text-[#e53e3e] bg-transparent border-[#e53e3e] hover:bg-[#fff5f5]',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 h-[38px] px-4 w-[160px] min-w-[160px] rounded-[6px] text-[15px] font-bold border cursor-pointer transition-all duration-200 text-center whitespace-nowrap font-sans select-none flex-shrink-0 ${variants[variant] || variants.warn}`}
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

function SectionHead({ children }) {
  return (
    <div className="flex items-center gap-2 text-[13px] font-bold tracking-[0.1em] text-[#475569] mb-2.5">
      {children}
      <div className="flex-1 h-px bg-[#edf2f7]" />
    </div>
  );
}

function RiskSelector({ value, onChange }) {
  const options = ['Low', 'Medium', 'High'];
  return (
    <div className="flex items-center w-full mt-1">
      {options.map((opt, idx) => {
        const selected = value === opt;
        let activeClass = '';
        if (selected) {
          if (opt === 'Low') activeClass = 'border-[#059669] bg-[#ecfdf5] text-[#059669] z-10';
          if (opt === 'Medium') activeClass = 'border-[#b45309] bg-[#fffbeb] text-[#b45309] z-10';
          if (opt === 'High') activeClass = 'border-[#e53e3e] bg-[#fff5f5] text-[#e53e3e] z-10';
        } else {
          activeClass = 'border-[#dde1ea] bg-white text-[#0f172a] hover:bg-[#f8fafc]';
        }
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`flex-1 flex items-center justify-center gap-2 h-[42px] px-4 border text-[15px] font-bold font-sans cursor-pointer transition-all duration-180 relative
              ${idx === 0 ? 'rounded-l-[8px]' : ''}
              ${idx === options.length - 1 ? 'rounded-r-[8px]' : ''}
              ${idx > 0 ? '-ml-px' : ''}
              ${activeClass}`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Modals matching deploy/approver_v3.html ─── */

/* 1. PEP Match Resolution Modal */
function PepModal({ open, onClose, onSave, savedData, showAddBlacklist = true, onOpenAddBlacklist }) {
  const [tab, setTab] = useState('key'); // 'key' | 'media' | 'listing'
  const [resultIdx, setResultIdx] = useState(0); // 0, 1, 2
  const [resolution, setResolution] = useState(savedData?.resolution || null);
  const [notes, setNotes] = useState(savedData?.notes || '');
  const [hasFile, setHasFile] = useState(savedData?.hasFile || false);

  React.useEffect(() => {
    if (open) {
      setResolution(savedData?.resolution || null);
      setNotes(savedData?.notes || '');
      setHasFile(savedData?.hasFile || false);
    }
  }, [open, savedData]);

  if (!open) return null;

  const currentResult = PEP_MOCK_RESULTS[resultIdx];
  const isSaveDisabled = !resolution || !notes.trim();

  const pepResolutionOptions = [
    { key: 'not_pep', label: 'Not a PEP', variant: 'pass' },
    { key: 'domestic', label: 'Domestic PEP', variant: 'warn' },
    { key: 'foreign', label: 'Foreign PEP', variant: 'fail' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#12132b]/55 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-[20px] border border-[#e2e8f0] w-full max-w-[750px] max-h-[calc(100vh-40px)] flex flex-col overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#edf2f7] bg-white flex-shrink-0">
          <div>
            <div className="text-[19px] font-bold text-[#0f172a] tracking-[-0.01em]">PEP screening result</div>
            <div className="text-[13.5px] text-[#475569] mt-0.5">FrankieOne screening match result</div>
          </div>
          <button type="button" onClick={onClose} className="w-[30px] h-[30px] border-none bg-transparent text-[#334155] hover:text-black cursor-pointer text-[21px] flex items-center justify-center leading-none">
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-[18px_22px] flex flex-col gap-3">
          {/* Result count & prev/next */}
          <div className="flex items-center justify-between pb-3 border-b border-[#edf2f7]">
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

          {/* Comparison Table */}
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

          {/* Result Tabs */}
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
                  <span className="text-[#334155] font-bold font-sans">Entity ID</span><span className="text-[#0f172a] font-bold font-sans">55778899g</span>
                  <span className="text-[#334155] font-bold font-sans">Check ID</span><span className="text-[#0f172a] font-bold font-sans">7d2c56ed-6390-99f1-8f2a-cea3187e6ba4</span>
                  <span className="text-[#334155] font-bold font-sans">Check source (PEP)</span><span className="text-[#0f172a] font-bold font-sans">c6 intelligence · confidence 78</span>
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
                  <span className="text-[#0d9488] font-bold break-all underline font-sans">
                    <a href="https://djsir.vic.gov.au/about-us" target="_blank" rel="noreferrer">https://djsir.vic.gov.au/about-us</a>
                  </span>
                  <span className="text-[#334155] font-bold font-sans">Related url</span>
                  <span className="text-[#0d9488] font-bold break-all underline font-sans">
                    <a href="https://djsir.vic.gov.au/about-us" target="_blank" rel="noreferrer">https://djsir.vic.gov.au/about-us</a>
                  </span>
                </div>
              </div>
            </details>
          </div>

          {/* Resolution Status Form with Semantic Button Colors */}
          <div className="flex flex-col gap-1.5 mt-2">
            <label className="text-[14px] font-bold tracking-[0.06em] text-[#0f172a]">
              Resolution status <span className="text-[#e53e3e]">*</span>
            </label>
            <div className="flex w-full mt-2">
              {pepResolutionOptions.map(({ key, label, variant }, idx) => {
                const sel = resolution === key;
                let selClass = '';
                if (sel) {
                  if (variant === 'pass') selClass = 'border-[#059669] bg-[#ecfdf5] text-[#059669] z-10 font-bold';
                  if (variant === 'warn') selClass = 'border-[#b45309] bg-[#fffbeb] text-[#b45309] z-10 font-bold';
                  if (variant === 'fail') selClass = 'border-[#e53e3e] bg-[#fff5f5] text-[#e53e3e] z-10 font-bold';
                } else {
                  selClass = 'border-[#dde1ea] bg-white text-[#0f172a] hover:bg-[#f8fafc] font-bold';
                }
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setResolution(key)}
                    className={`flex-1 flex items-center justify-center h-11 px-4 border text-[15px] font-sans cursor-pointer transition-all duration-180 relative
                      ${idx === 0 ? 'rounded-l-[8px]' : ''}
                      ${idx === pepResolutionOptions.length - 1 ? 'rounded-r-[8px]' : ''}
                      ${idx > 0 ? '-ml-px' : ''}
                      ${selClass}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Investigation Notes */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pepNotes" className="text-[14px] font-bold tracking-[0.06em] text-[#0f172a]">
              Investigation notes <span className="text-[#e53e3e]">*</span>
            </label>
            <textarea
              id="pepNotes"
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Enter rationale for PEP determination..."
              className="w-full min-h-[60px] p-3 rounded-[6px] border-[1.5px] border-[#e2e8f0] bg-white text-[15.5px] text-[#0f172a] font-sans outline-none focus:border-[#0f172a] resize-vertical leading-[1.5]"
            />
          </div>

          {/* Supporting Document */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-bold tracking-[0.06em] text-[#0f172a]">Supporting document</label>
            <div
              onClick={() => setHasFile(p => !p)}
              className={`border-[1.5px] border-dashed rounded-[6px] bg-white p-3 flex items-center gap-3 cursor-pointer transition-colors ${hasFile ? 'border-[#059669] bg-[#ecfdf5]/30' : 'border-[#e2e8f0] hover:bg-slate-50'}`}
            >
              <div className="w-8 h-8 rounded-[8px] bg-slate-100 flex items-center justify-center text-[#0f172a] flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 16V4M12 4l-4 4M12 4l4 4" /><path d="M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3" /></svg>
              </div>
              <div>
                <div className="text-[15px] font-bold text-[#0f172a]">{hasFile ? 'Supporting_evidence.pdf (Uploaded)' : 'Click to upload document'}</div>
                <div className="text-[13.5px] text-[#334155]">PDF, JPG, PNG up to 10MB</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer (No icon on Add to Venue Blacklist, Gated Save resolution button) */}
        <div className={`flex items-center ${showAddBlacklist ? 'justify-between' : 'justify-end'} px-[22px] py-3.5 border-t border-[#edf2f7] bg-white flex-shrink-0`}>
          {showAddBlacklist && (
            <button
              type="button"
              onClick={() => onOpenAddBlacklist && onOpenAddBlacklist({ type: 'pep' })}
              className="h-[42px] px-4 rounded-[6px] border border-[#fed7d7] text-[#e53e3e] bg-white hover:bg-[#fff5f5] text-[15px] font-bold cursor-pointer inline-flex items-center justify-center font-sans"
            >
              Add to Venue Blacklist
            </button>
          )}
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-[42px] px-4 rounded-[6px] border border-[#e2e8f0] bg-white text-[#1a202c] hover:bg-[#f4f4f4] text-[15px] font-bold cursor-pointer font-sans"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSaveDisabled}
              onClick={() => onSave({ resolution, notes, hasFile })}
              className={`h-10 px-[22px] rounded-[6px] text-[16px] font-bold border-none transition-all font-sans
                ${isSaveDisabled
                  ? 'bg-[#0d9488] opacity-40 cursor-not-allowed text-white'
                  : 'bg-[#0d9488] text-white cursor-pointer hover:bg-[#0b7a6f]'}`}
            >
              Save resolution
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 2. Sanctions Match Resolution Modal */
function SancModal({ open, onClose, onSave, savedData, showAddBlacklist = true, onOpenAddBlacklist }) {
  const [resolution, setResolution] = useState(savedData?.resolution || null);
  const [notes, setNotes] = useState(savedData?.notes || '');
  const [hasFile, setHasFile] = useState(savedData?.hasFile || false);

  React.useEffect(() => {
    if (open) {
      setResolution(savedData?.resolution || null);
      setNotes(savedData?.notes || '');
      setHasFile(savedData?.hasFile || false);
    }
  }, [open, savedData]);

  if (!open) return null;

  const isSaveDisabled = !resolution || !notes.trim();

  const sancResolutionOptions = [
    { key: 'match', label: 'Match', variant: 'fail' },
    { key: 'false_positive', label: 'Not a match', variant: 'pass' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#12132b]/55 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-[20px] border border-[#e2e8f0] w-full max-w-[750px] max-h-[calc(100vh-40px)] flex flex-col overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#edf2f7] bg-white flex-shrink-0">
          <div className="text-[19px] font-bold text-[#0f172a] tracking-[-0.01em]">Sanctions match resolution</div>
          <button type="button" onClick={onClose} className="w-[30px] h-[30px] border-none bg-transparent text-[#334155] hover:text-black cursor-pointer text-[21px] flex items-center justify-center leading-none">
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

          {/* Resolution Status Form with Semantic Colors */}
          <div className="flex flex-col gap-1.5 mt-2">
            <label className="text-[14px] font-bold tracking-[0.06em] text-[#0f172a]">
              Resolution status <span className="text-[#e53e3e]">*</span>
            </label>
            <div className="flex w-full mt-2">
              {sancResolutionOptions.map(({ key, label, variant }, idx) => {
                const sel = resolution === key;
                let selClass = '';
                if (sel) {
                  if (variant === 'fail') selClass = 'border-[#e53e3e] bg-[#fff5f5] text-[#e53e3e] z-10 font-bold';
                  if (variant === 'pass') selClass = 'border-[#059669] bg-[#ecfdf5] text-[#059669] z-10 font-bold';
                } else {
                  selClass = 'border-[#dde1ea] bg-white text-[#0f172a] hover:bg-[#f8fafc] font-bold';
                }
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setResolution(key)}
                    className={`flex-1 flex items-center justify-center h-11 px-4 border text-[15px] font-sans cursor-pointer transition-all duration-180 relative
                      ${idx === 0 ? 'rounded-l-[8px]' : 'rounded-r-[8px] -ml-px'}
                      ${selClass}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Investigation Notes */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="sancNotes" className="text-[14px] font-bold tracking-[0.06em] text-[#0f172a]">
              Investigation notes <span className="text-[#e53e3e]">*</span>
            </label>
            <textarea
              id="sancNotes"
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Enter details of determination..."
              className="w-full min-h-[60px] p-3 rounded-[6px] border-[1.5px] border-[#e2e8f0] bg-white text-[15.5px] text-[#0f172a] font-sans outline-none focus:border-[#0f172a] resize-vertical leading-[1.5]"
            />
          </div>

          {/* Supporting Document */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-bold tracking-[0.06em] text-[#0f172a]">Supporting document</label>
            <div
              onClick={() => setHasFile(p => !p)}
              className={`border-[1.5px] border-dashed rounded-[6px] bg-white p-3 flex items-center gap-3 cursor-pointer transition-colors ${hasFile ? 'border-[#059669] bg-[#ecfdf5]/30' : 'border-[#e2e8f0] hover:bg-slate-50'}`}
            >
              <div className="w-8 h-8 rounded-[8px] bg-slate-100 flex items-center justify-center text-[#0f172a] flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 16V4M12 4l-4 4M12 4l4 4" /><path d="M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3" /></svg>
              </div>
              <div>
                <div className="text-[15px] font-bold text-[#0f172a]">{hasFile ? 'Sanction_audit_log.pdf (Uploaded)' : 'Click to upload document'}</div>
                <div className="text-[13.5px] text-[#334155]">PDF, JPG, PNG up to 10MB</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer (No icon on Add to Venue Blacklist, Gated Save resolution button) */}
        <div className={`flex items-center ${showAddBlacklist ? 'justify-between' : 'justify-end'} px-[22px] py-3.5 border-t border-[#edf2f7] bg-white flex-shrink-0`}>
          {showAddBlacklist && (
            <button
              type="button"
              className="h-[42px] px-4 rounded-[6px] border border-[#fed7d7] text-[#e53e3e] bg-white hover:bg-[#fff5f5] text-[15px] font-bold cursor-pointer inline-flex items-center justify-center font-sans"
            >
              Add to Venue Blacklist
            </button>
          )}
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-[42px] px-4 rounded-[6px] border border-[#e2e8f0] bg-white text-[#1a202c] hover:bg-[#f4f4f4] text-[15px] font-bold cursor-pointer font-sans"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSaveDisabled}
              onClick={() => onSave({ resolution, notes, hasFile })}
              className={`h-10 px-[22px] rounded-[6px] text-[16px] font-bold border-none transition-all font-sans
                ${isSaveDisabled
                  ? 'bg-[#0d9488] opacity-40 cursor-not-allowed text-white'
                  : 'bg-[#0d9488] text-white cursor-pointer hover:bg-[#0b7a6f]'}`}
            >
              Save resolution
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 3. Blacklist Match Resolution Modal */
function BlacklistModal({ open, onClose, onSave, savedData, scenario }) {
  const [resolution, setResolution] = useState(savedData?.resolution || null);
  const [notes, setNotes] = useState(savedData?.notes || '');
  const [hasFile, setHasFile] = useState(savedData?.hasFile || false);

  React.useEffect(() => {
    if (open) {
      setResolution(savedData?.resolution || null);
      setNotes(savedData?.notes || '');
      setHasFile(savedData?.hasFile || false);
    }
  }, [open, savedData]);

  if (!open) return null;

  const isSaveDisabled = !resolution || !notes.trim() || (resolution === 'override' && !hasFile);

  const blacklistResolutionOptions = [
    { key: 'false_positive', label: 'Not a match', variant: 'pass' },
    { key: 'override', label: 'Override exclusion', variant: 'warn' },
    { key: 'confirm_match', label: 'Confirm blacklist match', variant: 'fail' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#12132b]/55 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-[20px] border border-[#e2e8f0] w-full max-w-[750px] max-h-[calc(100vh-40px)] flex flex-col overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#edf2f7] bg-white flex-shrink-0">
          <div>
            <div className="text-[19px] font-bold text-[#0f172a] tracking-[-0.01em]">Blacklist match resolution</div>
            <div className="text-[13.5px] text-[#475569] mt-0.5">Automated exclusion check evaluated against venue database</div>
          </div>
          <button type="button" onClick={onClose} className="w-[30px] h-[30px] border-none bg-transparent text-[#334155] hover:text-black cursor-pointer text-[21px] flex items-center justify-center leading-none">
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-[18px_22px] flex flex-col gap-3.5">
          {/* Comparison Table */}
          <table className="w-full border-collapse mb-1">
            <thead>
              <tr>
                <th className="w-[110px] text-left text-[12.5px] font-bold text-[#475569] pb-2.5 border-b-[1.5px] border-[#edf2f7]"></th>
                <th className="text-left text-[12.5px] font-bold text-[#0f172a] px-3 pb-2.5 border-b-[1.5px] border-[#edf2f7]">Target Patron</th>
                <th className="text-left text-[12.5px] font-bold text-[#0f172a] px-3 pb-2.5 border-b-[1.5px] border-[#edf2f7]">Matched Blacklist Record</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-[13px] font-bold text-[#334155] py-2 border-b border-[#edf2f7]">Name</td>
                <td className="text-[14.5px] font-bold text-[#0f172a] px-3 py-2 border-b border-[#edf2f7]">{scenario?.member?.fullName || 'JOHN PATRON'}</td>
                <td className="text-[14.5px] font-bold text-[#e53e3e] px-3 py-2 border-b border-[#edf2f7]">JOHN PATRON</td>
              </tr>
              <tr>
                <td className="text-[13px] font-bold text-[#334155] py-2 border-b border-[#edf2f7]">DOB</td>
                <td className="text-[14.5px] font-bold text-[#0f172a] px-3 py-2 border-b border-[#edf2f7]">15/08/1980</td>
                <td className="text-[14.5px] font-bold text-[#0f172a] px-3 py-2 border-b border-[#edf2f7]">15/08/1980</td>
              </tr>
              <tr>
                <td className="text-[13px] font-bold text-[#334155] py-2 border-b border-[#edf2f7]">Record Ref</td>
                <td className="text-[14.5px] font-bold text-[#0f172a] px-3 py-2 border-b border-[#edf2f7]">IDV Session #586</td>
                <td className="text-[14.5px] font-bold text-[#0f172a] px-3 py-2 border-b border-[#edf2f7]">Ref #BL-0041 · Severity: High</td>
              </tr>
              <tr>
                <td className="text-[13px] font-bold text-[#334155] py-2 border-b-0">Reason Category</td>
                <td className="text-[14.5px] font-bold text-[#0f172a] px-3 py-2 border-b-0">—</td>
                <td className="text-[14.5px] font-bold text-[#0f172a] px-3 py-2 border-b-0">Self-exclusion order #8841 (Added: 12 Jan 2026)</td>
              </tr>
            </tbody>
          </table>

          {/* Exclusion Context Note (Clean unboxed paragraph without card background) */}
          <p className="text-[14px] text-[#475569] leading-relaxed m-0 font-sans">
            This patron matches an active exclusion order registered for <strong className="text-[#0f172a]">Riverside RSL Club</strong>. Supervisor determination is required prior to releasing payment.
          </p>

          {/* Resolution Status Selector */}
          <div className="flex flex-col gap-1.5 mt-1">
            <label className="text-[14px] font-bold tracking-[0.06em] text-[#0f172a]">
              Resolution status <span className="text-[#e53e3e]">*</span>
            </label>
            <div className="flex w-full mt-1.5">
              {blacklistResolutionOptions.map(({ key, label, variant }, idx) => {
                const sel = resolution === key;
                let selClass = '';
                if (sel) {
                  if (variant === 'pass') selClass = 'border-[#059669] bg-[#ecfdf5] text-[#059669] z-10 font-bold';
                  if (variant === 'warn') selClass = 'border-[#b45309] bg-[#fffbeb] text-[#b45309] z-10 font-bold';
                  if (variant === 'fail') selClass = 'border-[#e53e3e] bg-[#fff5f5] text-[#e53e3e] z-10 font-bold';
                } else {
                  selClass = 'border-[#dde1ea] bg-white text-[#0f172a] hover:bg-[#f8fafc] font-bold';
                }
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setResolution(key)}
                    className={`flex-1 flex items-center justify-center h-11 px-4 border text-[15px] font-sans cursor-pointer transition-all duration-180 relative
                      ${idx === 0 ? 'rounded-l-[8px]' : ''}
                      ${idx === blacklistResolutionOptions.length - 1 ? 'rounded-r-[8px]' : ''}
                      ${idx > 0 ? '-ml-px' : ''}
                      ${selClass}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Dynamic Override Compliance Notice */}
            {resolution === 'override' && (
              <p className="text-[13.5px] text-[#b45309] font-medium leading-normal m-0 pt-1.5 font-sans">
                <strong>Mandatory compliance requirement:</strong> Overriding an active exclusion requires comprehensive written investigation notes and supporting evidence documentation for statutory AUSTRAC audit records.
              </p>
            )}
          </div>

          {/* Investigation Notes */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="blacklistNotes" className="text-[14px] font-bold tracking-[0.06em] text-[#0f172a]">
              Investigation notes {resolution === 'override' && <span className="text-[#b45309] font-semibold">(Mandatory for override)</span>} <span className="text-[#e53e3e]">*</span>
            </label>
            <textarea
              id="blacklistNotes"
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={resolution === 'override' ? 'Enter mandatory audit rationale and statutory justification for overriding this exclusion...' : 'Enter audit rationale and compliance justification for this blacklist match...'}
              className="w-full min-h-[60px] p-3 rounded-[6px] border-[1.5px] border-[#e2e8f0] bg-white text-[15.5px] text-[#0f172a] font-sans outline-none focus:border-[#0f172a] resize-vertical leading-[1.5]"
            />
          </div>

          {/* Supporting Document */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-bold tracking-[0.06em] text-[#0f172a]">
              Supporting evidence {resolution === 'override' && <span className="text-[#b45309] font-semibold">(Mandatory for override) *</span>}
            </label>
            <div
              onClick={() => setHasFile(p => !p)}
              className={`border border-dashed rounded-[6px] bg-white p-3 flex items-center gap-3 cursor-pointer transition-colors ${hasFile ? 'border-[#059669] bg-[#ecfdf5]/40' : 'border-[#cbd5e1] hover:bg-slate-50'}`}
            >
              <div className="w-8 h-8 rounded-[6px] bg-slate-100 flex items-center justify-center text-[#0f172a] flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 16V4M12 4l-4 4M12 4l4 4" /><path d="M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3" /></svg>
              </div>
              <div>
                <div className="text-[14.5px] font-bold text-[#0f172a]">{hasFile ? 'Blacklist_verification_evidence.pdf (Uploaded)' : 'Click to upload supporting evidence'}</div>
                <div className="text-[13px] text-[#475569]">PDF, JPG, PNG up to 10MB</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer (No Add to Venue Blacklist button) */}
        <div className="flex items-center justify-end gap-2.5 px-[22px] py-3.5 border-t border-[#edf2f7] bg-white flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-[42px] px-4 rounded-[6px] border border-[#e2e8f0] bg-white text-[#1a202c] hover:bg-[#f4f4f4] text-[15px] font-bold cursor-pointer font-sans"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSaveDisabled}
            onClick={() => onSave({ resolution, notes, hasFile })}
            className={`h-10 px-[22px] rounded-[6px] text-[16px] font-bold border-none transition-all font-sans
              ${isSaveDisabled
                ? 'bg-[#0d9488] opacity-40 cursor-not-allowed text-white'
                : 'bg-[#0d9488] text-white cursor-pointer hover:bg-[#0b7a6f]'}`}
          >
            Save resolution
          </button>
        </div>
      </div>
    </div>
  );
}

/* 6. Add Patron to Venue Blacklist Modal (Approver) */
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

/* 7. Docket Lightbox Modal */
function DocketModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[2000] bg-[#12132b]/55 backdrop-blur-md flex items-center justify-center p-6" onClick={onClose}>
      <div className="bg-white rounded-[16px] shadow-2xl max-w-[520px] w-full overflow-hidden flex flex-col max-h-[calc(100vh-48px)]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0] flex-shrink-0">
          <div className="text-[17px] font-bold text-[#0f172a]">Submitted Docket</div>
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

/* 7. Cancel Confirmation Modal */
function CancelModal({ open, onClose, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[2000] bg-[#12132b]/55 backdrop-blur-md flex items-center justify-center p-6" onClick={onClose}>
      <div className="bg-white rounded-[16px] shadow-2xl max-w-[440px] w-full overflow-hidden flex flex-col p-6" onClick={e => e.stopPropagation()}>
        <div className="text-[19px] font-bold text-[#0f172a] mb-2 font-sans">Cancel review?</div>
        <p className="text-[14.5px] text-[#475569] leading-relaxed mb-6 font-sans">
          Are you sure you want to cancel review for this payout? The transaction will be returned to the pending queue.
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-[6px] border border-[#e2e8f0] bg-white text-[#1a202c] hover:bg-[#f4f4f4] text-[14.5px] font-bold cursor-pointer font-sans"
          >
            No, continue review
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-10 px-4 rounded-[6px] bg-[#ef4444] text-white hover:bg-[#dc2626] text-[14.5px] font-bold cursor-pointer border-none font-sans"
          >
            Yes, cancel review
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Approver Page Component ─── */
export default function ApproverScenarioPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const scenarioKey = (params?.scenario || 'dual-hit');
  const scenario = SCENARIOS[scenarioKey] || SCENARIOS['dual-hit'];

  // The scenario body is still canned data, but when a dashboard row sent us
  // here its status is the one thing we can report truthfully. Without this the
  // pill prints the scenario's hardcoded 'Awaiting approval' for every record.
  const payoutId = searchParams.get('payout');
  const payoutRecord = payoutId
    ? initialPayouts.find((p) => p.id === payoutId)
    : null;
  const statusPill = payoutRecord?.status || scenario.statusPill;

  // The scenario may carry its own venue policy so a preset can demonstrate
  // Fixed vs Auto routing; without one the engine's defaults apply.
  const computedRisk = useMemo(
    () => computeRisk(scenario.riskSignals || {}, scenario.riskConfig || {}),
    [scenario]
  );

  // A scenario carrying a firstApproval is being viewed by the second
  // approver: the first sign-off is already on the record.
  const firstApproval = scenario.firstApproval || null;
  const isSecondApprover = Boolean(firstApproval);
  const [risk, setRisk] = useState(computedRisk.rating);
  const [notes, setNotes] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const isOverridden = Boolean(risk && risk !== computedRisk.rating);

  // A live self-exclusion is the one thing an Approver cannot clear. Everything
  // else on the register is information they weigh up and may proceed past,
  // provided they write down why.
  const exclusion = scenario.exclusion || null;
  const isSelfExclusionBlock = exclusion?.type === EXCLUSION_TYPES.SELF;
  const exclusionNeedsNote = Boolean(exclusion) && !isSelfExclusionBlock;
  const [isRiskCalculationExpanded, setIsRiskCalculationExpanded] = useState(false);

  // Managed controlled accordion states
  const [openSections, setOpenSections] = useState({
    payout: false,
    member: false,
    bank: false,
    name: false,
    verification: false,
    history: false,
    collector: false,
    firstApproval: false,
  });

  // First approval only exists on a second approver's screen, so it is left
  // out of the "all expanded" check elsewhere - otherwise Expand all could
  // never read as complete on a payout that doesn't have that section.
  const isAllExpanded = Object.entries(openSections)
    .filter(([key]) => key !== 'firstApproval' || isSecondApprover)
    .every(([, open]) => open);

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
      firstApproval: next,
    });
  };

  const toggleSection = (key) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Dynamic resolutions & saved form data
  const [pepResolved, setPepResolved] = useState(false);
  const [pepData, setPepData] = useState({ resolution: null, notes: '', hasFile: false });
  const [sancResolved, setSancResolved] = useState(false);
  const [sancData, setSancData] = useState({ resolution: null, notes: '', hasFile: false });
  const [blacklistResolved, setBlacklistResolved] = useState(false);
  const [blacklistData, setBlacklistData] = useState({ resolution: null, notes: '', hasFile: false });
  const [idConfirm, setIdConfirm] = useState(false);

  React.useEffect(() => {
    setPepResolved(false);
    setSancResolved(false);
    setBlacklistResolved(false);
    setPepData({ resolution: null, notes: '', hasFile: false });
    setSancData({ resolution: null, notes: '', hasFile: false });
    setBlacklistData({ resolution: null, notes: '', hasFile: false });
    setIdConfirm(false);
    setApprovalStatus(null);
    setConfirmed(false);
    setNotes('');
    setRisk(computedRisk.rating);
    setIsRiskCalculationExpanded(false);
  }, [scenarioKey, computedRisk.rating]);

  // Modals
  const [pepModalOpen, setPepModalOpen] = useState(false);
  const [sancModalOpen, setSancModalOpen] = useState(false);
  const [blacklistModalOpen, setBlacklistModalOpen] = useState(false);
  const [addBlacklistModalOpen, setAddBlacklistModalOpen] = useState(false);
  const [addBlacklistContext, setAddBlacklistContext] = useState('pep');
  const [blacklistToast, setBlacklistToast] = useState(null);
  const [docketModalOpen, setDocketModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const [approvalStatus, setApprovalStatus] = useState(null); // 'approved' | 'rejected' | 'cancelled' | null

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

  const handleSavePep = (data) => {
    setPepData(data);
    setPepResolved(true);
    setPepModalOpen(false);
  };

  const handleSaveSanc = (data) => {
    setSancData(data);
    setSancResolved(true);
    setSancModalOpen(false);
  };

  const handleSaveBlacklist = (data) => {
    setBlacklistData(data);
    setBlacklistResolved(true);
    setBlacklistModalOpen(false);
  };

  const handleRefer = () => {
    setApprovalStatus('referred');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApprove = () => {
    if (!confirmed) return;
    setApprovalStatus('approved');
  };
  return (
    <>
      <PepModal open={pepModalOpen} onClose={() => setPepModalOpen(false)} onSave={handleSavePep} savedData={pepData} showAddBlacklist={scenarioKey !== 'blacklist-match'} onOpenAddBlacklist={handleOpenAddBlacklist} />
      <SancModal open={sancModalOpen} onClose={() => setSancModalOpen(false)} onSave={handleSaveSanc} savedData={sancData} showAddBlacklist={scenarioKey !== 'blacklist-match'} onOpenAddBlacklist={handleOpenAddBlacklist} />
      <BlacklistModal open={blacklistModalOpen} onClose={() => setBlacklistModalOpen(false)} onSave={handleSaveBlacklist} savedData={blacklistData} scenario={scenario} />
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
          setApprovalStatus('cancelled');
        }}
      />

      <div className="bg-[#f7fafc] min-h-screen text-[#0f172a] font-sans antialiased">
        <div className="max-w-[840px] mx-auto px-6 pt-6 pb-20">

          {/* Scenario Switcher Bar */}
          <div className="flex items-center justify-between gap-3 bg-white border border-[#e2e8f0] rounded-[6px] px-2 py-1.5 mb-7 flex-wrap">
            <span className="text-[13.5px] font-bold uppercase tracking-[0.08em] text-[#0f172a] pl-3">
              Scenario presets
            </span>
            <div className="flex gap-1 flex-wrap">
              {Object.entries(SCENARIOS).map(([key, sc]) => (
                <Link
                  key={key}
                  href={`/approver/${key}`}
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
          {approvalStatus === 'approved' && (
            <div className="mb-6 bg-[#ecfdf5] border border-[#6ee7b7] rounded-lg p-4 text-[#065f46] font-bold flex items-center justify-between">
              <span>
                {computedRisk.requiresSecondApprover && !isSecondApprover
                  ? `✓ Payout ${scenario.payoutNum} approved — 1 of 2 sign-offs recorded. Waiting on a second approver before it reaches the Authoriser.`
                  : `✓ Payout ${scenario.payoutNum} successfully approved. Forwarded to Authoriser queue.`}
              </span>
              <button type="button" onClick={() => setApprovalStatus(null)} className="text-[#065f46] hover:underline cursor-pointer bg-transparent border-none font-bold">Dismiss</button>
            </div>
          )}
          {approvalStatus === 'referred' && (
            <div className="mb-6 bg-[#fffbeb] border border-[#fcd34d] rounded-lg p-4 text-[#0f172a] font-bold flex items-center justify-between">
              <span>
                Payout {scenario.payoutNum} referred to the Authoriser queue. The funds stay held
                until the self-exclusion ends unless an Authoriser releases them.
              </span>
              <button type="button" onClick={() => setApprovalStatus(null)} className="text-[#0f172a] hover:underline cursor-pointer bg-transparent border-none font-bold">Dismiss</button>
            </div>
          )}
          {approvalStatus === 'cancelled' && (
            <div className="mb-6 bg-[#fef2f2] border border-[#fca5a5] rounded-lg p-4 text-[#991b1b] font-bold flex items-center justify-between">
              <span>✕ Review for Payout {scenario.payoutNum} cancelled and returned to queue.</span>
              <button type="button" onClick={() => setApprovalStatus(null)} className="text-[#991b1b] hover:underline cursor-pointer bg-transparent border-none font-bold">Dismiss</button>
            </div>
          )}

          {/* Header */}
          <header className="flex items-start justify-between gap-4 mb-8 flex-wrap">
            <div className="flex flex-col gap-1.5">
              <span className="inline-flex items-center text-[10.5px] font-bold uppercase tracking-wider text-[#1d4ed8] bg-[#eff6ff] border border-[#bfdbfe] rounded-md px-2 py-0.5 w-fit shadow-2xs">
                Approval review
              </span>
              <h1 className="text-[34px] font-bold text-[#0f172a] tracking-[-0.02em] leading-tight m-0">
                Payout {scenario.payoutNum}
              </h1>
              <p className="text-[15.5px] text-[#334155] font-medium m-0">{scenario.dateTime}</p>
            </div>
            <StatusPill>{statusPill}</StatusPill>
          </header>

          {/* Approval routing - only shown when this payout needs more than
              one approver, so the reason is never left to guesswork */}
          {computedRisk.requiresSecondApprover && (
            <div className="mb-5 bg-white border-l-[3px] border-l-[#1d4ed8] border border-[#e2e8f0] rounded-[8px] px-4 py-3.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[13px] font-bold text-[#0f172a]">
                  {computedRisk.recommendedApprovers} approver sign-offs required
                </span>
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]">
                  {isSecondApprover ? 'You are approver 2 of 2' : 'You are approver 1 of 2'}
                </span>
              </div>
              <p className="text-[13px] text-[#475569] m-0 mt-1">{computedRisk.routingReason}</p>
            </div>
          )}

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

              {/* 1. Payout details (2-col Grid matching deploy .detail-g.no-sep) */}
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
                  {/* Self-reported at ID capture. Shown on every payout rather
                      than gated on a High rating: risk is chosen at the bottom
                      of this page, so a row that appeared afterwards would sit
                      above where the approver is working and never be read. */}
                  <div className="p-[11px_14px] flex flex-col gap-[3px]">
                    <span className="text-[14.5px] font-bold text-[#475569]">Occupation</span>
                    <span
                      className={`text-[16px] font-medium ${
                        scenario.member.occupation ? 'text-[#0f172a]' : 'text-[#94a3b8] italic'
                      }`}
                    >
                      {formatOccupation(scenario.member.occupation)}
                    </span>
                  </div>
                </div>

                {/* Notice when member was prefilled via Max Gaming */}
                {scenario.member?.source === 'max-gaming' && (
                  <div className="px-[14px] py-2.5 border-t border-[#f1f5f9] text-[13.5px] text-[#475569]">
                    Member details prefilled from Max Gaming club database.
                  </div>
                )}

                {/* Two-way write-back audit indicator (Rendered only when DVS write-back occurred) */}
                {scenario.member?.writeBackStatus === 'updated' && (
                  <div className="flex items-center justify-between p-[11px_14px] border-t border-[#f1f5f9] mt-1 bg-[#fafbfc]/50">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[13px] font-bold text-[#475569]">Club database write-back</span>
                      <span className="text-[12px] text-[#64748b]">DVS verified identity push status</span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11.5px] font-bold bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
                      <Check className="w-3 h-3" /> Member record updated
                    </span>
                  </div>
                )}
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
              </AccordionItem>

              {/* 4. Name verification */}
              <AccordionItem
                isOpen={openSections.name}
                onToggle={() => toggleSection('name')}
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[15px] h-[15px]"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><polyline points="17 11 19 13 23 9" /></svg>}
                title="Name verification"
              >
                <div className="flex flex-col gap-1 p-[4px_14px] my-1">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="m-0 text-[17.5px] font-bold text-[#0f172a] tracking-[-0.01em]">Name comparison</h4>
                    <Pill variant={scenario.nameVerification.isMatch ? 'pass' : 'warn'}>
                      {scenario.nameVerification.isMatch ? 'Match' : 'Mismatch'}
                    </Pill>
                  </div>
                  <div className="flex flex-col gap-4 mb-2">
                    <div className="flex items-center justify-start gap-8">
                      <span className="text-[12.5px] font-bold text-[#64748b] tracking-[0.05em] w-[220px] flex-shrink-0">Name on ID document</span>
                      <span className="text-[15.5px] font-bold text-[#0f172a]">{scenario.nameVerification.idName}</span>
                    </div>
                    <div className="flex items-center justify-start gap-8">
                      <span className="text-[12.5px] font-bold text-[#64748b] tracking-[0.05em] w-[220px] flex-shrink-0">Provided bank account name</span>
                      <span className={`text-[15.5px] font-bold ${scenario.nameVerification.isMatch ? 'text-[#0f172a]' : 'text-[#b45309]'}`}>
                        {scenario.nameVerification.bankName}
                      </span>
                    </div>
                  </div>

                  {!scenario.nameVerification.isMatch && (
                    <label className="flex items-start gap-3 mt-3 pt-3.5 border-t border-[#edf2f7] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        id="idConfirm"
                        checked={idConfirm}
                        onChange={e => setIdConfirm(e.target.checked)}
                        className="w-4 h-4 accent-black cursor-pointer mt-0.5 flex-shrink-0"
                      />
                      <span className="text-[14.5px] text-[#0f172a] leading-normal font-sans">
                        I confirm I have verified the third-party bank account authorization document for this payout.
                      </span>
                    </label>
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
                  {scenario.amlRows.map((row, i) => {
                    const isResolved = (row.id === 'pep' && pepResolved) || (row.id === 'sanctions' && sancResolved) || (row.id === 'blacklist' && blacklistResolved);
                    return (
                      <div
                        key={i}
                        className="w-full flex items-center justify-between gap-3 p-[11px_14px] hover:bg-[#f8fafc] text-left transition-colors font-sans"
                      >
                        <div className="text-[16px] font-bold text-[#0f172a]">{row.label}</div>
                        <div className="flex items-center gap-2">
                          {isResolved ? (
                            <ActionButton variant="pass" onClick={() => handleOpenModal(row.id)}>Resolved</ActionButton>
                          ) : row.action === 'pill' ? (
                            <Pill variant={row.badgeType}>{row.badgeText}</Pill>
                          ) : row.action === 'btn-fail' ? (
                            <ActionButton variant="fail" onClick={() => handleOpenModal(row.id)}>{row.badgeText}</ActionButton>
                          ) : (
                            <ActionButton variant="warn" onClick={() => handleOpenModal(row.id)}>{row.badgeText}</ActionButton>
                          )}
                        </div>
                      </div>
                    );
                  })}
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

              {/* 8. First approval - the second approver reviews the payout and
                  the call already made on it, so both are on the page */}
              {isSecondApprover && (
                <AccordionItem
                  isOpen={openSections.firstApproval}
                  onToggle={() => toggleSection('firstApproval')}
                  icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[15px] h-[15px]"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>}
                  title="First approval"
                >
                  <div className="divide-y divide-[#eceef2]">
                    <div className="flex items-baseline justify-between gap-4 py-2.5">
                      <span className="text-[15px] text-[#475569]">Approved by</span>
                      <span className="text-[16px] font-bold text-[#0f172a]">
                        {firstApproval.name} · {firstApproval.role}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between gap-4 py-2.5">
                      <span className="text-[15px] text-[#475569]">Approved at</span>
                      <span className="text-[15px] font-mono text-[#0f172a]">{firstApproval.timestamp}</span>
                    </div>
                    <div className="flex items-baseline justify-between gap-4 py-2.5">
                      <span className="text-[15px] text-[#475569]">Risk determination</span>
                      <span className="inline-flex items-center rounded-full px-3 py-0.5 text-[12px] font-bold bg-[#fffbeb] text-[#78350f] border border-[#fde68a]">
                        {firstApproval.determination}
                      </span>
                    </div>
                    <div className="py-2.5">
                      <span className="text-[15px] text-[#475569] block mb-1">Notes</span>
                      <p className="text-[15px] text-[#0f172a] m-0 leading-relaxed">{firstApproval.notes}</p>
                    </div>
                  </div>
                </AccordionItem>
              )}

            </div>
          </div>

          {/* Action Shell — Approval determination matching deploy .action-shell */}
          <div className="bg-white/50 border border-[#e2e8f0] rounded-[10px] p-[3px]">
            <div className="bg-white rounded-[7px] p-[28px_28px_24px]">
              <div className="text-[18px] font-bold text-[#0f172a] pb-3 border-b border-[#edf2f7] mb-4">
                Approval determination
              </div>

              {/* Executive Summary Rows (1-col grid) */}
              <div className="grid grid-cols-1 mb-6">
                {scenario.execSummary.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-[12px_14px] border-b border-[#edf2f7] last:border-b-0">
                    <span className="text-[14.5px] font-bold text-[#475569]">{item.label}</span>
                    <span className={`text-[16px] font-bold ${item.color === 'ok' ? 'text-[#059669]' : item.color === 'warn' ? 'text-[#b45309]' : item.color === 'danger' ? 'text-[#e53e3e]' : 'text-[#0f172a]'}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* AML Resolution Summary Section */}
              <div className="mt-9 mb-6">
                <div className="text-[15px] font-bold text-[#0f172a] mb-2.5 flex items-center gap-1.5">
                  AML &amp; compliance audit trail
                </div>
                <div className="grid grid-cols-1">
                  {scenario.amlAuditRows.map((row, i) => {
                    const isResolved = (row.id === 'pep' && pepResolved) || (row.id === 'sanctions' && sancResolved) || (row.id === 'blacklist' && blacklistResolved);
                    return (
                      <div key={i} className="flex items-center justify-between p-[12px_14px] border-b border-[#edf2f7] last:border-b-0">
                        <div className="flex flex-col gap-[3px] max-w-[70%]">
                          <span className="text-[14.5px] font-bold text-[#475569]">{row.label}</span>
                          <span className="text-[14px] text-[#334155] leading-normal">{row.sub}</span>
                        </div>
                        {isResolved ? (
                          <ActionButton variant="pass" onClick={() => handleOpenModal(row.id)}>Resolved</ActionButton>
                        ) : row.action === 'pill' ? (
                          <Pill variant={row.badgeType}>{row.badgeText}</Pill>
                        ) : row.action === 'btn-fail' ? (
                          <ActionButton variant="fail" onClick={() => handleOpenModal(row.id)}>{row.badgeText}</ActionButton>
                        ) : (
                          <ActionButton variant="warn" onClick={() => handleOpenModal(row.id)}>{row.badgeText}</ActionButton>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* System Risk Assessment (Computed by Risk Engine) */}
              <div className="mt-9 mb-7 pb-6 border-b border-[#edf2f7]">
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

              {/* 1. Risk Level Assessment */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[14px] font-bold tracking-[0.06em] text-[#0f172a] block m-0">
                    Determined risk level
                  </label>
                  {isOverridden && (
                    <Pill variant="warn">Manual override</Pill>
                  )}
                </div>
                <RiskSelector value={risk} onChange={setRisk} />
              </div>

              {/* 2. Approver Note / Override Justification */}
              <div className="flex flex-col gap-2.5 mb-8">
                <label htmlFor="approvalNote" className="text-[14px] font-bold tracking-[0.06em] text-[#0f172a] block">
                  {isOverridden ? (
                    <span>
                      Approver note &amp; override justification <span className="text-[#e53e3e] font-semibold">* (Required)</span>
                    </span>
                  ) : (
                    <span>Approver note (optional)</span>
                  )}
                </label>
                <textarea
                  id="approvalNote"
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder={
                    isOverridden
                      ? `Explain why you are determining ${risk} risk instead of system ${computedRisk.rating} risk for this payout...`
                      : 'Add an overall approval note or rationale for audit log...'
                  }
                  className="w-full min-h-[88px] p-[12px_16px] rounded-[6px] border-[1.5px] border-[#e2e8f0] bg-white text-[16px] text-[#0f172a] font-sans outline-none focus:border-[#0f172a] resize-vertical leading-[1.5]"
                />
              </div>

              {exclusion && (
                <div
                  className={`p-4 rounded-[8px] border mb-8 ${
                    isSelfExclusionBlock
                      ? 'bg-[#fef2f2] border-[#fca5a5]'
                      : 'bg-[#fffbeb] border-[#fcd34d]'
                  }`}
                >
                  <p
                    className={`text-[16px] font-bold m-0 ${
                      isSelfExclusionBlock ? 'text-[#991b1b]' : 'text-[#0f172a]'
                    }`}
                  >
                    {isSelfExclusionBlock
                      ? 'Funds cannot be released: gambling self-exclusion'
                      : 'Patron is on the exclusion register'}
                  </p>
                  <p className="text-[14.5px] text-[#475569] mt-1 mb-0 leading-relaxed">
                    {isSelfExclusionBlock ? (
                      <>
                        {exclusion.reason} ({exclusion.source}). This payout is held until{' '}
                        <span className="font-bold text-[#0f172a]">
                          {formatRegisterDate(exclusion.expiresAt)}
                        </span>
                        . An Approver cannot release it. Refer the payout to an Authoriser if it
                        needs to be released sooner.
                      </>
                    ) : (
                      <>
                        {exclusion.reason} ({exclusion.source}). This does not block the payment.
                        You may proceed, but record your reasoning in the notes below.
                      </>
                    )}
                  </p>
                </div>
              )}

              <label className="flex items-start gap-3.5 p-0 bg-transparent border-none mb-8 cursor-pointer hover:opacity-80 transition-opacity">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={e => setConfirmed(e.target.checked)}
                  className="w-5 h-5 accent-black cursor-pointer mt-0.5 flex-shrink-0"
                />
                <div className="flex flex-col gap-1">
                  <span className="text-[16px] text-[#0f172a] leading-[1.55] font-medium">
                    I confirm I have reviewed all details, AML results, and risk assessment, and approve this payout for authorisation.
                  </span>
                </div>
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
                  {isSelfExclusionBlock && (
                    <button
                      type="button"
                      onClick={handleRefer}
                      className="h-11 px-7 rounded-[6px] text-[17px] font-bold border-none transition-all font-sans flex items-center justify-center gap-2.5 bg-[#0f172a] hover:bg-[#1e293b] text-white cursor-pointer"
                    >
                      Refer to Authoriser
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={
                      isSelfExclusionBlock ||
                      !risk ||
                      !confirmed ||
                      (!scenario.nameVerification.isMatch && !idConfirm) ||
                      (isOverridden && !notes.trim()) ||
                      (exclusionNeedsNote && !notes.trim())
                    }
                    onClick={handleApprove}
                    className={`h-11 px-7 rounded-[6px] text-[17px] font-bold border-none transition-all font-sans flex items-center justify-center gap-2.5
                      ${!isSelfExclusionBlock && risk && confirmed && (scenario.nameVerification.isMatch || idConfirm) && (!isOverridden || notes.trim()) && (!exclusionNeedsNote || notes.trim())
                        ? 'bg-[#0d9488] hover:bg-[#0b7a6f] text-white cursor-pointer'
                        : 'bg-[#0d9488] opacity-40 cursor-not-allowed text-white'}`}
                  >
                    Approve payout
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
