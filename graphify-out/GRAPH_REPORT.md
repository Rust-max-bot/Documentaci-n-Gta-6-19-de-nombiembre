# Graph Report - Documentación Gta 6  (2026-11-21)

## Corpus Check
- 76 files · ~176,965 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 18 file(s) not represented in the graph (top: .jsonl 10, (none) 3, .bat 3)

## Summary
- 1136 nodes · 2083 edges · 80 communities (63 shown, 17 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 153 edges (avg confidence: 0.88)
- Token cost: 183,861 input · 0 output

## Graph Freshness
- Built from commit: `0177837a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Despertador y plan de trabajo
- Tareas que faltan
- Worker de Cloudflare despertador-recolector (horario 7,37 * * * *)
- Estado actual del proyecto (ESTADO_ACTUAL.md)
- steps
- sys
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
- Plan del proyecto: recuerdo del lanzamiento de GTA 6
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
- pintar
- limpio
- Plan del proyecto (PLAN.md)
- Resultado de las pruebas reales de fuentes (12 nov 2026)
- sincronizar_datos.ps1
- medir_carga.py
- Hoteles
- dibujar
- Diseño Miami con dos estilos (Miami 2026 y Miami años 80)
- Estructura de carpetas (web/, recolector/, datos/, .github/workflows/, despertador/)
- Guardar claves en GitHub Secrets (TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY)
- pintarRecords
- Plan del proyecto: recuerdo del lanzamiento de GTA 6
- Panel de control de videos (Fase 10)
- servidor.py
- panel.js
- partes
- json
- publicar.py
- json
- datetime
- filtro-videos.js
- Plan del proyecto: recuerdo del lanzamiento de GTA 6
- Plan del proyecto: recuerdo del lanzamiento de GTA 6
- pathlib
- Plan de trabajo
- Plan del proyecto: recuerdo del lanzamiento de GTA 6
- convertir
- probar_marcas.py
- probar_panel.py
- rebobinado
- cuenta
- probar_saltos.py
- Tareas que faltan
- Estado actual del proyecto
- separar_por_dias
- inicio.js
- Tareas que faltan
- gota
- videos_extra
- flechasShorts
- Tareas que faltan

## God Nodes (most connected - your core abstractions)
1. `Falla` - 26 edges
2. `pintar()` - 25 edges
3. `Hoteles` - 23 edges
4. `dia()` - 22 edges
5. `pintarRecords()` - 21 edges
6. `pedir()` - 19 edges
7. `limpio()` - 18 edges
8. `exigir()` - 18 edges
9. `hora()` - 17 edges
10. `Dibujo` - 17 edges

## Surprising Connections (you probably didn't know these)
- `Pendiente` --references--> `partes()`  [INFERRED]
  historial/ESTADO_2026-11-17.md → web/app.js
- `Fase 1 — Recolector funcionando (lo más importante)` --references--> `compacto()`  [INFERRED]
  historial/PLAN_DE_TRABAJO_2026-11-13.md → web/app.js
- `8. Dónde está cada cosa (por si quien ayuda puede leer código)` --references--> `fuegos()`  [INFERRED]
  DISENO_VISUAL.md → web/app.js
- `Fase 6 — Ideas nuevas de Bruno: más estadísticas, logros y comparaciones (lo que queda)` --references--> `kick()`  [INFERRED]
  historial/PLAN_DE_TRABAJO_2026-11-16.md → recolector/fuentes.py
- `Lo ya hecho (detalle en `historial/PLAN_2026-11-18.md`, los anteriores y `git log`)` --references--> `kick_ranking()`  [INFERRED]
  historial/PLAN_2026-11-18-2.md → recolector/fuentes.py

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Fuentes de datos probadas del recolector** — plan_fuente_twitch, plan_fuente_youtube, plan_fuente_google_trends, plan_fuente_estado_servidores, plan_fuente_titulares, plan_fuente_estado_rockstar [EXTRACTED 1.00]
- **Archivos y reglas del sistema de relevo entre sesiones** — claude_sistema_relevo, claude_fuentes_de_verdad, estado_actual_estado_actual, plan_plan_del_proyecto, claude_guardado_al_terminar_paso, claude_archivar_estado_actual [EXTRACTED 1.00]
- **Flujo de claves: crear en Twitch/YouTube y guardar en GitHub Secrets** — guia_claves_clave_twitch, guia_claves_clave_youtube, guia_claves_github_secrets, estado_actual_secretos_github, claude_claves_fuera_del_repo [INFERRED 0.85]
- **Garantías de no inventar datos al guardar mediciones** — recolector_leeme_hueco, recolector_leeme_comprobaciones, recolector_leeme_formato_linea_jsonl, recolector_leeme_interruptor [INFERRED 0.85]
- **Implementación de los dos estilos de Miami** — plan_diseno_miami_dos_estilos, web_index_escena_80, web_index_escena_26, web_index_boton_cambio_estilo, web_index_simbolo_edificios, web_index_simbolo_palmera [INFERRED 0.95]

## Communities (80 total, 17 thin omitted)

### Community 0 - "Despertador y plan de trabajo"
Cohesion: 0.09
Nodes (28): Apagarlo, Comprobar que funciona, Cron Trigger 7,37 * * * * (UTC), Despertador del recolector (Cloudflare), Secreto GITHUB_TOKEN (solo Actions: Read and write, caduca 31 ene 2027), Montar el despertador (pasos en el navegador), Montarlo (lo hace Bruno en el navegador; no hace falta instalar nada), Semana del lanzamiento (SEMANA_INICIO / SEMANA_FIN) (+20 more)

### Community 1 - "Tareas que faltan"
Cohesion: 0.40
Nodes (5): Antes o justo después del lanzamiento, Después del lanzamiento, Fase 8 — Segundo lanzamiento: GTA 6 en PC (dormida), Ideas para después, sin fecha, Tareas que faltan

### Community 2 - "Worker de Cloudflare despertador-recolector (horario 7,37 * * * *)"
Cohesion: 0.13
Nodes (16): Skill Impeccable (.claude/skills/impeccable/), Dónde quedamos (2026-11-13), Eje del gráfico de Twitch con números redondos, Fase 1 terminada (tareas 1.1 a 1.7), Secreto GITHUB_TOKEN del Worker (caduca 31 ene 2027 o ~1 mar 2027, por verificar), Pendiente (fase 2 de PLAN_DE_TRABAJO, verificar Worker, hook Impeccable), Pendiente de Bruno: borrar referencia del PR #1 y activar correo privado, recolectar.yml sin schedule (solo despertador o manual) (+8 more)

### Community 3 - "Estado actual del proyecto (ESTADO_ACTUAL.md)"
Cohesion: 0.15
Nodes (8): Línea de estado .claude/hooks/estado-git.sh, .gitattributes fuerza LF en los .sh, Instrucciones para Claude (CLAUDE.md), Repositorio GitHub público Rust-max-bot/Documentaci-n-Gta-6-19-de-nombiembre (rama main), Hook Stop .claude/hooks/revisar-guardado.sh, Estado actual del proyecto (ESTADO_ACTUAL.md), Reglas en pausa: ninguna; tanda actual: ninguna, Últimos cambios

### Community 4 - "steps"
Cohesion: 0.07
Nodes (27): concurrency, cancel-in-progress, group, previa, jobs, trends_extra, name, on (+19 more)

### Community 5 - "sys"
Cohesion: 0.22
Nodes (8): escena(), hacer(), main(), titulo(), main(), abrir(), preparar_salida(), main()

### Community 6 - "Workflow Recolectar datos"
Cohesion: 0.08
Nodes (24): concurrency, cancel-in-progress, group, KICK_CLIENT_ID, KICK_CLIENT_SECRET, TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY (+16 more)

### Community 7 - "Workflow Probar fuentes"
Cohesion: 0.07
Nodes (32): KICK_CLIENT_ID, KICK_CLIENT_SECRET, TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY, solo_trends_extra, jobs, probar (+24 more)

### Community 8 - "app.js"
Cohesion: 0.08
Nodes (40): abrir(), abrirMenu(), activar(), ahora(), cargar(), cargarScript(), clase(), desdeSalida() (+32 more)

### Community 9 - "trends_extra.py"
Cohesion: 0.12
Nodes (28): abortar(), comprobar(), comprobar_serie(), main(), paises(), preguntar(), relacionadas(), serie() (+20 more)

### Community 10 - "Trabajar con Claude en la nube"
Cohesion: 0.40
Nodes (4): Antes de empezar, Cómo ver lo que hace, Qué escribirle, Trabajar con Claude en la nube

### Community 11 - "Worker del despertador"
Cohesion: 0.31
Nodes (8): despertar(), fetch(), scheduled(), SEMANA_FIN, SEMANA_INICIO, tocaMedir(), TRENDS_FIN, TRENDS_INICIO

### Community 23 - "Plan del proyecto: recuerdo del lanzamiento de GTA 6"
Cohesion: 0.25
Nodes (7): Cómo se usa este archivo, Decisiones vigentes, Estructura de carpetas, Fechas que mandan, Lo ya hecho (detalle en `historial/PLAN_2026-11-18-3.md`, los anteriores y `git log`), Plan del proyecto: recuerdo del lanzamiento de GTA 6, Riesgos y avisos vigentes

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
Cohesion: 0.12
Nodes (15): 1. Qué es la página, 2. Reglas que cualquier sugerencia tiene que respetar, 3. Estructura de la página, de arriba abajo, 4. Los dos estilos, 4b. Los hoteles de la portada (rediseño del 2026-11-17), 5. Día, atardecer y noche, 6. La "hora cero" (el momento del lanzamiento), 7. Letras, colores y medidas (+7 more)

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
Cohesion: 0.17
Nodes (11): abortar(), comprobar(), comprobar_extra(), comprobar_rebobinado(), elegir_con_extra(), escribir(), leer_album(), leer_filtro() (+3 more)

### Community 36 - "Plan del proyecto: recuerdo del lanzamiento de GTA 6"
Cohesion: 0.12
Nodes (15): Antes o justo después del lanzamiento, Cómo se usa este archivo, Datos y recolección, Decisiones vigentes, Después del lanzamiento, Estructura de carpetas, Fase 8 — Segundo lanzamiento: GTA 6 en PC (dormida), Fechas que mandan (+7 more)

### Community 37 - "pintar"
Cohesion: 0.15
Nodes (24): aplicar(), claveDia(), deSantiago(), dia(), estado(), estadoRev(), filaRockstar(), mover() (+16 more)

### Community 38 - "limpio"
Cohesion: 0.15
Nodes (25): armar(), barrasKick(), cuenta(), juego(), cifra(), cinta(), compacto(), contenido() (+17 more)

### Community 39 - "Plan del proyecto (PLAN.md)"
Cohesion: 0.16
Nodes (13): Fecha límite: recolector funcionando antes del 18 nov 2026, Lista de deseos de Bruno (2026-11-12), D6 cortado, Fase 1: en tiempo real (18 al 20 nov), Fase 2: búsqueda calmada (historial, memes, ventas), Fuente Google Trends (método no oficial en tres pasos con cookie), Fuente YouTube (search 100 unidades, videos 1, de 10.000 diarias), Plan del proyecto (PLAN.md), Recuerdo del lanzamiento de GTA 6 (19 nov 2026): página con línea de tiempo y tablas (+5 more)

### Community 40 - "Resultado de las pruebas reales de fuentes (12 nov 2026)"
Cohesion: 0.24
Nodes (10): Entorno de nube recuerdo-gta6, Workflow Probar fuentes (recolector/probar_fuentes.py), Estado de Rockstar: no funciona (se anota a mano), Fuente estado de servidores (PlayStation y Xbox funcionan), Fuente titulares de Google Noticias (RSS), Fuente Twitch (categoría Grand Theft Auto VI, id 1867279146, helix/streams), Resultado de las pruebas reales de fuentes (12 nov 2026), Gráfico espectadores Twitch (#g-twitch) (+2 more)

### Community 42 - "medir_carga.py"
Cohesion: 0.13
Nodes (5): copiar_web(), _Cuerpo, main(), medir_una(), Servidor

### Community 43 - "Hoteles"
Cohesion: 0.07
Nodes (17): antena(), bezier(), bloque(), caseta(), Dibujo, Hoteles, junta(), main() (+9 more)

### Community 44 - "dibujar"
Cohesion: 0.24
Nodes (11): aPantalla(), conLetras(), cuadro(), cuadrosImagen(), dibujar(), el(), historica(), recortar() (+3 more)

### Community 46 - "Diseño Miami con dos estilos (Miami 2026 y Miami años 80)"
Cohesion: 0.24
Nodes (8): Diseño Miami con dos estilos (Miami 2026 y Miami años 80), Tipografías Google Fonts: Monoton, Rajdhani, Limelight y Outfit, Botón de cambio de estilo (data-poner), Escena Miami actual, Escena Miami años 80, web/index.html (página del recuerdo), Símbolo SVG edificios art déco, Símbolo SVG palmera

### Community 47 - "Estructura de carpetas (web/, recolector/, datos/, .github/workflows/, despertador/)"
Cohesion: 0.29
Nodes (5): recolector/interruptor.json (apagar, encender o alargar; hasta 19 dic), ver_pagina.bat (trae mediciones, prepara web/datos.js y abre la página), Estructura de carpetas (web/, recolector/, datos/, .github/workflows/, despertador/), Periodo de un mes hasta el 19 dic 2026 con interruptor manual, web/datos.js generado por recolector/generar_web.py (no va a git)

### Community 48 - "Guardar claves en GitHub Secrets (TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY)"
Cohesion: 0.43
Nodes (5): Secretos de GitHub TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY guardados, Clave de Twitch (Client ID y Client Secret, dev.twitch.tv), Clave de API de YouTube Data API v3 (Google Cloud), Guardar claves en GitHub Secrets (TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY), Guía para crear las claves de Twitch y YouTube

### Community 50 - "pintarRecords"
Cohesion: 0.16
Nodes (13): contar(), contarFichas(), paso(), hitosLinea(), mirarSecciones(), num(), pintarRecords(), lideresDe() (+5 more)

### Community 51 - "Plan del proyecto: recuerdo del lanzamiento de GTA 6"
Cohesion: 0.12
Nodes (15): Antes o justo después del lanzamiento, Cómo se usa este archivo, Datos y recolección, Decisiones vigentes, Después del lanzamiento, Estructura de carpetas, Fase 8 — Segundo lanzamiento: GTA 6 en PC (dormida), Fechas que mandan (+7 more)

### Community 52 - "Panel de control de videos (Fase 10)"
Cohesion: 0.29
Nodes (6): Decisiones (Bruno, 2026-11-18), Panel de control de videos (Fase 10), Para después, Para qué sirve, Partes (cada una termina usable y verificada, nunca a medias), Requisitos técnicos (revisión a favor y en contra, 2026-11-18)

### Community 53 - "servidor.py"
Cohesion: 0.18
Nodes (3): arrancar(), main(), Panel

### Community 54 - "panel.js"
Cohesion: 0.13
Nodes (32): api(), aviso(), bien(), cambiado(), cambios(), cargar(), confsCambiadas(), copia() (+24 more)

### Community 55 - "partes"
Cohesion: 0.24
Nodes (9): clave(), desfase(), enChile(), dibujar(), horaCorta(), momento(), partes(), pasoRedondo() (+1 more)

### Community 57 - "json"
Cohesion: 0.19
Nodes (5): armar(), conocidos(), descartados(), leer_todo(), pasa_filtro_base()

### Community 58 - "publicar.py"
Cohesion: 0.08
Nodes (29): contenido_completo(), descartar_borrador(), git(), guardar_borrador(), leer_borrador(), NoSePudo, por_subir(), publicar() (+21 more)

### Community 59 - "json"
Cohesion: 0.05
Nodes (41): Dónde quedamos, Diseño de la página, Fase 6 — Ideas nuevas de Bruno: más estadísticas, logros y comparaciones, Fase 6 — Ideas nuevas de Bruno: más estadísticas, logros y comparaciones, _cabeceras_kick(), _cabeceras_twitch(), _datos_video(), _foto_kick() (+33 more)

### Community 60 - "datetime"
Cohesion: 0.29
Nodes (4): fecha(), main(), revisar_turnos(), turnos()

### Community 61 - "filtro-videos.js"
Cohesion: 0.20
Nodes (5): lista(), montarUI(), alertaSin(), elegir(), oculto()

### Community 62 - "Plan del proyecto: recuerdo del lanzamiento de GTA 6"
Cohesion: 0.25
Nodes (7): Cómo se usa este archivo, Decisiones vigentes, Estructura de carpetas, Fechas que mandan, Lo ya hecho (detalle en `historial/PLAN_2026-11-17-2.md` y en `git log`), Plan del proyecto: recuerdo del lanzamiento de GTA 6, Riesgos y avisos vigentes

### Community 63 - "Plan del proyecto: recuerdo del lanzamiento de GTA 6"
Cohesion: 0.25
Nodes (7): Cómo se usa este archivo, Decisiones vigentes, Estructura de carpetas, Fechas que mandan, Lo ya hecho (detalle en `historial/PLAN_2026-11-18.md`, los anteriores y `git log`), Plan del proyecto: recuerdo del lanzamiento de GTA 6, Riesgos y avisos vigentes

### Community 64 - "pathlib"
Cohesion: 0.14
Nodes (3): main(), recorrer(), leer_js()

### Community 65 - "Plan de trabajo"
Cohesion: 0.20
Nodes (9): Avisos para Bruno (cosas donde su idea tiene un límite o un fallo), Fase 2 — Mejoras rápidas (lo que queda), Fase 4 — Mejoras largas (lo que queda), Fase 5 — Lo que ya estaba acordado para después del lanzamiento, Fase 7 — Ideas para que la página sea memorable, Fechas que mandan, Lo ya hecho (detalle en el historial), Plan de trabajo (+1 more)

### Community 66 - "Plan del proyecto: recuerdo del lanzamiento de GTA 6"
Cohesion: 0.25
Nodes (7): Cómo se usa este archivo, Decisiones vigentes, Estructura de carpetas, Fechas que mandan, Lo ya hecho (detalle en `historial/PLAN_2026-11-18-2.md`, los anteriores y `git log`), Plan del proyecto: recuerdo del lanzamiento de GTA 6, Riesgos y avisos vigentes

### Community 67 - "convertir"
Cohesion: 0.13
Nodes (10): armar_comparacion(), convertir(), armado(), estado_servidor(), gta_visibles(), horas_trends(), marca_short(), meta() (+2 more)

### Community 68 - "probar_marcas.py"
Cohesion: 0.20
Nodes (4): comprobar(), con_archivo(), con_marcas(), rechaza()

### Community 70 - "probar_panel.py"
Cohesion: 0.31
Nodes (4): git(), otra_copia(), pedir(), repositorio_falso()

### Community 71 - "rebobinado"
Cohesion: 0.25
Nodes (5): elegir_videos(), fallo_fuente(), hora_de_medicion(), pasa_filtro(), rebobinado()

### Community 73 - "cuenta"
Cohesion: 0.26
Nodes (12): cuenta(), fuegos(), estallar(), leerEstilo(), medir(), horaCero(), pararFiesta(), pintarLugares() (+4 more)

### Community 74 - "probar_saltos.py"
Cohesion: 0.43
Nodes (5): ancla(), main(), menu(), preparar(), subir()

### Community 75 - "Tareas que faltan"
Cohesion: 0.33
Nodes (6): Antes o justo después del lanzamiento, Después del lanzamiento, Fase 10 — Panel de control de videos (después del lanzamiento), Fase 8 — Segundo lanzamiento: GTA 6 en PC (dormida), Ideas para después, sin fecha, Tareas que faltan

### Community 76 - "Estado actual del proyecto"
Cohesion: 0.40
Nodes (4): Cómo usar este archivo, Estado actual del proyecto, Pendiente, Últimos cambios

### Community 78 - "separar_por_dias"
Cohesion: 0.33
Nodes (3): segundos(), separar_por_dias(), serie_corta()

### Community 81 - "Tareas que faltan"
Cohesion: 0.40
Nodes (5): Antes o justo después del lanzamiento, Después del lanzamiento, Fase 8 — Segundo lanzamiento: GTA 6 en PC (dormida), Ideas para después, sin fecha, Tareas que faltan

### Community 82 - "gota"
Cohesion: 0.60
Nodes (5): gota(), actualizar(), botones(), ir(), repetir()

### Community 84 - "videos_extra"
Cohesion: 0.33
Nodes (3): configuraciones_visitante(), records_videos(), videos_extra()

### Community 86 - "Tareas que faltan"
Cohesion: 0.33
Nodes (6): Antes o justo después del lanzamiento, Después del lanzamiento, Fase 10 — Panel de control de videos (después del lanzamiento), Fase 8 — Segundo lanzamiento: GTA 6 en PC (dormida), Ideas para después, sin fecha, Tareas que faltan

## Knowledge Gaps
- **31 isolated node(s):** `Estilos visuales Miami 1986 y Miami 2026`, `Enlaces y miniaturas guardados (tareas 2.1 y 2.2)`, `Series continuas de YouTube (25 más vistos + re-medición)`, `Aviso legal (proyecto de fans, no afiliado a Rockstar/Take-Two)`, `Python 3.14 para Graphify (no desinstalar)` (+26 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 477 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Diseño de la página` connect `json` to `Plan del proyecto: recuerdo del lanzamiento de GTA 6`, `limpio`?**
  _High betweenness centrality (0.197) - this node is a cross-community bridge._
- **What connects `Estilos visuales Miami 1986 y Miami 2026`, `Enlaces y miniaturas guardados (tareas 2.1 y 2.2)`, `Series continuas de YouTube (25 más vistos + re-medición)` to the rest of the system?**
  _31 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Despertador y plan de trabajo` be split into smaller, more focused modules?**
  _Cohesion score 0.08817204301075268 - nodes in this community are weakly interconnected._
- **Why does `limpio()` connect `limpio` to `app.js`, `pintarRecords`, `json`, `pintar`?**
  _High betweenness centrality (0.191) - this node is a cross-community bridge._
- **Should `Worker de Cloudflare despertador-recolector (horario 7,37 * * * *)` be split into smaller, more focused modules?**
  _Cohesion score 0.1286549707602339 - nodes in this community are weakly interconnected._
- **Should `steps` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._
- **Should `Workflow Recolectar datos` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._