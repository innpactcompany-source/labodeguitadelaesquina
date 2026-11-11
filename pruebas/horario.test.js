// Ejecutar con: node pruebas/horario.test.js
const H = require('../web/assets/js/horario.js');
let fallos = 0, total = 0;
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
function prueba(nombre, dia, hh, mm, abierto, extra) {
  total++;
  const e = H.estadoEn(dia, hh * 60 + mm);
  let ok = e.abierto === abierto;
  if (ok && extra && extra.cierra) ok = H.hora(e.cierra) === extra.cierra;
  if (ok && extra && extra.abre) ok = H.hora(e.abre) === extra.abre && e.abreHoy === extra.hoy;
  if (!ok) { fallos++; console.log('FALLO', nombre, DIAS[dia], `${hh}:${String(mm).padStart(2, '0')}`, JSON.stringify(e)); }
}
// Casos del encargo
prueba('sábado 1:30 abierto (turno del viernes)', 6, 1, 30, true, { cierra: '2:00' });
prueba('domingo 1:30 abierto (turno del sábado)', 0, 1, 30, true, { cierra: '2:00' });
prueba('viernes 1:30 cerrado (jueves cierra a las 24:00)', 5, 1, 30, false, { abre: '8:00', hoy: true });
prueba('lunes 0:30 cerrado', 1, 0, 30, false, { abre: '8:00', hoy: true });
// Bordes
for (const d of [1, 2, 3, 4, 5, 6]) {
  prueba('7:59', d, 7, 59, false, { abre: '8:00', hoy: true });
  prueba('8:00', d, 8, 0, true);
  prueba('23:59', d, 23, 59, true, { cierra: d === 5 || d === 6 ? '2:00' : '24:00' });
}
for (const d of [6, 0]) { prueba('2:00 cerrado tras turno de madrugada', d, 2, 0, false); prueba('1:59 abierto', d, 1, 59, true); }
for (const d of [1, 2, 3, 4, 5]) prueba('2:00 entre semana cerrado', d, 2, 0, false);
prueba('domingo 11:59', 0, 11, 59, false, { abre: '12:00', hoy: true });
prueba('domingo 12:00', 0, 12, 0, true, { cierra: '24:00' });
prueba('domingo 23:59', 0, 23, 59, true, { cierra: '24:00' });
prueba('lunes 0:00 cerrado (domingo cierra a las 24:00)', 1, 0, 0, false);

// Conversión de hora real a Europe/Madrid (invierno CET = UTC+1, verano CEST = UTC+2)
function conFecha(nombre, iso, dia, abierto) {
  total++;
  const e = H.estadoAhora(new Date(iso));
  if (e.abierto !== abierto) { fallos++; console.log('FALLO fecha', nombre, iso, JSON.stringify(e)); }
}
conFecha('sáb 2026-11-07 01:30 CET abierto', '2026-11-07T00:30:00Z', 6, true);
conFecha('dom 2026-11-08 01:30 CET abierto', '2026-11-08T00:30:00Z', 0, true);
conFecha('vie 2026-11-06 01:30 CET cerrado', '2026-11-06T00:30:00Z', 5, false);
conFecha('lun 2026-11-09 00:30 CET cerrado', '2026-11-08T23:30:00Z', 1, false);
conFecha('sáb 2026-07-04 01:30 CEST abierto', '2026-07-03T23:30:00Z', 6, true);
conFecha('lun 2026-07-06 00:30 CEST cerrado', '2026-07-05T22:30:00Z', 1, false);
conFecha('lun 2026-07-06 07:59 CEST cerrado', '2026-07-06T05:59:00Z', 1, false);
conFecha('lun 2026-07-06 08:00 CEST abierto', '2026-07-06T06:00:00Z', 1, true);
// Textos
total += 2;
if (H.texto(H.estadoEn(1, 12 * 60)) !== 'Abierto ahora · cierra a las 24:00') { fallos++; console.log('FALLO texto abierto', H.texto(H.estadoEn(1, 720))); }
if (H.texto(H.estadoEn(0, 11 * 60)) !== 'Cerrado · abre hoy a las 12:00') { fallos++; console.log('FALLO texto cerrado', H.texto(H.estadoEn(0, 660))); }

