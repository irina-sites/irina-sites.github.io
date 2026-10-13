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

  // ---------- фильтр объектов ----------
  document.getElementById('filters').addEventListener('click', function (e) {
    var b = e.target.closest('.filter');
    if (!b) return;
    var cat = b.getAttribute('data-cat');
    this.querySelectorAll('.filter').forEach(function (f) { f.setAttribute('aria-pressed', String(f === b)); });
    document.querySelectorAll('#objectsList .obj').forEach(function (o) {
      o.hidden = cat !== 'all' && o.getAttribute('data-cat') !== cat;
      if (!o.hidden) o.classList.add('is-in');
    });
  });

  // ---------- ипотечный калькулятор ----------
  var $ = function (id) { return document.getElementById(id); };
  function rub(n) { return Math.round(n).toLocaleString('ru-RU') + ' ₽'; }
  function mln(n) { return (n / 1e6).toLocaleString('ru-RU', { maximumFractionDigits: 1 }) + ' млн ₽'; }
  function years(n) {
    var m10 = n % 10, m100 = n % 100;
    var w = (m10 === 1 && m100 !== 11) ? 'год' : (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) ? 'года' : 'лет';
    return n + ' ' + w;
  }
  function fill(input) {
    var p = (input.value - input.min) / (input.max - input.min) * 100;
    input.style.setProperty('--p', p + '%');
  }
  function calc() {
    var price = +$('price').value, down = +$('down').value, term = +$('term').value;
    var rate = Math.min(40, Math.max(1, parseFloat(String($('rate').value).replace(',', '.')) || 14));
    var downRub = price * down / 100, loan = price - downRub;
    var r = rate / 1200, n = term * 12;
    var pay = loan * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    $('oPrice').textContent = mln(price);
    $('oDown').textContent = down + '% · ' + mln(downRub);
    $('oTerm').textContent = years(term);
    $('oPay').textContent = rub(pay);
    $('oLoan').textContent = rub(loan);
    $('oDownRub').textContent = rub(downRub);
    $('oOver').textContent = rub(pay * n - loan);
    ['price', 'down', 'term'].forEach(function (id) { fill($(id)); });
  }
  $('calc').addEventListener('input', calc);
  calc();

  // ---------- появление ----------
  ['.objects', '.services', '.deal'].forEach(function (sel) {
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

    document.getElementById('formOkTitle').textContent = 'Спасибо, ' + name.value.trim() + '!';
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

  // index.html?at=objects — прокрутить к блоку без якоря (кадры доски презентации)
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
