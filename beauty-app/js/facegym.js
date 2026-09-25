/* ============================================================
   ЭКРАН «ГИМНАСТИКА ДЛЯ ЛИЦА»
   Список упражнений + пошаговый плеер с таймером («Программа дня»).
   Завершение тренировки засчитывается в стрик и статистику.
   ============================================================ */

window.FaceGym = (function () {
  var overlay = null;
  var idx = 0;            // текущее упражнение
  var remaining = 0;      // сек до конца упражнения
  var timerId = null;
  var paused = false;

  function totalSeconds() {
    return window.Exercises.reduce(function (s, e) { return s + e.seconds; }, 0);
  }

  function init() {
    document.getElementById('fg-start').onclick = startSession;
    renderList();
  }

  // ---- Экран: список упражнений ----
  function renderList() {
    var list = document.getElementById('fg-list');
    list.innerHTML = '';
    window.Exercises.forEach(function (e) {
      var card = document.createElement('div');
      card.className = 'fg-card';
      card.innerHTML =
        '<div class="fg-card__emoji">' + e.emoji + '</div>' +
        '<div class="fg-card__body">' +
          '<span class="chip">' + e.zone + '</span>' +
          '<p class="fg-card__title">' + e.title + '</p>' +
          '<p class="fg-card__desc">' + e.desc + '</p>' +
        '</div>' +
        '<div class="fg-card__time">' + e.seconds + ' сек</div>';
      list.appendChild(card);
    });
  }

  function show() {
    var done = Store.faceGymToday();
    var mins = Math.round(totalSeconds() / 60);
    var info = document.getElementById('fg-info');
    info.innerHTML =
      '<div class="fg-intro__row">' +
        '<span>⏱️ ' + window.Exercises.length + ' упражнений · ~' + mins + ' мин</span>' +
        '<span>' + (done > 0 ? '✅ сегодня: ' + done : 'сегодня ещё не делали') + '</span>' +
      '</div>';
  }

  /* ================= Плеер тренировки ================= */
  function startSession() {
    idx = 0;
    paused = false;
    buildOverlay();
    document.body.classList.add('no-scroll');
    loadExercise();
  }

  function buildOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'fg-player';
    overlay.innerHTML =
      '<button class="fg-player__close" id="fg-close" aria-label="Закрыть">✕</button>' +
      '<div class="fg-player__dots" id="fg-dots"></div>' +
      '<div class="fg-player__stage" id="fg-stage"></div>';
    document.body.appendChild(overlay);
    document.getElementById('fg-close').onclick = stopSession;
  }

  function renderDots() {
    var dots = document.getElementById('fg-dots');
    dots.innerHTML = '';
    window.Exercises.forEach(function (_, i) {
      var d = document.createElement('span');
      d.className = 'fg-dot' + (i < idx ? ' is-done' : (i === idx ? ' is-current' : ''));
      dots.appendChild(d);
    });
  }

  function loadExercise() {
    var ex = window.Exercises[idx];
    remaining = ex.seconds;
    renderDots();
    if (navigator.vibrate) { try { navigator.vibrate(120); } catch (e) {} }

    document.getElementById('fg-stage').innerHTML =
      '<span class="chip fg-player__zone">' + ex.zone + '</span>' +
      '<div class="fg-player__count">Упражнение ' + (idx + 1) + ' из ' + window.Exercises.length + '</div>' +
      '<div class="fg-player__emoji">' + ex.emoji + '</div>' +
      '<h2 class="fg-player__title">' + ex.title + '</h2>' +
      '<p class="fg-player__desc">' + ex.desc + '</p>' +
      '<div class="fg-player__timer" id="fg-timer">' + fmt(remaining) + '</div>' +
      '<div class="fg-player__controls">' +
        '<button class="btn btn--ghost" id="fg-pause">⏸ Пауза</button>' +
        '<button class="btn btn--primary" id="fg-skip">' + (isLast() ? 'Завершить ✓' : 'Дальше →') + '</button>' +
      '</div>';

    document.getElementById('fg-pause').onclick = togglePause;
    document.getElementById('fg-skip').onclick = nextExercise;

    paused = false;
    startTimer();
  }

  function isLast() { return idx === window.Exercises.length - 1; }
  function fmt(s) { return '0:' + String(s).padStart(2, '0'); }

  function startTimer() {
    clearInterval(timerId);
    timerId = setInterval(function () {
      if (paused) return;
      remaining--;
      var t = document.getElementById('fg-timer');
      if (t) t.textContent = fmt(Math.max(0, remaining));
      if (remaining <= 0) nextExercise();
    }, 1000);
  }

  function togglePause() {
    paused = !paused;
    var btn = document.getElementById('fg-pause');
    if (btn) btn.textContent = paused ? '▶ Продолжить' : '⏸ Пауза';
  }

  function nextExercise() {
    clearInterval(timerId);
    if (isLast()) return finishSession();
    idx++;
    loadExercise();
  }

  function finishSession() {
    clearInterval(timerId);
    Store.markFaceGym();
    if (navigator.vibrate) { try { navigator.vibrate([120, 60, 120]); } catch (e) {} }
    document.getElementById('fg-dots').innerHTML = '';
    document.getElementById('fg-stage').innerHTML =
      '<div class="fg-done">' +
        '<div class="fg-done__emoji">🎉</div>' +
        '<h2 class="fg-done__title">Тренировка завершена!</h2>' +
        '<p class="fg-done__text">Отличная работа! Регулярность — главный секрет тонуса.<br>Тренировка засчитана в вашу серию 🔥</p>' +
        '<button class="btn btn--primary btn--block" id="fg-finish">Готово</button>' +
      '</div>';
    document.getElementById('fg-finish').onclick = stopSession;
  }

  function stopSession() {
    clearInterval(timerId);
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    overlay = null;
    document.body.classList.remove('no-scroll');
    show(); // обновить «сегодня сделано»
  }

  return { init: init, show: show };
})();
