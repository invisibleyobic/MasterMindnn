#!/usr/bin/env python3
"""Генератор страниц v2. Общая шапка/подвал/данные — здесь, на выходе обычный статический HTML.
Запуск из корня проекта:  python3 tools/pages.py
Правишь тексты/данные здесь → запускаешь → коммитишь получившиеся *.html.
"""
import html, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
V = "3"  # версия кэша css/js — увеличивать при правках site.css / site.js
EVENT = {"date": "1 ноября 2026, 18:00", "short": "1 ноября",
         "place": "Hampton by Hilton, ул. Максима Горького, 252, Нижний Новгород"}
TG = "https://t.me/SALMANOVRS"

# ---------- Иконки ----------
ICON = {
    "telegram": '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.9 4.3 18.7 19.4c-.2 1-.9 1.3-1.7.8l-4.8-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2L6.5 13.2 1.8 11.7c-1-.3-1-1 .2-1.5L20.6 3c.9-.3 1.6.2 1.3 1.3Z"/></svg>',
    "web": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z"/></svg>',
    "instagram": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    "vk": '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.8 17.5C6.6 17.5 3.1 13.3 3 6.5h3.1c.1 5 2.3 7.1 4 7.5V6.5h2.9v4.3c1.7-.2 3.5-2.1 4.1-4.3H20c-.5 2.6-2.4 4.5-3.8 5.3 1.4.6 3.6 2.4 4.4 5.7h-3.2c-.7-2.2-2.4-3.9-4.7-4.1v4.1h-.4Z"/></svg>',
    "youtube": '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 8.2c-.2-1.5-.9-2.6-2.4-2.8C17.3 5 12 5 12 5s-5.3 0-7.6.4C2.9 5.6 2.2 6.7 2 8.2 1.8 9.6 1.8 12 1.8 12s0 2.4.2 3.8c.2 1.5.9 2.6 2.4 2.8C6.7 19 12 19 12 19s5.3 0 7.6-.4c1.5-.2 2.2-1.3 2.4-2.8.2-1.4.2-3.8.2-3.8s0-2.4-.2-3.8ZM10 15V9l5.2 3L10 15Z"/></svg>',
    "media": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h10M7 13h6"/></svg>',
}
ARROW = '<span class="social__go" aria-hidden="true">↗</span>'

# ---------- Соцсети Рафаэля (только подтверждённые ссылки) ----------
SOCIALS = [  # источник: research/RAFAEL_2026-10-12.md (принадлежность подтверждена)
    {"icon": "telegram", "label": "Telegram", "name": "Батя Нетворкинга", "sub": "Канал Рафаэля", "url": "https://t.me/FatherOfNetworking", "main": True},
    {"icon": "youtube", "label": "YouTube", "name": "Рафаэль Салманов", "sub": "Видео о бизнесе", "url": "https://www.youtube.com/@RafaelSalmanov", "main": True},
    {"icon": "media", "label": "vc.ru", "name": "Колонки", "sub": "Статьи о бизнесе", "url": "https://vc.ru/salmanov", "main": True},
    {"icon": "web", "label": "Сайт", "name": "salmanov.one", "sub": "Проекты и партнёры", "url": "https://r.salmanov.one", "main": True},
    {"icon": "telegram", "label": "Личный", "name": "Написать лично", "sub": "@SALMANOVRS", "url": "https://t.me/SALMANOVRS"},
    {"icon": "web", "label": "TenChat", "name": "TenChat", "sub": "Деловой профиль", "url": "https://tenchat.ru/Salmanov"},
]

# ---------- Люди клуба ----------
PEOPLE = [
    {"id": "rogozin", "name": "Артём Рогозин", "biz": "Центральная Похоронная служба", "about": "Надёжнейший человек круга. Даёт раньше, чем просит.", "video": True},
    {"id": "roma", "name": "Рома База", "biz": "Бар «Связи»", "about": "Его бар — точка сборки клуба. Связи рождаются за стойкой.", "video": True},
    {"id": "kormushonkov", "name": "Кирилл Кормушонков", "biz": "Тату-студия", "about": "Медийность и клиенты через клуб. Его лицо знают.", "video": True},
    {"id": "tony", "name": "Антон Коновалов", "biz": "TonyCars", "about": "Клиенты и партнёры приходят из круга быстрее любой рекламы.", "video": False},
    {"id": "leonova", "name": "Ксюша Леонова", "biz": "Раска", "about": "Предприниматель, проект «Раска». Резидент клуба.", "video": False},
    {"id": "silanteva", "photo": "p-selezneva", "name": "Анна Силантьева", "biz": "Спа-Химчистка", "about": "Сервис, о котором говорят. Растёт на связях клуба.", "video": False},
    {"id": "permitin", "name": "Илья Пермитин", "biz": "CRM и AI-автоматизация", "about": "Автоматизация для роста. Резиденты клуба — его клиенты.", "video": False, "nophoto": True},
    {"id": "bubnov", "name": "Александр Бубнов", "biz": "CleanBiz", "about": "B2B-контракты из круга: бизнесы доверяют своим.", "review": False},
]

