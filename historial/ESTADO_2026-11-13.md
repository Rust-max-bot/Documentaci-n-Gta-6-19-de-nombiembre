# Estado actual del proyecto

> Estado **vivo** y corto. Las reglas y la forma de trabajo están en `CLAUDE.md`; las
> decisiones, fases y riesgos, en `PLAN.md`; la lista ordenada de tareas, en
> `PLAN_DE_TRABAJO.md`. Al iniciar una sesión se lee este archivo entero.

## Cómo usar este archivo

- Se actualiza en el mismo commit del paso, solo si cambia el estado, un pendiente o
  "Dónde quedamos" (ver "Guardado al terminar cada paso" en `CLAUDE.md`). Nada de reglas aquí.
- **Tiene que seguir siendo corto.** "Últimos cambios" guarda unas 8 entradas de una línea;
  las viejas se borran porque ya están en `git log`.
- Si pasa de 20.000 bytes, se archiva en `historial/` y se empieza uno nuevo (ver
  "Archivar `ESTADO_ACTUAL.md`" en `CLAUDE.md`).

## Dónde quedamos

*(2026-11-13, ~21:00 UTC.)*

**Fase 1 terminada** (tareas 1.1 a 1.7). La página ya muestra lo más nuevo arriba y el eje de
Twitch con números redondos (decisiones en `PLAN.md`).

**Tanda 2.1, 2.2 y 2.3 terminada** (2026-11-13): enlaces a YouTube y Twitch; videos en
tarjetas con miniatura; foto de perfil de los canales de Twitch (el recolector la guarda desde
el 13 nov); suelo de 1986 sin parpadeo (segundo arreglo: dibujado en un lienzo; falta que Bruno lo confirme). Lo siguiente
en orden es la 2.4 (rayas del sol de 1986: pide opciones con capturas). Bruno vio el suelo:
"mucho mejor", apenas titila. Aparte, los titulares van por páginas (12 por página) y, por decisión de Bruno, la
página muestra todos los guardados (antes, solo los 60 más nuevos). Idea para después: un
filtro por día en los titulares.

**3.2 y 2.4 hechas** (2026-11-13): Reddit se guarda por RSS desde el PR #5 (sin votos ni
comentarios; la clave de Reddit queda para después) y la página lo muestra con la opción C
que eligió Bruno: barras de publicaciones por hora y las 8 más nuevas en tarjetas chicas.
Rayas del sol de 1986: opción A.

**Tanda 3.1 y 3.3 terminada** (2026-11-13):
- 3.3: hay torres detrás de los hoteles, inspiradas en edificios reales de Miami. Son 2 de los años 80, que salen en las dos escenas, y 6 nuevas solo en 2026 (opción 2 de Bruno).
- 3.1: Miami 2026 tiene la paleta B "Atardecer encendido". Las torres de 2026 pasaron a lila para combinar.
- Siguiente en orden: la Fase 4 (4.1, modo día y noche). Hecha después, ver abajo.
- Quedan 2 ramas de capturas para borrar cuando Bruno quiera: `revision/edificios-2026` y `revision/colores-2026`.

