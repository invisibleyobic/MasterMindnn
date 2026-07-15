/* ============================================================
   gallery.js — fullscreen-лайтбокс галереи мероприятий.
   Плавное масштабирование, подписи, навигация ←/→, Esc.
============================================================ */
(function () {
  "use strict";

  const items = [...document.querySelectorAll(".gallery__item")];
  const lightbox = document.querySelector(".lightbox");
  if (!items.length || !lightbox) return;

  const frame   = lightbox.querySelector(".lightbox__frame");
  const caption = lightbox.querySelector(".lightbox__caption");
  const btnPrev = lightbox.querySelector("[data-lb-prev]");
  const btnNext = lightbox.querySelector("[data-lb-next]");
  const btnClose= lightbox.querySelector("[data-lb-close]");
  let index = 0;

  function render() {
    const item = items[index];
    const img = item.querySelector("img");
    const cap = item.querySelector("figcaption")?.textContent || "";
    // если фото ещё нет (плейсхолдер) — показываем заглушку
    frame.innerHTML = img
      ? `<img src="${img.currentSrc || img.dataset.src || img.src}" alt="${img.alt || cap}">`
      : `<div style="width:70vw;max-width:900px;aspect-ratio:16/9;background:linear-gradient(140deg,#1a1a22,#0e0e12);display:flex;align-items:center;justify-content:center;color:#4a4a55">Фото скоро появится</div>`;
    caption.textContent = cap ? `${cap} · ${index + 1} / ${items.length}` : `${index + 1} / ${items.length}`;
  }

  function open(i) {
    index = i;
    render();
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    window.BS_SCROLL?.stop();
    document.body.style.overflow = "hidden";
  }
  function close() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    window.BS_SCROLL?.start();
    document.body.style.overflow = "";
  }
  const step = (dir) => { index = (index + dir + items.length) % items.length; render(); };

  items.forEach((item, i) => {
    item.addEventListener("click", () => open(i));
    item.setAttribute("tabindex", "0");
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter") open(i);
    });
  });
  btnPrev.addEventListener("click", () => step(-1));
  btnNext.addEventListener("click", () => step(1));
  btnClose.addEventListener("click", close);
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) close(); });
  addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });
})();