# ---------- Круги ----------
TIERS = [
    {"key": "resident", "circle": "Круг I · Инструменты", "name": "Резидент", "price": "10 000",
     "for": "Тебе нужны связи, окружение и рабочие инструменты.",
     "short": ["<b>Мастермайнд</b> раз в месяц", "Закрытый Telegram-клуб", "Бизнес-завтраки", "Каталог предпринимателей"],
     "full": [("Мастермайнд раз в месяц", "200–300 предпринимателей в одном зале. Работа в группах, обмен опытом, живые знакомства."),
              ("Закрытый Telegram-клуб", "Главный рабочий инструмент. Нужен контрагент, подрядчик, клиент, совет — один пост, и круг отвечает."),
              ("Бизнес-завтраки", "Регулярная точка сборки в узком составе."),
              ("Каталог предпринимателей", "Твоя карточка в базе клуба. Тебя находят и рекомендуют."),
              ("Гостевой билет", "Раз в квартал приводи партнёра или друга."),
              ("Афтепати и неформальные встречи", "Связи строятся и за столом переговоров, и после него.")],
     "logic": "Один нормальный подрядчик или клиент из чата окупает подписку на месяцы вперёд.",
     "cta": "Вступить"},
    {"key": "media", "circle": "Круг II · Медиа", "name": "Медиа", "price": "30 000", "feature": True,
     "for": "У тебя есть продукт и результат. Этот круг делает тебя заметной фигурой деловой среды города.",
     "short": ["Всё из круга «Резидент»", "<b>Личный бизнес-разбор</b> экспертами", "Медиа-упаковка и SEO", "Питч со сцены мастермайнда"],
     "full": [("Всё из круга «Резидент»", "Мастермайнды, чат, завтраки, каталог."),
              ("Личный бизнес-разбор", "Твой бизнес разбирают эксперты клуба: где теряешь деньги и что менять в первую очередь. Конкретика и цифры."),
              ("Медиа-упаковка и SEO", "Статья о тебе и продвижение в поиске. Тебя ищут — и находят сильный материал."),
              ("Питч со сцены", "Представь проект залу: 200–300 предпринимателей узнают о тебе за вечер."),
              ("Фотосессия на мероприятиях", "Профессиональный контент для соцсетей."),
              ("Адресный нетворкинг", "Команда клуба знакомит с теми, кто нужен именно тебе."),
              ("Рекомендация клуба", "Тебя советуют как проверенного."),
              ("Скидки резидентов", "Услуги внутри круга по своим ценам.")],
     "logic": "Во втором круге возможности находят тебя сами, потому что тебя видно.",
     "cta": "Вступить"},
    {"key": "vip", "circle": "Круг III · Близкий круг", "name": "VIP", "price": "50 000",
     "for": "20–30 человек, готовых играть вдолгую и строить вместе. Вход через отбор.",
     "short": ["Всё из кругов «Резидент» и «Медиа»", "<b>Прямой доступ к Рафаэлю</b>", "Контент-завод zvd.news и СМИ", "Первый доступ к проектам и долям"],
     "full": [("Всё из кругов «Резидент» и «Медиа»", "Полный доступ."),
              ("Близкий круг с Рафаэлем", "Прямой доступ, стратегические сессии узким составом."),
              ("Съёмки и интервью", "Видеопродакшн на мероприятиях, интервью в медиа-канале клуба."),
              ("Контент-завод zvd.news", "Регулярный контент о тебе: ты постоянно в повестке."),
              ("Публикации в СМИ", "Выходы в деловые медиа города и региона."),
              ("Интеграция бренда", "Твой бизнес в контенте и событиях клуба."),
              ("Первый доступ к проектам и долям", "Цель экосистемы — 100 бизнесов. Ядро заходит первым."),
              ("Выездные встречи", "Спорт, рыбалка, закрытые ужины.")],
     "logic": "Ты совладелец движения. Поэтому вход через собеседование.",
     "cta": "Пройти отбор"},
]

# ---------- Кодекс (8 правил; полная версия «древо» — ждём от заказчика) ----------
CODEX = [
    ("Вход по соответствию", "Кандидат проходит отбор по делу, виду и адекватности. Место в кругу зарабатывается."),
    ("Каждый — заметная фигура", "У участника есть проект, и он представляет его достойно."),
    ("Давай раньше, чем просишь", "Связь, рекомендация, помощь по проекту первичны. Берёт тот, кто отдаёт."),
    ("Честь и слово", "Договорился — сделал. Без интриг и странных схем. Репутация дороже сделки."),
    ("Без токсичности и нытья", "Мы пришли строить. Уважение и спокойный тон — стандарт поведения."),
    ("Конфиденциальность круга", "Что внутри — остаётся внутри. Контакты передаются только с согласия."),
    ("Пост-релиз обязателен", "2–3 единицы контента после каждого мероприятия. Событие продолжает жить в ленте."),
    ("Репутация — общая", "Поступок каждого отражается на имени всех. Бережём репутацию круга как свою."),
]

