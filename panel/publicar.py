"""Borrador y "Publicar" del panel de videos (Fase 10, tarea 10.2).

- El borrador (lo que Bruno marcó y aún no publicó) va en panel/borrador.json, ignorado por git:
  no ensucia el repositorio, no frena el aviso de "cambios sin guardar" ni choca con datos/.
- "Publicar" valida con recolector/marcas.py (la única validación), escribe
  recolector/marcas_videos.json, hace commit SOLO de ese archivo, trae lo nuevo de GitHub
  (pull --rebase; si choca, lo deshace y avisa; se niega si hay otros cambios sin guardar) y sube. Solo desde la rama main.
- Si algo falla, el borrador se queda en el PC: nada se pierde, y una sesión de Claude puede
  subirlo después.
"""
import json
import subprocess
import sys
from datetime import date
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ / "recolector"))
import marcas  # noqa: E402

AYUDA_POR_DEFECTO = [
    "Videos de YouTube que Bruno marcó (Fase 10). Lo escribe el panel de videos (panel_videos.bat); "
    "también se puede editar a mano. Lo revisa recolector/marcas.py.",
]


class NoSePudo(Exception):
    """Falló un paso de Publicar. El mensaje dice cuál y qué quedó."""


def ruta_borrador(raiz):
    return Path(raiz) / "panel" / "borrador.json"


def ruta_marcas(raiz):
    return Path(raiz) / "recolector" / marcas.ARCHIVO.name


