const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'approver3.html');
let html = fs.readFileSync(target, 'utf-8');

// 1. Fix the toggleBtn crash in the original script
// The original script has: toggleBtn.addEventListener('click', () => {
html = html.replace(/toggleBtn\.addEventListener\('click'/g, "if(toggleBtn) toggleBtn.addEventListener('click'");

// 2. We need to add Collapse/Expand functionality to the Neo-Minimalist cards.
// We will inject a new script that runs AFTER DOMContentLoaded, or we can just append it.
const fixScript = `
<script>
setTimeout(() => {
    // 1. Add Collapse All / Expand All button to the sidebar
    const sidebar = document.querySelector('.neo-sidebar');
    if (sidebar && !document.getElementById('neo-toggle-btn')) {
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'neo-toggle-btn';
        toggleBtn.className = 'neo-btn-primary mt-6 text-sm py-2 px-4 w-full';
        toggleBtn.style.padding = '0.5rem 1rem';
        toggleBtn.innerText = 'Collapse All';
        sidebar.appendChild(toggleBtn);
        
        let isCollapsed = false;
        
        const cards = document.querySelectorAll('.neo-card');
        
        // Wrap card contents so they can be collapsed
        cards.forEach(card => {
            // Find the heading
            const heading = card.querySelector('h3');
            if (heading) {
                heading.style.cursor = 'pointer';
                heading.className += ' flex justify-between items-center';
                
                // Add chevron
                const chevron = document.createElement('span');
                chevron.innerHTML = '▼';
                chevron.style.fontSize = '0.75rem';
                chevron.style.transition = 'transform 0.2s';
                heading.appendChild(chevron);
                
                // Wrap siblings
                const wrapper = document.createElement('div');
                wrapper.className = 'neo-card-content overflow-hidden transition-all duration-300';
                
                // Move all children after heading into wrapper
                while (heading.nextSibling) {
                    wrapper.appendChild(heading.nextSibling);
                }
                card.appendChild(wrapper);
                
                // Click to toggle
                heading.addEventListener('click', () => {
                    const isClosed = wrapper.style.display === 'none';
                    if (isClosed) {
                        wrapper.style.display = 'block';
                        chevron.style.transform = 'rotate(0deg)';
                    } else {
                        wrapper.style.display = 'none';
                        chevron.style.transform = 'rotate(-90deg)';
                    }
                });
            }
        });
        
        // Toggle All Logic
        toggleBtn.addEventListener('click', () => {
            isCollapsed = !isCollapsed;
            toggleBtn.innerText = isCollapsed ? 'Expand All' : 'Collapse All';
            
            cards.forEach(card => {
                const heading = card.querySelector('h3');
                const wrapper = card.querySelector('.neo-card-content');
                const chevron = heading ? heading.querySelector('span') : null;
                
                if (wrapper && chevron) {
                    if (isCollapsed) {
                        wrapper.style.display = 'none';
                        chevron.style.transform = 'rotate(-90deg)';
                    } else {
                        wrapper.style.display = 'block';
                        chevron.style.transform = 'rotate(0deg)';
                    }
                }
            });
        });
    }

    // 2. Fix Sidebar Links to scroll to the corresponding card
    const links = document.querySelectorAll('.neo-nav-link');
    const cardsList = document.querySelectorAll('.neo-card');
    links.forEach((link, idx) => {
        if (cardsList[idx]) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                // Expand if collapsed
                const wrapper = cardsList[idx].querySelector('.neo-card-content');
                const chevron = cardsList[idx].querySelector('h3 span');
                if (wrapper && wrapper.style.display === 'none') {
                    wrapper.style.display = 'block';
                    if(chevron) chevron.style.transform = 'rotate(0deg)';
                }
                
                cardsList[idx].scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                // Update active state
                links.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        }
    });
}, 500); // Run slightly after main initializations
</script>
`;

html = html.replace('</body>', fixScript + '\n</body>');

// Also make sure z-index of modals is high enough
html = html.replace('z-index: 50;', 'z-index: 99999;');

fs.writeFileSync(target, html);
