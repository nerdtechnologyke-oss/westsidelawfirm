/* =========================================================
   WESTadvocates — Shared site script
   ========================================================= */

(function () {
  'use strict';

  /* ---------- Preloader ---------- */
  window.addEventListener('load', function () {
    const pre = document.getElementById('preloader');
    if (pre) setTimeout(() => pre.classList.add('hidden'), 350);
  });

  /* ---------- AOS init ---------- */
  if (window.AOS) {
    AOS.init({ duration: 800, once: true, offset: 80, easing: 'ease-out-cubic' });
  }

  /* ---------- Navbar scroll + mobile ---------- */
  const nav = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 60) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');

    const top = document.querySelector('.scroll-top');
    if (top) {
      if (window.scrollY > 400) top.classList.add('show');
      else top.classList.remove('show');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
      })
    );
  }

  /* ---------- Scroll to top ---------- */
  const topBtn = document.querySelector('.scroll-top');
  if (topBtn) topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length) {
    const animate = (el) => {
      const target = +el.getAttribute('data-counter');
      const suffix = el.getAttribute('data-suffix') || '';
      const dur = 1800;
      const start = performance.now();
      const step = (t) => {
        const p = Math.min((t - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(eased * target).toLocaleString() + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); }
      });
    }, { threshold: .4 });
    counters.forEach(c => io.observe(c));
  }

  /* ---------- Testimonials slider ---------- */
  const slides = document.querySelectorAll('.testimonial');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.querySelector('.slider-prev');
  const nextBtn = document.querySelector('.slider-next');
  let idx = 0, autoTimer = null;

  function goTo(i) {
    if (!slides.length) return;
    idx = (i + slides.length) % slides.length;
    slides.forEach((s, j) => s.classList.toggle('active', j === idx));
    dots.forEach((d, j) => d.classList.toggle('active', j === idx));
  }
  function startAuto() { stopAuto(); autoTimer = setInterval(() => goTo(idx + 1), 6000); }
  function stopAuto() { if (autoTimer) clearInterval(autoTimer); }
  if (slides.length) {
    goTo(0); startAuto();
    if (prevBtn) prevBtn.addEventListener('click', () => { goTo(idx - 1); startAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { goTo(idx + 1); startAuto(); });
    dots.forEach((d, j) => d.addEventListener('click', () => { goTo(j); startAuto(); }));
  }

  /* ---------- Practice area filter ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const filterables = document.querySelectorAll('[data-cat]');
  if (filterBtns.length) {
    filterBtns.forEach(btn => btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-filter');
      filterables.forEach(el => {
        const show = cat === 'all' || el.getAttribute('data-cat') === cat;
        el.style.display = show ? '' : 'none';
      });
    }));
  }

  /* ---------- Attorney modal ---------- */
  const modal = document.getElementById('attorneyModal');
  const attorneyCards = document.querySelectorAll('[data-attorney]');
  if (modal && attorneyCards.length) {
    attorneyCards.forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('a')) return; // don't trigger on social links
        const data = JSON.parse(card.getAttribute('data-attorney'));
        modal.querySelector('.modal-img').src = data.img;
        modal.querySelector('.modal-img').alt = data.name;
        modal.querySelector('.modal-name').textContent = data.name;
        modal.querySelector('.modal-role').textContent = data.role;
        modal.querySelector('.modal-bio').textContent = data.bio;
        const ul = modal.querySelector('.modal-expertise');
        ul.innerHTML = '';
        data.expertise.forEach(item => {
          const li = document.createElement('li');
          li.innerHTML = `<i class="fa-solid fa-check"></i> ${item}`;
          ul.appendChild(li);
        });
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.closest('.modal-close')) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ---------- Form validation (consultation + contact) ---------- */
  const forms = document.querySelectorAll('[data-validate]');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll('[data-required]').forEach(field => {
        const group = field.closest('.form-group');
        const val = (field.value || '').trim();
        let ok = !!val;
        if (ok && field.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        if (ok && field.type === 'tel') ok = /^[\d\s+()\-]{7,}$/.test(val);
        if (!ok) valid = false;
        if (group) group.classList.toggle('has-error', !ok);
      });
      if (!valid) return;

      const success = document.getElementById('successModal');
      if (success) {
        success.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
      form.reset();
    });

    form.querySelectorAll('input, select, textarea').forEach(f => {
      f.addEventListener('input', () => {
        const g = f.closest('.form-group');
        if (g) g.classList.remove('has-error');
      });
    });
  });

  const successModal = document.getElementById('successModal');
  if (successModal) {
    successModal.addEventListener('click', (e) => {
      if (e.target === successModal || e.target.closest('[data-close-success]')) {
        successModal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ---------- Parallax hero ---------- */
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < 600) heroBg.style.transform = `scale(1.05) translateY(${y * 0.25}px)`;
    }, { passive: true });
  }

  /* ---------- Active nav link highlight ---------- */
  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (href === page || (page === '' && href === 'index.html')) a.classList.add('active');
  });
})();
