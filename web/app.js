/* Página del recuerdo. Lee window.DATOS (reales) o window.DATOS_EJEMPLO y dibuja todo.
   No usa librerías externas. Las horas llegan en UTC y aquí se convierten a Santiago. */
(function () {
  "use strict";

  var ZONA = "America/Santiago";
  var SALIDA = Date.UTC(2026, 10, 19, 3, 0);   // 19 nov 2026, 00:00 en Santiago
  var D = window.DATOS || window.DATOS_EJEMPLO || { mediciones: [], youtube: [], noticias: [], reddit: {}, eventos: [] };
  var $ = function (id) { return document.getElementById(id); };

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
  function hora(ts) { return fHora.format(new Date(ts)); }
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
  function limpio(s) { var d = document.createElement("div"); d.textContent = s == null ? "" : s; return d.innerHTML; }
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
    var tw = m.twitch || {}, tr = m.trends || {};
    return {
      ts: Date.parse(m.t),
      espectadores: typeof tw.espectadores === "number" ? tw.espectadores : null,
      canal: tw.canales && tw.canales[0] ? tw.canales[0] : null,   // nombre, login, espectadores y, si hay, foto
      errorTwitch: tw.error || null,
      interes: typeof tr.interes === "number" ? tr.interes : null,
      servidores: m.servidores || {}
    };
  }).filter(function (m) { return !isNaN(m.ts); }).sort(function (a, b) { return a.ts - b.ts; });

  function maximo(campo) {
    var mejor = null;
    M.forEach(function (m) { if (m[campo] != null && (!mejor || m[campo] > mejor[campo])) mejor = m; });
    return mejor;
  }
  var picoTwitch = maximo("espectadores"), picoTrends = maximo("interes");
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
    return "medianoche en " + L.nombre + (lugar === "cl" ? "" : '<i class="sep"> · </i><i class="hora-cl">' + dia(L.ts) + ", " + hora(L.ts) + " hora de Chile</i>");
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
      b.title = (ya ? "Ya salió en " : "Medianoche en ") + L.nombre + ": " + dia(L.ts) + ", " + hora(L.ts) + " hora de Chile";
    });
  }
  $("lugares").addEventListener("click", function (e) {
    var b = e.target.closest("[data-lugar]"); if (!b) return;
    lugar = b.dataset.lugar;
    try { localStorage.setItem("gta6-lugar", lugar); } catch (err) { /* sin almacenamiento: vale hasta recargar */ }
    pintarLugares(); cuenta();
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
    var puntos = M.map(function (m) { return { ts: m.ts, v: m[campo] }; });
    function dibujar() {
      var ancho = Math.max(300, caja.clientWidth), alto = Math.round(Math.max(230, Math.min(380, ancho * 0.36)));
      var mi = 54, md = 14, ma = 26, mb = 34;
      if (!puntos.length) { caja.innerHTML = '<p class="nota">Todavía no hay datos.</p>'; return; }
      var t0 = puntos[0].ts, t1 = puntos[puntos.length - 1].ts;
      var tope = opciones.tope || 0, paso;
      puntos.forEach(function (p) { if (p.v > tope) tope = p.v; });
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
        globo.innerHTML = "<small>" + dia(cerca.ts) + " · " + hora(cerca.ts) + "</small>" + (cerca.v == null ? "Sin dato" : num(cerca.v) + " " + opciones.unidad);
        var gx = Math.min(window.innerWidth - globo.offsetWidth - 8, e.clientX + 14);
        globo.style.left = Math.max(8, gx) + "px"; globo.style.top = (e.clientY - 54) + "px";
      }
      function salir() { globo.hidden = true; cursor.setAttribute("visibility", "hidden"); punto.setAttribute("visibility", "hidden"); }
      svg.addEventListener("pointermove", mover); svg.addEventListener("pointerdown", mover); svg.addEventListener("pointerleave", salir);
    }
    dibujar();
    var espera, anchoAnterior = caja.clientWidth;
    window.addEventListener("resize", function () {
      clearTimeout(espera);
      espera = setTimeout(function () { if (caja.clientWidth !== anchoAnterior) { anchoAnterior = caja.clientWidth; dibujar(); } }, 150);
    });
  }
  grafico($("g-twitch"), "espectadores", { color: "--a1", unidad: "espectadores", nombre: "Espectadores en Twitch a lo largo del tiempo" });
  grafico($("g-trends"), "interes", { color: "--a2", unidad: "de 100", tope: 100, nombre: "Interés de búsqueda en Google Trends a lo largo del tiempo" });

  /* ---------- Servidores ---------- */
  $("servidores").innerHTML = M.length ? SERVICIOS.map(function (s) {
    var malas = 0, conDato = 0;
    var tira = M.map(function (m, i) {
      var e = m.servidores[s[0]], clase = e == null ? "" : (e === "ok" ? "ok" : "mal");
      if (e != null) { conDato++; if (e !== "ok") malas++; }
      return '<i class="' + clase + '" style="--i:' + i + '" title="' + dia(m.ts) + " " + hora(m.ts) + " · " + (e == null ? "sin dato" : e === "ok" ? "funcionando" : "con problemas") + '"></i>';
    }).join("");
    var veredicto = !conDato ? '<div class="veredicto">Sin datos</div>'
      : malas ? '<div class="veredicto si">Sí, tuvo problemas<small>en ' + malas + (malas === 1 ? " medición" : " mediciones") + "</small></div>"
      : '<div class="veredicto no">No se cayó<small>en ' + conDato + " mediciones</small></div>";
    return '<div class="servicio"><div class="nombre">' + s[1] + '</div><div class="tira">' + tira + "</div>" + veredicto + "</div>";
  }).join("") : '<p class="nota">Todavía no hay datos.</p>';

  /* ---------- Tabla de Twitch con filtro por día ---------- */
  (function () {
    // Lo más nuevo primero (pedido de Bruno): días y filas de la más reciente a la más vieja.
    var nuevas = M.slice().reverse();
    var dias = []; nuevas.forEach(function (m) { var d = dia(m.ts); if (dias.indexOf(d) < 0) dias.push(d); });
    var elegido = dias.indexOf(dia(SALIDA)) >= 0 ? dia(SALIDA) : (dias[0] || "");
    var tope = picoTwitch ? picoTwitch.espectadores : 1;
    function pintar() {
      $("filtros-dia").innerHTML = dias.map(function (d) { return '<button type="button" class="' + (d === elegido ? "activo" : "") + '" data-dia="' + d + '">' + d + "</button>"; }).join("");
      var filas = nuevas.filter(function (m) { return dia(m.ts) === elegido; }).map(function (m) {
        if (m.espectadores == null) return '<tr class="sin-dato"><td>' + hora(m.ts) + '</td><td colspan="3">Sin dato' + (m.errorTwitch ? " (" + limpio(m.errorTwitch) + ")" : "") + "</td></tr>";
        return "<tr><td>" + hora(m.ts) + '</td><td class="n">' + num(m.espectadores) + '</td><td class="barra-celda"><i style="--w:' + (m.espectadores / tope * 100).toFixed(1) + '%"></i></td><td>' +
          (m.canal ? '<span class="canal">' + foto(m.canal.foto) + "<span>" + enlace(urlCanal(m.canal.login), limpio(m.canal.nombre)) + " (" + compacto(m.canal.espectadores) + ")</span></span>" : "—") + "</td></tr>";
      }).join("");
      $("t-twitch").innerHTML = '<thead><tr><th>Hora</th><th class="n">Espectadores</th><th></th><th>Canal con más público</th></tr></thead><tbody>' +
        (filas || '<tr class="sin-dato"><td colspan="4">Todavía no hay datos.</td></tr>') + "</tbody>";
    }
    $("filtros-dia").addEventListener("click", function (e) { var d = e.target.dataset.dia; if (d) { elegido = d; pintar(); } });
    pintar();
  })();

  /* ---------- Videos de YouTube (tarjetas con miniatura; opción B elegida por Bruno, 2026-11-13) ---------- */
  // Tarea 6.4: además de los más vistos en todo el mundo, los videos en español. Solo los que
  // YouTube marca en español (idioma "es", "es-MX", "es-419"…): la búsqueda prefiere el
  // español pero también trae algunos en inglés. Pestañas "Global" y "En español" sobre la
  // misma lista (opción A de Bruno, 2026-11-13).
  (function () {
    function tarjetas(lista) {
      var filas = (lista || []).map(function (v) {
        var serie = (v.serie || []).filter(function (p) { return typeof p.visitas === "number"; });
        if (!serie.length) return null;
        var a = serie[0].visitas, b = serie[serie.length - 1].visitas, min = a, max = b;
        serie.forEach(function (p) { if (p.visitas < min) min = p.visitas; if (p.visitas > max) max = p.visitas; });
        var camino = serie.map(function (p, i) { return (i ? "L" : "M") + (i / (serie.length - 1 || 1) * 120).toFixed(1) + " " + (28 - (p.visitas - min) / (max - min || 1) * 26).toFixed(1); }).join("");
        return { v: v, a: a, b: b, camino: camino };
      }).filter(Boolean).sort(function (x, y) { return y.b - x.b; });
      return filas.map(function (f) {
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
      }).join("") || '<li class="vacio">Todavía no hay datos.</li>';
    }
    var global = D.youtube || [];
    var espanol = (D.youtube_es || []).filter(function (v) { return /^es\b/i.test(v.idioma || ""); });
    var lista = $("videos"), nota = $("videos-nota"), tabs = $("videos-tabs");
    var NOTAS = { global: nota.textContent,
                  es: "Videos que YouTube marca en español, de creadores de Chile, España, México y otros países. La búsqueda se hace una vez por hora." };
    var elegida = "global";
    function pintar() {
      tabs.innerHTML = [["global", "Global"], ["es", "En español"]].map(function (t) {
        return '<button type="button" data-lista="' + t[0] + '" aria-pressed="' + (t[0] === elegida) + '"' + (t[0] === elegida ? ' class="activo"' : "") + ">" + t[1] + "</button>";
      }).join("");
      nota.textContent = NOTAS[elegida];
      lista.innerHTML = tarjetas(elegida === "es" ? espanol : global);
    }
    tabs.addEventListener("click", function (e) { var l = e.target.dataset.lista; if (l) { elegida = l; pintar(); } });
    pintar();
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
    function tarjeta(n) {
      var ts = Date.parse(n.t), seguro = /^https?:\/\//.test(n.url || "");
      return "<li>" + (seguro ? enlace(n.url, limpio(n.titulo)) : "<a>" + limpio(n.titulo) + "</a>") + "<small>" +
        limpio(n.medio) + (isNaN(ts) ? "" : " · " + dia(ts) + " " + hora(ts)) + "</small></li>";
    }
    // Números a mostrar: la primera, la última y las vecinas de la actual; "…" en los saltos.
    function numeros() {
      var lista = [];
      for (var i = 1; i <= total; i++) {
        if (i === 1 || i === total || Math.abs(i - actual) <= 1) lista.push(i);
        else if (lista[lista.length - 1] !== "…") lista.push("…");
      }
      return lista;
    }
    function boton(texto, pagina, extra) {
      var activo = pagina === actual && typeof texto === "number";
      return '<button type="button" data-pagina="' + pagina + '"' + (activo ? ' class="activo" aria-current="page"' : "") +
        (extra || "") + ">" + texto + "</button>";
    }
    function pintar() {
      var desde = (actual - 1) * POR_PAGINA, hasta = Math.min(todas.length, desde + POR_PAGINA);
      var turno = ++pintando, trozo = todas.slice(desde, hasta);
      var faltan = D.formato === 2 ? trozo.filter(function (n) { return !n.titulo; }) : [];
      if (faltan.length) {
        $("noticias").innerHTML = '<li class="cargando">Cargando titulares…</li>';
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
          if (turno === pintando) $("noticias").innerHTML = '<li class="cargando">No se pudieron cargar estos titulares. Revisa la conexión y vuelve a tocar la página.</li>';
        });
      } else {
        $("noticias").innerHTML = trozo.map(tarjeta).join("") || "<li>Todavía no hay titulares.</li>";
      }
      $("noticias-cuenta").textContent = todas.length
        ? todas.length + (filtro ? " titulares del " + nombreDia(filtro) : " titulares, del más nuevo al más viejo") + " · mostrando " + (desde + 1) + " a " + hasta +
          (!filtro && diasN.length > 1 ? " · toca una barra para ver un solo día" : "") : "";
      $("noticias-paginas").innerHTML = total < 2 ? "" :
        boton("‹ Más nuevos", actual - 1, actual === 1 ? " disabled" : "") +
        numeros().map(function (x) { return x === "…" ? '<span class="salto">…</span>' : boton(x, x); }).join("") +
        boton("Más viejos ›", actual + 1, actual === total ? " disabled" : "");
    }
    $("noticias-paginas").addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b || b.disabled) return;
      actual = Math.min(total, Math.max(1, +b.dataset.pagina)); pintar();
      // Si el principio de la sección quedó arriba, fuera de la vista, se vuelve a él.
      var sec = $("seccion-noticias"); if (sec.getBoundingClientRect().top < 0) sec.scrollIntoView({ block: "start" });
    });
    pintar();
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
    var S = [["records", "Récords"], ["seccion-linea", "Línea de tiempo"], ["resumen", "Resumen"], ["seccion-twitch", "Twitch"],
      ["seccion-trends", "Trends"], ["seccion-servidores", "Servidores"], ["seccion-videos", "Videos"], ["comparacion", "Comparación"],
      ["seccion-noticias", "Titulares"], ["seccion-reddit", "Reddit"], ["capsula", "Cápsula"]].filter(function (x) { return $(x[0]); });
    caja.innerHTML = '<button type="button" class="menu-boton" aria-expanded="false" aria-controls="menu-lista"><span aria-hidden="true">☰</span> Secciones</button>' +
      '<div class="menu-lista" id="menu-lista" hidden>' +
      S.map(function (x) { return '<a href="#' + x[0] + '" data-ir="' + x[0] + '">' + x[1] + "</a>"; }).join("") +
      '<a href="#" data-ir="arriba">↑ Volver arriba</a></div>';
    var boton = caja.querySelector(".menu-boton"), lista = caja.querySelector(".menu-lista");
    function abrir(si) { lista.hidden = !si; boton.setAttribute("aria-expanded", String(si)); }
    document.addEventListener("click", function (e) {
      var a = e.target.closest("[data-ir]");
      if (a && caja.contains(a)) {
        e.preventDefault(); abrir(false);
        if (a.dataset.ir === "arriba") window.scrollTo({ top: 0, behavior: "smooth" });
        else { var el = $(a.dataset.ir); el.classList.add("visible"); el.scrollIntoView({ behavior: "smooth", block: "start" }); }
      } else if (e.target.closest(".menu-boton")) abrir(lista.hidden);
      else if (!caja.contains(e.target)) abrir(false);   // tocar fuera la cierra
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !lista.hidden) { abrir(false); boton.focus(); } });
  })();

  /* ---------- Cambio de estilo ---------- */
  (function () {
    var raiz = document.documentElement;
    // Tarea 7.3 (opción B de Bruno, 2026-11-13): las torres nuevas suben una por una al ir a 2026
    // y bajan al volver a 1986. Duraciones de las animaciones de estilos.css, con margen.
    var SUBIR_MS = 2400, BAJAR_MS = 1200;
    try { var guardado = localStorage.getItem("tema"); if (guardado === "ochenta" || guardado === "actual") raiz.dataset.tema = guardado; } catch (e) {}
    document.querySelector(".cambio").addEventListener("click", function (e) {
      var tema = e.target.dataset.poner;
      if (!tema || tema === raiz.dataset.tema || document.body.classList.contains("cambiando-espera")) return;
      var quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // Tarea 7.3: al ir a 2026 las torres nuevas suben después del barrido; al volver a 1986
      // primero bajan y después pasa el barrido.
      var bajar = !quieto && tema === "ochenta" ? BAJAR_MS : 0;
      document.body.classList.add("cambiando-espera");
      if (bajar) raiz.classList.add("torres-bajan");
      setTimeout(function () {
        document.body.classList.add("cambiando");
        setTimeout(function () {
          raiz.classList.remove("torres-bajan");
          raiz.dataset.tema = tema; try { localStorage.setItem("tema", tema); } catch (e) {}
          if (!quieto && tema === "actual") { raiz.classList.add("torres-suben"); setTimeout(function () { raiz.classList.remove("torres-suben"); }, SUBIR_MS); }
        }, quieto ? 0 : 380);
        setTimeout(function () { document.body.classList.remove("cambiando", "cambiando-espera"); }, quieto ? 0 : 820);
      }, bajar);
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
    filas.forEach(function (f) {
      if (f.tw.error) return;
      if (typeof f.tw.espectadores === "number") esp.push({ ts: f.ts, valor: f.tw.espectadores });
      if (typeof f.tw.transmisiones === "number") trans.push({ ts: f.ts, valor: f.tw.transmisiones });
      (f.tw.canales || []).forEach(function (c) { canal.push({ ts: f.ts, valor: c.espectadores, que: c.nombre, url: urlCanal(c.login) }); });
    });
    // Video más visto: el que va primero en cada medición. Cuenta como récord nuevo solo cuando cambia de video.
    var porT = {}, crece = [];
    (D.youtube || []).forEach(function (v) {
      v.serie.forEach(function (p, i) {
        var ts = Date.parse(p.t), l = porT[ts];
        if (!l || p.visitas > l.valor) porT[ts] = { ts: ts, valor: p.visitas, que: v.titulo, url: urlVideo(v.id), id: v.id };
        if (i) {
          var horas = (ts - Date.parse(v.serie[i - 1].t)) / 3600000;
          // Solo entre mediciones seguidas (hasta 1,6 h), para no promediar huecos largos.
          if (horas > 0 && horas <= 1.6) crece.push({ ts: ts, valor: (p.visitas - v.serie[i - 1].visitas) / horas, que: v.titulo, url: urlVideo(v.id) });
        }
      });
    });
    var lideres = [];
    Object.keys(porT).map(Number).sort(function (a, b) { return a - b; }).forEach(function (ts) {
      var l = porT[ts], ant = lideres[lideres.length - 1];
      if (!ant || ant.id !== l.id) lideres.push(l); else ant.valor = l.valor;   // el mismo video: solo se actualizan sus visitas
    });
    var fClave = function (ts) { var o = partes(ts); return o.year + "-" + o.month + "-" + o.day; };
    var fClaveHora = function (ts) { return fClave(ts) + " " + partes(ts).hour; };
    var R = [
      { nombre: "Más espectadores en Twitch", h: historia(esp), fmt: num, uni: "espectadores a la vez" },
      { nombre: "Directo con más público", h: historia(canal), fmt: num, uni: "espectadores en un solo directo" },
      { nombre: "Más transmisiones a la vez", h: historia(trans), fmt: num, uni: "transmisiones de GTA VI" },
      { nombre: "Video más visto", h: lideres, fmt: compacto, uni: "visitas", prev: "Antes iba primero" },
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
      });
      (D.youtube || []).forEach(function (v) {
        v.serie.forEach(function (p) {
          var ts = Date.parse(p.t);
          if (clave(ts) === k && (!r.yt || p.visitas > r.yt.visitas)) r.yt = { visitas: p.visitas, ts: ts, titulo: v.titulo, url: urlVideo(v.id) };
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
        (r.yt ? cuadro("Video más visto", compacto(r.yt.visitas), "visitas", enlace(r.yt.url, limpio(r.yt.titulo)), "medido a las " + hora(r.yt.ts))
          : cuadro("Video más visto", "—", "sin dato ese día")) +
        (r.tr ? cuadro("Interés en Google Trends", r.tr.interes, "de 100, lo más alto del día", "", "a las " + hora(r.tr.ts))
          : cuadro("Interés en Google Trends", "—", "sin dato ese día")) +
        cuadro("Titulares", num(r.titulares), r.titulares === 1 ? "titular publicado ese día" : "titulares publicados ese día") +
        cuadro("Publicaciones en r/GTA6", num(r.reddit), r.reddit === 1 ? "publicación guardada" : "publicaciones guardadas") +
        cuadro("Mediciones", num(r.med), r.med === 1 ? "medición guardada" : "mediciones guardadas", "", r.huecos ? r.huecos + " con algún hueco" : "sin huecos") +
        "</ul>";
    }
    $("resumen-dias").addEventListener("click", function (e) { var k = e.target.dataset.dia; if (k) { elegido = k; pintar(); } });
    pintar();
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

  /* ---------- Cápsula del tiempo (tarea 7.4; diseño B "postales de Miami", elegido por Bruno, 2026-11-13) ----------
     Los dos textos los escribe Bruno en web/capsula.js. Mientras uno esté vacío, su postal sale
     cerrada: la página nunca pone texto en su nombre. */
  (function () {
    var caja = document.getElementById("capsula-postales");
    if (!caja) return;
    var C = window.CAPSULA || {};
    var MESES = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
    var candado = '<svg class="cap-candado" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V7a5 5 0 0 1 10 0v3" fill="none" stroke="currentColor" stroke-width="2"/><rect x="4" y="10" width="16" height="11" rx="2.5" fill="currentColor"/></svg>';
    function postal(t, titulo, cerradaTitulo, cerradaTexto) {
      t = t || {};
      var texto = typeof t.texto === "string" ? t.texto.trim() : "";
      if (!texto) {
        return '<article class="cap-postal cerrada"><div class="cap-texto">' + candado + "<strong>" + cerradaTitulo + "</strong><span>" + cerradaTexto + "</span></div>" +
          '<div class="cap-lado"><div class="cap-estampa vacia"></div></div></article>';
      }
      // La fecha va como "AAAA-MM-DD" y se muestra tal cual (es un día, no una hora: no se convierte).
      var f = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t.fecha || "");
      if (t.fecha && !(f && +f[2] >= 1 && +f[2] <= 12 && +f[3] >= 1 && +f[3] <= 31)) { console.warn("capsula.js: la fecha \"" + t.fecha + "\" no tiene el formato AAAA-MM-DD"); f = null; }
      var parrafos = texto.split(/\n\s*\n/).map(function (p) { return "<p>" + limpio(p.trim()).replace(/\n/g, "<br>") + "</p>"; }).join("");
      return '<article class="cap-postal"><div class="cap-texto"><h3>' + titulo + "</h3>" + parrafos + "</div>" +
        '<div class="cap-lado"><div class="cap-estampa"><svg viewBox="-60 0 260 420" aria-hidden="true"><use href="#palmera"/></svg></div>' +
        (f ? '<p class="cap-matasellos" title="Escrito el ' + (+f[3]) + " " + MESES[+f[2] - 1].toLowerCase() + " " + f[1] + '"><span>Miami</span><b>' + (+f[3]) + " " + MESES[+f[2] - 1] + "</b><span>" + f[1] + "</span></p>" : "") +
        "</div></article>";
    }
    caja.innerHTML =
      postal(C.antes, "Lo que espero", "Todavía sin escribir", "Aquí irá lo que Rust espera de GTA 6.") +
      postal(C.despues, "Lo que me pareció", ahora() < SALIDA ? "Se abre después del lanzamiento" : "Todavía sin escribir", "Aquí irá lo que le pareció el juego a Rust.");
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
