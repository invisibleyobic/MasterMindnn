/* ============================================================
   particles.js — два canvas-слоя атмосферы:
   1) hero: медленно всплывающие «угли» (красные частицы + дым)
   2) network: живая сеть узлов-связей (метафора «связи решают»)
   Оба рендера легковесны: paуза вне вьюпорта через IO.
============================================================ */
(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  const CFG = window.BS_CONFIG.anim;
  const ACCENT = "250, 30, 50";

  /* Утилита: retina-canvas, авторесайз, пауза вне экрана */
  function setupCanvas(canvas, draw) {
    const ctx = canvas.getContext("2d");
    let w, h, running = false, rafId;

    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    addEventListener("resize", resize, { passive: true });

    function loop() {
      draw(ctx, w, h);
      rafId = requestAnimationFrame(loop);
    }
    // рендерим только когда canvas видим — экономия CPU/GPU
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) { running = true; loop(); }
      else if (!e.isIntersecting && running) { running = false; cancelAnimationFrame(rafId); }
    }).observe(canvas);
  }

  /* ---------- 1. HERO: угли и дым ---------- */
  const heroCanvas = document.querySelector(".hero__particles canvas");
  if (heroCanvas) {
    const N = CFG.particleCount;
    let parts = null;

    const spawn = (w, h) => ({
      x: Math.random() * w,
      y: h + Math.random() * h * 0.3,
      r: 0.6 + Math.random() * 2.2,           // размер угля
      vy: 0.15 + Math.random() * 0.55,        // скорость всплытия
      vx: (Math.random() - 0.5) * 0.18,       // лёгкий дрейф
      a: 0.05 + Math.random() * 0.4,          // альфа
      flicker: Math.random() * Math.PI * 2    // фаза мерцания
    });

    setupCanvas(heroCanvas, (ctx, w, h) => {
      if (!parts) parts = Array.from({ length: N }, () => spawn(w, h));
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.y -= p.vy; p.x += p.vx; p.flicker += 0.03;
        if (p.y < -10) Object.assign(p, spawn(w, h), { y: h + 10 });
        const alpha = p.a * (0.7 + 0.3 * Math.sin(p.flicker));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ACCENT}, ${alpha})`;
        ctx.fill();
      }
    });
  }

  /* Сцена «сеть связей» переехала в отдельный модуль network.js —
     там полноценная физическая симуляция с машиной состояний. */
})();
