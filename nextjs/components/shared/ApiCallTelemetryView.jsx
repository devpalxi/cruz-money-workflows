'use client';

import React, { useState, useMemo } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import Badge from '@/components/ui/Badge';

/* ─────────────────────────────────────────────────────────────────────────
   Real-world payout verification audit records for the venue.
   All 20 realistic edge cases: clean pass · retries · server outages · unbilled
─────────────────────────────────────────────────────────────────────────── */
const AUDIT_PAYOUT_RECORDS = [
  {
    id: 'PO-9431',
    winnerName: 'James O\'Connor',
    jackpotAmount: '$350.00',
    timestamp: '11 Aug 2026, 17:40',
    machineId: 'EGM-201 (Bull Mystery)',
    scenarioTag: 'CoP: 1 attempt (Skip IDV below $500 threshold)',
    callsSummary: 'Skip IDV · 1 CoP',
    retailCost: 1.50,
    billedRate: 1.50,
    saved: 0.00,
    calls: [
      {
        step: 1,
        type: 'Confirmation of Payee',
        document: 'Commonwealth Bank match',
        result: 'Exact match',
        resultVariant: 'pass',
        cost: 1.50,
      },
    ],
  },
  {
    id: 'PO-9432',
    winnerName: 'Sarah Jenkins',
    jackpotAmount: '$420.00',
    timestamp: '11 Aug 2026, 16:15',
    machineId: 'EGM-108 (Dragon Cash)',
    scenarioTag: 'CoP: 2 attempts (Bank account typo re-entry)',
    callsSummary: 'Skip IDV · 2 CoP',
    retailCost: 3.00,
    billedRate: 1.50,
    saved: 1.50,
    calls: [
      {
        step: 1,
        type: 'Confirmation of Payee',
        document: 'Westpac account match',
        result: 'No match',
        resultVariant: 'fail',
        cost: 1.50,
      },
      {
        step: 2,
        type: 'CoP retry check',
        document: 'Westpac account match (Corrected number)',
        result: 'Exact match',
        resultVariant: 'pass',
        cost: 1.50,
      },
    ],
  },
  {
    id: 'PO-9433',
    winnerName: 'Robert Taylor',
    jackpotAmount: '$2,100.00',
    timestamp: '11 Aug 2026, 14:05',
    machineId: 'EGM-112 (Choy Sun Doa)',
    scenarioTag: 'Primary ID Pass · PEP Clear · Secondary Skipped',
    callsSummary: '1 IDV · 2 AML · 1 CoP',
    retailCost: 15.10,
    billedRate: 12.00,
    saved: 3.10,
    calls: [
      {
        step: 1,
        type: 'Primary ID check',
        document: 'NSW Driver Licence',
        result: 'Verified',
        resultVariant: 'pass',
        cost: 12.00,
      },
      {
        step: 2,
        type: 'PEP screening',
        document: 'Politically Exposed Persons database',
        result: 'Clear',
        resultVariant: 'pass',
        cost: 0.80,
      },
      {
        step: 3,
        type: 'Sanctions screening',
        document: 'OFAC / UN sanctions lists',
        result: 'Clear',
        resultVariant: 'pass',
        cost: 0.80,
      },
      {
        step: 4,
        type: 'Confirmation of Payee',
        document: 'Westpac account match',
        result: 'Exact match',
        resultVariant: 'pass',
        cost: 1.50,
      },
    ],
  },
  {
    id: 'PO-9434',
    winnerName: 'Liam Chen',
    jackpotAmount: '$4,500.00',
    timestamp: '11 Aug 2026, 12:42',
    machineId: 'EGM-104 (Dragon Link)',
    scenarioTag: 'Primary ID Pass · PEP Action required · Secondary Skipped',
    callsSummary: '1 IDV · 2 AML · 1 CoP',
    retailCost: 15.10,
    billedRate: 12.00,
    saved: 3.10,
    calls: [
      {
        step: 1,
        type: 'Primary ID check',
        document: 'NSW Driver Licence',
        result: 'Verified',
        resultVariant: 'pass',
        cost: 12.00,
      },
      {
        step: 2,
        type: 'PEP screening',
        document: 'Politically Exposed Persons database',
        result: 'Action required',
        resultVariant: 'warn',
        cost: 0.80,
      },
      {
        step: 3,
        type: 'Sanctions screening',
        document: 'OFAC / UN sanctions lists',
        result: 'Clear',
        resultVariant: 'pass',
        cost: 0.80,
      },
      {
        step: 4,
        type: 'Confirmation of Payee',
        document: 'CBA account match',
        result: 'Exact match',
        resultVariant: 'pass',
        cost: 1.50,
      },
    ],
  },
  {
    id: 'PO-9435',
    winnerName: 'Sophie Martin',
    jackpotAmount: '$5,000.00',
    timestamp: '10 Aug 2026, 21:18',
    machineId: 'EGM-109 (Dollar Storm)',
    scenarioTag: 'Primary ID Pass · PEP Clear · Secondary Pass',
    callsSummary: '2 IDV · 2 AML · 2 CoP',
    retailCost: 19.60,
    billedRate: 12.00,
    saved: 7.60,
    calls: [
      {
        step: 1,
        type: 'Primary ID check',
        document: 'QLD Driver Licence',
        result: 'Verified',
        resultVariant: 'pass',
        cost: 12.00,
      },
      {
        step: 2,
        type: 'Secondary new ID check',
        document: 'Australian Passport',
        result: 'Verified',
        resultVariant: 'pass',
        cost: 3.00,
      },
      {
        step: 3,
        type: 'PEP screening',
        document: 'Politically Exposed Persons database',
        result: 'Clear',
        resultVariant: 'pass',
        cost: 0.80,
      },
      {
        step: 4,
        type: 'Sanctions screening',
        document: 'OFAC / UN sanctions lists',
        result: 'Clear',
        resultVariant: 'pass',
        cost: 0.80,
      },
      {
        step: 5,
        type: 'Confirmation of Payee',
        document: 'Macquarie account match',
        result: 'Name mismatch',
        resultVariant: 'fail',
        cost: 1.50,
      },
      {
        step: 6,
        type: 'CoP retry check',
        document: 'Macquarie account match (Personal account)',
        result: 'Exact match',
        resultVariant: 'pass',
        cost: 1.50,
      },
    ],
  },
  {
    id: 'PO-9436',
    winnerName: 'Mei-Ling Zhang',
    jackpotAmount: '$8,200.00',
    timestamp: '10 Aug 2026, 11:15',
    machineId: 'EGM-208 (Lightning Cash)',
    scenarioTag: 'Primary ID Pass · PEP Action required · Secondary Pass',
    callsSummary: '2 IDV · 2 AML · 1 CoP',
    retailCost: 18.10,
    billedRate: 12.00,
    saved: 6.10,
    calls: [
      {
        step: 1,
        type: 'Primary ID check',
        document: 'VIC Driver Licence',
        result: 'Verified',
        resultVariant: 'pass',
        cost: 12.00,
      },
      {
        step: 2,
        type: 'Secondary new ID check',
        document: 'Australian Passport',
        result: 'Verified',
        resultVariant: 'pass',
        cost: 3.00,
      },
      {
        step: 3,
        type: 'PEP screening',
        document: 'Politically Exposed Persons database',
        result: 'Action required',
        resultVariant: 'warn',
        cost: 0.80,
      },
      {
        step: 4,
        type: 'Sanctions screening',
        document: 'OFAC / UN sanctions lists',
        result: 'Clear',
        resultVariant: 'pass',
        cost: 0.80,
      },
      {
        step: 5,
        type: 'Confirmation of Payee',
        document: 'ANZ account match',
        result: 'Exact match',
        resultVariant: 'pass',
        cost: 1.50,
      },
    ],
  },
  {
    id: 'PO-9437',
    winnerName: 'Elena Rostova',
    jackpotAmount: '$3,400.00',
    timestamp: '10 Aug 2026, 10:20',
    machineId: 'EGM-115 (Grand Star)',
    scenarioTag: 'Primary ID Pass · PEP Clear · Secondary Fail',
    callsSummary: '2 IDV · 2 AML · 1 CoP',
    retailCost: 18.10,
    billedRate: 12.00,
    saved: 6.10,
    calls: [
      { step: 1, type: 'Primary ID check', document: 'NSW Driver Licence', result: 'Verified', resultVariant: 'pass', cost: 12.00 },
      { step: 2, type: 'Secondary new ID check', document: 'Medicare Card', result: 'Unmatched', resultVariant: 'fail', cost: 3.00 },
      { step: 3, type: 'PEP screening', document: 'Politically Exposed Persons database', result: 'Clear', resultVariant: 'pass', cost: 0.80 },
      { step: 4, type: 'Sanctions screening', document: 'OFAC / UN sanctions lists', result: 'Clear', resultVariant: 'pass', cost: 0.80 },
      { step: 5, type: 'Confirmation of Payee', document: 'NAB account match', result: 'Exact match', resultVariant: 'pass', cost: 1.50 },
    ],
  },
  {
    id: 'PO-9438',
    winnerName: 'Marcus Vance',
    jackpotAmount: '$6,100.00',
    timestamp: '09 Aug 2026, 22:50',
    machineId: 'EGM-203 (Cash Express)',
    scenarioTag: 'Primary ID Pass · PEP Action required · Secondary Fail',
    callsSummary: '2 IDV · 2 AML · 1 CoP',
    retailCost: 18.10,
    billedRate: 12.00,
    saved: 6.10,
    calls: [
      { step: 1, type: 'Primary ID check', document: 'NSW Driver Licence', result: 'Verified', resultVariant: 'pass', cost: 12.00 },
      { step: 2, type: 'Secondary new ID check', document: 'Medicare Card', result: 'Unmatched', resultVariant: 'fail', cost: 3.00 },
      { step: 3, type: 'PEP screening', document: 'Politically Exposed Persons database', result: 'Action required', resultVariant: 'warn', cost: 0.80 },
      { step: 4, type: 'Sanctions screening', document: 'OFAC / UN sanctions lists', result: 'Clear', resultVariant: 'pass', cost: 0.80 },
      { step: 5, type: 'Confirmation of Payee', document: 'Bendigo Bank match', result: 'Exact match', resultVariant: 'pass', cost: 1.50 },
    ],
  },
  {
    id: 'PO-9439',
    winnerName: 'Chloe Bennett',
    jackpotAmount: '$1,800.00',
    timestamp: '09 Aug 2026, 19:35',
    machineId: 'EGM-105 (More Chilli)',
    scenarioTag: 'Primary ID Pass · PEP Clear · Secondary Server unavailable',
    callsSummary: '1 IDV · 2 AML (1 unbilled outage)',
    retailCost: 15.10,
    billedRate: 12.00,
    saved: 3.10,
    calls: [
      { step: 1, type: 'Primary ID check', document: 'NSW Driver Licence', result: 'Verified', resultVariant: 'pass', cost: 12.00 },
      { step: 2, type: 'Secondary new ID check', document: 'Medicare Card', result: 'Server unavailable (Unbilled)', resultVariant: 'fail', cost: 0 },
      { step: 3, type: 'PEP screening', document: 'Politically Exposed Persons database', result: 'Clear', resultVariant: 'pass', cost: 0.80 },
      { step: 4, type: 'Sanctions screening', document: 'OFAC / UN sanctions lists', result: 'Clear', resultVariant: 'pass', cost: 0.80 },
      { step: 5, type: 'Confirmation of Payee', document: 'Commonwealth Bank match', result: 'Exact match', resultVariant: 'pass', cost: 1.50 },
    ],
  },
  {
    id: 'PO-9440',
    winnerName: 'David Kim',
    jackpotAmount: '$7,500.00',
    timestamp: '09 Aug 2026, 16:10',
    machineId: 'EGM-114 (Buffalo Gold)',
    scenarioTag: 'Primary ID Pass · PEP Action required · Secondary Server unavailable',
    callsSummary: '1 IDV · 2 AML (1 unbilled outage)',
    retailCost: 15.10,
    billedRate: 12.00,
    saved: 3.10,
    calls: [
      { step: 1, type: 'Primary ID check', document: 'Australian Passport', result: 'Verified', resultVariant: 'pass', cost: 12.00 },
      { step: 2, type: 'Secondary new ID check', document: 'Medicare Card', result: 'Server unavailable (Unbilled)', resultVariant: 'fail', cost: 0 },
      { step: 3, type: 'PEP screening', document: 'Politically Exposed Persons database', result: 'Action required', resultVariant: 'warn', cost: 0.80 },
      { step: 4, type: 'Sanctions screening', document: 'OFAC / UN sanctions lists', result: 'Clear', resultVariant: 'pass', cost: 0.80 },
      { step: 5, type: 'Confirmation of Payee', document: 'St George Bank match', result: 'Exact match', resultVariant: 'pass', cost: 1.50 },
    ],
  },
  {
    id: 'PO-9441',
    winnerName: 'Priya Sharma',
    jackpotAmount: '$2,850.00',
    timestamp: '09 Aug 2026, 14:02',
    machineId: 'EGM-210 (Golden Century)',
    scenarioTag: 'Primary ID Fail · Secondary Skipped · No AML',
    callsSummary: '1 IDV · 0 AML',
    retailCost: 12.00,
    billedRate: 12.00,
    saved: 0.00,
    calls: [
      { step: 1, type: 'Primary ID check', document: 'NSW Driver Licence', result: 'Unmatched', resultVariant: 'fail', cost: 12.00 },
      { step: 2, type: 'Secondary IDV', document: 'Secondary ID — Skipped', result: 'Skipped', resultVariant: 'neutral', cost: 0 },
      { step: 3, type: 'AML screening', document: 'Screening skipped — no verified ID', result: 'Skipped', resultVariant: 'neutral', cost: 0 },
    ],
  },
  {
    id: 'PO-9442',
    winnerName: 'Lucas Wright',
    jackpotAmount: '$4,200.00',
    timestamp: '08 Aug 2026, 20:45',
    machineId: 'EGM-107 (Where\'s the Gold)',
    scenarioTag: 'Primary ID Fail · Secondary Pass · PEP Clear',
    callsSummary: '2 IDV · 2 AML · 1 CoP',
    retailCost: 18.10,
    billedRate: 12.00,
    saved: 6.10,
    calls: [
      { step: 1, type: 'Primary ID check', document: 'NSW Driver Licence', result: 'Unmatched', resultVariant: 'fail', cost: 12.00 },
      { step: 2, type: 'Secondary new ID check', document: 'Australian Passport', result: 'Verified', resultVariant: 'pass', cost: 3.00 },
      { step: 3, type: 'PEP screening', document: 'Politically Exposed Persons database', result: 'Clear', resultVariant: 'pass', cost: 0.80 },
      { step: 4, type: 'Sanctions screening', document: 'OFAC / UN sanctions lists', result: 'Clear', resultVariant: 'pass', cost: 0.80 },
      { step: 5, type: 'Confirmation of Payee', document: 'Westpac account match', result: 'Exact match', resultVariant: 'pass', cost: 1.50 },
    ],
  },
  {
    id: 'PO-9443',
    winnerName: 'Nathan Cooper',
    jackpotAmount: '$1,250.00',
    timestamp: '08 Aug 2026, 18:22',
    machineId: 'EGM-102 (Queen of the Nile)',
    scenarioTag: 'Primary ID Fail · Secondary Fail · No AML',
    callsSummary: '2 IDV · 0 AML',
    retailCost: 15.00,
    billedRate: 12.00,
    saved: 3.00,
    calls: [
      { step: 1, type: 'Primary ID check', document: 'NSW Driver Licence', result: 'Unmatched', resultVariant: 'fail', cost: 12.00 },
      { step: 2, type: 'Secondary new ID check', document: 'Australian Passport', result: 'Unmatched', resultVariant: 'fail', cost: 3.00 },
      { step: 3, type: 'AML screening', document: 'Screening skipped — no verified ID', result: 'Skipped', resultVariant: 'neutral', cost: 0 },
    ],
  },
  {
    id: 'PO-9444',
    winnerName: 'Hannah Walsh',
    jackpotAmount: '$3,900.00',
    timestamp: '08 Aug 2026, 15:50',
    machineId: 'EGM-204 (Big Red)',
    scenarioTag: 'Primary ID Fail · Secondary Server unavailable · No AML',
    callsSummary: '1 IDV · 0 AML (1 unbilled outage)',
    retailCost: 12.00,
    billedRate: 12.00,
    saved: 0.00,
    calls: [
      { step: 1, type: 'Primary ID check', document: 'NSW Driver Licence', result: 'Unmatched', resultVariant: 'fail', cost: 12.00 },
      { step: 2, type: 'Secondary new ID check', document: 'Australian Passport', result: 'Server unavailable (Unbilled)', resultVariant: 'fail', cost: 0 },
      { step: 3, type: 'AML screening', document: 'Screening skipped — no verified ID', result: 'Skipped', resultVariant: 'neutral', cost: 0 },
    ],
  },
  {
    id: 'PO-9445',
    winnerName: 'Anthony Bell',
    jackpotAmount: '$5,500.00',
    timestamp: '07 Aug 2026, 21:15',
    machineId: 'EGM-209 (Wild Panda)',
    scenarioTag: 'Primary Server unavailable · Secondary Skipped',
    callsSummary: 'Server unavailable (Unbilled)',
    retailCost: 0,
    billedRate: 0,
    saved: 0,
    calls: [
      { step: 1, type: 'Primary ID check', document: 'NSW Driver Licence', result: 'Server unavailable (Unbilled)', resultVariant: 'fail', cost: 0 },
      { step: 2, type: 'Secondary IDV', document: 'Secondary ID — Skipped', result: 'Skipped', resultVariant: 'neutral', cost: 0 },
      { step: 3, type: 'AML screening', document: 'Screening skipped — server error on primary', result: 'Skipped', resultVariant: 'neutral', cost: 0 },
    ],
  },
  {
    id: 'PO-9446',
    winnerName: 'Jessica Nguyen',
    jackpotAmount: '$6,800.00',
    timestamp: '07 Aug 2026, 17:30',
    machineId: 'EGM-111 (5 Dragons)',
    scenarioTag: 'Primary Server unavailable · Secondary Pass · PEP Clear',
    callsSummary: '1 IDV · 2 AML (1 unbilled outage)',
    retailCost: 4.60,
    billedRate: 4.60,
    saved: 0.00,
    calls: [
      { step: 1, type: 'Primary ID check', document: 'NSW Driver Licence', result: 'Server unavailable (Unbilled)', resultVariant: 'fail', cost: 0 },
      { step: 2, type: 'Secondary new ID check', document: 'Australian Passport', result: 'Verified', resultVariant: 'pass', cost: 3.00 },
      { step: 3, type: 'PEP screening', document: 'Politically Exposed Persons database', result: 'Clear', resultVariant: 'pass', cost: 0.80 },
      { step: 4, type: 'Sanctions screening', document: 'OFAC / UN sanctions lists', result: 'Clear', resultVariant: 'pass', cost: 0.80 },
    ],
  },
  {
    id: 'PO-9447',
    winnerName: 'Daniel Brooks',
    jackpotAmount: '$2,400.00',
    timestamp: '07 Aug 2026, 13:05',
    machineId: 'EGM-103 (Lucky 88)',
    scenarioTag: 'Primary Server unavailable · Secondary Fail · No AML',
    callsSummary: '1 IDV · 0 AML (1 unbilled outage)',
    retailCost: 3.00,
    billedRate: 3.00,
    saved: 0.00,
    calls: [
      { step: 1, type: 'Primary ID check', document: 'NSW Driver Licence', result: 'Server unavailable (Unbilled)', resultVariant: 'fail', cost: 0 },
      { step: 2, type: 'Secondary new ID check', document: 'Australian Passport', result: 'Unmatched', resultVariant: 'fail', cost: 3.00 },
      { step: 3, type: 'AML screening', document: 'Screening skipped — no verified ID', result: 'Skipped', resultVariant: 'neutral', cost: 0 },
    ],
  },
  {
    id: 'PO-9448',
    winnerName: 'Emily Watson',
    jackpotAmount: '$4,750.00',
    timestamp: '06 Aug 2026, 19:40',
    machineId: 'EGM-205 (Black Panther)',
    scenarioTag: 'Primary Server unavailable · Secondary Server unavailable',
    callsSummary: 'Server unavailable (Unbilled)',
    retailCost: 0,
    billedRate: 0,
    saved: 0,
    calls: [
      { step: 1, type: 'Primary ID check', document: 'NSW Driver Licence', result: 'Server unavailable (Unbilled)', resultVariant: 'fail', cost: 0 },
      { step: 2, type: 'Secondary new ID check', document: 'Australian Passport', result: 'Server unavailable (Unbilled)', resultVariant: 'fail', cost: 0 },
      { step: 3, type: 'AML screening', document: 'Screening skipped — server error on both IDs', result: 'Skipped', resultVariant: 'neutral', cost: 0 },
    ],
  },
  {
    id: 'PO-9449',
    winnerName: 'Callum Reid',
    jackpotAmount: '$1,500.00',
    timestamp: '06 Aug 2026, 16:15',
    machineId: 'EGM-106 (Geisha)',
    scenarioTag: 'No ID presented · PEP + Sanctions screening',
    callsSummary: '0 IDV · 2 AML',
    retailCost: 1.60,
    billedRate: 1.60,
    saved: 0.00,
    calls: [
      { step: 1, type: 'Primary IDV', document: 'No ID presented — skipped', result: 'Skipped', resultVariant: 'neutral', cost: 0 },
      { step: 2, type: 'PEP screening', document: 'Politically Exposed Persons database', result: 'Clear', resultVariant: 'pass', cost: 0.80 },
      { step: 3, type: 'Sanctions screening', document: 'OFAC / UN sanctions lists', result: 'Clear', resultVariant: 'pass', cost: 0.80 },
    ],
  },
  {
    id: 'PO-9450',
    winnerName: 'Rachel Morris',
    jackpotAmount: '$9,200.00',
    timestamp: '06 Aug 2026, 11:20',
    machineId: 'EGM-202 (Dragon Link)',
    scenarioTag: 'Manual KYC bypassed · PEP + Sanctions screening',
    callsSummary: '0 IDV · 2 AML',
    retailCost: 1.60,
    billedRate: 1.60,
    saved: 0.00,
    calls: [
      { step: 1, type: 'Primary IDV', document: 'Manual KYC — digital IDV bypassed', result: 'Skipped', resultVariant: 'neutral', cost: 0 },
      { step: 2, type: 'PEP screening', document: 'Politically Exposed Persons database', result: 'Clear', resultVariant: 'pass', cost: 0.80 },
      { step: 3, type: 'Sanctions screening', document: 'OFAC / UN sanctions lists', result: 'Clear', resultVariant: 'pass', cost: 0.80 },
    ],
  },
];

