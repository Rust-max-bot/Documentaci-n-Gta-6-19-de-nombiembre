"""Prueba de Kick (tarea 6.6). No guarda nada: solo muestra qué responde la API oficial.

Pide una clave temporal con KICK_CLIENT_ID y KICK_CLIENT_SECRET (nunca se imprimen), busca la
categoría de GTA 6 por nombre y suma los espectadores de sus directos.
"""
import json
import os
import sys
import urllib.parse

from red import Falla, pedir, pedir_json

API = "https://api.kick.com/public"
NOMBRES = ("Grand Theft Auto VI", "Grand Theft Auto 6", "GTA VI", "GTA 6", "Grand Theft Auto V")


def main():
    cid, sec = os.environ.get("KICK_CLIENT_ID", ""), os.environ.get("KICK_CLIENT_SECRET", "")
    if not cid or not sec:
        sys.exit("Faltan KICK_CLIENT_ID o KICK_CLIENT_SECRET")
    cuerpo = urllib.parse.urlencode({"grant_type": "client_credentials", "client_id": cid, "client_secret": sec}).encode()
    cod, txt = pedir("https://id.kick.com/oauth/token", {"Content-Type": "application/x-www-form-urlencoded"}, cuerpo)
    print("Clave temporal: código", cod)
    if cod != 200:
        sys.exit("No se obtuvo la clave: " + txt[:200].replace(cid, "***").replace(sec, "***"))
    tok = json.loads(txt)
    cab = {"Authorization": "Bearer " + tok["access_token"], "Accept": "application/json"}
    print("Dura (segundos):", tok.get("expires_in"))

    for nombre in NOMBRES:
        cod, txt = pedir(f"{API}/v2/categories?name={urllib.parse.quote(nombre)}", cab)
        print(f"\nCategorías con nombre «{nombre}»: código {cod}")
        try:
            for c in json.loads(txt).get("data", [])[:10]:
                print("  ", c.get("id"), c.get("name"), c.get("tags"))
        except ValueError:
            print("  respuesta no es JSON:", txt[:150])

    # Directos de la categoría de GTA 6 (si se encontró por el nombre más probable).
    cod, txt = pedir(f"{API}/v2/categories?name={urllib.parse.quote('Grand Theft Auto VI')}", cab)
    datos = json.loads(txt).get("data", []) if cod == 200 else []
    exactas = [c for c in datos if "vi" in c.get("name", "").lower().split() or "6" in c.get("name", "")]
    if not exactas:
        print("\nNo apareció una categoría de GTA 6: no se pueden contar directos todavía.")
        return
    cat = exactas[0]
    print("\nCategoría elegida:", cat["id"], cat["name"])
    total, directos, cursor, ejemplo = 0, 0, "", False
    for _ in range(5):
        url = f"{API}/v2/livestreams?category_id={cat['id']}&limit=1000" + (f"&cursor={cursor}" if cursor else "")
        cod, txt = pedir(url, cab)
        print("Directos: código", cod)
        if cod != 200:
            print(txt[:200]); break
        r = json.loads(txt)
        for d in r.get("data", []):
            directos += 1; total += d.get("viewer_count", 0)
        if directos and not ejemplo:   # 9.10: ¿viene la foto de perfil? (solo se muestran nombres de campos y la foto, que es pública)
            d = r["data"][0]; ejemplo = True
            print("Campos de cada directo:", sorted(d.keys()))
            bu = d.get("broadcaster_user") or {}
            print("Campos de broadcaster_user:", sorted(bu.keys()))
            print("Foto de perfil de ejemplo:", bu.get("profile_picture"))
            con = sum(1 for x in r["data"] if (x.get("broadcaster_user") or {}).get("profile_picture"))
            print(f"Directos de esta página con foto: {con} de {len(r['data'])}")
            hosts = sorted({urllib.parse.urlparse((x.get('broadcaster_user') or {}).get('profile_picture') or '').netloc for x in r['data']})
            print("Sitios de las fotos:", hosts)
        cursor = (r.get("pagination") or {}).get("next_cursor") or ""
        if not cursor:
            break
    print(f"Directos en vivo ahora: {directos}; espectadores sumados: {total}")
    # 9.10: la función real del recolector (sin guardar nada) y su validación.
    import fuentes, validar
    res = fuentes.kick({})
    validar._kick(res)
    con = [c for c in res["canales"] if c.get("foto")]
    print(f"fuentes.kick(): {len(res['canales'])} canales guardados, {len(con)} con foto de files.kick.com; validación: bien")


if __name__ == "__main__":
    try:
        main()
    except Falla as e:
        sys.exit(str(e))
