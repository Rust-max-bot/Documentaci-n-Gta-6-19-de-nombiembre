/* Animaciones al cambiar de día (tarea 9.8; opción A "Deslizar" elegida por Bruno, 2026-11-17).

   Todas las animaciones de esta parte de la página viven aquí. Para apagar una, poner su línea
   de ACTIVAS en false (app.js solo llama a ANIM.<nombre>). Respeta "reducir movimiento" del
   sistema. Usa la API de animaciones del navegador: no cambia los datos ni el HTML.

   Cuidados (lo que falló en el prototipo y Bruno notó):
   - Los cuadros entran rápido y casi juntos (un retraso corto entre uno y otro), para que
     ninguno parezca tardar en cargar.
   - En la tabla de Twitch y Kick la hora ocupa dos filas (Twitch y Kick). Las dos filas de una
     misma medición se animan JUNTAS: si cada una entra por su lado, la hora se ve cortada.
   - Las fotos de los canales se piden ya (no "perezosas") y aparecen con un fundido suave, así
     no saltan cuando terminan de bajar. */
(function () {
  var ACTIVAS = { resumen: true, tabla: true };
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
    }
  };
})();
