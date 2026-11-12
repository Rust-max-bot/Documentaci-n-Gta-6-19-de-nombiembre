# Guía para crear las claves de Twitch y YouTube

Las claves son como contraseñas que permiten al programa pedir datos a Twitch y YouTube.
Son gratis. Calcula unos 10 a 15 minutos por cada una.

**Regla de seguridad: no pegues las claves en el chat ni en ningún archivo del repositorio.**
Solo se pegan en el Paso 3 de esta guía.

Aviso: los nombres de los menús pueden haber cambiado un poco. Si algo no coincide,
dile a Claude qué ves en pantalla.

## Paso 1 — Clave de Twitch

Requisito: tu cuenta de Twitch debe tener activada la verificación en dos pasos
(Configuración → Seguridad y privacidad). Sin eso, Twitch no deja continuar.

1. Entra a https://dev.twitch.tv/console e inicia sesión con tu cuenta de Twitch.
2. Pulsa **Register Your Application** (Registrar tu aplicación).
3. Rellena:
   - **Name**: un nombre cualquiera que nadie más use, por ejemplo `recuerdo-gta6-bruno`.
   - **OAuth Redirect URLs**: escribe `http://localhost`
   - **Category**: elige `Other`.
   - **Client Type**: elige `Confidential`.
4. Pulsa **Create**.
5. En la lista, pulsa **Manage** en tu aplicación.
6. Verás el **Client ID**. Déjalo a mano.
7. Pulsa **New Secret**. Aparece el **Client Secret**. Se muestra una sola vez: cópialo ahora.

Resultado: dos valores, Client ID y Client Secret.

## Paso 2 — Clave de YouTube

1. Entra a https://console.cloud.google.com con tu cuenta de Google.
2. Arriba, pulsa el selector de proyectos y luego **Proyecto nuevo**. Nombre: `recuerdo-gta6`. Crear.
3. Comprueba que el proyecto nuevo está seleccionado arriba.
4. En el buscador de arriba escribe `YouTube Data API v3`, ábrela y pulsa **Habilitar**.
5. En el menú, ve a **APIs y servicios → Credenciales**.
6. Pulsa **Crear credenciales → Clave de API**.
7. Aparece la clave. Cópiala.

No hace falta poner tarjeta de crédito para esto. Si Google la pide, detente y avisa a Claude.

**Aviso "Recuerda configurar la pantalla de consentimiento de OAuth":** ignóralo. Esa pantalla
solo hace falta para el "ID de cliente de OAuth" (cuando una app pide entrar con tu cuenta de
Google). Este proyecto solo lee datos públicos con una **Clave de API**. Si Google no te deja
seguir sin configurarla, es que elegiste "ID de cliente de OAuth": vuelve atrás y elige
**Clave de API**.

**Recomendado, restringir la clave:** en la clave recién creada, pulsa **Editar clave** (o
"Restringir clave"):
- **Restricciones de aplicaciones:** déjalo en **Ninguna** (los servidores de GitHub cambian de
  dirección, así que otra opción la bloquearía).
- **Restricciones de API:** elige **Restringir clave** y marca solo **YouTube Data API v3**.
  Así, si la clave se filtrara, solo serviría para leer YouTube.
- Guardar.

Resultado: un valor, la clave de API.

## Paso 3 — Guardar las claves en GitHub

1. Abre el repositorio en GitHub.
2. Ve a **Settings → Secrets and variables → Actions**.
3. Pulsa **New repository secret** y crea estos tres, uno por uno, con estos nombres exactos:

| Nombre | Valor |
|---|---|
| `TWITCH_CLIENT_ID` | el Client ID de Twitch |
| `TWITCH_CLIENT_SECRET` | el Client Secret de Twitch |
| `YOUTUBE_API_KEY` | la clave de API de YouTube |

Una vez guardadas, nadie puede volver a leerlas desde GitHub, ni siquiera tú. Solo el programa las usa.

## Al terminar

Avisa a Claude con un mensaje como "ya guardé las tres claves". No pegues los valores.
