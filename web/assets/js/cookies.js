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

  var banner = d.querySelector('.cookies-banner');
  var panel = d.querySelector('.cookies-panel');
  var fab = d.querySelector('.cookies-fab');
  var caja = panel && panel.querySelector('.cookies-panel__caja');
  var casilla = d.getElementById('ck-mapa');
  var origen = null;

  // El botón flotante se esconde mientras pasa por encima de una foto a todo el ancho (portada y cierre de Inicio)
  var fotosAncha = d.querySelectorAll('.portada__foto, .cierre__foto');
  function vigilarBoton() {
    if (!fab || !fotosAncha.length) return;
    var r = fab.getBoundingClientRect();
    var cubre = false;
    if (r.width) [].forEach.call(fotosAncha, function (f) {
      var q = f.getBoundingClientRect();
      if (q.bottom > r.top && q.top < r.bottom && q.right > r.left && q.left < r.right) cubre = true;
    });
    fab.classList.toggle('cookies-fab--oculto', cubre);
    if (cubre) { fab.setAttribute('aria-hidden', 'true'); fab.setAttribute('tabindex', '-1'); }
    else { fab.removeAttribute('aria-hidden'); fab.removeAttribute('tabindex'); }
  }

  function mapaActivo() { var c = leer(); return !!(c && c.mapa); }

  function cargarMapas() {
    [].forEach.call(d.querySelectorAll('[data-mapa]'), function (m) {
      if (m.querySelector('iframe')) return;
      var f = d.createElement('iframe');
      f.src = m.getAttribute('data-mapa-src');
      f.title = m.getAttribute('data-mapa-titulo') || 'Mapa';
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

  function cerrarBanner() { if (banner) banner.hidden = true; if (fab) fab.hidden = false; }
  function decidir(mapa) { guardar(mapa); cerrarBanner(); cerrarPanel(); aplicar(); }

  function abrirPanel(desde) {
    if (!panel) return;
    // Si se abre desde el menú móvil, al cerrar el foco vuelve al botón de la hamburguesa
    origen = desde && desde.closest && desde.closest('.nav') ? d.querySelector('.menu-btn') : (desde || d.activeElement);
    if (casilla) casilla.checked = mapaActivo();
    panel.hidden = false;
    if (banner) banner.hidden = true;
    caja.focus();
  }
  function cerrarPanel() {
    if (!panel || panel.hidden) return;
    panel.hidden = true;
    if (!leer() && banner) banner.hidden = false;
    if (leer() && fab) fab.hidden = false;
    if (origen && origen.focus && d.contains(origen) && !origen.hidden) origen.focus();
    origen = null;
  }

  if (banner && !leer()) { banner.hidden = false; } else if (fab) { fab.hidden = false; }
  aplicar();
  vigilarBoton();
  window.addEventListener('scroll', vigilarBoton, { passive: true });
  window.addEventListener('resize', vigilarBoton);
  window.addEventListener('load', vigilarBoton);

  [].forEach.call(d.querySelectorAll('[data-mapa-cargar]'), function (b) {
    b.hidden = false;
    b.addEventListener('click', function () { guardar(true); cerrarBanner(); aplicar(); });
  });
  [].forEach.call(d.querySelectorAll('[data-cookies-abrir]'), function (b) {
    b.addEventListener('click', function (e) { if (e.preventDefault) e.preventDefault(); abrirPanel(b); });
  });
  if (banner) {
    banner.querySelector('[data-cookies-aceptar]').addEventListener('click', function () { decidir(true); });
    banner.querySelector('[data-cookies-rechazar]').addEventListener('click', function () { decidir(false); });
    banner.querySelector('[data-cookies-configurar]').addEventListener('click', function (e) { abrirPanel(e.currentTarget); });
  }
  if (panel) {
    panel.querySelector('[data-cookies-guardar]').addEventListener('click', function () { decidir(!!(casilla && casilla.checked)); });
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
