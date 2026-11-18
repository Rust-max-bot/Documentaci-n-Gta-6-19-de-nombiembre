/* Animaciones de la página que cambian de golpe: día elegido (9.8, opción A "Deslizar") y abrir/cerrar
   listas y filtros (9.9, opción A, elegidas por Bruno el 2026-11-17).

   Todas viven aquí. Para apagar una, poner su línea de ACTIVAS en false (app.js solo llama a
   ANIM.<nombre>). Respeta "reducir movimiento" del sistema. Usa la API de animaciones del navegador:
   no cambia los datos. Los estilos de la cortina de Titulares y de la flecha de los botones están en
   estilos.css (".despliegue", ".chev").

   Cuidados (lo que falló en el prototipo de la 9.8 y Bruno notó):
   - Los cuadros entran rápido y casi juntos, para que ninguno parezca tardar en cargar.
   - En la tabla de Twitch y Kick la hora ocupa dos filas (Twitch y Kick). Las dos filas de una
     misma medición se animan JUNTAS: si cada una entra por su lado, la hora se ve cortada.
   - Las fotos de los canales se piden ya (no "perezosas") y aparecen con un fundido suave.
   Reglas de la 9.9 (skill "make-interfaces-feel-better"): lo que se toca mucho (filtros) es corto y
   sin cascada; lo que se hace pocas veces (abrir una lista) puede ser más largo; la salida es más
   suave y rápida que la entrada. */
