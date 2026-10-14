/* ============================================================
   map.js — тёмная карта Яндекса (v3) в блоке «Где встречаемся».
   Точка: Hampton by Hilton, ул. Максима Горького, 252, Н.Новгород.
============================================================ */
(function () {
  "use strict";

  var el = document.getElementById("ymap");
  if (!el) return;

  var CENTER = [44.029657, 56.320553]; // [долгота, широта]

  /* Фолбэк: API не загрузился (ключ привязан к боевому домену /
     нет сети) — показываем статичный фирменный пин, не пустую плиту. */
  function fallback() {
    el.classList.add("location__map--static");
    el.innerHTML =
      '<div class="ymap-fallback">' +
      '<span class="ymap-pin__pulse"></span>' +
      '<span class="ymap-pin__dot"></span>' +
      '<span class="ymap-pin__label">Hampton by Hilton · ул. Максима Горького, 252</span>' +
      '</div>';
  }

  if (!window.ymaps3) { fallback(); return; }

  ymaps3.ready.then(function () {
    var YMap = ymaps3.YMap,
        YMapDefaultSchemeLayer = ymaps3.YMapDefaultSchemeLayer,
        YMapDefaultFeaturesLayer = ymaps3.YMapDefaultFeaturesLayer,
        YMapMarker = ymaps3.YMapMarker,
        YMapControls = ymaps3.YMapControls,
        YMapZoomControl = ymaps3.YMapZoomControl;

    var map = new YMap(el, {
      location: { center: CENTER, zoom: 16 },
      theme: "dark",
      behaviors: ["drag", "pinchZoom", "dblClick", "mouseTracking"]
    });

    map.addChild(new YMapDefaultSchemeLayer({ theme: "dark" }));
    map.addChild(new YMapDefaultFeaturesLayer());

    if (YMapControls && YMapZoomControl) {
      map.addChild(
        new YMapControls({ position: "right" }).addChild(new YMapZoomControl({}))
      );
    }

    /* Кастомный пин в стиле сайта: красная точка + пульс + подпись */
    var pin = document.createElement("div");
    pin.className = "ymap-pin";
    pin.innerHTML =
      '<span class="ymap-pin__pulse"></span>' +
      '<span class="ymap-pin__dot"></span>' +
      '<span class="ymap-pin__label">Hampton by Hilton</span>';

    map.addChild(new YMapMarker({ coordinates: CENTER }, pin));
  }).catch(function () { fallback(); });
})();
