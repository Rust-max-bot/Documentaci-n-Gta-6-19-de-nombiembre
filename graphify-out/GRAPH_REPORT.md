# Graph Report - Documentaci-n-Gta-6-19-de-nombiembre  (2026-11-13)

## Corpus Check
- 37 files · ~44,391 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 3, .jsonl 2, .bat 1)

## Summary
- 448 nodes · 765 edges · 27 communities (14 shown, 13 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 94 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e0eeaaf2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Despertador y plan de trabajo
- Fuentes de datos (fuentes.py)
- Reglas de datos y estado actual
- Claves y fases del plan
- Diseño Miami con dos estilos (Miami 2026 y Miami años 80)
- Generar la página (generar_web.py)
- Workflow Recolectar datos
- Workflow Probar fuentes
- Código de la página (app.js)
- Validaciones (validar.py)
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
- Plan de trabajo
- Estado actual del proyecto

## God Nodes (most connected - your core abstractions)
1. `Falla` - 22 edges
2. `pedir()` - 16 edges
3. `exigir()` - 16 edges
4. `Decisiones ya tomadas` - 14 edges
5. `a_iso()` - 13 edges
6. `pintar()` - 13 edges
7. `Plan de trabajo` - 13 edges
8. `Recolector` - 13 edges
9. `Plan del proyecto (PLAN.md)` - 13 edges
10. `es_entero()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Fase 1 — Recolector funcionando (lo más importante)` --references--> `compacto()`  [INFERRED]
  historial/PLAN_DE_TRABAJO_2026-11-13.md → web/app.js
- `Fase 1 — Recolector funcionando (lo más importante)` --references--> `compacto()`  [INFERRED]
  PLAN_DE_TRABAJO.md → web/app.js
- `Fase 6 — Ideas nuevas de Bruno: más estadísticas, logros y comparaciones` --references--> `twitch_ranking()`  [INFERRED]
  historial/PLAN_DE_TRABAJO_2026-11-13.md → recolector/fuentes.py
- `Fase 6 — Ideas nuevas de Bruno: más estadísticas, logros y comparaciones` --references--> `youtube_tendencias()`  [INFERRED]
  historial/PLAN_DE_TRABAJO_2026-11-13.md → recolector/fuentes.py
- `Horario de medición (cada hora; cada 30 min del 17 al 21 nov)` --semantically_similar_to--> `Semana del lanzamiento (SEMANA_INICIO / SEMANA_FIN)`  [INFERRED] [semantically similar]
  README.md → despertador/LEEME.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Cadena completa: despertador → GitHub → datos/ → generar_web.py → página** — despertador_leeme_worker_despertador_recolector, recolector_leeme_recolector, recolector_leeme_formato_linea_jsonl, recolector_leeme_de_datos_a_la_pagina, readme_ver_pagina_bat [EXTRACTED 1.00]
- **Fuentes de datos probadas del recolector** — plan_fuente_twitch, plan_fuente_youtube, plan_fuente_google_trends, plan_fuente_estado_servidores, plan_fuente_titulares, plan_fuente_estado_rockstar [EXTRACTED 1.00]
- **Archivos y reglas del sistema de relevo entre sesiones** — claude_sistema_relevo, claude_fuentes_de_verdad, estado_actual_estado_actual, plan_plan_del_proyecto, claude_guardado_al_terminar_paso, claude_archivar_estado_actual [EXTRACTED 1.00]
- **Flujo de claves: crear en Twitch/YouTube y guardar en GitHub Secrets** — guia_claves_clave_twitch, guia_claves_clave_youtube, guia_claves_github_secrets, estado_actual_secretos_github, claude_claves_fuera_del_repo [INFERRED 0.85]
- **Horario de medición (cada hora, cada 30 min la semana del lanzamiento)** — readme_horario_medicion, despertador_leeme_cron_trigger, despertador_leeme_semana_lanzamiento, plan_de_trabajo_tarea_1_4_ejecucion_programada [INFERRED 0.85]
- **Garantías de no inventar datos al guardar mediciones** — recolector_leeme_hueco, recolector_leeme_comprobaciones, recolector_leeme_formato_linea_jsonl, recolector_leeme_interruptor [INFERRED 0.85]
- **Implementación de los dos estilos de Miami** — plan_diseno_miami_dos_estilos, web_index_escena_80, web_index_escena_26, web_index_boton_cambio_estilo, web_index_simbolo_edificios, web_index_simbolo_palmera [INFERRED 0.95]

## Communities (27 total, 13 thin omitted)

### Community 0 - "Despertador y plan de trabajo"
Cohesion: 0.05
Nodes (50): Apagarlo, Comprobar que funciona, Cron Trigger 7,37 * * * * (UTC), Despertador del recolector (Cloudflare), Secreto GITHUB_TOKEN (solo Actions: Read and write, caduca 31 ene 2027), Montar el despertador (pasos en el navegador), Montarlo (lo hace Bruno en el navegador; no hace falta instalar nada), Semana del lanzamiento (SEMANA_INICIO / SEMANA_FIN) (+42 more)

### Community 1 - "Fuentes de datos (fuentes.py)"
Cohesion: 0.06
Nodes (35): Fase 6 — Ideas nuevas de Bruno: más estadísticas, logros y comparaciones, _cabeceras_twitch(), _fotos_de_perfil(), _mensaje_youtube(), noticias(), playstation(), reddit(), trends() (+27 more)

### Community 2 - "Reglas de datos y estado actual"
Cohesion: 0.05
Nodes (36): Skill Impeccable (.claude/skills/impeccable/), Dónde quedamos (2026-11-13), Eje del gráfico de Twitch con números redondos, Fase 1 terminada (tareas 1.1 a 1.7), Secreto GITHUB_TOKEN del Worker (caduca 31 ene 2027 o ~1 mar 2027, por verificar), recolector/interruptor.json (apagar, encender o alargar; hasta 19 dic), Listas de la página con lo más nuevo arriba, Pendiente (fase 2 de PLAN_DE_TRABAJO, verificar Worker, hook Impeccable) (+28 more)

### Community 3 - "Claves y fases del plan"
Cohesion: 0.07
Nodes (31): Entorno de nube recuerdo-gta6, Línea de estado .claude/hooks/estado-git.sh, .gitattributes fuerza LF en los .sh, Instrucciones para Claude (CLAUDE.md), Repositorio GitHub público Rust-max-bot/Documentaci-n-Gta-6-19-de-nombiembre (rama main), Hook Stop .claude/hooks/revisar-guardado.sh, Estado actual del proyecto (ESTADO_ACTUAL.md), Fecha límite: recolector funcionando antes del 18 nov 2026 (+23 more)

### Community 4 - "Diseño Miami con dos estilos (Miami 2026 y Miami años 80)"
Cohesion: 0.24
Nodes (8): Diseño Miami con dos estilos (Miami 2026 y Miami años 80), Tipografías Google Fonts: Monoton, Rajdhani, Limelight y Outfit, Botón de cambio de estilo (data-poner), Escena Miami actual, Escena Miami años 80, web/index.html (página del recuerdo), Símbolo SVG edificios art déco, Símbolo SVG palmera

### Community 5 - "Generar la página (generar_web.py)"
Cohesion: 0.09
Nodes (17): main(), abrir(), preparar_salida(), main(), main(), recorrer(), abortar(), comprobar() (+9 more)

### Community 6 - "Workflow Recolectar datos"
Cohesion: 0.09
Nodes (22): concurrency, cancel-in-progress, group, TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY, jobs, recolectar (+14 more)

### Community 7 - "Workflow Probar fuentes"
Cohesion: 0.07
Nodes (30): TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY, solo_trends_extra, jobs, probar, trends_extra, name (+22 more)

### Community 8 - "Código de la página (app.js)"
Cohesion: 0.09
Nodes (37): Fase 1 — Recolector funcionando (lo más importante), Fase 1 — Recolector funcionando (lo más importante), ahora(), aPantalla(), boton(), compacto(), cuadro(), cuando() (+29 more)

### Community 9 - "Validaciones (validar.py)"
Cohesion: 0.23
Nodes (18): comprobar(), comprobar_serie(), a_fecha(), es_entero(), es_iso(), exigir(), Invalida, medicion() (+10 more)

### Community 10 - "Trabajar con Claude en la nube"
Cohesion: 0.40
Nodes (4): Antes de empezar, Cómo ver lo que hace, Qué escribirle, Trabajar con Claude en la nube

### Community 11 - "Worker del despertador"
Cohesion: 0.43
Nodes (6): despertar(), fetch(), scheduled(), SEMANA_FIN, SEMANA_INICIO, tocaMedir()

### Community 27 - "Plan de trabajo"
Cohesion: 0.18
Nodes (10): Avisos para Bruno (cosas donde su idea tiene un límite o un fallo), Fase 0 — Claves y fuentes, Fase 2 — Mejoras rápidas, Fase 3 — Mejoras medianas, Fase 4 — Mejoras largas, Fase 5 — Lo que ya estaba acordado para después del lanzamiento, Fase 7 — Ideas para que la página sea memorable, Fechas que mandan (+2 more)

### Community 28 - "Estado actual del proyecto"
Cohesion: 0.33
Nodes (5): Cómo usar este archivo, Dónde quedamos, Estado actual del proyecto, Pendiente, Últimos cambios

## Knowledge Gaps
- **32 isolated node(s):** `Estado de Rockstar (anotado a mano en web/eventos.js)`, `Fallo del eje de Twitch (compacto() en web/app.js)`, `Reddit (A5)`, `Fase 5 — Búsqueda calmada tras el lanzamiento`, `Aviso legal (proyecto de fans, no afiliado a Rockstar/Take-Two)` (+27 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 170 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Plan de trabajo` connect `Plan de trabajo` to `Código de la página (app.js)`, `Fuentes de datos (fuentes.py)`?**
  _High betweenness centrality (0.168) - this node is a cross-community bridge._
- **What connects `Estado de Rockstar (anotado a mano en web/eventos.js)`, `Fallo del eje de Twitch (compacto() en web/app.js)`, `Reddit (A5)` to the rest of the system?**
  _32 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Despertador y plan de trabajo` be split into smaller, more focused modules?**
  _Cohesion score 0.05117845117845118 - nodes in this community are weakly interconnected._
- **Why does `Fase 6 — Ideas nuevas de Bruno: más estadísticas, logros y comparaciones` connect `Fuentes de datos (fuentes.py)` to `Plan de trabajo`?**
  _High betweenness centrality (0.157) - this node is a cross-community bridge._
- **Should `Fuentes de datos (fuentes.py)` be split into smaller, more focused modules?**
  _Cohesion score 0.063568010936432 - nodes in this community are weakly interconnected._
- **Should `Reglas de datos y estado actual` be split into smaller, more focused modules?**
  _Cohesion score 0.05442176870748299 - nodes in this community are weakly interconnected._
- **Should `Claves y fases del plan` be split into smaller, more focused modules?**
  _Cohesion score 0.06533776301218161 - nodes in this community are weakly interconnected._