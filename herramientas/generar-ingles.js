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

// ---------- Enlaces entre idiomas (idempotente) ----------
// Cada página lleva: botón «EN»/«ES» de móvil junto al menú, conmutador «ES · EN» de escritorio, fila «Español · English»
// al final del menú desplegado y enlace en el pie. El idioma actual no es enlace y lleva aria-current.
const IDIOMAS = {
  es: { corto: 'ES', largo: 'Español', ir: 'Ver esta página en español', grupo: 'Idioma' },
  en: { corto: 'EN', largo: 'English', ir: 'View this page in English', grupo: 'Language' }
};
const enlaceIdioma = (cod, href, texto, etiqueta) => `<a href="${href}" hreflang="${cod}" lang="${cod}"${etiqueta ? ` aria-label="${IDIOMAS[cod].ir}"` : ''}>${texto}</a>`;
const actualIdioma = (cod, texto, clase) => `<span class="${clase}" aria-current="true" lang="${cod}">${texto}</span>`;
// actual: idioma de la página; otra: ruta equivalente en el otro idioma
function marcasIdioma(actual, otra) {
  const otro = actual === 'es' ? 'en' : 'es';
  const par = (fn) => ['es', 'en'].map(c => fn(c)).join('<span class="idiomas__punto" aria-hidden="true">·</span>');
  return {
    pastilla: `<a class="idioma" href="${otra}" hreflang="${otro}" lang="${otro}"><span aria-hidden="true">${IDIOMAS[otro].corto}</span><span class="solo-lectores">${IDIOMAS[otro].ir}</span></a>`,
    conmutador: `<div class="idiomas" role="group" aria-label="${IDIOMAS[actual].grupo}">` + par(c => c === actual
      ? actualIdioma(c, `<span aria-hidden="true">${IDIOMAS[c].corto}</span><span class="solo-lectores">${IDIOMAS[c].largo}</span>`, 'idiomas__actual')
      : enlaceIdioma(c, otra, IDIOMAS[c].corto, true)) + '</div>',
    fila: `<p class="nav__idiomas" role="group" aria-label="${IDIOMAS[actual].grupo}">` + par(c => c === actual
      ? actualIdioma(c, IDIOMAS[c].largo, 'idiomas__actual')
      : enlaceIdioma(c, otra, IDIOMAS[c].largo, false)) + '</p>',
    pie: `<li class="pie__idioma">${enlaceIdioma(otro, otra, IDIOMAS[otro].largo, false)}</li>`
  };
}
// Aviso «View this page in English» en las páginas en español: lo enseña assets/js/idioma.js si el navegador no está en español, catalán, gallego ni euskera
const avisoIngles = (destino, es) => `<div class="aviso-idioma contenedor" lang="en"><p><a href="${destino}" hreflang="en">${es === '/carta/' ? 'View this menu in English' : 'View this page in English'} <span aria-hidden="true">→</span></a></p><button class="aviso-idioma__cerrar" type="button" aria-label="Close" data-aviso-idioma-cerrar><svg class="icono" width="24" height="24" aria-hidden="true" focusable="false"><use href="/assets/iconos/iconos.svg#cerrar"></use></svg></button></div>`;
const alternos = (es) => `<link rel="alternate" hreflang="es" href="${DOMINIO}${es}">\n<link rel="alternate" hreflang="en" href="${DOMINIO}${RUTAS[es]}">\n<link rel="alternate" hreflang="x-default" href="${DOMINIO}${es}">`;

function quitarIdioma(t) {
  return t
    .replace(/\n<link rel="alternate" hreflang="[^"]+" href="[^"]+">/g, '')
    .replace(/\n<meta property="og:locale:alternate" content="[^"]+">/g, '')
    .replace(/<script src="\/assets\/js\/idioma\.js[^"]*"><\/script>\n/g, '')
    .replace(/<a class="idioma"[^>]*>.*?<\/a>/g, '')
    .replace(/<div class="idiomas"[^>]*>.*?<\/div>\n/g, '')
    .replace(/<p class="nav__idiomas"[^>]*>.*?<\/p>\n/g, '')
    .replace(/<div class="aviso-idioma[^"]*"[^>]*>.*?<\/div>\n/g, '')
    .replace(/<li class="pie__idioma">.*?<\/li>\n?/g, '');
}

