/* ============================================================
   ГЛАВНЫЙ МОДУЛЬ
   Решает, показать тест или приложение; управляет навигацией.
   ============================================================ */

(function () {
  var quizScreen = document.getElementById('screen-quiz');
  var app = document.getElementById('app');

  // ---- Переключение экранов приложения ----
  function switchScreen(screenId) {
    Array.prototype.forEach.call(document.querySelectorAll('.app .screen'), function (s) {
      s.classList.toggle('is-hidden', s.id !== screenId);
    });
    Array.prototype.forEach.call(document.querySelectorAll('.nav__item'), function (n) {
      n.classList.toggle('is-active', n.getAttribute('data-screen') === screenId);
    });

    // Обновляем данные при входе на экран
    if (screenId === 'screen-routine')   Routine.show();
    if (screenId === 'screen-facegym')   FaceGym.show();
    if (screenId === 'screen-progress')  Progress.show();
    if (screenId === 'screen-knowledge') Content.showKnowledge();
    if (screenId === 'screen-profile')   Content.showProfile(startQuiz);

    window.scrollTo(0, 0);
  }

  // ---- Запуск основного приложения ----
  function launchApp() {
    quizScreen.classList.add('is-hidden');
    app.classList.remove('is-hidden');
    Routine.init();
    FaceGym.init();
    Progress.init();
    switchScreen('screen-routine');
  }

  // ---- Запуск теста ----
  function startQuiz() {
    app.classList.add('is-hidden');
    quizScreen.classList.remove('is-hidden');
    Quiz.start(document.getElementById('quiz-container'), function () {
      launchApp();
    });
  }

  // ---- Навигация снизу ----
  Array.prototype.forEach.call(document.querySelectorAll('.nav__item'), function (btn) {
    btn.onclick = function () { switchScreen(btn.getAttribute('data-screen')); };
  });

  // ---- Параметры адреса для снимков в портфолио (обычную работу не меняют) ----
  // ?static — без service worker; ?screen=routine|facegym|progress|knowledge|profile|quiz — открыть экран
  var query = new URLSearchParams(location.search);
  var isStatic = query.has('static');
  if (isStatic) document.documentElement.classList.add('static');
  var wantScreen = query.get('screen');

  // ---- Точка входа ----
  if (wantScreen === 'quiz') {
    startQuiz();
  } else if (Store.isOnboarded()) {
    launchApp();
    if (wantScreen) switchScreen('screen-' + wantScreen);
  } else {
    startQuiz();
  }

  // ---- Регистрация service worker (офлайн-режим) ----
  if (!isStatic && 'serviceWorker' in navigator) {
    // Когда обновлённая версия берёт управление — один раз перезагружаем страницу,
    // чтобы новые функции появлялись сразу, без ручной очистки кэша.
    var refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('service-worker.js').catch(function () {});
    });
  }
})();
