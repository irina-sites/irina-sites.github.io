/* ============================================================
   ПРАВИЛА УХОДА
   Из «типа кожи» + «задач» собираем утренний и вечерний ритуал.
   Каждый шаг: { id, icon, title, desc }.
   Файл легко расширять — просто добавляйте шаги в массивы.
   ============================================================ */

window.SkinData = (function () {

  // Человеческие названия для профиля
  var SKIN_LABELS = {
    dry:       'Сухая',
    oily:      'Жирная',
    combo:     'Комбинированная',
    normal:    'Нормальная',
    sensitive: 'Чувствительная'
  };

  var CONCERN_LABELS = {
    wrinkles:    'Морщины',
    pigment:     'Пигментация',
    tone:        'Потеря тонуса',
    dryness:     'Сухость',
    sensitivity: 'Чувствительность'
  };

  // Базовые шаги — есть у всех
  function baseMorning() {
    return [
      { id: 'm_cleanse', icon: '🫧', title: 'Мягкое очищение', desc: 'Умойтесь тёплой водой с мягким средством без агрессивных ПАВ.' },
      { id: 'm_tone',    icon: '💧', title: 'Тоник / мист',      desc: 'Восстановите баланс кожи и подготовьте её к уходу.' },
      { id: 'm_serum',   icon: '✨', title: 'Сыворотка',         desc: 'Активный концентрат под задачи вашей кожи.' },
      { id: 'm_eye',     icon: '👁️', title: 'Крем для век',       desc: 'Лёгкими похлопываниями, безымянным пальцем.' },
      { id: 'm_cream',   icon: '🧴', title: 'Дневной крем',       desc: 'Увлажнение и защита на весь день.' },
      { id: 'm_spf',     icon: '☀️', title: 'SPF 30–50',          desc: 'Главный антивозрастной шаг. Наносите каждый день, даже в пасмурно.' }
    ];
  }

  function baseEvening() {
    return [
      { id: 'e_makeup',  icon: '🧽', title: 'Снятие макияжа',    desc: 'Гидрофильное масло или мицеллярная вода — уберите SPF и загрязнения.' },
      { id: 'e_cleanse', icon: '🫧', title: 'Очищение',           desc: 'Второе умывание мягким гелем или пенкой.' },
      { id: 'e_tone',    icon: '💧', title: 'Тоник',              desc: 'Подготовьте кожу к вечерним активам.' },
      { id: 'e_serum',   icon: '🌿', title: 'Вечерняя сыворотка', desc: 'Активы восстановления, пока вы спите.' },
      { id: 'e_eye',     icon: '👁️', title: 'Крем для век',       desc: 'Нежная зона — минимум трения.' },
      { id: 'e_cream',   icon: '🌙', title: 'Ночной крем',        desc: 'Питание и восстановление за ночь.' }
    ];
  }

  // Дополнения под ТИП кожи
  function bySkinType(type, time) {
    var add = [];
    if (type === 'dry') {
      if (time === 'evening') add.push({ id: 'x_oil', icon: '🫒', title: 'Питательное масло', desc: 'Пару капель поверх крема 2–3 раза в неделю против сухости и стянутости.' });
    }
    if (type === 'oily') {
      if (time === 'evening') add.push({ id: 'x_bha', icon: '🧪', title: 'Кислотный уход (BHA)', desc: 'Салициловая кислота 1–2 раза в неделю — против жирного блеска и пор.' });
    }
    if (type === 'sensitive') {
      add.push({ id: 'x_calm', icon: '🌾', title: 'Успокаивающий уход', desc: 'Средства с пантенолом/центеллой. Избегайте спирта и отдушек.' });
    }
    return add;
  }

  // Дополнения под ЗАДАЧИ (concerns)
  function byConcerns(concerns, time) {
    var add = [];
    var has = function (c) { return concerns.indexOf(c) !== -1; };

    if (has('wrinkles') && time === 'evening') {
      add.push({ id: 'x_retinol', icon: '🌙', title: 'Ретиноид (вечер)', desc: 'Золотой стандарт против морщин. Начните 2 раза в неделю, постепенно чаще. Только вечером + утром обязательно SPF.' });
    }
    if (has('pigment')) {
      if (time === 'morning') add.push({ id: 'x_vitc', icon: '🍊', title: 'Витамин C (утро)', desc: 'Антиоксидант: выравнивает тон и усиливает защиту от солнца.' });
      if (time === 'evening') add.push({ id: 'x_niacin', icon: '💛', title: 'Ниацинамид', desc: 'Осветляет пигментные пятна и укрепляет барьер кожи.' });
    }
    if (has('tone')) {
      add.push({ id: 'x_massage', icon: '💆‍♀️', title: 'Массаж лица 5 минут', desc: 'Лёгкий лимфодренаж или гуаша — тонус и свежий цвет лица.' });
      if (time === 'morning') add.push({ id: 'x_peptide', icon: '🧬', title: 'Пептидная сыворотка', desc: 'Пептиды поддерживают упругость и плотность кожи.' });
    }
    if (has('dryness')) {
      add.push({ id: 'x_ha', icon: '💦', title: 'Гиалуроновая кислота', desc: 'Наносите на влажную кожу перед кремом — глубокое увлажнение.' });
    }
    return add;
  }

  // Собрать финальный ритуал под профиль
  function build(profile, time) {
    var steps = (time === 'morning') ? baseMorning() : baseEvening();
    var extra = bySkinType(profile.skinType, time).concat(byConcerns(profile.concerns || [], time));

    // Вставляем дополнения перед кремом/SPF, чтобы порядок был логичным
    var anchorId = (time === 'morning') ? 'm_cream' : 'e_cream';
    var idx = steps.findIndex(function (s) { return s.id === anchorId; });
    if (idx === -1) idx = steps.length;

    extra.forEach(function (s, i) { steps.splice(idx + i, 0, s); });
    return steps;
  }

  return {
    SKIN_LABELS: SKIN_LABELS,
    CONCERN_LABELS: CONCERN_LABELS,
    build: build
  };
})();
