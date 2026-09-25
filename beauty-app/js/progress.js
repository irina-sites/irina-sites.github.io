/* ============================================================
   ЭКРАН «ПРОГРЕСС»
   Фото «до/после» (IndexedDB), статистика, режим сравнения.
   Фото сжимается перед сохранением, чтобы не переполнять память.
   ============================================================ */

window.Progress = (function () {
  var selected = []; // id выбранных для сравнения (макс 2)

  var MONTHS = ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'];
  function shortDate(ts) {
    var d = new Date(ts);
    return d.getDate() + ' ' + MONTHS[d.getMonth()];
  }

  function init() {
    var input = document.getElementById('photo-input');
    input.onchange = function () {
      var file = input.files && input.files[0];
      if (file) compressAndSave(file);
      input.value = ''; // чтобы можно было выбрать то же фото снова
    };
    initConsent();
  }

  /* Согласие на хранение фото.
     Пока галочка не стоит, кнопка «Добавить фото» заблокирована:
     снимок лица — чувствительные данные, и спрашивать надо до, а не после. */
  function initConsent() {
    var box = document.getElementById('photo-consent');
    var check = document.getElementById('photo-agree');
    var addBtn = document.querySelector('label[for="photo-input"]');
    if (!box || !check || !addBtn) return;

    function apply(given) {
      box.hidden = given;
      addBtn.classList.toggle('is-locked', !given);
    }

    check.checked = Store.photoConsent();
    apply(check.checked);

    check.onchange = function () {
      Store.setPhotoConsent(check.checked);
      apply(check.checked);
    };
  }

  // Сжатие фото до ширины ~900px и JPEG — экономим память устройства
  function compressAndSave(file) {
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var maxW = 900;
        var scale = Math.min(1, maxW / img.width);
        var canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        var dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        Store.addPhoto(dataUrl).then(function () { show(); });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function renderStats(photos) {
    var days = Store.totalActiveDays();
    document.getElementById('stat-days').textContent = days;
    document.getElementById('stat-days-label').textContent =
      window.plural(days, ['день ухода', 'дня ухода', 'дней ухода']);
    document.getElementById('stat-streak').textContent = Store.currentStreak();
    document.getElementById('stat-photos').textContent = photos.length;
  }

  function renderGrid(photos) {
    var grid = document.getElementById('photo-grid');
    grid.innerHTML = '';

    if (!photos.length) {
      grid.innerHTML = '<p class="empty" style="grid-column:1/-1">Пока нет фото.<br>Сделайте первый снимок сегодня —<br>и через месяц сравните результат 🌸</p>';
      return;
    }

    photos.forEach(function (p) {
      var cell = document.createElement('div');
      cell.className = 'photo-cell' + (selected.indexOf(p.id) !== -1 ? ' is-selected' : '');
      cell.innerHTML =
        '<img src="' + p.img + '" alt="фото" />' +
        '<div class="photo-cell__date">' + shortDate(p.date) + '</div>' +
        '<button class="photo-cell__del" title="Удалить">✕</button>';

      // Выбор для сравнения
      cell.querySelector('img').onclick = function () { toggleSelect(p.id); };
      // Удаление
      cell.querySelector('.photo-cell__del').onclick = function (e) {
        e.stopPropagation();
        if (confirm('Удалить это фото?')) {
          Store.deletePhoto(p.id).then(function () {
            selected = selected.filter(function (id) { return id !== p.id; });
            show();
          });
        }
      };
      grid.appendChild(cell);
    });
  }

  function toggleSelect(id) {
    var i = selected.indexOf(id);
    if (i !== -1) selected.splice(i, 1);
    else {
      selected.push(id);
      if (selected.length > 2) selected.shift(); // держим максимум 2
    }
    show();
  }

  function renderCompare(photos) {
    var box = document.getElementById('compare-box');
    var chosen = photos.filter(function (p) { return selected.indexOf(p.id) !== -1; });
    chosen.sort(function (a, b) { return a.date - b.date; });

    if (chosen.length === 2) {
      box.className = 'compare is-active';
      box.innerHTML =
        '<figure><img src="' + chosen[0].img + '"><figcaption>До · ' + shortDate(chosen[0].date) + '</figcaption></figure>' +
        '<figure><img src="' + chosen[1].img + '"><figcaption>После · ' + shortDate(chosen[1].date) + '</figcaption></figure>';
    } else if (chosen.length === 1) {
      box.className = 'compare';
      box.innerHTML = '';
      // показываем подсказку под кнопкой через отдельный элемент? проще — очистим
    } else {
      box.className = 'compare';
      box.innerHTML = '';
    }
  }

  function show() {
    Store.getPhotos().then(function (photos) {
      renderStats(photos);
      renderGrid(photos);
      renderCompare(photos);
    });
  }

  return { init: init, show: show };
})();
