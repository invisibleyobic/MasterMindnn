/* ============================================================
   hero.js — режиссура Главы 1.
   • Заголовок появляется посимвольно: сначала «СВЯЗИ»,
     пауза, затем «РЕШАЮТ» — буквы собираются из света.
   • Параллакс слоёв фона за курсором (depth).
   • Медленный камера-zoom фона при скролле.
   Стартует по событию "bs:loaded" от прелоадера.
============================================================ */
(function () {
  "use strict";

  const hero = document.querySelector(".hero");
  if (!hero) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const CFG = window.BS_CONFIG.anim;

  /* ---------- Разбиваем заголовок на буквы ----------
     Каждое слово — отдельная группа для раздельного тайминга. */
  const title = hero.querySelector(".hero__title");
  const words = title.querySelectorAll("[data-word]");
  words.forEach((word) => {
    const chars = [...word.textContent];
    word.textContent = "";
    chars.forEach((ch) => {
      const s = document.createElement("span");
      s.className = "char";
      s.textContent = ch;
      word.appendChild(s);
    });
  });

  /* ---------- Вступительная анимация ---------- */
  function playIntro() {
    if (!window.gsap || reduced) {
      title.querySelectorAll(".char").forEach((c) => (c.style.opacity = 1));
      return;
    }
    const [w1, w2] = words;
    const tl = gsap.timeline();

    // «СВЯЗИ» — буквы из света: blur + подъём + масштаб
    tl.to(w1.querySelectorAll(".char"), {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      scale: 1,
      duration: 0.9,
      stagger: CFG.heroCharStagger,
      ease: "power3.out",
      startAt: { opacity: 0, filter: "blur(16px)", y: 60, scale: 1.15 }
    });
    // драматическая пауза
    tl.to({}, { duration: 0.25 });
    // «РЕШАЮТ» — резче, с красной вспышкой
    tl.to(w2.querySelectorAll(".char"), {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      duration: 0.7,
      stagger: CFG.heroCharStagger * 0.8,
      ease: "power4.out",
      startAt: { opacity: 0, filter: "blur(10px)", y: 40 }
    }, "<0.1");
    // остальной контент hero — мягким каскадом
    tl.from([".hero__kicker", ".hero__lead", ".countdown-block", ".hero__actions"], {
      opacity: 0,
      y: 30,
      duration: 0.8,
      stagger: 0.12,
      ease: "power3.out",
      clearProps: "all"
    }, "-=0.3");
    // показываем навигацию
    tl.add(() => document.querySelector(".nav")?.classList.add("is-visible"), "-=0.5");
  }

  // прелоадер удалён — стартуем hero-анимации сразу
  document.documentElement.classList.add("is-loaded");
  playIntro();

  if (reduced) return;

  /* ---------- Параллакс за курсором ----------
     Слои двигаются с разной скоростью — глубина пространства. */
  const layers = [
    { el: hero.querySelector(".hero__glow"),      depth: 18 },
    { el: hero.querySelector(".hero__particles"), depth: 34 },
    { el: hero.querySelector(".hero__content"),   depth: -12 } // контент — против движения
  ].filter((l) => l.el);

  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };

  hero.addEventListener("mousemove", (e) => {
    target.x = (e.clientX / innerWidth - 0.5) * 2;   // -1..1
    target.y = (e.clientY / innerHeight - 0.5) * 2;
  }, { passive: true });

  (function raf() {
    current.x += (target.x - current.x) * 0.05;
    current.y += (target.y - current.y) * 0.05;
    for (const l of layers) {
      l.el.style.transform =
        `translate3d(${current.x * l.depth}px, ${current.y * l.depth}px, 0)`;
    }
    requestAnimationFrame(raf);
  })();

  /* ---------- Камера при скролле ----------
     Фон медленно приближается, контент уходит вверх с fade —
     ощущение выхода камеры из сцены. */
  if (window.gsap && window.ScrollTrigger) {
    gsap.to(".hero__glow", {
      scale: 1.25,
      ease: "none",
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true }
    });
    gsap.to(".hero__content", {
      yPercent: -18,
      opacity: 0.15,
      ease: "none",
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true }
    });
  }
})();
