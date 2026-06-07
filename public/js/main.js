// Entry point. With Astro View Transitions, page content is swapped without a
// full reload, so per-page setup runs on every `astro:page-load`. It also runs
// once on the initial DOM-ready so the first paint never waits on the router —
// every binder is idempotent (guarded per element) so the overlapping initial
// `astro:page-load` is a harmless no-op.

const bindOnce = (el) => {
  if (!el || el.dataset.pcBound === "1") return false;
  el.dataset.pcBound = "1";
  return true;
};

// ---------- Mobile nav toggle ----------
const setupNav = (body) => {
  const navToggle = document.querySelector(".nav-toggle");
  const mobileNav = document.getElementById("menu-mobile");
  if (!navToggle || !mobileNav) return;

  const NAV_TRANSITION_MS = 300;

  const setNavState = (open) => {
    navToggle.setAttribute("aria-expanded", String(open));
    mobileNav.setAttribute("aria-hidden", open ? "false" : "true");
    mobileNav.toggleAttribute("inert", !open);
    if (open) {
      mobileNav.hidden = false;
    }
    mobileNav.classList.toggle("is-open", open);
    body.classList.toggle("no-scroll", open);

    if (!open) {
      const handleTransitionEnd = () => {
        if (!mobileNav.classList.contains("is-open")) {
          mobileNav.hidden = true;
        }
      };
      mobileNav.addEventListener("transitionend", handleTransitionEnd, { once: true });
      setTimeout(handleTransitionEnd, NAV_TRANSITION_MS);
    }
  };

  setNavState(false);

  if (!bindOnce(navToggle)) return;

  navToggle.addEventListener("click", () => {
    const open = navToggle.getAttribute("aria-expanded") !== "true";
    setNavState(open);
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (navToggle.getAttribute("aria-expanded") === "true") {
        setNavState(false);
      }
    });
  });
};

// ---------- Theme toggle (light/dark) ----------
const setupThemeToggle = (root) => {
  const toggles = document.querySelectorAll("[data-theme-toggle]");
  if (!toggles.length) return;

  const lang = (root.getAttribute("lang") || "fr").toLowerCase().startsWith("en") ? "en" : "fr";
  const labels = {
    fr: { light: "Activer le thème clair", dark: "Activer le thème sombre" },
    en: { light: "Switch to light theme", dark: "Switch to dark theme" },
  };

  const syncLabels = () => {
    const isDark = root.getAttribute("data-theme") === "dark";
    const nextAction = isDark ? "light" : "dark";
    toggles.forEach((btn) => {
      btn.setAttribute("aria-label", labels[lang][nextAction]);
      btn.setAttribute("aria-pressed", String(isDark));
    });
  };

  syncLabels();

  toggles.forEach((btn) => {
    if (!bindOnce(btn)) return;
    btn.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch (_) {
        /* localStorage unavailable */
      }
      syncLabels();
    });
  });
};

// ---------- Scroll-triggered reveal animations ----------
const setupReveals = (prefersReducedMotion) => {
  const animatedElements = document.querySelectorAll("[data-animate]:not([data-pc-reveal])");
  if (!animatedElements.length) return;

  if (prefersReducedMotion) {
    animatedElements.forEach((el) => {
      el.dataset.pcReveal = "1";
      el.classList.add("is-visible");
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
  );
  animatedElements.forEach((el) => {
    el.dataset.pcReveal = "1";
    observer.observe(el);
  });
};

// ---------- Storyline step highlighting ----------
const setupStorylineSteps = () => {
  const storylineSteps = Array.from(document.querySelectorAll("[data-scroll-step]"));
  if (!storylineSteps.length || storylineSteps.every((s) => s.dataset.pcStep === "1")) return;

  const stepsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          storylineSteps.forEach((step) => step.classList.remove("is-active"));
          entry.target.classList.add("is-active");
        }
      });
    },
    { threshold: 0.5, rootMargin: "-20% 0px -20% 0px" }
  );
  storylineSteps.forEach((step) => {
    step.dataset.pcStep = "1";
    stepsObserver.observe(step);
  });
};

// ---------- Pointer tilt on cards ----------
const setupTilt = (prefersReducedMotion) => {
  if (prefersReducedMotion || !window.matchMedia("(pointer: fine)").matches) return;

  document.querySelectorAll("[data-tilt]").forEach((element) => {
    if (!bindOnce(element)) return;
    let rafId;
    const handleMove = (event) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const rotateX = ((event.clientY - centerY) / rect.height) * -6;
      const rotateY = ((event.clientX - centerX) / rect.width) * 6;

      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        element.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      });
    };

    const reset = () => {
      cancelAnimationFrame(rafId);
      element.style.transform = "";
    };

    element.addEventListener("pointermove", handleMove);
    element.addEventListener("pointerleave", reset);
  });
};

