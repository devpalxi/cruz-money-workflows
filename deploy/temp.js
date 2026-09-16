
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
  
