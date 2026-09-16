const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'approver3.html');
let html = fs.readFileSync(target, 'utf-8');

// 1. Clean up any previous injections if they exist
const cssStart = html.indexOf('/* --- NEO-MINIMALIST OVERRIDES --- */');
if (cssStart !== -1) {
    const styleEnd = html.indexOf('</style>', cssStart);
    if (styleEnd !== -1) {
        html = html.substring(0, cssStart) + html.substring(styleEnd);
    }
}

// 2. Inject Neo-Minimalist CSS
const neominimalistCSS = `
    /* --- NEO-MINIMALIST OVERRIDES --- */
    
    /* Base Neutral Canvas */
    body, html {
        background-color: #fafafa !important; /* Zinc 50 */
        color: #18181b !important; /* Zinc 900 */
        font-family: 'Geist', 'Inter', sans-serif !important;
        -webkit-font-smoothing: antialiased;
    }
    
    /* Typography Overrides */
    h1, h2, h3, h4, h5, h6 {
        font-family: 'Geist', 'Inter', sans-serif !important;
        font-weight: 600 !important;
        letter-spacing: -0.02em !important;
        color: #09090b !important;
    }
    
    /* Neo-Minimalist Layout Container */
    .neo-layout {
        max-w: 72rem; /* max-w-6xl */
        margin: 0 auto;
        padding: 4rem 2rem;
        display: grid;
        grid-template-columns: 280px 1fr;
        gap: 4rem;
        align-items: start;
    }
    
    @media (max-width: 1024px) {
        .neo-layout {
            grid-template-columns: 1fr;
            gap: 2rem;
            padding: 2rem 1rem;
        }
    }

    /* Sticky Sidebar Navigation */
    .neo-sidebar {
        position: sticky;
        top: 6rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .neo-nav-link {
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: #71717a; /* Zinc 500 */
        border-radius: 0.5rem;
        transition: all 0.2s ease;
        text-decoration: none;
        cursor: pointer;
    }
    
    .neo-nav-link:hover, .neo-nav-link.active {
        background-color: #f4f4f5; /* Zinc 100 */
        color: #09090b; /* Zinc 950 */
    }

    /* Floating White Cards */
    .neo-card {
        background-color: #ffffff !important;
        border: 1px solid rgba(228, 228, 231, 0.8) !important; /* Zinc 200 */
        border-radius: 1rem !important;
        padding: 2.5rem !important;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 20px 40px -15px rgba(0, 0, 0, 0.04) !important;
        margin-bottom: 2rem;
        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    .neo-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.02), 0 30px 60px -15px rgba(0, 0, 0, 0.05) !important;
    }

    /* Clean Buttons */
    .neo-btn-primary {
        background-color: #2563EB !important; /* Cobalt Blue */
        color: #ffffff !important;
        border-radius: 9999px !important;
        font-weight: 500 !important;
        letter-spacing: -0.01em;
        padding: 1rem 3rem !important;
        border: none !important;
        box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.39) !important;
        transition: all 0.2s ease !important;
    }
    
    .neo-btn-primary:hover {
        background-color: #1D4ED8 !important; /* Deeper Cobalt */
        box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4) !important;
        transform: translateY(-1px);
    }
    .neo-btn-primary:active {
        transform: translateY(1px);
        box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3) !important;
    }

    /* Override all generic Tailwind backgrounds */
    .bg-background, .bg-backgroundWhite, .bg-gray-50, .bg-gray-100 { background-color: transparent !important; }
    
    /* Root cleanup */
    #root, .min-h-screen {
        background-color: transparent !important;
    }

    /* Clean Nav */
    #neo-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.25rem 2rem;
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-bottom: 1px solid rgba(228, 228, 231, 0.5);
        position: sticky;
        top: 0;
        z-index: 50;
    }
    
    /* Data Grids */
    .data-label {
        color: #71717a; /* Zinc 500 */
        font-size: 0.875rem;
        font-weight: 500;
        margin-bottom: 0.25rem;
    }
    .data-val {
        color: #09090b;
        font-weight: 500;
        font-size: 1rem;
    }
`;

