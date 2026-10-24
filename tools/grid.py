from PIL import Image, ImageDraw

SRC = r"C:\Users\wsi\Downloads\hand-drawn-box-design-template\9934151.jpg"
OUT = r"C:\Users\wsi\AppData\Local\Temp\opencode\frame_grid.png"

im = Image.open(SRC).convert("RGB")
d = ImageDraw.Draw(im)
for x in range(0, 2001, 100):
    c = (0, 255, 0) if x % 500 else (255, 0, 255)
    d.line([(x, 0), (x, 2000)], fill=c, width=2)
    d.text((x + 4, 4), str(x), fill=c)
for y in range(0, 2001, 100):
    c = (0, 255, 0) if y % 500 else (255, 0, 255)
    d.line([(0, y), (2000, y)], fill=c, width=2)
    d.text((4, y + 4), str(y), fill=c)
im.save(OUT)
print("ok", OUT)
