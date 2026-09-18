// load-components.js
document.addEventListener('DOMContentLoaded', function() {
  // Load Navbar
  fetch('navbar.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('navbar-placeholder').innerHTML = data;
      initializeNavbar();
      setActiveNavLink();
    })
    .catch(error => console.error('Error loading navbar:', error));

  // Load Footer
  fetch('footer.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('footer-placeholder').innerHTML = data;
    })
    .catch(error => console.error('Error loading footer:', error));

  // Re-initialize animations after components load
  setTimeout(() => {
    initializeAnimations();
  }, 300);
});

function initializeNavbar() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    }
  });

  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      navToggle.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });
  }

  const allDropdowns = document.querySelectorAll('.nav-dropdown');

  // ===== HOVER DROPDOWN (Desktop) =====
  allDropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.nav-dropdown-toggle');
    if (!toggle) return;

    dropdown.addEventListener('mouseenter', () => {
      if (window.innerWidth > 768) {
        allDropdowns.forEach(d => {
          if (d !== dropdown) {
            d.classList.remove('open');
            d.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
          }
        });
        dropdown.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });

    dropdown.addEventListener('mouseleave', () => {
      if (window.innerWidth > 768) {
        dropdown.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // ===== CLICK TOGGLE (Mobile) =====
    toggle.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.stopPropagation();
        const isOpen = dropdown.classList.contains('open');
        allDropdowns.forEach(d => {
          d.classList.remove('open');
          d.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          dropdown.classList.add('open');
          toggle.setAttribute('aria-expanded', 'true');
          // Auto-scroll the dropdown into view
          setTimeout(() => {
            dropdown.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      }
    });
  });

  // Close dropdowns when clicking outside (mobile)
  document.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      allDropdowns.forEach(d => {
        d.classList.remove('open');
        d.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
      });
    }
  });

  document.querySelectorAll('.mega-menu, .nav-dropdown-menu').forEach(menu => {
    menu.addEventListener('click', e => e.stopPropagation());
  });

  // ===== AI-style nested submenu (mobile toggle + scroll) =====
  document.querySelectorAll('.mega-item-wrapper.has-submenu').forEach(wrapper => {
    const link = wrapper.querySelector('.mega-item');
    if (!link) return;

    link.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        e.stopPropagation();
        const willOpen = !wrapper.classList.contains('open');

        // Close all other submenus
        document.querySelectorAll('.mega-item-wrapper.has-submenu').forEach(w => {
          if (w !== wrapper) w.classList.remove('open');
        });

        wrapper.classList.toggle('open', willOpen);

        // Auto-scroll the submenu into view
        if (willOpen) {
          setTimeout(() => {
            wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 150);
        }
      }
    });
  });

  /* =============================================
   Smart submenu position based on COLUMN
   - Left column items → submenu opens RIGHT
   - Right column items → submenu opens LEFT
   ============================================= */
function positionSubmenus() {
  if (window.innerWidth <= 768) return;

  const grid = document.querySelector('.industries-grid-2col');
  if (!grid) return;

  const wrappers = grid.querySelectorAll('.mega-item-wrapper.has-submenu');
  wrappers.forEach(wrapper => {
    // Clear previous state
    wrapper.classList.remove('submenu-left');

    // Get the grid item's position
    const itemRect = wrapper.getBoundingClientRect();
    const gridRect = grid.getBoundingClientRect();
    const gridCenterX = gridRect.left + gridRect.width / 2;

    // If item is in the RIGHT column (its center is past grid center), open submenu LEFT
    const itemCenterX = itemRect.left + itemRect.width / 2;
    if (itemCenterX > gridCenterX) {
      wrapper.classList.add('submenu-left');
    }
    // Otherwise, keep default (RIGHT side)
  });
}

 // Run on load
positionSubmenus();

// Run when Industries opens
const industriesDropdown = document.getElementById('industriesDropdown');
if (industriesDropdown) {
  const observer = new MutationObserver(() => {
    if (industriesDropdown.classList.contains('open')) {
      // Small delay to ensure rendering is done
      setTimeout(positionSubmenus, 50);
    }
  });
  observer.observe(industriesDropdown, { attributes: true, attributeFilter: ['class'] });

  // Also run on hover
  industriesDropdown.addEventListener('mouseenter', () => {
    setTimeout(positionSubmenus, 50);
  });
}

