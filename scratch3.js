const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

html = html.replace(/\.field input:focus,\n\s*\.field select:focus,\n\s*\.field textarea:focus {\n\s*border-color: var\(--teal-mid\);\n\s*background: #ffffff;/g, 
  '.field input:focus,\n    .field select:focus,\n    .field textarea:focus {\n      border-color: var(--teal-mid);\n      background: #1e293b;');

html = html.replace(/\.field input:hover,\n\s*\.field select:hover,\n\s*\.field textarea:hover {\n\s*background: #ffffff;/g, 
  '.field input:hover,\n    .field select:hover,\n    .field textarea:hover {\n      background: #334155;');

html = html.replace(/\.radio-opt:hover {\n\s*transform: translateY\(-2px\);\n\s*box-shadow: 0 4px 12px rgba\(37, 99, 235, 0\.15\);\n\s*color: #ffffff;\n\s*background: #334155;/g,
  '.radio-opt:hover {\n      transform: translateY(-2px);\n      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);\n      color: #ffffff;\n      background: #334155;'); // already fine, just double checking

// Check upload area
html = html.replace(/\.upload-area:hover,\n\s*\.upload-area\.drag {\n\s*border-color: var\(--teal-mid\);\n\s*background: var\(--teal-soft\);/g, 
  '.upload-area:hover,\n    .upload-area.drag {\n      border-color: var(--teal-mid);\n      background: rgba(30, 58, 138, 0.5);');

fs.writeFileSync('public/index.html', html);
console.log('done fixing hovers');
