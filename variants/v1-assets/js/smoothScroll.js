/* ============================================================
   smoothScroll.js — Lenis + синхронизация с GSAP ScrollTrigger.
   Инерционный скролл + плавные якорные переходы.
============================================================ */
(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Без Lenis (нет CDN / reduced motion) сайт остаётся полностью рабочим
  if (typeof Lenis === "undefined" || reduced) {
    window.BS_SCROLL = null;
    return;
  }

  const lenis = new Lenis({
    duration: 1.15,          // инерция
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true
  });
  window.BS_SCROLL = lenis;

  /* Связываем Lenis с ScrollTrigger: один источник правды по кадрам */
  if (window.gsap && window.ScrollTrigger) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    (function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    })(0);
  }

  /* Плавные якоря с учётом высоты шапки */
  const NAV_OFFSET = -72;
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: NAV_OFFSET, duration: 1.4 });
    });
  });
})();
