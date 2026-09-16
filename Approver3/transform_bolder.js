const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'approver3.html');
let html = fs.readFileSync(target, 'utf-8');

// 1. Clean up previous injections
// Remove old VANGUARD CSS
const cssStart = html.indexOf('/* --- VANGUARD UI ARCHITECT OVERRIDES --- */');
if (cssStart !== -1) {
    const styleEnd = html.indexOf('</style>', cssStart);
    if (styleEnd !== -1) {
        html = html.substring(0, cssStart) + html.substring(styleEnd);
    }
}

// Remove old JS Architect script
const jsStart = html.indexOf('// 1. Fluid Island Nav');
if (jsStart !== -1) {
    // Find the `<script>` tag before it
    const scriptTag = html.lastIndexOf('<script>', jsStart);
    const scriptEnd = html.indexOf('</script>', jsStart);
    if (scriptTag !== -1 && scriptEnd !== -1) {
        html = html.substring(0, scriptTag) + html.substring(scriptEnd + 9);
    }
}


// 2. Inject BOLDER Industrial Cockpit CSS
const bolderCSS = `
    /* --- BOLDER INDUSTRIAL COCKPIT OVERRIDES --- */
    
    /* Global Dark Mode / Obsidian */
    body, html {
        background-color: #09090b !important; /* Zinc 950 */
        color: #f4f4f5 !important; /* Zinc 100 */
        font-family: 'JetBrains Mono', monospace !important; /* Monospace default */
    }
    
    /* Typography overrides */
    h1, h2, h3, h4, h5, h6, [data-testid="flowbite-accordion-heading"] {
        font-family: 'Cabinet Grotesk', 'Geist', sans-serif !important;
        font-weight: 800 !important;
        letter-spacing: -0.04em !important;
        text-transform: uppercase;
        color: #ffffff !important;
    }
    
    .payout-id-hero {
        font-size: 5rem !important;
        line-height: 1 !important;
        color: #E11D48 !important; /* Deep Rose Accent */
    }

    /* The Strict 1px Grid */
    .bolder-grid {
        display: grid;
        grid-template-columns: 350px 1fr;
        min-height: 100vh;
        border-top: 1px solid rgba(255,255,255,0.1);
    }
    
    @media (max-width: 1024px) {
        .bolder-grid {
            grid-template-columns: 1fr;
        }
    }

    /* Cockpit Panels */
    .cockpit-panel {
        border-right: 1px solid rgba(255,255,255,0.1);
        border-bottom: 1px solid rgba(255,255,255,0.1);
        padding: 2rem;
        background: transparent !important;
        border-radius: 0 !important; /* Strip all rounded corners */
        box-shadow: none !important; /* Strip all shadows */
    }
    
    /* Stripped Accordions */
    .stripped-accordion {
        border: 1px solid rgba(255,255,255,0.1) !important;
        background: transparent !important;
        border-radius: 0 !important;
        margin-bottom: -1px; /* Overlap borders */
        transition: background 0.1s linear;
    }
    
    .stripped-accordion:hover {
        background: rgba(225, 29, 72, 0.05) !important; /* Slight rose tint on hover */
    }
    
    .stripped-accordion-content {
        border: 1px solid rgba(255,255,255,0.1) !important;
        border-top: none !important;
        background: rgba(255,255,255,0.02) !important;
        border-radius: 0 !important;
        padding: 2rem !important;
        margin-bottom: -1px;
    }

    /* Brutal Buttons */
    .brutal-btn {
        background-color: #E11D48 !important; /* Deep Rose */
        color: #ffffff !important;
        border-radius: 0 !important;
        text-transform: uppercase;
        font-family: 'Cabinet Grotesk', 'Geist', sans-serif !important;
        font-weight: 800 !important;
        letter-spacing: 0.05em;
        border: 1px solid #E11D48 !important;
        padding: 1.25rem 3rem !important;
        transition: transform 0.1s cubic-bezier(0, 1, 0, 1), box-shadow 0.1s linear !important;
    }
    
    .brutal-btn:active {
        transform: translateY(2px) !important;
        box-shadow: none !important;
    }

    /* Override all generic Tailwind rounded/shadow classes */
    .rounded-lg, .rounded-full, .rounded-md, .rounded-xl, .rounded-2xl { border-radius: 0 !important; }
    .shadow-sm, .shadow-md, .shadow-lg, .shadow-xl { box-shadow: none !important; }
    
    /* Remove white backgrounds from legacy components */
    .bg-white, .bg-gray-50, .bg-gray-100 { background-color: transparent !important; }
    .text-gray-900, .text-gray-800, .text-gray-700 { color: #f4f4f5 !important; }
    .text-gray-500, .text-gray-600 { color: #a1a1aa !important; }
    
    /* Nav Override */
    #bolder-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem 2rem;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        background: #09090b;
        position: sticky;
        top: 0;
        z-index: 50;
    }
    
    /* Data Grids inside panels */
    .data-grid {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 1rem 2rem;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.85rem;
    }
    .data-label {
        color: #a1a1aa;
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 0.1em;
    }
    .data-val {
        color: #ffffff;
    }

    /* Frankione AML Hits - Raw Terminal Style */
    .aml-hit-row {
        background: rgba(225, 29, 72, 0.1) !important;
        border: 1px solid #E11D48 !important;
        color: #E11D48 !important;
    }
    .aml-match-row {
        background: rgba(16, 185, 129, 0.1) !important;
        border: 1px solid #10B981 !important;
        color: #10B981 !important;
    }
`;

