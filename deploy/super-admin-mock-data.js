(function () {
  'use strict';

  const DATA_KEY = 'superAdminMockData';
  const AUDIT_KEY = 'superAdminAuditLog';

  const clients = [
    { id: 'client-riverside', name: 'Riverside Leagues Ltd', contact: 'J. Chen', email: 'admin@riversiderg.com.au', venues: 3, plan: 'PAYG', status: 'Active' },
    { id: 'client-northside', name: 'Northside Community Club', contact: 'S. Patel', email: 'ops@northsideclub.com.au', venues: 2, plan: 'PAYG', status: 'Active' },
    { id: 'client-harbourview', name: 'Harbourview Hospitality Group', contact: 'M. Wallace', email: 'finance@harbourview.com.au', venues: 2, plan: 'PAYG', status: 'Active' },
    { id: 'client-riverside-dining', name: 'Riverside Dining', contact: 'A. Morgan', email: 'accounts@riversidedining.com.au', venues: 1, plan: 'Starter', status: 'Draft' }
  ];

  const venues = [
    { id: 'venue-riverside-rsl', clientId: 'client-riverside', name: 'Riverside RSL Club', status: 'Active', IdentityVerifiedEnabled: true, transactions: 84, volume: 145300, lastActivity: '13 Jul 2026', machines: 12, users: 5, smrs: 2 },
    { id: 'venue-riverside-bowling', clientId: 'client-riverside', name: 'Riverside Bowling Club', status: 'Active', IdentityVerifiedEnabled: true, transactions: 31, volume: 48320, lastActivity: '12 Jul 2026', machines: 8, users: 4, smrs: 1 },
    { id: 'venue-riverside-lounge', clientId: 'client-riverside', name: 'Riverside Lounge & Bar', status: 'Draft', IdentityVerifiedEnabled: false, transactions: 0, volume: 0, lastActivity: 'Not active', machines: 0, users: 1, smrs: 0 },
    { id: 'venue-northside-leagues', clientId: 'client-northside', name: 'Northside Leagues Club', status: 'Active', IdentityVerifiedEnabled: true, transactions: 62, volume: 92450, lastActivity: '30 Jul 2026', machines: 9, users: 6, smrs: 2 },
    { id: 'venue-northside-sports', clientId: 'client-northside', name: 'Northside Sports Club', status: 'Inactive', IdentityVerifiedEnabled: false, transactions: 12, volume: 12450, lastActivity: '02 Jun 2026', machines: 7, users: 3, smrs: 0 },
    { id: 'venue-harbourview-hotel', clientId: 'client-harbourview', name: 'Harbourview Hotel', status: 'Active', IdentityVerifiedEnabled: true, transactions: 45, volume: 67290, lastActivity: '02 Aug 2026', machines: 6, users: 4, smrs: 1 },
    { id: 'venue-harbourview-bistro', clientId: 'client-harbourview', name: 'Harbourview Bistro', status: 'Active', IdentityVerifiedEnabled: true, transactions: 19, volume: 27100, lastActivity: '01 Aug 2026', machines: 4, users: 2, smrs: 0 },
    { id: 'venue-grand-bistro', clientId: 'client-riverside-dining', name: 'Riverside Grand Bistro', status: 'Active', IdentityVerifiedEnabled: true, transactions: 8, volume: 3200, lastActivity: '10 Jul 2026', machines: 2, users: 2, smrs: 0 }
  ];

  const users = [
    { id: 'usr-1a2b3c', username: 'm.santos', email: 'm.santos@riversidersl.com.au', clientId: 'client-riverside', venueIds: ['venue-riverside-rsl'], role: 'Collector', status: 'Active', lastActive: 'Today, 08:42' },
    { id: 'usr-2b3c4d', username: 'j.chen', email: 'j.chen@riversidersl.com.au', clientId: 'client-riverside', venueIds: ['venue-riverside-rsl', 'venue-riverside-bowling'], role: 'Venue Admin', status: 'Active', lastActive: 'Today, 08:36' },
    { id: 'usr-3c4d5e', username: 'd.walsh', email: 'd.walsh@riversidersl.com.au', clientId: 'client-riverside', venueIds: ['venue-riverside-rsl'], role: 'Approver', status: 'Active', lastActive: 'Yesterday' },
    { id: 'usr-4d5e6f', username: 'k.lee', email: 'k.lee@riversidersl.com.au', clientId: 'client-northside', venueIds: ['venue-northside-leagues'], role: 'Authoriser', status: 'Active', lastActive: '31 Jul 2026' },
    { id: 'usr-5e6f7g', username: 'r.nguyen', email: 'r.nguyen@riversidersl.com.au', clientId: 'client-northside', venueIds: ['venue-northside-leagues', 'venue-northside-sports'], role: 'Venue Admin', status: 'Active', lastActive: '30 Jul 2026' },
    { id: 'usr-6f7g8h', username: 'p.sharma', email: 'p.sharma@harbourview.com.au', clientId: 'client-harbourview', venueIds: ['venue-harbourview-hotel'], role: 'Collector', status: 'Blocked', lastActive: '18 Jul 2026' },
    { id: 'usr-7g8h9i', username: 'venue.admin', email: 'admin@riversidedining.com.au', clientId: 'client-riverside-dining', venueIds: ['venue-grand-bistro'], role: 'Venue Admin', status: 'Pending', lastActive: 'Never' }
  ];

  const machines = venues.flatMap((venue, venueIndex) => Array.from({ length: venue.machines }, (_, index) => ({
    id: `machine-${venueIndex + 1}-${index + 1}`,
    machineId: `EGM-${String(venueIndex * 10 + index + 1).padStart(3, '0')}`,
    name: index % 2 ? 'IGT Wheel of Fortune' : 'Aristocrat Lightning Link',
    serial: `SN-${venueIndex + 1}${String(index + 11).padStart(4, '0')}`,
    clientId: venue.clientId,
    venueId: venue.id,
    status: venue.status === 'Inactive' ? 'Inactive' : 'Active'
  })));

  const payoutStatuses = ['Completed', 'Awaiting Approval', 'Pending Authorisation', 'Failed', 'Delayed'];
  const payouts = Array.from({ length: 36 }, (_, index) => {
    const venue = venues[index % venues.length];
    const isHigh = index % 3 === 0;
    const isMedium = index % 3 === 1;
    const risk = isHigh ? 'High' : isMedium ? 'Medium' : 'Low';
    const amount = isHigh ? (12000 + ((index * 1350) % 23000)) : (1500 + ((index * 680) % 8000));
    const kyc = isHigh ? (index % 2 === 0 ? 'Fail' : 'Manual') : isMedium ? 'Manual' : 'Pass';
    const idv = kyc === 'Manual' ? 'Manual verification' : kyc;
    const pep = isHigh ? (index % 4 === 0 ? 'Hit' : 'Pending') : isMedium ? (index % 2 === 0 ? 'Pending' : 'Clear') : 'Clear';
    const sanctions = isHigh && index % 6 === 0 ? 'Hit' : 'Clear';
    const cop = isHigh ? (index % 2 === 0 ? 'No match' : 'Close match') : isMedium ? 'Close match' : 'Match';
    return {
      id: `PAY-${String(260700 + index).padStart(6, '0')}`,
      clientId: venue.clientId,
      venueId: venue.id,
      venue: venue.name,
      amount,
      created: `${String((index % 28) + 1).padStart(2, '0')} Jul 2026`,
      status: payoutStatuses[index % payoutStatuses.length],
      risk,
      kyc,
      idv,
      pep,
      sanctions,
      cop,
      smr: isHigh ? 'Required' : isMedium ? 'Reviewed' : 'None'
    };
  });

  const smrs = payouts.filter(payout => payout.smr === 'Required').map((payout, index) => ({
    id: `SMR-${String(1007 + index)}`,
    payoutId: payout.id,
    clientId: payout.clientId,
    venueId: payout.venueId,
    type: 'Suspicious Matter Report',
    risk: payout.risk,
    status: index % 3 === 0 ? 'Draft' : index % 3 === 1 ? 'Ready for review' : 'Submitted',
    created: payout.created,
    submitted: index % 3 === 2 ? '05 Aug 2026' : '-'
  }));

  const subscriptions = venues.map((venue, index) => ({
    venueId: venue.id,
    clientId: venue.clientId,
    plan: index === 7 ? 'Starter' : 'PAYG',
    status: venue.status === 'Inactive' ? 'Paused' : index === 2 ? 'Pending setup' : 'Active',
    monthly: venue.status === 'Inactive' ? 0 : 22.5 + venue.transactions * 4.65,
    nextInvoice: venue.status === 'Inactive' ? '-' : '01 Sep 2026'
  }));

  const activity = [
    { id: 'activity-1', actor: 'J.Chen', action: 'Updated payout controls', entity: 'Riverside RSL Club', time: '18 minutes ago', tone: 'info' },
    { id: 'activity-2', actor: 'S. Patel', action: 'Submitted an SMR for review', entity: 'Northside Leagues Club', time: '2 hours ago', tone: 'warning' },
    { id: 'activity-3', actor: 'J.Chen', action: 'Created a new venue', entity: 'Riverside Lounge & Bar', time: 'Yesterday', tone: 'success' },
    { id: 'activity-4', actor: 'System', action: 'Payment failed', entity: 'Riverside Grand Bistro', time: 'Yesterday', tone: 'danger' }
  ];

  function seed() {
    if (!sessionStorage.getItem(DATA_KEY)) {
      sessionStorage.setItem(DATA_KEY, JSON.stringify({ clients, venues, users, machines, payouts, smrs, subscriptions, activity }));
    }
    if (!sessionStorage.getItem(AUDIT_KEY)) sessionStorage.setItem(AUDIT_KEY, JSON.stringify(activity));
  }

  function read() {
    seed();
    try { return JSON.parse(sessionStorage.getItem(DATA_KEY)) || {}; } catch (error) { return { clients, venues, users, machines, payouts, smrs, subscriptions, activity }; }
  }

  function write(data) {
    sessionStorage.setItem(DATA_KEY, JSON.stringify(data));
    return data;
  }

  function clientName(id, data) { return (data || read()).clients.find(item => item.id === id)?.name || 'Unassigned client'; }
  function venueName(id, data) { return (data || read()).venues.find(item => item.id === id)?.name || 'Unassigned venue'; }
  function formatCurrency(value) { return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(Number(value) || 0); }
  function formatNumber(value) { return new Intl.NumberFormat('en-AU').format(Number(value) || 0); }
  function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character])); }
  function statusClass(value) { return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'); }
  function setContext(key, value) { sessionStorage.setItem(key, JSON.stringify(value)); }
  function getContext(key) { try { return JSON.parse(sessionStorage.getItem(key)) || null; } catch (error) { return null; } }
  function toast(message, tone) { document.dispatchEvent(new CustomEvent('superadmin:toast', { detail: { message, tone: tone || 'success' } })); }
  function audit(action, entity) {
    const events = JSON.parse(sessionStorage.getItem(AUDIT_KEY) || '[]');
    events.unshift({ id: `audit-${Date.now()}`, actor: 'J.Chen', action, entity, time: 'Just now', tone: 'info' });
    sessionStorage.setItem(AUDIT_KEY, JSON.stringify(events.slice(0, 50)));
  }

  window.SuperAdminData = { DATA_KEY, seed, read, write, clientName, venueName, formatCurrency, formatNumber, escapeHtml, statusClass, setContext, getContext, toast, audit };
  seed();

  // Global mobile header drawer toggle
  document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('mobile-menu-btn');
    const nav = document.querySelector('.header-nav');
    if (btn && nav) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        nav.classList.toggle('is-open');
      });
      document.addEventListener('click', function (e) {
        if (!e.target.closest('.header-nav') && !e.target.closest('#mobile-menu-btn')) {
          nav.classList.remove('is-open');
        }
      });
    }
  });
}());
