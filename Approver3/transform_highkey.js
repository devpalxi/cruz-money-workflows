const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'approver3.html');
let html = fs.readFileSync(target, 'utf-8');

// 1. Clean up any previous injections if they exist (though we expect a fresh copy)
const cssStart = html.indexOf('/* --- HIGH-KEY BRUTALIST OVERRIDES --- */');
if (cssStart !== -1) {
    const styleEnd = html.indexOf('</style>', cssStart);
    if (styleEnd !== -1) {
        html = html.substring(0, cssStart) + html.substring(styleEnd);
    }
}

// 2. Inject High-Key Brutalist CSS
const highkeyCSS = `
    /* --- HIGH-KEY BRUTALIST OVERRIDES --- */
    
    /* Global Ice Mode / High-Key */
    body, html {
        background-color: #ffffff !important;
        color: #09090b !important; /* Zinc 950 */
        font-family: 'JetBrains Mono', monospace !important;
    }
    
    /* Typography overrides - Extreme Scale */
    h1, h2, h3, h4, h5, h6, [data-testid="flowbite-accordion-heading"] {
        font-family: 'Cabinet Grotesk', 'Geist', sans-serif !important;
        font-weight: 900 !important;
        letter-spacing: -0.05em !important;
        text-transform: uppercase;
        color: #09090b !important;
    }
    
    /* The massive Payout ID Hero */
    .payout-id-hero {
        font-size: 6.5rem !important;
        line-height: 0.9 !important;
        color: #09090b !important;
        margin-bottom: 2rem;
        display: block;
    }

    /* The Strict 1px Grid Architecture */
    .highkey-grid {
        display: grid;
        grid-template-columns: 400px 1fr;
        min-height: 100vh;
        border-top: 1px solid #e4e4e7; /* Zinc 200 */
    }
    
    @media (max-width: 1024px) {
        .highkey-grid {
            grid-template-columns: 1fr;
        }
    }

    /* Editorial Panels */
    .editorial-panel {
        border-right: 1px solid #e4e4e7;
        border-bottom: 1px solid #e4e4e7;
        padding: 3rem;
        background: transparent !important;
        border-radius: 0 !important; /* Strip all rounded corners */
        box-shadow: none !important; /* Strip all shadows */
    }
    
    /* Stripped Accordions */
    .stripped-accordion {
        border: 1px solid #e4e4e7 !important;
        background: transparent !important;
        border-radius: 0 !important;
        margin-bottom: -1px; /* Overlap borders */
        transition: background 0.1s linear, padding 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    .stripped-accordion:hover {
        background: #f4f4f5 !important; /* Zinc 100 */
        padding-left: 2.5rem !important; /* Subtle indent on hover */
    }
    
    .stripped-accordion-content {
        border: 1px solid #e4e4e7 !important;
        border-top: none !important;
        background: #fafafa !important; /* Zinc 50 */
        border-radius: 0 !important;
        padding: 3rem !important;
        margin-bottom: -1px;
    }

    /* Brutal Buttons */
    .brutal-btn {
        background-color: #4338CA !important; /* Electric Ultramarine */
        color: #ffffff !important;
        border-radius: 0 !important;
        text-transform: uppercase;
        font-family: 'Cabinet Grotesk', 'Geist', sans-serif !important;
        font-weight: 800 !important;
        letter-spacing: 0.05em;
        border: 1px solid #4338CA !important;
        padding: 1.5rem 4rem !important;
        font-size: 1.25rem !important;
        transition: transform 0.1s cubic-bezier(0, 1, 0, 1), box-shadow 0.1s linear !important;
    }
    
    .brutal-btn:active {
        transform: translateY(2px) !important;
        box-shadow: none !important;
    }

    /* Override all generic Tailwind rounded/shadow classes */
    .rounded-lg, .rounded-full, .rounded-md, .rounded-xl, .rounded-2xl { border-radius: 0 !important; }
    .shadow-sm, .shadow-md, .shadow-lg, .shadow-xl { box-shadow: none !important; }
    
    /* Remove generic backgrounds */
    .bg-background, .bg-backgroundWhite, .bg-gray-50, .bg-gray-100 { background-color: transparent !important; }
    .text-gray-900, .text-gray-800, .text-gray-700, .text-czPurple-500 { color: #09090b !important; }
    .text-gray-500, .text-gray-600 { color: #71717a !important; } /* Zinc 500 */
    
    /* Root cleanup */
    #root, .min-h-screen {
        background-color: transparent !important;
    }

    /* Nav Override */
    #highkey-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem 3rem;
        border-bottom: 1px solid #e4e4e7;
        background: #ffffff;
        position: sticky;
        top: 0;
        z-index: 50;
    }
    
    /* Data Grids inside panels */
    .data-grid {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 1.5rem 3rem;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.9rem;
    }
    .data-label {
        color: #71717a;
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 0.15em;
        font-weight: 700;
    }
    .data-val {
        color: #09090b;
        font-weight: 600;
    }

    /* Frankione AML Hits - Technical Diff Style */
    .aml-hit-row {
        background: #FEF2F2 !important; /* Red 50 */
        border: 1px solid #EF4444 !important; /* Red 500 */
        color: #991B1B !important; /* Red 800 */
    }
    .aml-match-row {
        background: #ECFDF5 !important; /* Emerald 50 */
        border: 1px solid #10B981 !important; /* Emerald 500 */
        color: #065F46 !important; /* Emerald 800 */
    }
`;

