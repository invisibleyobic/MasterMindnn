#!/usr/bin/env python3
"""Бэкапы версий сайта: каждая версия — замороженная копия в versions/<id>/ со своими css/js.
Общие картинки/видео/шрифты берутся из assets/ (туда только добавляем, ничего не удаляем).

  python3 tools/snapshot.py dir <папка> <id> "<название>" "<описание>"
      заморозить текущие страницы папки (например a, b, c, codex) — html + все локальные css/js, на которые они ссылаются
  python3 tools/snapshot.py index
      пересобрать versions/index.html из versions/registry.json

Правило: снимок не правится. Нужно изменить — делаем новую версию.
"""
import json, re, shutil, subprocess, sys, datetime, html, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
VER = ROOT / "versions"
REG = VER / "registry.json"
REF = re.compile(r'(?:href|src)="((?:\.\./)*)((?:css|js)/[\w.-]+\.(?:css|js))(?:\?[^"]*)?"')


def load():
    return json.loads(REG.read_text(encoding="utf-8")) if REG.exists() else []


def save(reg):
    VER.mkdir(exist_ok=True)
    REG.write_text(json.dumps(reg, ensure_ascii=False, indent=2), encoding="utf-8")


def write_snapshot(vid, title, desc, pages, assets_files, source):
    """pages: {имя.html: текст}; assets_files: {'css/x.css': текст, 'js/y.js': текст}."""
    out = VER / vid
    if out.exists():
        sys.exit(f"versions/{vid} уже существует — снимки не перезаписываются, выбери новый id")
    (out / "css").mkdir(parents=True); (out / "js").mkdir()
    for name, text in pages.items():
        # всё локальное → ./css ./js ; картинки/видео/шрифты → общий ../../assets
        text = re.sub(r'(href|src)="(?:\.\./)*(css|js)/([\w.-]+\.(?:css|js))(?:\?[^"]*)?"', r'\1="\2/\3"', text)
        text = re.sub(r'(["(])(?:\.\./)*assets/', r'\1../../assets/', text)
        text = re.sub(r'url\((?:\.\./)*assets/', 'url(../../assets/', text)
        if "<head>" in text and 'name="robots"' not in text:
            text = text.replace("<head>", '<head>\n<meta name="robots" content="noindex">', 1)
        (out / name).write_text(text, encoding="utf-8")
    for rel, text in assets_files.items():
        text = re.sub(r'url\((["\']?)(?:\.\./)+assets/', r'url(\1../../../assets/', text)
        (out / rel).write_text(text, encoding="utf-8")
    reg = load()
    reg.append({"id": vid, "title": title, "desc": desc, "source": source,
                "date": datetime.date.today().isoformat(),
                "entry": "index.html" if "index.html" in pages else sorted(pages)[0]})
    save(reg); build_index()
    print("снимок готов:", out.relative_to(ROOT))


def snap_dir(folder, vid, title, desc):
    src = ROOT / folder
    pages = {p.name: p.read_text(encoding="utf-8") for p in sorted(src.glob("*.html"))}
    files = {}
    for text in pages.values():
        for _, rel in REF.findall(text):
            if (ROOT / rel).exists():
                files[rel] = (ROOT / rel).read_text(encoding="utf-8")
    commit = subprocess.run(["git", "rev-parse", "--short", "HEAD"], cwd=ROOT, capture_output=True, text=True).stdout.strip()
    write_snapshot(vid, title, desc, pages, files, f"{folder}/ @ {commit}")


def build_index():
    reg = load()
    cards = "".join(f'''<a class="v" href="{e(r['id'])}/{e(r['entry'])}">
  <span class="v__id">{e(r['id'])} · {e(r['date'])}</span><b>{e(r['title'])}</b><span class="v__d">{e(r['desc'])}</span><span class="v__s">{e(r['source'])}</span></a>''' for r in reversed(reg))
    (VER / "index.html").write_text(f"""<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><title>Версии сайта — Business Syndicate</title><link rel="icon" href="../assets/brand/logo-red.svg" type="image/svg+xml">
<style>body{{margin:0;background:#0A0A0C;color:#F2F2F4;font:16px/1.5 system-ui,sans-serif;padding:clamp(24px,5vw,64px) 16px}}.w{{max-width:960px;margin:0 auto}}
h1{{margin:0 0 .3rem;font-size:clamp(1.6rem,4vw,2.4rem)}}p{{color:#9a9aa3;margin:0 0 2rem}}.g{{display:grid;gap:10px}}
.v{{display:grid;gap:.3rem;padding:1.1rem 1.2rem;border:1px solid #26262e;border-radius:14px;color:inherit;text-decoration:none;transition:border-color .2s}}.v:hover{{border-color:#ED1824}}
.v b{{font-size:1.15rem}}.v__id,.v__s{{font-size:.78rem;color:#7d7d88;letter-spacing:.04em}}.v__d{{color:#c9c9d0}}a.back{{color:#9a9aa3}}</style></head>
<body><div class="w"><h1>Версии сайта</h1><p>Каждая версия — замороженная копия, её можно открыть и вернуться к ней в любой момент. Новые сверху. <a class="back" href="../index.html">← к выбору версий</a></p>
<div class="g">{cards}</div></div></body></html>""", encoding="utf-8")


def e(s):
    return html.escape(str(s))


if __name__ == "__main__":
    a = sys.argv[1:]
    if a[:1] == ["dir"] and len(a) == 5:
        snap_dir(*a[1:])
    elif a[:1] == ["index"]:
        build_index()
    else:
        print(__doc__)
