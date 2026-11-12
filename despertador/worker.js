// Despertador del recolector: un Worker de Cloudflare (plan gratis).
//
// Le pide a GitHub que ejecute el workflow "Recolectar datos"
// (.github/workflows/recolectar.yml). No mide nada ni guarda datos: solo lo lanza, porque
// GitHub no lanzaba solas sus ejecuciones programadas (tarea 1.4, 2026-11-12).
//
// Frecuencia (decisión de Bruno, 2026-11-12): cada hora, y cada 30 minutos durante la
// semana del lanzamiento (SEMANA_INICIO a SEMANA_FIN). Cloudflare lo despierta a los
// minutos 7 y 37 de cada hora (Cron Trigger "7,37 * * * *", hora UTC); fuera de esa semana,
// el turno del minuto 37 no hace nada.
//
// La clave de GitHub va en el secreto GITHUB_TOKEN del Worker. Nunca se escribe aquí.
// Instrucciones de montaje y prueba: despertador/LEEME.md.
//
// Este archivo es la copia de referencia: si se cambia el código en Cloudflare, hay que
// cambiarlo también aquí (y al revés).

const REPO = "Rust-max-bot/Documentaci-n-Gta-6-19-de-nombiembre";
const WORKFLOW = "recolectar.yml";

// Semana del lanzamiento, en UTC: del 17 al 21 de noviembre de 2026, ambos incluidos.
// El lanzamiento (19 nov, 00:00 de Santiago) es el 19 nov a las 03:00 UTC.
const SEMANA_INICIO = Date.parse("2026-11-17T00:00:00Z");
const SEMANA_FIN = Date.parse("2026-11-22T00:00:00Z");

// Decide si este turno lanza el recolector. "hora" es la hora programada, en milisegundos.
function tocaMedir(hora) {
  const enPrimeraMitad = new Date(hora).getUTCMinutes() < 30; // turno del minuto 7
  const enSemana = hora >= SEMANA_INICIO && hora < SEMANA_FIN;
  return enPrimeraMitad || enSemana;
}

async function despertar(env) {
  if (!env.GITHUB_TOKEN) {
    throw new Error("falta el secreto GITHUB_TOKEN en el Worker");
  }
  const r = await fetch(
    `https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/dispatches`,
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
        "User-Agent": "despertador-recolector", // GitHub rechaza las consultas sin User-Agent
      },
      body: JSON.stringify({ ref: "main" }),
    },
  );
  // GitHub responde 204 (sin contenido) cuando acepta la orden.
  if (r.status !== 204) {
    const texto = (await r.text()).slice(0, 300);
    throw new Error(`GitHub respondió ${r.status}: ${texto}`);
  }
}

export default {
  // Lo llama Cloudflare según el horario (Cron Trigger). Si falla, queda marcado como error
  // en el registro del Worker; en GitHub se nota porque falta la medición de ese turno.
  async scheduled(evento, env, ctx) {
    if (!tocaMedir(evento.scheduledTime)) {
      console.log("Turno del minuto 37 fuera de la semana del lanzamiento: no se mide.");
      return;
    }
    await despertar(env);
    console.log("GitHub aceptó la orden de medir.");
  },

  // Abrir la dirección del Worker en el navegador no lanza nada (para que nadie pueda
  // gastar minutos de GitHub desde fuera): solo dice que existe.
  async fetch() {
    return new Response("Despertador del recolector: activo.", {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  },
};
