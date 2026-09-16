const fs = require('fs');

const htmlFile = 'd:\\DN-75\\Edu\\DN\\Palxi\\Project 3\\Approver3\\approver3.html';
let html = fs.readFileSync(htmlFile, 'utf8');

// 1. Add new fonts and CSS to the head
const newStyles = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700;800&display=swap" rel="stylesheet">
<style>
    :root {
        --brand-teal: #1A6B6B;
        --brand-teal-dark: #134e4e;
        --brand-teal-light: rgba(26, 107, 107, 0.1);
        --brand-amber: #F5A623;
        --bg-surface: #f9fafb;
    }
    
    body {
        font-family: 'Plus Jakarta Sans', sans-serif;
    }
    h1, h2, h3, h4, h5, h6 {
        font-family: 'Outfit', sans-serif;
        letter-spacing: -0.02em;
    }
    .font-mono {
        font-family: 'JetBrains Mono', monospace;
    }
    
    /* Double Bezel Card */
    .double-bezel {
        background-color: rgba(0,0,0,0.02);
        padding: 0.375rem;
        border-radius: 1.25rem;
        border: 1px solid rgba(0,0,0,0.05);
    }
    .double-bezel-inner {
        background-color: #ffffff;
        border-radius: calc(1.25rem - 0.375rem);
        box-shadow: inset 0 1px 1px rgba(255,255,255,0.8), 0 4px 20px -5px rgba(0,0,0,0.05);
        padding: 1.5rem;
    }
    
    /* Liquid Glass Modal */
    .liquid-modal {
        background-color: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border: 1px solid rgba(255, 255, 255, 0.4);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255,255,255,0.6);
        border-radius: 1.5rem;
    }
    
    /* Frankione Mapping Grid */
    .frankione-grid {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.5rem 1rem;
        align-items: center;
        font-size: 0.875rem;
    }
    .frankione-label {
        color: #64748b;
        font-weight: 500;
    }
    .frankione-value {
        color: #0f172a;
        font-weight: 600;
    }
    .frankione-badge {
        display: inline-flex;
        align-items: center;
        padding: 0.125rem 0.5rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    
    /* Magnetic Button Hover Physics simulation */
    .btn-spring {
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
    }
    .btn-spring:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
    }
    .btn-spring:active {
        transform: translateY(1px) scale(0.98);
    }

    /* Noise overlay */
    .noise-overlay {
        position: fixed;
        inset: 0;
        z-index: 9999;
        pointer-events: none;
        opacity: 0.03;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    }
