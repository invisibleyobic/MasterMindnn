/* ============================================================
   cursor.js — кастомный курсор УБРАН по решению заказчика.
   Оставлен только магнитный эффект кнопок.
   (История: был вариант «красный круг», затем liquid glass
   линза — откатили. Возврат возможен из git-истории/чата.)
============================================================ */
(function () {
  "use strict";

  var isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (isTouch || reduced) return;

  /* Магнитные кнопки: тянутся к курсору внутри своей зоны */
  var strength = window.BS_CONFIG.anim.magnetStrength;
  document.querySelectorAll(".btn").forEach(function (btn) {
    btn.addEventListener("mousemove", function (e) {
      var r = btn.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2);
      var dy = e.clientY - (r.top + r.height / 2);
      btn.style.transform = "translate3d(" + (dx * strength) + "px, " + (dy * strength) + "px, 0)";
    });
    btn.addEventListener("mouseleave", function () {
      if (window.gsap) {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)", clearProps: "transform" });
      } else {
        btn.style.transform = "";
      }
    });
  });
})();
