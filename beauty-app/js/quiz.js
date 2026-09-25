/* ============================================================
   ОНБОРДИНГ-ТЕСТ
   Приветствие → тип кожи → задачи → готово.
   Результат сохраняется в Store и запускает основное приложение.
   ============================================================ */

window.Quiz = (function () {
  var container, onDone;

  var SKIN_OPTIONS = [
    { v: 'dry',       emoji: '🌵', t: 'Сухая',           s: 'Стянутость, шелушение, тусклость' },
    { v: 'oily',      emoji: '💧', t: 'Жирная',          s: 'Блеск, расширенные поры' },
    { v: 'combo',     emoji: '🌗', t: 'Комбинированная', s: 'Т-зона жирнеет, щёки сухие' },
    { v: 'normal',    emoji: '🌸', t: 'Нормальная',      s: 'Без выраженных проблем' },
    { v: 'sensitive', emoji: '🌾', t: 'Чувствительная',  s: 'Краснеет, реагирует на средства' }
  ];

  var CONCERN_OPTIONS = [
    { v: 'wrinkles',    emoji: '〰️', t: 'Морщины',           s: 'Мимические и возрастные' },
    { v: 'pigment',     emoji: '🟤', t: 'Пигментация',        s: 'Пятна, неровный тон' },
    { v: 'tone',        emoji: '🎈', t: 'Потеря тонуса',      s: 'Кожа стала менее упругой' },
    { v: 'dryness',     emoji: '🏜️', t: 'Сухость',            s: 'Не хватает увлажнения' },
    { v: 'sensitivity', emoji: '🔥', t: 'Чувствительность',   s: 'Раздражения и покраснения' }
  ];

  var draft = { skinType: null, concerns: [] };
  var step = 0; // 0 приветствие, 1 тип кожи, 2 задачи, 3 финал

  function start(el, done) {
    container = el;
    onDone = done;
    draft = { skinType: null, concerns: [] };
    step = 0;
    render();
  }

  function render() {
    if (step === 0) return renderWelcome();
    if (step === 3) return renderDone();
    return renderQuestion();
  }

  function renderWelcome() {
    container.innerHTML =
      '<div class="quiz__brand">Сияние 40+</div>' +
      '<div class="welcome">' +
        '<div class="welcome__emoji">🌷</div>' +
        '<h1 class="welcome__title">Красивая кожа<br>в любом возрасте</h1>' +
        '<p class="welcome__text">Ответьте на 2 коротких вопроса — и получите персональный план ухода утром и вечером.</p>' +
        '<p class="welcome__text">Всё бесплатно и хранится только на вашем телефоне.</p>' +
      '</div>' +
      '<div class="quiz__actions">' +
        '<button class="btn btn--primary btn--block" id="q-start">Начать →</button>' +
      '</div>';
    container.querySelector('#q-start').onclick = function () { step = 1; render(); };
  }

  function renderQuestion() {
    var isSkin = step === 1;
    var opts = isSkin ? SKIN_OPTIONS : CONCERN_OPTIONS;
    var title = isSkin ? 'Какой у вас тип кожи?' : 'Что хотите улучшить?';
    var hint = isSkin ? 'Выберите один вариант' : 'Можно выбрать несколько';
    var progress = isSkin ? 50 : 100;

    var html =
      '<div class="quiz__brand">Сияние 40+</div>' +
      '<div class="quiz__progress"><div class="quiz__progress-bar" style="width:' + progress + '%"></div></div>' +
      '<h2 class="quiz__q">' + title + '</h2>' +
      '<p class="quiz__hint">' + hint + '</p>' +
      '<div class="quiz__options">';

    opts.forEach(function (o) {
      var selected = isSkin
        ? draft.skinType === o.v
        : draft.concerns.indexOf(o.v) !== -1;
      html +=
        '<button class="opt' + (selected ? ' is-selected' : '') + '" data-v="' + o.v + '">' +
          '<span class="opt__emoji">' + o.emoji + '</span>' +
          '<span class="opt__text"><b>' + o.t + '</b><span>' + o.s + '</span></span>' +
          '<span class="opt__mark">' + (selected ? '✓' : '') + '</span>' +
        '</button>';
    });
    html += '</div>';

    // Кнопки навигации
    var canNext = isSkin ? !!draft.skinType : true;
    html +=
      '<div class="quiz__actions">' +
        '<button class="btn btn--primary btn--block" id="q-next"' + (canNext ? '' : ' disabled style="opacity:.5"') + '>' +
          (isSkin ? 'Далее →' : 'Показать мой уход →') +
        '</button>' +
      '</div>';

    container.innerHTML = html;

    // Обработчики выбора
    Array.prototype.forEach.call(container.querySelectorAll('.opt'), function (btn) {
      btn.onclick = function () {
        var v = btn.getAttribute('data-v');
        if (isSkin) {
          draft.skinType = v;
        } else {
          var i = draft.concerns.indexOf(v);
          if (i === -1) draft.concerns.push(v); else draft.concerns.splice(i, 1);
        }
        render();
      };
    });

    container.querySelector('#q-next').onclick = function () {
      if (isSkin && !draft.skinType) return;
      step += 1; // 1 (тип кожи) → 2 (задачи) → 3 (финал)
      // Сохраняем профиль при переходе к финалу
      if (step === 3) Store.setProfile({ skinType: draft.skinType, concerns: draft.concerns });
      render();
    };
  }

  function renderDone() {
    var label = SkinData.SKIN_LABELS[draft.skinType] || '';
    container.innerHTML =
      '<div class="quiz__brand">Сияние 40+</div>' +
      '<div class="done">' +
        '<div class="done__emoji">✨</div>' +
        '<h2 class="done__title">Ваш план готов!</h2>' +
        '<p class="welcome__text">Тип кожи: <b>' + label + '</b>.<br>Мы собрали для вас утренний и вечерний ритуал.</p>' +
        '<p class="welcome__text">Отмечайте шаги каждый день и следите за прогрессом по фото.</p>' +
      '</div>' +
      '<div class="quiz__actions">' +
        '<button class="btn btn--primary btn--block" id="q-finish">Перейти к уходу →</button>' +
      '</div>';
    container.querySelector('#q-finish').onclick = function () { onDone(); };
  }

  return { start: start };
})();
