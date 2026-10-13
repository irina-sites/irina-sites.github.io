(function () {
  var head = document.getElementById('head');
  function onScroll() { head.classList.toggle('is-scrolled', window.scrollY > 8); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    burger.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
  }
  burger.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  // ---------- расписание ----------
  var M = 'Максим Соловьёв', A = 'Анна Киселёва', D = 'Дмитрий Байков';
  var week = [
    ['Пн', [['07:30', 'Функционал', D, 'все уровни', 4], ['12:00', 'Йога и мобильность', A, 'новичкам', 6], ['19:00', 'Силовой старт', M, 'новичкам', 2], ['20:30', 'Бокс-фитнес', D, 'средний', 5]]],
    ['Вт', [['08:00', 'Йога и мобильность', A, 'все уровни', 5], ['18:30', 'Снижение веса', A, 'новичкам', 3], ['20:00', 'Функционал', M, 'средний', 1]]],
    ['Ср', [['07:30', 'Силовой старт', M, 'новичкам', 4], ['19:00', 'Бокс-фитнес', D, 'средний', 2], ['20:30', 'Йога и мобильность', A, 'все уровни', 6]]],
    ['Чт', [['08:00', 'Функционал', D, 'все уровни', 5], ['18:30', 'Силовой старт', M, 'новичкам', 3], ['20:00', 'Снижение веса', A, 'новичкам', 4]]],
    ['Пт', [['07:30', 'Йога и мобильность', A, 'все уровни', 6], ['19:00', 'Функционал', M, 'средний', 2], ['20:30', 'Бокс-фитнес', D, 'средний', 4]]],
    ['Сб', [['10:00', 'Силовой старт', M, 'новичкам', 3], ['11:30', 'Функционал', D, 'все уровни', 1], ['13:00', 'Йога и мобильность', A, 'все уровни', 7]]],
    ['Вс', [['11:00', 'Йога и мобильность', A, 'все уровни', 5], ['12:30', 'Снижение веса', A, 'новичкам', 4]]]
  ];
  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }
  var daysEl = document.getElementById('days');
  var schedEl = document.getElementById('sched');
  week.forEach(function (d, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'day';
    b.id = 'day-' + i;
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-controls', 'sched');
    b.innerHTML = d[0] + '<small>' + d[1].length + ' ' + plural(d[1].length, 'занятие', 'занятия', 'занятий') + '</small>';
    b.addEventListener('click', function () { show(i, false); });
    daysEl.appendChild(b);
  });
  function show(i, focus) {
    daysEl.querySelectorAll('.day').forEach(function (b, j) {
      b.setAttribute('aria-selected', String(i === j));
      b.tabIndex = i === j ? 0 : -1;
      if (i === j && focus) b.focus();
    });
    schedEl.setAttribute('aria-labelledby', 'day-' + i);
    var html = '<div class="sched__row sched__row--head"><span>Время</span><span>Тренировка</span><span>Тренер</span><span>Уровень</span><span>Места</span><span></span></div>';
    week[i][1].forEach(function (c) {
      var low = c[4] <= 2;
      var spots = low ? 'осталось ' + c[4] : c[4] + ' ' + plural(c[4], 'место', 'места', 'мест');
      html += '<div class="sched__row"><span class="sched__time">' + c[0] + '</span><span class="sched__name">' + c[1] +
        '</span><span class="sched__muted">' + c[2] + '</span><span class="sched__muted">' + c[3] +
        '</span><span class="sched__spots' + (low ? ' is-low' : '') + '">' + spots +
        '</span><a class="sched__go" href="#join">Записаться</a></div>';
    });
    schedEl.innerHTML = html;
  }
  daysEl.addEventListener('keydown', function (e) {
    var cur = [].indexOf.call(daysEl.children, document.activeElement);
    if (cur < 0) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); show((cur + 1) % week.length, true); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); show((cur - 1 + week.length) % week.length, true); }
  });
  show(0, false);

  // ---------- появление ----------
  ['.programs', '.plans', '.coaches'].forEach(function (sel) {
    var group = document.querySelector(sel);
    if (!group) return;
    group.querySelectorAll('.reveal').forEach(function (el, i) { el.style.transitionDelay = (i * 60) + 'ms'; });
  });
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  // ---------- форма ----------
  var form = document.getElementById('form');
  var body = document.getElementById('formBody');
  var ok = document.getElementById('formOk');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var firstBad = null;
    var name = form.elements.name;
    var phone = form.elements.phone;
    var agree = form.elements.agree;
    [[name, name.value.trim().length >= 2], [phone, phone.value.replace(/\D/g, '').length >= 10]].forEach(function (c) {
      c[0].classList.toggle('is-bad', !c[1]);
      c[0].setAttribute('aria-invalid', String(!c[1]));
      if (!c[1] && !firstBad) firstBad = c[0];
    });
    agree.closest('.consent').classList.toggle('is-bad', !agree.checked);
    if (!agree.checked && !firstBad) firstBad = agree;
    if (firstBad) { firstBad.focus(); return; }

    document.getElementById('formOkTitle').textContent = 'Спасибо, ' + name.value.trim() + '! Ждём на тренировке';
    body.hidden = true;
    ok.hidden = false;
  });
  form.addEventListener('input', function (e) {
    if (e.target.classList.contains('is-bad')) e.target.classList.remove('is-bad');
    if (e.target.name === 'agree') e.target.closest('.consent').classList.remove('is-bad');
  });
  document.getElementById('formAgain').addEventListener('click', function () {
    form.reset();
    ok.hidden = true;
    body.hidden = false;
    form.elements.name.focus();
  });

  document.getElementById('year').textContent = new Date().getFullYear();

  // index.html?at=schedule — прокрутить к блоку без якоря (кадры доски презентации)
  var atParam = /[?&]at=([a-z]+)/.exec(location.search);
  var atTarget = atParam && document.getElementById(atParam[1]);
  if (atTarget) {
    var goTo = function () {
      var pad = parseFloat(getComputedStyle(atTarget).paddingTop) || 0;
      window.scrollTo(0, atTarget.getBoundingClientRect().top + window.scrollY + pad - head.offsetHeight - 24);
    };
    goTo();
    if (document.fonts) document.fonts.ready.then(goTo);
    window.addEventListener('load', goTo);
  }
})();
