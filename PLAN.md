# Plan del proyecto: recuerdo del lanzamiento de GTA 6

Última actualización: 12 de noviembre de 2026.
Estado: **en entrevista** (todavía se están tomando decisiones; no se ha programado nada).

## 1. Qué es esto

Un recuerdo del 19 de noviembre de 2026, día en que sale GTA 6.
Es un proyecto por diversión, sin fin productivo.

Resultado final: **una página web** con:

- Una línea de tiempo del día (qué pasó y a qué hora).
- Tablas y gráficos de números a lo largo del día.

## 2. Decisiones ya tomadas

| Tema | Decisión |
|---|---|
| Formato del recuerdo | Página web con línea de tiempo y tablas de números |
| Fuentes imprescindibles | Twitch, YouTube y Google Trends |
| Dónde se ejecuta el programa | En GitHub, dentro de este repositorio (ejecuciones programadas) |
| Cada cuánto se guardan datos | Cada 30 minutos |
| Qué días | Del 18 al 20 de noviembre de 2026 (tres días completos) |
| Claves de Twitch y YouTube | Las crea Bruno con una guía paso a paso. Aún no existen |
| Visibilidad de la página | Privada por ahora: se abre como archivo en el PC, sin enlace público. Se puede hacer pública más adelante |
| Eventos de la línea de tiempo | Ambos: automáticos (deducidos de los números, como el máximo de espectadores) y escritos a mano por Bruno en un archivo simple |
| Zona horaria de la página | Santiago de Chile (`America/Santiago`). Los datos se guardan en UTC y la página convierte al mostrar |
| Si una fuente falla | El programa sigue con las demás, anota el fallo con su hora (hueco visible, nunca un dato inventado), reintenta en la siguiente medición y GitHub avisa por correo |
| Lenguaje de programación | Python (elegido por Claude por ser lo habitual para este tipo de tarea) |
| Dónde se trabaja | En la nube (Claude Code web) y también en el PC, indistintamente |

## 3. Qué se descartó y por qué

- **Tabla de jugadores en vivo**: descartada. GTA 6 sale en PS5 y Xbox Series,
  y esas plataformas no publican cuánta gente está jugando. Si la empresa anuncia
  cifras de ventas, se pueden añadir a mano después.
- **Tendencias de X (Twitter)**: fuera del plan. Leerlas de forma automática es de pago.

## 4. Fases del proyecto

**Fase 1 — En tiempo real (18 al 20 de noviembre).**
El programa guarda los números cada 30 minutos. Al terminar el día 20, se detiene.

**Fase 2 — Búsqueda calmada (después de la semana del lanzamiento).**
Sin prisa y sin mediciones hora a hora. Se buscan datos del mismo rango de fechas usando
herramientas y fuentes que guardan historial, para completar y contrastar lo recogido.
También entran aquí:

- Memes y capturas de pantalla.
- Lo que pase en la semana posterior a la salida.
- Cifras oficiales que se anuncien después (por ejemplo, ventas).

Límite importante de la Fase 2: no todo se puede recuperar después.

- Google Trends: sí guarda historial. Recuperable.
- Twitch: el acceso oficial solo da el número del momento. El historial depende de
  páginas de terceros, que pueden o no tener el detalle. Por verificar.
- YouTube: solo da las visitas actuales de un video, no las que tenía a cada hora del día 19.

Por eso la Fase 2 complementa a la Fase 1, pero no la reemplaza.

## 5. Qué se mide en cada fuente

Esto es una propuesta. Cada punto se verificará con una prueba real antes de darlo por hecho.

- **Twitch**: espectadores totales de la categoría GTA 6 y los canales con más público.
- **YouTube**: los videos más vistos sobre GTA 6 y sus visitas.
- **Google Trends**: interés de búsqueda de "GTA 6" hora por hora.

### Fuentes adicionales (si alcanza el tiempo, después de las tres imprescindibles)

- **Estado de servidores** (sección "¿se cayeron? sí/no"). Servicios que podrían fallar:
  los de Rockstar, PlayStation Network y la red de Xbox. Las tres empresas tienen páginas
  oficiales de estado. Por verificar: si un programa puede leerlas. Límite: las páginas
  oficiales a veces tardan en reconocer una caída. Los reportes de usuarios (tipo
  Downdetector) probablemente no se pueden leer gratis de forma automática; se anotarían a mano.
- **Noticias sobre GTA 6** (sección pequeña con titulares). Hay fuentes gratuitas de
  titulares recientes. Límite: no existe una medida fiable de "las más populares";
  se mostrarían los titulares más recientes o destacados de cada medición.

### Orden de prioridad

1. Twitch, YouTube y Google Trends.
2. Estado de servidores.
3. Noticias.

Principio de diseño: **simple pero ampliable.** Cada fuente es una pieza independiente.
Añadir una fuente nueva no obliga a tocar las demás.

## 6. Riesgos conocidos

1. **Queda poco tiempo.** El programa debe estar probado antes del 18 de noviembre.
2. **Google Trends es la fuente más frágil.** No tiene un acceso oficial abierto.
   Respaldo: descargar los datos a mano desde su web; siguen disponibles días después.
3. **GitHub no es puntual.** Las ejecuciones programadas se atrasan a menudo varios
   minutos y alguna puede no ejecutarse. Cada medición guardará su hora real.
4. **Las ejecuciones programadas de GitHub solo funcionan desde la rama principal (`main`).**
   El trabajo tiene que estar unido a `main` antes del 18 de noviembre.
5. **Límite diario de YouTube.** El acceso gratuito tiene un tope de consultas por día.
   Hay que confirmar que 48 mediciones diarias caben.
6. **Si el repositorio es privado, GitHub da un tope mensual gratuito de minutos de ejecución.**
   Unas 144 ejecuciones cortas deberían caber, pero hay que confirmarlo.
7. **Las claves nunca se escriben en los archivos del repositorio.** Se guardan en los
   "Secrets" de GitHub.

## 7. Decisiones pendientes

- [ ] Instalar y usar Graphify (skill de GitHub que crea un mapa del proyecto para gastar
      menos tokens). Solo cuando ya haya archivos de código listos. No está instalada todavía.

## 8. Pasos siguientes

1. Terminar la entrevista y cerrar las decisiones pendientes.
2. Bruno crea las claves de Twitch y YouTube (con guía).
3. Probar cada fuente con una consulta real.
4. Programar el recolector de datos y la ejecución programada.
5. Programar la página web.
6. Prueba completa antes del 18 de noviembre.
7. Unir el trabajo a `main`.

## 9. Estructura de carpetas prevista

Todavía no existe; se creará al empezar a programar.

```
recolector/   programa que consulta Twitch, YouTube y Google Trends
datos/        mediciones guardadas (un registro por cada ejecución)
web/          la página con la línea de tiempo y las tablas
.github/      configuración de las ejecuciones programadas
```
