// Contraste WCAG 2.x de las combinaciones de texto de la web. Ejecutar con: node pruebas/contraste.js
const lum = h => { const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4)); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
const mezcla = (a, b, t) => '#' + [1, 3, 5].map(i => Math.round(parseInt(a.slice(i, i + 2), 16) * t + parseInt(b.slice(i, i + 2), 16) * (1 - t)).toString(16).padStart(2, '0')).join('');
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + .05) / (y + .05); };

const L = { fondo: '#F6F0E3', sup: '#FFFDF7', texto: '#241A14', suave: '#5A4A3F', rojoT: '#8E1219', precio: '#8E1219', secT: '#134A2F', boton: '#8E1219', botonH: '#6E0B12', hoy: '#EFE2C0', cab: '#F6F0E3', verde: '#2B4436', oroT: '#8A6A22', pie: '#24130A', madera: '#3A2416' };
const D = { fondo: '#17100C', sup: '#221812', texto: '#F4EEDB', suave: '#CDBFA5', rojoT: '#F07C82', precio: '#E0C78C', secT: '#8FD3AB', boton: '#A3141D', botonH: '#C1161F', hoy: '#33241A', cab: '#3A2416', verde: '#2D4A3A', oroT: '#E0C78C', pie: '#130A05', madera: '#3A2416' };
const CREMA = '#F6F0E3', ORO_LETRA = '#E0C78C', CHAPA = '#241A14';
const ROJO = ['#C1161F', '#8E1219', '#6E0B12'];
const VELO = mezcla('#24130A', '#FFFFFF', .82); // peor caso: foto blanca bajo la capa oscura

function combos(T, nombre) {
  const c = [];
  const add = (fg, bg, etiqueta, min = 4.5) => c.push({ modo: nombre, fg, bg, etiqueta, min });
  for (const [b, bn] of [[T.fondo, 'fondo'], [T.sup, 'superficie'], [T.hoy, 'fila de hoy']]) {
    add(T.texto, b, `texto sobre ${bn}`); add(T.suave, b, `texto suave sobre ${bn}`); add(T.rojoT, b, `rojo/precio sobre ${bn}`);
  }
  add(T.secT, T.fondo, 'botón secundario sobre fondo'); add(T.secT, T.sup, 'botón secundario sobre superficie');
  add(T.fondo, T.secT, 'botón secundario (hover)');
  add(CREMA, T.boton, 'botón principal'); add(CREMA, T.botonH, 'botón principal (hover)');
  add(T.texto, T.cab, 'menú sobre cabecera');
  add('#6E0B12', CREMA, 'botón claro'); add('#6E0B12', ORO_LETRA, 'botón claro (hover)');
  for (const r of ROJO) { add(CREMA, r, `crema sobre rojo ${r}`); add(ORO_LETRA, r, `letra dorada sobre rojo ${r}`, 3); }
  add(ORO_LETRA, '#8E1219', 'letra dorada normal sobre rojo medio');
  add(CHAPA, '#ECE3C8', 'óvalo y estado'); add(CHAPA, '#FFFCF2', 'óvalo y estado (centro)');
  add(CREMA, T.verde, 'crema sobre verde'); add(ORO_LETRA, T.verde, 'letra dorada sobre verde');
  add(T.texto, T.sup, 'tarjeta sobre verde'); add(T.precio, T.sup, 'precio sobre superficie'); add(T.precio, T.fondo, 'precio sobre fondo'); add('#C9A85C', T.sup, 'filete (no texto)', 0);
  add('#E8DFC9', T.pie, 'pie'); add(ORO_LETRA, T.pie, 'enlaces del pie'); add('#D9CDB2', T.pie, 'línea legal del pie');
  add(CREMA, T.madera, 'barra móvil'); add(CREMA, '#8E1219', 'barra móvil, Llamar');
  add(CREMA, VELO, 'cierre: texto sobre capa'); add(ORO_LETRA, VELO, 'cierre: título dorado sobre capa', 3);
  add(CREMA, '#6E0B12', 'enlace «Saltar al contenido»');
  add(T.oroT, T.fondo, 'borde de oro sobre fondo (no es texto, mínimo 3)', 3); add(T.oroT, T.sup, 'borde de oro sobre superficie (mínimo 3)', 3);
  return c;
}
let fallos = 0;
for (const c of [...combos(L, 'claro'), ...combos(D, 'oscuro')]) {
  const r = ratio(c.fg, c.bg), ok = r >= c.min;
  if (!ok) fallos++;
  console.log(`${ok ? 'ok   ' : 'FALLA'} ${c.modo.padEnd(6)} ${r.toFixed(2).padStart(5)} (mín. ${c.min})  ${c.etiqueta}  [${c.fg} sobre ${c.bg}]`);
}
console.log(fallos ? `\n${fallos} combinaciones por debajo del mínimo` : '\nTodas las combinaciones cumplen AA');
process.exit(fallos ? 1 : 0);
