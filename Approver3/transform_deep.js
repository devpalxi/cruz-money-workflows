const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'approver3.html');
let html = fs.readFileSync(target, 'utf-8');

// 1. Inject Advanced CSS (Soft Structuralism + Motion)
const advancedCSS = `
<style>
    /* --- VANGUARD UI ARCHITECT OVERRIDES --- */
    
    /* Soft Structuralism Background */
    body {
        background-color: #fcfdfd; /* Extremely soft cool-white */
        background-image: 
            radial-gradient(at 0% 0%, rgba(26, 107, 107, 0.03) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(245, 166, 35, 0.03) 0px, transparent 50%);
        background-attachment: fixed;
    }

    /* Asymmetrical Bento Grid Classes */
    .bento-grid {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: 1.5rem;
        padding-top: 2rem;
        padding-bottom: 6rem;
    }
    
    @media (max-width: 1024px) {
        .bento-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
        }
    }

    /* Typography Overrides */
    .text-textPrimary { color: #0f172a !important; font-weight: 600; }
    .text-textSecondary { color: #475569 !important; }
    
    /* Accordion Redesign - Remove default gray backgrounds */
    [data-testid="flowbite-accordion-heading"] {
        font-family: 'Outfit', sans-serif;
        font-size: 1.125rem;
        font-weight: 600;
        letter-spacing: -0.01em;
    }
    
    /* Fluid Island Nav Override */
    #vanguard-nav {
        margin: 1.5rem auto;
        width: fit-content;
        min-width: 600px;
        padding: 0.75rem 2rem;
        border-radius: 9999px;
        background-color: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border: 1px solid rgba(0, 0, 0, 0.05);
        box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255,255,255,0.6);
        position: sticky;
        top: 1.5rem;
        z-index: 50;
        transition: all 0.5s cubic-bezier(0.32, 0.72, 0, 1);
    }
    
    /* Intersection Observer Reveal Classes */
    .reveal-item {
        opacity: 0;
        filter: blur(8px);
        transform: translateY(30px);
        transition: opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), 
                    filter 0.8s cubic-bezier(0.22, 1, 0.36, 1), 
                    transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .reveal-item.is-visible {
        opacity: 1;
        filter: blur(0);
        transform: translateY(0);
    }
    
    /* Double Bezel Outer shell utility */
    .bezel-wrap {
        background-color: rgba(0,0,0,0.02);
        padding: 0.375rem;
        border-radius: 1.5rem;
        border: 1px solid rgba(0,0,0,0.04);
        margin-bottom: 1.5rem;
        transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .bezel-inner {
        background-color: #ffffff;
        border-radius: calc(1.5rem - 0.375rem);
        box-shadow: inset 0 1px 1px rgba(255,255,255,0.8), 0 10px 30px -5px rgba(0,0,0,0.03);
        overflow: hidden;
    }
    
    /* Micro-kickers (Eyebrows) */
    .eyebrow {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        background: rgba(26, 107, 107, 0.1);
        color: var(--brand-teal);
        font-size: 0.65rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        margin-bottom: 1rem;
    }

    /* Spring buttons global */
    button {
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease !important;
    }
    button:active {
        transform: translateY(1px) scale(0.98) !important;
    }
    
    /* Fix layout width */
    #root {
        max-width: 1440px;
        margin: 0 auto;
    }
</style>
`;

if (!html.includes('VANGUARD UI ARCHITECT OVERRIDES')) {
    html = html.replace('</style>', '</style>\n' + advancedCSS);
}

