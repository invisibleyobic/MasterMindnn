import pathlib
OUT = pathlib.Path(__file__).parent
SOC = [("Telegram","Батя Нетворкинга","https://t.me/FatherOfNetworking"),("YouTube","Рафаэль Салманов","https://www.youtube.com/@RafaelSalmanov"),("vc.ru","Колонки о бизнесе","https://vc.ru/salmanov"),("Сайт","salmanov.one","https://r.salmanov.one")]
LEAVES = "".join(f'<i class="leaf" style="--x:{x}%;--d:{d}s;--t:{t}s;--s:{s}"></i>' for x,d,t,s in [(8,0,14,1),(22,3,18,.7),(37,6,16,.9),(55,1,20,.6),(68,8,15,1.1),(82,4,19,.8),(93,10,17,.7),(46,12,21,1)])
def socials():
    return '<div class="soc">'+''.join(f'<a class="soc__i" href="{u}"><span class="soc__k">{k}</span><span class="soc__n">{n}</span><span class="soc__a">↗</span></a>' for k,n,u in SOC)+'</div>'
def page(name, fonts, css, hero, extra_head=""):
    body = f'''{hero}
<section class="sec"><div class="wrap founder">
  <div class="founder__ph"><img src="../assets/images/rafael-portrait.webp" alt="Рафаэль Салманов"></div>
  <div><p class="kick">Основатель</p><h2>Рафаэль Салманов</h2>
  <p class="lead">Серийный предприниматель из Нижнего Новгорода. С 17 лет в бизнесе, 9 проектов под управлением. С 2015 года собирает предпринимателей города вокруг себя: через клуб прошли 3 500+ человек.</p>
  {socials()}</div>
</div></section>
<section class="sec"><div class="wrap tiers">
  <article class="tier"><p class="kick">Круг I</p><h3>Резидент</h3><p class="price">10 000 ₽<span>/мес</span></p><ul><li>Мастермайнд раз в месяц</li><li>Закрытый Telegram-клуб</li><li>Бизнес-завтраки</li></ul><a class="btn btn--ghost" href="#">Подробнее</a></article>
  <article class="tier tier--hi"><p class="kick">Круг II</p><h3>Медиа</h3><p class="price">30 000 ₽<span>/мес</span></p><ul><li>Всё из «Резидента»</li><li>Личный бизнес-разбор</li><li>Питч со сцены</li></ul><a class="btn" href="#">Подробнее</a></article>
  <article class="tier"><p class="kick">Круг III</p><h3>VIP</h3><p class="price">50 000 ₽<span>/мес</span></p><ul><li>Прямой доступ к Рафаэлю</li><li>Проекты и доли</li><li>Выездные встречи</li></ul><a class="btn btn--ghost" href="#">Подробнее</a></article>
</div></section>'''
    html = f'''<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Вариант {name}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?{fonts}&display=swap" rel="stylesheet">{extra_head}
<style>*,*::before,*::after{{box-sizing:border-box}}body,h1,h2,h3,p,ul{{margin:0}}ul{{padding:0;list-style:none}}img,video{{display:block;max-width:100%}}a{{color:inherit;text-decoration:none}}
.wrap{{max-width:1240px;margin:0 auto;padding:0 clamp(16px,4vw,40px)}}.sec{{padding:clamp(4rem,9vw,7.5rem) 0}}
.founder{{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(2rem,5vw,5rem);align-items:center}}.founder__ph img{{width:100%;aspect-ratio:4/5;object-fit:cover}}
.soc{{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.7rem;margin-top:2rem}}.soc__i{{position:relative;display:flex;flex-direction:column;gap:1.4rem;padding:1rem 1rem 1.1rem;min-height:120px;justify-content:space-between}}.soc__a{{position:absolute;top:1rem;right:1rem}}
.tiers{{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem}}.tier{{padding:2rem;display:flex;flex-direction:column;gap:1rem}}.tier ul{{display:grid;gap:.5rem;flex:1}}
.btn{{display:inline-flex;align-items:center;justify-content:center;min-height:50px;padding:.9em 1.6em;font-weight:600}}
.leaf{{position:absolute;top:-40px;left:var(--x);width:calc(18px*var(--s));height:calc(18px*var(--s));border-radius:0 70% 0 70%;animation:fall var(--t) linear var(--d) infinite;opacity:0;pointer-events:none}}
@keyframes fall{{0%{{transform:translate3d(0,0,0) rotate(0);opacity:0}}10%{{opacity:.9}}100%{{transform:translate3d(-80px,110vh,0) rotate(540deg);opacity:0}}}}
@media (prefers-reduced-motion:reduce){{.leaf{{display:none}}}}
@media (max-width:860px){{.founder,.tiers{{grid-template-columns:minmax(0,1fr)}}.founder__ph{{max-width:360px}}.soc{{grid-template-columns:repeat(2,minmax(0,1fr))}}}}
{css}</style></head><body>{body}</body></html>'''
    (OUT/f"{name}.html").write_text(html, encoding="utf-8")

