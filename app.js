/* ============================================================
   JENIL FURNITURES — app.js
   Interaction Engine: Splash screen, scroll reveals, parallax,
   cursor, material viewer, drag-scroll, counter animation, form UX
   ============================================================ */

(function () {
  'use strict';

  /* ── Utility: throttle ───────────────────────────────────── */
  function throttle(fn, ms) {
    let last = 0;
    return function (...args) {
      const now = Date.now();
      if (now - last >= ms) {
        last = now;
        fn.apply(this, args);
      }
    };
  }

  /* ── 0. Splash Screen ────────────────────────────────────── */
  (function initSplash() {
    const splash = document.getElementById('splash-screen');
    if (!splash) return;

    // Total animation time: logo in (0.2s delay + 0.9s) + bar (0.9s delay + 1.4s) = ~2.6s
    // Add small buffer so it feels intentional
    const SPLASH_DURATION = 2800;

    setTimeout(function () {
      splash.classList.add('hidden');

      // Remove from DOM after fade out so it doesn't block interactions
      setTimeout(function () {
        splash.remove();
      }, 900);
    }, SPLASH_DURATION);
  })();

  /* ── 1. Custom Cursor ────────────────────────────────────── */
  (function initCursor() {
    const dot  = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    const label = document.getElementById('cursor-label');
    if (!dot || !ring) return;

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;

      dot.style.left  = mouseX + 'px';
      dot.style.top   = mouseY + 'px';
      label.style.left = mouseX + 'px';
      label.style.top  = mouseY + 'px';
    });

    function animateRing() {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      ring.style.left = ringX + 'px';
      ring.style.top  = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    // Expand on hover targets
    const expandTargets = document.querySelectorAll(
      '.space-card, .material-card, .project-item, .project-fullbleed, .btn-primary, .btn-ghost, .btn-submit, .nav-cta'
    );

    expandTargets.forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        document.body.classList.add('cursor-expand');
        const labelText = el.dataset.cursorLabel || 'Explore';
        label.textContent = labelText;
        document.body.classList.add('cursor-label-visible');
      });
      el.addEventListener('mouseleave', function () {
        document.body.classList.remove('cursor-expand');
        document.body.classList.remove('cursor-label-visible');
      });
    });

    // Set custom labels
    document.querySelectorAll('.space-card').forEach(function (el) {
      el.dataset.cursorLabel = 'View Space';
    });
    document.querySelectorAll('.material-card').forEach(function (el) {
      el.dataset.cursorLabel = 'Learn More';
    });
    document.querySelectorAll('.project-item, .project-fullbleed').forEach(function (el) {
      el.dataset.cursorLabel = 'View Project';
    });
    document.querySelectorAll('.btn-primary, .btn-submit, .nav-cta').forEach(function (el) {
      el.dataset.cursorLabel = 'Begin';
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', function () {
      dot.style.opacity  = '0';
      ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', function () {
      dot.style.opacity  = '1';
      ring.style.opacity = '1';
    });
  })();

  /* ── 2. Navigation Scroll Behaviour ─────────────────────── */
  (function initNav() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;

    function onScroll() {
      if (window.scrollY > 60) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', throttle(onScroll, 50));
    onScroll();
  })();

  /* ── 3. Mobile Navigation ────────────────────────────────── */
  (function initMobileNav() {
    const hamburger = document.getElementById('nav-hamburger');
    const mobileNav = document.getElementById('mobile-nav');
    const closeBtn  = document.getElementById('mobile-nav-close');
    const links     = document.querySelectorAll('.mobile-nav-link');
    if (!hamburger || !mobileNav) return;

    function openNav() {
      mobileNav.classList.add('open');
      mobileNav.setAttribute('aria-hidden', 'false');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closeNav() {
      mobileNav.classList.remove('open');
      mobileNav.setAttribute('aria-hidden', 'true');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', openNav);
    if (closeBtn) closeBtn.addEventListener('click', closeNav);
    links.forEach(function (link) {
      link.addEventListener('click', closeNav);
    });
  })();

  /* ── 4. Hero Parallax ────────────────────────────────────── */
  (function initParallax() {
    const bg = document.getElementById('hero-parallax-bg');
    if (!bg) return;

    function onScroll() {
      const scrollY = window.scrollY;
      const speed   = 0.35;
      bg.style.transform = 'scale(1.08) translateY(' + (scrollY * speed) + 'px)';
    }

    window.addEventListener('scroll', throttle(onScroll, 16));
  })();

  /* ── 5. Scroll-triggered Reveal ─────────────────────────── */
  (function initReveal() {
    const elements = document.querySelectorAll(
      '.reveal, .reveal-left, .reveal-right'
    );
    if (!elements.length) return;

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(function (el) {
      observer.observe(el);
    });
  })();

  /* ── 6. Spaces Tape Marquee — drag to scroll + pause on touch ── */
  (function initSpacesTape() {
    const scroller = document.getElementById('spaces-scroller');
    const track    = document.getElementById('spaces-track');
    if (!track || !scroller) return;

    /* ── Touch: pause while finger is on screen ─────────────── */
    scroller.addEventListener('touchstart', function () {
      track.style.animationPlayState = 'paused';
    }, { passive: true });

    scroller.addEventListener('touchend', function () {
      track.style.animationPlayState = 'running';
    }, { passive: true });

    /* ── Mouse drag: pause + manual scroll ───────────────────── */
    let isDragging   = false;
    let startX       = 0;
    let dragOffset   = 0;      // accumulated drag px
    let baseOffset   = 0;      // where the CSS animation was when we paused

    function getMatrixX(el) {
      const style  = window.getComputedStyle(el);
      const matrix = new DOMMatrix(style.transform);
      return matrix.m41; // translateX value in px
    }

    scroller.addEventListener('mousedown', function (e) {
      isDragging = true;
      startX     = e.clientX;
      baseOffset = getMatrixX(track);
      track.style.animationPlayState = 'paused';
      // Freeze the animation at its current position
      track.style.transform = 'translateX(' + baseOffset + 'px)';
      track.style.animation = 'none';
      scroller.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      dragOffset = e.clientX - startX;
      track.style.transform = 'translateX(' + (baseOffset + dragOffset) + 'px)';
    });

    window.addEventListener('mouseup', function () {
      if (!isDragging) return;
      isDragging = false;
      scroller.style.cursor = 'grab';

      // Work out how far we've dragged as a fraction of the full loop distance
      // (half the track width = one full set of cards)
      const halfW  = track.scrollWidth / 2;
      const curr   = baseOffset + dragOffset;
      // Normalise into [-halfW, 0] range
      let normX = ((curr % -halfW) - halfW) % -halfW;
      if (normX > 0) normX -= halfW;

      // Re-attach animation, starting from the normalised position via a
      // CSS custom property trick: shift animation-delay to fake a start offset
      const duration = 38; // seconds — must match CSS
      const delay    = (normX / -halfW) * duration;  // positive = already-elapsed

      track.style.transform    = '';
      track.style.animation    = 'marqueeScroll ' + duration + 's linear -' + delay.toFixed(3) + 's infinite';
      track.style.animationPlayState = 'running';
    });
  })();


  /* ── 7. Animated Counters ────────────────────────────────── */
  (function initCounters() {
    const counters = document.querySelectorAll('.stat-count');
    if (!counters.length) return;

    function animateCounter(el) {
      const target   = parseInt(el.dataset.target, 10);
      const duration = 2000;
      const step     = target / (duration / 16);
      let current    = 0;

      const timer = setInterval(function () {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        el.textContent = Math.floor(current);
      }, 16);
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (counter) {
      observer.observe(counter);
    });
  })();

  /* ── 8. Smooth Anchor Scroll ─────────────────────────────── */
  (function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href').slice(1);
        if (!targetId) return;
        const target = document.getElementById(targetId);
        if (!target) return;

        e.preventDefault();
        const navH = document.getElementById('main-nav');
        const offset = navH ? navH.offsetHeight : 80;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;

        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  })();

  /* ── 9. Consultation Form ────────────────────────────────── */
  (function initForm() {
    const form    = document.getElementById('consultation-form');
    const success = document.getElementById('form-success');
    const submitBtn = document.getElementById('consult-submit-btn');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Basic validation
      const name  = document.getElementById('consult-name');
      const email = document.getElementById('consult-email');
      const phone = document.getElementById('consult-phone');
      const type  = document.getElementById('consult-project-type');

      let valid = true;

      [name, email, phone, type].forEach(function (field) {
        if (!field.value.trim()) {
          field.style.borderColor = 'rgba(180, 100, 60, 0.7)';
          valid = false;
        } else {
          field.style.borderColor = '';
        }
      });

      if (!valid) return;

      // Simulate submission
      submitBtn.textContent = 'Sending…';
      submitBtn.style.opacity = '0.7';
      submitBtn.disabled = true;

      setTimeout(function () {
        form.style.opacity = '0';
        form.style.transform = 'translateY(-10px)';
        form.style.transition = 'opacity 0.5s, transform 0.5s';

        setTimeout(function () {
          form.style.display = 'none';
          if (success) {
            success.classList.add('visible');
            success.style.opacity = '0';
            success.style.transition = 'opacity 0.6s';
            setTimeout(function () {
              success.style.opacity = '1';
            }, 50);
          }
        }, 500);
      }, 1400);
    });

    // Clear error state on input
    form.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(function (field) {
      field.addEventListener('input', function () {
        this.style.borderColor = '';
      });
    });
  })();

  /* ── 10. Subtle section progress line ───────────────────── */
  (function initProgressLine() {
    const line = document.createElement('div');
    line.style.cssText = [
      'position: fixed',
      'top: 0',
      'left: 0',
      'height: 2px',
      'background: linear-gradient(to right, #8B6340, #B08050)',
      'z-index: 9998',
      'width: 0%',
      'transition: width 0.1s linear',
      'pointer-events: none'
    ].join(';');
    document.body.appendChild(line);

    window.addEventListener('scroll', throttle(function () {
      const scrollTop = window.scrollY;
      const docH      = document.body.scrollHeight - window.innerHeight;
      const pct       = docH > 0 ? (scrollTop / docH) * 100 : 0;
      line.style.width = pct + '%';
    }, 16));
  })();

  /* ── 11. Image parallax on project full-bleed ───────────── */
  (function initProjectParallax() {
    const fullbleed = document.getElementById('project-fullbleed');
    if (!fullbleed) return;
    const img = fullbleed.querySelector('img');
    if (!img) return;

    function onScroll() {
      const rect   = fullbleed.getBoundingClientRect();
      const wh     = window.innerHeight;
      const center = rect.top + rect.height / 2 - wh / 2;
      const offset = center * 0.08;
      img.style.transform = 'translateY(' + offset + 'px) scale(1.02)';
    }

    window.addEventListener('scroll', throttle(onScroll, 16));
  })();

  /* ── 12. Craft step hover animation ─────────────────────── */
  (function initCraftSteps() {
    document.querySelectorAll('.craft-step').forEach(function (step) {
      step.addEventListener('mouseenter', function () {
        const num = this.querySelector('.craft-step-num');
        if (num) {
          num.style.color = 'var(--bronze)';
          num.style.transition = 'color 0.4s';
        }
      });
      step.addEventListener('mouseleave', function () {
        const num = this.querySelector('.craft-step-num');
        if (num) {
          num.style.color = 'var(--beige)';
        }
      });
    });
  })();

})();
