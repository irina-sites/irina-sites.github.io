/* ============================================================
   ЭКРАН «ЗНАНИЯ» + ЭКРАН «ПРОФИЛЬ»
   ============================================================ */

window.Content = (function () {

  /* ---------- Знания ---------- */
  function renderList() {
    var list = document.getElementById('article-list');
    var view = document.getElementById('article-view');
    view.classList.add('is-hidden');
    list.classList.remove('is-hidden');
    list.innerHTML = '';

    window.Articles.forEach(function (a) {
      var card = document.createElement('div');
      card.className = 'article-card';
      card.innerHTML =
        '<div class="article-card__emoji">' + a.emoji + '</div>' +
        '<div>' +
          '<p class="article-card__title">' + a.title + '</p>' +
          '<p class="article-card__lead">' + a.lead + '</p>' +
        '</div>';
      card.onclick = function () { openArticle(a); };
      list.appendChild(card);
    });
  }

  function openArticle(a) {
    var list = document.getElementById('article-list');
    var view = document.getElementById('article-view');
    list.classList.add('is-hidden');
    view.classList.remove('is-hidden');
    view.innerHTML =
      '<button class="back-link" id="art-back">← Ко всем статьям</button>' +
      '<h1>' + a.emoji + ' ' + a.title + '</h1>' +
      a.html;
    view.querySelector('#art-back').onclick = renderList;
    window.scrollTo(0, 0);
  }

  function showKnowledge() { renderList(); }

  /* ---------- Профиль ---------- */
  function showProfile(onReset) {
    var p = Store.getProfile();
    var body = document.getElementById('profile-body');
    if (!p) { body.innerHTML = ''; return; }

    var skinLabel = SkinData.SKIN_LABELS[p.skinType] || '—';
    var concernsHtml = (p.concerns && p.concerns.length)
      ? p.concerns.map(function (c) { return '<span class="chip">' + (SkinData.CONCERN_LABELS[c] || c) + '</span>'; }).join('')
      : '<span class="chip">Не выбрано</span>';

    var streak = Store.currentStreak();
    var days = Store.totalActiveDays();
    var gym = Store.totalFaceGymSessions();

    body.innerHTML =
      '<div class="profile-card">' +
        '<p class="profile-card__label">Тип кожи</p>' +
        '<p class="profile-card__value">' + skinLabel + '</p>' +
      '</div>' +
      '<div class="profile-card">' +
        '<p class="profile-card__label">Над чем работаем</p>' +
        '<div class="chip-row">' + concernsHtml + '</div>' +
      '</div>' +
      '<div class="profile-card">' +
        '<p class="profile-card__label">Ваши достижения</p>' +
        '<p class="profile-card__value">🔥 ' + streak + ' ' + window.plural(streak, ['день', 'дня', 'дней']) +
          ' подряд · 🌿 ' + days + ' ' + window.plural(days, ['день', 'дня', 'дней']) + ' ухода</p>' +
        '<p class="profile-card__value" style="margin-top:8px">💆‍♀️ ' + gym + ' ' +
          window.plural(gym, ['тренировка', 'тренировки', 'тренировок']) + ' лица</p>' +
      '</div>' +
      '<button class="btn btn--ghost btn--block" id="p-redo">Пройти тест заново</button>' +
      '<button class="btn btn--ghost btn--block btn--danger" id="p-erase">Удалить все данные</button>' +
      '<p class="profile-note">' +
        'Все данные хранятся только на вашем телефоне и никуда не отправляются.<br>' +
        '<a href="privacy.html" target="_blank" rel="noopener">Как приложение обращается с данными</a>' +
        '<br>Сияние 40+ · версия 1.0' +
      '</p>';

    // Право на удаление — одним действием, включая фото из IndexedDB
    body.querySelector('#p-erase').onclick = function () {
      if (!confirm('Удалить все данные? Профиль, отметки ухода и все фото будут стёрты с этого устройства. Отменить будет нельзя.')) return;
      Store.eraseEverything().then(function () {
        alert('Готово. На этом устройстве не осталось ваших данных.');
        location.reload();
      });
    };

    body.querySelector('#p-redo').onclick = function () {
      if (confirm('Пройти тест заново? Ваш профиль будет обновлён, отметки и фото сохранятся.')) {
        Store.resetProfile();
        onReset();
      }
    };
  }

  return { showKnowledge: showKnowledge, showProfile: showProfile };
})();
