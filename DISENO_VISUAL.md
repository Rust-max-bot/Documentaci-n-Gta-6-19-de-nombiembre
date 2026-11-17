# Diseño visual de la página

> **Para qué sirve este archivo:** explicar **cómo se ve** la página (no cómo funciona por
> dentro), para pasárselo a otra IA o a una persona y pedirle opiniones, sugerencias o
> arreglos de diseño. Se puede copiar entero en un chat junto con capturas de la página.
>
> Escrito por Claude el 2026-11-15 a partir del código (`web/estilos.css`, `web/index.html`,
> `web/app.js`). Si cambia el diseño, hay que actualizar este archivo en el mismo cambio.

## 1. Qué es la página

Un recuerdo del lanzamiento de GTA 6 (19 de noviembre de 2026) hecho por diversión: una sola
página web con una portada animada de Miami y, debajo, tarjetas con cifras de Twitch,
YouTube, Google Trends, titulares y Reddit, medidas cada hora antes, durante y después del día.

- **Dónde verla:** <https://rust-max-bot.github.io/Documentaci-n-Gta-6-19-de-nombiembre/>
- **Público:** quien quiera recordar cómo se vivió el lanzamiento en internet. Se ve sobre
  todo en el celular y en el PC.
- **Idioma:** español de Chile. Las horas se muestran en hora de Santiago.

## 2. Reglas que cualquier sugerencia tiene que respetar

1. **Diseño original, inspirado en Miami.** No se copian logotipos, tipografías, imágenes ni
   arte de los juegos de Rockstar (ni de GTA VI ni de Vice City). Todos los dibujos
   (palmeras, hoteles, torres, sol) son formas propias hechas en SVG.
2. **Sin librerías ni paso de compilación.** Solo HTML, CSS y JavaScript sencillos, en tres
   archivos. Nada de React, Tailwind, Three.js, GSAP, etc. Las letras vienen de Google Fonts.
3. **Dos estilos que se cambian con un botón:** "Miami 1986" y "Miami 2026" (ver sección 4).
   Cualquier cambio tiene que verse bien en los dos.
4. **Tres momentos del día:** día, atardecer y noche, según la hora real de Miami (sección 5).
   Son 2 estilos × 3 momentos = **6 portadas distintas**.
5. **Dos anchos de prueba:** 1280 px (PC) y 384 px (celular). Sin desborde horizontal.
6. **Movimiento con respeto:** si la persona tiene activado "reducir movimiento" en su
   sistema, se apagan todas las animaciones (ya está hecho; las sugerencias deben mantenerlo).
7. **Se ve también con teclado:** los botones muestran un contorno al recorrerlos con Tab
   (no al hacer clic).

## 3. Estructura de la página, de arriba abajo

1. **Portada** (casi toda la pantalla al abrir): la escena de Miami con su cielo, sol o luna,
   torres, hoteles, suelo o mar y palmeras. Encima:
   - barra superior: a la izquierda el texto "RECUERDO · LANZAMIENTO"; a la derecha los
     botones **Día / Atardecer / Noche** y el interruptor **Miami 1986 / Miami 2026**;
   - el título grande **"19 · NOV · 2026"** y debajo **"El día que salió GTA 6"**;
   - botones de lugar **Nueva Zelanda / Chile / Miami** y la **cuenta regresiva** en cuatro
     cajitas (días, horas, min, seg), con una nota "Medianoche en Chile".
2. **Fichas:** una franja de 4 cifras grandes que se monta sobre el borde inferior de la
   portada (máximo en Twitch, máximo en Trends, mediciones guardadas, mediciones con huecos).
3. **Secciones en tarjetas** ("bloques"), una debajo de otra, en este orden: Logros y récords ·
   Línea de tiempo · Resumen del día · Espectadores en Twitch (gráfico) · Interés en Google
   Trends (gráfico) · ¿Se cayeron los servidores? · Twitch, medición por medición (tabla) ·
   Videos más vistos en YouTube (con tira de Shorts) · GTA frente a lo más visto · GTA 6 frente
   a otros lanzamientos (barras) · Titulares (con barras por día y páginas) · Reddit · Álbum de
   momentos (fotos tipo instantánea) · Cápsula del tiempo (dos cintas de casete) · Próximamente.
   En **¿Se cayeron los servidores?**, arriba una caja "Ahora" (punto y texto en verde si todo
   funciona, en rojo si algún servicio falla) y, por servicio, dos tiras: un cuadro por día y
   cada medición de las últimas 24 horas (9.1, opción C). Se prueba con `?probar-servidores-mal`.
