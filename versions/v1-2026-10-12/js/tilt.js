/* ============================================================
   tilt.js — 3D-наклон карточек за курсором + световое пятно.
   Карточка наклоняется, приподнимается и светится в точке
   курсора (координаты передаются в CSS-переменные --mx/--my).
============================================================ */
(function () {
  "use strict";

  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (isTouch || reduced) return;

  const MAX_TILT = window.BS_CONFIG.anim.tiltMax;
  const LIFT = -6; // px подъёма при наведении

  document.querySelectorAll(".card, .video-card, .face, .gallery__item").forEach((card) => {
    let raf = null;

    card.addEventListener("mousemove", (e) => {
      if (raf) return; // не чаще кадра
      raf = requestAnimationFrame(() => {
        raf = null;
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;   // 0..1
        const py = (e.clientY - r.top) / r.height;

        // световое пятно за курсором (используется в .card::before)
        card.style.setProperty("--mx", (px * 100) + "%");
        card.style.setProperty("--my", (py * 100) + "%");

        // наклон вокруг центра
        const rx = (0.5 - py) * MAX_TILT;
        const ry = (px - 0.5) * MAX_TILT;
        card.style.transform =
          `perspective(900px) translate3d(0, ${LIFT}px, 0) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
    }, { passive: true });

    card.addEventListener("mouseleave", () => {
      if (window.gsap) {
        gsap.to(card, {
          rotateX: 0, rotateY: 0, y: 0,
          duration: 0.6, ease: "power3.out", clearProps: "transform"
        });
      } else {
        card.style.transform = "";
      }
    });
  });
})();