# ---------- A · Тёмная осень (тёплый чёрный + медь, Onest) ----------
page("A", "family=Onest:wght@400;500;700;800", f'''
body{{background:#0E0C0A;color:#EFE8DF;font:400 17px/1.6 Onest,system-ui,sans-serif}}
h1{{font:800 clamp(2.4rem,5.4vw,4.8rem)/.98 Onest;letter-spacing:-.035em}}h2{{font:800 clamp(2rem,4.4vw,3.6rem)/1 Onest;letter-spacing:-.03em;margin-bottom:1rem}}h3{{font:700 1.6rem/1.1 Onest}}
.kick{{font:600 .78rem/1 Onest;letter-spacing:.16em;text-transform:uppercase;color:#E0893A;margin-bottom:1rem}}.lead{{color:#B9AFA3;font-size:1.15rem;max-width:36em}}
.acc{{background:linear-gradient(90deg,#F2A541,#D2552B);-webkit-background-clip:text;background-clip:text;color:transparent}}
.hero{{position:relative;min-height:100svh;overflow:hidden;display:flex;align-items:center;background:radial-gradient(60% 70% at 78% 40%,rgba(210,85,43,.28),transparent 70%),radial-gradient(40% 50% at 10% 90%,rgba(242,165,65,.12),transparent 70%),#0E0C0A}}
.hero .wrap{{position:relative;z-index:2;display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:3rem;align-items:center;width:100%;padding-top:5rem;padding-bottom:3rem}}
.top{{position:absolute;top:0;left:0;right:0;z-index:3;display:flex;justify-content:space-between;align-items:center;padding:1.4rem clamp(16px,4vw,40px);font-weight:700;letter-spacing:.04em}}.top span{{color:#E0893A}}
.hero__img{{position:relative}}.hero__img img{{width:100%;aspect-ratio:4/5;object-fit:cover;filter:sepia(.25) saturate(1.1) contrast(1.05);mask-image:linear-gradient(180deg,#000 70%,transparent)}}
.date{{position:absolute;left:-1.5rem;bottom:2rem;background:#E0893A;color:#140F0B;padding:1rem 1.2rem;font-weight:800;line-height:1}}.date b{{display:block;font-size:2.4rem;letter-spacing:-.03em}}
.meta{{display:flex;flex-wrap:wrap;gap:.5rem 1.4rem;margin:1.6rem 0 2rem;color:#B9AFA3;font-size:.95rem}}.meta b{{color:#EFE8DF;font-weight:500}}
.btn{{background:linear-gradient(90deg,#F2A541,#D2552B);color:#140F0B;border-radius:999px}}.btn--ghost{{background:transparent;color:#EFE8DF;box-shadow:inset 0 0 0 1px rgba(239,232,223,.3)}}
.leaf{{background:linear-gradient(135deg,#F2A541,#B5401F);filter:blur(.4px)}}
.soc__i{{background:#1A1612;border:1px solid #2C251E;border-radius:16px;transition:.3s}}.soc__i:hover{{border-color:#E0893A;transform:translateY(-3px)}}.soc__k{{font-size:.75rem;letter-spacing:.14em;text-transform:uppercase;color:#E0893A;font-weight:600}}.soc__n{{font-weight:700;font-size:1.1rem}}.soc__a{{color:#E0893A}}
.founder__ph img{{border-radius:20px;filter:sepia(.2)}}
.tier{{background:#171310;border:1px solid #2C251E;border-radius:20px}}.tier--hi{{background:linear-gradient(160deg,#2A1A10,#171310);border-color:#E0893A}}.price{{font:800 2.4rem/1 Onest;letter-spacing:-.03em}}.price span{{font-size:1rem;color:#8E8478;font-weight:500}}.tier li{{color:#B9AFA3}}.tier li::before{{content:"— ";color:#E0893A}}
@media (max-width:860px){{.hero .wrap{{grid-template-columns:minmax(0,1fr)}}.hero__img{{max-width:340px}}.date{{left:auto;right:-.5rem}}}}
''', f'''<header class="top"><b>BUSINESS <span>SYNDICATE</span></b></header>
<section class="hero">{LEAVES}<div class="wrap">
  <div><p class="kick">Осенний мастермайнд · Нижний Новгород</p>
  <h1>Здесь бизнес разбирают <span class="acc" style="white-space:nowrap">по-настоящему</span></h1>
  <div class="meta"><span><b>1 ноября</b>, 18:00</span><span><b>Hampton by Hilton</b></span><span><b>200–300</b> предпринимателей</span></div>
  <div style="display:flex;gap:.7rem;flex-wrap:wrap"><a class="btn" href="#">Занять место</a><a class="btn btn--ghost" href="#">Как это работает</a></div></div>
  <div class="hero__img"><img src="../assets/images/rafael-portrait.webp" alt=""><div class="date"><b>01.11</b>осенний сезон</div></div>
</div></section>''')

