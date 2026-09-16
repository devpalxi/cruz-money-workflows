const fs = require('fs');
const path = require('path');

const approver2Path = path.join(__dirname, '..', 'Approver2', 'approver2.html');
const approver3Path = path.join(__dirname, 'approver3.html');

let html = fs.readFileSync(approver2Path, 'utf-8');

// 1. Google Fonts + Executive Light Cockpit CSS
const cockpitCSS = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">

<style id="executive-cockpit-theme">
    /* Reset & Base Canvas */
    body, html {
        background-color: #f8fafc !important; /* Slate 50 */
        color: #0f172a !important; /* Slate 900 */
        font-family: 'Plus Jakarta Sans', sans-serif !important;
        -webkit-font-smoothing: antialiased;
    }

    h1, h2, h3, h4, h5, h6, .display-heading {
        font-family: 'Cabinet Grotesk', 'Plus Jakarta Sans', sans-serif !important;
        font-weight: 800 !important;
        letter-spacing: -0.03em !important;
        color: #0f172a !important;
    }
    
    .font-mono {
        font-family: 'JetBrains Mono', monospace !important;
    }

    /* Executive 3-Column Layout */
    .cockpit-container {
        max-width: 1600px;
        margin: 0 auto;
        padding: 2rem 1.5rem;
    }

    .cockpit-grid {
        display: grid;
        grid-template-columns: 340px 1fr 340px;
        gap: 1.5rem;
        align-items: start;
    }

    @media (max-width: 1280px) {
        .cockpit-grid {
            grid-template-columns: 300px 1fr;
        }
        .cockpit-col-right {
            grid-column: span 2;
        }
    }

    @media (max-width: 860px) {
        .cockpit-grid {
            grid-template-columns: 1fr;
        }
        .cockpit-col-right {
            grid-column: span 1;
        }
    }

    /* Executive White Cards */
    .cockpit-card {
        background: #ffffff !important;
        border: 1px solid #e2e8f0 !important;
        border-radius: 1rem !important;
        padding: 1.5rem !important;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.02), 0 10px 25px -5px rgba(0, 0, 0, 0.03) !important;
        margin-bottom: 1.5rem;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .cockpit-card:hover {
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 15px 30px -5px rgba(0, 0, 0, 0.05) !important;
    }

    /* Header Nav */
    .cockpit-nav {
        background: #ffffff;
        border-bottom: 1px solid #e2e8f0;
        padding: 1rem 2rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: sticky;
        top: 0;
        z-index: 50;
    }

    /* Primary CTAs */
    .btn-approve-primary {
        background: #2563eb !important;
        color: #ffffff !important;
        border-radius: 0.75rem !important;
        font-weight: 700 !important;
        padding: 1rem 1.5rem !important;
        width: 100%;
        text-align: center;
        border: none !important;
        box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.35) !important;
        transition: all 0.2s ease !important;
        cursor: pointer;
        display: block;
    }
    .btn-approve-primary:hover {
        background: #1d4ed8 !important;
        transform: translateY(-1px);
        box-shadow: 0 6px 20px 0 rgba(37, 99, 235, 0.45) !important;
    }

    /* Status Pills */
    .pill-badge {
        display: inline-flex;
        align-items: center;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    .pill-awaiting {
        background: #eff6ff;
        color: #1d4ed8;
        border: 1px solid #bfdbfe;
    }
    .pill-pass {
        background: #ecfdf5;
        color: #047857;
        border: 1px solid #a7f3d0;
    }

    /* Modal Backdrop */
    #details-modal {
        z-index: 99999 !important;
        background-color: rgba(15, 23, 42, 0.6) !important;
        backdrop-filter: blur(6px) !important;
    }
