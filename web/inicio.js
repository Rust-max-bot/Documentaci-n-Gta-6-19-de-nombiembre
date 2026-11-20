/* Lo que tiene que estar listo antes del primer dibujo (tarea 9.4, Bruno, 2026-11-20).
   Se carga en el <head>, antes que todo lo demás: es chico y baja junto con estilos.css, que de
   todos modos frena el dibujo hasta llegar. Sin esto, la página se veía unos segundos con el
   estilo y el cielo de siempre (Miami 1986, atardecer) hasta que llegaba app.js y cambiaba de golpe.

   1. El estilo guardado ("Miami 1986" o "Miami 2026"), que se elige con el botón de la página.
   2. Día, atardecer o noche según la hora real de Miami (tarea 4.1). La salida y la puesta del
      sol se calculan para cada día con la fórmula aproximada del almanaque náutico (error de un
      par de minutos), así sirve todo el año y no depende del horario de verano. Atardecer: desde
      1 h antes de la puesta hasta 30 min después, y la media hora alrededor de la salida.
      app.js usa la misma función (window.INICIO.horaDeMiami) para revisar cada minuto. */
(function () {
  var raiz = document.documentElement;
  try { var t = localStorage.getItem("tema"); if (t === "ochenta" || t === "actual") raiz.dataset.tema = t; } catch (e) { /* sin almacenamiento */ }

  var LAT = 25.7617, LON = -80.1918, RAD = Math.PI / 180;
  // Hora UTC (en horas, 0-24) a la que sale (sale=true) o se pone el sol en Miami ese día.
  function sol(fecha, sale) {
    var n = Math.floor((fecha - Date.UTC(fecha.getUTCFullYear(), 0, 0)) / 86400000);
    var t = n + ((sale ? 6 : 18) - LON / 15) / 24, M = 0.9856 * t - 3.289;
    var L = (M + 1.916 * Math.sin(M * RAD) + 0.020 * Math.sin(2 * M * RAD) + 282.634 + 360) % 360;
    var RA = (Math.atan(0.91764 * Math.tan(L * RAD)) / RAD + 360) % 360;
    RA = (RA + Math.floor(L / 90) * 90 - Math.floor(RA / 90) * 90) / 15;
    var sd = 0.39782 * Math.sin(L * RAD), cd = Math.cos(Math.asin(sd));
    var ch = (Math.cos(90.833 * RAD) - sd * Math.sin(LAT * RAD)) / (cd * Math.cos(LAT * RAD));
    var H = (sale ? 360 - Math.acos(ch) / RAD : Math.acos(ch) / RAD) / 15;
    return ((H + RA - 0.06571 * t - 6.622 - LON / 15) % 24 + 24) % 24;
  }
  function horaDeMiami(ms) {
    // El día de Miami empieza 5 h después que el de UTC: se mira la fecha que hay allí.
    var dia = new Date(ms - 5 * 3600000), base = Date.UTC(dia.getUTCFullYear(), dia.getUTCMonth(), dia.getUTCDate());
    var sale = base + sol(dia, true) * 3600000, pone = base + sol(dia, false) * 3600000;
    if (pone < sale) pone += 86400000;   // en verano la puesta cae después de medianoche UTC
    if (Math.abs(ms - sale) <= 30 * 60000 || (ms >= pone - 3600000 && ms <= pone + 30 * 60000)) return "atardecer";
    return ms > sale && ms < pone ? "dia" : "noche";
  }
  // Las horas de prueba de app.js ("?probar-hora-cero", "?probar-fecha=..."), para que el cielo
  // del primer dibujo sea el mismo que pondrá app.js después.
  var ms = Date.now();
  if (/[?&]probar-hora-cero\b/.test(location.search)) ms = Date.UTC(2026, 10, 19, 3, 0) - 5000;
  var prueba = /[?&]probar-fecha=([\dT:Z-]+)/.exec(location.search);
  if (prueba && !isNaN(Date.parse(prueba[1]))) ms = Date.parse(prueba[1]);
  raiz.dataset.hora = horaDeMiami(ms);

  window.INICIO = { horaDeMiami: horaDeMiami };
})();
