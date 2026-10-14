/* ============================================================
   reel.js — авто-прокат для записи вертикального видео 9×16.
   Включается по параметру ?auto=СЕК (напр. index.html?auto=55).
   Плавно проезжает всю страницу сверху донизу через Lenis,
   поэтому pin-зал и scrub-анимации проигрываются как надо.
   Скрывает служебные подсказки/навигацию для чистого кадра.
============================================================ */
(function () {
  "use strict";
  var p = new URLSearchParams(location.search);
  if (!p.has("auto")) return;

  var DUR = parseFloat(p.get("auto")) || 55; // длительность проезда, сек
  document.documentElement.classList.add("is-reel");

  function run() {
    var max = document.documentElement.scrollHeight - innerHeight;
    if (window.BS_SCROLL && window.BS_SCROLL.scrollTo) {
      window.BS_SCROLL.scrollTo(max, { duration: DUR, easing: function (t) { return t; } });
    } else {
      var start = performance.now();
      (function step(now) {
        var e = Math.min(1, (now - start) / (DUR * 1000));
        scrollTo(0, max * e);
        if (e < 1) requestAnimationFrame(step);
      })(performance.now());
    }
  }

  // ждём взлёт (2.6с) + осадку раскладки, затем едем
  addEventListener("load", function () { setTimeout(run, 1600); });
})();