// 2. Inject Client-Side DOM Restructuring Script
// We use a self-executing function to run after DOM is fully parsed.
const jsArchitect = `
<script>
document.addEventListener('DOMContentLoaded', () => {
    // 1. Fluid Island Nav
    const nav = document.querySelector('nav');
    if (nav) {
        nav.id = 'vanguard-nav';
        nav.className = 'flex items-center justify-between'; // Strip old classes
    }

    // 2. Wrap main content in Bento Grid
    const main = document.querySelector('main');
    if (main) {
        // Find the overarching layout container
        const container = main.parentElement;
        if (container) {
            container.classList.remove('md:px-10', 'lg:px-20', 'xl:px-40');
            container.classList.add('px-4', 'md:px-8', 'lg:px-12');
        }
        
        main.classList.add('bento-grid');
        main.classList.remove('flex', 'flex-col'); // Remove old flex stack
        
        // Let's divide the children of main into two columns:
        // Left Column (Player Context): col-span-4
        // Right Column (Approvals & History): col-span-8
        
        const children = Array.from(main.children);
        
        // We will create two wrappers
        const leftCol = document.createElement('div');
        leftCol.className = 'col-span-12 lg:col-span-4 flex flex-col gap-6';
        
        const rightCol = document.createElement('div');
        rightCol.className = 'col-span-12 lg:col-span-8 flex flex-col gap-6';
        
        // Move children. The first child is usually the Player Info card.
        if (children.length > 0) {
            leftCol.appendChild(children[0]); // Player Info
            // If there's an AML block standalone, it might be the next one.
            // But in approver3, AML is inside the accordion or standalone. 
            // We'll put the first element in left, rest in right.
            for (let i = 1; i < children.length; i++) {
                if (children[i].tagName !== 'BUTTON' && children[i].id !== 'approve-btn') {
                    rightCol.appendChild(children[i]);
                }
            }
        }
        
        // Now handle the Accordions specifically. 
        // Flowbite accordions are usually a pair of <button> and <div>
        const accordions = Array.from(rightCol.querySelectorAll('button:has([data-testid="flowbite-accordion-heading"])'));
        
        // If accordions are directly in rightCol, we wrap them in Double Bezel
        let i = 0;
        const rightChildren = Array.from(rightCol.children);
        
        while (i < rightChildren.length) {
            const el = rightChildren[i];
            if (el.tagName === 'BUTTON' && el.querySelector('[data-testid="flowbite-accordion-heading"]')) {
                const content = rightChildren[i+1];
                
                // Create bezel wrap
                const wrap = document.createElement('div');
                wrap.className = 'bezel-wrap reveal-item';
                
                const inner = document.createElement('div');
                inner.className = 'bezel-inner';
                
                // Style the button
                el.classList.remove('bg-gray-100', 'dark:bg-gray-800', 'hover:bg-gray-100');
                el.classList.add('bg-white', 'hover:bg-gray-50', 'transition-colors', 'px-6', 'py-5');
                
                // Add eyebrow to the title
                const heading = el.querySelector('h2');
                if (heading) {
                    const titleText = heading.textContent;
                    heading.innerHTML = \`<span class="block eyebrow">Section</span>\${titleText}\`;
                }
                
                inner.appendChild(el);
                
                if (content && content.getAttribute('data-testid') === 'flowbite-accordion-content') {
                    content.classList.remove('dark:bg-gray-900', 'p-5');
                    content.classList.add('p-6', 'bg-white', 'border-t', 'border-gray-50');
                    inner.appendChild(content);
                    i += 2;
                } else {
                    i += 1;
                }
                
                wrap.appendChild(inner);
                rightCol.insertBefore(wrap, rightChildren[i]);
            } else {
                el.classList.add('reveal-item');
                i++;
            }
        }
        
        main.innerHTML = '';
        main.appendChild(leftCol);
        main.appendChild(rightCol);
        
        // Move the approve button to the bottom of right col
        const approveBtn = document.getElementById('approve-btn');
        if (approveBtn) {
            const btnWrap = document.createElement('div');
            btnWrap.className = 'mt-8 reveal-item flex justify-end';
            
            approveBtn.classList.remove('w-full');
            approveBtn.classList.add('w-auto', 'px-12', 'py-4', 'rounded-full', 'shadow-xl', 'text-base', 'btn-spring');
            
            btnWrap.appendChild(approveBtn);
            rightCol.appendChild(btnWrap);
        }
    }
    
    // 3. Upgrade remaining standalone Double Bezels
    const legacyBezels = document.querySelectorAll('.double-bezel');
    legacyBezels.forEach(b => {
        b.classList.add('bezel-wrap', 'reveal-item');
        b.classList.remove('double-bezel');
        
        const inner = b.querySelector('.double-bezel-inner');
        if (inner) {
            inner.classList.add('bezel-inner');
            inner.classList.remove('double-bezel-inner');
        }
    });

    // 4. Staggered Intersection Observer (Reveal Animation)
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add staggered delay based on index
                setTimeout(() => {
                    entry.target.classList.add('is-visible');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.reveal-item').forEach((el) => {
        observer.observe(el);
    });
    
});
</script>
`;

if (!html.includes('vanguard-nav')) {
    html = html.replace('</body>', jsArchitect + '\n</body>');
}

fs.writeFileSync(target, html);
