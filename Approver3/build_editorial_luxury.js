const fs = require('fs');
const path = require('path');

const approver2Path = path.join(__dirname, '..', 'Approver2', 'approver2.html');
const approver3Path = path.join(__dirname, 'approver3.html');

let html = fs.readFileSync(approver2Path, 'utf-8');

// 1. Google Fonts + Luxury CSS
const luxuryHead = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">

<style id="editorial-luxury-theme">
    /* Base Silk Canvas */
    body, html {
        background-color: #faf8f5 !important; /* Warm Silk */
        color: #1a1715 !important; /* Deep Espresso */
        font-family: 'Plus Jakarta Sans', sans-serif !important;
        -webkit-font-smoothing: antialiased;
    }

    /* Fixed Grain Overlay */
    .grain-overlay {
        position: fixed;
        inset: 0;
        z-index: 99999;
        pointer-events: none;
        opacity: 0.025;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    }

    /* Typography Hierarchy */
    h1, h2, h3, .serif-heading {
        font-family: 'Playfair Display', Georgia, serif !important;
        letter-spacing: -0.025em !important;
        color: #1a1715 !important;
    }
    
    .font-mono {
        font-family: 'JetBrains Mono', monospace !important;
    }

    /* Double-Bezel Nested Architecture */
    .double-bezel {
        background-color: #efece6 !important; /* Warm Taupe Outer Tray */
        padding: 0.375rem !important;
        border-radius: 1.5rem !important;
        border: 1px solid rgba(26, 23, 21, 0.06) !important;
        transition: all 0.3s cubic-bezier(0.32, 0.72, 0, 1) !important;
    }
    .double-bezel-inner {
        background-color: #ffffff !important; /* Pearl Core */
        border-radius: calc(1.5rem - 0.375rem) !important;
        box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.9), 0 4px 20px -4px rgba(26, 23, 21, 0.04) !important;
        padding: 1.5rem !important;
    }

    /* Override Containers & Panels */
    .bg-backgroundWhite, .bg-white, .dark\\:bg-gray-800, .dark\\:bg-gray-900 {
        background-color: #ffffff !important;
        color: #1a1715 !important;
    }
    .bg-background, .bg-gray-50, .dark\\:bg-gray-900 {
        background-color: #faf8f5 !important;
    }

    /* Accordion Headers (Double-Bezel Style) */
    button:has([data-testid="flowbite-accordion-heading"]) {
        background-color: #efece6 !important;
        color: #1a1715 !important;
        border: 1px solid rgba(26, 23, 21, 0.06) !important;
        border-radius: 1.25rem !important;
        margin-top: 1rem !important;
        padding: 0.375rem !important;
        transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), box-shadow 0.3s ease !important;
    }
    button:has([data-testid="flowbite-accordion-heading"]):hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px -6px rgba(26, 23, 21, 0.08) !important;
    }
    button:has([data-testid="flowbite-accordion-heading"]) h2 {
        font-family: 'Playfair Display', Georgia, serif !important;
        font-size: 1.25rem !important;
        font-weight: 600 !important;
    }

    /* Accordion Inner Content */
    [data-testid="flowbite-accordion-content"] {
        background-color: #ffffff !important;
        border: 1px solid rgba(26, 23, 21, 0.06) !important;
        border-radius: 1.25rem !important;
        margin-top: 0.5rem !important;
        margin-bottom: 1rem !important;
        padding: 1.75rem !important;
        box-shadow: 0 4px 20px -4px rgba(26, 23, 21, 0.04) !important;
    }

    /* Eyebrow Badges */
    .eyebrow-badge {
        display: inline-flex;
        align-items: center;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.65rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        background-color: #efece6;
        color: #6b635b;
    }

    /* Collapse All Pill Button */
    #collapse-all-btn {
        background-color: #1a1715 !important;
        color: #faf8f5 !important;
        border: none !important;
        border-radius: 9999px !important;
        padding: 0.5rem 1.25rem !important;
        font-size: 0.8rem !important;
        font-weight: 600 !important;
        letter-spacing: 0.02em;
        box-shadow: 0 4px 12px rgba(26, 23, 21, 0.15) !important;
        transition: all 0.2s cubic-bezier(0.32, 0.72, 0, 1) !important;
    }
    #collapse-all-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 18px rgba(26, 23, 21, 0.2) !important;
    }

    /* Primary Action Buttons (Button-in-Button pattern) */
    #approve-btn, .btn-luxury-primary {
        background-color: #1a1715 !important;
        color: #ffffff !important;
        border-radius: 9999px !important;
        font-weight: 600 !important;
        padding: 0.875rem 2rem !important;
        border: none !important;
        box-shadow: 0 4px 16px rgba(26, 23, 21, 0.2) !important;
        transition: all 0.2s ease !important;
    }
    #approve-btn:hover, .btn-luxury-primary:hover {
        background-color: #2e2a27 !important;
        transform: translateY(-1px);
    }

    /* Action Required Pill Buttons */
    .btn-action-terracotta {
        background-color: #fdf2f0 !important;
        color: #c25e38 !important;
        border: 1px solid #f7d5cd !important;
        border-radius: 9999px !important;
        font-weight: 700 !important;
        font-size: 0.75rem !important;
        padding: 0.375rem 1rem !important;
        transition: all 0.2s ease !important;
    }
    .btn-action-terracotta:hover {
        background-color: #fae4e0 !important;
    }

    .btn-action-amber {
        background-color: #fdf8ed !important;
        color: #b57c1e !important;
        border: 1px solid #f5e4bd !important;
        border-radius: 9999px !important;
        font-weight: 700 !important;
        font-size: 0.75rem !important;
        padding: 0.375rem 1rem !important;
        transition: all 0.2s ease !important;
    }
    .btn-action-amber:hover {
        background-color: #f7edcf !important;
    }

    /* Modal Backdrop */
    #details-modal {
        z-index: 99999 !important;
        background-color: rgba(26, 23, 21, 0.4) !important;
        backdrop-filter: blur(8px) !important;
    }
