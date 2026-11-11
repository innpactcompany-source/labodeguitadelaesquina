#!/usr/bin/env node
/*
 * Genera la versión en inglés de la web (web/en/) a partir de las páginas en español.
 *
 *   node herramientas/generar-ingles.js            genera web/en/ y deja las páginas en español enlazadas con ella
 *   node herramientas/generar-ingles.js --comprobar  solo comprueba que web/en/ está al día (no escribe nada)
 *
 * Las páginas en español son la referencia: si cambias un texto en español, añade su traducción en
 * herramientas/traduccion-en.json y vuelve a ejecutar este script. Si falta alguna traducción, el script
 * se detiene y dice cuál.
 */
const fs = require('fs'), path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const WEB = path.join(RAIZ, 'web');
const DOMINIO = 'https://labodeguitadelaesquina.com';
const COMPROBAR = process.argv.includes('--comprobar');
const DICC = JSON.parse(fs.readFileSync(path.join(__dirname, 'traduccion-en.json'), 'utf8'));
delete DICC._nota;

// Ruta en español -> ruta en inglés
const RUTAS = {
  '/': '/en/',
  '/carta/': '/en/menu/',
  '/como-llegar/': '/en/getting-here/',
  '/preguntas-frecuentes/': '/en/faq/',
  '/aviso-legal/': '/en/legal-notice/',
  '/privacidad/': '/en/privacy/',
  '/cookies/': '/en/cookies/'
};
const LEGALES = ['/aviso-legal/', '/privacidad/', '/cookies/'];
// Anclas de las secciones de la carta
const ANCLAS = { 'tostadas': 'toast', 'bocadillos': 'sandwiches', 'dulces-y-cafes': 'pastries-and-coffee' };
const WHATSAPP_ES = 'text=Hola%2C%20os%20escribo%20desde%20la%20web%20de%20La%20Bodeguita';
const WHATSAPP_EN = 'text=' + encodeURIComponent('Hi! I’m writing from La Bodeguita’s website');
const AVISO_TRADUCCION = '<p class="nota-traduccion">This is an English translation provided for information. If there is any discrepancy, the <a href="RUTA_ES" hreflang="es" lang="es">Spanish version</a> prevails.</p>';

const archivo = (ruta, base = WEB) => path.join(base, ruta === '/' ? '' : ruta, 'index.html');
const leer = f => fs.readFileSync(f, 'utf8');
const faltan = new Set();

function traducir(texto) {
  const clave = texto.replace(/\s+/g, ' ').trim();
  if (!/[A-Za-zÀ-ÿ]/.test(clave)) return texto;
  if (!(clave in DICC)) { faltan.add(clave); return texto; }
  const en = DICC[clave];
  if (en === '=') return texto;
  return texto.replace(/^(\s*)[\s\S]*?(\s*)$/, (m, a, b) => a + en + b);
}

function rutaEn(u) {
  const conDominio = u.startsWith(DOMINIO + '/');
  const r = conDominio ? u.slice(DOMINIO.length) : u;
  if (r.startsWith('#')) return '#' + (ANCLAS[r.slice(1)] || r.slice(1));
  if (!r.startsWith('/')) return u;
  const [p, ancla] = r.split('#');
  if (!(p in RUTAS)) return u;
  const destino = RUTAS[p] + (ancla !== undefined ? '#' + (ANCLAS[ancla] || ancla) : '');
  return (conDominio ? DOMINIO : '') + destino;
}

// ---------- Enlaces entre idiomas en las páginas en español (idempotente) ----------
const pastilla = (href, codigo, nombre) => `<a class="idioma" href="${href}" hreflang="${codigo}" lang="${codigo}"><span aria-hidden="true">${codigo.toUpperCase()}</span><span class="solo-lectores">${nombre}</span></a>`;
const enlacePie = (href, codigo, nombre) => `<li class="pie__idioma"><a href="${href}" hreflang="${codigo}" lang="${codigo}">${nombre}</a></li>`;
const alternos = (es) => `<link rel="alternate" hreflang="es" href="${DOMINIO}${es}">\n<link rel="alternate" hreflang="en" href="${DOMINIO}${RUTAS[es]}">\n<link rel="alternate" hreflang="x-default" href="${DOMINIO}${es}">`;

function quitarIdioma(t) {
  return t
    .replace(/\n<link rel="alternate" hreflang="[^"]+" href="[^"]+">/g, '')
    .replace(/\n<meta property="og:locale:alternate" content="[^"]+">/g, '')
    .replace(/<a class="idioma"[^>]*>.*?<\/a>/g, '')
    .replace(/<li class="pie__idioma">.*?<\/li>\n?/g, '');
}

