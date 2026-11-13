/* Página del recuerdo. Lee window.DATOS (reales) o window.DATOS_EJEMPLO y dibuja todo.
   No usa librerías externas. Las horas llegan en UTC y aquí se convierten a Santiago. */
(function () {
  "use strict";

  var ZONA = "America/Santiago";
  var SALIDA = Date.UTC(2026, 10, 19, 3, 0);   // 19 nov 2026, 00:00 en Santiago
  var D = window.DATOS || window.DATOS_EJEMPLO || { mediciones: [], youtube: [], noticias: [], eventos: [] };
  var $ = function (id) { return document.getElementById(id); };

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
  function urlCanal(login) { return /^\w{1,40}$/.test(login || "") ? "https://www.twitch.tv/" + login : ""; }

  /* ---------- Preparar las mediciones ---------- */
  var M = (D.mediciones || []).map(function (m) {
    var tw = m.twitch || {}, tr = m.trends || {};
    return {
      ts: Date.parse(m.t),
      espectadores: typeof tw.espectadores === "number" ? tw.espectadores : null,
      canal: tw.canales && tw.canales[0] ? tw.canales[0] : null,
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

  /* ---------- Aviso de datos de ejemplo ---------- */
  if (D.ejemplo) $("aviso-ejemplo").hidden = false;

  /* ---------- Cuenta regresiva ---------- */
  function cuenta() {
    var falta = SALIDA - Date.now(), caja = $("cuenta");
    if (falta <= 0) {
      var dias = Math.floor(-falta / 86400000);
      caja.innerHTML = '<span class="texto">' + (dias === 0 ? "Hoy es el día" : "Hace " + dias + (dias === 1 ? " día" : " días") + " que salió") + "</span>";
      return;
    }
    var s = Math.floor(falta / 1000);
    var v = [[Math.floor(s / 86400), "días"], [Math.floor(s % 86400 / 3600), "horas"], [Math.floor(s % 3600 / 60), "min"], [s % 60, "seg"]];
    caja.innerHTML = v.map(function (x) { return '<div class="caja"><b>' + String(x[0]).padStart(2, "0") + "</b><small>" + x[1] + "</small></div>"; }).join("");
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

  /* ---------- Línea de tiempo ---------- */
  (function () {
    var ev = [];
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
  })();

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
          (m.canal ? enlace(urlCanal(m.canal.login), limpio(m.canal.nombre)) + " (" + compacto(m.canal.espectadores) + ")" : "—") + "</td></tr>";
      }).join("");
      $("t-twitch").innerHTML = '<thead><tr><th>Hora</th><th class="n">Espectadores</th><th></th><th>Canal con más público</th></tr></thead><tbody>' +
        (filas || '<tr class="sin-dato"><td colspan="4">Todavía no hay datos.</td></tr>') + "</tbody>";
    }
    $("filtros-dia").addEventListener("click", function (e) { var d = e.target.dataset.dia; if (d) { elegido = d; pintar(); } });
    pintar();
  })();

  /* ---------- Videos de YouTube (tarjetas con miniatura; opción B elegida por Bruno, 2026-11-13) ---------- */
  (function () {
    var filas = (D.youtube || []).map(function (v) {
      var serie = (v.serie || []).filter(function (p) { return typeof p.visitas === "number"; });
      if (!serie.length) return null;
      var a = serie[0].visitas, b = serie[serie.length - 1].visitas, min = a, max = b;
      serie.forEach(function (p) { if (p.visitas < min) min = p.visitas; if (p.visitas > max) max = p.visitas; });
      var camino = serie.map(function (p, i) { return (i ? "L" : "M") + (i / (serie.length - 1 || 1) * 120).toFixed(1) + " " + (28 - (p.visitas - min) / (max - min || 1) * 26).toFixed(1); }).join("");
      return { v: v, a: a, b: b, camino: camino };
    }).filter(Boolean).sort(function (x, y) { return y.b - x.b; });
    $("videos").innerHTML = filas.map(function (f) {
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
  })();

  /* ---------- Noticias ---------- */
  // Lo más nuevo arriba (pedido de Bruno).
  $("noticias").innerHTML = (D.noticias || []).slice().sort(function (a, b) { return Date.parse(b.t) - Date.parse(a.t); }).map(function (n) {
    var ts = Date.parse(n.t), seguro = /^https?:\/\//.test(n.url || "");
    return "<li>" + (seguro ? enlace(n.url, limpio(n.titulo)) : "<a>" + limpio(n.titulo) + "</a>") + "<small>" +
      limpio(n.medio) + (isNaN(ts) ? "" : " · " + dia(ts) + " " + hora(ts)) + "</small></li>";
  }).join("") || '<li>Todavía no hay titulares.</li>';

  /* ---------- Pie ---------- */
  $("pie-info").textContent = (D.ejemplo ? "Mostrando datos de ejemplo. " : "") +
    (D.generado ? "Datos actualizados por última vez el " + dia(Date.parse(D.generado)) + " a las " + hora(Date.parse(D.generado)) + " (hora de Santiago)." : "");

  /* ---------- Cambio de estilo ---------- */
  (function () {
    var raiz = document.documentElement;
    try { var guardado = localStorage.getItem("tema"); if (guardado === "ochenta" || guardado === "actual") raiz.dataset.tema = guardado; } catch (e) {}
    document.querySelector(".cambio").addEventListener("click", function (e) {
      var tema = e.target.dataset.poner;
      if (!tema || tema === raiz.dataset.tema || document.body.classList.contains("cambiando")) return;
      var quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      document.body.classList.add("cambiando");
      setTimeout(function () { raiz.dataset.tema = tema; try { localStorage.setItem("tema", tema); } catch (e) {} }, quieto ? 0 : 380);
      setTimeout(function () { document.body.classList.remove("cambiando"); }, quieto ? 0 : 820);
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
