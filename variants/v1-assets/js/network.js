/* ============================================================
   network.js — интерактивная инсталляция «Связи решают».
   Собственный движок (без библиотек графов):
   • полноценная физика: скорость, ускорение, масса,
     притяжение/отталкивание, демпфирование, инерция;
   • spatial hashing для поиска соседей (O(n) на кадр);
   • гравитация курсора — ближайшие точки тянутся к нему;
   • импульс: наведение на точку зажигает волну по связям;
   • клик — точки слетаются и образуют слово из самих себя;
   • после 5 слов — финал: вся сеть строит BUSINESS SYNDICATE.
   Машина состояний: AMBIENT → GATHER → HOLD → DISPERSE → …
                     → EXCITE → FINAL → FINAL_HOLD → AMBIENT.
============================================================ */
(function () {
  "use strict";

  var wrap = document.querySelector(".network__canvas-wrap");
  var canvas = wrap && wrap.querySelector("canvas");
  var captionEl = document.querySelector(".network__caption");
  var hintEl = document.querySelector(".network__hint");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!canvas) return;

  /* ---------------- Конфиг сцены ---------------- */
  var CFG = {
    density: 1 / 2100,      // точек на px² (авто-масштаб под размер)
    maxNodes: 560,          // потолок для мощных экранов
    minNodes: 130,          // пол для мобильных
    linkDist: 120,          // px — дистанция появления связи
    mouseRadius: 190,       // px — радиус гравитации курсора
    mousePull: 0.06,        // сила гравитации курсора
    idlePulse: 4200,        // мс — сеть живёт сама: авто-импульс без действий
    wander: 0.035,          // сила собственного блуждания
    separation: 0.06,       // отталкивание при сближении
    cohesion: 0.0022,       // слабое притяжение к соседям (организм)
    damping: 0.955,         // демпфирование (инерция)
    maxSpeed: 1.7,          // предел скорости в ambient
    springK: 0.05,          // жёсткость магнитной пружины к букве
    springDamp: 0.865,      // демпфирование полёта (мягкая посадка)
    igniteChain: 0.90,      // сколько энергии передаёт импульс соседу
    glowDecay: 0.975,       // затухание свечения
    holdTime: 3800,         // мс — слово держится
    finalHold: 9000,        // мс — финальная надпись
    exciteTime: 2200,       // мс — «сеть оживает» перед финалом
    accent: "250, 30, 50"
  };

  var WORDS = ["БИЗНЕС", "ПАРТНЁРСТВО", "РОСТ", "ДОВЕРИЕ", "КОМАНДА"];

  /* ---------------- Состояние ---------------- */
  var W = 0, H = 0, dpr = 1;
  var ctx = canvas.getContext("2d");
  var nodes = [];
  var grid = {};           // spatial hash: "cx,cy" -> [индексы]
  var cell = CFG.linkDist;
  var mouse = { x: -9999, y: -9999, active: false };
  var state = "AMBIENT";
  var wordIndex = 0;
  var lastAuto = 0;        // время последнего авто-импульса (сеть живёт сама)
  var layout = null;      // раскладка текущего слова: {lines, fs, y0, lineH}
  var wordAlpha = 0;      // прозрачность заливки букв (0..1)
  var stateTimer = 0;      // timestamp перехода
  var running = false, rafId = 0, lastT = 0;

  /* ---------------- Инициализация ---------------- */
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = wrap.clientWidth; H = wrap.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawnNodes() {
    var count = Math.max(CFG.minNodes, Math.min(CFG.maxNodes, Math.round(W * H * CFG.density)));
    nodes = [];
    for (var i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        mass: 0.8 + Math.random() * 0.6,   // разная масса — разный характер
        z: 0.55 + Math.random() * 0.9,     // глубина: дальние мельче, тусклее, медленнее
        r: 1.4 + Math.random() * 1.8,
        glow: 0,                            // энергия импульса 0..1
        cool: 0,                            // кулдаун повторного зажигания
        tx: null, ty: null,                 // цель (точка буквы) или null
        white: 0,                           // 0 — красная, 1 — белая (в составе слова)
        vis: 1,                             // видимость точки: гаснет, когда проявляется типографика
        phase: Math.random() * Math.PI * 2  // фаза дыхания
      });
    }
  }

  /* ---------------- Spatial hash ---------------- */
  function rebuildGrid() {
    grid = {};
    for (var i = 0; i < nodes.length; i++) {
      var key = ((nodes[i].x / cell) | 0) + "," + ((nodes[i].y / cell) | 0);
      (grid[key] || (grid[key] = [])).push(i);
    }
  }
  /* обход соседних ячеек вокруг точки */
  function neighbors(n, cb) {
    var cx = (n.x / cell) | 0, cy = (n.y / cell) | 0;
    for (var gx = cx - 1; gx <= cx + 1; gx++) {
      for (var gy = cy - 1; gy <= cy + 1; gy++) {
        var bucket = grid[gx + "," + gy];
        if (bucket) for (var k = 0; k < bucket.length; k++) cb(nodes[bucket[k]]);
      }
    }
  }

  /* ---------------- Слово → точки-цели ----------------
     Рисуем текст на offscreen-canvas и сэмплируем пиксели. */
  function sampleWord(lines, maxPoints) {
    var off = document.createElement("canvas");
    off.width = W; off.height = H;
    var octx = off.getContext("2d");
    octx.fillStyle = "#fff";
    octx.textAlign = "center";
    octx.textBaseline = "middle";

    // подбираем размер шрифта под ширину сцены
    var longest = lines.reduce(function (a, b) { return a.length > b.length ? a : b; });
    var fs = Math.min(H / (lines.length * 1.5), (W * 0.86) / (longest.length * 0.62));
    octx.font = "900 " + fs + "px Inter, Arial, sans-serif";
    var lineH = fs * 1.18;
    var y0 = H / 2 - (lines.length - 1) * lineH / 2;
    lines.forEach(function (line, i) { octx.fillText(line, W / 2, y0 + i * lineH); });

    // запоминаем раскладку — по ней рисуется заливка букв под точками
    layout = { lines: lines, fs: fs, y0: y0, lineH: lineH };

    // сэмплируем с шагом, подгоняя количество точек
    var img = octx.getImageData(0, 0, W, H).data;
    var pts = [];
    var step = 4;
    do {
      pts.length = 0;
      for (var y = 0; y < H; y += step) {
        for (var x = 0; x < W; x += step) {
          if (img[(y * W + x) * 4 + 3] > 128) pts.push({ x: x, y: y });
        }
      }
      step++;
    } while (pts.length > maxPoints && step < 24);
    return pts;
  }

  /* Назначение целей: и точки, и цели сортируем по углу от центра —
     траектории полёта не пересекаются в кашу, летят красиво веером */
  function assignTargets(pool, targets) {
    var byAngle = function (cx, cy) {
      return function (a, b) {
        return Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx);
      };
    };
    pool.sort(byAngle(W / 2, H / 2));
    targets.sort(byAngle(W / 2, H / 2));
    for (var i = 0; i < pool.length; i++) {
      if (i < targets.length) { pool[i].tx = targets[i].x; pool[i].ty = targets[i].y; }
      else { pool[i].tx = null; pool[i].ty = null; }
    }
  }

  /* ---------------- Переходы состояний ---------------- */
  function setCaption(text, visible) {
    if (!captionEl) return;
    if (text !== null) captionEl.innerHTML = text;
    captionEl.classList.toggle("is-visible", visible);
  }

  /* Полёт — честная физика, не твин.
     Каждая точка получает:
     • момент старта (волна от точки клика),
     • боковой импульс — траектория идёт дугой, как магнит;
     дальше её ведёт пружина (springK/springDamp) — разная масса
     даёт разный характер полёта, посадка мягкая, без рельс. */
  function launch(pool, originX, originY, now, spread) {
    for (var i = 0; i < pool.length; i++) {
      var n = pool[i];
      if (n.tx === null) continue;
      var dOrigin = Math.hypot(n.x - originX, n.y - originY);
      n.t0 = now + dOrigin * spread + Math.random() * 220;
      // боковой импульс применится в момент старта (kickDone)
      var dx = n.tx - n.x, dy = n.ty - n.y;
      var len = Math.hypot(dx, dy) || 1;
      var side = (Math.random() < 0.5 ? 1 : -1) * (2.2 + Math.random() * 3.8);
      n.kx = -dy / len * side;
      n.ky = dx / len * side;
      n.kickDone = false;
    }
  }

  function startGather(word) {
    var targets = sampleWord([word], Math.floor(nodes.length * 0.85));
    // слетаются ближайшие к клику; дальние продолжают жить фоном
    var pool = nodes.slice().sort(function (a, b) {
      var da = (a.x - mouse.x) * (a.x - mouse.x) + (a.y - mouse.y) * (a.y - mouse.y);
      var db = (b.x - mouse.x) * (b.x - mouse.x) + (b.y - mouse.y) * (b.y - mouse.y);
      return da - db;
    }).slice(0, targets.length);
    assignTargets(pool, targets);
    var now = performance.now();
    launch(pool, mouse.x, mouse.y, now, 1.3);
    state = "GATHER";
    stateTimer = now;
    setCaption("Так рождается — <b>" + word + "</b>", false);
  }

  function startFinal() {
    var targets = sampleWord(["BUSINESS", "SYNDICATE"], nodes.length);
    assignTargets(nodes.slice(), targets);
    var now = performance.now();
    // финал: волна старта длиннее — торжественнее
    launch(nodes, W / 2, H / 2, now, 2.1);
    state = "FINAL";
    stateTimer = now;
    setCaption("По отдельности — предприниматели.<br>Вместе — <b>Business Syndicate</b>.", false);
  }

  function disperse() {
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.tx = null; n.ty = null;
      // красивый разлёт: импульс от центра + случайность
      var ang = Math.atan2(n.y - H / 2, n.x - W / 2) + (Math.random() - 0.5);
      var force = 1.2 + Math.random() * 1.6;
      n.vx += Math.cos(ang) * force;
      n.vy += Math.sin(ang) * force;
    }
    setCaption(null, false);
    state = "AMBIENT";
  }

  /* ---------------- Хинт: подсказка следующего шага ---------------- */
  function setHint() {
    if (!hintEl) return;
    hintEl.textContent = wordIndex === 0 ? "кликни по сети"
      : wordIndex < WORDS.length ? "кликни ещё"
      : "последний клик — собери всех";
  }

  /* ---------------- Клик ---------------- */
  wrap.addEventListener("click", function () {
    if (state !== "AMBIENT") return;
    if (wordIndex < WORDS.length) {
      startGather(WORDS[wordIndex]);
      wordIndex++;
      setHint();
    } else {
      // финал: сначала вся сеть «оживает», потом строит логотип
      state = "EXCITE";
      stateTimer = performance.now();
      for (var i = 0; i < nodes.length; i++) if (Math.random() < 0.4) nodes[i].glow = 1;
    }
  });

  wrap.addEventListener("mousemove", function (e) {
    var r = wrap.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
    mouse.active = true;
  }, { passive: true });
  wrap.addEventListener("mouseleave", function () {
    mouse.active = false;
    mouse.x = -9999; mouse.y = -9999;
  });

  /* тач: палец = курсор (гравитация и импульсы работают на мобиле) */
  wrap.addEventListener("touchmove", function (e) {
    var t = e.touches[0];
    var r = wrap.getBoundingClientRect();
    mouse.x = t.clientX - r.left;
    mouse.y = t.clientY - r.top;
    mouse.active = true;
  }, { passive: true });
  wrap.addEventListener("touchend", function () {
    setTimeout(function () { mouse.active = false; mouse.x = -9999; mouse.y = -9999; }, 600);
  }, { passive: true });

  /* ---------------- Физика кадра ---------------- */
  function step(dt, now) {
    rebuildGrid();
    var i, n;

    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      var ax = 0, ay = 0;

      if (n.tx !== null) {
        /* Магнитный полёт: пружина к цели + демпфирование.
           Настоящая симуляция — скорость/масса/инерция живые,
           поэтому траектория каждой точки уникальна. */
        n.px = n.x; n.py = n.y;
        if (now >= n.t0) {
          if (!n.kickDone) { // стартовый боковой импульс — дуга
            n.vx += n.kx; n.vy += n.ky;
            n.kickDone = true;
          }
          var k = CFG.springK / n.mass;
          n.vx = (n.vx + (n.tx - n.x) * k) * CFG.springDamp;
          n.vy = (n.vy + (n.ty - n.y) * k) * CFG.springDamp;
          n.x += n.vx;
          n.y += n.vy;
          /* доводчик: вблизи цели мягкий лерп — гасит орбитирование,
             точка гарантированно садится на букву */
          var dLand = Math.hypot(n.tx - n.x, n.ty - n.y);
          if (dLand < 30) {
            var s = 1 - dLand / 30;
            n.x += (n.tx - n.x) * 0.14 * s;
            n.y += (n.ty - n.y) * 0.14 * s;
            n.vx *= (1 - 0.1 * s);
            n.vy *= (1 - 0.1 * s);
          }
        } else {
          // ждёт свою волну: мягко тормозит на месте
          n.vx *= 0.94; n.vy *= 0.94;
          n.x += n.vx * dt * 0.06;
          n.y += n.vy * dt * 0.06;
        }
        if (n.cool > 0) n.cool -= dt;
        n.glow *= CFG.glowDecay;
        continue; // физика ambient к летящим не применяется
      } else {
        /* Живой организм: блуждание + сплочение + отталкивание */
        n.phase += 0.004 * dt;
        ax += Math.cos(n.phase + i) * CFG.wander / n.mass;
        ay += Math.sin(n.phase * 1.3 + i) * CFG.wander / n.mass;

        var cx = 0, cy = 0, cnt = 0;
        neighbors(n, function (o) {
          if (o === n) return;
          var dx = o.x - n.x, dy = o.y - n.y;
          var d2 = dx * dx + dy * dy;
          if (d2 > CFG.linkDist * CFG.linkDist || d2 === 0) return;
          var d = Math.sqrt(d2);
          if (d < 26) { // личное пространство
            ax -= dx / d * CFG.separation;
            ay -= dy / d * CFG.separation;
          }
          cx += o.x; cy += o.y; cnt++;
        });
        if (cnt > 0) { // тяга к центру своей группы
          ax += (cx / cnt - n.x) * CFG.cohesion;
          ay += (cy / cnt - n.y) * CFG.cohesion;
        }

        /* Гравитация курсора — только в свободном состоянии.
           Пока строится/держится слово — никакого взаимодействия с точками. */
        if (mouse.active && state === "AMBIENT") {
          var mdx = mouse.x - n.x, mdy = mouse.y - n.y;
          var md = Math.hypot(mdx, mdy);
          if (md < CFG.mouseRadius && md > 1) {
            var pull = (1 - md / CFG.mouseRadius) * CFG.mousePull;
            ax += mdx / md * pull * 60;
            ay += mdy / md * pull * 60;
            /* Импульс: курсор рядом с точкой зажигает её */
            if (md < 22 && n.cool <= 0) { n.glow = 1; n.cool = 160; }
          }
        }

        n.vx = (n.vx + ax) * CFG.damping;
        n.vy = (n.vy + ay) * CFG.damping;

        var sp = Math.hypot(n.vx, n.vy);
        /* дальние (малый z) двигаются медленнее — параллакс глубины */
        var lim = (state === "EXCITE" ? CFG.maxSpeed * 2.2 : CFG.maxSpeed) * n.z;
        if (sp > lim) { n.vx = n.vx / sp * lim; n.vy = n.vy / sp * lim; }
      }

      // прошлая позиция — для шлейфа за летящей точкой
      n.px = n.x; n.py = n.y;
      n.x += n.vx * dt * 0.06;
      n.y += n.vy * dt * 0.06;

      /* мягкие стены */
      if (n.tx === null) {
        if (n.x < 0) { n.x = 0; n.vx *= -0.8; }
        if (n.x > W) { n.x = W; n.vx *= -0.8; }
        if (n.y < 0) { n.y = 0; n.vy *= -0.8; }
        if (n.y > H) { n.y = H; n.vy *= -0.8; }
      }

      if (n.cool > 0) n.cool -= dt;
      n.glow *= CFG.glowDecay;
    }

    /* Волна импульса: горящие зажигают соседей по связям */
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      if (n.glow < 0.55) continue;
      neighbors(n, function (o) {
        if (o === n || o.glow > 0.3 || o.cool > 0) return;
        var dx = o.x - n.x, dy = o.y - n.y;
        if (dx * dx + dy * dy < CFG.linkDist * CFG.linkDist) {
          o.glow = n.glow * CFG.igniteChain;
          o.cool = 200; // не перезажигается мгновенно — волна идёт вперёд
        }
      });
    }

    /* Сеть живёт сама: без действий пользователя раз в несколько
       секунд случайный предприниматель «постит» — волна по связям */
    if (state === "AMBIENT" && now - lastAuto > CFG.idlePulse) {
      lastAuto = now + Math.random() * 2200;
      var seed = nodes[(Math.random() * nodes.length) | 0];
      if (seed && seed.glow < 0.3 && seed.tx === null) seed.glow = 1;
    }

    /* Переходы машины состояний по времени */
    var elapsed = now - stateTimer;
    if (state === "GATHER" || state === "FINAL") {
      // все долетели? (средняя дистанция до цели)
      var sum = 0, cnt2 = 0;
      for (i = 0; i < nodes.length; i++) {
        if (nodes[i].tx === null) continue;
        sum += Math.hypot(nodes[i].tx - nodes[i].x, nodes[i].ty - nodes[i].y);
        cnt2++;
      }
      /* Переход в HOLD: долетели — или таймаут-страховка (доводчик HOLD досадит) */
      if (cnt2 > 0 && (sum / cnt2 < 3.5 || elapsed > 6500)) {
        setCaption(null, true);
        stateTimer = now;
        state = state === "FINAL" ? "FINAL_HOLD" : "HOLD";
      }
    } else if (state === "HOLD" && elapsed > CFG.holdTime) {
      disperse();
    } else if (state === "FINAL_HOLD" && elapsed > CFG.finalHold) {
      wordIndex = 0; // цикл начинается заново
      disperse();
      setHint();
    } else if (state === "EXCITE" && elapsed > CFG.exciteTime) {
      startFinal();
    }

    /* Типографика: слово плавно ПРОЯВЛЯЕТСЯ (fillText), а точки-буквы
       в это время плавно ГАСНУТ — остаётся чистая типографика.
       На распаде — обратно: слово гаснет, точки проявляются. */
    var wordTarget = (state === "HOLD" || state === "FINAL_HOLD") ? 1 : 0;
    wordAlpha += (wordTarget - wordAlpha) * 0.06;
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      var visTarget = (n.tx !== null) ? (1 - wordAlpha) : 1;
      n.vis += (visTarget - n.vis) * 0.08;
    }

    /* Дыхание букв в HOLD: плавный lerp к дышащей цели —
       без телепорта, точка мягко «доседает» на своё место */
    if (state === "HOLD" || state === "FINAL_HOLD") {
      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        if (n.tx === null) continue;
        var bx = n.tx + Math.sin(now * 0.0016 + n.phase) * 1.6;
        var by = n.ty + Math.cos(now * 0.0013 + n.phase) * 1.6;
        n.x += (bx - n.x) * 0.10;
        n.y += (by - n.y) * 0.10;
      }
    }
  }

  /* ---------------- Рендер ---------------- */
  function draw(now) {
    ctx.clearRect(0, 0, W, H);

    var holdNow = (state === "HOLD" || state === "FINAL_HOLD");
    /* Слово СОСТОИТ ИЗ САМИХ ТОЧЕК — никакой шрифтовой подмены.
       Читаемость дают: плотность сэмплинга, укрупнение точек
       в составе буквы и мягкое свечение под надписью. */
    if (holdNow && layout) {
      // едва заметная красная дымка за словом — объём, не текст
      var g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.4);
      g.addColorStop(0, "rgba(" + CFG.accent + ",0.05)");
      g.addColorStop(1, "rgba(" + CFG.accent + ",0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    /* связи */
    ctx.lineWidth = 1;
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      neighbors(n, function (o) {
        if (o.x <= n.x) return; // каждая пара один раз
        var dx = o.x - n.x, dy = o.y - n.y;
        var d2 = dx * dx + dy * dy;
        if (d2 > CFG.linkDist * CFG.linkDist) return;
        var d = Math.sqrt(d2);
        /* мерцание связей: появляются и исчезают, живой организм */
        var flicker = 0.55 + 0.45 * Math.sin(now * 0.0011 + (n.phase + o.phase) * 3);
        var glowBoost = Math.max(n.glow, o.glow) * 0.7;
        /* связи внутри букв — светлее и заметнее: буквы живые */
        var ww = Math.min(n.white, o.white);
        var alpha = (1 - d / CFG.linkDist) * (0.16 + ww * 0.22) * flicker + glowBoost * 0.5;
        alpha *= Math.min(n.vis, o.vis); // связи внутри слова гаснут вместе с точками
        if (alpha < 0.02) return;
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(o.x, o.y);
        ctx.strokeStyle = ww > 0.5
          ? "rgba(255,196,204," + alpha + ")"
          : "rgba(" + CFG.accent + "," + alpha + ")";
        ctx.stroke();
      });
    }

    /* ---- Линза курсора ----
       Курсор — тоже участник сети: от него тянутся связи
       к ближайшим точкам (Obsidian-graph hover), с ядром-точкой.
       Пользователь буквально видит, как становится частью сети. */
    if (mouse.active && state === "AMBIENT") {
      var MR = CFG.mouseRadius * 0.85;
      ctx.lineWidth = 0.9;
      for (var q = 0; q < nodes.length; q++) {
        var m = nodes[q];
        if (m.tx !== null) continue;
        var mdx2 = m.x - mouse.x, mdy2 = m.y - mouse.y;
        var md2 = mdx2 * mdx2 + mdy2 * mdy2;
        if (md2 > MR * MR) continue;
        var mdd = Math.sqrt(md2) || 1;
        var ma = (1 - mdd / MR) * 0.3;
        ctx.beginPath();
        ctx.moveTo(mouse.x, mouse.y);
        ctx.lineTo(m.x, m.y);
        ctx.strokeStyle = "rgba(255,190,198," + ma + ")";
        ctx.stroke();
      }
      ctx.lineWidth = 1;
      // ядро курсора: белая точка + мягкий красный ореол
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 14, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(" + CFG.accent + ",0.10)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 2.6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.fill();
    }

    /* точки-предприниматели.
       В свободной жизни — красные; в составе слова раскаляются
       до бело-розового и укрупняются — буквы СОСТОЯТ из них. */
    for (var j = 0; j < nodes.length; j++) {
      var p = nodes[j];
      // плавный переход цвета к цели и обратно
      p.white += ((p.tx !== null ? 1 : 0) - p.white) * 0.045;

      var breath = 0.85 + 0.15 * Math.sin(now * 0.002 + p.phase);
      /* глубина: дальние точки мельче; в букве размер выравнивается
         и точка укрупняется — надпись читается из самих точек */
      var depth = p.z + (1 - p.z) * p.white;
      var r = p.r * depth * breath + p.glow * 2.2 + p.white * 1.5;

      /* Шлейф летящей точки */
      if (p.tx !== null && p.px !== undefined && p.vis > 0.3) {
        var spd = Math.hypot(p.x - p.px, p.y - p.py);
        if (spd > 0.8) {
          var tl = Math.min(spd * 6, 34); // длина шлейфа от скорости
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - (p.x - p.px) / spd * tl, p.y - (p.y - p.py) / spd * tl);
          ctx.strokeStyle = "rgba(" + CFG.accent + ",0.22)";
          ctx.lineWidth = 1.1;
          ctx.stroke();
          ctx.lineWidth = 1;
        }
      }

      // цвет: интерполяция красный → раскалённый бело-розовый
      var cr = Math.round(250 + (255 - 250) * p.white);
      var cg = Math.round(30 + (236 - 30) * p.white);
      var cb = Math.round(50 + (238 - 50) * p.white);
      var col = cr + "," + cg + "," + cb;

      /* свечение: у горящих — красное, у букв — мягкое белое */
      var halo = Math.max(p.glow, p.white * 0.6);
      if (halo > 0.08) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 3.0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + col + "," + (halo * 0.13 * p.vis) + ")";
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      /* дальние — тусклее (глубина), горящие и буквы — ярче */
      var baseA = 0.34 + 0.3 * depth + Math.max(p.glow * 0.45, p.white * 0.55);
      ctx.fillStyle = "rgba(" + col + "," + (Math.min(baseA, 1) * p.vis) + ")";
      ctx.fill();
    }

    /* ---- Типографическая заливка слова ----
       Слово читается чистым шрифтом; точки под ним растворены (vis→0). */
    if (wordAlpha > 0.01 && layout) {
      ctx.save();
      ctx.globalAlpha = Math.min(wordAlpha, 1);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "900 " + layout.fs + "px Inter, Arial, sans-serif";
      ctx.fillStyle = "#fff";
      ctx.shadowColor = "rgba(" + CFG.accent + ",0.55)";
      ctx.shadowBlur = 26;
      for (var li = 0; li < layout.lines.length; li++) {
        ctx.fillText(layout.lines[li], W / 2, layout.y0 + li * layout.lineH);
      }
      ctx.restore();
    }
  }

  /* ---------------- Главный цикл ---------------- */
  function loop(t) {
    var dt = Math.min(t - lastT || 16, 50); // защита от прыжков после сна вкладки
    lastT = t;
    step(dt, t);
    draw(t);
    rafId = requestAnimationFrame(loop);
  }

  /* ---------------- Запуск ---------------- */
  resize();
  spawnNodes();
  addEventListener("resize", function () { resize(); spawnNodes(); }, { passive: true });

  if (reduced) {
    // без движения: статичный кадр сети
    rebuildGrid();
    draw(0);
    return;
  }

  /* Рендерим только когда секция на экране */
  new IntersectionObserver(function (entries) {
    var vis = entries[0].isIntersecting;
    if (vis && !running) { running = true; lastT = 0; rafId = requestAnimationFrame(loop); }
    else if (!vis && running) { running = false; cancelAnimationFrame(rafId); }
  }).observe(canvas);
})();