// Insert the CSS before the closing style tag (or append if not found)
const styleEnd = html.lastIndexOf('</style>');
if (styleEnd !== -1) {
    html = html.substring(0, styleEnd) + highkeyCSS + '\n' + html.substring(styleEnd);
}

// 3. Inject Client-Side DOM Restructuring Script
const jsHighKey = `
<script>
document.addEventListener('DOMContentLoaded', () => {
    // 1. Brutal Nav
    const nav = document.querySelector('nav');
    if (nav) {
        nav.id = 'highkey-nav';
        nav.className = ''; // Strip old classes
    }

    // 2. The Editorial Split Grid
    const main = document.querySelector('main');
    if (main) {
        const container = main.parentElement;
        if (container) {
            container.className = ''; // Remove all padding
        }
        
        main.className = 'highkey-grid';
        
        const children = Array.from(main.children);
        
        const leftCol = document.createElement('div');
        leftCol.className = 'editorial-panel sticky top-[80px] h-[calc(100vh-80px)] overflow-y-auto flex flex-col justify-between';
        
        const rightCol = document.createElement('div');
        rightCol.className = 'flex flex-col border-l border-[#e4e4e7]';
        
        if (children.length > 0) {
            // Rebuild the massive hero title on the left
            const titleWrap = document.createElement('div');
            titleWrap.innerHTML = '<h1 class="payout-id-hero">PAYOUT<br/>#578</h1>';
            leftCol.appendChild(titleWrap);
        
            // Player info to left
            const pInfoOriginal = children[0];
            pInfoOriginal.className = 'flex flex-col gap-8 mt-12';
            leftCol.appendChild(pInfoOriginal);
            
            for (let i = 1; i < children.length; i++) {
                if (children[i].tagName !== 'BUTTON' && children[i].id !== 'approve-btn' && !children[i].querySelector('h2.text-czPurple-500')) {
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
                
                el.className = 'stripped-accordion flex w-full items-center justify-between p-10 text-left cursor-pointer';
                
                if (content && content.getAttribute('data-testid') === 'flowbite-accordion-content') {
                    content.className = 'stripped-accordion-content hidden';
                    i += 2;
                } else {
                    i += 1;
                }
            } else {
                el.className = 'editorial-panel';
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
            btnWrap.className = 'p-12 flex justify-end bg-white sticky bottom-0 z-40 border-t border-[#e4e4e7]';
            
            approveBtn.className = 'brutal-btn';
            
            btnWrap.appendChild(approveBtn);
            rightCol.appendChild(btnWrap);
        }
    }
});
</script>
`;

// Replace closing body tag
html = html.replace('</body>', jsHighKey + '\n</body>');

fs.writeFileSync(target, html);
