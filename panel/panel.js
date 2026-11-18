/* Panel de videos (Fase 10, tarea 10.2; forma "Tabla", elegida por Bruno el 2026-11-18).
   Habla solo con panel/servidor.py (en este PC). Cada cambio se guarda al momento como borrador
   en el PC (panel/borrador.json); "Publicar" lo sube a GitHub. Sin librerías. */
(function () {
  "use strict";

  // La clave llega en la dirección que abre panel_videos.bat. Se guarda para esta pestaña y se
  // quita de la barra de direcciones (así no queda a la vista ni en el historial).
  var clave = new URLSearchParams(location.search).get("clave");
  try {
    if (clave) sessionStorage.setItem("clave-panel", clave);
    else clave = sessionStorage.getItem("clave-panel");
  } catch (e) { /* sin sessionStorage: la clave sigue en la variable */ }
  if (location.search) history.replaceState(null, "", location.pathname);

  var D = null;                 // lo que manda el servidor
  var publicado = null;         // {videos, revisados} tal como está en GitHub
  var actual = null;            // {videos, revisados} con los cambios de Bruno
  var filtro = { estado: "sin", lugar: "", tipo: "" };
  var foto = null;              // ids de la lista "congelada" del filtro actual
  var temporizador = null;
  var guardando = Promise.resolve();   // los guardados del borrador van en fila, uno tras otro
  var publicando = false;
  var $ = function (id) { return document.getElementById(id); };

  function hoy() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function copia(x) { return JSON.parse(JSON.stringify(x)); }
  function esc(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function vis(n) { return n == null ? "" : n >= 1e6 ? (n / 1e6).toFixed(1).replace(".", ",") + " M" : n >= 1e3 ? Math.round(n / 1e3) + " mil" : String(n); }

  function api(metodo, ruta, cuerpo) {
    var op = { method: metodo, headers: { "X-Clave": clave || "" } };
    if (cuerpo !== undefined) { op.headers["Content-Type"] = "application/json"; op.body = JSON.stringify(cuerpo); }
    return fetch(ruta, op).then(function (r) {
      return r.json().catch(function () { return { error: "respuesta rara del servidor (" + r.status + ")" }; }).then(function (j) {
        if (!r.ok) throw new Error(j.error || "error " + r.status);
        return j;
      });
    });
  }

  function aviso(texto, tipo, boton) {
    var a = document.createElement("p");
    a.className = "aviso " + (tipo || "");
    a.textContent = texto;
    if (boton) {
      var b = document.createElement("button");
      b.type = "button"; b.textContent = boton.texto; b.addEventListener("click", boton.accion);
      a.appendChild(b);
    }
    $("avisos").appendChild(a);
    return a;
  }
  function limpiarAvisos() { $("avisos").textContent = ""; }

  function estadoDe(estado, id) { return estado.videos[id] ? "marcado" : estado.revisados[id] ? "bien" : "sin"; }
  function estado(id) { return estadoDe(actual, id); }
  function igual(a, b) { return JSON.stringify(a || null) === JSON.stringify(b || null); }
  function cambiado(id) {
    return !igual(actual.videos[id] && actual.videos[id].motivos, publicado.videos[id] && publicado.videos[id].motivos) ||
      !!actual.revisados[id] !== !!publicado.revisados[id];
  }
  function cambios() {
    var ids = {};
    [actual.videos, actual.revisados, publicado.videos, publicado.revisados].forEach(function (o) { Object.keys(o).forEach(function (k) { ids[k] = 1; }); });
    return Object.keys(ids).filter(cambiado).length;
  }
  function cuenta(e) { return D.videos.filter(function (v) { return estado(v.id) === e; }).length; }

  // La lista se "congela" al elegir un filtro: un video que se marca no desaparece al instante
  // (si no, no se le podría poner un segundo motivo, y se pierde de vista lo que se acaba de hacer).
  function lista() {
    if (!foto) {
      foto = {};
      D.videos.forEach(function (v) {
        if (filtro.estado && estado(v.id) !== filtro.estado) return;
        if (filtro.lugar && v.lugares.indexOf(filtro.lugar) < 0) return;
        if (filtro.tipo === "short" && v.short !== true) return;
        if (filtro.tipo === "video" && v.short === true) return;
        foto[v.id] = 1;
      });
    }
    return D.videos.filter(function (v) { return foto[v.id]; });
  }

  // Cambios de Bruno: cada uno se guarda como borrador en el PC (no se pierde si se cierra).
  function bien(id) {
    delete actual.videos[id];
    if (actual.revisados[id]) delete actual.revisados[id]; else actual.revisados[id] = hoy();
  }
  function motivo(id, m) {
    delete actual.revisados[id];
    var x = actual.videos[id] ? copia(actual.videos[id]) : { motivos: [], fecha: hoy() };
    var i = x.motivos.indexOf(m);
    if (i >= 0) x.motivos.splice(i, 1); else x.motivos.push(m);
    var v = D.videos.find(function (y) { return y.id === id; });
    if (v && v.titulo) x.titulo = v.titulo;
    if (x.motivos.length) actual.videos[id] = x; else delete actual.videos[id];
  }
  function deshacer(id) {
    if (publicado.videos[id]) actual.videos[id] = copia(publicado.videos[id]); else delete actual.videos[id];
    if (publicado.revisados[id]) actual.revisados[id] = publicado.revisados[id]; else delete actual.revisados[id];
  }
  // El borrador lleva su "base" (lo publicado cuando se empezó): si mientras tanto alguien más
  // publica (otra sesión, una edición a mano), al abrir se juntan por video en vez de pisarlo.
  function guardarAhora() {
    clearTimeout(temporizador);
    temporizador = null;
    var envio = { videos: copia(actual.videos), revisados: copia(actual.revisados), base: publicado }, hay = cambios();
    guardando = guardando.then(function () {
      return (hay ? api("POST", "/api/borrador", envio) : api("POST", "/api/descartar", {}))
        .catch(function (e) { aviso("No se pudo guardar el borrador en el PC: " + e.message, "mal"); });
    });
    return guardando;
  }
  function guardarBorrador() {
    clearTimeout(temporizador);
    temporizador = setTimeout(guardarAhora, 300);
  }
  function una(estado, id) { return { v: estado.videos[id] || null, r: estado.revisados[id] || null }; }
  function juntar(borrador, pub) {
    var base = borrador.base && borrador.base.videos ? { videos: borrador.base.videos, revisados: borrador.base.revisados || {} } : pub;
    var b = { videos: borrador.videos || {}, revisados: borrador.revisados || {} }, salida = copia(pub), ids = {};
    [base.videos, base.revisados, b.videos, b.revisados].forEach(function (o) { Object.keys(o).forEach(function (k) { ids[k] = 1; }); });
    Object.keys(ids).forEach(function (id) {
      var mio = una(b, id);
      if (igual(mio, una(base, id))) return;          // Bruno no lo tocó: queda lo publicado
      if (mio.v) salida.videos[id] = copia(mio.v); else delete salida.videos[id];
      if (mio.r) salida.revisados[id] = mio.r; else delete salida.revisados[id];
    });
    return { estado: salida, movido: !igual(base, pub) && !igual(b, pub) };
  }

  function pintarCabecera() {
    var n = cambios();
    $("resumen").textContent = D.videos.length + " videos · " + cuenta("sin") + " sin revisar" + (n ? " · " + n + " cambios sin publicar" : "");
    var est = [["sin", "Sin revisar"], ["marcado", "Marcados"], ["bien", "Están bien"], ["", "Todos"]];
    $("estados").innerHTML = est.map(function (e) {
      return '<button type="button" data-v="' + e[0] + '" aria-pressed="' + (filtro.estado === e[0]) + '">' + e[1] + " " + (e[0] ? cuenta(e[0]) : D.videos.length) + "</button>";
    }).join("");
    var pendiente = !n && D.por_subir > 0;   // un Publicar anterior que guardó en el PC pero no subió
    $("publicar").disabled = !(n || pendiente) || D.rama !== "main";
    $("publicar").textContent = pendiente ? "Subir lo pendiente" : "Publicar" + (n ? " (" + n + ")" : "");
    $("descartar").disabled = !n;
  }

  function fila(v) {
    var e = estado(v.id), m = (actual.videos[v.id] || { motivos: [] }).motivos;
    var acciones = '<button type="button" class="acc b" data-a="bien" data-id="' + esc(v.id) + '" aria-pressed="' + !!actual.revisados[v.id] + '">✓ Está bien</button>' +
      Object.keys(D.motivos).map(function (k) {
        return '<button type="button" class="acc ' + (k === "dudoso" ? "d" : "m") + '" data-a="' + k + '" data-id="' + esc(v.id) + '" aria-pressed="' + (m.indexOf(k) >= 0) + '">' + esc(D.motivos[k]) + "</button>";
      }).join("") +
      (cambiado(v.id) ? '<button type="button" class="acc deshacer" data-a="deshacer" data-id="' + esc(v.id) + '">Deshacer</button>' : "");
    var chips = v.lugares.map(function (l) { return '<span class="chip">' + esc(D.lugares[l]) + "</span>"; }).join("") + (v.short === true ? '<span class="chip">Short</span>' : "");
    return '<tr class="' + (e !== "sin" ? "hecho" : "") + '"><td class="img"><img class="mini" loading="lazy" alt="" src="' + esc(v.miniatura) + '"></td>' +
      '<td><div class="t-tit"><a href="https://www.youtube.com/watch?v=' + encodeURIComponent(v.id) + '" target="_blank" rel="noopener noreferrer">' + esc(v.titulo) + "</a></div>" +
      '<div class="t-can">' + esc(v.canal) + "</div>" + chips + "</td>" +
      '<td class="vis num">' + vis(v.visitas) + '<br><span class="estado ' + e + '">' + { sin: "Sin revisar", bien: "Está bien", marcado: "Marcado" }[e] + "</span>" +
      (cambiado(v.id) ? '<br><span class="cambio">sin publicar</span>' : "") + "</td>" +
      '<td class="acc-celda"><div class="acciones">' + acciones + "</div></td></tr>";
  }

  function pintar() {
    pintarCabecera();
    var l = lista();
    $("lista").innerHTML = l.length ? '<table class="tabla"><tbody>' + l.map(fila).join("") + "</tbody></table>"
      : '<p class="vacio">' + (filtro.estado === "sin" ? "No queda nada por revisar con estos filtros." : "No hay videos con estos filtros.") + "</p>";
  }

  function cargar() {
    return api("GET", "/api/datos").then(function (d) {
      D = d;
      publicado = { videos: d.publicado.videos || {}, revisados: d.publicado.revisados || {} };
      var j = d.borrador ? juntar(d.borrador, publicado) : { estado: copia(publicado), movido: false };
      actual = j.estado;
      foto = null;
      limpiarAvisos();
      if (d.borrador && j.movido) aviso("Mientras tenías cambios sin publicar, se publicaron otros: se juntaron con los tuyos (en cada video manda lo último que tocaste tú).");
      if (d.rama !== "main") aviso("El PC está en la rama " + d.rama + ", no en main: puedes marcar (se guarda en el PC), pero Publicar no funciona hasta volver a main (pídeselo a Claude).", "mal");
      if (d.traido && d.traido !== "ok") aviso("No se pudo traer lo nuevo de GitHub al abrir (" + d.traido + "). Se usa lo que hay en el PC.", "mal");
      if (d.borrador && cambios()) aviso("Tienes cambios de la vez anterior sin publicar: siguen aquí.");
      if (d.por_subir > 0 && !cambios()) aviso("Hay " + d.por_subir + " cambio(s) guardado(s) en el PC que todavía no llegan a GitHub: pulsa “Subir lo pendiente”.", "mal");
      var sel = $("lugar");
      if (sel.options.length === 1) Object.keys(d.lugares).forEach(function (k) { sel.add(new Option(d.lugares[k], k)); });
      pintar();
    });
  }

  $("estados").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    filtro.estado = b.dataset.v; foto = null; pintar();
  });
  ["lugar", "tipo"].forEach(function (k) {
    $(k).addEventListener("change", function () { filtro[k] = this.value; foto = null; pintar(); });
  });
  $("lista").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-a]"); if (!b || publicando) return;
    var a = b.dataset.a, id = b.dataset.id;
    if (a === "bien") bien(id);
    else if (a === "deshacer") deshacer(id);
    else if (D.motivos[a]) motivo(id, a);
    else return;
    pintar();
    guardarBorrador();
  });
  $("descartar").addEventListener("click", function () {
    if (publicando) return;
    actual = copia(publicado); foto = null; pintar();
    clearTimeout(temporizador);
    guardando = guardando.then(function () {
      return api("POST", "/api/descartar", {}).catch(function (e) { aviso("No se pudo borrar el borrador: " + e.message, "mal"); });
    });
  });
  // Mientras se publica, la lista no acepta clics, y antes se espera a que termine de guardarse
  // el borrador: así no queda un guardado tardío que reviva cambios ya publicados.
  $("publicar").addEventListener("click", function () {
    if (publicando) return;
    var b = this;
    publicando = true;
    document.body.classList.add("ocupado");
    b.disabled = true; $("descartar").disabled = true; b.textContent = "Publicando…";
    limpiarAvisos();
    var envio = { videos: copia(actual.videos), revisados: copia(actual.revisados) };
    // Primero se guarda el borrador (con el último clic): si Publicar falla, nada se pierde.
    guardarAhora().then(function () { return api("POST", "/api/publicar", envio); }).then(function (r) {
      return cargar().then(function () { aviso(r.mensaje, "ok"); }, function (e) {
        aviso(r.mensaje + " (Pero no se pudo recargar la lista: " + e.message + ". Cierra y abre el panel.)", "ok");
      });
    }, function (e) {
      aviso("No se publicó: " + e.message, "mal", { texto: "Reintentar", accion: function () { $("publicar").click(); } });
    }).then(function () {
      publicando = false;
      document.body.classList.remove("ocupado");
      pintarCabecera();
    });
  });

  if (!clave) {
    $("lista").innerHTML = '<p class="vacio">Abre el panel con panel_videos.bat (doble clic): así trae su clave.</p>';
    $("resumen").textContent = "";
  } else {
    cargar().catch(function (e) {
      $("lista").innerHTML = "";
      aviso("No se pudieron cargar los videos: " + e.message, "mal");
    });
  }
})();
