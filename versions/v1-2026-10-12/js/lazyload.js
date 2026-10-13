/* ============================================================
   lazyload.js — ленивая загрузка медиа.
   • <img data-src> и <video data-src> грузятся при приближении.
   • Видео: autoplay muted loop при появлении, пауза вне экрана.
   • Видеоотзывы: iframe-эмбед создаётся только по клику.
============================================================ */
(function () {
  "use strict";

  /* ---------- Изображения ---------- */
  const imgIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const img = e.target;
      img.src = img.dataset.src;
      img.removeAttribute("data-src");
      imgIO.unobserve(img);
    });
  }, { rootMargin: "300px" }); // грузим заранее — без «прыжков»
  document.querySelectorAll("img[data-src]").forEach((img) => imgIO.observe(img));

  /* ---------- Фоновые видео: play в кадре, pause вне ---------- */
  const videoIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting) {
        if (v.dataset.src) { v.src = v.dataset.src; v.removeAttribute("data-src"); }
        v.play().catch(() => {}); // autoplay может быть запрещён — не падаем
      } else {
        v.pause();
      }
    });
  }, { rootMargin: "100px" });
  document.querySelectorAll("video[muted]").forEach((v) => videoIO.observe(v));

  /* ---------- Видеоотзывы: плеер по клику ----------
     data-video-local — локальный mp4 (assets/video),
     data-video — embed-ссылка (VK/YouTube) для продакшна. */
  document.querySelectorAll(".video-card").forEach((card) => {
    card.addEventListener("click", () => {
      const thumb = card.querySelector(".video-card__thumb");
      if (thumb.querySelector("iframe, video")) return; // уже играет

      const local = card.dataset.videoLocal;
      const embed = card.dataset.video;

      if (local) {
        const video = document.createElement("video");
        video.src = local;
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;
        video.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#000";
        thumb.appendChild(video);
        // при паузе других карточек — стопим остальные видео
        video.addEventListener("play", () => {
          document.querySelectorAll(".video-card video").forEach((v) => {
            if (v !== video) v.pause();
          });
        });
      } else if (embed) {
        const iframe = document.createElement("iframe");
        iframe.src = embed;
        iframe.allow = "autoplay; fullscreen";
        iframe.loading = "lazy";
        iframe.style.cssText = "position:absolute;inset:0;width:100%;height:100%;border:0";
        thumb.appendChild(iframe);
      }
    });
  });
})();
