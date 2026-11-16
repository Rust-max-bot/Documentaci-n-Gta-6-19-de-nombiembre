/* Página del recuerdo. Lee window.DATOS (reales) o window.DATOS_EJEMPLO y dibuja todo.
   No usa librerías externas. Las horas llegan en UTC y aquí se convierten a Santiago. */
(function () {
  "use strict";

  var ZONA = "America/Santiago";
  var SALIDA = Date.UTC(2026, 10, 19, 3, 0);   // 19 nov 2026, 00:00 en Santiago
  var D = window.DATOS || window.DATOS_EJEMPLO || { mediciones: [], youtube: [], noticias: [], reddit: {}, eventos: [] };
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- Microinteracciones (pedido de Bruno, 2026-11-15; probadas antes en una vista previa) ----------
     Una "gota" que se desliza con un resorte al botón elegido, flechas para avanzar, y los
     controles que se tocan no cambian de lugar en la pantalla. Los estilos, al final de estilos.css. */
  var QUIETO = window.matchMedia("(prefers-reduced-motion: reduce)");
  document.addEventListener("touchstart", function () {}, { passive: true });   // sin esto, :active no funciona en iPhone
  // Reinicia una animación CSS que se pone con una clase.
  function repetir(el, clase, ms) {
    el.classList.remove(clase); void el.offsetWidth; el.classList.add(clase);
    clearTimeout(el["_t" + clase]);
    el["_t" + clase] = setTimeout(function () { el.classList.remove(clase); }, ms);
  }
  var SVG_FLECHA = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function flechaHTML(lado, etiqueta, extra) {
    return '<button type="button" class="flecha flecha-' + lado + '" aria-label="' + etiqueta + '" title="' + etiqueta + '"' + (extra || "") + ">" + SVG_FLECHA + "</button>";
  }
  /* Gota en un grupo de botones: "clase" es su estilo (indicador de la portada o gota rosada) y
     "activo" dice cuál está elegido. Si app.js redibuja los botones, la gota vuelve a ponerse
     desde donde estaba, así se desliza y no aparece de golpe. Con conFlechas, usa las flechas
     del .selector que lo envuelve y mantiene el elegido a la vista dentro de la tira. */
  function gota(caja, clase, activo, conFlechas) {
    if (!caja) return;
    var g = document.createElement("span"), ultimo = null;
    g.className = clase; g.setAttribute("aria-hidden", "true");
    var marco = conFlechas ? caja.parentNode : null;
    var antes = marco && marco.querySelector(".flecha-izq"), despues = marco && marco.querySelector(".flecha-der");
    function botones() { return [].slice.call(caja.querySelectorAll("button")); }
    function actualizar(saltar) {
      if (g.parentNode !== caja) { caja.insertBefore(g, caja.firstChild); void g.offsetWidth; }
      var b = caja.querySelector(activo);
      if (conFlechas) caja.classList.toggle("desliza", caja.scrollWidth > caja.clientWidth + 1);
      if (!b) { g.classList.remove("listo"); ultimo = null; }
      else {
        g.style.setProperty("--x", b.offsetLeft + "px"); g.style.setProperty("--y", b.offsetTop + "px");
        g.style.setProperty("--w", b.offsetWidth + "px"); g.style.setProperty("--h", b.offsetHeight + "px");
        if (saltar && ultimo !== null && ultimo !== b.textContent && !QUIETO.matches) repetir(g, "salto", 520);
        ultimo = b.textContent;
        if (!g.classList.contains("listo")) requestAnimationFrame(function () { g.classList.add("listo"); });
        if (conFlechas && caja.scrollWidth > caja.clientWidth) {   // solo se mueve la tira, nunca la página
          var izq = b.offsetLeft - 8, der = b.offsetLeft + b.offsetWidth + 8 - caja.clientWidth, modo = QUIETO.matches ? "auto" : "smooth";
          if (izq < caja.scrollLeft) caja.scrollTo({ left: izq, behavior: modo });
          else if (der > caja.scrollLeft) caja.scrollTo({ left: der, behavior: modo });
        }
      }
      if (antes) { var l = botones(), i = l.indexOf(b); antes.disabled = i <= 0; despues.disabled = i < 0 || i >= l.length - 1; }
    }
    function ir(paso) { var l = botones(), i = l.indexOf(caja.querySelector(activo)); if (l[i + paso]) l[i + paso].click(); }
    if (antes) { antes.addEventListener("click", function () { ir(-1); }); despues.addEventListener("click", function () { ir(1); }); }
    new MutationObserver(function (cambios) {
      if (cambios.every(function (c) { return c.target === g; })) return;   // cambios de la propia gota
      actualizar(true);
    }).observe(caja, { childList: true, subtree: true, attributes: true, attributeFilter: ["aria-pressed", "class"] });
    if ("ResizeObserver" in window) new ResizeObserver(function () { actualizar(false); }).observe(caja);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { actualizar(false); });
    actualizar(false);
  }
  /* Sin saltos: el selector que se tocó queda en el mismo lugar de la pantalla aunque cambie lo
     que hay arriba (por ejemplo, otra página de titulares más alta o más baja). En las páginas se
     sigue corrigiendo 1,5 s porque los titulares de otros días llegan un momento después. Si la
     persona mueve la página (rueda, dedo, teclado o barra de desplazamiento), se deja de corregir. */
  (function () {
    var ancla = null, yPropia = null;
    function corregir() {
      if (!ancla) return;
      var d = ancla.el.getBoundingClientRect().top - ancla.top;
      if (Math.abs(d) > 0.5) { yPropia = window.scrollY + d; window.scrollTo({ top: yPropia, behavior: "instant" }); }
      if (performance.now() < ancla.hasta) requestAnimationFrame(corregir); else ancla = null;
    }
    function soltar() { ancla = null; }
    ["wheel", "touchmove", "keydown", "pointerdown"].forEach(function (t) { window.addEventListener(t, soltar, { passive: true }); });
    window.addEventListener("scroll", function () { if (ancla && yPropia !== null && Math.abs(window.scrollY - yPropia) > 2) ancla = null; }, { passive: true });
    document.addEventListener("click", function (e) {
      if (!e.isTrusted) return;                      // los clics que hace el propio código no cuentan
      ancla = null;
      var c = e.target.closest && e.target.closest(".selector, .paginas");
      if (c) ancla = { el: c, top: c.getBoundingClientRect().top, hasta: performance.now() + (c.classList.contains("paginas") ? 1500 : 0) };
    }, true);
    document.addEventListener("click", function (e) { if (e.isTrusted && ancla) corregir(); });
  })();

  /* ---------- Datos por días (formato 2, pedido de Bruno, 2026-11-14) ----------
     datos.js trae de los titulares y de Reddit solo sus horas (en segundos), y las series de
     visitas de los videos en forma corta ([segundos, visitas]). Aquí se dejan como antes para el
     resto de la página. Los titulares completos de cada día se cargan aparte, solo cuando hacen
     falta (ver "Días cargados a pedido"). Los datos de ejemplo vienen completos. */
  function isoDe(seg) { return new Date(seg * 1000).toISOString(); }
  function diaUTC(seg) { return isoDe(seg).slice(0, 10); }
  if (D.formato === 2) {
    D.noticias = (D.noticias_t || []).map(function (seg, i) { return { t: isoDe(seg), i: i }; });
    D.reddit = D.reddit || {};
    D.reddit.publicaciones = (D.reddit.publicaciones_t || []).map(function (seg) { return { t: isoDe(seg) }; });
    [D.youtube, D.youtube_es, D.trailers].forEach(function (lista) {
      (lista || []).forEach(function (v) {
        v.serie = (v.serie || []).map(function (p) { return Array.isArray(p) ? { t: isoDe(p[0]), visitas: p[1] } : p; });
      });
    });
  }

  /* ---------- Días cargados a pedido ----------
     Cada web/dias/AAAA-MM-DD.js (día UTC) llama a window.DATOS_DIA con los titulares y las
     publicaciones de ese día. Se piden con una etiqueta <script> (funciona también abriendo la
     página como archivo en el PC) y con la huella del archivo en la dirección: si el día no
     cambió, el navegador usa el que ya tiene guardado. */
  var DIAS = (function () {
    var cargados = {}, promesas = {}, avisar = {};
    window.DATOS_DIA = function (dia, contenido) {
      cargados[dia] = contenido;
      if (avisar[dia]) avisar[dia](contenido);
    };
    function uno(dia) {
      if (cargados[dia]) return Promise.resolve(cargados[dia]);
      if (!(D.dias || {})[dia]) return Promise.resolve({ noticias: [], reddit: [] });
      if (!promesas[dia]) promesas[dia] = new Promise(function (listo, fallo) {
        var s = document.createElement("script");
        avisar[dia] = listo;
        s.src = "dias/" + dia + ".js?v=" + encodeURIComponent(D.dias[dia]);
        s.onload = function () { if (!cargados[dia]) { delete promesas[dia]; fallo(new Error("día vacío")); } };
        s.onerror = function () { delete promesas[dia]; s.remove(); fallo(new Error("no cargó")); };
        document.head.appendChild(s);
      });
      return promesas[dia];
    }
    return { cargar: function (dias) { return Promise.all(dias.map(uno)); }, cargados: cargados };
  })();

  /* ---------- Fechas y números ---------- */
  var fHora = new Intl.DateTimeFormat("es-CL", { timeZone: ZONA, hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  var fDia = new Intl.DateTimeFormat("es-CL", { timeZone: ZONA, day: "numeric", month: "short" });
  var fPartes = new Intl.DateTimeFormat("en-US", { timeZone: ZONA, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" });
  /* Formato de la hora (pedido de Bruno, 2026-11-16: "08:00" no dejaba claro si era de mañana o
     de noche). Bruno eligió que siga solo lo que usa el dispositivo de quien visita, sin botón:
     el navegador dice si su idioma usa 12 h (a. m. / p. m.) o 24 h. No se guarda ni se envía
     nada. En 24 h, la cuenta regresiva aclara en palabras ("8 de la mañana"). */
  var en12 = false;
  try {
    var ciclo = new Intl.DateTimeFormat(undefined, { hour: "numeric" }).resolvedOptions().hourCycle;
    en12 = ciclo ? (ciclo === "h11" || ciclo === "h12") : /[ap]\.?\s?m/i.test(new Date(2026, 0, 1, 15).toLocaleTimeString());
  } catch (e) { /* navegador muy viejo: 24 h */ }
  // Para probar el otro formato sin cambiar el dispositivo: "?probar-formato=24" o "=12".
  var formatoPrueba = /[?&]probar-formato=(12|24)(?:&|$)/.exec(location.search);
  if (formatoPrueba) en12 = formatoPrueba[1] === "12";
  var fHora12 = new Intl.DateTimeFormat("es-CL", { timeZone: ZONA, hour: "numeric", minute: "2-digit", hourCycle: "h12" });
  function hora(ts) { return (en12 ? fHora12 : fHora).format(new Date(ts)); }
  // "de la mañana", "de la tarde"…: aclara una hora de 24 h en palabras.
  function momento(ts) {
    var h = partes(ts).hour, h12 = h % 12 || 12;
    if (h === 0) return "medianoche";
    if (h === 12) return "mediodía";
    return h12 + (h < 6 ? " de la madrugada" : h < 12 ? " de la mañana" : h < 20 ? " de la tarde" : " de la noche");
  }
  function dia(ts) { return fDia.format(new Date(ts)).replace(".", ""); }
  function partes(ts) { var o = {}; fPartes.formatToParts(new Date(ts)).forEach(function (p) { o[p.type] = +p.value; }); return o; }
  function desfase(ts) { var o = partes(ts); return Date.UTC(o.year, o.month - 1, o.day, o.hour, o.minute) - Math.floor(ts / 60000) * 60000; }
  /* Convierte "2026-11-19 02:10" (hora de Santiago) a un instante exacto */
  function deSantiago(texto) {
    var m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(texto || "");
    if (!m) return NaN;
    var g = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
    return g - desfase(g);
  }
  function num(n) { return Math.round(n).toLocaleString("es-CL"); }
  /* 2.500 -> "2,5 mil"; 12.500 -> "12,5 mil"; 245.600 -> "246 mil": un decimal bajo los
     100 mil, para no redondear a miles enteros (antes 2.500 salía "3 mil"). */
  function compacto(n) {
    if (n >= 1e6) return (n / 1e6).toLocaleString("es-CL", { maximumFractionDigits: 1 }) + " M";
    if (n >= 1e3) return (n / 1e3).toLocaleString("es-CL", { maximumFractionDigits: n < 1e5 ? 1 : 0 }) + " mil";
    return String(Math.round(n));
  }
  /* Separación "redonda" entre las líneas del eje (1, 2, 2,5 o 5 por una potencia de 10),
     para unas 5 líneas: con un máximo de 4.047, las líneas van de 1.000 en 1.000 hasta 5.000. */
  function pasoRedondo(maximo) {
    var crudo = (maximo || 1) / 5, mag = Math.pow(10, Math.floor(Math.log10(crudo)));
    var f = [1, 2, 2.5, 5, 10].filter(function (x) { return x * mag >= crudo; })[0];
    return f * mag;
  }
  /* Texto seguro para poner dentro del HTML, también entre comillas de un atributo (revisión de
     seguridad, 2026-11-14: antes no cambiaba las comillas). */
  function limpio(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  /* Enlace que se abre en otra pestaña del navegador. Solo se arma con direcciones construidas
     aquí (YouTube, Twitch) o que empiezan por http(s); si no, queda el texto sin enlace. */
  function enlace(url, texto) {
    return /^https?:\/\//.test(url || "") ? '<a href="' + limpio(url) + '" target="_blank" rel="noopener noreferrer">' + texto + "</a>" : texto;
  }
  function urlVideo(id) { return /^[\w-]{6,20}$/.test(id || "") ? "https://www.youtube.com/watch?v=" + id : ""; }
  /* Foto de perfil del canal de Twitch (se guarda desde el 13 nov; las mediciones de antes no
     la tienen y muestran un círculo vacío para que los nombres queden alineados). */
  function foto(url) {
    return /^https:\/\/static-cdn\.jtvnw\.net\//.test(url || "")
      ? '<img class="avatar" src="' + limpio(url) + '" alt="" loading="lazy" width="28" height="28">'
      : '<i class="avatar" aria-hidden="true"></i>';
  }
  function urlCanal(login) { return /^\w{1,40}$/.test(login || "") ? "https://www.twitch.tv/" + login : ""; }

  /* ---------- Preparar las mediciones ---------- */
  var M = (D.mediciones || []).map(function (m) {
    var tw = m.twitch || {}, tr = m.trends || {}, kk = m.kick || {};
    return {
      ts: Date.parse(m.t),
      espectadores: typeof tw.espectadores === "number" ? tw.espectadores : null,
      canal: tw.canales && tw.canales[0] ? tw.canales[0] : null,   // nombre, login, espectadores y, si hay, foto
      errorTwitch: tw.error || null,
      kickEsp: typeof kk.espectadores === "number" ? kk.espectadores : null,   // Kick, tarea 6.6: solo desde el 16 nov
      kickTrans: typeof kk.transmisiones === "number" ? kk.transmisiones : null,
      kickCanal: kk.canales && kk.canales[0] ? kk.canales[0] : null,   // canal, espectadores e idioma
      errorKick: kk.error || null,
      interes: typeof tr.interes === "number" ? tr.interes : null,
      servidores: m.servidores || {}
    };
  }).filter(function (m) { return !isNaN(m.ts); }).sort(function (a, b) { return a.ts - b.ts; });

  function maximo(campo) {
    var mejor = null;
    M.forEach(function (m) { if (m[campo] != null && (!mejor || m[campo] > mejor[campo])) mejor = m; });
    return mejor;
  }
  var picoTwitch = maximo("espectadores"), picoTrends = maximo("interes"), picoKick = maximo("kickEsp");
  function urlKick(canal) { return /^[\w-]{1,40}$/.test(canal || "") ? "https://kick.com/" + canal : ""; }
  var SERVICIOS = [["rockstar", "Rockstar"], ["playstation", "PlayStation Network"], ["xbox", "Red de Xbox"]];

  /* ¿Esta carga la hizo la propia página al traer datos nuevos? (ver "Actualización sola") */
  var recargaSola = false;
  try { recargaSola = sessionStorage.getItem("gta6-recarga") === "1"; sessionStorage.removeItem("gta6-recarga"); } catch (e) { /* sin almacenamiento */ }

  /* ---------- Aviso de datos de ejemplo ---------- */
  if (D.ejemplo) $("aviso-ejemplo").hidden = false;

  /* ---------- Cuenta regresiva y hora cero (tarea 7.2) ---------- */
  // Con "?probar-hora-cero" en la dirección, el reloj de la página se adelanta hasta 5 segundos
  // antes del lanzamiento: sirve para ver la animación sin esperar al 19 nov.
  // Con "?probar-fecha=2026-11-18T12:00Z" la página hace como si fuera esa hora (UTC): sirve
  // para revisar cómo se ve la cuenta de cada lugar antes y después de su hora cero.
  var adelanto = /[?&]probar-hora-cero\b/.test(location.search) ? SALIDA - 5000 - Date.now() : 0;
  var fechaPrueba = /[?&]probar-fecha=([\dT:Z-]+)/.exec(location.search);
  if (fechaPrueba && !isNaN(Date.parse(fechaPrueba[1]))) adelanto = Date.parse(fechaPrueba[1]) - Date.now();
  function ahora() { return Date.now() + adelanto; }
  var FIESTA = 24 * 3600000;     // la animación se ve al llegar a 0 o al abrir la página ese primer día
  var celebrado = false;
  /* Hora cero en cada lugar (tarea 7.6, idea de Bruno). Rockstar confirmó que el juego se abre a
     medianoche del 19 nov en la hora de cada país. Horas de noviembre: Nueva Zelanda UTC+13,
     Chile UTC-3, Miami UTC-5. Que Nueva Zelanda sea la primera es una deducción por su huso. */
  var LUGARES = {
    nz: { nombre: "Nueva Zelanda", ts: Date.UTC(2026, 10, 18, 11, 0) },
    cl: { nombre: "Chile", ts: SALIDA },
    mia: { nombre: "Miami", ts: Date.UTC(2026, 10, 19, 5, 0) }
  };
  var lugar = "cl";
  try { var guardado = localStorage.getItem("gta6-lugar"); if (LUGARES[guardado]) lugar = guardado; } catch (e) { /* sin almacenamiento: queda Chile */ }
  function notaLugar(modo) {
    var L = LUGARES[lugar];
    if (modo === "desde") return lugar === "cl" ? "desde que salió GTA 6" : "desde que salió en " + L.nombre;
    var aclara = en12 ? "" : " (" + momento(L.ts) + ")";
    return "medianoche en " + L.nombre + (lugar === "cl" ? "" : '<i class="sep"> · </i><i class="hora-cl">' + dia(L.ts) + ", " + hora(L.ts) + aclara + " hora de Chile</i>");
  }
  // Escribe los cuatro números. Si las cajas ya existen, solo cambia los números: así una
  // animación de las cajas no vuelve a empezar cada segundo.
  function pintar(caja, s, modo) {
    var v = [[Math.floor(s / 86400), "días"], [Math.floor(s % 86400 / 3600), "horas"], [Math.floor(s % 3600 / 60), "min"], [s % 60, "seg"]];
    var clave = modo + "|" + lugar;
    if (caja.dataset.modo !== clave) {
      caja.dataset.modo = clave;
      caja.classList.toggle("desde", modo === "desde");
      caja.innerHTML = v.map(function (x) { return '<div class="caja"><b></b><small>' + x[1] + "</small></div>"; }).join("")
        + '<p class="cuenta-nota"><span>' + notaLugar(modo) + "</span></p>";
    }
    caja.querySelectorAll("b").forEach(function (b, i) { b.textContent = String(v[i][0]).padStart(2, "0"); });
  }
  // Botones de lugar: el elegido queda marcado; los lugares donde ya salió llevan un ✓.
  function pintarLugares() {
    document.querySelectorAll("[data-lugar]").forEach(function (b) {
      var L = LUGARES[b.dataset.lugar], ya = ahora() >= L.ts;
      b.setAttribute("aria-pressed", b.dataset.lugar === lugar ? "true" : "false");
      b.classList.toggle("ya", ya);
      b.title = (ya ? "Ya salió en " : "Medianoche en ") + L.nombre + ": " + dia(L.ts) + ", " + hora(L.ts) + (en12 ? "" : " (" + momento(L.ts) + ")") + " hora de Chile";
    });
  }
  $("lugares").addEventListener("click", function (e) {
    var b = e.target.closest("[data-lugar]"); if (!b) return;
    lugar = b.dataset.lugar;
    try { localStorage.setItem("gta6-lugar", lugar); } catch (err) { /* sin almacenamiento: vale hasta recargar */ }
    pintarLugares(); cuenta();
    if (!QUIETO.matches) repetir($("cuenta"), "enfoca", 220);   // los números se enfocan (microinteracciones)
  });
  function cuenta() {
    var t = ahora(), caja = $("cuenta"), falta = LUGARES[lugar].ts - t;
    // La fiesta de la hora cero sigue siendo la de Chile, mire el lugar que se mire.
    if (!celebrado && t >= SALIDA && t - SALIDA < FIESTA) { celebrado = true; horaCero(); }
    if (falta <= 0) pintar(caja, Math.floor(-falta / 1000), "desde");
    else pintar(caja, Math.floor(falta / 1000), "falta");
    pintarLugares();
  }
  function horaCero() {
    var lema = document.querySelector(".lema"), portada = document.querySelector(".portada");
    lema.textContent = "¡Ya salió GTA 6!";
    lema.classList.add("ya-salio");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || recargaSola) return;   // tras una recarga automática, sin repetir la fiesta
    // Fuegos artificiales y reflectores a la vez (elección de Bruno, 2026-11-13: opciones A y C).
    portada.classList.add("fiesta");
    fuegos(portada);
    reflectores(portada);
    setTimeout(function () { portada.classList.remove("fiesta"); }, 22000);
  }
  // Fuegos artificiales dibujados en un lienzo encima del cielo, con los colores del estilo.
  function fuegos(portada) {
    var lienzo = document.createElement("canvas"), cx = lienzo.getContext("2d");
    lienzo.className = "fuegos"; portada.appendChild(lienzo);
    // De noche y al atardecer, los colores del estilo sumados como luz. De día, con el cielo claro,
    // esa suma casi no se ve: se usan colores fuertes pintados encima y chispas más gruesas.
    var dia = document.documentElement.dataset.hora === "dia";
    var css = getComputedStyle(document.documentElement), colores = dia ? ["#ff2e97", "#6a2bd9", "#ff6a00", "#e0006e"]
      : ["--a1", "--a2", "--a3"].map(function (n) { return css.getPropertyValue(n).trim(); }).concat("#ffffff");
    var w, h, chispas = [], inicio = performance.now();
    function medir() { w = lienzo.width = portada.clientWidth; h = lienzo.height = portada.clientHeight; }
    medir();
    function estallar() {
      var x = w * (.15 + Math.random() * .7), y = h * (.12 + Math.random() * .35), c = colores[Math.floor(Math.random() * colores.length)];
      for (var k = 0; k < 70; k++) { var a = Math.random() * 6.283, v = 1.5 + Math.random() * 4.5; chispas.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vida: 1, c: c }); }
    }
    var proxima = 0;
    (function cuadro(t) {
      var pasado = t - inicio;
      if (pasado < 16000 && t > proxima) { estallar(); proxima = t + 350 + Math.random() * 700; }
      cx.globalCompositeOperation = "destination-out"; cx.fillStyle = "rgba(0,0,0,.22)"; cx.fillRect(0, 0, w, h);
      cx.globalCompositeOperation = dia ? "source-over" : "lighter";
      chispas = chispas.filter(function (p) { return p.vida > 0; });
      chispas.forEach(function (p) { p.x += p.vx; p.y += p.vy; p.vy += .045; p.vx *= .985; p.vy *= .985; p.vida -= .011;
        cx.globalAlpha = Math.max(0, p.vida); cx.fillStyle = p.c; cx.beginPath(); cx.arc(p.x, p.y, dia ? 2.8 : 2.2, 0, 6.283); cx.fill(); });
      cx.globalAlpha = 1;
      if (pasado < 20000 || chispas.length) requestAnimationFrame(cuadro); else lienzo.remove();
    })(inicio);
  }
  // Reflectores de estreno que barren el cielo desde detrás de los edificios.
  function reflectores(portada) {
    // Van dentro de cada escena, delante del cielo y detrás de las torres y los hoteles.
    portada.querySelectorAll(".escena").forEach(function (esc) {
      var capa = document.createElement("div"); capa.className = "reflectores";
      capa.innerHTML = "<i></i><i></i><i></i><i></i>";
      esc.insertBefore(capa, esc.querySelector(".torres"));
      setTimeout(function () { capa.remove(); }, 22000);
    });
  }
  cuenta(); setInterval(cuenta, 1000);
  gota($("lugares"), "indicador", 'button[aria-pressed="true"]');

  /* ---------- Fichas de resumen ---------- */
  (function () {
    var fallos = M.filter(function (m) { return m.espectadores == null || m.interes == null; }).length;
    var f = [
      ["Máximo en Twitch", picoTwitch ? picoTwitch.espectadores : null, picoTwitch ? "espectadores · " + dia(picoTwitch.ts) + " " + hora(picoTwitch.ts) : "sin datos todavía"],
      ["Máximo en Google Trends", picoTrends ? picoTrends.interes : null, picoTrends ? "de 100 · " + dia(picoTrends.ts) + " " + hora(picoTrends.ts) : "sin datos todavía"],
      ["Mediciones guardadas", M.length, M.length ? "del " + dia(M[0].ts) + " al " + dia(M[M.length - 1].ts) : "sin datos todavía"],
      ["Mediciones con huecos", fallos, "alguna fuente no respondió"]
    ];
    $("fichas").innerHTML = f.map(function (x) {
      return '<div class="ficha"><small>' + x[0] + '</small><b data-hasta="' + (x[1] == null ? "" : x[1]) + '">' + (x[1] == null ? "—" : "0") + "</b><span>" + x[2] + "</span></div>";
    }).join("");
    var quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelectorAll("[data-hasta]").forEach(function (b) {
      var fin = +b.dataset.hasta; if (b.dataset.hasta === "") return;
      if (quieto) { b.textContent = num(fin); return; }
      var t0 = null;
      function paso(t) {
        if (t0 == null) t0 = t;
        var p = Math.min(1, (t - t0) / 1600), e = 1 - Math.pow(1 - p, 3);
        b.textContent = num(fin * e);
        if (p < 1) requestAnimationFrame(paso);
      }
      requestAnimationFrame(paso);
      setTimeout(function () { b.textContent = num(fin); }, 2000);   // por si la pestaña estaba en segundo plano
    });
  })();

  /* ---------- Línea de tiempo ----------
     Se dibuja al final (lineaDeTiempo), porque también usa los récords de "Logros y récords". */
  var eventosExtra = [];   // los llena la sección de récords: hitos de Twitch, video más visto, tráilers
  function lineaDeTiempo() {
    var ev = eventosExtra.slice();
    // Hora cero de cada lugar (tarea 7.6), solo cuando ya pasó.
    [["nz", "Medianoche en Nueva Zelanda: GTA 6 ya se puede jugar allí"], ["cl", "Hora cero en Chile: sale GTA 6"],
     ["mia", "Medianoche en Miami: GTA 6 ya se puede jugar allí"]].forEach(function (x) {
      if (ahora() >= LUGARES[x[0]].ts) ev.push({ ts: LUGARES[x[0]].ts, texto: x[1], auto: true });
    });
    if (picoTwitch) ev.push({ ts: picoTwitch.ts, texto: "Máximo de espectadores en Twitch: " + num(picoTwitch.espectadores), auto: true });
    if (picoTrends) ev.push({ ts: picoTrends.ts, texto: "Máximo de búsquedas en Google Trends (" + picoTrends.interes + " de 100)", auto: true });
    SERVICIOS.forEach(function (s) {
      var antes = "ok";
      M.forEach(function (m) {
        var e = m.servidores[s[0]]; if (e == null) return;
        if (e !== "ok" && antes === "ok") ev.push({ ts: m.ts, texto: s[1] + " empieza a tener problemas", auto: true });
        if (e === "ok" && antes !== "ok") ev.push({ ts: m.ts, texto: s[1] + " vuelve a funcionar", auto: true });
        antes = e;
      });
    });
    (D.eventos || []).concat(window.EVENTOS || []).forEach(function (e) {
      var ts = deSantiago(e.hora);
      if (!isNaN(ts) && e.texto) ev.push({ ts: ts, texto: e.texto, auto: false });
    });
    ev.sort(function (a, b) { return b.ts - a.ts; });   // lo más nuevo arriba (pedido de Bruno)
    $("linea").innerHTML = ev.length ? ev.map(function (e) {
      return '<li class="' + (e.auto ? "auto" : "mano") + '"><time>' + dia(e.ts) + " · " + hora(e.ts) + '</time><span class="que">' + limpio(e.texto) +
        '</span><span class="etiqueta">' + (e.auto ? "automático" : "a mano") + "</span></li>";
    }).join("") : '<li class="vacio">Todavía no hay eventos.</li>';
  }

  /* ---------- Gráficos de línea (SVG hecho a mano) ---------- */
  var globo = $("globo");
  function grafico(caja, campo, opciones) {
    var puntos = opciones.serie || M.map(function (m) { return { ts: m.ts, v: m[campo] }; });   // serie propia (Trends, por hora)
    var extra = opciones.extra, puntos2 = extra ? M.map(function (m) { return { ts: m.ts, v: m[extra.campo] }; }) : null;
    function dibujar() {
      var ancho = Math.max(300, caja.clientWidth), alto = Math.round(Math.max(230, Math.min(380, ancho * 0.36)));
      var mi = 54, md = 14, ma = 26, mb = 34;
      if (!puntos.length) { caja.innerHTML = '<p class="nota">Todavía no hay datos.</p>'; return; }
      var t0 = puntos[0].ts, t1 = puntos[puntos.length - 1].ts;
      var tope = opciones.tope || 0, paso;
      puntos.concat(puntos2 || []).forEach(function (p) { if (p.v > tope) tope = p.v; });
      if (opciones.tope) paso = tope / 4;
      else { paso = pasoRedondo(tope); tope = Math.max(1, Math.ceil(tope / paso)) * paso; }
      var X = function (ts) { return mi + (ts - t0) / (t1 - t0 || 1) * (ancho - mi - md); };
      var Y = function (v) { return ma + (1 - v / tope) * (alto - ma - mb); };
      var s = '<svg viewBox="0 0 ' + ancho + " " + alto + '" role="img" aria-label="' + opciones.nombre + '" style="--color:var(' + opciones.color + ')">';

      for (var k = 0; k * paso <= tope + paso / 1000; k++) {   // líneas horizontales
        var v = k * paso, y = Y(v);
        s += '<line class="guia" x1="' + mi + '" x2="' + (ancho - md) + '" y1="' + y + '" y2="' + y + '"/>';
        s += '<g class="eje"><text x="' + (mi - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + compacto(v) + "</text></g>";
      }
      var cada = (ancho < 640 ? 12 : 6) * 3600000;  // marcas de hora
      var p0 = partes(t0), marca = Date.UTC(p0.year, p0.month - 1, p0.day, 0, 0); marca -= desfase(marca);
      for (; marca <= t1; marca += cada) {
        if (marca < t0) continue;
        var x = X(marca), medianoche = partes(marca).hour === 0;
        if (medianoche) s += '<line class="dia" x1="' + x + '" x2="' + x + '" y1="' + ma + '" y2="' + (alto - mb) + '"/>';
        s += '<g class="eje"><text x="' + x + '" y="' + (alto - 12) + '" text-anchor="middle">' + (medianoche ? dia(marca) : hora(marca)) + "</text></g>";
      }
      if (SALIDA > t0 && SALIDA < t1) {            // marca del lanzamiento
        var xs = X(SALIDA);
        s += '<line class="salida" x1="' + xs + '" x2="' + xs + '" y1="' + (ma - 8) + '" y2="' + (alto - mb) + '"/>';
        s += '<text class="salida-texto" x="' + (xs + 6) + '" y="' + (ma - 10) + '">19 nov · medianoche</text>';
      }
      var tramos = [], actual = [];                // la línea se corta donde falta un dato
      puntos.forEach(function (p, i) {
        if (p.v == null) {
          if (actual.length) { tramos.push(actual); actual = []; }
          var xa = X(i ? puntos[i - 1].ts : p.ts), xb = X(i < puntos.length - 1 ? puntos[i + 1].ts : p.ts);
          s += '<rect class="hueco" x="' + xa + '" y="' + ma + '" width="' + Math.max(2, xb - xa) + '" height="' + (alto - ma - mb) + '"/>';
        } else actual.push(p);
      });
      if (actual.length) tramos.push(actual);
      tramos.forEach(function (tr) {
        var linea = tr.map(function (p, i) { return (i ? "L" : "M") + X(p.ts).toFixed(1) + " " + Y(p.v).toFixed(1); }).join("");
        s += '<path class="relleno" d="' + linea + "L" + X(tr[tr.length - 1].ts).toFixed(1) + " " + Y(0) + "L" + X(tr[0].ts).toFixed(1) + " " + Y(0) + 'Z"/>';
        s += '<path class="trazo" pathLength="1" d="' + linea + '"/>';
      });
      if (puntos2) {                               // segunda línea (Kick), sin relleno ni huecos
        var t2 = [], a2 = [];
        puntos2.forEach(function (p) { if (p.v == null) { if (a2.length) { t2.push(a2); a2 = []; } } else a2.push(p); });
        if (a2.length) t2.push(a2);
        t2.forEach(function (tr) {
          s += '<path class="trazo trazo-extra" pathLength="1" style="--color:var(' + extra.color + ')" d="' + tr.map(function (p, i) { return (i ? "L" : "M") + X(p.ts).toFixed(1) + " " + Y(p.v).toFixed(1); }).join("") + '"/>';
        });
      }
      s += '<line class="cursor" y1="' + ma + '" y2="' + (alto - mb) + '" visibility="hidden"/><circle class="punto" r="6" visibility="hidden"/>';
      s += '<rect class="zona" x="' + mi + '" y="' + ma + '" width="' + (ancho - mi - md) + '" height="' + (alto - ma - mb) + '" fill="transparent"/></svg>';
      caja.innerHTML = s;

      var svg = caja.firstChild, cursor = svg.querySelector(".cursor"), punto = svg.querySelector(".punto");
      function mover(e) {
        var r = svg.getBoundingClientRect(), px = (e.clientX - r.left) / r.width * ancho, cerca = null, dist = Infinity;
        puntos.forEach(function (p) { var d = Math.abs(X(p.ts) - px); if (d < dist) { dist = d; cerca = p; } });
        if (!cerca) return;
        var x = X(cerca.ts);
        cursor.setAttribute("x1", x); cursor.setAttribute("x2", x); cursor.setAttribute("visibility", "visible");
        if (cerca.v != null) { punto.setAttribute("cx", x); punto.setAttribute("cy", Y(cerca.v)); punto.setAttribute("visibility", "visible"); }
        else punto.setAttribute("visibility", "hidden");
        globo.hidden = false;
        var c2 = puntos2 ? puntos2[puntos.indexOf(cerca)] : null;
        globo.innerHTML = "<small>" + dia(cerca.ts) + " · " + hora(cerca.ts) + "</small>" + (puntos2
          ? (cerca.v == null ? "Twitch: sin dato" : num(cerca.v) + " en Twitch") + "<br>" + (c2.v == null ? "Kick: sin dato" : num(c2.v) + " en Kick")
          : (cerca.v == null ? "Sin dato" : num(cerca.v) + " " + opciones.unidad));
        var gx = Math.min(window.innerWidth - globo.offsetWidth - 8, e.clientX + 14);
        globo.style.left = Math.max(8, gx) + "px"; globo.style.top = (e.clientY - 54) + "px";
      }
      function salir() { globo.hidden = true; cursor.setAttribute("visibility", "hidden"); punto.setAttribute("visibility", "hidden"); }
      /* Con el dedo (arreglo pedido por Bruno, 2026-11-14): deslizar de lado recorre el gráfico y
         el globo se queda al soltar; deslizar hacia arriba o abajo sigue moviendo la página
         (touch-action: pan-y en estilos.css). Se esconde al tocar fuera o al mover la página. */
      svg.addEventListener("pointermove", mover); svg.addEventListener("pointerdown", mover);
      svg.addEventListener("pointerleave", function (e) { if (e.pointerType !== "touch") salir(); });
      document.addEventListener("pointerdown", function (e) { if (e.pointerType === "touch" && !svg.contains(e.target)) salir(); }, { passive: true });
      window.addEventListener("scroll", function () { if (!globo.hidden && svg.querySelector(".cursor[visibility=visible]")) salir(); }, { passive: true });
    }
    dibujar();
    var espera, anchoAnterior = caja.clientWidth;
    window.addEventListener("resize", function () {
      clearTimeout(espera);
      espera = setTimeout(function () { if (caja.clientWidth !== anchoAnterior) { anchoAnterior = caja.clientWidth; dibujar(); } }, 150);
    });
  }
  /* ---------- Twitch y Kick en el mismo gráfico (tarea 6.6, opción B de Bruno, 2026-11-16) ----------
     Una línea por plataforma, con su leyenda. Kick se mide desde el 16 nov: antes no tiene línea. */
  $("g-twitch").insertAdjacentHTML("beforebegin", '<p class="leyenda-k"><i class="lk-tw"></i> Twitch <i class="lk-kick"></i> Kick</p>');
  grafico($("g-twitch"), "espectadores", { color: "--a1", unidad: "espectadores", nombre: "Espectadores en Twitch y Kick a lo largo del tiempo", extra: { campo: "kickEsp", color: "--kick" } });
  /* Trends por hora ("Trends sin huecos", 2026-11-16): cada punto es una hora, dibujado en su hora
     (antes, en la hora de la medición: ~1 h tarde), con el valor de la medición más nueva que la trae. */
  var serieTrends = (D.trends_horas || []).map(function (h) { return { ts: Date.parse(h[0]), v: typeof h[1] === "number" ? h[1] : null }; })
    .filter(function (p) { return !isNaN(p.ts); });
  grafico($("g-trends"), "interes", { color: "--a2", unidad: "de 100", tope: 100, nombre: "Interés de búsqueda en Google Trends a lo largo del tiempo",
    serie: serieTrends.length ? serieTrends : null });

  /* ---------- Servidores ----------
     9.1 (Bruno, 2026-11-16): con un cuadro por medición la tira crecía sin fin (101 cuadros el
     16 nov, ~1.000 el 19 dic) y en el celular se deshacía. Ahora: una línea "Ahora" con el estado
     de la última medición y, por servicio, dos tiras que no crecen sin fin: un cuadro por día y
     cada medición de las últimas 24 h (opción C de Bruno; descartadas A, solo 24 h, y B, solo
     por día). El veredicto de la derecha sigue contando todo. Para ver cómo se ve un problema
     sin esperar a que pase uno: "?probar-servidores-mal" (solo cambia la pantalla de quien la
     abre; no toca los datos). */
  (function () {
    var cont = $("servidores");
    if (!M.length) { cont.innerHTML = '<p class="nota">Todavía no hay datos.</p>'; return; }
    var simular = /[?&]probar-servidores-mal\b/.test(location.search);
    var n = M.length, fin = M[n - 1].ts, DIA = 864e5;
    function estado(i, s) {
      if (simular && s === "playstation" && (i >= n - 2 || (i >= 40 && i < 43))) return "problema";
      return M[i].servidores[s];
    }
    function clase(e) { return e == null ? "" : (e === "ok" ? "ok" : "mal"); }
    function claveDia(ts) { var o = partes(ts); return o.year + "-" + o.month + "-" + o.day; }

    // Tira de abajo: cada medición de las últimas 24 h (en la semana del lanzamiento, hasta 48).
    function tiraHoras(s, fina) {
      var cuadros = [];
      for (var i = 0; i < n; i++) {
        if (fin - M[i].ts > DIA) continue;
        var e = estado(i, s);
        cuadros.push('<i class="' + clase(e) + '" style="--i:' + cuadros.length + '" title="' + dia(M[i].ts) + " " + hora(M[i].ts) + " · " +
          (e == null ? "sin dato" : e === "ok" ? "funcionando" : "con problemas") + '"></i>');
      }
      return '<div class="tira' + (fina ? " fina" : "") + '">' + cuadros.join("") + "</div>" +
        '<div class="tira-pie"><span>hace 24 h</span><span>ahora</span></div>';
    }
    // Tira de arriba: un cuadro por día de Santiago, rojo si hubo algún problema ese día.
    function tiraDias(s) {
      var dias = [], porClave = {};
      for (var i = 0; i < n; i++) {
        var k = claveDia(M[i].ts), d = porClave[k];
        if (!d) { d = porClave[k] = { ts: M[i].ts, conDato: 0, malas: 0 }; dias.push(d); }
        var e = estado(i, s);
        if (e != null) { d.conDato++; if (e !== "ok") d.malas++; }
      }
      var cuadros = dias.map(function (d, j) {
        var c = !d.conDato ? "" : (d.malas ? "mal" : "ok");
        var t = !d.conDato ? "sin datos" : d.malas ? "con problemas en " + d.malas + " de " + d.conDato + " mediciones" : "funcionando en las " + d.conDato + " mediciones";
        return '<i class="' + c + '" style="--i:' + j + '" title="' + dia(d.ts) + " · " + t + '"></i>';
      });
      return '<div class="tira dias">' + cuadros.join("") + "</div>" +
        '<div class="tira-pie"><span>' + dia(dias[0].ts) + "</span><span>" + (dias.length > 1 ? "hoy" : "") + "</span></div>";
    }

    // "Ahora": la última medición, solo los servicios que tienen dato automático.
    var conDato = SERVICIOS.filter(function (s) { return estado(n - 1, s[0]) != null; });
    var malos = conDato.filter(function (s) { return estado(n - 1, s[0]) !== "ok"; });
    function lista(xs) { var nombres = xs.map(function (s) { return s[1]; }); return nombres.length > 1 ? nombres.slice(0, -1).join(", ") + " y " + nombres[nombres.length - 1] : nombres[0]; }
    var ahoraTxt = !conDato.length ? "Sin datos en la última medición"
      : malos.length ? lista(malos) + (malos.length === 1 ? " tiene" : " tienen") + " problemas"
      : "Todo funciona";
    var ahoraSub = !conDato.length ? "" : malos.length
      ? (conDato.length > malos.length ? lista(conDato.filter(function (s) { return malos.indexOf(s) < 0; })) + " funciona" + (conDato.length - malos.length > 1 ? "n" : "") + " · " : "")
      : lista(conDato) + (conDato.length > 1 ? " funcionan" : " funciona") + " · ";
    var html = '<div class="ahora ' + (!conDato.length ? "" : malos.length ? "mal" : "ok") + '" role="status"><i aria-hidden="true"></i><div><b>' + ahoraTxt +
      "</b><small>" + ahoraSub + "medición de las " + hora(fin) + (claveDia(fin) === claveDia(ahora()) ? "" : " del " + dia(fin)) + "</small></div></div>";

    html += SERVICIOS.map(function (s) {
      var malas = 0, cd = 0;
      for (var i = 0; i < n; i++) { var e = estado(i, s[0]); if (e != null) { cd++; if (e !== "ok") malas++; } }
      var tiras = '<div class="tira-titulo">Por día</div>' + tiraDias(s[0]) + '<div class="tira-titulo">Últimas 24 horas</div>' + tiraHoras(s[0], true);
      var veredicto = !cd ? '<div class="veredicto">Sin datos<small>' + (s[0] === "rockstar" ? "sus caídas se anotan a mano" : "") + "</small></div>"
        : malas ? '<div class="veredicto si">Sí, tuvo problemas<small>en ' + malas + " de " + cd + " mediciones</small></div>"
        : '<div class="veredicto no">No se cayó<small>en ' + cd + " mediciones</small></div>";
      return '<div class="servicio"><div class="nombre">' + s[1] + '</div><div class="tiras">' + tiras + "</div>" + veredicto + "</div>";
    }).join("");
    cont.innerHTML = html;
  })();

  /* ---------- Tabla de Twitch y Kick con filtro por día ----------
     Pedido de Bruno (2026-11-16): una columna "Plataforma" aparte de la de espectadores, y una fila
     por plataforma en cada medición (Kick, solo desde el 16 nov). */
  (function () {
    // Lo más nuevo primero (pedido de Bruno): días y filas de la más reciente a la más vieja.
    var nuevas = M.slice().reverse();
    var dias = []; nuevas.forEach(function (m) { var d = dia(m.ts); if (dias.indexOf(d) < 0) dias.push(d); });
    var elegido = dias.indexOf(dia(SALIDA)) >= 0 ? dia(SALIDA) : (dias[0] || "");
    var tope = Math.max(1, picoTwitch ? picoTwitch.espectadores : 0, picoKick ? picoKick.kickEsp : 0);
    var PLATAFORMAS = [
      { nombre: "Twitch", clase: "pl-twitch", esp: function (m) { return m.espectadores; }, error: function (m) { return m.errorTwitch; },
        canal: function (m) { return m.canal && { nombre: m.canal.nombre, espectadores: m.canal.espectadores, url: urlCanal(m.canal.login), foto: foto(m.canal.foto) }; },
        hay: function () { return true; } },
      { nombre: "Kick", clase: "pl-kick", esp: function (m) { return m.kickEsp; }, error: function (m) { return m.errorKick; },
        canal: function (m) { return m.kickCanal && { nombre: m.kickCanal.canal, espectadores: m.kickCanal.espectadores, url: urlKick(m.kickCanal.canal), foto: foto("") }; },
        hay: function (m) { return m.kickEsp != null || m.errorKick; } }   // antes del 16 nov no se medía
    ];
    function fila(m, pl, primera, filasHora) {
      var horaTd = primera ? '<td rowspan="' + filasHora + '">' + hora(m.ts) + "</td>" : "";
      var plTd = '<td><span class="plataforma ' + pl.clase + '">' + pl.nombre + "</span></td>";
      var e = pl.esp(m);
      if (e == null) return '<tr class="sin-dato">' + horaTd + plTd + '<td colspan="3">Sin dato' + (pl.error(m) ? " (" + limpio(pl.error(m)) + ")" : "") + "</td></tr>";
      var c = pl.canal(m);
      return "<tr>" + horaTd + plTd + '<td class="n">' + num(e) + '</td><td class="barra-celda ' + pl.clase + '"><i style="--w:' + (e / tope * 100).toFixed(1) + '%"></i></td><td>' +
        (c ? '<span class="canal">' + c.foto + "<span>" + enlace(c.url, limpio(c.nombre)) + " (" + compacto(c.espectadores) + ")</span></span>" : "—") + "</td></tr>";
    }
    function pintar() {
      $("filtros-dia").innerHTML = dias.map(function (d) { return '<button type="button" class="' + (d === elegido ? "activo" : "") + '" data-dia="' + d + '">' + d + "</button>"; }).join("");
      var filas = nuevas.filter(function (m) { return dia(m.ts) === elegido; }).map(function (m) {
        var pls = PLATAFORMAS.filter(function (pl) { return pl.hay(m); });
        return pls.map(function (pl, i) { return fila(m, pl, i === 0, pls.length); }).join("");
      }).join("");
      $("t-twitch").innerHTML = '<thead><tr><th>Hora</th><th>Plataforma</th><th class="n">Espectadores</th><th></th><th>Canal con más público</th></tr></thead><tbody>' +
        (filas || '<tr class="sin-dato"><td colspan="5">Todavía no hay datos.</td></tr>') + "</tbody>";
    }
    $("filtros-dia").addEventListener("click", function (e) { var d = e.target.dataset.dia; if (d) { elegido = d; pintar(); } });
    pintar();
    gota($("filtros-dia"), "gota-sel", "button.activo", true);
  })();

  /* ---------- Videos de YouTube (tarjetas con miniatura; opción B elegida por Bruno, 2026-11-13) ---------- */
  // Tarea 6.4: además de los más vistos en todo el mundo, los videos en español. Solo los que
  // YouTube marca en español (idioma "es", "es-MX", "es-419"…): la búsqueda prefiere el
  // español pero también trae algunos en inglés. Pestañas "Global" y "En español" sobre la
  // misma lista (opción A de Bruno, 2026-11-13).
  // Videos y Shorts (opción B de Bruno, 2026-11-15): en cada pestaña, primero los videos
  // normales y debajo una tira de Shorts verticales que se desliza hacia el lado. Los videos sin
  // marca de Short (mediciones de antes del 15 nov) cuentan como videos normales.
  (function () {
    var VIDEOS_VISIBLES = 8;
    function filas(lista) {
      return (lista || []).map(function (v) {
        var serie = (v.serie || []).filter(function (p) { return typeof p.visitas === "number"; });
        if (!serie.length) return null;
        var a = serie[0].visitas, b = serie[serie.length - 1].visitas, min = a, max = b;
        serie.forEach(function (p) { if (p.visitas < min) min = p.visitas; if (p.visitas > max) max = p.visitas; });
        var camino = serie.map(function (p, i) { return (i ? "L" : "M") + (i / (serie.length - 1 || 1) * 120).toFixed(1) + " " + (28 - (p.visitas - min) / (max - min || 1) * 26).toFixed(1); }).join("");
        return { v: v, a: a, b: b, camino: camino };
      }).filter(Boolean).sort(function (x, y) { return y.b - x.b; });
    }
    function tarjetas(fs, vacio) {
      return fs.map(function (f) {
        var url = urlVideo(f.v.id);
        // Solo miniaturas de YouTube; la imagen repite el enlace del título, así que no recibe foco.
        var foto = /^https:\/\/i\.ytimg\.com\//.test(f.v.miniatura || "")
          ? (url ? '<a class="foto" href="' + limpio(url) + '" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true">' : '<div class="foto">') +
            '<img src="' + limpio(f.v.miniatura) + '" alt="" loading="lazy" width="320" height="180">' + (url ? "</a>" : "</div>")
          : "";
        return "<li>" + foto + '<div class="v-texto">' + enlace(url, limpio(f.v.titulo)) +
          '<small title="Al inicio: ' + num(f.a) + " · Al final: " + num(f.b) + '">' + limpio(f.v.canal) + " · " + compacto(f.b) +
          ' visitas · <span class="crece">+' + compacto(f.b - f.a) + "</span></small>" +
          '<svg class="mini" viewBox="0 0 120 30" preserveAspectRatio="none" aria-hidden="true"><path d="' + f.camino + '"/></svg></div></li>';
      }).join("") || '<li class="vacio">' + vacio + "</li>";
    }
    var global = D.youtube || [];
    var espanol = (D.youtube_es || []).filter(function (v) { return /^es\b/i.test(v.idioma || ""); });
    var caja = $("videos"), nota = $("videos-nota"), tabs = $("videos-tabs");
    var NOTAS = { global: nota.textContent,
                  es: "Videos que YouTube marca en español, de creadores de Chile, España, México y otros países. La búsqueda se hace una vez por hora." };
    var LISTAS = [["global", "Global"], ["es", "En español"]];
    var elegida = "global";
    /* Sin cambios de tamaño al pasar de pestaña (pedido de Bruno, 2026-11-16): las dos pestañas
       se dibujan una sola vez, apiladas en el mismo lugar, y la caja mide lo de la más alta (lo
       mismo con las dos notas de arriba). Así cambiar no estira ni encoge la sección. La que no
       se ve queda oculta e "inert" (sin foco con el teclado). Al cambiar, la vieja se desvanece
       rápido y las tarjetas de la nueva entran en cascada, como si se cargaran. */
    nota.innerHTML = LISTAS.map(function (t) { return '<span data-lista="' + t[0] + '">' + limpio(NOTAS[t[0]]) + "</span>"; }).join("");
    caja.classList.add("v-pilas");
    caja.innerHTML = LISTAS.map(function (t) { return '<div class="v-panel" data-lista="' + t[0] + '">' + contenido(t[0]) + "</div>"; }).join("");
    [].forEach.call(caja.querySelectorAll(".v-panel"), flechasShorts);
    function contenido(lista) {
      var todas = filas(lista === "es" ? espanol : global);
      var normales = todas.filter(function (f) { return f.v.short !== true; }).slice(0, VIDEOS_VISIBLES);
      var shorts = todas.filter(function (f) { return f.v.short === true; });
      return '<h3 class="sub v-sub">Videos</h3><ul class="videos">' + tarjetas(normales, "Todavía no hay videos.") + "</ul>" +
        (shorts.length ? '<h3 class="sub v-sub">Shorts <small>' + shorts.length + " · desliza para ver más</small>" +
          '<span class="flechas-shorts">' + flechaHTML("izq", "Ver Shorts anteriores") + flechaHTML("der", "Ver más Shorts") + "</span></h3>" +
          '<ul class="videos shorts" aria-label="Shorts: desliza hacia el lado para ver más">' + tarjetas(shorts, "") + "</ul>" : "");
    }
    function pintar(animar) {
      tabs.innerHTML = LISTAS.map(function (t) {
        return '<button type="button" data-lista="' + t[0] + '" aria-pressed="' + (t[0] === elegida) + '"' + (t[0] === elegida ? ' class="activo"' : "") + ">" + t[1] + "</button>";
      }).join("");
      [].forEach.call(nota.children, function (s) { s.classList.toggle("fuera", s.dataset.lista !== elegida); });
      [].forEach.call(caja.children, function (p) {
        var ver = p.dataset.lista === elegida;
        p.classList.toggle("fuera", !ver); p.inert = !ver;
        if (ver && animar) {
          // Cada tarjeta lleva su número para la cascada (solo las primeras esperan; el resto entra junto).
          [].forEach.call(p.querySelectorAll("li"), function (li, i) { li.style.setProperty("--i", Math.min(li.parentNode.classList.contains("shorts") ? i + 4 : i, 9)); });
          repetir(p, "entra", 900); repetir(nota, "entra", 400);
        }
      });
    }
    // Flechas de la tira de Shorts (pedido de Bruno, 2026-11-15): además de deslizar, se pasan con un toque.
    function flechasShorts(panel) {
      var tira = panel.querySelector(".videos.shorts"); if (!tira) return;
      var a = panel.querySelector(".flechas-shorts .flecha-izq"), b = panel.querySelector(".flechas-shorts .flecha-der");
      function estado() { a.disabled = tira.scrollLeft <= 2; b.disabled = tira.scrollLeft + tira.clientWidth >= tira.scrollWidth - 2; }
      function mover(s) { tira.scrollBy({ left: s * Math.max(160, tira.clientWidth - 160), behavior: QUIETO.matches ? "auto" : "smooth" }); }
      a.addEventListener("click", function () { mover(-1); }); b.addEventListener("click", function () { mover(1); });
      tira.addEventListener("scroll", estado, { passive: true }); estado();
    }
    tabs.addEventListener("click", function (e) { var l = e.target.dataset.lista; if (l && l !== elegida) { elegida = l; pintar(true); } });
    pintar(false);
    gota(tabs, "gota-sel", "button.activo");
  })();

  /* ---------- Noticias ---------- */
  // Lo más nuevo arriba, y por páginas como en una tienda o un buscador, para que la sección
  // no crezca sin fin (pedidos de Bruno, 2026-11-13).
  (function () {
    var POR_PAGINA = 12, pintando = 0;
    var lista = (D.noticias || []).slice().sort(function (a, b) { return Date.parse(b.t) - Date.parse(a.t); });
    var todas = lista, total = 1, actual = 1;
    /* Filtro por día (idea de Bruno). Días en hora de Santiago, lo más nuevo primero. */
    function claveDia(ts) { var o = partes(ts); return o.year + "-" + String(o.month).padStart(2, "0") + "-" + String(o.day).padStart(2, "0"); }
    var porDia = {}, diasN = [];
    lista.forEach(function (n) { var ts = Date.parse(n.t); if (isNaN(ts)) return; var k = claveDia(ts); if (!porDia[k]) { porDia[k] = 0; diasN.push(k); } porDia[k]++; });
    var filtro = "";
    function nombreDia(k) { return dia(deSantiago(k + " 12:00")); }
    function aplicar() {
      todas = filtro ? lista.filter(function (n) { var ts = Date.parse(n.t); return !isNaN(ts) && claveDia(ts) === filtro; }) : lista;
      total = Math.max(1, Math.ceil(todas.length / POR_PAGINA)); actual = 1;
    }
    // Opción C de Bruno (2026-11-14): una barra por día (de izquierda, lo más viejo, a derecha, lo
    // más nuevo, como los gráficos). Al tocar una barra se ven solo los titulares de ese día; al
    // tocarla otra vez, o con "Ver todos los días", vuelven todos.
    function pintarFiltro() {
      var caja = $("noticias-filtro");
      var max = Math.max.apply(null, diasN.map(function (k) { return porDia[k]; }).concat(1));
      caja.innerHTML = diasN.length < 2 ? "" : '<div class="nt-barras" role="group" aria-label="Titulares por día: toca un día para verlos">' +
        diasN.slice().reverse().map(function (k) {
          return '<button type="button" data-dia="' + k + '" class="' + (k === filtro ? "activo" : "") + '" aria-pressed="' + (k === filtro) + '" title="' + nombreDia(k) + ": " + porDia[k] + ' titulares">' +
            '<span class="nt-num">' + porDia[k] + '</span><i style="height:' + Math.max(6, porDia[k] / max * 100).toFixed(1) + '%"></i><span class="nt-dia">' + nombreDia(k).replace(" ", "<br>") + "</span></button>";
        }).join("") + "</div>" +
        (filtro ? '<button type="button" class="nt-todos" data-dia="">Ver todos los días</button>' : "");
    }
    $("noticias-filtro").addEventListener("click", function (e) {
      var b = e.target.closest("[data-dia]"); if (!b) return;
      var barras = $("noticias-filtro").querySelector(".nt-barras"), x = barras ? barras.scrollLeft : 0;
      filtro = filtro === b.dataset.dia ? "" : b.dataset.dia; aplicar(); pintarFiltro(); pintar();
      barras = $("noticias-filtro").querySelector(".nt-barras"); if (barras) barras.scrollLeft = x;   // no saltar al tocar
    });
    aplicar(); pintarFiltro();
    // Si hay más días de los que caben, las barras empiezan mostrando los más nuevos (a la derecha).
    (function () { var barras = $("noticias-filtro").querySelector(".nt-barras"); if (barras) barras.scrollLeft = barras.scrollWidth; })();
    // Los titulares de Google Noticias terminan en " - Medio": en "Lo último" se quita, porque el
    // medio ya sale aparte (solo si coincide justo con el medio).
    function sinMedio(t, m) { t = t || ""; return m && t.slice(-(m.length + 3)) === " - " + m ? t.slice(0, -(m.length + 3)) : t; }
    function tarjeta(n, recortar) {
      var ts = Date.parse(n.t), seguro = /^https?:\/\//.test(n.url || ""), t = limpio(recortar ? sinMedio(n.titulo, n.medio) : n.titulo);
      return "<li>" + (seguro ? enlace(n.url, t) : "<a>" + t + "</a>") + "<small>" +
        limpio(n.medio) + (isNaN(ts) ? "" : " · " + dia(ts) + " " + hora(ts)) + "</small></li>";
    }
    /* Resumen (opción B de Bruno, 2026-11-16): en vez de la lista de cientos de titulares, los
       medios que más publican y los 6 últimos. La lista completa queda detrás de un botón.
       Con datos reales el recolector deja el resumen hecho en datos.js; con los de ejemplo
       (completos) se calcula aquí. */
    var medios, nMedios, ultimas;
    if (D.formato === 2) { medios = D.medios_top || []; nMedios = D.medios_n || medios.length; ultimas = D.noticias_ultimas || []; }
    else {
      var cuenta = {};
      lista.forEach(function (n) { if (n.medio) cuenta[n.medio] = (cuenta[n.medio] || 0) + 1; });
      medios = Object.keys(cuenta).map(function (m) { return [m, cuenta[m]]; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 8);
      nMedios = Object.keys(cuenta).length; ultimas = lista.slice(0, 6);
    }
    $("noticias-resumen").textContent = lista.length
      ? lista.length + " titulares guardados de " + nMedios + " medios. Quiénes hablan más de GTA 6, y lo último."
      : "Todavía no hay titulares.";
    (function () {
      var mx = medios.length ? medios[0][1] : 1;
      $("noticias-medios").innerHTML = medios.map(function (m) {
        return "<div><span>" + limpio(m[0]) + '</span><i style="width:' + (m[1] / mx * 100).toFixed(1) + '%"></i><b>' + num(m[1]) + "</b></div>";
      }).join("");
      $("noticias-ultimas").innerHTML = ultimas.map(function (n) { return tarjeta(n, true); }).join("");
    })();
    var abierta = false, boton = $("noticias-ver");
    boton.hidden = !lista.length;
    function textoBoton() { boton.textContent = abierta ? "Ocultar la lista completa" : "Ver los " + num(lista.length) + " titulares"; boton.setAttribute("aria-expanded", abierta); }
    textoBoton();
    boton.addEventListener("click", function () {
      abierta = !abierta; $("noticias-todas").hidden = !abierta; textoBoton();
      if (abierta) {
        pintar();                                    // los titulares de la primera página se piden recién ahora
        var barras = $("noticias-filtro").querySelector(".nt-barras"); if (barras) barras.scrollLeft = barras.scrollWidth;
      }
    });
    // Casillas de números (pedido de Bruno, 2026-11-15): siempre la misma cantidad (k = 7, o 5
    // en el celular) para que las flechas y los números no cambien de lugar al avanzar. La
    // primera, la última y la actual con sus vecinas; "…" en los saltos.
    function numeros(k) {
      var r = [], i, medio = k - 4;                      // casillas del centro: 3 (o 1 en el celular)
      if (total <= k) { for (i = 1; i <= total; i++) r.push(i); return r; }
      if (actual <= medio + 1) { for (i = 1; i <= k - 2; i++) r.push(i); return r.concat("…", total); }
      if (actual >= total - medio) { r = [1, "…"]; for (i = total - (k - 3); i <= total; i++) r.push(i); return r; }
      r = [1, "…"]; for (i = actual - (medio - 1) / 2; i <= actual + (medio - 1) / 2; i++) r.push(i); return r.concat("…", total);
    }
    var nav = $("noticias-paginas");
    nav.innerHTML = flechaHTML("izq", "Página anterior (titulares más nuevos)", ' data-paso="-1"') + '<div class="pg-numeros"></div>' +
      flechaHTML("der", "Página siguiente (titulares más viejos)", ' data-paso="1"');
    var casillas = nav.querySelector(".pg-numeros");
    function pintarPaginas() {
      nav.hidden = total < 2;
      if (nav.hidden) return;
      var foco = casillas.contains(document.activeElement);
      casillas.innerHTML = numeros(nav.parentNode.clientWidth < 420 ? 5 : 7).map(function (x) {
        return x === "…" ? '<span class="pg-salto" aria-hidden="true">…</span>'
          : '<button type="button" data-pagina="' + x + '"' + (x === actual ? ' class="activo" aria-current="page"' : "") + ">" + x + "</button>";
      }).join("");
      nav.querySelector(".flecha-izq").disabled = actual === 1;
      nav.querySelector(".flecha-der").disabled = actual === total;
      if (foco && casillas.querySelector(".activo")) casillas.querySelector(".activo").focus({ preventScroll: true });
    }
    gota(casillas, "gota-sel", "button.activo");
    if ("ResizeObserver" in window) new ResizeObserver(function () { pintarPaginas(); }).observe(nav.parentNode);
    function pintar() {
      var desde = (actual - 1) * POR_PAGINA, hasta = Math.min(todas.length, desde + POR_PAGINA);
      var turno = ++pintando, trozo = todas.slice(desde, hasta);
      var faltan = D.formato === 2 ? trozo.filter(function (n) { return !n.titulo; }) : [];
      var ul = $("noticias");
      if (faltan.length) {
        // Mientras cargan, la lista conserva su alto: antes se achicaba a una línea y la página saltaba.
        ul.style.minHeight = ul.offsetHeight + "px";
        ul.innerHTML = '<li class="cargando">Cargando titulares…</li>';
        var dias = []; faltan.forEach(function (n) { var k = diaUTC(Date.parse(n.t) / 1000); if (dias.indexOf(k) < 0) dias.push(k); });
        DIAS.cargar(dias).then(function (contenidos) {
          var porNumero = {};
          contenidos.forEach(function (c) { (c.noticias || []).forEach(function (x) { porNumero[x.i] = x; }); });
          faltan.forEach(function (n) {
            var x = porNumero[n.i];
            if (x) { n.titulo = x.titulo; n.medio = x.medio; n.url = x.url; }
            else n.titulo = "(titular no encontrado)";   // no debería pasar: el día y datos.js salen juntos
          });
          if (turno === pintando) pintar();
        }).catch(function () {
          if (turno === pintando) { ul.style.minHeight = ""; ul.innerHTML = '<li class="cargando">No se pudieron cargar estos titulares. Revisa la conexión y vuelve a tocar la página.</li>'; }
        });
      } else {
        ul.style.minHeight = "";
        ul.innerHTML = trozo.map(tarjeta).join("") || "<li>Todavía no hay titulares.</li>";
      }
      $("noticias-cuenta").textContent = todas.length
        ? todas.length + (filtro ? " titulares del " + nombreDia(filtro) : " titulares, del más nuevo al más viejo") + " · mostrando " + (desde + 1) + " a " + hasta +
          (!filtro && diasN.length > 1 ? " · toca una barra para ver un solo día" : "") : "";
      pintarPaginas();
    }
    // Ya no se sube al principio de la sección al cambiar de página (pedido de Bruno, 2026-11-15):
    // las flechas quedan bajo el dedo (ver "Sin saltos" en Microinteracciones).
    nav.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b || b.disabled) return;
      var p = b.dataset.paso ? actual + +b.dataset.paso : +b.dataset.pagina;
      p = Math.min(total, Math.max(1, p)); if (p === actual) return;
      actual = p; pintar();
    });
    // La primera página de la lista completa se pinta al tocar "Ver los N titulares" (ver arriba).
  })();

  /* ---------- Reddit (opción C elegida por Bruno, 2026-11-13) ----------
     Barras: publicaciones nuevas de r/GTA6 por hora, según la hora en que se publicaron.
     El RSS no trae votos ni comentarios, así que contar publicaciones es la forma de ver si la
     comunidad se agita. El recolector lee como máximo 100 por medición: si en una hora hay
     más, la barra se queda corta. Las horas anteriores a la primera publicación guardada
     salen como "sin dato". */
  (function () {
    var R = D.reddit || {}, pubs = (R.publicaciones || []).filter(function (p) { return !isNaN(Date.parse(p.t)); });
    var todas = pubs.slice().sort(function (a, b) { return Date.parse(b.t) - Date.parse(a.t); });
    var HORA = 3600e3, HORAS = 48;
    var ref = Date.parse(D.generado) || (todas.length ? Date.parse(todas[0].t) : Date.now());
    var fin = Math.ceil(ref / HORA) * HORA, ini = fin - HORAS * HORA;
    var desde = todas.length ? Date.parse(todas[todas.length - 1].t) : fin;
    var cajas = [];
    for (var t = ini; t < fin; t += HORA) cajas.push({ t: t, n: 0, nd: t + HORA <= desde });
    todas.forEach(function (p) {
      var i = Math.floor((Date.parse(p.t) - ini) / HORA);
      if (i >= 0 && i < cajas.length) cajas[i].n++;
    });
    var max = Math.max.apply(null, cajas.map(function (c) { return c.nd ? 0 : c.n; }));
    $("reddit-barras").setAttribute("aria-label", "Publicaciones por hora en r/GTA6, máximo " + max + " en una hora");
    $("reddit-barras").innerHTML = cajas.map(function (c) {
      var alto = c.nd ? 3 : (max ? Math.max(1.5, c.n / max * 100) : 1.5);
      var texto = dia(c.t) + " " + hora(c.t) + ": " + (c.nd ? "sin dato" : c.n + (c.n === 1 ? " publicación" : " publicaciones"));
      return '<div class="b' + (c.nd ? " nd" : "") + '" title="' + texto + '"><i style="height:' + alto + '%"></i></div>';
    }).join("");
    $("reddit-eje").innerHTML = "<span>" + dia(ini) + " " + hora(ini) + "</span><span>" + dia(ini + HORAS / 2 * HORA) + " " +
      hora(ini + HORAS / 2 * HORA) + "</span><span>" + dia(fin) + " " + hora(fin) + "</span>";
    $("reddit-leyenda").innerHTML = todas.length
      ? '<i class="c nd"></i> Sin dato (antes de la primera publicación guardada) · máximo: ' + max + " en una hora · " + todas.length + " publicaciones guardadas"
      : "Todavía no hay publicaciones guardadas.";
    var ultimas = R.ultimas ? R.ultimas.slice().sort(function (a, b) { return Date.parse(b.t) - Date.parse(a.t); }) : todas;
    $("reddit-ultimas").innerHTML = ultimas.slice(0, 8).map(function (p) {
      var autor = (p.autor || "").replace(/^\/u\//, "u/");
      return "<li>" + (/^https:\/\/www\.reddit\.com\//.test(p.url || "") ? enlace(p.url, limpio(p.titulo)) : "<a>" + limpio(p.titulo) + "</a>") +
        "<small>" + limpio(autor) + " · " + dia(Date.parse(p.t)) + " " + hora(Date.parse(p.t)) + "</small></li>";
    }).join("");
  })();

  /* ---------- GTA 6 frente a otros lanzamientos (tarea 7.9, idea 7) ----------
     Los datos de otros juegos están en lanzamientos.js, cada uno con su fuente; el de GTA VI es
     el máximo de Twitch que midió este proyecto. Diseño A de Bruno (2026-11-14): una barra por juego. */
  (function () {
    var caja = $("lanzamientos-caja"), L = window.LANZAMIENTOS;
    if (!caja || !L) return;
    var gta = picoTwitch ? { juego: "GTA VI", cuando: "máximo medido: " + dia(picoTwitch.ts) + " · " + hora(picoTwitch.ts), valor: picoTwitch.espectadores, propio: true } : null;
    var filas = (gta ? [gta] : []).concat(L.twitch || []);
    var tope = Math.max.apply(null, filas.map(function (f) { return f.valor; }).concat(1));
    var fuente = function (f) { return f.url ? enlace(f.url, limpio(f.fuente)) : limpio(f.fuente || ""); };
    var valorTw = function (f) { return (f.aprox ? "cerca de " : "") + num(f.valor); };
    var hechos = (L.hechos || []).map(function (h) {
      return '<li><small>' + limpio(h.titulo) + '</small><b class="ln-hecho">' + limpio(h.valor) + '</b><span class="rc-uni">' + limpio(h.detalle || "") + "</span>" +
        '<p class="rc-cuando">' + limpio(h.cuando) + " · Fuente: " + fuente(h) + "</p></li>";
    }).join("");
    var nota = "Espectadores a la vez en Twitch el día de la salida. GTA VI muestra lo más alto que ha medido este proyecto" +
      (Date.now() < SALIDA ? " (todavía antes del lanzamiento)." : ".");
    caja.className = "ln-a";
    caja.innerHTML = "<h3>Twitch, el día de la salida</h3><p class=\"ln-sub\">" + nota + "</p>" +
      '<ul class="ln-barras">' + filas.map(function (f) {
        return '<li class="' + (f.propio ? "propio" : "") + '"><span class="ln-juego">' + limpio(f.juego) + "<small>" + limpio(f.cuando) + (f.propio ? "" : " · " + fuente(f)) + "</small></span>" +
          '<span class="ln-barra"><i style="width:' + Math.max(1.5, f.valor / tope * 100).toFixed(1) + '%"></i></span><b>' + valorTw(f) + "</b></li>";
      }).join("") + "</ul>" + ventasArranque() +
      '<h3>Otros récords de la saga</h3><ul class="rc-vitrina">' + hechos + "</ul>";

    /* Ventas del arranque (tarea 7.10, pedida por Bruno el 2026-11-14): copias en los primeros
       días o semanas, cada una con su fuente y su plazo. GTA VI espera la cifra oficial (L.gta6).
       Diseño B de Bruno (2026-11-14): barras en 3 grupos por plazo, para comparar solo juegos con
       el mismo plazo; todas en la misma escala. */
    function ventasArranque() {
      var V = (L.ventas || []).slice();
      if (!V.length) return "";
      var g6 = L.gta6 ? Object.assign({ juego: "GTA VI", propio: true }, L.gta6) : null;
      var maxV = Math.max.apply(null, V.concat(g6 ? [g6] : []).map(function (v) { return v.copias; }));
      var millones = function (v) { return (v.mas ? "más de " : "") + compacto(v.copias).replace(" M", " millones"); };
      var detalle = function (v) {
        return limpio(v.anio) + (v.nota ? " · " + limpio(v.nota) : "") + (v.tiendas ? " · enviadas a tiendas" : "") + " · " + fuente(v);
      };
      var porPlazo = function (a, b) { return a.dias - b.dias || b.copias - a.copias; };
      var fila = function (v) {
        return '<li class="' + (v.propio ? "propio" : "") + '"><span class="ln-juego">' + limpio(v.juego) + "<small>" + (v.propio ? fuente(v) : detalle(v)) + "</small></span>" +
          '<span class="ln-barra"><i style="width:' + Math.max(1.5, v.copias / maxV * 100).toFixed(1) + '%"></i></span>' +
          "<b>" + millones(v) + '<small class="ln-plazo">' + limpio(v.plazo) + "</small></b></li>";
      };
      var espera = '<li class="propio ln-espera"><span class="ln-juego">GTA VI<small>Take-Two todavía no publica cuántas copias vendió.</small></span>' +
        '<span class="ln-barra"></span><b>esperando la cifra oficial</b></li>';
      var grupos = [["El primer día", 0, 1], ["Los primeros 3 a 5 días", 2, 5], ["Las primeras 1 a 3 semanas", 6, 99]];
      return "<h3>Copias vendidas en los primeros días</h3><p class=\"ln-sub\">Solo el arranque, no las ventas de toda la vida. Cada juego dice en cuántos días las vendió: compara los que tienen el mismo plazo.</p>" +
        '<ul class="ln-barras ln-ventas">' + (g6 ? fila(g6) : espera) + "</ul>" + grupos.map(function (gr) {
          var lista = V.filter(function (v) { return v.dias >= gr[1] && v.dias <= gr[2]; }).sort(porPlazo);
          return lista.length ? '<h4 class="ln-grupo">' + gr[0] + '</h4><ul class="ln-barras ln-ventas">' + lista.map(fila).join("") + "</ul>" : "";
        }).join("");
    }
  })();

  /* ---------- Álbum de momentos (tarea 7.7, idea 5) ----------
     Las fotos las sube Rust a web/album/ y generar_web.py arma la lista con la hora y el texto
     del nombre de cada archivo. Claude no pone fotos. Diseño B de Bruno (2026-11-14): fotos
     instantáneas con marco blanco. */
  (function () {
    var caja = $("album-fotos"), grande = $("album-grande");
    if (!caja) return;
    var fotos = (D.album || []).map(function (f) { return { src: f.archivo, ts: deSantiago(f.hora), texto: f.texto || "" }; })
      .filter(function (f) { return /^album\/[^/]+$/.test(f.src) && !isNaN(f.ts); });
    if (!fotos.length) {
      caja.innerHTML = '<p class="vacio">El álbum se llena el día del lanzamiento: aquí van las capturas y los memes de ese día, cada uno con su hora.</p>';
      return;
    }
    caja.className = "album album-b";
    caja.innerHTML = fotos.map(function (f, i) {
      return '<figure><button type="button" data-foto="' + i + '" aria-label="Ver más grande: ' + limpio(f.texto || "foto") + '">' +
        '<img src="' + encodeURI(f.src) + '" alt="' + limpio(f.texto) + '" loading="lazy"></button>' +
        "<figcaption><time>" + dia(f.ts) + " · " + hora(f.ts) + "</time>" + (f.texto ? "<span>" + limpio(f.texto) + "</span>" : "") + "</figcaption></figure>";
    }).join("");
    caja.addEventListener("click", function (e) {
      var b = e.target.closest("[data-foto]"); if (!b || !grande.showModal) return;
      var f = fotos[+b.dataset.foto];
      grande.querySelector("img").src = encodeURI(f.src); grande.querySelector("img").alt = f.texto;
      grande.querySelector("p").textContent = dia(f.ts) + " · " + hora(f.ts) + (f.texto ? " · " + f.texto : "");
      grande.showModal();
    });
    grande.addEventListener("click", function (e) { if (e.target === grande || e.target.closest(".album-cerrar")) grande.close(); });
  })();

  /* ---------- Próximamente (tarea 7.11, idea de Bruno, 2026-11-14) ----------
     Lo que la página mostrará más adelante. "listo" se calcula solo cuando hay un dato que lo
     diga (la cifra oficial en lanzamientos.js, los datos de la 6.1 en datos.js); lo demás se
     marca a mano al terminar cada tarea. Diseño C de Bruno (2026-11-14): un camino hacia adelante
     que empieza el 19 nov, con un punto por cada cosa. */
  (function () {
    var caja = $("proximamente-lista"); if (!caja) return;
    var L = window.LANZAMIENTOS || {};
    var P = [
      { titulo: "Ventas oficiales de GTA 6", cuando: "Cuando Take-Two publique la cifra", listo: !!L.gta6, ir: "lanzamientos",
        que: "Cuántas copias vendió en sus primeros días, al lado de los otros juegos grandes." },
      { titulo: "Más de Google Trends", cuando: "Una vez, entre el 20 y el 25 de noviembre", listo: !!D.trendsExtra,
        que: "En qué países se busca más GTA 6, qué más busca la gente y GTA 6 frente a Avengers: Doomsday, día por día." },
      { titulo: "Rebobinar el lanzamiento", cuando: "Después del 19 de noviembre", listo: false,
        que: "Una barra para mover la página hora por hora y revivir el día del lanzamiento." },
      { titulo: "Análisis del primer mes", cuando: "Cuando haya varias semanas de datos", listo: false,
        que: "Cuánto duró el interés y cómo cambió antes y después del lanzamiento." },
      { titulo: "GTA 6 en PC", cuando: "Sin fecha oficial", listo: false,
        que: "Un segundo lanzamiento: cuenta regresiva, jugadores en Steam y consolas frente a PC." }
    ];
    var estado = function (x) { return x.listo ? (x.ir ? '<a href="#' + x.ir + '">Ya está: ver</a>' : "Ya está") : limpio(x.cuando); };
    caja.innerHTML = '<ol class="px-c"><li class="px-hito"><span class="px-punto"></span><b>19 nov · Lanzamiento en consolas</b><p>PlayStation 5 y Xbox Series.</p></li>' + P.map(function (x) {
      return '<li class="' + (x.listo ? "listo" : "") + '"><span class="px-punto"></span><small>' + estado(x) + "</small><b>" + limpio(x.titulo) + "</b><p>" + limpio(x.que) + "</p></li>";
    }).join("") + "</ol>";
  })();

  /* ---------- Pie ---------- */
  $("pie-info").textContent = (D.ejemplo ? "Mostrando datos de ejemplo. " : "") +
    (D.generado ? "Datos actualizados por última vez el " + dia(Date.parse(D.generado)) + " a las " + hora(Date.parse(D.generado)) + " (hora de Santiago)." : "");

  /* ---------- Actualización sola (pedido de Bruno, 2026-11-14) ----------
     Dice cuánto hace de la última medición. Publicada en internet, cada 2 minutos mira si hay
     datos nuevos (version.json con una fecha de "generado" más nueva). Si los hay y nadie está tocando la
     página (1,5 min sin moverla) o la pestaña está en segundo plano, recarga sola y vuelve al
     mismo lugar; si no, ofrece un botón para no mover la página mientras alguien la lee.
     Abierta como archivo en el PC no puede mirar (el navegador no deja): solo dice la hora. */
  (function () {
    var chip = $("en-vivo"); if (!chip) return;
    var fin = M.length ? M[M.length - 1].ts : null, hayNuevos = false, ultimoToque = Date.now();
    if (!fin) return;
    chip.hidden = false;
    function hace() {
      var min = Math.max(0, Math.round((Date.now() - fin) / 60000));
      return min < 1 ? "hace menos de 1 min" : min < 60 ? "hace " + min + " min" : min < 1440 ? "hace " + Math.floor(min / 60) + " h " + (min % 60) + " min" : "el " + dia(fin);
    }
    function pintar() {
      chip.innerHTML = hayNuevos
        ? '<button type="button" id="en-vivo-boton"><i aria-hidden="true"></i>Hay datos nuevos · tocar para actualizar</button>'
        : '<span><i aria-hidden="true"></i>Última medición ' + hace() + " · " + hora(fin) + "</span>";
    }
    function recargar() {
      try { sessionStorage.setItem("gta6-recarga", "1"); sessionStorage.setItem("gta6-scroll", String(window.scrollY)); } catch (e) { /* sin almacenamiento */ }
      // GitHub Pages deja guardar datos.js hasta 10 minutos: se pide de nuevo a la red (eso
      // también renueva la copia guardada) y recién entonces se recarga, para no volver a
      // mostrar los datos viejos.
      fetch("datos.js", { cache: "reload" }).catch(function () {}).then(function () { location.reload(); });
    }
    ["pointerdown", "keydown", "scroll", "wheel", "touchstart"].forEach(function (t) { window.addEventListener(t, function () { ultimoToque = Date.now(); }, { passive: true }); });
    chip.addEventListener("click", function (e) { if (e.target.closest("#en-vivo-boton")) recargar(); });
    function revisar() {
      if (hayNuevos || !D.generado) return;
      // version.json pesa menos de 50 bytes, y si no cambió el servidor responde "sin cambios"
      // sin mandarlo: con mucha gente mirando no se baja datos.js entero cada 2 minutos.
      fetch("version.json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : {}; }).then(function (v) {
        if (!v || !v.generado || v.generado <= D.generado) return;
        hayNuevos = true;
        if (document.hidden || Date.now() - ultimoToque > 90000) recargar(); else pintar();
      }).catch(function () { /* sin conexión: se vuelve a intentar en 2 minutos */ });
    }
    // Al volver de una recarga automática, a la misma altura de la página.
    if (recargaSola) { try { var y = +sessionStorage.getItem("gta6-scroll"); if (y) window.scrollTo(0, y); } catch (e) { /* nada */ } }
    pintar(); setInterval(function () { if (!hayNuevos) pintar(); }, 30000);
    if (/^https?:$/.test(location.protocol)) {
      setInterval(revisar, 120000);
      document.addEventListener("visibilitychange", function () { if (!document.hidden) revisar(); else if (hayNuevos) recargar(); });
    }
  })();

  /* ---------- Menú de secciones (opción B de Bruno, 2026-11-14: botón flotante) ---------- */
  (function () {
    var caja = $("menu"); if (!caja) return;
    var S = [["records", "Récords"], ["seccion-linea", "Línea de tiempo"], ["resumen", "Resumen"], ["seccion-twitch", "Twitch y Kick"],
      ["seccion-trends", "Trends"], ["seccion-servidores", "Servidores"], ["seccion-videos", "Videos"], ["comparacion", "Comparación"], ["lanzamientos", "Otros lanzamientos"],
      ["seccion-noticias", "Titulares"], ["seccion-reddit", "Reddit"], ["album", "Álbum"], ["capsula", "Cápsula"], ["proximamente", "Próximamente"]].filter(function (x) { return $(x[0]); });
    caja.innerHTML = '<button type="button" class="menu-boton" aria-expanded="false" aria-controls="menu-lista"><span aria-hidden="true">☰</span> Secciones</button>' +
      '<div class="menu-lista" id="menu-lista" hidden>' +
      S.map(function (x) { return '<a href="#' + x[0] + '" data-ir="' + x[0] + '">' + x[1] + "</a>"; }).join("") +
      '<a href="#" data-ir="arriba">↑ Volver arriba</a></div>';
    var boton = caja.querySelector(".menu-boton"), lista = caja.querySelector(".menu-lista");
    /* Microinteracciones (2026-11-15): la misma caja del botón crece hasta ser el menú. Se le
       cambia el ancho y el alto de verdad (no se escala), y las opciones aparecen cuando ya casi
       terminó de abrirse. Solo se anima si el estado cambia: antes, cada clic fuera del menú lo
       "cerraba" otra vez y la caja amagaba con abrirse (fallo visto por Bruno). */
    lista.querySelectorAll("a").forEach(function (a, i) { a.style.setProperty("--i", i); });
    var abierto = false, DUR = 420, relojes = [];
    function limpiar() { relojes.forEach(clearTimeout); relojes = []; }
    function luego(ms, f) { relojes.push(setTimeout(f, ms)); }
    function tam() { var r = caja.getBoundingClientRect(); return { w: r.width, h: r.height }; }
    function fijar(t) { caja.style.width = t.w + "px"; caja.style.height = t.h + "px"; }
    function soltar() { caja.style.width = ""; caja.style.height = ""; caja.classList.remove("animando", "cerrando"); }
    function medir(abierta) {   // tamaño de la caja abierta o cerrada, sin que se llegue a pintar
      var antes = { ab: caja.classList.contains("abierto"), oc: lista.hidden, w: caja.style.width, h: caja.style.height };
      caja.classList.toggle("abierto", abierta); lista.hidden = !abierta; caja.style.width = ""; caja.style.height = "";
      var t = tam();
      caja.classList.toggle("abierto", antes.ab); lista.hidden = antes.oc; caja.style.width = antes.w; caja.style.height = antes.h;
      return t;
    }
    function abrir(si) {
      if (si === abierto) return;
      abierto = si; boton.setAttribute("aria-expanded", String(si)); limpiar();
      if (QUIETO.matches) { soltar(); lista.hidden = !si; caja.classList.toggle("abierto", si); caja.classList.toggle("texto", si); return; }
      if (si) {
        var desde = caja.style.width ? tam() : medir(false), hasta = medir(true);   // si estaba cerrándose, desde donde iba
        caja.classList.remove("cerrando", "texto", "abierto"); lista.hidden = false; fijar(desde); void caja.offsetWidth;
        caja.classList.add("animando", "abierto"); fijar(hasta);
        luego(DUR * 0.6, function () { caja.classList.add("texto"); });
        luego(DUR + 40, soltar);
      } else {
        var ahora = tam(), cerrada = medir(false);
        fijar(ahora); caja.classList.add("cerrando"); caja.classList.remove("texto");   // primero se va el texto
        luego(110, function () { caja.classList.add("animando"); void caja.offsetWidth; caja.classList.remove("abierto"); fijar(cerrada); });
        luego(110 + DUR + 40, function () { lista.hidden = true; soltar(); });
      }
    }
    document.addEventListener("click", function (e) {
      var a = e.target.closest("[data-ir]");
      if (a && caja.contains(a)) {
        e.preventDefault(); abrir(false);
        if (a.dataset.ir === "arriba") window.scrollTo({ top: 0, behavior: "smooth" });
        else { var el = $(a.dataset.ir); el.classList.add("visible"); el.scrollIntoView({ behavior: "smooth", block: "start" }); }
      } else if (e.target.closest(".menu-boton")) abrir(!abierto);
      else if (!caja.contains(e.target)) abrir(false);   // tocar fuera la cierra
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && abierto) { abrir(false); boton.focus(); } });
  })();

  /* ---------- Cambio de estilo ---------- */
  (function () {
    var raiz = document.documentElement;
    // Tarea 7.3 (opción B de Bruno, 2026-11-13): las torres nuevas suben una por una al ir a 2026
    // y bajan al volver a 1986. Duraciones de las animaciones de estilos.css, con margen.
    // Pedido de Bruno (2026-11-15): volver a 1986 tardaba 1,2 s más que ir a 2026, porque se
    // esperaba a que bajaran las torres antes del barrido. Ahora el barrido empieza enseguida en los
    // dos sentidos y las torres bajan a la vez; la clase se quita cuando la escena de 2026 ya se
    // apagó (380 ms + 0,7 s del fundido), para que no se vean volver a su sitio.
    var SUBIR_MS = 2400, BAJAR_MS = 1200, quitarTorres = null;
    try { var guardado = localStorage.getItem("tema"); if (guardado === "ochenta" || guardado === "actual") raiz.dataset.tema = guardado; } catch (e) {}
    // Microinteracciones (2026-11-15): la píldora del botón se mueve en cuanto se toca (data-va),
    // con el resorte, sin esperar a que cambie el estilo a mitad de la cortina.
    var cambio = document.querySelector(".cambio");
    cambio.dataset.va = raiz.dataset.tema;
    cambio.addEventListener("click", function (e) {
      var tema = e.target.dataset.poner;
      if (!tema || tema === raiz.dataset.tema || document.body.classList.contains("cambiando-espera")) return;
      var quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      cambio.dataset.va = tema;
      if (!quieto) repetir(cambio, "salto", 520);
      clearTimeout(quitarTorres);
      raiz.classList.remove("torres-suben", "torres-bajan");
      if (!quieto && tema === "ochenta") {
        raiz.classList.add("torres-bajan");
        quitarTorres = setTimeout(function () { raiz.classList.remove("torres-bajan"); }, BAJAR_MS);
      }
      document.body.classList.add("cambiando-espera", "cambiando");
      setTimeout(function () {
        raiz.dataset.tema = tema; try { localStorage.setItem("tema", tema); } catch (e) {}
        if (!quieto && tema === "actual") { raiz.classList.add("torres-suben"); quitarTorres = setTimeout(function () { raiz.classList.remove("torres-suben"); }, SUBIR_MS); }
      }, quieto ? 0 : 380);
      setTimeout(function () { document.body.classList.remove("cambiando", "cambiando-espera"); }, quieto ? 0 : 820);
    });
  })();

  /* ---------- Día, atardecer y noche según la hora real de Miami (tarea 4.1) ----------
     La salida y la puesta del sol se calculan para cada día con la fórmula aproximada del
     almanaque náutico (error de un par de minutos), así sirve todo el año y no depende del
     horario de verano. Atardecer: desde 1 h antes de la puesta hasta 30 min después, y la media
     hora alrededor de la salida. Los botones fijan otra hora hasta recargar la página. */
  (function () {
    var raiz = document.documentElement, LAT = 25.7617, LON = -80.1918, fijada = null;
    var RAD = Math.PI / 180;
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
    var botones = document.querySelectorAll(".horas button");
    function poner(h) {
      raiz.dataset.hora = h;
      botones.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.horaPoner === h)); });
    }
    function revisar() { if (!fijada) poner(horaDeMiami(ahora())); }
    revisar(); setInterval(revisar, 60000);
    document.querySelector(".horas").addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (b) { fijada = b.dataset.horaPoner; poner(fijada); }
    });
    gota(document.querySelector(".horas"), "indicador", 'button[aria-pressed="true"]');
  })();

  /* ---------- Suelo de Miami 1986 (rejilla dibujada en un lienzo) ----------
     Misma geometría que tenía la versión en CSS (perspectiva de 260 px desde el centro del
     horizonte, plano inclinado 80°, casillas de 60 px, cinco veces más hondo que el suelo y
     5,4 veces más ancho). Dibujar cada línea con su grosor real evita que titilen: la capa
     CSS, al encogerse tanto, convertía las líneas en puntos que se encendían y apagaban. */
  (function () {
    var lienzo = document.querySelector(".escena-80 .rejilla");
    if (!lienzo || !lienzo.getContext) return;
    var ctx = lienzo.getContext("2d"), raiz = document.documentElement;
    var P = 260, SEN = Math.sin(80 * Math.PI / 180), COS = Math.cos(80 * Math.PI / 180);
    var CASILLA = 60, GROSOR = 2, VUELTA = 1600;   // una casilla cada 1,6 s, como antes
    var quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var W = 0, H = 0, dpr = 1, enPantalla = true, pendiente = true;
    function medir() {
      var r = lienzo.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1); W = r.width; H = r.height;
      lienzo.width = Math.max(1, Math.round(W * dpr)); lienzo.height = Math.max(1, Math.round(H * dpr));
      pendiente = true;
    }
    // u: distancia al centro, a lo ancho del plano; v: distancia desde el borde cercano, hacia el fondo.
    function aPantalla(u, v) { var e = P / (P + v * SEN); return [W / 2 + u * e, (H - v * COS) * e]; }
    function dibujar(t) {
      var hondo = 5 * H, ancho = 5.4 * W, avance = quieto ? 0 : (t % VUELTA) / VUELTA * CASILLA, u, v, a, b, c, d;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.beginPath();                             // líneas que van hacia el horizonte (cian)
      for (var x = 0; x <= ancho; x += CASILLA) {
        u = x - ancho / 2;
        a = aPantalla(u, 0); b = aPantalla(u + GROSOR, 0); c = aPantalla(u + GROSOR, hondo); d = aPantalla(u, hondo);
        ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath();
      }
      ctx.fillStyle = "rgba(34, 230, 255, .8)";
      ctx.fill();
      ctx.fillStyle = "rgba(255, 46, 151, .9)";    // líneas de lado a lado (rosa), encima
      for (var k = -1; k * CASILLA <= hondo; k++) {
        v = hondo - (k * CASILLA + avance);          // borde de la línea más cercano al horizonte
        if (v - GROSOR > hondo || v < 0) continue;
        a = aPantalla(0, Math.max(0, v - GROSOR)); b = aPantalla(0, Math.min(hondo, v));
        ctx.fillRect(0, b[1], W, a[1] - b[1]);       // con decimales: el lienzo reparte el brillo entre píxeles
      }
    }
    function cuadro(t) {
      // Solo se dibuja con el estilo 1986 puesto y la portada a la vista.
      if (raiz.dataset.tema === "ochenta" && enPantalla && (!quieto || pendiente)) { dibujar(t); pendiente = false; }
      window.requestAnimationFrame(cuadro);
    }
    medir();
    window.addEventListener("resize", medir);
    document.querySelector(".cambio").addEventListener("click", function () { pendiente = true; });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (v) { enPantalla = v[0].isIntersecting; }).observe(lienzo);
    }
    window.requestAnimationFrame(cuadro);
  })();

  /* ---------- Logros y récords (tarea 6.2; opción A "vitrina", elegida por Bruno, 2026-11-13) ----------
     Todo sale de los datos guardados. Cada récord guarda su historia: la lista de las veces en
     que se superó, en orden de tiempo. "¡Nuevo récord!" marca los que se batieron en las 6 horas
     anteriores a la última medición. Sin "hora con más interés en Trends": siempre vale 100
     (aviso 8 del plan). */
  (function () {
    var caja = $("records-vitrina");
    if (!caja) return;
    var filas = (D.mediciones || []).map(function (m) { return { ts: Date.parse(m.t), tw: m.twitch || {} }; })
      .filter(function (f) { return !isNaN(f.ts); }).sort(function (a, b) { return a.ts - b.ts; });
    var ultima = filas.length ? filas[filas.length - 1].ts : 0;
    var NUEVO = 6 * 3600000;
    // Recorre eventos {ts, valor, que, url} en orden de tiempo y anota cada vez que se supera el máximo.
    function historia(eventos) {
      var h = [], max = -Infinity;
      eventos.sort(function (a, b) { return a.ts - b.ts; }).forEach(function (e) { if (e.valor > max) { max = e.valor; h.push(e); } });
      return h;
    }
    // Lo mismo, pero contando elementos por grupo (día, hora): el récord sube cuando un grupo pasa al anterior máximo.
    function historiaConteo(lista, grupo, etiqueta) {
      var cuenta = {}, h = [], max = 0;
      lista.map(function (x) { return Date.parse(x.t); }).filter(function (ts) { return !isNaN(ts); }).sort(function (a, b) { return a - b; })
        .forEach(function (ts) {
          var g = grupo(ts);
          cuenta[g] = (cuenta[g] || 0) + 1;
          if (cuenta[g] > max) {
            max = cuenta[g];
            if (h.length && h[h.length - 1].g === g) { h[h.length - 1].valor = max; h[h.length - 1].ts = ts; }   // el mismo grupo sigue subiendo
            else h.push({ ts: ts, valor: max, g: g, que: etiqueta(ts) });
          }
        });
      return h;
    }
    var esp = [], canal = [], trans = [];
    // Kick (tarea 6.6, pedido de Bruno, 2026-11-16): los mismos récords que Twitch, desde que se mide.
    var kEsp = [], kCanal = [], kTrans = [];
    (D.mediciones || []).forEach(function (m) {
      var k = m.kick, ts = Date.parse(m.t);
      if (!k || k.error || isNaN(ts)) return;
      if (typeof k.espectadores === "number") kEsp.push({ ts: ts, valor: k.espectadores });
      if (typeof k.transmisiones === "number") kTrans.push({ ts: ts, valor: k.transmisiones });
      (k.canales || []).forEach(function (c) { kCanal.push({ ts: ts, valor: c.espectadores, que: c.canal, url: urlKick(c.canal) }); });
    });
    filas.forEach(function (f) {
      if (f.tw.error) return;
      if (typeof f.tw.espectadores === "number") esp.push({ ts: f.ts, valor: f.tw.espectadores });
      if (typeof f.tw.transmisiones === "number") trans.push({ ts: f.ts, valor: f.tw.transmisiones });
      (f.tw.canales || []).forEach(function (c) { canal.push({ ts: f.ts, valor: c.espectadores, que: c.nombre, url: urlCanal(c.login) }); });
    });
    // Video y Short más vistos (pedido de Bruno, 2026-11-15): los calcula generar_web.py con todas
    // las mediciones, así un récord no se pierde cuando su video deja de salir en la búsqueda.
    var RY = D.records_youtube || {};
    function lideresDe(lista) {
      return (lista || []).map(function (r) { return { ts: Date.parse(r.t), valor: r.visitas, que: r.titulo, url: urlVideo(r.id) }; })
        .filter(function (r) { return !isNaN(r.ts); });
    }
    var lideres = lideresDe(RY.video), lideresShort = lideresDe(RY.short);
    var crece = [];
    (D.youtube || []).forEach(function (v) {
      v.serie.forEach(function (p, i) {
        var ts = Date.parse(p.t);
        if (i) {
          var horas = (ts - Date.parse(v.serie[i - 1].t)) / 3600000;
          // Solo entre mediciones seguidas (hasta 1,6 h), para no promediar huecos largos.
          if (horas > 0 && horas <= 1.6) crece.push({ ts: ts, valor: (p.visitas - v.serie[i - 1].visitas) / horas, que: v.titulo, url: urlVideo(v.id) });
        }
      });
    });
    var fClave = function (ts) { var o = partes(ts); return o.year + "-" + o.month + "-" + o.day; };
    var fClaveHora = function (ts) { return fClave(ts) + " " + partes(ts).hour; };
    var R = [
      { nombre: "Más espectadores en Twitch", h: historia(esp), fmt: num, uni: "espectadores a la vez" },
      { nombre: "Directo con más público en Twitch", h: historia(canal), fmt: num, uni: "espectadores en un solo directo" },
      { nombre: "Más transmisiones a la vez en Twitch", h: historia(trans), fmt: num, uni: "transmisiones de GTA VI" },
      { nombre: "Más espectadores en Kick", h: historia(kEsp), fmt: num, uni: "espectadores a la vez" },
      { nombre: "Directo con más público en Kick", h: historia(kCanal), fmt: num, uni: "espectadores en un solo directo" },
      { nombre: "Más directos a la vez en Kick", h: historia(kTrans), fmt: num, uni: "directos de GTA VI" },
      { nombre: "Video más visto", h: lideres, fmt: compacto, uni: "visitas", prev: "Récords anteriores", aviso: true },
      { nombre: "Short más visto", h: lideresShort, fmt: compacto, uni: "visitas", prev: "Récords anteriores", aviso: true },
      { nombre: "Video que más creció en una hora", h: historia(crece), fmt: num, uni: "visitas en una hora" },
      { nombre: "Día con más titulares", h: historiaConteo(D.noticias || [], fClave, dia), fmt: num, uni: "titulares", solo: "dia" },
      { nombre: "Hora con más publicaciones en r/GTA6", h: historiaConteo((D.reddit || {}).publicaciones || [], fClaveHora, function (ts) { return dia(ts) + " · " + hora(ts).slice(0, 2) + ":00"; }), fmt: num, uni: "publicaciones", solo: "hora" }
    ];
    function cuando(r, e) { return r.solo ? e.que : dia(e.ts) + " · " + hora(e.ts); }
    function quien(r, e) { return r.solo || !e.que ? "" : enlace(e.url, limpio(e.que)); }
    var html = R.filter(function (r) { return r.h.length; }).map(function (r) {
      var e = r.h[r.h.length - 1], nuevo = r.h.length > 1 && ultima - e.ts < NUEVO;
      var prev = r.h.slice(0, -1).reverse().slice(0, 5);
      return '<li class="' + (nuevo ? "nuevo" : "") + '"><small>' + r.nombre + "</small>" + (nuevo ? '<span class="rc-nuevo">¡Nuevo récord!</span>' : "") +
        "<b>" + r.fmt(e.valor) + '</b><span class="rc-uni">' + r.uni + "</span>" +
        (quien(r, e) ? '<p class="rc-que">' + quien(r, e) + "</p>" : "") + '<p class="rc-cuando">' + cuando(r, e) + "</p>" +
        (r.aviso ? '<p class="rc-aviso">Puede que no trate de GTA 6: el filtro quita los que solo usan el hashtag, pero no es perfecto.</p>' : "") +
        (prev.length ? '<details class="rc-prev"><summary>' + (r.prev || "Récords anteriores") + " (" + (r.h.length - 1) + ")</summary><ul>" + prev.map(function (p) {
          return "<li><b>" + r.fmt(p.valor) + "</b> " + (quien(r, p) ? quien(r, p) + " · " : "") + cuando(r, p) + "</li>";
        }).join("") + "</ul></details>" : "") + "</li>";
    }).join("");
    caja.innerHTML = html || '<li class="vacio">Sin datos todavía.</li>';

    // Para la línea de tiempo: hitos redondos de espectadores en Twitch y cada vez que cambia el video más visto.
    var HITOS = [2500, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000, 2000000, 5000000];
    var pasados = 0;
    esp.forEach(function (e) {
      while (pasados < HITOS.length && e.valor >= HITOS[pasados]) {
        if (filas.length && e.ts > filas[0].ts) eventosExtra.push({ ts: e.ts, texto: "Twitch pasa los " + num(HITOS[pasados]) + " espectadores a la vez", auto: true });
        pasados++;
      }
    });
    lideres.slice(1).forEach(function (l) {
      eventosExtra.push({ ts: l.ts, texto: "Nuevo video más visto en YouTube: " + l.que, auto: true });
    });
    lideresShort.slice(1).forEach(function (l) {
      eventosExtra.push({ ts: l.ts, texto: "Nuevo Short más visto en YouTube: " + l.que, auto: true });
    });

    // Tráilers oficiales de GTA VI (se miden desde el 13 nov).
    var tr = D.trailers || [];
    // Para la línea de tiempo: cada vez que un tráiler pasa otra decena de millones de visitas.
    tr.forEach(function (t) {
      var nombre = t.titulo.replace(/^Grand Theft Auto VI[:\s]*/, "") || t.titulo;
      t.serie.forEach(function (p, i) {
        if (!i) return;
        var antes = Math.floor(t.serie[i - 1].visitas / 1e7), ahoraM = Math.floor(p.visitas / 1e7);
        if (ahoraM > antes) eventosExtra.push({ ts: Date.parse(p.t), texto: "El " + nombre + " de GTA VI pasa los " + num(ahoraM * 10) + " millones de visitas", auto: true });
      });
    });
    $("records-trailers").innerHTML = tr.length ? tr.map(function (t) {
      var s = t.serie, u = s[s.length - 1], sube = s.length > 1 ? u.visitas - s[0].visitas : null;
      return "<li>" + enlace(urlVideo(t.id), limpio(t.titulo.replace(/^Grand Theft Auto VI[:\s]*/, "") || t.titulo)) + "<b>" + compacto(u.visitas) + "</b><small>visitas</small>" +
        (sube != null ? '<span class="rc-sube">+' + num(sube) + " desde el " + dia(Date.parse(s[0].t)) + "</span>" : "") + "</li>";
    }).join("") : '<li class="vacio">Todavía sin mediciones.</li>';
  })();

  lineaDeTiempo();

  /* ---------- Resumen del día (tarea 7.5) ----------
     Una tarjeta por día (en hora de Santiago) con lo más importante de ese día. Todo sale de los
     datos ya guardados; los cuadros iguales a los de "Logros y récords" para que se vean parejos. */
  (function () {
    var caja = $("resumen-tarjeta");
    if (!caja) return;
    var fLargo = new Intl.DateTimeFormat("es-CL", { timeZone: ZONA, weekday: "long", day: "numeric", month: "long" });
    function clave(ts) { var o = partes(ts); return o.year + "-" + String(o.month).padStart(2, "0") + "-" + String(o.day).padStart(2, "0"); }
    var dias = [];
    M.forEach(function (m) { var k = clave(m.ts); if (dias.indexOf(k) < 0) dias.push(k); });
    dias.reverse();   // lo más nuevo primero (pedido de Bruno)
    if (!dias.length) { caja.innerHTML = '<p class="vacio">Todavía no hay mediciones.</p>'; return; }
    var elegido = dias.indexOf(clave(SALIDA)) >= 0 ? clave(SALIDA) : dias[0];
    var ultimoDia = dias[0];

    function resumen(k) {
      var med = M.filter(function (m) { return clave(m.ts) === k; }), r = { med: med.length, huecos: 0 };
      med.forEach(function (m) {
        if (m.espectadores == null || m.interes == null) r.huecos++;
        if (m.espectadores != null && (!r.tw || m.espectadores > r.tw.espectadores)) r.tw = m;
        if (m.interes != null && (!r.tr || m.interes > r.tr.interes)) r.tr = m;
        if (m.kickEsp != null && (!r.kk || m.kickEsp > r.kk.kickEsp)) r.kk = m;   // Kick: desde el 16 nov
      });
      // Video y Short más vistos del día, por separado (pedido de Bruno, 2026-11-15), como en
      // "Logros y récords". Los videos sin la marca de Short cuentan como videos, igual que en las listas.
      (D.youtube || []).forEach(function (v) {
        var tipo = v.short === true ? "sh" : "yt";
        v.serie.forEach(function (p) {
          var ts = Date.parse(p.t);
          if (clave(ts) === k && (!r[tipo] || p.visitas > r[tipo].visitas)) r[tipo] = { visitas: p.visitas, ts: ts, titulo: v.titulo, url: urlVideo(v.id) };
        });
      });
      r.titulares = (D.noticias || []).filter(function (n) { var ts = Date.parse(n.t); return !isNaN(ts) && clave(ts) === k; }).length;
      r.reddit = ((D.reddit || {}).publicaciones || []).filter(function (p) { var ts = Date.parse(p.t); return !isNaN(ts) && clave(ts) === k; }).length;
      return r;
    }
    function cuadro(nombre, valor, uni, que, cuando) {
      return "<li><small>" + nombre + "</small><b>" + valor + '</b><span class="rc-uni">' + uni + "</span>" +
        (que ? '<p class="rc-que">' + que + "</p>" : "") + (cuando ? '<p class="rc-cuando">' + cuando + "</p>" : "") + "</li>";
    }
    function pintar() {
      $("resumen-dias").innerHTML = dias.map(function (k) {
        var ts = deSantiago(k + " 12:00");
        return '<button type="button" class="' + (k === elegido ? "activo" : "") + '" data-dia="' + k + '" aria-pressed="' + (k === elegido) + '">' + dia(ts) + "</button>";
      }).join("");
      var r = resumen(elegido), ts = deSantiago(elegido + " 12:00");
      caja.innerHTML = '<h3 class="rd-titulo">' + fLargo.format(new Date(ts)) + "</h3>" +
        (elegido === ultimoDia ? '<p class="rd-curso">Día en curso: se completa con cada medición.</p>' : "") +
        '<ul class="rc-vitrina rd-cuadros">' +
        (r.tw ? cuadro("Máximo en Twitch", num(r.tw.espectadores), "espectadores a la vez",
          r.tw.canal ? "Más visto: " + enlace(urlCanal(r.tw.canal.login), limpio(r.tw.canal.nombre)) : "", "a las " + hora(r.tw.ts))
          : cuadro("Máximo en Twitch", "—", "sin dato ese día")) +
        (r.kk ? cuadro("Máximo en Kick", num(r.kk.kickEsp), "espectadores a la vez",
          r.kk.kickCanal ? "Más visto: " + enlace(urlKick(r.kk.kickCanal.canal), limpio(r.kk.kickCanal.canal)) : "", "a las " + hora(r.kk.ts)) : "") +
        (r.yt ? cuadro("Video más visto", compacto(r.yt.visitas), "visitas", enlace(r.yt.url, limpio(r.yt.titulo)), "medido a las " + hora(r.yt.ts))
          : cuadro("Video más visto", "—", "sin dato ese día")) +
        (r.sh ? cuadro("Short más visto", compacto(r.sh.visitas), "visitas", enlace(r.sh.url, limpio(r.sh.titulo)), "medido a las " + hora(r.sh.ts))
          : cuadro("Short más visto", "—", "sin dato ese día")) +
        (r.tr ? cuadro("Interés en Google Trends", r.tr.interes, "de 100, lo más alto del día", "", "a las " + hora(r.tr.ts))
          : cuadro("Interés en Google Trends", "—", "sin dato ese día")) +
        cuadro("Titulares", num(r.titulares), r.titulares === 1 ? "titular publicado ese día" : "titulares publicados ese día") +
        cuadro("Publicaciones en r/GTA6", num(r.reddit), r.reddit === 1 ? "publicación guardada" : "publicaciones guardadas") +
        cuadro("Mediciones", num(r.med), r.med === 1 ? "medición guardada" : "mediciones guardadas", "", r.huecos ? r.huecos + " con algún hueco" : "sin huecos") +
        "</ul>";
    }
    $("resumen-dias").addEventListener("click", function (e) { var k = e.target.dataset.dia; if (k) { elegido = k; pintar(); } });
    pintar();
    gota($("resumen-dias"), "gota-sel", "button.activo", true);

    /* ---------- Descargar el resumen como imagen (tarea 7.8, idea 6) ----------
       Se dibuja en un <canvas> con los colores y letras del estilo que se está viendo. Solo
       texto y formas: las fotos de YouTube y Twitch vienen de otros sitios y el navegador no
       deja guardarlas dentro de una imagen. Formato A de Bruno (2026-11-14): cuadrada, 1080 x 1080. */
    function recortar(ctx, texto, ancho) {
      if (ctx.measureText(texto).width <= ancho) return texto;
      var letras = Array.from(texto);   // por letra, no por mitades de emoji (salía "👑 �…")
      while (letras.length > 1 && ctx.measureText(letras.join("") + "…").width > ancho) letras.pop();
      return letras.join("").trimEnd() + "…";
    }
    function dibujar(r, k, sel) {
      var W = 1080, H = 1080, u = 1;
      var lienzo = document.createElement("canvas"); lienzo.width = W; lienzo.height = H;
      var ctx = lienzo.getContext("2d"), css = getComputedStyle(document.documentElement);
      var ochenta = document.documentElement.dataset.tema === "ochenta";
      var c = function (n) { return css.getPropertyValue(n).trim(); };
      var fTit = c("--f-titulo"), fTxt = c("--f-texto"), a1 = c("--a1"), a2 = c("--a2"), texto = c("--texto"), tenue = c("--tenue");
      // Fondo
      var g = ctx.createLinearGradient(0, 0, 0, H);
      if (ochenta) { g.addColorStop(0, "#0d0221"); g.addColorStop(.6, "#2a0845"); g.addColorStop(1, "#0d0221"); }
      else { g.addColorStop(0, "#3b5bff"); g.addColorStop(.45, "#ff6fa8"); g.addColorStop(.75, "#ffb36b"); g.addColorStop(1, "#fff3e8"); }
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // Sol detrás del título
      var solY = 150 * u, solR = 150 * u;
      var gs = ctx.createLinearGradient(0, solY - solR, 0, solY + solR);
      gs.addColorStop(0, ochenta ? "#ffd1f0" : "#fff1a8"); gs.addColorStop(1, ochenta ? a1 : "#ff7a59");
      ctx.globalAlpha = ochenta ? .55 : .5; ctx.fillStyle = gs; ctx.beginPath(); ctx.arc(W / 2, solY, solR, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      if (ochenta) {   // cuadrícula de neón abajo
        ctx.strokeStyle = a1; ctx.globalAlpha = .35; ctx.lineWidth = 2 * u;
        var hz = H * .86;
        for (var y = hz; y < H; y += (y - hz) * .35 + 10 * u) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
        for (var x = -W; x <= 2 * W; x += 90 * u) { ctx.beginPath(); ctx.moveTo(W / 2 + (x - W / 2) * .15, hz); ctx.lineTo(x, H); ctx.stroke(); }
        ctx.globalAlpha = 1;
      }
      // Encabezado
      ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#fff";
      if (ochenta) { ctx.shadowColor = a1; ctx.shadowBlur = 30 * u; }
      var tt = .8;
      ctx.font = Math.round(96 * tt * u) + "px " + fTit; ctx.fillText("19·NOV·2026", W / 2, solY + 30 * tt * u);
      ctx.shadowBlur = 0;
      ctx.font = "700 " + Math.round(34 * tt * u) + "px " + fTxt;
      // Lema legible (pedido de Bruno, 2026-11-16): en 1986 iba celeste sobre el sol rosado y casi
      // no se leía. Ahora blanco con borde oscuro y brillo celeste.
      if (ochenta) {
        ctx.lineWidth = 6 * u; ctx.strokeStyle = "#12042e"; ctx.lineJoin = "round";
        ctx.strokeText("EL DÍA QUE SALIÓ GTA 6", W / 2, solY + 80 * tt * u);
        ctx.shadowColor = a2; ctx.shadowBlur = 16 * u; ctx.fillStyle = "#fff";
        ctx.fillText("EL DÍA QUE SALIÓ GTA 6", W / 2, solY + 80 * tt * u); ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = "#1b1440"; ctx.fillText("El día que salió GTA 6", W / 2, solY + 80 * tt * u);
      }
      var fecha = fLargo.format(new Date(deSantiago(k + " 12:00")));
      fecha = "Resumen del " + fecha;
      ctx.font = "700 " + Math.round(40 * u) + "px " + fTxt; ctx.fillStyle = ochenta ? "#fff" : "#1b1440";
      var yTop = solY + 150 * u;
      ctx.fillText(fecha, W / 2, yTop);
      if (k === ultimoDia) {
        ctx.font = "600 " + Math.round(24 * u) + "px " + fTxt; ctx.fillStyle = ochenta ? tenue : "#3d3566";
        var ult = M.length ? M[M.length - 1].ts : Date.now();
        ctx.fillText("Día en curso: datos hasta las " + hora(ult) + " (hora de Chile)", W / 2, yTop + 38 * u);
      }
      // Cuadros
      var cuadros = cuadrosImagen(r).filter(function (q) { return !sel || sel[q.id]; });
      // Tres columnas, como en la página: con 7 cuadros en dos columnas quedaban tan bajos que no
      // cabía el título del video. Con pocos cuadros (si se quitan en "Personalizar"), menos columnas.
      var cols = cuadros.length >= 5 ? 3 : cuadros.length >= 2 ? 2 : 1, filas = Math.max(1, Math.ceil(cuadros.length / cols));
      var margen = 60 * u, gap = 22 * u, yIni = yTop + (k === ultimoDia ? 70 : 40) * u, yFin = H - 100 * u;
      var cw = (W - 2 * margen - gap * (cols - 1)) / cols, ch = Math.min(260 * u, (yFin - yIni - gap * (filas - 1)) / filas);
      // Tamaño del contenido según el alto del cuadro: con poco alto, todo un poco más chico.
      var e = Math.min(1.25, ch / (190 * u)) * u, conExtra = ch >= 175 * u;
      yIni += Math.max(0, (yFin - yIni) - (ch * filas + gap * (filas - 1))) / 2;
      var enUltima = cuadros.length - (filas - 1) * cols, cwUlt = (W - 2 * margen - gap * (enUltima - 1)) / enUltima;
      cuadros.forEach(function (q, i) {
        q = [q.nombre, q.valor, q.uni, q.extra];
        var w = Math.floor(i / cols) === filas - 1 ? cwUlt : cw;   // la última fila reparte su ancho entre los que tenga
        var cx = margen + (i % cols) * (w + gap), cy = yIni + Math.floor(i / cols) * (ch + gap);
        ctx.fillStyle = ochenta ? "rgba(22,4,54,.82)" : "rgba(255,250,244,.92)";
        ctx.strokeStyle = ochenta ? a2 : "rgba(27,20,64,.08)"; ctx.lineWidth = 2 * u;
        ctx.beginPath(); ctx.roundRect(cx, cy, w, ch, 22 * u); ctx.fill(); if (ochenta) ctx.stroke();
        ctx.textAlign = "left"; var px = cx + 26 * u, ancho = w - 52 * u;
        var alto = (conExtra && q[3] ? 172 : 140) * e, y0 = cy + (ch - alto) / 2;   // contenido centrado en el cuadro
        ctx.font = "700 " + Math.round(20 * e) + "px " + fTxt; ctx.fillStyle = ochenta ? tenue : "#5f5884";
        ctx.fillText(recortar(ctx, q[0], ancho), px, y0 + 20 * e);
        ctx.font = "700 " + Math.round(62 * e) + "px " + fTxt; ctx.fillStyle = ochenta ? a2 : a1;
        if (ochenta) { ctx.shadowColor = a2; ctx.shadowBlur = 18 * u; }
        ctx.fillText(q[1], px, y0 + 84 * e); ctx.shadowBlur = 0;
        ctx.fillStyle = ochenta ? texto : "#1b1440";
        for (var t2 = 22; t2 > 17; t2--) {   // la letra de 2026 es más ancha: se achica un poco antes de cortar
          ctx.font = "600 " + Math.round(t2 * e) + "px " + fTxt;
          if (ctx.measureText(q[2]).width <= ancho) break;
        }
        ctx.fillText(recortar(ctx, q[2], ancho), px, y0 + 120 * e);
        if (q[3] && conExtra) {
          ctx.font = "500 " + Math.round(19 * e) + "px " + fTxt; ctx.fillStyle = ochenta ? tenue : "#5f5884";
          ctx.fillText(recortar(ctx, q[3], ancho), px, y0 + 158 * e);
        }
      });
      // Pie
      ctx.textAlign = "center"; ctx.font = "600 " + Math.round(22 * u) + "px " + fTxt;
      ctx.fillStyle = ochenta ? tenue : "#1b1440";
      ctx.fillText(recortar(ctx, "Datos de Twitch, Kick, YouTube, Google Trends, Google Noticias y Reddit · hora de Chile", W - 80 * u), W / 2, H - 62 * u);
      ctx.fillText("rust-max-bot.github.io/Documentaci-n-Gta-6-19-de-nombiembre", W / 2, H - 30 * u);
      return lienzo;
    }
    /* Los cuadros que puede llevar la imagen. "Personalizar" (pedido de Bruno, 2026-11-16) deja
       quitar los que no se quieran; por defecto van todos (Kick, solo si ese día se midió). */
    function cuadrosImagen(r) {
      var q = [
        { id: "twitch", nombre: "MÁXIMO EN TWITCH", valor: r.tw ? num(r.tw.espectadores) : "—", uni: r.tw ? "espectadores a la vez" : "sin dato", extra: r.tw && r.tw.canal ? "Más visto: " + r.tw.canal.nombre : "" },
        { id: "kick", nombre: "MÁXIMO EN KICK", valor: r.kk ? num(r.kk.kickEsp) : "—", uni: r.kk ? "espectadores a la vez" : "sin dato", extra: r.kk && r.kk.kickCanal ? "Más visto: " + r.kk.kickCanal.canal : "", hay: !!r.kk },
        { id: "video", nombre: "VIDEO MÁS VISTO", valor: r.yt ? compacto(r.yt.visitas) : "—", uni: r.yt ? "visitas" : "sin dato", extra: r.yt ? r.yt.titulo : "" },
        { id: "short", nombre: "SHORT MÁS VISTO", valor: r.sh ? compacto(r.sh.visitas) : "—", uni: r.sh ? "visitas" : "sin dato", extra: r.sh ? r.sh.titulo : "" },
        { id: "trends", nombre: "GOOGLE TRENDS", valor: r.tr ? String(r.tr.interes) : "—", uni: r.tr ? "de 100, lo más alto" : "sin dato", extra: "" },
        { id: "titulares", nombre: "TITULARES", valor: num(r.titulares), uni: "publicados ese día", extra: "" },
        { id: "reddit", nombre: "REDDIT r/GTA6", valor: num(r.reddit), uni: "publicaciones", extra: "" },
        { id: "mediciones", nombre: "MEDICIONES", valor: num(r.med), uni: r.huecos ? r.huecos + " con algún hueco" : "sin huecos", extra: "" }
      ];
      return q.filter(function (c) { return c.hay !== false; });
    }
    var NOMBRES = { twitch: "Twitch", kick: "Kick", video: "Video más visto", short: "Short más visto", trends: "Google Trends",
      titulares: "Titulares", reddit: "Reddit", mediciones: "Mediciones" };
    var quitados = {};   // lo que la persona desmarcó (se recuerda mientras la página esté abierta)
    function seleccion(r) {
      var sel = {};
      cuadrosImagen(r).forEach(function (c) { sel[c.id] = !quitados[c.id]; });
      return sel;
    }
    function conLetras(hacer) {   // las letras de la página tienen que estar cargadas antes de dibujar
      var css = getComputedStyle(document.documentElement);
      var letras = [css.getPropertyValue("--f-titulo"), css.getPropertyValue("--f-texto")].map(function (f) { return "700 40px " + f.trim(); });
      Promise.all(letras.map(function (f) { return document.fonts ? document.fonts.load(f).catch(function () {}) : null; })).then(hacer);
    }

    var acciones = document.createElement("div"); acciones.className = "rd-acciones";
    acciones.innerHTML = '<button type="button" class="rd-descargar" id="resumen-imagen">Descargar como imagen</button>' +
      '<button type="button" class="rd-personalizar" id="resumen-personalizar" aria-expanded="false" aria-controls="resumen-panel">Personalizar</button>';
    var panel = document.createElement("div"); panel.className = "rd-panel";   /* diseño A de Bruno */ panel.id = "resumen-panel"; panel.hidden = true;
    panel.innerHTML = '<div class="rd-previa"><canvas width="1080" height="1080" aria-label="Vista previa de la imagen"></canvas><small>Vista previa</small></div>' +
      '<fieldset class="rd-opciones"><legend>Qué mostrar</legend><div class="rd-marcas"></div>' +
      '<p class="rd-botones"><button type="button" class="rd-todo">Marcar todo</button></p></fieldset>';
    caja.insertAdjacentElement("afterend", acciones);
    acciones.insertAdjacentElement("afterend", panel);
    var previa = panel.querySelector("canvas"), marcas = panel.querySelector(".rd-marcas");
    function verPrevia() {
      if (panel.hidden) return;
      var r = resumen(elegido), sel = seleccion(r);
      marcas.innerHTML = cuadrosImagen(r).map(function (c) {
        return '<label class="' + (sel[c.id] ? "on" : "") + '"><input type="checkbox" value="' + c.id + '"' + (sel[c.id] ? " checked" : "") + "> " + NOMBRES[c.id] + "</label>";
      }).join("");
      conLetras(function () { var x = previa.getContext("2d"); x.clearRect(0, 0, 1080, 1080); x.drawImage(dibujar(r, elegido, sel), 0, 0); });
    }
    marcas.addEventListener("change", function (e) {
      var id = e.target.value;
      quitados[id] = !e.target.checked;
      var sel = seleccion(resumen(elegido));
      if (!Object.keys(sel).some(function (k) { return sel[k]; })) quitados[id] = false;   // al menos uno
      verPrevia();
    });
    panel.querySelector(".rd-todo").addEventListener("click", function () { quitados = {}; verPrevia(); });
    $("resumen-personalizar").addEventListener("click", function () {
      panel.hidden = !panel.hidden;
      this.setAttribute("aria-expanded", String(!panel.hidden));
      verPrevia();
    });
    $("resumen-dias").addEventListener("click", function (e) { if (e.target.dataset.dia) verPrevia(); });
    new MutationObserver(verPrevia).observe(document.documentElement, { attributes: true, attributeFilter: ["data-tema"] });   // al cambiar de estilo
    $("resumen-imagen").addEventListener("click", function () {
      var k = elegido, r = resumen(k), sel = seleccion(r);
      conLetras(function () {
        var lienzo = dibujar(r, k, sel);
        window.__ultimaImagen = lienzo;   // para las pruebas
        lienzo.toBlob(function (blob) {
          if (!blob) return;
          var a = document.createElement("a");
          a.href = URL.createObjectURL(blob); a.download = "resumen-gta6-" + k + ".png";
          document.body.appendChild(a); a.click(); a.remove();
          setTimeout(function () { URL.revokeObjectURL(a.href); }, 10000);
        }, "image/png");
      });
    });
  })();

  /* ---------- GTA frente a lo más visto (tarea 6.3; opción A "dos columnas", elegida por Bruno, 2026-11-13) ----------
     Usa la última medición del ranking de Twitch y de las tendencias de YouTube (se guardan
     desde el 13 nov). */
  (function () {
    var caja = $("comparacion-cols");
    if (!caja) return;
    var C = D.comparacion || {}, tw = C.twitch, yt = C.youtube;
    if (!tw && !yt) { caja.innerHTML = '<p class="vacio">Sin datos todavía.</p>'; return; }
    var t = Math.max(tw ? Date.parse(tw.t) : 0, yt ? Date.parse(yt.t) : 0);
    $("comparacion-nota").textContent = "Cómo le va a GTA comparado con todo lo demás en Twitch y YouTube. Última medición: " + dia(t) + ", " + hora(t) + ".";
    var GTA = { "1867279146": "GTA VI", "32982": "GTA V" };
    var html = "";
    if (tw) {
      var puesto = function (p) { return p ? "#" + p : "Fuera del top " + tw.leidas; };
      var tope = Math.max.apply(null, tw.comparadas.map(function (c) { return c.espectadores_top100; })) || 1;
      html += '<div class="cp-col"><h3 class="sub">Twitch</h3>' +
        '<div class="cp-puestos"><div><small>GTA VI</small><b>' + puesto(tw.gta6) + '</b></div><div><small>GTA V</small><b>' + puesto(tw.gta5) + "</b></div></div>" +
        '<ul class="cp-barras">' + tw.comparadas.map(function (c) {
          return '<li class="' + (GTA[c.id] ? "gta" : "") + '"><span class="cp-nom">' + limpio(GTA[c.id] || c.nombre) + (c.puesto ? " <i>#" + c.puesto + "</i>" : "") + "</span>" +
            '<span class="cp-b"><i style="width:' + Math.max(1, c.espectadores_top100 / tope * 100).toFixed(1) + '%"></i></span><span class="cp-num">' + compacto(c.espectadores_top100) + "</span></li>";
        }).join("") + "</ul>" +
        '<p class="cp-nota">Twitch da el orden de las categorías, no el total de espectadores. Cada barra suma el público de las 100 transmisiones más vistas de esa categoría; por eso una barra puede ser más larga que la de un puesto anterior.</p></div>';
    }
    if (yt) {
      var nombres = { CL: "Chile", US: "EE. UU." };
      html += '<div class="cp-col"><h3 class="sub">YouTube · videos en tendencia</h3><div class="cp-paises">' +
        Object.keys(yt.regiones).map(function (r) {
          var d = yt.regiones[r];
          return '<div><p class="cp-tit">' + (nombres[r] || r) + " <b>" + d.gta.length + " de " + d.en_lista + "</b></p>" +
            '<ol class="cp-videos">' + (d.gta.length ? d.gta.map(function (x) {
              return "<li><b>#" + x.puesto + "</b><span>" + enlace(urlVideo(x.id), limpio(x.titulo)) + "<small>" + limpio(x.canal) + "</small></span></li>";
            }).join("") : '<li class="vacio">Ningún video de GTA en la lista.</li>') + "</ol></div>";
        }).join("") + "</div>" +
        (yt.rockstar && yt.rockstar.suscriptores ? '<p class="cp-subs">Canal de Rockstar en YouTube: <b>' + compacto(yt.rockstar.suscriptores) + "</b> suscriptores <small>(YouTube redondea esta cifra)</small></p>" : "") +
        "</div>";
    }
    caja.innerHTML = html;
  })();

  /* ---------- Cápsula del tiempo (tarea 7.4; diseño C "casete", elegido por Bruno, 2026-11-15) ----------
     Los dos textos los escribe Bruno en web/capsula.js. Mientras uno esté vacío, su cinta sale
     cerrada: la página nunca pone texto en su nombre. Un texto largo sale recortado con
     "Leer todo". */
  (function () {
    var caja = document.getElementById("capsula-postales");
    if (!caja) return;
    var C = window.CAPSULA || {};
    var MESES = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
    var candado = '<svg class="cap-candado" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V7a5 5 0 0 1 10 0v3" fill="none" stroke="currentColor" stroke-width="2"/><rect x="4" y="10" width="16" height="11" rx="2.5" fill="currentColor"/></svg>';
    function cinta(t, cara, titulo, cerradaTexto, id) {
      t = t || {};
      var texto = typeof t.texto === "string" ? t.texto.trim() : "";
      var cabeza = '<div class="cap-etiqueta"><div class="cap-rayas"></div><div class="cap-tit"><small>' + cara + "</small><h3>" + titulo + "</h3></div>";
      if (!texto) {
        return '<article class="cap-cinta cerrada">' + cabeza + '<div class="cap-estampa vacia"></div></div>' +
          '<div class="cap-cuerpo cap-vacio">' + candado + "<span>" + cerradaTexto + "</span></div></article>";
      }
      // La fecha va como "AAAA-MM-DD" y se muestra tal cual (es un día, no una hora: no se convierte).
      var f = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t.fecha || "");
      if (t.fecha && !(f && +f[2] >= 1 && +f[2] <= 12 && +f[3] >= 1 && +f[3] <= 31)) { console.warn("capsula.js: la fecha \"" + t.fecha + "\" no tiene el formato AAAA-MM-DD"); f = null; }
      var parrafos = texto.split(/\n\s*\n/).map(function (p) { return "<p>" + limpio(p.trim()).replace(/\n/g, "<br>") + "</p>"; }).join("");
      return '<article class="cap-cinta">' + cabeza +
        '<div class="cap-estampa"><svg viewBox="-60 0 260 420" aria-hidden="true"><use href="#palmera"/></svg></div>' +
        (f ? '<p class="cap-matasellos" title="Escrito el ' + (+f[3]) + " " + MESES[+f[2] - 1].toLowerCase() + " " + f[1] + '"><span>Miami</span><b>' + (+f[3]) + " " + MESES[+f[2] - 1] + "</b><span>" + f[1] + "</span></p>" : "") +
        '</div><div class="cap-cuerpo"><div class="cap-texto" id="' + id + '">' + parrafos + "</div>" +
        '<button class="cap-leer" type="button" aria-expanded="false" aria-controls="' + id + '">Leer todo ▾</button></div></article>';
    }
    caja.innerHTML =
      cinta(C.antes, "Cara A", "Lo que espero de GTA 6 (mi opinión)", "Aquí irá lo que Rust espera de GTA 6.", "capsula-antes") +
      cinta(C.despues, "Cara B", "Lo que me pareció", ahora() < SALIDA ? "Se graba después del lanzamiento." : "Aquí irá lo que le pareció el juego a Rust.", "capsula-despues");
    // Si el texto cabe entero, no hace falta el botón.
    caja.querySelectorAll(".cap-cuerpo").forEach(function (c) {
      var t = c.querySelector(".cap-texto"), b = c.querySelector(".cap-leer");
      if (!t || !b) return;
      if (t.scrollHeight <= t.clientHeight + 2) c.classList.add("corto");
      b.addEventListener("click", function () {
        var abierto = c.classList.toggle("abierto");
        b.setAttribute("aria-expanded", abierto ? "true" : "false");
        b.textContent = abierto ? "Leer menos ▴" : "Leer todo ▾";
        if (!abierto) c.closest(".cap-cinta").scrollIntoView({ block: "nearest" });
      });
    });
  })();

  /* ---------- Aparecer al bajar ---------- */
  (function () {
    var bloques = document.querySelectorAll(".observar");
    if (!("IntersectionObserver" in window)) { bloques.forEach(function (b) { b.classList.add("visible"); }); return; }
    var ojo = new IntersectionObserver(function (vistas) {
      vistas.forEach(function (v) { if (v.isIntersecting) { v.target.classList.add("visible"); ojo.unobserve(v.target); } });
    }, { threshold: 0.12 });
    bloques.forEach(function (b) { ojo.observe(b); });
  })();
})();
