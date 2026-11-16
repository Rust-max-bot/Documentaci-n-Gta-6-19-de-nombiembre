# Graph Report - Documentación Gta 6  (2026-11-16)

## Corpus Check
- 48 files · ~77,753 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: .jsonl 5, (none) 3, .bat 2)

## Summary
- 650 nodes · 1091 edges · 37 communities (22 shown, 15 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 102 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b80846bc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Despertador y plan de trabajo
- Fuentes de datos (fuentes.py)
- Decisiones ya tomadas
- Plan del proyecto (PLAN.md)
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
- Álbum de momentos (tarea 7.7)
- Plan de trabajo
- Estado actual del proyecto
- Diseño visual de la página
- steps
- Plan del proyecto: recuerdo del lanzamiento de GTA 6
- publicar
- Plan de trabajo
- generar_web.py
- sincronizar_datos.ps1

## God Nodes (most connected - your core abstractions)
1. `pintar()` - 26 edges
2. `Falla` - 26 edges
3. `pedir()` - 20 edges
4. `exigir()` - 18 edges
5. `a_iso()` - 14 edges
6. `Decisiones ya tomadas` - 14 edges
7. `pedir_json()` - 13 edges
8. `es_entero()` - 13 edges
9. `Recolector` - 13 edges
10. `Plan del proyecto (PLAN.md)` - 13 edges

## Surprising Connections (you probably didn't know these)
- `Fase 6 — Ideas nuevas de Bruno: más estadísticas, logros y comparaciones (lo que queda)` --references--> `kick()`  [INFERRED]
  historial/PLAN_DE_TRABAJO_2026-11-16.md → recolector/fuentes.py
- `Fase 1 — Recolector funcionando (lo más importante)` --references--> `compacto()`  [INFERRED]
  historial/PLAN_DE_TRABAJO_2026-11-13.md → web/app.js
- `Diseño de la página` --references--> `limpio()`  [INFERRED]
  historial/PLAN_2026-11-16.md → web/app.js
- `8. Dónde está cada cosa (por si quien ayuda puede leer código)` --references--> `fuegos()`  [INFERRED]
  DISENO_VISUAL.md → web/app.js
- `Fase 6 — Ideas nuevas de Bruno: más estadísticas, logros y comparaciones` --references--> `twitch_ranking()`  [INFERRED]
  historial/PLAN_DE_TRABAJO_2026-11-13.md → recolector/fuentes.py

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Fuentes de datos probadas del recolector** — plan_fuente_twitch, plan_fuente_youtube, plan_fuente_google_trends, plan_fuente_estado_servidores, plan_fuente_titulares, plan_fuente_estado_rockstar [EXTRACTED 1.00]
- **Archivos y reglas del sistema de relevo entre sesiones** — claude_sistema_relevo, claude_fuentes_de_verdad, estado_actual_estado_actual, plan_plan_del_proyecto, claude_guardado_al_terminar_paso, claude_archivar_estado_actual [EXTRACTED 1.00]
- **Flujo de claves: crear en Twitch/YouTube y guardar en GitHub Secrets** — guia_claves_clave_twitch, guia_claves_clave_youtube, guia_claves_github_secrets, estado_actual_secretos_github, claude_claves_fuera_del_repo [INFERRED 0.85]
- **Garantías de no inventar datos al guardar mediciones** — recolector_leeme_hueco, recolector_leeme_comprobaciones, recolector_leeme_formato_linea_jsonl, recolector_leeme_interruptor [INFERRED 0.85]
- **Implementación de los dos estilos de Miami** — plan_diseno_miami_dos_estilos, web_index_escena_80, web_index_escena_26, web_index_boton_cambio_estilo, web_index_simbolo_edificios, web_index_simbolo_palmera [INFERRED 0.95]

## Communities (37 total, 15 thin omitted)

### Community 0 - "Despertador y plan de trabajo"
Cohesion: 0.09
Nodes (28): Apagarlo, Comprobar que funciona, Cron Trigger 7,37 * * * * (UTC), Despertador del recolector (Cloudflare), Secreto GITHUB_TOKEN (solo Actions: Read and write, caduca 31 ene 2027), Montar el despertador (pasos en el navegador), Montarlo (lo hace Bruno en el navegador; no hace falta instalar nada), Semana del lanzamiento (SEMANA_INICIO / SEMANA_FIN) (+20 more)

### Community 1 - "Fuentes de datos (fuentes.py)"
Cohesion: 0.06
Nodes (38): Diseño de la página, Fase 6 — Ideas nuevas de Bruno: más estadísticas, logros y comparaciones, Fase 6 — Ideas nuevas de Bruno: más estadísticas, logros y comparaciones, _cabeceras_twitch(), _datos_video(), _fotos_de_perfil(), kick(), _mensaje_youtube() (+30 more)

### Community 2 - "Decisiones ya tomadas"
Cohesion: 0.05
Nodes (39): Skill Impeccable (.claude/skills/impeccable/), Dónde quedamos (2026-11-13), Eje del gráfico de Twitch con números redondos, Fase 1 terminada (tareas 1.1 a 1.7), Secreto GITHUB_TOKEN del Worker (caduca 31 ene 2027 o ~1 mar 2027, por verificar), recolector/interruptor.json (apagar, encender o alargar; hasta 19 dic), Listas de la página con lo más nuevo arriba, Pendiente (fase 2 de PLAN_DE_TRABAJO, verificar Worker, hook Impeccable) (+31 more)

### Community 3 - "Plan del proyecto (PLAN.md)"
Cohesion: 0.06
Nodes (36): Entorno de nube recuerdo-gta6, Línea de estado .claude/hooks/estado-git.sh, .gitattributes fuerza LF en los .sh, Instrucciones para Claude (CLAUDE.md), Repositorio GitHub público Rust-max-bot/Documentaci-n-Gta-6-19-de-nombiembre (rama main), Hook Stop .claude/hooks/revisar-guardado.sh, Estado actual del proyecto (ESTADO_ACTUAL.md), Fecha límite: recolector funcionando antes del 18 nov 2026 (+28 more)

### Community 4 - "steps"
Cohesion: 0.12
Nodes (15): jobs, trends_extra, name, on, workflow_dispatch, permissions, contents, name (+7 more)

### Community 5 - "Generar la página (generar_web.py)"
Cohesion: 0.13
Nodes (10): main(), abrir(), preparar_salida(), main(), main(), recorrer(), fecha(), main() (+2 more)

### Community 6 - "Workflow Recolectar datos"
Cohesion: 0.08
Nodes (24): concurrency, cancel-in-progress, group, KICK_CLIENT_ID, KICK_CLIENT_SECRET, TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY (+16 more)

### Community 7 - "Workflow Probar fuentes"
Cohesion: 0.07
Nodes (32): KICK_CLIENT_ID, KICK_CLIENT_SECRET, TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY, solo_trends_extra, jobs, probar (+24 more)

### Community 8 - "Código de la página (app.js)"
Cohesion: 0.05
Nodes (74): 8. Dónde está cada cosa (por si quien ayuda puede leer código), Fase 1 — Recolector funcionando (lo más importante), abrir(), ahora(), aPantalla(), aplicar(), cinta(), clave() (+66 more)

### Community 9 - "Validaciones (validar.py)"
Cohesion: 0.12
Nodes (28): abortar(), comprobar(), comprobar_serie(), main(), paises(), preguntar(), relacionadas(), serie() (+20 more)

### Community 10 - "Trabajar con Claude en la nube"
Cohesion: 0.40
Nodes (4): Antes de empezar, Cómo ver lo que hace, Qué escribirle, Trabajar con Claude en la nube

### Community 11 - "Worker del despertador"
Cohesion: 0.43
Nodes (6): despertar(), fetch(), scheduled(), SEMANA_FIN, SEMANA_INICIO, tocaMedir()

### Community 24 - "Plan de trabajo"
Cohesion: 0.20
Nodes (9): Avisos para Bruno (cosas donde su idea tiene un límite o un fallo), Fase 2 — Mejoras rápidas (lo que queda), Fase 4 — Mejoras largas (lo que queda), Fase 5 — Lo que ya estaba acordado para después del lanzamiento, Fase 7 — Ideas para que la página sea memorable, Fechas que mandan, Lo ya hecho (detalle en el historial), Plan de trabajo (+1 more)

### Community 25 - "Álbum de momentos (tarea 7.7)"
Cohesion: 0.50
Nodes (3): Cuidado, Cómo subir una foto, Álbum de momentos (tarea 7.7)

### Community 27 - "Plan de trabajo"
Cohesion: 0.18
Nodes (10): Avisos para Bruno (cosas donde su idea tiene un límite o un fallo), Fase 0 — Claves y fuentes, Fase 2 — Mejoras rápidas, Fase 3 — Mejoras medianas, Fase 4 — Mejoras largas, Fase 5 — Lo que ya estaba acordado para después del lanzamiento, Fase 7 — Ideas para que la página sea memorable, Fechas que mandan (+2 more)

### Community 28 - "Estado actual del proyecto"
Cohesion: 0.33
Nodes (5): Cómo usar este archivo, Dónde quedamos, Estado actual del proyecto, Pendiente, Últimos cambios

### Community 30 - "Diseño visual de la página"
Cohesion: 0.15
Nodes (12): 1. Qué es la página, 2. Reglas que cualquier sugerencia tiene que respetar, 3. Estructura de la página, de arriba abajo, 4. Los dos estilos, 5. Día, atardecer y noche, 6. La "hora cero" (el momento del lanzamiento), 7. Letras, colores y medidas, 9. Cómo pedir sugerencias a otra IA (+4 more)

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
Nodes (19): abortar(), comprobar(), convertir(), elegir_videos(), escribir(), estado_servidor(), hora_de_medicion(), horas_trends() (+11 more)

## Knowledge Gaps
- **31 isolated node(s):** `Estilos visuales Miami 1986 y Miami 2026`, `Enlaces y miniaturas guardados (tareas 2.1 y 2.2)`, `Series continuas de YouTube (25 más vistos + re-medición)`, `Aviso legal (proyecto de fans, no afiliado a Rockstar/Take-Two)`, `Python 3.14 para Graphify (no desinstalar)` (+26 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 282 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Diseño de la página` connect `Fuentes de datos (fuentes.py)` to `Código de la página (app.js)`, `Plan del proyecto: recuerdo del lanzamiento de GTA 6`?**
  _High betweenness centrality (0.123) - this node is a cross-community bridge._
- **What connects `Estilos visuales Miami 1986 y Miami 2026`, `Enlaces y miniaturas guardados (tareas 2.1 y 2.2)`, `Series continuas de YouTube (25 más vistos + re-medición)` to the rest of the system?**
  _31 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Despertador y plan de trabajo` be split into smaller, more focused modules?**
  _Cohesion score 0.08817204301075268 - nodes in this community are weakly interconnected._
- **Why does `limpio()` connect `Código de la página (app.js)` to `Fuentes de datos (fuentes.py)`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._
- **Should `Fuentes de datos (fuentes.py)` be split into smaller, more focused modules?**
  _Cohesion score 0.05823293172690763 - nodes in this community are weakly interconnected._
- **Should `Decisiones ya tomadas` be split into smaller, more focused modules?**
  _Cohesion score 0.05052790346907994 - nodes in this community are weakly interconnected._
- **Should `Plan del proyecto (PLAN.md)` be split into smaller, more focused modules?**
  _Cohesion score 0.05795918367346939 - nodes in this community are weakly interconnected._