// Insert the CSS before the closing style tag (or append if not found)
const styleEnd = html.lastIndexOf('</style>');
if (styleEnd !== -1) {
    html = html.substring(0, styleEnd) + neominimalistCSS + '\n' + html.substring(styleEnd);
}

// 3. Inject Client-Side DOM Restructuring Script
const jsNeoMinimalist = `
<script>
document.addEventListener('DOMContentLoaded', () => {
    // 1. Clean Nav
    const nav = document.querySelector('nav');
    if (nav) {
        nav.id = 'neo-nav';
        nav.className = ''; // Strip old classes
    }

    // 2. The Sidebar + Stacked Cards Layout
    const main = document.querySelector('main');
    if (main) {
        const container = main.parentElement;
        if (container) {
            container.className = ''; // Remove all full-width padding
        }
        
        main.className = 'neo-layout';
        
        const children = Array.from(main.children);
        
        const sidebar = document.createElement('aside');
        sidebar.className = 'neo-sidebar hidden lg:flex';
        
        const contentArea = document.createElement('div');
        contentArea.className = 'flex flex-col w-full min-w-0';
        
        // Payout Hero header in Sidebar
        const sidebarHeader = document.createElement('div');
        sidebarHeader.innerHTML = '<h2 class="text-3xl font-semibold mb-8 text-zinc-900">Payout #578</h2>';
        sidebar.appendChild(sidebarHeader);

        let sectionIndex = 0;
        
        if (children.length > 0) {
            // Player info to contentArea as a card
            const pInfoOriginal = children[0];
            pInfoOriginal.className = 'neo-card flex flex-col gap-6';
            
            // Add title for Player Info
            const pTitle = document.createElement('h3');
            pTitle.className = 'text-lg font-semibold border-b border-zinc-100 pb-4 mb-2';
            pTitle.innerText = 'Overview';
            pInfoOriginal.insertBefore(pTitle, pInfoOriginal.firstChild);
            
            contentArea.appendChild(pInfoOriginal);
            
            // Create nav link for Overview
            const navLink = document.createElement('a');
            navLink.className = 'neo-nav-link active';
            navLink.innerText = 'Overview';
            sidebar.appendChild(navLink);
            
            for (let i = 1; i < children.length; i++) {
                if (children[i].tagName !== 'BUTTON' && children[i].id !== 'approve-btn' && !children[i].querySelector('h2.text-czPurple-500')) {
                    // Extract accordions
                    const el = children[i];
                    if (el.tagName === 'BUTTON' && el.querySelector('[data-testid="flowbite-accordion-heading"]')) {
                        const headingText = el.querySelector('h2').innerText;
                        
                        // Create nav link
                        const link = document.createElement('a');
                        link.className = 'neo-nav-link';
                        link.innerText = headingText;
                        sidebar.appendChild(link);
                        
                        // The next element is the content
                        const content = children[i+1];
                        if (content && content.getAttribute('data-testid') === 'flowbite-accordion-content') {
                            // Convert to Neo Card
                            content.className = 'neo-card';
                            
                            // Inject heading inside card
                            const cardTitle = document.createElement('h3');
                            cardTitle.className = 'text-lg font-semibold border-b border-zinc-100 pb-4 mb-6';
                            cardTitle.innerText = headingText;
                            content.insertBefore(cardTitle, content.firstChild);
                            
                            contentArea.appendChild(content);
                            i++; // Skip the content in the loop
                        }
                    } else {
                        // Any other stray content becomes a card
                        if(el.innerText.trim() !== '') {
                            el.className = 'neo-card';
                            contentArea.appendChild(el);
                        }
                    }
                }
            }
        }
        
        main.innerHTML = '';
        main.appendChild(sidebar);
        main.appendChild(contentArea);
        
        // Approve Button
        const approveBtn = document.getElementById('approve-btn');
        if (approveBtn) {
            const btnWrap = document.createElement('div');
            btnWrap.className = 'mt-4 flex justify-end';
            
            approveBtn.className = 'neo-btn-primary';
            
            btnWrap.appendChild(approveBtn);
            contentArea.appendChild(btnWrap);
        }
    }
});
</script>
`;

// Replace closing body tag
html = html.replace('</body>', jsNeoMinimalist + '\n</body>');

fs.writeFileSync(target, html);
