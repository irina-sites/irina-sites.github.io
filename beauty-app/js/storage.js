/* ============================================================
   ХРАНИЛИЩЕ ДАННЫХ
   - localStorage: профиль, отметки ухода, стрик, настройки.
   - IndexedDB:    фото «до/после» (могут быть большими).
   Всё остаётся на устройстве пользователя. Внешних запросов нет.
   ============================================================ */

// Русское склонение: plural(1,['день','дня','дней']) → 'день'
window.plural = function (n, forms) {
  var n10 = n % 10, n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return forms[0];
  if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return forms[1];
  return forms[2];
};

window.Store = (function () {
  var KEY = 'skincare40:v1';

  // ---- Модель по умолчанию ----
  function defaults() {
    return {
      profile: null,           // { skinType, concerns:[], onboarded, createdAt }
      checks: {},              // { 'YYYY-MM-DD': { morning:{stepId:true}, evening:{...} } }
      facegym: {},             // { 'YYYY-MM-DD': количество тренировок за день }
      settings: { remindMorning: '08:00', remindEvening: '21:00' },
      photoConsent: false      // согласие на хранение фото — спрашиваем до первого снимка
    };
  }

  var state = load();

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return defaults();
      var parsed = JSON.parse(raw);
      return Object.assign(defaults(), parsed);
    } catch (e) {
      return defaults();
    }
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  // ---- Дата в формате YYYY-MM-DD (локальная) ----
  function todayKey(d) {
    d = d || new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  // ---- Профиль ----
  function getProfile() { return state.profile; }
  function setProfile(p) {
    state.profile = Object.assign({ onboarded: true, createdAt: Date.now() }, p);
    save();
  }
  function isOnboarded() { return !!(state.profile && state.profile.onboarded); }

  // ---- Отметки ухода ----
  function getDayChecks(dateKey) {
    dateKey = dateKey || todayKey();
    if (!state.checks[dateKey]) state.checks[dateKey] = { morning: {}, evening: {} };
    return state.checks[dateKey];
  }

  function toggleStep(time, stepId, dateKey) {
    var day = getDayChecks(dateKey);
    if (day[time][stepId]) delete day[time][stepId];
    else day[time][stepId] = true;
    save();
    return !!day[time][stepId];
  }

  function isStepDone(time, stepId, dateKey) {
    var day = getDayChecks(dateKey);
    return !!day[time][stepId];
  }

  // День считается «выполненным», если отмечен хотя бы шаг ухода ИЛИ сделана гимнастика
  function isDayActive(dateKey) {
    if (state.facegym[dateKey]) return true;
    var d = state.checks[dateKey];
    if (!d) return false;
    return Object.keys(d.morning).length > 0 || Object.keys(d.evening).length > 0;
  }

  // ---- Гимнастика для лица ----
  function markFaceGym(dateKey) {
    dateKey = dateKey || todayKey();
    state.facegym[dateKey] = (state.facegym[dateKey] || 0) + 1;
    save();
  }
  function faceGymToday() { return state.facegym[todayKey()] || 0; }
  function totalFaceGymSessions() {
    return Object.keys(state.facegym).reduce(function (sum, k) { return sum + state.facegym[k]; }, 0);
  }

  // Всего активных дней (для статистики)
  function totalActiveDays() {
    return Object.keys(state.checks).filter(isDayActive).length;
  }

  // ---- Стрик: сколько дней подряд заканчивая сегодня (или вчера) ----
  function currentStreak() {
    var streak = 0;
    var d = new Date();
    // Если сегодня ещё не отмечали — стрик может продолжаться со вчера
    if (!isDayActive(todayKey(d))) d.setDate(d.getDate() - 1);
    while (isDayActive(todayKey(d))) {
      streak++;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }

  // ---- Настройки ----
  function getSettings() { return state.settings; }
  function setSettings(s) { state.settings = Object.assign(state.settings, s); save(); }

  // ---- Полный сброс (для «пройти тест заново») ----
  function resetProfile() { state.profile = null; save(); }

  /* ---- Согласие на хранение фото ---- */
  function photoConsent() { return !!state.photoConsent; }
  function setPhotoConsent(v) { state.photoConsent = !!v; save(); }

  /* ---- Полное удаление всех данных ----
     Право на удаление должно работать одним действием, а не «почистите
     кэш браузера». Стираем и localStorage, и базу с фото. */
  function eraseEverything() {
    return deleteAllPhotos().then(function () {
      state = defaults();
      try { localStorage.removeItem(KEY); } catch (e) {}
    });
  }

  /* ================= IndexedDB для фото ================= */
  var DB_NAME = 'skincare40-photos';
  var STORE = 'photos';
  var dbPromise = null;

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: 'id' });
        }
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
    return dbPromise;
  }

  function addPhoto(dataUrl) {
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, 'readwrite');
        var rec = { id: 'p_' + Date.now(), date: Date.now(), img: dataUrl };
        tx.objectStore(STORE).put(rec);
        tx.oncomplete = function () { resolve(rec); };
        tx.onerror = function () { reject(tx.error); };
      });
    });
  }

  function deleteAllPhotos() {
    return new Promise(function (resolve) {
      dbPromise = null;                       // следующий вызов откроет базу заново
      var req = indexedDB.deleteDatabase(DB_NAME);
      req.onsuccess = req.onerror = req.onblocked = function () { resolve(); };
    });
  }

  function getPhotos() {
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, 'readonly');
        var req = tx.objectStore(STORE).getAll();
        req.onsuccess = function () {
          var list = req.result || [];
          list.sort(function (a, b) { return a.date - b.date; }); // от старых к новым
          resolve(list);
        };
        req.onerror = function () { reject(req.error); };
      });
    });
  }

  function deletePhoto(id) {
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).delete(id);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error); };
      });
    });
  }

  return {
    todayKey: todayKey,
    getProfile: getProfile,
    setProfile: setProfile,
    isOnboarded: isOnboarded,
    resetProfile: resetProfile,
    getDayChecks: getDayChecks,
    toggleStep: toggleStep,
    isStepDone: isStepDone,
    isDayActive: isDayActive,
    totalActiveDays: totalActiveDays,
    currentStreak: currentStreak,
    markFaceGym: markFaceGym,
    faceGymToday: faceGymToday,
    totalFaceGymSessions: totalFaceGymSessions,
    getSettings: getSettings,
    setSettings: setSettings,
    addPhoto: addPhoto,
    getPhotos: getPhotos,
    deletePhoto: deletePhoto,
    deleteAllPhotos: deleteAllPhotos,
    photoConsent: photoConsent,
    setPhotoConsent: setPhotoConsent,
    eraseEverything: eraseEverything
  };
})();
