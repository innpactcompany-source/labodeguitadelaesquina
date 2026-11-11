// Prueba de navegador: abre web/ en Chrome sin ventana y comprueba lo que solo se ve ejecutando la página.
// Ejecutar con: node pruebas/navegador.js            (sirve web/ en local)
//               node pruebas/navegador.js https://labodeguitadelaesquina.com   (contra el dominio)
// Necesita Google Chrome instalado. No usa dependencias: habla con Chrome por el protocolo de DevTools.
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os');
const { spawn } = require('child_process');

const WEB = path.join(__dirname, '..', 'web');
const CHROME = [process.env.CHROME, 'C:/Program Files/Google/Chrome/Application/chrome.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome']
  .find(f => f && fs.existsSync(f));
const espera = ms => new Promise(r => setTimeout(r, ms));
let errores = 0;
const ok = (n, c, d = '') => { console.log(`${c ? 'OK   ' : 'FALLA'} ${n}${d ? ' · ' + d : ''}`); if (!c) errores++; };

// Servidor estático mínimo con la 404 de la web
function servir() {
  const tipos = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.xml': 'application/xml', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json' };
  const s = http.createServer((req, res) => {
    const p = decodeURIComponent(req.url.split('?')[0]);
    let f = path.join(WEB, p); if (p.endsWith('/')) f = path.join(f, 'index.html');
    if (!f.startsWith(WEB) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404, { 'Content-Type': tipos['.html'] }); return res.end(fs.readFileSync(path.join(WEB, '404.html'))); }
    res.writeHead(200, { 'Content-Type': tipos[path.extname(f)] || 'application/octet-stream' }); res.end(fs.readFileSync(f));
  });
  return new Promise(r => s.listen(0, '127.0.0.1', () => r(s)));
}

// Chrome por DevTools (con reintentos: en algunos equipos la primera conexión tarda)
async function chrome(puerto, lang) {
  const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'bodeguita-'));
  const p = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${puerto}`, `--user-data-dir=${perfil}`, `--lang=${lang}`, '--hide-scrollbars', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  const traer = async (u, o) => { for (let i = 0; i < 30; i++) { try { return await fetch(u, o); } catch { await espera(300); } } throw new Error('Chrome no responde'); };
  await traer(`http://127.0.0.1:${puerto}/json/version`);
  return {
    async pestana() {
      const t = await (await traer(`http://127.0.0.1:${puerto}/json/new?about:blank`, { method: 'PUT' })).json();
      const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
      let id = 0; const pend = {}; const eventos = [];
      ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && pend[d.id]) { pend[d.id](d.result || {}); delete pend[d.id]; } else if (d.method) eventos.push(d); };
      const cmd = (method, params = {}) => new Promise(res => { const i = ++id; pend[i] = res; ws.send(JSON.stringify({ id: i, method, params })); });
      const ev = async e => ((await cmd('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true })).result || {}).value;
      for (const d of ['Page', 'Runtime', 'Log', 'Network']) await cmd(d + '.enable');
      return { cmd, ev, eventos, cerrar: async () => { ws.close(); await traer(`http://127.0.0.1:${puerto}/json/close/${t.id}`).catch(() => {}); } };
    },
    cerrar: () => p.kill()
  };
}

