"""Авторские векторные детали Q3C. Python stdlib, без внешних источников.

Запуск: python assets/production-v1/source/export_parts.py из каталога Q3C.
SVG имеют 4 пикселя на единицу рига. Повторный экспорт заменяет только
перечисленные в этом источнике собственные SVG и их индекс.
"""

from __future__ import annotations

import json
import math
from pathlib import Path
from xml.etree import ElementTree

PACK = Path(__file__).resolve().parents[1]
PARTS = PACK / "parts"
PX_PER_UNIT = 4

METALS = {
    "brass": ["#3b2920", "#a06936", "#edcb8b", "#f7dba5", "#b08144", "#75502b", "#2a221b"],
    "copper": ["#321e1b", "#8c4a35", "#d99b70", "#eac1a0", "#9b553d", "#573329", "#231b1a"],
    "steel": ["#1b2425", "#5c6969", "#c5cdc4", "#f4ead2", "#87918c", "#474b4b", "#202324"],
    "gilt": ["#795126", "#f8daa0", "#f9ebbb", "#d5a05b", "#895c33", "#ecc78a", "#5d4027"],
    "dark": ["#151b1c", "#354146", "#5b5848", "#413a31", "#302a25", "#1d1c1a", "#101616"],
}


def gradient(name, colors, direction=(0.15, 0, 0.75, 1), stops=(0, .16, .33, .43, .63, .82, 1)):
    x1, y1, x2, y2 = direction
    body = ''.join(f'<stop offset="{t}" stop-color="{c}"/>' for t, c in zip(stops, colors, strict=True))
    return f'<linearGradient id="{name}" x1="{x1*100}%" y1="{y1*100}%" x2="{x2*100}%" y2="{y2*100}%">{body}</linearGradient>'


DEFS = ''.join(gradient(name, colors) for name, colors in METALS.items()) + '''
<linearGradient id="enamel" x1="25%" y1="0%" x2="73%" y2="100%">
  <stop stop-color="#183038"/><stop offset=".19" stop-color="#446367"/>
  <stop offset=".35" stop-color="#324f55"/><stop offset=".58" stop-color="#1d363d"/>
  <stop offset=".84" stop-color="#10282f"/><stop offset="1" stop-color="#0c1b21"/>
</linearGradient>
<linearGradient id="enamel-sheen" x1="21%" y1="0%" x2="70%" y2="100%">
  <stop stop-color="#c0d1c7" stop-opacity=".46"/>
  <stop offset=".36" stop-color="#88a29d" stop-opacity=".13"/>
  <stop offset=".65" stop-color="#9eb8ad" stop-opacity="0"/>
</linearGradient>
<linearGradient id="cavity" x1="0%" y1="0%" x2="17%" y2="100%">
  <stop stop-color="#090d10"/><stop offset=".42" stop-color="#1d2424"/>
  <stop offset=".8" stop-color="#352d24"/><stop offset="1" stop-color="#554033"/>
</linearGradient>
<radialGradient id="medallion" cx="32%" cy="29%" r="74%">
  <stop stop-color="#ffe3a2"/><stop offset=".38" stop-color="#bd874c"/>
  <stop offset=".72" stop-color="#694829"/><stop offset="1" stop-color="#251a15"/>
</radialGradient>
<radialGradient id="amber" cx="44%" cy="62%" r="64%">
  <stop stop-color="#fff3b0"/><stop offset=".23" stop-color="#ffc65f"/>
  <stop offset=".53" stop-color="#cf761e"/><stop offset=".76" stop-color="#8e4414"/>
  <stop offset=".93" stop-color="#271c16"/><stop offset="1" stop-color="#140f0e"/>
</radialGradient>
<radialGradient id="glass-sheen" cx="29%" cy="21%" r="69%">
  <stop stop-color="#fff9d9" stop-opacity=".9"/>
  <stop offset=".30" stop-color="#ffe3a8" stop-opacity=".23"/>
  <stop offset=".66" stop-color="#ffd38b" stop-opacity="0"/>
</radialGradient>
<pattern id="engine-turn" x="0" y="0" width="5.6" height="5.6" patternUnits="userSpaceOnUse">
  <path d="M-1 2.8 Q2.8-1 6.6 2.8 M-1 5.6 Q2.8 1.8 6.6 5.6" fill="none" stroke="#f7d6a0" stroke-width=".18" opacity=".25"/>
</pattern>
'''

INDEX = {}


def path(d, fill="none", stroke=None, width=0.65, more=""):
    line = f' stroke="{stroke}" stroke-width="{width}" stroke-linejoin="round" stroke-linecap="round"' if stroke else ''
    return f'<path d="{d}" fill="{fill}"{line} {more}/>'


def ellipse(x, y, rx, ry, fill, stroke=None, width=.55, more=""):
    line = f' stroke="{stroke}" stroke-width="{width}"' if stroke else ''
    return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{fill}"{line} {more}/>'


def group(content, transform=None, more=""):
    matrix = f' transform="{transform}"' if transform else ''
    return f'<g{matrix} {more}>{content}</g>'


def clip(identifier, geometry):
    return f'<clipPath id="{identifier}">{geometry}</clipPath>'


