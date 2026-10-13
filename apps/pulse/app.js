/* ПУЛЬС — приложение клиента: главная, расписание с записью, пропуск, прогресс.
   Данные демо: расписание собирается из недельной сетки, записи и рекорды
   хранятся в localStorage этого устройства. */
(function () {
  'use strict';
  var A = window.App, S = A.store, $ = function (id) { return document.getElementById(id); };

  var PROGRAMS = {
    power: { name: 'Силовой старт', coach: 'Максим Соловьёв', hall: 'зал 2', min: 55, c: '#c8ff2f' },
    func: { name: 'Функционал', coach: 'Дмитрий Байков', hall: 'зал 1', min: 45, c: '#ff5c28' },
    slim: { name: 'Снижение веса', coach: 'Анна Киселёва', hall: 'зал 1', min: 50, c: '#6ee7b7' },
    yoga: { name: 'Йога и мобильность', coach: 'Анна Киселёва', hall: 'зал 3', min: 55, c: '#b69cff' },
    box: { name: 'Бокс-фитнес', coach: 'Дмитрий Байков', hall: 'зал 1', min: 50, c: '#ffd166' }
  };
  var FILTERS = [['all', 'Все'], ['power', 'Силовые'], ['func', 'Функционал'], ['slim', 'Снижение веса'], ['yoga', 'Йога'], ['box', 'Бокс']];
  // Недельная сетка: номер дня (0 — воскресенье) → [время, программа]
  var GRID = {
    1: [['07:30', 'func'], ['09:00', 'yoga'], ['12:00', 'slim'], ['18:00', 'box'], ['19:00', 'power'], ['20:30', 'yoga']],
    2: [['07:30', 'power'], ['10:00', 'slim'], ['18:30', 'func'], ['19:30', 'yoga'], ['20:30', 'box']],
    3: [['07:30', 'func'], ['09:00', 'yoga'], ['12:00', 'power'], ['18:00', 'slim'], ['19:00', 'power'], ['20:30', 'box']],
    4: [['07:30', 'power'], ['10:00', 'yoga'], ['18:30', 'func'], ['19:30', 'slim'], ['20:30', 'power']],
    5: [['07:30', 'func'], ['12:00', 'yoga'], ['18:00', 'box'], ['19:00', 'power']],
    6: [['10:00', 'yoga'], ['11:00', 'power'], ['12:30', 'func']],
    0: [['10:00', 'yoga'], ['11:30', 'slim']]
  };
  var CAP = 8, TOTAL = 8;
  var EXERCISES = {
    squat: { name: 'Присед со штангой', unit: 'кг' },
    dead: { name: 'Становая тяга', unit: 'кг' },
    bench: { name: 'Жим лёжа', unit: 'кг' },
    plank: { name: 'Планка', unit: 'сек' }
  };

  var today = A.today;
  // «Сейчас»: в кадре для портфолио — среда, 12:30
  function now() { if (A.isStatic) { var d = new Date(today); d.setHours(12, 30, 0, 0); return d; } return new Date(); }

  function key(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function parseId(id) { var p = id.split('T'), d = p[0].split('-'), t = p[1].split(':'); return new Date(+d[0], d[1] - 1, +d[2], +t[0], +t[1]); }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function dayLabel(d) {
    var diff = Math.round((new Date(d).setHours(0, 0, 0, 0) - today) / 864e5);
    if (diff === 0) return 'сегодня';
    if (diff === 1) return 'завтра';
    return A.DAYS[d.getDay()] + ', ' + d.getDate() + ' ' + A.MONTHS[d.getMonth()];
  }

  function classesOn(d) {
    return (GRID[d.getDay()] || []).map(function (row) {
      var id = key(d) + 'T' + row[0], p = PROGRAMS[row[1]];
      var taken = hash(id) % 9; // 0…8 занятых мест
      return { id: id, time: row[0], prog: row[1], p: p, taken: taken, start: parseId(id) };
    });
  }
  function findClass(id) {
    var d = parseId(id); d.setHours(0, 0, 0, 0);
    return classesOn(d).filter(function (c) { return c.id === id; })[0];
  }

  // Состояние
  function defaultBookings() {
    var n = now();
    for (var i = 0; i < 7; i++) {
      var list = classesOn(A.addDays(today, i)).filter(function (c) { return c.time >= '18:00' && c.start > n && c.taken < CAP; });
      if (list.length) return [list[0].id];
    }
    return [];
  }
  var state = {
    bookings: S.get('bookings', null) || defaultBookings(),
    wait: S.get('wait', []),
    used: S.get('used', 3),
    freeze: S.get('freeze', null),
    records: S.get('records', { squat: [45, 50], dead: [52.5, 60], bench: [30, 32.5], plank: [120, 150] })
  };
  function save() { S.set('bookings', state.bookings); S.set('wait', state.wait); S.set('used', state.used); S.set('freeze', state.freeze); S.set('records', state.records); }
  function upcoming() {
    var n = now();
    return state.bookings.filter(function (id) { return parseId(id) > n; }).sort();
  }
  function left() { return TOTAL - state.used; }
  function validUntil() { return A.addDays(today, 31 + (state.freeze ? state.freeze.days : 0)); }
  function frozenOn(d) {
    if (!state.freeze) return false;
    var from = new Date(state.freeze.from), to = A.addDays(from, state.freeze.days);
    return d >= from && d < to;
  }

  // Прошлые посещения (для истории и недели)
  var VISITS = [[-2, '19:00', 'power'], [-5, '18:00', 'box'], [-7, '19:00', 'power'], [-9, '18:00', 'box'], [-12, '07:30', 'func']].map(function (v) {
    var d = A.addDays(today, v[0]); return { d: d, time: v[1], p: PROGRAMS[v[2]] };
  });

  /* ---------- Главная ---------- */
  function renderHome() {
    var d = today;
    $('home-date').textContent = A.DAYS[d.getDay()].replace(/^./, function (c) { return c.toUpperCase(); }) + ', ' + d.getDate() + ' ' + A.MONTHS[d.getMonth()];
    var up = upcoming();
    var box = $('home-next');
    if (up.length) {
      var c = findClass(up[0]);
      box.innerHTML =
        '<section class="next" aria-label="Ближайшая тренировка">' +
        '<div class="next__top"><span class="pill">Ближайшая</span><span>' + dayLabel(c.start) + ' · ' + c.time + '</span></div>' +
        '<h2 class="next__name">' + c.p.name + '</h2>' +
        '<p class="next__meta"><span><svg><use href="#i-pin"/></svg>' + c.p.hall + '</span><span><svg><use href="#i-clock"/></svg>' + c.p.min + ' мин</span><span>' + c.p.coach + '</span></p>' +
        '<svg class="next__ecg" viewBox="0 0 350 46" preserveAspectRatio="none" aria-hidden="true"><path d="M0 28H120L132 28L140 12L152 42L164 4L176 36L184 28H250L258 28L264 20L271 34L278 28H350"/></svg>' +
        '<div class="next__acts"><button class="btn btn--lime" type="button" data-go="pass"><svg><use href="#i-qr"/></svg>Пропуск</button>' +
        '<button class="btn btn--ghost" type="button" data-cancel="' + c.id + '">Отменить</button></div>' +
        (up.length > 1 ? '<p class="muted small" style="margin-top:12px">Ещё ' + (up.length - 1) + ' ' + A.plural(up.length - 1, 'запись', 'записи', 'записей') + ' на этой неделе</p>' : '') +
        '</section>';
    } else {
      box.innerHTML = '<section class="next next--empty"><h2 class="h3">Пока нет записей</h2><p>Выберите занятие в расписании — место закрепится за вами.</p>' +
        '<button class="btn btn--lime btn--block" type="button" data-go="schedule">Открыть расписание</button></section>';
    }

    // Абонемент
    var planned = up.length;
    $('sub-left').textContent = left();
    var segs = '';
    for (var i = 0; i < TOTAL; i++) segs += '<i class="' + (i < state.used ? 'is-used' : i < state.used + planned ? 'is-plan' : '') + '"></i>';
    $('sub-segs').innerHTML = segs;
    var u = validUntil();
    $('sub-until').textContent = (planned ? 'Запланировано: ' + planned + ' · ' : '') + 'действует до ' + u.getDate() + ' ' + A.MONTHS[u.getMonth()];

    // Неделя (с понедельника)
    var mon = A.addDays(today, -((today.getDay() + 6) % 7));
    var done = 0, html = '';
    for (var k = 0; k < 7; k++) {
      var day = A.addDays(mon, k), dk = key(day);
      var isDone = VISITS.some(function (v) { return key(v.d) === dk; });
      var isPlan = up.some(function (id) { return id.indexOf(dk) === 0; });
      if (isDone) done++;
      var cls = isDone ? 'is-done' : isPlan ? 'is-plan' : '';
      if (dk === key(today)) cls += ' is-today';
      html += '<li class="' + cls + '"><i>' + (isDone ? '<svg><use href="#i-check"/></svg>' : '') + '</i>' + A.DAYS[day.getDay()] + '</li>';
    }
    $('week-days').innerHTML = html;
    $('week-goal').textContent = done + ' из 3 · цель недели';
  }

  /* ---------- Расписание ---------- */
  var sel = 0, filter = 'all';
  function renderDates() {
    var m = today;
    $('sch-month').textContent = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'][m.getMonth()] + ' · 7 дней';
    var html = '';
    for (var i = 0; i < 7; i++) {
      var d = A.addDays(today, i), dk = key(d);
      var mine = state.bookings.some(function (id) { return id.indexOf(dk) === 0; });
      html += '<button class="date' + (i === sel ? ' is-on' : '') + (mine ? ' has-mine' : '') + '" type="button" role="tab" aria-selected="' + (i === sel) + '" data-day="' + i + '"><span>' + (i === 0 ? 'сег' : A.DAYS[d.getDay()]) + '</span><b>' + d.getDate() + '</b></button>';
    }
    $('dates').innerHTML = html;
    $('filters').innerHTML = FILTERS.map(function (f) {
      return '<button class="chip' + (f[0] === filter ? ' is-on' : '') + '" type="button" aria-pressed="' + (f[0] === filter) + '" data-filter="' + f[0] + '">' + f[1] + '</button>';
    }).join('');
  }
  function classRow(c) {
    var n = now(), mine = state.bookings.indexOf(c.id) >= 0, waiting = state.wait.indexOf(c.id) >= 0;
    var past = c.start <= n, full = c.taken >= CAP;
    var free = Math.max(0, CAP - c.taken - (mine ? 1 : 0));
    var seats = '';
    for (var i = 0; i < CAP; i++) seats += '<i class="' + (i < CAP - free ? 'is-taken' : '') + '"></i>';
    var btn;
    if (past) btn = '<button class="cls__btn" type="button" disabled>Прошло</button>';
    else if (mine) btn = '<button class="cls__btn is-booked" type="button" data-cancel="' + c.id + '"><svg><use href="#i-check"/></svg>Вы идёте</button>';
    else if (full) btn = '<button class="cls__btn is-wait" type="button" data-wait="' + c.id + '"' + (waiting ? ' disabled' : '') + '>' + (waiting ? 'Вы в листе' : 'Лист ожидания') + '</button>';
    else btn = '<button class="cls__btn" type="button" data-book="' + c.id + '">Записаться</button>';
    var seatsText = past ? 'было ' + c.taken + ' из ' + CAP : full && !mine ? 'мест нет' : free <= 2 ? '<b class="is-few">' + (free === 1 ? 'последнее место' : 'осталось ' + free + ' места') + '</b>' : 'свободно ' + free + ' из ' + CAP;
    return '<li class="cls' + (mine ? ' is-mine' : '') + (past ? ' is-past' : '') + '" style="--c:' + c.p.c + '">' +
      '<div class="cls__time"><b>' + c.time + '</b><span>' + c.p.min + ' мин</span></div>' +
      '<div><h3 class="cls__name"><i aria-hidden="true"></i>' + c.p.name + '</h3><p class="cls__who">' + c.p.coach + ' · ' + c.p.hall + '</p></div>' +
      '<div class="cls__foot"><div class="seats"><div class="seats__bar" aria-hidden="true">' + seats + '</div><span>' + seatsText + '</span></div>' + btn + '</div></li>';
  }
  var showPast = false;
  function renderClasses() {
    var d = A.addDays(today, sel), n = now();
    var list = classesOn(d).filter(function (c) { return filter === 'all' || c.prog === filter; });
    var past = list.filter(function (c) { return c.start <= n; });
    // Прошедшие занятия сегодняшнего дня свёрнуты в одну строку
    if (past.length && !showPast) list = list.filter(function (c) { return c.start > n; });
    var head = past.length ? '<li><button class="past-toggle" type="button" id="past-toggle" aria-expanded="' + showPast + '">' +
      (showPast ? 'Скрыть прошедшие' : 'Показать прошедшие · ' + past.length) + '</button></li>' : '';
    $('classes').innerHTML = head + (list.length ? list.map(classRow).join('') :
      '<li class="empty">' + (past.length ? 'На сегодня занятия закончились.<br>Загляните в расписание на завтра.' :
        'В этот день нет занятий по направлению «' + FILTERS.filter(function (f) { return f[0] === filter; })[0][1] + '».<br>Попробуйте другой день.') + '</li>');
  }
  document.addEventListener('click', function (e) {
    if (e.target.closest('#past-toggle')) { showPast = !showPast; renderClasses(); }
  });

  /* ---------- Пропуск ---------- */
  function qr(seed) {
    var n = 25, cells = [], r = hash(seed);
    function rnd() { r ^= r << 13; r >>>= 0; r ^= r >>> 17; r ^= r << 5; r >>>= 0; return r / 4294967296; }
    function finder(x, y) { return x >= 0 && y >= 0 && x < 7 && y < 7; }
    for (var y = 0; y < n; y++) {
      for (var x = 0; x < n; x++) {
        var f = finder(x, y) ? [x, y] : finder(x - 18, y) ? [x - 18, y] : finder(x, y - 18) ? [x, y - 18] : null;
        var on;
        if (f) { var a = f[0], b = f[1]; on = a === 0 || a === 6 || b === 0 || b === 6 || (a >= 2 && a <= 4 && b >= 2 && b <= 4); }
        else if ((x < 8 && y < 8) || (x > 16 && y < 8) || (x < 8 && y > 16)) on = false;
        else if (y === 6) on = x % 2 === 0;
        else if (x === 6) on = y % 2 === 0;
        else on = rnd() > .52;
        if (on) cells.push('M' + x + ' ' + y + 'h1v1h-1z');
      }
    }
    return '<svg viewBox="0 0 25 25" shape-rendering="crispEdges" aria-hidden="true"><path fill="#0b0d10" d="' + cells.join('') + '"/></svg>';
  }
  function renderPass() {
    $('qr').innerHTML = qr('PULSE-0247-' + key(today));
    var st = $('pass-status'), u = validUntil();
    if (state.freeze) {
      var to = A.addDays(new Date(state.freeze.from), state.freeze.days - 1);
      st.textContent = 'Заморожен до ' + to.getDate() + ' ' + A.MONTHS[to.getMonth()];
      st.className = 'is-frozen';
      $('freeze-label').textContent = 'Разморозить';
    } else {
      st.textContent = 'Абонемент активен до ' + u.getDate() + ' ' + A.MONTHS[u.getMonth()];
      st.className = '';
      $('freeze-label').textContent = 'Заморозить';
    }
    $('visits').innerHTML = VISITS.map(function (v) {
      return '<li><div>' + v.p.name + '<br><span>' + dayLabel(v.d).replace(/^./, function (c) { return c.toUpperCase(); }) + ' · ' + v.time + '</span></div><span>' + v.p.hall + '</span></li>';
    }).join('');
  }

  /* ---------- Прогресс ---------- */
  function fmt(ex, v) {
    if (EXERCISES[ex].unit === 'сек') return Math.floor(v / 60) + ':' + pad(v % 60);
    return String(v).replace('.', ',') + ' кг';
  }
  function renderProgress() {
    var mon = A.addDays(today, -((today.getDay() + 6) % 7));
    var vals = [2, 3, 2, 3, 3, 2, 3];
    var thisWeek = VISITS.filter(function (v) { return v.d >= mon; }).length;
    vals.push(thisWeek);
    $('bars').innerHTML = vals.map(function (v, i) {
      var w = A.addDays(mon, (i - 7) * 7);
      var cls = i === 7 ? 'is-now' : v >= 3 ? 'is-goal' : '';
      return '<div class="bar ' + cls + '" style="--v:' + v + '"><i></i><span>' + (i === 7 ? 'эта' : w.getDate() + '.' + pad(w.getMonth() + 1)) + '</span></div>';
    }).join('');
    $('records').innerHTML = Object.keys(EXERCISES).map(function (ex) {
      var r = state.records[ex], best = r[r.length - 1], prev = r.length > 1 ? r[r.length - 2] : null;
      var delta = prev !== null && best > prev ? (EXERCISES[ex].unit === 'сек' ? '+' + (best - prev) + ' с' : '+' + String(best - prev).replace('.', ',') + ' кг') : '';
      return '<li><span class="records__ico" aria-hidden="true"><svg><use href="#i-trophy"/></svg></span><div><b>' + EXERCISES[ex].name + '</b><small>лучший результат</small></div>' +
        '<div><strong>' + fmt(ex, best) + '</strong>' + (delta ? '<em>' + delta + '</em>' : '') + '</div></li>';
    }).join('');
  }

  function renderAll() { renderHome(); renderDates(); renderClasses(); renderPass(); renderProgress(); }

  /* ---------- Запись и отмена ---------- */
  var pending = null;
  function openBook(id) {
    var c = findClass(id);
    if (!c) return;
    var up = upcoming();
    if (left() - up.length <= 0) { A.toast('На абонементе не осталось свободных тренировок'); return; }
    var d = new Date(c.start); d.setHours(0, 0, 0, 0);
    if (frozenOn(d)) { A.toast('Абонемент заморожен на эту дату'); return; }
    pending = id;
    $('book-when').textContent = dayLabel(c.start) + ' · ' + c.time;
    $('book-title').textContent = c.p.name;
    $('book-facts').innerHTML =
      '<li><svg><use href="#i-clock"/></svg>Длительность<b>' + c.p.min + ' мин</b></li>' +
      '<li><svg><use href="#i-pin"/></svg>Где<b>' + c.p.hall + '</b></li>' +
      '<li><svg><use href="#i-trophy"/></svg>Тренер<b>' + c.p.coach + '</b></li>';
    $('book-note').textContent = 'Тренировка спишется с абонемента после посещения. Отменить без списания можно за 4 часа до начала.';
    A.sheet('book');
  }
  $('book-ok').addEventListener('click', function () {
    if (!pending) return;
    var c = findClass(pending);
    if (state.bookings.indexOf(pending) < 0) state.bookings.push(pending);
    save(); A.close(true); renderAll();
    A.toast('Вы записаны: ' + c.p.name + ', ' + dayLabel(c.start) + ' в ' + c.time);
    pending = null;
  });

  var cancelId = null;
  function openCancel(id) {
    var c = findClass(id);
    if (!c) return;
    cancelId = id;
    var hours = (c.start - now()) / 36e5;
    $('cancel-text').textContent = c.p.name + ', ' + dayLabel(c.start) + ' в ' + c.time + '. ' +
      (hours >= 4 ? 'До начала больше 4 часов — тренировка не спишется с абонемента.' : 'До начала меньше 4 часов — по правилам студии тренировка спишется с абонемента.');
    A.sheet('cancel');
  }
  $('cancel-ok').addEventListener('click', function () {
    if (!cancelId) return;
    var c = findClass(cancelId), late = (c.start - now()) / 36e5 < 4;
    state.bookings = state.bookings.filter(function (id) { return id !== cancelId; });
    if (late) state.used = Math.min(TOTAL, state.used + 1);
    save(); A.close(true); renderAll();
    A.toast(late ? 'Запись отменена, тренировка списана' : 'Запись отменена — тренировка вернулась на абонемент');
    cancelId = null;
  });

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-book],[data-cancel],[data-wait],[data-day],[data-filter]');
    if (!t) return;
    if (t.hasAttribute('data-book')) openBook(t.getAttribute('data-book'));
    else if (t.hasAttribute('data-cancel')) openCancel(t.getAttribute('data-cancel'));
    else if (t.hasAttribute('data-wait')) {
      state.wait.push(t.getAttribute('data-wait')); save(); renderClasses();
      A.toast('Вы в листе ожидания — администратор сообщит, если место освободится');
    }
    else if (t.hasAttribute('data-day')) { sel = +t.getAttribute('data-day'); renderDates(); renderClasses(); }
    else if (t.hasAttribute('data-filter')) { filter = t.getAttribute('data-filter'); renderDates(); renderClasses(); }
  });

  // Стрелки в ленте дат
  $('dates').addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    sel = Math.max(0, Math.min(6, sel + (e.key === 'ArrowRight' ? 1 : -1)));
    renderDates(); renderClasses();
    $('dates').querySelector('.is-on').focus();
  });

  /* ---------- Заморозка ---------- */
  var fzDays = 7;
  function renderFreeze() {
    var title = $('freeze-title'), text = title.nextElementSibling;
    var stepper = $('fz-minus').parentNode;
    if (state.freeze) {
      var from = new Date(state.freeze.from), to = A.addDays(from, state.freeze.days - 1);
      title.textContent = 'Абонемент заморожен';
      text.textContent = 'С ' + from.getDate() + ' ' + A.MONTHS[from.getMonth()] + ' по ' + to.getDate() + ' ' + A.MONTHS[to.getMonth()] + '. Если разморозить сейчас, срок действия вернётся к исходному.';
      stepper.hidden = true; $('fz-cap').hidden = true;
      $('fz-ok').textContent = 'Разморозить';
    } else {
      title.textContent = 'Заморозка абонемента';
      text.textContent = 'Срок действия сдвинется на столько же дней. Бесплатно, до 14 дней за абонемент.';
      stepper.hidden = false; $('fz-cap').hidden = false;
      $('fz-days').textContent = fzDays;
      $('fz-minus').disabled = fzDays <= 1; $('fz-plus').disabled = fzDays >= 14;
      var from2 = A.addDays(today, 1), to2 = A.addDays(from2, fzDays - 1);
      $('fz-cap').textContent = A.plural(fzDays, 'день', 'дня', 'дней').replace(/^/, fzDays + ' ') + ': с ' + from2.getDate() + ' ' + A.MONTHS[from2.getMonth()] + ' по ' + to2.getDate() + ' ' + A.MONTHS[to2.getMonth()];
      $('fz-ok').textContent = 'Заморозить';
    }
  }
  $('fz-minus').addEventListener('click', function () { fzDays = Math.max(1, fzDays - 1); renderFreeze(); });
  $('fz-plus').addEventListener('click', function () { fzDays = Math.min(14, fzDays + 1); renderFreeze(); });
  $('fz-ok').addEventListener('click', function () {
    if (state.freeze) { state.freeze = null; A.toast('Абонемент снова активен'); }
    else {
      var from = A.addDays(today, 1), to = A.addDays(from, fzDays);
      var clash = upcoming().filter(function (id) { var d = parseId(id); return d >= from && d < to; });
      if (clash.length) { A.toast('Сначала отмените записи на даты заморозки'); return; }
      state.freeze = { from: key(from), days: fzDays };
      A.toast('Заморожено на ' + fzDays + ' ' + A.plural(fzDays, 'день', 'дня', 'дней'));
    }
    save(); A.close(true); renderAll();
  });

  /* ---------- Новый результат ---------- */
  $('rec-ex').innerHTML = Object.keys(EXERCISES).map(function (k) { return '<option value="' + k + '">' + EXERCISES[k].name + '</option>'; }).join('');
  function syncUnit() {
    var u = EXERCISES[$('rec-ex').value].unit;
    $('rec-unit').textContent = u === 'сек' ? 'Время, мин:сек' : 'Вес, кг';
    $('rec-val').placeholder = u === 'сек' ? 'Например, 2:45' : 'Например, 55';
  }
  $('rec-ex').addEventListener('change', syncUnit);
  syncUnit();
  $('rec-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var ex = $('rec-ex').value, raw = $('rec-val').value.trim().replace(',', '.'), v, err = '';
    if (EXERCISES[ex].unit === 'сек') {
      var m = raw.match(/^(\d{1,2}):(\d{2})$/);
      v = m ? +m[1] * 60 + +m[2] : /^\d+$/.test(raw) ? +raw : NaN;
      if (isNaN(v) || v < 5 || v > 3600) err = 'Введите время в формате 2:45';
    } else {
      v = parseFloat(raw);
      if (!/^\d+(\.\d+)?$/.test(raw) || v <= 0 || v > 400) err = 'Введите вес числом, например 52,5';
    }
    $('rec-val').setAttribute('aria-invalid', err ? 'true' : 'false');
    $('rec-err').textContent = err;
    if (err) { $('rec-val').focus(); return; }
    var list = state.records[ex], best = list[list.length - 1];
    if (v > best) { list.push(v); A.toast('Новый рекорд: ' + EXERCISES[ex].name.toLowerCase() + ' — ' + fmt(ex, v)); }
    else A.toast('Записали. Ваш рекорд — ' + fmt(ex, best));
    save(); $('rec-val').value = ''; A.close(true); renderProgress();
  });

  /* ---------- Профиль ---------- */
  var wipeArmed = false;
  $('wipe').addEventListener('click', function () {
    if (!wipeArmed) { wipeArmed = true; this.textContent = 'Нажмите ещё раз — данные удалятся'; return; }
    S.clear(); location.hash = ''; location.reload();
  });

  // Листы, которым нужно наполнение при открытии (в том числе из ?sheet=)
  document.addEventListener('sheet', function (e) {
    if (e.detail === 'freeze') renderFreeze();
    if (e.detail === 'cancel' && !cancelId && upcoming().length) openCancel(upcoming()[0]);
    if (e.detail === 'book' && !pending) {
      // Открыт из адреса: подставляем ближайшее свободное занятие
      var n = now();
      for (var i = 0; i < 7 && !pending; i++) {
        var c = classesOn(A.addDays(today, i)).filter(function (x) { return x.start > n && x.taken < CAP && state.bookings.indexOf(x.id) < 0 && x.time >= '18:00'; })[0];
        if (c) { sel = i; renderDates(); renderClasses(); openBook(c.id); }
      }
    }
    if (e.detail !== 'profile') { wipeArmed = false; $('wipe').textContent = 'Удалить данные с устройства'; }
  });

  // Карточка для UI-кита
  var kitClass = classesOn(A.addDays(today, 1))[2];
  if (kitClass) $('kit-class').innerHTML = classRow(kitClass);

  renderAll();
  A.start('home');
})();
