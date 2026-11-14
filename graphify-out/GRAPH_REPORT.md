# Graph Report - Documentaci-n-Gta-6-19-de-nombiembre  (2026-11-14)

## Corpus Check
- 39 files · ~52,818 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 3, .jsonl 3, .bat 1)

## Summary
- 526 nodes · 889 edges · 29 communities (16 shown, 13 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 97 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a08b6685`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Despertador y plan de trabajo
- Fuentes de datos (fuentes.py)
- Decisiones ya tomadas
- Resultado de las pruebas reales de fuentes (12 nov 2026)
- steps
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
- publicar
- generar_web.py

## God Nodes (most connected - your core abstractions)
1. `pintar()` - 24 edges
2. `Falla` - 22 edges
3. `pedir()` - 16 edges
4. `exigir()` - 16 edges
5. `Decisiones ya tomadas` - 14 edges
6. `a_iso()` - 13 edges
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

## Communities (29 total, 13 thin omitted)

### Community 0 - "Despertador y plan de trabajo"
Cohesion: 0.05
Nodes (51): Apagarlo, Comprobar que funciona, Cron Trigger 7,37 * * * * (UTC), Despertador del recolector (Cloudflare), Secreto GITHUB_TOKEN (solo Actions: Read and write, caduca 31 ene 2027), Montar el despertador (pasos en el navegador), Montarlo (lo hace Bruno en el navegador; no hace falta instalar nada), Semana del lanzamiento (SEMANA_INICIO / SEMANA_FIN) (+43 more)

### Community 1 - "Fuentes de datos (fuentes.py)"
Cohesion: 0.08
Nodes (27): Fase 6 — Ideas nuevas de Bruno: más estadísticas, logros y comparaciones, _cabeceras_twitch(), _fotos_de_perfil(), _mensaje_youtube(), noticias(), playstation(), reddit(), trends() (+19 more)

### Community 2 - "Decisiones ya tomadas"
Cohesion: 0.05
Nodes (39): Skill Impeccable (.claude/skills/impeccable/), Dónde quedamos (2026-11-13), Eje del gráfico de Twitch con números redondos, Fase 1 terminada (tareas 1.1 a 1.7), Secreto GITHUB_TOKEN del Worker (caduca 31 ene 2027 o ~1 mar 2027, por verificar), recolector/interruptor.json (apagar, encender o alargar; hasta 19 dic), Listas de la página con lo más nuevo arriba, Pendiente (fase 2 de PLAN_DE_TRABAJO, verificar Worker, hook Impeccable) (+31 more)

### Community 3 - "Resultado de las pruebas reales de fuentes (12 nov 2026)"
Cohesion: 0.06
Nodes (36): Entorno de nube recuerdo-gta6, Línea de estado .claude/hooks/estado-git.sh, .gitattributes fuerza LF en los .sh, Instrucciones para Claude (CLAUDE.md), Repositorio GitHub público Rust-max-bot/Documentaci-n-Gta-6-19-de-nombiembre (rama main), Hook Stop .claude/hooks/revisar-guardado.sh, Estado actual del proyecto (ESTADO_ACTUAL.md), Fecha límite: recolector funcionando antes del 18 nov 2026 (+28 more)

### Community 4 - "steps"
Cohesion: 0.12
Nodes (15): jobs, trends_extra, name, on, workflow_dispatch, permissions, contents, name (+7 more)

### Community 5 - "Generar la página (generar_web.py)"
Cohesion: 0.13
Nodes (10): main(), abrir(), preparar_salida(), main(), main(), recorrer(), fecha(), main() (+2 more)

### Community 6 - "Workflow Recolectar datos"
Cohesion: 0.09
Nodes (22): concurrency, cancel-in-progress, group, TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY, jobs, recolectar (+14 more)

### Community 7 - "Workflow Probar fuentes"
Cohesion: 0.07
Nodes (30): TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY, solo_trends_extra, jobs, probar, trends_extra, name (+22 more)

### Community 8 - "Código de la página (app.js)"
Cohesion: 0.08
Nodes (50): ahora(), aPantalla(), aplicar(), boton(), clave(), claveDia(), compacto(), cuadro() (+42 more)

### Community 9 - "Validaciones (validar.py)"
Cohesion: 0.12
Nodes (26): abortar(), comprobar(), comprobar_serie(), main(), paises(), preguntar(), relacionadas(), serie() (+18 more)

### Community 10 - "Trabajar con Claude en la nube"
Cohesion: 0.40
Nodes (4): Antes de empezar, Cómo ver lo que hace, Qué escribirle, Trabajar con Claude en la nube

### Community 11 - "Worker del despertador"
Cohesion: 0.43
Nodes (6): despertar(), fetch(), scheduled(), SEMANA_FIN, SEMANA_INICIO, tocaMedir()

### Community 27 - "Plan de trabajo"
Cohesion: 0.17
Nodes (11): Avisos para Bruno (cosas donde su idea tiene un límite o un fallo), Fase 0 — Claves y fuentes, Fase 1 — Recolector funcionando (lo más importante), Fase 2 — Mejoras rápidas, Fase 3 — Mejoras medianas, Fase 4 — Mejoras largas, Fase 5 — Lo que ya estaba acordado para después del lanzamiento, Fase 7 — Ideas para que la página sea memorable (+3 more)

### Community 28 - "Estado actual del proyecto"
Cohesion: 0.33
Nodes (5): Cómo usar este archivo, Dónde quedamos, Estado actual del proyecto, Pendiente, Últimos cambios

### Community 33 - "publicar"
Cohesion: 0.06
Nodes (37): concurrency, cancel-in-progress, group, name, url, jobs, preparar, publicar (+29 more)

### Community 34 - "generar_web.py"
Cohesion: 0.20
Nodes (11): abortar(), comprobar(), convertir(), escribir(), estado_servidor(), leer_mediciones(), main(), segundos() (+3 more)

## Knowledge Gaps
- **32 isolated node(s):** `Estado de Rockstar (anotado a mano en web/eventos.js)`, `Fallo del eje de Twitch (compacto() en web/app.js)`, `Reddit (A5)`, `Fase 5 — Búsqueda calmada tras el lanzamiento`, `Aviso legal (proyecto de fans, no afiliado a Rockstar/Take-Two)` (+27 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 206 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `compacto()` connect `Código de la página (app.js)` to `Despertador y plan de trabajo`, `Plan de trabajo`?**
  _High betweenness centrality (0.159) - this node is a cross-community bridge._
- **What connects `Estado de Rockstar (anotado a mano en web/eventos.js)`, `Fallo del eje de Twitch (compacto() en web/app.js)`, `Reddit (A5)` to the rest of the system?**
  _32 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Despertador y plan de trabajo` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Why does `Plan de trabajo` connect `Plan de trabajo` to `Fuentes de datos (fuentes.py)`?**
  _High betweenness centrality (0.146) - this node is a cross-community bridge._
- **Should `Fuentes de datos (fuentes.py)` be split into smaller, more focused modules?**
  _Cohesion score 0.07814207650273224 - nodes in this community are weakly interconnected._
- **Why does `Fase 6 — Ideas nuevas de Bruno: más estadísticas, logros y comparaciones` connect `Fuentes de datos (fuentes.py)` to `Plan de trabajo`?**
  _High betweenness centrality (0.138) - this node is a cross-community bridge._
- **Should `Decisiones ya tomadas` be split into smaller, more focused modules?**
  _Cohesion score 0.05052790346907994 - nodes in this community are weakly interconnected._