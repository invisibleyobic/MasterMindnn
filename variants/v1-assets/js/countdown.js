/* ============================================================
   countdown.js — таймер с фазами (1 день = 1 этап),
   красивое обновление цифр (flip через transform)
   и анимированный ползунок мест.
============================================================ */
(function () {
  "use strict";

  const block = document.querySelector(".countdown-block");
  if (!block) return;

  const CFG = window.BS_CONFIG;
  const msgEl   = block.querySelector(".countdown-block__msg");
  const bonusEl = block.querySelector(".countdown-block__bonus");
  const cells = {
    d: block.querySelector('[data-unit="d"]'),
    h: block.querySelector('[data-unit="h"]'),
    m: block.querySelector('[data-unit="m"]'),
    s: block.querySelector('[data-unit="s"]')
  };
  const prev = { d: null, h: null, m: null, s: null };
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Склонение: 1 день / 2 дня / 5 дней */
  function plural(n, forms) {
    const c = n % 100;
    if (c > 10 && c < 20) return forms[2];
    const c1 = n % 10;
    return c1 === 1 ? forms[0] : (c1 > 1 && c1 < 5 ? forms[1] : forms[2]);
  }

  /* Обновление ячейки с flip-анимацией (только transform/opacity) */
  function setCell(unit, value) {
    const str = String(value).padStart(2, "0");
    if (prev[unit] === str) return;
    prev[unit] = str;
    const el = cells[unit];
    if (!el) return;

    if (window.gsap && !reduced) {
      gsap.timeline()
        .to(el, { yPercent: -60, opacity: 0, duration: 0.18, ease: "power2.in" })
        .add(() => (el.textContent = str))
        .fromTo(el, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.28, ease: "power3.out" });
    } else {
      el.textContent = str;
    }
  }

  function tick() {
    const now = new Date();
    const end = new Date(CFG.eventDate);
    const diff = end - now;

    if (diff < 0) {
      msgEl.innerHTML = "Мастермайнд прошёл. <strong>Следующий — скоро. Оставь заявку.</strong>";
      return;
    }

    const d = Math.floor(diff / 864e5);
    setCell("d", d);
    setCell("h", Math.floor(diff / 36e5) % 24);
    setCell("m", Math.floor(diff / 6e4) % 60);
    setCell("s", Math.floor(diff / 1e3) % 60);

    // фаза периода (визуальный режим + бонус)
    const phase = CFG.countdown.phases.find((p) => d >= p.minDays)
               || CFG.countdown.phases[CFG.countdown.phases.length - 1];
    block.classList.toggle("is-final", phase.mode === "final");

    // сообщение дня: точное для ключевых дней, иначе — общее
    const dayMsg = CFG.countdown.daily[d]
      || `${d} ${plural(d, ["день", "дня", "дней"])} до мастермайнда`;
    msgEl.innerHTML = `<strong>${phase.label}:</strong> ${dayMsg}`;
    bonusEl.textContent = phase.bonus;
  }

  tick();
  setInterval(tick, 1000);

  /* ---------- Ползунок мест: анимация при появлении ---------- */
  const fill = document.querySelector(".seats__fill");
  const leftEl = document.querySelector("[data-seats-left]");
  const totalEl = document.querySelector("[data-seats-total]");
  if (fill && leftEl && totalEl) {
    leftEl.textContent = CFG.seatsLeft;
    totalEl.textContent = CFG.seatsTotal;
    const ratio = Math.min(1, (CFG.seatsTotal - CFG.seatsLeft) / CFG.seatsTotal);

    if (window.gsap && window.ScrollTrigger && !reduced) {
      gsap.to(fill, {
        scaleX: ratio, duration: 1.6, ease: "power3.out",
        scrollTrigger: { trigger: fill, start: "top 92%" }
      });
    } else {
      fill.style.transform = `scaleX(${ratio})`;
    }
  }
})();
