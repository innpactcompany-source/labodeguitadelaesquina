#!/usr/bin/env node
/*
 * Prepara la carpeta que se publica en GitHub Pages a partir de web/.
 *
 *   node .github/scripts/preparar-pages.js <salida>
 *
 * Variables de entorno:
 *   DOMINIO  Dominio propio (por ejemplo labodeguitadelaesquina.com). Si existe, se escribe el CNAME y las rutas
 *            quedan en la raíz. Si no, la web se publica en https://<cuenta>.github.io/<repositorio>/ y se
 *            reescriben las rutas que empiezan por «/» y se añade noindex.
 *   BASE     Prefijo de ruta de la URL temporal (por ejemplo /labodeguitadelaesquina). Solo se usa sin DOMINIO.
 *
 * GitHub Pages no lee .htaccess: las redirecciones de /mesa, /barra e /ir/<local> se convierten en páginas HTML
 * de redirección (meta refresh) solo en la copia que se publica. web/ no se toca.
 */
const fs = require('fs'), path = require('path');

const RAIZ = path.resolve(__dirname, '..', '..');
const WEB = path.join(RAIZ, 'web');
const SALIDA = path.resolve(process.argv[2] || '_site');
const DOMINIO = (process.env.DOMINIO || '').trim();
const BASE = DOMINIO ? '' : (process.env.BASE || '').replace(/\/+$/, '');
const DOMINIO_FINAL = 'https://labodeguitadelaesquina.com';

const copia = (de, a) => {
  fs.mkdirSync(a, { recursive: true });
  for (const e of fs.readdirSync(de, { withFileTypes: true })) {
    if (e.name === '.htaccess') continue;
    const o = path.join(de, e.name), d = path.join(a, e.name);
    if (e.isDirectory()) copia(o, d); else fs.copyFileSync(o, d);
  }
};
const recorre = (dir, fn) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) recorre(p, fn); else fn(p);
  }
};

fs.rmSync(SALIDA, { recursive: true, force: true });
copia(WEB, SALIDA);

// 1) Redirecciones del .htaccess -> páginas de redirección
const ht = fs.readFileSync(path.join(WEB, '.htaccess'), 'utf8');
const reglas = [...ht.matchAll(/^RewriteRule \^([a-z0-9\/-]+?)\/\?\$ (\S+) \[R=30[12][^\]]*\]/gm)].map(m => [m[1], m[2]]);
if (!reglas.length) throw new Error('No se han encontrado redirecciones en web/.htaccess');
const escapa = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
// La página de redirección usa la misma CSP, la misma versión de CSS y el mismo logo que el resto de la web
const inicio = fs.readFileSync(path.join(WEB, 'index.html'), 'utf8');
const csp = (inicio.match(/<meta http-equiv="Content-Security-Policy" content="[^"]+">\n<meta name="referrer" content="[^"]+">\n/) || [''])[0];
const version = (inicio.match(/\/assets\/css\/base\.css(\?v=[^"]+)"/) || ['', ''])[1];
if (!csp || !version) throw new Error('No encuentro la CSP o la versión del CSS en web/index.html');
for (const [origen, destinoOriginal] of reglas) {
  let destino = destinoOriginal;
  if (!DOMINIO && destino.startsWith(DOMINIO_FINAL + '/')) destino = BASE + destino.slice(DOMINIO_FINAL.length);
  const d = escapa(destino);
  // /ir/en/<local> es para las páginas en inglés: el inglés va primero
  const ingles = origen.startsWith('ir/en/');
  const boton = primero => `btn ${primero ? 'btn--primario' : 'btn--secundario'}`;
  const es = `<p class="redireccion__texto" lang="es">Un momento…</p>\n<p><a class="${boton(!ingles)}" href="${d}" lang="es">Si no se abre, pulsa aquí</a></p>`;
  const en = `<p class="redireccion__texto" lang="en">One moment…</p>\n<p><a class="${boton(ingles)}" href="${d}" lang="en">If it doesn’t open, tap here</a></p>`;
  const dir = path.join(SALIDA, origen);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), `<!doctype html>
<html lang="${ingles ? 'en' : 'es-ES'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${csp}<title>${ingles ? 'Redirecting' : 'Redirigiendo'}… · La Bodeguita de la Esquina</title>
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=${d}">
<link rel="canonical" href="${d}">
<link rel="icon" href="/assets/marca/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/css/base.css${version}">
</head>
<body>
<main class="redireccion">
<picture><source media="(prefers-color-scheme: dark)" srcset="/assets/marca/bodeguita-logo-horizontal-fondo-oscuro.svg"><img src="/assets/marca/bodeguita-logo-horizontal-fondo-claro.svg" width="296" height="44" alt="La Bodeguita de la Esquina"></picture>
${ingles ? en + '\n' + es : es + '\n' + en}
</main>
</body>
</html>
`);
}

// 2) Dominio propio o URL temporal
if (DOMINIO) {
  fs.writeFileSync(path.join(SALIDA, 'CNAME'), DOMINIO + '\n');
} else {
  const prefija = (t) => t
    .replace(/(\s(?:href|src|action|poster)=")\/(?!\/)/g, `$1${BASE}/`)
    .replace(/(\s(?:srcset|imagesrcset)=")([^"]*)"/g, (m, a, v) => `${a}${v.replace(/(^|,\s*)\/(?!\/)/g, `$1${BASE}/`)}"`)
    .replace(/"(src|start_url|scope)": "\/(?!\/)/g, `"$1": "${BASE}/`);
  recorre(SALIDA, (p) => {
    if (/\.html$/.test(p)) {
      let t = fs.readFileSync(p, 'utf8');
      t = prefija(t);
      if (!/name="robots"/.test(t)) t = t.replace('</head>', '<meta name="robots" content="noindex, nofollow">\n</head>');
      else t = t.replace(/<meta name="robots" content="[^"]*">/, '<meta name="robots" content="noindex, nofollow">');
      fs.writeFileSync(p, t);
    } else if (/\.webmanifest$/.test(p)) {
      fs.writeFileSync(p, prefija(fs.readFileSync(p, 'utf8')));
    }
  });
  fs.writeFileSync(path.join(SALIDA, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
}

const n = []; recorre(SALIDA, p => n.push(p));
console.log(`Listo: ${n.length} archivos en ${SALIDA} · ${DOMINIO ? 'dominio ' + DOMINIO : 'URL temporal con base «' + BASE + '»'} · ${reglas.length} redirecciones`);
