const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// The upload area background
html = html.replace(/background: rgba\(255, 255, 255, 0\.7\);/g, 'background: rgba(15, 23, 42, 0.5);');

// The preview image wrap background
html = html.replace(/\.preview-img-wrap {\n\s*border-radius: 20px;\n\s*overflow: hidden;\n\s*border: 1px solid var\(--glass-border\);\n\s*background: #ffffff;/g, 
  '.preview-img-wrap {\n      border-radius: 20px;\n      overflow: hidden;\n      border: 1px solid var(--glass-border);\n      background: #0f172a;');

// The intensity-card background
html = html.replace(/\.intensity-card {\n\s*background: #ffffff;/g, 
  '.intensity-card {\n      background: #1e293b;');
html = html.replace(/\.intensity-value {\n\s*font-family: 'Fraunces', serif;\n\s*font-size: 2rem;\n\s*font-weight: 400;\n\s*color: var\(--ink\);/g, 
  ".intensity-value {\n      font-family: 'Fraunces', serif;\n      font-size: 2rem;\n      font-weight: 400;\n      color: #ffffff;");

// The analysis-card background
html = html.replace(/\.analysis-card {\n\s*background: #ffffff;/g, 
  '.analysis-card {\n      background: #1e293b;');
html = html.replace(/\.analysis-card-top {\n\s*padding: 20px 28px;\n\s*border-bottom: 1px solid var\(--border\);\n\s*display: flex;\n\s*align-items: center;\n\s*gap: 16px;\n\s*background: rgba\(211, 235, 237, 0\.5\);/g, 
  '.analysis-card-top {\n      padding: 20px 28px;\n      border-bottom: 1px solid var(--border);\n      display: flex;\n      align-items: center;\n      gap: 16px;\n      background: rgba(15, 23, 42, 0.5);');

// analysis-icon background
html = html.replace(/\.analysis-icon {\n\s*width: 40px;\n\s*height: 40px;\n\s*border-radius: 12px;\n\s*background: #ffffff;/g, 
  '.analysis-icon {\n      width: 40px;\n      height: 40px;\n      border-radius: 12px;\n      background: #334155;');

// analysis-body color
html = html.replace(/\.analysis-body {\n\s*padding: 28px;\n\s*font-size: 15\.5px;\n\s*line-height: 1\.8;\n\s*white-space: pre-wrap;\n\s*font-weight: 400;\n\s*color: var\(--ink\);/g, 
  '.analysis-body {\n      padding: 28px;\n      font-size: 15.5px;\n      line-height: 1.8;\n      white-space: pre-wrap;\n      font-weight: 400;\n      color: #cbd5e1;');

// details (Ver respuesta completa) background
html = html.replace(/details {\n\s*margin-bottom: 2rem;\n\s*background: rgba\(15, 23, 42, 0\.5\);/g, // if it was 255,255,255,0.7 it was replaced earlier
  'details {\n      margin-bottom: 2rem;\n      background: rgba(15, 23, 42, 0.5);');
html = html.replace(/details\[open\] {\n\s*background: #ffffff;/g, 
  'details[open] {\n      background: #0f172a;');

// The raw-content background
html = html.replace(/\.raw-content {\n\s*background: var\(--cream\);/g, 
  '.raw-content {\n      background: #1e293b;');

// Replace details summary color
html = html.replace(/details summary {\n\s*font-size: 13px;\n\s*font-weight: 600;\n\s*color: var\(--muted\);/g, 
  'details summary {\n      font-size: 13px;\n      font-weight: 600;\n      color: #cbd5e1;');

// The upload icon background
html = html.replace(/\.upload-icon {\n\s*width: 72px;\n\s*height: 72px;\n\s*margin: 0 auto 16px;\n\s*background: #ffffff;/g, 
  '.upload-icon {\n      width: 72px;\n      height: 72px;\n      margin: 0 auto 16px;\n      background: #334155;');

// Also step done/active colors
// .step.active { background: linear-gradient(135deg, var(--teal-deep), #4a8c96); color: #ffffff; ... } => Let's use blue
html = html.replace(/background: linear-gradient\(135deg, var\(--teal-deep\), #4a8c96\);/g, 'background: linear-gradient(135deg, var(--teal-deep), #60a5fa);');

// Change card-subtitle from var(--muted) to #94a3b8
html = html.replace(/\.card-subtitle {\n\s*font-size: 13px;\n\s*color: var\(--muted\);/g, 
  '.card-subtitle {\n      font-size: 13px;\n      color: #94a3b8;');

// And .upload-hint
html = html.replace(/\.upload-hint {\n\s*font-size: 14px;\n\s*color: var\(--muted\);/g, 
  '.upload-hint {\n      font-size: 14px;\n      color: #94a3b8;');

// And section-label
html = html.replace(/\.section-label {\n\s*font-size: 12px;\n\s*font-weight: 700;\n\s*text-transform: uppercase;\n\s*letter-spacing: 0\.1em;\n\s*color: var\(--muted\);/g, 
  '.section-label {\n      font-size: 12px;\n      font-weight: 700;\n      text-transform: uppercase;\n      letter-spacing: 0.1em;\n      color: #64748b;');

fs.writeFileSync('public/index.html', html);
console.log('done updating dark theme elements');