</style>
`;
html = html.replace('</title>', '</title>\n' + newStyles);
html = html.replace('<body>', '<body>\n<div class="noise-overlay"></div>');

// 2. Replace AML Screening section
const amlSectionRegex = /<div><h4 class="mb-3 text-sm font-semibold text-textPrimary">AML Screening<\/h4>[\s\S]*?(?=<\/div>\s*<\/div>\s*<\/div>\s*<button class="flex w-full)/;

const newAmlSection = `
<div class="mt-6 mb-6">
    <div class="flex items-center justify-between mb-4">
        <h4 class="text-lg font-bold text-gray-900" style="font-family: 'Outfit', sans-serif;">AML Screening</h4>
        
        <!-- Scenario Switcher -->
        <div class="flex items-center bg-gray-100 p-1 rounded-full border border-gray-200">
            <button onclick="switchAMLScenario('hit')" id="btn-scen-hit" class="px-4 py-1.5 text-xs font-bold rounded-full bg-white shadow-sm text-gray-800 transition-all">All Hits</button>
            <button onclick="switchAMLScenario('mixed')" id="btn-scen-mixed" class="px-4 py-1.5 text-xs font-bold rounded-full text-gray-500 hover:text-gray-700 transition-all">Mixed</button>
            <button onclick="switchAMLScenario('clear')" id="btn-scen-clear" class="px-4 py-1.5 text-xs font-bold rounded-full text-gray-500 hover:text-gray-700 transition-all">All Clear</button>
        </div>
    </div>
    
    <div class="space-y-4" id="aml-container">
        <!-- PEP Item -->
        <div class="double-bezel">
            <div class="double-bezel-inner flex flex-col gap-3">
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-3">
                        <div id="pep-icon-bg" class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                            <span id="pep-icon" class="text-amber-600 font-bold">!</span>
                        </div>
                        <div>
                            <h5 id="pep-title" class="font-bold text-gray-900 text-base">PEP - Active Hits</h5>
                            <p id="pep-subtitle" class="text-sm text-gray-500">Possible Match Detected</p>
                        </div>
                    </div>
                    <div id="pep-action-container">
                        <button type="button" id="pep-action-btn" class="btn-spring px-4 py-2 text-sm rounded-full font-bold transition-colors bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200" onclick="openDetailsModal('pep')">Action Required</button>
                    </div>
                </div>
                
                <!-- Inline Frankione Mapping Preview (Shown on hit) -->
                <div id="pep-frankione-inline" class="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <span class="text-xs font-semibold uppercase tracking-wider text-gray-400">Match Profile</span>
                        <div class="h-4 w-px bg-gray-300"></div>
                        <span class="text-sm font-bold text-gray-800">Stacy Test-Twenty</span>
                        <span class="text-xs text-gray-500">AU</span>
                    </div>
                    <span class="frankione-badge bg-amber-100 text-amber-800">Fuzzy</span>
                </div>
            </div>
        </div>

        <!-- Sanctions Item -->
        <div class="double-bezel">
            <div class="double-bezel-inner flex flex-col gap-3">
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-3">
                        <div id="sanc-icon-bg" class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                            <span id="sanc-icon" class="text-red-600 font-bold">!</span>
                        </div>
                        <div>
                            <h5 id="sanc-title" class="font-bold text-gray-900 text-base">Sanctions - Active Hits</h5>
                            <p id="sanc-subtitle" class="text-sm text-gray-500">Possible Match Detected</p>
                        </div>
                    </div>
                    <div id="sanc-action-container">
                        <button type="button" id="sanctions-action-btn" class="btn-spring px-4 py-2 text-sm rounded-full font-bold transition-colors bg-red-100 text-red-800 border border-red-200 hover:bg-red-200" onclick="openDetailsModal('sanctions')">Action Required</button>
                    </div>
                </div>
                
                <!-- Inline Frankione Mapping Preview (Shown on hit) -->
                <div id="sanc-frankione-inline" class="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <span class="text-xs font-semibold uppercase tracking-wider text-gray-400">Match Profile</span>
                        <div class="h-4 w-px bg-gray-300"></div>
                        <span class="text-sm font-bold text-gray-800">STACY TEST</span>
                        <span class="text-xs text-gray-500">USA</span>
                    </div>
                    <span class="frankione-badge bg-amber-100 text-amber-800">Token Match</span>
                </div>
            </div>
        </div>
    </div>
