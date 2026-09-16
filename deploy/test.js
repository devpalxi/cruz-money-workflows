const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const htmlStr = $(<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Machines - Admin</title>
<link rel="stylesheet" href="dashboard-style.css">
<!-- Import Google Fonts: JetBrains Mono for tabular numbers -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  .app { max-width: 1080px; margin: 0 auto; padding: 36px 24px 64px; }
  .page-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 26px; flex-wrap: wrap; }
  h1 { font-size: 24px; font-weight: 700; margin: 0; }
  .page-sub { font-size: 14px; color: var(--slate-text); margin: 6px 0 0; }
  
  .toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 18px; }
  .search-field {
    display: flex; align-items: center; gap: 8px;
    height: 44px; padding: 0 14px; border-radius: 6px;
    border: 1px solid var(--border-mid); background: var(--bg-card);
    max-width: 320px; flex: 1;
  }
  .search-field svg { color: var(--text-lo); flex-shrink: 0; }
  .search-field input {
    border: none; outline: none; background: transparent;
    font-size: 15px; font-family: inherit; color: var(--text-hi); width: 100%;
  }
  .search-field input::placeholder { color: var(--text-lo); }

  .content-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; min-width: 800px; }
  thead th {
    text-align: left; font-size: 12.5px; font-weight: 700;
    color: var(--text-mid);
    padding: 14px 20px; border-bottom: 1px solid var(--border);
  }
  tbody tr { cursor: pointer; transition: background-color 0.12s var(--ease); }
  tbody tr:hover { background-color: var(--bg-hover); }
  tbody tr + tr td { border-top: 1px solid var(--border); }
  tbody td { padding: 16px 20px; font-size: 14.5px; vertical-align: middle; }
  
  .cell-mono { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }
  .cell-id { font-weight: 700; color: var(--text-hi); }
  .cell-serial { color: var(--text-mid); font-size: 13.5px; }
  
  /* Shared Pill styles overrides/extensions */
  .pill.neutral { background: var(--slate-bg); color: var(--slate-text); border: 1px solid var(--slate-border); }
  .pill.pass { background: var(--green-bg); color: var(--green-text); border: 1px solid var(--green-border); }
  .pill {
    display: inline-flex; align-items: center; font-size: 12px; font-weight: 700;
    padding: 4px 10px; border-radius: 20px; white-space: nowrap;
  }

  .btn-edit {
    display: inline-flex; align-items: center; justify-content: center;
    width: 32px; height: 32px; border-radius: 6px;
    background: transparent; border: none; cursor: pointer;
    color: var(--text-mid); transition: color 0.12s, background 0.12s;
  }
  .btn-edit:hover { color: var(--blue); background: var(--bg-hover); }
  
  .empty-state { text-align: center; padding: 56px 20px; color: var(--text-mid); font-size: 14.5px; }

  @media (max-width: 768px) {
    .app { padding: 24px 16px 48px; }
    .toolbar { flex-direction: column; align-items: stretch; }
    .search-field { max-width: none; }
    .toolbar-actions { width: 100%; display: flex; gap: 8px; justify-content: stretch; }
    .toolbar-actions button { flex: 1; padding: 0 12px; }
  }

  /* Modals */
  .modal-overlay {
    display: none; position: fixed; inset: 0; background: rgba(17,24,39,0.4);
    z-index: 100; align-items: center; justify-content: center; padding: 20px;
    backdrop-filter: blur(2px);
  }
  .modal-overlay.open { display: flex; }
  .modal-box {
    background: var(--bg-card); border-radius: var(--r-md, 10px);
    width: 100%; max-width: 520px;
    box-shadow: var(--shadow-lg);
    display: flex; flex-direction: column;
  }
  .modal-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 24px 28px; border-bottom: 1px solid var(--border);
  }
  .modal-header h2 { font-size: 18px; font-weight: 700; margin: 0; color: var(--text-hi); }
  .modal-close {
    background: none; border: none; color: var(--text-lo);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    width: 32px; height: 32px; border-radius: var(--r-sm, 6px); transition: 0.12s;
  }
  .modal-close:hover { background: var(--bg-th); color: var(--text-hi); }
  .modal-body { padding: 28px; font-size: 14.5px; color: var(--text-mid); line-height: 1.5; }
  .modal-footer {
    padding: 24px 28px; border-top: 1px solid var(--border);
    display: flex; gap: 12px; justify-content: space-between; background: var(--bg-card);
    border-radius: 0 0 var(--r-md, 10px) var(--r-md, 10px);
  }
  
  /* Buttons inside modal */
  .btn-modal {
    height: 44px; padding: 0 24px; border-radius: var(--r-sm, 6px); font-size: 14.5px; font-weight: 600; cursor: pointer; border: none; font-family: inherit; transition: 0.12s; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  }
  .btn-modal.primary { background: var(--blue); color: #fff; width: 100%; }
  .btn-modal.primary:hover { background: var(--blue-dark); }
  .btn-modal.secondary { background: var(--bg-card); border: 1px solid var(--border-mid); color: var(--text-hi); width: 100%; }
  .btn-modal.secondary:hover { background: var(--bg-th); }
  
  /* Dropzone */
  .dropzone {
    border: 1px dashed var(--border-mid); border-radius: var(--r-md, 8px); padding: 48px 24px;
    text-align: center; margin-top: 24px; background: var(--bg-page);
    display: flex; flex-direction: column; align-items: center;
  }
  .dropzone svg { color: var(--text-lo); margin-bottom: 16px; }
  .dropzone p { margin: 0 0 16px; color: var(--text-hi); font-weight: 500; font-size: 14.5px; }
  
  /* Form Field */
  .modal-field { margin-top: 24px; }
  .modal-field label { display: block; font-weight: 700; color: var(--text-hi); margin-bottom: 8px; font-size: 14px; }
  .modal-select {
    width: 100%; height: 44px; padding: 0 14px; border-radius: var(--r-sm, 6px);
    border: 1px solid var(--border-mid); background: var(--bg-card);
    font-size: 14.5px; color: var(--text-hi); font-family: inherit; outline: none;
    appearance: none; cursor: pointer;
  }
  .modal-select:focus { border-color: var(--blue); box-shadow: 0 0 0 1px var(--blue); }
  .select-wrapper { position: relative; }
  .select-wrapper::after {
    content: ''; position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
    width: 12px; height: 12px; pointer-events: none;
    background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="%234b5563" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>') no-repeat center;
  }
  .export-count { margin-top: 24px; font-size: 14.5px; color: var(--text-mid); }
  
  /* Toolbar styling */
  .toolbar-actions { display: flex; gap: 12px; align-items: center; }
  .btn-toolbar {
    height: 44px; padding: 0 16px; border-radius: var(--r-sm, 6px); font-size: 14.5px; font-weight: 600; cursor: pointer; border: none; font-family: inherit; transition: 0.12s; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  }
  .btn-toolbar.secondary { background: var(--bg-card); border: 1px solid var(--border-mid); color: var(--text-hi); }
  .btn-toolbar.secondary:hover { background: var(--bg-th); }
  .btn-toolbar.primary { background: var(--blue); color: #fff; }
  .btn-toolbar.primary:hover { background: var(--blue-dark); }
</style>
</head>
<body>

  <!-- Floating Island Header Navigation -->
  <div class="header-nav-wrapper">
    <header class="app-header">
      <div class="header-container">
        <button class="mobile-menu-toggle" id="mobile-menu-btn" aria-label="Toggle menu"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></button>
        <div class="logo-area">
          <div class="logo-text">
            <span class="logo-title">RIVERSIDE PAYOUTS <span class="role-badge admin">ADMIN</span></span>
            <span class="logo-subtitle">COMPLIANCE & AML DATABASE</span>
          </div>
        </div>
        
        <nav class="header-nav">
          <a href="dashboard.html" class="nav-link" onclick="sessionStorage.setItem('userRole','admin')">Dashboard</a>
          <a href="austrac-transactions.html" class="nav-link" onclick="sessionStorage.setItem('userRole','admin')">AUSTRAC Reports</a>
          <a href="billing.html" class="nav-link" onclick="sessionStorage.setItem('userRole','admin')">Billing</a>
          <a href="admin-users.html" class="nav-link" onclick="sessionStorage.setItem('userRole','admin')">Users</a>
          <a href="admin-machines.html" class="nav-link active" onclick="sessionStorage.setItem('userRole','admin')">Machines</a>

        </nav>
        
        <div class="user-profile">
          <a href="super-admin.html" class="switch-role-link" onclick="sessionStorage.setItem('userRole','superadmin')">→ Switch to Super Admin</a>
          <span class="user-name">J.Chen</span>
          <div class="avatar">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        </div>
      </div>
    </header>
  </div>

  <div class="app">
    <div class="page-header">
      <div>
        <h1>Machines</h1>
        <p class="page-sub">Registered EGM machines across all venues.</p>
      </div>
    </div>

    <div class="toolbar">
      <div class="search-field">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        <input type="text" id="searchInput" placeholder="Search by ID, name, serial or venue" />
      </div>
      <div class="toolbar-actions" id="toolbarActions">
        <button class="btn-toolbar secondary" id="exportBtn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Export
        </button>
        <button class="btn-toolbar secondary" id="bulkUploadBtn">
          Bulk Upload
        </button>
        <button class="btn-toolbar primary" id="addMachineBtn">Add machine</button>
      </div>
    </div>

    <div class="content-card">
      <table id="machinesTable">
        <thead>
          <tr>
            <th style="width: 12%;">Machine ID</th>
            <th style="width: 28%;">Name</th>
            <th style="width: 18%;">Serial number</th>
            <th style="width: 22%;">Venue</th>
            <th style="width: 10%;">Status</th>
            <th style="width: 6%; text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody id="machinesBody">
          <!-- Rendered via JS -->
        </tbody>
      </table>
      <div class="empty-state" id="emptyState" style="display:none;">No results match your search.</div>
    </div>
  </div>

  <!-- Bulk Upload Modal -->
  <div class="modal-overlay" id="bulkUploadModal">
    <div class="modal-box">
      <div class="modal-header">
        <h2>Bulk Upload Machines</h2>
        <button class="modal-close" onclick="closeModal('bulkUploadModal')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div class="modal-body">
        <p>Upload an Excel file (.xlsx) with machine data. You can download the template below to ensure correct formatting.</p>
        <button class="btn-modal primary" style="background: var(--slate-text); margin-top: 16px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Download Template
        </button>
        <div class="dropzone">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          <p>Drag and drop your Excel file here, or click to browse.</p>
          <button class="btn-modal secondary" style="width: auto;">Browse</button>
        </div>
      </div>
      <div class="modal-footer" style="justify-content: center;">
        <button class="btn-modal secondary" onclick="closeModal('bulkUploadModal')">Cancel</button>
      </div>
    </div>
  </div>

  <!-- Export Modal -->
  <div class="modal-overlay" id="exportModal">
    <div class="modal-box">
      <div class="modal-header">
        <h2>Export Machines</h2>
        <button class="modal-close" onclick="closeModal('exportModal')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div class="modal-body">
        <p>Select a venue to export machines, or leave as "All Venues" to export all machines you have access to.</p>
        <div class="modal-field">
          <label>Venue</label>
          <div class="select-wrapper">
            <select class="modal-select" id="exportVenueSelect">
              <option value="all">All Venues</option>
              <option value="Riverside RSL Club">Riverside RSL Club</option>
              <option value="Northside Sports Club">Northside Sports Club</option>
            </select>
          </div>
        </div>
        <div class="export-count" id="exportCountText">21 machine(s) will be exported</div>
      </div>
      <div class="modal-footer">
        <button class="btn-modal secondary" onclick="closeModal('exportModal')" style="flex: 1;">Cancel</button>
        <button class="btn-modal primary" style="flex: 1;" id="exportSubmitBtn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Export <span id="exportBtnCount">21</span> Machines
        </button>
      </div>
    </div>
  </div>

  <script>
    // Demo data based on strapi-onboarding-guide.md
    const machinesData = [
      { uuid: 'machine-1a', machineId: 'EGM-001', serialNumber: 'SN-AR-00112', name: 'Aristocrat Lightning Link 1', description: '', venue: 'Riverside RSL Club', status: 'active', created: '2025-01-10T08:30:00Z', createdBy: 'venue.admin' },
      { uuid: 'machine-2b', machineId: 'EGM-002', serialNumber: 'SN-AR-00113', name: 'Aristocrat Lightning Link 2', description: '', venue: 'Riverside RSL Club', status: 'active', created: '2025-01-10T08:35:00Z', createdBy: 'venue.admin' },
      { uuid: 'machine-3c', machineId: 'EGM-003', serialNumber: 'SN-AR-00114', name: 'Aristocrat Lightning Link 3', description: '', venue: 'Riverside RSL Club', status: 'active', created: '2025-01-10T08:40:00Z', createdBy: 'venue.admin' },
      { uuid: 'machine-4d', machineId: 'EGM-004', serialNumber: 'SN-IGT-2201', name: 'IGT Wheel of Fortune 1', description: '', venue: 'Riverside RSL Club', status: 'active', created: '2025-01-10T09:00:00Z', createdBy: 'venue.admin' },
      { uuid: 'machine-5e', machineId: 'EGM-005', serialNumber: 'SN-IGT-2202', name: 'IGT Wheel of Fortune 2', description: '', venue: 'Riverside RSL Club', status: 'active', created: '2025-01-10T09:05:00Z', createdBy: 'venue.admin' },
      { uuid: 'machine-6f', machineId: 'EGM-006', serialNumber: 'SN-KON-3301', name: 'Konami Dragon Link 1', description: '', venue: 'Riverside RSL Club', status: 'active', created: '2025-01-10T09:15:00Z', createdBy: 'venue.admin' },
      { uuid: 'machine-7g', machineId: 'EGM-007', serialNumber: 'SN-KON-3302', name: 'Konami Dragon Link 2', description: '', venue: 'Riverside RSL Club', status: 'active', created: '2025-01-10T09:20:00Z', createdBy: 'venue.admin' },
      { uuid: 'machine-8h', machineId: 'EGM-008', serialNumber: 'SN-SCI-4401', name: 'Scientific Games Monopoly', description: '', venue: 'Riverside RSL Club', status: 'active', created: '2025-01-10T09:30:00Z', createdBy: 'venue.admin' },
      { uuid: 'machine-9i', machineId: 'EGM-009', serialNumber: 'SN-EVE-5501', name: 'Everi Fortune Coin 1', description: '', venue: 'Riverside RSL Club', status: 'active', created: '2025-01-10T09:45:00Z', createdBy: 'venue.admin' },
      { uuid: 'machine-10j', machineId: 'EGM-010', serialNumber: 'SN-EVE-5502', name: 'Everi Fortune Coin 2', description: '', venue: 'Riverside RSL Club', status: 'active', created: '2025-01-10T09:50:00Z', createdBy: 'venue.admin' },
      { uuid: 'machine-11k', machineId: 'EGM-011', serialNumber: 'SN-AR-00221', name: 'Aristocrat Buffalo 1', description: '', venue: 'Riverside RSL Club', status: 'active', created: '2025-01-10T10:00:00Z', createdBy: 'venue.admin' },
      { uuid: 'machine-12l', machineId: 'EGM-012', serialNumber: 'SN-AR-00222', name: 'Aristocrat Buffalo 2', description: '', venue: 'Riverside RSL Club', status: 'active', created: '2025-01-10T10:05:00Z', createdBy: 'venue.admin' },
      { uuid: 'machine-13m', machineId: 'EGM-013', serialNumber: 'SN-AR-00331', name: 'Aristocrat Wild Panda 1', description: '', venue: 'Northside Sports Club', status: 'active', created: '2025-01-11T14:30:00Z', createdBy: 'venue.admin' },
      { uuid: 'machine-14n', machineId: 'EGM-014', serialNumber: 'SN-AR-00332', name: 'Aristocrat Wild Panda 2', description: '', venue: 'Northside Sports Club', status: 'active', created: '2025-01-11T14:35:00Z', createdBy: 'venue.admin' },
      { uuid: 'machine-15o', machineId: 'EGM-015', serialNumber: 'SN-IGT-3301', name: 'IGT Double Diamond 1', description: '', venue: 'Northside Sports Club', status: 'active', created: '2025-01-11T15:00:00Z', createdBy: 'venue.admin' },
      { uuid: 'machine-16p', machineId: 'EGM-016', serialNumber: 'SN-IGT-3302', name: 'IGT Double Diamond 2', description: '', venue: 'Northside Sports Club', status: 'active', created: '2025-01-11T15:05:00Z', createdBy: 'venue.admin' },
      { uuid: 'machine-17q', machineId: 'EGM-017', serialNumber: 'SN-KON-4401', name: 'Konami China Shores', description: '', venue: 'Northside Sports Club', status: 'active', created: '2025-01-11T15:20:00Z', createdBy: 'venue.admin' },
      { uuid: 'machine-18r', machineId: 'EGM-018', serialNumber: 'SN-SCI-5501', name: 'Scientific Games Zeus', description: '', venue: 'Northside Sports Club', status: 'active', created: '2025-01-11T15:35:00Z', createdBy: 'venue.admin' },
      { uuid: 'machine-19s', machineId: 'EGM-019', serialNumber: 'SN-EVE-6601', name: 'Everi Black Diamond', description: '', venue: 'Northside Sports Club', status: 'active', created: '2025-01-11T15:50:00Z', createdBy: 'venue.admin' },
      { uuid: 'machine-20t', machineId: 'EGM-020', serialNumber: 'SN-AR-00441', name: 'Aristocrat Timber Wolf', description: '', venue: 'Northside Sports Club', status: 'active', created: '2025-01-11T16:00:00Z', createdBy: 'venue.admin' }
    ];

    // Load from sessionStorage if available, else initialize
    let machines = [];
    try {
      const stored = sessionStorage.getItem('machinesData');
      if (stored) {
        machines = JSON.parse(stored);
      } else {
        machines = machinesData;
        sessionStorage.setItem('machinesData', JSON.stringify(machines));
      }
    } catch (e) {
      machines = machinesData;
    }

    const tbody = document.getElementById('machinesBody');
    const searchInput = document.getElementById('searchInput');
    const emptyState = document.getElementById('emptyState');

    function renderTable(data) {
      tbody.innerHTML = '';
      if (data.length === 0) {
        emptyState.style.display = 'block';
        document.getElementById('machinesTable').style.display = 'none';
        return;
      }
      emptyState.style.display = 'none';
      document.getElementById('machinesTable').style.display = 'table';
      
      data.forEach(mach => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="cell-mono cell-id">${mach.machineId}</td>
          <td>${mach.name}</td>
          <td class="cell-mono cell-serial">${mach.serialNumber}</td>
          <td>${mach.venue}</td>
          <td>
            <span class="pill ${mach.status === 'active' ? 'pass' : 'neutral'}">
              ${mach.status.charAt(0).toUpperCase() + mach.status.slice(1)}
            </span>
          </td>
          <td style="text-align: right;">
            <button type="button" class="btn-edit" aria-label="Edit machine">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </button>
          </td>
        `;
        
        tr.addEventListener('click', (e) => {
          if (e.target.closest('.btn-edit')) {
            sessionStorage.setItem('adminMachineEdit', JSON.stringify(mach));
            window.location.href = 'admin-machine-form.html';
          } else {
            sessionStorage.setItem('adminMachineView', JSON.stringify(mach));
            window.location.href = 'admin-machine-view.html';
          }
        });
        
        tbody.appendChild(tr);
      });
    }

    renderTable(machines);

    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      const filtered = machines.filter(m => 
        m.machineId.toLowerCase().includes(q) || 
        m.name.toLowerCase().includes(q) || 
        m.serialNumber.toLowerCase().includes(q) ||
        m.venue.toLowerCase().includes(q)
      );
      renderTable(filtered);
    });

    document.getElementById('addMachineBtn').addEventListener('click', () => {
      sessionStorage.removeItem('adminMachineEdit');
      window.location.href = 'admin-machine-form.html';
    });

    document.addEventListener('DOMContentLoaded', () => {
      const userRole = sessionStorage.getItem('userRole');
      const contextStr = sessionStorage.getItem('selectedVenueContext');
      let selectedVenueContext = null;
      if (contextStr) {
        try { selectedVenueContext = JSON.parse(contextStr); } catch (e) {}
      }

      const isSuperAdmin = userRole === 'superadmin';

      if (selectedVenueContext) {
        // Filter machines
        const filteredMachines = machines.filter(m => m.venue === selectedVenueContext.venueName);
        machines = filteredMachines; // update global
        renderTable(machines);

        // Update title
        document.querySelector('.page-header h1').textContent = `${selectedVenueContext.venueName} — Machines`;
        document.querySelector('.page-header .page-sub').textContent = `Machines registered to ${selectedVenueContext.venueName}.`;
        
        // Add back link
        const pageHeader = document.querySelector('.page-header div');
        const backLink = document.createElement('a');
        backLink.href = 'venue-transactions.html';
        backLink.className = 'eyebrow-tag';
        backLink.style.textDecoration = 'none';
        backLink.style.display = 'inline-block';
        backLink.style.marginBottom = '8px';
        backLink.innerHTML = '&larr; Venue Hub';
        pageHeader.insertBefore(backLink, pageHeader.firstChild);
      }

      if (isSuperAdmin) {
        // Replace admin nav with super-admin nav
        const nav = document.querySelector('.header-nav');
        nav.innerHTML = `
          <a href="super-admin.html" class="nav-link" onclick="sessionStorage.setItem('userRole','superadmin')">All Venues</a>
<a href="billing.html" class="nav-link" onclick="sessionStorage.setItem('userRole','superadmin')">Billing</a>
        `;
        
        // Update logo text
        document.querySelector('.logo-title').innerHTML = `RIVERSIDE PAYOUTS <span class="role-badge super-admin">SUPER ADMIN</span>`;
        
        // Update user profile link
        const _srl = document.querySelector('.switch-role-link');
        if (_srl) {
          _srl.href = 'dashboard.html';
          _srl.textContent = '→ Switch to Admin';
          _srl.onclick = () => sessionStorage.setItem('userRole', 'admin');
        }

        document.getElementById('addMachineBtn').style.display = 'none';
        
        // Hide edit controls in table
        const style = document.createElement('style');
        style.textContent = '.btn-edit { display: none !important; }';
        document.head.appendChild(style);
        document.getElementById('bulkUploadBtn').style.display = 'none';
      }
    });

    // Modal Logic
    function openModal(id) {
      document.getElementById(id).classList.add('open');
    }
    function closeModal(id) {
      document.getElementById(id).classList.remove('open');
    }

    document.getElementById('bulkUploadBtn').addEventListener('click', () => {
      openModal('bulkUploadModal');
    });

    document.getElementById('exportBtn').addEventListener('click', () => {
      updateExportCount();
      openModal('exportModal');
    });

    // Close modals on click outside
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('open');
        }
      });
    });

    // Dynamic Export Count Logic
    const exportVenueSelect = document.getElementById('exportVenueSelect');
    const exportCountText = document.getElementById('exportCountText');
    const exportBtnCount = document.getElementById('exportBtnCount');

    function updateExportCount() {
      const selected = exportVenueSelect.value;
      let count = 0;
      if (selected === 'all') {
        count = machines.length;
      } else {
        count = machines.filter(m => m.venue === selected).length;
      }
      exportCountText.textContent = `${count} machine(s) will be exported`;
      exportBtnCount.textContent = count;
    }

    exportVenueSelect.addEventListener('change', updateExportCount);
  </script>
</body>
</html>
 -replace '"', '\"' -replace "
", "\n" -replace "", "\r");
const dom = new JSDOM(htmlStr, { runScripts: "dangerously" });
if (dom.window.document.getElementById('exportBtn')) {
    console.log('exportBtn found');
} else {
    console.log('exportBtn not found');
}
