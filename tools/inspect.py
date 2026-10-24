from PIL import Image
from collections import Counter

paths = {
    "logo": r"C:\Users\wsi\Downloads\taylaran_logo.png",
    "poster": r"C:\Users\wsi\Downloads\taylaranposter.png",
    "bg2": r"C:\Users\wsi\Downloads\Untitled design (2).png",
    "bg3": r"C:\Users\wsi\Downloads\Untitled design (3).png",
    "frame": r"C:\Users\wsi\Downloads\hand-drawn-box-design-template\9934151.jpg",
}
for k, p in paths.items():
    im = Image.open(p)
    print(k, im.size, im.mode)

# sample frame colors
fr = Image.open(paths["frame"]).convert("RGB")
c = Counter(fr.getdata())
print("\nTop frame colors:")
for col, n in c.most_common(12):
    print(col, n)

# check logo background transparency
lg = Image.open(paths["logo"]).convert("RGBA")
corners = [lg.getpixel((2, 2)), lg.getpixel((lg.width - 3, 2)),
           lg.getpixel((2, lg.height - 3)), lg.getpixel((lg.width - 3, lg.height - 3))]
print("\nlogo corners:", corners)
