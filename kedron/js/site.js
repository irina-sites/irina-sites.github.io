/* ==========================================================================
   КЕДРОН — общий скрипт для всех страниц.
   Меню, тема, появление блоков при прокрутке, проверка форм.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;

  /* ---------- тема: светлая, тёмная или как в системе ---------- */
  try {
    var saved = localStorage.getItem('kedron-theme');
    if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved);
  } catch (e) {}

  function isDarkNow() {
    var attr = root.getAttribute('data-theme');
    if (attr === 'dark') return true;
    if (attr === 'light') return false;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  var themeBtn = document.getElementById('themeBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = isDarkNow() ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('kedron-theme', next); } catch (e) {}
    });
  }

  /* ---------- мобильное меню ---------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        menu.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        menu.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        burger.focus();
      }
    });
  }

  /* ---------- граница у шапки при прокрутке ---------- */
  var head = document.getElementById('head');
  if (head) {
    var onScroll = function () { head.classList.toggle('is-stuck', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- плавное появление блоков ---------- */
  window.kedronReveal = function (scope) {
    var items = (scope || document).querySelectorAll('.reveal:not(.is-in)');
    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(items, function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    Array.prototype.forEach.call(items, function (el) { io.observe(el); });
  };
  window.kedronReveal();

  /* ---------- проверка и отправка форм ----------
     Демо-сайт работает без сервера, поэтому заявка не уходит никуда, а
     показывается экран "принято". В боевом проекте сюда подставляется
     отправка на почту, в Telegram или в CRM. */
  function markField(el, isBad) {
    var box = el.closest ? el.closest('.field') : el.parentNode;
    if (box) box.classList.toggle('is-bad', isBad);
    return !isBad;
  }

  function looksLikeContact(v) {
    var digits = v.replace(/\D/g, '');
    return digits.length >= 10 || /@|t\.me\//i.test(v);
  }

  Array.prototype.forEach.call(document.querySelectorAll('form[data-lead]'), function (form) {
    var okBox = document.getElementById(form.getAttribute('data-ok'));

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = form.querySelector('[data-check="name"]');
      var contact = form.querySelector('[data-check="contact"]');
      var agree = form.querySelector('[data-check="agree"]');
      var ok = true;

      if (name) ok = markField(name, name.value.trim().length < 2) && ok;
      if (contact) ok = markField(contact, !looksLikeContact(contact.value.trim())) && ok;
      /* без галочки согласия заявку не принимаем: 152-ФЗ ст.9 */
      if (agree) ok = markField(agree, !agree.checked) && ok;

      if (!ok) {
        var first = form.querySelector('.is-bad input, .is-bad textarea');
        if (first) first.focus();
        return;
      }

      if (okBox) {
        form.style.display = 'none';
        okBox.classList.add('is-on');
        okBox.setAttribute('tabindex', '-1');
        okBox.focus();
      }
    });

    Array.prototype.forEach.call(form.querySelectorAll('input, textarea'), function (el) {
      el.addEventListener(el.type === 'checkbox' ? 'change' : 'input', function () {
        var box = this.closest('.field');
        if (box) box.classList.remove('is-bad');
      });
    });
  });

  /* ---------- декоративные элементы: шишка и кедровая ветка ----------
     Нарисованы линиями в SVG и вставляются сюда, а не грузятся картинками.
     Так они остаются чёткими на любом экране, весят считанные байты,
     сами перекрашиваются под тёмную тему и ни у кого не куплены. */
  var DECOR = {
    cone:
      '<svg viewBox="0 0 120 176" aria-hidden="true" focusable="false">' +
        '<g fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M60 18V8"/>' +
          '<path d="M60 18c22 8 34 28 34 54 0 34-14 66-34 86-20-20-34-52-34-86 0-26 12-46 34-54z"/>' +
          '<path d="M40 40q20 14 40 0"/>' +
          '<path d="M32 60q28 18 56 0"/>' +
          '<path d="M29 84q31 19 62 0"/>' +
          '<path d="M33 108q27 18 54 0"/>' +
          '<path d="M41 130q19 14 38 0"/>' +
          '<path d="M50 148q10 9 20 0"/>' +
        '</g>' +
      '</svg>',
    branch:
      '<svg viewBox="0 0 160 248" aria-hidden="true" focusable="false">' +
        '<g fill="none" stroke="currentColor" stroke-linecap="round">' +
          '<path d="M80 240C78 184 82 96 80 16" stroke-width="3.4"/>' +
          '<g stroke-width="2.3">' +
            '<path d="M80 220 36 185M80 220 124 185"/>' +
            '<path d="M80 198 38 164M80 198 122 164"/>' +
            '<path d="M80 176 40 144M80 176 120 144"/>' +
            '<path d="M80 154 43 124M80 154 117 124"/>' +
            '<path d="M80 132 46 105M80 132 114 105"/>' +
            '<path d="M80 110 49 85M80 110 111 85"/>' +
            '<path d="M80 90 53 68M80 90 107 68"/>' +
            '<path d="M80 72 57 54M80 72 103 54"/>' +
            '<path d="M80 56 61 41M80 56 99 41"/>' +
            '<path d="M80 42 66 31M80 42 94 31"/>' +
            '<path d="M80 30 71 23M80 30 89 23"/>' +
          '</g>' +
        '</g>' +
      '</svg>'
  };

  Array.prototype.forEach.call(document.querySelectorAll('[data-decor]'), function (el) {
    var svg = DECOR[el.getAttribute('data-decor')];
    if (svg) el.innerHTML = svg;
  });

  /* ---------- год в подвале ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
