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
| Dónde se trabaja | En la nube (Claude Code web) y también en el PC, indistintamente |

## 3. Qué se descartó y por qué

- **Tabla de jugadores en vivo**: descartada. GTA 6 sale en PS5 y Xbox Series,
  y esas plataformas no publican cuánta gente está jugando. Si la empresa anuncia
  cifras de ventas, se pueden añadir a mano después.
- **Tendencias de X (Twitter)**: fuera del plan. Leerlas de forma automática es de pago.

## 4. Segunda fase (después del lanzamiento)

- Memes y capturas de pantalla.
- Documentar lo que pase en la semana posterior a la salida.

## 5. Qué se mide en cada fuente

Esto es una propuesta. Cada punto se verificará con una prueba real antes de darlo por hecho.

- **Twitch**: espectadores totales de la categoría GTA 6 y los canales con más público.
- **YouTube**: los videos más vistos sobre GTA 6 y sus visitas.
- **Google Trends**: interés de búsqueda de "GTA 6" hora por hora.

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
6. **Las claves nunca se escriben en los archivos del repositorio.** Se guardan en los
   "Secrets" de GitHub.

## 7. Decisiones pendientes

- [ ] Lenguaje de programación (propuesta: Python).
- [ ] Dónde se publica la página web y si será pública o privada.
- [ ] Zona horaria que se muestra en la página.
- [ ] De dónde salen los eventos de la línea de tiempo (automáticos, escritos a mano, o ambos).
- [ ] Aclarar qué herramienta es "Graffiti" (Bruno pidió usarla cuando ya haya archivos listos).
- [ ] Qué pasa si una fuente falla durante el día 19 (avisar, reintentar, seguir con las demás).

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
