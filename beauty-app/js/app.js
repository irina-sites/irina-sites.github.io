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

  // ---- Точка входа ----
  if (Store.isOnboarded()) {
    launchApp();
  } else {
    startQuiz();
  }

  // ---- Регистрация service worker (офлайн-режим) ----
  if ('serviceWorker' in navigator) {
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