def rivet(x, y, r=1.15, slit=True):
    recess = ellipse(x + .24, y + .36, r + .42, r + .31, "#1b1715")
    pin = ellipse(x, y, r, r * .88, "url(#medallion)", "#79583a", .23)
    flash = path(f"M{x-r*.58:.2f} {y-r*.24:.2f} q{r*.31:.2f} {-r*.46:.2f} {r*.72:.2f} {-r*.41:.2f}", stroke="#ffe9b7", width=.23)
    slot = path(f"M{x-r*.50:.2f} {y+r*.32:.2f} l{r*.94:.2f} {-r*.56:.2f}", stroke="#422b1b", width=.32) if slit else ''
    return recess + pin + flash + slot


def rivets(points, r=1.1):
    return ''.join(rivet(x, y, r) for x, y in points)


def filigree(x, y, scale=1, angle=0):
    # Одна и та же гравировка вогнута в металл. Светлая сторона смещена
    # на долю единицы, чтобы рисунок читался как травление.
    stems = "M0 0 C7-2 11-8 17-8 C22-8 23-3 20-2 C17 0 14-3 16-4 M7-3 C10-1 16 1 20-1 M10-5 C12-10 10-13 7-13 C4-12 5-8 7-9 M17-8 C19-13 25-14 27-10 C29-7 26-4 24-6 M22-9 C24-11 29-12 33-10"
    leaf = "M8-4 C5-8 2-8 1-6 C4-5 6-3 8-4 M13-6 C14-11 18-13 20-12 C18-9 15-7 13-6 M22-9 C24-15 27-17 31-15 C29-12 26-10 22-9 M24-7 C29-8 33-7 36-4 C31-3 28-5 24-7"
    dark = path(stems, stroke="#2b211b", width=.79) + path(leaf, "#392a20")
    bright = path(stems, stroke="#e5bb78", width=.5) + path(leaf, "url(#gilt)", "#9f7143", .24)
    return group(group(dark, "translate(.25 .42)") + bright, f"translate({x} {y}) rotate({angle}) scale({scale})")


def export(name, title, viewbox, artwork, defs="", *, far=False, material=None):
    if name in INDEX:
        raise ValueError(f"Duplicate part {name}")
    x, y, width, height = viewbox
    content = artwork
    if far:
        # Накладка внутри собственной формы сохраняет прозрачный фон.
        content = group(content, more='filter="url(#depth-shade)"')
        defs += '<filter id="depth-shade" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="linear" slope=".75"/><feFuncG type="linear" slope=".79"/><feFuncB type="linear" slope=".81"/></feComponentTransfer></filter>'
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{width*PX_PER_UNIT}" height="{height*PX_PER_UNIT}" '
           f'viewBox="{x} {y} {width} {height}">\n<title>{title}</title>\n<defs>{DEFS}{defs}</defs>\n{content}\n</svg>\n')
    ElementTree.fromstring(svg)
    (PARTS / f"{name}.svg").write_text(svg, encoding="utf-8", newline="\n")
    INDEX[name] = {
        "path": f"production-v1/parts/{name}.svg",
        "viewBox": list(viewbox),
        "pixelSize": [width * PX_PER_UNIT, height * PX_PER_UNIT],
        "pivotLocal": [0, 0],
        "spriteAnchor": [-x / width, -y / height],
        "material": material or "aged-brass/petrol-enamel",
    }


SHELL = "M-90-12 L-90-39 C-90-52-86-62-82-66 L-64-80 Q-49-87-32-90 Q-12-91 4-88 L35-81 Q64-70 90-57 L90-12 L55-5 H-55Z"
BODY_VB = (-95, -95, 190, 100)
NEAR_GATE_SHAPE = "M-67-95 H50 V-40 H68 V-32.3 H-67Z"
FACE_SHAPE = "M50-86 H96 V-40 H50Z"
FIXED_SHAPE = "M-95-95 H-67 V-35 H68 V-40 H96 V2 H-95Z M-89-28 H-3 V3 H-89Z M3-28 H89 V3 H3Z"


def shell_finish():
    rim = path(SHELL, "url(#brass)", "#241d18", 1.2)
    enamel = path("M-86-17 L-86-39 C-84-56-77-67-62-76 Q-44-87-31-86 Q-10-88 3-84 L35-77 Q66-66 86-55 L86-17 L54-9 H-54Z", "url(#enamel)", "#e1b577", .78)
    seam = path("M-88-36 C-59-47-32-47-2-51 C22-53 49-53 87-46", stroke="#0c161b", width=4.2)
    seam += path("M-88-37 C-59-48-32-48-2-52 C22-54 49-54 87-47", stroke="url(#gilt)", width=2.15)
    sheen = path("M-82-48 C-70-71-41-83-19-83 C3-84 19-76 43-71 C15-69-10-68-34-63 Q-61-58-82-48Z", "url(#enamel-sheen)")
    sheen += path("M-74-62 C-59-75-44-79-28-80 M-26-80 C-13-81-3-79 6-77", stroke="#b6c6b9", width=.62, more='opacity=".62"')
    shadow = path("M-87-21 Q-62-18-50-21 Q-15-26 31-21 Q64-17 88-27 V-10 L57-5 H-57Z", "#0e2024", more='opacity=".47"')
    bottom = path("M-88-16 Q-69-11-52-11 H53 L88-17 L88-12 L54-6 H-54Z", "url(#brass)", "#1c1a17", .56)
    scroll = filigree(-80, -50, .82, -32) + filigree(-76, -22, .65, -15)
    scroll += filigree(29, -64, .64, 14) + filigree(43, -25, .65, -12)
    garnish = path("M-61-74 Q-47-84-30-84 M14-79 Q40-75 67-64 M-54-13 H45", stroke="#a77d4d", width=.58, more='opacity=".8"')
    garnish += path("M-24-49 l2 9 h8 l1-10 M46-53 l1 9 h8 l2-8", "url(#brass)", "#241b15", .65)
    garnish += path("M-21-47 v5 h5 v-5 M48-51 v5 h5 v-5", stroke="#f5d89b", width=.5)
    garnish += rivets([(-82, -32), (-65, -38), (-34, -48), (8, -53), (32, -52), (71, -48), (84, -29), (-52, -12), (50, -12)], .9)
    return rim + enamel + sheen + shadow + seam + scroll + garnish + bottom


