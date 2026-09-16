const fs = require('fs');
const path = require('path');

// 1. Reset to baseline approver2.html
const approver2Path = path.join(__dirname, '..', 'Approver2', 'approver2.html');
const approver3Path = path.join(__dirname, 'approver3.html');

let html = fs.readFileSync(approver2Path, 'utf-8');

// 2. Inject Premium Neo-Minimalist Light CSS directly into <head>
const neoLightCSS = `
<style id="neo-light-theme">
    /* Reset & Body Canvas */
    body, html {
        background-color: #fafafa !important; /* Zinc 50 */
        color: #09090b !important; /* Zinc 950 */
        font-family: 'Plus Jakarta Sans', sans-serif !important;
    }
    
    /* Title Typography */
    h1, h2, h3, h4, h5, h6 {
        font-family: 'Outfit', sans-serif !important;
        letter-spacing: -0.02em !important;
    }

    /* Main Container Cards */
    .bg-backgroundWhite, .bg-white, .dark\\:bg-gray-800, .dark\\:bg-gray-900 {
        background-color: #ffffff !important;
        color: #09090b !important;
    }
    
    /* Page Background */
    .bg-background, .bg-gray-50, .dark\\:bg-gray-900 {
        background-color: #fafafa !important;
    }

    /* Double Bezel Cards */
    .double-bezel {
        background-color: #f4f4f5;
        padding: 0.375rem;
        border-radius: 1rem;
        border: 1px solid #e4e4e7;
    }
    .double-bezel-inner {
        background-color: #ffffff;
        border-radius: calc(1rem - 0.375rem);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
        padding: 1.25rem;
    }

    /* Accordion Headers */
    button:has([data-testid="flowbite-accordion-heading"]) {
        background-color: #ffffff !important;
        color: #09090b !important;
        border: 1px solid #e4e4e7 !important;
        border-radius: 0.75rem !important;
        margin-top: 0.75rem;
        transition: all 0.2s ease !important;
        padding: 1.25rem !important;
    }
    button:has([data-testid="flowbite-accordion-heading"]):hover {
        background-color: #f4f4f5 !important;
    }
    
    /* Accordion Contents */
    [data-testid="flowbite-accordion-content"] {
        background-color: #ffffff !important;
        border: 1px solid #e4e4e7 !important;
        border-top: none !important;
        border-bottom-left-radius: 0.75rem !important;
        border-bottom-right-radius: 0.75rem !important;
        margin-top: -0.75rem !important;
        margin-bottom: 0.75rem !important;
        padding: 1.5rem !important;
    }

    /* Collapse All Button */
    #collapse-all-btn {
        background-color: #2563eb !important;
        color: #ffffff !important;
        border: none !important;
        border-radius: 9999px !important;
        padding: 0.5rem 1.25rem !important;
        font-weight: 600 !important;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25) !important;
        transition: all 0.15s ease !important;
    }
    #collapse-all-btn:hover {
        background-color: #1d4ed8 !important;
        transform: translateY(-1px);
    }
    #collapse-all-btn:active {
        transform: translateY(1px);
    }

    /* Approve Button */
    #approve-btn, button:contains("Approve") {
        background-color: #2563eb !important;
        color: #ffffff !important;
        border-radius: 0.75rem !important;
        font-weight: 700 !important;
        box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3) !important;
    }

    /* Modal Backdrop */
    #details-modal {
        z-index: 99999 !important;
    }
</style>
`;
html = html.replace('</head>', neoLightCSS + '\n</head>');

// 3. Inject direct onclick handlers to static Accordion buttons
html = html.replace(/<button type=button id="collapse-all-btn"/g, '<button type="button" id="collapse-all-btn" onclick="toggleAllAccordions()"');
html = html.replace(/<button type="button" id="collapse-all-btn"/g, '<button type="button" id="collapse-all-btn" onclick="toggleAllAccordions()"');

