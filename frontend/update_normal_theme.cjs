const fs = require('fs');

const file = 'c:/polla-mundialista-ia/frontend/src/components/PartidoCard.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add groupThemes mapping right after `const colors = { ... }`
if (!content.includes('const groupThemes = {')) {
  content = content.replace(/const colors = {[\s\S]*?}\n/, match => {
    return match + `\nconst groupThemes = {
  'Grupo A': { color: '#c41914', shadow: 'rgba(196,25,20,0.34)' },
  'Grupo B': { color: '#0761b5', shadow: 'rgba(7,97,181,0.34)' },
  'Grupo C': { color: '#0a7535', shadow: 'rgba(10,117,53,0.34)' },
  'Grupo D': { color: '#cc4b1f', shadow: 'rgba(204,75,31,0.34)' },
  'Grupo E': { color: '#6d36a3', shadow: 'rgba(109,54,163,0.34)' },
  'Grupo F': { color: '#b3154f', shadow: 'rgba(179,21,79,0.34)' },
  'Grupo G': { color: '#078c7f', shadow: 'rgba(7,140,127,0.34)' },
  'Grupo H': { color: '#cc8408', shadow: 'rgba(204,132,8,0.34)' },
  'Grupo I': { color: '#354899', shadow: 'rgba(53,72,153,0.34)' },
  'Grupo J': { color: '#007a6f', shadow: 'rgba(0,122,111,0.34)' },
  'Grupo K': { color: '#c93916', shadow: 'rgba(201,57,22,0.34)' },
  'Grupo L': { color: '#543930', shadow: 'rgba(84,57,48,0.34)' },
}\n`;
  });
}

// 2. Define groupTheme inside PartidoCard
if (!content.includes('const groupTheme = groupThemes')) {
  content = content.replace(/let pointsEarned = 0\n  if \(hasResult && userBet\) {\n    pointsEarned = calculateMatchPoints\(userBet\.local, userBet\.visitor, match\.resLocal, match\.resVisitor\)\n  }\n/, match => {
    return match + `\n  const groupTheme = groupThemes[match.grupo] || { color: '#1e293b', shadow: 'rgba(30,41,59,0.34)' }\n`;
  });
}

// 3. Change inputStyle background to rgba(0,0,0,0.25) and text to white
content = content.replace(/background: '#fff',\n    border: '1\.5px solid rgba\(45,120,163,0\.18\)',/g, "background: 'rgba(0, 0, 0, 0.25)',\n    border: '1.5px solid rgba(255, 255, 255, 0.2)',");
content = content.replace(/color: colors\.ink,\n    boxShadow: '0 10px 24px rgba\(18,48,68,0\.06\)',/g, "color: '#ffffff',\n    boxShadow: '0 10px 24px rgba(0,0,0,0.1)',");

// 4. Update the card main wrapper
content = content.replace(/background: '#ffffff',\n        border: '1px solid rgba\(45,120,163,0\.08\)',\n        borderBottom: 0,\n        boxShadow: '0 16px 40px rgba\(18,48,68,0\.08\)',/g, "background: groupTheme.color,\n        border: '1px solid rgba(255,255,255,0.15)',\n        borderBottom: 0,\n        boxShadow: `0 16px 40px ${groupTheme.shadow}`,");

// 5. Update match-stage
content = content.replace(/background: 'rgba\(255,255,255,0\.96\)',\n            border: '1px solid rgba\(45,120,163,0\.08\)',\n            boxShadow: 'inset 0 0 0 1px rgba\(255,255,255,0\.24\)',/g, "background: 'rgba(0, 0, 0, 0.22)',\n            border: '1px solid rgba(255, 255, 255, 0.15)',\n            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)',");

// 6. Update TeamBlock text
content = content.replace(/color: colors\.ink, fontSize: '0\.98rem'/g, "color: '#ffffff', fontSize: '0.98rem'");
content = content.replace(/background: '#fff',\n          border: '1px solid rgba\(45,120,163,0\.12\)',/g, "background: 'transparent',\n          border: '1px solid rgba(255,255,255,0.12)',");

// 7. Update BetForm text & panels
content = content.replace(/color: 'rgba\(18,48,68,0\.62\)'/g, "color: 'rgba(255,255,255,0.86)'");
content = content.replace(/color: colors\.coral/g, "color: '#ffffff'");
content = content.replace(/borderTop: '1px solid rgba\(45,120,163,0\.12\)'/g, "borderTop: '1px solid rgba(255,255,255,0.22)'");
content = content.replace(/background: 'rgba\(245,249,252,0\.96\)', border: '1px solid rgba\(45,120,163,0\.08\)'/g, "background: 'rgba(0,0,0,0.22)', border: '1px solid rgba(255,255,255,0.15)'");
content = content.replace(/color: colors\.ink, fontSize: '0\.78rem'/g, "color: 'rgba(255,255,255,0.86)', fontSize: '0.78rem'");
content = content.replace(/color: 'rgba\(18,48,68,0\.48\)'/g, "color: 'rgba(255,255,255,0.7)'");
content = content.replace(/color: 'var\(--color-primario, #0066f5\)'/g, "color: '#ffffff'");

// 8. Update inputs inside BetForm
content = content.replace(/background: '#fff', border: '1\.5px solid rgba\(45,120,163,0\.18\)'/g, "background: 'rgba(0,0,0,0.25)', border: '1.5px solid rgba(255,255,255,0.2)'");
content = content.replace(/color: colors\.ink,[\s]+fontFamily/g, "color: '#ffffff',\n              fontFamily");

// 9. Update Match Stats Panel
content = content.replace(/background: '#f8fafc',\n            borderTop: '1px solid rgba\(18,48,68,0\.08\)',/g, "background: 'rgba(0, 0, 0, 0.22)',\n            borderTop: '1px solid rgba(255, 255, 255, 0.15)',");
content = content.replace(/color: 'rgba\(18,48,68,0\.6\)'/g, "color: 'rgba(255, 255, 255, 0.7)'");

// 10. Update Partido Chat Shell
content = content.replace(/background: '#f8fafc',\n        borderTop: \(matchStats && \(matchStats\.local \+ matchStats\.draw \+ matchStats\.visitor\) > 0\) \? 'none' : '1px solid rgba\(18,48,68,0\.08\)',/g, "background: 'rgba(0, 0, 0, 0.22)',\n        borderTop: (matchStats && (matchStats.local + matchStats.draw + matchStats.visitor) > 0) ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',");

// 11. Update HoverInfo button
content = content.replace(/border: '1px solid rgba\(45,120,163,0\.16\)', background: '#fff',\n          color: 'var\(--color-primario, #0066f5\)'/g, "border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(255,255,255,0.15)',\n          color: '#ffffff'");

// 12. Update CardHeader text
content = content.replace(/color: 'rgba\(18,48,68,0\.55\)'/g, "color: 'rgba(255,255,255,0.7)'");
content = content.replace(/background: 'rgba\(45,120,163,0\.1\)', border: '1px solid rgba\(45,120,163,0\.14\)'/g, "background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255,255,255,0.26)'");
content = content.replace(/color: 'rgba\(18,48,68,0\.68\)'/g, "color: '#ffffff'");

fs.writeFileSync(file, content);
console.log("Done");