function ponerMarcas(t, m) {
  const antes = t;
  t = t
    .replace(/(<a class="logo"[\s\S]*?<\/a>)/, `$1${m.pastilla}`)
    .replace(/(<div class="nav__movil">.*<\/div>\n)(<\/nav>\n)(<a class="btn btn--primario cabecera__llamar")/, `$1${m.fila}\n$2${m.conmutador}\n$3`)
    .replace(/(<li><button class="pie__btn")/, `${m.pie}\n$1`);
  if ((t.match(/class="idioma"|class="nav__idiomas"|class="idiomas"|class="pie__idioma"/g) || []).length !== 4) throw new Error('No encuentro dónde poner el cambio de idioma');
  return t;
}

function marcarEspanol(t, es) {
  t = quitarIdioma(t);
  const destino = es ? RUTAS[es] : '/en/';
  if (es) t = t.replace(/(<link rel="canonical" href="[^"]+">)/, `$1\n${alternos(es)}`);
  t = t.replace(/(<meta property="og:locale" content="es_ES">)/, '$1\n<meta property="og:locale:alternate" content="en_GB">');
  t = ponerMarcas(t, marcasIdioma('es', destino));
  if (es) {
    // El script va en el <head> y sin defer para que el aviso ya esté en su sitio al pintar la página (sin saltos)
    t = t.replace(/(<link rel="stylesheet" href="\/assets\/css\/base\.css(\?v=[^"]*)">)/, '<script src="/assets/js/idioma.js$2"></script>\n$1');
    const aviso = avisoIngles(destino, es) + '\n';
    t = es === '/' ? t.replace(/(<main id="contenido" tabindex="-1">\n)/, `$1${aviso}`) : t.replace(/(<nav class="migas[^>]*>.*?<\/nav>\n)/, `$1${aviso}`);
    if (!t.includes('class="aviso-idioma') || !t.includes('assets/js/idioma.js')) throw new Error(`No encuentro dónde poner el aviso de idioma en ${es}`);
  }
  return t;
}

// ---------- Horas en formato inglés ----------
// 24:00 → midnight, 12:00 → 12 noon, el resto en 12 horas (8 am, 2 am, 6:30 pm)
function horaIngles(h, m) {
  h = Number(h); m = Number(m);
  if ((h === 24 || h === 0) && m === 0) return 'midnight';
  if (h === 12 && m === 0) return '12 noon';
  const h12 = h % 12 || 12;
  return h12 + (m ? ':' + String(m).padStart(2, '0') : '') + (h % 24 < 12 ? ' am' : ' pm');
}
const horasIngles = s => s.replace(/\b([01]?\d|2[0-4]):([0-5]\d)\b/g, (x, h, m) => horaIngles(h, m));

// Añadidos que solo existen en inglés (explican palabras españolas que se dejan sin traducir)
const SOLO_EN = [
  [/(<h2 class="marco__titulo" id="h-sandwiches"[^>]*>[^<]*<\/h2>\n)/, '$1<p class="marco__subtitulo">Baguette sandwiches</p>\n'],
  [/(<li class="plato" id="bocadillo-sobrasada-jamon-cebolla"><div class="plato__fila">.*?<\/div>)/, '$1<p class="plato__desc">Sobrasada is a soft cured pork sausage</p>']
];

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
    if (!parte.startsWith('<')) return parte.includes('@@JSONLD') ? parte : horasIngles(traducir(parte));
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
    // En español, «Cómo llegar» sirve para la sección y para el botón que abre la ruta en Google Maps; en inglés el botón es «Directions»
    .replace(/(<a [^>]*href="https:\/\/www\.google\.com\/maps\/dir\/[^"]*"[^>]*>(?:(?!<\/a>)[\s\S])*?<span>)Getting here(<\/span>)/g, '$1Directions$2')
    // Imagen para redes con el texto en inglés («BREAKFAST · BRUNCH · TERRACE»)
    .replace(/(<meta (?:property="og:image"|name="twitter:image") content="https:\/\/labodeguitadelaesquina\.com\/assets\/marca\/)og-image\.jpg"/g, '$1og-image-en.jpg"')
    .split(WHATSAPP_ES).join(WHATSAPP_EN)
    .replace(/([?&](?:amp;)?hl=)es\b/g, '$1en');
  // En el menú de la cabecera, la cola de la «Q» de Cinzel hace que «FAQ» parezca «FAQ_»: el enlace dice «Questions»
  t = t.replace(/(<nav class="nav" id="menu-principal"[\s\S]*?<a href="\/en\/faq\/"[^>]*>)FAQ(<\/a>)/, '$1Questions$2');
  t = ponerMarcas(t, marcasIdioma('en', es));
  if (es === '/carta/') for (const [buscar, poner] of SOLO_EN) {
    if (!buscar.test(t)) throw new Error('No encuentro dónde añadir en la carta: ' + buscar);
    t = t.replace(buscar, poner);
  }

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