</style>
`;

html = html.replace('</head>', luxuryHead + '\n</head>');
html = html.replace('<body>', '<body>\n<div class="grain-overlay"></div>');

// 2. Attach direct onclick handlers to static Accordion buttons
html = html.replace(/<button type=button id="collapse-all-btn"/g, '<button type="button" id="collapse-all-btn" onclick="toggleAllAccordions()"');
html = html.replace(/<button type="button" id="collapse-all-btn"/g, '<button type="button" id="collapse-all-btn" onclick="toggleAllAccordions()"');

const accordionHeaderRegex = /<button class="[^"]*flex w-full items-center justify-between[^"]*"/g;
html = html.replace(accordionHeaderRegex, (match) => {
    return match + ' onclick="toggleAccordion(this)"';
});

// 3. Inject Luxury AML Screening section
const amlSectionRegex = /<div><h4 class="mb-3 text-sm font-semibold text-textPrimary">AML Screening<\/h4>[\s\S]*?(?=<\/div>\s*<\/div>\s*<\/div>\s*<button class="flex w-full)/;

const newAmlSection = `
<div class="mt-8 mb-6">
    <div class="flex items-center justify-between mb-4">
        <div>
            <span class="eyebrow-badge mb-1">Compliance Screening</span>
            <h4 class="text-xl font-semibold serif-heading">AML Screening &amp; Sanctions</h4>
        </div>
        
        <!-- Scenario Switcher -->
        <div class="flex items-center bg-[#efece6] p-1 rounded-full border border-gray-200/60">
            <button onclick="switchAMLScenario('hit')" id="btn-scen-hit" class="px-4 py-1.5 text-xs font-bold rounded-full bg-white shadow-sm text-[#1a1715] transition-all">All Hits</button>
            <button onclick="switchAMLScenario('mixed')" id="btn-scen-mixed" class="px-4 py-1.5 text-xs font-bold rounded-full text-[#6b635b] hover:text-[#1a1715] transition-all">Mixed</button>
            <button onclick="switchAMLScenario('clear')" id="btn-scen-clear" class="px-4 py-1.5 text-xs font-bold rounded-full text-[#6b635b] hover:text-[#1a1715] transition-all">All Clear</button>
        </div>
    </div>
    
    <div class="space-y-4" id="aml-container">
        <!-- PEP Item -->
        <div class="double-bezel">
            <div class="double-bezel-inner flex flex-col gap-3">
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-3">
                        <div id="pep-icon-bg" class="w-10 h-10 rounded-full bg-[#fdf8ed] border border-[#f5e4bd] flex items-center justify-center">
                            <span id="pep-icon" class="text-[#b57c1e] font-bold">!</span>
                        </div>
                        <div>
                            <h5 id="pep-title" class="font-semibold text-[#1a1715] text-base serif-heading">PEP - Active Hits</h5>
                            <p id="pep-subtitle" class="text-xs text-[#6b635b]">Possible Match Detected</p>
                        </div>
                    </div>
                    <div id="pep-action-container">
                        <button type="button" id="pep-action-btn" class="btn-action-amber" onclick="openDetailsModal('pep')">Action Required</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Sanctions Item -->
        <div class="double-bezel">
            <div class="double-bezel-inner flex flex-col gap-3">
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-3">
                        <div id="sanc-icon-bg" class="w-10 h-10 rounded-full bg-[#fdf2f0] border border-[#f7d5cd] flex items-center justify-center">
                            <span id="sanc-icon" class="text-[#c25e38] font-bold">!</span>
                        </div>
                        <div>
                            <h5 id="sanc-title" class="font-semibold text-[#1a1715] text-base serif-heading">Sanctions - Active Hits</h5>
                            <p id="sanc-subtitle" class="text-xs text-[#6b635b]">Possible Match Detected</p>
                        </div>
                    </div>
                    <div id="sanc-action-container">
                        <button type="button" id="sanctions-action-btn" class="btn-action-terracotta" onclick="openDetailsModal('sanctions')">Action Required</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