STEPS = [
    ("Заявка и знакомство", "Оставляешь заявку, команда клуба знакомится с тобой и твоим делом. Место в кругу зарабатывается."),
    ("Первый мастермайнд", "200–300 предпринимателей, работа в группах по нишам, карта участников в руках. За вечер — 15–20 живых знакомств."),
    ("Закрытый клуб", "Пишешь запрос в чат — «нужен подрядчик» — и получаешь проверенные контакты за часы."),
    ("Бизнес-разбор", "40 минут твой бизнес на столе у экспертов: цифры, узкие места, где теряются деньги. Уходишь с конкретными шагами на месяц."),
    ("Личный бренд", "Съёмки на мероприятиях, интервью, статья о тебе с SEO-продвижением. Тебя узнают в деловой среде города."),
    ("Близкий круг", "20–30 человек: стратегические сессии с Рафаэлем, проекты и доли в экосистеме."),
]

NAV = [("index.html", "Мастермайнд"), ("rafael.html", "Рафаэль"), ("circles.html", "Круги"), ("codex.html", "Кодекс"), ("people.html", "Люди")]
ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"]
e = html.escape


THEME = "a"
THEMES = {
    "a": {"name": "A · Тёмная осень", "color": "#0E0C0A", "fonts": "family=Onest:wght@400;500;700;800"},
    "b": {"name": "B · Клубный", "color": "#070707", "fonts": "family=Manrope:wght@400;500;700;800"},
    "c": {"name": "C · Город и кино", "color": "#0A0A0C", "fonts": "family=Unbounded:wght@600;800&family=Onest:wght@400;500;700"},
}
LOGO = '<svg class="logo__mark" viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M32 56H480V164H32Z M32 188H244V456H32V324H154V296H32Z M268 188H480V296H358V324H480V456H268Z"/></svg>'
FX = '<div class="season-fx" aria-hidden="true">' + "".join(f'<i style="--x:{x}%;--d:{d}s;--t:{t}s;--s:{z}"></i>' for x, d, t, z in [(6,0,15,1),(19,4,19,.7),(33,7,16,.9),(51,2,21,.6),(64,9,15,1.1),(78,5,18,.8),(91,11,17,.7),(44,13,22,1)]) + '</div>'


def layout(page, title, desc, body):
    nav = "".join(f'<a href="{h}"{" aria-current=\"page\"" if h == page else ""}>{t}</a>' for h, t in NAV)
    return f"""<!DOCTYPE html>
<html lang="ru" data-season="autumn" data-theme="{THEME}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<meta name="theme-color" content="{THEMES[THEME]['color']}">
<meta property="og:type" content="website">
<meta property="og:locale" content="ru_RU">
<meta property="og:site_name" content="Business Syndicate">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<!-- SLOT: canonical, og:url, og:image — после выбора домена (см. QUESTIONS.md) -->
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?{THEMES[THEME]['fonts']}&display=swap"><!-- SLOT: после выбора темы — свой хостинг шрифтов -->
<link rel="icon" href="assets/brand/logo-red.svg" type="image/svg+xml">
<link rel="stylesheet" href="css/site.css?v={V}">
<link rel="stylesheet" href="css/theme-{THEME}.css?v={V}">
<script src="js/site.js?v={V}" defer></script>
</head>
<body>
<div class="issue"><div class="container">
  <span class="issue__season" data-season-label>Осенний сезон 2026</span>
  <span>Мастермайнд · {EVENT['short']} · Нижний Новгород</span>
</div></div>
<header class="header"><div class="container header__inner">
  <a href="index.html" class="logo">{LOGO}<span class="logo__word">Business <span>Syndicate</span></span></a>
  <nav class="nav" aria-label="Разделы">{nav}<a href="index.html#apply" class="btn">Подать заявку</a></nav>
  <a href="index.html#apply" class="btn header__cta">Подать заявку</a>
  <button class="burger" type="button" aria-label="Меню" aria-expanded="false"><span></span></button>
</div></header>
<main>
{body}
</main>
<footer class="footer"><div class="container">
  <div class="footer__grid">
    <div><a href="index.html" class="logo">{LOGO}<span class="logo__word">Business <span>Syndicate</span></span></a>
      <p class="footer__about">Сообщество предпринимателей Нижнего Новгорода и ежемесячный мастермайнд Рафаэля Салманова. С 2015 года.</p></div>
    <div class="footer__col"><h4>Разделы</h4><ul>{"".join(f'<li><a href="{h}">{t}</a></li>' for h, t in NAV)}</ul></div>
    <div class="footer__col"><h4>Связь</h4><ul>
      <li><a href="{TG}" target="_blank" rel="noopener">Telegram Рафаэля</a></li>
      <li><a href="https://t.me/FatherOfNetworking" target="_blank" rel="noopener">Канал «Батя Нетворкинга»</a></li>
      <li>{e(EVENT['place'])}</li></ul></div>
  </div>
  <div class="footer__bottom">
    <span>© Business Syndicate, 2015–2026</span>
    <span class="season-switch" aria-label="Сезон оформления">Сезон:
      <button type="button" data-set="autumn" aria-pressed="true">Осень</button>
      <button type="button" data-set="winter" aria-pressed="false">Зима</button></span>
  </div>
</div></footer>
</body>
</html>
"""


