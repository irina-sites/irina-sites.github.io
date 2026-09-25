/* ============================================================
   ЭКРАН «МОЙ УХОД»
   Показывает утренний/вечерний ритуал, чек-лист дня и стрик.
   ============================================================ */

window.Routine = (function () {
  var currentTime = 'morning';

  var MONTHS = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];

  function humanDate(d) {
    d = d || new Date();
    return d.getDate() + ' ' + MONTHS[d.getMonth()];
  }

  function init() {
    // По умолчанию — по времени суток
    var h = new Date().getHours();
    currentTime = (h >= 5 && h < 17) ? 'morning' : 'evening';

    // Вкладки утро/вечер
    Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (tab) {
      tab.onclick = function () {
        currentTime = tab.getAttribute('data-time');
        syncTabs();
        renderSteps();
      };
    });

    document.getElementById('routine-date').textContent = 'Сегодня, ' + humanDate();
  }

  function syncTabs() {
    Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (tab) {
      tab.classList.toggle('is-active', tab.getAttribute('data-time') === currentTime);
    });
  }

  function renderSteps() {
    var profile = Store.getProfile();
    if (!profile) return;
    var steps = SkinData.build(profile, currentTime);
    var list = document.getElementById('routine-list');
    list.innerHTML = '';

    steps.forEach(function (s) {
      var done = Store.isStepDone(currentTime, s.id);
      var el = document.createElement('div');
      el.className = 'step' + (done ? ' is-done' : '');
      el.innerHTML =
        '<div class="step__check">' + (done ? '✓' : '') + '</div>' +
        '<div class="step__icon">' + s.icon + '</div>' +
        '<div class="step__body">' +
          '<p class="step__title">' + s.title + '</p>' +
          '<p class="step__desc">' + s.desc + '</p>' +
        '</div>';
      el.onclick = function () {
        Store.toggleStep(currentTime, s.id);
        renderSteps();
        renderStreak();
      };
      list.appendChild(el);
    });
  }

  function renderStreak() {
    var streak = Store.currentStreak();
    document.getElementById('streak-num').textContent = streak;
    document.getElementById('streak-label').textContent =
      window.plural(streak, ['день подряд', 'дня подряд', 'дней подряд']);

    var todayBox = document.getElementById('streak-today');
    var active = Store.isDayActive(Store.todayKey());
    if (active) {
      todayBox.textContent = '✅ Сегодня уход отмечен';
    } else if (streak > 0) {
      todayBox.textContent = 'Отметьте уход, чтобы продолжить серию';
    } else {
      todayBox.textContent = 'Начните серию сегодня!';
    }
  }

  function show() {
    renderStreak();
    syncTabs();
    renderSteps();
  }

  return { init: init, show: show, renderStreak: renderStreak };
})();
