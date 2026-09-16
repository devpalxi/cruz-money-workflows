'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  X,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  UserCheck,
  Shield,
  KeyRound
} from 'lucide-react';
import AdminShell from '@/components/layout/AdminShell';

// 16 Standard Staff Profiles from deploy/admin-users.html
export const defaultStaffUsers = [
  { uuid: 'usr-01', username: 'j.chen', fullName: 'Jonathan Chen', email: 'admin@riversiderg.com.au', phone: '+61 412 889 012', role: 'Venue Admin', confirmed: true, status: 'active', venue: 'Riverside RSL Club', lastIpAddress: '203.0.113.14', collectorIpAllowlist: '203.0.113.0/24', lastActive: 'Today, 08:36', created: '2025-01-05T09:00:00Z', client: 'Riverside Group' },
  { uuid: 'usr-02', username: 'v.thornton', fullName: 'Victoria Thornton', email: 'v.thornton@riversidersl.com.au', phone: '+61 401 223 944', role: 'Venue Admin', confirmed: true, status: 'active', venue: 'Riverside RSL Club', lastIpAddress: '203.0.113.10', collectorIpAllowlist: '', lastActive: 'Today, 09:15', created: '2025-01-05T09:30:00Z', client: 'Riverside Group' },
  { uuid: 'usr-03', username: 'r.patel', fullName: 'Rohan Patel', email: 'r.patel@northsideclub.com.au', phone: '+61 433 112 870', role: 'Venue Admin', confirmed: true, status: 'active', venue: 'Northside Leagues Club', lastIpAddress: '203.0.113.88', collectorIpAllowlist: '', lastActive: 'Yesterday, 17:40', created: '2025-01-06T10:00:00Z', client: 'Northside Community Club' },
  { uuid: 'usr-04', username: 'k.lee', fullName: 'Kylie Lee', email: 'k.lee@riversidersl.com.au', phone: '+61 422 901 345', role: 'Authoriser', confirmed: true, status: 'active', venue: 'Riverside RSL Club', lastIpAddress: '203.0.113.56', collectorIpAllowlist: '', lastActive: 'Today, 11:20', created: '2025-01-06T11:00:00Z', client: 'Riverside Group' },
  { uuid: 'usr-05', username: 'r.nguyen', fullName: 'Raymond Nguyen', email: 'r.nguyen@riversidersl.com.au', phone: '+61 418 456 789', role: 'Authoriser', confirmed: true, status: 'active', venue: 'Riverside RSL Club', lastIpAddress: '203.0.113.88', collectorIpAllowlist: '', lastActive: '30 Jul 2026', created: '2025-01-07T08:00:00Z', client: 'Riverside Group' },
  { uuid: 'usr-06', username: 's.oconnor', fullName: 'Sean O\'Connor', email: 's.oconnor@northsideclub.com.au', phone: '+61 409 678 123', role: 'Authoriser', confirmed: true, status: 'active', venue: 'Northside Leagues Club', lastIpAddress: '203.0.113.91', collectorIpAllowlist: '', lastActive: '01 Aug 2026', created: '2025-01-07T08:30:00Z', client: 'Northside Community Club' },
  { uuid: 'usr-07', username: 'd.walsh', fullName: 'David Walsh', email: 'd.walsh@riversidersl.com.au', phone: '+61 411 234 567', role: 'Approver', confirmed: true, status: 'active', venue: 'Riverside RSL Club', lastIpAddress: '203.0.113.45', collectorIpAllowlist: '', lastActive: 'Today, 07:50', created: '2025-01-08T09:00:00Z', client: 'Riverside Group' },
  { uuid: 'usr-08', username: 'h.park', fullName: 'Hannah Park', email: 'h.park@riversidersl.com.au', phone: '+61 425 678 901', role: 'Approver', confirmed: true, status: 'active', venue: 'Riverside RSL Club', lastIpAddress: '203.0.113.61', collectorIpAllowlist: '', lastActive: 'Yesterday, 22:15', created: '2025-01-08T10:00:00Z', client: 'Riverside Group' },
  { uuid: 'usr-09', username: 'c.watts', fullName: 'Cameron Watts', email: 'c.watts@northsideclub.com.au', phone: '+61 431 345 678', role: 'Approver', confirmed: true, status: 'active', venue: 'Northside Sports Club', lastIpAddress: '203.0.113.62', collectorIpAllowlist: '', lastActive: 'Yesterday, 19:30', created: '2025-01-08T10:30:00Z', client: 'Northside Community Club' },
  { uuid: 'usr-10', username: 'l.campbell', fullName: 'Liam Campbell', email: 'l.campbell@harbourview.com.au', phone: '+61 450 789 012', role: 'Approver', confirmed: true, status: 'active', venue: 'Harbourview Hotel', lastIpAddress: '203.0.114.22', collectorIpAllowlist: '', lastActive: '02 Aug 2026', created: '2025-01-09T14:00:00Z', client: 'Harbourview Hospitality Group' },
  { uuid: 'usr-11', username: 'm.santos', fullName: 'Maria Santos', email: 'm.santos@riversidersl.com.au', phone: '+61 402 111 222', role: 'Collector', confirmed: true, status: 'active', venue: 'Riverside RSL Club', lastIpAddress: '203.0.113.12', collectorIpAllowlist: '203.0.113.0/24', lastActive: 'Today, 08:42', created: '2025-01-10T08:00:00Z', client: 'Riverside Group' },
  { uuid: 'usr-12', username: 'p.sharma', fullName: 'Priya Sharma', email: 'p.sharma@riversidersl.com.au', phone: '+61 403 333 444', role: 'Collector', confirmed: true, status: 'active', venue: 'Riverside RSL Club', lastIpAddress: '203.0.113.19', collectorIpAllowlist: '203.0.113.0/24', lastActive: 'Today, 06:30', created: '2025-01-10T08:30:00Z', client: 'Riverside Group' },
  { uuid: 'usr-13', username: 't.obrien', fullName: 'Timothy O\'Brien', email: 't.obrien@northsideclub.com.au', phone: '+61 404 555 666', role: 'Collector', confirmed: true, status: 'active', venue: 'Northside Sports Club', lastIpAddress: '203.0.113.22', collectorIpAllowlist: '203.0.113.0/24', lastActive: 'Yesterday, 21:00', created: '2025-01-10T09:00:00Z', client: 'Northside Community Club' },
  { uuid: 'usr-14', username: 'a.taylor', fullName: 'Amy Taylor', email: 'a.taylor@northsideclub.com.au', phone: '+61 405 777 888', role: 'Collector', confirmed: true, status: 'active', venue: 'Northside Leagues Club', lastIpAddress: '203.0.113.28', collectorIpAllowlist: '203.0.113.0/24', lastActive: '31 Jul 2026', created: '2025-01-11T10:00:00Z', client: 'Northside Community Club' },
  { uuid: 'usr-15', username: 'e.davies', fullName: 'Ethan Davies', email: 'e.davies@harbourview.com.au', phone: '+61 406 999 000', role: 'Collector', confirmed: false, status: 'pending', venue: 'Harbourview Hotel', lastIpAddress: '-', collectorIpAllowlist: '203.0.114.0/24', lastActive: 'Never', created: '2025-01-12T11:00:00Z', client: 'Harbourview Hospitality Group' },
  { uuid: 'usr-16', username: 'g.wilson', fullName: 'Grace Wilson', email: 'g.wilson@riversidersl.com.au', phone: '+61 407 123 456', role: 'Collector', confirmed: true, status: 'blocked', venue: 'Riverside Bowling Club', lastIpAddress: '203.0.113.99', collectorIpAllowlist: '203.0.113.0/24', lastActive: '18 Jul 2026', created: '2025-01-05T12:00:00Z', client: 'Riverside Group' }
];