def socials_html(all_=False):
    out = []
    for s in [x for x in SOCIALS if all_ or x.get("main")]:
        out.append(f'''<a class="social" href="{s['url']}" target="_blank" rel="noopener">
  <span class="social__top"><span>{e(s['label'])}</span>{ICON[s['icon']]}</span>
  <span><span class="social__name">{e(s['name'])}</span><span class="social__sub">{e(s['sub'])}</span></span>
</a>''')
    return f'<div class="socials{" socials--all" if all_ else ""}">{"".join(out)}</div>'


def review_html(p):
    broken = not p.get("video")
    media = f'<img src="assets/images/review-{p["id"]}.webp" alt="Видеоотзыв: {e(p["name"])}" width="800" height="450" loading="lazy">'
    attrs = f' data-video="assets/video/review-{p["id"]}.mp4" tabindex="0" role="button" aria-label="Смотреть отзыв: {e(p["name"])}"'
    flag = '<span class="review__broken">(не открывается, починить)</span>' if broken else ""
    return f'''<article class="review reveal"{attrs}>
  <div class="review__media">{flag}{media}<span class="review__play">Смотреть отзыв</span></div>
  <h3 class="review__name">{e(p['name'])}</h3><p class="review__biz">{e(p['biz'])}</p>
</article>'''


def tiers_short():
    out = []
    for t in TIERS:
        badge = ""
        lis = "".join(f"<li>{x}</li>" for x in t["short"])
        out.append(f'''<article class="tier reveal{" tier--feature" if t.get("feature") else ""}">
  {badge}<span class="tier__circle">{t['circle']}</span>
  <h3 class="tier__name">{t['name']}</h3><p class="tier__for">{e(t['for'])}</p>
  <div class="tier__price"><b class="num">{t['price']} ₽</b><span>в месяц</span></div>
  <ul class="tier__list">{lis}</ul>
  <a href="circles.html#{t['key']}" class="btn{"" if t.get("feature") else " btn--ghost"} btn--block">Подробнее о круге</a>
</article>''')
    return f'<div class="tiers">{"".join(out)}</div>'


def founder_block(full=False):
    return f'''<div class="founder">
  <figure class="founder__photo reveal"><img src="assets/images/rafael-portrait.webp" alt="Рафаэль Салманов" width="760" height="1013" loading="lazy"></figure>
  <div class="reveal">
    {"" if full else '<p class="kicker kicker--accent">Основатель</p><h2>Рафаэль Салманов</h2>'}
    <p class="lead">Предприниматель, инвестор, основатель крупнейшего бизнес-сообщества Нижнего Новгорода. С 2015 года строит бизнес-экосистему региона.</p>
    <blockquote class="quote">«Связи решают. Я объединяю людей, помогаю им расти и доказываю: путь от работяги до предпринимателя-инвестора реален для каждого».</blockquote>
    <div class="facts">
      <div class="fact"><b class="num">с 17 лет</b><span>в бизнесе</span></div>
      <div class="fact"><b class="num">9</b><span>проектов под управлением</span></div>
      <div class="fact"><b class="num">3 500+</b><span>предпринимателей прошли через его клуб с 2015 года</span></div>
      <div class="fact"><b class="num">2015</b><span>год основания клуба</span></div>
    </div>
    {"" if full else '<a href="rafael.html" class="link-arrow">Подробнее о Рафаэле</a>'}
  </div>
</div>'''


def apply_block():
    opts = "".join(f'<option value="{t["name"]} — {t["price"]} ₽">{t["name"]} · {t["price"]} ₽/мес</option>' for t in TIERS)
    return f'''<section class="section section--paper" id="apply"><div class="container apply">
  <div class="reveal">
    <p class="kicker kicker--accent">Заявка</p>
    <h2>Займи место на мастермайнде {EVENT['short']}</h2>
    <p class="lead mt-s">Три коротких вопроса. Команда клуба свяжется с тобой в течение дня.</p>
    <ol class="apply__points">
      <li><span>i.</span>Заявка — две минуты.</li>
      <li><span>ii.</span>Знакомство с командой клуба: кто ты и с каким вопросом идёшь.</li>
      <li><span>iii.</span>Первый мастермайнд и доступ в закрытый клуб.</li>
    </ol>
  </div>
  <form class="form reveal" data-apply novalidate>
    <div class="field"><label for="f-name">Имя и фамилия</label><input id="f-name" name="name" autocomplete="name" required><span class="field__err"></span></div>
    <div class="field"><label for="f-contact">Телефон или Telegram</label><input id="f-contact" name="contact" autocomplete="tel" placeholder="+7 … или @username" required><span class="field__err"></span></div>
    <div class="field"><label for="f-q">С каким вопросом идёшь на мастермайнд</label><textarea id="f-q" name="question" placeholder="Например: упёрся в потолок по выручке, ищу партнёра в производство" required></textarea><span class="field__err"></span></div>
    <div class="field"><label for="f-tier">Какой круг интересен</label><select id="f-tier" name="tier"><option value="">Пока не знаю</option>{opts}</select></div>
    <label class="check"><input type="checkbox" name="agree" required><span>Принимаю <a class="link" href="codex.html">Кодекс клуба</a> и согласен(-на) на обработку персональных данных</span></label>
    <button class="btn btn--block" type="submit">Отправить заявку</button>
    <p class="form__ok">Спасибо. Откроется Telegram с готовым текстом заявки — отправь его, и команда клуба свяжется с тобой.</p>
  </form>
</div></section>'''


