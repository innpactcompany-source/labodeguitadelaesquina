(function () {
  var d = document;
  var html = d.documentElement;
  html.classList.add('js');
  var ingles = (html.lang || '').slice(0, 2) === 'en';

  // ---------- Menú móvil ----------
  var btn = d.querySelector('.menu-btn');
  var nav = d.getElementById('menu-principal');
  if (btn && nav) {
    var fondo = d.createElement('div');
    fondo.className = 'menu-fondo';
    fondo.hidden = true;
    d.body.appendChild(fondo);
    var temporizador = null;

    var abierto = function () { return nav.classList.contains('abierto'); };
    var mostrar = function (v, devolverFoco) {
      nav.classList.toggle('abierto', v);
      html.classList.toggle('menu-abierto', v);
      btn.setAttribute('aria-expanded', v ? 'true' : 'false');
      btn.setAttribute('aria-label', ingles ? (v ? 'Close menu' : 'Open menu') : (v ? 'Cerrar menú' : 'Abrir menú'));
      window.clearTimeout(temporizador);
      if (v) {
        fondo.hidden = false;
        void fondo.offsetWidth; // fuerza el cálculo de estilos para que el fundido arranque desde 0
        fondo.classList.add('visible');
      } else {
        fondo.classList.remove('visible');
        temporizador = window.setTimeout(function () { fondo.hidden = true; }, 220);
        if (devolverFoco) btn.focus();
      }
    };
    btn.addEventListener('click', function () { mostrar(!abierto()); });
    fondo.addEventListener('click', function () { mostrar(false, true); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) mostrar(false); });
    d.addEventListener('click', function (e) {
      if (abierto() && !nav.contains(e.target) && !btn.contains(e.target) && !fondo.contains(e.target)) mostrar(false, true);
    });
    d.addEventListener('keydown', function (e) {
      if (!abierto()) return;
      if (e.key === 'Escape') { mostrar(false, true); return; }
      if (e.key !== 'Tab') return;
      var f = [btn].concat([].slice.call(nav.querySelectorAll('a[href]')));
      var i = f.indexOf(d.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && (i === f.length - 1 || i === -1)) { e.preventDefault(); f[0].focus(); }
    });
    if (window.matchMedia) {
      var mq = window.matchMedia('(min-width: 52rem)');
      var cierra = function (e) { if (e.matches && abierto()) mostrar(false); };
      if (mq.addEventListener) mq.addEventListener('change', cierra); else if (mq.addListener) mq.addListener(cierra);
    }
    window.addEventListener('resize', function () { if (abierto() && window.innerWidth >= 832) mostrar(false); });
  }

  // ---------- Carrusel de «Lo que encontrarás»: solo es una parada de tabulación si hace scroll horizontal ----------
  var carrusel = d.querySelector('.tarjetas[tabindex]');
  if (carrusel && window.matchMedia) {
    var movil = window.matchMedia('(max-width: 699px)');
    var ajustar = function () { if (movil.matches) carrusel.setAttribute('tabindex', '0'); else carrusel.removeAttribute('tabindex'); };
    ajustar();
    if (movil.addEventListener) movil.addEventListener('change', ajustar); else if (movil.addListener) movil.addListener(ajustar);
    window.addEventListener('resize', ajustar);
  }

  // ---------- Portada: fundido de entrada si la foto aún no ha cargado ----------
  var foto = d.querySelector('.portada__foto img');
  if (foto && !foto.complete) {
    foto.classList.add('fundido-pendiente');
    var listo = function () { foto.classList.remove('fundido-pendiente'); };
    foto.addEventListener('load', listo);
    foto.addEventListener('error', listo);
  }

  // ---------- Aparición suave de las secciones ----------
  var els = d.querySelectorAll('.revelar');
  if (els.length && 'IntersectionObserver' in window && !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var el = e.target;
        if (e.isIntersecting) { el.classList.remove('revelar--oculto'); io.unobserve(el); }
        else if (e.boundingClientRect.top > 0) el.classList.add('revelar--oculto');
        else io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    [].forEach.call(els, function (el) { io.observe(el); });
  }
})();
