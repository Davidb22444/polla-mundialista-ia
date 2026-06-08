const fs = require('fs');

const file = 'c:/polla-mundialista-ia/frontend/src/decoraciones.css';
let content = fs.readFileSync(file, 'utf8');

// 1. Apply base colors
content = content.replace(/--col-amarillo: #FCD116;/g, '--col-amarillo: #dca311; /* Tono amarillo más legible (dorado) */');
content = content.replace(/--col-rojo:     #CE1126;/g, '--col-rojo:     #b91c28; /* Tono rojo más legible */');
content = content.replace(/--col-azul:     #003893;/g, '--col-azul:     #0c3b88; /* Tono azul más legible */');

// 2. Apply dark overlays back from var(--col-azul-panel) to rgba(0,0,0,0.22)
content = content.replace(/background: var\(--col-azul-panel\) !important;\n  border-color: rgba\(252, 209, 22, 0\.2\) !important;/g, "background: rgba(0, 0, 0, 0.22) !important;\n  border-color: rgba(255, 255, 255, 0.15) !important;");

// 3. Apply text colors for nth-child(3n+1)
const oldTextColors = `/* Textos oscuros en tarjetas amarillas (para contraste) */
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
}`;

const newTextColors = `/* Textos oscuros en tarjetas amarillas (para contraste) */
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

content = content.replace(oldTextColors, newTextColors);

// Nombres de equipo
content = content.replace(/\[data-theme="colombia"\] \.partido-card \.match-stage p,\n\[data-theme="colombia"\] \.partido-card \.match-stage span {\n  color: #0a1628 !important;\n}/g, `[data-theme="colombia"] .partido-card .match-stage p,
[data-theme="colombia"] .partido-card .match-stage span {
  color: #ffffff !important;
}`);

fs.writeFileSync(file, content);
console.log("Done");
