#!/usr/bin/env python3
"""Варианты фонового видео MasterMind для текущего сайта (v1) — по HANDOFF.md от 14.10.
Основа: v1.html (текущая версия сайта с правками). main и живой сайт не трогаем.
  python3 tools/variants_bg.py   → variants/bg-hero/, variants/bg-fullpage/, variants/bg-section/ + variants/index.html
Видео ждём в assets/video/mastermind/ (имена из HANDOFF): если файла нет — остаётся постер, страница не ломается.
"""
import pathlib, re, shutil

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = (ROOT / "v1.html").read_text(encoding="utf-8")
V = "../../assets/video/mastermind/"

CSS = """
<style id="mm-bg-css">
.mm-bg { position: absolute; inset: 0; overflow: hidden; z-index: 0; pointer-events: none; background: #05050a center/cover no-repeat; }
.mm-bg video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.mm-bg::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,.55), rgba(0,0,0,.78)); }
.hero > .container, .hero__content { position: relative; z-index: 2; }
.mm-bg--fixed { position: fixed; z-index: -1; opacity: .32; }
.mm-bg--fixed::after { background: linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,.6)); }
.mm-watch { position: relative; padding: clamp(4rem, 9vw, 7rem) 0; }
.mm-watch__frame { position: relative; aspect-ratio: 16 / 9; border-radius: 18px; overflow: hidden; background: #05050a center/cover no-repeat; box-shadow: 0 40px 120px -40px rgba(0,0,0,.8); }
.mm-watch__frame video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.mm-watch__btn { position: absolute; left: 50%; bottom: 1.4rem; transform: translateX(-50%); z-index: 2; display: inline-flex; gap: .6em; align-items: center;
  padding: .85em 1.5em; border: 0; border-radius: 999px; background: rgba(255,255,255,.92); color: #0a0a0c; font: 700 .95rem/1 inherit; cursor: pointer; }
.mm-watch__btn::before { content: ""; border-left: 10px solid #FA1E32; border-top: 7px solid transparent; border-bottom: 7px solid transparent; }
.mm-watch__btn[hidden] { display: none; }
@media (max-width: 640px) { .mm-watch__frame { aspect-ratio: 9 / 16; max-height: 78svh; margin: 0 auto; } }
@media (prefers-reduced-motion: reduce) { .mm-bg video { display: none; } }
</style>"""

JS = """
<script id="mm-bg-js">
(function () {
  "use strict";
  var V = "%s";
  var mob = matchMedia("(max-aspect-ratio: 1/1)").matches, big = matchMedia("(min-width: 1400px)").matches;
  var calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* WebM (VP9) легче — для Chrome/Android/Firefox; MP4 (H.264) — для Safari/iOS */
  var webm = document.createElement("video").canPlayType('video/webm; codecs="vp9"') ? ".webm" : ".mp4";
  function file() { return V + (mob ? "mastermind-bg-mobile-9x16" : big ? "mastermind-bg-1080p" : "mastermind-bg-720p") + webm; }
  function poster() { return V + (mob ? "mastermind-bg-poster-mobile.jpg" : "mastermind-bg-poster.jpg"); }
  /* последние ~0.15 с ролик уходит в чёрный — перескакиваем раньше, чтобы цикл не мигал */
  function seamless(v) { v.addEventListener("timeupdate", function () { if (v.duration && v.currentTime > v.duration - 0.2) v.currentTime = 0; }); }
  document.querySelectorAll(".mm-bg, .mm-watch__frame").forEach(function (box) {
    box.style.backgroundImage = "url(" + poster() + ")";
  });
  document.querySelectorAll(".mm-bg video, .mm-watch__frame video").forEach(function (v) {
    v.poster = poster();
    if (calm) return;
    v.src = file(); seamless(v);
    /* нет горизонтального файла — берём вертикальный (обрежется по центру), чтобы не стоял постер */
    v.addEventListener("error", function () {
      if (v.dataset.reel) return;           /* ошибка ролика со звуком — фон не подменяем */
      var alt = V + "mastermind-bg-mobile-9x16" + webm;
      if (v.src.indexOf("mobile") === -1) { v.src = alt; var q = v.play(); if (q && q.catch) q.catch(function () {}); }
    });
    var p = v.play(); if (p && p.catch) p.catch(function () {});
  });
})();
</script>""" % V

VIDEO = '<video autoplay muted loop playsinline preload="metadata"></video>'


def copy_v1_assets():
    """Свои копии css/js v1 — чтобы варианты работали и там, где лежат старые файлы (ветка main / живой домен)."""
    dst = ROOT / "variants" / "v1-assets"
    for sub, ext in (("css", "*.css"), ("js", "*.js")):
        (dst / sub).mkdir(parents=True, exist_ok=True)
        for f in (ROOT / sub).glob(ext):
            if f.name.startswith(("site", "theme-")):
                continue
            shutil.copy2(f, dst / sub / f.name)


def base():
    h = SRC
    # пути: вариант лежит в variants/<id>/ — всё локальное на два уровня вверх
    h = re.sub(r'(href|src|data-src|poster|data-video-local)="(?!https?:|#|data:|mailto:|tel:)([^"]+)"', r'\1="../../\2"', h)
    h = h.replace('url(assets/', 'url(../../assets/')
    h = re.sub(r'"\.\./\.\./(css|js)/', r'"../v1-assets/\1/', h)  # без «_» в начале: GitHub Pages (Jekyll) не отдаёт такие папки
    h = h.replace('<meta name="robots" content="noindex, follow">', '<meta name="robots" content="noindex">')
    # облёт неба (sky.js) не грузим — фоном теперь ролик MasterMind
    h = re.sub(r'<video class="sky__video" data-src="[^"]*"[^>]*></video>', '', h)
    return h