def buybox():
    return f'''<aside class="buybox" aria-label="Ближайшая встреча">
    <span class="buybox__tag">Ближайшая встреча</span>
    <p class="buybox__title">Мастермайнд · <span data-season-label>Осенний сезон 2026</span></p>
    <dl class="buybox__rows">
      <div class="buybox__row"><dt>Когда</dt><dd>{EVENT['date']}<br><span class="small" data-days-left></span></dd></div>
      <div class="buybox__row"><dt>Где</dt><dd>Hampton by Hilton,<br>ул. Максима Горького, 252</dd></div>
      <div class="buybox__row"><dt>Формат</dt><dd>Один вечер, работа в группах по нишам</dd></div>
      <div class="buybox__row"><dt>Доступ</dt><dd>Входит в подписку клуба</dd></div>
    </dl>
    <div class="buybox__price"><b class="num">от 10 000 ₽</b><span>в месяц</span></div>
    <a href="#apply" class="btn btn--block">Подать заявку</a>
    <a href="circles.html" class="btn btn--ghost btn--block">Сравнить круги</a>
    <p class="buybox__note">Вход через заявку и знакомство с командой клуба</p>
  </aside>'''


LEAD = "Раз в месяц предприниматели Нижнего Новгорода собираются в одном зале. Цифры на стол, прямые вопросы, работа в группах по нишам. Будет жёстко и непросто. Ты уйдёшь с решением вопроса, с которым пришёл."
META = f'<div class="hero__meta"><span><b>{EVENT["short"]}</b>, 18:00</span><span><b>Hampton by Hilton</b></span><span>от <b>10 000 ₽</b> в месяц</span></div>'


def hero_a():
    return f'''<section class="hero hero--a">{FX}<div class="container hero__grid">
  <div>
    <p class="kicker kicker--accent"><span data-season-word>Осенний</span> мастермайнд · Нижний Новгород</p>
    <h1>Здесь бизнес разбирают <em class="nowrap">по-настоящему</em></h1>
    <p class="lead">{LEAD}</p>
    {META}
    <div class="hero__actions"><a href="#apply" class="btn">Подать заявку</a><a href="#how" class="btn btn--ghost">Как это работает</a></div>
  </div>
  <div class="hero__portrait"><img src="assets/images/rafael-portrait.webp" alt="Рафаэль Салманов" width="760" height="1013"><div class="hero__date"><b>01.11</b><span data-season-label>Осенний сезон 2026</span></div></div>
</div></section>
<section class="section meet"><div class="container meet__grid">
  <figure class="figure reveal"><img src="assets/images/mm-group.webp" alt="Участники мастермайнда Business Syndicate" width="1920" height="944" loading="lazy"><figcaption>Участники мастермайнда Business Syndicate. Нижний Новгород</figcaption></figure>
  {buybox()}
</div></section>'''


def hero_b():
    return f'''<section class="hero hero--b"><div class="hero__bg" aria-hidden="true"></div>{FX}<div class="container hero__center">
  <span class="hero__line" aria-hidden="true"></span>
  <p class="kicker kicker--accent">Мастермайнд Рафаэля Салманова · <span data-season-label>Осенний сезон 2026</span></p>
  <h1>Круг, где говорят <em>прямо и по делу</em></h1>
  <p class="lead">{LEAD}</p>
  {META}
  <div class="hero__actions"><a href="#apply" class="btn">Подать заявку</a><a href="#how" class="btn btn--ghost">Узнать формат</a></div>
</div></section>
<section class="section meet"><div class="container meet__grid meet__grid--text">
  <div class="reveal"><p class="kicker">Ближайшая встреча</p><h2>Мастермайнд {EVENT['short']}</h2><p class="lead mt-s">Один вечер, твой вопрос и люди, которые прошли этот путь. Доступ входит в подписку клуба.</p></div>
  {buybox()}
</div></section>'''


def hero_c():
    return f'''<section class="hero hero--c">
  <video class="hero__video" muted loop playsinline preload="none" poster="assets/images/flyover-poster.webp" data-src="assets/video/flyover"></video>{FX}
  <div class="container hero__grid">
  <div>
    <p class="kicker kicker--accent">Нижний Новгород · <span data-season-label>Осенний сезон 2026</span></p>
    <h1>Мастермайнд, где тебя <em>сталкивают с реальностью</em></h1>
    <p class="lead">{LEAD}</p>
    <div class="hero__actions"><a href="#how" class="btn btn--ghost">Как это работает</a></div>
  </div>
  {buybox()}
</div></section>
<div class="container"><figure class="figure reveal"><img src="assets/images/mm-group.webp" alt="Участники мастермайнда Business Syndicate" width="1920" height="944" loading="lazy"><figcaption>Участники мастермайнда Business Syndicate. Нижний Новгород</figcaption></figure></div>'''


HEROES = {"a": hero_a, "b": hero_b, "c": hero_c}


