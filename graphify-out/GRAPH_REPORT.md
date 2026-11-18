# Graph Report - Documentación Gta 6  (2026-11-17)

## Corpus Check
- 56 files · ~120,600 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: .jsonl 7, (none) 3, .bat 2)

## Summary
- 813 nodes · 1409 edges · 55 communities (38 shown, 17 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 119 edges (avg confidence: 0.88)
- Token cost: 183,861 input · 0 output

## Graph Freshness
- Built from commit: `254df9df`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Despertador y plan de trabajo
- fuentes.py
- Worker de Cloudflare despertador-recolector (horario 7,37 * * * *)
- Estado actual del proyecto (ESTADO_ACTUAL.md)
- steps
- Generar la página (generar_web.py)
- Workflow Recolectar datos
- Workflow Probar fuentes
- app.js
- trends_extra.py
- Trabajar con Claude en la nube
- Worker del despertador
- Graphify
- Línea de estado git
- Freno de guardado
- Instrucción Graphify
- Aviso de ejemplo
- Carga de scripts
- Sección titulares
- preparar-nube.sh
- pruebas/LEEME.md
- Estado actual del proyecto
- Decisiones ya tomadas
- Álbum de momentos (tarea 7.7)
- Plan de trabajo
- Estado actual del proyecto
- Diseño visual de la página
- steps
- Plan del proyecto: recuerdo del lanzamiento de GTA 6
- publicar
- Plan de trabajo
- generar_web.py
- Plan del proyecto: recuerdo del lanzamiento de GTA 6
- dia
- limpio
- Plan del proyecto (PLAN.md)
- Resultado de las pruebas reales de fuentes (12 nov 2026)
- sincronizar_datos.ps1
- pintar
- Hoteles
- dibujar
- flechasShorts
- Diseño Miami con dos estilos (Miami 2026 y Miami años 80)
- Estructura de carpetas (web/, recolector/, datos/, .github/workflows/, despertador/)
- Guardar claves en GitHub Secrets (TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY)
- Plan de trabajo
- pintar
- fuegos
- resumen

## God Nodes (most connected - your core abstractions)
1. `Falla` - 25 edges
2. `pintar()` - 24 edges
3. `Hoteles` - 23 edges
4. `pedir()` - 19 edges
5. `Dibujo` - 17 edges
6. `exigir()` - 17 edges
7. `dia()` - 16 edges
8. `n()` - 14 edges
9. `Decisiones ya tomadas` - 14 edges
10. `youtube_es()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `Fase 6 — Ideas nuevas de Bruno: más estadísticas, logros y comparaciones (lo que queda)` --references--> `kick()`  [INFERRED]
  historial/PLAN_DE_TRABAJO_2026-11-16.md → recolector/fuentes.py
- `Pendiente` --references--> `partes()`  [INFERRED]
  historial/ESTADO_2026-11-17.md → web/app.js
- `Fase 1 — Recolector funcionando (lo más importante)` --references--> `compacto()`  [INFERRED]
  historial/PLAN_DE_TRABAJO_2026-11-13.md → web/app.js
- `Antes o justo después del lanzamiento` --references--> `partes()`  [INFERRED]
  historial/PLAN_2026-11-17-2.md → web/app.js
- `Antes o justo después del lanzamiento` --references--> `partes()`  [INFERRED]
  historial/PLAN_2026-11-17.md → web/app.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Fuentes de datos probadas del recolector** — plan_fuente_twitch, plan_fuente_youtube, plan_fuente_google_trends, plan_fuente_estado_servidores, plan_fuente_titulares, plan_fuente_estado_rockstar [EXTRACTED 1.00]
- **Archivos y reglas del sistema de relevo entre sesiones** — claude_sistema_relevo, claude_fuentes_de_verdad, estado_actual_estado_actual, plan_plan_del_proyecto, claude_guardado_al_terminar_paso, claude_archivar_estado_actual [EXTRACTED 1.00]
- **Flujo de claves: crear en Twitch/YouTube y guardar en GitHub Secrets** — guia_claves_clave_twitch, guia_claves_clave_youtube, guia_claves_github_secrets, estado_actual_secretos_github, claude_claves_fuera_del_repo [INFERRED 0.85]
- **Garantías de no inventar datos al guardar mediciones** — recolector_leeme_hueco, recolector_leeme_comprobaciones, recolector_leeme_formato_linea_jsonl, recolector_leeme_interruptor [INFERRED 0.85]
- **Implementación de los dos estilos de Miami** — plan_diseno_miami_dos_estilos, web_index_escena_80, web_index_escena_26, web_index_boton_cambio_estilo, web_index_simbolo_edificios, web_index_simbolo_palmera [INFERRED 0.95]

## Communities (55 total, 17 thin omitted)

### Community 0 - "Despertador y plan de trabajo"
Cohesion: 0.09
Nodes (28): Apagarlo, Comprobar que funciona, Cron Trigger 7,37 * * * * (UTC), Despertador del recolector (Cloudflare), Secreto GITHUB_TOKEN (solo Actions: Read and write, caduca 31 ene 2027), Montar el despertador (pasos en el navegador), Montarlo (lo hace Bruno en el navegador; no hace falta instalar nada), Semana del lanzamiento (SEMANA_INICIO / SEMANA_FIN) (+20 more)

### Community 1 - "fuentes.py"
Cohesion: 0.06
Nodes (39): Dónde quedamos, Diseño de la página, Fase 6 — Ideas nuevas de Bruno: más estadísticas, logros y comparaciones, Fase 6 — Ideas nuevas de Bruno: más estadísticas, logros y comparaciones, _cabeceras_twitch(), _datos_video(), _foto_kick(), _fotos_de_perfil() (+31 more)

### Community 2 - "Worker de Cloudflare despertador-recolector (horario 7,37 * * * *)"
Cohesion: 0.13
Nodes (16): Skill Impeccable (.claude/skills/impeccable/), Dónde quedamos (2026-11-13), Eje del gráfico de Twitch con números redondos, Fase 1 terminada (tareas 1.1 a 1.7), Secreto GITHUB_TOKEN del Worker (caduca 31 ene 2027 o ~1 mar 2027, por verificar), Pendiente (fase 2 de PLAN_DE_TRABAJO, verificar Worker, hook Impeccable), Pendiente de Bruno: borrar referencia del PR #1 y activar correo privado, recolectar.yml sin schedule (solo despertador o manual) (+8 more)

### Community 3 - "Estado actual del proyecto (ESTADO_ACTUAL.md)"
Cohesion: 0.15
Nodes (8): Línea de estado .claude/hooks/estado-git.sh, .gitattributes fuerza LF en los .sh, Instrucciones para Claude (CLAUDE.md), Repositorio GitHub público Rust-max-bot/Documentaci-n-Gta-6-19-de-nombiembre (rama main), Hook Stop .claude/hooks/revisar-guardado.sh, Estado actual del proyecto (ESTADO_ACTUAL.md), Reglas en pausa: ninguna; tanda actual: ninguna, Últimos cambios

### Community 4 - "steps"
Cohesion: 0.07
Nodes (27): concurrency, cancel-in-progress, group, previa, jobs, trends_extra, name, on (+19 more)

### Community 5 - "Generar la página (generar_web.py)"
Cohesion: 0.11
Nodes (14): escena(), hacer(), main(), titulo(), main(), abrir(), preparar_salida(), main() (+6 more)

### Community 6 - "Workflow Recolectar datos"
Cohesion: 0.08
Nodes (24): concurrency, cancel-in-progress, group, KICK_CLIENT_ID, KICK_CLIENT_SECRET, TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY (+16 more)

### Community 7 - "Workflow Probar fuentes"
Cohesion: 0.07
Nodes (32): KICK_CLIENT_ID, KICK_CLIENT_SECRET, TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY, solo_trends_extra, jobs, probar (+24 more)

### Community 8 - "app.js"
Cohesion: 0.11
Nodes (23): abrir(), aplicar(), clase(), claveDia(), diaUTC(), estado(), fijar(), horaDeMiami() (+15 more)

### Community 9 - "trends_extra.py"
Cohesion: 0.12
Nodes (27): abortar(), comprobar(), comprobar_serie(), main(), paises(), preguntar(), relacionadas(), serie() (+19 more)

### Community 10 - "Trabajar con Claude en la nube"
Cohesion: 0.40
Nodes (4): Antes de empezar, Cómo ver lo que hace, Qué escribirle, Trabajar con Claude en la nube

### Community 11 - "Worker del despertador"
Cohesion: 0.31
Nodes (8): despertar(), fetch(), scheduled(), SEMANA_FIN, SEMANA_INICIO, tocaMedir(), TRENDS_FIN, TRENDS_INICIO

### Community 23 - "Estado actual del proyecto"
Cohesion: 0.40
Nodes (4): Cómo usar este archivo, Estado actual del proyecto, Pendiente, Últimos cambios

### Community 24 - "Decisiones ya tomadas"
Cohesion: 0.15
Nodes (10): Listas de la página con lo más nuevo arriba, Criterios para saber si salió bien, Decisiones ya tomadas, Eventos de la línea de tiempo: automáticos y escritos a mano, Formato window.DATOS igual a window.DATOS_EJEMPLO, Orden de las listas: lo más nuevo arriba (2026-11-13), Tecnología: Python recolecta, HTML/CSS/JS forman la página, Visibilidad de la página: privada, se abre como archivo en el PC (+2 more)

### Community 25 - "Álbum de momentos (tarea 7.7)"
Cohesion: 0.50
Nodes (3): Cuidado, Cómo subir una foto, Álbum de momentos (tarea 7.7)

### Community 27 - "Plan de trabajo"
Cohesion: 0.17
Nodes (11): Avisos para Bruno (cosas donde su idea tiene un límite o un fallo), Fase 0 — Claves y fuentes, Fase 1 — Recolector funcionando (lo más importante), Fase 2 — Mejoras rápidas, Fase 3 — Mejoras medianas, Fase 4 — Mejoras largas, Fase 5 — Lo que ya estaba acordado para después del lanzamiento, Fase 7 — Ideas para que la página sea memorable (+3 more)

### Community 28 - "Estado actual del proyecto"
Cohesion: 0.33
Nodes (5): Cómo usar este archivo, Dónde quedamos, Estado actual del proyecto, Pendiente, Últimos cambios

### Community 30 - "Diseño visual de la página"
Cohesion: 0.13
Nodes (14): 1. Qué es la página, 2. Reglas que cualquier sugerencia tiene que respetar, 3. Estructura de la página, de arriba abajo, 4. Los dos estilos, 4b. Los hoteles de la portada (rediseño del 2026-11-17), 5. Día, atardecer y noche, 6. La "hora cero" (el momento del lanzamiento), 7. Letras, colores y medidas (+6 more)

### Community 31 - "steps"
Cohesion: 0.11
Nodes (18): KICK_CLIENT_ID, KICK_CLIENT_SECRET, jobs, probar, name, on, workflow_dispatch, permissions (+10 more)

### Community 32 - "Plan del proyecto: recuerdo del lanzamiento de GTA 6"
Cohesion: 0.12
Nodes (16): 10. Criterios para saber si salió bien, 1. Qué es esto, 2. Decisiones ya tomadas, 3. Qué se descartó y por qué, 4. Fases del proyecto, 5. Qué se mide en cada fuente, 6. Riesgos conocidos, 7. Decisiones pendientes (+8 more)

### Community 33 - "publicar"
Cohesion: 0.05
Nodes (38): concurrency, cancel-in-progress, group, name, url, jobs, preparar, publicar (+30 more)

### Community 34 - "Plan de trabajo"
Cohesion: 0.17
Nodes (11): Avisos para Bruno (cosas donde su idea tiene un límite o un fallo), Fase 2 — Mejoras rápidas (lo que queda), Fase 4 — Mejoras largas (lo que queda), Fase 5 — Lo que ya estaba acordado para después del lanzamiento, Fase 6 — Ideas nuevas de Bruno: más estadísticas, logros y comparaciones (lo que queda), Fase 7 — Ideas para que la página sea memorable (lo que queda), Fase 8 — Segundo lanzamiento: GTA 6 en PC (dormida), Fechas que mandan (+3 more)

### Community 35 - "generar_web.py"
Cohesion: 0.10
Nodes (20): abortar(), comprobar(), convertir(), elegir_videos(), escribir(), estado_servidor(), hora_de_medicion(), horas_trends() (+12 more)

### Community 36 - "Plan del proyecto: recuerdo del lanzamiento de GTA 6"
Cohesion: 0.06
Nodes (34): Antes o justo después del lanzamiento, Cómo se usa este archivo, Datos y recolección, Decisiones vigentes, Después del lanzamiento, Estructura de carpetas, Fase 8 — Segundo lanzamiento: GTA 6 en PC (dormida), Fechas que mandan (+26 more)

### Community 37 - "dia"
Cohesion: 0.19
Nodes (16): ahora(), cuando(), cuenta(), desfase(), dia(), estadoRev(), filaRockstar(), dibujar() (+8 more)

### Community 38 - "limpio"
Cohesion: 0.22
Nodes (15): armar(), cuenta(), juego(), cinta(), compacto(), enlace(), fila(), foto() (+7 more)

### Community 39 - "Plan del proyecto (PLAN.md)"
Cohesion: 0.16
Nodes (13): Fecha límite: recolector funcionando antes del 18 nov 2026, Lista de deseos de Bruno (2026-11-12), D6 cortado, Fase 1: en tiempo real (18 al 20 nov), Fase 2: búsqueda calmada (historial, memes, ventas), Fuente Google Trends (método no oficial en tres pasos con cookie), Fuente YouTube (search 100 unidades, videos 1, de 10.000 diarias), Plan del proyecto (PLAN.md), Recuerdo del lanzamiento de GTA 6 (19 nov 2026): página con línea de tiempo y tablas (+5 more)

### Community 40 - "Resultado de las pruebas reales de fuentes (12 nov 2026)"
Cohesion: 0.24
Nodes (10): Entorno de nube recuerdo-gta6, Workflow Probar fuentes (recolector/probar_fuentes.py), Estado de Rockstar: no funciona (se anota a mano), Fuente estado de servidores (PlayStation y Xbox funcionan), Fuente titulares de Google Noticias (RSS), Fuente Twitch (categoría Grand Theft Auto VI, id 1867279146, helix/streams), Resultado de las pruebas reales de fuentes (12 nov 2026), Gráfico espectadores Twitch (#g-twitch) (+2 more)

### Community 42 - "pintar"
Cohesion: 0.20
Nodes (12): deSantiago(), hace(), lineaDeTiempo(), nombreDia(), num(), paso(), pintar(), pintarFiltro() (+4 more)

### Community 43 - "Hoteles"
Cohesion: 0.07
Nodes (17): antena(), bezier(), bloque(), caseta(), Dibujo, Hoteles, junta(), main() (+9 more)

### Community 44 - "dibujar"
Cohesion: 0.27
Nodes (10): aPantalla(), conLetras(), cuadrosImagen(), dibujar(), el(), historica(), recortar(), seleccion() (+2 more)

### Community 46 - "Diseño Miami con dos estilos (Miami 2026 y Miami años 80)"
Cohesion: 0.24
Nodes (8): Diseño Miami con dos estilos (Miami 2026 y Miami años 80), Tipografías Google Fonts: Monoton, Rajdhani, Limelight y Outfit, Botón de cambio de estilo (data-poner), Escena Miami actual, Escena Miami años 80, web/index.html (página del recuerdo), Símbolo SVG edificios art déco, Símbolo SVG palmera

### Community 47 - "Estructura de carpetas (web/, recolector/, datos/, .github/workflows/, despertador/)"
Cohesion: 0.29
Nodes (5): recolector/interruptor.json (apagar, encender o alargar; hasta 19 dic), ver_pagina.bat (trae mediciones, prepara web/datos.js y abre la página), Estructura de carpetas (web/, recolector/, datos/, .github/workflows/, despertador/), Periodo de un mes hasta el 19 dic 2026 con interruptor manual, web/datos.js generado por recolector/generar_web.py (no va a git)

### Community 48 - "Guardar claves en GitHub Secrets (TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY)"
Cohesion: 0.43
Nodes (5): Secretos de GitHub TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY guardados, Clave de Twitch (Client ID y Client Secret, dev.twitch.tv), Clave de API de YouTube Data API v3 (Google Cloud), Guardar claves en GitHub Secrets (TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY), Guía para crear las claves de Twitch y YouTube

### Community 49 - "Plan de trabajo"
Cohesion: 0.20
Nodes (9): Avisos para Bruno (cosas donde su idea tiene un límite o un fallo), Fase 2 — Mejoras rápidas (lo que queda), Fase 4 — Mejoras largas (lo que queda), Fase 5 — Lo que ya estaba acordado para después del lanzamiento, Fase 7 — Ideas para que la página sea memorable, Fechas que mandan, Lo ya hecho (detalle en el historial), Plan de trabajo (+1 more)

### Community 50 - "pintar"
Cohesion: 0.33
Nodes (7): contenido(), filas(), flechaHTML(), ico(), lineaNueva(), pasa(), pintar()

### Community 51 - "fuegos"
Cohesion: 0.29
Nodes (5): 8. Dónde está cada cosa (por si quien ayuda puede leer código), cuadro(), fuegos(), horaCero(), reflectores()

### Community 52 - "resumen"
Cohesion: 0.50
Nodes (4): clave(), lideresDe(), resumen(), urlVideo()

## Knowledge Gaps
- **31 isolated node(s):** `Estilos visuales Miami 1986 y Miami 2026`, `Enlaces y miniaturas guardados (tareas 2.1 y 2.2)`, `Series continuas de YouTube (25 más vistos + re-medición)`, `Aviso legal (proyecto de fans, no afiliado a Rockstar/Take-Two)`, `Python 3.14 para Graphify (no desinstalar)` (+26 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 348 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Diseño de la página` connect `fuentes.py` to `Plan del proyecto: recuerdo del lanzamiento de GTA 6`, `limpio`?**
  _High betweenness centrality (0.154) - this node is a cross-community bridge._
- **What connects `Estilos visuales Miami 1986 y Miami 2026`, `Enlaces y miniaturas guardados (tareas 2.1 y 2.2)`, `Series continuas de YouTube (25 más vistos + re-medición)` to the rest of the system?**
  _31 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Despertador y plan de trabajo` be split into smaller, more focused modules?**
  _Cohesion score 0.08817204301075268 - nodes in this community are weakly interconnected._
- **Why does `limpio()` connect `limpio` to `app.js`, `fuentes.py`, `pintar`, `pintar`?**
  _High betweenness centrality (0.138) - this node is a cross-community bridge._
- **Should `fuentes.py` be split into smaller, more focused modules?**
  _Cohesion score 0.05636114911080711 - nodes in this community are weakly interconnected._
- **Should `Worker de Cloudflare despertador-recolector (horario 7,37 * * * *)` be split into smaller, more focused modules?**
  _Cohesion score 0.1286549707602339 - nodes in this community are weakly interconnected._
- **Should `steps` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._