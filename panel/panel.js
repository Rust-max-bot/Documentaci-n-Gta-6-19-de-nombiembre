/* Panel de videos (Fase 10; forma "Tabla", elegida por Bruno el 2026-11-18).
   10.2: marcar con motivos, "Está bien", deshacer y publicar. 10.3: rescatar videos que el
   filtro automático descarta y configuraciones propias (nombre, modo y palabras excluidas).
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

  var PARTES = ["videos", "revisados", "rescatados", "configuraciones"];   // lo que va al archivo de marcas
  var D = null;                 // lo que manda el servidor
  var publicado = null;         // tal como está en GitHub
  var actual = null;            // con los cambios de Bruno
  var filtro = { estado: "sin", lugar: "pagina", tipo: "" };
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
  function estadoVacio() { var e = {}; PARTES.forEach(function (p) { e[p] = {}; }); return e; }
  function normal(x) { var e = estadoVacio(); PARTES.forEach(function (p) { if (x && x[p] && typeof x[p] === "object") e[p] = copia(x[p]); }); return e; }

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

  // ---- Estado de cada video ----
  var porId = {};
  function descartado(v) { return v.lugares.indexOf("descartado") >= 0; }
  function enPagina(v) { return !v.fuera; }   // "fuera": sin rescate no sale en ninguna parte (lo calcula lista.py)
  function estado(id) {
    if (actual.videos[id]) return "marcado";
    if (actual.rescatados[id]) return "rescatado";
    if (actual.revisados[id]) return "bien";
    var v = porId[id];
    return v && v.fuera ? "descartado" : "sin";
  }
  // Compara sin importar el orden de las claves (un archivo editado a mano puede traer otro orden).
  function estable(x) {
    if (Array.isArray(x)) return "[" + x.map(estable).join(",") + "]";
    if (x && typeof x === "object") return "{" + Object.keys(x).sort().map(function (k) { return JSON.stringify(k) + ":" + estable(x[k]); }).join(",") + "}";
    return JSON.stringify(x === undefined ? null : x);
  }
  function igual(a, b) { return estable(a || null) === estable(b || null); }
  function una(e, id) { return { v: e.videos[id] ? e.videos[id].motivos : null, r: !!e.revisados[id], k: !!e.rescatados[id] }; }
  function cambiado(id) { return !igual(una(actual, id), una(publicado, id)); }
  function confsCambiadas() {
    var ks = {};
    [actual.configuraciones, publicado.configuraciones].forEach(function (o) { Object.keys(o).forEach(function (k) { ks[k] = 1; }); });
    return Object.keys(ks).filter(function (k) { return !igual(actual.configuraciones[k], publicado.configuraciones[k]); }).length;
  }
  function cambios() {
    var ids = {};
    ["videos", "revisados", "rescatados"].forEach(function (p) {
      [actual[p], publicado[p]].forEach(function (o) { Object.keys(o).forEach(function (k) { ids[k] = 1; }); });
    });
    return Object.keys(ids).filter(cambiado).length + confsCambiadas();
  }
  function cuenta(e) { return D.videos.filter(function (v) { return estado(v.id) === e; }).length; }

  // La lista se "congela" al elegir un filtro: un video que se marca no desaparece al instante
  // (si no, no se le podría poner un segundo motivo, y se pierde de vista lo que se acaba de hacer).
  function lista() {
    if (!foto) {
      foto = {};
      D.videos.forEach(function (v) {
        if (filtro.estado && estado(v.id) !== filtro.estado) return;
        if (filtro.lugar === "pagina" && estado(v.id) === "descartado" && filtro.estado !== "descartado") return;
        if (filtro.lugar && filtro.lugar !== "pagina" && v.lugares.indexOf(filtro.lugar) < 0) return;
        if (filtro.tipo === "short" && v.short !== true) return;
        if (filtro.tipo === "video" && v.short === true) return;
        foto[v.id] = 1;
      });
    }
    return D.videos.filter(function (v) { return foto[v.id]; });
  }

  // ---- Cambios de Bruno: cada uno se guarda como borrador en el PC ----
  function limpiar(id) { delete actual.videos[id]; delete actual.revisados[id]; delete actual.rescatados[id]; }
  function bien(id) { var ya = actual.revisados[id]; limpiar(id); if (!ya) actual.revisados[id] = hoy(); }
  function rescatar(id) { var ya = actual.rescatados[id]; limpiar(id); if (!ya) actual.rescatados[id] = hoy(); }
  function motivo(id, m) {
    var x = actual.videos[id] ? copia(actual.videos[id]) : { motivos: [], fecha: hoy() };
    delete actual.revisados[id]; delete actual.rescatados[id];
    var i = x.motivos.indexOf(m);
    if (i >= 0) x.motivos.splice(i, 1); else x.motivos.push(m);
    if (porId[id] && porId[id].titulo) x.titulo = porId[id].titulo;
    if (x.motivos.length) actual.videos[id] = x; else delete actual.videos[id];
  }
  function deshacer(id) {
    limpiar(id);
    ["videos", "revisados", "rescatados"].forEach(function (p) { if (publicado[p][id]) actual[p][id] = copia(publicado[p][id]); });
  }

  // El borrador lleva su "base" (lo publicado cuando se empezó): si mientras tanto alguien más
  // publica (otra sesión, una edición a mano), al abrir se juntan en vez de pisarlo.
  function guardarAhora() {
    clearTimeout(temporizador);
    temporizador = null;
    var envio = copia(actual), hay = cambios();
    envio.base = publicado;
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
  function juntar(borrador, pub) {
    var base = borrador.base && borrador.base.videos ? normal(borrador.base) : pub;
    var b = normal(borrador), salida = copia(pub), ids = {}, ks = {};
    ["videos", "revisados", "rescatados"].forEach(function (p) {
      [base[p], b[p]].forEach(function (o) { Object.keys(o).forEach(function (k) { ids[k] = 1; }); });
    });
    Object.keys(ids).forEach(function (id) {
      if (igual(una(b, id), una(base, id))) return;          // Bruno no lo tocó: queda lo publicado
      ["videos", "revisados", "rescatados"].forEach(function (p) {
        if (b[p][id]) salida[p][id] = copia(b[p][id]); else delete salida[p][id];
      });
    });
    [base.configuraciones, b.configuraciones].forEach(function (o) { Object.keys(o).forEach(function (k) { ks[k] = 1; }); });
    Object.keys(ks).forEach(function (k) {
      if (igual(b.configuraciones[k], base.configuraciones[k])) return;
      if (b.configuraciones[k]) salida.configuraciones[k] = copia(b.configuraciones[k]); else delete salida.configuraciones[k];
    });
    // Si al juntar quedan dos configuraciones con el mismo nombre, la del borrador se renombra
    // (si no, el archivo no pasaría la validación y no se podría guardar ni publicar).
    var nombres = {};
    Object.keys(salida.configuraciones).sort(function (x, y) { return (b.configuraciones[x] ? 1 : 0) - (b.configuraciones[y] ? 1 : 0); }).forEach(function (k) {
      var c = salida.configuraciones[k], n = c.nombre, i = 2;
      while (nombres[n.toLowerCase()]) n = c.nombre.slice(0, 35) + " (" + (i++) + ")";
      c.nombre = n;
      nombres[n.toLowerCase()] = 1;
    });
    return { estado: salida, movido: !igual(base, pub) && !igual(b, pub) };
  }

  // ---- Dibujar ----
  function pintarCabecera() {
    var n = cambios();
    $("resumen").textContent = D.videos.length + " videos · " + cuenta("sin") + " sin revisar" + (n ? " · " + n + " cambios sin publicar" : "");
    var est = [["sin", "Sin revisar"], ["marcado", "Marcados"], ["bien", "Están bien"], ["rescatado", "Rescatados"], ["descartado", "Descartados"], ["", "Todos"]];
    $("estados").innerHTML = est.map(function (e) {
      return '<button type="button" data-v="' + e[0] + '" aria-pressed="' + (filtro.estado === e[0]) + '">' + e[1] + " " + (e[0] ? cuenta(e[0]) : D.videos.length) + "</button>";
    }).join("");
    var pendiente = !n && D.por_subir > 0;   // un Publicar anterior que guardó en el PC pero no subió
    $("publicar").disabled = !(n || pendiente) || D.rama !== "main";
    $("publicar").textContent = pendiente ? "Subir lo pendiente" : "Publicar" + (n ? " (" + n + ")" : "");
    $("descartar").disabled = !n;
  }

  function fila(v) {
    var e = estado(v.id), m = (actual.videos[v.id] || { motivos: [] }).motivos, id = esc(v.id), acciones;
    var botonRescate = '<button type="button" class="acc b" data-a="rescatar" data-id="' + id + '" aria-pressed="' + !!actual.rescatados[v.id] + '">↩ Rescatar</button>';
    if (actual.rescatados[v.id] || (v.fuera && !actual.videos[v.id] && !actual.revisados[v.id])) {
      // Fuera de la página: solo se puede rescatar (marcarlo no cambiaría nada: ya no sale).
      acciones = botonRescate;
    } else {
      acciones = '<button type="button" class="acc b" data-a="bien" data-id="' + id + '" aria-pressed="' + !!actual.revisados[v.id] + '">✓ Está bien</button>' +
        Object.keys(D.motivos).map(function (k) {
          return '<button type="button" class="acc ' + (k === "dudoso" ? "d" : "m") + '" data-a="' + k + '" data-id="' + id + '" aria-pressed="' + (m.indexOf(k) >= 0) + '">' + esc(D.motivos[k]) + "</button>";
        }).join("") + (descartado(v) ? botonRescate : "");   // descartado en Global pero visible en otra lista
    }
    if (cambiado(v.id)) acciones += '<button type="button" class="acc deshacer" data-a="deshacer" data-id="' + id + '">Deshacer</button>';
    var chips = v.lugares.map(function (l) { return '<span class="chip' + (l === "descartado" ? " chip-desc" : "") + '">' + esc(D.lugares[l]) + "</span>"; }).join("") +
      (v.short === true ? '<span class="chip">Short</span>' : "") +
      (descartado(v) ? '<span class="nota">' + (v.sin_efecto ? "Medido solo antes del 15 nov (sin saber si es Short): rescatarlo no cambia nada en la página."
        : v.reciente ? "En la última medición: si lo rescatas, puede salir en las listas." : "Solo en mediciones viejas: si lo rescatas, cuenta para los récords.") + "</span>" : "");
    var nombre = { sin: "Sin revisar", bien: "Está bien", marcado: "Marcado", rescatado: "Rescatado", descartado: "Descartado" }[e];
    return '<tr class="' + (e === "sin" || e === "descartado" ? "" : "hecho") + '"><td class="img"><img class="mini" loading="lazy" alt="" src="' + esc(v.miniatura) + '"></td>' +
      '<td><div class="t-tit"><a href="https://www.youtube.com/watch?v=' + encodeURIComponent(v.id) + '" target="_blank" rel="noopener noreferrer">' + esc(v.titulo) + "</a></div>" +
      '<div class="t-can">' + esc(v.canal) + "</div>" + chips + "</td>" +
      '<td class="vis num">' + vis(v.visitas) + '<br><span class="estado ' + e + '">' + nombre + "</span>" +
      (cambiado(v.id) ? '<br><span class="cambio">sin publicar</span>' : "") + "</td>" +
      '<td class="acc-celda"><div class="acciones">' + acciones + "</div></td></tr>";
  }

  function pintarConfs() {
    var fa = D.filtro_automatico, modos = { estricto: "Estricto (título + tema de videojuegos)", titulo: "Solo el título", ninguno: "Ninguno (todos)" };
    var fijas = '<ul class="fijas">' +
      '<li><b>' + esc(D.fijas["desde-cero"]) + "</b> todos los videos, sin filtro (las marcas valen si el visitante las deja).</li>" +
      '<li><b>' + esc(D.fijas.automatico) + "</b> " + esc(modos[fa.modo] || fa.modo) + "; excluye: " + esc((fa.excluir_palabras || []).join(", ") || "nada") + ".</li>" +
      '<li><b>' + esc(D.fijas.rust) + "</b> el automático, con tus marcas y rescates.</li></ul>";
    var propias = Object.keys(actual.configuraciones).map(function (k) {
      var c = actual.configuraciones[k];
      return '<div class="conf" data-k="' + esc(k) + '">' +
        '<label>Nombre <input type="text" maxlength="40" data-c="nombre" value="' + esc(c.nombre) + '"></label>' +
        '<label>Modo <select data-c="modo">' + D.modos.map(function (mo) { return '<option value="' + mo + '"' + (c.modo === mo ? " selected" : "") + ">" + esc(modos[mo] || mo) + "</option>"; }).join("") + "</select></label>" +
        '<label class="ancha">Palabras que excluyen (separadas por comas) <input type="text" data-c="excluir_palabras" value="' + esc(c.excluir_palabras.join(", ")) + '"></label>' +
        '<span class="conf-botones"><button type="button" class="acc" data-c-a="restablecer">Restablecer</button>' +
        '<button type="button" class="acc deshacer" data-c-a="borrar">Borrar</button>' +
        (!igual(c, publicado.configuraciones[k]) ? '<span class="cambio">sin publicar</span>' : "") + "</span></div>";
    }).join("");
    $("confs-cuerpo").innerHTML = fijas + (propias || '<p class="tenue">Todavía no tienes configuraciones propias.</p>') +
      '<button type="button" class="acc" data-c-a="nueva">+ Nueva configuración</button>' +
      '<p class="tenue">"Restablecer" vuelve el modo y las palabras a los del filtro automático. Las marcas y rescates no cambian. El visitante podrá elegirlas en la 10.4.</p>';
  }

  function pintar() {
    pintarCabecera();
    if (!$("confs").hidden) pintarConfs();
    var l = lista();
    $("lista").innerHTML = l.length ? '<table class="tabla"><tbody>' + l.map(fila).join("") + "</tbody></table>"
      : '<p class="vacio">' + (filtro.estado === "sin" ? "No queda nada por revisar con estos filtros." : "No hay videos con estos filtros.") + "</p>";
  }

  function cargar() {
    return api("GET", "/api/datos").then(function (d) {
      D = d;
      porId = {};
      d.videos.forEach(function (v) { porId[v.id] = v; });
      publicado = normal(d.publicado);
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
      if (sel.options.length <= 2) Object.keys(d.lugares).forEach(function (k) { sel.add(new Option(d.lugares[k], k)); });
      pintar();
    });
  }

  // ---- Eventos ----
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
    else if (a === "rescatar") rescatar(id);
    else if (a === "deshacer") deshacer(id);
    else if (D.motivos[a]) motivo(id, a);
    else return;
    pintar();
    guardarBorrador();
  });

  $("ver-confs").addEventListener("click", function () {
    var c = $("confs");
    c.hidden = !c.hidden;
    this.setAttribute("aria-expanded", String(!c.hidden));
    if (!c.hidden) pintarConfs();
  });
  // Las mismas reglas que recolector/marcas.py: hasta 30 palabras de hasta 40 letras, sin repetir.
  function limpiarPalabras(lista) {
    var vistas = {};
    return (lista || []).map(function (p) { return String(p).trim().slice(0, 40); }).filter(function (p) {
      var bajo = p.toLowerCase();
      if (!p || vistas[bajo]) return false;
      vistas[bajo] = 1;
      return true;
    }).slice(0, 30);
  }
  function claveNueva(nombre) {
    var base = (nombre.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "config").slice(0, 24);
    var k = base, n = 2;
    while (actual.configuraciones[k] || publicado.configuraciones[k] || D.fijas[k]) k = base + "-" + n++;
    return k;
  }
  function nombreLibre(nombre, menos) {
    var bajo = nombre.toLowerCase(), fijas = Object.keys(D.fijas).map(function (k) { return D.fijas[k].toLowerCase(); });
    return fijas.indexOf(bajo) < 0 && !Object.keys(actual.configuraciones).some(function (k) {
      return k !== menos && actual.configuraciones[k].nombre.toLowerCase() === bajo;
    });
  }
  $("confs-cuerpo").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-c-a]"); if (!b || publicando) return;
    var a = b.dataset.cA, caja = b.closest(".conf"), k = caja && caja.dataset.k, fa = D.filtro_automatico;
    if (a === "nueva") {
      var n = 1, nombre = "Mi configuración";
      while (!nombreLibre(nombre)) nombre = "Mi configuración " + (++n);
      actual.configuraciones[claveNueva(nombre)] = { nombre: nombre, modo: fa.modo, excluir_palabras: limpiarPalabras(fa.excluir_palabras) };
    } else if (a === "restablecer") {
      actual.configuraciones[k].modo = fa.modo;
      actual.configuraciones[k].excluir_palabras = limpiarPalabras(fa.excluir_palabras);
    } else if (a === "borrar") {
      delete actual.configuraciones[k];
    } else return;
    pintar();
    guardarBorrador();
  });
  $("confs-cuerpo").addEventListener("change", function (e) {
    var campo = e.target.dataset.c, caja = e.target.closest(".conf"); if (!campo || !caja || publicando) return;
    var c = actual.configuraciones[caja.dataset.k], valor = e.target.value;
    if (campo === "nombre") {
      valor = valor.trim().slice(0, 40);
      if (!valor || !nombreLibre(valor, caja.dataset.k)) {
        aviso(valor ? "Ya hay una configuración que se llama “" + valor + "”." : "El nombre no puede quedar vacío.", "mal");
        e.target.value = c.nombre;
        return;
      }
      c.nombre = valor;
    } else if (campo === "modo") {
      c.modo = valor;
    } else if (campo === "excluir_palabras") {
      c.excluir_palabras = limpiarPalabras(valor.split(","));
      e.target.value = c.excluir_palabras.join(", ");
    }
    // Sin redibujar los campos: así no se pierde el lugar al pasar al siguiente con Tab.
    pintarCabecera();
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
  // Mientras se publica, la lista no acepta clics, y antes se guarda el borrador con el último
  // clic: así nada se pierde si Publicar falla, y no queda un guardado tardío que reviva cambios.
  $("publicar").addEventListener("click", function () {
    if (publicando) return;
    var b = this;
    publicando = true;
    document.body.classList.add("ocupado");
    b.disabled = true; $("descartar").disabled = true; b.textContent = "Publicando…";
    limpiarAvisos();
    var envio = copia(actual);
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
