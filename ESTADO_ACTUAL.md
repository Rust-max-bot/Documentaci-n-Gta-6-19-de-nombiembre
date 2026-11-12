# Estado actual del proyecto

> Estado **vivo** y corto. Las reglas y la forma de trabajo están en `CLAUDE.md`; las
> decisiones, fases y riesgos, en `PLAN.md`. Al iniciar una sesión se lee este archivo entero.

## Cómo usar este archivo

- Se actualiza en el mismo commit del paso, solo si cambia el estado, un pendiente o
  "Dónde quedamos" (ver "Guardado al terminar cada paso" en `CLAUDE.md`). Nada de reglas aquí.
- **Tiene que seguir siendo corto.** "Últimos cambios" guarda unas 8 entradas de una línea;
  las viejas se borran porque ya están en `git log`.

## Dónde quedamos

*(2026-11-12.)*

**La página está hecha con datos de ejemplo** (`web/`, dos estilos de Miami: "Miami 1986" y
"Miami 2026"), pendiente de la opinión de Bruno. **Falta el recolector de datos y las claves**
de Twitch y YouTube. Las fuentes sin clave ya se probaron desde la nube (resultados en
`PLAN.md`, sección 5): Google Noticias, PlayStation, Xbox y Google Trends funcionan; Rockstar no.

El 2026-11-12 se descargó el repositorio en el PC de Bruno
(`%USERPROFILE%\Proyectos\Documentación Gta 6`), se instaló la skill Impeccable 0.1.22 en
`.claude/skills/impeccable/` (copia manual, sin el hook de diseño) y se armó este sistema de
relevo entre sesiones: este archivo, el inicio de sesión de `CLAUDE.md`, el guardado
automático y los avisos de `.claude/` (línea de estado y freno al terminar).

También el 2026-11-12 se instaló Graphify en el proyecto y se generó el primer grafo
(`graphify-out/graph.html` para verlo; 97 nodos, 11 grupos). El programa `graphify` vive en
Python 3.14 (no desinstalarlo) y su carpeta `Scripts` ya está en el PATH del PC; sus avisos
automáticos funcionan tras reiniciar VS Code.

**Fecha límite:** el recolector tiene que estar probado y unido a `main` antes del
18 de noviembre de 2026.

## Últimos cambios

- 2026-11-12: Graphify instalado en el proyecto y primer grafo generado (`graphify-out/`).
- 2026-11-12: sistema de relevo entre sesiones (`ESTADO_ACTUAL.md`, reglas de inicio y guardado, avisos en `.claude/`).
- 2026-11-12: skill Impeccable 0.1.22 en `.claude/skills/impeccable/`.
- 2026-11-12: pruebas reales de las fuentes sin clave (PR #1).
- 2026-11-12: página rediseñada con hoteles art déco de Miami.
- 2026-11-12: entrevista cerrada; `PLAN.md` y `GUIA_CLAVES.md` escritos.

## Pendiente

1. Bruno da su opinión sobre el diseño de la página.
2. Bruno crea las claves de Twitch y YouTube siguiendo `GUIA_CLAVES.md`.
3. Probar Twitch y YouTube con una consulta real (y repetir las otras fuentes desde GitHub).
4. Programar el recolector de datos (`recolector/`) y la ejecución programada cada 30 minutos.
5. Conectar la página con los datos reales (`web/datos.js`).
6. Prueba completa antes del 18 de noviembre.
7. Unir el trabajo a `main`.
8. Opcional: el hook de diseño de Impeccable (Bruno ejecuta `npx impeccable install` en el PC).
9. Graphify: tras cambiar código, `graphify update .` para mantener el grafo al día.