// Add inline onclick to accordion headers
const accordionHeaderRegex = /<button class="[^"]*flex w-full items-center justify-between[^"]*"/g;
html = html.replace(accordionHeaderRegex, (match) => {
    return match + ' onclick="toggleAccordion(this)"';
});

// 4. Inject AML Screening section
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
                        <button type="button" id="pep-action-btn" class="px-4 py-2 text-sm rounded-full font-bold transition-colors bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200" onclick="openDetailsModal('pep')">Action Required</button>
                    </div>
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
                        <button type="button" id="sanctions-action-btn" class="px-4 py-2 text-sm rounded-full font-bold transition-colors bg-red-100 text-red-800 border border-red-200 hover:bg-red-200" onclick="openDetailsModal('sanctions')">Action Required</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
`;
html = html.replace(amlSectionRegex, newAmlSection);

// 5. Inject Details Modal
const modalRegex = /<div id="details-modal"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<next-route-announcer>/;

const newModal = `
<div id="details-modal" style="display: none; position: fixed; inset: 0; z-index: 99999; align-items: center; justify-content: center; background-color: rgba(15, 23, 42, 0.5); backdrop-filter: blur(4px);">
    <div class="w-full max-w-4xl mx-4 overflow-hidden flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200" style="max-height: 90vh;">
        
        <div class="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50">
            <h3 class="font-bold text-xl text-gray-900" id="modal-title">Resolve Match</h3>
            <button onclick="closeDetailsModal()" class="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
        </div>

        <div class="p-6 overflow-y-auto flex-1 space-y-6">
            <!-- PEP Content -->
            <div id="pep-modal-content" style="display: none; flex-direction: column; gap: 1.5rem;">
                <div class="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div>
                        <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Player Data</span>
                        <div class="mt-2 text-sm space-y-1">
                            <div><span class="text-gray-500">Name:</span> <strong class="text-gray-900">STACY K TESTTWENTY</strong></div>
                            <div><span class="text-gray-500">DOB:</span> <strong class="text-gray-900">15/08/1980</strong></div>
                            <div><span class="text-gray-500">Country:</span> <strong class="text-gray-900">Australia (AU)</strong></div>
                        </div>
                    </div>
                    <div>
                        <span class="text-xs font-bold text-amber-600 uppercase tracking-wider">Matched Profile</span>
                        <div class="mt-2 text-sm space-y-1">
                            <div><span class="text-gray-500">Match Type:</span> <strong class="text-amber-700">Fuzzy Match</strong></div>
                            <div><span class="text-gray-500">Name:</span> <strong class="text-gray-900">Stacy Test-Twenty</strong></div>
                            <div><span class="text-gray-500">DOB:</span> <strong class="text-gray-900">15/08/1980</strong></div>
                        </div>
                    </div>
                </div>

                <div>
                    <label class="block font-bold text-sm text-gray-700 mb-2">Determination</label>
                    <input type="hidden" id="pep-status" value="">
                    <div class="flex gap-3">
                        <button type="button" id="btn-pep-match" onclick="setPEPStatus('match')" class="px-4 py-2 text-sm font-bold border border-gray-200 rounded-full text-gray-700 bg-white hover:bg-gray-100">Confirm Match</button>
                        <button type="button" id="btn-pep-false" onclick="setPEPStatus('false_positive')" class="px-4 py-2 text-sm font-bold border border-gray-200 rounded-full text-gray-700 bg-white hover:bg-gray-100">Disprove - False Positive</button>
                    </div>
                </div>

                <div>
                    <label class="block font-bold text-sm text-gray-700 mb-2">Investigation Notes *</label>
                    <textarea id="pep-notes" rows="3" class="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none" placeholder="Detail determination reasoning..." oninput="checkApprovalState()"></textarea>
                </div>
            </div>

            <!-- Sanctions Content -->
            <div id="sanctions-modal-content" style="display: none; flex-direction: column; gap: 1.5rem;">
                <div class="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div>
                        <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Player Data</span>
                        <div class="mt-2 text-sm space-y-1">
                            <div><span class="text-gray-500">Name:</span> <strong class="text-gray-900">STACY K TESTTWENTY</strong></div>
                            <div><span class="text-gray-500">DOB:</span> <strong class="text-gray-900">15/08/1980</strong></div>
                        </div>
                    </div>
                    <div>
                        <span class="text-xs font-bold text-red-600 uppercase tracking-wider">Matched Sanctions Record</span>
                        <div class="mt-2 text-sm space-y-1">
                            <div><span class="text-gray-500">Match Type:</span> <strong class="text-red-700">Token Match</strong></div>
                            <div><span class="text-gray-500">Name:</span> <strong class="text-gray-900">STACY TEST</strong></div>
                        </div>
                    </div>
                </div>

                <div>
                    <label class="block font-bold text-sm text-gray-700 mb-2">Determination</label>
                    <input type="hidden" id="sanctions-status" value="">
                    <div class="flex gap-3">
                        <button type="button" id="btn-sanc-match" onclick="setSanctionsStatus('match')" class="px-4 py-2 text-sm font-bold border border-gray-200 rounded-full text-gray-700 bg-white hover:bg-gray-100">Confirm Match</button>
                        <button type="button" id="btn-sanc-false" onclick="setSanctionsStatus('false_positive')" class="px-4 py-2 text-sm font-bold border border-gray-200 rounded-full text-gray-700 bg-white hover:bg-gray-100">Disprove - False Positive</button>
                    </div>
                </div>

                <div>
                    <label class="block font-bold text-sm text-gray-700 mb-2">Investigation Notes *</label>
                    <textarea id="sanctions-notes" rows="3" class="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none" placeholder="Detail determination reasoning..." oninput="checkApprovalState()"></textarea>
                </div>
            </div>
        </div>

        <div class="p-5 border-t border-gray-200 bg-gray-50 flex justify-end">
            <button onclick="closeDetailsModal()" class="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold shadow-md hover:bg-blue-700 transition-colors">Save &amp; Close</button>
        </div>
    </div>
</div>
<next-route-announcer>
`;
html = html.replace(modalRegex, newModal);

// 6. Inject Standard Native JS for Accordions and Modals
const staticJS = `
<script>
// Toggle Single Accordion
function toggleAccordion(btn) {
    const content = btn.nextElementSibling;
    const arrow = btn.querySelector('[data-testid="flowbite-accordion-arrow"]');
    if (!content) return;
    
    const isHidden = content.classList.contains('hidden') || content.style.display === 'none';
    if (isHidden) {
        content.classList.remove('hidden');
        content.style.display = 'block';
        if (arrow) arrow.classList.add('rotate-180');
    } else {
        content.classList.add('hidden');
        content.style.display = 'none';
        if (arrow) arrow.classList.remove('rotate-180');
    }
}

// Toggle All Accordions
function toggleAllAccordions() {
    const btn = document.getElementById('collapse-all-btn');
    const accordions = document.querySelectorAll('button:has([data-testid="flowbite-accordion-heading"])');
    
    // Check if first is collapsed
    const firstContent = accordions[0] ? accordions[0].nextElementSibling : null;
    const isCurrentlyCollapsed = firstContent ? (firstContent.classList.contains('hidden') || firstContent.style.display === 'none') : false;
    
    const shouldCollapse = !isCurrentlyCollapsed;
    
    accordions.forEach(acc => {
        const content = acc.nextElementSibling;
        const arrow = acc.querySelector('[data-testid="flowbite-accordion-arrow"]');
        if (content) {
            if (shouldCollapse) {
                content.classList.add('hidden');
                content.style.display = 'none';
                if (arrow) arrow.classList.remove('rotate-180');
            } else {
                content.classList.remove('hidden');
                content.style.display = 'block';
                if (arrow) arrow.classList.add('rotate-180');
            }
        }
    });
    
    if (btn) {
        const textSpan = btn.querySelector('span:first-child') || btn;
        const iconSpan = btn.querySelector('span:last-child');
        
        if (textSpan.tagName === 'SPAN') {
            textSpan.textContent = shouldCollapse ? 'Expand All' : 'Collapse All';
        } else {
            textSpan.textContent = shouldCollapse ? 'Expand All' : 'Collapse All';
        }
        if (iconSpan) iconSpan.textContent = shouldCollapse ? '▼' : '▲';
    }
}

// AML Modal Handlers
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
    document.getElementById('btn-pep-match').className = val === 'match' ? 'px-4 py-2 text-sm font-bold border border-red-300 rounded-full text-white bg-red-600' : 'px-4 py-2 text-sm font-bold border border-gray-200 rounded-full text-gray-700 bg-white hover:bg-gray-100';
    document.getElementById('btn-pep-false').className = val === 'false_positive' ? 'px-4 py-2 text-sm font-bold border border-green-300 rounded-full text-white bg-green-600' : 'px-4 py-2 text-sm font-bold border border-gray-200 rounded-full text-gray-700 bg-white hover:bg-gray-100';
}

