/* ==========================================================================
   КЕДРОН — калькулятор стоимости дома.
   Шесть шагов, затем расчёт с разбивкой по статьям.
   Все расценки собраны в PRICES: чтобы обновить прайс, правится только он.
   ========================================================================== */
(function () {
  'use strict';

  var calc = document.querySelector('.calc');
  if (!calc) return;

  /* ---------- расценки ---------- */
  var PRICES = {
    // рублей за м² общей площади по комплектациям
    perM2: {
      frame:  { shell: 40000, comfort: 46000, turnkey: 52000 },
      module: { shell: 43000, comfort: 49000, turnkey: 55000 }
    },
    // два этажа дешевле на квадрат: одна крыша и один фундамент на вдвое большую площадь
    twoFloorFactor: 0.95,
    // рублей за м² пятна застройки
    base: { pile: 4500, strip: 7800, slab: 9900 },
    extras: {
      terrace: { title: 'Терраса 12 м²', sum: 168000 },
      carport: { title: 'Навес для машины', sum: 145000 },
      septic:  { title: 'Септик', sum: 132000 },
      well:    { title: 'Скважина', sum: 168000 },
      floor:   { title: 'Тёплый пол', perFootprint: 2300 },
      boiler:  { title: 'Котёл и разводка отопления', sum: 245000 }
    },
    packTitle: { shell: 'Тёплый контур', comfort: 'Комфорт', turnkey: 'Под ключ' },
    typeTitle: { frame: 'Каркасный дом', module: 'Модульный дом' },
    baseTitle: { pile: 'Свайно-винтовой фундамент', strip: 'Ленточный фундамент', slab: 'Монолитная плита' }
  };

  var state = { type: 'frame', area: 96, floors: 1, pack: 'comfort', base: 'pile', extras: [] };

  var steps = calc.querySelectorAll('.calc__step');
  var bar = document.getElementById('bar');
  var LAST = steps.length;           // последний экран — результат
  var current = 1;

  /* ---------- переходы между экранами ---------- */
  function show(n) {
    current = Math.min(Math.max(n, 1), LAST);
    Array.prototype.forEach.call(steps, function (s) {
      s.classList.toggle('is-on', Number(s.getAttribute('data-step')) === current);
    });
    bar.style.width = Math.round(((current - 1) / (LAST - 1)) * 100) + '%';
    if (current === LAST) render();
    var top = calc.getBoundingClientRect().top + window.scrollY - 100;
    if (window.scrollY > top) window.scrollTo({ top: top, behavior: 'smooth' });
  }

  /* ---------- выбор варианта ---------- */
  Array.prototype.forEach.call(calc.querySelectorAll('.opt[data-key]'), function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-key');
      var val = btn.getAttribute('data-value');
      state[key] = (key === 'floors') ? parseInt(val, 10) : val;

      var group = btn.parentNode;
      Array.prototype.forEach.call(group.querySelectorAll('.opt'), function (b) {
        b.classList.toggle('is-picked', b === btn);
      });

      setTimeout(function () { show(current + 1); }, 180);
    });
  });

  /* ---------- дополнительные работы: можно выбрать несколько ---------- */
  Array.prototype.forEach.call(calc.querySelectorAll('.opt[data-extra]'), function (btn) {
    btn.setAttribute('aria-pressed', 'false');
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-extra');
      var i = state.extras.indexOf(key);
      if (i === -1) state.extras.push(key); else state.extras.splice(i, 1);
      var on = state.extras.indexOf(key) !== -1;
      btn.classList.toggle('is-picked', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  });

  /* ---------- площадь ---------- */
  var area = document.getElementById('area');
  var areaOut = document.getElementById('areaOut');
  var areaHint = document.getElementById('areaHint');

  function hintFor(v) {
    if (v < 50) return 'Дом для одного-двух человек или для сезонного проживания';
    if (v < 80) return 'Дом для семьи из 2–3 человек';
    if (v < 110) return 'Дом для семьи из 3–4 человек';
    return 'Большой дом: 4–5 человек, кабинет и гостевая комната';
  }

  function syncArea() {
    state.area = parseInt(area.value, 10);
    areaOut.textContent = state.area + ' м²';
    areaHint.textContent = hintFor(state.area);
  }
  area.addEventListener('input', syncArea);
  syncArea();

  /* ---------- кнопки «назад» и «дальше» ---------- */
  Array.prototype.forEach.call(calc.querySelectorAll('[data-next]'), function (b) {
    b.addEventListener('click', function () { show(current + 1); });
  });
  Array.prototype.forEach.call(calc.querySelectorAll('[data-back]'), function (b) {
    b.addEventListener('click', function () { show(current - 1); });
  });

  /* ---------- расчёт ---------- */
  function compute() {
    var perM2 = PRICES.perM2[state.type][state.pack];
    if (state.floors === 2) perM2 = Math.round(perM2 * PRICES.twoFloorFactor);

    var box = perM2 * state.area;
    var footprint = state.floors === 2 ? Math.round(state.area / 2) : state.area;
    var base = PRICES.base[state.base] * footprint;

    var rows = [];
    var extrasSum = 0;
    state.extras.forEach(function (k) {
      var e = PRICES.extras[k];
      if (!e) return;
      var sum = e.sum ? e.sum : e.perFootprint * footprint;
      extrasSum += sum;
      rows.push({ title: e.title, sum: sum });
    });

    // срок: модульный собирается на заводе, поэтому почти не зависит от площади
    var days = state.type === 'module'
      ? 18 + state.area * 0.22
      : 30 + state.area * 0.45;
    days *= (state.pack === 'shell' ? 0.75 : state.pack === 'comfort' ? 0.9 : 1);
    if (state.floors === 2) days *= 1.1;
    days = Math.round(days / 5) * 5;

    return {
      box: box, base: base, extrasSum: extrasSum, rows: rows,
      total: box + base + extrasSum,
      perM2: perM2, footprint: footprint, days: days
    };
  }

  function dayWord(n) {
    var n10 = n % 10, n100 = n % 100;
    if (n10 === 1 && n100 !== 11) return 'день';
    if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return 'дня';
    return 'дней';
  }

  function render() {
    var r = compute();
    var money = window.kedronPrice;

    document.getElementById('total').textContent = money(r.total);
    document.getElementById('totalNote').textContent =
      PRICES.typeTitle[state.type] + ' · ' + state.area + ' м² · ' +
      (state.floors === 2 ? 'два этажа' : 'один этаж') + ' · комплектация «' +
      PRICES.packTitle[state.pack] + '» · срок около ' + r.days + ' ' + dayWord(r.days);

    var html = '';
    html += row('Дом, комплектация «' + PRICES.packTitle[state.pack] + '»',
                money(r.box) + ' · ' + money(r.perM2) + '/м²');
    html += row(PRICES.baseTitle[state.base] + ', пятно ' + r.footprint + ' м²', money(r.base));
    r.rows.forEach(function (x) { html += row(x.title, money(x.sum)); });
    html += row('Итого', money(r.total));

    document.getElementById('break').innerHTML = html;
  }

  function row(a, b) {
    return '<div><span>' + a + '</span><span>' + b + '</span></div>';
  }

  /* ---------- посчитать заново ---------- */
  document.getElementById('again').addEventListener('click', function () {
    state.extras = [];
    Array.prototype.forEach.call(calc.querySelectorAll('.opt'), function (b) {
      b.classList.remove('is-picked');
      if (b.hasAttribute('data-extra')) b.setAttribute('aria-pressed', 'false');
    });
    var form = document.getElementById('calcForm');
    var ok = document.getElementById('calcOk');
    form.reset();
    form.style.display = '';
    ok.classList.remove('is-on');
    show(1);
  });

  show(1);
})();
