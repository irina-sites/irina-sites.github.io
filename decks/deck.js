(function () {
  'use strict';
  var root = document.documentElement;
  var q = location.search;
  var isStatic = /[?&]static/.test(q);
  if (isStatic) root.classList.add('static');

  var deck = document.querySelector('.deck');
  var slides = deck.querySelectorAll('.slide');
  var last = slides.length - 1;
  var cur = 0;

  var bar = document.createElement('i');
  bar.className = 'deck__bar';
  deck.appendChild(bar);

  var count = null;
  if (!isStatic) {
    var hud = document.createElement('div');
    hud.className = 'hud';
    hud.innerHTML =
      '<button type="button" data-go="prev" aria-label="Предыдущий слайд"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button>' +
      '<span class="count" aria-live="polite"></span>' +
      '<button type="button" data-go="next" aria-label="Следующий слайд"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></button>' +
      '<button type="button" data-go="full" aria-label="Во весь экран"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button>';
    document.body.appendChild(hud);
    count = hud.querySelector('.count');
    hud.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      var go = b.getAttribute('data-go');
      if (go === 'prev') show(cur - 1);
      if (go === 'next') show(cur + 1);
      if (go === 'full') toggleFull();
    });
    var tip = document.createElement('p');
    tip.className = 'tip';
    tip.textContent = 'Листать: стрелки, пробел или клик · F — во весь экран · Ctrl+P — сохранить в PDF';
    document.body.appendChild(tip);
    setTimeout(function () { tip.classList.add('is-off'); }, 5200);
  }

  function fit() {
    if (isStatic) return;
    var k = Math.min(innerWidth * 0.96 / 1600, (innerHeight - 20) * 0.96 / 900);
    deck.style.setProperty('--k', k);
  }
  window.addEventListener('resize', fit);
  fit();

  function show(n, push) {
    cur = Math.min(Math.max(n, 0), last);
    for (var i = 0; i < slides.length; i++) slides[i].classList.toggle('is-on', i === cur);
    bar.style.width = ((cur + 1) / slides.length * 100) + '%';
    if (count) count.textContent = (cur + 1) + ' / ' + slides.length;
    if (push !== false && !isStatic) history.replaceState(null, '', '#' + (cur + 1));
  }
  function toggleFull() {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (root.requestFullscreen) root.requestFullscreen();
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); show(cur + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); show(cur - 1); }
    else if (e.key === 'Home') { e.preventDefault(); show(0); }
    else if (e.key === 'End') { e.preventDefault(); show(last); }
    else if (e.key === 'f' || e.key === 'F' || e.key === 'а' || e.key === 'А') toggleFull();
  });
  // клик по слайду: правая часть — вперёд, левая треть — назад
  deck.addEventListener('click', function (e) {
    if (isStatic || e.target.closest('a, button')) return;
    var r = deck.getBoundingClientRect();
    if (e.clientX - r.left > r.width * 0.35) show(cur + 1); else show(cur - 1);
  });
  var x0 = null;
  deck.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  deck.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) show(dx < 0 ? cur + 1 : cur - 1);
    x0 = null;
  }, { passive: true });

  // открыть нужный слайд: ?slide=3 (для снимков) или #3 (ссылка на слайд)
  function fromHash(push) {
    var n = parseInt((location.hash || '').replace('#', ''), 10);
    show(isNaN(n) ? 0 : n - 1, push);
  }
  var m = /[?&]slide=(\d+)/.exec(q);
  if (m) show(+m[1] - 1, false);
  else {
    window.addEventListener('hashchange', function () { fromHash(false); });
    fromHash(false);
  }
})();
