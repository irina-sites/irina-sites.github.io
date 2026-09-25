/* ==========================================================================
   КЕДРОН — каталог проектов.
   Один источник данных для главной, каталога и калькулятора.
   Цены демонстрационные, бренд вымышленный.
   ========================================================================== */

window.KEDRON_PROJECTS = [
  {
    id: 'kedr-96',
    name: 'Кедр 96',
    tag: 'Семейный дом с мансардой',
    type: 'frame',            // frame — каркасный, module — модульный
    area: 96, floors: 2, beds: 3,
    price: 3840000, days: 70,
    hit: true,
    page: 'project-kedr-96.html',
    specs: ['96 м²', '2 этажа', '3 спальни'],
    about: 'Самый заказываемый проект: гостиная с кухней внизу, три спальни наверху, котельная вынесена из жилой зоны.'
  },
  {
    id: 'sosna-60',
    name: 'Сосна 60',
    tag: 'Компактный одноэтажный',
    type: 'frame',
    area: 60, floors: 1, beds: 2,
    price: 2340000, days: 45,
    hit: true,
    page: 'catalog.html',
    specs: ['60 м²', '1 этаж', '2 спальни'],
    about: 'Дом без лестниц — удобно старшему поколению. Вся площадь рабочая, коридоров почти нет.'
  },
  {
    id: 'modul-54',
    name: 'Модуль 54 Дуо',
    tag: 'Два блока с завода',
    type: 'module',
    area: 54, floors: 1, beds: 2,
    price: 2320000, days: 30,
    hit: true,
    page: 'project-modul-54.html',
    specs: ['54 м²', '1 этаж', '30 дней'],
    about: 'Собирается на производстве, привозится готовым. Монтаж на участке — один день, отделка уже внутри.'
  },
  {
    id: 'el-120',
    name: 'Ель 120',
    tag: 'Просторный двухэтажный',
    type: 'frame',
    area: 120, floors: 2, beds: 4,
    price: 4920000, days: 85,
    page: 'catalog.html',
    specs: ['120 м²', '2 этажа', '4 спальни'],
    about: 'Для большой семьи: четыре спальни, два санузла, кабинет на первом этаже.'
  },
  {
    id: 'lipa-78',
    name: 'Липа 78',
    tag: 'Этаж с мансардой',
    type: 'frame',
    area: 78, floors: 2, beds: 3,
    price: 3120000, days: 60,
    page: 'catalog.html',
    specs: ['78 м²', 'Мансарда', '3 спальни'],
    about: 'Компромисс между площадью и ценой: мансарда обходится дешевле полноценного второго этажа.'
  },
  {
    id: 'modul-36',
    name: 'Модуль 36',
    tag: 'Дом выходного дня',
    type: 'module',
    area: 36, floors: 1, beds: 1,
    price: 1620000, days: 25,
    page: 'catalog.html',
    specs: ['36 м²', '1 этаж', '25 дней'],
    about: 'Стартовый вариант: спальня, кухня-гостиная, санузел. Часто берут как первый дом на участке.'
  },
  {
    id: 'bereza-45',
    name: 'Берёза 45',
    tag: 'Одноэтажный с террасой',
    type: 'frame',
    area: 45, floors: 1, beds: 1,
    price: 1890000, days: 35,
    page: 'catalog.html',
    specs: ['45 м²', 'Терраса 12 м²', '1 спальня'],
    about: 'Небольшой дом с большой террасой под общей крышей — вариант для дачного участка.'
  },
  {
    id: 'modul-72',
    name: 'Модуль 72 Плюс',
    tag: 'Три блока, полный цикл',
    type: 'module',
    area: 72, floors: 1, beds: 3,
    price: 3060000, days: 40,
    page: 'catalog.html',
    specs: ['72 м²', '3 блока', '3 спальни'],
    about: 'Модульный дом для постоянного проживания: утепление под круглогодичный режим, три спальни.'
  }
];

/* --------------------------------------------------------------------------
   Иллюстрации домов рисуются в SVG прямо в браузере.
   Так страница не тянет тяжёлые фотографии, картинка остаётся чёткой
   на любом экране и сама подстраивается под тёмную тему.
   -------------------------------------------------------------------------- */
