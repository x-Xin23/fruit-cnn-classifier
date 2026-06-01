/**
 * GSAP Animation Definitions for Fruit Recognition System.
 *
 * Designed to be embedded as a string into st.components.v1.html() iframes.
 * Uses window.parent.document to target the main Streamlit DOM.
 *
 * Features:
 *  - data-gsap-* attributes prevent double-animation
 *  - prefers-reduced-motion check for accessibility
 *  - clearProps to clean up inline styles after animation
 *  - MutationObserver for dynamic content (Streamlit re-renders)
 */

(function () {
  'use strict';

  var doc = window.parent.document;
  var prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  var DURATION = prefersReducedMotion ? 0.01 : 0.6;

  // ── Hero entrance ────────────────────────────────────────────
  function animateHero() {
    var title = doc.querySelector('.hero-title');
    var subtitle = doc.querySelector('.hero-subtitle');
    if (title && !title.dataset.gsapHero) {
      title.dataset.gsapHero = '1';
      gsap.from(title, {
        opacity: 0,
        y: -30,
        duration: DURATION + 0.2,
        ease: 'power3.out',
        delay: 0.1,
      });
    }
    if (subtitle && !subtitle.dataset.gsapHero) {
      subtitle.dataset.gsapHero = '1';
      gsap.from(subtitle, {
        opacity: 0,
        y: -15,
        duration: DURATION + 0.2,
        ease: 'power3.out',
        delay: 0.3,
      });
    }
  }

  // ── Upload zone entrance ─────────────────────────────────────
  function animateUploadZone() {
    var zone = doc.querySelector('.upload-zone');
    if (zone && !zone.dataset.gsapZone) {
      zone.dataset.gsapZone = '1';
      gsap.from(zone, {
        opacity: 0,
        scale: 0.95,
        duration: DURATION,
        ease: 'power2.out',
        delay: 0.4,
      });
    }
  }

  // ── Result card reveal ───────────────────────────────────────
  function animateResultCard() {
    var cards = doc.querySelectorAll('.result-card:not([data-gsap-result])');
    cards.forEach(function (card) {
      card.dataset.gsapResult = '1';
      gsap.from(card, {
        opacity: 0,
        y: 30,
        duration: DURATION,
        ease: 'power3.out',
        clearProps: 'transform',
      });
    });
  }

  // ── Confidence bar fill ──────────────────────────────────────
  function animateConfidenceBar() {
    var bars = doc.querySelectorAll(
      '.confidence-bar-fill[data-target-width]:not([data-gsap-bar])'
    );
    bars.forEach(function (bar) {
      bar.dataset.gsapBar = '1';
      var target = bar.getAttribute('data-target-width') || '0%';
      bar.style.width = '0%';
      gsap.to(bar, {
        width: target,
        duration: prefersReducedMotion ? 0.01 : 1.2,
        ease: 'power2.out',
        delay: prefersReducedMotion ? 0 : 0.3,
      });
    });
  }

  // ── Nutrition cards staggered ────────────────────────────────
  function animateNutritionCards() {
    var cards = doc.querySelectorAll(
      '.nutrition-card:not([data-gsap-nutrition])'
    );
    if (cards.length > 0) {
      cards.forEach(function (c) {
        c.dataset.gsapNutrition = '1';
      });
      gsap.from(cards, {
        opacity: 0,
        y: 20,
        duration: DURATION * 0.85,
        ease: 'power2.out',
        stagger: prefersReducedMotion ? 0 : 0.1,
        clearProps: 'transform',
      });
    }
  }

  // ── Benefits list staggered ──────────────────────────────────
  function animateBenefits() {
    var items = doc.querySelectorAll(
      '.benefits-list li:not([data-gsap-benefit])'
    );
    if (items.length > 0) {
      items.forEach(function (i) {
        i.dataset.gsapBenefit = '1';
      });
      gsap.from(items, {
        opacity: 0,
        x: -15,
        duration: DURATION * 0.7,
        ease: 'power2.out',
        stagger: prefersReducedMotion ? 0 : 0.08,
      });
    }
  }

  // ── Scroll to results ────────────────────────────────────────
  function scrollToResults() {
    if (prefersReducedMotion) return;
    var results = doc.querySelector('.result-card');
    if (results && !doc.body.dataset.gsapScrolled) {
      doc.body.dataset.gsapScrolled = '1';
      try {
        gsap.to(window.parent, {
          scrollTo: { y: results, offsetY: 20 },
          duration: 0.8,
          ease: 'power2.inOut',
        });
      } catch (e) {
        /* ScrollToPlugin may not be loaded */
      }
    }
  }

  // ── Run all ──────────────────────────────────────────────────
  function runAll() {
    animateHero();
    animateUploadZone();
    animateResultCard();
    animateConfidenceBar();
    animateNutritionCards();
    animateBenefits();
    scrollToResults();
  }

  // ── MutationObserver for Streamlit re-renders ────────────────
  var observer = new MutationObserver(function (mutations) {
    var hasNewNodes = false;
    for (var i = 0; i < mutations.length; i++) {
      if (mutations[i].addedNodes.length > 0) {
        hasNewNodes = true;
        break;
      }
    }
    if (hasNewNodes) {
      setTimeout(runAll, 50);
    }
  });

  observer.observe(doc.body, { childList: true, subtree: true });

  // ── Initial run ──────────────────────────────────────────────
  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', function () {
      setTimeout(runAll, 300);
    });
  } else {
    setTimeout(runAll, 300);
  }
})();