// ---------- Current year in footer ----------
const setupYear = () => {
  const yearEl = document.getElementById("annee-actuelle");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
};

// ---------- About carousel (desktop arrows) ----------
const setupAboutCarousel = () => {
  const aboutTrack = document.querySelector("[data-about-track]");
  const aboutPrev = document.querySelector("[data-about-prev]");
  const aboutNext = document.querySelector("[data-about-next]");
  if (!aboutTrack || !aboutPrev || !aboutNext) return;
  if (!bindOnce(aboutTrack)) return;

  const scrollCarousel = (direction = 1) => {
    const slideWidth = aboutTrack.clientWidth;
    aboutTrack.scrollBy({ left: slideWidth * direction, behavior: "smooth" });
  };
  aboutPrev.addEventListener("click", () => scrollCarousel(-1));
  aboutNext.addEventListener("click", () => scrollCarousel(1));
};

// ---------- About carousel (mobile dots) ----------
const setupAboutDots = () => {
  if (!window.matchMedia("(max-width: 720px)").matches) return;
  const track = document.querySelector("[data-about-track]");
  if (!track) return;
  if (track.parentElement?.querySelector(".about__dots")) return;
  const slides = Array.from(track.querySelectorAll(".about__pillar"));
  if (!slides.length) return;

  const dotsWrapper = document.createElement("div");
  dotsWrapper.className = "about__dots";

  const dots = slides.map((slide, index) => {
    const dot = document.createElement("span");
    dot.className = "about__dot";
    dot.setAttribute("aria-hidden", "true");
    dot.dataset.index = String(index);
    dot.addEventListener("click", () => {
      slide.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    dotsWrapper.appendChild(dot);
    return dot;
  });

  track.parentElement?.appendChild(dotsWrapper);

  const markActive = (activeIndex) => {
    dots.forEach((dot, idx) => {
      dot.classList.toggle("is-active", idx === activeIndex);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = slides.indexOf(entry.target);
          if (idx !== -1) {
            markActive(idx);
          }
        }
      });
    },
    { root: track, threshold: 0.6 }
  );

  slides.forEach((slide, idx) => {
    observer.observe(slide);
    if (idx === 0) {
      markActive(0);
    }
  });
};

// ---------- Contact form (async submit + feedback) ----------
const setupContactForm = (root) => {
  const contactForm = document.querySelector("[data-form]");
  if (!contactForm || !bindOnce(contactForm)) return;

  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const feedback = contactForm.querySelector(".form-feedback");
  const lang = (root.getAttribute("lang") || "fr").toLowerCase().startsWith("en") ? "en" : "fr";
  const labels = {
    fr: { sending: "envoi en cours…", error: "le formulaire n’a pas pu être envoyé. réessayez ou écrivez-moi directement." },
    en: { sending: "sending…", error: "sending failed. please try again or email me directly." },
  };

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!submitBtn) return;
    const originalLabel = submitBtn.textContent.trim();

    submitBtn.disabled = true;
    submitBtn.textContent = labels[lang].sending;
    if (feedback) {
      feedback.hidden = true;
    }

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error("request failed");
      }
      contactForm.reset();
      if (feedback) {
        feedback.hidden = false;
        feedback.dataset.state = "success";
      }
    } catch (error) {
      if (feedback) {
        feedback.hidden = false;
        feedback.textContent = labels[lang].error;
        feedback.dataset.state = "error";
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });
};

// ---------- Document-level listeners (bound once for the document lifetime) ----------
let documentListenersBound = false;
const bindDocumentListeners = () => {
  if (documentListenersBound) return;
  documentListenersBound = true;

  document.addEventListener("keydown", (event) => {
    // Escape closes the mobile nav.
    if (event.key === "Escape") {
      const navToggle = document.querySelector(".nav-toggle");
      if (navToggle && navToggle.getAttribute("aria-expanded") === "true") {
        navToggle.click();
        navToggle.focus();
      }
    }
    // Shift+D toggles the layout debug grid.
    if (event.key.toLowerCase() === "d" && event.shiftKey) {
      document.body.classList.toggle("layout-debug");
    }
  });
};

// ---------- Per-page initialisation (idempotent) ----------
const initPage = () => {
  const root = document.documentElement;
  const body = document.body;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  bindDocumentListeners();
  setupNav(body);
  setupThemeToggle(root);
  setupReveals(prefersReducedMotion);
  setupStorylineSteps();
  setupTilt(prefersReducedMotion);
  setupYear();
  setupAboutCarousel();
  setupAboutDots();
  setupContactForm(root);
};

// `astro:page-load` covers the initial load and every View Transition swap.
// We also run on DOM-ready so the first paint never depends on the router
// dispatching its event in time; idempotent binders make the overlap safe.
if (!window.__pcMainInitialised) {
  window.__pcMainInitialised = true;
  document.addEventListener("astro:page-load", initPage);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPage, { once: true });
  } else {
    initPage();
  }
}