(function () {
  var ACTIVAS = {
    resumen: true,      // Resumen del día al cambiar de día
    tabla: true,        // tabla de Twitch y Kick al cambiar de día
    lista: true,        // línea de tiempo al elegir un filtro (fundido corto)
    despliegue: true,   // abrir/cerrar Titulares y "Ver los N eventos" de la línea de tiempo
    portada: true       // movimiento continuo de la portada: estrellas, sol, nubes, aves, mar, palmeras, espuma
                        // y neón del título (9.11 b). En false se PAUSAN (quedan quietas, no desaparecen):
                        // freno si la página va lenta. Para probar sin cambiar esto: ?sin-anim=portada
  };
  var PRUEBA = /[?&]sin-anim=portada(?:&|$)/.test(location.search);
  document.documentElement.classList.toggle("sin-anim-portada", !ACTIVAS.portada || PRUEBA);
  // Optimización (2026-11-17): cuando la portada sale de la pantalla, su movimiento se pausa (estilos.css,
  // ".portada-fuera"); vuelve al subir. Nadie lo ve y así no gasta mientras se leen las secciones de abajo.
  var portada = document.querySelector(".portada");
  if (portada && "IntersectionObserver" in window) {
    new IntersectionObserver(function (e) {
      document.documentElement.classList.toggle("portada-fuera", !e[e.length - 1].isIntersecting);
    }).observe(portada);
  }
  var QUIETO = window.matchMedia("(prefers-reduced-motion: reduce)");
  var EASE = "cubic-bezier(.2,.8,.2,1)";

  function entrar(el, px, ms, retardo) {
    if (!el) return;
    el.animate([{ opacity: 0, transform: "translateX(" + px + "px)" }, { opacity: 1, transform: "none" }],
      { duration: ms, delay: retardo, easing: EASE, fill: "backwards" });
  }

  window.ANIM = {
    /* Resumen del día. dir > 0: un día más viejo (el contenido entra desde la derecha);
       dir < 0: un día más nuevo (desde la izquierda). */
    resumen: function (caja, dir) {
      if (!ACTIVAS.resumen || QUIETO.matches || !caja) return;
      var x = dir > 0 ? 1 : -1;
      entrar(caja.querySelector(".rd-titulo"), x * 32, 340, 0);
      entrar(caja.querySelector(".rd-curso"), x * 32, 340, 20);
      [].forEach.call(caja.querySelectorAll(".rd-cuadros > li"), function (li, i) {
        entrar(li, x * 44, 380, 20 + i * 28);
      });
    },
    /* Tabla de Twitch y Kick: una "medición" = la fila de Twitch y la de Kick con la hora al lado. */
    tabla: function (tabla, dir) {
      if (!ACTIVAS.tabla || QUIETO.matches || !tabla) return;
      var x = dir > 0 ? 1 : -1, grupo = -1;
      [].forEach.call(tabla.querySelectorAll("tbody tr"), function (tr) {
        if (tr.querySelector("td[rowspan]") || grupo < 0) grupo++;
        entrar(tr, x * 32, 340, Math.min(grupo, 10) * 28);
      });
      [].slice.call(tabla.querySelectorAll("img.avatar")).forEach(function (img, i) {
        if (i < 40) img.loading = "eager";                // las de más abajo siguen perezosas
        if (img.complete) return;
        img.style.opacity = "0";
        function salir() { img.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: "ease-out" }); img.style.opacity = ""; }
        img.addEventListener("load", salir, { once: true });
        img.addEventListener("error", function () { img.style.opacity = ""; }, { once: true });
      });
    },

    /* Botón "Ver los N…" / "Ocultar…": el texto cambia con fundido y desenfoque, y la flecha gira
       (por CSS, según aria-expanded). Se puede llamar muchas veces con el mismo texto. */
    boton: function (btn, texto) {
      var t = btn.querySelector(".bt");
      if (!t) {
        btn.innerHTML = '<span class="bt"></span><svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        t = btn.querySelector(".bt"); t.textContent = texto; return;
      }
      if (t.textContent === texto) return;
      t.textContent = texto;
      if (ACTIVAS.despliegue && !QUIETO.matches) {
        t.animate([{ opacity: 0, filter: "blur(4px)", transform: "translateY(4px)" }, { opacity: 1, filter: "none", transform: "none" }], { duration: 240, easing: EASE });
      }
    },

    /* Titulares: la lista completa se abre y se cierra con una cortina (grid-template-rows 0fr -> 1fr,
       todo en estilos.css; se puede interrumpir a la mitad). Aquí solo se pone o quita la clase. */
    desplegar: function (el, abrir) {
      el.style.transition = ACTIVAS.despliegue ? "" : "none";
      el.classList.toggle("abierto", abrir);
    },

    /* Línea de tiempo, "Ver los N eventos" / "Ver menos": la altura de la lista pasa de una a otra.
       Al abrir, los eventos nuevos aparecen con un fundido; al cerrar, los que sobran se desvanecen
       (más rápido y suave) y recién después se vuelve a dibujar la lista corta. */
    alturaLinea: function (caja, cambiar, abriendo) {
      if (!ACTIVAS.despliegue || QUIETO.matches || caja._ocupada) { cambiar(); return; }
      var dur = 340;
      function limpiar() { caja.style.overflow = ""; caja.style.height = ""; caja._ocupada = false; }
      var hijos = function () { return [].slice.call(caja.children); };
      if (abriendo) {
        var h0 = caja.offsetHeight, antes = hijos().length;
        cambiar();
        var h1 = caja.offsetHeight, nuevos = hijos().slice(antes);
        caja._ocupada = true; caja.style.overflow = "hidden";
        var a = caja.animate([{ height: h0 + "px" }, { height: h1 + "px" }], { duration: dur, easing: EASE });
        a.onfinish = a.oncancel = limpiar;
        nuevos.forEach(function (li) {
          li.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 300, delay: 40, easing: EASE, fill: "backwards" });
        });
      } else {
        var lis = hijos(), evs = lis.filter(function (li) { return li.classList.contains("l-ev"); }), corte = evs[8];   // el noveno evento es el primero que se oculta
        if (!corte) { cambiar(); return; }
        var i0 = lis.indexOf(corte);
        if (lis[i0 - 1] && lis[i0 - 1].classList.contains("l-dia")) i0--;   // y el rótulo del día que lo precede
        var alto = lis[i0].offsetTop, h = caja.offsetHeight;
        caja._ocupada = true; caja.style.overflow = "hidden";
        lis.slice(i0).forEach(function (li) {
          li.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-6px)" }], { duration: 160, easing: "ease-out", fill: "forwards" });
        });
        var b = caja.animate([{ height: h + "px" }, { height: alto + "px" }], { duration: dur - 40, easing: "ease-out", fill: "forwards" });
        b.onfinish = function () { cambiar(); limpiar(); b.cancel(); };
      }
    },

    /* Línea de tiempo al elegir un filtro: la gota rosada se desliza (gota() de app.js) y la lista cambia
       con un fundido corto, sin cascada (se usa mucho). */
    lista: function (caja) {   // también la lista de Titulares al cambiar de página o de día (9.11 b)
      if (!ACTIVAS.lista || QUIETO.matches || !caja) return;
      caja.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 180, easing: "ease-out" });
    }
  };
})();
