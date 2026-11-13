"""Mide si una parte animada de la página parpadea: toma 40 capturas seguidas y calcula cuánto
cambia el brillo medio de una a la siguiente. Un movimiento suave cambia poco y parejo; un
parpadeo da saltos. Así se midió el suelo de Miami 1986 (tarea 2.3): el salto máximo bajó
de 1,8 (original) a 0,25 (dibujado en un lienzo). Compara siempre antes y después.

Uso:  python pruebas/medir_parpadeo.py [selector] [ancho]
      (por defecto ".escena-80 .suelo" a 1280 px; el estilo 1986 viene puesto al abrir)
"""
import io
import statistics
import sys

from PIL import Image
from playwright.sync_api import sync_playwright

from navegador import CAPTURAS, PAGINA, abrir, preparar_salida


def main():
    preparar_salida()
    selector = sys.argv[1] if len(sys.argv) > 1 else ".escena-80 .suelo"
    ancho = int(sys.argv[2]) if len(sys.argv) > 2 else 1280
    with sync_playwright() as p:
        nav = abrir(p)
        pg = nav.new_page(viewport={"width": ancho, "height": 900})
        pg.goto(PAGINA.as_uri())
        pg.wait_for_timeout(1500)
        b = pg.locator(selector).first.bounding_box()
        clip = {"x": b["x"], "y": b["y"], "width": b["width"], "height": min(b["height"], 900 - b["y"])}
        brillos = []
        for i in range(40):
            img = Image.open(io.BytesIO(pg.screenshot(clip=clip))).convert("L")
            brillos.append(statistics.fmean(img.get_flattened_data() if hasattr(img, "get_flattened_data") else img.getdata()))
            if i == 0:
                img.save(CAPTURAS / f"parpadeo_{ancho}.png")
            pg.wait_for_timeout(40)
        nav.close()
    saltos = [abs(b - a) for a, b in zip(brillos, brillos[1:])]
    print(f"{selector} a {ancho}px: brillo medio {statistics.fmean(brillos):.1f}; salto entre capturas: "
          f"medio {statistics.fmean(saltos):.2f}, máximo {max(saltos):.2f}")


if __name__ == "__main__":
    main()