html = html.replace('</style>', bolderCSS + '\n</style>');

// 3. Inject Client-Side DOM Restructuring Script
const jsBolder = `
<script>
document.addEventListener('DOMContentLoaded', () => {
    // 1. Brutal Nav
    const nav = document.querySelector('nav');
    if (nav) {
        nav.id = 'bolder-nav';
        nav.className = ''; // Strip old classes
        
        // Enhance title
        const title = nav.querySelector('div.text-lg');
        if (title) {
            title.innerHTML = 'PAYOUT_ID <span class="payout-id-hero">578</span>';
            title.className = 'flex flex-col';
        }
    }

    // 2. The Editorial Split / Cockpit Grid
    const main = document.querySelector('main');
    if (main) {
        const container = main.parentElement;
        if (container) {
            container.className = ''; // Remove all padding
        }
        
        main.className = 'bolder-grid';
        
        const children = Array.from(main.children);
        
        const leftCol = document.createElement('div');
        leftCol.className = 'cockpit-panel sticky top-[100px] h-[calc(100vh-100px)] overflow-y-auto';
        
        const rightCol = document.createElement('div');
        rightCol.className = 'flex flex-col border-l border-[rgba(255,255,255,0.1)]';
        
        if (children.length > 0) {
            // Player info to left
            leftCol.appendChild(children[0]);
            
            // Format Player Info into data-grid
            const pInfo = leftCol.querySelector('div');
            if (pInfo) pInfo.className = 'flex flex-col gap-8';
            
            for (let i = 1; i < children.length; i++) {
                if (children[i].tagName !== 'BUTTON' && children[i].id !== 'approve-btn') {
                    rightCol.appendChild(children[i]);
                }
            }
        }
        
        // 3. Strip Accordions & Cards
        const accordions = Array.from(rightCol.querySelectorAll('button:has([data-testid="flowbite-accordion-heading"])'));
        let i = 0;
        const rightChildren = Array.from(rightCol.children);
        
        while (i < rightChildren.length) {
            const el = rightChildren[i];
            if (el.tagName === 'BUTTON' && el.querySelector('[data-testid="flowbite-accordion-heading"]')) {
                const content = rightChildren[i+1];
                
                el.className = 'stripped-accordion flex w-full items-center justify-between p-8 text-left cursor-pointer';
                
                if (content && content.getAttribute('data-testid') === 'flowbite-accordion-content') {
                    content.className = 'stripped-accordion-content hidden';
                    i += 2;
                } else {
                    i += 1;
                }
            } else {
                el.className = 'cockpit-panel';
                i++;
            }
        }
        
        main.innerHTML = '';
        main.appendChild(leftCol);
        main.appendChild(rightCol);
        
        // Approve Button
        const approveBtn = document.getElementById('approve-btn');
        if (approveBtn) {
            const btnWrap = document.createElement('div');
            btnWrap.className = 'p-12 border-t border-[rgba(255,255,255,0.1)] flex justify-end bg-[#09090b] sticky bottom-0 z-40';
            
            approveBtn.className = 'brutal-btn';
            
            btnWrap.appendChild(approveBtn);
            rightCol.appendChild(btnWrap);
        }
    }
});
</script>
`;

html = html.replace('</body>', jsBolder + '\n</body>');

fs.writeFileSync(target, html);
