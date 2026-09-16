const fs = require('fs');
const path = require('path');

const approver3Path = path.join(__dirname, 'approver3.html');
let html = fs.readFileSync(approver3Path, 'utf-8');

// 1. Fix the invalid single quotes inside single-quoted strings in switchAMLScenario
html = html.replace(/openDetailsModal\('pep'\)/g, 'openDetailsModal(&quot;pep&quot;)');
html = html.replace(/openDetailsModal\('sanctions'\)/g, 'openDetailsModal(&quot;sanctions&quot;)');

// 2. Make individual card headers clickable for collapsible functionality
const cardHeaderAdditions = `
<script>
    // Add individual card click-to-collapse functionality
    document.addEventListener('DOMContentLoaded', function() {
        const cards = document.querySelectorAll('.card-collapsible');
        cards.forEach(card => {
            const header = card.querySelector('.flex.items-center.justify-between');
            if (header) {
                header.style.cursor = 'pointer';
                
                // Add toggle indicator if not present
                if (!header.querySelector('.card-toggle-icon')) {
                    const icon = document.createElement('span');
                    icon.className = 'card-toggle-icon text-xs text-slate-400 font-bold ml-2 transition-transform duration-200';
                    icon.innerHTML = '▲';
                    
                    // Append to header right side or inside title
                    const titleWrap = header.querySelector('div') || header;
                    titleWrap.appendChild(icon);
                }

                header.addEventListener('click', function(e) {
                    // Don't toggle if clicking on switcher buttons or pills inside header
                    if (e.target.closest('button') || e.target.closest('input')) return;
                    
                    const body = card.querySelector('.card-body');
                    const icon = header.querySelector('.card-toggle-icon');
                    if (body) {
                        const isHidden = body.style.display === 'none';
                        body.style.display = isHidden ? 'block' : 'none';
                        if (icon) icon.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
                    }
                });
            }
        });
    });
</script>
`;

html = html.replace('</body>', cardHeaderAdditions + '\n</body>');

fs.writeFileSync(approver3Path, html);
console.log('Successfully fixed JS syntax error and added individual card collapse handlers in approver3.html');
