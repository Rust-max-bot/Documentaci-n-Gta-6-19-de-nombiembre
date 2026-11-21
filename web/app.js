/* Página del recuerdo. Lee window.DATOS (reales) o window.DATOS_EJEMPLO y dibuja todo.
   No usa librerías externas. Las horas llegan en UTC y aquí se convierten a Santiago. */
(function () {
  "use strict";

  var ZONA = "America/Santiago";
  var SALIDA = Date.UTC(2026, 10, 19, 3, 0);   // 19 nov 2026, 00:00 en Santiago
  var D = window.DATOS || window.DATOS_EJEMPLO || { mediciones: [], youtube: [], noticias: [], eventos: [] };
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
  // Ícono pequeño propio (símbolos "i-..." de index.html; pedido de Bruno, 2026-11-16).
  function ico(nombre) { return '<svg class="ico" aria-hidden="true"><use href="#i-' + nombre + '"/></svg>'; }
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
     datos.js trae de los titulares solo sus horas (en segundos), y las series de
     visitas de los videos en forma corta ([segundos, visitas]). Aquí se dejan como antes para el
     resto de la página. Los titulares completos de cada día se cargan aparte, solo cuando hacen
     falta (ver "Días cargados a pedido"). Los datos de ejemplo vienen completos. */
  function isoDe(seg) { return new Date(seg * 1000).toISOString(); }
  function diaUTC(seg) { return isoDe(seg).slice(0, 10); }
  if (D.formato === 2) {
    D.noticias = (D.noticias_t || []).map(function (seg, i) { return { t: isoDe(seg), i: i }; });
    [D.youtube, D.youtube_es, D.trailers].forEach(function (lista) {
      (lista || []).forEach(function (v) {
        v.serie = (v.serie || []).map(function (p) { return Array.isArray(p) ? { t: isoDe(p[0]), visitas: p[1] } : p; });
      });
    });
  }

  /* ---------- Días cargados a pedido ----------
     Cada web/dias/AAAA-MM-DD.js (día UTC) llama a window.DATOS_DIA con los titulares de ese
     día. Se piden con una etiqueta <script> (funciona también abriendo la
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
      if (!(D.dias || {})[dia]) return Promise.resolve({ noticias: [] });
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
  // Hora corta para el eje de los gráficos (9.4, opción C de Bruno): "6 p. m." o "18 h".
  function horaCorta(ts) { var h = partes(ts).hour; return en12 ? (h % 12 || 12) + (h < 12 ? " a. m." : " p. m.") : h + " h"; }
  // "de la mañana", "de la tarde"…: aclara una hora de 24 h en palabras.
  function momento(ts) {
    var h = partes(ts).hour, h12 = h % 12 || 12;
    if (h === 0) return "medianoche";
    if (h === 12) return "mediodía";
    return h12 + (h < 6 ? " de la madrugada" : h < 12 ? " de la mañana" : h < 20 ? " de la tarde" : " de la noche");
  }
  function dia(ts) { return fDia.format(new Date(ts)).replace(".", ""); }
  /* 9.4 (Bruno, 2026-11-16): formatToParts es lento y se llama miles de veces (servidores, tabla,
     ejes...). Se guarda lo ya calculado por minuto (las partes no usan los segundos); con ~1.000
     mediciones bajó de ~480 a ~40 ms en un celular lento simulado (y "Personalizar", de 460 a 30 ms). Quien la llama solo lee el objeto. */
  var memoPartes = new Map();
  function partes(ts) {
    var n = typeof ts === "number" ? ts : +new Date(ts), clave = Math.floor(n / 60000), o = memoPartes.get(clave);
    if (o) return o;
    o = {}; fPartes.formatToParts(new Date(n)).forEach(function (p) { o[p.type] = +p.value; });
    if (memoPartes.size > 50000) memoPartes.clear();
    memoPartes.set(clave, o); return o;
  }
  function desfase(ts) { var o = partes(ts); return Date.UTC(o.year, o.month - 1, o.day, o.hour, o.minute) - Math.floor(ts / 60000) * 60000; }
  /* Convierte "2026-11-19 02:10" (hora de Santiago) a un instante exacto */
  function deSantiago(texto) {
    var m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(texto || "");
    if (!m) return NaN;
    var g = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
    return g - desfase(g);
  }
  /* Formatos de número guardados (7.1): toLocaleString con opciones arma un formato nuevo en cada
     llamada y, al rebobinar, se llama miles de veces por parada. Mismo resultado, mucho más rápido. */
  var fNum = new Intl.NumberFormat("es-CL"), fDec1 = new Intl.NumberFormat("es-CL", { maximumFractionDigits: 1 }), fDec0 = new Intl.NumberFormat("es-CL", { maximumFractionDigits: 0 });
  function num(n) { return fNum.format(Math.round(n)); }
  /* 2.500 -> "2,5 mil"; 12.500 -> "12,5 mil"; 245.600 -> "246 mil": un decimal bajo los
     100 mil, para no redondear a miles enteros (antes 2.500 salía "3 mil"). */
  function compacto(n) {
    if (n >= 1e6) return fDec1.format(n / 1e6) + " M";
    if (n >= 1e3) return (n < 1e5 ? fDec1 : fDec0).format(n / 1e3) + " mil";
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
    return /^https:\/\/(static-cdn\.jtvnw\.net|files\.kick\.com)\//.test(url || "")
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
  /* Vista de los datos (tarea 7.1, rebobinar el lanzamiento). Las secciones que viajan en el
     tiempo (fichas, récords, gráficos de Twitch/Kick y de Trends, tabla, videos, comparación y
     titulares) se dibujan con una vista: HOY (todo lo medido) o la de un momento del rebobinado
     (lo medido hasta ese momento; ver "Rebobinar el lanzamiento", al final). "corte" es la hora
     del momento (null = hoy). Para sumar otra sección al rebobinado: que se dibuje con una vista
     y llamarla en pintarVista(). */
  var HOY = { D: D, M: M, picoTwitch: picoTwitch, picoKick: picoKick, picoTrends: picoTrends, corte: null, fallos: {} };
  function urlKick(canal) { return /^[\w-]{1,40}$/.test(canal || "") ? "https://kick.com/" + canal : ""; }
  var SERVICIOS = [["rockstar", "Rockstar"], ["playstation", "PlayStation Network"], ["xbox", "Red de Xbox"]];

  /* ¿Esta carga la hizo la propia página al traer datos nuevos? (ver "Actualización sola") */
  var recargaSola = false;
  try { recargaSola = sessionStorage.getItem("gta6-recarga") === "1"; sessionStorage.removeItem("gta6-recarga"); } catch (e) { /* sin almacenamiento */ }

  /* Volver al mismo lugar tras la recarga automática (9.4, 2026-11-21). Antes se hacía un solo
     scrollTo al arrancar, cuando la página aún no tenía todo su alto: el navegador lo recortaba y,
     con el desplazamiento suave del CSS, la vista se iba ~2.000 px más arriba (Titulares quedaba
     1.700 a 4.600 px corrido). Ahora recargar() guarda la sección que estaba arriba de la
     pantalla y cuánto se había bajado dentro de ella, y le pide al navegador que no restaure él
     (history.scrollRestoration = "manual"); aquí se vuelve a esa sección, sin animación, y se
     sigue corrigiendo unos segundos mientras termina de armarse lo de arriba (titulares de otros
     días, gráficos). Si la persona mueve la página, se deja de corregir.
     Pestaña en segundo plano (lo normal: la recarga sola salta al ocultarla): ahí el navegador
     no corre requestAnimationFrame, así que se espera a que vuelva a estar a la vista para
     empezar los 5 s. Mientras tanto, si llega otra recarga sola, se guarda el lugar pendiente
     (lugarPendiente), no la altura de ese momento, que todavía no está corregida. */
  var lugarPendiente = null, recargandoSola = false;
  function lugarActual() {
    if (lugarPendiente) return lugarPendiente;
    var secs = document.querySelectorAll("section[id]"), elegida = null;
    for (var i = 0; i < secs.length; i++) {
      var r = secs[i].getBoundingClientRect();
      if (r.height > 0 && r.top <= 1) elegida = { id: secs[i].id, dentro: -r.top };
    }
    return { y: window.scrollY, id: elegida ? elegida.id : "", dentro: elegida ? elegida.dentro : 0 };
  }
  /* Lo mismo sirve para abrir un enlace a una sección (index.html#seccion-noticias, 9.4, 21 nov):
     el navegador baja hasta ella con la animación suave del CSS, pero lo de arriba todavía cambia
     de alto mientras baja (a 384 px en Miami 1986 se pasaba 1.200 px o no llegaba). Aquí se deja
     la sección arriba y se sigue corrigiendo igual que tras una recarga. */
  (function () {
    var lugar = null, porRecarga = recargaSola;
    // Ojo: devolver "auto" antes de que termine la carga hace que el navegador, al terminar,
    // ponga él la altura vieja y tire a la persona de vuelta: se espera al evento "load".
    function auto() {
      if (document.readyState !== "complete") { window.addEventListener("load", auto, { once: true }); return; }
      try { history.scrollRestoration = "auto"; } catch (e) { /* nada */ }
    }
    if (porRecarga) {
      try { lugar = JSON.parse(sessionStorage.getItem("gta6-lugar-recarga") || "null"); sessionStorage.removeItem("gta6-lugar-recarga"); } catch (e) { /* nada */ }
      if (!lugar || typeof lugar.y !== "number") { auto(); return; }
      lugarPendiente = lugar;
    } else {
      var id = "";
      try { id = decodeURIComponent(location.hash.slice(1)); } catch (e) { /* # mal escrito */ }
      var el0 = id && document.getElementById(id);
      if (!el0) return;
      lugar = { y: 0, id: id, dentro: -(parseFloat(getComputedStyle(el0).scrollMarginTop) || 0) };
    }
    // Si la persona recarga ella misma antes de terminar (F5, el botón del navegador, tirar
    // para recargar en el celular), "manual" quedaría pegado en esa entrada del historial y sus
    // recargas ya no volverían a su altura: al irse, se devuelve "auto" (abogado del diablo,
    // 21 nov). Salvo que sea otra recarga sola, que necesita "manual".
    function alSalir() { if (!recargandoSola) auto(); }
    if (porRecarga) window.addEventListener("pagehide", alSalir);
    var hasta = 0, quieto = true, yPuesto = null;
    function soltar() { quieto = false; }
    var toques = ["wheel", "touchstart", "keydown", "pointerdown", "mousedown"];
    function destino() {
      var el = lugar.id && document.getElementById(lugar.id);
      if (el && !el.hidden && el.getBoundingClientRect().height > 0) return el.getBoundingClientRect().top + window.scrollY + lugar.dentro;
      return lugar.y;
    }
    /* Arrastrar la barra de desplazamiento, tocar su riel o "buscar en la página" no dan
       ninguno de esos eventos: se nota porque la página saltó más de 40 px de una vez sin que
       la moviera este código Y la sección quedó corrida. Con menos, son ajustes del propio
       diseño mientras se arma (se vieron de ~19 px), que hay que seguir corrigiendo. Y solo con
       la página ya cargada: mientras carga, el propio navegador da saltos de miles de px. Solo
       tras una recarga: al abrir un enlace, el navegador también mueve la página mientras baja. */
    function alMover() {
      if (document.readyState !== "complete") return;
      if (yPuesto === null || Math.abs(window.scrollY - yPuesto) <= 40) return;
      if (Math.abs(destino() - window.scrollY) > 40) quieto = false;
    }
    function ir() {
      if (quieto) {
        var d = destino() - window.scrollY;
        if (Math.abs(d) > 1) window.scrollTo({ top: window.scrollY + d, behavior: "instant" });
        yPuesto = window.scrollY;
      }
      if (quieto && performance.now() < hasta) requestAnimationFrame(ir);
      else {
        toques.forEach(function (t) { window.removeEventListener(t, soltar, { passive: true, capture: true }); });
        window.removeEventListener("scroll", alMover);
        lugarPendiente = null;   // desde aquí, el lugar es donde esté la persona
        window.removeEventListener("pagehide", alSalir);
        if (porRecarga) auto();   // las recargas que haga la persona (F5) las vuelve a restaurar el navegador
      }
    }
    function empezar() {
      toques.forEach(function (t) { window.addEventListener(t, soltar, { passive: true, capture: true }); });
      if (porRecarga) window.addEventListener("scroll", alMover, { passive: true });
      hasta = performance.now() + 5000;
      ir();
    }
    if (!document.hidden) empezar();
    else document.addEventListener("visibilitychange", function alVolver() {
      if (document.hidden) return;
      document.removeEventListener("visibilitychange", alVolver);
      empezar();
    });
  })();

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
      var L = LUGARES[b.dataset.lugar], ya = relojPortada() >= L.ts;
      var marcado = b.dataset.lugar === lugar ? "true" : "false";
      // Solo si cambia (9.4): corre cada segundo y reescribirlo hacía que la gota volviera a medir.
      if (b.getAttribute("aria-pressed") !== marcado) b.setAttribute("aria-pressed", marcado);
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
  /* Tres horas cero (pedido de Bruno, 2026-11-17): antes solo se celebraba la de Chile. Ahora la
     fiesta llega en cuanto sale en cada lugar (Nueva Zelanda, Chile y Miami), para todos los que
     tengan la página abierta, mire el lugar que se mire. Al abrir la página se celebra solo el
     último lugar donde ya salió, si fue hace menos de un día. */
  var ORDEN = ["nz", "cl", "mia"];
  var celebradoEn = null;   // último lugar ya celebrado en esta visita
  /* Al rebobinar (7.1, pedido de Bruno), la portada también viaja: cuenta regresiva, lugares con ✓,
     lema y aviso de ese momento, y al pasar por una hora cero, su fiesta (ver portadaEn). */
  var horaRebobinada = null;
  function relojPortada() { return horaRebobinada != null ? horaRebobinada : ahora(); }
  function ultimoLugar(t) { var u = null; ORDEN.forEach(function (k) { if (t >= LUGARES[k].ts) u = k; }); return u; }
  function cuenta() {
    var t = relojPortada(), caja = $("cuenta"), falta = LUGARES[lugar].ts - t, u = ultimoLugar(t);
    if (horaRebobinada == null && u && u !== celebradoEn) { celebradoEn = u; horaCero(u, t - LUGARES[u].ts < FIESTA); }
    if (falta <= 0) pintar(caja, Math.floor(-falta / 1000), "desde");
    else pintar(caja, Math.floor(falta / 1000), "falta");
    pintarLugares();
    pintarAviso(t);
  }
  /* Portada en un momento del rebobinado (T) o de hoy (null). "fiestaDe": el lugar por cuya hora
     cero se acaba de pasar hacia adelante, para repetir su fiesta. */
  function portadaEn(T, fiestaDe) {
    horaRebobinada = T;
    var u = ultimoLugar(relojPortada());
    if (T == null) pararFiesta();
    if (u !== celebradoEn) {
      celebradoEn = u;
      if (u) horaCero(u, !!fiestaDe, true);
      else { var lema = document.querySelector(".lema"); lema.textContent = "El día que salió GTA 6"; lema.classList.remove("ya-salio"); }
    } else if (fiestaDe) horaCero(fiestaDe, true, true);
    cuenta();
  }
  function pararFiesta() {
    var portada = document.querySelector(".portada");
    portada.querySelectorAll(".fuegos, .reflectores").forEach(function (n) { n.remove(); });
    portada.classList.remove("fiesta"); clearTimeout(finFiesta);
  }
  function horaCero(k, conFiesta, rebobinado) {
    var lema = document.querySelector(".lema"), portada = document.querySelector(".portada");
    // Hasta que salga en Chile, el lema aclara que es en Nueva Zelanda.
    lema.textContent = k === "nz" ? "¡Ya salió GTA 6 en Nueva Zelanda!" : "¡Ya salió GTA 6!";
    lema.classList.remove("ya-salio"); void lema.offsetWidth; lema.classList.add("ya-salio");   // la entrada vuelve a empezar
    if (!conFiesta || window.matchMedia("(prefers-reduced-motion: reduce)").matches || (recargaSola && !rebobinado)) return;   // tras una recarga automática, sin repetir la fiesta
    // Si todavía dura la fiesta anterior (por ejemplo, se abrió la página un minuto antes de la
    // hora cero de Chile y se estaba celebrando la de Nueva Zelanda), empieza una nueva desde cero.
    portada.querySelectorAll(".fuegos, .reflectores").forEach(function (n) { n.remove(); });
    clearTimeout(finFiesta);
    // Fuegos artificiales y reflectores a la vez (elección de Bruno, 2026-11-13: opciones A y C).
    portada.classList.add("fiesta");
    fuegos(portada);
    reflectores(portada);
    finFiesta = setTimeout(function () { portada.classList.remove("fiesta"); }, 22000);
  }
  var finFiesta = null;
  /* Aviso de las horas cero (pedido de Bruno, 2026-11-17): desde un día antes de la salida en
     Nueva Zelanda hasta un día después de la de Miami. Cambia solo al llegar cada hora cero y
     vuelve a aparecer aunque se haya cerrado. */
  var avisoCerrado = null, flotar = function () {};   // flotar: lo define el bloque de abajo
  function quedan(ms) {
    var m = Math.max(1, Math.ceil(ms / 60000)), h = Math.floor(m / 60);
    return (h ? h + " h " : "") + (m % 60) + " min";
  }
  function pintarAviso(t) {
    var caja = $("aviso-lanz"); if (!caja) return;
    var nz = LUGARES.nz.ts, cl = LUGARES.cl.ts, mia = LUGARES.mia.ts, etapa, titulo, texto;
    if (t < nz - FIESTA || t >= mia + FIESTA) etapa = null;
    else if (t < nz) { etapa = "antes"; titulo = "GTA 6 sale primero en Nueva Zelanda";
      texto = "A las " + hora(nz) + " de Chile (" + dia(nz) + ") · faltan " + quedan(nz - t); }
    else if (t < cl) { etapa = "nz"; titulo = "¡GTA 6 ya salió en Nueva Zelanda!";
      texto = "Es uno de los primeros lugares del mundo · en Chile faltan " + quedan(cl - t); }
    else if (t < mia) { etapa = "cl"; titulo = "¡GTA 6 ya salió en Chile!";
      texto = "Antes salió en Nueva Zelanda · en Miami faltan " + quedan(mia - t); }
    else { etapa = "mia"; titulo = "¡GTA 6 ya salió también en Miami!";
      texto = "Ya se juega en Nueva Zelanda, Chile y Miami"; }
    if (!etapa || etapa === avisoCerrado) { caja.hidden = true; flotar(false); return; }
    if (caja.dataset.etapa !== etapa) {
      caja.dataset.etapa = etapa;
      caja.classList.toggle("celebra", etapa !== "antes");
      caja.querySelector("strong").textContent = titulo;
      caja.classList.remove("entra"); void caja.offsetWidth; caja.classList.add("entra");
    }
    var sp = caja.querySelector(".aviso-lanz-texto span");
    if (sp.textContent !== texto) sp.textContent = texto;
    caja.hidden = false;
    // Si aparece (o vuelve a aparecer) con la portada ya fuera de la vista, flota de una vez.
    if (!caja.classList.contains("flota") && $("aviso-sitio").getBoundingClientRect().bottom <= 0) flotar(true);
  }
  (function () {
    var caja = $("aviso-lanz"); if (!caja) return;
    caja.querySelector(".aviso-lanz-cerrar").addEventListener("click", function () { avisoCerrado = caja.dataset.etapa; caja.hidden = true; ponerFlota(false); });
    // Opción C de Bruno, "que te siga, por si acaso": si la portada sale de la vista al bajar, el
    // aviso flota arriba al centro. Su sitio guarda el alto para que la portada no salte.
    var sitio = $("aviso-sitio");
    flotar = ponerFlota;
    function ponerFlota(si) {
      if (!sitio || si === caja.classList.contains("flota")) return;
      // Al flotar pasa al final de <body>: dentro de la portada quedaría debajo del contenido
      // (la portada y <main> tienen su propia capa), aunque esté fija arriba.
      if (si) { sitio.style.height = caja.offsetHeight + 14 + "px"; caja.classList.add("flota", "baja"); document.body.appendChild(caja); }
      else { caja.classList.remove("flota", "baja"); sitio.appendChild(caja); sitio.style.height = ""; }
    }
    if (sitio && "IntersectionObserver" in window) {
      new IntersectionObserver(function (e) {
        ponerFlota(!e[0].isIntersecting && e[0].boundingClientRect.bottom <= 0 && !caja.hidden);
      }).observe(sitio);
    }
  })();
  // Fuegos artificiales dibujados en un lienzo encima del cielo, con los colores del estilo.
  function fuegos(portada) {
    var lienzo = document.createElement("canvas"), cx = lienzo.getContext("2d");
    lienzo.className = "fuegos"; portada.appendChild(lienzo);
    // De noche y al atardecer, los colores del estilo sumados como luz. De día, con el cielo claro,
    // esa suma casi no se ve: se usan colores fuertes pintados encima y chispas más gruesas.
    // Estilo y hora se leen en cada estallido (pedido de Bruno, 2026-11-17): si se cambia de Miami
    // 1986 a 2026 o de día a noche en plena fiesta, los fuegos siguen con los colores nuevos.
    var dia, colores;
    function leerEstilo() {
      dia = document.documentElement.dataset.hora === "dia";
      var css = getComputedStyle(document.documentElement);
      colores = dia ? ["#ff2e97", "#6a2bd9", "#ff6a00", "#e0006e"]
        : ["--a1", "--a2", "--a3"].map(function (n) { return css.getPropertyValue(n).trim(); }).concat("#ffffff");
    }
    leerEstilo();
    var w, h, chispas = [], inicio = performance.now();
    function medir() { w = lienzo.width = portada.clientWidth; h = lienzo.height = portada.clientHeight; }
    medir();
    function estallar() {
      leerEstilo();
      if (portada.clientWidth !== w || portada.clientHeight !== h) medir();   // la portada cambió de tamaño
      var x = w * (.15 + Math.random() * .7), y = h * (.12 + Math.random() * .35), c = colores[Math.floor(Math.random() * colores.length)];
      for (var k = 0; k < 70; k++) { var a = Math.random() * 6.283, v = 1.5 + Math.random() * 4.5; chispas.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vida: 1, c: c }); }
    }
    var proxima = 0;
    (function cuadro(t) {
      if (!lienzo.isConnected) return;   // otra fiesta lo reemplazó o se salió del rebobinado
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
  /* Al rebobinar (7.1, opción C de Bruno): el valor de ese momento y, al lado, el récord que había
     hasta ese momento. Si la fuente falló en esa medición, el último dato bueno, con su hora. */
  function ultimoBueno(V, campo) {
    for (var i = V.M.length - 1; i >= 0; i--) if (V.M[i][campo] != null) return V.M[i];
    return null;
  }
  function pintarFichas(V) {
    var Mv = V.M, pT = V.picoTwitch, pK = V.picoKick, pR = V.picoTrends;
    var fallos = Mv.filter(function (m) { return m.espectadores == null || m.interes == null; }).length;
    var f;
    if (V.corte == null) f = [
      ["Máximo en Twitch", pT ? pT.espectadores : null, pT ? "espectadores · " + dia(pT.ts) + " " + hora(pT.ts) : "sin datos todavía"],
      // Opción C de Bruno (2026-11-17): Kick en la franja y los huecos como una línea de "Mediciones guardadas".
      ["Máximo en Kick", pK ? pK.kickEsp : null, pK ? "espectadores · " + dia(pK.ts) + " " + hora(pK.ts) : "sin datos todavía"],
      ["Máximo en Google Trends", pR ? pR.interes : null, pR ? "de 100 · " + dia(pR.ts) + " " + hora(pR.ts) : "sin datos todavía"],
      ["Mediciones guardadas", Mv.length, Mv.length ? "del " + dia(Mv[0].ts) + " al " + dia(Mv[Mv.length - 1].ts) + " · " + num(fallos) + " con huecos" : "sin datos todavía"]
    ];
    else {
      var enMomento = function (nombre, campo, pico, uni) {
        var m = ultimoBueno(V, campo);
        if (!m) return [nombre, null, "sin datos todavía"];
        var tarde = V.corte - m.ts > 20 * 60000 ? " (dato de las " + hora(m.ts) + ")" : "";
        return [nombre, m[campo], uni + " en ese momento" + tarde + '<em class="rb-record">Récord hasta ahí: <b>' + num(pico[campo]) + "</b> · <span class=\"rb-nw\">" + dia(pico.ts) + " " + hora(pico.ts) + "</span></em>"];
      };
      f = [
        enMomento("Twitch", "espectadores", pT, "espectadores"),
        enMomento("Kick", "kickEsp", pK, "espectadores"),
        enMomento("Google Trends", "interes", pR, "de 100"),
        ["Mediciones guardadas", Mv.length, "hasta ese momento · " + num(fallos) + " con huecos"]
      ];
    }
    $("fichas").innerHTML = f.map(function (x) {
      var b = V.corte == null ? '<b data-hasta="' + (x[1] == null ? "" : x[1]) + '">' + (x[1] == null ? "—" : "0") + "</b>"
        : x[1] == null ? "<b>—</b>" : '<b data-rb="f:' + x[0] + '" data-v="' + x[1] + '">' + num(x[1]) + "</b>";
      return '<div class="ficha"><small>' + x[0] + "</small>" + b + "<span>" + x[2] + "</span></div>";
    }).join("");
    if (V.corte == null) contarFichas();
  }
  /* Números que cuentan al rebobinar (7.1 a, opción 1 elegida por Bruno, 2026-11-20; después, a
     pedido suyo, en todas las secciones que viajan): al cambiar de momento, cada número con
     data-rb (su nombre) y data-v (su valor) cuenta en 250 ms desde lo que mostraba hasta el valor
     nuevo, en vez de saltar; así cabe de sobra en una parada a 4x (500 ms). Si llega otra parada a
     mitad de la cuenta, sigue desde lo que se ve. Los números se marcan con cifra() y los cuenta
     ir(), en el rebobinado, de una vez para toda la página. Sin cuenta: al arrastrar la barra
     (CONTEO.quieto), con "reducir movimiento", en la primera parada (no hay número anterior), los
     que aparecen por primera vez y los que están fuera de la pantalla (no se ven; así no se gasta
     en ellos). CONTEO.parar() olvida los números al abrir y al salir del rebobinado. */
  // desde (opcional): de dónde cuenta un número que aparece por primera vez (si no, aparece quieto).
  function cifra(clave, v, fmt, desde) {
    var f = fmt || num;
    return '<span data-rb="' + limpio(clave) + '" data-v="' + v + '"' + (f === compacto ? ' data-f="c"' : "") +
      (typeof desde === "number" ? ' data-desde="' + desde + '"' : "") + ">" + f(v) + "</span>";
  }
  var CONTEO = (function () {
    var vistos = {}, ultimas = {}, aLaVista = null, yaConto = false;   // ultimas: los números de la parada anterior
    /* Qué secciones se ven: lo avisa IntersectionObserver por su cuenta. Medir cada número en cada
       parada (getBoundingClientRect) obligaba a calcular la página dos veces y la hacía el doble de
       lenta en un celular (medido con la CPU 4 veces más lenta). */
    function mirarSecciones() {
      if (aLaVista || !("IntersectionObserver" in window)) return;
      aLaVista = new Set();
      var io = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) { if (e.isIntersecting) aLaVista.add(e.target); else aLaVista.delete(e.target); });
      }, { rootMargin: "100px 0px" });
      document.querySelectorAll("main > section").forEach(function (s) { io.observe(s); });
    }
    function seVeSec(sec) { return !sec || !aLaVista || aLaVista.has(sec); }   // la barra del rebobinado (fuera de main) siempre se ve
    function contar(caja) {
      mirarSecciones();
      // Se pregunta cada vez (no QUIETO): Firefox tarda en avisar si el visitante lo cambia con la página abierta.
      var quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches, usadas = {};
      var primera = !yaConto, ahora = {}; yaConto = true;   // en la primera parada nada cuenta, tampoco con data-desde
      caja.querySelectorAll("[data-rb]").forEach(function (b) {
        var clave = b.dataset.rb, n = usadas[clave] || 0, sec = b.closest("main > section");
        usadas[clave] = n + 1;
        if (n) clave += "~" + n;   // el mismo video en Global y en español: el mismo número, dos lugares
        var fin = +b.dataset.v, fmt = b.dataset.f === "c" ? compacto : num, antes = vistos[clave];
        if (antes) cancelAnimationFrame(antes.cuadro);
        // Un número que no estaba en la parada anterior cuenta desde data-desde (si lo trae); si no,
        // desde lo último que mostró (o aparece quieto, si nunca se vio).
        var inicio = antes && ultimas[clave] ? antes.visto : b.dataset.desde && !primera ? +b.dataset.desde : antes ? antes.visto : fin;
        ahora[clave] = 1;
        var v = vistos[clave] = { visto: inicio, cuadro: 0 }, desde = v.visto;
        var seVe = seVeSec(sec);
        if (desde === fin || CONTEO.quieto || quieto || !seVe) { v.visto = fin; return; }   // el HTML ya trae el valor final
        // Se cambia el texto que ya está (no textContent): así no se avisa a los observadores de
        // las gotas de los filtros, que medirían la página en cada cuadro.
        var texto = b.firstChild, t0 = null;
        texto.data = fmt(desde);
        v.cuadro = requestAnimationFrame(function paso(t) {
          if (t0 == null) t0 = t;
          var p = Math.min(1, (t - t0) / 250), e = 1 - Math.pow(1 - p, 3);   // frena al final, como las fichas al abrir
          v.visto = p < 1 ? desde + (fin - desde) * e : fin;
          texto.data = fmt(v.visto);
          if (p < 1) v.cuadro = requestAnimationFrame(paso);
        });
      });
      ultimas = ahora;
    }
    function parar() { Object.keys(vistos).forEach(function (c) { cancelAnimationFrame(vistos[c].cuadro); }); vistos = {}; ultimas = {}; yaConto = false; }
    // seVe: lo usan también los gráficos, que se animan solos (ver grafico).
    return { quieto: false, contar: contar, parar: parar, seVe: function (el) { mirarSecciones(); return seVeSec(el.closest("main > section")); } };
  })();
  pintarFichas(HOY);
  function contarFichas() {
    var quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    $("fichas").querySelectorAll("[data-hasta]").forEach(function (b) {
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
  }

  /* ---------- Línea de tiempo ----------
     Se dibuja al final (lineaDeTiempo), porque también usa los récords de "Logros y récords". */
  var eventosExtra = [];   // los llena la sección de récords: hitos de Twitch, video más visto, tráilers
  /* Al rebobinar (7.1, pedido de Bruno): solo los eventos hasta ese momento, así la línea crece al
     avanzar y se achica al retroceder; los máximos son los que había hasta entonces. */
  function lineaDeTiempo(V) {
    V = V || HOY;
    var hasta = V.corte == null ? Infinity : V.corte, t = V.corte == null ? ahora() : V.corte;
    var ev = eventosExtra.filter(function (e) { return e.ts <= hasta; });
    // Hora cero de cada lugar (tarea 7.6), solo cuando ya pasó.
    [["nz", "Medianoche en Nueva Zelanda: GTA 6 ya se puede jugar allí"], ["cl", "Hora cero en Chile: sale GTA 6"],
     ["mia", "Medianoche en Miami: GTA 6 ya se puede jugar allí"]].forEach(function (x) {
      if (t >= LUGARES[x[0]].ts) ev.push({ ts: LUGARES[x[0]].ts, texto: x[1], auto: true, tipo: "lanzamiento" });
    });
    var pT = V.picoTwitch, pR = V.picoTrends;
    // n y tras: el número va aparte, para que cuente al rebobinar (cifra).
    if (pT) ev.push({ ts: pT.ts, texto: "Máximo de espectadores en Twitch: ", n: pT.espectadores, tras: "", auto: true, tipo: "envivo" });
    if (pR) ev.push({ ts: pR.ts, texto: "Máximo de búsquedas en Google Trends (", n: pR.interes, tras: " de 100)", auto: true, tipo: "tendencia" });
    SERVICIOS.forEach(function (s) {
      var antes = "ok";
      V.M.forEach(function (m) {
        var e = m.servidores[s[0]]; if (e == null) return;
        if (e !== "ok" && antes === "ok") ev.push({ ts: m.ts, texto: s[1] + " empieza a tener problemas", auto: true, tipo: "servidor" });
        if (e === "ok" && antes !== "ok") ev.push({ ts: m.ts, texto: s[1] + " vuelve a funcionar", auto: true, tipo: "servidor" });
        antes = e;
      });
    });
    (D.eventos || []).concat(window.EVENTOS || []).forEach(function (e) {
      var ts = deSantiago(e.hora);
      if (!isNaN(ts) && ts <= hasta && e.texto) ev.push({ ts: ts, texto: e.texto, auto: false, tipo: /^\s*Rockstar\s*:/i.test(e.texto) ? "servidor" : "mano" });
    });
    ev.sort(function (a, b) { return b.ts - a.ts; });   // lo más nuevo arriba (pedido de Bruno)
    lineaNueva(ev);
  }
  var fDiaSemana = new Intl.DateTimeFormat("es-CL", { timeZone: ZONA, weekday: "long" });
  /* Rediseño (pedido de Bruno, 2026-11-17; opción A, agrupada por día; descartada B, tarjetas a
     los dos lados de la línea). Antes la fecha iba en una columna angosta y chocaba con el texto,
     y los puntos no quedaban alineados. Ahora: un rótulo por día, la hora arriba del texto, el
     ícono del tipo en el punto, filtros por tipo, "Ver los N eventos" (se ven los 8 más nuevos)
     y un enlace a la sección de la página de cada evento. */
  var lineaPoner = null;
  function lineaNueva(ev) {
    if (lineaPoner) return lineaPoner(ev);
    var TIPOS = {
      envivo: ["envivo", "Twitch y Kick", "seccion-twitch", "Ver espectadores"],
      video: ["video", "YouTube", "seccion-videos", "Ver videos"],
      short: ["short", "YouTube", "seccion-videos", "Ver Shorts"],
      tendencia: ["tendencia", "Trends", "seccion-trends", "Ver Trends"],
      servidor: ["servidor", "Servidores", "seccion-servidores", "Ver servidores"],
      lanzamiento: ["reloj", "Lanzamiento", "", ""],
      mano: ["lapiz", "A mano", "", ""]
    };
    var FILTROS = [["todo", "Todo"], ["envivo", "Twitch y Kick"], ["youtube", "YouTube"], ["tendencia", "Trends"], ["servidor", "Servidores"], ["lanzamiento", "Lanzamiento"], ["mano", "A mano"]];
    function pasa(e, f) {
      return f === "todo" || (f === "youtube" ? e.tipo === "video" || e.tipo === "short" : f === "mano" ? !e.auto : e.tipo === f);
    }
    var filtro = "todo", abierta = false, CORTE = 8, caja = $("linea");
    // Si se dibuja otra vez, se quitan los filtros y el botón anteriores para no repetirlos.
    [].forEach.call(caja.parentNode.querySelectorAll(".linea-filtros, .linea-mas"), function (x) { x.remove(); });
    var barra = document.createElement("div");
    barra.className = "linea-filtros"; barra.setAttribute("role", "group"); barra.setAttribute("aria-label", "Qué eventos ver");
    caja.parentNode.insertBefore(barra, caja);
    var mas = document.createElement("button");
    mas.type = "button"; mas.className = "linea-mas";
    caja.parentNode.insertBefore(mas, caja.nextSibling);
    caja.className = "linea linea2";
    gota(barra, "gota-sel", 'button[aria-pressed="true"]');   // la gota rosada, como en los días y las pestañas
    function pintar() {
      var hay = FILTROS.filter(function (f) { return ev.some(function (e) { return pasa(e, f[0]); }); });
      barra.innerHTML = hay.map(function (f) {
        var n = ev.filter(function (e) { return pasa(e, f[0]); }).length;
        return '<button type="button" data-f="' + f[0] + '" aria-pressed="' + (f[0] === filtro) + '">' + f[1] + " <small>" + cifra("lf:" + f[0], n) + "</small></button>";
      }).join("");
      var lista = ev.filter(function (e) { return pasa(e, filtro); }), vista = abierta ? lista : lista.slice(0, CORTE);
      var html = "", diaAntes = "";
      vista.forEach(function (e) {
        var d = dia(e.ts);
        if (d !== diaAntes) { html += '<li class="l-dia"><span>' + fDiaSemana.format(new Date(e.ts)) + " " + d + "</span></li>"; diaAntes = d; }
        var t = TIPOS[e.tipo] || TIPOS.mano;
        html += '<li class="l-ev ' + (e.auto ? "auto" : "mano") + '">' +
          '<span class="l-nodo" title="' + t[1] + '">' + ico(t[0]) + "</span>" +
          '<div class="l-cuerpo"><time>' + hora(e.ts) + "</time>" + '<span class="que">' + limpio(e.texto) + (e.n != null ? cifra("lm:" + e.tipo, e.n) + limpio(e.tras) : "") + "</span>" +
          '<span class="l-pie"><span class="etiqueta">' + (e.auto ? "automático" : "a mano") + "</span>" +
          (t[2] ? '<a href="#' + t[2] + '">' + t[3] + " →</a>" : "") + "</span></div></li>";
      });
      caja.innerHTML = html || '<li class="vacio">Todavía no hay eventos.</li>';
      mas.hidden = lista.length <= CORTE;
      mas.dataset.n = lista.length;
      ANIM.boton(mas, abierta ? "Ver menos" : "Ver los " + lista.length + " eventos");
      mas.setAttribute("aria-expanded", abierta);
    }
    barra.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b || b.dataset.f === filtro) return;
      filtro = b.dataset.f; abierta = false; pintar(); ANIM.lista(caja);
    });
    mas.addEventListener("click", function () {
      var abrir = !abierta;   // el botón cambia al tocarlo; la lista, cuando termina de animarse
      mas.setAttribute("aria-expanded", abrir);
      ANIM.boton(mas, abrir ? "Ver menos" : "Ver los " + (mas.dataset.n || "") + " eventos");
      ANIM.alturaLinea(caja, function () { abierta = abrir; pintar(); }, abrir);
    });
    // Al rebobinar llega otra lista: se repinta conservando el filtro (si todavía tiene eventos) y "Ver más".
    lineaPoner = function (nuevo) {
      ev = nuevo;
      if (filtro !== "todo" && !ev.some(function (e) { return pasa(e, filtro); })) filtro = "todo";
      pintar();
    };
    pintar();
  }

  /* ---------- Gráficos de línea (SVG hecho a mano) ---------- */
  var globo = $("globo");
  /* Devuelve { poner(opciones, M) } para volver a dibujarlo con otros datos (7.1, rebobinar). Con
     opciones.rango ([desde, hasta]) el marco queda fijo aunque la línea llegue solo hasta una
     parte (la línea "crece" con el rebobinado), y con opciones.topeFijo el alto también. */
  function grafico(caja, campo, opciones) {
    var Mv = M, svgVivo = null, salirVivo = function () {}, previo = null, animo = 0;   // previo: las líneas que se ven (al rebobinar)
    function dibujar(anchoSabido, animar) {
      var puntos = opciones.serie || Mv.map(function (m) { return { ts: m.ts, v: m[campo] }; });   // serie propia (Trends, por hora)
      var extra = opciones.extra, puntos2 = extra ? Mv.map(function (m) { return { ts: m.ts, v: m[extra.campo] }; }) : null;
      var ancho = Math.max(300, anchoSabido || caja.clientWidth), alto = Math.round(Math.max(230, Math.min(380, ancho * 0.36)));
      var mi = 54, md = 14, ma = 26, mb = 34;
      if (!puntos.length) { cancelAnimationFrame(animo); previo = null; caja.innerHTML = '<p class="nota">Todavía no hay datos.</p>'; svgVivo = null; return; }
      var t0 = opciones.rango ? opciones.rango[0] : puntos[0].ts, t1 = opciones.rango ? opciones.rango[1] : puntos[puntos.length - 1].ts;
      var tope = opciones.tope || opciones.topeFijo || 0, paso;
      puntos.concat(puntos2 || []).forEach(function (p) { if (p.v > tope) tope = p.v; });
      if (opciones.tope) paso = tope / 4;
      else { paso = pasoRedondo(tope); tope = Math.max(1, Math.ceil(tope / paso)) * paso; }
      var X = function (ts) { return mi + (ts - t0) / (t1 - t0 || 1) * (ancho - mi - md); };
      /* Marcas del lanzamiento: medianoche del 19 nov en Nueva Zelanda, Chile y Miami (pedido de
         Bruno, 2026-11-20: el gran pico llegó poco después de la hora cero de Nueva Zelanda).
         Si los nombres caben en una fila: Nueva Zelanda y Chile a la izquierda de su raya, Miami a
         la derecha (Chile y Miami van a solo 2 h). Si no caben (pantalla angosta), en escalera:
         cada nombre a la izquierda de su raya, Miami arriba, Chile al medio y Nueva Zelanda abajo,
         y cada raya sube solo hasta su nombre, así ningún nombre cruza otra raya. */
      var anchoLetra = 8.6;                        // ancho aproximado de una letra de .salida-texto
      var horaCero = [["nz", "Nueva Zelanda"], ["cl", "Chile"], ["mia", "Miami"]]
        .filter(function (h) { return LUGARES[h[0]].ts > t0 && LUGARES[h[0]].ts < t1; })
        .map(function (h) { return { id: h[0], x: X(LUGARES[h[0]].ts), texto: h[1], nombre: LUGARES[h[0]].nombre, lado: h[0] === "mia" ? "start" : "end" }; });
      var enFila = horaCero.every(function (h, i) {   // ¿choca algún nombre con el de la raya anterior?
        var izq = h.lado === "end" ? h.x - 5 - h.texto.length * anchoLetra : h.x + 5;
        var antes = horaCero[i - 1];
        if (h.lado === "start" && h.x + 5 + h.texto.length * anchoLetra > ancho) return false;   // se sale por la derecha
        return !antes || izq - 8 > (antes.lado === "end" ? antes.x - 5 : antes.x + 5 + antes.texto.length * anchoLetra);
      });
      horaCero.forEach(function (h, i) {
        if (enFila) h.y = ma;
        else { h.lado = "end"; h.y = ma + 15 * (horaCero.length - 1 - i); }   // la última raya, arriba
        // Si el nombre no cabe a la izquierda de su raya (al rebobinar, Nueva Zelanda queda casi en
        // el borde), va abreviado: "NZ".
        if (h.lado === "end" && h.x - 5 - h.texto.length * anchoLetra < 0 && h.id === "nz") h.texto = "NZ";
      });
      if (!enFila) ma += 15 * (horaCero.length - 1);   // más margen arriba para la escalera
      var Y = function (v) { return ma + (1 - v / tope) * (alto - ma - mb); };
      var s = '<svg viewBox="0 0 ' + ancho + " " + alto + '" role="img" aria-label="' + opciones.nombre + '" style="--color:var(' + opciones.color + ')">';

      for (var k = 0; k * paso <= tope + paso / 1000; k++) {   // líneas horizontales
        var v = k * paso, y = Y(v);
        s += '<line class="guia" x1="' + mi + '" x2="' + (ancho - md) + '" y1="' + y + '" y2="' + y + '"/>';
        s += '<g class="eje"><text x="' + (mi - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + compacto(v) + "</text></g>";
      }
      var p0 = partes(t0), inicio = Date.UTC(p0.year, p0.month - 1, p0.day, 0, 0); inicio -= desfase(inicio);
      var porHora = (ancho - mi - md) / Math.max(1, (t1 - t0) / 3600000);   // px por hora
      /* Marcas del eje (9.4, opción C de Bruno, 2026-11-16; descartadas A, hora completa, y B, solo
         fechas). Antes eran fijas cada 6 o 12 h y se encimaban (ya a 384 px con 4 días). Ahora se
         usa el paso más chico que deja espacio al texto: horas cortas (~44 px) o fechas (~52 px). */
      var pasos = [3, 6, 12, 24, 48, 72, 168], cada = pasos[pasos.length - 1], marcas = [], marca;
      for (var q = 0; q < pasos.length; q++) if (pasos[q] * porHora >= (pasos[q] < 24 ? 44 : 52)) { cada = pasos[q]; break; }
      cada *= 3600000;
      for (marca = inicio; marca <= t1; marca += cada) if (marca >= t0) marcas.push(marca);
      var todasRayas = porHora * 24 >= 14;         // rayas de medianoche: todas si caben, si no solo las con fecha
      if (todasRayas) {
        for (marca = inicio; marca <= t1; marca += 864e5) if (marca >= t0)
          s += '<line class="dia" x1="' + X(marca) + '" x2="' + X(marca) + '" y1="' + ma + '" y2="' + (alto - mb) + '"/>';
      }
      marcas.forEach(function (marca) {
        var x = X(marca), medianoche = partes(marca).hour === 0;
        if (medianoche && !todasRayas) s += '<line class="dia" x1="' + x + '" x2="' + x + '" y1="' + ma + '" y2="' + (alto - mb) + '"/>';
        var texto = medianoche ? dia(marca) : horaCorta(marca);
        s += '<g class="eje"><text x="' + x + '" y="' + (alto - 12) + '" text-anchor="middle">' + texto + "</text></g>";
      });
      horaCero.forEach(function (h) {             // marcas del lanzamiento (preparadas arriba)
        s += '<line class="salida" x1="' + h.x + '" x2="' + h.x + '" y1="' + (h.y - 8) + '" y2="' + (alto - mb) + '"><title>Medianoche del 19 nov en ' + h.nombre + "</title></line>";
        s += '<text class="salida-texto" x="' + (h.lado === "end" ? h.x - 5 : h.x + 5) + '" y="' + (h.y - 10) + '" text-anchor="' + h.lado + '">' + h.texto + "</text>";
      });
      puntos.forEach(function (p, i) {             // huecos: la línea se corta donde falta un dato
        if (p.v != null) return;
        var xa = X(i ? puntos[i - 1].ts : p.ts), xb = X(i < puntos.length - 1 ? puntos[i + 1].ts : p.ts);
        s += '<rect class="hueco" x="' + xa + '" y="' + ma + '" width="' + Math.max(2, xb - xa) + '" height="' + (alto - ma - mb) + '"/>';
      });
      /* Las líneas van en un grupo aparte (.lineas), con sus puntos ya en píxeles ({ts, y}; y null
         donde falta el dato). Al rebobinar, lineas() las dibuja hasta "fin" (una hora), con el último
         trozo a medio camino del punto siguiente: así la línea puede avanzar de a poco (ver animar). */
      var y0 = Y(0), enPx = function (lista) { return (lista || []).map(function (p) { return { ts: p.ts, y: p.v == null ? null : Y(p.v) }; }); };
      var meta = { a: enPx(puntos), b: puntos2 ? enPx(puntos2) : null };
      function tramosHasta(lista, fin) {
        var tramos = [], act = [];
        for (var i = 0; i < lista.length; i++) {
          var p = lista[i];
          if (p.ts > fin) {
            var a = lista[i - 1];
            if (act.length && a && a.y != null && p.y != null) act.push({ x: X(fin), y: a.y + (p.y - a.y) * (fin - a.ts) / (p.ts - a.ts) });
            break;
          }
          if (p.y == null) { if (act.length) tramos.push(act); act = []; } else act.push({ x: X(p.ts), y: p.y });
        }
        if (act.length) tramos.push(act);
        return tramos;
      }
      function trazo(tr) { return tr.map(function (p, i) { return (i ? "L" : "M") + p.x.toFixed(1) + " " + p.y.toFixed(1); }).join(""); }
      function lineas(a, b, finA, finB) {
        var out = "", ta = tramosHasta(a, finA), tb = b ? tramosHasta(b, finB) : [];
        ta.forEach(function (tr) {
          var l = trazo(tr);
          out += '<path class="relleno" d="' + l + "L" + tr[tr.length - 1].x.toFixed(1) + " " + y0 + "L" + tr[0].x.toFixed(1) + " " + y0 + 'Z"/><path class="trazo" pathLength="1" d="' + l + '"/>';
        });
        // Segunda línea (Kick), sin relleno ni huecos.
        tb.forEach(function (tr) { out += '<path class="trazo trazo-extra" pathLength="1" style="--color:var(' + extra.color + ')" d="' + trazo(tr) + '"/>'; });
        if (opciones.rango) {   // rebobinado: un punto al final de cada línea (si el último dato falló, en el último bueno)
          var u = ta[ta.length - 1], u2 = tb[tb.length - 1];
          if (u) s2(u[u.length - 1], "");
          if (u2) s2(u2[u2.length - 1], ' style="--color:var(' + extra.color + ')"');
        }
        function s2(q, estilo) { out += '<circle class="rb-fin" r="5"' + estilo + ' cx="' + q.x.toFixed(1) + '" cy="' + q.y.toFixed(1) + '"/>'; }
        return out;
      }
      s += '<g class="lineas">' + lineas(meta.a, meta.b, Infinity, Infinity) + "</g>";
      s += '<line class="cursor" y1="' + ma + '" y2="' + (alto - mb) + '" visibility="hidden"/><circle class="punto" r="6" visibility="hidden"/>';
      s += '<rect class="zona" x="' + mi + '" y="' + ma + '" width="' + (ancho - mi - md) + '" height="' + (alto - ma - mb) + '" fill="transparent"/></svg>';
      caja.innerHTML = s;

      var svg = caja.firstChild, cursor = svg.querySelector(".cursor"), punto = svg.querySelector(".punto");

      /* Al rebobinar, las líneas no cambian de golpe (7.1 a, opción A "La línea avanza", elegida por
         Bruno el 2026-11-21): en 250 ms, el final de cada línea va de la hora de antes a la nueva
         (avanza o retrocede) y cada punto pasa de su altura de antes a la nueva (en Trends la escala
         cambia en cada medición: la línea se transforma en vez de saltar). Si llega otra parada a
         mitad de camino, sigue desde lo que se ve. Al instante: al arrastrar la barra, con "reducir
         movimiento", al cambiar el ancho de la ventana y si el gráfico no está a la vista. */
      cancelAnimationFrame(animo);
      var finDe = function (lista) { for (var j = (lista || []).length - 1; j >= 0; j--) if (lista[j].y != null) return lista[j].ts; return null; };
      var antes = previo, hacia = opciones.rango ? { a: meta.a, b: meta.b, finA: finDe(meta.a), finB: finDe(meta.b) } : null;
      previo = hacia;
      if (animar && antes && hacia && !antes.b === !hacia.b && !CONTEO.quieto && CONTEO.seVe(caja) &&
          !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        var g = svg.querySelector(".lineas"), tAnim = null;   // (t0 ya es el comienzo del eje)
        var entre = function (x, y, e) { return x == null || y == null ? y : x + (y - x) * e; };
        var mezclar = function (viejo, nuevo, e) {
          var mapa = {}, hay = {};
          (viejo || []).forEach(function (p) { mapa[p.ts] = p.y; });
          var out = (nuevo || []).map(function (p) { hay[p.ts] = 1; return { ts: p.ts, y: p.y == null ? null : entre(mapa[p.ts], p.y, e) }; });
          (viejo || []).forEach(function (p) { if (!hay[p.ts]) out.push(p); });   // al retroceder: lo que se va
          return out.sort(function (x, y) { return x.ts - y.ts; });
        };
        var cuadro = function (e) {
          var ahora = { a: mezclar(antes.a, hacia.a, e), b: hacia.b ? mezclar(antes.b, hacia.b, e) : null,
            finA: entre(antes.finA, hacia.finA, e), finB: entre(antes.finB, hacia.finB, e) };
          g.innerHTML = lineas(ahora.a, ahora.b, ahora.finA == null ? -Infinity : ahora.finA, ahora.finB == null ? -Infinity : ahora.finB);
          return ahora;
        };
        previo = cuadro(0);   // sin un cuadro con el final ya puesto
        animo = requestAnimationFrame(function paso(t) {
          if (tAnim == null) tAnim = t;
          var p = Math.min(1, (t - tAnim) / 250), e = 1 - Math.pow(1 - p, 3);   // la misma curva que los números
          if (p < 1) { previo = cuadro(e); animo = requestAnimationFrame(paso); }
          else { previo = hacia; g.innerHTML = lineas(meta.a, meta.b, Infinity, Infinity); }
        });
      }
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
      // Si el globo era de este gráfico, se va con él al redibujar (si no, quedaba flotando).
      if (svgVivo && !globo.hidden && svgVivo.querySelector(".cursor[visibility=visible]")) globo.hidden = true;
      svgVivo = svg; salirVivo = salir;
    }
    // Una sola vez por gráfico (antes se sumaban dos escuchas en cada redibujo, también al cambiar el ancho).
    document.addEventListener("pointerdown", function (e) { if (e.pointerType === "touch" && svgVivo && !svgVivo.contains(e.target)) salirVivo(); }, { passive: true });
    window.addEventListener("scroll", function () { if (!globo.hidden && svgVivo && svgVivo.querySelector(".cursor[visibility=visible]")) salirVivo(); }, { passive: true });
    dibujar();
    var espera, anchoAnterior = caja.clientWidth;
    window.addEventListener("resize", function () {
      clearTimeout(espera);
      espera = setTimeout(function () { if (caja.clientWidth !== anchoAnterior) { anchoAnterior = caja.clientWidth; dibujar(); } }, 150);
    });
    // Al rebobinar se redibuja en cada parada: con el ancho ya medido (cambia solo con "resize").
    return { poner: function (nuevas, Mnuevo) { opciones = nuevas; Mv = Mnuevo; dibujar(anchoAnterior, true); } };
  }
  /* ---------- Twitch y Kick en el mismo gráfico (tarea 6.6, opción B de Bruno, 2026-11-16) ----------
     Una línea por plataforma, con su leyenda. Kick se mide desde el 16 nov: antes no tiene línea. */
  $("g-twitch").insertAdjacentHTML("beforebegin", '<p class="leyenda-k"><i class="lk-tw"></i> Twitch <i class="lk-kick"></i> Kick</p>');
  /* Al rebobinar (7.1, opción A de Bruno): marco fijo con todo el tramo del rebobinado a lo ancho
     y el pico del tramo a lo alto; la línea llega solo hasta el momento elegido. */
  function opcionesTwitch(V) {
    var o = { color: "--a1", unidad: "espectadores", nombre: "Espectadores en Twitch y Kick a lo largo del tiempo", extra: { campo: "kickEsp", color: "--kick" } };
    if (V.corte != null) { o.rango = V.rango; o.topeFijo = V.topeTwitch; }
    return o;
  }
  var gTwitch = grafico($("g-twitch"), "espectadores", opcionesTwitch(HOY));
  /* Trends por hora ("Trends sin huecos", 2026-11-16): cada punto es una hora, dibujado en su hora
     (antes, en la hora de la medición: ~1 h tarde), con el valor de la medición más nueva que la trae.
     Al rebobinar, las horas del tramo según la última medición buena de ese momento, con su escala
     (Trends cambia de escala en cada medición: la de hoy traería el futuro). */
  function opcionesTrends(V) {
    var desde = V.corte == null ? 0 : Math.floor(V.rango[0] / 3600000) * 3600000 - 3600000;   // la hora completa de la primera medición
    var serie = V.corte != null ? V.serieTrends : (V.D.trends_horas || []).map(function (h) { return { ts: Date.parse(h[0]), v: typeof h[1] === "number" ? h[1] : null }; })
      .filter(function (p) { return !isNaN(p.ts); });
    var o = { color: "--a2", unidad: "de 100", tope: 100, nombre: "Interés de búsqueda en Google Trends a lo largo del tiempo", serie: serie.length ? serie : null };
    if (V.corte != null) { o.rango = [desde, V.rango[1]]; if (!serie.length) o.serie = [{ ts: desde, v: null }]; }
    return o;
  }
  var gTrends = grafico($("g-trends"), "interes", opcionesTrends(HOY));

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

    /* Rockstar, revisado a mano (pedido de Bruno, 2026-11-17). Su página de estado no le responde
       al recolector: la revisa la skill "anotar-rockstar" en el Chrome de Bruno y la anota en
       web/eventos.js con uno de dos textos fijos ("Rockstar: todos los servicios funcionando…" o
       "Rockstar: problemas en…"). Aquí se leen esos eventos y se muestran como puntos sobre una
       línea punteada (opción C de Bruno; descartadas A, cuadros huecos por día, y B, fichas), en
       un recuadro punteado con la etiqueta "a mano", para que no se confunda con lo medido solo.
       "?probar-rockstar" suma revisiones INVENTADAS (solo en la pantalla de quien la abre, para
       ver cómo se ve con varias y con un problema; no son datos). */
    var revisiones = (window.EVENTOS || []).map(function (e) {
      var ts = deSantiago(e.hora), t = e.texto || "";
      if (isNaN(ts) || !/^\s*Rockstar\s*:/i.test(t)) return null;
      var ok = /todos los servicios funcionando|operativ|vuelve a funcionar|resuelt/i.test(t);
      return { ts: ts, ok: ok, texto: t.replace(/^\s*Rockstar\s*:\s*/i, "") };
    }).filter(Boolean);
    if (/[?&]probar-rockstar(?:&|$)/.test(location.search)) {   // INVENTADAS, solo para ver el diseño
      [0.15, 0.4, 0.55, 0.8].forEach(function (f, j) {
        revisiones.push({ ts: M[0].ts + (fin - M[0].ts) * f, ok: j !== 2, texto: j !== 2 ? "todos los servicios funcionando (ejemplo)" : "problemas en GTA Online (PS5) (ejemplo)" });
      });
    }
    revisiones.sort(function (a, b) { return a.ts - b.ts; });
    function estadoRev(r) { return r.ok ? "funcionando" : "con problemas"; }
    function filaRockstar(nombre) {
      var ult = revisiones[revisiones.length - 1], malasR = revisiones.filter(function (r) { return !r.ok; }).length;
      var etiqueta = '<div class="tira-titulo">Revisado a mano · solo cuando alguien mira</div>';
      var cuerpo;
      if (!revisiones.length) cuerpo = etiqueta + '<p class="rev-nada">Todavía no hay revisiones.</p>';
      else {   // puntos sobre una línea punteada que cubre todo el periodo
        var t0 = M[0].ts, largo = Math.max(1, fin - t0);
        cuerpo = etiqueta + '<div class="rev-linea">' + revisiones.map(function (r, j) {
          var x = Math.min(100, Math.max(0, (r.ts - t0) / largo * 100));
          return '<i class="' + (r.ok ? "ok" : "mal") + '" style="left:' + x.toFixed(2) + "%;--i:" + j + '" title="' + dia(r.ts) + " " + hora(r.ts) + " · " + estadoRev(r) + '"></i>';
        }).join("") + '</div><div class="tira-pie"><span>' + dia(t0) + "</span><span>hoy</span></div>";
      }
      if (ult) cuerpo += '<p class="rev-ultima">Última revisión: ' + dia(ult.ts) + ", " + hora(ult.ts) + " · " + estadoRev(ult) + "</p>";
      var veredicto = !revisiones.length ? '<div class="veredicto">Sin revisiones<small>se anotan a mano</small></div>'
        : malasR ? '<div class="veredicto si">Sí, tuvo problemas<small>en ' + malasR + " de " + revisiones.length + (revisiones.length > 1 ? " revisiones" : " revisión") + " a mano</small></div>"
        : '<div class="veredicto no">No se vio caída<small>en ' + revisiones.length + (revisiones.length > 1 ? " revisiones" : " revisión") + " a mano</small></div>";
      return '<div class="servicio a-mano"><div class="nombre">' + nombre + '<small>a mano</small></div><div class="tiras">' + cuerpo + "</div>" + veredicto + "</div>";
    }

    html += SERVICIOS.map(function (s) {
      if (s[0] === "rockstar") return filaRockstar(s[1]);
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
  var tabla = (function () {
    // Lo más nuevo primero (pedido de Bruno): días y filas de la más reciente a la más vieja.
    // Al rebobinar: lo medido hasta ese momento, abierta en el día de ese momento.
    var nuevas, dias, elegido, tope, Dv = D, preferidoAntes = null;
    function poner(V) {
      Dv = V.D;
      nuevas = V.M.slice().reverse();
      dias = []; nuevas.forEach(function (m) { var d = dia(m.ts); if (dias.indexOf(d) < 0) dias.push(d); });
      var preferido = V.corte == null ? dia(SALIDA) : dia(V.corte);
      if (preferido !== preferidoAntes || dias.indexOf(elegido) < 0) elegido = dias.indexOf(preferido) >= 0 ? preferido : (dias[0] || "");
      preferidoAntes = preferido;
      tope = Math.max(1, V.picoTwitch ? V.picoTwitch.espectadores : 0, V.picoKick ? V.picoKick.kickEsp : 0);
      pintar();
    }
    var PLATAFORMAS = [
      { nombre: "Twitch", clase: "pl-twitch", esp: function (m) { return m.espectadores; }, error: function (m) { return m.errorTwitch; },
        canal: function (m) { return m.canal && { nombre: m.canal.nombre, espectadores: m.canal.espectadores, url: urlCanal(m.canal.login), foto: foto(m.canal.foto) }; },
        hay: function () { return true; } },
      { nombre: "Kick", clase: "pl-kick", esp: function (m) { return m.kickEsp; }, error: function (m) { return m.errorKick; },
        canal: function (m) { return m.kickCanal && { nombre: m.kickCanal.canal, espectadores: m.kickCanal.espectadores, url: urlKick(m.kickCanal.canal), foto: foto((Dv.fotos_kick || {})[m.kickCanal.canal]) }; },
        hay: function (m) { return m.kickEsp != null || m.errorKick; } }   // antes del 16 nov no se medía
    ];
    function fila(m, pl, primera, filasHora) {
      var horaTd = primera ? '<td rowspan="' + filasHora + '">' + hora(m.ts) + "</td>" : "";
      var plTd = '<td><span class="plataforma ' + pl.clase + '">' + ico("envivo") + pl.nombre + "</span></td>";
      var e = pl.esp(m);
      if (e == null) return '<tr class="sin-dato">' + horaTd + plTd + '<td colspan="3">Sin dato' + (pl.error(m) ? " (" + limpio(pl.error(m)) + ")" : "") + "</td></tr>";
      var c = pl.canal(m);
      // La fila más nueva (al rebobinar, la que acaba de llegar) cuenta desde la medición anterior (pedido de Bruno).
      var previa = m === nuevas[0] && nuevas[1] ? pl.esp(nuevas[1]) : null;
      return "<tr>" + horaTd + plTd + '<td class="n">' + cifra("tb:" + m.ts + pl.nombre, e, num, previa) +'</td><td class="barra-celda ' + pl.clase + '"><i style="--w:' + (e / tope * 100).toFixed(1) + '%"></i></td><td>' +
        (c ? '<span class="canal">' + c.foto + "<span>" + enlace(c.url, limpio(c.nombre)) + " (" + cifra("tbc:" + m.ts + pl.nombre, c.espectadores, compacto) + ")</span></span>" : "—") + "</td></tr>";
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
    $("filtros-dia").addEventListener("click", function (e) { var d = e.target.dataset.dia; if (d) { var dir = dias.indexOf(d) - dias.indexOf(elegido); elegido = d; pintar(); if (window.ANIM && dir) ANIM.tabla($("t-twitch"), dir); } });
    poner(HOY);
    gota($("filtros-dia"), "gota-sel", "button.activo", true);
    return { poner: poner };
  })();

  /* ---------- Videos de YouTube (tarjetas con miniatura; opción B elegida por Bruno, 2026-11-13) ---------- */
  // Tarea 6.4: además de los más vistos en todo el mundo, los videos en español. Solo los que
  // YouTube marca en español (idioma "es", "es-MX", "es-419"…): la búsqueda prefiere el
  // español pero también trae algunos en inglés. Pestañas "Global" y "En español" sobre la
  // misma lista (opción A de Bruno, 2026-11-13).
  // Videos y Shorts (opción B de Bruno, 2026-11-15): en cada pestaña, primero los videos
  // normales y debajo una tira de Shorts verticales que se desliza hacia el lado. Los videos sin
  // marca de Short (mediciones de antes del 15 nov) cuentan como videos normales.
  var videosSec = (function () {
    var VIDEOS_VISIBLES = 8, etiquetaFin = "ahora";
    function filas(lista) {
      return (lista || []).map(function (v) {
        var serie = (v.serie || []).filter(function (p) { return typeof p.visitas === "number"; });
        if (!serie.length) return null;
        var a = serie[0].visitas, b = serie[serie.length - 1].visitas, min = a, max = b;
        serie.forEach(function (p) { if (p.visitas < min) min = p.visitas; if (p.visitas > max) max = p.visitas; });
        var camino = serie.map(function (p, i) { return (i ? "L" : "M") + (i / (serie.length - 1 || 1) * 120).toFixed(1) + " " + (28 - (p.visitas - min) / (max - min || 1) * 26).toFixed(1); }).join("");
        var y = function (p) { return 28 - (p.visitas - min) / (max - min || 1) * 26; };
        var area = camino + "L120 30L0 30Z";
        return { v: v, a: a, b: b, camino: camino, area: area, fin: y(serie[serie.length - 1]) / 30 * 100, desde: Date.parse(serie[0].t) };
      }).filter(Boolean).sort(function (x, y) { return y.b - x.b; });
    }
    /* Gráfico de cada tarjeta (9.6, opción A de Bruno, 2026-11-17): la línea de visitas con
       relleno suave y un punto al final, y debajo las visitas al inicio (con su día) y las de
       ahora, para que se entienda cuánto subió. En los Shorts, solo las cifras (no cabe el día). */
    function grafico(f) {
      return '<div class="g-vis"><div class="g-caja"><svg class="mini" viewBox="0 0 120 30" preserveAspectRatio="none" aria-hidden="true">' +
        '<path class="area" d="' + f.area + '"/><path d="' + f.camino + '"/></svg><i class="g-punto" style="top:' + f.fin.toFixed(1) + '%"></i></div>' +
        '<p class="g-ejes"><span><i class="g-d">' + dia(f.desde) + " · </i>" + compacto(f.a) + '</span><span><i class="g-d">' + etiquetaFin + " · </i><b>" + cifra("vf:" + f.v.id, f.b, compacto) + "</b></span></p></div>";
    }
    function tarjetas(fs, vacio) {
      return fs.map(function (f) {
        var url = urlVideo(f.v.id);
        // Solo miniaturas de YouTube; la imagen repite el enlace del título, así que no recibe foco.
        var foto = /^https:\/\/i\.ytimg\.com\//.test(f.v.miniatura || "")
          ? (url ? '<a class="foto" href="' + limpio(url) + '" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true">' : '<div class="foto">') +
            '<img src="' + limpio(f.v.miniatura) + '" alt="" loading="lazy" width="320" height="180">' + (url ? "</a>" : "</div>")
          : "";
        return '<li title="' + limpio(f.v.titulo) + '">' + foto + '<div class="v-texto">' + enlace(url, "<span>" + limpio(f.v.titulo) + "</span>") +
          '<small title="Al inicio: ' + num(f.a) + " · Al final: " + num(f.b) + '">' + limpio(f.v.canal) + " · " + cifra("vb:" + f.v.id, f.b, compacto) +
          ' visitas · <span class="crece">+' + cifra("vc:" + f.v.id, f.b - f.a, compacto) + "</span></small>" +
          grafico(f) + "</div></li>";
      }).join("") || '<li class="vacio">' + vacio + "</li>";
    }
    var global, espanol;
    var caja = $("videos"), nota = $("videos-nota"), tabs = $("videos-tabs");
    var NOTAS = { global: nota.textContent,
                  es: "Videos que YouTube marca en español, de creadores de Chile, España, México y otros países. La búsqueda se hace una vez por hora." };
    var NOTAS_HOY = { global: NOTAS.global, es: NOTAS.es };
    var LISTAS = [["global", "Global"], ["es", "En español"]];
    var elegida = "global";
    /* Sin cambios de tamaño al pasar de pestaña (pedido de Bruno, 2026-11-16): las dos pestañas
       se dibujan una sola vez, apiladas en el mismo lugar, y la caja mide lo de la más alta (lo
       mismo con las dos notas de arriba). Así cambiar no estira ni encoge la sección. La que no
       se ve queda oculta e "inert" (sin foco con el teclado). Al cambiar, la vieja se desvanece
       rápido y las tarjetas de la nueva entran en cascada, como si se cargaran.
       Al rebobinar (7.1): los videos que estaban arriba en ese momento, con sus visitas de entonces. */
    caja.classList.add("v-pilas");
    function poner(V) {
      global = V.D.youtube || [];
      espanol = (V.D.youtube_es || []).filter(function (v) { return /^es\b/i.test(v.idioma || ""); });
      etiquetaFin = V.corte == null ? "ahora" : "a las " + hora(V.corte);
      NOTAS.global = V.corte == null ? NOTAS_HOY.global : "Los videos que estaban más arriba en ese momento: visitas a esa hora y cuánto habían subido desde que se midieron por primera vez.";
      NOTAS.es = NOTAS_HOY.es;
      nota.innerHTML = LISTAS.map(function (t) { return '<span data-lista="' + t[0] + '">' + limpio(NOTAS[t[0]]) + "</span>"; }).join("");
      caja.innerHTML = LISTAS.map(function (t) { return '<div class="v-panel" data-lista="' + t[0] + '">' + contenido(t[0]) + "</div>"; }).join("");
      [].forEach.call(caja.querySelectorAll(".v-panel"), flechasShorts);
      pintar(false);
    }
    function contenido(lista) {
      var todas = filas(lista === "es" ? espanol : global);
      var normales = todas.filter(function (f) { return f.v.short !== true; }).slice(0, VIDEOS_VISIBLES);
      var shorts = todas.filter(function (f) { return f.v.short === true; });
      return '<h3 class="sub v-sub">' + ico("video") + 'Videos</h3><ul class="videos">' + tarjetas(normales, "Todavía no hay videos.") + "</ul>" +
        (shorts.length ? '<h3 class="sub v-sub">' + ico("short") + 'Shorts <small>' + cifra("vs:" + lista, shorts.length) + " · desliza para ver más</small>" +
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
      tira.addEventListener("scroll", estado, { passive: true }); requestAnimationFrame(estado);
    }
    tabs.addEventListener("click", function (e) { var l = e.target.dataset.lista; if (l && l !== elegida) { elegida = l; pintar(true); } });
    poner(HOY);
    gota(tabs, "gota-sel", "button.activo");
    return { poner: poner };
  })();

  /* ---------- Noticias ---------- */
  // Lo más nuevo arriba, y por páginas como en una tienda o un buscador, para que la sección
  // no crezca sin fin (pedidos de Bruno, 2026-11-13).
  var noticiasSec = (function () {
    var POR_PAGINA = 12, pintando = 0;
    var lista, todas, total = 1, actual = 1, porDia, diasN, filtro = "", Dv = D;
    /* Filtro por día (idea de Bruno). Días en hora de Santiago, lo más nuevo primero. */
    function claveDia(ts) { var o = partes(ts); return o.year + "-" + String(o.month).padStart(2, "0") + "-" + String(o.day).padStart(2, "0"); }
    function preparar(V) {
      Dv = V.D;
      lista = (Dv.noticias || []).slice().sort(function (a, b) { return Date.parse(b.t) - Date.parse(a.t); });
      todas = lista; porDia = {}; diasN = [];
      lista.forEach(function (n) { var ts = Date.parse(n.t); if (isNaN(ts)) return; var k = claveDia(ts); if (!porDia[k]) { porDia[k] = 0; diasN.push(k); } porDia[k]++; });
      if (filtro && !porDia[filtro]) filtro = "";   // al rebobinar, un día que todavía no llegaba
    }
    preparar(HOY);
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
            '<span class="nt-num">' + cifra("ntd:" + k, porDia[k]) + '</span><i style="height:' + Math.max(6, porDia[k] / max * 100).toFixed(1) + '%"></i><span class="nt-dia">' + nombreDia(k).replace(" ", "<br>") + "</span></button>";
        }).join("") + "</div>" +
        (filtro ? '<button type="button" class="nt-todos" data-dia="">Ver todos los días</button>' : "");
    }
    $("noticias-filtro").addEventListener("click", function (e) {
      var b = e.target.closest("[data-dia]"); if (!b) return;
      var barras = $("noticias-filtro").querySelector(".nt-barras"), x = barras ? barras.scrollLeft : 0;
      filtro = filtro === b.dataset.dia ? "" : b.dataset.dia; aplicar(); pintarFiltro(); fundir = true; pintar();
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
    var abierta = false, boton = $("noticias-ver");
    function resumenArriba(V) {
      var medios, nMedios, ultimas;
      if (Dv.formato === 2) { medios = Dv.medios_top || []; nMedios = Dv.medios_n || medios.length; ultimas = Dv.noticias_ultimas || []; }
      else {
        var cuenta = {};
        lista.forEach(function (n) { if (n.medio) cuenta[n.medio] = (cuenta[n.medio] || 0) + 1; });
        medios = Object.keys(cuenta).map(function (m) { return [m, cuenta[m]]; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 8);
        nMedios = Object.keys(cuenta).length; ultimas = lista.slice(0, 6);
      }
      $("noticias-resumen").innerHTML = lista.length
        ? cifra("nt:total", lista.length) + (V.corte == null ? " titulares guardados de " : " titulares hasta ese momento, de ") + cifra("nt:medios", nMedios) + " medios. Quiénes hablan más de GTA 6, y lo último."
        : "Todavía no hay titulares.";
      var mx = medios.length ? medios[0][1] : 1;
      $("noticias-medios").innerHTML = medios.map(function (m) {
        return "<div><span>" + limpio(m[0]) + '</span><i style="width:' + (m[1] / mx * 100).toFixed(1) + '%"></i><b>' + cifra("ntm:" + m[0], m[1]) + "</b></div>";
      }).join("");
      $("noticias-ultimas").innerHTML = ultimas.map(function (n) { return tarjeta(n, true); }).join("");
      boton.hidden = !lista.length;
    }
    resumenArriba(HOY);
    function textoBoton() { ANIM.boton(boton, abierta ? "Ocultar la lista completa" : "Ver los " + num(lista.length) + " titulares"); boton.setAttribute("aria-expanded", abierta); }
    textoBoton();
    boton.addEventListener("click", function () {
      abierta = !abierta; ANIM.desplegar($("noticias-todas"), abierta); textoBoton();
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
    var fundir = false;   // true solo cuando la persona cambia de página o de día
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
        // Fundido corto al cambiar de página o de día (9.11 b). Va aquí, con los titulares de verdad, y no
        // en el aviso "Cargando titulares…" (si el día no estaba cargado, pintar() corre dos veces).
        if (fundir) { fundir = false; ANIM.lista(ul); }
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
      actual = p; fundir = true; pintar();
    });
    // La primera página de la lista completa se pinta al tocar "Ver los N titulares" (ver arriba).
    var diasAntes = "";
    function poner(V) {
      var pagina = actual;
      preparar(V); aplicar(); actual = Math.min(pagina, total); pintarFiltro(); resumenArriba(V); textoBoton();
      if (diasN.join() !== diasAntes) {   // solo si cambiaron los días (leer el ancho obliga a recalcular la página)
        diasAntes = diasN.join();
        requestAnimationFrame(function () { var barras = $("noticias-filtro").querySelector(".nt-barras"); if (barras) barras.scrollLeft = barras.scrollWidth; });
      }
      if (abierta) pintar();
    }
    return { poner: poner };
  })();

  /* ---------- GTA 6 frente a Avengers: Doomsday (6.7, opción B de Bruno, 2026-11-17) ----------
     Datos de Google Trends de datos.js (trends_extra): la 6.1 cuando exista o, antes, la consulta
     previa. A la izquierda, el mejor día de cada uno en los últimos 90 días (los dos en la misma
     escala); a la derecha, mes a mes desde 2013, con GTA 5 de referencia. Trends no da cantidades:
     todo va de 0 a 100 dentro de cada pregunta. */
  (function () {
    var caja = $("doomsday-caja"), X = D.trends_extra;
    if (!caja || !X || !X.pelicula || !X.historica) return;
    $("doomsday").hidden = false;
    var NS = "http://www.w3.org/2000/svg", P = X.pelicula.puntos, H = X.historica.puntos;
    var MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    var fecha = function (s) { var d = new Date(s * 1000); return d.getUTCDate() + " " + MESES[d.getUTCMonth()]; };
    var maxG = Math.max.apply(null, P.map(function (p) { return p[1]; }));
    var maxD = Math.max.apply(null, P.map(function (p) { return p[2]; }));
    var veces = maxD ? Math.round(maxG / maxD) : null;
    var col = function (nombre) { return X.historica.palabras.indexOf(nombre) + 1; };
    var iG6 = col("GTA 6"), iG5 = col("GTA 5"), iDo = col("Avengers Doomsday");
    function el(tag, at, padre) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); if (padre) padre.appendChild(e); return e; }
    function texto(t, at, padre) { var e = el("text", at, padre); e.textContent = t; return e; }
    function historica(W) {
      var alto = 240, M = { i: 30, d: W < 480 ? 84 : 96, a: 14, b: 22 }, w = W - M.i - M.d, h = alto - M.a - M.b;
      var svg = el("svg", { viewBox: "0 0 " + W + " " + alto, class: "dd-svg", role: "img",
        "aria-label": "Interés en Google mes a mes desde 2013: GTA 6, GTA 5 y Avengers: Doomsday" });
      var x = function (i) { return M.i + i / (H.length - 1) * w; }, y = function (v) { return M.a + h - v / 100 * h; };
      [0, 100].forEach(function (v) { el("line", { x1: M.i, x2: M.i + w, y1: y(v), y2: y(v), class: "guia" }, svg); texto(v, { x: M.i - 8, y: y(v) + 4, "text-anchor": "end" }, svg); });
      [0, Math.floor(H.length / 2), H.length - 1].forEach(function (i) {
        texto(new Date(H[i][0] * 1000).getUTCFullYear(), { x: x(i), y: alto - 6, "text-anchor": i ? (i === H.length - 1 ? "end" : "middle") : "start" }, svg);
      });
      var linea = function (k, cls) { el("path", { d: H.map(function (q, i) { return (i ? "L" : "M") + x(i).toFixed(1) + " " + y(q[k]).toFixed(1); }).join(""), class: cls }, svg); };
      if (iG5) linea(iG5, "g5");
      if (iDo) linea(iDo, "d");
      linea(iG6, "g");
      var u = H[H.length - 1];
      if (iG5) {
        var pico = H.reduce(function (a, q, i) { return q[iG5] > H[a][iG5] ? i : a; }, 0);
        texto("GTA 5 en " + new Date(H[pico][0] * 1000).getUTCFullYear() + " · " + H[pico][iG5], { x: x(pico) + 8, y: y(H[pico][iG5]) + 4 }, svg);
      }
      texto("GTA 6 · " + u[iG6], { x: x(H.length - 1) + 8, y: y(u[iG6]) + 5, class: "et-g" }, svg);
      if (iDo) texto("Doomsday · " + u[iDo], { x: x(H.length - 1) + 8, y: y(u[iDo]) + 5, class: "et-d" }, svg);
      return svg;
    }
    var frase = veces ? "GTA 6 se buscó <b>" + veces + " veces más</b> que Doomsday en su mejor día."
      : "En los últimos 90 días, Doomsday no llegó a 1 de 100 frente a GTA 6.";
    caja.innerHTML = '<p class="dd-frase">' + frase + "</p>" +
      '<p class="dd-sub">Las barras: el día más alto de cada uno en los últimos 90 días. La línea: mes a mes desde 2013, con GTA 5 de referencia.</p>' +
      '<div class="dd-duelo"><div><div class="dd-barras" role="img" aria-label="Mejor día en Google: GTA 6 ' + maxG + ', Doomsday ' + maxD + ' de 100">' +
      '<div class="dd-barra g"><b>' + maxG + '</b><i style="height:' + maxG + '%"></i></div>' +
      '<div class="dd-barra d"><b>' + maxD + '</b><i style="height:' + Math.max(maxD, 1.5) + '%"></i></div></div>' +
      '<div class="dd-nom"><span>GTA 6</span><span>Doomsday</span></div></div><div class="dd-hist"></div></div>' +
      '<p class="dd-nota">Google Trends, todo el mundo. 100 = el punto con más búsquedas de cada consulta; Trends no dice cuántas fueron, y los números de las dos partes no se comparan entre sí. ' +
      "Consulta del " + fecha(Date.parse(X.t) / 1000) + (X.tarea === "6.1" ? "" : " (previa)") + "; Doomsday se estrena el 18 dic.</p>";
    var hist = caja.querySelector(".dd-hist"), ancho = 0;
    function dibujar() {
      var W = Math.round(Math.min(600, Math.max(320, hist.clientWidth || 600)));
      if (W === ancho) return;
      ancho = W; hist.textContent = ""; hist.appendChild(historica(W));
    }
    dibujar();
    window.addEventListener("resize", function () { clearTimeout(dibujar.t); dibujar.t = setTimeout(dibujar, 150); });
  })();

  /* ---------- ¿Qué tan grande es GTA 6? (6.8; opción A "Tablero" de Bruno, 2026-11-21) ----------
     La consulta extra a Google Trends de la 6.1 (una sola vez, el 21 nov): tres cifras; GTA 6
     frente a los juegos más grandes hora por hora, todos en la misma escala para poder
     compararlos (pedido de Bruno); cuánto se buscó cada uno en toda la semana y su hora más alta;
     los países; mes a mes desde 2013, y lo que más se buscó. En Trends cada consulta va de 0 a 100
     por su cuenta: los juegos se comparan dentro de un gráfico, no un gráfico con otro. La cifra
     de la semana se compara con el juego que más se acercó (no con el que más conviene). */
  (function () {
    var sec = $("trends61"), caja = $("trends61-caja"), X = D.trends_extra;
    if (!sec || !caja || !X || X.tarea !== "6.1" || !X.comparacion || !X.historica || !X.paises || !X.paises.length) return;
    var C = X.comparacion, H = X.historica, J = C.palabras, JH = H.palabras;
    var g6 = J.indexOf("GTA 6"), g6h = JH.indexOf("GTA 6"), g5h = JH.indexOf("GTA 5");
    if (g6 < 0 || g6h < 0 || C.puntos.length < 2 || H.puntos.length < 2) return;
    // Solo con la consulta de la semana del lanzamiento: si un día se repite la consulta (idea:
    // enero, por Doomsday), los textos de esta sección ya no serían ciertos (abogado del diablo).
    var nz = C.puntos.findIndex(function (p) { return p[0] * 1000 >= LUGARES.nz.ts; });
    if (nz <= 0) return;
    sec.hidden = false;
    var COLOR = { "GTA 6": "--a1", "GTA 5": "--a2", "Minecraft": "--j-verde", "Fortnite": "--j-morado", "Marvel Rivals": "--j-naranja",
      "Ocarina of Time": "--j-verde", "Avengers Doomsday": "--j-morado" };
    var color = function (n) { return "var(" + (COLOR[n] || "--tenue") + ")"; };
    var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    var mes = function (s) { var d = new Date(s * 1000); return MESES[d.getUTCMonth()] + " de " + d.getUTCFullYear(); };
    // La semana: todas las horas sumadas (lo que se buscó en total) y la hora más alta de cada juego.
    var suma = J.map(function (n, j) { return C.puntos.reduce(function (s, p) { return s + p[j + 1]; }, 0); });
    var pico = J.map(function (n, j) { return Math.max.apply(null, C.puntos.map(function (p) { return p[j + 1]; })); });
    var rival = -1;   // el que más se acercó a GTA 6
    J.forEach(function (n, j) { if (j !== g6 && (rival < 0 || suma[j] > suma[rival])) rival = j; });
    var veces = function (j) { return suma[j] ? suma[g6] / suma[j] : null; };
    // Mes a mes: el último mes de GTA 6 (todavía sin terminar) frente al mejor mes de GTA 5.
    var ultH = H.puntos[H.puntos.length - 1], mejor5 = null;
    if (g5h >= 0) H.puntos.forEach(function (p) { if (!mejor5 || p[g5h + 1] > mejor5[g5h + 1]) mejor5 = p; });
    var P = X.paises, chile = -1;
    P.forEach(function (p, i) { if (p[2] === "CL") chile = i; });

    var cifras = [];
    if (rival >= 0 && veces(rival) > 1) cifras.push([fDec1.format(veces(rival)) + "×", "más búsquedas que " + limpio(J[rival]) + " en la semana del lanzamiento, el juego que más se le acercó"]);
    if (mejor5 && mejor5[g5h + 1]) cifras.push([fDec1.format(ultH[g6h + 1] / mejor5[g5h + 1]) + "×",
      "el interés de GTA 6 en " + mes(ultH[0]) + " (mes todavía sin terminar) frente al de GTA 5 en su mejor mes, " + mes(mejor5[0])]);
    cifras.push([String(P.length), "países en la lista de Google · 1.º " + limpio(P[0][0]) + (chile > 0 ? ", Chile " + (chile + 1) + ".º" : "")]);

    function barras(filas) {   // filas: [nombre, ancho 0-100, valor, clase, color (opcional)]
      return '<div class="t61-barras">' + filas.map(function (f) {
        return '<div class="' + (f[3] || "") + '"><span>' + f[0] + '</span><i style="width:' + Math.max(0.5, f[1]).toFixed(1) + "%" + (f[4] ? ";background:" + f[4] : "") + '"></i><b>' + f[2] + "</b></div>";
      }).join("") + "</div>";
    }
    var semana = barras(J.map(function (n, j) {
      var v = veces(j), t = j === g6 ? "—" : !v ? "casi 0" : v >= 1 ? fDec1.format(v) + "× menos" : fDec1.format(1 / v) + "× más";   // (por si un día otro supera a GTA 6)
      return [limpio(n), Math.min(100, suma[j] / (suma[g6] || 1) * 100), t, j === g6 ? "gta" : "", color(n)];   // cada barra, del color de su línea
    }));
    var picos = barras(J.map(function (n, j) { return [limpio(n), pico[j], String(pico[j]), j === g6 ? "gta" : "", color(n)]; }));
    var top = P.slice(0, 10).map(function (p, i) { return [p, i]; });
    if (chile >= 10) top.push([P[chile], chile]);
    var paises = barras(top.map(function (x) { return [(x[1] + 1) + ". " + limpio(x[0][0]), x[0][1], String(x[0][1]), x[0][2] === "CL" ? "cl" : ""]; }));
    var aumento = (X.en_aumento || []).map(function (x) {
      var subida = /^\+/.test(x[1]);
      return "<span>" + limpio(x[0]) + "<em>" + (subida ? limpio(x[1]) : limpio(String(x[1]).toLowerCase())) + "</em></span>";   // "aumento puntual", visible (en el celular no hay title)
    }).join("");
    var buscadas = (X.mas_buscadas || []).map(function (x) { return "<span>" + limpio(x) + "</span>"; }).join("");
    var leyenda = function (nombres) { return '<p class="t61-leyenda">' + nombres.map(function (n) { return '<span><i style="background:' + color(n) + '"></i>' + limpio(n) + "</span>"; }).join("") + "</p>"; };

    $("trends61-nota").textContent = "Google Trends, todo el mundo, consulta del " + dia(Date.parse(X.t)) + ". Dentro de cada gráfico, los juegos están en la misma escala " +
      "(100 = el momento con más búsquedas de esa consulta), así que se pueden comparar entre sí; un gráfico con otro, no. Trends no dice cuántas búsquedas fueron.";
    caja.innerHTML = '<div class="t61-cifras">' + cifras.map(function (c) { return '<div class="t61-cifra"><b>' + c[0] + "</b><span>" + c[1] + "</span></div>"; }).join("") + "</div>" +
      '<div class="t61-grid"><div><h3 class="sub">GTA 6 frente a otros juegos grandes · hora por hora</h3>' + leyenda(J) + '<div class="t61-g" data-g="semana"></div></div>' +
      '<div><h3 class="sub">Cuánto se buscó en toda la semana</h3>' + semana + '<p class="t61-pie">Todas las horas sumadas, comparadas con las de GTA 6.</p>' +
      '<h3 class="sub">Su hora más alta</h3>' + picos + "</div></div>" +
      '<div class="t61-grid t61-par"><div><h3 class="sub">Dónde pesa más GTA 6</h3>' + paises + '<p class="t61-pie">100 = el país donde GTA 6 pesa más entre todo lo que se busca (no donde más se busca en cantidad). Google solo lista países con suficientes búsquedas.</p></div>' +
      '<div><h3 class="sub">Mes a mes desde 2013</h3>' + leyenda(JH) + '<div class="t61-g" data-g="historia"></div>' +
      '<p class="t61-pie">Cada línea es la parte de todas las búsquedas de Google que fue para esas palabras, escritas tal cual ("GTA 5", no "GTA V"). El último mes todavía no termina.</p></div></div>' +
      (aumento ? '<h3 class="sub">Lo que más subió</h3><div class="t61-chips">' + aumento + "</div>" +
        '<p class="t61-pie t61-pie-chips">«Aumento puntual»: así marca Google una búsqueda que subió más de un 5.000 %.</p>' : "") +
      (buscadas ? '<h3 class="sub">Lo más buscado junto a GTA 6</h3><div class="t61-chips">' + buscadas + "</div>" : "");

    /* Un gráfico de líneas (todas de 0 a 100): una línea por juego, GTA 6 encima y más gruesa.
       marcas: [[índice, texto]] en el eje; raya: [índice, texto] punteada (la salida). Los textos
       del eje van en <g class="eje">, que revisa probar_pagina.py para que no se encimen. */
    function lineas(W, nombres, puntos, marcas, raya, tenues, etiqueta) {
      var alto = Math.round(Math.max(210, Math.min(250, W * 0.6))), mi = 34, md = 10, ma = 14, mb = 26, n = puntos.length;
      var x = function (i) { return mi + i / (n - 1) * (W - mi - md); }, y = function (v) { return ma + (1 - v / 100) * (alto - ma - mb); };
      var s = '<svg viewBox="0 0 ' + W + " " + alto + '" role="img" aria-label="' + limpio(etiqueta) + '">';
      [0, 25, 50, 75, 100].forEach(function (v) {
        s += '<line class="guia" x1="' + mi + '" x2="' + (W - md) + '" y1="' + y(v) + '" y2="' + y(v) + '"/><g class="eje"><text x="' + (mi - 6) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + v + "</text></g>";
      });
      marcas.forEach(function (m) { s += '<g class="eje"><text x="' + x(m[0]).toFixed(1) + '" y="' + (alto - 7) + '" text-anchor="middle">' + m[1] + "</text></g>"; });
      if (raya) {
        var xr = x(raya[0]), izq = xr > W / 2;   // el texto, del lado con más espacio
        s += '<line class="salida" x1="' + xr.toFixed(1) + '" x2="' + xr.toFixed(1) + '" y1="' + ma + '" y2="' + (alto - mb) + '"/>' +
          '<text class="salida-texto" x="' + (izq ? xr - 5 : xr + 5).toFixed(1) + '" y="' + (ma + 10) + '" text-anchor="' + (izq ? "end" : "start") + '">' + raya[1] + "</text>";
      }
      nombres.slice().reverse().forEach(function (nom) {
        var j = nombres.indexOf(nom), d = puntos.map(function (p, i) { return (i ? "L" : "M") + x(i).toFixed(1) + " " + y(p[j + 1]).toFixed(1); }).join("");
        s += '<path d="' + d + '" class="t61-l' + (nom === "GTA 6" ? " gta" : "") + (tenues.indexOf(nom) >= 0 ? " tenue" : "") + '" style="stroke:' + color(nom) + '"/>';
      });
      return s + "</svg>";
    }
    function dibujarSemana(W) {
      var dias = [];
      C.puntos.forEach(function (p, i) { if (partes(p[0] * 1000).hour === 0) dias.push([i, dia(p[0] * 1000)]); });   // medianoche de Chile
      var cada = Math.max(1, Math.ceil(46 / ((W - 44) / Math.max(1, C.puntos.length) * 24)));   // si no caben, un día sí y otro no
      var nz = C.puntos.findIndex(function (p) { return p[0] * 1000 >= LUGARES.nz.ts; });
      return lineas(W, J, C.puntos, dias.filter(function (m, k) { return k % cada === 0; }), nz > 0 ? [nz, "Sale en NZ"] : null, [],
        "Google Trends hora por hora, " + J.join(", ") + ": GTA 6 llegó a " + pico[g6] + " de 100");
    }
    function dibujarHistoria(W) {
      var anios = [], porAnio = (W - 44) / Math.max(1, H.puntos.length) * 12, cada = [1, 2, 3, 4, 5].find(function (k) { return k * porAnio >= 40; }) || 6;
      H.puntos.forEach(function (p, i) { var d = new Date(p[0] * 1000); if (d.getUTCMonth() === 0 && d.getUTCFullYear() % cada === 2013 % cada) anios.push([i, d.getUTCFullYear()]); });
      var i5 = mejor5 ? H.puntos.indexOf(mejor5) : -1;
      return lineas(W, JH, H.puntos, anios, i5 >= 0 ? [i5, "Sale GTA 5"] : null, ["Ocarina of Time", "Avengers Doomsday"],
        "Google Trends mes a mes desde 2013: " + JH.join(", "));
    }
    var anchos = {};
    function dibujar() {
      caja.querySelectorAll("[data-g]").forEach(function (g) {
        var W = Math.round(Math.max(300, g.clientWidth || 600));
        if (anchos[g.dataset.g] === W) return;
        anchos[g.dataset.g] = W;
        g.innerHTML = g.dataset.g === "semana" ? dibujarSemana(W) : dibujarHistoria(W);
      });
    }
    dibujar();
    window.addEventListener("resize", function () { clearTimeout(dibujar.t); dibujar.t = setTimeout(dibujar, 150); });
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
      { titulo: "Más de Google Trends", cuando: "Una vez, entre el 20 y el 25 de noviembre", listo: !!(D.trends_extra && D.trends_extra.tarea === "6.1"), ir: "trends61",
        que: "En qué países se busca más GTA 6, qué más busca la gente y GTA 6 frente a los juegos más grandes y a GTA 5 desde 2013." },
      { titulo: "Rebobinar el lanzamiento", cuando: "Después del 19 de noviembre", listo: !!D.rebobinar, ir: "rebobinar",
        que: "Una barra para mover la página media hora por media hora y revivir el día del lanzamiento." },
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
      // Sin almacenamiento no se toca nada: el navegador restaura la altura él solo, como antes.
      try {
        sessionStorage.setItem("gta6-lugar-recarga", JSON.stringify(lugarActual()));
        sessionStorage.setItem("gta6-recarga", "1");
        recargandoSola = true;
        history.scrollRestoration = "manual";   // vuelve "auto" al terminar de volver al lugar
      } catch (e) { /* sin almacenamiento */ }
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
        // En pleno rebobinado (7.1) no recarga sola: solo ofrece el botón (el enlace guarda el momento).
        if (!rebobinando && (document.hidden || Date.now() - ultimoToque > 90000)) recargar(); else pintar();
      }).catch(function () { /* sin conexión: se vuelve a intentar en 2 minutos */ });
    }
    // Al volver de una recarga automática, a la misma altura: ver "Volver al mismo lugar", arriba.
    pintar(); setInterval(function () { if (!hayNuevos) pintar(); }, 30000);
    if (/^https?:$/.test(location.protocol)) {
      setInterval(revisar, 120000);
      document.addEventListener("visibilitychange", function () { if (!document.hidden) revisar(); else if (hayNuevos && !rebobinando) recargar(); });
    }
  })();

  /* ---------- Menú de secciones (opción B de Bruno, 2026-11-14: botón flotante) ---------- */
  (function () {
    var caja = $("menu"); if (!caja) return;
    var S = [["records", "Récords"], ["seccion-linea", "Línea de tiempo"], ["resumen", "Resumen"], ["seccion-twitch", "Twitch y Kick"],
      ["seccion-trends", "Trends"], ["trends61", "¿Qué tan grande?"], ["seccion-servidores", "Servidores"], ["seccion-videos", "Videos"], ["comparacion", "Comparación"], ["doomsday", "Doomsday"], ["lanzamientos", "Otros lanzamientos"],
      ["seccion-noticias", "Titulares"], ["album", "Álbum"], ["capsula", "Cápsula"], ["proximamente", "Próximamente"]].filter(function (x) { return $(x[0]) && !$(x[0]).hidden; });   // sin las que quedaron ocultas (sin datos)
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
    var abierto = false, DUR = 420, relojes = [], N = lista.querySelectorAll("a").length;
    /* La barra de desplazamiento solo aparece si la lista de verdad no cabe (pantalla baja), y
       solo cuando ya terminó de abrirse. Antes asomaba un momento al abrir y al cerrar, porque las
       opciones entran y salen corridas unos píxeles hacia abajo (fallo visto por Bruno, 2026-11-17). */
    function revisarDesborde() { lista.classList.toggle("desborda", abierto && lista.scrollHeight > lista.clientHeight + 1); }
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
      lista.classList.remove("desborda");
      if (QUIETO.matches) { soltar(); lista.hidden = !si; caja.classList.toggle("abierto", si); caja.classList.toggle("texto", si); revisarDesborde(); return; }
      if (si) {
        var desde = caja.style.width ? tam() : medir(false), hasta = medir(true);   // si estaba cerrándose, desde donde iba
        caja.classList.remove("cerrando", "texto", "abierto"); lista.hidden = false; fijar(desde); void caja.offsetWidth;
        caja.classList.add("animando", "abierto"); fijar(hasta);
        luego(DUR * 0.6, function () { caja.classList.add("texto"); });
        luego(DUR + 40, soltar);
        luego(DUR * 0.6 + N * 14 + 340, revisarDesborde);   // cuando la última opción ya llegó a su lugar
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
    window.addEventListener("resize", function () { if (abierto && !caja.classList.contains("animando")) revisarDesborde(); });
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
     El cálculo está en inicio.js (pone el primer cielo); aquí se revisa cada minuto y van los
     botones, que fijan otra hora hasta recargar la página. */
  (function () {
    // La fórmula del sol está en inicio.js, que pone el cielo antes del primer dibujo (9.4).
    // Respaldo si inicio.js no llegó (p. ej. un index.html viejo guardado en el navegador justo
    // después de publicar): el cielo queda como esté, pero el resto de la página sigue andando.
    var raiz = document.documentElement, fijada = null;
    var horaDeMiami = (window.INICIO && window.INICIO.horaDeMiami) || function () { return raiz.dataset.hora || "atardecer"; };
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
  /* Al rebobinar (7.1): los récords que había hasta ese momento (con "¡Nuevo récord!" según esa
     hora) y, en los de Twitch, Kick y YouTube, el valor de ese momento (opción C de Bruno).
     Los hitos para la línea de tiempo se anotan solo la primera vez (con los datos de hoy). */
  function pintarRecords(V, primera) {
    var caja = $("records-vitrina");
    if (!caja) return;
    var filas = (V.D.mediciones || []).map(function (m) { return { ts: Date.parse(m.t), tw: m.twitch || {} }; })
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
    (V.D.mediciones || []).forEach(function (m) {
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
    var RY = V.D.records_youtube || {};
    function lideresDe(lista) {
      return (lista || []).map(function (r) { return { ts: Date.parse(r.t), valor: r.visitas, que: r.titulo, url: urlVideo(r.id) }; })
        .filter(function (r) { return !isNaN(r.ts); });
    }
    var lideres = lideresDe(RY.video), lideresShort = lideresDe(RY.short);
    var crece = [];
    (V.D.youtube_crece || V.D.youtube || []).forEach(function (v) {
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
    // El valor de ese momento (solo al rebobinar): el de la última medición buena hasta esa hora;
    // en los directos, el más visto de esa medición; en los videos, el más visto de la lista de entonces.
    function enMomento(lista) {
      if (V.corte == null || !lista.length) return null;
      var t = lista[lista.length - 1].ts, mejor = null;
      lista.forEach(function (e) { if (e.ts === t && (!mejor || e.valor > mejor.valor)) mejor = e; });
      return mejor;
    }
    function videoEnMomento(esShort) {
      if (V.corte == null) return null;
      var mejor = null;
      (V.D.youtube || []).forEach(function (v) {
        var u = v.serie[v.serie.length - 1];
        if ((v.short === true) === esShort && u && (!mejor || u.visitas > mejor.valor)) mejor = { ts: Date.parse(u.t), valor: u.visitas, que: v.titulo, url: urlVideo(v.id) };
      });
      return mejor;
    }
    var R = [
      { nombre: "Más espectadores en Twitch", h: historia(esp), fmt: num, uni: "espectadores a la vez", ahora: enMomento(esp) },
      { nombre: "Directo con más público en Twitch", h: historia(canal), fmt: num, uni: "espectadores en un solo directo", ahora: enMomento(canal) },
      { nombre: "Más transmisiones a la vez en Twitch", h: historia(trans), fmt: num, uni: "transmisiones de GTA VI", ahora: enMomento(trans) },
      { nombre: "Más espectadores en Kick", h: historia(kEsp), fmt: num, uni: "espectadores a la vez", ahora: enMomento(kEsp) },
      { nombre: "Directo con más público en Kick", h: historia(kCanal), fmt: num, uni: "espectadores en un solo directo", ahora: enMomento(kCanal) },
      { nombre: "Más directos a la vez en Kick", h: historia(kTrans), fmt: num, uni: "directos de GTA VI", ahora: enMomento(kTrans) },
      { nombre: "Video más visto", h: lideres, fmt: compacto, uni: "visitas", prev: "Récords anteriores", aviso: true, ahora: videoEnMomento(false) },
      { nombre: "Short más visto", h: lideresShort, fmt: compacto, uni: "visitas", prev: "Récords anteriores", aviso: true, ahora: videoEnMomento(true) },
      { nombre: "Video que más creció en una hora", h: historia(crece), fmt: num, uni: "visitas en una hora" },
      { nombre: "Día con más titulares", h: historiaConteo(V.D.noticias || [], fClave, dia), fmt: num, uni: "titulares", solo: "dia" }
    ];
    var abiertos = {};   // "Récords anteriores" que el visitante abrió: siguen abiertos al redibujar (7.1)
    caja.querySelectorAll("details[open]").forEach(function (dt) { var sm = dt.closest("li").querySelector("small"); if (sm) abiertos[sm.textContent] = 1; });
    function cuando(r, e) { return r.solo ? e.que : dia(e.ts) + " · " + hora(e.ts); }
    function quien(r, e) { return r.solo || !e.que ? "" : enlace(e.url, limpio(e.que)); }
    var html = R.filter(function (r) { return r.h.length; }).map(function (r) {
      var e = r.h[r.h.length - 1], nuevo = r.h.length > 1 && ultima - e.ts < NUEVO;
      var prev = r.h.slice(0, -1).reverse().slice(0, 5);
      return '<li class="' + (nuevo ? "nuevo" : "") + '"><small>' + r.nombre + "</small>" + (nuevo ? '<span class="rc-nuevo">¡Nuevo récord!</span>' : "") +
        "<b>" + cifra("rc:" + r.nombre, e.valor, r.fmt) + '</b><span class="rc-uni">' + r.uni + "</span>" +
        (quien(r, e) ? '<p class="rc-que">' + quien(r, e) + "</p>" : "") + '<p class="rc-cuando">' + cuando(r, e) + "</p>" +
        (r.ahora ? '<p class="rb-ahora">En ese momento: <b data-rb="r:' + r.nombre + '" data-v="' + r.ahora.valor + '" data-f="' + (r.fmt === compacto ? "c" : "n") + '">' + r.fmt(r.ahora.valor) + "</b>" + (r.ahora.que && !r.solo ? " · " + enlace(r.ahora.url, limpio(r.ahora.que)) : "") +
          (V.corte - r.ahora.ts > 20 * 60000 ? " (dato de las " + hora(r.ahora.ts) + ")" : "") + "</p>" : "") +
        (r.aviso ? '<p class="rc-aviso">Puede que no trate de GTA 6: el filtro quita los que solo usan el hashtag, pero no es perfecto.</p>' : "") +
        (prev.length ? '<details class="rc-prev"' + (abiertos[r.nombre] ? " open" : "") + "><summary>" + (r.prev || "Récords anteriores") + " (" + (r.h.length - 1) + ")</summary><ul>" + prev.map(function (p) {
          return "<li><b>" + r.fmt(p.valor) + "</b> " + (quien(r, p) ? quien(r, p) + " · " : "") + cuando(r, p) + "</li>";
        }).join("") + "</ul></details>" : "") + "</li>";
    }).join("");
    caja.innerHTML = html || '<li class="vacio">Sin datos todavía.</li>';

    // Para la línea de tiempo: hitos redondos de espectadores en Twitch y cada vez que cambia el video más visto.
    var tr = V.D.trailers || [];
    if (primera) hitosLinea(esp, filas, lideres, lideresShort, tr);
    $("records-trailers").innerHTML = tr.length ? tr.map(function (t) {
      var s = t.serie, u = s[s.length - 1], sube = s.length > 1 ? u.visitas - s[0].visitas : null;
      return "<li>" + enlace(urlVideo(t.id), limpio(t.titulo.replace(/^Grand Theft Auto VI[:\s]*/, "") || t.titulo)) + "<b>" + cifra("tr:" + t.id, u.visitas, compacto) + "</b><small>visitas</small>" +
        (sube != null ? '<span class="rc-sube">+' + cifra("trs:" + t.id, sube) + " desde el " + dia(Date.parse(s[0].t)) + "</span>" : "") + "</li>";
    }).join("") : '<li class="vacio">Todavía sin mediciones.</li>';
  }
  function hitosLinea(esp, filas, lideres, lideresShort, tr) {
    var HITOS = [2500, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000, 2000000, 5000000];
    var pasados = 0;
    esp.forEach(function (e) {
      while (pasados < HITOS.length && e.valor >= HITOS[pasados]) {
        if (filas.length && e.ts > filas[0].ts) eventosExtra.push({ ts: e.ts, texto: "Twitch pasa los " + num(HITOS[pasados]) + " espectadores a la vez", auto: true, tipo: "envivo" });
        pasados++;
      }
    });
    lideres.slice(1).forEach(function (l) {
      eventosExtra.push({ ts: l.ts, texto: "Nuevo video más visto en YouTube: " + l.que, auto: true, tipo: "video" });
    });
    lideresShort.slice(1).forEach(function (l) {
      eventosExtra.push({ ts: l.ts, texto: "Nuevo Short más visto en YouTube: " + l.que, auto: true, tipo: "short" });
    });

    // Tráilers oficiales de GTA VI (se miden desde el 13 nov).
    // Para la línea de tiempo: cada vez que un tráiler pasa otra decena de millones de visitas.
    tr.forEach(function (t) {
      var nombre = t.titulo.replace(/^Grand Theft Auto VI[:\s]*/, "") || t.titulo;
      t.serie.forEach(function (p, i) {
        if (!i) return;
        var antes = Math.floor(t.serie[i - 1].visitas / 1e7), ahoraM = Math.floor(p.visitas / 1e7);
        if (ahoraM > antes) eventosExtra.push({ ts: Date.parse(p.t), texto: "El " + nombre + " de GTA VI pasa los " + num(ahoraM * 10) + " millones de visitas", auto: true, tipo: "video" });
      });
    });
  }
  pintarRecords(HOY, true);

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
        cuadro("Mediciones", num(r.med), r.med === 1 ? "medición guardada" : "mediciones guardadas", "", r.huecos ? r.huecos + " con algún hueco" : "sin huecos") +
        "</ul>";
    }
    $("resumen-dias").addEventListener("click", function (e) { var k = e.target.dataset.dia; if (k) { var dir = dias.indexOf(k) - dias.indexOf(elegido); elegido = k; pintar(); if (window.ANIM && dir) ANIM.resumen(caja, dir); } });
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
      ctx.fillText(recortar(ctx, "Datos de Twitch, Kick, YouTube, Google Trends y Google Noticias · hora de Chile", W - 80 * u), W / 2, H - 62 * u);
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
        { id: "mediciones", nombre: "MEDICIONES", valor: num(r.med), uni: r.huecos ? r.huecos + " con algún hueco" : "sin huecos", extra: "" }
      ];
      return q.filter(function (c) { return c.hay !== false; });
    }
    var NOMBRES = { twitch: "Twitch", kick: "Kick", video: "Video más visto", short: "Short más visto", trends: "Google Trends",
      titulares: "Titulares", mediciones: "Mediciones" };
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

  /* ---------- GTA frente a lo más visto (tarea 6.3; rediseño 9.7, opción A "GTA VI al centro", elegida por Bruno, 2026-11-17) ----------
     Arriba, un recuadro con GTA VI: su puesto en Twitch y sus videos en tendencia en YouTube,
     cada uno con una línea de cómo fue cambiando medición a medición (el ranking y las
     tendencias se guardan desde el 13 nov); GTA V, de referencia. Debajo, las dos columnas de
     antes (6.3 A): barras de Twitch y listas de YouTube, con cada video marcado VI o V según
     su título. Usa la última medición.
     Kick (pedido de Bruno, 2026-11-18): su puesto en el recuadro y sus barras bajo las de Twitch,
     con el mismo estilo. Kick no tiene ranking: se suma el público de todos sus directos. */
  var comparacionSec = (function () {
    var caja = $("comparacion-cols");
    if (!caja) return { poner: function () {} };
    var C, tw, yt, kk, Dv = D, abiertasCmp = {};   // países con "Ver N más" abierto (siguen así al redibujar)
    var GTA = { "1867279146": "GTA VI", "32982": "GTA V" }, GTA_KICK = { 13155: "GTA VI", 8: "GTA V" };
    // Al rebobinar (7.1): lo que había en ese momento (la última medición buena de cada fuente).
    function poner(V) {
      Dv = V.D; C = Dv.comparacion || {}; tw = C.twitch; yt = C.youtube; kk = C.kick;
      if (!tw && !yt && !kk) {
        $("comparacion-nota").textContent = "Cómo le va a GTA comparado con todo lo demás en Twitch, Kick y YouTube.";
        caja.innerHTML = '<p class="vacio">Sin datos todavía.</p>'; return;
      }
      var t = Math.max(tw ? Date.parse(tw.t) : 0, yt ? Date.parse(yt.t) : 0, kk ? Date.parse(kk.t) : 0);
      $("comparacion-nota").textContent = "Cómo le va a GTA comparado con todo lo demás en Twitch, Kick y YouTube. " +
        (V.corte == null ? "Última medición: " : "Medición de ") + dia(t) + ", " + hora(t).replace(/\.$/, "") + ".";
      caja.innerHTML = armar();
    }
    poner(HOY);
    // "Ver N más" de las listas de YouTube (se muestran 4 por país para que no quede un hueco bajo Twitch).
    caja.addEventListener("click", function (e) {
      var b = e.target.closest(".cp-mas"); if (!b) return;
      var ol = b.previousElementSibling, abierta = ol.classList.toggle("abierta");
      abiertasCmp[b.dataset.region] = abierta;
      b.textContent = abierta ? "Ver menos" : b.dataset.texto;
      b.setAttribute("aria-expanded", abierta);
    });
    return { poner: poner };

    function armar() {
      var VISIBLES = 4;
      // A qué juego se refiere un video, solo por su título (GTA 6/VI o GTA 5/V).
      function juego(t) {
        var seis = /\b(gta\s*-?\s*(6|vi)|grand theft auto\s*(6|vi))\b/i.test(t), cinco = /\b(gta\s*-?\s*(5|v)|grand theft auto\s*(5|v))\b/i.test(t);
        return seis && cinco ? "VI y V" : seis ? "VI" : cinco ? "V" : "";
      }
      function cuenta(r, j) { return yt && yt.regiones[r] ? yt.regiones[r].gta.filter(function (x) { var g = juego(x.titulo); return g === j || g === "VI y V"; }).length : null; }
      var regiones = yt ? Object.keys(yt.regiones) : [], nombres = { CL: "Chile", US: "EE. UU." };
      // Historial: puesto de GTA VI en Twitch (fuera del top = abajo) y videos de GTA en tendencia, por medición.
      var hist = (Dv.mediciones || []).filter(function (m) { return m.ranking; }).map(function (m) {
        return { ts: Date.parse(m.t), p: m.ranking.gta6 || m.ranking.leidas + 1, fuera: !m.ranking.gta6, leidas: m.ranking.leidas, tend: m.tendencias || {} };
      });
      // Lo mismo para Kick (desde el 18 nov): su ranking cuenta todas las categorías, nunca queda "fuera".
      var histK = (Dv.mediciones || []).filter(function (m) { return m.ranking_kick && m.ranking_kick.gta6; }).map(function (m) {
        return { ts: Date.parse(m.t), p: m.ranking_kick.gta6 };
      });
      function linea(valor, invertir, tope, lista) {
        lista = lista || hist;
        if (lista.length < 2) return "";
        var t0 = lista[0].ts, t1 = lista[lista.length - 1].ts;
        var d = lista.map(function (h, i) { var v = valor(h); var y = invertir ? (v - 1) / (tope - 1) * 26 + 2 : 28 - v / tope * 26; return (i ? "L" : "M") + ((h.ts - t0) / (t1 - t0 || 1) * 120).toFixed(1) + " " + y.toFixed(1); }).join("");
        return '<svg class="mini cp-hist" viewBox="0 0 120 30" preserveAspectRatio="none" aria-hidden="true"><path class="area" d="' + d + 'L120 30L0 30Z"/><path d="' + d + '"/></svg>';
      }
      var primero = hist.length ? hist[0] : null, mejor = null;
      hist.forEach(function (h) { if (!h.fuera && (!mejor || h.p < mejor.p)) mejor = h; });
      // Con clave, el puesto cuenta al rebobinar (cifra): #12 → #8 pasa por #11, #10 y #9.
      var puesto = function (p, clave) { return p ? "#" + (clave ? cifra(clave, p) : p) : "Fuera del top " + (tw ? tw.leidas : 100); };
      var out = '<div class="cp-foco' + (kk ? " con-kick" : "") + '"><div class="cp-foco-tit"><small>En el centro</small><b>GTA VI</b><span>frente a todo lo demás; GTA V, de referencia</span></div>';
      if (tw) out += '<div class="cp-dato"><small>Twitch · puesto</small><b>' + puesto(tw.gta6, "cp:tw6") + "</b><span>GTA V: " + puesto(tw.gta5, "cp:tw5") + "</span>" +
        linea(function (h) { return h.p; }, true, 101) +
        '<em>' + (primero ? "Desde el " + dia(primero.ts) + ": " + (primero.fuera ? "fuera del top" : "#" + primero.p) + " → " + puesto(tw.gta6) + (mejor ? " · mejor: #" + mejor.p : "") : "") + "</em></div>";
      if (kk) {
        var pK = function (p, clave) { return p ? "#" + (clave ? cifra(clave, p) : p) : "Sin directos"; }, k0 = histK[0], mejorK = null;
        histK.forEach(function (h) { if (!mejorK || h.p < mejorK.p) mejorK = h; });
        out += '<div class="cp-dato"><small>Kick · puesto</small><b>' + pK(kk.gta6, "cp:k6") + "</b><span>GTA V: " + pK(kk.gta5, "cp:k5") + "</span>" +
          linea(function (h) { return h.p; }, true, Math.max.apply(null, histK.map(function (h) { return h.p; }).concat(10)), histK) +
          "<em>" + (k0 ? "Desde el " + dia(k0.ts) + ": #" + k0.p + " → " + pK(kk.gta6) + (mejorK ? " · mejor: #" + mejorK.p : "") : "Entre " + kk.categorias + " categorías con directos") + "</em></div>";
      }
      regiones.forEach(function (r) {
        var d = yt.regiones[r];
        out += '<div class="cp-dato"><small>YouTube ' + (nombres[r] || r) + " · en tendencia</small><b>" + cifra("cp:y6" + r, cuenta(r, "VI")) + ' <i>de ' + d.en_lista + "</i></b><span>videos de GTA VI · GTA V: " + cifra("cp:y5" + r, cuenta(r, "V")) + "</span>" +
          linea(function (h) { return h.tend[r] || 0; }, false, Math.max.apply(null, hist.map(function (h) { return h.tend[r] || 0; }).concat(1)) * 1.15) + "<em>Videos de GTA en tendencia, medición a medición</em></div>";
      });
      out += "</div>";
      out += '<div class="cp-cols cp-cols2">';
      if (tw) {
        var tope = Math.max.apply(null, tw.comparadas.map(function (c) { return c.espectadores_top100; })) || 1;
        out += '<div class="cp-col"><h3 class="sub">Twitch · categorías más vistas</h3><ul class="cp-barras">' + tw.comparadas.map(function (c) {
          return '<li class="' + (c.id === "32982" ? "gta cinco" : GTA[c.id] ? "gta" : "") + '"><span class="cp-nom">' + limpio(GTA[c.id] || c.nombre) + (c.puesto ? " <i>#" + cifra("cpp:" + c.id, c.puesto) + "</i>" : "") + "</span>" +
            '<span class="cp-b"><i style="width:' + Math.max(1, c.espectadores_top100 / tope * 100).toFixed(1) + '%"></i></span><span class="cp-num">' + cifra("cpt:" + c.id, c.espectadores_top100, compacto) + "</span></li>";
        }).join("") + "</ul>" +
          '<p class="cp-nota">Twitch da el orden de las categorías, no el total de espectadores. Cada barra suma el público de las 100 transmisiones más vistas de esa categoría; por eso una barra puede ser más larga que la de un puesto anterior.</p>' +
          barrasKick() + "</div>";
      } else if (kk) out += '<div class="cp-col">' + barrasKick() + "</div>";
      // Kick, con el mismo estilo que Twitch: aquí cada barra es el público total de la categoría.
      function barrasKick() {
        if (!kk) return "";
        var topeK = Math.max.apply(null, kk.comparadas.map(function (c) { return c.espectadores; })) || 1;
        return '<h3 class="sub cp-sub-kick">Kick · categorías más vistas</h3><ul class="cp-barras">' + kk.comparadas.map(function (c) {
          return '<li class="' + (c.id === 8 ? "gta cinco" : GTA_KICK[c.id] ? "gta" : "") + '"><span class="cp-nom">' + limpio(GTA_KICK[c.id] || c.nombre) + " <i>#" + cifra("ckp:" + c.id, c.puesto) + "</i></span>" +
            '<span class="cp-b"><i style="width:' + Math.max(1, c.espectadores / topeK * 100).toFixed(1) + '%"></i></span><span class="cp-num">' + cifra("ckt:" + c.id, c.espectadores, compacto) + "</span></li>";
        }).join("") + "</ul>" +
          '<p class="cp-nota">Kick no publica un ranking: se suma el público de todos sus directos en vivo, categoría por categoría' +
          (kk.completo ? "" : " (esta vez no se alcanzaron a leer todos)") + ".</p>";
      }
      if (yt) {
        out += '<div class="cp-col"><h3 class="sub">YouTube · videos en tendencia</h3><div class="cp-paises">' + regiones.map(function (r) {
          var d = yt.regiones[r];
          var lis = d.gta.map(function (x) {
            var j = juego(x.titulo);
            return '<li class="' + (j.indexOf("VI") === 0 ? "es-seis" : "") + '"><b>#' + cifra("cpv:" + r + x.id, x.puesto) + (j ? '<em class="cp-chip">' + j + "</em>" : "") + "</b><span>" + enlace(urlVideo(x.id), limpio(x.titulo)) + "<small>" + limpio(x.canal) + "</small></span></li>";
          });
          var resto = lis.length - VISIBLES;
          return '<div><p class="cp-tit">' + (nombres[r] || r) + " <b>" + cifra("cpn:" + r, d.gta.length) + " de " + d.en_lista + "</b></p>" +
            '<ol class="cp-videos' + (abiertasCmp[r] ? " abierta" : "") + '">' + (lis.join("") || '<li class="vacio">Ningún video de GTA en la lista.</li>') + "</ol>" +
            (resto > 0 ? '<button type="button" class="cp-mas" aria-expanded="' + !!abiertasCmp[r] + '" data-region="' + limpio(r) + '" data-texto="Ver ' + resto + ' más">' + (abiertasCmp[r] ? "Ver menos" : "Ver " + resto + " más") + "</button>" : "") + "</div>";
        }).join("") + "</div></div>";
      }
      out += '</div><p class="cp-pie">' + (yt && yt.rockstar && yt.rockstar.suscriptores ? 'Canal de Rockstar en YouTube: <b>' + cifra("cp:rs", yt.rockstar.suscriptores, compacto) + "</b> suscriptores (YouTube redondea esta cifra). " : "") + "VI o V, según lo que dice el título del video.</p>";
      return out;
    }
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

  /* ---------- Rebobinar el lanzamiento (tarea 7.1; entrevista con Bruno, 2026-11-20) ----------
     Una barra para mover la página media hora por media hora (una parada por medición) desde 3 h
     antes de la hora cero de Nueva Zelanda, donde empezó el boom, hasta que el 19 nov terminó en
     todo el mundo. La página abre como siempre; el rebobinado empieza con su botón o con un enlace
     a un momento (?momento=2026-11-18T11:07Z&desde=nz). Cambian las secciones que se dibujan con
     una vista (ver HOY, arriba); las demás quedan tenues con la nota "esta sección muestra los
     datos de hoy". Controles elegidos por Bruno: arrastrar, saltar a las tres horas cero,
     reproducir (1x, 2x, 4x), media hora antes/después, copiar el enlace y volver a hoy. La hora va
     en la del visitante y, al lado, cuánto falta o pasó desde la salida que elija (Nueva Zelanda,
     Chile o Miami). Si una fuente falló en esa medición, su sección muestra el último dato bueno
     con un aviso. Al pasar por una hora cero vuelve la fiesta (fuegos y aviso). Lo que no está en
     datos.js (videos de cada momento, comparación y resumen de titulares) viene en
     web/rebobinar.js, que se carga solo al abrir el rebobinado. */
  var rebobinando = false;   // lo mira "Actualización sola": no recarga la página en pleno rebobinado
  (function () {
    var info = D.rebobinar, entrada = $("rebobinar"), barra = $("rb-barra");
    if (!info || !entrada || !barra || D.ejemplo || !(info.n > 1)) return;
    entrada.hidden = false;
    var R = null, momentos = [], k = -1, rango, topeTwitch, reloj = null, vel = 1, pulso = [], anchoPulso = 0, altoPulso = 0;
    var VEL = { 1: 2000, 2: 1000, 4: 500 };   // milisegundos por media hora
    var NOMBRES_FUENTE = { twitch: "Twitch", kick: "Kick", trends: "Google Trends", noticias: "Google Noticias", youtube: "YouTube (Global)",
      youtube_es: "YouTube (en español)", ranking: "el ranking de Twitch", ranking_kick: "el ranking de Kick", tendencias: "las tendencias de YouTube" };
    var SECCIONES = [["seccion-twitch", ["twitch", "kick"]], ["seccion-trends", ["trends"]], ["seccion-tabla", ["twitch", "kick"]],
      ["seccion-videos", ["youtube", "youtube_es"]], ["comparacion", ["ranking", "ranking_kick", "tendencias"]], ["seccion-noticias", ["noticias"]]];
    var DE_HOY = ["resumen", "seccion-servidores", "trends61", "doomsday", "lanzamientos", "album", "capsula", "proximamente"];
    var ref = "nz";
    try { var r0 = localStorage.getItem("gta6-rb-desde"); if (ORDEN.indexOf(r0) >= 0) ref = r0; } catch (e) { /* sin almacenamiento */ }
    /* Los videos de cada momento (rebobinar.js) se calcularon con el filtro de siempre, "El de
       Rust". Si el visitante eligió otro (10.4), filtro-videos.js ya cambió los récords y el conteo
       de tendencias de datos.js: aquí se toman los de "El de Rust" para que todo cuadre, y la
       sección de videos lo avisa. Su elección vuelve al salir del rebobinado. */
    var FV = window.FILTRO_VIDEOS, EX = window.VIDEOS_EXTRA, RUST = { otro: false, records: null, tendencias: {} };
    if (FV && FV.aplicado && FV.eleccion && FV.porDefecto && EX && EX.records && EX.records.rust &&
        (FV.eleccion.conf !== FV.porDefecto.conf || FV.eleccion.ocultos.join(",") !== FV.porDefecto.ocultos.join(","))) {
      var ocultosV = {};
      FV.eleccion.ocultos.forEach(function (m) { ocultosV[m] = 1; });
      RUST.otro = true;
      RUST.records = EX.records.rust[FV.porDefecto.ocultos.join(",")] || null;
      ((EX.tendencias && EX.tendencias.historial) || []).forEach(function (h) {   // lo que filtro-videos.js sumó
        var dev = {};
        Object.keys(h[1]).forEach(function (r) { dev[r] = h[1][r].filter(function (ms) { return !ms.some(function (x) { return ocultosV[x]; }); }).length; });
        RUST.tendencias[h[0]] = dev;
      });
    }

    /* Hora del visitante (decisión de Bruno, 2026-11-20). El resto de la página va en hora de
       Chile: si el visitante está en otra zona, al lado va también la de Chile. */
    var fDiaLocal = new Intl.DateTimeFormat("es-CL", { day: "numeric", month: "short" });
    var fHoraLocal = new Intl.DateTimeFormat("es-CL", { hour: en12 ? "numeric" : "2-digit", minute: "2-digit", hourCycle: en12 ? "h12" : "h23" });
    var zonaLocal = ""; try { zonaLocal = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) { /* sin zona */ }
    function enChile(ts) { return zonaLocal === ZONA || new Date(ts).getTimezoneOffset() * -60000 === desfase(ts); }
    function horaLocal(ts) { return fDiaLocal.format(new Date(ts)).replace(".", "") + ", " + fHoraLocal.format(new Date(ts)); }
    function duracion(ms) {
      var m = Math.floor(Math.abs(ms) / 60000), h = Math.floor(m / 60);
      return h ? h + " h" + (m % 60 ? " " + (m % 60) + " min" : "") : (m % 60) + " min";
    }
    function desdeSalida(ts) {
      var L = LUGARES[ref], d = Math.floor(ts / 60000) * 60000 - L.ts, en = " la salida en " + L.nombre;
      if (Math.abs(d) < 60000) return "justo en" + en;
      return d > 0 ? "+" + duracion(d) + " desde" + en : "faltan " + duracion(d) + " para" + en;
    }

    /* Diseño "Pulso" (elegido por Bruno, 2026-11-20): arriba la hora y los botones; lo que se usa
       menos ("contar desde", saltar a una hora cero, velocidad y copiar el enlace) en "⋯"; abajo la
       pista, que es la curva de espectadores de Twitch del tramo (ver pintarPulso). */
    var chips = function (attr, lista) { return lista.map(function (x) { return '<button type="button" class="rb-chip" ' + attr + '="' + x[0] + '">' + x[1] + "</button>"; }).join(""); };
    var lugaresChips = ORDEN.map(function (x) { return [x, LUGARES[x].nombre]; });
    barra.innerHTML =
      '<p class="rb-aviso" role="status" hidden></p>' +
      '<div class="rb-arriba"><p class="rb-momento" id="rb-momento" aria-live="polite"><b></b><span class="rb-desde"></span><em class="rb-cl"></em></p>' +
      '<div class="rb-mando">' +
      '<button type="button" class="rb-b" data-paso="-1" aria-label="Media hora antes" title="Media hora antes">‹</button>' +
      '<button type="button" class="rb-b rb-play" aria-pressed="false" aria-label="Reproducir">▶</button>' +
      '<button type="button" class="rb-b" data-paso="1" aria-label="Media hora después" title="Media hora después">›</button>' +
      '<button type="button" class="rb-b rb-ciclo" title="Velocidad"></button>' +
      '<button type="button" class="rb-b rb-mas" aria-expanded="false" aria-controls="rb-menu" aria-label="Más opciones" title="Más opciones">⋯</button>' +
      '<button type="button" class="rb-b rb-volver">Volver a hoy</button>' +
      '<div class="rb-menu" id="rb-menu" hidden>' +
      '<small>Contar desde la salida en</small><div class="rb-grupo" role="group" aria-label="Contar desde la salida en">' + chips("data-ref", lugaresChips) + "</div>" +
      '<small>Saltar a la medianoche en</small><div class="rb-grupo">' + chips("data-salto", lugaresChips) + "</div>" +
      '<small>Velocidad</small><div class="rb-grupo" role="group" aria-label="Velocidad">' + chips("data-vel", [[1, "1x"], [2, "2x"], [4, "4x"]]) + "</div>" +
      '<button type="button" class="rb-chip rb-ancho rb-copiar">Copiar enlace de este momento</button></div></div></div>' +
      '<div class="rb-pulso"><svg aria-hidden="true"></svg><div class="rb-ceros"></div>' +
      '<input type="range" id="rb-rango" min="0" max="0" step="1" value="0" aria-label="Momento del lanzamiento"></div>' +
      '<div class="rb-pie"><span>Espectadores en Twitch · arrastra sobre la curva</span><span class="rb-pie-fechas"></span></div>';
    var rangoIn = $("rb-rango"), play = barra.querySelector(".rb-play"), aviso = barra.querySelector(".rb-aviso");

    function cargarScript(src) {
      return new Promise(function (listo, fallo) {
        var s = document.createElement("script");
        s.src = src; s.onload = listo; s.onerror = function () { s.remove(); fallo(new Error("no cargó")); };
        document.head.appendChild(s);
      });
    }
    var cargando = null;
    function cargar() {
      if (R) return Promise.resolve();
      if (cargando) return cargando;
      cargando = cargarScript("rebobinar.js?v=" + encodeURIComponent(info.huella)).then(function () {
        if (!window.REBOBINAR || !(window.REBOBINAR.momentos || []).length) throw new Error("vacío");
        R = window.REBOBINAR;
        momentos = R.momentos.map(function (mo) { return Object.assign({ ts: Date.parse(mo.t) }, mo); });
        rango = [momentos[0].ts, momentos[momentos.length - 1].ts];
        topeTwitch = 0;
        M.forEach(function (m) { if (m.ts >= rango[0] && m.ts <= rango[1]) topeTwitch = Math.max(topeTwitch, m.espectadores || 0, m.kickEsp || 0); });
        // Las series de visitas, convertidas una sola vez.
        [R.videos_g, R.videos_e].forEach(function (tabla) {
          Object.keys(tabla).forEach(function (id) { tabla[id].serie = tabla[id].serie.map(function (p) { return { ts: p[0] * 1000, t: isoDe(p[0]), visitas: p[1] }; }); });
        });
        rangoIn.max = String(momentos.length - 1);
        // La pista "Pulso": espectadores de Twitch de cada parada y los nombres de las horas cero.
        var porTs = {};
        M.forEach(function (m) { porTs[m.ts] = m.espectadores; });
        pulso = momentos.map(function (mo) { return porTs[mo.ts] == null ? null : porTs[mo.ts]; });
        barra.querySelector(".rb-ceros").innerHTML = ORDEN.map(function (x, j) {
          var i = primeroDesde(LUGARES[x].ts);
          return i < 0 ? "" : '<button type="button" data-salto="' + x + '" class="' + (j === 1 ? "izq" : "") + '" style="--p:' + (i / (momentos.length - 1)).toFixed(4) +
            '" title="Saltar a la medianoche en ' + LUGARES[x].nombre + '">' + ({ nz: "NZ", cl: "CL", mia: "MIA" })[x] + "</button>";
        }).join("");
        barra.querySelector(".rb-pie-fechas").textContent = dia(rango[0]) + " → " + dia(rango[1]);
        // Los titulares de "Lo último" de cada momento están en web/dias/: se piden ahora, todos juntos.
        var dias = {};
        momentos.forEach(function (mo) { ultimosHasta(mo.ts).forEach(function (n) { if (!n.titulo) dias[diaUTC(Date.parse(n.t) / 1000)] = 1; }); });
        return DIAS.cargar(Object.keys(dias)).then(function (contenidos) {
          contenidos.forEach(function (c) { (c.noticias || []).forEach(function (x) { var n = D.noticias[x.i]; if (n && !n.titulo) { n.titulo = x.titulo; n.medio = x.medio; n.url = x.url; } }); });
        }).catch(function () { /* sin titulares: "Lo último" queda corto, el resto sigue */ });
      });
      cargando.catch(function () { cargando = null; });
      return cargando;
    }
    // Los 6 últimos titulares publicados hasta esa hora (D.noticias va de la más vieja a la más nueva).
    function ultimosHasta(T) {
      var lista = D.noticias || [], j = lista.length;
      while (j > 0 && Date.parse(lista[j - 1].t) > T) j--;
      return lista.slice(Math.max(0, j - 6), j).reverse();
    }
    function primeroDesde(ts) { for (var i = 0; i < momentos.length; i++) if (momentos[i].ts >= ts) return i; return -1; }

    function maximoEn(lista, campo) {
      var mejor = null;
      lista.forEach(function (m) { if (m[campo] != null && (!mejor || m[campo] > mejor[campo])) mejor = m; });
      return mejor;
    }
    function videoEn(tabla, id, T) {
      var v = tabla[id];
      return { id: id, titulo: v.titulo, canal: v.canal, miniatura: v.miniatura, short: v.short, idioma: v.idioma,
        serie: v.serie.filter(function (p) { return p.ts <= T; }) };
    }
    function vista(i) {
      var mo = momentos[i], T = mo.ts, fallos = mo.fallos || {};
      var antesDe = function (t) { return Date.parse(t) <= T; };
      // Google Trends con la escala de cada medición (la de datos.js es la de hoy: traería el futuro).
      // Sin dato propio (falló), queda vacío: la ficha muestra entonces el último bueno, con su hora.
      var Mv = M.filter(function (m) { return m.ts <= T; }).map(function (m) {
        var v = R.tr_med[Math.round(m.ts / 1000)];
        return Object.assign({}, m, { interes: typeof v === "number" ? v : null });
      });
      var d = Object.assign({}, D), RY = RUST.records || D.records_youtube || {};
      d.mediciones = (D.mediciones || []).filter(function (m) { return antesDe(m.t); }).map(function (m, j) {
        var dev = RUST.tendencias[j];   // conteo de tendencias de "El de Rust" (ver RUST)
        if (!dev || !m.tendencias || m.tendencias.error) return m;
        var t = Object.assign({}, m.tendencias);
        Object.keys(dev).forEach(function (r) { if (typeof t[r] === "number") t[r] -= dev[r]; });
        return Object.assign({}, m, { tendencias: t });
      });
      d.youtube = mo.g.map(function (id) { return videoEn(R.videos_g, id, T); });
      d.youtube_es = mo.e.map(function (id) { return videoEn(R.videos_e, id, T); });
      d.trailers = (D.trailers || []).map(function (t) { return Object.assign({}, t, { serie: t.serie.filter(function (p) { return antesDe(p.t); }) }); })
        .filter(function (t) { return t.serie.length; });
      // El líder de cada récord, con las visitas que tenía en ese momento (datos.js guarda las del
      // final de su racha, que pueden ser de después).
      d.records_youtube = {};
      ["video", "short"].forEach(function (tipo) {
        var h = (RY[tipo] || []).filter(function (r) { return antesDe(r.t); }), rv = (mo.rv || {})[tipo], u = h[h.length - 1];
        if (u && rv && u.id === rv[0]) h[h.length - 1] = Object.assign({}, u, { visitas: rv[1] });
        d.records_youtube[tipo] = h;
      });
      d.noticias = (D.noticias || []).filter(function (n) { return antesDe(n.t); });
      d.medios_top = mo.nt.medios; d.medios_n = mo.nt.medios_n;
      d.noticias_ultimas = ultimosHasta(T).filter(function (n) { return n.titulo; })
        .map(function (n) { return { t: n.t, titulo: n.titulo, medio: n.medio, url: n.url }; });
      d.comparacion = null;
      if (mo.cmp) {
        d.comparacion = Object.assign({}, mo.cmp);
        if (mo.cmp.youtube) {
          var regiones = {};
          Object.keys(mo.cmp.youtube.regiones).forEach(function (r) {
            var dr = mo.cmp.youtube.regiones[r];
            regiones[r] = { en_lista: dr.en_lista, gta: dr.gta.map(function (x) { var v = R.videos_t[x[1]] || {}; return { puesto: x[0], id: x[1], titulo: v.titulo || "", canal: v.canal || "" }; }) };
          });
          d.comparacion.youtube = Object.assign({}, mo.cmp.youtube, { regiones: regiones });
        }
      }
      // Trends: las horas del tramo según la última medición buena hasta ese momento (su escala).
      var serieTrends = (mo.tr != null ? R.tr_series[mo.tr] : []).map(function (x) { return { ts: x[0] * 1000, v: x[1] }; });
      // "Video que más creció en una hora": con las series de los videos de hoy (como la página de
      // hoy), cortadas en ese momento; así el récord nunca baja al avanzar.
      d.youtube_crece = (D.youtube || []).map(function (v) { return { id: v.id, titulo: v.titulo, serie: v.serie.filter(function (p) { return antesDe(p.t); }) }; });
      return { D: d, M: Mv, Mtramo: Mv.filter(function (m) { return m.ts >= rango[0]; }), corte: T, serieTrends: serieTrends, rango: rango, topeTwitch: topeTwitch,
        picoTwitch: maximoEn(Mv, "espectadores"), picoKick: maximoEn(Mv, "kickEsp"), picoTrends: maximoEn(Mv, "interes"), fallos: fallos };
    }

    function pintarVista(V) {
      pintarFichas(V);
      pintarRecords(V, false);
      lineaDeTiempo(V);
      gTwitch.poner(opcionesTwitch(V), V.corte == null ? V.M : V.Mtramo);
      gTrends.poner(opcionesTrends(V), V.M);
      tabla.poner(V);
      videosSec.poner(V);
      comparacionSec.poner(V);
      noticiasSec.poner(V);
      // Avisos de fuentes que fallaron en esta medición (opción A de Bruno: el último dato bueno, con aviso).
      SECCIONES.forEach(function (s) {
        var sec = $(s[0]); if (!sec) return;
        var textos = V.corte == null ? [] : s[1].filter(function (f) { return f in V.fallos; }).map(function (f) {
          var bueno = V.fallos[f];
          return bueno ? "Dato de hace " + duracion(V.corte - Date.parse(bueno)) + ": esta medición de " + NOMBRES_FUENTE[f] + " falló."
            : "Sin dato: esta medición de " + NOMBRES_FUENTE[f] + " falló y no había una anterior.";
        });
        var p = sec.querySelector(".rb-fallo");
        if (!textos.length) { if (p) p.remove(); return; }
        if (!p) { p = document.createElement("p"); p.className = "rb-fallo"; sec.querySelector("h2").insertAdjacentElement("afterend", p); }
        p.textContent = textos.join(" ");
      });
      var sv = $("seccion-videos"), nf = sv && sv.querySelector(".rb-filtro");
      if (V.corte != null && RUST.otro && sv && !nf) {
        nf = document.createElement("p"); nf.className = "rb-fallo rb-filtro";
        nf.textContent = "Al rebobinar se ven los videos con el filtro «El de Rust». Tu elección vuelve al salir del rebobinado.";
        sv.querySelector("h2").insertAdjacentElement("afterend", nf);
      } else if (V.corte == null && nf) nf.remove();
    }

    function pintarBarra() {
      var mo = momentos[k];
      barra.querySelector(".rb-momento b").textContent = horaLocal(mo.ts) + (enChile(mo.ts) ? "" : " (tu hora)");
      barra.querySelector(".rb-cl").textContent = enChile(mo.ts) ? "" : dia(mo.ts) + ", " + hora(mo.ts) + " en Chile";
      barra.querySelector(".rb-desde").textContent = desdeSalida(mo.ts);
      rangoIn.value = String(k);
      rangoIn.setAttribute("aria-valuetext", horaLocal(mo.ts) + ", " + desdeSalida(mo.ts));
      barra.querySelector('[data-paso="-1"]').disabled = k <= 0;
      barra.querySelector('[data-paso="1"]').disabled = k >= momentos.length - 1;
      barra.querySelectorAll("[data-ref]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.ref === ref)); });
      barra.querySelectorAll("[data-vel]").forEach(function (b) { b.setAttribute("aria-pressed", String(+b.dataset.vel === vel)); });
      var ciclo = barra.querySelector(".rb-ciclo"); ciclo.textContent = vel + "x"; ciclo.setAttribute("aria-label", "Velocidad: " + vel + "x (tocar para cambiar)");
      pintarPulso();
    }
    /* La pista: lo ya vivido en color, lo que viene en gris punteado, las rayas de las horas cero y
       una raya con el valor en el momento elegido. Las x coinciden con las del deslizador invisible. */
    function pintarPulso() {
      var svg = barra.querySelector(".rb-pulso svg"), caja = svg.parentNode;
      var W = anchoPulso || caja.clientWidth || 600, H = altoPulso || caja.clientHeight || 76, arriba = 18, abajo = 3, n = momentos.length;
      var max = 1; pulso.forEach(function (v) { if (v > max) max = v; });
      var X = function (i) { return 8 + i / (n - 1) * (W - 16); }, Y = function (v) { return arriba + (1 - v / max) * (H - arriba - abajo); };
      function camino(desde, hasta) {
        var d = "", primero = null, ult = null;
        for (var i = desde; i <= hasta; i++) { if (pulso[i] == null) continue; d += (d ? "L" : "M") + X(i).toFixed(1) + " " + Y(pulso[i]).toFixed(1); if (primero == null) primero = i; ult = i; }
        return d ? d + "|" + primero + "|" + ult : "";
      }
      function trazo(c, area, linea) {
        if (!c) return "";
        var p = c.split("|");
        return '<path class="' + area + '" d="' + p[0] + "L" + X(+p[2]).toFixed(1) + " " + H + "L" + X(+p[1]).toFixed(1) + " " + H + 'Z"/><path class="' + linea + '" d="' + p[0] + '"/>';
      }
      var out = trazo(camino(k, n - 1), "area-despues", "linea-despues") + trazo(camino(0, k), "area-antes", "linea-antes");
      ORDEN.forEach(function (x) { var i = primeroDesde(LUGARES[x].ts); if (i >= 0) out += '<line class="cero" x1="' + X(i).toFixed(1) + '" x2="' + X(i).toFixed(1) + '" y1="15" y2="' + H + '"/>'; });
      var xk = X(k), v = pulso[k], derecha = xk > W - 70;
      out += '<line class="cabeza" x1="' + xk.toFixed(1) + '" x2="' + xk.toFixed(1) + '" y1="15" y2="' + H + '"/>';
      if (v != null) out += '<circle class="punto" r="5" cx="' + xk.toFixed(1) + '" cy="' + Y(v).toFixed(1) + '"/><text class="valor" x="' + (derecha ? xk - 8 : xk + 8).toFixed(1) +
        '" y="' + Math.max(28, Y(v) - 6).toFixed(1) + '" text-anchor="' + (derecha ? "end" : "start") + '"><tspan data-rb="pulso" data-v="' + v + '" data-f="c">' + compacto(v) + "</tspan></text>";
      svg.setAttribute("viewBox", "0 0 " + W + " " + H);
      svg.innerHTML = out;
    }
    function enlaceMomento() {
      var u = new URL(location.href);
      u.searchParams.set("momento", momentos[k].t.slice(0, 16) + "Z");
      u.searchParams.set("desde", ref);
      u.hash = "";
      return u.toString().replace(/momento=([^&]*)/, function (a, v) { return "momento=" + decodeURIComponent(v); });   // "11:07" y no "11%3A07"
    }
    function ir(i, conFiesta) {
      i = Math.max(0, Math.min(momentos.length - 1, i));
      var antes = k >= 0 ? momentos[k].ts : null;
      k = i;
      pintarVista(vista(k));
      pintarBarra();
      CONTEO.contar(document.body);   // los números de toda la página cuentan hasta los de ese momento (7.1 a)
      ponerDireccion();
      // ¿Pasó por una hora cero hacia adelante? Fiesta del último lugar por el que pasó.
      var ahoraT = momentos[k].ts, cruzado = null;
      if (conFiesta !== false && antes != null && ahoraT > antes) ORDEN.forEach(function (x) { if (LUGARES[x].ts > antes && LUGARES[x].ts <= ahoraT) cruzado = x; });
      portadaEn(ahoraT, cruzado);
      if (cruzado) fiesta(cruzado);
    }
    var relojDir = null;
    function ponerDireccion() {   // la dirección guarda el momento; como mucho cada 400 ms (Safari limita replaceState)
      clearTimeout(relojDir);
      relojDir = setTimeout(function () { if (k >= 0) try { history.replaceState(null, "", enlaceMomento()); } catch (e) { /* abierta como archivo */ } }, 400);
    }
    var finAviso = null;
    function avisar(html, ms) {
      aviso.innerHTML = html; aviso.hidden = false;
      clearTimeout(finAviso);
      if (ms) finAviso = setTimeout(function () { aviso.hidden = true; }, ms);
    }
    function fiesta(x) {
      // El aviso lo da la portada (su píldora "¡GTA 6 ya salió en…!", que flota arriba al bajar).
      if (QUIETO.matches) return;
      // La portada ya celebra (portadaEn). Si no está a la vista, los fuegos van sobre la pantalla.
      if (document.querySelector(".portada").getBoundingClientRect().bottom > 80) return;
      var capa = $("rb-fiesta");
      capa.querySelectorAll(".fuegos").forEach(function (n) { n.remove(); });
      fuegos(capa);
    }
    function reproducir(si) {
      clearInterval(reloj); reloj = null;
      play.setAttribute("aria-pressed", String(si));
      play.textContent = si ? "❚❚" : "▶"; play.setAttribute("aria-label", si ? "Pausa" : "Reproducir");
      $("rb-momento").setAttribute("aria-live", si ? "off" : "polite");   // sin un anuncio cada medio segundo
      if (!si) return;
      if (k >= momentos.length - 1) ir(0, false);   // desde el final, vuelve a empezar
      reloj = setInterval(function () {
        if (k >= momentos.length - 1) reproducir(false);
        else ir(k + 1);
      }, VEL[vel]);
    }
    function activar(i) {
      var tenues = DE_HOY.map($).filter(Boolean);
      rebobinando = true;
      document.body.classList.add("rebobinando");
      tenues.forEach(function (s) {
        s.classList.add("rb-hoy");
        if (!s.querySelector(".rb-nota-hoy")) { var p = document.createElement("p"); p.className = "rb-nota-hoy"; p.textContent = "Esta sección muestra los datos de hoy."; s.insertBefore(p, s.firstChild); }
      });
      barra.hidden = false; entrada.classList.add("abierto");
      CONTEO.parar();   // la primera parada no cuenta: no hay número anterior
      medirBarra();
      ir(i, false);
      rangoIn.focus({ preventScroll: true });   // el botón se esconde: el foco va a la barra
    }
    function salir() {
      reproducir(false); clearTimeout(relojDir); CONTEO.parar();
      rebobinando = false; k = -1;
      document.body.classList.remove("rebobinando");
      DE_HOY.map($).filter(Boolean).forEach(function (s) { s.classList.remove("rb-hoy"); var p = s.querySelector(".rb-nota-hoy"); if (p) p.remove(); });
      barra.hidden = true; aviso.hidden = true; abrirMenu(false); entrada.classList.remove("abierto");
      $("rb-fiesta").textContent = "";   // sin fuegos sobre la página de hoy
      pintarVista(HOY);
      portadaEn(null);   // la portada vuelve a hoy (sin fiesta)
      $("rb-abrir").focus({ preventScroll: true });
      try { var u = new URL(location.href); u.searchParams.delete("momento"); u.searchParams.delete("desde"); history.replaceState(null, "", u.toString()); } catch (e) { /* nada */ }
    }
    function medirBarra() {
      document.documentElement.style.setProperty("--rb-alto", barra.offsetHeight + "px");
      var caja = barra.querySelector(".rb-pulso"), w = caja.clientWidth, h = caja.clientHeight;   // se guardan: medir en cada parada obligaría a recalcular la página
      if (w && (w !== anchoPulso || h !== altoPulso)) { anchoPulso = w; altoPulso = h; if (k >= 0) pintarPulso(); }
    }
    if ("ResizeObserver" in window) new ResizeObserver(function () { if (!barra.hidden) medirBarra(); }).observe(barra);

    function abrir(i) {
      var boton = $("rb-abrir"), texto = boton.textContent;
      boton.disabled = true; boton.textContent = "Cargando…";
      $("rb-error").hidden = true;
      return cargar().then(function () {
        boton.disabled = false; boton.textContent = texto;
        activar(typeof i === "function" ? i() : (i || 0));
      }, function () {
        boton.disabled = false; boton.textContent = texto;
        $("rb-error").hidden = false;
        if (typeof i === "function") { pendiente = i; entrada.scrollIntoView({ block: "center" }); }   // llegó por un enlace
      });
    }
    var pendiente = null;   // el momento de un enlace que no alcanzó a cargar: se usa al reintentar
    $("rb-abrir").addEventListener("click", function () { if (!rebobinando) { var p = pendiente; pendiente = null; abrir(p || 0); } });
    rangoIn.addEventListener("input", function () { reproducir(false); ir(+rangoIn.value); });
    // Arrastrando la barra los números cambian al instante (contarían sin parar); con las flechas, sí cuentan.
    rangoIn.addEventListener("pointerdown", function () { CONTEO.quieto = true; });
    ["pointerup", "pointercancel"].forEach(function (ev) { window.addEventListener(ev, function () { CONTEO.quieto = false; }); });
    barra.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b || b.disabled) return;
      if (b.dataset.paso) { reproducir(false); ir(k + +b.dataset.paso); }
      else if (b.dataset.salto) { reproducir(false); var i = primeroDesde(LUGARES[b.dataset.salto].ts); if (i >= 0) ir(i); }
      else if (b.dataset.ref) {
        ref = b.dataset.ref;
        try { localStorage.setItem("gta6-rb-desde", ref); } catch (err) { /* vale hasta recargar */ }
        pintarBarra(); ponerDireccion();
      }
      else if (b.dataset.vel) { vel = +b.dataset.vel; pintarBarra(); if (reloj) reproducir(true); }
      else if (b.classList.contains("rb-ciclo")) { vel = vel === 1 ? 2 : vel === 2 ? 4 : 1; pintarBarra(); if (reloj) reproducir(true); }
      else if (b.classList.contains("rb-mas")) abrirMenu(menu.hidden);
      else if (b === play) reproducir(!reloj);
      else if (b.classList.contains("rb-volver")) salir();
      else if (b.classList.contains("rb-copiar")) {
        abrirMenu(false);
        var url = enlaceMomento();
        var listo = function () { avisar("Enlace copiado: quien lo abra verá la página en este momento.", 4000); };
        var aMano = function () {
          avisar('Copia este enlace: <input class="rb-enlace" readonly value="' + limpio(url) + '">');
          var inp = aviso.querySelector("input"); inp.focus(); inp.select();
        };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(listo, aMano); else aMano();
      }
    });
    // Menú "⋯": se cierra al tocar fuera, con Escape o al copiar el enlace.
    var menu = $("rb-menu"), botonMas = barra.querySelector(".rb-mas");
    function abrirMenu(si) { menu.hidden = !si; botonMas.setAttribute("aria-expanded", String(si)); }
    document.addEventListener("click", function (e) {
      if (!menu.hidden && e.target.isConnected && !e.target.closest(".rb-menu, .rb-mas")) abrirMenu(false);
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !menu.hidden) { abrirMenu(false); botonMas.focus(); } });
    // Enlace a un momento: ?momento=2026-11-18T11:07Z (la medición de ese minuto o la más cercana).
    var params = new URLSearchParams(location.search), pedido = params.get("momento") || "", pedRef = params.get("desde");
    if (ORDEN.indexOf(pedRef) >= 0) ref = pedRef;
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?Z$/.test(pedido) && !isNaN(Date.parse(pedido))) {
      var quiero = Date.parse(pedido);
      abrir(function () {
        var mejor = 0;
        momentos.forEach(function (mo, i) { if (Math.abs(mo.ts - quiero) < Math.abs(momentos[mejor].ts - quiero)) mejor = i; });
        return mejor;
      });
    }
    window.__rebobinar = { ir: function (i) { ir(i); }, momentos: function () { return momentos; } };   // para las pruebas
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
  // Marca para pruebas/medir_carga.py (9.4): aquí la página ya quedó armada.
  try { performance.mark("app-listo"); } catch (e) { /* navegador sin marcas */ }
})();
