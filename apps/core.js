/* Ядро демо-приложений: экраны, нижние листы, тосты, хранилище на устройстве,
   установка на главный экран и офлайн-режим.
   Параметры адреса: ?screen=<id> — открыть экран, ?sheet=<id> — открыть лист,
   ?static — неподвижный кадр для снимка (без анимаций и без сохранённых данных). */
(function () {
  'use strict';
  var q = new URLSearchParams(location.search);
  var root = document.documentElement;
  var isStatic = q.has('static');
  if (isStatic) root.classList.add('static');

  // Хранилище: всё лежит в localStorage этого браузера и никуда не отправляется
  var prefix = (document.body.getAttribute('data-app') || 'app') + ':';
  var store = {
    get: function (key, def) {
      if (isStatic) return def;
      try { var v = localStorage.getItem(prefix + key); return v === null ? def : JSON.parse(v); } catch (e) { return def; }
    },
    set: function (key, value) {
      if (isStatic) return;
      try { localStorage.setItem(prefix + key, JSON.stringify(value)); } catch (e) {}
    },
    clear: function () {
      try {
        Object.keys(localStorage).forEach(function (k) { if (k.indexOf(prefix) === 0) localStorage.removeItem(k); });
      } catch (e) {}
    }
  };

  // «Сегодня»: в кадрах для портфолио дата закреплена, чтобы снимки не менялись
  var today = isStatic ? new Date(2026, 9, 14) : new Date();
  today.setHours(0, 0, 0, 0);

  // Экраны
  var current = null, stack = [];
  function show(id, opts) {
    opts = opts || {};
    var el = document.getElementById('s-' + id);
    if (!el) return;
    if (opts.root) stack = [];
    else if (current && current !== el && !opts.back) stack.push(current.id.slice(2));
    if (current && current !== el) current.classList.remove('is-on');
    el.classList.add('is-on');
    el.scrollTop = 0;
    current = el;
    root.setAttribute('data-screen', id);
    var tab = el.getAttribute('data-tab') || id;
    [].forEach.call(document.querySelectorAll('.tabs [data-go]'), function (b) {
      var on = b.getAttribute('data-go') === tab;
      b.classList.toggle('is-on', on);
      if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    if (!isStatic && history.replaceState) history.replaceState(null, '', '#' + id);
    document.dispatchEvent(new CustomEvent('screen', { detail: id }));
  }
  function back() {
    var prev = stack.pop();
    if (prev) show(prev, { back: true });
  }

  // Нижние листы
  var openSheet = null, lastFocus = null;
  function sheet(id) {
    close(true);
    var w = document.getElementById('sh-' + id);
    if (!w) return;
    lastFocus = document.activeElement;
    w.classList.add('is-open');
    openSheet = w;
    var panel = w.querySelector('.sheet');
    if (panel && !isStatic) { panel.setAttribute('tabindex', '-1'); panel.focus({ preventScroll: true }); }
    document.dispatchEvent(new CustomEvent('sheet', { detail: id }));
  }
  function close(silent) {
    if (!openSheet) return;
    openSheet.classList.remove('is-open');
    openSheet = null;
    if (!silent && lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  // Тост
  var toastEl = null, toastTimer = 0;
  function toast(text) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      document.querySelector('.shell').appendChild(toastEl);
    }
    toastEl.textContent = text;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2600);
  }

  // Установка на главный экран
  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; root.classList.add('can-install'); });
  function install() {
    if (deferred) { deferred.prompt(); deferred = null; root.classList.remove('can-install'); return; }
    var ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    toast(ios ? 'Safari: «Поделиться» → «На экран Домой»' : 'Меню браузера → «Добавить на главный экран»');
  }

  // Делегирование кликов: data-go, data-back, data-sheet, data-close, data-install
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-go],[data-back],[data-sheet],[data-close],[data-install]');
    if (!t) return;
    if (t.hasAttribute('data-go')) { e.preventDefault(); close(true); show(t.getAttribute('data-go'), { root: !!t.closest('.tabs') }); }
    else if (t.hasAttribute('data-back')) { e.preventDefault(); back(); }
    else if (t.hasAttribute('data-sheet')) { e.preventDefault(); sheet(t.getAttribute('data-sheet')); }
    else if (t.hasAttribute('data-close')) { e.preventDefault(); close(); }
    else if (t.hasAttribute('data-install')) { e.preventDefault(); install(); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  // Офлайн
  window.addEventListener('offline', function () { toast('Нет сети — приложение работает офлайн'); });

  function start(def) {
    var first = q.get('screen') || location.hash.slice(1) || def;
    if (!document.getElementById('s-' + first)) first = def;
    show(first, { root: true });
    if (q.get('sheet')) sheet(q.get('sheet'));
    if (!isStatic && 'serviceWorker' in navigator && location.protocol !== 'file:') {
      window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
    }
  }

  // Мелочи для форматирования
  var MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  var DAYS = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
  function plural(n, one, few, many) {
    var a = Math.abs(n) % 100, b = a % 10;
    if (a > 10 && a < 20) return many;
    if (b > 1 && b < 5) return few;
    if (b === 1) return one;
    return many;
  }
  function money(n) { return Math.round(n).toLocaleString('ru-RU').replace(/ |\s/g, ' ') + ' ₽'; }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  window.App = {
    q: q, isStatic: isStatic, store: store, today: today,
    show: show, back: back, sheet: sheet, close: close, toast: toast, start: start,
    MONTHS: MONTHS, DAYS: DAYS, plural: plural, money: money, addDays: addDays, esc: esc
  };
})();
