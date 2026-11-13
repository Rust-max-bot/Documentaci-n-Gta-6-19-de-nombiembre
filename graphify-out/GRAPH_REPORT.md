# Graph Report - Documentación Gta 6  (2026-11-13)

## Corpus Check
- 26 files · ~22,885 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 3, .jsonl 2, .bat 1)

## Summary
- 331 nodes · 517 edges · 24 communities (14 shown, 10 thin omitted)
- Extraction: 85% EXTRACTED · 15% INFERRED · 0% AMBIGUOUS · INFERRED: 77 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `29b1a279`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Despertador y plan de trabajo
- Fuentes de datos (fuentes.py)
- Reglas de datos y estado actual
- Claves y fases del plan
- Relevo y forma de trabajo
- Generar la página (generar_web.py)
- Workflow Recolectar datos
- Workflow Probar fuentes
- Código de la página (app.js)
- Validaciones (validar.py)
- Diseño Miami y estilos
- Worker del despertador
- Graphify
- Línea de estado git
- Freno de guardado
- Instrucción Graphify
- Aviso de ejemplo
- Carga de scripts
- Sección titulares
- Plan de trabajo
- revisar.py

## God Nodes (most connected - your core abstractions)
1. `Falla` - 15 edges
2. `Decisiones ya tomadas` - 14 edges
3. `Plan de trabajo` - 13 edges
4. `Recolector` - 13 edges
5. `Plan del proyecto (PLAN.md)` - 13 edges
6. `Despertador del recolector (Cloudflare)` - 12 edges
7. `main()` - 11 edges
8. `dibujar()` - 9 edges
9. `pintar()` - 9 edges
10. `pedir()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Fase 1 — Recolector funcionando (lo más importante)` --references--> `compacto()`  [INFERRED]
  PLAN_DE_TRABAJO.md → web/app.js
- `Horario de medición (cada hora; cada 30 min del 17 al 21 nov)` --semantically_similar_to--> `Semana del lanzamiento (SEMANA_INICIO / SEMANA_FIN)`  [INFERRED] [semantically similar]
  README.md → despertador/LEEME.md
- `Aviso: base de datos SQL frente a archivos de texto` --rationale_for--> `Formato de cada línea (datos/AAAA-MM-DD.jsonl, horas UTC)`  [INFERRED]
  PLAN_DE_TRABAJO.md → recolector/LEEME.md
- `Botón de cambio de estilo (data-poner)` --implements--> `Diseño Miami con dos estilos (Miami 2026 y Miami años 80)`  [INFERRED]
  web/index.html → PLAN.md
- `Sección línea de tiempo (#linea)` --implements--> `Decisiones ya tomadas`  [INFERRED]
  web/index.html → PLAN.md

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

## Communities (24 total, 10 thin omitted)

### Community 0 - "Despertador y plan de trabajo"
Cohesion: 0.07
Nodes (37): Apagarlo, Comprobar que funciona, Cron Trigger 7,37 * * * * (UTC), Despertador del recolector (Cloudflare), Secreto GITHUB_TOKEN (solo Actions: Read and write, caduca 31 ene 2027), Montar el despertador (pasos en el navegador), Montarlo (lo hace Bruno en el navegador; no hace falta instalar nada), Semana del lanzamiento (SEMANA_INICIO / SEMANA_FIN) (+29 more)

### Community 1 - "Fuentes de datos (fuentes.py)"
Cohesion: 0.10
Nodes (20): _fotos_de_perfil(), _mensaje_youtube(), noticias(), playstation(), trends(), twitch(), xbox(), youtube() (+12 more)

### Community 2 - "Reglas de datos y estado actual"
Cohesion: 0.06
Nodes (32): Skill Impeccable (.claude/skills/impeccable/), Repositorio GitHub público Rust-max-bot/Documentaci-n-Gta-6-19-de-nombiembre (rama main), Dónde quedamos (2026-11-13), Eje del gráfico de Twitch con números redondos, Fase 1 terminada (tareas 1.1 a 1.7), Secreto GITHUB_TOKEN del Worker (caduca 31 ene 2027 o ~1 mar 2027, por verificar), recolector/interruptor.json (apagar, encender o alargar; hasta 19 dic), Listas de la página con lo más nuevo arriba (+24 more)

### Community 3 - "Claves y fases del plan"
Cohesion: 0.11
Nodes (23): Entorno de nube recuerdo-gta6, Fecha límite: recolector funcionando antes del 18 nov 2026, Workflow Probar fuentes (recolector/probar_fuentes.py), Secretos de GitHub TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY guardados, Clave de Twitch (Client ID y Client Secret, dev.twitch.tv), Clave de API de YouTube Data API v3 (Google Cloud), Guardar claves en GitHub Secrets (TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY), Guía para crear las claves de Twitch y YouTube (+15 more)

