# Genera el sitio a partir de index.src.html + pages.py
#   python3 build.py
# Salidas:
#   preview/  -> vista previa para Claude (portada con imágenes embebidas + páginas de servicio)
#   site/public/ -> lo que se publica en vaneandrade.com (HTML completo, imágenes como archivos, sitemap, robots)
import base64, html, json, os, re, shutil
from pages import PAGES

DOMAIN = "https://vaneandrade.com"
WA = "https://wa.me/523334655385?text=Hola%20Vanessa%2C%20quiero%20agendar%20mi%20asesor%C3%ADa%20gratis."
TODAY = "2026-10-19"

src = open("index.src.html", encoding="utf-8").read()
b64 = lambda p: base64.b64encode(open(p, "rb").read()).decode()
src = src.replace("{{VANE}}", b64("img/vane.jpg")).replace("{{LOGO}}", b64("img/logo.png"))

css = src[src.index("<style>") + 7: src.index("</style>")]
css += """
body{margin:0} img{max-width:100%}
.page-hero .btn-line{color:#F4F0E6}
"""
fonts = "\n".join(l for l in src.split("\n") if l.startswith("<link rel="))
body_home = src[src.index("</style>") + 8:]
preview_banner = re.search(r'<div class="preview".*?</div></div>\n', body_home, re.S).group(0)
header = re.search(r'<header class="top">.*?</header>', body_home, re.S).group(0)
footer = re.search(r"<footer>.*?</footer>", body_home, re.S).group(0)
wa_float = re.search(r'<a class="wa-float.*?</a>', body_home, re.S).group(0)
success = re.search(r'<section class="success".*?</section>', body_home, re.S).group(0)

