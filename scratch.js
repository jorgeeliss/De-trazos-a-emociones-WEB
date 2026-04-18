const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// Replace color variables
html = html.replace(/--mint-soft: #e8ffe6;/g, '--mint-soft: #e0f2fe;');
html = html.replace(/--mint-mid: #c6ffc1;/g, '--mint-mid: #bae6fd;');
html = html.replace(/--mint-deep: #8bc986;/g, '--mint-deep: #7dd3fc;');

html = html.replace(/--teal-soft: #d3ebed;/g, '--teal-soft: #dbeafe;');
html = html.replace(/--teal-mid: #68a0a6;/g, '--teal-mid: #93c5fd;');
html = html.replace(/--teal-deep: #34656d;/g, '--teal-deep: #2563eb;');

// Make inputs dark
html = html.replace(/background: rgba\(255, 255, 255, 0\.9\);/g, 'background: rgba(15, 23, 42, 0.9);');

// Change card color to dark too! "la parte donde se llene la informacion sea de un tono oscuro"
// Let's change the card background entirely
html = html.replace(/background: var\(--glass-bg\);/g, 'background: #1e293b;');
// Also update --glass-bg just in case
html = html.replace(/--glass-bg: rgba\(255, 255, 255, 0\.85\);/g, '--glass-bg: #1e293b;');
html = html.replace(/--glass-border: rgba\(255, 255, 255, 0\.9\);/g, '--glass-border: rgba(255, 255, 255, 0.1);');

// Change titles to white inside cards
html = html.replace(/color: var\(--ink\);\n      letter-spacing/g, 'color: #ffffff;\n      letter-spacing');

// Fix text colors in inputs
html = html.replace(/color: var\(--ink\);(\s+outline: none;)/g, 'color: #f8fafc;$1');

// Let's also update the radio-opt text color since it's dark background now
html = html.replace(/color: var\(--muted\);(\s+box-shadow: 0 2px 8px rgba\(0, 0, 0, 0.02\);)/g, 'color: #cbd5e1;$1');

// And radio hover text color
html = html.replace(/color: var\(--ink\);(\s+background: #ffffff;\s+})/g, 'color: #ffffff;\n      background: #334155;\n    }');

// Change some specific text colors that were --ink inside inputs and cards
html = html.replace(/color: var\(--ink\);/g, 'color: #f8fafc;'); 
// Wait! If I change all --ink to white, the title h1 and step colors might turn white!
// Let's redefine --ink to #334443, but in cards it overrides. Let's just fix it.

// Re-read carefully, let's just do targeted replaces.
html = html.replace(/background: rgba\(255, 255, 255, 0\.9\);/g, 'background: rgba(15, 23, 42, 0.9);');

// The glass shadow could be bluer:
html = html.replace(/rgba\(52, 101, 109, 0\.1\)/g, 'rgba(37, 99, 235, 0.15)');
html = html.replace(/rgba\(52, 101, 109, 0\.15\)/g, 'rgba(37, 99, 235, 0.2)');
html = html.replace(/rgba\(52, 101, 109, 0\.2\)/g, 'rgba(37, 99, 235, 0.25)');
html = html.replace(/rgba\(52, 101, 109, 0\.3\)/g, 'rgba(37, 99, 235, 0.3)');

// The JS STYLES array
html = html.replace(/{ bg: '#e8ffe6', color: '#34656d', dot: '#c6ffc1' }/g, "{ bg: '#e0f2fe', color: '#1e40af', dot: '#93c5fd' }");
html = html.replace(/{ bg: '#d3ebed', color: '#1f3b40', dot: '#34656d' }/g, "{ bg: '#dbeafe', color: '#1e3a8a', dot: '#2563eb' }");
html = html.replace(/{ bg: '#e8ffe6', color: '#334443', dot: '#8bc986' }/g, "{ bg: '#e0f2fe', color: '#1e40af', dot: '#7dd3fc' }");
html = html.replace(/{ bg: '#f0fdf4', color: '#34656d', dot: '#68a0a6' }/g, "{ bg: '#eff6ff', color: '#2563eb', dot: '#93c5fd' }");
html = html.replace(/{ bg: '#d3ebed', color: '#334443', dot: '#34656d' }/g, "{ bg: '#dbeafe', color: '#1e40af', dot: '#2563eb' }");

fs.writeFileSync('public/index.html', html);
console.log('done');
