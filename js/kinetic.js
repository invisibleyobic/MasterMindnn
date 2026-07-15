/* ============================================================
   kinetic.js — кинетическая типографика заголовков.
   Каждая буква крупных титров реагирует на СКОРОСТЬ скролла:
   наклон (skewX) + вертикальный увод бегут волной по строке —
   титр «дышит» на разгоне и замирает в покое.
   Приём из award-виноватых скролл-сайтов (per-char velocity skew).
   Не трогает hero/manifesto (их гонит GSAP) — только .section__title
   и .final__title. Разбивает текст, сохраняя вложенный .accent.
============================================================ */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var touch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  if (reduced) return;

  var SEL = ".section__title, .final__title";
  var titles = [];

  /* ---- Разбивка на буквы с сохранением разметки (.accent, <br>) ---- */
  function splitNode(node, chars) {
    for (var i = 0; i < node.childNodes.length; i++) {
      var child = node.childNodes[i];
      if (child.nodeType === 3) {                 // текстовый узел → буквы
        var text = child.nodeValue;
        if (!text.trim()) { continue; }           // пробельный узел — пропускаем
        var frag = document.createDocumentFragment();
        var inserted = 0;
        for (var c = 0; c < text.length; c++) {
          var ch = text[c];
          if (ch === " ") { frag.appendChild(document.createTextNode(" ")); inserted++; continue; }
          var span = document.createElement("span");
          span.className = "kin-char";
          span.textContent = ch;
          span.style.display = "inline-block";
          span.style.willChange = "transform";
          frag.appendChild(span);
          chars.push(span);
          inserted++;
        }
        node.replaceChild(frag, child);
        i += inserted - 1; // перескочить за вставленные узлы (их не переобрабатываем)
      } else if (child.nodeType === 1 && child.tagName !== "BR" && !child.classList.contains("kin-char")) {
        splitNode(child, chars);                  // рекурсия в .accent
      }
    }
  }

  document.querySelectorAll(SEL).forEach(function (el) {
    var chars = [];
    splitNode(el, chars);
    if (!chars.length) return;
    var rec = { el: el, chars: chars, live: false, cur: [] };
    for (var i = 0; i < chars.length; i++) rec.cur.push(0);
    titles.push(rec);
  });
  if (!titles.length) return;

  /* Оживляем только те титры, что на экране */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      for (var i = 0; i < titles.length; i++) {
        if (titles[i].el === e.target) titles[i].live = e.isIntersecting;
      }
    });
  }, { rootMargin: "10% 0px" });
  titles.forEach(function (t) { io.observe(t.el); });

  /* ---- Скорость скролла ---- */
  var lastY = window.scrollY, vel = 0;
  addEventListener("scroll", function () {
    var y = window.scrollY;
    vel += (y - lastY);
    lastY = y;
  }, { passive: true });

  var MAXV = touch ? 6 : 9;   // предел наклона, градусы
  function loop() {
    vel *= 0.86;                              // затухание инерции
    var target = Math.max(-1, Math.min(1, vel / 42));  // -1..1
    for (var t = 0; t < titles.length; t++) {
      var T = titles[t];
      if (!T.live) continue;
      for (var i = 0; i < T.chars.length; i++) {
        // волна: каждая следующая буква догоняет с задержкой
        var lag = 1 - Math.min(1, (i * 0.6) / T.chars.length);
        var goal = target * lag;
        T.cur[i] += (goal - T.cur[i]) * 0.18;
        var s = T.cur[i];
        T.chars[i].style.transform =
          "skewX(" + (s * MAXV) + "deg) translateY(" + (s * 10) + "px)";
      }
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