# ---------- B · Клубный чёрный + шампань (Manrope) ----------
page("B", "family=Manrope:wght@400;500;700;800", f'''
body{{background:#070707;color:#ECE9E2;font:400 17px/1.6 Manrope,system-ui,sans-serif}}
h1{{font:700 clamp(2.4rem,5.8vw,5rem)/1.02 Manrope;letter-spacing:-.03em}}h2{{font:700 clamp(2rem,4vw,3.3rem)/1.05 Manrope;letter-spacing:-.025em;margin-bottom:1rem}}h3{{font:700 1.5rem/1.1 Manrope}}
.kick{{font:600 .74rem/1 Manrope;letter-spacing:.24em;text-transform:uppercase;color:#C9AE7A;margin-bottom:1rem}}.lead{{color:#A6A29A;font-size:1.12rem;max-width:36em}}
.hero{{position:relative;min-height:100svh;display:flex;align-items:flex-end;overflow:hidden}}
.hero__bg{{position:absolute;inset:0;background:url(../assets/images/mm-group.webp) center/cover;filter:grayscale(.35) sepia(.35) brightness(.55) contrast(1.1)}}
.hero__bg::after{{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,7,7,.2),rgba(7,7,7,.55) 45%,#070707 92%)}}
.hero .wrap{{position:relative;z-index:2;width:100%;padding-bottom:4rem;text-align:center}}
.top{{position:absolute;top:0;left:0;right:0;z-index:3;text-align:center;padding:1.6rem;font-weight:700;letter-spacing:.32em;font-size:.85rem}}
.line{{width:1px;height:60px;background:#C9AE7A;margin:0 auto 1.6rem}}
.hero h1 em{{font-style:normal;color:#C9AE7A}}.hero p.sub{{color:#C8C3B8;max-width:34em;margin:1.4rem auto 2rem;font-size:1.1rem}}
.strip{{display:inline-flex;gap:2rem;flex-wrap:wrap;justify-content:center;border-top:1px solid rgba(201,174,122,.35);border-bottom:1px solid rgba(201,174,122,.35);padding:.9rem 1.6rem;margin-bottom:2rem;font-size:.9rem;letter-spacing:.08em;text-transform:uppercase;color:#C8C3B8}}.strip b{{color:#C9AE7A;font-weight:700}}
.btn{{background:#C9AE7A;color:#0B0B0B;letter-spacing:.06em;text-transform:uppercase;font-size:.85rem}}.btn--ghost{{background:transparent;color:#ECE9E2;box-shadow:inset 0 0 0 1px rgba(236,233,226,.35)}}
.leaf{{background:#C9AE7A;opacity:.6;border-radius:0 80% 0 80%;width:calc(10px*var(--s));height:calc(10px*var(--s))}}
.soc__i{{border:1px solid rgba(201,174,122,.28);transition:.3s}}.soc__i:hover{{background:rgba(201,174,122,.08);border-color:#C9AE7A}}.soc__k{{font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;color:#C9AE7A}}.soc__n{{font-weight:700}}.soc__a{{color:#C9AE7A}}
.founder__ph img{{filter:grayscale(.3) sepia(.2)}}
.tier{{border:1px solid rgba(201,174,122,.22)}}.tier--hi{{border-color:#C9AE7A;background:rgba(201,174,122,.06)}}.price{{font:700 2.2rem/1 Manrope}}.price span{{font-size:1rem;color:#8A867E}}.tier li{{color:#A6A29A}}.tier li::before{{content:"◆ ";color:#C9AE7A;font-size:.6em;vertical-align:middle}}
''', f'''<header class="top">BUSINESS SYNDICATE</header>
<section class="hero"><div class="hero__bg"></div>{LEAVES}<div class="wrap">
  <div class="line"></div><p class="kick">Мастермайнд Рафаэля Салманова · осень 2026</p>
  <h1>Круг, где говорят<br><em>прямо и по делу</em></h1>
  <p class="sub">Раз в месяц 200–300 предпринимателей Нижнего Новгорода в одном зале. Твой вопрос, твои цифры и люди, которые прошли этот путь.</p>
  <div class="strip"><span><b>1 ноября</b> · 18:00</span><span>Hampton by Hilton</span><span>от <b>10 000 ₽</b>/мес</span></div>
  <div style="display:flex;gap:.7rem;justify-content:center;flex-wrap:wrap"><a class="btn" href="#">Подать заявку</a><a class="btn btn--ghost" href="#">Узнать формат</a></div>
</div></section>''')

