/* ==========================================================================
   ГЛИНА — интернет-магазин керамики ручной работы.
   Демо-проект для портфолио: бренд вымышленный, оплата не подключена.

   Товары и категории лежат здесь одним списком. Чтобы добавить позицию,
   достаточно дописать объект — каталог, фильтры и корзина подхватят сами.
   ========================================================================== */

window.SHOP_CATEGORIES = [
  { id: 'cups',  title: 'Кружки и чашки' },
  { id: 'plates', title: 'Тарелки и миски' },
  { id: 'vases', title: 'Вазы и декор' },
  { id: 'sets',  title: 'Наборы' }
];

window.SHOP_PRODUCTS = [
  { id:'kruzhka-utro',   title:'Кружка «Утро»',            cat:'cups',   shape:'mug',    price:1200, old:null, stock:8,  hit:true,
    tag:'350 мл · глазурь цвета топлёного молока',
    about:'Форма с широким дном — не опрокинется на столе. Толстая стенка держит температуру: чай остывает вдвое дольше, чем в тонкой фарфоровой чашке.' },
  { id:'kruzhka-polden', title:'Кружка «Полдень»',          cat:'cups',   shape:'mug',    price:1350, old:1600, stock:5,  hit:false,
    tag:'400 мл · матовая терракота',
    about:'Большая кружка под кофе с молоком. Матовая глазурь снаружи не скользит в руке, внутри — гладкая, чтобы легко отмывалась.' },
  { id:'para-tishina',   title:'Чайная пара «Тишина»',      cat:'cups',   shape:'cup',    price:2400, old:null, stock:3,  hit:true,
    tag:'200 мл + блюдце · белая глазурь',
    about:'Чашка на 200 мл с блюдцем. Тонкий край — чай пьётся мягче. Каждая пара обжигается отдельно, поэтому оттенок слегка отличается.' },
  { id:'tarelka-pole',   title:'Тарелка обеденная «Поле»',  cat:'plates', shape:'plate',  price:1600, old:null, stock:12, hit:false,
    tag:'26 см · песочная глазурь',
    about:'Диаметр 26 см — стандарт для основного блюда. Бортик низкий, соус не растекается. Можно мыть в посудомоечной машине.' },
  { id:'tarelka-desert', title:'Тарелка десертная «Поле»',  cat:'plates', shape:'plate',  price:1100, old:null, stock:14, hit:false,
    tag:'19 см · песочная глазурь',
    about:'Младшая сестра обеденной тарелки: под завтрак, десерт или закуску. Собирается в комплект с остальной линейкой «Поле».' },
  { id:'miska-gnezdo',   title:'Миска «Гнездо»',            cat:'plates', shape:'bowl',   price:1800, old:null, stock:6,  hit:true,
    tag:'700 мл · глубокая',
    about:'Глубокая миска под суп, салат или завтрак. Снаружи фактура от пальцев гончара — след ручной работы, а не брак.' },
  { id:'salatnik-krug',  title:'Салатник «Круг»',           cat:'plates', shape:'bowl',   price:3200, old:null, stock:2,  hit:false,
    tag:'2,2 л · на большую компанию',
    about:'Салатник на 2,2 литра — хватает на стол из шести человек. Тяжёлое дно не даёт миске ездить, когда перемешиваете.' },
  { id:'vaza-stebel',    title:'Ваза «Стебель»',            cat:'vases',  shape:'vase',   price:4500, old:null, stock:4,  hit:true,
    tag:'32 см · узкое горло',
    about:'Высокая ваза под одну ветку или небольшой букет. Узкое горло держит стебли и не даёт букету развалиться.' },
  { id:'vaza-kaplya',    title:'Ваза «Капля»',              cat:'vases',  shape:'vase',   price:3800, old:4400, stock:0,  hit:false,
    tag:'22 см · округлая форма',
    about:'Приземистая ваза с широким основанием. Хорошо смотрится с сухоцветами и пампасной травой.' },
  { id:'chaynik-dym',    title:'Чайник «Дым»',              cat:'sets',   shape:'teapot', price:5600, old:null, stock:3,  hit:false,
    tag:'900 мл · с ситечком',
    about:'Заварочный чайник на 900 мл со съёмным керамическим ситечком. Носик рассчитан так, чтобы не капало на скатерть.' },
  { id:'nabor-zavtrak',  title:'Набор «Завтрак на двоих»',  cat:'sets',   shape:'set',    price:6900, old:8200, stock:5,  hit:true,
    tag:'2 кружки, 2 тарелки, 2 миски',
    about:'Готовый комплект на двоих: две кружки, две десертные тарелки и две миски. В наборе выходит на 1 300 ₽ дешевле, чем по отдельности.' },
  { id:'podsvechnik',    title:'Подсвечник «Огонёк»',       cat:'vases',  shape:'candle', price:950,  old:null, stock:20, hit:false,
    tag:'под чайную свечу',
    about:'Маленький подсвечник под обычную чайную свечу. Берут по три-четыре штуки — так свет мягче и интереснее.' }
];

/* --------------------------------------------------------------------------
   Товары нарисованы в SVG, а не сфотографированы.
   Для демо-проекта это честнее: не нужны чужие фотографии с неясными правами,
   картинки остаются чёткими на любом экране и весят считанные байты.
   В боевом магазине здесь были бы фотографии товара.
   -------------------------------------------------------------------------- */
