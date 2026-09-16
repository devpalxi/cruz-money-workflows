const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'approver3.html');
let html = fs.readFileSync(target, 'utf-8');

// Ensure the #fcfdfd body background shows through by stripping .bg-background
const fixCSS = `
    <style>
    /* Ensure the body background shows through */
    .bg-background, .bg-backgroundWhite, .bg-white, .bg-gray-50, .bg-gray-100 {
        background-color: transparent !important;
    }
    #root, .min-h-screen {
        background-color: transparent !important;
    }
    
    /* Ensure text colors are dark for light mode */
    .text-textPrimary { color: #0f172a !important; }
    .text-textSecondary { color: #475569 !important; }
    .text-gray-900, .text-gray-800, .text-gray-700 { color: #0f172a !important; }
    .text-white { color: #ffffff !important; }
    </style>
`;

html = html.replace('</body>', fixCSS + '\n</body>');

fs.writeFileSync(target, html);