def page_index():
    work = [p for p in PEOPLE if p.get("video")]
    steps = "".join(f'<div class="step reveal"><span class="step__n">{ROMAN[i]}.</span><h3>{e(t)}</h3><p>{e(d)}</p></div>' for i, (t, d) in enumerate(STEPS))
    codex3 = "".join(f'<div class="codex__item reveal"><span class="codex__n">{ROMAN[i]}</span><h3>{e(CODEX[i][0])}</h3><p>{e(CODEX[i][1])}</p></div>' for i in (0, 2, 3))
    body = f'''
{HEROES[THEME]()}

<section class="section manifesto mt-l"><div class="container">
  <p class="kicker">Почему сюда</p>
  <p class="manifesto__text reveal">Мастермайнд, где тебя <em>сталкивают с реальностью</em>. Твои цифры, твой вопрос и люди, которые уже прошли этот путь. Здесь говорят прямо и считают результат.</p>
  <p class="manifesto__sign">Business Syndicate · с 2015 года</p>
</div></section>

<section class="section" id="how"><div class="container">
  <div class="section__head"><p class="kicker">Как это работает</p><h2>Шесть шагов от заявки до <em>близкого круга</em></h2></div>
  <div class="steps">{steps}</div>
</div></section>

<section class="section section--paper"><div class="container">
  {founder_block()}
  <div class="mt-l reveal"><p class="kicker">Рафаэль в сети</p>{socials_html()}</div>
</div></section>

<section class="section"><div class="container">
  <div class="section__head section__head--split"><div><p class="kicker">Люди клуба</p><h2>Они уже внутри</h2></div>
    <p class="lead">Предприниматели клуба о том, что им дало сообщество. <a href="people.html" class="link">Все отзывы и лица клуба</a></p></div>
  <div class="reviews">{"".join(review_html(p) for p in work)}</div>
</div></section>

<section class="section section--line"><div class="container">
  <div class="section__head section__head--split"><div><p class="kicker">Подписка</p><h2>Три круга. <em>Выбери свою глубину</em></h2></div>
    <p class="lead">Подписка помесячная. Мастермайнд входит в каждый круг. Чем ближе к ядру, тем плотнее связи.</p></div>
  {tiers_short()}
</div></section>

<section class="section section--line"><div class="container">
  <div class="section__head section__head--split"><div><p class="kicker">Кодекс</p><h2>Правила, которые держат уровень круга</h2></div>
    <p class="lead">Кодекс подписывает каждый участник. <a href="codex.html" class="link">Весь кодекс</a></p></div>
  <div class="codex">{codex3}</div>
</div></section>

{apply_block()}
'''
    return layout("index.html", "Мастермайнд Рафаэля Салманова — Business Syndicate, Нижний Новгород",
                  f"Ежемесячный мастермайнд предпринимателей в Нижнем Новгороде. Честный разбор бизнеса, сильный круг, подписка от 10 000 ₽ в месяц. Ближайшая встреча — {EVENT['short']}.", body)


def page_head(crumb, kicker, h1, lead):
    return f'''<section class="page-head"><div class="container">
  <p class="crumbs"><a href="index.html">Мастермайнд</a> / {crumb}</p>
  <p class="kicker kicker--accent">{kicker}</p><h1>{h1}</h1><p class="lead">{lead}</p>
</div></section>'''


def page_circles():
    blocks = []
    for t in TIERS:
        rows = "".join(f'<div class="qa__item"><p class="qa__q">{e(a)}</p><div class="qa__a"><p>{e(b)}</p></div></div>' for a, b in t["full"])
        blocks.append(f'''<section class="section section--line" id="{t['key']}"><div class="container">
  <div class="section__head section__head--split"><div><p class="kicker">{t['circle']}</p><h2>{t['name']} · <em class="num">{t['price']} ₽</em> в месяц</h2></div>
    <p class="lead">{e(t['for'])}</p></div>
  <div class="qa">{rows}</div>
  <p class="quote mt-m">{e(t['logic'])}</p>
  <a href="index.html#apply" class="btn">{t['cta']}</a>
</div></section>''')
    body = page_head("Круги", "Подписка", "Три круга клуба. <em>Выбери свою глубину</em>",
                     "Подписка помесячная. Ежемесячный мастермайнд входит в каждый круг. Чем ближе к ядру, тем плотнее связи и больше внимания к твоему делу.")
    body += f'<section class="section"><div class="container">{tiers_short()}</div></section>' + "".join(blocks)
    body += '''<section class="section section--paper"><div class="container">
  <div class="section__head"><p class="kicker">Условия</p><h2>Оплата и правила</h2></div>
  <div class="qa">
    <div class="qa__item"><p class="qa__q">Как вступить</p><div class="qa__a"><p>Оставляешь заявку, команда клуба знакомится с тобой и твоим делом. В круг VIP — через собеседование.</p></div></div>
    <div class="qa__item"><p class="qa__q">Как платить</p><div class="qa__a"><p>Подписка помесячная. Счёт выставляет менеджер клуба после знакомства.</p></div></div>
    <div class="qa__item"><p class="qa__q">Возврат взноса</p><div class="qa__a"><p>Взнос не возвращается. Все условия обсуждаем до оплаты, на берегу и открыто.</p></div></div>
    <div class="qa__item"><p class="qa__q">Правила</p><div class="qa__a"><p>Каждый участник принимает <a class="link" href="codex.html">Кодекс клуба</a>. Нарушение кодекса — выход из круга.</p></div></div>
  </div>
</div></section>''' + apply_block()
    return layout("circles.html", "Круги и подписка — Business Syndicate",
                  "Подписка на бизнес-клуб Рафаэля Салманова: Резидент 10 000 ₽, Медиа 30 000 ₽, VIP 50 000 ₽ в месяц. Мастермайнд входит в каждый круг.", body)


