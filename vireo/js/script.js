document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Header scroll state ---------- */
  const header = document.getElementById('header');
  const toTopBtn = document.getElementById('toTop');

  const onScroll = () => {
    const scrolled = window.scrollY > 40;
    if (header) header.classList.toggle('is-scrolled', scrolled);
    if (toTopBtn) toTopBtn.classList.toggle('is-visible', window.scrollY > 600);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (toTopBtn) {
    toTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');

  const closeMenu = () => {
    if (!mobileMenu || !burger) return;
    mobileMenu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  /* ---------- Active nav link on scroll ---------- */
  const navLinks = document.querySelectorAll('.nav__link');
  /* href вида "index.html#services" — не селектор, querySelector на нём падает,
     поэтому берём только якоря внутри текущей страницы */
  const sections = Array.from(navLinks)
    .map(link => {
      const href = link.getAttribute('href') || '';
      return href.charAt(0) === '#' && href.length > 1 ? document.querySelector(href) : null;
    })
    .filter(Boolean);

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = `#${entry.target.id}`;
        navLinks.forEach(link => {
          link.classList.toggle('is-active', link.getAttribute('href') === id);
        });
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  sections.forEach(section => sectionObserver.observe(section));

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('is-revealed'), i * 40 % 200);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------- Portfolio filter ---------- */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const filter = btn.dataset.filter;

      portfolioCards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('is-hidden', !match);
      });
    });
  });

  /* ---------- Case modal ---------- */
  const caseModal = document.getElementById('caseModal');

  if (caseModal) {
    const modalTag = document.getElementById('caseModalTag');
    const modalTitle = document.getElementById('caseModalTitle');
    const modalChallenge = document.getElementById('caseModalChallenge');
    const modalSolution = document.getElementById('caseModalSolution');
    const modalResult = document.getElementById('caseModalResult');
    const modalStack = document.getElementById('caseModalStack');
    const modalDemoLink = document.getElementById('caseModalDemoLink');
    const modalCta = document.querySelector('.case-modal__cta');
    let lastFocusedEl = null;

    const openModal = (card) => {
      modalTag.textContent = card.dataset.tag || '';
      modalTitle.textContent = card.dataset.title || '';
      modalChallenge.textContent = card.dataset.challenge || '';
      modalSolution.textContent = card.dataset.solution || '';
      modalResult.textContent = card.dataset.result || '';
      modalStack.innerHTML = (card.dataset.stack || '')
        .split(',')
        .map(item => item.trim())
        .filter(Boolean)
        .map(item => `<span>${item}</span>`)
        .join('');

      const demoUrl = card.dataset.demoUrl;
      if (demoUrl) {
        modalDemoLink.href = demoUrl;
        modalDemoLink.hidden = false;
        modalDemoLink.classList.add('btn--primary');
        modalDemoLink.classList.remove('btn--ghost');
        modalCta.classList.add('btn--ghost');
        modalCta.classList.remove('btn--primary');
      } else {
        modalDemoLink.hidden = true;
        modalDemoLink.removeAttribute('href');
        modalCta.classList.add('btn--primary');
        modalCta.classList.remove('btn--ghost');
      }

      lastFocusedEl = document.activeElement;
      caseModal.classList.add('is-open');
      caseModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      caseModal.querySelector('.case-modal__close').focus();
    };

    const closeModal = () => {
      caseModal.classList.remove('is-open');
      caseModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocusedEl) lastFocusedEl.focus();
    };

    portfolioCards.forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('[data-stop-card-click]')) return;
        openModal(card);
      });
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openModal(card);
        }
      });
    });

    caseModal.querySelectorAll('[data-close-modal]').forEach(el => {
      el.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && caseModal.classList.contains('is-open')) closeModal();
    });
  }

  /* ---------- Testimonials slider ---------- */
  const track = document.getElementById('testimonialsTrack');
  const dotsWrap = document.getElementById('testDots');
  const prevBtn = document.getElementById('testPrev');
  const nextBtn = document.getElementById('testNext');
  const slides = track ? Array.from(track.children) : [];
  let current = 0;
  let autoTimer;

  const renderDots = () => {
    dotsWrap.innerHTML = '';
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Отзыв ${i + 1}`);
      if (i === current) dot.classList.add('is-active');
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
  };

  const goTo = (index) => {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    Array.from(dotsWrap.children).forEach((dot, i) => dot.classList.toggle('is-active', i === current));
  };

  const startAutoplay = () => {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 6000);
  };

  if (slides.length) {
    renderDots();
    prevBtn.addEventListener('click', () => { goTo(current - 1); startAutoplay(); });
    nextBtn.addEventListener('click', () => { goTo(current + 1); startAutoplay(); });
    startAutoplay();

    // basic touch swipe
    let touchStartX = 0;
    track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', (e) => {
      const diff = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(diff) > 40) {
        goTo(diff < 0 ? current + 1 : current - 1);
        startAutoplay();
      }
    }, { passive: true });
  }

  /* ---------- FAQ accordion ---------- */
  const accordionItems = document.querySelectorAll('.accordion__item');

  const setPanelHeight = (item, open) => {
    const panel = item.querySelector('.accordion__panel');
    panel.style.maxHeight = open ? `${panel.scrollHeight}px` : '0px';
  };

  accordionItems.forEach(item => {
    const trigger = item.querySelector('.accordion__trigger');
    setPanelHeight(item, item.classList.contains('is-open'));

    trigger.addEventListener('click', () => {
      const willOpen = !item.classList.contains('is-open');
      accordionItems.forEach(other => {
        other.classList.remove('is-open');
        setPanelHeight(other, false);
      });
      if (willOpen) {
        item.classList.add('is-open');
        setPanelHeight(item, true);
      }
    });
  });

  /* ---------- Stats counter ---------- */
  const statNums = document.querySelectorAll('.stat__num');
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1400;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => statsObserver.observe(el));

  /* ---------- Contact form ---------- */
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccess');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      /* галочка согласия помечена required — браузер сам не пустит дальше */
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      if (successMsg) {
        successMsg.classList.add('is-visible');
        setTimeout(() => successMsg.classList.remove('is-visible'), 6000);
      }
      form.reset();
    });
  }

});