def hatch_back(region, rim):
    inset = path(SHELL, "url(#dark)", "#1b1714", .85)
    braces = path("M-65-31 L-42-78 L-28-82 L-49-31 M-32-32 L-8-82 L5-80 L-18-32 M7-32 L32-73 L44-68 L20-32 M49-35 L63-63 L75-58 L61-35", "url(#copper)", "#3b2922", .7)
    bracing = path("M-67-39 Q-19-62 40-53 L74-43 M-66-35 Q-21-47 45-43 L74-37", stroke="#b38a57", width=1.25)
    return group(inset + braces + bracing + rivets([(-51,-48), (-11,-54), (23,-49), (60,-43)]), more=f'clip-path="url(#{region})"') + rim


def export_body():
    # Отделённые крышки используют единый рисунок оболочки. Замкнутый
    # стык сохраняет линии эмали и гравировку по обе стороны шва.
    for depth in ("near", "far"):
        far = depth == "far"
        fixed = group(shell_finish(), more='clip-path="url(#fixed-panel)"')
        fixed += path("M-67-68 L-67-35 H68 L68-40 M-66-34 H66", stroke="url(#gilt)", width=.88)
        fixed += path("M-88-28 H-4 M4-28 H88 M-3-27 V-8 M3-27 V-8", stroke="url(#gilt)", width=.74)
        export(f"shell-fixed-{depth}", f"Shell fixed rim {depth}", BODY_VB, fixed,
               clip("fixed-panel", path(FIXED_SHAPE, more='clip-rule="evenodd"')), far=far)
        gate_rim = path("M-66.6-68 L-66.6-35.15 H67.3 V-39.8 H50.4 L50.4-74.6", stroke="#7e562f", width=.8)
        gate_rim += path("M-65.8-67 L-65.8-36.4 H65.8 M51.2-41 V-73.4", stroke="#e7c589", width=.49)
        gate_hinges = ''.join(path(f"M{x-3}-36 q0-2 3-2 h4 q2 0 2 2 v3 h-9Z", "url(#brass)", "#301d17", .53) for x in (-54, 24))
        artwork = group(shell_finish(), more='clip-path="url(#side-panel)"') + gate_rim + gate_hinges
        # В исходном рисунке шарнирная линия y=-35. SVG локально y=0.
        export(f"shell-gate-{depth}", f"Opening shell cheek {depth}", (-95,-60,190,69), group(artwork, "translate(0 35)"), clip("side-panel", path(NEAR_GATE_SHAPE)), far=far)
        export(f"shell-gate-back-{depth}", f"Inside of cheek {depth}", (-95,-60,190,69), group(hatch_back("side-panel", gate_rim) + gate_hinges, "translate(0 35)"), clip("side-panel", path(NEAR_GATE_SHAPE)), far=far)

    front_hatch = group(shell_finish(), more='clip-path="url(#front-panel)"')
    front_hatch += path("M50.3-75 V-40.4 H89.4", stroke="url(#gilt)", width=1.08)
    front_hatch += rivet(57.8,-70,1.4) + rivet(86.0,-45,1.12)
    face_bracket = path("M51-71 L51-75 Q53-77.8 55-77.8 Q59-77.8 60-75 L60-69Z", "url(#brass)", "#32231a", .62) + rivet(54,-75,1.63)
    export("shell-front-hatch", "Independent forward shell hatch", (-9,-12,51,53), group(front_hatch + face_bracket, "translate(-54 75)"), clip("front-panel", path(FACE_SHAPE)))
    export("shell-front-hatch-back", "Inside of forward hatch", (-9,-12,51,53), group(hatch_back("front-panel", path("M50.3-75 V-40.4 H89.4", stroke="url(#brass)", width=1)) + face_bracket, "translate(-54 75)"), clip("front-panel", path(FACE_SHAPE)))

    for section, origin, shape, rails in (
        ("rear", -62, "M-67-79 Q-52-87-32-90 Q-17-91-3-89 L-3-79 Q-17-79-32-80 Q-53-78-67-72Z", "M-63-79 Q-44-87-31-87 Q-18-88-7-86"),
        ("front", 47, "M-3-89 Q12-85 24-83.4 L24-78.5 Q44-73.4 63-64.9 L63-70 L68-68 L68-60 Q48-66 34-70 Q15-75-3-79Z", "M1-86 Q15-84 23-82.9 L24.6-78.1 Q43-73.1 62.4-64.6 L63.5-69.2 L66-67.9"),
    ):
        sweep = path(shape, "url(#brass)", "#261f19", .75)
        finish = group(shell_finish(), more='clip-path="url(#roof-panel)"')
        finish += path(rails, stroke="#e9c88c", width=.9)
        underpaint = path(shape, "url(#dark)", "#b08253", .85) + path(rails, stroke="url(#copper)", width=2.3)
        fittings = rivets([(-57,-77), (-11,-84)] if section == "rear" else [(15,-80),(59,-68)], .83)
        for face, art in (("front",sweep+finish),("back",underpaint)):
            export(f"roof-{section}-{face}", f"Independent {section} roof plate {face}", (-66,-61,145,69),
                   group(art+fittings, f"translate({-origin} 35)"), clip("roof-panel", path(shape)), far=section == "rear")

    liner = path("M-67-70 Q-53-81-31-84 Q20-84 54-71 L68-63 V-35 H-67Z", "url(#cavity)", "#765637", .7)
    liner += path("M-63-40 H63 M-60-44 H62 M-49-45 L-42-67 M-18-45 L-10-72 M16-44 L22-69 M43-45 L47-63", stroke="url(#dark)", width=1.6)
    liner += rivets([(-63,-39),(-46,-42),(40,-42),(63,-38)], .76)
    export("rapt-pocket", "Recessed curved forearm bay", BODY_VB,
           group(liner, more='clip-path="url(#optic-clearance)"'),
           clip("optic-clearance", path(NEAR_GATE_SHAPE)), material="dark bronze")

    belly = path("M-71-23 H-51 L-41-17 H41 L51-23 H71 L67-13 L58-7 H-58 L-67-13Z", "url(#brass)", "#261e18", .9)
    belly += path("M-60-11 L-52-9 H52 L60-11 M-59-18 L-44-15 H43 L58-18", stroke="#e7c38d", width=.63)
    belly += path("M-28-14 H28 V-9 H-28Z", "url(#dark)", "#96704a", .54) + rivets([(-61,-15),(-40,-11),(-29,-11),(29,-11),(40,-11),(61,-15)], .8)
    export("belly-rim", "Continuous lower metal seam and frame lip", (-78,-27,156,24), belly)

    back = path("M-88-13 L-88-44 Q-64-76-31-80 Q20-83 72-53 L87-41 V-12 L54-6 H-54Z", "url(#cavity)", "#151617", 1.15)
    back += path("M-85-18 Q-51-12-29-14 H57 L86-18 M-83-30 Q-58-46-30-44 L58-42", stroke="url(#dark)", width=4.5)
    back += path("M-65-22 L-62-42 M-49-19 L-46-47 M-34-17 L-31-47 M-19-17 L-16-46 M-4-17 L-1-45 M11-17 L14-44 M26-17 L29-43 M41-17 L44-42 M56-17 L59-40", stroke="#6b5340", width=.8)
    export("shell-interior", "Recessed bronze shell interior", BODY_VB, back, material="dark bronze")

    cradle = path("M-76-26 L-68-30 H-45 L-39-24 H45 L50-30 H70 L76-26 V-12 L69-7 H-69 L-76-12Z", "url(#brass)", "#211b17", .9)
    cradle += path("M-69-22 H68 L63-13 H-63Z", "url(#cavity)", "#b88d56", .61)
    cradle += path("M-62-17 H62 M-62-13 H62 M-66-25 H-43 M46-25 H69", stroke="#e0b679", width=.65, more='opacity=".7"')
    cradle += path("M-50-12 l5-7 h7 l-4 7 M-25-12 l5-7 h7 l-4 7 M0-12 l5-7 h7 l-4 7 M25-12 l5-7 h7 l-4 7 M50-12 l5-7 h7 l-4 7", "url(#copper)")
    cradle += rivets([(-69,-20),(-52,-26),(-40,-11),(-7,-11),(40,-11),(55,-26),(69,-20)],1.0)
    export("cradle", "Load-bearing lower chassis", (-80,-34,160,31), cradle)

    well = path("M-20-19 Q-11-25 5-24 Q20-24 27-14 L29 6 Q22 18 6 20 L-12 15 Q-22 8-23-3Z", "url(#brass)", "#211915", .95)
    well += path("M-17-15 Q-6-21 9-20 Q23-18 24-7 L24 6 Q19 15 5 15 L-9 11 Q-18 4-18-6Z", "url(#cavity)", "#372621", 1.3)
    well += path("M-17 0 Q-9 10 4 12 Q16 12 22 5", stroke="url(#copper)", width=2.5)
    well += rivets([(-16,-14), (17,-16), (24,-3), (12,15), (-13,9)])
    export("eye-well", "Dark optic socket and bearing rail", (-26,-28,58,52), well)

    latch = path("M-3-2 L3-3 Q7-2 9 2 L9 9 L5 13 L1 11 V5 H-3Z", "url(#gilt)", "#36271d", .67)
    latch += path("M0 2 H6 V8 L4 9", stroke="#65462a", width=.82) + rivet(1,0,1.23)
    export("buckle-latch", "Engraved hinge buckle", (-7,-7,20,25), latch)

    regulator = ellipse(0,0,8,8,"url(#dark)","#b18a54",.9)
    regulator += path("M-5-1 Q-4-6 1-5 Q6-4 5 0 Q4 6-1 5 Q-6 4-5-1Z", "url(#copper)", "#32221c", .53)
    regulator += ''.join(path("M0-5.5 V-2", stroke="#f2d09b", width=.8, more=f'transform="rotate({a})"') for a in range(0,360,60))
    regulator += rivet(0,0,1.6)
    export("regulator", "Visible wind-up governor", (-11,-11,22,22), regulator)

    for section, region in (("rear", "M-89-28 H-3 V3 H-89Z"), ("front", "M3-28 H89 V3 H3Z")):
        xmin, xmax = (-89,-3) if section == "rear" else (3,89)
        frame = path(f"M{xmin} -28 H{xmax} V-10 H{xmin+5} Q{xmin} -12 {xmin} -16Z", "url(#cavity)", "#785536", .64)
        frame += path(f"M{xmin+2} -25 H{xmax-2} M{xmin+3} -23 H{xmax-3}", stroke="url(#steel)", width=.68)
        frame += ''.join(path(f"M{x} -24 v9", stroke="#4d4235", width=.83) for x in range(xmin+7,xmax-4,11))
        export(f"leg-pocket-{section}", f"Recessed lower leg pocket {section}", BODY_VB, frame, material="dark bronze")
        for depth in ("near", "far"):
            far = depth == "far"
            rim = path(f"M{xmin+1} -27.6 H{xmax-1}", stroke="#dbb87d", width=.7)
            for face in ("front", "back"):
                paint = group(shell_finish(), more='clip-path="url(#lower-panel)"') if face == "front" else hatch_back("lower-panel", '')
                paint += rim + rivets([(xmin+5,-26.6),(xmax-5,-26.6)], .78)
                export(f"leg-gate-{section}-{depth}-{face}", f"{section} {depth} lower rail gate {face}",
                       (-95,-4,190,37), group(paint, "translate(0 28)"), clip("lower-panel", path(region)), far=far)


