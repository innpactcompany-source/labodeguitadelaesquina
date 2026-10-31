(function (raiz, fabrica) {
  var api = fabrica();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { raiz.Horario = api; if (typeof document !== 'undefined') api.iniciar(document); }
})(typeof self !== 'undefined' ? self : this, function () {
  // Turnos por día (0 = domingo): [apertura, cierre] en minutos. Un cierre por encima de 1440 cae en la madrugada siguiente.
  var TURNOS = [
    [720, 1440], [480, 1440], [480, 1440], [480, 1440], [480, 1440], [480, 1560], [480, 1560]
  ];
  var DIAS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  function hora(min) {
    if (min === 1440) return '24:00';
    var m = min % 60;
    return (Math.floor(min / 60) % 24) + ':' + (m < 10 ? '0' : '') + m;
  }

  function estadoEn(dia, min) {
    var ayer = (dia + 6) % 7;
    var t = TURNOS[ayer];
    if (t[1] > 1440 && min < t[1] - 1440) return { abierto: true, dia: ayer, cierra: t[1] - 1440 };
    var h = TURNOS[dia];
    if (min >= h[0] && min < h[1]) return { abierto: true, dia: dia, cierra: h[1] };
    if (min < h[0]) return { abierto: false, dia: dia, abre: h[0], abreHoy: true };
    return { abierto: false, dia: dia, abre: TURNOS[(dia + 1) % 7][0], abreHoy: false };
  }

  function madrid(fecha) {
    var partes = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(fecha);
    var v = {};
    partes.forEach(function (p) { v[p.type] = p.value; });
    return { dia: DIAS[v.weekday], min: (Number(v.hour) % 24) * 60 + Number(v.minute) };
  }

  function estadoAhora(fecha) {
    var m = madrid(fecha || new Date());
    return estadoEn(m.dia, m.min);
  }

  function texto(e) {
    return e.abierto
      ? 'Abierto ahora · cierra a las ' + hora(e.cierra)
      : 'Cerrado · abre ' + (e.abreHoy ? 'hoy' : 'mañana') + ' a las ' + hora(e.abre);
  }

  function iniciar(doc) {
    function pintar() {
      var e;
      try { e = estadoAhora(new Date()); } catch (err) { return; }
      [].forEach.call(doc.querySelectorAll('[data-estado-horario]'), function (el) {
        var t = el.querySelector('[data-estado-texto]');
        if (t) t.textContent = texto(e);
        el.classList.toggle('estado--abierto', e.abierto);
        el.hidden = false;
      });
      [].forEach.call(doc.querySelectorAll('[data-dias]'), function (fila) {
        var hoy = (' ' + fila.getAttribute('data-dias') + ' ').indexOf(' ' + e.dia + ' ') > -1;
        fila.classList.toggle('hoy', hoy);
        if (hoy) fila.setAttribute('aria-current', 'date'); else fila.removeAttribute('aria-current');
        var th = fila.querySelector('th');
        var marca = th && th.querySelector('.ovalo');
        if (hoy && th && !marca) {
          var s = doc.createElement('span');
          s.className = 'ovalo';
          s.textContent = 'Hoy';
          th.appendChild(s);
        } else if (!hoy && marca) th.removeChild(marca);
      });
    }
    pintar();
    setInterval(pintar, 60000);
  }

  return { TURNOS: TURNOS, hora: hora, estadoEn: estadoEn, estadoAhora: estadoAhora, texto: texto, iniciar: iniciar };
});
