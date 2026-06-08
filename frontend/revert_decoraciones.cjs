const fs = require('fs');

const file = 'c:/polla-mundialista-ia/frontend/src/decoraciones.css';
let content = fs.readFileSync(file, 'utf8');

// 1. Revert base colors
content = content.replace(/--col-amarillo: #dca311; \/\* Tono amarillo más legible \(dorado\) \*\//g, '--col-amarillo: #FCD116;');
content = content.replace(/--col-rojo:     #b91c28; \/\* Tono rojo más legible \*\//g, '--col-rojo:     #CE1126;');
content = content.replace(/--col-azul:     #0c3b88; \/\* Tono azul más legible \*\//g, '--col-azul:     #003893;');

// 2. Revert dark overlays back to var(--col-azul-panel) and borders
content = content.replace(/background: rgba\(0, 0, 0, 0\.22\) !important;\n  border-color: rgba\(255, 255, 255, 0\.15\) !important;/g, "background: var(--col-azul-panel) !important;\n  border-color: rgba(252, 209, 22, 0.2) !important;");

content = content.replace(/background: rgba\(0, 0, 0, 0\.25\) !important;\n  border-color: rgba\(255, 255, 255, 0\.15\) !important;/g, "background: var(--col-azul-panel) !important;\n  border-color: rgba(252, 209, 22, 0.2) !important;");

// 3. Revert text color additions inside nth-child(3n+1)
// Wait, I added:
// [data-theme="colombia"] .partido-card:nth-child(3n+1) > div > div,
// [data-theme="colombia"] .partido-card:nth-child(3n+1) span[style*="color: rgba(255,255,255"] {
//   color: #ffffff !important; /* Ahora el amarillo es oscuro, usamos texto blanco */
// }
// Instead of complex regex, I can just remove the specific block I added:
const addedTextColors = `/* Textos oscuros en tarjetas amarillas (para contraste) */
[data-theme="colombia"] .partido-card:nth-child(3n+1) > div > div,
[data-theme="colombia"] .partido-card:nth-child(3n+1) span[style*="color: rgba(255,255,255"] {
  color: #ffffff !important; /* Ahora el amarillo es oscuro, usamos texto blanco */
}

[data-theme="colombia"] .partido-card:nth-child(3n+1) > div > div:first-child span,
[data-theme="colombia"] .partido-card:nth-child(3n+1) > div > div:first-child div,
[data-theme="colombia"] .partido-card:nth-child(3n+1) > div > div:first-child svg {
  color: #ffffff !important;
}

[data-theme="colombia"] .partido-card:nth-child(3n+1) > div > div:first-child span:first-child {
  background: rgba(0, 0, 0, 0.25) !important;
  border-color: rgba(255, 255, 255, 0.18) !important;
  color: #ffffff !important;
}

[data-theme="colombia"] .partido-card:nth-child(3n+1) > div > div:first-child span:first-child span {
  background: #ffffff !important;
}

[data-theme="colombia"] .partido-card:nth-child(3n+1) > div > div:first-child > span:last-child {
  background: rgba(0, 0, 0, 0.2) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  color: #ffffff !important;
}`;

content = content.replace(addedTextColors, `/* Textos oscuros en tarjetas amarillas (para contraste) */
[data-theme="colombia"] .partido-card:nth-child(3n+1) > div > div,
[data-theme="colombia"] .partido-card:nth-child(3n+1) span[style*="color: rgba(18,48,68"] {
  color: #0a1628 !important;
}

[data-theme="colombia"] .partido-card:nth-child(3n+1) > div > div:first-child span,
[data-theme="colombia"] .partido-card:nth-child(3n+1) > div > div:first-child div,
[data-theme="colombia"] .partido-card:nth-child(3n+1) > div > div:first-child svg {
  color: #0a1628 !important;
}

[data-theme="colombia"] .partido-card:nth-child(3n+1) > div > div:first-child span:first-child {
  background: rgba(0, 0, 0, 0.08) !important;
  border-color: rgba(0, 0, 0, 0.15) !important;
}

[data-theme="colombia"] .partido-card:nth-child(3n+1) > div > div:first-child span:first-child span {
  background: #0a1628 !important;
}

[data-theme="colombia"] .partido-card:nth-child(3n+1) > div > div:first-child > span:last-child {
  background: rgba(0, 0, 0, 0.05) !important;
  border-color: rgba(0, 0, 0, 0.1) !important;
  color: #0a1628 !important;
}`);

// Nombres de equipo dentro del match-stage
content = content.replace(/\[data-theme="colombia"\] \.partido-card \.match-stage p,\n\[data-theme="colombia"\] \.partido-card \.match-stage span {\n  color: #ffffff !important;\n}/g, `[data-theme="colombia"] .partido-card .match-stage p,
[data-theme="colombia"] .partido-card .match-stage span {
  color: #0a1628 !important;
}`);

fs.writeFileSync(file, content);
console.log("Done");
