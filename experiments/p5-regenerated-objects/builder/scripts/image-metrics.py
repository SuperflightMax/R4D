import json
import sys
from PIL import Image


def bounds(channel):
    value = channel.getbbox()
    if value is None:
        return [0, 0, 0, 0]
    x0, y0, x1, y1 = value
    return [x0, y0, x1 - x0, y1 - y0]


with Image.open(sys.argv[1]) as image:
    rgba = image.convert("RGBA")
    alpha = rgba.getchannel("A")
    print(json.dumps({"format": image.format, "mode": image.mode,
                      "sizePx": list(image.size), "alphaBounds": bounds(alpha),
                      "visibleBounds": bounds(alpha.point(lambda a: 255 if a >= 16 else 0)),
                      "alphaExtrema": list(alpha.getextrema())}))
