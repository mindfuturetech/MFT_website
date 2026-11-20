/* =============================================
   Stats Counter — auto-detects any stats section
   Usage: add data-target / data-suffix / data-decimals / data-duration
   to any number span inside a section. No per-page JS needed.
   ============================================= */
(function () {
  'use strict';

  // 1. Find every number span that has a data-target attribute
  const numbers = document.querySelectorAll('[data-target]');
  if (!numbers.length) return;

  const animateCount = (el) => {
    const target   = parseFloat(el.dataset.target) || 0;
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix   = el.dataset.suffix || '';
    const duration = parseInt(el.dataset.duration || '2000', 10);
    const start    = performance.now();

    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(decimals) + suffix; // exact final value
    };
    requestAnimationFrame(step);
  };

  // 2. Group numbers by their closest stats-like ancestor so each
  //    section animates together when it scrolls into view.
  const sections = new Set();
  numbers.forEach((el) => {
    // Walk up to the nearest "section" or the stats wrapper
    const section = el.closest('section') || el.closest('[class*="stats"]') || el.parentElement;
    if (section) sections.add(section);
  });

  // 3. Observe each section once
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const els = entry.target.querySelectorAll('[data-target]');
      els.forEach((el) => {
        if (el.dataset.animated === 'true') return; // run only once per element
        el.dataset.animated = 'true';
        animateCount(el);
      });
      obs.unobserve(entry.target); // stop watching this section
    });
  }, { threshold: 0.35 });

  sections.forEach((s) => observer.observe(s));
})();