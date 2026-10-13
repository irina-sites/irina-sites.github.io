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

  // ---------- формат обучения: меняет цены курсов и состав ----------
  var included = {
    rec: ['уроки в записи навсегда', 'тесты с автопроверкой', 'чат студентов'],
    group: ['всё из «Записей»', 'разбор домашек за 48 часов', 'созвон группы раз в неделю'],
    solo: ['всё из «С наставником»', 'личные созвоны раз в неделю', 'индивидуальный план и сроки']
  };
  function rub(n) { return n.toLocaleString('ru-RU') + ' ₽'; }
  function setFormat(f) {
    document.querySelectorAll('#seg button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-format') === f));
    });
    document.getElementById('formatInc').innerHTML = included[f].map(function (t) { return '<li>' + t + '</li>'; }).join('');
    document.querySelectorAll('.course').forEach(function (c) {
      var total = JSON.parse(c.getAttribute('data-prices'))[f];
      var parts = +c.getAttribute('data-parts');
      c.querySelector('[data-price]').textContent = rub(total);
      c.querySelector('[data-parts-text]').textContent = 'или ' + parts + ' платежа по ' + rub(Math.round(total / parts));
    });
  }
  document.getElementById('seg').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (b) setFormat(b.getAttribute('data-format'));
  });
  setFormat('group');

  // ---------- появление ----------
  ['.stats', '.courses', '.mentors'].forEach(function (sel) {
    var group = document.querySelector(sel);
    if (!group) return;
    group.querySelectorAll('.reveal').forEach(function (el, i) { el.style.transitionDelay = (i * 70) + 'ms'; });
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

    document.getElementById('formOkTitle').textContent = 'Спасибо, ' + name.value.trim() + '! Урок уже в пути';
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

  // index.html?at=courses — прокрутить к блоку без якоря (кадры доски презентации)
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
