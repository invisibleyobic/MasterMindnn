#!/usr/bin/env python3
"""Варианты фонового видео MasterMind для текущего сайта (v1) — по HANDOFF.md от 14.10.
Основа: v1.html (текущая версия сайта с правками). main и живой сайт не трогаем.
  python3 tools/variants_bg.py   → variants/bg-hero/, variants/bg-fullpage/, variants/bg-section/ + variants/index.html
Видео ждём в assets/video/mastermind/ (имена из HANDOFF): если файла нет — остаётся постер, страница не ломается.
"""
import pathlib, re

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
  /* вариант «блок со звуком»: по кнопке включаем полный ролик со звуком */
  var btn = document.querySelector(".mm-watch__btn");
  if (btn) btn.addEventListener("click", function () {
    var v = document.querySelector(".mm-watch__frame video");
    v.dataset.reel = "1";
    var ext = webm === ".webm" ? ".webm" : ".mp4";
    v.src = V + (mob ? "mastermind-reel-9x16-social" : "mastermind-reel-16x9-social") + ext;
    /* нет горизонтального ролика со звуком — показываем вертикальный */
    v.addEventListener("error", function () { if (v.src.indexOf("9x16") === -1) { v.src = V + "mastermind-reel-9x16-social" + ext; var q = v.play(); if (q && q.catch) q.catch(function () {}); } });
    v.muted = false; v.loop = false; v.controls = true; v.currentTime = 0;
    var p = v.play(); if (p && p.catch) p.catch(function () {});
    btn.hidden = true;
  });
})();
</script>""" % V

VIDEO = '<video autoplay muted loop playsinline preload="metadata"></video>'


def base():
    h = SRC
    # пути: вариант лежит в variants/<id>/ — всё локальное на два уровня вверх
    h = re.sub(r'(href|src|data-src|poster|data-video-local)="(?!https?:|#|data:|mailto:|tel:)([^"]+)"', r'\1="../../\2"', h)
    h = h.replace('url(assets/', 'url(../../assets/')
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


h = base()
write("bg-hero", h.replace('<section class="hero" aria-label="Главный экран">',
      '<section class="hero" aria-label="Главный экран">\n      <div class="mm-bg" aria-hidden="true">' + VIDEO + '</div>', 1), "bg-hero")
write("bg-fullpage", h.replace('<div class="sky" aria-hidden="true">',
      '<div class="mm-bg mm-bg--fixed" aria-hidden="true">' + VIDEO + '</div>\n  <div class="sky" aria-hidden="true">', 1)
      .replace('<div class="sky" aria-hidden="true">', '<div class="sky" aria-hidden="true" style="opacity:.6">', 1), "bg-fullpage")
SECTION = '''<section class="mm-watch" aria-label="Смотри, как это работает"><div class="container">
      <p class="kicker">Смотри, как это работает</p>
      <div class="mm-watch__frame"><video muted loop playsinline preload="metadata"></video>
        <button class="mm-watch__btn" type="button">Смотреть со звуком</button></div>
    </div></section>

    '''
write("bg-section", h.replace('<section class="manifesto" aria-label="Связи решают">', SECTION + '<section class="manifesto" aria-label="Связи решают">', 1), "bg-section")

(ROOT / "variants" / "index.html").write_text("""<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><title>Варианты фона — ролик MasterMind</title><link rel="icon" href="../assets/brand/logo-red.svg" type="image/svg+xml">
<style>body{margin:0;background:#0A0A0C;color:#F2F2F4;font:16px/1.5 system-ui,sans-serif;padding:clamp(24px,5vw,64px) 16px}.w{max-width:900px;margin:0 auto}
h1{margin:0 0 .4rem;font-size:clamp(1.5rem,4vw,2.2rem)}p{color:#9a9aa3;margin:0 0 2rem}.g{display:grid;gap:10px}
a.v{display:grid;gap:.3rem;padding:1.1rem 1.2rem;border:1px solid #26262e;border-radius:14px;color:inherit;text-decoration:none}a.v:hover{border-color:#FA1E32}
a.v b{font-size:1.15rem}a.v span{color:#c9c9d0}a.back{color:#9a9aa3}</style></head><body><div class="w">
<h1>Ролик MasterMind фоном — 3 варианта</h1><p>Основа — текущая версия сайта (v1). Живой сайт и main не тронуты. <a class="back" href="../index.html">← все версии</a></p>
<div class="g">
<a class="v" href="bg-hero/index.html"><b>1 · bg-hero</b><span>Ролик только за первым экраном, тёмный градиент поверх — текст читается.</span></a>
<a class="v" href="bg-fullpage/index.html"><b>2 · bg-fullpage</b><span>Ролик закреплён за всей страницей, приглушён (прозрачность ~0.3).</span></a>
<a class="v" href="bg-section/index.html"><b>3 · bg-section</b><span>Отдельный блок «Смотри, как это работает» после первого экрана, кнопка «Смотреть со звуком».</span></a>
</div></div></body></html>""", encoding="utf-8")
print("ok variants/index.html")
