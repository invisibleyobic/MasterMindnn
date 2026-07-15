/* ============================================================
   form.js — форма заявки: живая валидация, микроанимации,
   успешная анимация после отправки.
   Бэка пока нет: заявка формирует текст и уводит в Telegram.
============================================================ */
(function () {
  "use strict";

  const form = document.querySelector(".form");
  if (!form) return;

  const CFG = window.BS_CONFIG;

  /* Правила валидации по имени поля */
  const RULES = {
    name:  { test: (v) => v.trim().length >= 2, msg: "Напиши имя" },
    phone: { test: (v) => /^[\d\s()+-]{10,}$/.test(v.trim()), msg: "Проверь номер телефона" },
    biz:   { test: (v) => v.trim().length >= 2, msg: "Пара слов о твоём деле" },
    tariff:{ test: (v) => v !== "", msg: "Выбери круг" }
  };

  /* Живая валидация: ошибка снимается сразу при исправлении */
  form.querySelectorAll("input, select").forEach((input) => {
    input.addEventListener("input", () => {
      const field = input.closest(".field");
      if (field?.classList.contains("is-error") && validateField(input)) {
        field.classList.remove("is-error");
      }
    });
    input.addEventListener("blur", () => validateField(input, true));
  });

  function validateField(input, mark = false) {
    const rule = RULES[input.name];
    if (!rule) return true;
    const ok = rule.test(input.value);
    const field = input.closest(".field");
    if (!ok && mark && field) {
      field.classList.add("is-error");
      const err = field.querySelector(".field__error");
      if (err) err.textContent = rule.msg;
    }
    return ok;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // валидация всех полей, фокус на первом невалидном
    let firstBad = null;
    form.querySelectorAll("input[name], select[name]").forEach((input) => {
      if (!validateField(input, true) && !firstBad) firstBad = input;
    });
    if (firstBad) { firstBad.focus(); return; }

    const data = Object.fromEntries(new FormData(form));

    /* Пока нет бэка — формируем текст заявки и открываем Telegram.
       SLOT: заменить на fetch(API) при подключении CRM/бота. */
    const text = encodeURIComponent(
      `Заявка в ${CFG.clubName}\n` +
      `Имя: ${data.name}\nТелефон: ${data.phone}\nTG: ${data.tg || "—"}\n` +
      `Бизнес: ${data.biz}\nКруг: ${data.tariff}\n✅ Кодекс принят`
    );
    window.open(`https://t.me/share/url?url=&text=${text}`, "_blank");

    /* Успешная анимация */
    form.classList.add("is-sent");
    if (window.gsap) {
      gsap.from(".form__success", { opacity: 0, y: 24, duration: 0.7, ease: "power3.out" });
    }
  });
})();