/* ─── Result pill tokens matching Approver / Authoriser and DESIGN.md states ─── */

export default function ApiCallTelemetryView({ currentProfile }) {
  const [expandedPayoutId, setExpandedPayoutId] = useState('PO-9478');

  const payoutsCount = currentProfile?.payoutsCount ?? 68;
  const flatFeePerPayout = 12.00;

  const metrics = useMemo(() => {
    if (payoutsCount === 0) {
      return {
        payoutsCount: 0,
        totalCalls: 0,
        idvCalls: 0,
        copCalls: 0,
        retailTotal: 0,
        billedTotal: 0,
        totalSaved: 0,
        retryRate: '0%',
      };
    }
    const singlePass = Math.round(payoutsCount * 0.65);
    const secondId = Math.round(payoutsCount * 0.18);
    const nameOrderRetry = Math.round(payoutsCount * 0.07);
    const copRetry = Math.round(payoutsCount * 0.06);
    const skipIdv = Math.max(0, payoutsCount - singlePass - secondId - nameOrderRetry - copRetry);

    const idvCalls = singlePass * 1 + secondId * 2 + nameOrderRetry * 3 + copRetry * 1 + skipIdv * 0;
    const copCalls = singlePass * 1 + secondId * 1 + nameOrderRetry * 1 + copRetry * 2 + skipIdv * 1;
    const totalCalls = idvCalls + copCalls;

    // Unbundled vendor cost:
    // Single pass: $12.00 (IDV) + $1.50 (CoP) = $13.50
    // Second ID: $12.00 (IDV) + $3.00 (new ID) + $1.50 (CoP) = $16.50
    // Name retry: $12.00 (IDV) + $3.00 (new ID) + $2.00 (retry) + $1.50 (CoP) = $18.50
    // CoP retry: $12.00 (IDV) + $1.50 (CoP) + $1.50 (CoP retry) = $15.00
    // Skip IDV: $1.50 (CoP only) = $1.50
    const retailTotal =
      singlePass * 13.50 +
      secondId * 16.50 +
      nameOrderRetry * 18.50 +
      copRetry * 15.00 +
      skipIdv * 1.50;

    // Billed total: $12 flat for IDV payouts, $1.50 flat for Skip IDV payouts
    const billedTotal = (payoutsCount - skipIdv) * flatFeePerPayout + skipIdv * 1.50;
    const totalSaved = Math.max(0, retailTotal - billedTotal);
    const retryRate = `${Math.round(((secondId + nameOrderRetry + copRetry) / payoutsCount) * 100)}%`;

    return {
      payoutsCount,
      totalCalls,
      idvCalls,
      copCalls,
      retailTotal,
      billedTotal,
      totalSaved,
      retryRate,
    };
  }, [payoutsCount, flatFeePerPayout]);

  const toggleRow = (payoutId) => {
    setExpandedPayoutId((prev) => (prev === payoutId ? null : payoutId));
  };

  return (
    <div className="w-full font-sans">
      {/* ── Section 1: Monthly usage summary ── */}
      <div className="mb-7">
        <div className="flex items-center justify-end mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[12.5px] font-bold border bg-brand-light text-brand border-brand-border shrink-0">
            $12.00 flat fee/payout
          </span>
        </div>

        {/* 4 Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Payouts */}
          <div className="bg-surface-card border border-border rounded-lg p-[18px] min-w-0">
            <div className="text-ink-mid text-[13px] font-semibold">
              Payouts processed
            </div>
            <div className="mt-2 text-[26px] font-bold font-mono text-ink-hi leading-none tabular-nums">
              {metrics.payoutsCount}
            </div>
            <div className="mt-2 text-ink-mid text-[12.5px] leading-snug">
              {metrics.retryRate} required retries or second IDs
            </div>
          </div>

          {/* Card 2: Total API Checks */}
          <div className="bg-surface-card border border-border rounded-lg p-[18px] min-w-0">
            <div className="text-ink-mid text-[13px] font-semibold">
              Total API checks executed
            </div>
            <div className="mt-2 text-[26px] font-bold font-mono text-ink-hi leading-none tabular-nums">
              {metrics.totalCalls}
            </div>
            <div className="mt-2 text-ink-mid text-[12.5px] leading-snug">
              <span className="font-mono font-bold text-ink-hi">{metrics.idvCalls}</span> IDV checks ·{' '}
              <span className="font-mono font-bold text-ink-hi">{metrics.copCalls}</span> CoP lookups
            </div>
          </div>

          {/* Card 3: Market Value vs Flat Billed */}
          <div className="bg-surface-card border border-border rounded-lg p-[18px] min-w-0">
            <div className="text-ink-mid text-[13px] font-semibold">
              Market value vs flat billed
            </div>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-[26px] font-bold font-mono text-brand leading-none tabular-nums">
                ${metrics.billedTotal.toFixed(2)}
              </span>
              <span className="text-[13.5px] font-mono text-ink-mid line-through tabular-nums">
                ${metrics.retailTotal.toFixed(2)}
              </span>
            </div>
            <div className="mt-2 text-ink-mid text-[12.5px] leading-snug break-words">
              Unbundled rate: ${metrics.retailTotal.toFixed(2)}
            </div>
          </div>

          {/* Card 4: Savings absorbed */}
          <div className="bg-surface-card border border-border rounded-lg p-[18px] min-w-0">
            <div className="text-ink-mid text-[13px] font-semibold flex items-center justify-between gap-2">
              <span>Savings absorbed</span>
              <ShieldCheck className="w-4 h-4 text-state-pass-dot flex-shrink-0" />
            </div>
            <div className="mt-2 text-[26px] font-bold font-mono text-state-pass-dot leading-none tabular-nums">
              ${metrics.totalSaved.toFixed(2)}
            </div>
            <div className="mt-2 text-state-pass-dot text-[12.5px] font-bold leading-snug">
              100% of retry overages covered
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 2: Payout verification activity table ── */}
      <div className="border border-border rounded-lg bg-surface-card overflow-hidden">
        {/* Table header */}
        <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-[14px] font-bold text-ink-hi m-0">
              Payout-level evidence
            </h4>
            <p className="text-[13px] text-ink-mid mt-1 mb-0">
              Click any row to expand its step-by-step verification receipt and payout details.
            </p>
          </div>
          <span className="text-[12.5px] text-ink-mid">
            Showing {AUDIT_PAYOUT_RECORDS.length} recent audits
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-th">
                <th className="text-left px-5 py-3 text-ink-mid text-[12px] font-semibold min-w-[130px] whitespace-nowrap">
                  Payout ID
                </th>
                <th className="text-left px-5 py-3 text-ink-mid text-[12px] font-semibold whitespace-nowrap">
                  Winner
                </th>
                <th className="text-left px-5 py-3 text-ink-mid text-[12px] font-semibold whitespace-nowrap">
                  Verification
                </th>
                <th className="text-right px-5 py-3 text-ink-mid text-[12px] font-semibold whitespace-nowrap">
                  Vendor value
                </th>
                <th className="text-right px-5 py-3 text-ink-mid text-[12px] font-semibold whitespace-nowrap">
                  Venue paid
                </th>
                <th className="text-right px-5 py-3 text-ink-mid text-[12px] font-semibold whitespace-nowrap">
                  Savings absorbed
                </th>
                <th className="text-center px-4 py-3 text-ink-mid text-[12px] font-semibold w-12 whitespace-nowrap">
                  Receipt
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {AUDIT_PAYOUT_RECORDS.map((record) => {
                const isExpanded = expandedPayoutId === record.id;
                return (
                  <React.Fragment key={record.id}>
                    {/* Main clean row with continuous active rail.
                        The rail uses an inset box-shadow rather than a
                        border: a border-left on a <tr> inside a
                        border-collapse table isn't scoped to that row -
                        browsers resolve it against the shared column
                        border and it can bleed into neighboring rows.
                        box-shadow sits outside the table border model, so
                        it stays confined to the row it's set on. */}
                    <tr
                      onClick={() => toggleRow(record.id)}
                      className={`hover:bg-surface-hover transition-colors cursor-pointer group h-[52px] ${
                        isExpanded ? 'bg-surface-hover' : ''
                      }`}
                      style={isExpanded ? { boxShadow: 'inset 3px 0 0 0 var(--primary)' } : undefined}
                    >
                      {/* Payout ID */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-[14px] text-brand">
                          {record.id}
                        </span>
                      </td>

                      {/* Winner name */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-bold text-[14px] text-ink-hi group-hover:text-brand transition-colors">
                          {record.winnerName}
                        </span>
                      </td>

                      {/* Verification summary */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-bold text-[13px] text-ink-hi">
                          {record.callsSummary}
                        </span>
                      </td>

                      {/* Vendor value */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap font-mono">
                        <span
                          className={`text-[13.5px] tabular-nums ${
                            record.saved > 0
                              ? 'text-ink-mid line-through'
                              : 'font-semibold text-ink-hi'
                          }`}
                        >
                          ${record.retailCost.toFixed(2)}
                        </span>
                      </td>

                      {/* Flat fee billed */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap font-mono">
                        <span className="text-[14px] font-bold text-ink-hi tabular-nums">
                          ${record.billedRate.toFixed(2)}
                        </span>
                      </td>

                      {/* Savings absorbed (clean text, not a status pill) */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        {record.saved > 0 ? (
                          <span className="font-bold text-state-pass-dot text-[13.5px]">
                            <span className="font-mono tabular-nums">+${record.saved.toFixed(2)}</span> saved
                          </span>
                        ) : (
                          <span className="font-mono text-[13px] text-ink-mid tabular-nums font-normal">
                            $0.00
                          </span>
                        )}
                      </td>

                      {/* Toggle icon */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span className="inline-flex items-center justify-center text-ink-mid group-hover:text-brand">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-brand" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </span>
                      </td>
                    </tr>

                    {/* Expanded drawer, flat (no nested cards) */}
                    {isExpanded && (
                      <tr className="bg-surface-th" style={{ boxShadow: 'inset 3px 0 0 0 var(--primary)' }}>
                        <td colSpan={7} className="px-6 py-4">
                          {/* Context strip */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 pb-3 mb-3 border-b border-border-mid">
                            <div className="py-1 px-3 flex flex-col gap-0.5">
                              <span className="text-[12px] font-semibold text-ink-mid">
                                Date and time
                              </span>
                              <span className="text-[13.5px] font-mono font-medium text-ink-hi">
                                {record.timestamp}
                              </span>
                            </div>
                            <div className="py-1 px-3 flex flex-col gap-0.5">
                              <span className="text-[12px] font-semibold text-ink-mid">
                                Jackpot amount
                              </span>
                              <span className="text-[13.5px] font-mono font-bold text-ink-hi">
                                {record.jackpotAmount}
                              </span>
                            </div>
                            <div className="py-1 px-3 flex flex-col gap-0.5">
                              <span className="text-[12px] font-semibold text-ink-mid">
                                Gaming machine
                              </span>
                              <span className="text-[13.5px] font-medium text-ink-hi">
                                {record.machineId}
                              </span>
                            </div>
                          </div>

                          {/* Section header */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-[12px] font-semibold text-ink-mid">
                              <span>Step-by-step verification audit</span>
                              <span className="text-border-mid">·</span>
                              <span className="text-brand font-semibold">
                                {record.calls.length} {record.calls.length === 1 ? 'attempt' : 'attempts'} recorded
                              </span>
                            </div>
                          </div>

                          {/* Flat minimal table (zero nested cards) */}
                          <div className="overflow-x-auto mb-3">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="border-b border-border-mid">
                                  <th className="text-left py-2 px-3 text-ink-mid text-[11.5px] font-semibold w-10">
                                    Step
                                  </th>
                                  <th className="text-left py-2 px-3 text-ink-mid text-[11.5px] font-semibold min-w-[160px]">
                                    Call type
                                  </th>
                                  <th className="text-left py-2 px-3 text-ink-mid text-[11.5px] font-semibold min-w-[190px]">
                                    Document/details
                                  </th>
                                  <th className="text-left py-2 px-3 text-ink-mid text-[11.5px] font-semibold w-32">
                                    Result
                                  </th>
                                  <th className="text-right py-2 px-3 text-ink-mid text-[11.5px] font-semibold w-28">
                                    Actual cost
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border">
                                {record.calls.map((call) => (
                                  <tr
                                    key={call.step}
                                    className="hover:bg-white/60 transition-colors h-[40px]"
                                  >
                                    {/* Step # */}
                                    <td className="py-2 px-3 font-mono text-[12px] font-bold text-ink-mid whitespace-nowrap">
                                      {call.step}
                                    </td>

                                    {/* Call type */}
                                    <td className="py-2 px-3 whitespace-nowrap">
                                      <span className="text-[13.5px] font-bold text-ink-hi">
                                        {call.type}
                                      </span>
                                    </td>

                                    {/* Document / details */}
                                    <td className="py-2 px-3 whitespace-nowrap">
                                      <span className="text-[13px] text-ink-mid">
                                        {call.document}
                                      </span>
                                    </td>

                                    {/* Result pill */}
                                    <td className="py-2 px-3 whitespace-nowrap">
                                      <Badge variant={call.resultVariant} size="sm">
                                        {call.result}
                                      </Badge>
                                    </td>

                                    {/* Actual cost */}
                                    <td className="py-2 px-3 text-right whitespace-nowrap font-mono">
                                      <span className="text-[13.5px] font-bold text-ink-hi tabular-nums">
                                        {call.cost === 12.00
                                          ? '$12.00'
                                          : call.cost > 0
                                          ? `+$${call.cost.toFixed(2)}`
                                          : '$0.00'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Financial summary dock */}
                          <div className="pt-3.5 mt-1 border-t border-border-mid flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12px] font-semibold text-ink-hi">
                            <div className="flex items-center gap-4 flex-wrap">
                              <div className="flex items-baseline gap-1.5">
                                <span>Vendor value:</span>
                                <span className="tabular-nums font-mono">
                                  ${record.retailCost.toFixed(2)}
                                </span>
                              </div>

                              <span className="text-border-mid hidden sm:inline">·</span>

                              <div className="flex items-baseline gap-1.5">
                                <span>Venue paid:</span>
                                <span className="tabular-nums font-mono">
                                  ${record.billedRate.toFixed(2)}
                                </span>
                              </div>
                            </div>

                            <div className="shrink-0 flex items-baseline gap-1.5">
                              <span>Savings absorbed:</span>
                              <span className="tabular-nums font-mono">
                                {record.saved > 0 ? `+$${record.saved.toFixed(2)}` : '$0.00'}
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