export default function UsersView({ role = 'ADMIN' }) {
  const [users, setUsers] = useState(defaultStaffUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedVenue, setSelectedVenue] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [toastMessage, setToastMessage] = useState(null);

  // Modals state
  const [detailUser, setDetailUser] = useState(null);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Add/Edit Form State
  const [formUsername, setFormUsername] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formConfirmed, setFormConfirmed] = useState(true);
  const [formBlocked, setFormBlocked] = useState(false);
  const [formClient, setFormClient] = useState('Riverside Group');
  const [formRole, setFormRole] = useState('Collector');
  const [formLastIpAddress, setFormLastIpAddress] = useState('');
  const [formVenues, setFormVenues] = useState('Riverside RSL Club');
  const [formIpAllowlist, setFormIpAllowlist] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.fullName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.venue.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q);

      const matchesRole =
        selectedRole === 'all' ||
        (selectedRole === 'Venue Admin' && (u.role === 'Admin' || u.role === 'Venue Admin')) ||
        u.role === selectedRole;

      const matchesVenue = selectedVenue === 'all' || u.venue === selectedVenue;
      const matchesStatus = selectedStatus === 'all' || u.status === selectedStatus;

      return matchesSearch && matchesRole && matchesVenue && matchesStatus;
    });
  }, [users, searchQuery, selectedRole, selectedVenue, selectedStatus]);

  const hasActiveFilters = searchQuery || selectedRole !== 'all' || selectedVenue !== 'all' || selectedStatus !== 'all';

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedRole('all');
    setSelectedVenue('all');
    setSelectedStatus('all');
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormUsername('');
    setFormFullName('');
    setFormEmail('');
    setFormPhone('+61 4');
    setFormPassword('');
    setShowPassword(false);
    setFormConfirmed(true);
    setFormBlocked(false);
    setFormClient('Riverside Group');
    setFormRole('Collector');
    setFormLastIpAddress('');
    setFormVenues('Riverside RSL Club');
    setFormIpAllowlist('203.0.113.0/24');
    setIsAddEditOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormUsername(user.username);
    setFormFullName(user.fullName);
    setFormEmail(user.email);
    setFormPhone(user.phone || '');
    setFormPassword('');
    setShowPassword(false);
    setFormConfirmed(user.confirmed !== false);
    setFormBlocked(user.status === 'blocked');
    setFormClient(user.client || 'Riverside Group');
    setFormRole(user.role === 'Admin' ? 'Venue Admin' : user.role);
    setFormLastIpAddress(user.lastIpAddress || '');
    setFormVenues(user.venue);
    setFormIpAllowlist(user.collectorIpAllowlist || '');
    setDetailUser(null);
    setIsAddEditOpen(true);
  };

  // Save User
  const handleSaveUser = (e) => {
    e.preventDefault();

    const computedStatus = formBlocked ? 'blocked' : (formConfirmed ? 'active' : 'pending');

    if (editingUser) {
      setUsers((prev) =>
        prev.map((item) =>
          item.uuid === editingUser.uuid
            ? {
              ...item,
              username: formUsername.trim(),
              fullName: formFullName.trim() || formUsername.trim(),
              email: formEmail.trim(),
              phone: formPhone.trim(),
              confirmed: formConfirmed,
              status: computedStatus,
              client: formClient,
              role: formRole,
              lastIpAddress: formLastIpAddress.trim() || item.lastIpAddress,
              venue: formVenues,
              collectorIpAllowlist: formIpAllowlist.trim(),
            }
            : item
        )
      );
      showToast(`User @${formUsername} updated successfully.`);
    } else {
      const newUser = {
        uuid: `usr-${Date.now()}`,
        username: formUsername.trim(),
        fullName: formFullName.trim() || formUsername.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        confirmed: formConfirmed,
        status: computedStatus,
        client: formClient,
        role: formRole,
        lastIpAddress: formLastIpAddress.trim() || '203.0.113.1',
        venue: formVenues,
        collectorIpAllowlist: formIpAllowlist.trim(),
        lastActive: 'Just now',
        created: new Date().toISOString(),
      };
      setUsers((prev) => [newUser, ...prev]);
      showToast(`User @${formUsername} created successfully.`);
    }
    setIsAddEditOpen(false);
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['UUID,Full Name,Username,Email,Phone,Role,Status,Venue,Last Active'];
    const rows = filteredUsers.map((u) =>
      `"${u.uuid}","${u.fullName}","${u.username}","${u.email}","${u.phone}","${u.role}","${u.status}","${u.venue}","${u.lastActive}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `staff-users-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported staff directory to CSV.');
  };


  // Status Badge Styles
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return 'bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]';
      case 'pending':
        return 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]';
      case 'blocked':
      default:
        return 'bg-[#fef2f2] text-[#991b1b] border-[#fca5a5]';
    }
  };

  return (
    <AdminShell role={role}>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#102a43] text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />
          <span className="text-[13.5px] font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 cursor-pointer bg-transparent border-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#102a43] tracking-tight m-0 leading-tight">
            Staff &amp; User Accounts
          </h1>
          <p className="text-[14px] text-[#627d98] mt-1.5 mb-0 max-w-[68ch] leading-relaxed">
            Compliance access tiers, supervisory approvals, and floor collector security roles.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center justify-center h-[38px] px-3.5 rounded-md text-[13px] font-bold bg-white text-[#102a43] border border-[#d9e2ec] hover:bg-[#f4f7f9] transition-colors cursor-pointer shadow-xs gap-1.5"
          >
            <Download className="w-4 h-4 text-[#627d98]" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center h-[38px] px-4 rounded-md text-[13px] font-bold text-white bg-[#0d9488] hover:bg-[#0b7a6f] transition-colors cursor-pointer shadow-xs gap-1.5 border-none"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Controls & Table Container */}
      <section className="bg-white border border-[#d9e2ec] rounded-[10px] shadow-xs overflow-hidden">

        {/* Filter Toolbar */}
        <div className="p-4 sm:p-5 border-b border-[#edf1f4]">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px] max-w-sm">
              <Search className="w-4 h-4 text-[#627d98] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, username, email, venue..."
                className="h-[38px] w-full border border-[#d9e2ec] rounded-md bg-white text-[#102a43] pl-9 pr-3 text-[13.5px] outline-none focus:border-[#0d9488]"
              />
            </div>

            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="h-[38px] min-w-[130px] border border-[#d9e2ec] rounded-md bg-white text-[#102a43] px-3 text-[13px] font-medium outline-none focus:border-[#0d9488]"
            >
              <option value="all">All Roles</option>
              <option value="Venue Admin">Venue Admin</option>
              <option value="Authoriser">Authoriser</option>
              <option value="Approver">Approver</option>
              <option value="Collector">Collector</option>
            </select>

            {/* Venue Filter */}
            <select
              value={selectedVenue}
              onChange={(e) => setSelectedVenue(e.target.value)}
              className="h-[38px] min-w-[160px] border border-[#d9e2ec] rounded-md bg-white text-[#102a43] px-3 text-[13px] font-medium outline-none focus:border-[#0d9488]"
            >
              <option value="all">All Venues</option>
              <option value="Riverside RSL Club">Riverside RSL Club</option>
              <option value="Riverside Bowling Club">Riverside Bowling Club</option>
              <option value="Northside Leagues Club">Northside Leagues Club</option>
              <option value="Northside Sports Club">Northside Sports Club</option>
              <option value="Harbourview Hotel">Harbourview Hotel</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-[38px] min-w-[120px] border border-[#d9e2ec] rounded-md bg-white text-[#102a43] px-3 text-[13px] font-medium outline-none focus:border-[#0d9488]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="blocked">Blocked</option>
            </select>

            {/* Results Counter & Clear */}
            <div className="ml-auto flex items-center gap-3">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-[12.5px] font-bold text-[#0d9488] hover:underline bg-transparent border-none cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
              <span className="text-[12px] text-[#627d98] font-medium">
                Showing {filteredUsers.length} staff member{filteredUsers.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="bg-[#f8fafb] border-b border-[#d9e2ec]">
                <th className="px-4 py-3 text-[#627d98] text-[11px] font-bold tracking-wider uppercase w-[25%]">
                  Staff member
                </th>
                <th className="px-4 py-3 text-[#627d98] text-[11px] font-bold tracking-wider uppercase w-[24%]">
                  Email &amp; contact
                </th>
                <th className="px-4 py-3 text-[#627d98] text-[11px] font-bold tracking-wider uppercase w-[22%]">
                  Assigned venue
                </th>
                <th className="px-4 py-3 text-[#627d98] text-[11px] font-bold tracking-wider uppercase w-[11%]">
                  Role
                </th>
                <th className="px-4 py-3 text-[#627d98] text-[11px] font-bold tracking-wider uppercase w-[10%]">
                  Status
                </th>
                <th className="px-4 py-3 text-[#627d98] text-[11px] font-bold tracking-wider uppercase w-[8%]">
                  Last active
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf1f4]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#627d98]">
                    <div className="text-[14px] font-bold text-[#102a43]">No staff members match your criteria</div>
                    <div className="text-[12.5px] text-[#627d98] mt-1">Try adjusting your search terms or filter selections.</div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.uuid}
                    onClick={() => setDetailUser(user)}
                    className="hover:bg-[#f0fdfa] transition-colors cursor-pointer"
                  >
                    {/* Staff Member (Full Name + @username) */}
                    <td className="px-4 py-3.5">
                      <div className="text-[14px] font-bold text-[#102a43] leading-tight">
                        {user.fullName}
                      </div>
                      <div className="text-[12px] font-mono text-[#627d98] mt-0.5">
                        @{user.username}
                      </div>
                    </td>

                    {/* Email & Contact */}
                    <td className="px-4 py-3.5">
                      <div className="text-[13.5px] text-[#102a43]">
                        {user.email}
                      </div>
                      <div className="text-[12px] font-mono text-[#627d98] mt-0.5">
                        {user.phone || '-'}
                      </div>
                    </td>

                    {/* Assigned Venue */}
                    <td className="px-4 py-3.5">
                      <span className="text-[13.5px] font-semibold text-[#102a43]">
                        {user.venue}
                      </span>
                    </td>

                    {/* Role Typography (No pills rule) */}
                    <td className="px-4 py-3.5 text-[13px] font-semibold text-[#102a43]">
                      {user.role}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold capitalize border ${getStatusBadge(user.status)}`}>
                        {user.status}
                      </span>
                    </td>

                    {/* Last Active */}
                    <td className="px-4 py-3.5 text-[12px] font-mono text-[#627d98] whitespace-nowrap">
                      {user.lastActive}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* ─── USER DETAIL DOSSIER MODAL ───────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────── */}
      {detailUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setDetailUser(null)}>
          <div className="bg-white rounded-[12px] border border-[#d9e2ec] max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#edf1f4]">
              <div>
                <h2 className="text-[18px] font-bold text-[#102a43] m-0">
                  {detailUser.fullName}
                </h2>
                <p className="text-[12.5px] font-mono text-[#627d98] mt-0.5 mb-0">
                  @{detailUser.username}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailUser(null)}
                className="text-[#627d98] hover:text-[#102a43] p-1 cursor-pointer bg-transparent border-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dossier Grid */}
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#627d98]">User ID</div>
                  <div className="text-[14px] font-mono text-[#627d98] font-semibold mt-0.5">{detailUser.uuid}</div>
                </div>

                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#627d98]">Primary Role</div>
                  <div className="text-[14px] font-semibold text-[#102a43] mt-0.5">{detailUser.role}</div>
                </div>

                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#627d98]">Email Address</div>
                  <div className="text-[14px] font-semibold text-[#102a43] mt-0.5">{detailUser.email}</div>
                </div>

                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#627d98]">Mobile Phone</div>
                  <div className="text-[14px] font-mono font-semibold text-[#102a43] mt-0.5">{detailUser.phone || '-'}</div>
                </div>

                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#627d98]">Account Status</div>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold capitalize border ${getStatusBadge(detailUser.status)}`}>
                      {detailUser.status}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#627d98]">2-Factor Authentication</div>
                  <div className="text-[13.5px] font-bold text-[#065f46] mt-0.5">Enforced (SMS)</div>
                </div>

                <div className="sm:col-span-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#627d98]">Assigned Venue</div>
                  <div className="text-[14px] font-semibold text-[#102a43] mt-0.5">{detailUser.venue}</div>
                </div>

                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#627d98]">Collector IP Allowlist</div>
                  <div className="text-[13.5px] font-mono text-[#102a43] mt-0.5">{detailUser.collectorIpAllowlist || 'None configured'}</div>
                </div>

                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#627d98]">Last Session IP</div>
                  <div className="text-[13.5px] font-mono text-[#102a43] mt-0.5">{detailUser.lastIpAddress || '-'}</div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between p-4 bg-[#f8fafc] border-t border-[#edf1f4]">
              <button
                type="button"
                onClick={() => {
                  showToast(`Password reset link dispatched to ${detailUser.email}`);
                }}
                className="h-[36px] px-3.5 rounded-md text-[13px] font-bold bg-white text-[#102a43] border border-[#d9e2ec] hover:bg-[#f4f7f9] cursor-pointer shadow-xs inline-flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#627d98]" />
                <span>Reset Password</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDetailUser(null)}
                  className="h-[36px] px-3.5 rounded-md text-[13px] font-bold bg-white text-[#627d98] border border-[#d9e2ec] hover:bg-[#f4f7f9] cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(detailUser)}
                  className="h-[36px] px-4 rounded-md text-[13px] font-bold bg-[#0d9488] hover:bg-[#0b7a6f] text-white cursor-pointer border-none"
                >
                  Edit User
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* ─── ADD / EDIT USER MODAL ───────────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────── */}
      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setIsAddEditOpen(false)}>
          <div className="bg-white rounded-[12px] border border-[#d9e2ec] max-w-xl w-full shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#edf1f4] flex-shrink-0">
              <h2 className="text-[18px] font-bold text-[#102a43] m-0">
                {editingUser ? `Edit Staff Member (${editingUser.fullName})` : 'Add Staff Member'}
              </h2>
              <button
                type="button"
                onClick={() => setIsAddEditOpen(false)}
                className="text-[#627d98] hover:text-[#102a43] p-1 cursor-pointer bg-transparent border-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveUser} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">

                {/* Row 1: Username & Full Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[12px] font-bold text-[#627d98]">
                      Username <span className="text-[#dc2626]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      minLength={3}
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      placeholder="e.g. j.chen"
                      className="w-full h-10 px-3 border border-[#d9e2ec] rounded-md text-[13.5px] text-[#102a43] outline-none focus:border-[#0d9488]"
                    />
                    <span className="text-[11px] text-[#627d98]">Minimum 3 characters</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[12px] font-bold text-[#627d98]">Full Name</label>
                    <input
                      type="text"
                      value={formFullName}
                      onChange={(e) => setFormFullName(e.target.value)}
                      placeholder="e.g. Jonathan Chen"
                      className="w-full h-10 px-3 border border-[#d9e2ec] rounded-md text-[13.5px] text-[#102a43] outline-none focus:border-[#0d9488]"
                    />
                  </div>
                </div>

                {/* Row 2: Email & Mobile Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[12px] font-bold text-[#627d98]">
                      Email <span className="text-[#dc2626]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      minLength={6}
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="e.g. j.chen@riversidersl.com.au"
                      className="w-full h-10 px-3 border border-[#d9e2ec] rounded-md text-[13.5px] text-[#102a43] outline-none focus:border-[#0d9488]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[12px] font-bold text-[#627d98]">Mobile Phone</label>
                    <input
                      type="tel"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="e.g. +61 412 889 012"
                      className="w-full h-10 px-3 border border-[#d9e2ec] rounded-md text-[13.5px] font-mono text-[#102a43] outline-none focus:border-[#0d9488]"
                    />
                  </div>
                </div>

                {/* Row 3: Password & Confirmed Toggle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[12px] font-bold text-[#627d98]">Password</label>
                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        placeholder={editingUser ? 'Leave blank to keep current' : 'Minimum 6 characters'}
                        className="w-full h-10 pl-3 pr-10 border border-[#d9e2ec] rounded-md text-[13.5px] text-[#102a43] outline-none focus:border-[#0d9488]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 text-[#627d98] hover:text-[#102a43] bg-transparent border-none cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Segmented Boolean Toggle: Confirmed */}
                  <div className="space-y-1">
                    <label className="text-[12px] font-bold text-[#627d98]">Confirmed</label>
                    <div className="flex h-10 p-1 bg-[#f8fafc] border border-[#d9e2ec] rounded-md gap-1">
                      <button
                        type="button"
                        onClick={() => setFormConfirmed(false)}
                        className={`flex-1 rounded text-[12px] font-bold transition-all cursor-pointer ${!formConfirmed
                          ? 'bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] shadow-xs'
                          : 'text-[#627d98] hover:text-[#102a43] border border-transparent'
                          }`}
                      >
                        FALSE
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormConfirmed(true)}
                        className={`flex-1 rounded text-[12px] font-bold transition-all cursor-pointer ${formConfirmed
                          ? 'bg-[#0d9488] text-white border border-[#0d9488] shadow-xs'
                          : 'text-[#627d98] hover:text-[#102a43] border border-transparent'
                          }`}
                      >
                        TRUE
                      </button>
                    </div>
                  </div>
                </div>

                {/* Row 4: Blocked & Client */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Segmented Boolean Toggle: Blocked */}
                  <div className="space-y-1">
                    <label className="text-[12px] font-bold text-[#627d98]">Blocked</label>
                    <div className="flex h-10 p-1 bg-[#f8fafc] border border-[#d9e2ec] rounded-md gap-1">
                      <button
                        type="button"
                        onClick={() => setFormBlocked(false)}
                        className={`flex-1 rounded text-[12px] font-bold transition-all cursor-pointer ${!formBlocked
                          ? 'bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] shadow-xs'
                          : 'text-[#627d98] hover:text-[#102a43] border border-transparent'
                          }`}
                      >
                        FALSE
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormBlocked(true)}
                        className={`flex-1 rounded text-[12px] font-bold transition-all cursor-pointer ${formBlocked
                          ? 'bg-[#0d9488] text-white border border-[#0d9488] shadow-xs'
                          : 'text-[#627d98] hover:text-[#102a43] border border-transparent'
                          }`}
                      >
                        TRUE
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[12px] font-bold text-[#627d98]">Client</label>
                    <select
                      value={formClient}
                      onChange={(e) => setFormClient(e.target.value)}
                      className="w-full h-10 px-3 border border-[#d9e2ec] rounded-md text-[13.5px] text-[#102a43] bg-white outline-none focus:border-[#0d9488]"
                    >
                      <option value="Riverside Group">Riverside Group</option>
                      <option value="Northside Community Club">Northside Community Club</option>
                      <option value="Harbourview Hospitality Group">Harbourview Hospitality Group</option>
                    </select>
                  </div>
                </div>

                {/* Row 5: 4-Button Role Selection Grid */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[12px] font-bold text-[#627d98]">
                    Assigned Role <span className="text-[#dc2626]">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {['Collector', 'Approver', 'Authoriser', 'Venue Admin'].map((r) => {
                      const isSelected = formRole === r;
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setFormRole(r)}
                          className={`h-10 px-3 rounded-md text-[13px] font-bold transition-all cursor-pointer border ${isSelected
                            ? 'bg-[#0d9488] text-white border-[#0d9488] shadow-xs'
                            : 'bg-white text-[#627d98] border-[#d9e2ec] hover:bg-[#f8fafc]'
                            }`}
                        >
                          {r}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Row 6: Last IP Address */}
                <div className="space-y-1">
                  <label className="text-[12px] font-bold text-[#627d98]">Last IP Address</label>
                  <input
                    type="text"
                    value={formLastIpAddress}
                    onChange={(e) => setFormLastIpAddress(e.target.value)}
                    placeholder="e.g. 203.0.113.14"
                    className="w-full h-10 px-3 border border-[#d9e2ec] rounded-md text-[13.5px] font-mono text-[#102a43] outline-none focus:border-[#0d9488]"
                  />
                </div>

                {/* Row 7: Venue Selection */}
                <div className="space-y-1">
                  <label className="text-[12px] font-bold text-[#627d98]">
                    Venue <span className="text-[#dc2626]">*</span>
                  </label>
                  <select
                    required
                    value={formVenues}
                    onChange={(e) => setFormVenues(e.target.value)}
                    className="w-full h-10 px-3 border border-[#d9e2ec] rounded-md text-[13.5px] text-[#102a43] bg-white outline-none focus:border-[#0d9488]"
                  >
                    <option value="Riverside RSL Club">Riverside RSL Club</option>
                    <option value="Riverside Bowling Club">Riverside Bowling Club</option>
                    <option value="Northside Leagues Club">Northside Leagues Club</option>
                    <option value="Northside Sports Club">Northside Sports Club</option>
                    <option value="Harbourview Hotel">Harbourview Hotel</option>
                  </select>
                </div>

                {/* Row 8: Collector IP Allowlist */}
                <div className="space-y-1">
                  <label className="text-[12px] font-bold text-[#627d98]">Collector IP Allowlist</label>
                  <textarea
                    rows={2}
                    value={formIpAllowlist}
                    onChange={(e) => setFormIpAllowlist(e.target.value)}
                    placeholder="e.g. 203.0.113.0/24"
                    className="w-full p-2.5 border border-[#d9e2ec] rounded-md text-[13px] font-mono text-[#102a43] outline-none focus:border-[#0d9488]"
                  />
                </div>

              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 p-4 bg-[#f8fafc] border-t border-[#edf1f4] flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="h-[38px] px-4 rounded-md text-[13px] font-bold bg-white text-[#102a43] border border-[#d9e2ec] hover:bg-[#f4f7f9] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-[38px] px-5 rounded-md text-[13px] font-bold bg-[#0d9488] hover:bg-[#0b7a6f] text-white cursor-pointer border-none shadow-xs"
                >
                  {editingUser ? 'Save Changes' : 'Save User'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </AdminShell>
  );
}
