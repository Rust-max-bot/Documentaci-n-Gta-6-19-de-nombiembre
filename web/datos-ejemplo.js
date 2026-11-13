/* DATOS DE EJEMPLO — todo lo que hay aquí es inventado.
   Sirve solo para probar el diseño antes de tener datos reales.
   Cuando exista web/datos.js (creado por el recolector), la página usa ese y ignora este.
   El formato de este archivo es el mismo que debe producir el recolector. */
(function () {
  var semilla = 19112026;
  function azar() { semilla = (semilla * 1664525 + 1013904223) % 4294967296; return semilla / 4294967296; }

  var MIN = 60000, HORA = 3600000;
  var inicio = Date.UTC(2026, 10, 18, 3, 0);      // 18 nov 00:00 en Santiago
  var salida = Date.UTC(2026, 10, 19, 3, 0);      // 19 nov 00:00 en Santiago
  var huecosTwitch = { 37: 1, 38: 1, 91: 1 };
  var huecosTrends = { 60: 1, 61: 1, 62: 1 };
  var canales = ["canal_ejemplo_1", "canal_ejemplo_2", "canal_ejemplo_3"];
  var videos = [
    { titulo: "Video de ejemplo: primeras horas", canal: "canal_video_1", base: 900000, ritmo: 210000 },
    { titulo: "Video de ejemplo: el mapa completo", canal: "canal_video_2", base: 400000, ritmo: 150000 },
    { titulo: "Video de ejemplo: reacción al inicio", canal: "canal_video_3", base: 250000, ritmo: 96000 },
    { titulo: "Video de ejemplo: fallos graciosos", canal: "canal_video_4", base: 60000, ritmo: 71000 },
    { titulo: "Video de ejemplo: comparación gráfica", canal: "canal_video_5", base: 120000, ritmo: 38000 }
  ];
  videos.forEach(function (v) { v.serie = []; });

  var mediciones = [];
  for (var i = 0; i < 144; i++) {
    var t = inicio + i * 30 * MIN + Math.floor(azar() * 9) * MIN;   // GitHub se atrasa unos minutos
    var h = (t - salida) / HORA;
    var curva = h < 0
      ? 80000 + 300000 * Math.exp(h / 5)
      : 380000 + 1650000 * Math.exp(-Math.pow(h - 1.5, 2) / 16) + 620000 * Math.exp(-Math.pow(h - 20, 2) / 30) + 300000 * Math.exp(-Math.pow(h - 44, 2) / 30);
    var espectadores = Math.round(curva * (0.94 + azar() * 0.12));
    var interes = h < 0
      ? 12 + 30 * Math.exp(h / 7)
      : 30 + 70 * Math.exp(-Math.pow(h - 2, 2) / 40) + 30 * Math.exp(-Math.pow(h - 21, 2) / 50);
    interes = Math.max(0, Math.min(100, Math.round(interes + azar() * 5 - 2)));

    var m = { t: new Date(t).toISOString() };
    m.twitch = huecosTwitch[i]
      ? { error: "Twitch no respondió" }
      : { espectadores: espectadores, canales: [
          { nombre: canales[(h > 6 && h < 16) ? 1 : 0], espectadores: Math.round(espectadores * 0.17) },
          { nombre: canales[(h > 6 && h < 16) ? 0 : 1], espectadores: Math.round(espectadores * 0.11) },
          { nombre: canales[2], espectadores: Math.round(espectadores * 0.06) }
        ] };
    m.trends = huecosTrends[i] ? { error: "Google bloqueó la consulta" } : { interes: interes };
    m.servidores = {
      rockstar: (h >= 0.4 && h <= 3.2) ? "problemas" : "ok",
      playstation: (h >= 0.9 && h <= 1.9) ? "problemas" : "ok",
      xbox: i === 70 ? null : "ok"
    };
    mediciones.push(m);

    videos.forEach(function (v) {
      var empuje = h < 0 ? 0.15 : 1 / (1 + h / 30);
      v.base += Math.round(v.ritmo * empuje * (0.7 + azar() * 0.6));
      v.serie.push({ t: m.t, visitas: v.base });
    });
  }
  videos.forEach(function (v) { delete v.base; delete v.ritmo; });

  var medios = ["Medio de ejemplo A", "Medio de ejemplo B", "Medio de ejemplo C"];
  var noticias = [];
  for (var n = 0; n < 6; n++) {
    noticias.push({
      t: new Date(salida + (n * 7 - 5) * HORA).toISOString(),
      titulo: "Titular de ejemplo número " + (n + 1) + " sobre el lanzamiento",
      medio: medios[n % 3],
      url: ""
    });
  }

  // Publicaciones de Reddit inventadas: muchas al salir el juego y cada vez menos después.
  var publicaciones = [];
  for (var r = 0; r < 140; r++) {
    var tr = salida - 6 * HORA + azar() * azar() * 54 * HORA;
    publicaciones.push({
      t: new Date(tr).toISOString(),
      titulo: "Publicación de ejemplo número " + (r + 1) + " en el foro",
      autor: "/u/usuario_de_ejemplo",
      url: ""
    });
  }
  publicaciones.sort(function (a, b) { return Date.parse(a.t) - Date.parse(b.t); });

  window.DATOS_EJEMPLO = {
    ejemplo: true,
    generado: new Date(inicio + 72 * HORA).toISOString(),
    mediciones: mediciones,
    youtube: videos,
    noticias: noticias,
    reddit: { comunidad: "r/GTA6", publicaciones: publicaciones, mediciones: [] },
    eventos: [
      { hora: "2026-11-18 08:00", texto: "Evento de ejemplo: el juego sale en los primeros países" },
      { hora: "2026-11-19 00:00", texto: "Evento de ejemplo: lanzamiento en Chile" },
      { hora: "2026-11-19 09:30", texto: "Evento de ejemplo: algo divertido que anotaste a mano" }
    ]
  };
})();