// Run on resize
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(positionSubmenus, 200);
});

  // Close mobile nav on link click
  if (navLinks) {
    navLinks.querySelectorAll('a[href^="#"], a[href^="index.html#"]').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle?.classList.remove('active');
        document.body.style.overflow = '';
        allDropdowns.forEach(d => {
          d.classList.remove('open');
          d.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
        });
      });
    });
  }

  // Smooth anchor scrolling
  if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
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
  }

  // Set active link on click
  document.querySelectorAll('.nav-link, .mega-item, .nav-dropdown-item').forEach(link => {
    link.addEventListener('click', function() {
      document.querySelectorAll('.nav-link, .mega-item, .nav-dropdown-item').forEach(l => {
        l.classList.remove('active');
      });
      this.classList.add('active');
    });
  });
}

function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link, .mega-item, .nav-dropdown-item');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href) {
      if (href === currentPage || (currentPage === 'index.html' && href === 'index.html')) {
        link.classList.add('active');
      }
      if (currentPage === 'fleet-safety.html' && href === 'fleet-safety.html') {
        link.classList.add('active');
      }
      if (currentPage === '360-ai.html' && href === '360-ai.html') {
        link.classList.add('active');
      }
      if (currentPage === 'fleet-management.html' && href === 'fleet-management.html') {
        link.classList.add('active');
      }
    }
  });
}

function initializeAnimations() {
  // Fade-up animations
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

  // Counter animations
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

  // Contact form handler
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
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
  }

  // Table row stagger animation
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

  // Initialize Hero Slider
  initHeroSlider();
}

// ===== HERO SLIDER FUNCTION =====
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-slider-dot');
  const prevBtn = document.querySelector('.hero-slider-arrow.prev');
  const nextBtn = document.querySelector('.hero-slider-arrow.next');
  
  if (slides.length === 0) return;
  
  let currentSlide = 0;
  let slideInterval;
  const slideDelay = 5000; // 5 seconds

  function goToSlide(index) {
    // Remove active from all slides
    slides.forEach((slide, i) => {
      slide.classList.remove('active');
      if (dots[i]) dots[i].classList.remove('active');
    });
    
    // Add active to current slide
    slides[index].classList.add('active');
    if (dots[index]) dots[index].classList.add('active');
    
    currentSlide = index;
  }

  function nextSlide() {
    const next = (currentSlide + 1) % slides.length;
    goToSlide(next);
  }

  function prevSlide() {
    const prev = (currentSlide - 1 + slides.length) % slides.length;
    goToSlide(prev);
  }

  function startSlider() {
    // Only auto-slide on desktop
    if (window.innerWidth > 768 && slides.length > 1) {
      stopSlider();
      slideInterval = setInterval(nextSlide, slideDelay);
    }
  }

  function stopSlider() {
    if (slideInterval) {
      clearInterval(slideInterval);
      slideInterval = null;
    }
  }

  // Dot clicks
  dots.forEach((dot, index) => {
    dot.addEventListener('click', function() {
      stopSlider();
      goToSlide(index);
      startSlider();
    });
  });

  // Arrow clicks
  if (prevBtn) {
    prevBtn.addEventListener('click', function() {
      stopSlider();
      prevSlide();
      startSlider();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function() {
      stopSlider();
      nextSlide();
      startSlider();
    });
  }

  // Pause on hover for desktop
  const slider = document.querySelector('.hero-slider');
  if (slider) {
    slider.addEventListener('mouseenter', stopSlider);
    slider.addEventListener('mouseleave', startSlider);
  }

  // Handle window resize
  let resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
      if (window.innerWidth > 768) {
        startSlider();
      } else {
        stopSlider();
      }
    }, 300);
  });

  // Start the slider
  goToSlide(0);
  setTimeout(startSlider, 1000);
}
// load-components.js
document.addEventListener('DOMContentLoaded', function() {
  // Detect if we're in the industries folder
  const isInIndustries = window.location.pathname.includes('/industries/');
  const basePath = isInIndustries ? '../' : '';
  
  // Load Navbar
  fetch(basePath + 'navbar.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('navbar-placeholder').innerHTML = data;
      initializeNavbar();
      setActiveNavLink();
    })
    .catch(error => console.error('Error loading navbar:', error));

  // Load Footer
  fetch(basePath + 'footer.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('footer-placeholder').innerHTML = data;
    })
    .catch(error => console.error('Error loading footer:', error));

  // Re-initialize animations after components load
  setTimeout(() => {
    initializeAnimations();
  }, 300);
});