</div>
`;
html = html.replace(amlSectionRegex, newAmlSection);

// 3. Replace Details Modal
const modalRegex = /<div id="details-modal"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<next-route-announcer>/;

const newModal = `
<!-- Enhanced Liquid Glass Modal with Frankione Mapping -->
<div id="details-modal" style="display: none; position: fixed; inset: 0; z-index: 50; align-items: center; justify-content: center; background-color: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px);">
    <div class="liquid-modal w-full max-w-4xl mx-4 overflow-hidden flex flex-col" style="max-height: 90vh;">
        
        <div class="flex justify-between items-center p-5 border-b border-gray-200/50 bg-white/50">
            <h3 class="font-bold text-xl text-gray-900" style="font-family: 'Outfit', sans-serif;" id="modal-title">Resolve Match</h3>
            <button onclick="closeDetailsModal()" class="text-gray-400 hover:text-gray-600 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>

        <div class="p-6 overflow-y-auto" id="modal-content">
            <!-- PEP Content -->
            <div id="pep-modal-content" class="hidden flex-col gap-6">
                <!-- Frankione Mapping Block -->
                <div>
                    <h4 class="text-sm font-bold uppercase tracking-wider text-[var(--brand-teal)] mb-3">Identity Mapping (Frankione)</h4>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Submitted Player Data</div>
                            <div class="frankione-grid">
                                <span class="frankione-label">Full Name</span> <span class="frankione-value">STACY K TESTTWENTY</span>
                                <span class="frankione-label">DOB</span> <span class="frankione-value">15/08/1980</span>
                                <span class="frankione-label">Location</span> <span class="frankione-value">Sydney, AU</span>
                            </div>
                        </div>
                        
                        <div class="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                            <div class="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                            <div class="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
                                <div class="text-xs font-bold text-gray-500 uppercase tracking-wider">Matched Record (DFAT)</div>
                                <span class="frankione-badge bg-amber-100 text-amber-800">Fuzzy Match</span>
                            </div>
                            <div class="frankione-grid">
                                <span class="frankione-label">Full Name</span> <span class="frankione-value text-amber-700">Stacy Test-Twenty</span>
                                <span class="frankione-label">DOB</span> <span class="frankione-value text-gray-400 italic">Not Provided</span>
                                <span class="frankione-label">Location</span> <span class="frankione-value">AU</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Resolution Actions -->
                <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <label class="block font-bold text-sm text-gray-700 mb-3">Resolution Decision</label>
                    <input type="hidden" id="pep-status" value="">
                    <div class="flex flex-wrap gap-3">
                        <button type="button" id="btn-pep-domestic" onclick="setPepStatus('domestic')" class="btn-spring px-5 py-2.5 text-sm font-bold border border-gray-200 rounded-full text-gray-600 bg-gray-50 hover:bg-gray-100">Domestic PEP</button>
                        <button type="button" id="btn-pep-foreign" onclick="setPepStatus('foreign')" class="btn-spring px-5 py-2.5 text-sm font-bold border border-gray-200 rounded-full text-gray-600 bg-gray-50 hover:bg-gray-100">Foreign PEP</button>
                        <button type="button" id="btn-pep-false" onclick="setPepStatus('false_positive')" class="btn-spring px-5 py-2.5 text-sm font-bold border border-gray-200 rounded-full text-gray-600 bg-gray-50 hover:bg-gray-100">Not a PEP</button>
                    </div>
                </div>

                <!-- Notes & Evidence -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <label class="block font-bold text-sm text-gray-700 mb-2">Investigation Notes *</label>
                        <textarea id="pep-notes" rows="3" class="w-full border-gray-200 rounded-lg p-3 text-sm focus:ring-[var(--brand-teal)] focus:border-[var(--brand-teal)] resize-none bg-gray-50" placeholder="Detail your OSI research findings..." oninput="checkApprovalState()"></textarea>
                    </div>
                    <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <label class="block font-bold text-sm text-gray-700 mb-2">Supporting Evidence</label>
                        <div class="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors h-[88px] flex flex-col items-center justify-center" onclick="document.getElementById('pep-upload').click()">
                            <svg class="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                            <span class="text-xs font-semibold text-gray-500">Upload Document</span>
                            <input type="file" id="pep-upload" class="hidden">
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sanctions Content -->
            <div id="sanctions-modal-content" class="hidden flex-col gap-6">
                <!-- Frankione Mapping Block -->
                <div>
                    <h4 class="text-sm font-bold uppercase tracking-wider text-[var(--brand-teal)] mb-3">Identity Mapping (Frankione)</h4>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Submitted Player Data</div>
                            <div class="frankione-grid">
                                <span class="frankione-label">Full Name</span> <span class="frankione-value">STACY K TESTTWENTY</span>
                                <span class="frankione-label">DOB</span> <span class="frankione-value">15/08/1980</span>
                                <span class="frankione-label">Location</span> <span class="frankione-value">Sydney, AU</span>
                            </div>
                        </div>
                        
                        <div class="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                            <div class="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                            <div class="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
                                <div class="text-xs font-bold text-gray-500 uppercase tracking-wider">Matched Record (WorldCheck)</div>
                                <span class="frankione-badge bg-amber-100 text-amber-800">Token Match</span>
                            </div>
                            <div class="frankione-grid">
                                <span class="frankione-label">Full Name</span> <span class="frankione-value text-amber-700">STACY TEST</span>
                                <span class="frankione-label">DOB</span> <span class="frankione-value">15/08/1980</span>
                                <span class="frankione-label">Location</span> <span class="frankione-value text-red-600">USA</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Resolution Actions -->
                <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <label class="block font-bold text-sm text-gray-700 mb-3">Resolution Decision</label>
                    <input type="hidden" id="sanctions-status" value="">
                    <div class="flex flex-wrap gap-3">
                        <button type="button" id="btn-sanc-match" onclick="setSanctionsStatus('match')" class="btn-spring px-5 py-2.5 text-sm font-bold border border-gray-200 rounded-full text-gray-600 bg-gray-50 hover:bg-gray-100">Confirm Match</button>
                        <button type="button" id="btn-sanc-false" onclick="setSanctionsStatus('false_positive')" class="btn-spring px-5 py-2.5 text-sm font-bold border border-gray-200 rounded-full text-gray-600 bg-gray-50 hover:bg-gray-100">Disprove - False Positive</button>
                    </div>
                </div>

                <!-- Notes & Evidence -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <label class="block font-bold text-sm text-gray-700 mb-2">Investigation Notes *</label>
                        <textarea id="sanctions-notes" rows="3" class="w-full border-gray-200 rounded-lg p-3 text-sm focus:ring-[var(--brand-teal)] focus:border-[var(--brand-teal)] resize-none bg-gray-50" placeholder="Detail determination reasoning..." oninput="checkApprovalState()"></textarea>
                    </div>
                    <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <label class="block font-bold text-sm text-gray-700 mb-2">Supporting Evidence</label>
                        <div class="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors h-[88px] flex flex-col items-center justify-center" onclick="document.getElementById('sanc-upload').click()">
                            <svg class="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                            <span class="text-xs font-semibold text-gray-500">Upload Document</span>
                            <input type="file" id="sanc-upload" class="hidden">
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="p-5 border-t border-gray-200/50 bg-white/50 flex justify-end">
            <button onclick="closeDetailsModal()" class="btn-spring bg-[var(--brand-teal)] text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-[var(--brand-teal-dark)] transition-colors">Save &amp; Close</button>
        </div>
    </div>