def write(vid, html, title):
    out = ROOT / "variants" / vid
    out.mkdir(parents=True, exist_ok=True)
    html = html.replace("</head>", CSS + "\n</head>", 1).replace("</body>", JS + "\n</body>", 1)
    html = re.sub(r"<title>[^<]*</title>", f"<title>{title} — вариант фона</title>", html, count=1)
    (out / "index.html").write_text(html, encoding="utf-8")
    print("ok", out.relative_to(ROOT))


copy_v1_assets()
h = base()
write("bg-hero", h.replace('<section class="hero" aria-label="Главный экран">',
      '<section class="hero" aria-label="Главный экран">\n      <div class="mm-bg" aria-hidden="true">' + VIDEO + '</div>', 1), "bg-hero")
write("bg-fullpage", h.replace('<div class="sky" aria-hidden="true">',
      '<div class="mm-bg mm-bg--fixed" aria-hidden="true">' + VIDEO + '</div>\n  <div class="sky" aria-hidden="true">', 1)
      .replace('<div class="sky" aria-hidden="true">', '<div class="sky" aria-hidden="true" style="opacity:.6">', 1), "bg-fullpage")
SECTION = '''<section class="mm-watch" aria-label="Смотри, как это работает"><div class="container">
      <p class="kicker">Смотри, как это работает</p>
      <div class="mm-watch__frame"><video autoplay muted loop playsinline preload="metadata"></video>
</div>
    </div></section>

    '''
write("bg-section", h.replace('<section class="manifesto" aria-label="Связи решают">', SECTION + '<section class="manifesto" aria-label="Связи решают">', 1), "bg-section")

HUB_CARDS_VIDEO = [
    ("bg-hero/index.html", "1 · bg-hero", "ВЫБРАН", "Ролик за первым экраном, тёмный градиент поверх — самый сильный первый экран."),
    ("bg-fullpage/index.html", "2 · bg-fullpage", "", "Ролик закреплён за всей страницей, приглушён."),
    ("bg-section/index.html", "3 · bg-section", "", "Ролик отдельным блоком после первого экрана, без звука."),
]
HUB_CARDS_DESIGN = [
    ("../e/index.html", "E · Закрытый клуб", "новая", "Чёрные и светлые блоки, надпись на весь экран, ч/б фото."),
    ("../d/index.html", "D · Туман и стекло", "", "Слайды на телефоне, бенто на компьютере."),
    ("../codex/index.html", "Codex · Осенний город", "", "Версия Codex: мобильные слайды, три круга."),
    ("../a/index.html", "A · Тёмная осень", "", "Медь, портрет Рафаэля на первом экране."),
    ("../b/index.html", "B · Клубный", "", "Чёрный + шампань, фото клуба на весь экран."),
    ("../c/index.html", "C · Город и кино", "", "Видео-облёт, стеклянная карточка встречи."),
]


def cards(items):
    return "".join(f'<a class="v" href="{h}"><span class="v__t"><b>{t}</b>{f"<i>{tag}</i>" if tag else ""}</span><span>{d}</span></a>' for h, t, tag, d in items)


(ROOT / "variants" / "index.html").write_text(f"""<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><title>Варианты сайта мастермайнда — Business Syndicate</title><link rel="icon" href="../assets/brand/logo-red.svg" type="image/svg+xml">
<style>body{{margin:0;background:#0A0A0C;color:#F2F2F4;font:16px/1.5 system-ui,-apple-system,sans-serif;padding:clamp(24px,5vw,64px) 16px}}.w{{max-width:920px;margin:0 auto}}
img{{width:44px;height:44px;margin-bottom:1rem}}h1{{margin:0 0 .4rem;font-size:clamp(1.6rem,4vw,2.4rem)}}h2{{margin:2.6rem 0 1rem;font-size:.8rem;letter-spacing:.18em;text-transform:uppercase;color:#9a9aa3}}
p{{color:#9a9aa3;margin:0}}.g{{display:grid;gap:10px}}a.v{{display:grid;gap:.3rem;padding:1.1rem 1.2rem;border:1px solid #26262e;border-radius:14px;color:inherit;text-decoration:none;transition:border-color .2s}}
a.v:hover{{border-color:#ED1824}}.v__t{{display:flex;gap:.7rem;align-items:center;flex-wrap:wrap}}.v__t b{{font-size:1.12rem}}.v__t i{{font-style:normal;font-size:.7rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;background:#ED1824;color:#fff;padding:.25em .55em;border-radius:4px}}
a.v span:last-child{{color:#c9c9d0}}.links{{margin-top:2.6rem;display:flex;gap:1.4rem;flex-wrap:wrap}}.links a{{color:#9a9aa3}}</style></head><body><div class="w">
<img src="../assets/brand/logo-red.svg" alt="Business Syndicate">
<h1>Варианты сайта мастермайнда</h1><p>Рабочий раздел: здесь лежат все варианты, чтобы сравнивать и выбирать. Основной сайт не меняется, пока не выбран финальный вариант.</p>
<h2>Ролик MasterMind фоном · на текущем сайте</h2><div class="g">{cards(HUB_CARDS_VIDEO)}</div>
<h2>Новые дизайны</h2><div class="g">{cards(HUB_CARDS_DESIGN)}</div>
<div class="links"><a href="../versions/index.html">Все бэкапы версий →</a><a href="../index.html">Основной сайт →</a></div>
</div></body></html>""", encoding="utf-8")
print("ok variants/index.html")