def git(raiz, *args, permitir_fallo=False):
    r = subprocess.run(["git", *args], cwd=raiz, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.returncode != 0 and not permitir_fallo:
        raise NoSePudo(f"git {' '.join(args)}: {(r.stderr or r.stdout).strip()[:500]}")
    return r


def rama(raiz):
    return git(raiz, "rev-parse", "--abbrev-ref", "HEAD").stdout.strip()


def por_subir(raiz):
    """Commits del PC que GitHub todavía no tiene (sin conectarse). None si no se sabe."""
    r = git(raiz, "rev-list", "--count", "@{u}..HEAD", permitir_fallo=True)
    return int(r.stdout.strip()) if r.returncode == 0 and r.stdout.strip().isdigit() else None


def traer(raiz):
    """Al abrir el panel: trae lo nuevo de GitHub, solo si no hay que mezclar nada."""
    r = git(raiz, "pull", "--ff-only", "--quiet", permitir_fallo=True)
    return "ok" if r.returncode == 0 else (r.stderr or r.stdout).strip()[:300]


def contenido_completo(raiz, estado):
    """estado: {"videos": {...}, "revisados": {...}} -> el archivo entero, con su ayuda.
    (Otras claves del estado, como la "base" del borrador, no van al archivo.)"""
    if not isinstance(estado, dict):
        raise marcas.MarcasMal("lo enviado debe ser un objeto con 'videos' y 'revisados'")
    archivo = ruta_marcas(raiz)
    ayuda = AYUDA_POR_DEFECTO
    if archivo.exists():
        try:
            ayuda = json.loads(archivo.read_text(encoding="utf-8")).get("ayuda", ayuda)
        except ValueError:
            pass
    salida = {"videos": estado.get("videos", {})}
    if estado.get("revisados"):
        salida["revisados"] = estado["revisados"]
    salida["ayuda"] = ayuda
    return salida


def leer_borrador(raiz):
    p = ruta_borrador(raiz)
    if not p.exists():
        return None
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except ValueError:
        return None


def guardar_borrador(raiz, estado, conocidos=None):
    """Valida (para no guardar algo que después no se podría publicar) y guarda el borrador."""
    marcas.validar(contenido_completo(raiz, estado), conocidos)
    base = estado.get("base")
    if base is not None and not (isinstance(base, dict) and isinstance(base.get("videos"), dict)):
        raise marcas.MarcasMal("la 'base' del borrador no es válida")
    p = ruta_borrador(raiz)
    p.parent.mkdir(exist_ok=True)
    tmp = p.with_suffix(".tmp")
    tmp.write_text(json.dumps(estado, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(p)


def descartar_borrador(raiz):
    ruta_borrador(raiz).unlink(missing_ok=True)


def publicar(raiz, estado, conocidos):
    """Publica el estado. Devuelve un texto con lo que pasó. Lanza NoSePudo si algo falla."""
    raiz = Path(raiz)
    contenido = contenido_completo(raiz, estado)
    try:
        marcas.validar(contenido, conocidos)
    except marcas.MarcasMal as e:
        raise NoSePudo(f"las marcas no son válidas, no se publicó nada: {e}") from None
    actual = rama(raiz)
    if actual != "main":
        raise NoSePudo(f"el PC está en la rama {actual!r}: el panel solo publica desde main (la página sale de main)")
    archivo = ruta_marcas(raiz)
    texto = json.dumps(contenido, ensure_ascii=False, indent=2) + "\n"
    relativo = archivo.relative_to(raiz).as_posix()
    r = git(raiz, "fetch", "--quiet", permitir_fallo=True)
    if r.returncode != 0:
        raise NoSePudo("no se pudo conectar con GitHub (¿sin internet?); no se publicó nada y tu borrador sigue guardado. "
                       f"Detalle: {(r.stderr or r.stdout).strip()[:200]}")
    # El panel solo sube marcas. Si el PC tiene otros commits sin subir (trabajo de una sesión de
    # Claude, un merge, un commit vacío…), no los sube a escondidas: avisa (revisión del 18 nov).
    for linea in filter(None, git(raiz, "rev-list", "--parents", "@{u}..HEAD").stdout.splitlines()):
        h, *padres = linea.split()
        tocados = [f for f in git(raiz, "diff-tree", "--no-commit-id", "--name-only", "-r", "-z", h).stdout.split("\0") if f]
        if len(padres) != 1 or tocados != [relativo]:
            raise NoSePudo(f"el PC tiene otros commits sin subir ({h[:7]}): el panel solo sube marcas y no los sube por su "
                           "cuenta. Súbelos antes o pídeselo a Claude. Tu borrador sigue guardado.")
    # Tampoco publica con otros archivos cambiados sin guardar: juntar con GitHub podría dejarlos
    # a medias (con marcas de conflicto) sin que se note.
    sucios = [l[3:] for l in git(raiz, "status", "--porcelain", "--untracked-files=no").stdout.splitlines()]
    if relativo in [x.strip('"') for x in sucios]:
        raise NoSePudo(f"{relativo} tiene cambios sin guardar hechos fuera del panel (¿a mano o por Claude?): "
                       "el panel no los pisa. Guárdalos o descártalos antes (pídeselo a Claude). Tu borrador sigue guardado.")
    if sucios:
        raise NoSePudo("el PC tiene otros archivos cambiados sin guardar (" + ", ".join(sucios[:4]) +
                       "): guárdalos antes o pídeselo a Claude. Tu borrador sigue guardado.")
    n, m = len(contenido["videos"]), len(contenido.get("revisados", {}))
    en_head = git(raiz, "show", f"HEAD:{relativo}", permitir_fallo=True)
    # Se compara con lo guardado en git (no con el disco): así un archivo escrito pero sin commit
    # no pasa por "ya publicado".
    cambio = not (en_head.returncode == 0 and en_head.stdout.replace("\r\n", "\n") == texto)
    if cambio:
        tmp = archivo.with_name(archivo.name + ".tmp")
        tmp.write_text(texto, encoding="utf-8", newline="\n")
        tmp.replace(archivo)
        try:
            git(raiz, "add", "--", relativo)
            git(raiz, "commit", "--quiet", "-m",
                f"Marcas de videos: {n} marcados, {m} revisados (panel, {date.today().isoformat()})\n\n"
                "Hecho desde el panel de videos (Fase 10). Solo cambia recolector/marcas_videos.json.",
                "--", relativo)
        except NoSePudo as e:   # el archivo vuelve a como estaba; lo marcado sigue en el borrador
            git(raiz, "reset", "--quiet", "--", relativo, permitir_fallo=True)
            git(raiz, "checkout", "--", relativo, permitir_fallo=True)
            raise NoSePudo(f"no se pudo guardar en el PC (commit): {e}. No se publicó nada y tu borrador sigue guardado.") from None
    if not int(git(raiz, "rev-list", "--count", "@{u}..HEAD").stdout.strip() or 0):
        descartar_borrador(raiz)
        return "No había cambios nuevos; todo está subido a GitHub."
    r = git(raiz, "pull", "--rebase", "--quiet", permitir_fallo=True)
    if r.returncode != 0:
        git(raiz, "rebase", "--abort", permitir_fallo=True)
        raise NoSePudo("se guardó en el PC (commit hecho), pero no se pudo juntar con lo nuevo de GitHub: "
                       f"{(r.stderr or r.stdout).strip()[:300]}. Pídele a Claude que lo suba.")
    # Juntado con GitHub, el archivo puede haber cambiado (alguien lo editó allá): se revisa otra
    # vez, para no subir algo que haga abortar la publicación de la página.
    try:
        marcas.leer(archivo)
    except marcas.MarcasMal as e:
        raise NoSePudo(f"juntado con lo nuevo de GitHub, el archivo de marcas no es válido ({e}): no se subió. "
                       "Pídele a Claude que lo revise.") from None
    r = git(raiz, "push", "--quiet", permitir_fallo=True)
    if r.returncode != 0:
        raise NoSePudo("se guardó en el PC (commit hecho), pero no se pudo subir a GitHub: "
                       f"{(r.stderr or r.stdout).strip()[:300]}. Vuelve a pulsar Publicar más tarde, o pídele a Claude que lo suba.")
    descartar_borrador(raiz)
    if not cambio:
        return "Se terminó de subir a GitHub lo que había quedado pendiente. La página se actualiza en unos minutos."
    return f"Publicado: {n} marcados y {m} revisados. La página se actualiza en unos minutos."
