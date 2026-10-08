// =============================================
// MFT — Global Menu Controller
// Must be at the TOP so navbar inline onclick can find it
// =============================================

window.MFT = {

  isMobile: function () {
    return window.innerWidth <= 968;
  },

  closeAll: function () {
    document.querySelectorAll('.nav-dropdown').forEach(function (d) {
      d.classList.remove('open');
      var t = d.querySelector('.nav-dropdown-toggle');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
    document.querySelectorAll('.mega-item-wrapper.has-submenu').forEach(function (w) {
      w.classList.remove('open');
    });
  },

  toggleNav: function () {
    var navLinks = document.getElementById('navLinks');
    var navToggle = document.getElementById('navToggle');
    if (!navLinks || !navToggle) return;

    var isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('active', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
    if (!isOpen) this.closeAll();
  },

  toggleDropdown: function (id, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    var dropdown = document.getElementById(id);
    if (!dropdown) return;

    if (!this.isMobile()) return;

    var wasOpen = dropdown.classList.contains('open');

    this.closeAll();

    if (!wasOpen) {
      dropdown.classList.add('open');
      var t = dropdown.querySelector('.nav-dropdown-toggle');
      if (t) t.setAttribute('aria-expanded', 'true');
    }
  },

  toggleSubmenu: function (event) {
    if (!this.isMobile()) return;

    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    var link = event.currentTarget || event.target;
    var wrapper = link.closest('.mega-item-wrapper');
    if (!wrapper) return;

    var wasOpen = wrapper.classList.contains('open');

    document.querySelectorAll('.mega-item-wrapper.has-submenu').forEach(function (w) {
      if (w !== wrapper) w.classList.remove('open');
    });

    if (wasOpen) {
      wrapper.classList.remove('open');
    } else {
      wrapper.classList.add('open');
    }
  }

};
// =============================================
// load-components.js
// Loads navbar + footer dynamically
// Handles all menu interactions (desktop + mobile)
// =============================================

document.addEventListener('DOMContentLoaded', function () {
  // ---- Detect subfolder ----
  const path = window.location.pathname;
  let basePath = '';
  if (path.includes('/industries/') || path.includes('/solutions/')) {
    basePath = '../';
  }

  // ---- Load Navbar ----
  fetch(basePath + 'navbar.html?v=' + Date.now())
    .then(response => response.text())
    .then(data => {
      const placeholder = document.getElementById('navbar-placeholder');
      if (!placeholder) return;

      // Rewrite relative paths so links work from subfolders
      if (basePath) {
        data = data.replace(
          /href="(?!https?:|#|\/|\.\.\/|mailto:|tel:)([^"]+)"/g,
          `href="${basePath}$1"`
        );
        data = data.replace(
          /src="(?!https?:|\/|\.\.\/|data:)([^"]+)"/g,
          `src="${basePath}$1"`
        );
      }

      placeholder.innerHTML = data;
      initializeNavbar();
      setActiveNavLink();
    })
    .catch(error => console.error('Error loading navbar:', error));

  // ---- Load Footer ----
  fetch(basePath + 'footer.html?v=' + Date.now())
    .then(response => response.text())
    .then(data => {
      const placeholder = document.getElementById('footer-placeholder');
      if (!placeholder) return;

      if (basePath) {
        data = data.replace(
          /href="(?!https?:|#|\/|\.\.\/|mailto:|tel:)([^"]+)"/g,
          `href="${basePath}$1"`
        );
        data = data.replace(
          /src="(?!https?:|\/|\.\.\/|data:)([^"]+)"/g,
          `src="${basePath}$1"`
        );
      }

      placeholder.innerHTML = data;
    })
    .catch(error => console.error('Error loading footer:', error));

  // ---- Re-initialize animations after components load ----
  setTimeout(() => {
    initializeAnimations();
  }, 300);
});


// =============================================
// NAVBAR INITIALIZATION — single source of truth
// =============================================
// function initializeNavbar() {
//   const navbar = document.getElementById('navbar');
//   const navToggle = document.getElementById('navToggle');
//   const navLinks = document.getElementById('navLinks');

//   // ---- Scroll effect ----
//   if (navbar) {
//     window.addEventListener('scroll', () => {
//       navbar.classList.toggle('scrolled', window.scrollY > 20);
//     });
//   }

//   // ---- Hamburger toggle ----
//   if (navToggle && navLinks) {
//     navToggle.addEventListener('click', () => {
//       const isOpen = navLinks.classList.toggle('open');
//       navToggle.classList.toggle('active', isOpen);
//       document.body.style.overflow = isOpen ? 'hidden' : '';
//       if (!isOpen) {
//         closeAllDropdowns();
//         closeAllSubmenus();
//       }
//     });
//   }

//   // =============================================
//   // HELPERS — only ONE thing open at a time
//   // =============================================
//   function closeAllDropdowns(except) {
//     document.querySelectorAll('.nav-dropdown').forEach(d => {
//       if (d !== except) {
//         d.classList.remove('open');
//         d.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
//       }
//     });
//   }

