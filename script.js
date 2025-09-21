document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navAnchors = document.querySelectorAll('.nav-links a');
  const modeToggle = document.getElementById('modeToggle');
  const body = document.body;
  const yearEl = document.getElementById('year');
  let storedTheme = null;
  try {
    storedTheme = localStorage.getItem('brightside-theme');
  } catch (error) {
    storedTheme = null;
  }
  const canObserve = typeof IntersectionObserver !== 'undefined';

  body.classList.add('js-enabled');

  if (navToggle) {
    navToggle.setAttribute('aria-expanded', 'false');
  }

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  if (storedTheme === 'dark') {
    body.classList.add('dark-mode');
    if (modeToggle) {
      modeToggle.setAttribute('aria-pressed', 'true');
      modeToggle.textContent = 'Toggle light mode';
    }
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.classList.toggle('active', isOpen);
    });

    navAnchors.forEach((anchor) => {
      anchor.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.classList.remove('active');
      });
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 720) {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.classList.remove('active');
      }
    });

    document.addEventListener('keyup', (event) => {
      if (event.key === 'Escape' && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.classList.remove('active');
        navToggle.focus();
      }
    });

    document.addEventListener('click', (event) => {
      if (!navLinks.classList.contains('open')) {
        return;
      }

      if (!navLinks.contains(event.target) && !navToggle.contains(event.target)) {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.classList.remove('active');
      }
    });
  }

  if (modeToggle) {
    modeToggle.addEventListener('click', () => {
      const isDarkMode = body.classList.toggle('dark-mode');
      modeToggle.setAttribute('aria-pressed', String(isDarkMode));
      modeToggle.textContent = isDarkMode ? 'Toggle light mode' : 'Toggle dark mode';
      try {
        localStorage.setItem('brightside-theme', isDarkMode ? 'dark' : 'light');
      } catch (error) {
        /* storage not available */
      }
    });
  }

  const sections = document.querySelectorAll('section[id]');
  const observerOptions = {
    threshold: 0.4,
    rootMargin: '0px 0px -20% 0px'
  };

  if (canObserve) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute('id');
        const navItem = document.querySelector(`.nav-links a[href="#${id}"]`);
        if (navItem) {
          if (entry.isIntersecting) {
            navAnchors.forEach((anchor) => anchor.classList.remove('active'));
            navItem.classList.add('active');
          }
        }
      });
    }, observerOptions);

    sections.forEach((section) => sectionObserver.observe(section));
  } else if (navAnchors.length) {
    navAnchors[0].classList.add('active');
  }

  const statNumbers = document.querySelectorAll('.stat-number');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animateCount = (element) => {
    const target = Number(element.dataset.target || element.textContent);
    const duration = 1500;
    const start = performance.now();

    const step = (timestamp) => {
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = progress < 0.5
        ? 2 * progress * progress
        : -1 + (4 - 2 * progress) * progress;
      const value = Math.floor(target * eased);
      element.textContent = value.toLocaleString();
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = target.toLocaleString();
      }
    };

    requestAnimationFrame(step);
  };

  if (!prefersReducedMotion && statNumbers.length) {
    if (canObserve) {
      const statObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });

      statNumbers.forEach((number) => statObserver.observe(number));
    } else {
      statNumbers.forEach((number) => animateCount(number));
    }
  } else if (prefersReducedMotion) {
    statNumbers.forEach((number) => {
      number.textContent = Number(number.dataset.target || number.textContent).toLocaleString();
    });
  }
});