</style>
`;

html = html.replace('</head>', cockpitCSS + '\n</head>');

// 2. Build New 3-Column HTML Body Statically
const newBodyHTML = `
<body>
    <!-- Executive Top Command Nav -->
    <nav class="cockpit-nav">
        <div class="flex items-center gap-4">
            <a href="https://payouts-uat.cruz.tech/">
                <img src="https://payouts-uat.cruz.tech/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.7bd42417.png&w=256&q=75" alt="Logo" class="h-8 w-auto">
            </a>
            <div class="h-5 w-px bg-slate-200"></div>
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Payout Approval Cockpit</span>
        </div>
        <div class="flex items-center gap-6 text-sm">
            <a href="https://payouts-uat.cruz.tech/" class="font-semibold text-slate-600 hover:text-slate-900">Dashboard</a>
            <div class="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                <div class="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">M</div>
                <span class="font-bold text-xs text-slate-800">m.santos</span>
            </div>
        </div>
    </nav>

    <!-- Main 3-Column Cockpit Container -->
    <div class="cockpit-container">
        <!-- Hero Title Bar -->
        <div class="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
            <div>
                <span class="text-xs font-bold text-blue-600 uppercase tracking-widest">Payout Execution #578</span>
                <h1 class="text-3xl font-extrabold text-slate-900 mt-1">Payout Review &amp; Compliance Authorization</h1>
            </div>
            <div class="flex items-center gap-3">
                <span class="pill-badge pill-awaiting">Awaiting Approval</span>
                <button type="button" id="collapse-all-btn" onclick="toggleAllCards()" class="px-4 py-2 text-xs font-bold rounded-lg bg-white border border-slate-200 text-slate-700 shadow-sm hover:bg-slate-50 transition-all flex items-center gap-1.5">
                    <span>Collapse All Cards</span><span class="text-[10px]">▲</span>
                </button>
            </div>
        </div>

        <div class="cockpit-grid">
            <!-- Left Column: Player Context & Primary Action -->
            <div class="cockpit-col-left">
                <div class="cockpit-card">
                    <div class="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100">
                        <div class="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 font-extrabold text-xl flex items-center justify-center">
                            ST
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-slate-900">STACY K TESTTWENTY</h3>
                            <p class="text-xs font-mono text-slate-500">stacy@gmail.com</p>
                        </div>
                    </div>

                    <div class="space-y-3 font-mono text-sm mb-6">
                        <div class="flex justify-between py-1 border-b border-slate-100">
                            <span class="text-xs text-slate-500 font-sans uppercase">Membership ID</span>
                            <span class="font-bold text-slate-900">3829F</span>
                        </div>
                        <div class="flex justify-between py-1 border-b border-slate-100">
                            <span class="text-xs text-slate-500 font-sans uppercase">Cash Amount</span>
                            <span class="font-bold text-slate-900">$500.00</span>
                        </div>
                        <div class="flex justify-between py-1 border-b border-slate-100">
                            <span class="text-xs text-slate-500 font-sans uppercase">Transfer Amount</span>
                            <span class="font-bold text-blue-600">$1,000.00</span>
                        </div>
                        <div class="flex justify-between py-1">
                            <span class="text-xs text-slate-500 font-sans uppercase">Requested</span>
                            <span class="text-xs text-slate-700">14/07/2026, 7:09 am</span>
                        </div>
                    </div>

                    <!-- Primary Action CTA -->
                    <button type="button" id="approve-btn" class="btn-approve-primary">
                        Approve Payout
                    </button>
                </div>
            </div>

            <!-- Center Column: AML & IDV Verification Cockpit -->
            <div class="cockpit-col-center">
                <!-- AML Screening Card -->
                <div class="cockpit-card card-collapsible">
                    <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                        <div>
                            <span class="text-[10px] font-extrabold uppercase tracking-widest text-amber-600">Risk Assessment</span>
                            <h3 class="text-xl font-bold text-slate-900">AML Screening &amp; Match Resolution</h3>
                        </div>

                        <!-- Scenario Switcher -->
                        <div class="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200">
                            <button onclick="switchAMLScenario('hit')" id="btn-scen-hit" class="px-3 py-1 text-xs font-bold rounded-full bg-white shadow-sm text-slate-900 transition-all">All Hits</button>
                            <button onclick="switchAMLScenario('mixed')" id="btn-scen-mixed" class="px-3 py-1 text-xs font-bold rounded-full text-slate-500 hover:text-slate-900 transition-all">Mixed</button>
                            <button onclick="switchAMLScenario('clear')" id="btn-scen-clear" class="px-3 py-1 text-xs font-bold rounded-full text-slate-500 hover:text-slate-900 transition-all">All Clear</button>
                        </div>
                    </div>

                    <div class="card-body space-y-4">
                        <!-- PEP Row -->
                        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div id="pep-icon-bg" class="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold">!</div>
                                <div>
                                    <h4 id="pep-title" class="font-bold text-slate-900 text-base">PEP - Active Hits</h4>
                                    <p id="pep-subtitle" class="text-xs text-slate-500">Possible Match Detected in WorldCheck</p>
                                </div>
                            </div>
                            <div id="pep-action-container">
                                <button type="button" id="pep-action-btn" class="px-4 py-2 text-xs font-bold rounded-full bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-all" onclick="openDetailsModal('pep')">Action Required</button>
                            </div>
                        </div>

                        <!-- Sanctions Row -->
                        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div id="sanc-icon-bg" class="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold">!</div>
                                <div>
                                    <h4 id="sanc-title" class="font-bold text-slate-900 text-base">Sanctions - Active Hits</h4>
                                    <p id="sanc-subtitle" class="text-xs text-slate-500">Possible Match Detected in Global Watchlist</p>
                                </div>
                            </div>
                            <div id="sanc-action-container">
                                <button type="button" id="sanctions-action-btn" class="px-4 py-2 text-xs font-bold rounded-full bg-red-100 text-red-900 border border-red-300 hover:bg-red-200 transition-all" onclick="openDetailsModal('sanctions')">Action Required</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- IDV History Card -->
                <div class="cockpit-card card-collapsible">
                    <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                        <div>
                            <span class="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">Verification Trail</span>
                            <h3 class="text-xl font-bold text-slate-900">Identity Verification (IDV) History</h3>
                        </div>
                        <span class="pill-badge pill-pass">Pass</span>
                    </div>

                    <div class="card-body overflow-x-auto">
                        <table class="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr class="text-xs uppercase text-slate-400 border-b border-slate-200">
                                    <th class="py-2 pr-4 font-semibold">Document &amp; Verification
                                    <th class="py-2 pr-4 font-semibold">Timestamp
                                    <th class="py-2 font-semibold">Status
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 font-mono text-xs">
                                <tr>
                                    <td class="py-3 pr-4 font-semibold text-slate-800">Australia Passport IDV</td>
                                    <td class="py-3 pr-4 text-slate-500">14 July 2026, 11:41 am</td>
                                    <td class="py-3"><span class="text-emerald-600 font-bold">PASS</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Right Column: Details & Collector Intelligence -->
            <div class="cockpit-col-right">
                <!-- Payout Breakdown Card -->
                <div class="cockpit-card card-collapsible">
                    <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                        <h3 class="text-lg font-bold text-slate-900">Payout Details</h3>
                    </div>
                    <div class="card-body space-y-2.5 font-mono text-xs">
                        <div class="flex justify-between py-1 border-b border-slate-100">
                            <span class="text-slate-500 font-sans">Transaction ID</span>
                            <span class="font-bold text-slate-800">213</span>
                        </div>
                        <div class="flex justify-between py-1 border-b border-slate-100">
                            <span class="text-slate-500 font-sans">Machine ID</span>
                            <span class="font-bold text-slate-800">EGM-002</span>
                        </div>
                        <div class="flex justify-between py-1 border-b border-slate-100">
                            <span class="text-slate-500 font-sans">IDV Status</span>
                            <span class="text-emerald-600 font-bold">PASS</span>
                        </div>
                        <div class="flex justify-between py-1">
                            <span class="text-slate-500 font-sans">AML Status</span>
                            <span id="summary-aml-status" class="text-amber-600 font-bold">ACTION REQUIRED</span>
                        </div>
                    </div>
                </div>

                <!-- Collector Card -->
                <div class="cockpit-card card-collapsible">
                    <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                        <h3 class="text-lg font-bold text-slate-900">Collector</h3>
                    </div>
                    <div class="card-body flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm border border-slate-200">
                            ST
                        </div>
                        <div>
                            <h4 class="font-bold text-slate-900 text-sm">STACY K TESTTWENTY</h4>
                            <p class="text-xs text-slate-500">Authorized Collector</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Match Resolution Modal -->
    <div id="details-modal" style="display: none; position: fixed; inset: 0; z-index: 99999; align-items: center; justify-content: center; background-color: rgba(15, 23, 42, 0.6); backdrop-filter: blur(6px);">
        <div class="w-full max-w-3xl mx-4 overflow-hidden flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200" style="max-height: 90vh;">
            
            <div class="flex justify-between items-center p-5 border-b border-slate-200 bg-slate-50">
                <h3 class="font-bold text-lg text-slate-900" id="modal-title">Resolve Match</h3>
                <button onclick="closeDetailsModal()" class="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>

            <div class="p-6 overflow-y-auto flex-1 space-y-6">
                <!-- PEP Content -->
                <div id="pep-modal-content" style="display: none; flex-direction: column; gap: 1.5rem;">
                    <div class="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs">
                        <div>
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Player Profile</span>
                            <div class="mt-2 space-y-1">
                                <div><span class="text-slate-500">Name:</span> <strong class="text-slate-900">STACY K TESTTWENTY</strong></div>
                                <div><span class="text-slate-500">DOB:</span> <strong class="text-slate-900">15/08/1980</strong></div>
                                <div><span class="text-slate-500">Country:</span> <strong class="text-slate-900">Australia (AU)</strong></div>
                            </div>
                        </div>
                        <div>
                            <span class="text-[10px] font-bold text-amber-600 uppercase tracking-wider font-sans">WorldCheck Profile</span>
                            <div class="mt-2 space-y-1">
                                <div><span class="text-slate-500">Match Type:</span> <strong class="text-amber-700">Fuzzy Match</strong></div>
                                <div><span class="text-slate-500">Name:</span> <strong class="text-slate-900">Stacy Test-Twenty</strong></div>
                                <div><span class="text-slate-500">DOB:</span> <strong class="text-slate-900">15/08/1980</strong></div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label class="block font-bold text-xs uppercase tracking-wider text-slate-600 mb-2">Determination</label>
                        <input type="hidden" id="pep-status" value="">
                        <div class="flex gap-3">
                            <button type="button" id="btn-pep-match" onclick="setPEPStatus('match')" class="px-4 py-2 text-xs font-bold border border-slate-200 rounded-full text-slate-700 bg-white hover:bg-slate-100">Confirm Match</button>
                            <button type="button" id="btn-pep-false" onclick="setPEPStatus('false_positive')" class="px-4 py-2 text-xs font-bold border border-slate-200 rounded-full text-slate-700 bg-white hover:bg-slate-100">Disprove - False Positive</button>
                        </div>
                    </div>

                    <div>
                        <label class="block font-bold text-xs uppercase tracking-wider text-slate-600 mb-2">Investigation Notes *</label>
                        <textarea id="pep-notes" rows="3" class="w-full border border-slate-200 rounded-xl p-3 text-sm resize-none focus:ring-2 focus:ring-blue-600 focus:outline-none" placeholder="Detail determination reasoning..." oninput="checkApprovalState()"></textarea>
                    </div>
                </div>

                <!-- Sanctions Content -->
                <div id="sanctions-modal-content" style="display: none; flex-direction: column; gap: 1.5rem;">
                    <div class="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs">
                        <div>
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Player Profile</span>
                            <div class="mt-2 space-y-1">
                                <div><span class="text-slate-500">Name:</span> <strong class="text-slate-900">STACY K TESTTWENTY</strong></div>
                                <div><span class="text-slate-500">DOB:</span> <strong class="text-slate-900">15/08/1980</strong></div>
                            </div>
                        </div>
                        <div>
                            <span class="text-[10px] font-bold text-red-600 uppercase tracking-wider font-sans">Watchlist Record</span>
                            <div class="mt-2 space-y-1">
                                <div><span class="text-slate-500">Match Type:</span> <strong class="text-red-700">Token Match</strong></div>
                                <div><span class="text-slate-500">Name:</span> <strong class="text-slate-900">STACY TEST</strong></div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label class="block font-bold text-xs uppercase tracking-wider text-slate-600 mb-2">Determination</label>
                        <input type="hidden" id="sanctions-status" value="">
                        <div class="flex gap-3">
                            <button type="button" id="btn-sanc-match" onclick="setSanctionsStatus('match')" class="px-4 py-2 text-xs font-bold border border-slate-200 rounded-full text-slate-700 bg-white hover:bg-slate-100">Confirm Match</button>
                            <button type="button" id="btn-sanc-false" onclick="setSanctionsStatus('false_positive')" class="px-4 py-2 text-xs font-bold border border-slate-200 rounded-full text-slate-700 bg-white hover:bg-slate-100">Disprove - False Positive</button>
                        </div>
                    </div>

                    <div>
                        <label class="block font-bold text-xs uppercase tracking-wider text-slate-600 mb-2">Investigation Notes *</label>
                        <textarea id="sanctions-notes" rows="3" class="w-full border border-slate-200 rounded-xl p-3 text-sm resize-none focus:ring-2 focus:ring-blue-600 focus:outline-none" placeholder="Detail determination reasoning..." oninput="checkApprovalState()"></textarea>
                    </div>
                </div>
            </div>

            <div class="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
                <button onclick="closeDetailsModal()" class="bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-md hover:bg-blue-700 transition-colors">Save &amp; Close</button>
            </div>
        </div>
    </div>

    <!-- Static JS for Cards & Modals -->
    <script>
    let isAllCollapsed = false;

    function toggleAllCards() {
        isAllCollapsed = !isAllCollapsed;
        const btn = document.getElementById('collapse-all-btn');
        const cardBodies = document.querySelectorAll('.card-body');
        
        cardBodies.forEach(body => {
            body.style.display = isAllCollapsed ? 'none' : 'block';
        });

        if (btn) {
            const textSpan = btn.querySelector('span:first-child');
            const iconSpan = btn.querySelector('span:last-child');
            if (textSpan) textSpan.textContent = isAllCollapsed ? 'Expand All Cards' : 'Collapse All Cards';
            if (iconSpan) iconSpan.textContent = isAllCollapsed ? '▼' : '▲';
        }
    }

    function openDetailsModal(type) {
        const modal = document.getElementById('details-modal');
        if (!modal) return;
        modal.style.display = 'flex';
        document.getElementById('pep-modal-content').style.display = type === 'pep' ? 'flex' : 'none';
        document.getElementById('sanctions-modal-content').style.display = type === 'sanctions' ? 'flex' : 'none';
        document.getElementById('modal-title').innerText = type === 'pep' ? 'Resolve Match: PEP' : 'Resolve Match: Sanctions';
    }

    function closeDetailsModal() {
        const modal = document.getElementById('details-modal');
        if (modal) modal.style.display = 'none';
    }

    function setPEPStatus(val) {
        document.getElementById('pep-status').value = val;
        document.getElementById('btn-pep-match').className = val === 'match' ? 'px-4 py-2 text-xs font-bold border border-red-300 rounded-full text-white bg-red-600' : 'px-4 py-2 text-xs font-bold border border-slate-200 rounded-full text-slate-700 bg-white hover:bg-slate-100';
        document.getElementById('btn-pep-false').className = val === 'false_positive' ? 'px-4 py-2 text-xs font-bold border border-emerald-300 rounded-full text-white bg-emerald-600' : 'px-4 py-2 text-xs font-bold border border-slate-200 rounded-full text-slate-700 bg-white hover:bg-slate-100';
    }

    function setSanctionsStatus(val) {
        document.getElementById('sanctions-status').value = val;
        document.getElementById('btn-sanc-match').className = val === 'match' ? 'px-4 py-2 text-xs font-bold border border-red-300 rounded-full text-white bg-red-600' : 'px-4 py-2 text-xs font-bold border border-slate-200 rounded-full text-slate-700 bg-white hover:bg-slate-100';
        document.getElementById('btn-sanc-false').className = val === 'false_positive' ? 'px-4 py-2 text-xs font-bold border border-emerald-300 rounded-full text-white bg-emerald-600' : 'px-4 py-2 text-xs font-bold border border-slate-200 rounded-full text-slate-700 bg-white hover:bg-slate-100';
    }

    function switchAMLScenario(scenario) {
        const btns = ['hit', 'mixed', 'clear'];
        btns.forEach(b => {
            const btn = document.getElementById('btn-scen-' + b);
            if (btn) {
                btn.className = b === scenario ? 'px-3 py-1 text-xs font-bold rounded-full bg-white shadow-sm text-slate-900 transition-all' : 'px-3 py-1 text-xs font-bold rounded-full text-slate-500 hover:text-slate-900 transition-all';
            }
        });

        const pepContainer = document.getElementById('pep-action-container');
        const sancContainer = document.getElementById('sanc-action-container');
        const summaryAML = document.getElementById('summary-aml-status');

        if (scenario === 'hit') {
            if (pepContainer) pepContainer.innerHTML = '<button type="button" id="pep-action-btn" class="px-4 py-2 text-xs font-bold rounded-full bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-all" onclick="openDetailsModal(\\'pep\\')">Action Required</button>';
            if (sancContainer) sancContainer.innerHTML = '<button type="button" id="sanctions-action-btn" class="px-4 py-2 text-xs font-bold rounded-full bg-red-100 text-red-900 border border-red-300 hover:bg-red-200 transition-all" onclick="openDetailsModal(\\'sanctions\\')">Action Required</button>';
            if (summaryAML) { summaryAML.textContent = 'ACTION REQUIRED'; summaryAML.className = 'text-amber-600 font-bold'; }
        } else if (scenario === 'mixed') {
            if (pepContainer) pepContainer.innerHTML = '<span class="pill-badge pill-pass">Pass</span>';
            if (sancContainer) sancContainer.innerHTML = '<button type="button" id="sanctions-action-btn" class="px-4 py-2 text-xs font-bold rounded-full bg-red-100 text-red-900 border border-red-300 hover:bg-red-200 transition-all" onclick="openDetailsModal(\\'sanctions\\')">Action Required</button>';
            if (summaryAML) { summaryAML.textContent = 'ACTION REQUIRED'; summaryAML.className = 'text-amber-600 font-bold'; }
        } else if (scenario === 'clear') {
            if (pepContainer) pepContainer.innerHTML = '<span class="pill-badge pill-pass">Pass</span>';
            if (sancContainer) sancContainer.innerHTML = '<span class="pill-badge pill-pass">Pass</span>';
            if (summaryAML) { summaryAML.textContent = 'PASS'; summaryAML.className = 'text-emerald-600 font-bold'; }
        }
    }
    </script>
</body>
`;

// Replace full body in HTML
const bodyRegex = /<body[\s\S]*<\/html>/;
html = html.replace(bodyRegex, newBodyHTML + '\n</html>');

fs.writeFileSync(approver3Path, html);
console.log('Successfully compiled Executive 3-Column Cockpit layout statically into approver3.html');