//   function closeAllSubmenus(except) {
//     document.querySelectorAll('.mega-item-wrapper.has-submenu').forEach(w => {
//       if (w !== except) {
//         w.classList.remove('open');
//       }
//     });
//   }

//   const isMobile = () => window.innerWidth <= 968;

//   // =============================================
//   // DROPDOWN HANDLERS (Solutions / Industries / Company)
//   // =============================================
//   const allDropdowns = document.querySelectorAll('.nav-dropdown');

//   allDropdowns.forEach(dropdown => {
//     const toggle = dropdown.querySelector('.nav-dropdown-toggle');
//     if (!toggle) return;

//     // ---- Desktop: hover to open ----
//     dropdown.addEventListener('mouseenter', () => {
//       if (!isMobile()) {
//         closeAllDropdowns(dropdown);
//         closeAllSubmenus();
//         dropdown.classList.add('open');
//         toggle.setAttribute('aria-expanded', 'true');
//       }
//     });

//     dropdown.addEventListener('mouseleave', () => {
//       if (!isMobile()) {
//         dropdown.classList.remove('open');
//         toggle.setAttribute('aria-expanded', 'false');
//       }
//     });

//     // ---- Mobile: click to toggle ----
//     // toggle.addEventListener('click', (e) => {
//     //   if (isMobile()) {
//     //     e.preventDefault();
//     //     e.stopPropagation();

//     //     const wasOpen = dropdown.classList.contains('open');

//     //     // Close EVERYTHING (both dropdowns and submenus)
//     //     closeAllDropdowns();
//     //     closeAllSubmenus();

//     //     // Open this one if it wasn't open
//     //     if (!wasOpen) {
//     //       dropdown.classList.add('open');
//     //       toggle.setAttribute('aria-expanded', 'true');
//     //     }
//     //   }
//     // });
//   });

//   // =============================================
//   // SUBMENU HANDLERS (AI, Supply Chain, IoT, Billing, Computer Vision, Hospitality, HR, Security)
//   // =============================================
//   // document.querySelectorAll('.mega-item-wrapper.has-submenu').forEach(wrapper => {
//   //   const link = wrapper.querySelector('.mega-item');
//   //   if (!link) return;

//   //   link.addEventListener('click', (e) => {
//   //     if (isMobile()) {
//   //       e.preventDefault();
//   //       e.stopPropagation();

//   //       const wasOpen = wrapper.classList.contains('open');

//   //       // Close all other submenus (keep parent dropdown open)
//   //       closeAllSubmenus(wrapper);

//   //       // Toggle this one
//   //       wrapper.classList.toggle('open', !wasOpen);

//   //       // Scroll into view if opening
//   //       if (!wasOpen) {
//   //         setTimeout(() => {
//   //           wrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
//   //         }, 150);
//   //       }
//   //     }
//   //   });
//   // });

//   // =============================================
//   // CLOSE ALL on outside click (mobile)
//   // =============================================
//   document.addEventListener('click', (e) => {
//     if (isMobile()) {
//       // If click is outside the nav menu, close everything
//       if (!e.target.closest('.nav-links')) {
//         closeAllDropdowns();
//         closeAllSubmenus();
//       }
//     }
//   });

//   // Prevent mega menu clicks from closing everything
//   document.querySelectorAll('.mega-menu, .nav-dropdown-menu').forEach(menu => {
//     menu.addEventListener('click', e => e.stopPropagation());
//   });

//   // =============================================
//   // CLOSE MOBILE NAV when a real link is clicked
//   // =============================================
//   if (navLinks) {
//     navLinks.querySelectorAll('a[href]').forEach(link => {
//       link.addEventListener('click', () => {
//         // Only close if it's a real navigation (not a submenu toggle)
//         const href = link.getAttribute('href') || '';
//         if (href && href !== '#' && !link.classList.contains('mega-item')) {
//           // Reset states
//           navLinks.classList.remove('open');
//           navToggle?.classList.remove('active');
//           document.body.style.overflow = '';
//           closeAllDropdowns();
//           closeAllSubmenus();
//         }
//       });
//     });
//   }

//   // =============================================
//   // SMOOTH ANCHOR SCROLL
//   // =============================================
//   document.querySelectorAll('a[href^="#"]').forEach(anchor => {
//     anchor.addEventListener('click', e => {
//       const targetId = anchor.getAttribute('href');
//       if (targetId === '#') return;
//       const target = document.querySelector(targetId);
//       if (target) {
//         e.preventDefault();
//         target.scrollIntoView({ behavior: 'smooth' });
//       }
//     });
//   });
// }