def export_optics():
    # Каретка и два штока сохраняют те же размеры при разном ходе.
    sleeve = path("M-27-4.8 L-24-6 H-2 L1-4 V4 L-2 6 H-24 L-27 4Z", "url(#copper)", "#211b1a", .85)
    sleeve += path("M-25-3.2 H-3 M-25 2.3 H-3", stroke="#e9b78a", width=.48)
    sleeve += path("M-6-5.8 H-2 L.2-3.8 V3.8 L-2 5.8 H-6Z", "url(#gilt)", "#4d2e20", .61)
    sleeve += path("M-23-5 V5 M-20-5 V5", stroke="#56392a", width=.51)
    export("carriage-sleeve", "Copper lens carriage sleeve", (-30,-9,34,18), sleeve, material="satin copper")

    for level, radius in ((1,3.3),(2,2.45)):
        shaft = path(f"M-18 {-radius} H-1.2 Q0 {-radius} 0 {-radius/2} V{radius/2} Q0 {radius} -1.2 {radius} H-18Z", "url(#steel)", "#2c3030", .46)
        shaft += path(f"M-16 {-radius*.51} H-3", stroke="#f2ead4", width=.52)
        shaft += path(f"M-4 {-radius-.3} H-1 V{radius+.3} H-4Z", "url(#brass)", "#63452e", .36)
        export(f"carriage-section-{level}", f"Telescopic optical stage {level}", (-21,-7,25,14), shaft, material="polished steel")

    head = path("M-8 10 Q-10 4-5-5 Q-1-9 7-9 L25-6 Q31-4 30 2 L26 9 L19 16 L15 16 L15 11 Q2 13-8 10Z", "url(#brass)", "#201915", .9)
    head += path("M-6 5 Q-4-4 2-5 L19-5 Q25-3 25 4 L19 9 Q3 12-6 5Z", "url(#dark)", "#d4a76d", .65)
    head += path("M24 3 L29 5 L20 15 L16 16 L19 10Z", "url(#gilt)", "#332219", .5)
    head += path("M-7 2 C-14 3-13 10-8 12 M-6 6 Q-11 9-7 11", stroke="url(#copper)", width=1.9)
    head += rivets([(-4,4), (5,-5), (25,-4), (21,10)], .88)
    export("head-chassis", "Sculpted triangular head and hinge sockets", (-17,-14,52,35), head)

    brow = path("M-10-3 Q-2-10 9-11 Q22-11 30-6 L33-1 L25-3 Q12-7 3-4 L-4-2Z", "url(#brass)", "#291c14", .79)
    brow += path("M-6-3 Q11-13 30-3", stroke="#f5daa3", width=.78)
    brow += path("M-3-3 Q13-10 28-3", stroke="#6e4729", width=.51)
    brow += filigree(1,-3,.65,-7) + rivets([(-3,-4), (26,-4)],.75)
    export("eye-brow", "Engraved optical brow crest", (-14,-17,53,19), brow)

    collar = ellipse(0,0,12,12,"url(#dark)","#2a1d17",.7)
    collar += ellipse(-.43,-.52,10.8,10.9,"url(#gilt)","#896039",.58)
    collar += ellipse(0,0,9.5,9.6,"url(#cavity)","#2f251c",1.0)
    collar += path("M-9.4-4.4 A10.4 10.4 0 0 1 4.3-9.5 M6.5 7.7 Q2 12-5.5 9.0", stroke="#ffe0a1", width=.72)
    collar += ''.join(rivet(10.4*math.cos(a),10.4*math.sin(a),.57,False) for a in (0,math.pi/2,math.pi,3*math.pi/2))
    export("eye-collar", "One optical lens housing", (-16,-16,32,32), collar)

    lens = ellipse(0,0,9,9,"url(#amber)","#50341b",.54)
    lens += ''.join(path(f"M{6.7*math.cos(a):.3f} {6.7*math.sin(a):.3f} L{8.5*math.cos(a):.3f} {8.5*math.sin(a):.3f}", stroke=col, width=.28, more='opacity=".63"') for index,(a,col) in enumerate((i*math.tau/43, "#fff0b1" if i%3 else "#5c310d") for i in range(43)))
    lens += ellipse(0,0,8.55,8.55,"url(#glass-sheen)")
    lens += path("M-5.2-5.5 Q-3.4-7.4-.5-7.25 M3.0 6.4 Q5.4 5.8 6.7 3.7", stroke="#fff0b8", width=.59, more='opacity=".72"')
    export("eye-glass", "Continuous amber optical glass", (-12,-12,24,24), lens, material="amber optical glass")

    pupil = path("M0-4.7 C1.4-4.5 2.0-2.4 1.7 .4 C1.5 2.9 .7 4.2 0 4.7 C-1.2 4.5-2.2 2.0-1.9-.8 C-1.6-3.3-.9-4.7 0-4.7Z", "#1c120c", "#9e5019", .44)
    pupil += ellipse(-.59,-2.65,.43,.73,"#fcd687",more='opacity=".8"')
    export("eye-pupil", "Independent moving iris pupil", (-5,-7,10,14), pupil, material="amber optical glass")
    glint = ellipse(-3.15,-3.85,1.87,1.08,"#fff4c5",more='transform="rotate(-32 -3.15 -3.85)" opacity=".94"') + ellipse(4.34,4.95,.63,.41,"#ffca6b",more='opacity=".8"')
    export("eye-glint", "Light fixed to optical glass", (-7,-8,14,16), glint, material="amber optical glass")
    leaf = path("M-1.2-1 Q1.8-1.45 4.8-2.1 L5.3-.9 Q3.8 1.6 .25 1.8Z", "url(#dark)", "#9b7647", .36)
    leaf += path("M-.5-.45 Q2.6-.97 4.45-1.65", stroke="#d4ad75", width=.38)
    export("iris-leaf", "Machined optical aperture leaf", (-4,-7,14,12), leaf, material="blued steel")


