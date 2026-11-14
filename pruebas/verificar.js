// Verificación automática de web/. Ejecutar con: node pruebas/verificar.js
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const WEB = path.join(__dirname, '..', 'web');
const KIT = path.join(__dirname, '..', 'kit-grupo-hostelero-friser');
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const todos = walk(WEB);
const textos = todos.filter(f => /\.(html|css|js|json|xml|txt|webmanifest|svg)$/.test(f) || f.endsWith('.htaccess') || /_(redirects|headers)$/.test(f));
const rel = f => path.relative(WEB, f).replace(/\\/g, '/');
const leer = f => fs.readFileSync(f, 'utf8');
// El archivo de verificación de Google Search Console (googleXXXX.html) no es una página de la web
const htmls = todos.filter(f => f.endsWith('.html') && !/[\\/]google[0-9a-f]+\.html$/.test(f));
// Páginas en español (la versión en inglés, en web/en/, tiene sus propias comprobaciones al final)
const htmlsEs = htmls.filter(f => !rel(f).startsWith('en/'));
let errores = 0;
const ok = (n, c, d = '') => { console.log(`${c ? 'OK   ' : 'FALLA'} ${n}${d ? ' · ' + d : ''}`); if (!c) errores++; };

// 1
const autor = [], creditos = [];
for (const f of textos) {
  const t = leer(f);
  if (/name=["'](author|generator)["']/i.test(t)) autor.push(rel(f));
  if (/dise[ñn]ad[oa] por|desarrollad[oa] por|hech[oa] por|creado por|realizado por|powered by/i.test(t)) creditos.push(rel(f));
}
if (fs.existsSync(path.join(WEB, 'humans.txt'))) creditos.push('humans.txt');
ok('1. Sin author/generator ni créditos', !autor.length && !creditos.length, [...autor, ...creditos].join(', '));
// 2
const biz = [];
// En inglés solo puede aparecer en «We don’t accept Bizum (a Spanish mobile payment app)»
for (const f of textos) { const t = leer(f); for (const m of t.matchAll(/Bizum(.{0,3})/gi)) if (rel(f).startsWith('en/') ? t.slice(m.index - 16, m.index + 36) !== 'We don’t accept Bizum (a Spanish mobile payment app)' : !/^ no/.test(m[1])) biz.push(rel(f)); }
ok('2. «Bizum» solo como «Bizum no» (en inglés, «We don’t accept Bizum (a Spanish mobile payment app)»)', !biz.length, biz.join(', '));
// 3
const prohibidas = /halloween|navidad|estufa|\btapas?\b|montadito|raciones/i, hall = [];
for (const f of todos) {
  if (prohibidas.test(rel(f))) hall.push(rel(f));
  if (textos.includes(f) && prohibidas.test(leer(f))) hall.push(rel(f));
}
ok('3. Sin Halloween/Navidad/estufa/tapas/montadito/raciones', !hall.length, hall.join(', '));
// 4
const marc = textos.filter(f => leer(f).includes('[['));
ok('4. Sin marcadores [[', !marc.length, marc.map(rel).join(', '));
// 5
const ESPERADO = [['Tostada de aceite y sal', '1,50'], ['Tostada de tomate y jamón', '3,50'], ['Tostada de tomate y aguacate', '4,00'], ['Tostada de mantequilla y mermelada', '1,60'], ['Tostada de tomate y atún', '3,00'], ['Tostada de tomate, jamón y queso', '3,50'], ['Bocadillo de entrecot', '9,50'], ['Bocadillo de sobrasada, jamón y cebolla', '6,00'], ['Chivito Bodeguita', '7,00'], ['Bocadillo de tortilla de patata', '5,50'], ['Bocadillo de bacon y queso', '6,50'], ['Croissant', '1,90'], ['Café solo', '1,40'], ['Café con leche', '1,90'], ['Cortado', '1,60'], ['Cappuccino', '2,20'], ['Té e infusiones', '2,20'], ['Tarta', '4,50']];
const cartaHtml = leer(path.join(WEB, 'carta/index.html'));
const filas = [...cartaHtml.matchAll(/<li class="plato[^"]*"[^>]*>([\s\S]*?)<\/li>/g)].map(m => [(m[1].match(/<h3 class="plato__nombre">([^<]*)<\/h3>/) || [])[1], (m[1].match(/<span class="plato__precio">([^<]*)<\/span>/) || [])[1]?.replace(/&nbsp;€/, '') || null]);
const conPrecio = filas.filter(f => f[1]);
const claveOrden = (a, b) => a[0].localeCompare(b[0]);
const esp = [...ESPERADO].sort(claveOrden), hal = [...conPrecio].sort(claveOrden);
const igualesHtml = conPrecio.length === 18 && esp.every((e, i) => hal[i][0] === e[0] && hal[i][1] === e[1]);
const ldCarta = [...cartaHtml.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1])).find(o => o['@type'] === 'Menu');
const itemsLD = ldCarta.hasMenuSection.flatMap(s => s.hasMenuItem);
const ldOrd = [...itemsLD].sort((a, b) => a.name.localeCompare(b.name));
const igualesLD = itemsLD.length === 18 && esp.every((e, i) => ldOrd[i].name === e[0] && ldOrd[i].offers.price === e[1].replace(',', '.') && ldOrd[i].offers.priceCurrency === 'EUR');
ok('5. Carta: 18 platos con precio, HTML y JSON-LD iguales a las tablas (sin importar el orden)', igualesHtml && igualesLD && ldCarta.hasMenuSection.length === 3, `html ${conPrecio.length}, json-ld ${itemsLD.length}, filas en total ${filas.length}`);
const ids = [...cartaHtml.matchAll(/<li class="plato[^"]*" id="([^"]+)"/g)].map(m => m[1]);
ok('5b. Ids estables de los 18 platos', ids.length === 18 && new Set(ids).size === 18, ids.join(' '));
// 6
const titulos = new Map(), descs = new Map();
const h1Mal = [], altMal = [], rotos = [], anclasMal = [];
const existe = u => {
  const p = u.split('#')[0].split('?')[0];
  if (/^\/(mesa|barra)\/?$/.test(p) || /^\/ir\//.test(p)) return true;
  const f = p.endsWith('/') ? p + 'index.html' : p;
  return fs.existsSync(path.join(WEB, f)) && fs.statSync(path.join(WEB, f)).isFile();
};
for (const f of htmls) {
  const t = leer(f), r = rel(f);
  const ti = (t.match(/<title>([^<]*)<\/title>/) || [])[1], de = (t.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  titulos.set(ti, [...(titulos.get(ti) || []), r]);
  descs.set(de, [...(descs.get(de) || []), r]);
  if ((t.match(/<h1[ >]/g) || []).length !== 1) h1Mal.push(r);
  for (const m of t.matchAll(/<img\b[^>]*>/g)) if (!/\balt="/.test(m[0])) altMal.push(r);
  for (const m of t.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
    const h = m[1].replace(/&amp;/g, '&');
    if (h.startsWith('/') && !existe(h)) rotos.push(`${r} -> ${h}`);
    if (h.startsWith('#') && h.length > 1 && !new RegExp(`id="${h.slice(1)}"`).test(t)) anclasMal.push(`${r} -> ${h}`);
  }
  for (const m of t.matchAll(/(?:src|href|srcset)="(\/[^"]+)"/g)) for (const u of m[1].split(',').map(s => s.trim().split(' ')[0])) if (u.startsWith('/') && !existe(u)) rotos.push(`${r} -> ${u}`);
}
const dup = a => [...a.entries()].filter(([k, v]) => v.length > 1 || !k);
ok('6a. Títulos y descripciones únicos', !dup(titulos).length && !dup(descs).length, `${htmls.length} páginas`);
ok('6b. Un solo h1 por página', !h1Mal.length, h1Mal.join(', '));
ok('6c. Todas las <img> con alt', !altMal.length, altMal.join(', '));
ok('6d. Sin enlaces ni recursos internos rotos', !rotos.length && !anclasMal.length, [...new Set([...rotos, ...anclasMal])].join('; '));
// 7
const need = ['robots.txt', 'sitemap.xml', 'site.webmanifest', '404.html', '.htaccess', '_redirects', '_headers'];
const ht = leer(path.join(WEB, '.htaccess'));
const reglas = ht.split('\n').filter(l => l.startsWith('RewriteRule ^'));
const destinos = reglas.map(l => l.split(' ')[2]);
const reglasOk = ['^mesa/?$', '^barra/?$', '^ir/pub-colonial/?$', '^ir/taberna-asturiana/?$', '^ir/excalibur/?$'].every(p => reglas.some(l => l.includes(p + ' ')));
ok('7. Ficheros base y reglas /mesa, /barra, /ir/… sin %XX en destinos', need.every(n => fs.existsSync(path.join(WEB, n))) && reglasOk && !destinos.some(d => /%[0-9A-Fa-f]{2}/.test(d.replace('%{REQUEST_URI}', ''))), reglas.length + ' reglas');
ok('7b. /mesa, /barra e /ir no existen como carpetas ni en el sitemap', !['mesa', 'barra', 'ir'].some(d => fs.existsSync(path.join(WEB, d))) && !/\/(mesa|barra|ir\/)|404/.test(leer(path.join(WEB, 'sitemap.xml'))));
// 8
const externos = [];
const propio = /^https:\/\/labodeguitadelaesquina\.com/;
for (const f of htmls) {
  const t = leer(f), r = rel(f);
  for (const m of t.matchAll(/<(link|script|img|source|iframe|video|audio|embed|object)\b[^>]*>/g)) {
    for (const a of m[0].matchAll(/\b(src|srcset|imagesrcset|data)="([^"]+)"/g)) if (/https?:\/\//.test(a[2]) && !propio.test(a[2])) externos.push(`${r}: ${a[0]}`);
    if (m[1] === 'link' && /rel="(stylesheet|preload|prefetch|preconnect|dns-prefetch|icon|apple-touch-icon|manifest|modulepreload)"/.test(m[0])) {
      const h = (m[0].match(/\bhref="([^"]+)"/) || [])[1];
      if (h && /^(https?:)?\/\//.test(h) && !propio.test(h)) externos.push(`${r}: ${m[0]}`);
    }
    if (m[1] === 'iframe') externos.push(`${r}: iframe en el HTML`);
  }
  if (/<style|\sstyle="/i.test(t) || /<script(?![^>]*(src=|application\/ld\+json))/i.test(t)) externos.push(`${r}: estilo o script en línea`);
}
for (const f of todos.filter(f => /\.(css|js)$/.test(f))) {
  const t = leer(f), r = rel(f);
  if (/@import|url\(\s*["']?https?:|\bfetch\(|XMLHttpRequest|sendBeacon|https?:\/\/(?!labodeguitadelaesquina)/.test(t)) externos.push(`${r}: referencia externa o de red`);
}
ok('8. Sin peticiones a terceros antes del consentimiento (ni estilos/scripts en línea)', !externos.length, externos.join('; '));
// 10
const tiposVistos = new Set(), ldMal = [];
for (const f of htmls) for (const m of leer(f).matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
  try { const o = JSON.parse(m[1]); [].concat(o['@type']).forEach(x => tiposVistos.add(x)); } catch (e) { ldMal.push(rel(f)); }
}
const ldNeg = htmls.every(f => /"@id": "https:\/\/labodeguitadelaesquina\.com\/#negocio"/.test(leer(f)));
ok('10. JSON-LD válido con los tipos indicados', !ldMal.length && ldNeg && ['CafeOrCoffeeShop', 'BarOrPub', 'Menu', 'FAQPage', 'BreadcrumbList'].every(t => tiposVistos.has(t)), [...tiposVistos].join(', '));
const faq = leer(path.join(WEB, 'preguntas-frecuentes/index.html'));
ok('10b. FAQ: 11 preguntas en HTML y JSON-LD; sin aggregateRating ni review', (faq.match(/<details>/g) || []).length === 11 && (faq.match(/"@type": "Question"/g) || []).length === 11 && !htmls.some(f => /aggregateRating|"review"/.test(leer(f))));
// 12
const gz = f => zlib.gzipSync(fs.readFileSync(f), { level: 9 }).length;
const raw = f => fs.statSync(f).size;
const cargaCarta = ['carta/index.html', 'assets/css/base.css', 'assets/css/carta.css', 'assets/js/main.js', 'assets/js/cookies.js', 'assets/js/carta.js', 'assets/iconos/iconos.svg', 'assets/marca/bodeguita-logo-horizontal-fondo-claro.svg', 'assets/fonts/cinzel-latin-600-800.woff2', 'assets/fonts/source-sans-3-latin-400-700.woff2', 'assets/marca/favicon.svg', 'favicon.ico'];
const kb = n => (n / 1024).toFixed(1) + ' KB';
let sumaRaw = 0, sumaGz = 0;
for (const f of cargaCarta) { const p = path.join(WEB, f); sumaRaw += raw(p); sumaGz += /\.(html|css|js|svg)$/.test(f) ? gz(p) : raw(p); }
const perezosos = ['assets/marca/bodeguita-logo-vertical-fondo-oscuro.svg', 'assets/marca/ghf-logo-color-fondo-oscuro.svg'].reduce((s, f) => s + gz(path.join(WEB, f)), 0);
ok('12a. /carta/ pesa menos de 200 KB en la primera carga', sumaGz + perezosos < 200 * 1024, `comprimido ${kb(sumaGz)} (más ${kb(perezosos)} de logos del pie con carga diferida); sin comprimir ${kb(sumaRaw)}`);
const fuentesCarta = (cartaHtml.match(/rel="preload"[^>]*\.woff2/g) || []).length;
ok('12b. /carta/ solo precarga Cinzel y Source Sans 3', fuentesCarta === 2 && !/libre-baskerville/.test(cartaHtml));
// 13
const kitNec = ['bloque-grupo.html', 'bloque-grupo.css', 'locales.json', 'htaccess-grupo.txt', 'LEEME.md', 'iconos/icono-la-bodeguita.svg', 'iconos/icono-pub-colonial.svg', 'iconos/icono-taberna-asturiana.svg', 'iconos/icono-excalibur.svg', 'logos/ghf-logo-color-fondo-oscuro.svg', 'logos/ghf-logo-color-fondo-claro.svg', 'logos/ghf-logo-oro.svg', 'logos/ghf-logo-blanco.svg', 'logos/ghf-logo-negro.svg', 'logos/ghf-monograma-color-fondo-oscuro.svg', 'logos/ghf-monograma-color-fondo-claro.svg'];
const loc = JSON.parse(leer(path.join(KIT, 'locales.json'))).locales;
ok('13. Kit del grupo completo', kitNec.every(f => fs.existsSync(path.join(KIT, f))) && loc.length === 4 && loc.every(l => l.slug && l.nombre && l.direccion && l.icono && l.dominio && l.place_id && l.destino_ir) && (() => {
  // Una regla /ir/<slug> por local y una /ir/en/<slug> por cada local con web en inglés, con los destinos de locales.json
  const reglasKit = leer(path.join(KIT, 'htaccess-grupo.txt')).replace(/\r/g, '').match(/^RewriteRule .*$/gm) || [];
  const conEn = loc.filter(l => l.destino_ir_en);
  return reglasKit.length === loc.length + conEn.length
    && loc.every(l => reglasKit.some(r => r.startsWith(`RewriteRule ^ir/${l.slug}/?$ ${l.destino_ir} `)))
    && conEn.every(l => reglasKit.some(r => r.startsWith(`RewriteRule ^ir/en/${l.slug}/?$ ${l.destino_ir_en} `)));
})());
// Las reglas /ir/ de esta web son las del kit (salvo la de La Bodeguita, que no se usa aquí) y las páginas inglesas enlazan a /ir/en/ cuando existe
const reglasIr = ht.replace(/\r/g, '').match(/^RewriteRule \^ir\/.*$/gm) || [];
const reglasKitIr = (leer(path.join(KIT, 'htaccess-grupo.txt')).replace(/\r/g, '').match(/^RewriteRule \^ir\/.*$/gm) || []).filter(r => !/la-bodeguita/.test(r));
ok('13b. Reglas /ir/ iguales que las del kit; en inglés, los locales con web inglesa enlazan a /ir/en/<slug> y el resto a /ir/<slug>', reglasIr.join('\n') === reglasKitIr.join('\n')
  && loc.filter(l => l.slug !== 'la-bodeguita').every(l => { const en = leer(path.join(WEB, 'en/index.html')), es = leer(path.join(WEB, 'index.html'));
    return es.includes(`href="/ir/${l.slug}"`) && en.includes(`href="/ir/${l.destino_ir_en ? 'en/' : ''}${l.slug}"`); }));
// robots y .htaccess
ok('14. robots.txt exacto y sin bloqueo de indexación', leer(path.join(WEB, 'robots.txt')) === 'User-agent: *\nAllow: /\n\nSitemap: https://labodeguitadelaesquina.com/sitemap.xml\n' && !/x-robots-tag|noindex/i.test(ht) && !textos.some(f => rel(f) !== '404.html' && /<meta name="robots" content="[^"]*noindex/i.test(leer(f))));
ok('15. .htaccess: caché inmutable con ?v=, caché corta del HTML y compresión', /max-age=31536000, immutable" env=CACHE_INMUTABLE/.test(ht) && /max-age=600, must-revalidate/.test(ht) && ['text/html', 'text/css', 'application/javascript', 'image/svg+xml', 'application/xml', 'text/xml'].every(t => ht.split('\n').some(l => l.includes('DEFLATE') && l.split(/\s+/).includes(t))) && /Content-Security-Policy/.test(ht));
// encabezados
const malTit = [];
for (const f of htmls) {
  const t = leer(f).replace(/<script[\s\S]*?<\/script>/g, ''), r = rel(f);
  const hs = [...t.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/g)].map(m => [Number(m[1]), m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()]);
  let prev = 0; const vistos = new Set();
  for (const [n, tx] of hs) {
    if (prev && n > prev + 1) malTit.push(`${r}: salto h${prev} a h${n} («${tx}»)`);
    if (!prev && n !== 1) malTit.push(`${r}: empieza en h${n}`);
    const k = n + '|' + tx.toLowerCase(); if (vistos.has(k)) malTit.push(`${r}: h${n} repetido «${tx}»`); vistos.add(k); prev = n;
  }
  if (/<footer[\s\S]*<h[1-6]/.test(t)) malTit.push(`${r}: encabezado dentro del pie`);
}
ok('16. Jerarquía de encabezados sin saltos ni repetidos; el pie sin encabezados', !malTit.length, malTit.join('; '));
// tono de tú
const textoVisible = f => leer(f).replace(/<script[\s\S]*?<\/script>/g, '').replace(/<(?:summary|h[1-6])\b[^>]*>[\s\S]*?<\/(?:summary|h[1-6])>/g, '').replace(/<[^>]+>/g, ' ');
const vos = [];
for (const f of htmls) { const m = textoVisible(f).match(/\b(venís|tenéis|ponéis|llamadnos|escribidnos|vuestr[oa]s?|podéis|queréis|sabéis|estáis|vais|vayáis)\b/gi); if (m) vos.push(rel(f) + ': ' + [...new Set(m)].join(',')); }
const ldFaqTxt = [...faq.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1])).find(o => o['@type'] === 'FAQPage');
const respuestasLD = ldFaqTxt.mainEntity.map(q => q.acceptedAnswer.text);
const vosLD = respuestasLD.filter(t => /\b(venís|tenéis|ponéis|llamadnos|escribidnos|podéis)\b/i.test(t));
ok('17. Todo el texto habla de tú (solo las preguntas del cliente conservan «tenéis»/«ponéis»)', !vos.length && !vosLD.length, [...vos, ...vosLD].join('; '));
const detalles = [...faq.matchAll(/<details><summary>([\s\S]*?)<\/summary><div class="faq__resp"><p>([\s\S]*?)<\/p><\/div><\/details>/g)].map(m => [m[1].replace(/<[^>]+>/g, '').trim(), m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()]);
ok('18. FAQPage del JSON-LD idéntico al texto visible, palabra por palabra', detalles.length === 11 && detalles.every(([q, a], i) => ldFaqTxt.mainEntity[i].name === q && ldFaqTxt.mainEntity[i].acceptedAnswer.text === a));
// negocio frente al texto visible
const neg = JSON.parse(leer(path.join(WEB, 'index.html')).match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const spec = neg.openingHoursSpecification, dias = spec.flatMap(x => [].concat(x.dayOfWeek));
const inicioHtml = leer(path.join(WEB, 'index.html')), llegarHtml = leer(path.join(WEB, 'como-llegar/index.html'));
const cierraDe = d => spec.find(x => [].concat(x.dayOfWeek).includes(d));
const coh = [];
if (new Set(dias).size !== 7) coh.push('no son siete días');
if (cierraDe('Friday').closes !== '02:00' || cierraDe('Saturday').closes !== '02:00' || cierraDe('Friday').opens !== '08:00') coh.push('viernes/sábado');
if (cierraDe('Sunday').opens !== '12:00' || cierraDe('Sunday').closes !== '00:00') coh.push('domingo');
if (cierraDe('Monday').opens !== '08:00' || cierraDe('Thursday').closes !== '00:00') coh.push('lunes-jueves');
for (const h of [inicioHtml, llegarHtml]) if (!/8:00 – 24:00/.test(h) || !/8:00 – 2:00/.test(h) || !/12:00 – 24:00/.test(h)) coh.push('tabla de horario');
for (const f of htmls.filter(f => !/404/.test(f))) { const t = leer(f); if (!t.includes('C/ Benicarló, 25') || !t.includes('682 26 25 87') || !t.includes('tel:+34682262587') || !/46020/.test(t)) coh.push('NAP en ' + rel(f)); }
if (neg.telephone.replace(/\D/g, '') !== '34682262587' || neg.address.postalCode !== '46020' || !/Benicarló, 25/.test(neg.address.streetAddress) || neg.hasMenu !== 'https://labodeguitadelaesquina.com/carta/') coh.push('datos del negocio');
for (const [nom, prec] of [['Tostada de tomate y jamón', '3,50'], ['Chivito Bodeguita', '7,00'], ['Bocadillo de entrecot', '9,50'], ['Café con leche', '1,90']]) { if (!new RegExp(nom + '</h3>[^]*?' + prec.replace(',', ',') + '&nbsp;€').test(inicioHtml) || itemsLD.find(i => i.name === nom).offers.price !== prec.replace(',', '.')) coh.push('precio en Inicio: ' + nom); }
ok('19. JSON-LD del negocio coincide con el texto visible (dirección, teléfono, horario, precios) y lleva hasMenu', !coh.length, coh.join('; '));
ok('20. Inicio sin «Dentro y fuera» y con la tarjeta de horario corta y cierta', !/Dentro y fuera/.test(inicioHtml) && /Abierto todos los días<\/h3><p>De lunes a jueves, de 8:00 a 24:00\. El fin de semana, consulta el horario\.<\/p>/.test(inicioHtml));
ok('21. Carta con la estructura de fotos: dos listas por categoría como máximo y fotos con tamaño, srcset y alt', [...cartaHtml.matchAll(/<img class="?[^>]*plato__foto/g)].length === 0 && !/plato--con-foto/.test(cartaHtml) || [...cartaHtml.matchAll(/<picture class="plato__foto">[\s\S]*?<\/picture>/g)].every(m => /width="1000" height="750"/.test(m[0]) && /600w, [^"]*1000w/.test(m[0]) && /\salt="[^"]+"/.test(m[0])));
const og = fs.statSync(path.join(WEB, 'assets/marca/og-image.jpg')).size;
const dimJpg = archivo => { const b = fs.readFileSync(path.join(WEB, archivo)); let i = 2; while (i < b.length) { if (b[i] !== 0xFF) { i++; continue; } const m = b[i + 1]; if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)]; i += 2 + b.readUInt16BE(i + 2); } };
const ogDim = dimJpg('assets/marca/og-image.jpg');
const metaOg = htmls.every(f => { const t = leer(f); const g = n => (t.match(new RegExp('<meta (?:property|name)="' + n + '" content="([^"]*)"')) || [])[1]; return g('og:image') === 'https://labodeguitadelaesquina.com/assets/marca/' + (rel(f).startsWith('en/') ? 'og-image-en.jpg' : 'og-image.jpg') && g('twitter:image') === g('og:image') && g('og:image:width') === '1200' && g('og:image:height') === '630' && g('twitter:card') === 'summary_large_image'; });
ok('22. Imagen para redes: 1200 x 630, entre 80 y 250 KB y metaetiquetas coherentes en todas las páginas (en /en/, la inglesa)', ogDim[0] === 1200 && ogDim[1] === 630 && og >= 80 * 1024 && og <= 250 * 1024 && metaOg, `${ogDim.join('x')}, ${(og / 1024).toFixed(1)} KB`);
const inicioT = leer(path.join(WEB, 'index.html'));
ok('23. Carrusel de «Lo que encontrarás» accesible (región con etiqueta y tabindex) y títulos de la carta enfocables', /<div class="tarjetas" tabindex="0" role="region" aria-label="Lo que encontrarás">/.test(inicioT) && (cartaHtml.match(/<h2 class="marco__titulo" id="h-[a-z-]+" tabindex="-1">/g) || []).length === 3);
ok('24. La carpeta herramientas/ no está dentro de web/ y el script no escribe en web/', !fs.existsSync(path.join(WEB, 'herramientas')) && /no puede estar dentro de web/.test(fs.readFileSync(path.join(__dirname, '..', 'herramientas/procesar-fotos-platos.js'), 'utf8')));
const legales = ['aviso-legal', 'privacidad', 'cookies'].map(n => leer(path.join(WEB, n, 'index.html')));
const h2Legales = legales.flatMap(h => [...h.matchAll(/<h2>([\s\S]*?)<\/h2>/g)].map(m => m[1]));
ok('25. Títulos legales numerados: cada número va en <span class="num"> y el texto del título no cambia', h2Legales.length >= 15 && h2Legales.every(t => /^<span class="num">\d+\.<\/span> /.test(t)) && h2Legales.every(t => /^\d+\. \S/.test(t.replace(/<[^>]+>/g, ''))), h2Legales.length + ' títulos');
const cssBase = leer(path.join(WEB, 'assets/css/base.css'));
ok('26. Menú: orden Inicio, Carta, Cómo llegar, Preguntas, Configurar cookies y después Llamar y WhatsApp; la página actual con aria-current', htmlsEs.every(f => { const t = leer(f); const n = t.indexOf('<nav class="nav"'); const menu = t.slice(n, t.indexOf('</nav>', n)); const orden = [...menu.matchAll(/<li[^>]*><a href="([^"]+)"[^>]*>([^<]*)<\/a><\/li>/g)].map(m => m[2]); const okOrden = orden.join('|') === 'Inicio|Carta|Cómo llegar|Preguntas frecuentes|Configurar cookies' && menu.indexOf('class="nav__movil"') > menu.indexOf('nav__cookies') && /<li class="nav__inicio"><a href="\/"/.test(menu); const actuales = (menu.match(/aria-current="page"/g) || []).length; const esperado = { 'index.html': 'Inicio', 'carta/index.html': 'Carta', 'como-llegar/index.html': 'Cómo llegar', 'preguntas-frecuentes/index.html': 'Preguntas frecuentes' }[rel(f)]; const okActual = esperado ? new RegExp('aria-current="page">' + esperado + '<').test(menu) && actuales === 1 : actuales === 0; return okOrden && okActual; }) && /rgba\(0, 0, 0, \.55\)/.test(cssBase) && /menu-abierto/.test(cssBase));
// coherencia
ok('Extra. Teléfono y dirección presentes en todas las páginas', htmls.every(f => /682 26 25 87/.test(leer(f)) && /Benicarló, 25/.test(leer(f))));
const verV = [...new Set(htmls.flatMap(f => [...leer(f).matchAll(/\?v=([\w.]+)/g)].map(m => m[1])))];
ok('Extra. Un solo ?v= en todos los CSS y JS', verV.length === 1, verV.join(','));

// ---------- Versión en inglés (web/en/) ----------
const PARES = { '': 'en', 'carta': 'en/menu', 'como-llegar': 'en/getting-here', 'preguntas-frecuentes': 'en/faq', 'aviso-legal': 'en/legal-notice', 'privacidad': 'en/privacy', 'cookies': 'en/cookies' };
const pag = d => path.join(WEB, d, 'index.html');
const url = d => 'https://labodeguitadelaesquina.com/' + (d ? d + '/' : '');
const visible = t => t.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<(?:[^>"]|"[^"]*")*?\s(?:alt|aria-label)="([^"]*)"[^>]*>/g, ' $1 ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
let comprobado = '';
try { comprobado = require('child_process').execFileSync(process.execPath, [path.join(__dirname, '..', 'herramientas', 'generar-ingles.js'), '--comprobar'], { encoding: 'utf8', stdio: 'pipe' }); } catch (e) { comprobado = ''; }
ok('EN1. web/en/ está al día con las páginas en español y con herramientas/traduccion-en.json', /al día/.test(comprobado));
ok('EN2. Cada página en inglés existe, con lang="en", canonical propio y hreflang es/en/x-default recíprocos', Object.entries(PARES).every(([es, en]) => {
  if (!fs.existsSync(pag(en))) return false;
  const tEs = leer(pag(es)), tEn = leer(pag(en));
  const alt = `<link rel="alternate" hreflang="es" href="${url(es)}">\n<link rel="alternate" hreflang="en" href="${url(en)}">\n<link rel="alternate" hreflang="x-default" href="${url(es)}">`;
  return /<html lang="en">/.test(tEn) && tEn.includes(`<link rel="canonical" href="${url(en)}">`) && tEs.includes(alt) && tEn.includes(alt) && /<meta property="og:locale" content="en_GB">/.test(tEn);
}));
// Cada página lleva una sola vez cada pieza del cambio de idioma, enlazando a la página equivalente
const marcasIdioma = (t, actual, otra) => {
  const otro = actual === 'es' ? 'en' : 'es';
  const piezas = [
    `<a class="idioma" href="${otra}" hreflang="${otro}" lang="${otro}">`,
    '<div class="idiomas" role="group"',
    `<a href="${otra}" hreflang="${otro}" lang="${otro}" aria-label="${otro === 'en' ? 'View this page in English' : 'Ver esta página en español'}">${otro.toUpperCase()}</a>`,
    `<span class="idiomas__actual" aria-current="true" lang="${actual}"><span aria-hidden="true">${actual.toUpperCase()}</span>`,
    '<p class="nav__idiomas" role="group"',
    `<li class="pie__idioma"><a href="${otra}" hreflang="${otro}" lang="${otro}">`
  ];
  const fila = (t.match(/<p class="nav__idiomas"[^>]*>.*?<\/p>/) || [''])[0];
  return piezas.every(s => t.split(s).length === 2) && (t.match(/aria-current="true"/g) || []).length === 2
    && fila.includes(`<a href="${otra}" hreflang="${otro}" lang="${otro}">${otro === 'en' ? 'English' : 'Español'}</a>`)
    && fila.includes(`<span class="idiomas__actual" aria-current="true" lang="${actual}">${actual === 'en' ? 'English' : 'Español'}</span>`);
};
ok('EN3. Las 14 páginas y la 404: botón de idioma de móvil, conmutador «ES · EN» de escritorio, fila del menú y enlace del pie, a la página equivalente y con el idioma actual marcado', Object.entries(PARES).every(([es, en]) => {
  const rEs = '/' + (es ? es + '/' : ''), rEn = '/' + en + '/';
  return marcasIdioma(leer(pag(es)), 'es', rEn) && marcasIdioma(leer(pag(en)), 'en', rEs);
}) && marcasIdioma(leer(path.join(WEB, '404.html')), 'es', '/en/'));
ok('EN4. Menú en inglés: Home, Menu, Getting here, Questions, Cookie settings, con la página actual marcada', Object.entries(PARES).every(([es, en]) => {
  const t = leer(pag(en)); const n = t.indexOf('<nav class="nav"'); const menu = t.slice(n, t.indexOf('</nav>', n));
  const orden = [...menu.matchAll(/<li[^>]*><a href="([^"]+)"[^>]*>([^<]*)<\/a><\/li>/g)];
  const actual = { 'en': 'Home', 'en/menu': 'Menu', 'en/getting-here': 'Getting here', 'en/faq': 'Questions' }[en];
  return orden.map(m => m[2]).join('|') === 'Home|Menu|Getting here|Questions|Cookie settings' && orden.map(m => m[1]).join('|') === '/en/|/en/menu/|/en/getting-here/|/en/faq/|/en/cookies/'
    && (actual ? (menu.match(/aria-current="page"/g) || []).length === 1 && menu.includes(`aria-current="page">${actual}<`) : !/aria-current="page"/.test(menu));
}));
// Nombres propios y direcciones que se quedan en español
const PROPIOS = /La Bodeguita de la Esquina|La Bodeguita|Grupo Hostelero Friser|Restaurante Taberna Asturiana|Mantenimiento Industrial Friser, S\.L\.|C\/ Benicarló, 25, bajos 5 y 6|bajos 5 y 6|C\/ Poeta Altet, 22, bajo|Registro Mercantil de Valencia|Calle Benicarló|C\/ Doctor Vicent Zaragoza|consentimiento-cookies|Agencia Española de Protección de Datos|Ver esta página en español|Español|Café con leche|Bocadillos|Chivito Bodeguita|Benicarló|València|Café/g;
const restos = [];
for (const en of Object.values(PARES)) {
  const texto = visible(leer(pag(en))).replace(PROPIOS, ' ');
  const m = texto.match(/\b(de|del|la|las|los|el|y|con|para|que|tu|tus|una|por|desde|carta|horario|abierto|llamar|cómo|más|aquí|sí|también)\b|[ñ¿¡áéíóú]/gi);
  if (m) restos.push(en + ': ' + [...new Set(m)].join(' '));
}
ok('EN5. Sin restos de español en el texto visible ni en alt/aria-label de las páginas en inglés', !restos.length, restos.join(' · '));
const rotosEn = [];
for (const en of Object.values(PARES)) for (const m of leer(pag(en)).matchAll(/\shref="(\/[^"#?]*)/g)) {
  const r = m[1]; if (r.startsWith('/ir/')) continue;
  const f = path.join(WEB, r.endsWith('/') ? r + 'index.html' : r);
  if (!fs.existsSync(f)) rotosEn.push(en + ' → ' + r);
  else if (r.endsWith('/') && !r.startsWith('/en/') && !new RegExp(`href="${r}" hreflang="es"`).test(leer(pag(en)))) rotosEn.push(en + ' → ' + r + ' (página en español sin hreflang)');
}
ok('EN6. Enlaces internos de las páginas en inglés: existen y llevan a páginas en inglés (salvo el cambio de idioma)', !rotosEn.length, rotosEn.join(" · "));
const precios = t => [...t.matchAll(/(\d+),(\d\d)(?:&nbsp;| )€|€(\d+)\.(\d\d)/g)].map(m => (m[1] || m[3]) + '.' + (m[2] || m[4])).join(' ');
ok('EN7. Mismos precios, en el mismo orden, en las 7 parejas de páginas', Object.keys(PARES).every(es => { const a = precios(leer(pag(es))), b = precios(leer(pag(PARES[es]))); return a === b && (!['', 'carta', 'preguntas-frecuentes'].includes(es) || a); }));
// Horas: el teléfono no cuenta (no lleva «:»)
const conHora24 = Object.values(PARES).filter(en => /\b\d{1,2}:\d\d\b/.test(visible(leer(pag(en)))));
ok('EN9. Horas en formato inglés en /en/: ninguna «24:00» ni «8:00» en el texto visible (el JSON-LD no cuenta)', !conHora24.length
  && /8 am – midnight/.test(leer(pag('en/getting-here'))) && /12 noon – midnight/.test(leer(pag('en')))
  && /8 am to midnight\. Friday and Saturday, 8 am to 2 am\. Sunday, 12 noon to midnight\./.test(leer(pag('en/faq'))), conHora24.join(', '));
ok('EN10. Aviso «View this page in English» en las 7 páginas en español (bajo las migas o, en Inicio, bajo la cabecera) con idioma.js en el <head>; ninguno en inglés', Object.entries(PARES).every(([es, en]) => {
  const t = leer(pag(es)), rEn = '/' + en + '/';
  const aviso = t.indexOf('<div class="aviso-idioma'), ancla = t.indexOf(es ? '<nav class="migas' : '<main id="contenido"');
  return ancla > 0 && aviso > ancla && !t.slice(ancla, aviso).slice(0, -1).includes('\n')
    && t.includes(`<a href="${rEn}" hreflang="en">View this ${es === 'carta' ? 'menu' : 'page'} in English`) && t.includes('data-aviso-idioma-cerrar')
    && /<script src="\/assets\/js\/idioma\.js\?v=[^"]+"><\/script>\n<link rel="stylesheet"/.test(t) && t.indexOf('idioma.js') < t.indexOf('</head>')
    && !/aviso-idioma|idioma\.js/.test(leer(pag(en)));
}));
const mapaWeb = leer(path.join(WEB, 'sitemap.xml'));
ok('EN8. El sitemap incluye las 14 páginas con sus alternativas de idioma', Object.entries(PARES).every(([es, en]) => mapaWeb.includes(`<loc>${url(es)}</loc>`) && mapaWeb.includes(`<loc>${url(en)}</loc>`)) && (mapaWeb.match(/<url>/g) || []).length === 14 && (mapaWeb.match(/hreflang="en"/g) || []).length === 14);
// ---------- Cookies, seguridad e imagen para redes ----------
const conAvisoCookies = textos.filter(f => /cookies-banner|cookies-fab|data-cookies-aceptar|data-cookies-rechazar/.test(leer(f))).map(rel);
ok('C1. Sin banner de cookies ni botón flotante en ninguna página, CSS ni JS', !conAvisoCookies.length, conAvisoCookies.join(', '));
ok('C2. «Configurar cookies» en el pie y en el menú del móvil de las 14 páginas y la 404, con su panel', htmls.every(f => {
  const t = leer(f);
  return /<li><button class="pie__btn" type="button" data-cookies-abrir>/.test(t) && /<li class="nav__cookies"><a href="[^"]+" data-cookies-abrir>/.test(t) && t.split('<div class="cookies-panel" hidden>').length === 2;
}));
const jsCookies = leer(path.join(WEB, 'assets/js/cookies.js'));
ok('C3. El mapa solo se crea con permiso: cookies.js crea el iframe únicamente en cargarMapas() y solo lo llama si el permiso está guardado o al pulsar «Cargar mapa»',
  (jsCookies.match(/createElement\('iframe'\)/g) || []).length === 1 && /function aplicar\(\) \{ if \(mapaActivo\(\)\) cargarMapas\(\); else quitarMapas\(\); \}/.test(jsCookies)
  && (jsCookies.match(/cargarMapas\(\)/g) || []).length === 2 && ['', 'como-llegar', 'en', 'en/getting-here'].every(d => /data-mapa-src="https:\/\/www\.google\.com\/maps\?/.test(leer(pag(d))) && /data-mapa-cargar hidden/.test(leer(pag(d)))));
const CSP_META = (leer(pag('')).match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/) || [])[1] || '';
const cspHt = (ht.match(/Header always set Content-Security-Policy "([^"]+)"/) || [])[1] || '';
ok('S1. CSP en <meta> igual en las 15 páginas (y la misma del .htaccess), solo lo propio más el mapa de Google, con política de referer', !!CSP_META
  && htmls.every(f => leer(f).includes(`<meta http-equiv="Content-Security-Policy" content="${CSP_META}">\n<meta name="referrer" content="strict-origin-when-cross-origin">`))
  && cspHt === CSP_META + "; frame-ancestors 'self'" && /default-src 'self'/.test(CSP_META) && /script-src 'self';/.test(CSP_META) && /frame-src https:\/\/www\.google\.com https:\/\/maps\.google\.com;/.test(CSP_META)
  && !/unsafe-|\*/.test(CSP_META) && /Header always set (X-Content-Type-Options "nosniff"|Permissions-Policy "[^"]*camera=\(\)[^"]*")[\s\S]*Header always set (X-Content-Type-Options|Permissions-Policy)/.test(ht));
const ogEs = '/assets/marca/og-image.jpg', ogEn = '/assets/marca/og-image-en.jpg';
ok('S2. Imagen para redes en inglés (og-image-en.jpg, 1200 x 630, menos de 250 KB) en og:image y twitter:image de las 7 páginas de /en/; ninguna usa la española', fs.existsSync(path.join(WEB, ogEn)) && dimJpg(ogEn.slice(1)).join('x') === '1200x630' && fs.statSync(path.join(WEB, ogEn)).size < 250 * 1024
  && Object.entries(PARES).every(([es, en]) => { const tEn = leer(pag(en)), tEs = leer(pag(es));
    return !tEn.includes(ogEs) && tEn.includes(`<meta property="og:image" content="https://labodeguitadelaesquina.com${ogEn}">`) && tEn.includes(`<meta name="twitter:image" content="https://labodeguitadelaesquina.com${ogEn}">`) && /<meta property="og:image:alt" content="[^"]*">/.test(tEn)
      && !tEs.includes(ogEn); }));
// ---------- Cloudflare Pages: _redirects y _headers (equivalen al .htaccess) ----------
const redir = leer(path.join(WEB, '_redirects')).replace(/\r/g, '');
const lineasRedir = redir.split('\n').filter(l => l.trim() && !l.startsWith('#')).map(l => l.trim().split(/\s+/));
const reglasHt = [...ht.replace(/\r/g, '').matchAll(/^RewriteRule \^([a-z0-9\/-]+?)\/\?\$ (\S+) \[R=302/gm)].map(m => ['/' + m[1], m[2].replace('https://labodeguitadelaesquina.com/', '/')]);
const malasR = reglasHt.filter(([o, d]) => ![o, o + '/'].every(src => lineasRedir.some(([a, b, c]) => a === src && b === d && c === '302'))).map(r => r[0]);
ok('R1. _redirects tiene cada redirección del .htaccess (/mesa, /barra, /ir/…) con y sin barra final, mismo destino y 302, y nada más', reglasHt.length >= 8 && !malasR.length
  && lineasRedir.length === reglasHt.length * 2 && lineasRedir.every(l => l.length === 3 && l[2] === '302' && !/%20/.test(l[1])), `${reglasHt.length} reglas · ${lineasRedir.length} líneas` + (malasR.length ? ' · faltan: ' + malasR.join(', ') : ''));
const cab = leer(path.join(WEB, '_headers')).replace(/\r/g, '');
const valorHt = n => (ht.match(new RegExp(`Header always set ${n} "([^"]+)"`)) || [])[1];
const bloque = p => (cab.split(/\n(?=\S)/).find(b => b.split('\n')[0] === p) || '');
ok('R2. _headers: en /* la misma CSP, nosniff, X-Frame-Options, Referrer-Policy y Permissions-Policy que el .htaccess, HSTS y caché corta del HTML; un año a CSS, JS y fuentes; noindex en *.pages.dev',
  ['Content-Security-Policy', 'X-Content-Type-Options', 'X-Frame-Options', 'Referrer-Policy', 'Permissions-Policy'].every(n => valorHt(n) && bloque('/*').includes(`  ${n}: ${valorHt(n)}`))
  && bloque('/*').includes('  Strict-Transport-Security: max-age=31536000') && bloque('/*').includes('  Cache-Control: public, max-age=600, must-revalidate')
  && ['/assets/css/*', '/assets/js/*', '/assets/fonts/*'].every(p => bloque(p).includes('  ! Cache-Control') && bloque(p).includes('  Cache-Control: public, max-age=31536000, immutable'))
  && /https:\/\/:project\.pages\.dev\/\*\n  X-Robots-Tag: noindex/.test(cab)
  && !fs.existsSync(path.join(__dirname, '..', '.github', 'scripts', 'preparar-pages.js')) === !fs.existsSync(path.join(__dirname, '..', '.github', 'workflows', 'pages.yml')));
console.log(errores ? `\n${errores} comprobaciones con fallos` : '\nTodas las comprobaciones automáticas correctas');
process.exit(errores ? 1 : 0);
