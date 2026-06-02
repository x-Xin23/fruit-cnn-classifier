/**
 * GSAP Animation Engine — Premium Botanical Style
 *
 * Architecture:
 *  - gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)
 *  - gsap.matchMedia() for prefers-reduced-motion
 *  - Master Timeline for page-load entrance sequence
 *  - ScrollTrigger.batch() for fruit gallery cards
 *  - Parallax scrub on hero decorative circles
 *  - data-gsap-* attributes prevent double-animation
 *  - MutationObserver for Streamlit re-renders
 *
 * Runs inside a hidden st.components.v1.html() iframe.
 * Accesses parent DOM via window.parent.document.
 */

(function () {
  'use strict';

  var doc = window.parent.document;

  // ── Register Plugins ─────────────────────────────────────────
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  // ── gsap.matchMedia for accessibility ────────────────────────
  var mm = gsap.matchMedia();

  mm.add(
    {
      reduceMotion: '(prefers-reduced-motion: reduce)',
      allowMotion: '(prefers-reduced-motion: no-preference)',
    },
    function (context) {
      var rm = context.conditions.reduceMotion;
      var D = function (v) { return rm ? 0 : v; }; // duration helper

      // ── Helper: mark element to prevent double-animation ────
      function mark(el, attr) {
        if (!el || el.dataset[attr]) return false;
        el.dataset[attr] = '1';
        return true;
      }

      // ============================================================
      //  1. Master Timeline — Page Load Entrance
      // ============================================================
      function runMasterTimeline() {
        var heroSection = doc.querySelector('.hero-section');
        var heroTitle   = doc.querySelector('.hero-title');
        var heroSub     = doc.querySelector('.hero-subtitle');
        var heroTag     = doc.querySelector('.hero-tag');
        var uploadZone  = doc.querySelector('.upload-zone');

        if (!heroTitle || heroTitle.dataset.gsapMaster) return;
        heroTitle.dataset.gsapMaster = '1';
        if (heroSub) heroSub.dataset.gsapMaster = '1';
        if (heroTag) heroTag.dataset.gsapMaster = '1';

        var tl = gsap.timeline({
          defaults: { ease: 'power3.out' }
        });

        // Hero section container
        if (heroSection && mark(heroSection, 'gsapMaster')) {
          tl.from(heroSection, {
            autoAlpha: 0,
            y: 30,
            scale: 0.97,
            duration: D(0.8),
          });
        }

        // Hero title — big entrance
        tl.from(heroTitle, {
          autoAlpha: 0,
          y: -30,
          duration: D(0.7),
          ease: 'expo.out',
        }, '-=0.4');

        // Subtitle
        if (heroSub) {
          tl.from(heroSub, {
            autoAlpha: 0,
            y: -15,
            duration: D(0.5),
          }, '-=0.3');
        }

        // Tag with elastic pop
        if (heroTag) {
          tl.from(heroTag, {
            autoAlpha: 0,
            scale: 0.7,
            duration: D(0.5),
            ease: 'back.out(2)',
          }, '-=0.2');
        }

        // Upload zone
        if (uploadZone && mark(uploadZone, 'gsapMaster')) {
          tl.from(uploadZone, {
            autoAlpha: 0,
            y: 25,
            scale: 0.96,
            duration: D(0.6),
            ease: 'power2.out',
          }, '-=0.15');
        }
      }

      // ============================================================
      //  2. Hero Decorative Circles — Parallax Scrub
      // ============================================================
      function setupParallax() {
        if (rm) return;

        var decors = doc.querySelectorAll('.hero-decor');
        decors.forEach(function (d, i) {
          if (!mark(d, 'gsapParallax')) return;
          gsap.to(d, {
            y: (i % 2 === 0 ? -60 : 40),
            ease: 'none',
            scrollTrigger: {
              trigger: d.closest('.hero-section') || d,
              start: 'top top',
              end: 'bottom top',
              scrub: 1.5,
            },
          });
        });
      }

      // ============================================================
      //  3. Fruit Gallery — ScrollTrigger.batch()
      // ============================================================
      function setupFruitGallery() {
        var cards = doc.querySelectorAll('.fruit-card');
        if (cards.length === 0) return;

        // Initial state: hidden
        gsap.set(cards, { autoAlpha: 0, y: 30, scale: 0.9 });

        ScrollTrigger.batch(cards, {
          start: 'top 88%',
          onEnter: function (batch) {
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: D(0.5),
              ease: 'back.out(1.4)',
              stagger: { amount: 0.6, from: 'center' },
              overwrite: true,
            });
          },
          once: true,
        });
      }

      // ============================================================
      //  4. Section Dividers — Scroll-triggered
      // ============================================================
      function setupDividers() {
        var dividers = doc.querySelectorAll(
          '.section-divider:not([data-gsap-divider])'
        );
        dividers.forEach(function (d) {
          if (!mark(d, 'gsapDivider')) return;
          gsap.from(d, {
            autoAlpha: 0,
            scaleX: 0.3,
            duration: D(0.5),
            ease: 'expo.out',
            scrollTrigger: {
              trigger: d,
              start: 'top 90%',
              once: true,
            },
          });
        });
      }

      // ============================================================
      //  5. Result Card — Coordinated Timeline
      // ============================================================
      function animateResultCard() {
        var cards = doc.querySelectorAll(
          '.result-card:not([data-gsap-result])'
        );
        cards.forEach(function (card) {
          card.dataset.gsapResult = '1';

          var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

          // Card slides in
          tl.from(card, {
            autoAlpha: 0,
            y: 40,
            duration: D(0.7),
            clearProps: 'transform',
          });

          // Emoji pop with rotation
          var emoji = card.querySelector('.result-emoji');
          if (emoji) {
            tl.from(emoji, {
              scale: 0,
              rotation: -20,
              duration: D(0.55),
              ease: 'back.out(2.5)',
            }, '-=0.35');
          }

          // Fruit name
          var name = card.querySelector('.result-fruit-name');
          if (name) {
            tl.from(name, {
              autoAlpha: 0,
              x: -15,
              duration: D(0.4),
            }, '-=0.25');
          }

          // Confidence bar fill
          var bar = card.querySelector(
            '.confidence-bar-fill[data-target-width]'
          );
          if (bar) {
            var target = bar.getAttribute('data-target-width') || '0%';
            bar.style.width = '0%';
            tl.to(bar, {
              width: target,
              duration: D(1.2),
              ease: 'expo.out',
            }, '-=0.15');
          }

          // Scroll to results
          if (!rm) {
            try {
              tl.call(function () {
                gsap.to(window.parent, {
                  scrollTo: { y: card, offsetY: 24 },
                  duration: 0.7,
                  ease: 'power2.inOut',
                });
              }, null, '-=0.8');
            } catch (e) {}
          }
        });
      }

      // ============================================================
      //  6. Nutrition Cards — Staggered Entrance
      // ============================================================
      function animateNutritionCards() {
        var cards = doc.querySelectorAll(
          '.nutrition-card:not([data-gsap-nutrition])'
        );
        if (cards.length === 0) return;

        cards.forEach(function (c) {
          c.dataset.gsapNutrition = '1';
        });

        gsap.from(cards, {
          autoAlpha: 0,
          y: 30,
          scale: 0.92,
          duration: D(0.55),
          ease: 'back.out(1.4)',
          stagger: { amount: 0.4, from: 'center' },
          clearProps: 'transform',
          scrollTrigger: {
            trigger: cards[0],
            start: 'top 88%',
            once: true,
          },
        });
      }

      // ============================================================
      //  7. Benefits List — Staggered from left
      // ============================================================
      function animateBenefits() {
        var items = doc.querySelectorAll(
          '.benefits-list li:not([data-gsap-benefit])'
        );
        if (items.length === 0) return;

        items.forEach(function (i) {
          i.dataset.gsapBenefit = '1';
        });

        gsap.from(items, {
          autoAlpha: 0,
          x: -20,
          duration: D(0.4),
          ease: 'power2.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: items[0],
            start: 'top 90%',
            once: true,
          },
        });
      }

      // ============================================================
      //  8. Description Text — Fade in
      // ============================================================
      function animateDescription() {
        var desc = doc.querySelector(
          '.description-text:not([data-gsap-desc])'
        );
        if (!mark(desc, 'gsapDesc')) return;

        gsap.from(desc, {
          autoAlpha: 0,
          y: 15,
          duration: D(0.5),
          ease: 'power2.out',
          scrollTrigger: {
            trigger: desc,
            start: 'top 90%',
            once: true,
          },
        });
      }

      // ============================================================
      //  9. Fruit Card Hover — GSAP micro-interaction
      // ============================================================
      function setupFruitHover() {
        if (rm) return;

        var cards = doc.querySelectorAll('.fruit-card:not([data-gsap-hover])');
        cards.forEach(function (card) {
          card.dataset.gsapHover = '1';

          card.addEventListener('mouseenter', function () {
            gsap.to(card, {
              scale: 1.08,
              y: -4,
              duration: 0.3,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          });

          card.addEventListener('mouseleave', function () {
            gsap.to(card, {
              scale: 1,
              y: 0,
              duration: 0.35,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          });
        });
      }

      // ============================================================
      //  Run All
      // ============================================================
      function runAll() {
        runMasterTimeline();
        setupParallax();
        setupFruitGallery();
        setupDividers();
        animateResultCard();
        animateNutritionCards();
        animateBenefits();
        animateDescription();
        setupFruitHover();
      }

      // ── MutationObserver for Streamlit re-renders ─────────────
      var observer = new MutationObserver(function (mutations) {
        var hasNew = false;
        for (var i = 0; i < mutations.length; i++) {
          if (mutations[i].addedNodes.length > 0) {
            hasNew = true;
            break;
          }
        }
        if (hasNew) {
          setTimeout(runAll, 80);
          // Refresh ScrollTrigger after DOM changes
          setTimeout(function () {
            ScrollTrigger.refresh();
          }, 150);
        }
      });

      observer.observe(doc.body, { childList: true, subtree: true });

      // ── Initial run ──────────────────────────────────────────
      if (doc.readyState === 'loading') {
        doc.addEventListener('DOMContentLoaded', function () {
          setTimeout(runAll, 400);
        });
      } else {
        setTimeout(runAll, 400);
      }

      // cleanup
      return function () {
        observer.disconnect();
        ScrollTrigger.getAll().forEach(function (t) { t.kill(); });
      };
    }
  );
})();
