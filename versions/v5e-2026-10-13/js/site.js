/* ============================================================
   site.js — общий скрипт v2 (все страницы). Без библиотек.
   • сезон по дате (дек–фев — зима, иначе осень) + ручной выбор в подвале
   • мобильное меню
   • дни до мастермайнда
   • видеоотзывы по клику
   • форма заявки (SLOT: бот/CRM)
   • мягкое появление блоков
============================================================ */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.add("js");

  /* ---------- Конфиг ---------- */
  var CFG = {
    eventDate: "2026-11-01T18:00:00+03:00",
    tgApply: "SALMANOVRS"            // SLOT: заменить на бота / CRM
  };

  /* ---------- Сезон ---------- */
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  var m = new Date().getMonth();                     // 0 = январь
  var auto = (m === 11 || m <= 1) ? "winter" : "autumn";
  var qs = new URLSearchParams(location.search).get("season");
  var season = qs || store("bs-season") || auto;
  function setSeason(s) {
    root.setAttribute("data-season", s);
    document.querySelectorAll("[data-season-label]").forEach(function (el) {
      el.textContent = s === "winter" ? "Зимний сезон 2026/27" : "Осенний сезон 2026";
    });
    document.querySelectorAll("[data-season-word]").forEach(function (el) {
      el.textContent = s === "winter" ? "Зимний" : "Осенний";
    });
    document.querySelectorAll(".season-switch button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.set === s));
    });
  }
  setSeason(season);
  document.querySelectorAll(".season-switch button").forEach(function (b) {
    b.addEventListener("click", function () { store("bs-season", b.dataset.set); setSeason(b.dataset.set); });
  });

  /* ---------- Фоновое видео hero (тема C): только десктоп, один запрос ---------- */
  var hv = document.querySelector(".hero__video[data-src]");
  if (hv) {
    var small = matchMedia("(max-width: 768px)").matches, calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!small && !calm) {
      hv.src = hv.dataset.src + (hv.canPlayType('video/webm; codecs="vp9"') ? ".webm" : ".mp4");
      hv.removeAttribute("data-src");
      var pr = hv.play(); if (pr && pr.catch) pr.catch(function () {});
    }
  }

  /* ---------- Мобильное меню ---------- */
  var burger = document.querySelector(".burger");
  if (burger) {
    burger.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      burger.setAttribute("aria-expanded", String(open));
    });
    document.querySelectorAll(".nav a").forEach(function (a) {
      a.addEventListener("click", function () { document.body.classList.remove("menu-open"); burger.setAttribute("aria-expanded", "false"); });
    });
  }

  /* ---------- Дни до встречи ---------- */
  var days = Math.ceil((new Date(CFG.eventDate) - new Date()) / 864e5);
  function plural(n, a, b, c) { n = Math.abs(n) % 100; var n1 = n % 10; if (n > 10 && n < 20) return c; if (n1 > 1 && n1 < 5) return b; if (n1 === 1) return a; return c; }
  document.querySelectorAll("[data-days-left]").forEach(function (el) {
    if (days > 1) el.textContent = "через " + days + " " + plural(days, "день", "дня", "дней");
    else if (days === 1) el.textContent = "завтра";
    else if (days === 0) el.textContent = "сегодня";
    else el.textContent = "дата следующей встречи скоро";
  });

  /* ---------- Видеоотзывы по клику ---------- */
  document.querySelectorAll(".review[data-video]").forEach(function (card) {
    function play() {
      var media = card.querySelector(".review__media");
      if (media.querySelector("video")) return;
      var v = document.createElement("video");
      v.src = card.dataset.video; v.controls = true; v.autoplay = true; v.playsInline = true;
      media.appendChild(v);
      v.addEventListener("play", function () {
        document.querySelectorAll(".review video").forEach(function (o) { if (o !== v) o.pause(); });
      });
    }
    card.addEventListener("click", play);
    card.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); play(); } });
  });

  /* ---------- Форма заявки ---------- */
  var form = document.querySelector(".form[data-apply]");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll("[required]").forEach(function (inp) {
        var f = inp.closest(".field"); var bad = inp.type === "checkbox" ? !inp.checked : !inp.value.trim();
        if (f) { f.classList.toggle("is-invalid", bad); var er = f.querySelector(".field__err"); if (er) er.textContent = bad ? "Заполни это поле" : ""; }
        if (bad) ok = false;
      });
      if (!ok) { var first = form.querySelector(".is-invalid input, .is-invalid textarea"); if (first) first.focus(); return; }
      var d = new FormData(form);
      var text = "Заявка с сайта Business Syndicate\n" +
        "Имя: " + d.get("name") + "\nКонтакт: " + d.get("contact") +
        "\nКруг: " + (d.get("tier") || "не выбран") + "\nВопрос: " + d.get("question");
      /* SLOT: здесь будет fetch() в Telegram-бота или CRM. Пока — открываем чат с готовым текстом. */
      window.open("https://t.me/" + CFG.tgApply + "?text=" + encodeURIComponent(text), "_blank", "noopener");
      form.classList.add("is-sent");
    });
  }

  /* ---------- Появление блоков ---------- */
  var els = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && els.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add("is-in"); });
  }
})();