`;
html = html.replace(amlSectionRegex, newAmlSection);

// 4. Inject Luxury Details Modal
const modalRegex = /<div id="details-modal"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<next-route-announcer>/;

const newModal = `
<div id="details-modal" style="display: none; position: fixed; inset: 0; z-index: 99999; align-items: center; justify-content: center; background-color: rgba(26, 23, 21, 0.4); backdrop-filter: blur(8px);">
    <div class="w-full max-w-4xl mx-4 overflow-hidden flex flex-col bg-[#faf8f5] rounded-3xl shadow-2xl border border-gray-300/60" style="max-height: 90vh;">
        
        <div class="flex justify-between items-center p-6 border-b border-gray-200/80 bg-white">
            <div>
                <span class="eyebrow-badge mb-1">Audit Protocol</span>
                <h3 class="font-semibold text-2xl serif-heading text-[#1a1715]" id="modal-title">Resolve Match</h3>
            </div>
            <button onclick="closeDetailsModal()" class="text-gray-400 hover:text-[#1a1715] font-bold text-2xl w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">&times;</button>
        </div>

        <div class="p-8 overflow-y-auto flex-1 space-y-6">
            <!-- PEP Content -->
            <div id="pep-modal-content" style="display: none; flex-direction: column; gap: 1.5rem;">
                <div class="grid grid-cols-2 gap-4 double-bezel">
                    <div class="double-bezel-inner">
                        <span class="eyebrow-badge mb-2">Player Profile</span>
                        <div class="mt-2 text-sm space-y-1.5 font-mono">
                            <div><span class="text-gray-500">Name:</span> <strong class="text-[#1a1715]">STACY K TESTTWENTY</strong></div>
                            <div><span class="text-gray-500">DOB:</span> <strong class="text-[#1a1715]">15/08/1980</strong></div>
                            <div><span class="text-gray-500">Country:</span> <strong class="text-[#1a1715]">Australia (AU)</strong></div>
                        </div>
                    </div>
                    <div class="double-bezel-inner">
                        <span class="eyebrow-badge mb-2 text-[#b57c1e]">Matched Profile</span>
                        <div class="mt-2 text-sm space-y-1.5 font-mono">
                            <div><span class="text-gray-500">Match Type:</span> <strong class="text-[#b57c1e]">Fuzzy Match</strong></div>
                            <div><span class="text-gray-500">Name:</span> <strong class="text-[#1a1715]">Stacy Test-Twenty</strong></div>
                            <div><span class="text-gray-500">DOB:</span> <strong class="text-[#1a1715]">15/08/1980</strong></div>
                        </div>
                    </div>
                </div>

                <div>
                    <label class="block font-bold text-xs uppercase tracking-wider text-[#6b635b] mb-2">Determination</label>
                    <input type="hidden" id="pep-status" value="">
                    <div class="flex gap-3">
                        <button type="button" id="btn-pep-match" onclick="setPEPStatus('match')" class="px-5 py-2.5 text-xs font-bold border border-gray-200 rounded-full text-[#1a1715] bg-white hover:bg-gray-100 transition-all">Confirm Match</button>
                        <button type="button" id="btn-pep-false" onclick="setPEPStatus('false_positive')" class="px-5 py-2.5 text-xs font-bold border border-gray-200 rounded-full text-[#1a1715] bg-white hover:bg-gray-100 transition-all">Disprove - False Positive</button>
                    </div>
                </div>

                <div>
                    <label class="block font-bold text-xs uppercase tracking-wider text-[#6b635b] mb-2">Investigation Notes *</label>
                    <textarea id="pep-notes" rows="3" class="w-full border border-gray-200 rounded-2xl p-4 text-sm resize-none bg-white focus:ring-2 focus:ring-[#1a1715] focus:outline-none" placeholder="Detail determination reasoning..." oninput="checkApprovalState()"></textarea>
                </div>
            </div>

            <!-- Sanctions Content -->
            <div id="sanctions-modal-content" style="display: none; flex-direction: column; gap: 1.5rem;">
                <div class="grid grid-cols-2 gap-4 double-bezel">
                    <div class="double-bezel-inner">
                        <span class="eyebrow-badge mb-2">Player Profile</span>
                        <div class="mt-2 text-sm space-y-1.5 font-mono">
                            <div><span class="text-gray-500">Name:</span> <strong class="text-[#1a1715]">STACY K TESTTWENTY</strong></div>
                            <div><span class="text-gray-500">DOB:</span> <strong class="text-[#1a1715]">15/08/1980</strong></div>
                        </div>
                    </div>
                    <div class="double-bezel-inner">
                        <span class="eyebrow-badge mb-2 text-[#c25e38]">Matched Sanctions Record</span>
                        <div class="mt-2 text-sm space-y-1.5 font-mono">
                            <div><span class="text-gray-500">Match Type:</span> <strong class="text-[#c25e38]">Token Match</strong></div>
                            <div><span class="text-gray-500">Name:</span> <strong class="text-[#1a1715]">STACY TEST</strong></div>
                        </div>
                    </div>
                </div>

                <div>
                    <label class="block font-bold text-xs uppercase tracking-wider text-[#6b635b] mb-2">Determination</label>
                    <input type="hidden" id="sanctions-status" value="">
                    <div class="flex gap-3">
                        <button type="button" id="btn-sanc-match" onclick="setSanctionsStatus('match')" class="px-5 py-2.5 text-xs font-bold border border-gray-200 rounded-full text-[#1a1715] bg-white hover:bg-gray-100 transition-all">Confirm Match</button>
                        <button type="button" id="btn-sanc-false" onclick="setSanctionsStatus('false_positive')" class="px-5 py-2.5 text-xs font-bold border border-gray-200 rounded-full text-[#1a1715] bg-white hover:bg-gray-100 transition-all">Disprove - False Positive</button>
                    </div>
                </div>

                <div>
                    <label class="block font-bold text-xs uppercase tracking-wider text-[#6b635b] mb-2">Investigation Notes *</label>
                    <textarea id="sanctions-notes" rows="3" class="w-full border border-gray-200 rounded-2xl p-4 text-sm resize-none bg-white focus:ring-2 focus:ring-[#1a1715] focus:outline-none" placeholder="Detail determination reasoning..." oninput="checkApprovalState()"></textarea>
                </div>
            </div>
        </div>

        <div class="p-5 border-t border-gray-200/80 bg-white flex justify-end">
            <button onclick="closeDetailsModal()" class="btn-luxury-primary">Save &amp; Close</button>
        </div>
    </div>
