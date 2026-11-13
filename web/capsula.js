/* CÁPSULA DEL TIEMPO (tarea 7.4)
   Aquí escribes tú dos textos: lo que esperas de GTA 6 (antes del 19 de noviembre) y lo que
   te pareció (después). La página los muestra como dos postales de Miami, una al lado de la otra.
   Claude no escribe estos textos: son tuyos.

   Cómo se escribe:
   - "fecha": el día en que lo escribes, con este formato exacto: "AAAA-MM-DD" (ej.: "2026-11-15").
     Sale en el matasellos de la postal.
   - "texto": va entre las dos comillas inclinadas ` ` (no las normales). Puede tener varias
     líneas. Para separar párrafos, deja una línea en blanco.
   - Mientras "texto" esté vacío, la postal sale cerrada.

   Ejemplo (solo para ver la forma; no se muestra en la página):
     antes: {
       fecha: "2026-11-15",
       texto: `Primer párrafo.

   Segundo párrafo.`
     },
*/
window.CAPSULA = {
  antes: {
    fecha: "",
    texto: ``
  },
  despues: {
    fecha: "",
    texto: ``
  }
};
