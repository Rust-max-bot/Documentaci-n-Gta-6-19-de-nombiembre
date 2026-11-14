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
  // Ventas del arranque (tarea 7.10, pedida por Bruno el 2026-11-14): copias en los primeros días
  // o semanas, nunca ventas de toda la vida. Las buscó Claude el 2026-11-14; cada una dice cuántos
  // días son y quién dio la cifra (la empresa, o un medio que cita a la empresa). mas: true = la
  // fuente dice "más de". tiendas: true = copias enviadas a tiendas, no compradas por jugadores.
  ventas: [
    { juego: "GTA V", anio: 2013, copias: 11210000, dias: 1, plazo: "en 24 horas",
      fuente: "Guinness World Records",
      url: "https://www.guinnessworldrecords.com/news/2013/10/confirmed-grand-theft--auto-breaks-six-sales-world-records-51900" },
    { juego: "Pokémon Escarlata y Púrpura", anio: 2022, copias: 10000000, mas: true, dias: 3, plazo: "en 3 días",
      fuente: "Nintendo, citado por CNBC",
      url: "https://www.cnbc.com/2022/11/24/nintendo-sets-sales-record-with-pokmon-scarlet-and-pokmon-violet.html" },
    { juego: "Zelda: Tears of the Kingdom", anio: 2023, copias: 10000000, dias: 3, plazo: "en 3 días",
      fuente: "Nintendo, citado por Axios",
      url: "https://www.axios.com/2023/05/17/zelda-tears-of-the-kingdom-sales" },
    { juego: "Black Myth: Wukong", anio: 2024, copias: 10000000, mas: true, dias: 3, plazo: "en 3 días",
      fuente: "Game Science, citado por Gematsu",
      url: "https://www.gematsu.com/2024/08/black-myth-wukong-sales-top-10-million" },
    { juego: "Monster Hunter Wilds", anio: 2025, copias: 8000000, mas: true, dias: 3, plazo: "en 3 días",
      fuente: "Capcom",
      url: "https://www.capcom.co.jp/ir/english/news/html/e250304.html" },
    { juego: "Battlefield 6", anio: 2025, copias: 7000000, mas: true, dias: 3, plazo: "en 3 días",
      fuente: "EA, citado por VGC",
      url: "https://www.videogameschronicle.com/news/battlefield-6-has-become-the-biggest-launch-in-series-history-selling-7-million-in-three-days" },
    { juego: "Zelda: Ocarina of Time (remake)", anio: 2026, copias: 5200000, dias: 4, plazo: "en 4 días",
      nota: "salió el 5 nov 2026, el mismo mes que GTA 6",
      fuente: "Nintendo, citado por VGC",
      url: "https://www.videogameschronicle.com/news/the-legend-of-zelda-ocarina-of-time-remake-sold-5-2-million-in-its-first-four-days-nintendo-says/" },
    { juego: "Resident Evil Requiem", anio: 2026, copias: 5000000, dias: 5, plazo: "en 5 días",
      fuente: "Capcom, citado por Forbes",
      url: "https://www.forbes.com/sites/paultassi/2026/03/04/resident-evil-requiem-sells-5-million-copies-ties-all-time-high-metacritic-score/" },
    { juego: "Skyrim", anio: 2011, copias: 7000000, dias: 7, plazo: "en su primera semana", tiendas: true,
      fuente: "Bethesda, citado por Gematsu",
      url: "https://gematsu.com/2011/11/the-elder-scrolls-v-skyrim-ships-seven-million" },
    { juego: "Red Dead Redemption 2", anio: 2018, copias: 17000000, dias: 8, plazo: "en 8 días", tiendas: true,
      fuente: "Take-Two, citado por CNBC",
      url: "https://www.cnbc.com/2018/11/08/take-two-ceo-red-dead-redemption-2-has-already-outpaced-first-game.html" },
    { juego: "Cyberpunk 2077", anio: 2020, copias: 13000000, mas: true, dias: 10, plazo: "en 10 días",
      nota: "ya restadas las devoluciones",
      fuente: "CD Projekt, citado por Reuters",
      url: "https://finance.yahoo.com/news/polands-cd-projekt-sells-over-070730762.html" },
    { juego: "Hogwarts Legacy", anio: 2023, copias: 12000000, mas: true, dias: 14, plazo: "en 2 semanas",
      fuente: "Warner Bros. Games",
      url: "https://www.businesswire.com/news/home/20230223005895/en" },
    { juego: "Elden Ring", anio: 2022, copias: 12000000, dias: 18, plazo: "en 18 días",
      fuente: "Bandai Namco",
      url: "https://www.bandainamcoent.com/news/elden-ring-12-million-unit-sold-worldwide" }
  ],
  // Copias de GTA VI en sus primeros días: null hasta que Take-Two publique la cifra oficial.
  // Entonces se escribe aquí a mano, con el mismo formato que las de arriba (sin "juego" ni
  // "anio"), por ejemplo: { copias: ..., mas: true, dias: 3, plazo: "en 3 días", fuente: "Take-Two", url: "..." }.
  // Al escribirla, "Próximamente" marca solo "Ventas oficiales de GTA 6" como hecha.
  gta6: null,
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
