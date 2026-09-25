/* ==========================================================================
   КЕДРОН — фильтры и сортировка каталога проектов.
   Работает без перезагрузки страницы; выбранные фильтры видны в адресе,
   поэтому ссылку на отфильтрованный каталог можно отправить клиенту.
   ========================================================================== */
(function () {
  'use strict';

  var list = document.getElementById('list');
  if (!list || !window.KEDRON_PROJECTS) return;

  var form = document.getElementById('filters');
  var count = document.getElementById('count');
  var reset = document.getElementById('reset');

  var f = {
    type: document.getElementById('f-type'),
    area: document.getElementById('f-area'),
    floors: document.getElementById('f-floors'),
    price: document.getElementById('f-price'),
    sort: document.getElementById('f-sort')
  };

  /* «50-80» -> [50, 80] */
  function range(v) {
    var p = v.split('-');
    return [parseFloat(p[0]), parseFloat(p[1])];
  }

  function plural(n, one, few, many) {
    var n10 = n % 10, n100 = n % 100;
    if (n10 === 1 && n100 !== 11) return one;
    if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return few;
    return many;
  }

  function apply() {
    var items = window.KEDRON_PROJECTS.slice();

    if (f.type.value !== 'all') {
      items = items.filter(function (p) { return p.type === f.type.value; });
    }
    if (f.area.value !== 'all') {
      var a = range(f.area.value);
      items = items.filter(function (p) { return p.area >= a[0] && p.area <= a[1]; });
    }
    if (f.floors.value !== 'all') {
      var fl = parseInt(f.floors.value, 10);
      items = items.filter(function (p) { return p.floors === fl; });
    }
    if (f.price.value !== 'all') {
      var pr = range(f.price.value);
      items = items.filter(function (p) { return p.price >= pr[0] && p.price <= pr[1]; });
    }

    if (f.sort.value === 'cheap') items.sort(function (a, b) { return a.price - b.price; });
    else if (f.sort.value === 'rich') items.sort(function (a, b) { return b.price - a.price; });
    else if (f.sort.value === 'fast') items.sort(function (a, b) { return a.days - b.days; });
    else items.sort(function (a, b) { return (b.hit ? 1 : 0) - (a.hit ? 1 : 0); });

    if (items.length) {
      list.innerHTML = items.map(window.kedronCard).join('');
      window.kedronReveal(list);
    } else {
      list.innerHTML = '<p class="empty">Под такие условия готового проекта нет. ' +
        'Попробуйте расширить бюджет или площадь — либо ' +
        '<a href="contacts.html" style="color:var(--brand)">закажите индивидуальный расчёт</a>.</p>';
    }

    count.innerHTML = 'Показано <b>' + items.length + '</b> ' +
      plural(items.length, 'проект', 'проекта', 'проектов');

    saveToUrl();
  }

  /* Выбранные фильтры кладём в адресную строку */
  function saveToUrl() {
    var q = new URLSearchParams();
    Object.keys(f).forEach(function (k) {
      if (f[k].value !== 'all' && f[k].value !== 'pop') q.set(k, f[k].value);
    });
    var s = q.toString();
    history.replaceState(null, '', s ? '?' + s : location.pathname);
  }

  function loadFromUrl() {
    var q = new URLSearchParams(location.search);
    Object.keys(f).forEach(function (k) {
      var v = q.get(k);
      if (v && [].some.call(f[k].options, function (o) { return o.value === v; })) f[k].value = v;
    });
  }

  form.addEventListener('change', apply);
  reset.addEventListener('click', function () {
    Object.keys(f).forEach(function (k) { f[k].selectedIndex = 0; });
    apply();
  });

  loadFromUrl();
  apply();
})();
