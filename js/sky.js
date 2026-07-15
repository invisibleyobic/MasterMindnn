/* ============================================================
   sky.js — ночное небо полёта над Нижним Новгородом.
   • starfield: огни города / искры летят навстречу камере (3D)
   • облака и слои дымки проходят СКВОЗЬ камеру по мере скролла
   • параллакс силуэта города; взлёт на старте; посадка у кремля
   Слой .sky живёт fixed за всем контентом. Спроектирован так,
   чтобы поверх легко встал видео-облёт (см. .sky__video).
============================================================ */
(function () {
  "use strict";

  const sky = document.querySelector(".sky");
  if (!sky) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile  = window.matchMedia("(max-width: 768px)").matches;
  const INTENSITY = 0.6; // 6/10 — заметно, но без укачивания

  /* ---------- видео-облёт: только десктоп, ленивая загрузка ---------- */
  const video = sky.querySelector(".sky__video");
  if (video) {
    if (mobile || reduced) {
      video.remove();                       // мобилка/reduced-motion — без видео
    } else {
      video.src = video.dataset.src;
      video.style.opacity = "0";
      video.style.transition = "opacity 1.2s ease";
      const reveal = () => { video.style.opacity = "0.5"; };
      video.addEventListener("canplay", reveal, { once: true });
      const p = video.play();
      if (p && p.catch) p.catch(() => {});   // автоплей может быть отклонён — не критично
    }
  }

  /* ---------- ссылки на слои ---------- */
  const canvas  = sky.querySelector(".sky__stars");
  const clouds  = [...sky.querySelectorAll(".sky__cloud")];
  const cityFar = sky.querySelector(".sky__city--far");
  const cityNear= sky.querySelector(".sky__city--near");
  const kremlin = sky.querySelector(".sky__kremlin");
  const haze    = sky.querySelector(".sky__haze");
  const grad    = sky.querySelector(".sky__grad");

  /* ============================================================
     1 · STARFIELD — огни/искры навстречу
  ============================================================ */
  let stars = null, sw = 0, sh = 0, cx = 0, cy = 0, dpr = 1;
  const ctx = canvas ? canvas.getContext("2d") : null;

  const PALETTE = [
    "255,255,255",   // белый
    "255,214,160",   // тёплый янтарь (окна)
    "255,150,120",   // тёплый красный
    "190,205,255"    // холодный белый
  ];

  const N = reduced ? 0 : Math.round((mobile ? 90 : 220) * (0.6 + INTENSITY * 0.6));

  function spawn(reset) {
    return {
      x: (Math.random() * 2 - 1),
      y: (Math.random() * 2 - 1),
      z: reset ? Math.random() * 0.6 + 0.4 : Math.random(),
      c: PALETTE[(Math.random() * PALETTE.length) | 0],
      pz: 0
    };
  }

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    sw = sky.clientWidth; sh = sky.clientHeight;
    cx = sw / 2; cy = sh / 2;
    if (canvas) {
      canvas.width = sw * dpr; canvas.height = sh * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }
  resize();
  addEventListener("resize", resize, { passive: true });

  const SPREAD = 0.62;
  const BASE_SPEED = 0.0016 * (0.5 + INTENSITY);
  let speedBoost = 0; // прибавка от скорости скролла

  function drawStars() {
    if (!ctx) return;
    if (!stars) stars = Array.from({ length: N }, () => spawn(false));

    ctx.clearRect(0, 0, sw, sh);
    const spd = BASE_SPEED + speedBoost;

    for (const s of stars) {
      const prevZ = s.z;
      s.z -= spd;
      if (s.z <= 0.02) { Object.assign(s, spawn(true)); continue; }

      const k  = 1 / s.z;
      const px = cx + (s.x / s.z) * cx * SPREAD;
      const py = cy + (s.y / s.z) * cy * SPREAD;
      if (px < -40 || px > sw + 40 || py < -40 || py > sh + 40) { continue; }

      const r = Math.min(k * 0.55, 3.4);
      const a = Math.min((1 - s.z) * 1.15, 1) * 0.9;

      // след-стрик при высокой скорости → ощущение полёта
      if (spd > 0.006) {
        const ppx = cx + (s.x / prevZ) * cx * SPREAD;
        const ppy = cy + (s.y / prevZ) * cy * SPREAD;
        ctx.strokeStyle = `rgba(${s.c},${a * 0.7})`;
        ctx.lineWidth = r;
        ctx.beginPath();
        ctx.moveTo(ppx, ppy);
        ctx.lineTo(px, py);
        ctx.stroke();
      }
      ctx.fillStyle = `rgba(${s.c},${a})`;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, 6.283);
      ctx.fill();
    }
    // мягкое затухание буста
    speedBoost += (0 - speedBoost) * 0.06;
  }

  /* ============================================================
     2 · СКРОЛЛ: параллакс, облака сквозь кадр, посадка
  ============================================================ */
  let lastY = scrollY, targetP = 0, smoothP = 0;

  function scrollMetrics() {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    targetP = Math.min(1, Math.max(0, scrollY / max));
    const dy = scrollY - lastY;
    lastY = scrollY;
    // импульс скорости → разгон starfield
    speedBoost = Math.min(0.03, speedBoost + Math.abs(dy) * 0.00016 * (0.5 + INTENSITY));
  }
  addEventListener("scroll", scrollMetrics, { passive: true });

  /* ---------- взлёт: lift 0→1 ---------- */
  let lift = reduced ? 1 : 0;
  if (!reduced) {
    const t0 = performance.now();
    const DUR = 2600;
    (function liftoff(t) {
      const e = Math.min(1, (t - t0) / DUR);
      // easeOutExpo — резкий отрыв, мягкое зависание
      lift = e === 1 ? 1 : 1 - Math.pow(2, -10 * e);
      if (e < 1) requestAnimationFrame(liftoff);
    })(t0);
  }

  const CLOUD_CYCLES = clouds.length; // распределяем фазы

  function render() {
    smoothP += (targetP - smoothP) * 0.08;
    const p = smoothP;

    // силуэт города: на взлёте уходит вниз, дальше — медленный параллакс
    if (cityNear) {
      const base = (1 - lift) * -34; // на старте приподнят (мы у земли)
      cityNear.style.transform = `translate3d(0, ${base + p * 26}vh, 0) scale(${1 + (1 - lift) * 0.15})`;
      cityNear.style.opacity = String(Math.max(0, 1 - p * 2.2));
    }
    if (cityFar) {
      const base = (1 - lift) * -18;
      cityFar.style.transform = `translate3d(0, ${base + p * 15}vh, 0)`;
      cityFar.style.opacity = String(Math.max(0, 1 - p * 1.8));
    }
    // приземная дымка: густая на старте, тает при наборе высоты
    if (haze) haze.style.opacity = String(Math.max(0, (1 - lift) * 0.9 + (1 - p) * 0.12));

    // облака проходят сквозь камеру: непрерывный цикл, привязан к скроллу+времени
    const now = performance.now() * 0.00004;
    clouds.forEach((cl, i) => {
      const phase = ((p * 1.6 + now + i / Math.max(1, CLOUD_CYCLES)) % 1);
      const scale = 0.55 + phase * 2.1;                 // приближается
      const ty = (phase - 0.5) * 60;                    // сверху вниз сквозь кадр
      const fade = Math.sin(phase * Math.PI);           // виден в середине пролёта
      cl.style.transform = `translate3d(-50%, calc(-50% + ${ty}vh), 0) scale(${scale})`;
      cl.style.opacity = String(fade * 0.5 * lift);
    });

    // посадка у кремля: последние ~16% скролла
    if (kremlin) {
      const land = Math.max(0, (p - 0.84) / 0.16);
      kremlin.style.transform = `translate3d(0, ${(1 - land) * 40}vh, 0)`;
      kremlin.style.opacity = String(land);
    }
    // к посадке небо теплеет у горизонта
    if (grad) grad.style.setProperty("--land", String(Math.max(0, (p - 0.8) / 0.2)));

    // starfield тормозит на посадке
    if (p > 0.86) speedBoost *= 0.9;

    drawStars();
    requestAnimationFrame(render);
  }

  scrollMetrics();
  requestAnimationFrame(render);
})();
