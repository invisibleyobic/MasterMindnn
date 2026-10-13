/* d.js — точки-прогресс по слайдам (телефон) */
(function () {
  "use strict";
  var nav = document.querySelector(".dots");
  var slides = document.querySelectorAll(".slide[id]");
  if (!nav || !slides.length || !("IntersectionObserver" in window)) return;
  var dots = {};
  slides.forEach(function (s) {
    var a = document.createElement("a");
    a.href = "#" + s.id;
    a.setAttribute("aria-label", s.dataset.title || s.id);
    nav.appendChild(a);
    dots[s.id] = a;
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        Object.keys(dots).forEach(function (k) { dots[k].classList.toggle("is-on", k === en.target.id); });
      }
    });
  }, { threshold: 0.55 });
  slides.forEach(function (s) { io.observe(s); });
})();