// ---------- Casos pedidos, con instantes reales y hora de Europe/Madrid ----------
const fmtMadrid = d => new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', weekday: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(d);
function enMadrid(fechaISO, hora) { // fecha 'AAAA-MM-DD', hora 'HH:MM' de Madrid (fuera de los días de cambio de hora)
  const [y, m, d] = fechaISO.split('-').map(Number), [hh, mm] = hora.split(':').map(Number);
  for (const off of [1, 2]) {
    const t = new Date(Date.UTC(y, m - 1, d, hh - off, mm));
    const p = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', day: '2-digit' }).formatToParts(t);
    const v = Object.fromEntries(p.map(x => [x.type, x.value]));
    if (Number(v.day) === d && Number(v.hour) % 24 === hh && Number(v.minute) === mm) return t;
  }
  throw new Error('hora inexistente ' + fechaISO + ' ' + hora);
}
const informe = [];
function caso(nombre, instante, textoEsperado) {
  total++;
  const e = H.estadoAhora(instante), t = H.texto(e);
  const ok = t === textoEsperado;
  if (!ok) fallos++;
  informe.push(`${ok ? 'OK   ' : 'FALLA'} ${nombre} [${fmtMadrid(instante)}] -> "${t}"${ok ? '' : ' (esperado "' + textoEsperado + '")'}`);
}
const ABRE8 = 'Cerrado · abre hoy a las 8:00', ABRE12 = 'Cerrado · abre hoy a las 12:00';
const lun = '2026-11-02', sab = '2026-11-07', dom = '2026-11-08', lun2 = '2026-11-09';
caso('lunes 07:59', enMadrid(lun, '07:59'), ABRE8);
caso('lunes 08:00', enMadrid(lun, '08:00'), 'Abierto ahora · cierra a las 24:00');
caso('lunes 23:59', enMadrid(lun, '23:59'), 'Abierto ahora · cierra a las 24:00');
caso('sábado 00:30 (noche del viernes)', enMadrid(sab, '00:30'), 'Abierto ahora · cierra a las 2:00');
caso('sábado 01:59', enMadrid(sab, '01:59'), 'Abierto ahora · cierra a las 2:00');
caso('sábado 02:00', enMadrid(sab, '02:00'), ABRE8);
caso('domingo 00:30 (noche del sábado)', enMadrid(dom, '00:30'), 'Abierto ahora · cierra a las 2:00');
caso('domingo 01:59', enMadrid(dom, '01:59'), 'Abierto ahora · cierra a las 2:00');
for (const h of ['02:00', '08:00', '11:59']) caso('domingo ' + h, enMadrid(dom, h), ABRE12);
caso('domingo 12:00', enMadrid(dom, '12:00'), 'Abierto ahora · cierra a las 24:00');
caso('lunes 00:30 (noche del domingo, cierra a las 24:00)', enMadrid(lun2, '00:30'), ABRE8);
// Cambios de hora (2026: 29 de marzo y 25 de octubre, ambos domingo)
caso('domingo 25 oct, 2:30 la primera vez (CEST)', new Date('2026-10-25T00:30:00Z'), ABRE12);
caso('domingo 25 oct, 2:30 la segunda vez (CET)', new Date('2026-10-25T01:30:00Z'), ABRE12);
caso('domingo 25 oct, 1:30 (CEST, aún turno del sábado)', new Date('2026-10-24T23:30:00Z'), 'Abierto ahora · cierra a las 2:00');
caso('domingo 29 mar, 1:30 (CET, aún turno del sábado)', new Date('2026-03-29T00:30:00Z'), 'Abierto ahora · cierra a las 2:00');
caso('domingo 29 mar, 2:30 no existe: 01:30 UTC es 3:30 CEST', new Date('2026-03-29T01:30:00Z'), ABRE12);
caso('verano: sábado 4 jul, 01:30 CEST', enMadrid('2026-07-04', '01:30'), 'Abierto ahora · cierra a las 2:00');
caso('verano: lunes 6 jul, 07:59 CEST', enMadrid('2026-07-06', '07:59'), ABRE8);
// Textos en inglés: horas en formato inglés (midnight, 12 noon, 8 am, 2 am)
function ingles(nombre, dia, hh, mm, esperado) {
  total++;
  const r = H.texto(H.estadoEn(dia, hh * 60 + mm), 'en');
  if (r !== esperado) { fallos++; console.log('FALLO inglés', nombre, JSON.stringify(r), '≠', JSON.stringify(esperado)); }
}
ingles('lunes 10:00', 1, 10, 0, 'Open now · closes at midnight');
ingles('viernes 23:00', 5, 23, 0, 'Open now · closes at 2 am');
ingles('sábado 1:30', 6, 1, 30, 'Open now · closes at 2 am');
ingles('lunes 7:00', 1, 7, 0, 'Closed · opens today at 8 am');
ingles('domingo 10:00', 0, 10, 0, 'Closed · opens today at 12 noon');
ingles('sábado 3:00', 6, 3, 0, 'Closed · opens today at 8 am');
ingles('lunes 0:30', 1, 0, 30, 'Closed · opens today at 8 am');
total++; if (['0', '480', '720', '1110', '1440', '1560'].map(m => H.horaIngles(+m)).join('|') !== 'midnight|8 am|12 noon|6:30 pm|midnight|2 am') { fallos++; console.log('FALLO horaIngles'); }
console.log(informe.join(String.fromCharCode(10)));
console.log('Zona horaria del proceso: ' + (process.env.TZ || Intl.DateTimeFormat().resolvedOptions().timeZone));
console.log(`${total - fallos}/${total} pruebas correctas`);
process.exit(fallos ? 1 : 0);
