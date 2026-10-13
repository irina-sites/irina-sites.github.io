/* БЕЛЫЙ КИТ — приложение пациента: главная, онлайн-запись, таймер чистки зубов,
   визиты и документы. Сведений о здоровье приложение не собирает. */
(function () {
  'use strict';
  var A = window.App, S = A.store, $ = function (id) { return document.getElementById(id); };

  var DOCTORS = {
    sokolova: { name: 'Анна Соколова', role: 'Стоматолог-терапевт · стаж 11 лет', ini: 'АС', a: '#7fdcc0', b: '#16a3c7' },
    orlov: { name: 'Михаил Орлов', role: 'Хирург-имплантолог · стаж 14 лет', ini: 'МО', a: '#5cc6e0', b: '#0d7591' },
    kravets: { name: 'Елена Кравец', role: 'Детский стоматолог · стаж 9 лет', ini: 'ЕК', a: '#ffd3a6', b: '#e9a05e' }
  };
  var SERVICES = [
    { id: 'consult', short: 'Консультация', name: 'Консультация и план лечения', sub: 'осмотр, снимок, план и цена', price: 900, min: 30, doc: 'sokolova', kid: false },
    { id: 'hyg', short: 'Профгигиена', name: 'Профессиональная гигиена', sub: 'ультразвук, порошок, полировка', price: 3900, min: 60, doc: 'sokolova', kid: false },
    { id: 'caries', short: 'Лечение кариеса', name: 'Лечение кариеса', sub: 'под микроскопом, с анестезией', price: 4500, min: 60, doc: 'sokolova', kid: false },
    { id: 'implant', short: 'Имплантолог', name: 'Консультация имплантолога', sub: '3D-снимок и план в день визита', price: 1500, min: 40, doc: 'orlov', kid: false },
    { id: 'kid', short: 'Детский приём', name: 'Детский приём', sub: 'первый визит — знакомство, без лечения', price: 2200, min: 40, doc: 'kravets', kid: true },
    { id: 'kidhyg', short: 'Детская гигиена', name: 'Детская гигиена', sub: 'чистка и обучение уходу', price: 2600, min: 40, doc: 'kravets', kid: true }
  ];
  var WHO = { me: { label: 'Я', name: 'Ксения Титова' }, kid: { label: 'Миша, 7 лет', name: 'Миша Титов' } };
  var TIMES = ['9:00', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00', '19:30'];
  var ZONES = ['Верх, левая сторона', 'Верх, правая сторона', 'Низ, правая сторона', 'Низ, левая сторона'];
  var PAST = [
    ['Детский приём', 'Миша', new Date(2026, 8, 9), 'kravets'],
    ['Профессиональная гигиена', '', new Date(2026, 3, 14), 'sokolova'],
    ['Лечение кариеса', '', new Date(2026, 1, 2), 'sokolova'],
    ['Консультация и план лечения', '', new Date(2026, 0, 20), 'sokolova']
  ];

  var today = A.today;
  function key(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function svc(id) { return SERVICES.filter(function (s) { return s.id === id; })[0]; }
  function rub(n) { return 'от ' + A.money(n); }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function now() { if (A.isStatic) { var d = new Date(today); d.setHours(12, 30); return d; } return new Date(); }
  function at(dateIso, time) { var d = new Date(dateIso), t = time.split(':'); d.setHours(+t[0], +t[1], 0, 0); return d; }
  function whenText(d, time, long) {
    return A.DAYS[d.getDay()] + ', ' + d.getDate() + ' ' + (long ? A.MONTHS[d.getMonth()] : A.MONTHS[d.getMonth()].slice(0, 3)) + ' · ' + time;
  }

  // Чистки: дата → [утро, вечер]. По умолчанию — пять полных дней и утро сегодня
  function defaultBrush() {
    var b = {};
    for (var i = -6; i < 0; i++) b[key(A.addDays(today, i))] = i === -6 ? [true, false] : [true, true];
    b[key(today)] = [true, false];
    return b;
  }
  var state = {
    visits: S.get('visits', [{ svc: 'hyg', who: 'me', date: A.addDays(today, 2).toISOString(), time: '10:30' }]),
    brush: S.get('brush', defaultBrush()),
    brushChanged: S.get('brushChanged', A.addDays(today, -62).toISOString())
  };
  function save() { S.set('visits', state.visits); S.set('brush', state.brush); S.set('brushChanged', state.brushChanged); }
  function upcoming() {
    var n = now();
    return state.visits.filter(function (v) { return at(v.date, v.time) > n; })
      .sort(function (a, b) { return at(a.date, a.time) - at(b.date, b.time); });
  }
  function streak() {
    var n = 0, d = today, t = state.brush[key(today)];
    if (!(t && t[0] && t[1])) d = A.addDays(today, -1);
    while (true) { var v = state.brush[key(d)]; if (v && v[0] && v[1]) { n++; d = A.addDays(d, -1); } else break; }
    return n;
  }

  /* ---------- Главная ---------- */
  function visitCard(v, i, compact) {
    var s = svc(v.svc), d = new Date(v.date), doc = DOCTORS[s.doc];
    if (compact) {
      return '<div class="vcard"><div class="vcard__top"><span class="vcard__when">' + whenText(d, v.time, true) + '</span>' +
        (v.who === 'kid' ? '<span class="badge badge--kid">Миша</span>' : '<span class="badge">запись</span>') + '</div>' +
        '<p class="vcard__who">' + s.name + ' · ' + doc.name + '</p>' +
        '<div class="vcard__acts"><button type="button" data-ics="' + i + '">В календарь</button><button type="button" class="is-danger" data-vcancel="' + i + '">Отменить</button></div></div>';
    }
    return '<section class="visit" aria-label="Ближайший визит"><div class="visit__top"><span class="visit__tag">Ближайший визит</span><span>' + (v.who === 'kid' ? 'для Миши' : 'кабинет 2') + '</span></div>' +
      '<p class="visit__when">' + A.DAYS[d.getDay()].replace(/^./, function (c) { return c.toUpperCase(); }) + ', <em>' + d.getDate() + ' ' + A.MONTHS[d.getMonth()] + '</em> · ' + v.time + '</p>' +
      '<p class="visit__what">' + s.name + '</p>' +
      '<div class="visit__who"><span class="visit__ava" aria-hidden="true">' + doc.ini + '</span><div><b>' + doc.name + '</b>' + doc.role.split(' · ')[0] + '</div></div>' +
      '<div class="visit__acts"><button class="btn btn--white" type="button" data-ics="' + i + '"><svg><use href="#i-cal"/></svg>В календарь</button><button class="btn btn--ghost-w" type="button" data-vcancel="' + i + '">Отменить</button></div></section>';
  }
  function renderHome() {
    $('home-date').textContent = A.DAYS[today.getDay()].replace(/^./, function (c) { return c.toUpperCase(); }) + ', ' + today.getDate() + ' ' + A.MONTHS[today.getMonth()];
    var up = upcoming();
    $('home-visit').innerHTML = up.length ? visitCard(up[0], state.visits.indexOf(up[0])) :
      '<section class="visit visit--empty"><h2 class="h3">Записей пока нет</h2><p>Выберите врача и удобное время — это займёт минуту.</p><button class="btn btn--primary btn--block" type="button" data-go="book">Записаться</button></section>';
    var st = streak();
    $('mini-streak').textContent = st + ' ' + A.plural(st, 'день', 'дня', 'дней') + ' подряд';
    var dots = '';
    for (var i = -6; i <= 0; i++) { var v = state.brush[key(A.addDays(today, i))] || [false, false]; dots += '<b class="' + (v[0] && v[1] ? 'is-full' : v[0] || v[1] ? 'is-half' : '') + '"></b>'; }
    $('mini-dots').innerHTML = dots;
    var hyg = up.filter(function (v) { return v.svc === 'hyg' && v.who === 'me'; })[0];
    $('remind-text').textContent = 'Последняя — 14 апреля. ' + (hyg ? 'Следующая уже в плане: ' + whenText(new Date(hyg.date), hyg.time, true) + '.' : 'Пора записаться — это можно сделать прямо здесь.');
  }

  /* ---------- Запись ---------- */
  var book = { who: A.q.get('who') === 'kid' ? 'kid' : 'me', svc: 'consult', day: 1, time: null };
  function bookDate() { return A.addDays(today, book.day); }
  function taken(d, t) {
    var dt = at(d.toISOString(), t);
    if (dt <= now()) return true;
    if (state.visits.some(function (v) { return key(new Date(v.date)) === key(d) && v.time === t; })) return true;
    return hash(key(d) + t + svc(book.svc).doc) % 3 === 0;
  }
  function renderBook() {
    $('b-who').innerHTML = Object.keys(WHO).map(function (k) {
      return '<button class="chip" type="button" role="radio" aria-checked="' + (book.who === k) + '" data-who="' + k + '">' + WHO[k].label + '</button>';
    }).join('');
    var list = SERVICES.filter(function (s) { return s.kid === (book.who === 'kid'); });
    if (!list.some(function (s) { return s.id === book.svc; })) book.svc = list[0].id;
    $('b-services').innerHTML = list.map(serviceRow).join('');
    var doc = DOCTORS[svc(book.svc).doc];
    $('b-doctor').innerHTML = '<div class="doctor"><span class="doctor__ava" style="--a:' + doc.a + ';--b:' + doc.b + '" aria-hidden="true">' + doc.ini + '</span><div><b>' + doc.name + '</b><span>' + doc.role + '</span></div></div>';
    var days = '';
    for (var i = 0; i < 7; i++) {
      var d = A.addDays(today, i);
      days += '<button class="day" type="button" role="radio" aria-checked="' + (book.day === i) + '" data-bday="' + i + '"><small>' + (i === 0 ? 'сег' : A.DAYS[d.getDay()]) + '</small><b>' + d.getDate() + '</b></button>';
    }
    $('b-days').innerHTML = days;
    var bd = bookDate();
    if (book.time && taken(bd, book.time)) book.time = null;
    if (!book.time) book.time = TIMES.filter(function (t) { return !taken(bd, t); })[0] || null;
    $('b-times').innerHTML = TIMES.map(function (t) {
      var off = taken(bd, t);
      return '<button class="time" type="button" role="radio" aria-checked="' + (book.time === t) + '" data-btime="' + t + '"' + (off ? ' disabled aria-label="' + t + ', занято"' : '') + '>' + t + '</button>';
    }).join('');
    var s = svc(book.svc);
    $('sum-when').textContent = book.time ? whenText(bd, book.time) : 'Нет свободного времени';
    $('sum-what').textContent = s.short + ' · ' + rub(s.price);
    $('b-next').disabled = !book.time;
  }
  function serviceRow(s) {
    return '<li><button class="svc" type="button" role="radio" aria-checked="' + (book.svc === s.id) + '" data-svc="' + s.id + '"><span><b>' + s.name + '</b><span>' + s.sub + ' · ' + s.min + ' мин</span></span><strong>' + rub(s.price) + '</strong></button></li>';
  }
  $('b-next').addEventListener('click', openConfirm);
  function openConfirm() {
    if (!book.time) return;
    var s = svc(book.svc), doc = DOCTORS[s.doc];
    $('cf-facts').innerHTML =
      '<li>Пациент<b>' + WHO[book.who].label.replace('Я', 'Вы') + '</b></li>' +
      '<li>Услуга<b>' + s.name + '</b></li>' +
      '<li>Врач<b>' + doc.name + '</b></li>' +
      '<li>Когда<b>' + whenText(bookDate(), book.time, true) + '</b></li>' +
      '<li>Стоимость<b>' + rub(s.price) + '</b></li>';
    var nm = $('cf-name');
    if (!nm.value || nm.dataset.auto === '1') { nm.value = WHO[book.who].name; nm.dataset.auto = '1'; }
    $('cf-name').previousElementSibling.textContent = book.who === 'kid' ? 'Имя ребёнка' : 'Имя пациента';
    // в кадрах для портфолио телефон не подставляем: на картинках Кворка не должно быть номеров, даже условных
    $('cf-err').textContent = '';
    A.sheet('confirm');
  }
  $('cf-name').addEventListener('input', function () { this.dataset.auto = '0'; });
  $('cf-phone').addEventListener('input', function () {
    var dg = this.value.replace(/\D/g, '');
    if (dg[0] === '8' || dg[0] === '7') dg = dg.slice(1);
    dg = dg.slice(0, 10);
    var out = '+7';
    if (dg.length) out += ' (' + dg.slice(0, 3);
    if (dg.length >= 3) out += ')';
    if (dg.length > 3) out += ' ' + dg.slice(3, 6);
    if (dg.length > 6) out += '-' + dg.slice(6, 8);
    if (dg.length > 8) out += '-' + dg.slice(8, 10);
    this.value = out;
  });
  $('cf-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var err = '', bad = null;
    ['cf-name', 'cf-phone'].forEach(function (id) { $(id).setAttribute('aria-invalid', 'false'); });
    if ($('cf-name').value.trim().length < 2) { err = 'Укажите имя пациента'; bad = $('cf-name'); }
    else if ($('cf-phone').value.replace(/\D/g, '').length !== 11) { err = 'Проверьте телефон: 10 цифр после +7'; bad = $('cf-phone'); }
    else if (!$('cf-agree').checked) { err = 'Отметьте согласие — без него клиника не сможет подтвердить запись'; bad = $('cf-agree'); }
    $('cf-err').textContent = err;
    if (bad) { if (bad.type !== 'checkbox') bad.setAttribute('aria-invalid', 'true'); bad.focus(); return; }
    var msg = 'Записали: ' + whenText(bookDate(), book.time, true);
    state.visits.push({ svc: book.svc, who: book.who, date: bookDate().toISOString(), time: book.time });
    save(); A.close(true); renderAll(); A.show('home', { root: true });
    A.toast(msg);
  });

  /* ---------- Отмена и календарь ---------- */
  var cancelIdx = null;
  function openCancel(i) {
    var v = state.visits[i]; if (!v) return;
    cancelIdx = i;
    $('cn-text').textContent = svc(v.svc).name + ', ' + whenText(new Date(v.date), v.time, true) + '. Пожалуйста, предупреждайте хотя бы за сутки — так время достанется другому пациенту.';
    A.sheet('cancel');
  }
  $('cn-ok').addEventListener('click', function () {
    if (cancelIdx === null) return;
    state.visits.splice(cancelIdx, 1); cancelIdx = null;
    save(); A.close(true); renderAll(); A.toast('Визит отменён');
  });
  function ics(i) {
    var v = state.visits[i]; if (!v) return;
    var s = svc(v.svc), st = at(v.date, v.time), en = new Date(st.getTime() + s.min * 6e4);
    var f = function (d) { return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + 'T' + pad(d.getHours()) + pad(d.getMinutes()) + '00'; };
    var text = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Belyi Kit demo//RU', 'BEGIN:VEVENT', 'UID:' + f(st) + '-' + v.svc + '@belyi-kit.demo', 'DTSTAMP:' + f(new Date()),
      'DTSTART:' + f(st), 'DTEND:' + f(en), 'SUMMARY:Белый Кит — ' + s.name, 'LOCATION:Новосибирск\\, ул. Тихая\\, 14',
      'DESCRIPTION:Врач: ' + DOCTORS[s.doc].name + '. Демо-запись для портфолио.', 'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', 'DESCRIPTION:Визит в «Белый Кит»', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/calendar;charset=utf-8' }));
    a.download = 'belyi-kit-' + f(st).slice(0, 8) + '.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    A.toast('Файл для календаря скачан — напоминание за 2 часа');
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* ---------- Чистка ---------- */
  var elapsed = A.isStatic && A.q.get('screen') === 'brush' ? 46 : 0, timer = 0;
  (function buildSegs() {
    var g = '';
    for (var i = 0; i < 4; i++) g += '<circle class="seg" data-seg="' + i + '" cx="110" cy="110" r="96" pathLength="100" stroke-dasharray="21 79" stroke-dashoffset="' + (-(25 * i + 2)) + '"/>';
    $('t-segs').innerHTML = g;
  })();
  function renderTimer() {
    var left = 120 - elapsed, zone = Math.min(3, Math.floor(elapsed / 30));
    $('t-time').textContent = Math.floor(left / 60) + ':' + pad(left % 60);
    $('t-zone').textContent = elapsed === 0 && !timer ? 'Готовы? 4 зоны по 30 секунд' : left === 0 ? 'Готово!' : ZONES[zone];
    [].forEach.call(document.querySelectorAll('[data-seg]'), function (s, i) {
      s.setAttribute('class', 'seg' + (elapsed >= (i + 1) * 30 ? ' is-done' : (elapsed > 0 || timer) && i === zone ? ' is-now' : ''));
    });
    [].forEach.call(document.querySelectorAll('#jaw path'), function (p) {
      var q = +p.getAttribute('data-q');
      p.setAttribute('class', elapsed >= (q + 1) * 30 ? 'is-done' : (elapsed > 0 || timer) && q === zone ? 'is-now' : '');
    });
    var btn = $('t-start');
    btn.innerHTML = '<svg><use href="#' + (timer ? 'i-pause' : 'i-play') + '"/></svg><span>' + (timer ? 'Пауза' : elapsed ? 'Продолжить' : 'Начать') + '</span>';
    document.querySelector('.timer').classList.toggle('is-run', !!timer);
  }
  function stopTimer() { clearInterval(timer); timer = 0; renderTimer(); }
  $('t-start').addEventListener('click', function () {
    if (timer) { stopTimer(); return; }
    if (elapsed >= 120) elapsed = 0;
    timer = setInterval(function () {
      elapsed++;
      if (elapsed % 30 === 0 && elapsed < 120 && navigator.vibrate) navigator.vibrate(120);
      if (elapsed >= 120) {
        stopTimer();
        var k = key(today), v = state.brush[k] || [false, false];
        v[new Date().getHours() < 15 ? 0 : 1] = true; state.brush[k] = v; save();
        renderHome(); renderWeek();
        A.toast('Готово! Две минуты — засчитано');
        setTimeout(function () { elapsed = 0; renderTimer(); }, 1800);
        return;
      }
      renderTimer();
    }, 1000);
    renderTimer();
  });
  $('t-reset').addEventListener('click', function () { clearInterval(timer); timer = 0; elapsed = 0; renderTimer(); });
  function renderWeek() {
    var mon = A.addDays(today, -((today.getDay() + 6) % 7)), html = '', done = 0, total = 0;
    for (var i = 0; i < 7; i++) {
      var d = A.addDays(mon, i), v = state.brush[key(d)] || [false, false], past = d <= today;
      if (past) { total += 2; done += (v[0] ? 1 : 0) + (v[1] ? 1 : 0); }
      html += '<li class="' + (key(d) === key(today) ? 'is-today' : '') + '"><i><b class="' + (v[0] ? 'on' : '') + '" title="утро"></b><b class="' + (v[1] ? 'on' : '') + '" title="вечер"></b></i>' + A.DAYS[d.getDay()] + '</li>';
    }
    $('week').innerHTML = html;
    $('week-sum').textContent = done + ' из ' + total + ' чисток';
    var next = A.addDays(new Date(state.brushChanged), 90);
    $('brush-change').textContent = 'Заменить до ' + next.getDate() + ' ' + A.MONTHS[next.getMonth()];
  }
  $('brush-new').addEventListener('click', function () {
    state.brushChanged = today.toISOString(); save(); renderWeek();
    var n = A.addDays(today, 90);
    A.toast('Отметили. Следующая замена — ' + n.getDate() + ' ' + A.MONTHS[n.getMonth()]);
  });

  /* ---------- Визиты ---------- */
  function renderVisits() {
    var up = upcoming();
    $('v-up').innerHTML = up.length ? up.map(function (v) { return '<li>' + visitCard(v, state.visits.indexOf(v), true) + '</li>'; }).join('') :
      '<li class="muted small">Предстоящих визитов нет. <button class="link" type="button" data-go="book">Записаться</button></li>';
    $('v-past').innerHTML = PAST.map(function (p) {
      return '<li><div>' + p[0] + '<span>' + p[2].getDate() + ' ' + A.MONTHS[p[2].getMonth()] + ' ' + p[2].getFullYear() + ' · ' + DOCTORS[p[3]].name + '</span></div>' + (p[1] ? '<span class="badge badge--kid">' + p[1] + '</span>' : '') + '</li>';
    }).join('');
  }

  function renderAll() { renderHome(); renderBook(); renderWeek(); renderVisits(); renderTimer(); }

  /* ---------- Клики ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-who],[data-svc],[data-bday],[data-btime],[data-ics],[data-vcancel],[data-doc]');
    if (!t) return;
    if (t.hasAttribute('data-who')) { book.who = t.getAttribute('data-who'); renderBook(); }
    else if (t.hasAttribute('data-svc')) { book.svc = t.getAttribute('data-svc'); renderBook(); }
    else if (t.hasAttribute('data-bday')) { book.day = +t.getAttribute('data-bday'); book.time = null; renderBook(); }
    else if (t.hasAttribute('data-btime')) { book.time = t.getAttribute('data-btime'); renderBook(); }
    else if (t.hasAttribute('data-ics')) ics(+t.getAttribute('data-ics'));
    else if (t.hasAttribute('data-vcancel')) openCancel(+t.getAttribute('data-vcancel'));
    else if (t.hasAttribute('data-doc')) A.toast('В демо документы не открываются');
  });
  document.addEventListener('screen', function (e) { if (e.detail !== 'brush' && timer) stopTimer(); });
  // Политика из формы записи возвращает обратно в форму
  var backTo = null;
  document.addEventListener('click', function (e) { if (e.target.closest('#cf-form [data-sheet="privacy"]')) backTo = 'confirm'; }, true);
  $('priv-ok').addEventListener('click', function () { if (backTo) { var b = backTo; backTo = null; A.sheet(b); } else A.close(); });
  document.addEventListener('sheet', function (e) {
    if (e.detail === 'confirm' && !$('cf-facts').children.length) openConfirm();
    if (e.detail === 'cancel' && cancelIdx === null && upcoming().length) openCancel(state.visits.indexOf(upcoming()[0]));
  });
  var wipeArmed = false;
  $('wipe').addEventListener('click', function () {
    if (!wipeArmed) { wipeArmed = true; this.textContent = 'Нажмите ещё раз — данные удалятся'; return; }
    S.clear(); location.hash = ''; location.reload();
  });

  // UI-кит
  $('kit-service').innerHTML = serviceRow(svc('hyg'));
  $('kit-visit').innerHTML = visitCard(state.visits[0], 0, true);

  renderAll();
  A.start('home');
})();