def page_codex():
    items = "".join(f'<div class="codex__item reveal"><span class="codex__n">{ROMAN[i]}</span><h3>{e(a)}</h3><p>{e(b)}</p></div>' for i, (a, b) in enumerate(CODEX))
    body = page_head("Кодекс", "Кодекс клуба", "Кодекс, который <em>подписывает каждый</em>",
                     "Люди приходят сюда улучшать свою жизнь и пространство вокруг. Кодекс держит уровень круга.")
    body += f'''<section class="section"><div class="container">
  <div class="codex">{items}</div>
  <p class="small mt-m">Кодекс принимается осознанно, до вступления. Нарушение кодекса — выход из круга.</p>
</div></section>''' + apply_block()
    return layout("codex.html", "Кодекс клуба — Business Syndicate",
                  "Кодекс Business Syndicate: правила, которые держат уровень круга предпринимателей.", body)


def page_people():
    faces = []
    for p in PEOPLE:
        img = '<div class="face__ph" aria-hidden="true">' + p["name"][0] + '</div>' if p.get("nophoto") else \
            f'<img src="assets/images/{p.get("photo", "p-" + p["id"])}.webp" alt="{e(p["name"])}" width="600" height="600" loading="lazy">'
        faces.append(f'<article class="face reveal">{img}<h3>{e(p["name"])}</h3><p class="face__biz">{e(p["biz"])}</p><p>{e(p["about"])}</p></article>')
    revs = "".join(review_html(p) for p in PEOPLE if p.get("review", True))
    body = page_head("Люди", "Люди клуба", "Они <em>уже внутри</em>",
                     "Предприниматели клуба: кто они, чем занимаются и что им дало сообщество.")
    body += f'''<section class="section"><div class="container">
  <div class="section__head"><p class="kicker">Видеоотзывы</p><h2>Своими словами</h2></div>
  <div class="reviews">{revs}</div>
</div></section>
<section class="section section--paper"><div class="container">
  <div class="section__head"><p class="kicker">Лица клуба</p><h2>Кто рядом с тобой в кругу</h2></div>
  <div class="faces">{"".join(faces)}</div>
</div></section>''' + apply_block()
    return layout("people.html", "Люди клуба и отзывы — Business Syndicate",
                  "Видеоотзывы и лица предпринимателей бизнес-клуба Business Syndicate в Нижнем Новгороде.", body)


INTERVIEW = [  # дословные цитаты, источник у каждой; согласовать с Рафаэлем перед продом
    ("С чего вы начинали?", ["«Колледж подождёт, решил я». В 16 лет вложил 3 500 рублей, отложенные на поступление, в стартовый набор сетевой парфюмерной компании."], "vc.ru", "https://vc.ru/life/2881940-prodazhi-kak-myslenie-sekrety-uspekh-predprinimateley"),
    ("Какой путь прошёл клуб?", ["«10 лет. 3500 предпринимателей. Ни одного чиновника рядом»."], "Telegram «Батя Нетворкинга»", "https://t.me/FatherOfNetworking/159"),
    ("Главное правило собственника?", ["«Бизнес начинается тогда, когда он работает без вас хотя бы частично».", "«Я строю бизнес 20 лет и сейчас управляю девятью проектами одновременно»."], "vc.ru", "https://vc.ru/life/2882539-delegirovanie-v-biznese-kak-izbezhat-lovushki-samozanyatosti"),
    ("Зачем предпринимателю окружение?", ["«Я руководствуюсь простым принципом: люди общаются на уровне пересечения практик».", "«Любая инвестиция в человеческий ресурс окупается — я проверял это на себе неоднократно»."], "vc.ru", "https://vc.ru/life/2887926-nastavnik-dlya-rosta-dokhodov"),
    ("Как вы заходите в новые бизнесы?", ["«Решение было рациональным: купить готовый бизнес и привести его в управляемое состояние».", "«Мы покупали проекты на ранних стадиях, докручивали их через IT, сообщество, управленку»."], "vc.ru", "https://vc.ru/invest/2676270-pochemu-ya-vybral-pokupku-ritualnogo-agentstva-dlya-biznesa"),
]


def interview_html():
    out = []
    for q, ans, src, url in INTERVIEW:
        ps = "".join(f"<p>{e(a)}</p>" for a in ans)
        out.append(f'<div class="qa__item reveal"><p class="qa__q">{e(q)}</p><div class="qa__a">{ps}<a class="qa__src" href="{url}" target="_blank" rel="noopener">Источник: {e(src)}</a></div></div>')
    return "".join(out)