def export_rig_links():
    hip = ellipse(0,0,8.8,8.3,"url(#brass)","#261e17",.78)
    hip += path("M-6.8-4.2 Q-2.8-8 2.9-6.7 M5.7 4.8 Q1.2 7.5-3.8 6.2", stroke="#e7bc80", width=.79)
    hip += ellipse(0,0,5.4,5.0,"url(#dark)","#7a5838",.7) + rivet(0,0,2.75)
    export("hip-bearing", "Ribbed load bearing hip collar", (-12,-12,24,24), hip)

    cap = ellipse(0,0,5,5,"url(#brass)","#241a16",.55)
    cap += ellipse(-.15,-.2,3.65,3.56,"url(#medallion)","#815731",.4)
    cap += path("M-2.8-1.2 Q-.9-3.6 1.55-2.96", stroke="#ffe0a2", width=.46) + path("M-1.7.8 L1.8-.8", stroke="#462d1b", width=.59)
    export("knuckle-cap", "Shared pin cap, 5-unit radius", (-8,-8,16,16), cap)
    export("knuckle-cap-far", "Shadowed far knuckle cap", (-8,-8,16,16), cap, far=True)

    for depth in ("near","far"):
        far = depth == "far"
        for side in ("front","rear"):
            silhouette = "M-5-5 Q-3-8.5 2-8.5 L18-10 L45-7.4 L69-4 Q72-1.5 71 3 L67 5 L40 8 L9 8 L-4 6Z" if side == "front" else "M-5-5 Q1-8.6 8-8 L32-8.3 L55-6.4 L71-4 L71 4 L53 7.7 L11 8.5 L-5 5.4Z"
            femur = path(silhouette,"url(#brass)","#241d19",.8)
            femur += path("M7-5.9 L19-7.2 L41-5.8 L58-3.6 L65-1.3 L61 2.8 L39 5.5 L15 5.9 L8 3.3Z", "url(#enamel)", "#a87d50", .62)
            femur += path("M10-3.7 L24-5.2 L46-3.9 L57-1.9 L45-.8 L21-.2 L10 1.2Z","url(#enamel-sheen)")
            femur += path("M8-7.3 L19-8.1 L46-6.2 M12 6.7 L38 6.0 L60 3.8",stroke="#f1c78b",width=.58)
            femur += filigree(26,3.8,.66,-3) + rivets([(10,-5.2),(62,-2.9),(49,5.0)],.75)
            femur += path("M4-7.2 Q18-8.6 38-6.9 L44-5.7 L42-2.7 L15-3.2 L6-1.7Z", "url(#gilt)", "#725033", .45)
            femur += path("M7-6.8 Q22-7.5 38-6.25",stroke="#f6daa4",width=.42)
            armoured_width = 1.18 if side == "front" else 1.21
            export(f"leg-femur-{side}-{depth}", f"Armoured {side} {depth} leg femur 68", (-8,-16,85,33), group(femur,f"scale(1 {armoured_width})"), far=far)

        tibia = path("M-4-4 Q-1-6.8 8-6.1 L26-7.4 L58-5.6 L79-3.3 L80 2.1 L74 4.9 L51 6.5 L20 6.5 L2 5.2 L-4 3Z", "url(#brass)", "#261e17", .82)
        tibia += path("M5-3.5 L18-4.8 L53-3.9 L68-1.6 L65 1.6 L42 3.7 L15 3.8 L7 2.4Z", "url(#dark)", "#89623f", .65)
        tibia += path("M10 2.2 L30 1.7 L57 .2 L65-1.2",stroke="url(#copper)",width=1.9)
        tibia += path("M8-5.1 L27-6 L57-4.35 M22 5.1 H47 L68 3.3",stroke="#e9bf83",width=.55)
        tibia += path("M28-6.3 L53-5.3 L71-3.6 L74-.6 L67 2.8 L48 2.6 L32.4.6Z", "url(#brass)", "#6a4c32", .55)
        tibia += path("M32-5.0 L53-4.3 L69-2.8 M54 1.2 L67 .65",stroke="#f6d49e",width=.52)
        tibia += filigree(37,1.2,.51,-2) + rivets([(10,-4.8),(32,4.6),(65,-3.2)],.82)
        export(f"leg-tibia-{depth}",f"Shielded {depth} leg tibia 76",(-8,-14,92,27),group(tibia,"scale(1 1.2)"),far=far)

        # Опорный край y=2 совпадает с контрактом подошвы. Скошенные
        # фаски и насечки показывают, куда передаётся нагрузка.
        shoe = path("M-5.88 1.75 V-.7 Q-5.9-3.3-3.9-5.5 L-2.7-7.7 Q.1-8.4 3.05-7.6 L4.65-5.5 L5.87-2.18 V1.75Z", "url(#brass)", "#251d17", .44)
        shoe += path("M-5.62-.15 H5.62 V1.58 H-5.62Z", "url(#dark)", "#9e7547", .33)
        shoe += path("M-5.0-1.45 L-3.05-5.87 L2.65-6.38 L5.0-1.52Z", "url(#gilt)", "#6f4e32", .39)
        shoe += path("M-2.8-4.85 L-3.48-.42 M-.9-5.32 L-1.27-.34 M1.08-5.54 L1.38-.33 M3.0-4.87 L3.62-.56",stroke="#69472f",width=.53)
        shoe += path("M-4.9-1.28 L4.82-1.39 M-3.0-5.25 L2.42-5.8",stroke="#ffe0a5",width=.49)
        export(f"leg-foot-{depth}",f"Articulated {depth} shoe",(-9,-11,18,17),shoe,far=far)

        femur = path("M-5-7 Q-2-8.5 6-8.1 L14.6-11 Q42-10.8 67-8.4 L89-4 Q91 .1 89 4 L66 8.5 Q44 10.7 16 10.7 L-5 7Z", "url(#brass)", "#251d19", .83)
        femur += path("M3-5.7 L15.7-8.2 Q42-7.9 65-6 L80-2.9 L83 2.1 L64 5.8 L42 7.5 L16 7.8 L4 5Z", "url(#enamel)", "#b1814f", .7)
        femur += path("M7-5.1 L17-7.2 Q39-7.4 63-5.1 L74-3.7 Q55-2.5 31-1.4 L9 1Z", "url(#enamel-sheen)")
        femur += group(filigree(34,5.7,.91,-4),more='clip-path="url(#arm-outline)"')
        femur += path("M10-8 L15.5-9.45 Q44-9.3 67-7.6 L82-5.05 M13 8.65 Q45 9.65 66 7.45 L83 4.35",stroke="#edc58b",width=.57)
        femur += path("M7 5.7 L15 7.2 L30 7.8",stroke="#354243",width=.8)
        femur += rivets([(9,-6.2),(18,-8.55),(29,8.5),(69,-6.5),(80,4.1)], .8)
        export(f"rapt-femur-{depth}", f"Broad enameled raptorial femur {depth}, 86",(-9,-15,104,31),femur,
               clip("arm-outline",path("M-5-7 Q-2-8.5 6-8.1 L14.6-11 Q42-10.8 67-8.4 L89-4 Q91 .1 89 4 L66 8.5 Q44 10.7 16 10.7 L-5 7Z")),far=far)

        # Верхний выпуклый край клинка и зубья построены в пределах
        # того же посадочного контура. Острие x=88, без привесной детали.
        blade_outline = "M-3 5 Q5 4.2 17.6 4 L30.8 9 L36.1 3 L46.6 7 L51.9 1 L63.4 5 L68.6 0 L88 0 Q81-5 72.2-10 Q57-16.5 42.2-18 Q26-17.8 14.1-13 Q5-9.4-3-6Z"
        blade = path(blade_outline,"url(#brass)","#251b17",.75)
        blade += path("M-1-3 Q15-12 36-14.8 Q58-14 76-5.1 L86-.6 Q72-2.3 65-.3 L62.4 1.1 L52.5-2.1 L47 2.6 L36 .3 L30.2 4.2 L16.5 1.7 L.8 2.7Z","url(#gilt)","#8d6035",.54)
        blade += path("M8-5.2 Q20-12 35-12.5 Q54-12.8 70-6.0",stroke="#fff0bb",width=.72)
        blade += path("M14-4.5 Q34-9.6 55-6.8 Q67-4.8 79-.9",stroke="#785135",width=.68)
        blade += path("M30.8 8.2 L36.3 2.7 M46.4 6.35 L51.8 .64 M63.3 4.4 L68.6-.4",stroke="#ffe1a2",width=.54)
        blade += filigree(16,-4.2,.61,-9) + rivets([(12,-4.0),(25,-9.5)],.76)
        export(f"rapt-blade-{depth}",f"Curved serrated bronze capture blade {depth}, 88",(-8,-23,101,37),blade,far=far,material="honed brass")

    for label, spine_d, inset_d, highlights in (
        ("lower", "M-5-5 Q-2-10 8-9.5 L27-10.9 Q52-10 67-7.9 L99-5 L102-1 L100 4 L73 7 L49 9 L14 9 L-4 6Z", "M6-4 L25-7 L56-7.5 L84-4 L91-1 L85 2.3 L61 4.9 L28 6 L9 4.5Z", "M8-8 L30-9.25 L54-8.4 L79-5.5 M10 7.4 L31 7.3 L63 6"),
        ("upper", "M-4-5 Q3-10 13-9 L35-10.5 Q57-10.3 68-7 L88-5.6 L101-4 L102 3 L87 5.2 L65 7 L42 9.2 L12 8.7 L-4 5Z", "M7-4.6 L29-7.3 Q53-7.2 67-4.3 L91-2.9 L92.5 .9 L68 3.9 L42 6 L11 4.9Z", "M8-7 L31-8.7 Q53-8.7 69-5.4 L92-3.8 M12 7 L46 7.1 L70 4.9"),
    ):
        spine = path(spine_d,"url(#brass)","#291e16",.9)
        spine += path(inset_d,"url(#enamel)","#9d7045",.75)
        spine += path(inset_d,"url(#enamel-sheen)")
        spine += path(highlights,stroke="#f5cf91",width=.61)
        spine += path("M12 5.7 L30 6.7 L52 5.8 L72 4.0",stroke="#79502e",width=.8)
        spine += filigree(42,4.3,.81,-7) + rivets([(9,-6.6),(31,-7.5),(73,-4.2),(87,3.1)],.94)
        spine += path("M6-6.8 L25-9.2 L50-8.3 L65-6.1 L55-4.6 L27-4.35 L9-3.65Z", "url(#gilt)", "#84603b", .51)
        export(f"thorax-{label}",f"Forged thorax spine {label}, 98",(-9,-19,117,37),group(spine,"scale(1 1.26)" if label=="lower" else "scale(1 1.18)"))

    for code, length, sections, width in (("walk",12,(11,11),2.55),("thorax",16.5,(15,15),3.85),("rapt",12,(11.5,),2.9)):
        tube = path(f"M-3 {-width*.62} L.1 {-width} H{length-3} L{length} {-width*.7} V{width*.7} L{length-3} {width} H.1 L-3 {width*.62}Z", "url(#copper)", "#30211c", .66)
        tube += path(f"M2 {-width*.62} H{length-4}",stroke="#efb78c",width=.65)
        tube += path(f"M1 {-width} H5 V{width} H1Z M{length-5} {-width} H{length-2} L{length} {-width*.67} V{width*.67} L{length-2} {width} H{length-5}Z", "url(#gilt)", "#67402b", .46)
        tube += rivet(0,0,width*.57)
        export(f"piston-{code}-barrel", f"Copper piston body {length}",(-6,-8,math.ceil(length)+10,16),tube,material="satin copper")
        for index, rod in enumerate(sections):
            tip = index == len(sections)-1
            radius = width*(.46 if tip else .64)
            shaft = path(f"M-{rod} {-radius} H-.8 Q1.1 {-radius} 1.1 0 Q1.1 {radius} -.8 {radius} H-{rod}Z", "url(#steel)", "#373b36", .46)
            shaft += path(f"M-{rod-1} {-radius*.62} H-2",stroke="#f6e2b9",width=.36)
            shaft += rivet(0,0,width*.59) if tip else path(f"M-2 {-radius} H0 V{radius} H-2Z","url(#gilt)","#5d422d",.36)
            export(f"piston-{code}-{'rod' if tip else 'inner'}", f"Sliding fixed-length steel piston section {rod}",(-math.ceil(rod)-4,-7,math.ceil(rod)+10,14),shaft,material="polished steel")


if __name__ == "__main__":
    PARTS.mkdir(parents=True, exist_ok=True)
    export_body()
    export_optics()
    export_rig_links()
    (PACK / "PARTS_INDEX.json").write_text(json.dumps(INDEX, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(f"Q3C standalone SVG: {len(INDEX)}")
