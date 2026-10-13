/* МЕРИДИАН — приложение агентства: подбор квартир с планировками, избранное
   и сравнение, ипотечный калькулятор, запись на просмотр. Всё хранится на устройстве. */
(function () {
  'use strict';
  var A = window.App, S = A.store, $ = function (id) { return document.getElementById(id); };

  // Планировки: комнаты [x, y, ширина, высота, подпись, площадь] в условных единицах
  var FLATS = [
    { id: 1, rooms: 2, name: 'Евродвушка', area: 52.4, kitchen: 18.6, floor: 5, floors: 12, price: 8.9, place: 'Центр, ЖК «Липовый сквер»', year: 'сдан в 2019', ready: true, finish: 'с ремонтом', bath: 'раздельный',
      text: 'Кухня-гостиная с двумя окнами и спальня во двор. Ремонт 2023 года, кухонный гарнитур остаётся.',
      plan: { w: 200, h: 130, r: [[0, 0, 120, 80, 'Кухня-гостиная', '18,6'], [120, 0, 80, 80, 'Спальня', '13,2'], [0, 80, 90, 50, 'Прихожая', '7,4'], [90, 80, 50, 50, 'С/у', '4,1'], [140, 80, 60, 50, 'Гардероб', '3,6']] } },
    { id: 2, rooms: 0, name: 'Студия', area: 26, kitchen: null, floor: 14, floors: 24, price: 4.3, place: 'Север, у делового центра', year: 'сдан в 2021', ready: true, finish: 'с мебелью', bath: 'совмещённый',
      text: 'Продаётся с мебелью и техникой. До делового центра 5 минут пешком — удобно и для жизни, и для сдачи.',
      plan: { w: 140, h: 130, r: [[0, 0, 140, 85, 'Студия', '17,8'], [0, 85, 80, 45, 'Прихожая', '4,6'], [80, 85, 60, 45, 'С/у', '3,6']] } },
    { id: 3, rooms: 1, name: '1-к квартира', area: 41, kitchen: 11.2, floor: 9, floors: 17, price: 5.6, place: 'Север, ЖК «Северная гавань»', year: 'сдача IV кв. 2027', ready: false, finish: 'предчистовая', bath: 'совмещённый',
      text: 'Предчистовая отделка: стены выровнены, стяжка готова. Застройщик предлагает рассрочку до сдачи дома.',
      plan: { w: 180, h: 130, r: [[0, 0, 75, 70, 'Кухня', '11,2'], [75, 0, 105, 80, 'Комната', '17,6'], [0, 70, 75, 60, 'Прихожая', '6,3'], [75, 80, 50, 50, 'С/у', '3,9'], [125, 80, 55, 50, 'Кладовая', '2,0']] } },
    { id: 4, rooms: 3, name: '3-к квартира', area: 78, kitchen: 12.4, floor: 3, floors: 9, price: 11.7, place: 'Запад, школа во дворе', year: 'сдан в 2012', ready: true, finish: 'хороший ремонт', bath: 'раздельный',
      text: 'Три изолированные комнаты, две лоджии и тихий двор со школой и детским садом.',
      plan: { w: 200, h: 140, r: [[0, 0, 80, 80, 'Гостиная', '19,8'], [80, 0, 60, 55, 'Кухня', '12,4'], [140, 0, 60, 80, 'Спальня', '14,6'], [0, 80, 80, 60, 'Детская', '12,1'], [80, 55, 60, 85, 'Холл', '10,2'], [140, 80, 30, 60, 'С/у', '1,9'], [170, 80, 30, 60, 'Ванна', '3,4']] } },
    { id: 5, rooms: 2, name: 'Евродвушка', area: 38, kitchen: 14.5, floor: 7, floors: 16, price: 5.9, place: 'Восток, рядом с университетом', year: 'сдан в 2020', ready: true, finish: 'ремонт 2024', bath: 'совмещённый',
      text: 'Компактная евродвушка со свежим ремонтом — подходит для жизни и для долгосрочной сдачи.',
      plan: { w: 170, h: 130, r: [[0, 0, 100, 75, 'Кухня-гостиная', '14,5'], [100, 0, 70, 75, 'Спальня', '10,8'], [0, 75, 95, 55, 'Прихожая', '6,9'], [95, 75, 75, 55, 'С/у', '4,2']] } },
    { id: 6, rooms: 2, name: '2-к квартира', area: 61, kitchen: 12.8, floor: 5, floors: 20, price: 8.1, place: 'Юг, ЖК «Солнечный берег»', year: 'сдача II кв. 2027', ready: false, finish: 'без отделки', bath: 'раздельный',
      text: 'Вид на реку из гостиной и спальни. До сдачи дома — рассрочка от застройщика.',
      plan: { w: 200, h: 130, r: [[0, 0, 70, 70, 'Кухня', '12,8'], [70, 0, 70, 80, 'Гостиная', '17,9'], [140, 0, 60, 80, 'Спальня', '14,2'], [0, 70, 70, 60, 'Прихожая', '8,1'], [70, 80, 40, 50, 'С/у', '1,8'], [110, 80, 30, 50, 'Ванна', '3,5'], [140, 80, 60, 50, 'Гардероб', '2,7']] } },
    { id: 7, rooms: 0, name: 'Студия', area: 31, kitchen: null, floor: 12, floors: 17, price: 4.6, place: 'Север, ЖК «Северная гавань»', year: 'сдача IV кв. 2027', ready: false, finish: 'предчистовая', bath: 'совмещённый',
      text: 'Студия с нишей под кухню и окном в пол. Хороший старт для первой собственной квартиры.',
      plan: { w: 150, h: 130, r: [[0, 0, 150, 80, 'Студия', '21,4'], [0, 80, 90, 50, 'Прихожая', '5,8'], [90, 80, 60, 50, 'С/у', '3,8']] } },
    { id: 8, rooms: 1, name: '1-к квартира', area: 44, kitchen: 13, floor: 6, floors: 10, price: 6.2, place: 'Восток, у парка', year: 'сдан в 2022', ready: true, finish: 'с ремонтом', bath: 'совмещённый',
      text: 'Окна на парк, кухня 13 м² и кладовая в прихожей. Закрытый двор без машин.',
      plan: { w: 180, h: 130, r: [[0, 0, 95, 80, 'Комната', '18,2'], [95, 0, 85, 65, 'Кухня', '13,0'], [0, 80, 110, 50, 'Прихожая', '8,4'], [110, 65, 70, 65, 'С/у', '4,4']] } }
  ];
  var ROOMS = [['all', 'Все'], ['0', 'Студии'], ['1', '1К'], ['2', '2К'], ['3', '3К']];
  var SORTS = [['price', 'Сначала дешевле'], ['area', 'Сначала просторнее'], ['ppm', 'Дешевле за м²']];
  var TIMES = ['10:00', '12:00', '14:30', '17:00', '19:00'];
  var today = A.today;

  function byId(id) { return FLATS.filter(function (f) { return f.id === id; })[0]; }
  function mln(v) { return String(Math.round(v * 10) / 10).replace('.', ',') + ' млн ₽'; }
  function num(v) { return String(v).replace('.', ','); }
  function ppm(f) { return f.price * 1e6 / f.area; }

  var state = {
    fav: S.get('fav', [1, 3, 6]),
    req: S.get('req', [{ flat: 6, date: A.addDays(today, 3).toISOString(), time: '12:00', status: 'ok' }]),
    mort: S.get('mort', { price: 8.9, first: 20, term: 20, rate: 14 })
  };
  function save() { S.set('fav', state.fav); S.set('req', state.req); S.set('mort', state.mort); }
  function isFav(id) { return state.fav.indexOf(id) >= 0; }

  /* ---------- Планировка ---------- */
  function planSvg(f, labels) {
    var p = f.plan, pad = 6;
    var s = '<svg viewBox="' + (-pad) + ' ' + (-pad) + ' ' + (p.w + pad * 2) + ' ' + (p.h + pad * 2) + '" aria-hidden="true">';
    p.r.forEach(function (r) {
      s += '<rect class="room" x="' + r[0] + '" y="' + r[1] + '" width="' + r[2] + '" height="' + r[3] + '"/>';
      // Окна на наружных стенах сверху
      if (r[1] === 0 && r[2] > 40) s += '<path class="win" d="M' + (r[0] + r[2] * .3) + ' 0H' + (r[0] + r[2] * .7) + '"/>';
      if (labels) {
        var cx = r[0] + r[2] / 2, cy = r[1] + r[3] / 2, small = r[2] < 56;
        var name = small && r[4].length > 6 ? r[4].slice(0, 5) + '.' : r[4];
        s += '<text class="room-l" x="' + cx + '" y="' + (cy - 1) + '">' + name + '</text><text class="room-a" x="' + cx + '" y="' + (cy + 8) + '">' + r[5] + ' м²</text>';
      }
    });
    s += '<rect class="wall" x="0" y="0" width="' + p.w + '" height="' + p.h + '"/>';
    // Входная дверь — дуга в прихожей
    var hall = p.r.filter(function (r) { return /Прихожая|Холл/.test(r[4]); })[0];
    if (hall) s += '<path class="door" d="M' + (hall[0] + 10) + ' ' + p.h + 'a14 14 0 0 1 14 -14"/>';
    return s + '</svg>';
  }

  /* ---------- Подбор ---------- */
  var rooms = A.q.get('rooms') || 'all', budget = +A.q.get('budget') || 12, sort = 0;
  function card(f) {
    return '<li><div class="flat" role="button" tabindex="0" data-flat="' + f.id + '">' +
      '<div class="flat__pic">' + planSvg(f, false) + '<span class="flat__tag">' + (f.ready ? 'готовая' : 'новостройка') + '</span></div>' +
      '<div><p class="flat__t">' + f.name + ', ' + num(f.area) + ' м²</p><p class="flat__p">' + f.place + '</p>' +
      '<p class="flat__f">' + f.floor + '/' + f.floors + ' эт. · ' + f.finish + '</p>' +
      '<p class="flat__price"><b>' + mln(f.price) + '</b><span>' + A.money(ppm(f)).replace(/ ₽$/, '') + ' ₽/м²</span></p></div>' +
      '<button class="fav' + (isFav(f.id) ? ' is-on' : '') + '" type="button" data-fav="' + f.id + '" aria-pressed="' + isFav(f.id) + '" aria-label="' + (isFav(f.id) ? 'Убрать из избранного' : 'В избранное') + '"><svg><use href="' + (isFav(f.id) ? '#i-heart-f' : '#i-heart') + '"/></svg></button></div></li>';
  }
  function setRangeFill(el) { el.style.setProperty('--p', ((el.value - el.min) / (el.max - el.min) * 100) + '%'); }
  function renderSearch() {
    $('rooms').innerHTML = ROOMS.map(function (r) {
      return '<button class="chip' + (rooms === r[0] ? ' is-on' : '') + '" type="button" aria-pressed="' + (rooms === r[0]) + '" data-rooms="' + r[0] + '">' + r[1] + '</button>';
    }).join('');
    $('budget').value = budget; setRangeFill($('budget'));
    $('budget-out').textContent = budget >= 12 ? 'любой' : 'до ' + mln(budget);
    $('sort-label').textContent = SORTS[sort][1];
    var list = FLATS.filter(function (f) { return (rooms === 'all' || String(f.rooms) === rooms) && (budget >= 12 || f.price <= budget); });
    var k = SORTS[sort][0];
    list.sort(function (a, b) { return k === 'price' ? a.price - b.price : k === 'area' ? b.area - a.area : ppm(a) - ppm(b); });
    $('found').textContent = list.length + ' ' + A.plural(list.length, 'квартира', 'квартиры', 'квартир');
    $('flats').innerHTML = list.length ? list.map(card).join('') :
      '<li class="empty"><svg><use href="#i-search"/></svg>Под эти условия ничего нет.<br>Увеличьте бюджет или выберите другое число комнат.</li>';
  }
  $('budget').addEventListener('input', function () { budget = +this.value; renderSearch(); });
  $('sort').addEventListener('click', function () { sort = (sort + 1) % SORTS.length; renderSearch(); });

  /* ---------- Квартира ---------- */
  var flatId = +(A.q.get('flat') || 1);
  function payment(price, first, term, rate) {
    var credit = price * 1e6 * (1 - first / 100), r = rate / 1200, n = term * 12;
    var p = r ? credit * r / (1 - Math.pow(1 + r, -n)) : credit / n;
    return { pay: p, credit: credit, over: p * n - credit };
  }
  function renderFlat() {
    var f = byId(flatId);
    $('flat-plan').innerHTML = '<div class="plan__top"><span>План · М 1:100</span><span>' + num(f.area) + ' м²</span></div>' + planSvg(f, true);
    $('flat-eyebrow').textContent = (f.ready ? 'Готовое жильё' : 'Новостройка') + ' · ' + f.year;
    $('flat-title').textContent = f.name + ', ' + num(f.area) + ' м²';
    $('flat-addr').textContent = f.place;
    $('flat-price').textContent = mln(f.price);
    $('flat-ppm').textContent = A.money(ppm(f)) + ' за м²';
    var m = payment(f.price, 20, 20, state.mort.rate);
    $('flat-mort-text').innerHTML = 'Ипотека от <b>' + A.money(m.pay) + '</b> в месяц';
    var P = [['Площадь', num(f.area) + ' м²'], [f.kitchen ? 'Кухня' : 'Планировка', f.kitchen ? num(f.kitchen) + ' м²' : 'студия'], ['Этаж', f.floor + ' из ' + f.floors], ['Дом', f.year], ['Отделка', f.finish], ['Санузел', f.bath]];
    $('flat-params').innerHTML = P.map(function (p) { return '<div><dt>' + p[0] + '</dt><dd>' + p[1] + '</dd></div>'; }).join('');
    $('flat-text').textContent = f.text;
    var fav = $('flat-fav');
    fav.classList.toggle('is-on', isFav(f.id));
    fav.setAttribute('aria-pressed', isFav(f.id));
    fav.innerHTML = '<svg><use href="' + (isFav(f.id) ? '#i-heart-f' : '#i-heart') + '"/></svg>';
  }
  $('flat-fav').addEventListener('click', function () { toggleFav(flatId); });
  $('flat-mort').addEventListener('click', function () { state.mort.price = byId(flatId).price; save(); renderMort(); A.show('mort'); });
  $('flat-view').addEventListener('click', function () { openView(flatId); });

  /* ---------- Избранное ---------- */
  function toggleFav(id) {
    var on = isFav(id);
    state.fav = on ? state.fav.filter(function (x) { return x !== id; }) : state.fav.concat(id);
    save(); renderSearch(); renderFav(); renderFlat();
    A.toast(on ? 'Убрали из избранного' : 'Добавили в избранное');
  }
  function renderFav() {
    var list = state.fav.map(byId).filter(Boolean);
    $('fav-count').hidden = !list.length;
    $('fav-count').textContent = list.length;
    $('fav-sum').textContent = list.length ? list.length + ' ' + A.plural(list.length, 'квартира', 'квартиры', 'квартир') : 'Пока пусто';
    if (!list.length) { $('fav-box').innerHTML = '<p class="empty"><svg><use href="#i-heart"/></svg>Нажмите на&nbsp;сердечко у&nbsp;квартиры — она появится здесь, и&nbsp;её можно будет сравнить с&nbsp;другими.</p>'; return; }
    var html = '';
    if (list.length > 1) {
      var minP = Math.min.apply(null, list.map(function (f) { return f.price; }));
      var minM = Math.min.apply(null, list.map(ppm));
      var maxA = Math.max.apply(null, list.map(function (f) { return f.area; }));
      var maxK = Math.max.apply(null, list.map(function (f) { return f.kitchen || 0; }));
      var row = function (label, fn, best) {
        return '<tr><th scope="row">' + label + '</th>' + list.map(function (f) { return '<td' + (best && best(f) ? ' class="best"' : '') + '>' + fn(f) + '</td>'; }).join('') + '</tr>';
      };
      html += '<h2 class="sect">Сравнение</h2><div class="compare"><table><thead><tr><th scope="col"><span class="sr">Параметр</span></th>' +
        list.map(function (f) { return '<th scope="col"><button class="cmp-h" type="button" data-flat="' + f.id + '" style="border:0;background:none;color:inherit;padding:0;text-align:left">' + planSvg(f, false) + '<b>' + f.name + '</b></button></th>'; }).join('') + '</tr></thead><tbody>' +
        row('Цена', function (f) { return mln(f.price); }, function (f) { return f.price === minP; }) +
        row('За м²', function (f) { return A.money(ppm(f)); }, function (f) { return ppm(f) === minM; }) +
        row('Площадь', function (f) { return num(f.area) + ' м²'; }, function (f) { return f.area === maxA; }) +
        row('Кухня', function (f) { return f.kitchen ? num(f.kitchen) + ' м²' : '—'; }, function (f) { return f.kitchen && f.kitchen === maxK; }) +
        row('Этаж', function (f) { return f.floor + '/' + f.floors; }) +
        row('Дом', function (f) { return f.year; }) +
        row('Отделка', function (f) { return f.finish; }) +
        '</tbody></table></div><p class="compare__note">Зелёным — лучшее значение в строке.</p>';
    }
    html += '<h2 class="sect">Все сохранённые</h2><ul class="flats">' + list.map(card).join('') + '</ul>';
    $('fav-box').innerHTML = html;
  }

  /* ---------- Ипотека ---------- */
  function renderMort() {
    var m = state.mort, r = payment(m.price, m.first, m.term, m.rate);
    $('m-price').value = m.price; $('m-first').value = m.first; $('m-term').value = m.term; if (document.activeElement !== $('m-rate')) $('m-rate').value = num(m.rate);
    ['m-price', 'm-first', 'm-term'].forEach(function (id) { setRangeFill($(id)); });
    $('o-price').textContent = mln(m.price);
    $('o-first').textContent = m.first + '% · ' + mln(m.price * m.first / 100);
    $('o-term').textContent = m.term + ' ' + A.plural(m.term, 'год', 'года', 'лет');
    $('m-pay').textContent = A.money(r.pay);
    $('m-credit').textContent = mln(r.credit / 1e6);
    $('m-over').textContent = mln(r.over / 1e6);
    $('donut-fg').style.strokeDasharray = (r.credit / (r.credit + r.over) * 100).toFixed(1) + ' 100';
  }
  ['m-price', 'm-first', 'm-term'].forEach(function (id) {
    $(id).addEventListener('input', function () {
      state.mort[{ 'm-price': 'price', 'm-first': 'first', 'm-term': 'term' }[id]] = +this.value; save(); renderMort();
    });
  });
  $('m-rate').addEventListener('input', function () {
    var v = parseFloat(String(this.value).replace(',', '.'));
    if (isNaN(v)) return;
    state.mort.rate = Math.min(40, Math.max(1, v)); save();
    var r = payment(state.mort.price, state.mort.first, state.mort.term, state.mort.rate);
    $('m-pay').textContent = A.money(r.pay); $('m-credit').textContent = mln(r.credit / 1e6); $('m-over').textContent = mln(r.over / 1e6);
    $('donut-fg').style.strokeDasharray = (r.credit / (r.credit + r.over) * 100).toFixed(1) + ' 100';
  });
  $('m-rate').addEventListener('change', renderMort);
  $('m-match').addEventListener('click', function () {
    budget = Math.min(12, Math.max(4, Math.ceil(state.mort.price * 2) / 2)); rooms = 'all';
    renderSearch(); A.show('search', { root: true });
    A.toast('Показываем квартиры до ' + mln(budget));
  });

  /* ---------- Просмотр ---------- */
  var view = { flat: null, day: null, time: null };
  function openView(id) {
    var f = byId(id);
    if (view.flat !== id) { view = { flat: id, day: 0, time: '12:00' }; }
    $('view-title').textContent = f.name + ', ' + num(f.area) + ' м² · ' + f.place.split(',')[0];
    var days = '';
    for (var i = 1; i <= 6; i++) {
      var d = A.addDays(today, i), sun = d.getDay() === 0;
      days += '<button class="slot" type="button" role="radio" aria-checked="' + (view.day === i - 1) + '" data-vday="' + (i - 1) + '"' + (sun ? ' disabled title="Выходной"' : '') + '><small>' + A.DAYS[d.getDay()] + '</small>' + d.getDate() + '</button>';
    }
    $('v-days').innerHTML = days;
    if (A.addDays(today, view.day + 1).getDay() === 0) { view.day++; return openView(id); }
    $('v-times').innerHTML = TIMES.map(function (t) {
      return '<button class="slot" type="button" role="radio" aria-checked="' + (view.time === t) + '" data-vtime="' + t + '">' + t + '</button>';
    }).join('');
    $('v-err').textContent = '';
    if (A.isStatic && !$('v-name').value) { $('v-name').value = 'Анна'; }
    A.sheet('view');
  }
  document.addEventListener('click', function (e) {
    var d = e.target.closest('[data-vday]'), t = e.target.closest('[data-vtime]');
    if (d) { view.day = +d.getAttribute('data-vday'); [].forEach.call(document.querySelectorAll('[data-vday]'), function (b) { b.setAttribute('aria-checked', b === d); }); }
    if (t) { view.time = t.getAttribute('data-vtime'); [].forEach.call(document.querySelectorAll('[data-vtime]'), function (b) { b.setAttribute('aria-checked', b === t); }); }
  });
  // Маска телефона: +7 (___) ___-__-__
  $('v-phone').addEventListener('input', function () {
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
  $('view-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('v-name').value.trim(), digits = $('v-phone').value.replace(/\D/g, ''), err = '', bad = null;
    $('v-name').setAttribute('aria-invalid', 'false'); $('v-phone').setAttribute('aria-invalid', 'false');
    if (name.length < 2) { err = 'Напишите, как к вам обращаться'; bad = $('v-name'); }
    else if (digits.length !== 11) { err = 'Проверьте номер: нужно 10 цифр после +7'; bad = $('v-phone'); }
    else if (!$('v-agree').checked) { err = 'Нужно согласие на обработку данных — без него агент не сможет перезвонить'; bad = $('v-agree'); }
    $('v-err').textContent = err;
    if (bad) { if (bad.tagName === 'INPUT' && bad.type !== 'checkbox') bad.setAttribute('aria-invalid', 'true'); bad.focus(); return; }
    state.req.unshift({ flat: view.flat, date: A.addDays(today, view.day + 1).toISOString(), time: view.time, status: 'wait', name: name, phone: $('v-phone').value });
    save(); A.close(true); renderReq(); A.show('req', { root: true });
    A.toast('Заявка у агента — он перезвонит в течение часа');
  });

  /* ---------- Заявки ---------- */
  function renderReq() {
    $('reqs').innerHTML = state.req.length ? state.req.map(function (r, i) {
      var f = byId(r.flat), d = new Date(r.date);
      return '<li class="req"><div class="req__top"><span class="req__when"><svg><use href="#i-cal"/></svg>' + A.DAYS[d.getDay()] + ', ' + d.getDate() + ' ' + A.MONTHS[d.getMonth()] + ' · ' + r.time + '</span>' +
        '<span class="pill' + (r.status === 'ok' ? ' pill--ok' : '') + '">' + (r.status === 'ok' ? 'Подтверждено' : 'Ждёт агента') + '</span></div>' +
        '<button class="req__flat" type="button" data-flat="' + f.id + '">' + f.name + ', ' + num(f.area) + ' м²<span>' + f.place + ' · ' + mln(f.price) + '</span></button>' +
        '<div class="req__foot"><span>Агент — Олег Воронин</span><button class="req__cancel" type="button" data-rcancel="' + i + '">Отменить</button></div></li>';
    }).join('') : '<li class="empty"><svg><use href="#i-key"/></svg>Заявок пока нет. Откройте квартиру и&nbsp;запишитесь на&nbsp;просмотр — это бесплатно.</li>';
  }

  /* ---------- Клики ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-fav],[data-flat],[data-rooms],[data-rcancel]');
    if (!t) return;
    if (t.hasAttribute('data-fav')) { e.stopPropagation(); toggleFav(+t.getAttribute('data-fav')); }
    else if (t.hasAttribute('data-flat')) { flatId = +t.getAttribute('data-flat'); renderFlat(); A.show('flat'); }
    else if (t.hasAttribute('data-rooms')) { rooms = t.getAttribute('data-rooms'); renderSearch(); }
    else if (t.hasAttribute('data-rcancel')) { state.req.splice(+t.getAttribute('data-rcancel'), 1); save(); renderReq(); A.toast('Заявка отменена'); }
  });
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('.flat[data-flat]')) { e.preventDefault(); e.target.click(); }
  });
  // Политика из формы возвращает обратно в форму
  var backToView = false;
  document.addEventListener('click', function (e) { if (e.target.closest('#view-form [data-sheet="privacy"]')) backToView = true; }, true);
  $('priv-ok').addEventListener('click', function () { if (backToView) { backToView = false; A.sheet('view'); } else A.close(); });
  document.addEventListener('sheet', function (e) { if (e.detail === 'view' && view.flat === null) openView(flatId); });

  $('kit-flat').innerHTML = card(byId(3));
  renderSearch(); renderFlat(); renderFav(); renderMort(); renderReq();
  A.start('search');
})();
