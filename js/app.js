/* ============================================================
   app.js — оркестратор: подстановка конфига в DOM.
   Название клуба, город, место, слоган — из BS_CONFIG.
   Это «бэкдор»: смена названия = одна строка в config.js.
============================================================ */
(function () {
  "use strict";

  const CFG = window.BS_CONFIG;

  /* Название клуба: вторая часть слова подсвечивается красным */
  document.querySelectorAll("[data-club]").forEach((el) => {
    const parts = CFG.clubName.split(" ");
    el.innerHTML = parts.length > 1
      ? `${parts[0].toUpperCase()} <span class="accent">${parts.slice(1).join(" ").toUpperCase()}</span>`
      : CFG.clubName.toUpperCase();
  });

  document.querySelectorAll("[data-city]").forEach((el) => (el.textContent = CFG.city));
  document.querySelectorAll("[data-place]").forEach((el) => (el.textContent = CFG.eventPlace));
  document.querySelectorAll("[data-slogan]").forEach((el) => (el.textContent = CFG.slogan));
  document.querySelectorAll("[data-club-text]").forEach((el) => (el.textContent = CFG.clubName));

  /* Дата мастермайнда в афише (из eventDate) */
  const ev = new Date(CFG.eventDate);
  const MONTHS = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
  document.querySelectorAll("[data-mm-date]").forEach((el) => (el.textContent = ev.getDate() + " " + MONTHS[ev.getMonth()]));
})();
