/* ============================================================
   hall.js — ЗАЛ СЛАВЫ (3D-коридор досье).
   • Проход по залу = прокрутка страницы: зал ПРИКАЛЫВАЕТСЯ к экрану
     (ScrollTrigger pin), скролл гонит коридор от первой карточки
     до «здесь можешь быть ты» и Рафаэля — и только затем страница
     едет дальше.
   • Карточка: наведение — поворот к зрителю; клик — переворот
     (суть на обороте); «Открыть досье» — модалка.
   Переиспользует .modal-overlay из modal.js.
============================================================ */
(function () {
  "use strict";

  var hall = document.getElementById("hall");
  if (!hall) return;

  var stage = hall.querySelector(".hall__stage");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mobile = window.matchMedia("(max-width: 768px)").matches;
  var MAX = 3400; // глубина коридора, на которую «проезжаем»

  /* ---------- Досье ---------- */
  var FILES = {
    rafael: { n: "Рафаэль Салманов", r: "Основатель. Центр всей сети",
      t: "<h4>Кто</h4><p>Предприниматель-инвестор, основатель крупнейшего бизнес-сообщества Нижнего Новгорода. С 2015 года через его окружение прошли 15 000 предпринимателей. 10 бизнесов в портфеле.</p><h4>Как</h4><p>Объединяет людей и превращает знакомства в проекты, а проекты — в деньги. За 2025 год — 45 млн ₽ инвестиций в проекты резидентов.</p><h4>Зачем</h4><p>Цель — экосистема на 100 бизнесов и управляющая компания. Все ленты этого зала ведут к нему не случайно.</p>" },
    silanteva: { n: "Анна Силантьева", r: "Спа-Химчистка",
      t: "<h4>Кто</h4><p>Владелица спа-химчистки — сервиса, о котором говорят.</p><h4>Как</h4><p>В клубе с первых встреч: связи, клиенты, рекомендации круга.</p><h4>Зачем</h4><p>Растить бренд и сеть. Её видеоотзыв — ниже.</p>" },
    permitin: { n: "Илья Пермитин", r: "CRM и AI-автоматизация",
      t: "<h4>Кто</h4><p>Автоматизирует процессы и аналитику для роста бизнеса.</p><h4>Как</h4><p>Резиденты клуба — его клиенты и партнёры: внутри круга подрядчика ищут по рекомендации.</p><h4>Зачем</h4><p>Здесь его экспертиза встречается со спросом напрямую.</p>" },
    kormushonkov: { n: "Кирилл Кормушонков", r: "Тату-студия",
      t: "<h4>Кто</h4><p>Основатель тату-студии.</p><h4>Как</h4><p>Через клуб — медийность, съёмки и новые клиенты.</p><h4>Зачем</h4><p>Личный бренд решает: его лицо знают в деловой среде города.</p>" },
    rogozin: { n: "Артём Рогозин", r: "Центральная Похоронная служба",
      t: "<h4>Кто</h4><p>Руководитель ЦПС — службы, которая не раз выручала резидентов в трудную минуту.</p><h4>Как</h4><p>Один из самых надёжных людей круга: даёт раньше, чем просит.</p><h4>Зачем</h4><p>Репутация внутри круга дороже любой рекламы.</p>" },
    roma: { n: "Рома База", r: "Бар «Связи»",
      t: "<h4>Кто</h4><p>Основатель бара «Связи» — да, названия здесь не совпадение.</p><h4>Как</h4><p>Его площадка — точка сборки неформальных встреч клуба.</p><h4>Зачем</h4><p>Связи рождаются за столом. У него — за барной стойкой.</p>" },
    tony: { n: "Антон Коновалов", r: "TonyCars",
      t: "<h4>Кто</h4><p>Основатель TonyCars — автомобильный бизнес.</p><h4>Как</h4><p>Клиенты и партнёры — из круга: рекомендация здесь работает быстрее объявлений.</p><h4>Зачем</h4><p>Масштаб через окружение, которое двигает вперёд.</p>" },
    leonova: { n: "Ксюша Леонова", r: "Раска",
      t: "<h4>Кто</h4><p>Основательница проекта «Раска».</p><h4>Как</h4><p>В клубе — за энергией, связями и медийностью.</p><h4>Зачем</h4><p>Женская предпринимательская сила круга. Смотри её видеоотзыв.</p>" },
    bubnov: { n: "Александр Бубнов", r: "CleanBiz",
      t: "<h4>Кто</h4><p>Основатель CleanBiz — профессиональная уборка коммерческих помещений.</p><h4>Как</h4><p>B2B-контракты приходят из круга: бизнесы клуба доверяют своим.</p><h4>Зачем</h4><p>Системный рост через плотную сеть контактов.</p>" },
    you: { n: "Здесь можешь быть ты!", r: "Дело не закрыто",
      t: "<h4>Кто</h4><p>Предприниматель с реальным делом и активной позицией. Возможно — ты.</p><h4>Как</h4><p>Заявка → просев по кодексу → первый мастермайнд.</p><h4>Зачем</h4><p>Чтобы твоя карточка тоже встала в этот зал.</p><a href=\"#apply\" class=\"btn\" data-modal-apply style=\"width:100%;justify-content:center;margin-top:1.2rem\">Подать заявку</a>" }
  };
  /* только фамилии с реально существующим mp4 в assets/video —
     остальные досье открываются без видео (по решению из CLAUDE.md) */
  var VIDEOS = { kormushonkov: 1, rogozin: 1, roma: 1 };

  var overlay = document.querySelector(".modal-overlay");
  var content = overlay && overlay.querySelector(".modal__content");

  function openFile(key) {
    var f = FILES[key];
    if (!f || !overlay) return;
    content.innerHTML =
      '<span class="tariff__circle">Дело № 2026 · досье</span>' +
      '<h3 class="tariff__name">' + f.n + '</h3>' +
      '<div class="small" style="margin-bottom:0.6rem">' + f.r + '</div>' + f.t +
      (VIDEOS[key]
        ? '<div class="dossier__video"><span class="dossier__video-label">Видеоотзыв</span>' +
          '<video src="assets/video/review-' + key + '.mp4" controls playsinline preload="metadata"></video></div>'
        : '');
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    window.BS_SCROLL && window.BS_SCROLL.stop();
    document.body.style.overflow = "hidden";
    var applyBtn = content.querySelector("[data-modal-apply]");
    if (applyBtn) applyBtn.addEventListener("click", function () {
      overlay.classList.remove("is-open");
      window.BS_SCROLL && window.BS_SCROLL.start();
      document.body.style.overflow = "";
    });
  }

  function cards() { return hall.querySelectorAll(".hof-card"); }
  function flip(card) {
    cards().forEach(function (c) { if (c !== card) c.classList.remove("is-flipped"); });
    card.classList.toggle("is-flipped");
  }

  cards().forEach(function (card) {
    card.addEventListener("click", function (e) {
      if (e.target.closest(".hof-card__open")) { openFile(card.dataset.dossier); return; }
      if (mobile) { openFile(card.dataset.dossier); return; } // на телефоне — сразу досье
      flip(card);
    });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(card); }
    });
  });

  var raf = hall.querySelector(".hall__rafael");
  if (raf) {
    raf.addEventListener("click", function () { openFile("rafael"); });
    raf.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openFile("rafael"); }
    });
  }

  /* ---------- Проход = прокрутка страницы (pin + scrub) ---------- */
  if (window.gsap && window.ScrollTrigger && !reduced && !mobile) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.fromTo(stage,
      { z: 0 },
      {
        z: MAX, ease: "none",
        scrollTrigger: {
          trigger: hall,
          start: "center center",
          end: "+=1800",
          pin: true,
          pinReparent: true,   // зал уезжает в body на время пина — устойчиво к transform-предкам
          scrub: 0.4,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });
  } else if (!mobile) {
    // без анимации — покажем середину коридора статично
    stage.style.transform = "translateZ(" + (MAX * 0.4) + "px)";
  }
})();
