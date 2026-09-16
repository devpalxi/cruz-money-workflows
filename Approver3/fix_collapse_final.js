const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'approver3.html');
let html = fs.readFileSync(target, 'utf-8');

// Inject the ultimate collapse/expand fix at the very end of body
const ultimateFixScript = `
<script>
window.addEventListener('load', function() {
    let isCollapsed = false;

    function getToggleButtons() {
        return Array.from(document.querySelectorAll('button')).filter(btn => 
            btn.textContent.includes('Collapse All') || btn.textContent.includes('Expand All')
        );
    }

    function executeToggle(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        isCollapsed = !isCollapsed;

        // 1. Update text & icons of ALL matching buttons
        const allBtns = getToggleButtons();
        allBtns.forEach(btn => {
            const spanText = btn.querySelector('span:first-child');
            const spanIcon = btn.querySelector('span:last-child');
            
            if (spanText) {
                spanText.textContent = isCollapsed ? 'Expand All' : 'Collapse All';
            } else {
                // If text is directly inside button
                btn.innerHTML = isCollapsed ? 'Expand All <span class="text-[10px]">▼</span>' : 'Collapse All <span class="text-[10px]">▲</span>';
            }
            
            if (spanIcon) {
                spanIcon.textContent = isCollapsed ? '▼' : '▲';
            }
        });

        // 2. Toggle visibility of all neo-card bodies
        const cards = document.querySelectorAll('.neo-card');
        cards.forEach((card, index) => {
            // Skip the first card (Overview) if you want, or include all
            // Let's include all cards
            const wrapper = card.querySelector('.neo-card-content');
            const headingChevron = card.querySelector('h3 span');

            if (wrapper) {
                wrapper.style.display = isCollapsed ? 'none' : 'block';
                if (headingChevron) {
                    headingChevron.style.transform = isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)';
                }
            } else {
                // Fallback if card content wrapper doesn't exist
                Array.from(card.children).forEach(child => {
                    if (child.tagName !== 'H3') {
                        child.style.display = isCollapsed ? 'none' : 'block';
                    }
                });
            }
        });
    }

    // Bind event handlers directly by replacing buttons with fresh clones (stripping stale listeners)
    function bindButtons() {
        const btns = getToggleButtons();
        btns.forEach(btn => {
            const freshBtn = btn.cloneNode(true);
            if (btn.parentNode) {
                btn.parentNode.replaceChild(freshBtn, btn);
                freshBtn.addEventListener('click', executeToggle);
            }
        });
    }

    bindButtons();
});
</script>
`;

html = html.replace('</body>', ultimateFixScript + '\n</body>');

fs.writeFileSync(target, html);
console.log('Successfully injected ultimate collapse/expand fix.');
