/* OTROS LANZAMIENTOS (tarea 7.9, idea 7, pedida por Bruno el 2026-11-14)
   Datos de otros juegos para comparar con GTA 6. No los mide el recolector: los buscó Claude
   el 2026-11-14 y cada uno lleva su fuente. Solo entran datos con fuente que se pueda abrir.
   Si una fuente dice "cerca de", el dato lleva aprox: true y la página lo muestra así.
   Las cifras de GTA 6 (ventas, jugadores) se agregan a mano cuando la empresa las publique. */
window.LANZAMIENTOS = {
  // Máximo de espectadores a la vez en Twitch el día de la salida de cada juego.
  twitch: [
    {
      juego: "Hogwarts Legacy", cuando: "salida, feb 2023", valor: 1270000, aprox: true,
      fuente: "Streams Charts",
      url: "https://streamscharts.com/news/magic-over-how-hogwarts-legacys-popularity-changed-twitch-month-after-games-release"
    },
    {
      juego: "Cyberpunk 2077", cuando: "10 dic 2020", valor: 1143965,
      fuente: "Streams Charts",
      url: "https://streamscharts.com/news/live-cyberpunk-2077-release-statistics"
    }
  ],
  // Otros récords de la saga, como texto.
  hechos: [
    {
      titulo: "GTA V, primer día", cuando: "17 sep 2013", valor: "Más de 800 millones de dólares",
      detalle: "en ventas en todo el mundo (sin contar Japón ni Brasil).",
      fuente: "Take-Two, comunicado del 18 sep 2013",
      url: "https://ir.take2games.com/static-files/98875705-9774-439f-9a69-4b490ae99d79"
    },
    {
      titulo: "GTA V, primeros 3 días", cuando: "17 al 19 sep 2013", valor: "Más de 1.000 millones de dólares",
      detalle: "en ventas en todo el mundo.",
      fuente: "Take-Two, citado por Gematsu el 20 sep 2013",
      url: "https://gematsu.com/2013/09/grand-theft-auto-v-sales-surpass-1-billion-in-first-three-days"
    },
    {
      titulo: "GTA VI, tráiler 1, primeras 24 horas", cuando: "5 dic 2023", valor: "90,4 millones de visitas",
      detalle: "récord de video no musical en YouTube. YouTube habla de \"más de 93 millones\".",
      fuente: "Guinness World Records",
      url: "https://www.guinnessworldrecords.com/world-records/758375-most-viewed-youtube-video-in-24-hours-non-music"
    }
  ]
};