### Community 4 - "Relevo y forma de trabajo"
Cohesion: 0.13
Nodes (12): Línea de estado .claude/hooks/estado-git.sh, .gitattributes fuerza LF en los .sh, Instrucciones para Claude (CLAUDE.md), Hook Stop .claude/hooks/revisar-guardado.sh, Estado actual del proyecto (ESTADO_ACTUAL.md), Lista de deseos de Bruno (2026-11-12), D6 cortado, Reglas en pausa: ninguna; tanda actual: ninguna, Últimos cambios (+4 more)

### Community 5 - "Generar la página (generar_web.py)"
Cohesion: 0.30
Nodes (7): abortar(), comprobar(), convertir(), estado_servidor(), leer_mediciones(), main(), ultima_hora_completa()

### Community 6 - "Workflow Recolectar datos"
Cohesion: 0.09
Nodes (22): concurrency, cancel-in-progress, group, TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY, jobs, recolectar (+14 more)

### Community 7 - "Workflow Probar fuentes"
Cohesion: 0.10
Nodes (19): TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY, jobs, probar, name, on, workflow_dispatch (+11 more)

### Community 8 - "Código de la página (app.js)"
Cohesion: 0.19
Nodes (17): compacto(), deSantiago(), desfase(), dia(), enlace(), foto(), grafico(), dibujar() (+9 more)

### Community 9 - "Validaciones (validar.py)"
Cohesion: 0.28
Nodes (11): a_fecha(), es_entero(), es_iso(), exigir(), Invalida, medicion(), _noticias(), _servidor() (+3 more)

### Community 10 - "Diseño Miami y estilos"
Cohesion: 0.24
Nodes (8): Diseño Miami con dos estilos (Miami 2026 y Miami años 80), Tipografías Google Fonts: Monoton, Rajdhani, Limelight y Outfit, Botón de cambio de estilo (data-poner), Escena Miami actual, Escena Miami años 80, web/index.html (página del recuerdo), Símbolo SVG edificios art déco, Símbolo SVG palmera

### Community 11 - "Worker del despertador"
Cohesion: 0.43
Nodes (6): despertar(), fetch(), scheduled(), SEMANA_FIN, SEMANA_INICIO, tocaMedir()

### Community 21 - "Plan de trabajo"
Cohesion: 0.14
Nodes (14): Avisos para Bruno (cosas donde su idea tiene un límite o un fallo), Fase 0 — Claves y fuentes, Fase 1 — Recolector funcionando (lo más importante), Fase 2 — Mejoras rápidas (enlaces, miniaturas, suelo y sol de 1986), Fase 2 — Mejoras rápidas, Fase 3 — Mejoras medianas, Fase 4 — Mejoras largas, Fase 5 — Búsqueda calmada tras el lanzamiento (+6 more)

### Community 22 - "revisar.py"
Cohesion: 0.29
Nodes (4): fecha(), main(), revisar_turnos(), turnos()

## Knowledge Gaps
- **32 isolated node(s):** `Estado de Rockstar (anotado a mano en web/eventos.js)`, `Fallo del eje de Twitch (compacto() en web/app.js)`, `Reddit (A5)`, `Fase 5 — Búsqueda calmada tras el lanzamiento`, `Aviso legal (proyecto de fans, no afiliado a Rockstar/Take-Two)` (+27 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 125 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Plan del proyecto (PLAN.md)` connect `Relevo y forma de trabajo` to `Claves y fases del plan`, `Reglas de datos y estado actual`, `Diseño Miami y estilos`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **What connects `Estado de Rockstar (anotado a mano en web/eventos.js)`, `Fallo del eje de Twitch (compacto() en web/app.js)`, `Reddit (A5)` to the rest of the system?**
  _32 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Despertador y plan de trabajo` be split into smaller, more focused modules?**
  _Cohesion score 0.07073170731707316 - nodes in this community are weakly interconnected._
- **Why does `Plan de trabajo` connect `Plan de trabajo` to `Despertador y plan de trabajo`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Should `Fuentes de datos (fuentes.py)` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Why does `Decisiones ya tomadas` connect `Reglas de datos y estado actual` to `Relevo y forma de trabajo`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Should `Reglas de datos y estado actual` be split into smaller, more focused modules?**
  _Cohesion score 0.05757575757575758 - nodes in this community are weakly interconnected._