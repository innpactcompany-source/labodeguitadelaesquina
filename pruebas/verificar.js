// Verificación automática de web/. Ejecutar con: node pruebas/verificar.js
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const WEB = path.join(__dirname, '..', 'web');
const KIT = path.join(__dirname, '..', 'kit-grupo-hostelero-friser');
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const todos = walk(WEB);
const textos = todos.filter(f => /\.(html|css|js|json|xml|txt|webmanifest|svg)$/.test(f) || f.endsWith('.htaccess'));
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
for (const f of textos) for (const m of leer(f).matchAll(/Bizum(.{0,3})/gi)) if (!/^ no/.test(m[1])) biz.push(rel(f));
ok('2. «Bizum» solo como «Bizum no»', !biz.length, biz.join(', '));
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
const need = ['robots.txt', 'sitemap.xml', 'site.webmanifest', '404.html', '.htaccess'];
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
ok('13. Kit del grupo completo', kitNec.every(f => fs.existsSync(path.join(KIT, f))) && loc.length === 4 && loc.every(l => l.slug && l.nombre && l.direccion && l.icono && l.dominio && l.place_id && l.destino_ir) && (leer(path.join(KIT, 'htaccess-grupo.txt')).match(/^RewriteRule/gm) || []).length === 4);
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
const ogDim = (() => { const b = fs.readFileSync(path.join(WEB, 'assets/marca/og-image.jpg')); let i = 2; while (i < b.length) { if (b[i] !== 0xFF) { i++; continue; } const m = b[i + 1]; if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)]; i += 2 + b.readUInt16BE(i + 2); } })();
const metaOg = htmls.every(f => { const t = leer(f); const g = n => (t.match(new RegExp('<meta (?:property|name)="' + n + '" content="([^"]*)"')) || [])[1]; return g('og:image') === 'https://labodeguitadelaesquina.com/assets/marca/og-image.jpg' && g('twitter:image') === g('og:image') && g('og:image:width') === '1200' && g('og:image:height') === '630' && g('twitter:card') === 'summary_large_image'; });
ok('22. Imagen para redes: 1200 x 630, entre 80 y 250 KB y metaetiquetas coherentes en todas las páginas', ogDim[0] === 1200 && ogDim[1] === 630 && og >= 80 * 1024 && og <= 250 * 1024 && metaOg, `${ogDim.join('x')}, ${(og / 1024).toFixed(1)} KB`);
const inicioT = leer(path.join(WEB, 'index.html'));
ok('23. Carrusel de «Lo que encontrarás» accesible (región con etiqueta y tabindex) y títulos de la carta enfocables', /<div class="tarjetas" tabindex="0" role="region" aria-label="Lo que encontrarás">/.test(inicioT) && (cartaHtml.match(/<h2 class="marco__titulo" id="h-[a-z-]+" tabindex="-1">/g) || []).length === 3);
ok('24. La carpeta herramientas/ no está dentro de web/ y el script no escribe en web/', !fs.existsSync(path.join(WEB, 'herramientas')) && /no puede estar dentro de web/.test(fs.readFileSync(path.join(__dirname, '..', 'herramientas/procesar-fotos-platos.js'), 'utf8')));
const legales = ['aviso-legal', 'privacidad', 'cookies'].map(n => leer(path.join(WEB, n, 'index.html')));
const h2Legales = legales.flatMap(h => [...h.matchAll(/<h2>([\s\S]*?)<\/h2>/g)].map(m => m[1]));
ok('25. Títulos legales numerados: cada número va en <span class="num"> y el texto del título no cambia', h2Legales.length >= 15 && h2Legales.every(t => /^<span class="num">\d+\.<\/span> /.test(t)) && h2Legales.every(t => /^\d+\. \S/.test(t.replace(/<[^>]+>/g, ''))), h2Legales.length + ' títulos');
const cssBase = leer(path.join(WEB, 'assets/css/base.css'));
ok('26. Menú: orden Inicio, Carta, Cómo llegar, Preguntas, Configurar cookies y después Llamar y WhatsApp; la página actual con aria-current; botón flotante solo desde 1280 px', htmlsEs.every(f => { const t = leer(f); const n = t.indexOf('<nav class="nav"'); const menu = t.slice(n, t.indexOf('</nav>', n)); const orden = [...menu.matchAll(/<li[^>]*><a href="([^"]+)"[^>]*>([^<]*)<\/a><\/li>/g)].map(m => m[2]); const okOrden = orden.join('|') === 'Inicio|Carta|Cómo llegar|Preguntas frecuentes|Configurar cookies' && menu.indexOf('class="nav__movil"') > menu.indexOf('nav__cookies') && /<li class="nav__inicio"><a href="\/"/.test(menu); const actuales = (menu.match(/aria-current="page"/g) || []).length; const esperado = { 'index.html': 'Inicio', 'carta/index.html': 'Carta', 'como-llegar/index.html': 'Cómo llegar', 'preguntas-frecuentes/index.html': 'Preguntas frecuentes' }[rel(f)]; const okActual = esperado ? new RegExp('aria-current="page">' + esperado + '<').test(menu) && actuales === 1 : actuales === 0; return okOrden && okActual; }) && /@media \(max-width: 1279px\) \{ \.cookies-fab \{ display: none; \} \}/.test(cssBase) && /rgba\(0, 0, 0, \.55\)/.test(cssBase) && /menu-abierto/.test(cssBase));
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
ok('EN3. Botón de idioma en la cabecera y enlace en el pie, cada uno a la misma página en el otro idioma', Object.entries(PARES).every(([es, en]) => {
  const tEs = leer(pag(es)), tEn = leer(pag(en)), rEs = '/' + (es ? es + '/' : ''), rEn = '/' + en + '/';
  return tEs.includes(`<a class="idioma" href="${rEn}" hreflang="en" lang="en">`) && tEs.includes(`<li class="pie__idioma"><a href="${rEn}" hreflang="en" lang="en">English</a></li>`)
    && tEn.includes(`<a class="idioma" href="${rEs}" hreflang="es" lang="es">`) && tEn.includes(`<li class="pie__idioma"><a href="${rEs}" hreflang="es" lang="es">Español</a></li>`);
}) && /<a class="idioma" href="\/en\/"/.test(leer(path.join(WEB, '404.html'))));
ok('EN4. Menú en inglés: Home, Menu, Getting here, FAQ, Cookie settings, con la página actual marcada', Object.entries(PARES).every(([es, en]) => {
  const t = leer(pag(en)); const n = t.indexOf('<nav class="nav"'); const menu = t.slice(n, t.indexOf('</nav>', n));
  const orden = [...menu.matchAll(/<li[^>]*><a href="([^"]+)"[^>]*>([^<]*)<\/a><\/li>/g)];
  const actual = { 'en': 'Home', 'en/menu': 'Menu', 'en/getting-here': 'Getting here', 'en/faq': 'FAQ' }[en];
  return orden.map(m => m[2]).join('|') === 'Home|Menu|Getting here|FAQ|Cookie settings' && orden.map(m => m[1]).join('|') === '/en/|/en/menu/|/en/getting-here/|/en/faq/|/en/cookies/'
    && (actual ? (menu.match(/aria-current="page"/g) || []).length === 1 && menu.includes(`aria-current="page">${actual}<`) : !/aria-current="page"/.test(menu));
}));
// Nombres propios y direcciones que se quedan en español
const PROPIOS = /La Bodeguita de la Esquina|La Bodeguita|Grupo Hostelero Friser|Restaurante Taberna Asturiana|Mantenimiento Industrial Friser, S\.L\.|C\/ Benicarló, 25, bajos 5 y 6|bajos 5 y 6|C\/ Poeta Altet, 22, bajo|Registro Mercantil de Valencia|Calle Benicarló|C\/ Doctor Vicent Zaragoza|consentimiento-cookies|Agencia Española de Protección de Datos|Español|Chivito Bodeguita|Benicarló|València|Café/g;
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
ok('EN7. Mismos precios, en el mismo orden, en la carta y la portada en inglés', ['', 'carta'].every(es => { const a = precios(leer(pag(es))), b = precios(leer(pag(PARES[es]))); return a && a === b; }));
const mapaWeb = leer(path.join(WEB, 'sitemap.xml'));
ok('EN8. El sitemap incluye las 14 páginas con sus alternativas de idioma', Object.entries(PARES).every(([es, en]) => mapaWeb.includes(`<loc>${url(es)}</loc>`) && mapaWeb.includes(`<loc>${url(en)}</loc>`)) && (mapaWeb.match(/<url>/g) || []).length === 14 && (mapaWeb.match(/hreflang="en"/g) || []).length === 14);
console.log(errores ? `\n${errores} comprobaciones con fallos` : '\nTodas las comprobaciones automáticas correctas');
process.exit(errores ? 1 : 0);