</div>
<next-route-announcer>
`;
html = html.replace(modalRegex, newModal);

// 5. Inject Static JS Logic
const staticJS = `
<script>
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

function toggleAllAccordions() {
    const btn = document.getElementById('collapse-all-btn');
    const accordions = document.querySelectorAll('button:has([data-testid="flowbite-accordion-heading"])');
    
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
    document.getElementById('btn-pep-match').className = val === 'match' ? 'px-5 py-2.5 text-xs font-bold border border-red-500 rounded-full text-white bg-red-600' : 'px-5 py-2.5 text-xs font-bold border border-gray-200 rounded-full text-[#1a1715] bg-white hover:bg-gray-100';
    document.getElementById('btn-pep-false').className = val === 'false_positive' ? 'px-5 py-2.5 text-xs font-bold border border-green-500 rounded-full text-white bg-green-600' : 'px-5 py-2.5 text-xs font-bold border border-gray-200 rounded-full text-[#1a1715] bg-white hover:bg-gray-100';
}

function setSanctionsStatus(val) {
    document.getElementById('sanctions-status').value = val;
    document.getElementById('btn-sanc-match').className = val === 'match' ? 'px-5 py-2.5 text-xs font-bold border border-red-500 rounded-full text-white bg-red-600' : 'px-5 py-2.5 text-xs font-bold border border-gray-200 rounded-full text-[#1a1715] bg-white hover:bg-gray-100';
    document.getElementById('btn-sanc-false').className = val === 'false_positive' ? 'px-5 py-2.5 text-xs font-bold border border-green-500 rounded-full text-white bg-green-600' : 'px-5 py-2.5 text-xs font-bold border border-gray-200 rounded-full text-[#1a1715] bg-white hover:bg-gray-100';
}

