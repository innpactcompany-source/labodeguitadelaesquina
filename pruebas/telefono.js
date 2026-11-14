// Comprueba el teléfono de La Bodeguita: node pruebas/telefono.js
// 1) Ningún archivo del repositorio (ni de web/) contiene el número antiguo en ningún formato.
// 2) El nuevo (603 18 95 49) está en el botón Llamar de la cabecera, la barra fija del móvil, el pie y el JSON-LD de
//    las 15 páginas (español, inglés y 404), y el enlace de WhatsApp usa wa.me/34603189549.
const fs = require('fs'), path = require('path'), { execSync } = require('child_process');
const RAIZ = path.join(__dirname, '..'), WEB = path.join(RAIZ, 'web');
const ANTIGUOS = ['682262587']; // teléfonos que ya no se usan
let errores = 0;
const ok = (n, c, d = '') => { console.log(`${c ? 'OK   ' : 'FALLA'} ${n}${d ? ' · ' + d : ''}`); if (!c) errores++; };

// Cualquier formato: cifras separadas por espacios, puntos, guiones, barras o paréntesis, con o sin +34/0034/34
const patron = n => new RegExp(n.split('').join('[\\s.\\-/()]*'));
const archivos = execSync('git ls-files --cached --others --exclude-standard', { cwd: RAIZ, encoding: 'utf8' }).split('\n')
  .filter(f => f && !/\.(jpe?g|png|webp|woff2?|ico|gif)$/i.test(f) && !f.startsWith('pruebas/telefono.js'));
const conAntiguo = [];
for (const f of archivos) { let t; try { t = fs.readFileSync(path.join(RAIZ, f), 'utf8'); } catch { continue; } if (ANTIGUOS.some(n => patron(n).test(t))) conAntiguo.push(f); }
ok(`T1. Ningún archivo del repositorio contiene el teléfono antiguo en ningún formato (${archivos.length} archivos revisados)`, !conAntiguo.length, conAntiguo.join(', '));

const paginas = [];
const recorre = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) recorre(p); else if (e.name.endsWith('.html') && !/^google/.test(e.name)) paginas.push(p); } };
recorre(WEB);
const TEL = 'href="tel:+34603189549"';
const malas = [];
for (const p of paginas) {
  const t = fs.readFileSync(p, 'utf8'), rel = path.relative(WEB, p).replace(/\\/g, '/');
  const cabecera = (t.match(/<header[\s\S]*?<\/header>/) || [''])[0];
  const barra = (t.match(/<nav class="barra-movil[\s\S]*?<\/nav>/) || t.match(/<div class="barra-movil[\s\S]*?<\/div>/) || [''])[0];
  const pie = (t.match(/<footer[\s\S]*?<\/footer>/) || [''])[0];
  const fallos = [];
  if (!cabecera.includes(TEL)) fallos.push('cabecera');
  if (!barra.includes(TEL)) fallos.push('barra móvil');
  if (!pie.includes(TEL) || !pie.includes('>603 18 95 49<')) fallos.push('pie');
  if (!t.includes('"telephone": "+34 603 18 95 49"')) fallos.push('JSON-LD');
  if (!/https:\/\/wa\.me\/34603189549\?text=/.test(t)) fallos.push('WhatsApp');
  if (/tel:(?!\+34603189549")/.test(t)) fallos.push('otro tel:');
  if (fallos.length) malas.push(rel + ' (' + fallos.join(', ') + ')');
}
ok(`T2. 603 18 95 49 en el botón Llamar de la cabecera, la barra móvil, el pie, el JSON-LD y WhatsApp de las ${paginas.length} páginas`, paginas.length >= 15 && !malas.length, malas.join(' | '));
console.log(errores ? `\n${errores} comprobaciones con fallos` : '\nTeléfono correcto en todas partes');
process.exit(errores ? 1 : 0);
