const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// Fix card-icon visibility
html = html.replace(/\.card-icon \{\n\s*width: 40px;\n\s*height: 40px;\n\s*border-radius: 12px;\n\s*display: flex;\n\s*align-items: center;\n\s*justify-content: center;\n\s*flex-shrink: 0;\n\s*background: rgba\(79, 70, 229, 0\.15\);\n\s*color: var\(--accent-blue\);\n\s*\}/, 
  `.card-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: rgba(96, 165, 250, 0.15);
      color: #60a5fa;
      animation: floatIcon 3s ease-in-out infinite;
    }`);

// Also fix the .upload-icon background and color
html = html.replace(/\.upload-icon \{\n\s*width: 64px; height: 64px; margin: 0 auto 16px; background: var\(--card-bg\); border-radius: 16px;\n\s*display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba\(0,0,0,0\.2\);\n\s*\}/, 
  `.upload-icon {
      width: 64px; height: 64px; margin: 0 auto 16px; background: rgba(96, 165, 250, 0.1); border-radius: 16px;
      display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      animation: floatIcon 4s ease-in-out infinite alternate;
    }`);
html = html.replace(/\.upload-icon svg \{ width: 28px; height: 28px; color: var\(--accent-blue\); \}/,
  `.upload-icon svg { width: 28px; height: 28px; color: #60a5fa; }`);

// Also fix .analysis-icon
html = html.replace(/\.analysis-icon \{\n\s*width: 40px;\n\s*height: 40px;\n\s*border-radius: 12px;\n\s*background: #334155;\n\s*box-shadow: 0 4px 12px rgba\(37, 99, 235, 0\.2\);\n\s*display: flex;\n\s*align-items: center;\n\s*justify-content: center;\n\s*\}/, 
  `.analysis-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: rgba(96, 165, 250, 0.15);
      box-shadow: 0 4px 12px rgba(96, 165, 250, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #60a5fa;
      animation: floatIcon 3.5s ease-in-out infinite alternate;
    }`);

// The color of the icon inside analysis-icon
html = html.replace(/\.analysis-icon svg \{\n\s*width: 20px;\n\s*height: 20px;\n\s*color: var\(--teal-deep\);\n\s*\}/, 
  `.analysis-icon svg {
      width: 20px;
      height: 20px;
      color: #60a5fa;
    }`);

// Also fix inline style in step 2
html = html.replace(/<div class="card-icon" style="background:#f0eaff; color:#8b5cf6;">/g, 
  '<div class="card-icon" style="background:rgba(167, 139, 250, 0.15); color:#a78bfa;">');


// Add floatIcon animation and gradient text animation
html = html.replace(/@keyframes fadeUp/g, 
  `@keyframes floatIcon { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
    @keyframes gradientText { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
    @keyframes fadeUp`);

// Animate h1 em
html = html.replace(/h1 em \{\n\s*font-style: italic;\n\s*color: var\(--accent-blue\);\n\s*\}/, 
  `h1 em {
      font-style: italic;
      color: transparent;
      background: linear-gradient(135deg, #4f46e5, #3b82f6, #93c5fd, #4f46e5);
      background-size: 300% 300%;
      -webkit-background-clip: text;
      background-clip: text;
      animation: gradientText 6s ease infinite;
    }`);

// More background dots!
html = html.replace(/<div class="bg-dots"><span><\/span><span><\/span><span><\/span><\/div>/, 
  '<div class="bg-dots"><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>');

// Add styles for the new dots
let dotStyles = `
    .bg-dots span:nth-child(4) { width: 35vw; height: 35vw; background: rgba(167, 139, 250, 0.25); top: 50%; left: 10%; animation-delay: -2s; animation-duration: 25s; }
    .bg-dots span:nth-child(5) { width: 45vw; height: 45vw; background: rgba(56, 189, 248, 0.2); bottom: 20%; right: 20%; animation-delay: -8s; animation-duration: 22s; animation-direction: alternate-reverse; }
    .bg-dots span:nth-child(6) { width: 25vw; height: 25vw; background: rgba(251, 146, 60, 0.1); top: 10%; right: 5%; animation-delay: -15s; animation-duration: 18s; }
    .bg-dots span:nth-child(7) { width: 55vw; height: 55vw; background: rgba(232, 121, 249, 0.15); bottom: -20%; left: 30%; animation-delay: -12s; animation-duration: 28s; }
`;

html = html.replace(/\.bg-dots span:nth-child\(3\) \{[\s\S]*?\}/, 
  `$&${dotStyles}`);

// Add glowing border to cards on hover
html = html.replace(/\.card:hover \{\n\s*transform: translateY\(-2px\);\n\s*\}/, 
  `.card:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(96, 165, 250, 0.3);
    }`);

// Pulse the active step
html = html.replace(/\.step\.active \.step-num \{\n\s*background: var\(--accent-blue\);\n\s*color: #ffffff;\n\s*\}/, 
  `.step.active .step-num {
      background: var(--accent-blue);
      color: #ffffff;
      box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4);
      animation: pulseActive 2s infinite;
    }
    @keyframes pulseActive {
      0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4); }
      70% { box-shadow: 0 0 0 6px rgba(79, 70, 229, 0); }
      100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
    }`);

// Make input fields glow blue slightly on hover and more on focus
html = html.replace(/\.field input:hover, \.field select:hover, \.field textarea:hover \{/, 
  `.field input:hover, .field select:hover, .field textarea:hover {
      border-color: rgba(96, 165, 250, 0.4);
      box-shadow: 0 0 12px rgba(96, 165, 250, 0.1);`);

fs.writeFileSync('public/index.html', html);
console.log('done adding animations and fixing icon contrast');