4. **Pie** con la nota de que la página está hecha con Claude a pedido de "Rust" (el nombre
   público de Bruno, el dueño del proyecto) y que no está afiliada a Rockstar ni a Take-Two.
5. **Botón flotante "☰ Secciones"** abajo a la derecha, que abre un menú para saltar a cada parte.

Ancho máximo del contenido: 1160 px, centrado.

## 4. Los dos estilos

### Miami 1986 (`data-tema="ochenta"`): neón y retro de los 80

Idea: un atardecer "synthwave" de los años 80, con neón, rejilla en el suelo y líneas de
televisor antiguo.

| Elemento | Cómo se ve |
| --- | --- |
| Cielo | Degradado de violeta muy oscuro a magenta, rosa y naranja en el horizonte. Estrellas pequeñas que titilan (4 s). |
| Sol | Grande, en el centro, amarillo → naranja → rosa → magenta, **cortado en franjas horizontales** que se ensanchan hacia abajo. Brillo rosa que "late" (6 s). |
| Torres de fondo | Siluetas oscuras con bordes cian de neón (una con fachada hueca y palmera dentro; otra de tres niveles con luces). |
| Hoteles | Fila de hoteles art déco (dibujo compartido con 2026) con brillo rosa alrededor. |
| Calle y playa (7.12) | Bajo los hoteles, en neón: vereda violeta, cordón rosa, calle oscura con línea discontinua cian y arena violeta, con las palmeras plantadas en ella; un borde de espuma rosa da paso a la rejilla. |
| Suelo | **Rejilla de neón** en perspectiva que avanza hacia quien mira: líneas cian hacia el horizonte y líneas rosas de lado a lado. Se dibuja en un `<canvas>` (una casilla cada 1,6 s). Borde cian brillante en el horizonte. |
| Palmeras | Tres siluetas negro-violeta que se mecen (7 s). En el celular se oculta la más chica. |
| Encima de todo | **Líneas de televisor antiguo** (rayas horizontales finas) sobre toda la página. |
| Título | Letra **Monoton** (rayada, de neón), blanca con halo rosa y un parpadeo de tubo de neón cada 5 s. El lema en **Rajdhani**, cian, en mayúsculas y espaciado. |
| Cuenta regresiva | Números amarillos con halo. |
| Tarjetas de abajo | Fondo violeta muy oscuro (#160436), borde rosa fino con brillo, esquinas casi rectas (6 px). Títulos en mayúsculas, blancos con halo rosa. Cifras en cian y amarillo con halo. |

### Miami 2026 (`data-tema="actual"`): atardecer tropical luminoso

Idea: Miami de hoy en la "hora dorada": colores cálidos y limpios, mar, nubes y torres nuevas.
Paleta llamada "Atardecer encendido" (elegida por Bruno).

| Elemento | Cómo se ve |
| --- | --- |
| Cielo | Degradado azul eléctrico → violeta → rosa → naranja → amarillo. Tres **nubes** blancas difusas cruzan despacio (70 a 120 s). |
| Sol | Disco blanco-amarillo difuso a la derecha que flota suavemente (12 s). |
| Torres de fondo | Torres modernas en lila suave, "a lo lejos": una en forma de vela, cubos en obra con **grúa**, una con estructura curva por fuera, una torcida, una de balcones ondulados y terrazas verdes. **Suben una por una con un pequeño rebote** al pasar de 1986 a 2026. |
| Hoteles | La misma fila art déco, en colores vivos: verde menta, rosa, amarillo, celeste y naranja, con bordes blancos. |
| Calle y playa (7.12) | Bajo los hoteles: vereda rosada, cordón claro, calle violeta con línea discontinua amarilla y arena dorada, con las palmeras plantadas en ella; una espuma blanca que se mueve marca dónde empieza el mar. De día, colores más claros; de noche, calle casi negra, cordón cian y arena lila. |
| Mar | Debajo de la arena (más angosto desde la 7.12): **agua** turquesa → azul profundo, con líneas de oleaje que se mueven (2,4 s) y el reflejo del sol en el agua. |
| Palmeras | Las mismas tres, en violeta oscuro. |
| Título | Letra **Limelight** (art déco), blanca con sombra rosa sólida debajo; las tres partes del título suben al cargar, una tras otra. Lema en **Outfit**, azul marino. |
| Fondo de la página | Degradado melocotón → rosa → celeste claro. |
| Tarjetas de abajo | Crema (#fffaf4), sombra suave, esquinas redondeadas (16 px). Títulos en Limelight azul marino. Cifras en rosa fuerte (#ff2e63) y turquesa. |

### Cambio de un estilo a otro

- El interruptor es una píldora con un fondo de color que se desliza al lado elegido
  (rosa neón en 1986, naranja-rosa en 2026), con un resorte, en cuanto se toca.
- Al cambiar pasa una **cortina diagonal** de colores (cian, rosa, amarillo, naranja) que
  barre la pantalla en 0,8 s; el estilo cambia a mitad del barrido (a los 0,38 s) y las dos
  escenas se funden en 0,7 s.
- Hacia 2026 las torres nuevas suben después del barrido; hacia 1986 bajan durante el
  barrido. Los dos sentidos tardan lo mismo.
- La elección se recuerda en el navegador para la próxima visita.

## 5. Día, atardecer y noche

La página calcula la salida y la puesta del sol en Miami para cada día. **Atardecer:** desde
1 h antes de la puesta hasta 30 min después (y la media hora alrededor de la salida). Los
botones Día / Atardecer / Noche fijan otro momento hasta recargar la página. El atardecer es
la versión "normal" descrita en la sección 4.

| | Miami 1986 | Miami 2026 |
| --- | --- | --- |
| **Día** | Cielo turquesa de los 80 que pasa a rosa en el horizonte; sol alto, amarillo y sin franjas; sin estrellas; hoteles pastel con los tubos de neón "apagados"; torres azules; suelo violeta. | Mediodía tropical: cielo azul a celeste y crema; sol blanco alto; torres celestes; hoteles en tonos más claros; palmeras verdes; mar turquesa claro con brillo blanco. |
| **Atardecer** | (Sección 4.) | (Sección 4.) |
| **Noche** | Cielo casi negro a violeta; **luna de neón** (blanca-lila con halo rosa) en vez de sol; más estrellas; todas las ventanas encendidas. | Cielo azul noche; luna pequeña arriba a la derecha (arriba a la izquierda en el celular); estrellas; sin nubes; torres azul oscuro con ventanas encendidas y bordes cian; grúa roja; hoteles con neón cian y rosa; mar azul muy oscuro con el reflejo de la luna. |

## 6. La "hora cero" (el momento del lanzamiento)

Cuando la cuenta llega a cero en el lugar elegido:

- el lema cambia a **"¡Ya salió GTA 6!"** con una entrada que crece y rebota;
- **fuegos artificiales** dibujados en un `<canvas>` sobre el cielo, con los colores del
  estilo (de día, colores más fuertes y chispas más gruesas para que se vean);
- **cuatro reflectores** que barren el cielo (blancos; cian-rosa en 1986; de colores de día);
- todas las ventanas se encienden; la fiesta dura 22 s.

Se puede probar abriendo la página con `?probar-hora-cero` al final de la dirección.

## 7. Letras, colores y medidas

**Letras (Google Fonts, licencia libre):**

| Uso | Miami 1986 | Miami 2026 |
| --- | --- | --- |
| Título grande | Monoton | Limelight |
| Títulos de sección | Rajdhani (mayúsculas) | Limelight |
| Texto | Rajdhani, 18 px | Outfit, 16 px |

**Colores principales (variables CSS):**

| Variable | Para qué | 1986 | 2026 |
| --- | --- | --- | --- |
| `--fondo` | fondo de la página | #0d0221 | #fff3e8 |
| `--panel` | fondo de las tarjetas | #160436 | #fffaf4 |
| `--texto` | texto | #f7ecff | #1b1440 |
| `--tenue` | texto secundario | #b9a0dc | #5f5884 |
| `--a1` | acento principal | #ff2e97 (rosa neón) | #ff2e63 (rosa fuerte) |
| `--a2` | acento 2 | #22e6ff (cian) | #0aa5c9 (turquesa) |
| `--a3` | acento 3 | #ffd319 (amarillo) | #ff6a00 (naranja) |
| `--radio` | esquinas | 6 px | 16 px |

Los colores de los hoteles (`--h1` a `--h5`), sus bordes (`--trim`) y ventanas (`--vent`)
cambian con cada estilo y cada momento del día.

**Línea de tiempo (pedido de Bruno, 2026-11-17; opción A, agrupada por día):** un rótulo por día ("MARTES 17 NOV"), la hora arriba del texto (antes iba en una columna angosta y chocaba con él), el punto con el ícono del tipo (borde punteado si es a mano), filtros por tipo con su cantidad, "Ver los N eventos" (se ven los 8 más nuevos) y un enlace a la sección de cada evento. Descartada: B (tarjetas a los dos lados de la línea).

**Rockstar a mano en "¿Se cayeron los servidores?" (pedido de Bruno, 2026-11-17; opción C):** la página de estado de Rockstar no le responde al recolector, así que se revisa a mano (skill `anotar-rockstar`, que escribe en `web/eventos.js`). En la sección, Rockstar va en un recuadro punteado con la etiqueta "a mano", y cada revisión es un punto verde o rojo sobre una línea punteada que cubre todo el periodo, con la última revisión escrita y un veredicto que cuenta revisiones ("No se vio caída", no "No se cayó"). `?probar-rockstar` suma revisiones inventadas solo en la pantalla, para probar. Descartadas: A (cuadros huecos por día) y B (fichas con las últimas revisiones).

**Tarjetas de videos y Shorts (9.5 y 9.6, opciones A de Bruno, 2026-11-17):** título hasta 3 líneas y canal con cifras hasta 2, siempre con ese espacio reservado (lo más largo se corta con "…" y sale entero al pasar el mouse), así nada cambia de alto ni de lugar al pasar de Global a En español. Gráfico: línea rosada con relleno suave, punto al final y, debajo, las visitas al inicio con su día ("14 nov · 12,8 M") y las de ahora ("ahora · 15,8 M"); en los Shorts, solo las cifras. Descartadas: título sobre la foto en los Shorts (9.5 B); barra de antes y ahora (9.6 B) y línea con etiqueta de porcentaje (9.6 C).

**GTA frente a lo más visto (9.7, opción A de Bruno, 2026-11-17):** arriba, un recuadro con "GTA VI" en grande (rosa, con brillo en 1986), su puesto en Twitch y sus videos en tendencia en YouTube Chile y EE. UU., cada uno con una línea de cómo fue cambiando desde el 13 nov; GTA V en pequeño, de referencia. Debajo, las barras de Twitch (GTA VI en rosa, GTA V en celeste) y las listas de YouTube con 4 videos por país, "Ver N más" y una etiqueta VI o V según el título. Descartada: B (tabla de duelo VI contra V).

**Íconos pequeños (pedido de Bruno, 2026-11-16; opción C, 2026-11-17):** dibujos propios de trazo (símbolos `i-...` en `index.html`), en los títulos de Twitch y Kick (ondas de "en vivo"), Trends (línea que sube), servidores, videos (play en un círculo), titulares (periódico) y Reddit (globo), en los subtítulos "Videos" y "Shorts" (celular vertical) y en la etiqueta de plataforma de la tabla (solo en PC). Línea celeste (`--a2`), con brillo de neón en 1986. **No se usan ni se imitan los logotipos de YouTube, Twitch, Kick, Google ni Reddit:** sus reglas de marca piden permiso y prohíben cambiarles el color. Descartadas: A (línea del color del título) y B (ficha de color).

**Eje de horas de los gráficos (9.4, opción C de Bruno, 2026-11-16):** fechas y, si sobra espacio, horas cortas ("6 p. m." o "18 h"). El paso (3, 6 o 12 h, 1, 2 o 3 días o una semana) se elige según el ancho para que los textos nunca se encimen; `probar_pagina.py` lo revisa. Descartadas: A (hora completa entre fechas) y B (solo fechas).

**Otras animaciones de la parte de abajo:** los gráficos se dibujan como una línea que avanza
(2,2 s) al aparecer en pantalla; las barras crecen; un punto verde "late" junto a "Última
medición hace X min"; "¡Nuevo récord!" marca los récords recientes.

**Microinteracciones** (2026-11-15, probadas antes en una vista previa y aprobadas por Bruno).
Resorte con leve sobrepaso: `cubic-bezier(.22, 1.15, .36, 1)`.

- **Gota que se desliza:** en Día / Atardecer / Noche, Nueva Zelanda / Chile / Miami, los días
  del Resumen y de la tabla de Twitch, las pestañas Global / En español y las páginas de
  titulares, una sola píldora se desliza al botón elegido y se estira un poco al llegar.
- **Cuenta regresiva:** al cambiar de país, los números aparecen desenfocados y se enfocan en 0,18 s.
- **"☰ Secciones":** la misma caja del botón crece hasta ser el menú; las opciones aparecen con
  la caja casi abierta. El botón no se mueve ni cambia de tamaño, y el ícono no cambia.
- **Al presionar:** botones, tarjetas y cintas se hunden un poco y rebotan al soltar.
- **Flechas ‹ ›:** en los días del Resumen y de la tabla de Twitch (una sola fila, también en el
  celular; si no caben, la fila se desliza y sus bordes se desvanecen), en las páginas de
  titulares (siempre 7 casillas, o 5 en el celular) y en la tira de Shorts.
- **Sin saltos:** el control que se toca queda en el mismo lugar de la pantalla.
- **Barra de desplazamiento** de la página de ancho normal, con fondo visible y siempre presente.

## 8. Dónde está cada cosa (por si quien ayuda puede leer código)

| Qué | Dónde |
| --- | --- |
| Colores de cada estilo | `web/estilos.css`, al principio (`:root[data-tema=...]`) |
| Portada, escenas 1986 y 2026, palmeras | `web/estilos.css`, secciones "Portada", "Escena 1986", "Escena 2026", "Palmeras" |
| Día, atardecer y noche | `web/estilos.css`, sección "Día, atardecer y noche (tarea 4.1)" |
| Hora cero (fuegos, reflectores) | `web/estilos.css`, sección "Hora cero"; dibujo de los fuegos en `web/app.js` (`fuegos()`) |
| Dibujos de palmera, hoteles y torres (SVG) | `web/index.html`, al principio (`<symbol id="palmera">`, `edificios`, `torres80`, `torres26`) |
| Rejilla del suelo de 1986 | `web/app.js`, "Suelo de Miami 1986" |
| Cambio de estilo (barrido, torres) | `web/app.js`, "Cambio de estilo" |
| Microinteracciones (gota, flechas, sin saltos, menú) | `web/estilos.css`, al final; `web/app.js`, "Microinteracciones" |

## 9. Cómo pedir sugerencias a otra IA

1. Copiar este archivo entero en el chat.
2. Adjuntar capturas. Lo mínimo: la portada en los dos estilos, en PC y en celular. Mejor
   aún: las 6 portadas (botones Día / Atardecer / Noche × Miami 1986 / 2026) y alguna
   sección de abajo. Sin capturas, la otra IA solo puede imaginar la página.
3. Pedirlo así (se puede cambiar lo que va entre corchetes):

   ```text
   Te paso la descripción del diseño visual de una página web (archivo DISENO_VISUAL.md) y
   capturas. Quiero sugerencias para [mejorar la portada / que el estilo 2026 se vea más
   vistoso / que se vea mejor en el celular / lo que veas].

   Respeta las reglas de la sección 2: diseño original (nada copiado de Rockstar), sin
   librerías, que funcione en los dos estilos y en los tres momentos del día, a 1280 y 384 px,
   y que respete "reducir movimiento".

   Para cada sugerencia dime: qué cambiarías, por qué se vería mejor, en qué estilo y momento
   del día se nota, y cómo se haría en CSS o SVG (sin escribir la página completa). Ordénalas
   de mayor a menor impacto y separa las fáciles de las que dan más trabajo.
   ```

4. Las sugerencias que salgan se le pasan a Claude en este proyecto: antes de aplicar un
   cambio que altere cómo se ve la página, Claude muestra opciones con capturas y Bruno elige.
