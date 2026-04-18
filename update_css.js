const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const newCss = `
    :root {
      --hero-bg: #f8f7f4;
      --dark-bg: #15161a;
      --card-bg: #1e1f26;
      --input-bg: #0d0e12;
      --border-dark: rgba(255, 255, 255, 0.06);
      
      --accent-blue: #4f46e5;
      --accent-blue-hover: #4338ca;
      
      --text-hero: #111827;
      --text-hero-muted: #6b7280;
      --text-card: #f9fafb;
      --text-muted: #9ca3af;
    }

    *,
    *::before,
    *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'DM Sans', sans-serif;
      background: var(--dark-bg);
      color: var(--text-card);
      min-height: 100vh;
      overflow-x: hidden;
      position: relative;
    }

    /* The structural split background */
    body::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 480px; /* Adjust as needed to split right below steps */
      background: var(--hero-bg);
      z-index: -2;
    }

    @media (max-width: 640px) {
      body::before {
        height: 520px;
      }
    }

    /* Animated Gradient Background - constrained so it looks nice but subtle */
    .bg-dots {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 480px;
      pointer-events: none;
      z-index: -1;
      overflow: hidden;
    }

    .bg-dots span {
      position: absolute;
      border-radius: 50%;
      filter: blur(90px);
      opacity: 0.6;
      animation: floatBg 20s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
    }

    .bg-dots span:nth-child(1) {
      width: 50vw; height: 50vw; background: rgba(79, 70, 229, 0.15); top: -20%; left: -10%;
    }
    .bg-dots span:nth-child(2) {
      width: 40vw; height: 40vw; background: rgba(79, 70, 229, 0.08); bottom: -10%; right: -10%; animation-delay: -5s; animation-direction: alternate-reverse;
    }
    .bg-dots span:nth-child(3) {
      width: 30vw; height: 30vw; background: rgba(255, 255, 255, 0.5); top: 20%; left: 40%; animation-delay: -10s;
    }

    @keyframes floatBg {
      0% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(8%, 12%) scale(1.1); }
      66% { transform: translate(-5%, 8%) scale(0.9); }
      100% { transform: translate(2%, -5%) scale(1.05); }
    }

    .container {
      position: relative;
      z-index: 1;
      max-width: 840px;
      margin: 0 auto;
      padding: 3rem 1.5rem 5rem;
    }

    /* HEADER */
    .header {
      text-align: center;
      margin-bottom: 2.5rem;
      animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #e5e7eb;
      border-radius: 999px;
      padding: 6px 16px;
      font-size: 11px;
      font-weight: 700;
      color: #374151;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-bottom: 1.5rem;
    }

    .badge-dot {
      width: 8px; height: 8px; background: #9ca3af; border-radius: 50%;
    }

    h1 {
      font-family: 'DM Sans', sans-serif;
      font-size: clamp(2.5rem, 6vw, 3.5rem);
      font-weight: 500;
      color: var(--text-hero);
      line-height: 1.1;
      margin-bottom: 1rem;
      letter-spacing: -0.02em;
    }

    h1 em {
      font-style: italic;
      color: var(--accent-blue);
    }

    .header-sub {
      font-size: 16px;
      color: var(--text-hero-muted);
      font-weight: 400;
      max-width: 500px;
      margin: 0 auto;
      line-height: 1.6;
    }

    /* STEPS */
    .steps {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      margin-bottom: 4rem;
      animation: fadeUp 0.8s 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
      background: #ffffff;
      padding: 6px 12px;
      border-radius: 999px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
      width: max-content;
      margin-left: auto;
      margin-right: auto;
      border: 1px solid #e5e7eb;
    }

    .step {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #9ca3af;
      padding: 8px 16px;
      border-radius: 999px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .step.active {
      color: var(--text-hero);
    }

    .step.done {
      color: #6b7280;
    }

    .step-num {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      background: #f3f4f6;
      color: #9ca3af;
      transition: all 0.3s;
    }

    .step.active .step-num {
      background: var(--accent-blue);
      color: #ffffff;
    }

    .step-divider {
      width: 24px;
      height: 1px;
      background: #e5e7eb;
      margin: 0 4px;
    }

    /* CARDS */
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border-dark);
      border-radius: 20px;
      overflow: hidden;
      margin-bottom: 1.5rem;
      box-shadow: 0 12px 32px rgba(0,0,0,0.2);
      animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
      transition: transform 0.4s;
    }

    .card:hover {
      transform: translateY(-2px);
    }

    .card-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-dark);
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .card-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: rgba(79, 70, 229, 0.15);
      color: var(--accent-blue);
    }

    .card-icon svg { width: 20px; height: 20px; }

    .card-title {
      font-family: 'DM Sans', sans-serif;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-card);
    }

    .card-subtitle {
      font-size: 13px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .card-body {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* FORM */
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .form-grid.cols-3 { grid-template-columns: 1fr 1fr 1fr; }
    @media (max-width: 640px) { .form-grid, .form-grid.cols-3 { grid-template-columns: 1fr; } .steps { flex-wrap: wrap; } }

    .field { display: flex; flex-direction: column; gap: 8px; }
    .field label {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-muted);
      display: flex;
      align-items: center;
    }

    .field input, .field select, .field textarea {
      background: var(--input-bg);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 10px;
      padding: 12px 14px;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      color: var(--text-card);
      outline: none;
      transition: all 0.2s;
    }

    .field input:focus, .field select:focus, .field textarea:focus {
      border-color: var(--accent-blue);
      box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
    }

    .field textarea { resize: vertical; min-height: 100px; line-height: 1.5; }
    .field select { cursor: pointer; }

    .optional { font-size: 11px; opacity: 0.6; margin-left: 6px; }

    /* RADIO */
    .radio-group { display: flex; gap: 8px; flex-wrap: wrap; }
    .radio-opt {
      display: flex; align-items: center; gap: 0; padding: 8px 16px; 
      border-radius: 999px; background: var(--input-bg); border: 1px solid transparent;
      cursor: pointer; font-size: 13px; font-weight: 500; color: var(--text-muted); transition: all 0.2s;
    }
    .radio-opt:hover { background: rgba(255,255,255,0.05); color: var(--text-card); }
    .radio-opt input[type="radio"] { display: none; }
    .radio-opt.selected { background: var(--accent-blue); color: #ffffff; }

    /* UPLOAD */
    .upload-area {
      position: relative; border: 2px dashed rgba(255,255,255,0.1); border-radius: 16px;
      background: var(--input-bg); padding: 3rem 2rem; text-align: center; cursor: pointer; transition: all 0.2s;
    }
    .upload-area:hover, .upload-area.drag { border-color: var(--accent-blue); background: rgba(79, 70, 229, 0.05); }
    .upload-area input[type="file"] { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; z-index: 10; }
    
    .upload-icon {
      width: 64px; height: 64px; margin: 0 auto 16px; background: var(--card-bg); border-radius: 16px;
      display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    .upload-icon svg { width: 28px; height: 28px; color: var(--accent-blue); }
    .upload-title { font-size: 1.1rem; font-weight: 500; margin-bottom: 6px; color: var(--text-card); }
    .upload-hint { font-size: 13px; color: var(--text-muted); }
    
    .preview-img-wrap { border-radius: 16px; overflow: hidden; border: 1px solid var(--border-dark); background: var(--input-bg); }
    .preview-img-wrap img { width: 100%; max-height: 400px; object-fit: contain; display: block; }
    .preview-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-top: 1px solid var(--border-dark); background: var(--card-bg); }
    .preview-name { font-size: 13px; color: var(--text-card); }
    .btn-remove { font-size: 12px; color: #ef4444; background: transparent; border: none; cursor: pointer; font-weight: 500; }
    .btn-remove:hover { color: #f87171; text-decoration: underline; }

    /* BUTTONS */
    .nav-row { display: flex; gap: 12px; margin-top: 16px; }
    .btn-back { flex: 1; padding: 14px; background: var(--card-bg); border: 1px solid var(--border-dark); border-radius: 12px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; color: var(--text-card); cursor: pointer; transition: all 0.2s; }
    .btn-back:hover { background: rgba(255,255,255,0.05); }
    
    .btn-next, .btn-analyze { flex: 2; padding: 14px; background: var(--accent-blue); color: #ffffff; border: none; border-radius: 12px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .btn-next:hover, .btn-analyze:hover:not(:disabled) { background: var(--accent-blue-hover); }
    .btn-analyze:disabled { opacity: 0.5; cursor: not-allowed; }
    
    .btn-new { width: 100%; padding: 14px; background: var(--card-bg); border: 1px solid var(--border-dark); border-radius: 12px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; color: var(--text-card); cursor: pointer; margin-top: 12px; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .btn-new:hover { background: rgba(255,255,255,0.05); }
    
    .spinner { width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #ffffff; border-radius: 50%; animation: spin 0.8s linear infinite; }

    /* ERROR */
    .error-box { display: none; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 12px; padding: 16px; margin-bottom: 1.5rem; font-size: 14px; color: #fca5a5; gap: 12px; align-items: flex-start; }
    .error-box.active { display: flex; }
    .error-icon { color: #ef4444; }

    /* RESULT */
    .section-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); margin-bottom: 1rem; }
    .emotions-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 2rem; }
    .emotion-chip { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 999px; font-size: 14px; font-weight: 500; background: rgba(79,70,229,0.1); border: 1px solid rgba(79,70,229,0.2); color: #a5b4fc; animation: popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .chip-dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
    
    .intensity-card { background: var(--card-bg); border: 1px solid var(--border-dark); border-radius: 16px; padding: 20px 24px; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 20px; }
    .intensity-title { font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); margin-bottom: 4px; }
    .intensity-value { font-size: 1.8rem; font-weight: 500; color: var(--text-card); line-height: 1; }
    .intensity-track { flex: 1; height: 8px; background: var(--input-bg); border-radius: 4px; overflow: hidden; }
    .intensity-fill { height: 100%; border-radius: 4px; transition: width 1s; width: 0; background: var(--accent-blue); }
    .intensity-fill.low { width: 30%; background: #60a5fa; }
    .intensity-fill.medio { width: 65%; background: #818cf8; }
    .intensity-fill.high { width: 95%; background: #4f46e5; }
    
    .analysis-card { background: var(--card-bg); border: 1px solid var(--border-dark); border-radius: 20px; overflow: hidden; margin-bottom: 1.5rem; }
    .analysis-card-top { padding: 16px 24px; border-bottom: 1px solid var(--border-dark); display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.02); }
    .analysis-card-title { font-size: 1.1rem; font-weight: 500; color: var(--text-card); }
    .analysis-body { padding: 24px; font-size: 14.5px; line-height: 1.7; color: #d1d5db; white-space: pre-wrap; }
    
    details { margin-bottom: 2rem; background: var(--input-bg); border-radius: 12px; border: 1px solid var(--border-dark); }
    details summary { font-size: 13px; font-weight: 500; color: var(--text-muted); cursor: pointer; padding: 12px 16px; list-style: none; display: flex; align-items: center; gap: 8px; }
    details summary::-webkit-details-marker { display: none; }
    .raw-content { padding: 0 16px 16px; font-size: 12px; font-family: monospace; color: #9ca3af; white-space: pre-wrap; overflow-x: auto; }

    .footer { text-align: center; margin-top: 3rem; font-size: 12px; color: #6b7280; }

    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeOutDown { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(20px); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes popIn { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
`;

html = html.replace(/<style>[\s\S]*?<\/style>/, '<style>\n' + newCss + '\n  </style>');

// Fix the radio dot HTML which might be missing in JS or logic?
// The user's image shows the active radio doesn't have a dot, it's just solid blue.
// The CSS removes the dot if we want, or I can just let it be. My CSS has removed the dot usage by just making `.radio-opt.selected { background: var(--accent-blue); color: #ffffff; }` and ignoring the dot display. Wait, I should hide the dot entirely in the new CSS.
// Let's hide `.radio-dot` completely since the new design is solid pills.
// Oh, the dot is in the HTML. I can hide it via CSS. 
// I'll add `.radio-dot { display: none; }` to the string.
html = html.replace(/\/\* RADIO \*\//, '/* RADIO */\n    .radio-dot { display: none; }');

// We also need to fix `badge-dot` in HTML to not be empty
// The image has no dot in the badge "PSICOLOGIA INFANTIL". It's just text.
// Wait, I didn't remove the dot in HTML, but I can hide it via CSS: `.badge-dot { display: none; }`

fs.writeFileSync('public/index.html', html);
console.log('done');
