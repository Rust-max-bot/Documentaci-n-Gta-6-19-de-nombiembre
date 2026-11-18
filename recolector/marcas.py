"""Marcas de videos de YouTube (Fase 10, tarea 10.1; pedido de Bruno, 2026-11-18).

El filtro automático (filtro_videos.json) solo lee el título y los temas que pone YouTube, así
que deja pasar videos que no tratan de GTA 6. Bruno los marca a mano en
recolector/marcas_videos.json, con uno o varios motivos, y generar_web.py los saca de todas las
listas y récords de YouTube (Global, Español, Tendencias y "Video/Short más visto"). Los
tráilers oficiales no se marcan. No se borra nada de datos/: solo cambia lo que se muestra.

Esta es la ÚNICA validación de marcas: la usan generar_web.py y, más adelante, el panel
(10.2), que la corre antes de publicar. Si algo no cuadra, lanza MarcasMal con un mensaje claro.

Formato del archivo:
    {"videos": {"<código de 11 letras>": {"motivos": ["no_gta", "ia"], "fecha": "AAAA-MM-DD",
                                           "titulo": "opcional, solo para leerlo"}},
     "revisados": {"<código>": "AAAA-MM-DD"},
     "ayuda": ["...", ...]}

"revisados" (10.2): videos que Bruno miró en el panel y están bien (sin marca). Solo le sirven
al panel para el filtro "sin revisar"; la página los ignora. Un video no puede estar en las dos.
"""
import json
import re
from datetime import date, timedelta
from pathlib import Path

ARCHIVO = Path(__file__).resolve().parent / "marcas_videos.json"

# Motivos (Bruno, 2026-11-18). La clave va en el archivo; el texto es el que verá la gente.
MOTIVOS = {
    "no_gta": "No trata de GTA",
    "ia": "Hecho con IA",
    "dudoso": "Dudoso",
}
CODIGO = re.compile(r"^[A-Za-z0-9_-]{11}$")
FECHA = re.compile(r"^\d{4}-\d{2}-\d{2}$")
CLAVES_ARCHIVO = {"videos", "revisados", "ayuda"}
CLAVES_VIDEO = {"motivos", "fecha", "titulo"}


class MarcasMal(ValueError):
    """El archivo de marcas no cuadra. El mensaje dice qué y dónde."""


def _fecha(fecha, donde):
    if not (isinstance(fecha, str) and FECHA.fullmatch(fecha)):
        raise MarcasMal(f"{donde}: 'fecha' debe ser AAAA-MM-DD (el día en que se marcó)")
    try:
        dia = date.fromisoformat(fecha)
    except ValueError:
        raise MarcasMal(f"{donde}: la fecha {fecha!r} no existe") from None
    if dia > date.today() + timedelta(days=1):   # un día de margen por la diferencia con UTC
        raise MarcasMal(f"{donde}: la fecha {fecha} todavía no llega")


def _codigo(codigo, donde, conocidos):
    if not CODIGO.fullmatch(codigo):
        raise MarcasMal(f"{donde}: el código de un video de YouTube tiene 11 letras, números, '-' o '_'")
    if conocidos is not None and codigo not in conocidos:
        raise MarcasMal(f"{donde}: no aparece en las búsquedas de YouTube de datos/ (¿código mal copiado? Los tráilers oficiales no se marcan)")


def validar(datos, conocidos=None):
    """Revisa el contenido ya leído del archivo. Devuelve {código: [motivos]}.

    conocidos: si se da, los códigos de video que existen en datos/. Un código que no está ahí
    casi seguro es un error al copiarlo (y no ocultaría nada), así que también aborta. El panel
    (10.2) lo usa así antes de publicar; generar_web.py no, para que un código mal copiado no
    frene la publicación de cada hora: solo avisa (ver desconocidos())."""
    if not isinstance(datos, dict):
        raise MarcasMal("el archivo debe ser un objeto JSON con la clave 'videos'")
    sobra = set(datos) - CLAVES_ARCHIVO
    if sobra:
        raise MarcasMal(f"claves desconocidas en el archivo: {', '.join(sorted(sobra))}")
    if "ayuda" in datos and not (isinstance(datos["ayuda"], list) and all(isinstance(x, str) for x in datos["ayuda"])):
        raise MarcasMal("'ayuda' debe ser una lista de textos")
    videos = datos.get("videos")
    if not isinstance(videos, dict):
        raise MarcasMal("falta 'videos' o no es un objeto {código: marca}")
    salida = {}
    for codigo, marca in videos.items():
        donde = f"video {codigo!r}"
        _codigo(codigo, donde, conocidos)
        if not isinstance(marca, dict):
            raise MarcasMal(f"{donde}: la marca debe ser un objeto con 'motivos' y 'fecha'")
        sobra = set(marca) - CLAVES_VIDEO
        if sobra:
            raise MarcasMal(f"{donde}: claves desconocidas: {', '.join(sorted(sobra))}")
        motivos = marca.get("motivos")
        if not (isinstance(motivos, list) and motivos):
            raise MarcasMal(f"{donde}: 'motivos' debe ser una lista con al menos uno")
        for m in motivos:
            if not isinstance(m, str) or m not in MOTIVOS:
                raise MarcasMal(f"{donde}: motivo desconocido {m!r} (valen: {', '.join(MOTIVOS)})")
        if len(set(motivos)) != len(motivos):
            raise MarcasMal(f"{donde}: un motivo está repetido")
        _fecha(marca.get("fecha"), donde)
        if "titulo" in marca and not isinstance(marca["titulo"], str):
            raise MarcasMal(f"{donde}: 'titulo' debe ser un texto")
        salida[codigo] = list(motivos)
    revisados = datos.get("revisados", {})
    if not isinstance(revisados, dict):
        raise MarcasMal("'revisados' debe ser un objeto {código: fecha}")
    for codigo, fecha in revisados.items():
        donde = f"revisado {codigo!r}"
        _codigo(codigo, donde, conocidos)
        _fecha(fecha, donde)
        if codigo in salida:
            raise MarcasMal(f"{donde}: está a la vez marcado y revisado como bien; tiene que ser uno de los dos")
    return salida


def sin_repetidos(pares):
    """json.loads se queda en silencio con la última de dos claves repetidas: aquí, aborta."""
    vistos = {}
    for clave, valor in pares:
        if clave in vistos:
            raise MarcasMal(f"la clave {clave!r} está repetida (¿el mismo video marcado dos veces?)")
        vistos[clave] = valor
    return vistos


def desconocidos(marcados, conocidos):
    """Códigos marcados que no aparecen en datos/: no esconden nada (aviso, no error)."""
    return sorted(set(marcados) - set(conocidos))


def leer(ruta=None, conocidos=None):
    """Lee y valida el archivo (por defecto, ARCHIVO). Si no existe, no hay marcas (no es un error)."""
    ruta = Path(ruta or ARCHIVO)
    if not ruta.exists():
        return {}
    try:
        datos = json.loads(ruta.read_text(encoding="utf-8"), object_pairs_hook=sin_repetidos)
    except (OSError, ValueError) as e:
        raise MarcasMal(f"no se pudo leer {ruta.name}: {e}") from None
    return validar(datos, conocidos)
