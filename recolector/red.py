"""Piezas comunes para pedir datos a internet. Solo usa la biblioteca estándar de Python."""
import json
import urllib.error
import urllib.request
from datetime import timezone

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/130 Safari/537.36"


class Falla(Exception):
    """Una fuente no respondió como se esperaba.

    El mensaje se guarda en los datos como "hueco": nunca debe llevar claves ni direcciones
    que las contengan.
    """


def pedir(url, cabeceras=None, datos=None, abridor=None, espera=30):
    """Devuelve (codigo, texto). Los errores HTTP no lanzan excepción."""
    req = urllib.request.Request(url, data=datos, headers={"User-Agent": UA, **(cabeceras or {})})
    try:
        abrir = abridor.open if abridor else urllib.request.urlopen
        with abrir(req, timeout=espera) as r:
            return r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace")
    except urllib.error.URLError as e:
        raise Falla(f"sin conexión ({type(e.reason).__name__})") from None
    except TimeoutError:
        raise Falla(f"no respondió en {espera} segundos") from None


def pedir_json(url, nombre, cabeceras=None, datos=None, abridor=None):
    """Pide un JSON. Si el código no es 200 o la respuesta no es JSON, lanza Falla."""
    cod, txt = pedir(url, cabeceras, datos, abridor)
    if cod != 200:
        raise Falla(f"{nombre}: código {cod}")
    try:
        return json.loads(txt)
    except ValueError:
        raise Falla(f"{nombre}: la respuesta no es JSON") from None


def a_iso(dt):
    """Fecha y hora en UTC con el formato de los datos: 2026-11-19T03:00:00Z."""
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
