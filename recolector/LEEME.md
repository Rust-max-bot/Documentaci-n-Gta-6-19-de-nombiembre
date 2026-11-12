# Recolector

Programa en Python (solo biblioteca estándar) que mide las fuentes y guarda **una línea de
texto por medición** en `datos/AAAA-MM-DD.jsonl`. Decisión de Bruno del 2026-11-12: archivos
de texto por día en vez de una base de datos SQL (motivos en `PLAN.md`).

## Archivos

| Archivo | Qué hace |
|---|---|
| `recolectar.py` | Programa principal: lee el interruptor, mide cada fuente, valida y añade la línea |
| `fuentes.py` | Una función por fuente (Twitch, YouTube, Google Trends, titulares, PlayStation, Xbox) |
| `validar.py` | Comprobaciones antes de guardar. Si algo no cuadra, no se guarda nada |
| `red.py` | Piezas comunes para pedir datos a internet |
| `interruptor.json` | **Encender, apagar o alargar** la recolección |
| `revisar.py` | Resumen de cómo va: mediciones, huecos, fallos, cupo de YouTube y peso |
| `probar_fuentes.py` | Prueba suelta de las fuentes (workflow "Probar fuentes"); no guarda nada |

El workflow `.github/workflows/recolectar.yml` lo ejecuta en GitHub a los minutos 7 y 37 de
cada hora (GitHub suele atrasarse unos minutos) y sube la línea nueva con un commit
"Medición automática …".

## Interruptor (`interruptor.json`)

- `"activo": true` mide; `false` deja de medir (no borra nada).
- `"ultimo_dia": "2026-12-19"`: último día que se mide, en fecha de Santiago. Para alargar,
  poner una fecha posterior.
- Se puede editar en la web de GitHub (en `main`) o en el PC: **`git pull` antes**, porque
  GitHub sube una medición cada 30 minutos, y commit y push después.

## Formato de cada línea

Una medición = un objeto JSON en una sola línea. Horas siempre en UTC (`2026-11-19T03:00:00Z`).
Los archivos se parten por día **UTC** (el día de Santiago empieza a las 03:00 UTC).

```text
v            versión del formato (1)
t            hora de inicio de la medición
origen       "github" (las de prueba en el PC nunca llegan a datos/)
ejecucion    número de la ejecución de GitHub
duracion_s   segundos que tardó
twitch       espectadores (suma de todas las transmisiones de la categoría), transmisiones,
             completo (false si había más páginas de las leídas), canales: los 20 con más
             público (login, nombre, espectadores, titulo, idioma, inicio, miniatura)
youtube      busqueda, unidades gastadas, videos (hasta 50): id, titulo, canal, canal_id,
             publicado, visitas, me_gusta, comentarios, en_vivo, miniatura, puesto (en la
             búsqueda de esa medición; null si ya no sale pero se sigue midiendo)
trends       palabra, rango, puntos_en_fuente, puntos: últimas 24 horas {t, interes, parcial}
noticias     en_fuente, nuevas: solo titulares que no estaban en los 3 días anteriores
             {titulo, medio, medio_url, url, t}
playstation  ok, servicios_chile, region, problemas (+ original si hay problemas)
xbox         ok, general, estados (+ original si hay problemas)
```

- **Hueco:** si una fuente falla, en su lugar va `{"error": "mensaje"}`. Nunca se inventa un
  dato. GitHub marca la ejecución en rojo y avisa por correo, pero la medición se guarda.
- **Google Trends es relativo:** 100 es el máximo de los últimos 7 días, así que el mismo
  punto puede valer distinto en mediciones distintas.
- **YouTube:** cada medición busca los 25 videos más vistos de "GTA 6" publicados en los
  últimos 7 días y vuelve a medir los de la medición anterior, para tener series continuas.
  Gasta 101 unidades de las 10.000 diarias.
- Enlaces (tarea 2.1): Twitch `https://www.twitch.tv/<login>`, YouTube
  `https://www.youtube.com/watch?v=<id>`, noticias en `url`.
- Miniaturas (tarea 2.2): Twitch trae `{width}x{height}` en la dirección, que hay que
  reemplazar (por ejemplo `320x180`). Google Noticias no trae imágenes.

## Comprobaciones

Antes de añadir la línea, `validar.py` revisa tipos y rangos de cada fuente, que la hora sea
la de ahora y posterior a la última guardada, que no haya ninguna clave dentro, que no lleve
la marca de ejemplo y que no pese demasiado. También se aborta si el archivo del día termina
a medias. Si una fuente entrega datos que no cuadran, se guarda como hueco con el motivo.

## Probar en el PC

```bash
python recolector/recolectar.py --carpeta <carpeta temporal>   # nunca escribe en datos/
python recolector/revisar.py --horas 24                         # resumen de lo guardado
```

El programa no lee `.env`: en el PC, Twitch y YouTube salen como hueco salvo que las claves
estén puestas como variables de entorno. En GitHub usan los secretos.
