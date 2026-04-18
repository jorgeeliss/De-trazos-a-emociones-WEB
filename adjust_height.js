const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

html = html.replace(/height: 480px; \/\* Adjust as needed to split right below steps \*\//g, 'height: 410px;');
html = html.replace(/height: 520px;/g, 'height: 440px;'); // for mobile

fs.writeFileSync('public/index.html', html);
console.log('done adjusting split height');