function initializeNavbar() {
  const navbar = document.getElementById('navbar');

  // Scroll effect
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  // Desktop: hover to open dropdowns
  document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
    const toggle = dropdown.querySelector('.nav-dropdown-toggle');
    if (!toggle) return;

    dropdown.addEventListener('mouseenter', () => {
      if (window.innerWidth > 968) {
        window.MFT.closeAll();
        dropdown.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });

    dropdown.addEventListener('mouseleave', () => {
      if (window.innerWidth > 968) {
        dropdown.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Close mobile nav on real link click
  const navLinks = document.getElementById('navLinks');
  const navToggle = document.getElementById('navToggle');
  if (navLinks) {
    navLinks.querySelectorAll('a[href]').forEach(link => {
      link.addEventListener('click', (e) => {
        // Skip if it's a submenu toggle
        if (link.closest('.mega-item-wrapper.has-submenu')) return;
        // Skip anchor links
        const href = link.getAttribute('href') || '';
        if (href === '#' || (href.startsWith('#') && href.length > 1)) return;

        if (window.innerWidth <= 968) {
          navLinks.classList.remove('open');
          navToggle?.classList.remove('active');
          document.body.style.overflow = '';
        }
        window.MFT.closeAll();
      });
    });
  }

  // Smooth anchor scroll
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
// =============================================
// ACTIVE NAV LINK
// =============================================
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .mega-item, .nav-dropdown-item').forEach(link => {
    const href = link.getAttribute('href') || '';
    const cleanHref = href.split('?')[0].split('#')[0];
    if (cleanHref === currentPage) {
      link.classList.add('active');
    }
  });
}


// =============================================
// ANIMATIONS
// =============================================
function initializeAnimations() {
  // Fade-up
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

  // Video stats
  const videoStats = document.querySelectorAll('.video-stat-num');
  if (videoStats.length) {
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
  }

  // Contact form
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const btn = contactForm.querySelector('.btn-primary');
      if (!btn) return;
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

  // Table rows
  const tableRows = document.querySelectorAll('.table-row');
  if (tableRows.length) {
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
  }

  // Hero slider
  initHeroSlider();
}


// =============================================
// HERO SLIDER
// =============================================
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-slider-dot');
  const prevBtn = document.querySelector('.hero-slider-arrow.prev');
  const nextBtn = document.querySelector('.hero-slider-arrow.next');

  if (slides.length === 0) return;

  let currentSlide = 0;
  let slideInterval;
  const slideDelay = 5010;

  function goToSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.remove('active');
      if (dots[i]) dots[i].classList.remove('active');
    });
    slides[index].classList.add('active');
    if (dots[index]) dots[index].classList.add('active');
    currentSlide = index;
  }

  function nextSlide() {
    goToSlide((currentSlide + 1) % slides.length);
  }

  function prevSlide() {
    goToSlide((currentSlide - 1 + slides.length) % slides.length);
  }

  function startSlider() {
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

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      stopSlider();
      goToSlide(index);
      startSlider();
    });
  });

  if (prevBtn) prevBtn.addEventListener('click', () => { stopSlider(); prevSlide(); startSlider(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { stopSlider(); nextSlide(); startSlider(); });

  const slider = document.querySelector('.hero-slider');
  if (slider) {
    slider.addEventListener('mouseenter', stopSlider);
    slider.addEventListener('mouseleave', startSlider);
  }

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (window.innerWidth > 768) startSlider();
      else stopSlider();
    }, 300);
  });

  goToSlide(0);
  setTimeout(startSlider, 1000);
}
/* =============================================
   FINAL OVERRIDE — Force single dropdown behavior
   Works on top of everything. Cannot be overridden.
   ============================================= */

(function () {

  function isMobile() {
    return window.innerWidth <= 968;
  }

  function closeEverything() {
    document.querySelectorAll('.nav-dropdown').forEach(d => {
      d.classList.remove('open');
      const t = d.querySelector('.nav-dropdown-toggle');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
    document.querySelectorAll('.mega-item-wrapper.has-submenu').forEach(w => {
      w.classList.remove('open');
    });
  }

  // Use capture=true so we fire BEFORE any other handler
  document.addEventListener('click', function (e) {

    // Only handle mobile
    if (!isMobile()) return;

    // ---- Case 1: User tapped a dropdown toggle (Solutions/Industries/Company) ----
    const toggleBtn = e.target.closest('.nav-dropdown > .nav-dropdown-toggle');

    if (toggleBtn) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const dropdown = toggleBtn.parentElement;
      const wasOpen = dropdown.classList.contains('open');

      // Close EVERYTHING first
      closeEverything();

      // If it wasn't open before, open it now
      if (!wasOpen) {
        dropdown.classList.add('open');
        toggleBtn.setAttribute('aria-expanded', 'true');
      }

      return;
    }

    // ---- Case 2: User tapped a submenu link (AI, Hospitality, HR, etc.) ----
    const submenuLink = e.target.closest('.mega-item-wrapper.has-submenu > .mega-item');

    if (submenuLink) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const wrapper = submenuLink.closest('.mega-item-wrapper');
      const wasOpen = wrapper.classList.contains('open');

      // Close all OTHER submenus (keep parent dropdown open)
      document.querySelectorAll('.mega-item-wrapper.has-submenu').forEach(w => {
        if (w !== wrapper) w.classList.remove('open');
      });

      // Toggle this submenu
      wrapper.classList.toggle('open', !wasOpen);

      return;
    }

    // ---- Case 3: User tapped outside the menu ----
    if (!e.target.closest('.nav-links')) {
      closeEverything();
    }

  }, true);

  // Reset when resizing to desktop
  window.addEventListener('resize', function () {
    if (!isMobile()) {
      closeEverything();
    }
  });

})();