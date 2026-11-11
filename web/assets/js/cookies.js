// Consentimiento para el mapa de Google, lo único de terceros que tiene la web.
// No hay aviso al entrar: el permiso se pide en el recuadro del mapa («Cargar mapa») y se cambia en el panel
// «Configurar cookies» (menú del móvil, pie y política de cookies). Sin permiso no se carga nada de Google.
(function () {
  var d = document;
  var CLAVE = 'consentimiento-cookies';
  var VERSION = 1;
  var MESES = 12;

  function leer() {
    try {
      var c = JSON.parse(localStorage.getItem(CLAVE));
      if (!c || c.v !== VERSION || !c.t) return null;
      var f = new Date(c.t);
      if (isNaN(f)) return null;
      var limite = new Date(f);
      limite.setMonth(limite.getMonth() + MESES);
      return Date.now() > limite ? null : c;
    } catch (e) { return null; }
  }
  function guardar(mapa) {
    try {
      localStorage.setItem(CLAVE, JSON.stringify({ v: VERSION, t: new Date().toISOString(), mapa: !!mapa }));
      return true;
    } catch (e) { return false; }
  }

  var panel = d.querySelector('.cookies-panel');
  var caja = panel && panel.querySelector('.cookies-panel__caja');
  var casilla = d.getElementById('ck-mapa');
  var origen = null;

  function mapaActivo() { var c = leer(); return !!(c && c.mapa); }

  function cargarMapas() {
    [].forEach.call(d.querySelectorAll('[data-mapa]'), function (m) {
      if (m.querySelector('iframe')) return;
      var f = d.createElement('iframe');
      f.src = m.getAttribute('data-mapa-src');
      f.title = m.getAttribute('data-mapa-titulo') || (d.documentElement.lang.slice(0, 2) === 'en' ? 'Map' : 'Mapa');
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      var aviso = m.querySelector('.mapa__aviso');
      if (aviso) aviso.hidden = true;
      m.appendChild(f);
    });
  }
  function quitarMapas() {
    [].forEach.call(d.querySelectorAll('[data-mapa]'), function (m) {
      var f = m.querySelector('iframe');
      if (f) m.removeChild(f);
      var aviso = m.querySelector('.mapa__aviso');
      if (aviso) aviso.hidden = false;
    });
  }
  function aplicar() { if (mapaActivo()) cargarMapas(); else quitarMapas(); }

  function abrirPanel(desde) {
    if (!panel) return;
    // Si se abre desde el menú móvil, al cerrar el foco vuelve al botón de la hamburguesa
    origen = desde && desde.closest && desde.closest('.nav') ? d.querySelector('.menu-btn') : (desde || d.activeElement);
    if (casilla) casilla.checked = mapaActivo();
    panel.hidden = false;
    caja.focus();
  }
  function cerrarPanel() {
    if (!panel || panel.hidden) return;
    panel.hidden = true;
    if (origen && origen.focus && d.contains(origen) && !origen.hidden) origen.focus();
    origen = null;
  }

  aplicar();

  [].forEach.call(d.querySelectorAll('[data-mapa-cargar]'), function (b) {
    b.hidden = false;
    b.addEventListener('click', function () { guardar(true); aplicar(); });
  });
  [].forEach.call(d.querySelectorAll('[data-cookies-abrir]'), function (b) {
    b.addEventListener('click', function (e) { if (e.preventDefault) e.preventDefault(); abrirPanel(b); });
  });
  if (panel) {
    panel.querySelector('[data-cookies-guardar]').addEventListener('click', function () { guardar(!!(casilla && casilla.checked)); cerrarPanel(); aplicar(); });
    panel.querySelector('[data-cookies-cerrar]').addEventListener('click', cerrarPanel);
    panel.addEventListener('click', function (e) { if (e.target === panel) cerrarPanel(); });
    d.addEventListener('keydown', function (e) {
      if (panel.hidden) return;
      if (e.key === 'Escape') { cerrarPanel(); return; }
      if (e.key !== 'Tab') return;
      var f = [].slice.call(caja.querySelectorAll('button, a[href], input:not([disabled])'));
      var i = f.indexOf(d.activeElement);
      if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && (i === f.length - 1)) { e.preventDefault(); f[0].focus(); }
    });
  }
})();
