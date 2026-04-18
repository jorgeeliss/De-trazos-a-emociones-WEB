const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// 1. Remove body::before and media query for it
html = html.replace(/\/\* The structural split background \*\/[\s\S]*?body::before \{[\s\S]*?z-index: -2;\n\s*\}/, '');
html = html.replace(/@media \(max-width: 640px\) \{\n\s*body::before \{\n\s*height: 440px;\n\s*\}\n\s*\}/, '');

// 2. Change body background and text color
html = html.replace(/body \{\n\s*font-family: 'DM Sans', sans-serif;\n\s*background: var\(--dark-bg\);\n\s*color: var\(--text-card\);/g, 
  "body {\n      font-family: 'DM Sans', sans-serif;\n      background: var(--hero-bg);\n      color: var(--text-hero);");

// 3. Restore .bg-dots completely
html = html.replace(/\/\* Animated Gradient Background - constrained so it looks nice but subtle \*\/[\s\S]*?\.bg-dots \{[\s\S]*?overflow: hidden;\n\s*\}/, 
  `/* Animated Gradient Background */
    .bg-dots {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
      background: linear-gradient(135deg, #f8f7f4 0%, #eef2f6 100%);
    }`);

// Update bg-dots spans for beautiful colors (soft blues and indigos)
html = html.replace(/\.bg-dots span:nth-child\(1\) \{[\s\S]*?\}/, 
  `.bg-dots span:nth-child(1) {
      width: 60vw; height: 60vw; background: rgba(147, 197, 253, 0.4); top: -20%; left: -10%;
    }`);
html = html.replace(/\.bg-dots span:nth-child\(2\) \{[\s\S]*?\}/, 
  `.bg-dots span:nth-child(2) {
      width: 50vw; height: 50vw; background: rgba(99, 102, 241, 0.2); bottom: -10%; right: -10%; animation-delay: -5s; animation-direction: alternate-reverse;
    }`);
html = html.replace(/\.bg-dots span:nth-child\(3\) \{[\s\S]*?\}/, 
  `.bg-dots span:nth-child(3) {
      width: 40vw; height: 40vw; background: rgba(219, 234, 254, 0.6); top: 20%; left: 40%; animation-delay: -10s;
    }`);

// We also need to change the opacity in .bg-dots span to be more visible like before
html = html.replace(/\.bg-dots span \{\n\s*position: absolute;\n\s*border-radius: 50%;\n\s*filter: blur\(90px\);\n\s*opacity: 0\.6;/g, 
  '.bg-dots span {\n      position: absolute;\n      border-radius: 50%;\n      filter: blur(90px);\n      opacity: 0.85;');

// Also, the .steps background was white, let's make it slight translucent like before? "manten las animaciones que ya tienes"
// Previous .steps background was rgba(255, 255, 255, 0.5) with blur.
html = html.replace(/\.steps \{\n\s*display: flex;[\s\S]*?background: #ffffff;/g, 
  '.steps {\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      gap: 0;\n      margin-bottom: 4rem;\n      animation: fadeUp 0.8s 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;\n      background: rgba(255, 255, 255, 0.6);\n      backdrop-filter: blur(10px);');

// Change card-bg to be slightly translucent dark for a premium glassmorphism effect over the animated background
// Currently var(--card-bg) is #1e1f26. Let's redefine it to be translucent.
html = html.replace(/--card-bg: #1e1f26;/g, '--card-bg: rgba(30, 31, 38, 0.95);\n      backdrop-filter: blur(16px);');
// Wait, I can't put backdrop-filter in the variable, it's a CSS property.
// I will just add backdrop-filter to .card.
html = html.replace(/\.card \{\n\s*background: var\(--card-bg\);/g, 
  '.card {\n      background: var(--card-bg);\n      backdrop-filter: blur(20px);');

fs.writeFileSync('public/index.html', html);
console.log('done reverting to full light background with dark cards and animations');
