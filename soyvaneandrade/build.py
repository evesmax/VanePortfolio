# Uso: python3 build.py  -> genera index.html (artifact, imágenes embebidas) y site/public (imágenes como archivos)
import base64, os, re, shutil
SRC = "index.src.html"; s = open(SRC).read()
b64 = lambda p: base64.b64encode(open(p, "rb").read()).decode()
s = s.replace("{{VANE}}", b64("img/vane.jpg")).replace("{{LOGO}}", b64("img/logo.png"))
keys = sorted(set(re.findall(r"\{\{IMG:(\w+)\}\}", s)))
art, site = s, s
os.makedirs("site/public/img", exist_ok=True)
for k in keys:
    p = f"photos/{k}.jpg"
    if not os.path.exists(p):
        art = art.replace("url({{IMG:%s}})" % k, "none"); site = site.replace("url({{IMG:%s}})" % k, "none"); continue
    art = art.replace("{{IMG:%s}}" % k, "data:image/jpeg;base64," + base64.b64encode(open(p, "rb").read()).decode())
    shutil.copy(p, f"site/public/img/{k}.jpg"); site = site.replace("{{IMG:%s}}" % k, f"img/{k}.jpg")
open("index.html", "w").write(art); open("site/public/index.html", "w").write(site)
print("ok", len(art)//1024, "KB", keys)
