/* МАСТЕРСКАЯ — приложение студента: сегодня, программа курса, урок с плеером,
   домашки с комментариями наставника, профиль. Прогресс хранится на устройстве. */
(function () {
  'use strict';
  var A = window.App, S = A.store, $ = function (id) { return document.getElementById(id); };

  var MODULES = [
    { name: 'Основы интерфейса', c: '#c9f2e3', lessons: [['Как устроен интерфейс', 12], ['Figma за час', 22], ['Компоненты и варианты', 18], ['Цвет и контраст', 15], ['Иконки', 11], ['Состояния кнопок', 13]] },
    { name: 'Сетки и типографика', c: '#ffd166', lessons: [['Сетка и отступы', 14], ['Типографическая шкала', 16], ['Ритм и выравнивание', 12], ['Адаптив', 19], ['Таблицы и списки', 14], ['Практикум: экран каталога', 25]] },
    { name: 'UX и тексты', c: '#ff8fab', opens: '2 ноября', lessons: [['Пользовательский путь', 15], ['Интервью и гипотезы', 17], ['UX-тексты', 13], ['Ошибки и пустые состояния', 12], ['Формы', 16], ['Практикум: регистрация', 24]] },
    { name: 'Прототип и защита', c: '#b8a4ff', opens: '30 ноября', lessons: [['Кликабельный прототип', 18], ['Анимация переходов', 14], ['Передача в разработку', 12], ['Презентация проекта', 15], ['Итоговый проект', 30], ['Защита', 20]] }
  ];
  var LESSONS = [];
  MODULES.forEach(function (m, mi) {
    m.lessons.forEach(function (l) { LESSONS.push({ n: LESSONS.length + 1, title: l[0], min: l[1], mod: mi, locked: !!m.opens }); });
  });
  var TOTAL = LESSONS.length;

  var HW = {
    1: { t: 'Разбор интерфейса любимого приложения', task: 'Выберите приложение, которым пользуетесь каждый день, и разберите три его экрана: что работает, что мешает и почему.' },
    2: { t: 'Первая страница в Figma', task: 'Соберите экран входа из фреймов и автолейаута. Без картинок — только блоки и текст.' },
    3: { t: 'Кнопка с пятью состояниями', task: 'Обычная, наведение, нажатие, неактивная и загрузка — одним компонентом с вариантами.' },
    4: { t: 'Палитра и проверка контраста', task: 'Соберите палитру из 6 цветов и проверьте пары «текст — фон» на контраст не ниже 4,5:1.' },
    5: { t: 'Набор из 12 иконок', task: 'Нарисуйте 12 иконок на сетке 24×24 с одной толщиной линии.' },
    6: { t: 'Экран профиля по компонентам', task: 'Соберите экран профиля только из компонентов прошлых уроков: аватар, список настроек, кнопка выхода.',
      comments: ['Сетка ровная — держи её во всех макетах.', 'Заголовок теряется: попробуй 24/32 и жирность 700.', 'Добавь воздуха над кнопкой — минимум 24.'] },
    7: { t: 'Карточка товара по сетке 8 pt', task: 'Нарисуйте карточку товара для каталога: фото, название, цена, кнопка. Все отступы — кратные 8. Приложите макет с включённой сеткой.' }
  };
  var DEF_HW = { 1: 'ok', 2: 'ok', 3: 'ok', 4: 'ok', 5: 'ok', 6: 'fix', 7: 'todo' };
  var ST = { todo: ['st--todo', 'Не сдано'], review: ['st--review', 'На проверке'], fix: ['st--fix', 'Доработать'], ok: ['st--ok', 'Принято'] };
  var SPEEDS = [1, 1.25, 1.5, 2];

  var today = A.today;
  function key(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  var deadline = A.addDays(today, 1);

  var state = {
    done: S.get('done', [1, 2, 3, 4, 5, 6]),
    hw: S.get('hw', {}),
    files: S.get('files', {}),
    watched: S.get('watched', { 7: 336 }),
    speed: S.get('speed', 1),
    doneDay: S.get('doneDay', null)
  };
  function save() { ['done', 'hw', 'files', 'watched', 'speed', 'doneDay'].forEach(function (k) { S.set(k, state[k]); }); }
  function hwSt(n) { return state.hw[n] || DEF_HW[n] || 'todo'; }
  function isDone(n) { return state.done.indexOf(n) >= 0; }
  function current() {
    for (var i = 0; i < TOTAL; i++) if (!LESSONS[i].locked && !isDone(LESSONS[i].n)) return LESSONS[i];
    return null;
  }
  function mmss(s) { s = Math.round(s); return Math.floor(s / 60) + ':' + (s % 60 < 10 ? '0' : '') + s % 60; }
  function speedLabel(v) { return String(v).replace('.', ',') + '×'; }
  var doneToday = function () { return state.doneDay === key(today); };

  /* ---------- Сегодня ---------- */
  function renderToday() {
    $('today-date').textContent = A.DAYS[today.getDay()].replace(/^./, function (c) { return c.toUpperCase(); }) + ', ' + today.getDate() + ' ' + A.MONTHS[today.getMonth()];
    var streak = 12 + (doneToday() ? 1 : 0);
    $('streak-n').textContent = streak;
    $('streak-n').nextElementSibling.textContent = A.plural(streak, 'день', 'дня', 'дней') + ' подряд';
    var days = '';
    for (var i = -6; i <= 0; i++) {
      var d = A.addDays(today, i);
      days += '<li class="' + (i < 0 || doneToday() ? 'is-on' : 'is-today') + '">' + A.DAYS[d.getDay()] + '</li>';
    }
    $('streak-days').innerHTML = days;
    var cur = current();
    $('streak-hint').textContent = doneToday() ? 'Урок сегодня пройден — серия продолжается.' : cur ? 'Урок дня — ' + cur.min + ' минут. Серия не прервётся.' : 'Все открытые уроки пройдены.';

    var cont = $('cont-title').closest('.cont');
    if (cur) {
      cont.hidden = false;
      var w = state.watched[cur.n] || 0, sec = cur.min * 60;
      $('cont-eyebrow').textContent = (w ? 'Продолжить' : 'Следующий урок') + ' · Модуль ' + (cur.mod + 1);
      $('cont-title').textContent = 'Урок ' + cur.n + '. ' + cur.title;
      $('cont-bar').style.width = Math.round(w / sec * 100) + '%';
      $('cont-left').textContent = 'осталось ' + Math.max(1, Math.round((sec - w) / 60)) + ' мин';
    } else cont.hidden = true;

    var st7 = hwSt(7), dl = $('today-dl');
    if (st7 === 'todo') {
      dl.className = 'box box--pink dl';
      dl.innerHTML = '<p class="eyebrow">Дедлайн · ' + A.DAYS[deadline.getDay()] + ', ' + deadline.getDate() + ' ' + A.MONTHS[deadline.getMonth()] + ', 23:59</p><b>Домашка 7. ' + HW[7].t + '</b><span>Приложите макет с включённой сеткой</span><svg><use href="#i-chevron"/></svg>';
    } else {
      dl.className = 'box dl';
      dl.innerHTML = '<p class="eyebrow">Домашка 7</p><b>' + (st7 === 'ok' ? 'Принята наставником' : 'На проверке у наставника') + '</b><span>' + (st7 === 'ok' ? 'Можно переходить к уроку 8' : 'Ответ придёт в течение 48 часов') + '</span><svg><use href="#i-chevron"/></svg>';
    }
  }

  /* ---------- Программа ---------- */
  var openMods = { 1: true };
  function lessonRow(l) {
    var cur = current(), cls = l.locked ? 'is-lock' : isDone(l.n) ? 'is-done' : cur && cur.n === l.n ? 'is-now' : '';
    var ico = l.locked ? '#i-lock' : isDone(l.n) ? '#i-check' : cls === 'is-now' ? '#i-play' : '';
    var sub = l.min + ' мин' + (cls === 'is-now' && state.watched[l.n] ? ' · просмотрено ' + Math.round(state.watched[l.n] / (l.min * 60) * 100) + '%' : '');
    return '<li><button class="lesson ' + cls + '" type="button" data-lesson="' + l.n + '"' + (l.locked ? ' aria-disabled="true"' : '') + '>' +
      '<span class="lesson__n">' + (l.n < 10 ? '0' : '') + l.n + '</span><span class="lesson__t"><b>' + l.title + '</b><span>' + sub + '</span></span>' +
      '<span class="lesson__st">' + (ico ? '<svg><use href="' + ico + '"/></svg>' : '') + '</span></button></li>';
  }
  function renderCourse() {
    var n = state.done.length, pct = Math.round(n / TOTAL * 100);
    $('prog-pct').textContent = pct + '%';
    $('prog-text').textContent = n + ' из ' + TOTAL + ' ' + A.plural(TOTAL, 'урока', 'уроков', 'уроков');
    var ok = Object.keys(HW).filter(function (k) { return hwSt(+k) === 'ok'; }).length;
    $('prog-hw').textContent = ok + ' ' + A.plural(ok, 'домашка принята', 'домашки приняты', 'домашек принято');
    $('ring-fg').style.strokeDasharray = pct + ' 100';
    $('modules').innerHTML = MODULES.map(function (m, mi) {
      var ls = LESSONS.filter(function (l) { return l.mod === mi; });
      var d = ls.filter(function (l) { return isDone(l.n); }).length;
      var open = !!openMods[mi] && !m.opens;
      return '<div class="mod' + (open ? ' is-open' : '') + (m.opens ? ' is-locked' : '') + '" style="--c:' + m.c + '">' +
        '<button class="mod__head" type="button" data-mod="' + mi + '" aria-expanded="' + open + '"><span class="mod__n">' + (mi + 1) + '</span>' +
        '<span><b>' + m.name + '</b><span>' + (m.opens ? 'откроется ' + m.opens : d + ' из ' + ls.length + ' уроков') + '</span></span>' +
        '<svg><use href="' + (m.opens ? '#i-lock' : '#i-chevron') + '"/></svg></button>' +
        '<ul class="lessons">' + ls.map(lessonRow).join('') + '</ul></div>';
    }).join('');
  }

  /* ---------- Урок ---------- */
  var lessonN = (current() || LESSONS[0]).n, timer = 0;
  function renderLesson() {
    var l = LESSONS[lessonN - 1], sec = l.min * 60;
    var w = isDone(l.n) ? sec : (state.watched[l.n] || 0);
    $('lesson-eyebrow').textContent = 'Модуль ' + (l.mod + 1) + ' · ' + l.min + ' ' + A.plural(l.min, 'минута', 'минуты', 'минут');
    $('lesson-title').textContent = 'Урок ' + l.n + '. ' + l.title;
    $('p-time').textContent = mmss(w);
    $('p-time').nextElementSibling.nextElementSibling.textContent = mmss(sec);
    $('p-fill').style.width = (w / sec * 100) + '%';
    $('p-track').setAttribute('aria-valuemax', sec);
    $('p-track').setAttribute('aria-valuenow', Math.round(w));
    $('p-track').setAttribute('aria-valuetext', mmss(w) + ' из ' + mmss(sec));
    $('p-speed').textContent = speedLabel(state.speed);
    var btn = $('lesson-done');
    btn.disabled = isDone(l.n);
    btn.innerHTML = isDone(l.n) ? '<svg><use href="#i-check"/></svg>Урок пройден' : 'Отметить пройденным';
    var hwBtn = btn.nextElementSibling;
    hwBtn.hidden = !HW[l.n];
    hwBtn.setAttribute('data-hw', l.n);
  }
  function stop() { clearInterval(timer); timer = 0; $('player').classList.remove('is-playing'); $('play-btn').innerHTML = '<svg><use href="#i-play"/></svg>'; $('play-btn').setAttribute('aria-label', 'Смотреть'); }
  function play() {
    var l = LESSONS[lessonN - 1], sec = l.min * 60;
    if (isDone(l.n)) state.watched[l.n] = 0;
    $('player').classList.add('is-playing');
    $('play-btn').innerHTML = '<svg><use href="#i-pause"/></svg>';
    $('play-btn').setAttribute('aria-label', 'Пауза');
    timer = setInterval(function () {
      var w = Math.min(sec, (state.watched[l.n] || 0) + .25 * state.speed * 4); // в демо видео идёт в 4 раза быстрее
      state.watched[l.n] = w; renderLesson();
      if (w >= sec) { stop(); save(); A.toast('Видео досмотрено — отметьте урок пройденным'); }
    }, 250);
  }
  $('play-btn').addEventListener('click', function () { if (timer) { stop(); save(); } else play(); });
  function seek(v) {
    var l = LESSONS[lessonN - 1], sec = l.min * 60;
    state.watched[l.n] = Math.max(0, Math.min(sec, v)); save(); renderLesson();
  }
  $('p-track').addEventListener('click', function (e) {
    var r = this.getBoundingClientRect(), l = LESSONS[lessonN - 1];
    seek((e.clientX - r.left) / r.width * l.min * 60);
  });
  $('p-track').addEventListener('keydown', function (e) {
    var v = state.watched[lessonN] || 0;
    if (e.key === 'ArrowRight') { e.preventDefault(); seek(v + 10); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); seek(v - 10); }
  });
  $('p-speed').addEventListener('click', function () {
    state.speed = SPEEDS[(SPEEDS.indexOf(state.speed) + 1) % SPEEDS.length]; save(); renderLesson(); renderProfile();
  });
  $('lesson-done').addEventListener('click', function () {
    if (isDone(lessonN)) return;
    stop();
    state.done.push(lessonN); state.done.sort(function (a, b) { return a - b; });
    state.doneDay = key(today); save();
    var next = current();
    renderAll();
    A.toast(next ? 'Урок пройден! Дальше — «' + next.title + '»' : 'Урок пройден!');
  });
  [].forEach.call(document.querySelectorAll('.seg button'), function (b) {
    b.addEventListener('click', function () {
      [].forEach.call(document.querySelectorAll('.seg button'), function (x) { x.classList.toggle('is-on', x === b); x.setAttribute('aria-selected', x === b); });
      $('pane-notes').hidden = b.getAttribute('data-pane') !== 'notes';
      $('pane-files').hidden = b.getAttribute('data-pane') !== 'files';
    });
  });

  /* ---------- Домашки ---------- */
  var hwFilter = 'all';
  function hwMeta(n, st) {
    if (st === 'todo') return '<svg><use href="#i-clip"/></svg>до ' + A.DAYS[deadline.getDay()] + ', ' + deadline.getDate() + ' ' + A.MONTHS[deadline.getMonth()] + ', 23:59';
    if (st === 'review') return 'ответ в течение 48 часов' + (state.files[n] ? ' · ' + A.esc(state.files[n]) : '');
    if (st === 'fix') return '<svg><use href="#i-msg"/></svg>' + HW[n].comments.length + ' комментария наставника';
    return 'принято наставником';
  }
  function renderHw() {
    var nums = Object.keys(HW).map(Number).sort(function (a, b) { return b - a; });
    var counts = { all: nums.length, fix: 0, review: 0, ok: 0, todo: 0 };
    nums.forEach(function (n) { counts[hwSt(n)]++; });
    $('hw-sum').textContent = counts.ok + ' из ' + nums.length + ' приняты';
    var F = [['all', 'Все'], ['todo', 'Не сдано'], ['fix', 'Доработать'], ['review', 'На проверке'], ['ok', 'Принято']];
    $('hw-filters').innerHTML = F.filter(function (f) { return f[0] === 'all' || counts[f[0]]; }).map(function (f) {
      return '<button class="chip' + (hwFilter === f[0] ? ' is-on' : '') + '" type="button" aria-pressed="' + (hwFilter === f[0]) + '" data-hwf="' + f[0] + '">' + f[1] + '<i>' + counts[f[0]] + '</i></button>';
    }).join('');
    $('hws').innerHTML = nums.filter(function (n) { return hwFilter === 'all' || hwSt(n) === hwFilter; }).map(function (n) {
      var st = hwSt(n);
      return '<li><button class="hw' + (st === 'fix' ? ' is-fix' : '') + '" type="button" data-hw="' + n + '"><span class="hw__n">Домашка ' + n + '</span><span class="st ' + ST[st][0] + '">' + ST[st][1] + '</span>' +
        '<span class="hw__t">' + HW[n].t + '</span><span class="hw__meta">' + hwMeta(n, st) + '</span></button></li>';
    }).join('') || '<li class="small muted" style="text-align:center;padding:30px 0">Здесь пока пусто</li>';
    var attention = counts.fix + counts.todo;
    $('hw-badge').hidden = !attention;
  }

  var hwOpen = null, pickedFile = null;
  function openHw(n) {
    if (!HW[n]) return;
    hwOpen = n; pickedFile = null;
    var h = HW[n], st = hwSt(n), html =
      '<div class="sh-hw__top"><span class="hw__n">Домашка ' + n + ' · урок ' + n + '</span><span class="st ' + ST[st][0] + '">' + ST[st][1] + '</span></div>' +
      '<h2 class="sheet__title" id="hw-title">' + h.t + '</h2><p class="task">' + h.task + '</p>';
    if (st === 'fix') {
      html += '<p class="comments__who"><span class="ava ava--yellow" aria-hidden="true">АМ</span>Анна Миронова · комментарии к макету</p><ol class="comments">' +
        h.comments.map(function (c) { return '<li>' + c + '</li>'; }).join('') + '</ol>';
    }
    if (st === 'todo' || st === 'fix') {
      html += '<label class="upload" id="up"><svg><use href="#i-clip"/></svg><span id="up-name">Прикрепить макет — PNG, PDF или ссылка на Figma-файл</span>' +
        '<input type="file" id="up-input" accept="image/*,.pdf,.fig"></label>' +
        '<button class="btn btn--violet btn--block" type="button" id="hw-send" disabled>' + (st === 'fix' ? 'Отправить исправленную версию' : 'Отправить на проверку') + '</button>';
    } else if (st === 'review') {
      html += '<div class="ok-box" style="background:#fff6dc"><svg style="background:var(--yellow);color:var(--ink)"><use href="#i-clip"/></svg><span>' + (state.files[n] ? A.esc(state.files[n]) + ' · ' : '') + 'наставник ответит в течение 48 часов</span></div>';
    } else {
      html += '<div class="ok-box"><svg><use href="#i-check"/></svg><span>Принято наставником. Работа добавлена в портфолио курса.</span></div>';
    }
    html += '<button class="btn btn--white btn--block" type="button" data-close>Закрыть</button>';
    $('hw-body').innerHTML = html;
    var inp = $('up-input');
    if (inp) inp.addEventListener('change', function () {
      pickedFile = this.files && this.files[0] ? this.files[0].name : null;
      $('up-name').textContent = pickedFile || 'Прикрепить макет';
      $('up').classList.toggle('has-file', !!pickedFile);
      $('hw-send').disabled = !pickedFile;
    });
    var send = $('hw-send');
    if (send) send.addEventListener('click', function () {
      if (!pickedFile) return;
      state.hw[hwOpen] = 'review'; state.files[hwOpen] = pickedFile; save();
      A.close(true); renderAll();
      A.toast('Отправлено! Наставник ответит в течение 48 часов');
    });
    A.sheet('hw');
  }

  /* ---------- Профиль ---------- */
  function renderProfile() {
    var ok = Object.keys(HW).filter(function (k) { return hwSt(+k) === 'ok'; }).length;
    $('cert-steps').innerHTML =
      '<li class="' + (state.done.length >= TOTAL ? 'is-done' : '') + '">Пройти все уроки<b>' + state.done.length + ' из ' + TOTAL + '</b></li>' +
      '<li>Сдать домашние задания<b>' + ok + ' из ' + TOTAL + '</b></li>' +
      '<li>Защитить итоговый проект<b>до 14 декабря</b></li>';
    $('speed-val').textContent = speedLabel(state.speed);
  }
  $('speed-set').addEventListener('click', function () {
    state.speed = SPEEDS[(SPEEDS.indexOf(state.speed) + 1) % SPEEDS.length]; save(); renderProfile(); renderLesson();
  });
  var wipeArmed = false;
  $('wipe').addEventListener('click', function () {
    if (!wipeArmed) { wipeArmed = true; this.textContent = 'Нажмите ещё раз — прогресс удалится'; return; }
    S.clear(); location.hash = ''; location.reload();
  });

  function renderAll() { renderToday(); renderCourse(); renderLesson(); renderHw(); renderProfile(); }

  /* ---------- Клики ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-lesson],[data-mod],[data-hw],[data-hwf],[data-file],#cont-play');
    if (!t) return;
    if (t.id === 'cont-play') { var c = current(); if (c) { lessonN = c.n; renderLesson(); A.show('lesson'); } }
    else if (t.hasAttribute('data-lesson')) {
      var l = LESSONS[+t.getAttribute('data-lesson') - 1];
      if (l.locked) { A.toast('Модуль откроется ' + MODULES[l.mod].opens); return; }
      stop(); lessonN = l.n; renderLesson(); A.show('lesson');
    }
    else if (t.hasAttribute('data-mod')) {
      var mi = +t.getAttribute('data-mod');
      if (MODULES[mi].opens) { A.toast('Модуль откроется ' + MODULES[mi].opens); return; }
      openMods[mi] = !openMods[mi]; renderCourse();
    }
    else if (t.hasAttribute('data-hw')) openHw(+t.getAttribute('data-hw'));
    else if (t.hasAttribute('data-hwf')) { hwFilter = t.getAttribute('data-hwf'); renderHw(); }
    else if (t.hasAttribute('data-file')) A.toast('В демо файлы не скачиваются');
  });
  document.addEventListener('screen', function (e) { if (e.detail !== 'lesson') stop(); });
  document.addEventListener('sheet', function (e) { if (e.detail === 'hw' && hwOpen === null) openHw(6); });

  // Строки для UI-кита
  $('kit-lessons').innerHTML = [LESSONS[5], LESSONS[6], LESSONS[12]].map(lessonRow).join('');

  renderAll();
  if (A.q.get('pane') === 'files') document.querySelector('.seg [data-pane="files"]').click();
  A.start('today');
})();