function setSanctionsStatus(val) {
    document.getElementById('sanctions-status').value = val;
    document.getElementById('btn-sanc-match').className = val === 'match' ? 'px-4 py-2 text-sm font-bold border border-red-300 rounded-full text-white bg-red-600' : 'px-4 py-2 text-sm font-bold border border-gray-200 rounded-full text-gray-700 bg-white hover:bg-gray-100';
    document.getElementById('btn-sanc-false').className = val === 'false_positive' ? 'px-4 py-2 text-sm font-bold border border-green-300 rounded-full text-white bg-green-600' : 'px-4 py-2 text-sm font-bold border border-gray-200 rounded-full text-gray-700 bg-white hover:bg-gray-100';
}

function switchAMLScenario(scenario) {
    const btns = ['hit', 'mixed', 'clear'];
    btns.forEach(b => {
        const btn = document.getElementById('btn-scen-' + b);
        if (btn) {
            btn.className = b === scenario ? 'px-4 py-1.5 text-xs font-bold rounded-full bg-white shadow-sm text-gray-800 transition-all' : 'px-4 py-1.5 text-xs font-bold rounded-full text-gray-500 hover:text-gray-700 transition-all';
        }
    });

    const pepContainer = document.getElementById('pep-action-container');
    const sancContainer = document.getElementById('sanc-action-container');

    if (scenario === 'hit') {
        if (pepContainer) pepContainer.innerHTML = '<button type="button" id="pep-action-btn" class="px-4 py-2 text-sm rounded-full font-bold transition-colors bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200" onclick="openDetailsModal(\\'pep\\')">Action Required</button>';
        if (sancContainer) sancContainer.innerHTML = '<button type="button" id="sanctions-action-btn" class="px-4 py-2 text-sm rounded-full font-bold transition-colors bg-red-100 text-red-800 border border-red-200 hover:bg-red-200" onclick="openDetailsModal(\\'sanctions\\')">Action Required</button>';
    } else if (scenario === 'mixed') {
        if (pepContainer) pepContainer.innerHTML = '<span class="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold uppercase rounded-full border border-green-200">Pass</span>';
        if (sancContainer) sancContainer.innerHTML = '<button type="button" id="sanctions-action-btn" class="px-4 py-2 text-sm rounded-full font-bold transition-colors bg-red-100 text-red-800 border border-red-200 hover:bg-red-200" onclick="openDetailsModal(\\'sanctions\\')">Action Required</button>';
    } else if (scenario === 'clear') {
        if (pepContainer) pepContainer.innerHTML = '<span class="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold uppercase rounded-full border border-green-200">Pass</span>';
        if (sancContainer) sancContainer.innerHTML = '<span class="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold uppercase rounded-full border border-green-200">Pass</span>';
    }
}
</script>
`;

html = html.replace('</body>', staticJS + '\n</body>');

fs.writeFileSync(approver3Path, html);
console.log('Successfully written clean static approver3.html');
