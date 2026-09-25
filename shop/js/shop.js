/* ==========================================================================
   ГЛИНА — общий скрипт магазина.
   Корзина, каталог с фильтрами, окно товара, оформление заказа.
   Корзина живёт в памяти браузера, поэтому не пропадает при перезагрузке
   и переходе между страницами.
   ========================================================================== */
(function () {
  'use strict';

  var CART_KEY = 'glina-cart';
  var products = window.SHOP_PRODUCTS || [];
  var byId = {};
  products.forEach(function (p) { byId[p.id] = p; });

  /* ================= корзина ================= */

  function readCart() {
    try {
      var raw = localStorage.getItem(CART_KEY);
      var obj = raw ? JSON.parse(raw) : {};
      // выкидываем товары, которых больше нет в каталоге
      Object.keys(obj).forEach(function (id) {
        if (!byId[id] || obj[id] < 1) delete obj[id];
      });
      return obj;
    } catch (e) { return {}; }
  }

  function writeCart(cart) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
    paintCount();
  }

  function cartItems() {
    var cart = readCart();
    return Object.keys(cart).map(function (id) {
      return { p: byId[id], qty: cart[id] };
    });
  }

  function cartTotals() {
    var items = cartItems();
    var count = 0, sum = 0, save = 0;
    items.forEach(function (it) {
      count += it.qty;
      sum += it.p.price * it.qty;
      if (it.p.old) save += (it.p.old - it.p.price) * it.qty;
    });
    return { items: items, count: count, sum: sum, save: save };
  }

  function paintCount() {
    var n = cartTotals().count;
    Array.prototype.forEach.call(document.querySelectorAll('[data-cart-count]'), function (el) {
      el.textContent = n;
      el.hidden = n === 0;
    });
  }

  function addToCart(id, qty) {
    var p = byId[id];
    if (!p || p.stock < 1) return;
    var cart = readCart();
    var next = (cart[id] || 0) + (qty || 1);
    cart[id] = Math.min(next, p.stock);   // больше, чем есть на складе, не даём положить
    writeCart(cart);
  }

  function setQty(id, qty) {
    var cart = readCart();
    if (qty < 1) delete cart[id];
    else cart[id] = Math.min(qty, byId[id].stock);
    writeCart(cart);
  }

  /* ================= разметка карточки ================= */

  function flags(p) {
    var out = '';
    if (p.stock < 1) out += '<span class="flag flag--out">Нет в наличии</span>';
    else if (p.hit) out += '<span class="flag flag--hit">Хит</span>';
    if (p.old && p.stock > 0) out += '<span class="flag flag--sale">−' + Math.round((1 - p.price / p.old) * 100) + '%</span>';
    return out ? '<div class="good__flags">' + out + '</div>' : '';
  }

  function stockLine(p) {
    if (p.stock < 1) return '<p class="good__stock">Закончилась — привезём под заказ</p>';
    if (p.stock <= 3) return '<p class="good__stock is-low">Осталось ' + p.stock + ' шт.</p>';
    return '<p class="good__stock">В наличии</p>';
  }

  function goodCard(p, i) {
    return '<article class="good reveal">' +
      '<div class="good__pic" data-open="' + p.id + '" role="button" tabindex="0" aria-label="Подробнее: ' + p.title + '">' +
        window.shopArt(p.shape, i) + flags(p) +
      '</div>' +
      '<div class="good__body">' +
        '<h3 class="good__title"><button type="button" data-open="' + p.id + '">' + p.title + '</button></h3>' +
        '<p class="good__tag">' + p.tag + '</p>' +
        '<div class="good__foot">' +
          '<span class="good__price">' + window.shopPrice(p.price) +
            (p.old ? '<s class="good__old">' + window.shopPrice(p.old) + '</s>' : '') +
          '</span>' +
          (p.stock > 0
            ? '<button class="btn btn--primary btn--sm" type="button" data-add="' + p.id + '">В корзину</button>'
            : '<button class="btn btn--ghost btn--sm" type="button" disabled>Нет</button>') +
        '</div>' +
        stockLine(p) +
      '</div>' +
    '</article>';
  }

  function renderGoods(box, list) {
    if (!box) return;
    box.innerHTML = list.length
      ? list.map(goodCard).join('')
      : '<p class="empty">По таким условиям ничего не нашлось. Попробуйте убрать часть фильтров.</p>';
    reveal(box);
  }

  /* ================= окно товара ================= */

  var modal, lastFocus;

  function buildModal() {
    modal = document.createElement('div');
    modal.className = 'modal';
    modal.hidden = true;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML =
      '<div class="modal__veil" data-close></div>' +
      '<div class="modal__box">' +
        '<button class="modal__close" type="button" data-close aria-label="Закрыть">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
        '</button>' +
        '<div class="modal__grid"><div class="modal__pic" id="mPic"></div>' +
        '<div class="modal__body" id="mBody"></div></div>' +
      '</div>';
    document.body.appendChild(modal);

    modal.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
    });
  }

  function openModal(id) {
    var p = byId[id];
    if (!p) return;
    if (!modal) buildModal();
    lastFocus = document.activeElement;

    document.getElementById('mPic').innerHTML = window.shopArt(p.shape, products.indexOf(p));
    document.getElementById('mBody').innerHTML =
      '<h3>' + p.title + '</h3>' +
      '<p class="modal__tag">' + p.tag + '</p>' +
      '<p class="modal__about">' + p.about + '</p>' +
      '<p class="modal__price"><b>' + window.shopPrice(p.price) + '</b>' +
        (p.old ? '<s>' + window.shopPrice(p.old) + '</s>' : '') + '</p>' +
      '<p class="modal__stock">' + (p.stock > 0
        ? 'В наличии: ' + p.stock + ' шт. Отправим завтра, если заказать до 18:00.'
        : 'Сейчас закончилась. Повторный обжиг — примерно две недели.') + '</p>' +
      (p.stock > 0
        ? '<div class="modal__buy">' +
            '<div class="qty">' +
              '<button type="button" data-q="-" aria-label="Меньше">−</button>' +
              '<span id="mQty">1</span>' +
              '<button type="button" data-q="+" aria-label="Больше">+</button>' +
            '</div>' +
            '<button class="btn btn--primary" type="button" data-addm="' + p.id + '">Добавить в корзину</button>' +
          '</div>'
        : '<button class="btn btn--ghost" type="button" disabled>Нет в наличии</button>');

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    modal.querySelector('.modal__close').focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* ================= общие обработчики ================= */

  document.addEventListener('click', function (e) {
    var open = e.target.closest('[data-open]');
    if (open) { openModal(open.getAttribute('data-open')); return; }

    var add = e.target.closest('[data-add]');
    if (add) {
      addToCart(add.getAttribute('data-add'), 1);
      flash(add, 'Добавлено');
      return;
    }

    var addm = e.target.closest('[data-addm]');
    if (addm) {
      var q = parseInt(document.getElementById('mQty').textContent, 10) || 1;
      addToCart(addm.getAttribute('data-addm'), q);
      flash(addm, 'Добавлено');
      return;
    }

    var q = e.target.closest('[data-q]');
    if (q) {
      var out = document.getElementById('mQty');
      var v = parseInt(out.textContent, 10) || 1;
      out.textContent = Math.max(1, v + (q.getAttribute('data-q') === '+' ? 1 : -1));
      return;
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var pic = e.target.closest('.good__pic[data-open]');
    if (pic) { e.preventDefault(); openModal(pic.getAttribute('data-open')); }
  });

  /* короткое подтверждение прямо на кнопке */
  function flash(btn, text) {
    if (btn.dataset.busy) return;
    var old = btn.textContent;
    btn.dataset.busy = '1';
    btn.textContent = text;
    setTimeout(function () {
      btn.textContent = old;
      delete btn.dataset.busy;
    }, 1100);
  }

  /* ================= появление блоков ================= */

  function reveal(scope) {
    var items = (scope || document).querySelectorAll('.reveal:not(.is-in)');
    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(items, function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    Array.prototype.forEach.call(items, function (el) { io.observe(el); });
  }

  /* ================= шапка: тема и меню ================= */

  var root = document.documentElement;
  try {
    var saved = localStorage.getItem('glina-theme');
    if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved);
  } catch (e) {}

  function isDark() {
    var a = root.getAttribute('data-theme');
    if (a === 'dark') return true;
    if (a === 'light') return false;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  var themeBtn = document.getElementById('themeBtn');
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('glina-theme', next); } catch (e) {}
  });

  var burger = document.getElementById('burger'), menu = document.getElementById('menu');
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
  }

  var head = document.getElementById('head');
  if (head) {
    var onScroll = function () { head.classList.toggle('is-stuck', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ================= наружу ================= */
  window.GLINA = {
    products: products, byId: byId,
    readCart: readCart, writeCart: writeCart, setQty: setQty,
    cartItems: cartItems, cartTotals: cartTotals,
    renderGoods: renderGoods, reveal: reveal, paintCount: paintCount,
    openModal: openModal
  };

  paintCount();
  reveal();
})();