window.kedronHouseSvg = function (p, w, h) {
  w = w || 400; h = h || 250;
  var twoFloors = p.floors > 1;
  var isModule = p.type === 'module';

  var ground = h - 26;
  var bodyW = isModule ? 250 : 210;
  var bodyH = twoFloors ? 104 : 70;
  var x = (w - bodyW) / 2;
  var y = ground - bodyH;

  var parts = [];

  // небо и дальний план
  parts.push('<rect width="' + w + '" height="' + h + '" fill="var(--bg-alt)"/>');
  parts.push('<circle cx="' + (w - 58) + '" cy="46" r="24" fill="var(--brand)" opacity=".18"/>');
  parts.push('<path d="M0 ' + (ground - 6) + ' Q ' + (w * 0.22) + ' ' + (ground - 46) + ' ' + (w * 0.46) + ' ' + (ground - 8) +
             ' T ' + w + ' ' + (ground - 14) + ' L ' + w + ' ' + h + ' L0 ' + h + 'Z" fill="var(--forest)" opacity=".13"/>');

  // крыша
  if (isModule) {
    parts.push('<rect x="' + (x - 10) + '" y="' + (y - 13) + '" width="' + (bodyW + 20) + '" height="13" rx="3" fill="var(--forest)"/>');
  } else {
    var peak = y - (twoFloors ? 52 : 46);
    parts.push('<path d="M' + (x - 16) + ' ' + y + ' L' + (x + bodyW / 2) + ' ' + peak + ' L' + (x + bodyW + 16) + ' ' + y + ' Z" fill="var(--forest)"/>');
    if (twoFloors) {
      // мансардное окно
      parts.push('<rect x="' + (x + bodyW / 2 - 15) + '" y="' + (peak + 24) + '" width="30" height="22" rx="3" fill="var(--brand)" opacity=".85"/>');
    }
  }

  // стены
  parts.push('<rect x="' + x + '" y="' + y + '" width="' + bodyW + '" height="' + bodyH + '" rx="4" fill="var(--surface)" stroke="var(--line)" stroke-width="2"/>');

  // разделитель этажей / стык модулей
  if (twoFloors) {
    parts.push('<line x1="' + x + '" y1="' + (y + bodyH / 2) + '" x2="' + (x + bodyW) + '" y2="' + (y + bodyH / 2) + '" stroke="var(--line)" stroke-width="2"/>');
  }
  if (isModule) {
    var blocks = p.area >= 70 ? 3 : 2;
    for (var b = 1; b < blocks; b++) {
      var bx = x + (bodyW / blocks) * b;
      parts.push('<line x1="' + bx + '" y1="' + y + '" x2="' + bx + '" y2="' + (y + bodyH) + '" stroke="var(--line)" stroke-width="2" stroke-dasharray="5 4"/>');
    }
  }

  // окна
  var winY = y + (twoFloors ? 14 : 18);
  var winCount = p.area >= 90 ? 3 : 2;
  var gap = bodyW / (winCount + 1);
  for (var i = 1; i <= winCount; i++) {
    parts.push('<rect x="' + (x + gap * i - 17) + '" y="' + winY + '" width="34" height="26" rx="3" fill="var(--brand)" opacity=".8"/>');
  }
  if (twoFloors) {
    for (var j = 1; j <= winCount; j++) {
      parts.push('<rect x="' + (x + gap * j - 17) + '" y="' + (y + bodyH / 2 + 14) + '" width="34" height="24" rx="3" fill="var(--brand)" opacity=".55"/>');
    }
  }

  // дверь
  var doorX = x + bodyW - 46;
  var doorH = twoFloors ? 34 : 30;
  parts.push('<rect x="' + doorX + '" y="' + (ground - doorH) + '" width="26" height="' + doorH + '" rx="3" fill="var(--forest)"/>');

  // земля
  parts.push('<rect x="0" y="' + ground + '" width="' + w + '" height="' + (h - ground) + '" fill="var(--forest)" opacity=".22"/>');

  return '<svg viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Схематичное изображение дома ' + p.name +
         '" preserveAspectRatio="xMidYMid meet">' + parts.join('') + '</svg>';
};

/* Форматирование цены: 3840000 -> "3 840 000 ₽" */
window.kedronPrice = function (n) {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';
};

/* Разметка одной карточки проекта */
window.kedronCard = function (p) {
  return '<a class="proj reveal" href="' + p.page + '">' +
    '<div class="proj__pic">' + window.kedronHouseSvg(p) +
      (p.hit ? '<em class="proj__badge">Хит продаж</em>' : '') +
    '</div>' +
    '<div class="proj__body">' +
      '<h3>' + p.name + '</h3>' +
      '<p class="proj__tag">' + p.tag + '</p>' +
      '<ul class="proj__specs">' + p.specs.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ul>' +
      '<div class="proj__foot">' +
        '<span class="proj__price">от ' + window.kedronPrice(p.price) + '</span>' +
        '<span class="proj__more">' + p.days + ' дней</span>' +
      '</div>' +
    '</div>' +
  '</a>';
};
