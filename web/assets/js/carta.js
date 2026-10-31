(function () {
  var chips = [].slice.call(document.querySelectorAll('.chip'));
  if (!chips.length || !('IntersectionObserver' in window)) return;
  var porId = {};
  var secciones = [];
  chips.forEach(function (c) {
    var id = c.getAttribute('href').slice(1);
    var s = document.getElementById(id);
    if (s) { porId[id] = c; secciones.push(s); }
  });
  if (!secciones.length) return;
  var lista = chips[0].parentNode.parentNode;
  var actual = null;

  function activar(id) {
    if (id === actual || !porId[id]) return;
    actual = id;
    chips.forEach(function (c) {
      var on = c === porId[id];
      c.classList.toggle('chip--activo', on);
      if (on) c.setAttribute('aria-current', 'true'); else c.removeAttribute('aria-current');
    });
    var c = porId[id];
    if (lista.scrollWidth > lista.clientWidth) {
      lista.scrollTo({ left: c.offsetLeft - (lista.clientWidth - c.offsetWidth) / 2 });
    }
  }

  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) activar(e.target.id); });
  }, { rootMargin: '-150px 0px -65% 0px' });
  secciones.forEach(function (s) { io.observe(s); });
  chips.forEach(function (c) {
    c.addEventListener('click', function (e) {
      var id = c.getAttribute('href').slice(1);
      var seccion = document.getElementById(id);
      var titulo = document.getElementById('h-' + id);
      if (!seccion || !titulo) return; // sin título: queda el salto normal del ancla
      e.preventDefault();
      activar(id);
      seccion.scrollIntoView(); // respeta scroll-padding-top y scroll-behavior del CSS
      if (window.history && history.pushState) history.pushState(null, '', '#' + id); else location.hash = id;
      if (!titulo.hasAttribute('tabindex')) titulo.setAttribute('tabindex', '-1');
      titulo.focus({ preventScroll: true });
    });
  });
  function bordeDerecho() {
    var nav = lista.parentNode;
    var hayMas = lista.scrollWidth - lista.clientWidth - lista.scrollLeft > 4;
    nav.classList.toggle('chips--sin-mas', !hayMas);
  }
  lista.addEventListener('scroll', bordeDerecho, { passive: true });
  window.addEventListener('resize', bordeDerecho);
  bordeDerecho();
  activar(secciones[0].id);
})();