function marcarEspanol(t, es) {
  t = quitarIdioma(t);
  const destino = es ? RUTAS[es] : '/en/';
  if (es) t = t.replace(/(<link rel="canonical" href="[^"]+">)/, `$1\n${alternos(es)}`);
  t = t.replace(/(<meta property="og:locale" content="es_ES">)/, '$1\n<meta property="og:locale:alternate" content="en_GB">');
  t = t.replace(/(<a class="logo"[\s\S]*?<\/a>)/, `$1${pastilla(destino, 'en', 'English')}`);
  t = t.replace(/(<li><button class="pie__btn")/, `${enlacePie(destino, 'en', 'English')}\n$1`);
  return t;
}

// ---------- JSON-LD ----------
const CLAVES_TEXTO = ['name', 'description', 'text', 'servesCuisine', 'paymentAccepted', 'streetAddress', 'addressLocality', 'addressRegion', 'legalName'];
function traducirJson(v, clave, padre) {
  if (Array.isArray(v)) return v.map(x => traducirJson(x, clave, padre));
  if (v && typeof v === 'object') {
    const o = {};
    for (const k of Object.keys(v)) o[k] = traducirJson(v[k], k, v);
    return o;
  }
  if (typeof v !== 'string') return v;
  if (clave === 'inLanguage') return 'en';
  if (/^https?:/.test(v)) {
    const negocio = padre && typeof padre['@id'] === 'string' && padre['@id'].endsWith('#negocio');
    if (negocio && (clave === '@id' || clave === 'url')) return v;
    return rutaEn(v);
  }
  if (CLAVES_TEXTO.includes(clave)) return traducir(v);
  return v;
}

// ---------- Página en inglés ----------
const ATRIBUTOS = /(\s(?:alt|aria-label|title|data-mapa-titulo|placeholder)=")([^"]*)(")/g;
const META_TRADUCIBLE = /(name|property)="(description|og:title|og:description|og:image:alt|twitter:title|twitter:description)"/;

function generarIngles(t, es) {
  t = quitarIdioma(t);

  // JSON-LD aparte, para no tocarlo como HTML
  const bloques = [];
  t = t.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g, (m, a, json, c) => {
    bloques.push(a + '\n' + JSON.stringify(traducirJson(JSON.parse(json)), null, 2) + '\n' + c);
    return `@@JSONLD${bloques.length - 1}@@`;
  });

  // Textos y atributos
  t = t.split(/(<script[\s\S]*?<\/script>|<[^>]+>)/).map(parte => {
    if (!parte.startsWith('<')) return parte.includes('@@JSONLD') ? parte : traducir(parte);
    if (parte.startsWith('<script')) return parte;
    let etiqueta = parte.replace(ATRIBUTOS, (m, a, v, c) => a + traducir(v) + c);
    if (/^<meta/.test(etiqueta) && META_TRADUCIBLE.test(etiqueta)) etiqueta = etiqueta.replace(/(content=")([^"]*)(")/, (m, a, v, c) => a + traducir(v) + c);
    // Enlaces internos y URL propias
    etiqueta = etiqueta.replace(/(\s(?:href|content)=")([^"]+)(")/g, (m, a, v, c) => a + rutaEn(v) + c);
    // Anclas de la carta
    etiqueta = etiqueta.replace(/(\s(?:id|aria-labelledby)=")(h-)?([^"]+)(")/g, (m, a, h, v, c) => a + (h || '') + (ANCLAS[v] || v) + c);
    return etiqueta;
  }).join('');
  t = t.replace(/@@JSONLD(\d+)@@/g, (m, i) => bloques[i]);

  t = t
    .replace('<html lang="es-ES">', '<html lang="en">')
    .replace('<meta property="og:locale" content="es_ES">', '<meta property="og:locale" content="en_GB">\n<meta property="og:locale:alternate" content="es_ES">')
    .replace(/(<link rel="canonical" href="[^"]+">)/, `$1\n${alternos(es)}`)
    .replace(/(<a class="logo"[\s\S]*?<\/a>)/, `$1${pastilla(es, 'es', 'Español')}`)
    .replace(/(<li><button class="pie__btn")/, `${enlacePie(es, 'es', 'Español')}\n$1`)
    // En español, «Cómo llegar» sirve para la sección y para el botón que abre la ruta en Google Maps; en inglés el botón es «Directions»
    .replace(/(<a [^>]*href="https:\/\/www\.google\.com\/maps\/dir\/[^"]*"[^>]*>(?:(?!<\/a>)[\s\S])*?<span>)Getting here(<\/span>)/g, '$1Directions$2')
    .split(WHATSAPP_ES).join(WHATSAPP_EN)
    .replace(/([?&](?:amp;)?hl=)es\b/g, '$1en');

  if (LEGALES.includes(es)) {
    const antes = t;
    t = t.replace(/(<p class="legal__fecha">[^<]*<\/p>)/, `$1\n${AVISO_TRADUCCION.replace('RUTA_ES', es)}`);
    if (t === antes) throw new Error(`No encuentro la fecha de actualización en ${es}`);
  }
  return t;
}

// ---------- Ejecución ----------
const cambios = [];
const escribir = (f, contenido) => {
  const actual = fs.existsSync(f) ? leer(f) : null;
  if (actual === contenido) return;
  cambios.push(path.relative(RAIZ, f));
  if (!COMPROBAR) { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, contenido); }
};

const salidas = {};
for (const es of Object.keys(RUTAS)) {
  const f = archivo(es);
  const marcado = marcarEspanol(leer(f), es);
  salidas[f] = marcado;
  salidas[archivo(RUTAS[es])] = generarIngles(marcado, es);
}
const f404 = path.join(WEB, '404.html');
salidas[f404] = marcarEspanol(leer(f404), null);

if (faltan.size) {
  console.error('Faltan traducciones en herramientas/traduccion-en.json:\n' + [...faltan].map(s => '  ' + JSON.stringify(s)).join('\n'));
  process.exit(1);
}
for (const [f, c] of Object.entries(salidas)) escribir(f, c);

if (COMPROBAR) {
  if (cambios.length) { console.error('La versión en inglés no está al día. Ejecuta: node herramientas/generar-ingles.js\n  ' + cambios.join('\n  ')); process.exit(1); }
  console.log('Versión en inglés al día');
} else {
  console.log(cambios.length ? 'Actualizado:\n  ' + cambios.join('\n  ') : 'Sin cambios');
}