def faq_from_home(text):
    sec = text[text.index('id="preguntas"'):]
    sec = sec[:sec.index("</section>")]
    out = []
    for q, a in re.findall(r"<summary>(.*?)</summary>\s*<div class=\"ans\">(.*?)</div>\s*</details>", sec, re.S):
        out.append((q.strip(), re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", a)).strip()))
    return out

def jsonld(obj):
    return '<script type="application/ld+json">' + json.dumps(obj, ensure_ascii=False) + "</script>"

BUSINESS = {
    "@context": "https://schema.org",
    "@type": ["FinancialService", "InsuranceAgency"],
    "@id": DOMAIN + "/#negocio",
    "name": "Vanessa Andrade · Asesora financiera y de seguros",
    "alternateName": "Soy Vane Andrade",
    "url": DOMAIN + "/",
    "image": DOMAIN + "/img/og.jpg",
    "logo": DOMAIN + "/img/logo.png",
    "telephone": "+52 33 3465 5385",
    "address": {"@type": "PostalAddress", "addressLocality": "Zapopan", "addressRegion": "Jalisco", "addressCountry": "MX"},
    "areaServed": [{"@type": "City", "name": "Zapopan"}, {"@type": "City", "name": "Guadalajara"}, {"@type": "Country", "name": "México"}],
    "sameAs": ["https://www.instagram.com/soyvaneandrade", "https://www.facebook.com/profile.php?id=61586427656629"],
    "knowsAbout": ["Modalidad 40 IMSS", "Pensión Ley 73", "Plan Personal de Retiro", "Seguro de vida", "Seguro de gastos médicos"],
    "priceRange": "Primera asesoría sin costo",
}

def head(title, desc, path, extra_ld):
    url = DOMAIN + path
    return f"""<!doctype html>
<html lang="es-MX">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(desc)}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_MX">
<meta property="og:site_name" content="Vanessa Andrade">
<meta property="og:title" content="{html.escape(title)}">
<meta property="og:description" content="{html.escape(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{DOMAIN}/img/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#071C17">
<link rel="icon" type="image/png" href="/img/logo.png">
{fonts}
<style>{css}</style>
{''.join(jsonld(x) for x in extra_ld)}
</head>
<body>
"""

def links(text, mode):
    # mode "site": rutas limpias; mode "preview": archivos .html junto a la vista previa
    for p in PAGES:
        text = text.replace("{{L:%s}}" % p["slug"], ("/" + p["slug"]) if mode == "site" else (p["slug"] + ".html"))
    return text.replace("{{HOME}}", "/" if mode == "site" else "./").replace("{{WA}}", WA)

def sub_header(mode):
    home = "/" if mode == "site" else "./"
    h = header.replace('href="#inicio"', f'href="{home}"')
    return re.sub(r'href="#(\w[\w-]*)"', lambda m: f'href="{home}#{m.group(1)}"', h)

def faq_html(faq):
    return "\n".join(f"<details><summary>{html.escape(q)}</summary><div class=\"ans\"><p>{html.escape(a)}</p></div></details>" for q, a in faq)

def page_body(p, mode):
    img = f"img/{p['img']}.jpg"
    home = "/" if mode == "site" else "./"
    label, href = p["cta2"]
    return f"""{sub_header(mode)}

<main>
  <section class="page-hero" style="--img:url({img});--pos:{p['pos']}">
    <div class="wrap">
      <p class="crumbs"><a href="{home}">Inicio</a> › {html.escape(p['eyebrow'])}</p>
      <p class="eyebrow">{html.escape(p['eyebrow'])}</p>
      <h1>{html.escape(p['h1'])}</h1>
      <hr class="gold-rule">
      <p class="lede">{html.escape(p['lede'])}</p>
      <div class="hero-actions">
        <a class="btn btn-gold" href="{WA}" target="_blank" rel="noopener">Agenda tu asesoría gratis</a>
        <a class="btn btn-line" href="{href}">{html.escape(label)}</a>
      </div>
    </div>
  </section>

  <section class="block">
    <div class="wrap prose">
      <article class="prose-body">
{p['body']}
        <h2>Preguntas frecuentes</h2>
        <div class="faq">
{faq_html(p['faq'])}
        </div>
      </article>
      <aside class="aside-card">
        <p class="eyebrow">Primera sesión gratis</p>
        <h3>{html.escape(p['aside'][0])}</h3>
        <p>{html.escape(p['aside'][1])}</p>
        <a class="btn btn-gold" href="{WA}" target="_blank" rel="noopener">Agenda tu sesión gratis</a>
        <a href="{href}">{html.escape(label)}</a>
      </aside>
    </div>
  </section>

  {success.replace("{{IMG:road}}", "img/road.jpg")}
</main>

{footer}

{wa_float}
"""

def build(mode):
    out = "site/public" if mode == "site" else "preview"
    os.makedirs(out + "/img", exist_ok=True)
    keys = sorted(set(re.findall(r"\{\{IMG:(\w+)\}\}", body_home)))
    for k in keys:
        shutil.copy(f"photos/{k}.jpg", f"{out}/img/{k}.jpg")
    shutil.copy("img/logo.png", f"{out}/img/logo.png")
    # portada
    home_faq = faq_from_home(body_home)
    faq_ld = {"@context": "https://schema.org", "@type": "FAQPage",
              "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in home_faq]}
    if mode == "site":
        body = body_home.replace(preview_banner, "")
        for k in keys:
            body = body.replace("{{IMG:%s}}" % k, f"img/{k}.jpg")
        doc = head("Asesora en Modalidad 40, retiro y seguros en Zapopan | Vanessa Andrade",
                   "Mejora tu pensión del IMSS con Modalidad 40, ahorra para tu retiro con un PPR y protege a tu familia. Diagnóstico gratis y asesoría en Zapopan, Guadalajara y en línea.",
                   "/", [BUSINESS, faq_ld]) + links(body, "site") + "\n</body>\n</html>\n"
    else:
        doc = src[:src.index("</style>") + 8].replace("{{", "{{")  # cabecera original de la vista previa
        body = body_home
        for k in keys:
            body = body.replace("{{IMG:%s}}" % k, "data:image/jpeg;base64," + b64(f"photos/{k}.jpg"))
        doc = doc + links(body, "preview")
    open(f"{out}/index.html", "w", encoding="utf-8").write(doc)
    # páginas de servicio
    for p in PAGES:
        faq = {"@context": "https://schema.org", "@type": "FAQPage",
               "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in p["faq"]]}
        crumbs = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Inicio", "item": DOMAIN + "/"},
            {"@type": "ListItem", "position": 2, "name": p["eyebrow"], "item": f"{DOMAIN}/{p['slug']}"}]}
        svc = {"@context": "https://schema.org", "@type": "Service", "name": p["eyebrow"], "description": p["description"],
               "provider": {"@id": DOMAIN + "/#negocio"}, "areaServed": BUSINESS["areaServed"]}
        body = page_body(p, mode)
        if mode == "preview":
            body = preview_banner + body
        doc = head(p["title"], p["description"], "/" + p["slug"], [BUSINESS, svc, crumbs, faq]) + links(body, mode) + "\n</body>\n</html>\n"
        open(f"{out}/{p['slug']}.html", "w", encoding="utf-8").write(doc)
    if mode == "site":
        open(f"{out}/robots.txt", "w").write(f"User-agent: *\nAllow: /\n\nSitemap: {DOMAIN}/sitemap.xml\n")
        urls = ["/"] + ["/" + p["slug"] for p in PAGES]
        open(f"{out}/sitemap.xml", "w").write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
            "".join(f"  <url><loc>{DOMAIN}{u}</loc><lastmod>{TODAY}</lastmod></url>\n" for u in urls) + "</urlset>\n")
        shutil.copy("img/og.jpg", f"{out}/img/og.jpg")
    left = re.findall(r"\{\{[A-Z]+[^}]*\}\}", open(f"{out}/index.html", encoding="utf-8").read())
    print(mode, "ok", "marcadores sin resolver:", left[:3])

build("preview")
build("site")