function switchAMLScenario(scenario) {
    const btns = ['hit', 'mixed', 'clear'];
    btns.forEach(b => {
        const btn = document.getElementById('btn-scen-' + b);
        if (btn) {
            btn.className = b === scenario ? 'px-4 py-1.5 text-xs font-bold rounded-full bg-white shadow-sm text-[#1a1715] transition-all' : 'px-4 py-1.5 text-xs font-bold rounded-full text-[#6b635b] hover:text-[#1a1715] transition-all';
        }
    });

    const pepContainer = document.getElementById('pep-action-container');
    const sancContainer = document.getElementById('sanc-action-container');

    if (scenario === 'hit') {
        if (pepContainer) pepContainer.innerHTML = '<button type="button" id="pep-action-btn" class="btn-action-amber" onclick="openDetailsModal(\\'pep\\')">Action Required</button>';
        if (sancContainer) sancContainer.innerHTML = '<button type="button" id="sanctions-action-btn" class="btn-action-terracotta" onclick="openDetailsModal(\\'sanctions\\')">Action Required</button>';
    } else if (scenario === 'mixed') {
        if (pepContainer) pepContainer.innerHTML = '<span class="px-3 py-1 bg-[#edf7f2] text-[#2a7a59] text-xs font-bold uppercase rounded-full border border-[#c4e5d7]">Pass</span>';
        if (sancContainer) sancContainer.innerHTML = '<button type="button" id="sanctions-action-btn" class="btn-action-terracotta" onclick="openDetailsModal(\\'sanctions\\')">Action Required</button>';
    } else if (scenario === 'clear') {
        if (pepContainer) pepContainer.innerHTML = '<span class="px-3 py-1 bg-[#edf7f2] text-[#2a7a59] text-xs font-bold uppercase rounded-full border border-[#c4e5d7]">Pass</span>';
        if (sancContainer) sancContainer.innerHTML = '<span class="px-3 py-1 bg-[#edf7f2] text-[#2a7a59] text-xs font-bold uppercase rounded-full border border-[#c4e5d7]">Pass</span>';
    }
}
</script>
`;

html = html.replace('</body>', staticJS + '\n</body>');

fs.writeFileSync(approver3Path, html);
console.log('Successfully compiled Editorial Luxury Light Theme in approver3.html');
