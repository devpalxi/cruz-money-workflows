const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'approver3.html');
let html = fs.readFileSync(target, 'utf-8');

// The injected CSS currently looks like:
// /* --- BOLDER INDUSTRIAL COCKPIT OVERRIDES --- */
// ...

const fixCSS = `
    /* Force background transparent on all wrappers */
    .bg-background, .bg-backgroundWhite, .bg-white, .bg-gray-50, .bg-gray-100 {
        background-color: transparent !important;
    }
    
    /* Ensure any root wrappers are dark or transparent */
    #root, .min-h-screen {
        background-color: transparent !important;
    }
    
    /* Fix text colors inside the nav/header if needed */
    nav, header {
        background-color: #09090b !important;
        border-bottom: 1px solid rgba(255,255,255,0.1) !important;
    }
`;

// Insert the fix into the BOLDER CSS block
const bolderEnd = html.indexOf('/* Frankione AML Hits - Raw Terminal Style */');
if (bolderEnd !== -1) {
    html = html.substring(0, bolderEnd) + fixCSS + '\n' + html.substring(bolderEnd);
    fs.writeFileSync(target, html);
    console.log("Fixed background CSS.");
} else {
    // Fallback: just append before </style>
    const styleEnd = html.lastIndexOf('</style>');
    if (styleEnd !== -1) {
        html = html.substring(0, styleEnd) + fixCSS + '\n' + html.substring(styleEnd);
        fs.writeFileSync(target, html);
        console.log("Fixed background CSS (fallback).");
    } else {
        console.log("Could not find style end");
    }
}
