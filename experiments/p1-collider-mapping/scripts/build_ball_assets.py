from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "source"
PREVIEWS = ROOT / "previews"

BALL_SIZES = (64, 80, 96)


def alpha_crop(image: Image.Image, threshold: int = 8, padding: int = 12) -> Image.Image:
    rgba = image.convert("RGBA")
    alpha = rgba.getchannel("A")
    mask = alpha.point(lambda value: 255 if value > threshold else 0)
    bbox = mask.getbbox()
    if bbox is None:
        raise ValueError("Input image has no visible alpha content")

    left, top, right, bottom = bbox
    left = max(0, left - padding)
    top = max(0, top - padding)
    right = min(rgba.width, right + padding)
    bottom = min(rgba.height, bottom + padding)
    return rgba.crop((left, top, right, bottom))


def contain_rgba(image: Image.Image, canvas_size: tuple[int, int], margin: float = 0.06) -> Image.Image:
    canvas_width, canvas_height = canvas_size
    usable_width = max(1, round(canvas_width * (1 - margin * 2)))
    usable_height = max(1, round(canvas_height * (1 - margin * 2)))
    scale = min(usable_width / image.width, usable_height / image.height)
    resized = image.resize(
        (max(1, round(image.width * scale)), max(1, round(image.height * scale))),
        Image.Resampling.LANCZOS,
    )
    canvas = Image.new("RGBA", canvas_size, (0, 0, 0, 0))
    position = ((canvas_width - resized.width) // 2, (canvas_height - resized.height) // 2)
    canvas.alpha_composite(resized, position)
    return canvas


def boost_alpha(image: Image.Image, factor: float) -> Image.Image:
    rgba = image.convert("RGBA")
    alpha = rgba.getchannel("A").point(lambda value: min(255, round(value * factor)))
    rgba.putalpha(alpha)
    return rgba


def build_assets(candidate: str) -> dict[int, tuple[Path, Path]]:
    output = ROOT / "assets" / f"candidate-{candidate}"
    output.mkdir(parents=True, exist_ok=True)
    ball_source = alpha_crop(Image.open(SOURCE / f"ball-candidate-{candidate}-generated.png"))
    shadow_source = boost_alpha(
        alpha_crop(Image.open(SOURCE / "shadow-candidate-a-generated.png")),
        factor=1.15,
    )

    contain_rgba(ball_source, (512, 512), margin=0.04).save(output / "ball-master-512.png")
    contain_rgba(shadow_source, (768, 384), margin=0.04).save(output / "shadow-master-768x384.png")

    outputs: dict[int, tuple[Path, Path]] = {}
    for ball_size in BALL_SIZES:
        ball_path = output / f"ball-{ball_size}.png"
        shadow_width = round(ball_size * 1.5)
        shadow_height = round(ball_size * 0.75)
        shadow_path = output / f"shadow-{shadow_width}x{shadow_height}.png"
        contain_rgba(ball_source, (ball_size, ball_size), margin=0.04).save(ball_path)
        contain_rgba(shadow_source, (shadow_width, shadow_height), margin=0.04).save(shadow_path)
        outputs[ball_size] = (ball_path, shadow_path)
    return outputs


def build_preview(reference_path: Path, outputs: dict[int, tuple[Path, Path]], candidate: str) -> None:
    PREVIEWS.mkdir(parents=True, exist_ok=True)
    board = Image.open(reference_path).convert("RGBA")
    font_fill = (69, 35, 20, 255)
    panels: list[Image.Image] = []

    for ball_size in BALL_SIZES:
        panel = board.copy()
        ball_path, shadow_path = outputs[ball_size]
        ball = Image.open(ball_path).convert("RGBA")
        shadow = Image.open(shadow_path).convert("RGBA")

        # Open floor patch between the middle rows of obstacles on board 03.
        center_x = round(panel.width * 0.45)
        center_y = round(panel.height * 0.50)
        shadow_xy = (
            center_x - shadow.width // 2 - round(ball_size * 0.18),
            center_y - shadow.height // 2 + round(ball_size * 0.25),
        )
        ball_xy = (center_x - ball.width // 2, center_y - ball.height // 2)
        panel.alpha_composite(shadow, shadow_xy)
        panel.alpha_composite(ball, ball_xy)

        draw = ImageDraw.Draw(panel)
        draw.rounded_rectangle((24, 24, 230, 86), radius=14, fill=(255, 244, 216, 225))
        draw.text((45, 42), f"ball {ball_size}px", fill=font_fill, stroke_width=0)
        panels.append(panel.resize((512, 512), Image.Resampling.LANCZOS))

    preview = Image.new("RGBA", (512 * len(panels), 512), (0, 0, 0, 0))
    for index, panel in enumerate(panels):
        preview.alpha_composite(panel, (index * 512, 0))
    preview.convert("RGB").save(
        PREVIEWS / f"board03-candidate-{candidate}-scale-check.jpg",
        quality=94,
        subsampling=0,
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Build P1 board-03 ball and shadow size variants.")
    parser.add_argument("--candidate", choices=("a", "b"), default="b")
    parser.add_argument("--reference", type=Path, help="Optional read-only board-03 JPG for preview generation")
    args = parser.parse_args()

    outputs = build_assets(args.candidate)
    if args.reference:
        build_preview(args.reference, outputs, args.candidate)


if __name__ == "__main__":
    main()