# ---------- C · Город и кино (видео-облёт, белый гротеск, красный точечно) ----------
page("C", "family=Unbounded:wght@600;800&family=Onest:wght@400;500;700", f'''
body{{background:#0A0A0C;color:#F2F2F4;font:400 17px/1.6 Onest,system-ui,sans-serif}}
h1{{font:800 clamp(2rem,4.4vw,4rem)/1.02 Unbounded;letter-spacing:-.03em;text-transform:none}}h2{{font:800 clamp(1.8rem,3.8vw,3rem)/1.05 Unbounded;letter-spacing:-.02em;margin-bottom:1rem}}h3{{font:600 1.4rem/1.1 Unbounded}}
.kick{{font:500 .78rem/1 Onest;letter-spacing:.16em;text-transform:uppercase;color:#FF7A3D;margin-bottom:1rem}}.lead{{color:#A9A9B2;font-size:1.12rem;max-width:36em}}
.hero{{position:relative;min-height:100svh;display:flex;align-items:center;overflow:hidden}}
.hero video,.hero .poster{{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:sepia(.45) saturate(1.5) hue-rotate(-12deg) brightness(.5)}}
.hero::after{{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(10,10,12,.92) 30%,rgba(10,10,12,.35)),linear-gradient(0deg,#0A0A0C,transparent 40%)}}
.hero .wrap{{position:relative;z-index:2;width:100%;display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,.9fr);gap:3rem;align-items:end;padding-top:6rem;padding-bottom:3rem}}
.top{{position:absolute;top:0;left:0;right:0;z-index:3;display:flex;justify-content:space-between;padding:1.4rem clamp(16px,4vw,40px);font:800 .95rem Unbounded}}.top span{{color:#FF7A3D}}
.hero h1 span{{color:#FF7A3D}}.hero .sub{{color:#C9C9D0;max-width:32em;margin:1.4rem 0 2rem;font-size:1.1rem}}
.card{{background:rgba(20,20,24,.55);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:1.6rem}}
.card dl{{display:grid;gap:.8rem;margin:0 0 1.4rem}}.card dt{{font-size:.75rem;letter-spacing:.14em;text-transform:uppercase;color:#8C8C96}}.card dd{{margin:0;font-weight:500}}
.btn{{background:#FF5A1F;color:#fff;border-radius:12px;width:100%}}.btn--ghost{{background:transparent;color:#fff;box-shadow:inset 0 0 0 1px rgba(255,255,255,.25)}}
.leaf{{background:linear-gradient(135deg,#FFB347,#E2401C)}}
.soc__i{{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:16px;transition:.3s}}.soc__i:hover{{border-color:#FF7A3D;transform:translateY(-3px)}}.soc__k{{font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:#FF7A3D}}.soc__n{{font:700 1.05rem Onest}}.soc__a{{color:#FF7A3D}}
.founder__ph img{{border-radius:20px}}
.tier{{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.1);border-radius:20px}}.tier--hi{{border-color:#FF5A1F;box-shadow:0 0 60px -20px rgba(255,90,31,.5)}}.price{{font:800 2rem/1 Unbounded}}.price span{{font:400 1rem Onest;color:#8C8C96}}.tier li{{color:#A9A9B2}}.tier li::before{{content:"— ";color:#FF7A3D}}.tier .btn{{width:auto}}
@media (max-width:860px){{.hero .wrap{{grid-template-columns:minmax(0,1fr)}}.hero::after{{background:linear-gradient(0deg,#0A0A0C 20%,rgba(10,10,12,.55))}}}}
''', f'''<header class="top"><b>BUSINESS <span>SYNDICATE</span></b></header>
<section class="hero"><img class="poster" src="../assets/images/flyover-poster.webp" alt=""><video src="../assets/video/flyover.webm" autoplay muted loop playsinline poster="../assets/images/flyover-poster.webp"></video>{LEAVES}<div class="wrap">
  <div><p class="kick">Нижний Новгород · осенний сезон</p><h1>Мастермайнд, где тебя <span>сталкивают с реальностью</span></h1>
  <p class="sub">Цифры на стол, прямые вопросы, 200–300 предпринимателей в зале. Ты уходишь с решением вопроса, с которым пришёл.</p></div>
  <aside class="card"><dl><div><dt>Когда</dt><dd>1 ноября 2026, 18:00</dd></div><div><dt>Где</dt><dd>Hampton by Hilton, Максима Горького, 252</dd></div><div><dt>Доступ</dt><dd>В подписке клуба, от 10 000 ₽/мес</dd></div></dl>
  <a class="btn" href="#">Подать заявку</a></aside>
</div></section>''')
print("ok")
