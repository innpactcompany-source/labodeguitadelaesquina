// Aviso «View this page in English» en las páginas en español (por ejemplo, al llegar a /carta/ desde la pegatina NFC de la mesa).
// Se carga en el <head> sin defer: marca <html> antes de pintar, así el aviso ya ocupa su sitio y no mueve el contenido.
// Nunca redirige. Si se cierra, no vuelve a salir en esa sesión.
(function () {
  var d = document, html = d.documentElement, CLAVE = 'aviso-idioma-cerrado';
  var lengua = String(navigator.language || '').toLowerCase();
  if (!lengua || /^(es|ca|gl|eu)(-|$)/.test(lengua)) return;
  try { if (sessionStorage.getItem(CLAVE)) return; } catch (e) { /* sin sessionStorage: se enseña igual */ }
  html.classList.add('aviso-ingles');
  d.addEventListener('click', function (e) {
    var b = e.target && e.target.closest && e.target.closest('[data-aviso-idioma-cerrar]');
    if (!b) return;
    try { sessionStorage.setItem(CLAVE, '1'); } catch (err) { /* no se puede recordar */ }
    html.classList.remove('aviso-ingles');
    var main = d.getElementById('contenido');
    if (main) main.focus({ preventScroll: true });
  });
})();