def page_rafael():
    body = page_head("Рафаэль", "Основатель", "Рафаэль <em>Салманов</em>",
                     "Предприниматель, инвестор, основатель Business Syndicate — крупнейшего бизнес-сообщества Нижнего Новгорода.")
    body += f'''<section class="section"><div class="container">{founder_block(full=True)}</div></section>
<section class="section section--paper"><div class="container">
  <div class="section__head"><p class="kicker">Где найти</p><h2>Рафаэль в сети</h2></div>
  {socials_html(all_=True)}
</div></section>
<section class="section"><div class="container">
  <div class="section__head"><p class="kicker">Интервью</p><h2>Коротко о главном</h2>
    <p class="small">Ответы собраны из публичных текстов Рафаэля: колонок на vc.ru и постов в Telegram.</p></div>
  <div class="qa">{interview_html()}</div>
</div></section>
''' + apply_block()
    return layout("rafael.html", "Рафаэль Салманов — основатель Business Syndicate",
                  "Рафаэль Салманов — предприниматель и инвестор из Нижнего Новгорода, основатель бизнес-сообщества Business Syndicate. Соцсети и интервью.", body)


def fix_paths(html_text):
    for a in ('"assets/', '"css/', '"js/'):
        html_text = html_text.replace(a, '"../' + a[1:])
    return html_text


def chooser():
    extra = [  # версии вне генератора: свои папки, генератор их не трогает
        ("variants/index.html", "Текущий сайт + ролик", "Видео MasterMind фоном", "3 варианта: первый экран · вся страница · отдельный блок", "linear-gradient(160deg,#2a0d12,#05050a)"),
        ("e/index.html", "Версия E · новая", "Закрытый клуб", "Чёрные и светлые блоки · ч/б фото · круги строками", "linear-gradient(160deg,#2a2a28,#0B0B0B)"),
        ("d/index.html", "Версия D", "Туман и стекло", "Слайды на телефоне · бенто", "linear-gradient(160deg,#1c2a2e,#0D1214)"),
        ("codex/index.html", "Версия Codex", "Осенний город", "Мобильные слайды · подписка · три круга", "linear-gradient(160deg,#283b35,#111718)"),
    ]
    cards = "".join(f'<a class="pick" style="background:{bg}" href="{h}"><span class="pick__k">{k}</span><b>{n}</b><span>{d}</span><span class="pick__go">Открыть →</span></a>' for h, k, n, d, bg in extra)
    cards += "".join(f'<a class="pick pick--{t}" href="{t}/index.html"><span class="pick__k">Версия</span><b>{v["name"]}</b><span class="pick__go">Открыть →</span></a>' for t, v in THEMES.items())
    return f"""<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Business Syndicate — выбор версии</title><meta name="robots" content="noindex"><link rel="icon" href="assets/brand/logo-red.svg" type="image/svg+xml">
<style>body{{margin:0;min-height:100svh;background:#0A0A0C;color:#F2F2F4;font:16px/1.5 system-ui,sans-serif;display:grid;place-items:center;padding:24px;box-sizing:border-box}}
.w{{width:100%;max-width:960px}}h1{{font-size:clamp(1.6rem,4vw,2.4rem);margin:0 0 .4rem}}p{{color:#9a9aa3;margin:0 0 2rem}}img{{width:56px;height:56px;margin-bottom:1.2rem}}
.g{{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}}.pick{{display:flex;flex-direction:column;gap:1.2rem;min-height:170px;padding:1.3rem;border-radius:16px;text-decoration:none;color:inherit;border:1px solid #26262e;transition:transform .3s,border-color .3s}}
.pick:hover{{transform:translateY(-3px);border-color:#ED1824}}.pick b{{font-size:1.3rem}}.pick__k{{font-size:.75rem;letter-spacing:.14em;text-transform:uppercase;color:#9a9aa3}}.pick__go{{margin-top:auto;color:#ED1824;font-weight:600}}
.pick--a{{background:linear-gradient(160deg,#2A1A10,#0E0C0A)}}.pick--b{{background:linear-gradient(160deg,#1d1a14,#070707)}}.pick--c{{background:linear-gradient(160deg,#1a1013,#0A0A0C)}}
.v1{{display:inline-block;margin-top:1.6rem;color:#9a9aa3}}@media(max-width:700px){{.g{{grid-template-columns:1fr}}.pick{{min-height:120px}}}}</style></head>
<body><div class="w"><img src="assets/brand/logo-red.svg" alt="Business Syndicate"><h1>Версии Business Syndicate</h1><p>Выбери версию для просмотра и сравнения. Свежие — первыми.</p>
<div class="g">{cards}</div><a class="v1" href="versions/index.html">Все версии и бэкапы →</a></div></body></html>"""


if __name__ == "__main__":
    PAGES = [("index.html", page_index), ("circles.html", page_circles), ("codex.html", page_codex),
             ("people.html", page_people), ("rafael.html", page_rafael)]
    for t in THEMES:
        THEME = t
        (ROOT / t).mkdir(exist_ok=True)
        for name, fn in PAGES:
            (ROOT / t / name).write_text(fix_paths(fn()), encoding="utf-8")
        print("ok", t)
    (ROOT / "index.html").write_text(chooser(), encoding="utf-8")
    print("ok chooser")