window.shopArt = function (shape, seed) {
  var tone = ['#c89a78', '#b5795a', '#d8b59a', '#a9866b'][(seed || 0) % 4];
  var body = 'fill="' + tone + '"';
  var line = 'fill="none" stroke="#3a2b23" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"';
  var parts = [];

  parts.push('<rect width="240" height="200" fill="var(--pic-bg)"/>');
  parts.push('<ellipse cx="120" cy="171" rx="66" ry="9" fill="#3a2b23" opacity=".12"/>');

  if (shape === 'mug') {
    parts.push('<path d="M78 66h74v74a26 26 0 0 1-26 26h-22a26 26 0 0 1-26-26z" ' + body + '/>');
    parts.push('<path d="M78 66h74v74a26 26 0 0 1-26 26h-22a26 26 0 0 1-26-26z" ' + line + '/>');
    parts.push('<path d="M152 88h16a20 20 0 0 1 0 40h-16" ' + line + '/>');
    parts.push('<path d="M78 80h74" ' + line + ' opacity=".55"/>');
  } else if (shape === 'cup') {
    parts.push('<path d="M86 74h68l-8 56a24 24 0 0 1-24 21h-4a24 24 0 0 1-24-21z" ' + body + '/>');
    parts.push('<path d="M86 74h68l-8 56a24 24 0 0 1-24 21h-4a24 24 0 0 1-24-21z" ' + line + '/>');
    parts.push('<path d="M154 92h14a17 17 0 0 1 0 34h-11" ' + line + '/>');
    parts.push('<path d="M62 158h116" ' + line + '/>');
    parts.push('<path d="M70 158a50 50 0 0 0 100 0" ' + line + ' opacity=".5"/>');
  } else if (shape === 'plate') {
    parts.push('<ellipse cx="120" cy="110" rx="78" ry="48" ' + body + '/>');
    parts.push('<ellipse cx="120" cy="110" rx="78" ry="48" ' + line + '/>');
    parts.push('<ellipse cx="120" cy="110" rx="56" ry="33" ' + line + ' opacity=".5"/>');
    parts.push('<ellipse cx="120" cy="110" rx="30" ry="17" ' + line + ' opacity=".3"/>');
  } else if (shape === 'bowl') {
    parts.push('<path d="M52 92h136a68 54 0 0 1-136 0z" ' + body + '/>');
    parts.push('<path d="M52 92h136a68 54 0 0 1-136 0z" ' + line + '/>');
    parts.push('<ellipse cx="120" cy="92" rx="68" ry="15" ' + line + '/>');
    parts.push('<path d="M74 120a48 30 0 0 0 92 0" ' + line + ' opacity=".4"/>');
  } else if (shape === 'vase') {
    parts.push('<path d="M104 40h32v26c22 14 34 36 34 56 0 28-24 44-50 44s-50-16-50-44c0-20 12-42 34-56z" ' + body + '/>');
    parts.push('<path d="M104 40h32v26c22 14 34 36 34 56 0 28-24 44-50 44s-50-16-50-44c0-20 12-42 34-56z" ' + line + '/>');
    parts.push('<ellipse cx="120" cy="40" rx="16" ry="6" ' + line + '/>');
    parts.push('<path d="M92 118c18 10 38 10 56 0" ' + line + ' opacity=".45"/>');
  } else if (shape === 'teapot') {
    parts.push('<path d="M70 92h100a56 46 0 0 1-100 0z" ' + body + '/>');
    parts.push('<path d="M70 92h100a56 46 0 0 1-100 0z" ' + line + '/>');
    parts.push('<ellipse cx="120" cy="92" rx="50" ry="13" ' + line + '/>');
    parts.push('<path d="M170 100c16 2 26 12 30 26" ' + line + '/>');
    parts.push('<path d="M70 98c-14 4-22 14-22 26" ' + line + '/>');
    parts.push('<path d="M104 78h32" ' + line + '/>');
    parts.push('<circle cx="120" cy="70" r="7" ' + line + '/>');
  } else if (shape === 'candle') {
    parts.push('<path d="M92 118h56v30a14 14 0 0 1-14 14h-28a14 14 0 0 1-14-14z" ' + body + '/>');
    parts.push('<path d="M92 118h56v30a14 14 0 0 1-14 14h-28a14 14 0 0 1-14-14z" ' + line + '/>');
    parts.push('<ellipse cx="120" cy="118" rx="28" ry="8" ' + line + '/>');
    parts.push('<path d="M120 108c-10-12 4-20 0-32 14 12 16 22 0 32z" fill="#e0913f" stroke="#3a2b23" stroke-width="3"/>');
  } else { // set — три предмета рядом
    parts.push('<path d="M40 96h46v46a18 18 0 0 1-18 18H58a18 18 0 0 1-18-18z" ' + body + '/>');
    parts.push('<path d="M40 96h46v46a18 18 0 0 1-18 18H58a18 18 0 0 1-18-18z" ' + line + '/>');
    parts.push('<path d="M86 110h11a13 13 0 0 1 0 26h-11" ' + line + '/>');
    parts.push('<ellipse cx="146" cy="132" rx="44" ry="26" ' + body + '/>');
    parts.push('<ellipse cx="146" cy="132" rx="44" ry="26" ' + line + '/>');
    parts.push('<ellipse cx="146" cy="132" rx="26" ry="15" ' + line + ' opacity=".45"/>');
    parts.push('<path d="M164 74h52a26 20 0 0 1-52 0z" ' + body + '/>');
    parts.push('<path d="M164 74h52a26 20 0 0 1-52 0z" ' + line + '/>');
    parts.push('<ellipse cx="190" cy="74" rx="26" ry="7" ' + line + '/>');
  }

  return '<svg viewBox="0 0 240 200" role="img" aria-label="Изображение товара" preserveAspectRatio="xMidYMid meet">' +
         parts.join('') + '</svg>';
};

/* Цена: 1200 -> «1 200 ₽» */
window.shopPrice = function (n) {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';
};
