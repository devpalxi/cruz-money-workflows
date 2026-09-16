const fs = require('fs');

const headerNav = 
  <div class="header-nav-wrapper">
    <header class="app-header">
      <div class="header-container">
        <button class="mobile-menu-toggle" id="mobile-menu-btn" aria-label="Toggle menu"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></button>
        <div class="logo-area">
          <div class="logo-text">
            <span class="logo-title">RIVERSIDE PAYOUTS</span>
            <span class="logo-subtitle">COMPLIANCE & AML DATABASE</span>
          </div>
        </div>
        
        <nav class="header-nav">
          <a href="super-admin.html" class="nav-link active">Super Admin</a>
          <a href="austrac-report-helper.html" class="btn-secondary austrac-nav-btn" aria-label="AUSTRAC Reports" style="text-decoration: none;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>AUSTRAC Reports</span>
          </a>
        </nav>
        
        <div class="user-profile">
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
;

const html = \<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Super Admin - All Venues</title>
  <link rel="stylesheet" href="dashboard-style.css">
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Hanken+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    .super-admin-main {
      padding: 32px 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .page-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 26px;
      flex-wrap: wrap;
    }
    .page-header h1 {
      font-size: 24px;
      font-weight: 700;
      margin: 0;
      font-family: 'Outfit', sans-serif;
    }
    .page-sub {
      font-size: 14px;
      color: var(--t2, #334155);
      margin: 6px 0 0;
    }
    .toolbar {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 18px;
    }
    .search-field {
      display: flex;
      align-items: center;
      gap: 8px;
      height: 44px;
      padding: 0 14px;
      border-radius: 6px;
      border: 1px solid var(--bd, #e2e8f0);
      background: var(--panel, #ffffff);
      max-width: 320px;
      flex: 1;
    }
    .search-field svg { color: var(--tm, #475569); flex-shrink: 0; }
    .search-field input {
      border: none;
      outline: none;
      background: transparent;
      font-size: 15px;
      font-family: inherit;
      color: var(--t1, #0f172a);
      width: 100%;
    }
    .content-card {
      background: var(--panel, #ffffff);
      border: 1px solid var(--bd, #e2e8f0);
      border-radius: 10px;
      overflow: hidden;
    }
    table { width: 100%; border-collapse: collapse; }
    thead th {
      text-align: left;
      font-size: 12.5px;
      font-weight: 700;
      color: var(--tm, #475569);
      padding: 14px 20px;
      border-bottom: 1px solid var(--bd, #e2e8f0);
      background: #fafafa;
    }
    .num-col { text-align: right; }
    tbody tr {
      cursor: pointer;
      transition: background-color 0.2s ease;
    }
    tbody tr:hover {
      background: var(--blue-light, #f0fdfa);
    }
    tbody tr + tr td { border-top: 1px solid var(--bd, #e2e8f0); }
    tbody td { padding: 16px 20px; font-size: 14.5px; vertical-align: middle; }
    .venue-name { font-weight: 700; color: var(--t1, #0f172a); }
    .venue-org { color: var(--tm, #475569); font-size: 13px; }
    .cell-chevron { text-align: right; color: var(--tm, #475569); }
    .tabular { font-variant-numeric: tabular-nums; }
    .empty-state { text-align: center; padding: 56px 20px; color: var(--tm, #475569); font-size: 14.5px; display: none; }
    
    @media (prefers-reduced-motion: reduce) {
      tbody tr { transition: none; }
    }
    
    @media (max-width: 768px) {
      .table-responsive {
        overflow-x: auto;
      }
    }
    
    @media (max-width: 600px) {
      thead { display: none; }
      table, tbody, tr, td { display: block; width: 100%; }
      tbody tr { padding: 14px 16px; position: relative; }
      tbody tr + tr { border-top: 1px solid var(--bd, #e2e8f0); }
      tbody td { padding: 2px 0; border: none !important; }
      .venue-org { margin-bottom: 6px; }
      .num-col { text-align: left; }
      .cell-chevron { display: none; }
      /* Hide numeric columns on mobile */
      .col-hide-mobile { display: none; }
    }
  </style>
</head>
<body>
  \
  
  <main class="super-admin-main">
    <div class="page-header">
      <div>
        <h1>All Venues</h1>
        <p class="page-sub">Command centre for all venues across the system.</p>
      </div>
      <a class="btn-primary" href="venue-02-details.html" style="text-decoration: none;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        New venue
      </a>
    </div>

    <div class="toolbar">
      <div class="search-field">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        <input type="text" id="searchInput" placeholder="Search venues..." />
      </div>
    </div>

    <div class="content-card">
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Venue</th>
              <th class="num-col">Transactions</th>
              <th class="num-col">Total volume</th>
              <th>Last activity</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="venueRows">
            <!-- Populated via JS -->
          </tbody>
        </table>
      </div>
      <div class="empty-state" id="emptyState">No venues match your search.</div>
    </div>
  </main>
  
  <script src="dashboard-app.js"></script>
  <script>
    // Known venues map
    const venueMap = [
      { name: 'Riverside RSL Club', org: 'Riverside Leagues Ltd' },
      { name: 'Riverside Grand Bistro', org: 'Riverside Dining' },
      { name: 'Riverside Lounge & Bar', org: 'Riverside Entertainment' },
      { name: 'Riverside Leisure Center', org: 'Riverside Entertainment' },
      { name: 'Northside Leagues Club', org: 'Northside Community Club' },
      { name: 'Harbourview Hotel', org: 'Harbourview Hospitality Group' }
    ];
    
    // Compute stats from mock data
    const venueStats = {};
    venueMap.forEach(v => {
      venueStats[v.name] = { txCount: 0, totalVolume: 0, lastActivityDate: null };
    });
    
    if (typeof payouts !== 'undefined') {
      payouts.forEach(p => {
        if (!venueStats[p.venue]) {
          venueStats[p.venue] = { txCount: 0, totalVolume: 0, lastActivityDate: null };
          venueMap.push({ name: p.venue, org: 'Unknown Organization' });
        }
        
        venueStats[p.venue].txCount++;
        venueStats[p.venue].totalVolume += p.amount;
        
        // Parse date for last activity
        const pDate = new Date(p.created.replace(/([A-Z]{2})$/, ' \')); // Try to parse 'Jul 13, 2026 11:47AM'
        if (!venueStats[p.venue].lastActivityDate || pDate > venueStats[p.venue].lastActivityDate) {
          if (!isNaN(pDate.getTime())) {
            venueStats[p.venue].lastActivityDate = pDate;
          }
        }
      });
    }
    
    const tbody = document.getElementById('venueRows');
    
    // Format currency
    const formatCurr = (amt) => new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(amt);
    
    // Render rows
    venueMap.forEach(v => {
      const stats = venueStats[v.name];
      const volStr = stats.totalVolume > 0 ? formatCurr(stats.totalVolume) : '';
      const lastActStr = stats.lastActivityDate 
        ? stats.lastActivityDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '-';
      
      const tr = document.createElement('tr');
      tr.dataset.name = v.name;
      tr.dataset.org = v.org;
      
      tr.innerHTML = \
        <td>
          <div class="venue-name">\</div>
          <div class="venue-org">\</div>
        </td>
        <td class="num-col tabular col-hide-mobile">\</td>
        <td class="num-col tabular col-hide-mobile">\</td>
        <td class="col-hide-mobile">\</td>
        <td class="cell-chevron"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg></td>
      \;
      
      tr.addEventListener('click', () => {
        sessionStorage.setItem('venueConfigData', JSON.stringify({
          venueName: v.name,
          orgName: v.org
        }));
        window.location.href = 'venue-settings.html';
      });
      
      tbody.appendChild(tr);
    });
    
    // Search logic
    const searchInput = document.getElementById('searchInput');
    const emptyState = document.getElementById('emptyState');
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      let visible = 0;
      document.querySelectorAll('#venueRows tr').forEach(row => {
        const match = row.dataset.name.toLowerCase().includes(q) || row.dataset.org.toLowerCase().includes(q);
        row.style.display = match ? '' : 'none';
        if (match) visible++;
      });
      emptyState.style.display = visible === 0 ? 'block' : 'none';
    });
  </script>
</body>
</html>\;

fs.writeFileSync('super-admin.html', html);
