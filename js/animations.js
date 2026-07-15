/* ============================================================
   animations.js — ХОРЕОГРАФИЯ ПОЛЁТА (GSAP + ScrollTrigger).
   Каждая глава прилетает из глубины, тормозит по кино-кривой и
   фиксируется читаемым экраном. Между главами слова-манифесты
   проносятся сквозь камеру. Фон-небо — в sky.js.
============================================================ */
(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!window.gsap || !window.ScrollTrigger || reduced) return;

  gsap.registerPlugin(ScrollTrigger);

  /* кино-кривые (сильные, по духу design-engineering) */
  const BRAKE = "expo.out";   // прилёт с торможением
  const enter = (trigger, start = "top 80%") =>
    ({ trigger, start, toggleActions: "play none none none" });

  /* ============================================================
     1 · ПРИЛЁТ ГЛАВ — блок выплывает из глубины и тормозит
  ============================================================ */
  document.querySelectorAll(".chapter .container").forEach((box) => {
    // блоки с залом/canvas НЕ масштабируем — иначе 3D-геометрия/сетка уезжает
    const heavy = box.querySelector(".hall, canvas");
    gsap.from(box, {
      opacity: 0,
      scale: heavy ? 1 : 0.62,
      y: 90,
      filter: "blur(14px)",
      duration: 1.5,
      ease: BRAKE,
      immediateRender: false,
      scrollTrigger: enter(box, "top 82%"),
      clearProps: "filter"
    });
  });

  /* внутренние сетки — лёгкий каскад поверх прилёта */
  const cascade = (sel, opt = {}) => {
    const items = document.querySelectorAll(sel);
    if (!items.length) return;
    gsap.from(items, Object.assign({
      opacity: 0, y: 46, filter: "blur(6px)",
      duration: 0.8, stagger: 0.09, ease: "power3.out",
      immediateRender: false,
      scrollTrigger: enter(items[0].parentElement, "top 78%"),
      clearProps: "filter"
    }, opt));
  };
  cascade(".who__grid .card");
  cascade(".videos .video-card", { stagger: 0.07 });
  cascade(".gallery .gallery__item", { stagger: 0.07 });
  // зал славы — карточки проявляются, не трогая 3D-трансформы
  const hofCards = document.querySelectorAll(".hof-card, .hall__rafael");
  if (hofCards.length) gsap.from(hofCards, {
    opacity: 0, duration: 0.7, stagger: 0.05, ease: "power2.out",
    immediateRender: false,
    scrollTrigger: enter(".hall", "top 78%"), clearProps: "opacity"
  });

  /* ============================================================
     2 · МАНИФЕСТЫ — слова навстречу сквозь камеру (scrub + pin)
  ============================================================ */
  document.querySelectorAll(".manifesto").forEach((sec) => {
    const line = sec.querySelector(".manifesto__line");
    const sub  = sec.querySelector(".manifesto__sub");
    if (!line) return;
    // Слово прилетает из глубины ОДИН раз и остаётся читаемым.
    // immediateRender:false — до срабатывания секция видима (никаких пустых окон).
    gsap.from([line, sub].filter(Boolean), {
      opacity: 0, scale: 0.55, y: 40,
      duration: 1.1, ease: BRAKE, stagger: 0.08,
      immediateRender: false,
      scrollTrigger: enter(sec, "top 72%"),
      clearProps: "transform"
    });
  });

  /* ============================================================
     3 · СЦЕНА ПОСАДКИ — приземление у кремля
  ============================================================ */
  const landing = document.querySelector(".landing");
  if (landing) {
    gsap.from(landing.querySelectorAll(".landing__kicker, .landing__title, .landing__sub, .landing .btn"), {
      opacity: 0, y: 70, filter: "blur(10px)",
      duration: 1.2, stagger: 0.14, ease: BRAKE,
      immediateRender: false,
      scrollTrigger: enter(landing, "top 68%"),
      clearProps: "filter"
    });
  }

  /* ============================================================
     4 · УТИЛИТЫ (сохранены из прежней версии)
  ============================================================ */

  /* Цифры статистики пересчитываются от нуля */
  document.querySelectorAll(".stat__number[data-value]").forEach((el) => {
    const end = parseFloat(el.dataset.value);
    const suffix = el.dataset.suffix || "";
    const obj = { v: 0 };
    gsap.to(obj, {
      v: end, duration: 2, ease: "power2.out",
      scrollTrigger: enter(el, "top 88%"),
      onUpdate() { el.textContent = Math.round(obj.v).toLocaleString("ru-RU") + suffix; }
    });
  });

  /* Бегущая строка */
  const marquee = document.querySelector(".marquee__track");
  if (marquee) gsap.to(marquee, { xPercent: -50, ease: "none", duration: 28, repeat: -1 });

  /* Сцена сети раскрывается clip-path */
  gsap.from(".network__canvas-wrap", {
    clipPath: "inset(12% 22% 12% 22% round 28px)", opacity: 0.4,
    duration: 1.4, ease: "power4.out",
    scrollTrigger: enter(".network__canvas-wrap", "top 75%")
  });
  gsap.from(".network__phrase", {
    opacity: 0, y: 50, duration: 1.1, ease: "power3.out",
    scrollTrigger: enter(".network__phrase", "top 85%")
  });

  /* Рафаэль — крупный план + параллакс портрета */
  gsap.from(".founder__portrait", {
    scale: 1.18, opacity: 0, duration: 1.5, ease: "power3.out",
    scrollTrigger: enter(".founder__grid", "top 72%")
  });
  gsap.to(".founder__portrait", {
    yPercent: -6, ease: "none",
    scrollTrigger: { trigger: ".founder", start: "top bottom", end: "bottom top", scrub: true }
  });

  /* Круги — лестница вверх */
  document.querySelectorAll(".tariffs .tariff").forEach((card, i) => {
    gsap.from(card, {
      opacity: 0, y: 70 + i * 34, rotation: i % 2 ? 1.5 : -1.5,
      duration: 1, delay: i * 0.1, ease: "power3.out",
      scrollTrigger: enter(".tariffs", "top 80%")
    });
  });

  /* Кодекс — правила поочерёдно */
  document.querySelectorAll(".rule").forEach((rule, i) => {
    gsap.from(rule, {
      opacity: 0, x: i % 2 ? 50 : -50, duration: 0.8, ease: "power3.out",
      scrollTrigger: enter(rule, "top 88%")
    });
  });

  /* Путь — шаги */
  document.querySelectorAll(".path__step").forEach((step, i) => {
    gsap.from(step, {
      opacity: 0, y: 56, x: i % 2 ? 36 : -36, duration: 0.9, ease: "power3.out",
      scrollTrigger: enter(step, "top 86%")
    });
  });

  /* Локация */
  gsap.from(".location__map", {
    opacity: 0, scale: 0.96, duration: 1.1, ease: "power3.out",
    scrollTrigger: enter(".location__map")
  });

  /* Финал */
  gsap.from(".final__title", {
    opacity: 0, scale: 0.9, y: 60, filter: "blur(8px)",
    duration: 1.3, ease: "power4.out",
    scrollTrigger: enter(".final", "top 72%"), clearProps: "filter"
  });
  gsap.from(".form", {
    opacity: 0, y: 50, duration: 1, delay: 0.2, ease: "power3.out",
    scrollTrigger: enter(".final", "top 72%")
  });

  /* Навигация: подложка после первого экрана */
  ScrollTrigger.create({
    start: "top -80",
    onUpdate: (self) =>
      document.querySelector(".nav")?.classList.toggle("is-scrolled", self.scroll() > 80)
  });

  /* После полной загрузки — пересчёт триггеров (шрифт/картинки меняют высоты) */
  addEventListener("load", () => ScrollTrigger.refresh());
})();