async function abrir(c, base, ruta, { ancho = 375, alto = 812, movimiento = 'no-preference' } = {}) {
  const t = await c.pestana();
  await t.cmd('Emulation.setDeviceMetricsOverride', { width: ancho, height: alto, deviceScaleFactor: 1, mobile: ancho < 768 });
  await t.cmd('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: movimiento }] });
  await t.cmd('Page.navigate', { url: base + ruta });
  for (let i = 0; i < 80 && !t.eventos.some(e => e.method === 'Page.loadEventFired'); i++) await espera(100);
  await t.ev('document.fonts.ready.then(() => 1)');
  await espera(400);
  return t;
}

// Estado de la barra inferior: si se ve, si se puede enfocar y su transformación
const ESTADO_BARRA = `(() => { const b = document.querySelector('.barra-movil'); const s = getComputedStyle(b);
  return { display: s.display, visible: s.visibility === 'visible' && s.display !== 'none' && +s.opacity > 0.99, transform: s.transform, transicion: s.transitionProperty }; })()`;
// Desplazamiento instantáneo (la web usa scroll suave) y espera a que termine la transición de 0,25 s
const scroll = y => `new Promise(r => { window.scrollTo({ top: ${y}, behavior: "instant" }); setTimeout(r, 600); })`;

(async () => {
  if (!CHROME) { console.log('FALLA No encuentro Google Chrome (define CHROME con su ruta)'); process.exit(1); }
  let servidor = null, base = process.argv[2];
  if (!base) { servidor = await servir(); base = `http://127.0.0.1:${servidor.address().port}`; }
  console.log('Probando ' + base + '\n');
  const c = await chrome(9400 + Math.floor(Math.random() * 400), 'es-ES');
  try {
    // ---------- Barra inferior ----------
    for (const ruta of ['/', '/en/']) {
      const t = await abrir(c, base, ruta);
      const arriba = await t.ev(ESTADO_BARRA);
      const enfocable = await t.ev(`(() => { const a = document.querySelector('.barra-movil a'); a.focus(); return document.activeElement === a; })()`);
      const finPortada = await t.ev(`Math.ceil(document.querySelector('.portada .btn-grupo').getBoundingClientRect().bottom + scrollY)`);
      await t.ev(scroll('document.querySelector(".portada .btn-grupo").getBoundingClientRect().bottom + scrollY + 10'));
      const abajo = await t.ev(ESTADO_BARRA);
      const botonesFuera = await t.ev(`document.querySelector('.portada .btn-grupo').getBoundingClientRect().bottom <= 0`);
      await t.ev(scroll(0));
      const otraVez = await t.ev(ESTADO_BARRA);
      // Antes de que los botones salgan del todo, la barra sigue oculta
      await t.ev(scroll(`${finPortada} - 40`));
      const casi = await t.ev(ESTADO_BARRA);
      ok(`B1. Inicio ${ruta} a 375 px: barra oculta y sin foco mientras se ven los botones de la portada, visible al dejarlos atrás y oculta otra vez al volver`,
        !arriba.visible && !enfocable && botonesFuera && abajo.visible && abajo.transform === 'none' && !otraVez.visible && !casi.visible && /transform/.test(arriba.transicion),
        `arriba ${arriba.visible ? "visible" : "oculta"} · abajo ${abajo.visible ? "visible" : "oculta"} · al volver ${otraVez.visible ? "visible" : "oculta"}`);
      await t.cerrar();
    }
    {
      const t = await abrir(c, base, '/', { movimiento: 'reduce' });
      const arriba = await t.ev(ESTADO_BARRA);
      await t.ev(scroll('document.querySelector(".portada .btn-grupo").getBoundingClientRect().bottom + scrollY + 10'));
      const abajo = await t.ev(ESTADO_BARRA);
      ok('B2. Con prefers-reduced-motion la barra aparece y desaparece al instante, sin desplazarse',
        !arriba.visible && abajo.visible && arriba.transform === 'none' && abajo.transform === 'none' && !/transform/.test(arriba.transicion + abajo.transicion), `transición: ${arriba.transicion}`);
      await t.cerrar();
    }
    {
      const malas = [];
      for (const ruta of ['/carta/', '/como-llegar/', '/preguntas-frecuentes/', '/aviso-legal/', '/en/menu/', '/en/getting-here/', '/no-existe']) {
        const t = await abrir(c, base, ruta); const e = await t.ev(ESTADO_BARRA); if (!e.visible || e.transform !== 'none') malas.push(ruta); await t.cerrar();
      }
      ok('B3. En el resto de páginas la barra se ve desde el principio, como siempre', !malas.length, malas.join(', '));
      const t = await abrir(c, base, '/', { ancho: 1440, alto: 900 });
      ok('B4. En escritorio no hay barra inferior', (await t.ev(ESTADO_BARRA)).display === 'none');
      await t.cerrar();
    }

    // ---------- Consola, CSP y terceros ----------
    const paginas = ['/', '/carta/', '/como-llegar/', '/preguntas-frecuentes/', '/aviso-legal/', '/privacidad/', '/cookies/',
      '/en/', '/en/menu/', '/en/getting-here/', '/en/faq/', '/en/legal-notice/', '/en/privacy/', '/en/cookies/'];
    const avisos = [], terceros = [], recursos = [];
    for (const ruta of paginas) {
      const t = await abrir(c, base, ruta, { ancho: 1280, alto: 900 });
      for (const e of t.eventos) {
        if (e.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(e.params.type)) avisos.push(ruta + ': ' + e.params.args.map(a => a.value || a.description).join(' '));
        if (e.method === 'Runtime.exceptionThrown') avisos.push(ruta + ': ' + e.params.exceptionDetails.text);
        if (e.method === 'Log.entryAdded' && ['error', 'warning'].includes(e.params.entry.level)) avisos.push(ruta + ': ' + e.params.entry.text);
        if (e.method === 'Network.requestWillBeSent' && !e.params.request.url.startsWith(base) && !e.params.request.url.startsWith('data:')) terceros.push(ruta + ': ' + new URL(e.params.request.url).host);
      }
      const r = await t.ev(`({ fuentes: [...document.fonts].filter(f => f.status === 'loaded').length, iconos: performance.getEntriesByType('resource').some(r => /iconos\\.svg/.test(r.name)), wa: !!document.querySelector('a[href^="https://wa.me/34682262587?text="]') })`);
      if (r.fuentes < 2 || !r.iconos || !r.wa) recursos.push(ruta);
      await t.cerrar();
    }
    ok('N1. Ningún error ni aviso en la consola (CSP incluida) en las 14 páginas', !avisos.length, [...new Set(avisos)].slice(0, 5).join(' | '));
    ok('N2. Sin aceptar el mapa no hay ninguna petición a terceros', !terceros.length, [...new Set(terceros)].join(', '));
    ok('N3. Fuentes, iconos y enlace de WhatsApp presentes en todas las páginas', !recursos.length, recursos.join(', '));
    {
      const t = await abrir(c, base, '/como-llegar/', { ancho: 1280, alto: 900 });
      t.eventos.length = 0;
      await t.ev(`(() => { const b = document.querySelector('[data-mapa-cargar]'); b.scrollIntoView(); b.click(); })()`); await espera(3500);
      const hosts = [...new Set(t.eventos.filter(e => e.method === 'Network.requestWillBeSent' && !e.params.request.url.startsWith(base)).map(e => new URL(e.params.request.url).host))];
      const csp = t.eventos.filter(e => e.method === 'Log.entryAdded' && /Content Security Policy/i.test(e.params.entry.text));
      const conMapa = await t.ev(`!!document.querySelector('[data-mapa] iframe')`);
      await t.ev(`(() => { document.querySelector('.pie__btn[data-cookies-abrir]').click(); document.getElementById('ck-mapa').checked = false; document.querySelector('[data-cookies-guardar]').click(); })()`); await espera(300);
      const sinMapa = await t.ev(`!document.querySelector('[data-mapa] iframe') && !document.querySelector('.mapa__aviso').hidden`);
      ok('N4. Al pulsar «Cargar mapa» solo se habla con Google y la CSP no bloquea nada; al retirar el permiso el mapa desaparece', conMapa && sinMapa && !csp.length && hosts.every(h => /(^|\.)google\.com$/.test(h)), hosts.join(', '));
      await t.cerrar();
    }
  } catch (e) { ok('La prueba de navegador se ha ejecutado entera', false, e.message); }
  c.cerrar(); if (servidor) servidor.close();
  console.log(errores ? `\n${errores} comprobaciones con fallos` : '\nTodas las comprobaciones de navegador correctas');
  process.exit(errores ? 1 : 0);
})();