**Tanda "7.2 Hora cero" terminada** (2026-11-13). Bruno pidió que la hora cero se viera bien
de día y de noche, así que antes se hizo la 4.1:
- **4.1 y 4.2:** día, atardecer y noche según la hora real de Miami, con botones para cambiarla.
- **7.2:** al llegar a 0 hay fuegos artificiales y reflectores, y la cuenta sigue "desde que salió GTA 6".
- Para verlo antes del 19 nov, agregar `?probar-hora-cero` a la dirección.
- Ya está en `main` (PR #9, unido por Bruno).

**7.4 Cápsula del tiempo: página lista** (2026-11-13, opción B de Bruno, "postales de Miami").
Dos postales al final de la página. **Falta que Bruno escriba "Lo que espero" antes del 19 nov**,
en `web/capsula.js` (o que se lo pase a Claude para ponerlo). Capturas de las opciones en la
carpeta del proyecto `capsula/`.

**Repositorio listo para sesiones en la nube** (2026-11-13, pedido de Bruno, que tiene
créditos para la nube): guía para Bruno en `NUBE.md`; al arrancar en la nube,
`.claude/hooks/preparar-nube.sh` instala las pruebas, Chromium y Graphify; las pruebas
visuales están en `pruebas/` (antes solo en el PC de Claude). **Probado en la nube el
2026-11-13:** el hook no llegó a correr (la sesión empezó fuera del repo) y el Playwright de
`requisitos.txt` no encuentra el Chromium de la máquina; `pruebas/navegador.py` ahora usa
`/opt/pw-browsers/chromium` si hace falta (PR desde la rama `claude/project-thread-qotwvh`). Revisión de la página antes del
lanzamiento: todo bien a 1280 y 384 px en los dos estilos; las fotos de YouTube y Twitch no
cargan en la nube porque su red bloquea esos sitios (no es fallo de la página). TikTok: Bruno
lo deja para después (anotado como 2.5).

**El recolector funciona solo.** Lo lanza el despertador de Cloudflare (Worker
`despertador-recolector`, horario `7,37 * * * *`, clave de GitHub en su secreto
`GITHUB_TOKEN`; caduca el 31 ene 2027, o ~1 mar 2027 según recuerda Bruno: por verificar,
pero ambas fechas pasan del 19 dic). Verificado el 2026-11-13: 12 ejecuciones seguidas,
cada hora de 02:07 a 13:07 UTC, todas bien y con su commit "Medición automática". **Revisado otra vez el 2026-11-13 a las 17:14 UTC (sesión en la nube):**
16 ejecuciones del despertador seguidas, cada hora de 02:07 a 17:07 UTC, todas bien, sin
huecos en ninguna fuente; `revisar.py` solo marca como faltantes 3 turnos del 12 nov, de antes
del despertador. El turno extra del minuto 37 (17 al 21 nov) no se puede ver hasta el 17 nov:
probada la regla de `worker.js` con horas simuladas (empieza el 17 nov 00:07 UTC y termina
el 22 nov 00:07 UTC, como se decidió). Nada que arreglar. GitHub
también lanzó dos programadas, tarde (03:23 y 12:05 UTC), que midieron dos veces esos turnos
(quedan en los datos; no se borran). Por eso se quitó el `schedule` de `recolectar.yml`: ahora
solo lo lanza el despertador (o una ejecución manual). El repositorio es público desde el
2026-11-12 (detalle en `PLAN.md`, "Visibilidad del repositorio").

**Para ver la página:** doble clic en `ver_pagina.bat` (trae las mediciones, prepara
`web/datos.js`, que no va a git, y abre la página).

**Si un día faltan mediciones:** mirar el registro del Worker en Cloudflare
(*Observability*); lo más probable sería la clave (caducada o sin permiso).

**Pendiente de Bruno:** pedir a soporte de GitHub que borre la referencia del PR #1 (deja
alcanzable el primer commit, con su correo de Outlook); activar en GitHub "Keep my email
addresses private" y "Block command line pushes that expose my email".

**Hecho:**

- La página (`web/`) con dos estilos de Miami, conectada a los datos reales (tarea 1.6).
- Las tres claves están guardadas como secretos de GitHub (`TWITCH_CLIENT_ID`,
  `TWITCH_CLIENT_SECRET`, `YOUTUBE_API_KEY`).
- **Todas las fuentes probadas desde GitHub** con el workflow "Probar fuentes"
  (`recolector/probar_fuentes.py`, se lanza con `gh workflow run probar-fuentes.yml`):
  Twitch, YouTube, Google Trends, titulares, PlayStation y Xbox funcionan; Rockstar no.
  Ese archivo ya tiene escritas las consultas que el recolector debe reutilizar.
- Sistema de trabajo: relevo entre sesiones, guardado automático, archivo del estado a los
  20.000 bytes, reglas de trabajo, Graphify e Impeccable instalados.

