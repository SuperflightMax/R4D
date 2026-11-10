import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parent
RAW = ROOT / "raw"
REVIEW = ROOT / "review"
FONT_DIR = Path(os.environ["WINDIR"]) / "Fonts"
TITLE_FONT = ImageFont.truetype(str(FONT_DIR / "segoeuib.ttf"), 32)
LABEL_FONT = ImageFont.truetype(str(FONT_DIR / "segoeuib.ttf"), 21)
NOTE_FONT = ImageFont.truetype(str(FONT_DIR / "segoeui.ttf"), 18)
BACKGROUND = "#222626"
TEXT = "#f4eddd"
MUTED = "#c4c8bd"
FRAME = "#a79c7e"

PAIRS = [
    ("01-T", "01-T-02", "01-T-edit-02", (0, 435, 560, 925)),
    ("01-D", "01-D-01", "01-D-edit-02", (0, 510, 560, 1000)),
]


def make_sheet(name, title, note, panels, columns, panel_size):
    panel_width, panel_height = panel_size
    margin, gap, top, row_gap = 24, 18, 94, 50
    rows = (len(panels) + columns - 1) // columns
    width = 2 * margin + columns * panel_width + (columns - 1) * gap
    height = top + rows * (panel_height + row_gap) + 6
    canvas = Image.new("RGB", (width, height), BACKGROUND)
    draw = ImageDraw.Draw(canvas)
    draw.text((margin, 16), title, font=TITLE_FONT, fill=TEXT)
    draw.text((margin, 60), note, font=NOTE_FONT, fill=MUTED)

    for index, (asset, label, crop) in enumerate(panels):
        row, column = divmod(index, columns)
        x = margin + column * (panel_width + gap)
        y = top + row * (panel_height + row_gap)
        draw.rectangle(
            (x - 1, y - 1, x + panel_width, y + panel_height),
            outline=FRAME,
        )
        with Image.open(RAW / f"{asset}.png") as raw:
            if crop is None:
                panel = ImageOps.contain(raw, panel_size, Image.Resampling.LANCZOS)
            else:
                panel = raw.crop(crop)
            canvas.paste(
                panel,
                (x + (panel_width - panel.width) // 2, y + (panel_height - panel.height) // 2),
            )
        draw.text((x, y + panel_height + 9), label, font=LABEL_FONT, fill=TEXT)

    canvas.save(REVIEW / name, quality=93, subsampling=0, optimize=True)


def main():
    REVIEW.mkdir(exist_ok=True)
    make_sheet(
        "01-initial.jpg",
        "ART-01   /   Четыре исходных кандидата",
        "Один замысел. Рамка 9:14. Показаны полные кадры без обрезки.",
        [
            ("01-T-01", "01-T-01   ·   Прямой текст", None),
            ("01-T-02", "01-T-02   ·   Прямой текст", None),
            ("01-D-01", "01-D-01   ·   Постановка", None),
            ("01-D-02", "01-D-02   ·   Постановка", None),
        ],
        4,
        (351, 546),
    )
    make_sheet(
        "02-before-after.jpg",
        "ART-01   /   Перенос сосуда",
        "В каждой паре исходный мастер и выбранная правка. Полный кадр в рамке 9:14.",
        [
            (asset, label, None)
            for method, master, edit, _ in PAIRS
            for asset, label in [
                (master, f"{master}   ·   До"),
                (edit, f"{method}   ·   После / проход 2"),
            ]
        ],
        4,
        (351, 546),
    )
    make_sheet(
        "03-detail.jpg",
        "ART-01   /   Рельеф и опора",
        "Одна и та же область до и после для каждой пары. Масштаб 1:1 к raw.",
        [
            (asset, label, crop)
            for method, master, edit, crop in PAIRS
            for asset, label in [
                (master, f"{method}   ·   До"),
                (edit, f"{method}   ·   После / проход 2"),
            ]
        ],
        2,
        (560, 490),
    )


if __name__ == "__main__":
    main()
