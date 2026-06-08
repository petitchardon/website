const docReady = (fn) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
};

docReady(() => {
  const root = document.documentElement;
  const body = document.body;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Mobile nav toggle ----------
  const navToggle = document.querySelector(".nav-toggle");
  const mobileNav = document.getElementById("menu-mobile");

  if (navToggle && mobileNav) {
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

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
        setNavState(false);
        navToggle.focus();
      }
    });
  }

  // ---------- Theme toggle (light/dark) ----------
  const themeToggles = document.querySelectorAll("[data-theme-toggle]");
  if (themeToggles.length) {
    const lang = (root.getAttribute("lang") || "fr").toLowerCase().startsWith("en") ? "en" : "fr";
    const labels = {
      fr: { light: "Activer le thème clair", dark: "Activer le thème sombre" },
      en: { light: "Switch to light theme", dark: "Switch to dark theme" },
    };
    const syncLabels = () => {
      const isDark = root.getAttribute("data-theme") === "dark";
      const nextAction = isDark ? "light" : "dark";
      themeToggles.forEach((btn) => {
        btn.setAttribute("aria-label", labels[lang][nextAction]);
        btn.setAttribute("aria-pressed", String(isDark));
      });
    };
    syncLabels();
    themeToggles.forEach((btn) => {
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
  }

  // ---------- Scroll-triggered animations ----------
  const animatedElements = document.querySelectorAll("[data-animate]");
  if (animatedElements.length) {
    if (prefersReducedMotion) {
      animatedElements.forEach((el) => el.classList.add("is-visible"));
    } else {
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
      animatedElements.forEach((el) => observer.observe(el));
    }
  }

  const storylineSteps = Array.from(document.querySelectorAll("[data-scroll-step]"));
  if (storylineSteps.length) {
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
    storylineSteps.forEach((step) => stepsObserver.observe(step));
  }

  // ---------- Pointer tilt on cards ----------
  if (!prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll("[data-tilt]").forEach((element) => {
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
  }

  // ---------- Current year in footer ----------
  const yearEl = document.getElementById("annee-actuelle");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ---------- About carousel (desktop arrows) ----------
  const aboutTrack = document.querySelector("[data-about-track]");
  const aboutPrev = document.querySelector("[data-about-prev]");
  const aboutNext = document.querySelector("[data-about-next]");
  if (aboutTrack && aboutPrev && aboutNext) {
    const scrollCarousel = (direction = 1) => {
      const slideWidth = aboutTrack.clientWidth;
      aboutTrack.scrollBy({ left: slideWidth * direction, behavior: "smooth" });
    };
    aboutPrev.addEventListener("click", () => scrollCarousel(-1));
    aboutNext.addEventListener("click", () => scrollCarousel(1));
  }

  // ---------- About carousel (mobile dots) ----------
  const aboutDotsSetup = () => {
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

  aboutDotsSetup();

  // ---------- Contact form (async submit + feedback) ----------
  const contactForm = document.querySelector("[data-form]");
  if (contactForm) {
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
          headers: { Accept: "application/json" }
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
  }

  // ---------- Debug grid (Shift+D) ----------
  document.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "d" && event.shiftKey) {
      document.body.classList.toggle("layout-debug");
    }
  });
});