**Ya se guardan datos reales** desde el 2026-11-12 (interés previo al lanzamiento). Se
apaga, enciende o alarga en `recolector/interruptor.json` (por defecto, hasta el 19 dic).

**Bruno entregó una lista de cosas que quiere** (2026-11-12): un mes de datos con interruptor
manual, análisis, Reddit, enlaces, miniaturas y varios cambios de diseño. Está ordenada en
`PLAN_DE_TRABAJO.md`, con avisos sobre los límites de algunas ideas. El punto D6 quedó
cortado: Bruno pidió ignorarlo por ahora.

**Fecha límite:** el recolector tiene que llevar días funcionando antes del 18 de noviembre
de 2026. Lanzamiento: 19 de noviembre, 00:00 de Santiago.

**Reglas en pausa:** ninguna. "Paso a paso con permiso" está activa **por tandas**: Bruno
dice qué pasos hacer y Claude no para hasta completarlos (ver `CLAUDE.md`). Tanda actual:
ninguna (la de la 7.4 terminó el 2026-11-13; solo falta el texto de Bruno).

## Últimos cambios

- 2026-11-13: cápsula del tiempo en la página, como dos postales de Miami (7.4, opción B de Bruno); falta su texto.
- 2026-11-13: hora cero con fuegos y reflectores (7.2) y escena de día, atardecer y noche según la hora de Miami (4.1 y 4.2).
- 2026-11-13: el recolector guarda el puesto de GTA en Twitch y las tendencias de YouTube (6.3, elegido por Bruno).
- 2026-11-13: Fase 7 (5 ideas aprobadas por Bruno), fechas "antes del 19 nov" y lista de pendientes ordenada.
- 2026-11-13: anotada la Fase 6 (más Trends, logros y comparaciones; pedido de Bruno) con avisos 7 y 8.
- 2026-11-13: Miami 2026 con la paleta B "Atardecer encendido" y torres en lila (3.1, elegida por Bruno).
- 2026-11-13: torres detrás de los hoteles con referencias reales de Miami (3.3, opción 2 de Bruno).
- 2026-11-13: revisada la clave de Reddit (hay que pedir permiso, ~7 días); Bruno la deja para después.
- 2026-11-13: `probar-fuentes.yml` sin Node.js 20 (checkout@v5, setup-python@v6) y regla nueva en `CLAUDE.md`.

## Pendiente

La lista completa y su orden están en `PLAN_DE_TRABAJO.md`. Resumen de lo que falta
(2026-11-13):

1. **Antes del 19 nov** (después ya no sirve):
   - 7.4 Cápsula del tiempo: la página está lista; **Bruno escribe sus expectativas** en `web/capsula.js`.
2. **Fase 4:** 4.3 análisis de datos, que necesita varios días de datos (4.1 y 4.2, hechas).
3. **Fase 6** (ideas de Bruno):
   - 6.1 más Google Trends;
   - 6.2 logros y récords;
   - 6.3 comparaciones con Twitch y YouTube.
4. **Fase 7** (ideas aprobadas):
   - 7.1 rebobinar;
   - 7.3 viaje en el tiempo;
   - 7.5 resumen del día.
   La 7.2 y la 7.4 están en el punto 1.
5. **Fase 5** (después del lanzamiento):
   - búsqueda calmada;
   - clave de Reddit.
6. **Ideas sueltas:** 2.5 TikTok (sin acceso fácil); D6 (Bruno pidió ignorarla por ahora).
7. **Bruno:**
   - pedir a soporte de GitHub que borre la referencia del PR #1 y activar el correo privado;
   - borrar las ramas ya unidas o de capturas: `revision/hora-cero`, `revision/dia-noche`,
     `claude/project-thread-dpdy9p`, `claude/project-thread-mi5ckb` y `claude/project-thread-odgsms`
     (revisado el 2026-11-13: no tienen nada que falte en `main`).
8. **Opcional:**
   - comprobar en Cloudflare que el Worker es igual a `despertador/worker.js`;
   - el hook de Impeccable (`npx impeccable install` en el PC).
