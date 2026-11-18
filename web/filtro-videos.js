/* Selector de videos del visitante (Fase 10, tarea 10.4; pedido de Bruno, 2026-11-18).
   El visitante elige qué videos de YouTube ver: una configuración ("El de Rust", "Filtro
   automático", "Desde cero" o una propia de Bruno) y qué motivos ocultar ("No trata de GTA",
   "Hecho con IA", "Dudoso"). Vale para todas las listas y récords de YouTube. Su navegador
   recuerda la elección.

   Corre ANTES de app.js. Si la elección es la de siempre ("El de Rust" con los tres motivos
   ocultos), no hace nada: datos.js ya viene así. Si es otra, carga web/videos-extra.js (solo
   entonces: así datos.js no crece) y cambia las listas de window.DATOS antes de que app.js las
   dibuje. Para no repetir aquí la lógica del filtro, qué pasa cada configuración y los récords de
   cada combinación ya vienen calculados en videos-extra.js (recolector/generar_web.py).
   Este archivo se carga dos veces: la primera decide y pide videos-extra.js; la segunda aplica. */
(function () {
  "use strict";
  var CLAVE = "filtro-videos";
  var D = window.DATOS;
  var info = (D && D.filtro_videos) || null;   // nombres de las configuraciones y motivos (pesa poco)
  function tiene(o, k) { return !!o && Object.prototype.hasOwnProperty.call(o, k); }   // no "constructor" ni "__proto__"
  var POR_DEFECTO = { conf: "rust", ocultos: info ? Object.keys(info.motivos).sort() : ["dudoso", "ia", "no_gta"] };

  function leer() {
    try {
      var g = JSON.parse(localStorage.getItem(CLAVE) || "null");
      if (g && typeof g.conf === "string" && Array.isArray(g.ocultos)) return g;
    } catch (e) { /* sin almacenamiento o dato roto: la elección de siempre */ }
    return null;
  }
  function esPorDefecto(e) {
    return e.conf === POR_DEFECTO.conf && e.ocultos.slice().sort().join(",") === POR_DEFECTO.ocultos.join(",");
  }

  /* El botón y su panel (forma "Botón con panel", elegida por Bruno el 2026-11-18), arriba de las
     pestañas de la sección de videos. Cerrado dice qué filtro se usa; abierto explica cada
     configuración y deja ocultar motivos. "Aplicar" guarda la elección y recarga la página (cada
     sección se dibuja una sola vez con los datos ya elegidos: es lo más simple y seguro). */
  function montarUI() {
    var F = window.FILTRO_VIDEOS, sec = document.getElementById("seccion-videos");
    if (!F || !F.info || !sec || sec.querySelector(".fv")) return;
    if (!F.aplicado) {   // el navegador no cargó videos-extra.js (document.write bloqueado): que el botón no mienta
      F.aviso = "No se pudo cargar tu elección de videos: se muestran los de siempre (El de Rust).";
      F.eleccion = F.porDefecto;
    }
    var info = F.info, e = F.eleccion;
    function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
    var motivos = Object.keys(info.motivos);
    var resumen = info.confs[e.conf].nombre + (e.ocultos.length === motivos.length ? "" : e.ocultos.length === 0 ? " · sin ocultar nada"
      : " · ocultando «" + e.ocultos.map(function (m) { return info.motivos[m]; }).join("» y «") + "»");
    var caja = document.createElement("div");
    caja.className = "fv";
    caja.innerHTML = '<button type="button" class="fv-boton" aria-expanded="false" aria-controls="fv-panel">' +
      '<span aria-hidden="true">⚙</span> Filtro: <b>' + esc(resumen) + "</b></button>" +
      (F.aviso ? '<p class="fv-aviso" role="status">' + esc(F.aviso) + "</p>" : "") +
      '<div class="fv-panel" id="fv-panel" hidden>' +
      '<fieldset><legend>Qué videos ver</legend>' + Object.keys(info.confs).map(function (k) {
        return '<label class="fv-op"><input type="radio" name="fv-conf" value="' + esc(k) + '"' + (k === e.conf ? " checked" : "") + ">" +
          "<span>" + esc(info.confs[k].nombre) + "<small>" + esc(info.confs[k].desc) + "</small></span></label>";
      }).join("") + "</fieldset>" +
      '<fieldset><legend>Ocultar los que Rust marcó como</legend>' + motivos.map(function (m) {
        return '<label class="fv-casilla"><input type="checkbox" value="' + esc(m) + '"' + (e.ocultos.indexOf(m) >= 0 ? " checked" : "") + "> " + esc(info.motivos[m]) + "</label>";
      }).join("") + "</fieldset>" +
      '<div class="fv-pie"><button type="button" class="fv-aplicar">Aplicar</button>' +
      '<button type="button" class="fv-volver">Volver a lo de siempre</button>' +
      "<small>Vale para todas las listas y récords de YouTube (en Tendencias, solo los motivos). Tu navegador lo recuerda.</small></div></div>";
    sec.insertBefore(caja, sec.querySelector(".selector"));
    var boton = caja.querySelector(".fv-boton"), panel = caja.querySelector(".fv-panel");
    function abrir(si) {
      panel.hidden = !si;
      boton.setAttribute("aria-expanded", String(si));
      if (si) { var marcada = panel.querySelector('input[name="fv-conf"]:checked'); if (marcada) marcada.focus(); }
    }
    boton.addEventListener("click", function () { abrir(panel.hidden); });
    panel.addEventListener("keydown", function (ev) {   // Escape cierra y devuelve el foco al botón
      if (ev.key === "Escape") { abrir(false); boton.focus(); }
    });
    function elegir(nueva) {
      if (!F.guardar(nueva)) { alertaSin(); return; }
      location.reload();
    }
    function alertaSin() {
      var p = caja.querySelector(".fv-aviso") || caja.insertBefore(document.createElement("p"), panel);
      p.className = "fv-aviso"; p.setAttribute("role", "status");
      p.textContent = "Tu navegador no deja guardar la elección (modo privado o sin almacenamiento).";
    }
    caja.querySelector(".fv-aplicar").addEventListener("click", function () {
      var conf = caja.querySelector('input[name="fv-conf"]:checked');
      var ocultos = [].map.call(caja.querySelectorAll('input[type="checkbox"]:checked'), function (x) { return x.value; }).sort();
      elegir({ conf: conf ? conf.value : F.porDefecto.conf, ocultos: ocultos });
    });
    caja.querySelector(".fv-volver").addEventListener("click", function () { elegir(F.porDefecto); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", montarUI);
  else setTimeout(montarUI, 0);

  var F = window.FILTRO_VIDEOS;
  if (!F) {
    // Primera pasada: qué eligió el visitante, y si hace falta videos-extra.js.
    var e = leer() || POR_DEFECTO;
    if (!info || !tiene(info.confs, e.conf)) e = POR_DEFECTO;   // datos de ejemplo, o una configuración que Bruno borró
    var vistos = {};
    e = { conf: e.conf, ocultos: info ? e.ocultos.filter(function (m) {   // solo motivos que existen, sin repetir
      if (!tiene(info.motivos, m) || vistos[m]) return false;
      vistos[m] = 1;
      return true;
    }).sort() : POR_DEFECTO.ocultos };
    F = window.FILTRO_VIDEOS = { eleccion: e, porDefecto: POR_DEFECTO, info: info, aplicado: !info || esPorDefecto(e), aviso: "",
      guardar: function (nueva) {
        try {
          if (esPorDefecto(nueva)) localStorage.removeItem(CLAVE); else localStorage.setItem(CLAVE, JSON.stringify(nueva));
        } catch (err) { return false; }
        return true;
      } };
    if (!F.aplicado) {
      var v = encodeURIComponent((D && D.generado) || "");
      // Misma carpeta que este archivo (sirve también si la página se abre desde otra carpeta).
      var aqui = ((document.currentScript && document.currentScript.src) || "").replace(/[^\/]*$/, "");
      document.write('<script src="' + aqui + 'videos-extra.js?v=' + v + '"><\/script><script src="' + aqui + 'filtro-videos.js"><\/script>');
    }
    return;
  }
  if (F.aplicado || F.intentado) return;
  F.intentado = true;

  // Segunda pasada: aplicar la elección con videos-extra.js.
  var E = window.VIDEOS_EXTRA;
  function sinEleccion() {
    F.aviso = "No se pudo cargar tu elección de videos: se muestran los de siempre (El de Rust).";
    F.eleccion = POR_DEFECTO;
    F.aplicado = true;
  }
  if (E && D && E.generado !== D.generado) {
    // Recién publicada una medición, el navegador puede tener guardado un datos.js viejo (GitHub
    // Pages lo deja hasta 10 minutos) y traer videos-extra.js nuevo, o al revés. Una sola vez por
    // pestaña: se pide datos.js de nuevo a la red y se recarga; mientras, se ve lo de siempre.
    var ya = false;
    try { ya = sessionStorage.getItem("fv-reintento") === E.generado; sessionStorage.setItem("fv-reintento", E.generado); } catch (err) { ya = true; }
    if (!ya && window.fetch) {
      var aqui2 = ((document.currentScript && document.currentScript.src) || "").replace(/[^\/]*$/, "");
      fetch(aqui2 + "datos.js", { cache: "reload" }).catch(function () {}).then(function () { location.reload(); });
    }
    sinEleccion();
    return;
  }
  var clave = F.eleccion.ocultos.join(",");
  if (!E || !D || !E.pasa[F.eleccion.conf] || !E.records[F.eleccion.conf] || !E.records[F.eleccion.conf][clave]) { sinEleccion(); return; }
  var conf = F.eleccion.conf, ocultos = {};
  F.eleccion.ocultos.forEach(function (m) { ocultos[m] = 1; });
  function oculto(id) { return (E.marcados[id] || []).some(function (m) { return ocultos[m]; }); }

  // Listas Global y Español: los candidatos de la última medición que pasan la configuración,
  // sin los marcados con un motivo oculto; hasta N videos y N Shorts, de más a menos visto.
  // La serie de visitas que datos.js ya trae, por lista: Global y Español miden el mismo video por
  // separado y sus series no son iguales.
  var series = { global: {}, es: {} };
  (D.youtube || []).forEach(function (x) { series.global[x.id] = x.serie; });
  (D.youtube_es || []).forEach(function (x) { series.es[x.id] = x.serie; });
  function lista(n) {
    var pasa = {};
    E.pasa[conf][n].forEach(function (id) { pasa[id] = 1; });
    var sel = E.pools[n].filter(function (x) { return pasa[x.id] && !oculto(x.id); });
    var normales = sel.filter(function (x) { return x.short !== true; }).slice(0, E.videos_por_tipo);
    var shorts = sel.filter(function (x) { return x.short === true; }).slice(0, E.videos_por_tipo);
    return normales.concat(shorts).map(function (x) {
      var y = {}; Object.keys(x).forEach(function (k) { y[k] = x[k]; });
      if (!y.serie) y.serie = series[n][x.id] || [];
      return y;
    });
  }
  D.youtube = lista("global");
  D.youtube_es = lista("es");
  D.records_youtube = E.records[conf][clave];

  // Tendencias: no tiene configuraciones (su filtro es el título), pero sí las marcas. datos.js
  // las trae con los tres motivos ocultos: aquí se devuelven los marcados que ya no se ocultan.
  E.tendencias.historial.forEach(function (h) {
    var m = D.mediciones[h[0]];
    if (!m || !m.tendencias || m.tendencias.error) return;
    Object.keys(h[1]).forEach(function (r) {
      var vuelven = h[1][r].filter(function (ms) { return !ms.some(function (x) { return ocultos[x]; }); }).length;
      if (typeof m.tendencias[r] === "number") m.tendencias[r] += vuelven;
    });
  });
  var yt = D.comparacion && D.comparacion.youtube;
  if (yt && yt.regiones) {
    Object.keys(E.tendencias.ultima).forEach(function (r) {
      if (!yt.regiones[r]) return;
      E.tendencias.ultima[r].forEach(function (x) {
        if (x.motivos.some(function (m) { return ocultos[m]; })) return;
        var y = {}; Object.keys(x).forEach(function (k) { if (k !== "motivos") y[k] = x[k]; });
        yt.regiones[r].gta.push(y);
      });
      yt.regiones[r].gta.sort(function (a, b) { return a.puesto - b.puesto; });
    });
  }
  F.aplicado = true;
})();