</div>
<next-route-announcer>
`;
html = html.replace(modalRegex, newModal);

// 4. Inject JS for the Scenario Switcher
const jsInjection = `
// State variable for scenario
let currentAMLScenario = 'hit';

function switchAMLScenario(scenario) {
    currentAMLScenario = scenario;
    
    // Update toggle buttons
    const btns = ['hit', 'mixed', 'clear'];
    btns.forEach(b => {
        const btn = document.getElementById('btn-scen-' + b);
        if (b === scenario) {
            btn.className = 'px-4 py-1.5 text-xs font-bold rounded-full bg-white shadow-sm text-gray-800 transition-all';
        } else {
            btn.className = 'px-4 py-1.5 text-xs font-bold rounded-full text-gray-500 hover:text-gray-700 transition-all';
        }
    });

    // Update PEP Row
    const pepTitle = document.getElementById('pep-title');
    const pepSub = document.getElementById('pep-subtitle');
    const pepActionBtn = document.getElementById('pep-action-btn');
    const pepIconBg = document.getElementById('pep-icon-bg');
    const pepIcon = document.getElementById('pep-icon');
    const pepInline = document.getElementById('pep-frankione-inline');
    const pepActionContainer = document.getElementById('pep-action-container');

    // Update Sanctions Row
    const sancTitle = document.getElementById('sanc-title');
    const sancSub = document.getElementById('sanc-subtitle');
    const sancActionBtn = document.getElementById('sanctions-action-btn');
    const sancIconBg = document.getElementById('sanc-icon-bg');
    const sancIcon = document.getElementById('sanc-icon');
    const sancInline = document.getElementById('sanc-frankione-inline');
    const sancActionContainer = document.getElementById('sanc-action-container');

    if (scenario === 'hit') {
        // Both Action Required
        pepTitle.textContent = 'PEP - Active Hits';
        pepTitle.className = 'font-bold text-gray-900 text-base';
        pepSub.textContent = 'Possible Match Detected';
        pepIconBg.className = 'w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center';
        pepIcon.innerHTML = '!';
        pepIcon.className = 'text-amber-600 font-bold';
        pepInline.style.display = 'flex';
        pepActionContainer.innerHTML = \`<button type="button" id="pep-action-btn" class="btn-spring px-4 py-2 text-sm rounded-full font-bold transition-colors bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200" onclick="openDetailsModal('pep')">Action Required</button>\`;

        sancTitle.textContent = 'Sanctions - Active Hits';
        sancTitle.className = 'font-bold text-gray-900 text-base';
        sancSub.textContent = 'Possible Match Detected';
        sancIconBg.className = 'w-10 h-10 rounded-full bg-red-100 flex items-center justify-center';
        sancIcon.innerHTML = '!';
        sancIcon.className = 'text-red-600 font-bold';
        sancInline.style.display = 'flex';
        sancActionContainer.innerHTML = \`<button type="button" id="sanctions-action-btn" class="btn-spring px-4 py-2 text-sm rounded-full font-bold transition-colors bg-red-100 text-red-800 border border-red-200 hover:bg-red-200" onclick="openDetailsModal('sanctions')">Action Required</button>\`;
    } 
    else if (scenario === 'mixed') {
        // PEP Pass, Sanctions Action
        pepTitle.textContent = 'PEP - Clear';
        pepTitle.className = 'font-bold text-gray-900 text-base';
        pepSub.textContent = 'No Matches Found / Resolved';
        pepIconBg.className = 'w-10 h-10 rounded-full bg-green-100 flex items-center justify-center';
        pepIcon.innerHTML = '✓';
        pepIcon.className = 'text-green-600 font-bold';
        pepInline.style.display = 'none';
        pepActionContainer.innerHTML = \`<span class="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold uppercase rounded-full border border-green-200">Pass</span>\`;

        sancTitle.textContent = 'Sanctions - Active Hits';
        sancTitle.className = 'font-bold text-gray-900 text-base';
        sancSub.textContent = 'Possible Match Detected';
        sancIconBg.className = 'w-10 h-10 rounded-full bg-red-100 flex items-center justify-center';
        sancIcon.innerHTML = '!';
        sancIcon.className = 'text-red-600 font-bold';
        sancInline.style.display = 'flex';
        sancActionContainer.innerHTML = \`<button type="button" id="sanctions-action-btn" class="btn-spring px-4 py-2 text-sm rounded-full font-bold transition-colors bg-red-100 text-red-800 border border-red-200 hover:bg-red-200" onclick="openDetailsModal('sanctions')">Action Required</button>\`;
    }
    else if (scenario === 'clear') {
        // Both Pass
        pepTitle.textContent = 'PEP - Clear';
        pepTitle.className = 'font-bold text-gray-900 text-base';
        pepSub.textContent = 'No Matches Found';
        pepIconBg.className = 'w-10 h-10 rounded-full bg-green-100 flex items-center justify-center';
        pepIcon.innerHTML = '✓';
        pepIcon.className = 'text-green-600 font-bold';
        pepInline.style.display = 'none';
        pepActionContainer.innerHTML = \`<span class="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold uppercase rounded-full border border-green-200">Pass</span>\`;

        sancTitle.textContent = 'Sanctions - Clear';
        sancTitle.className = 'font-bold text-gray-900 text-base';
        sancSub.textContent = 'No Matches Found';
        sancIconBg.className = 'w-10 h-10 rounded-full bg-green-100 flex items-center justify-center';
        sancIcon.innerHTML = '✓';
        sancIcon.className = 'text-green-600 font-bold';
        sancInline.style.display = 'none';
        sancActionContainer.innerHTML = \`<span class="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold uppercase rounded-full border border-green-200">Pass</span>\`;
    }
    
    // Re-evaluate approval state
    checkApprovalState();
}
`;

// Insert the JS function before the checkApprovalState declaration or at the top of the <script> block
html = html.replace('<script>', '<script>\n' + jsInjection);

// Modify checkApprovalState to take currentAMLScenario into account
const checkApprovalRegex = /function checkApprovalState\(\) \{[\s\S]*?\}/;
const newCheckApproval = `
function checkApprovalState() {
    const idConfirm = document.getElementById('idConfirm').checked;
    const approvalConfirm = document.getElementById('approvalConfirm').checked;
    const pepStatus = document.getElementById('pep-status').value;
    const pepNotes = document.getElementById('pep-notes') ? document.getElementById('pep-notes').value.trim() : '';
    const sancStatus = document.getElementById('sanctions-status').value;
    const sancNotes = document.getElementById('sanctions-notes') ? document.getElementById('sanctions-notes').value.trim() : '';
    const riskLevel = document.getElementById('approvalRiskLevel').value;
    
    let amlResolved = true;
    
    if (currentAMLScenario === 'hit') {
        const pepResolved = pepStatus !== '' && (pepStatus !== 'domestic' || pepNotes !== '') && (pepStatus !== 'foreign' || pepNotes !== '');
        const sancResolved = sancStatus !== '' && sancNotes !== '';
        amlResolved = pepResolved && sancResolved;
    } else if (currentAMLScenario === 'mixed') {
        const sancResolved = sancStatus !== '' && sancNotes !== '';
        amlResolved = sancResolved;
    } else if (currentAMLScenario === 'clear') {
        amlResolved = true;
    }

    const btn = document.getElementById('approve-btn');
    if (idConfirm && approvalConfirm && amlResolved && riskLevel !== 'Unknown') {
        btn.disabled = false;
        btn.classList.remove('disabled:opacity-50', 'bg-czPurple-500/50');
        // Apply premium styling for enabled state
        btn.style.backgroundColor = 'var(--brand-teal)';
        btn.style.boxShadow = '0 10px 15px -3px rgba(26, 107, 107, 0.3)';
        btn.style.transform = 'translateY(-2px)';
    } else {
        btn.disabled = true;
        btn.classList.add('disabled:opacity-50', 'bg-czPurple-500/50');
        btn.style.backgroundColor = '';
        btn.style.boxShadow = '';
        btn.style.transform = '';
    }
}
`;
html = html.replace(checkApprovalRegex, newCheckApproval);

// Also need to fix openDetailsModal if there is a display property assumption
const openModalRegex = /function openDetailsModal\(type\) \{[\s\S]*?\}/;
const newOpenModal = `
function openDetailsModal(type) {
    const modal = document.getElementById('details-modal');
    const title = document.getElementById('modal-title');
    const pepContent = document.getElementById('pep-modal-content');
    const sancContent = document.getElementById('sanctions-modal-content');
    
    if (type === 'pep') {
        title.textContent = 'Resolve PEP Match';
        pepContent.style.display = 'flex';
        sancContent.style.display = 'none';
    } else if (type === 'sanctions') {
        title.textContent = 'Resolve Sanctions Match';
        pepContent.style.display = 'none';
        sancContent.style.display = 'flex';
    }
    
    modal.style.display = 'flex';
}
`;
html = html.replace(openModalRegex, newOpenModal);


// Also need to update setPepStatus and setSanctionsStatus
const setPepStatusRegex = /function setPepStatus\(val\) \{[\s\S]*?\}/;
const newSetPepStatus = `
function setPepStatus(val) {
    document.getElementById('pep-status').value = val;
    
    const btnIds = ['btn-pep-domestic', 'btn-pep-foreign', 'btn-pep-false'];
    btnIds.forEach(id => {
        const btn = document.getElementById(id);
        btn.className = 'btn-spring px-5 py-2.5 text-sm font-bold border border-gray-200 rounded-full text-gray-600 bg-gray-50 hover:bg-gray-100';
    });

    let activeBtn;
    if (val === 'domestic') activeBtn = document.getElementById('btn-pep-domestic');
    if (val === 'foreign') activeBtn = document.getElementById('btn-pep-foreign');
    if (val === 'false_positive') activeBtn = document.getElementById('btn-pep-false');
    
    if (activeBtn) {
        if (val === 'false_positive') {
            activeBtn.className = 'btn-spring px-5 py-2.5 text-sm font-bold border-2 border-green-500 rounded-full text-green-700 bg-green-50 shadow-sm';
        } else {
            activeBtn.className = 'btn-spring px-5 py-2.5 text-sm font-bold border-2 border-amber-500 rounded-full text-amber-700 bg-amber-50 shadow-sm';
        }
    }
    
    checkApprovalState();
}
`;
html = html.replace(setPepStatusRegex, newSetPepStatus);

const setSancStatusRegex = /function setSanctionsStatus\(val\) \{[\s\S]*?\}/;
const newSetSancStatus = `
function setSanctionsStatus(val) {
    document.getElementById('sanctions-status').value = val;
    
    const btnIds = ['btn-sanc-match', 'btn-sanc-false'];
    btnIds.forEach(id => {
        const btn = document.getElementById(id);
        btn.className = 'btn-spring px-5 py-2.5 text-sm font-bold border border-gray-200 rounded-full text-gray-600 bg-gray-50 hover:bg-gray-100';
    });

    let activeBtn;
    if (val === 'match') activeBtn = document.getElementById('btn-sanc-match');
    if (val === 'false_positive') activeBtn = document.getElementById('btn-sanc-false');
    
    if (activeBtn) {
        if (val === 'false_positive') {
            activeBtn.className = 'btn-spring px-5 py-2.5 text-sm font-bold border-2 border-green-500 rounded-full text-green-700 bg-green-50 shadow-sm';
        } else {
            activeBtn.className = 'btn-spring px-5 py-2.5 text-sm font-bold border-2 border-red-500 rounded-full text-red-700 bg-red-50 shadow-sm';
        }
    }
    
    checkApprovalState();
}
`;
html = html.replace(setSancStatusRegex, newSetSancStatus);


fs.writeFileSync(htmlFile, html);
