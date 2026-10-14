/* ============================================================
   modal.js — модалки полной расшифровки кругов.
   Тексты живут здесь (контент-конфиг), разметка генерируется.
   Управление: клик по карточке (не по кнопке), Esc, клик мимо.
   A11y: focus trap + возврат фокуса.
============================================================ */
(function () {
  "use strict";

  const overlay = document.querySelector(".modal-overlay");
  if (!overlay) return;

  const content = overlay.querySelector(".modal__content");
  const closeBtn = overlay.querySelector(".modal__close");
  let lastFocused = null;

  /* ---------- Контент кругов ---------- */
  const DETAILS = {
    resident: {
      circle: "Круг I · Инструменты", name: "РЕЗИДЕНТ", price: "10 000 ₽ / месяц",
      html: `
        <h4>Для кого</h4>
        <p>Предприниматель или человек с активной позицией, которому нужны связи, окружение и рабочие инструменты. Ты действуешь, но пока тащишь всё в одиночку.</p>
        <h4>Что получаешь</h4>
        <p><b>Мастермайнд раз в месяц</b> — 200–300 предпринимателей в одном зале. Работа в группах, обмен опытом, живые знакомства.</p>
        <p><b>Закрытый Telegram-клуб</b> — главный рабочий инструмент. Нужен контрагент, подрядчик, клиент, совет — один пост, и круг отвечает.</p>
        <p><b>Бизнес-завтраки</b> — регулярная точка сборки в узком составе.</p>
        <p><b>Каталог предпринимателей</b> — твоя карточка в базе клуба. Тебя находят и рекомендуют.</p>
        <p><b>Гостевой билет</b> — раз в квартал приводи партнёра или друга.</p>
        <p><b>Афтепати и неформальные встречи</b> — связи строятся не только за столом переговоров.</p>
        <h4>Честная математика</h4>
        <p>Один нормальный подрядчик или клиент из чата окупает подписку на месяцы вперёд. Всё остальное — сверху.</p>`
    },
    media: {
      circle: "Круг II · Медиа", name: "МЕДИА", price: "30 000 ₽ / месяц",
      html: `
        <h4>Для кого</h4>
        <p>У тебя есть продукт и результат, но о тебе мало кто знает. Этот круг делает тебя заметной фигурой деловой среды города.</p>
        <h4>Что получаешь</h4>
        <p><b>Всё из круга «Резидент»</b> — мастермайнды, чат, завтраки, каталог.</p>
        <p><b>Личный бизнес-разбор</b> — твой бизнес препарируют эксперты клуба: где теряешь деньги, где точка роста. Конкретика и цифры.</p>
        <p><b>Медиа-упаковка + SEO</b> — статья-карточка о тебе и продвижение в поиске. Тебя гуглят — и находят сильный материал.</p>
        <p><b>Питч со сцены</b> — представь проект залу мастермайнда: 200–300 предпринимателей узнают о тебе за вечер.</p>
        <p><b>Фотосессия на мероприятиях</b> — профессиональный контент для соцсетей.</p>
        <p><b>Адресный нетворкинг</b> — команда клуба знакомит с теми, кто нужен именно тебе.</p>
        <p><b>Рекомендация клуба</b> — тебя советуют как проверенного.</p>
        <p><b>Скидки резидентов</b> — услуги внутри круга по своим ценам.</p>
        <h4>Логика круга</h4>
        <p>В первом круге ты ищешь возможности. Во втором — возможности находят тебя, потому что тебя видно.</p>`
    },
    vip: {
      circle: "Круг III · Близкий круг", name: "VIP", price: "50 000 ₽ / месяц",
      html: `
        <h4>Для кого</h4>
        <p>20–30 человек. Те, кто готов играть вдолгую и строить вместе. Вход через отбор.</p>
        <h4>Что получаешь</h4>
        <p><b>Всё из кругов «Резидент» и «Медиа»</b> — полный доступ.</p>
        <p><b>Близкий круг с Рафаэлем</b> — прямой доступ, стратегические сессии узким составом.</p>
        <p><b>Съёмки и интервью</b> — видеопродакшн на мероприятиях, интервью в медиа-канале клуба.</p>
        <p><b>Контент-завод zvd.news</b> — регулярный контент о тебе: ты в повестке постоянно.</p>
        <p><b>Публикации в СМИ</b> — выходы в деловые медиа города и региона.</p>
        <p><b>Интеграция бренда</b> — твой бизнес в контенте и событиях клуба.</p>
        <p><b>«Сериал» клуба</b> — ты одно из главных лиц деловой среды города.</p>
        <p><b>Первый доступ к проектам и долям</b> — цель экосистемы: 100 бизнесов. Ядро заходит первым.</p>
        <p><b>Выездные встречи</b> — спорт, рыбалка, закрытые ужины.</p>
        <h4>Логика круга</h4>
        <p>Ты совладелец движения. Поэтому вход через собеседование.</p>`
    }
  };

  function open(key) {
    const t = DETAILS[key];
    if (!t) return;
    lastFocused = document.activeElement;
    content.innerHTML = `
      <span class="tariff__circle">${t.circle}</span>
      <h3 class="tariff__name">${t.name}</h3>
      <div class="tariff__price">${t.price}</div>
      ${t.html}
      <a href="#apply" class="btn" data-modal-apply style="width:100%;justify-content:center;margin-top:1.5rem">Подать заявку</a>`;
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    // стопим фоновый скролл
    window.BS_SCROLL?.stop();
    document.body.style.overflow = "hidden";
    closeBtn.focus();

    content.querySelector("[data-modal-apply]").addEventListener("click", close);
  }

  function close() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    window.BS_SCROLL?.start();
    document.body.style.overflow = "";
    lastFocused?.focus();
  }

  /* Клик по карточке круга (кнопки внутри работают как обычно) */
  document.querySelectorAll(".tariff[data-tariff]").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("a.btn")) return;
      open(card.dataset.tariff);
    });
    // клавиатура: Enter/Space открывают модалку
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open(card.dataset.tariff);
      }
    });
  });

  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  /* Focus trap: Tab не уходит за пределы модалки */
  overlay.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const focusables = overlay.querySelectorAll("button, a, [tabindex]");
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  });
})();
