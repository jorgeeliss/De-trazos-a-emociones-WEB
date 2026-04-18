const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// For .upload-icon svg
html = html.replace(/\.upload-icon svg \{ width: 28px; height: 28px; color: #60a5fa; \}/, '.upload-icon svg { width: 28px; height: 28px; color: #ffffff; }');

// For .analysis-icon
if (!html.includes('.analysis-icon {')) {
  html = html.replace(/\/\* RESULT \*\//, `/* RESULT */\n    .analysis-icon {\n      width: 40px;\n      height: 40px;\n      border-radius: 12px;\n      background: rgba(96, 165, 250, 0.15);\n      box-shadow: 0 4px 12px rgba(96, 165, 250, 0.2);\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      color: #ffffff;\n      animation: floatIcon 3.5s ease-in-out infinite alternate;\n    }\n    .analysis-icon svg {\n      width: 20px;\n      height: 20px;\n      color: #ffffff;\n    }`);
} else {
  html = html.replace(/\.analysis-icon \{[\s\S]*?\}/, `.analysis-icon {\n      width: 40px;\n      height: 40px;\n      border-radius: 12px;\n      background: rgba(96, 165, 250, 0.15);\n      box-shadow: 0 4px 12px rgba(96, 165, 250, 0.2);\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      color: #ffffff;\n      animation: floatIcon 3.5s ease-in-out infinite alternate;\n    }`);
  html = html.replace(/\.analysis-icon svg \{[\s\S]*?\}/, `.analysis-icon svg { width: 20px; height: 20px; color: #ffffff; }`);
}

// Fix inline styles for icon
html = html.replace(/<div class="card-icon" style="background:rgba\(167, 139, 250, 0\.15\); color:#a78bfa;">/g, '<div class="card-icon" style="background:rgba(167, 139, 250, 0.15); color:#ffffff;">');

fs.writeFileSync('public/index.html', html);
console.log('done fixing icon colors to white');
