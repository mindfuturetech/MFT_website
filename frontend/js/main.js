document.addEventListener('DOMContentLoaded', () => {

  // ---- Navbar scroll effect ----
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });

  // ---- Mobile nav toggle ----
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    navToggle.classList.toggle('active');
  });

  // ---- Dropdown & Mega Menu toggle ----
  const allDropdowns = document.querySelectorAll('.nav-dropdown');

  allDropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.nav-dropdown-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('open');

      allDropdowns.forEach(d => {
        d.classList.remove('open');
        d.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        dropdown.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });
  });

  document.addEventListener('click', () => {
    allDropdowns.forEach(d => {
      d.classList.remove('open');
      d.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
    });
  });

  document.querySelectorAll('.mega-menu, .nav-dropdown-menu').forEach(menu => {
    menu.addEventListener('click', e => e.stopPropagation());
  });

  // Close mobile nav on link click
  navLinks.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('active');
      allDropdowns.forEach(d => {
        d.classList.remove('open');
        d.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
      });
    });
  });

  // ---- Active nav link on scroll ----
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-link[href^="#"], .mega-item[href^="#"], .nav-dropdown-item[href^="#"]');

  const observerNav = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navAnchors.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === `#${id}`);
          });
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  sections.forEach(section => observerNav.observe(section));

  // ---- Scroll-triggered fade-up animations ----
  const fadeEls = document.querySelectorAll('.fade-up');
  const fadeObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  fadeEls.forEach(el => fadeObserver.observe(el));

  // ---- Table row stagger animation ----
  const tableRows = document.querySelectorAll('.table-row');
  const tableObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          tableRows.forEach((row, i) => {
            setTimeout(() => row.classList.add('visible'), i * 80);
          });
          tableObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  const tableWrapper = document.querySelector('.table-wrapper');
  if (tableWrapper) tableObserver.observe(tableWrapper);

  // ---- Counter animation for hero stats ----
  const counters = document.querySelectorAll('.stat-num');
  let countersAnimated = false;

  const counterObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !countersAnimated) {
          countersAnimated = true;
          counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'), 10);
            animateCounter(counter, target);
          });
        }
      });
    },
    { threshold: 0.5 }
  );

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) counterObserver.observe(heroStats);

  function animateCounter(el, target) {
    const duration = 1800;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }

    requestAnimationFrame(step);
  }

  // ---- Video stat counter animation ----
  const videoStats = document.querySelectorAll('.video-stat-num');
  const videoStatObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          videoStats.forEach(stat => {
            stat.style.animation = 'scaleIn 0.6s ease forwards';
          });
          videoStatObserver.disconnect();
        }
      });
    },
    { threshold: 0.5 }
  );

  const videoSection = document.querySelector('.video-section');
  if (videoSection) videoStatObserver.observe(videoSection);

  // ---- Contact form handler ----
  const contactForm = document.getElementById('contactForm');
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const btn = contactForm.querySelector('.btn-primary');
    const originalText = btn.textContent;
    btn.textContent = 'Message Sent!';
    btn.style.background = '#5a9e8f';
    contactForm.reset();

    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
    }, 3000);
  });

  // ---- Smooth anchor scrolling with offset ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ---- Mega menu item stagger animation on open ----
  allDropdowns.forEach(dropdown => {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(m => {
        if (m.attributeName === 'class') {
          const items = dropdown.querySelectorAll('.mega-item');
          if (dropdown.classList.contains('open')) {
            items.forEach((item, i) => {
              item.style.opacity = '0';
              item.style.transform = 'translateY(8px)';
              setTimeout(() => {
                item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
              }, i * 40);
            });
          }
        }
      });
    });
    observer.observe(dropdown, { attributes: true });
  });

});
