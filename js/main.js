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

  const navToggle = document.querySelector(".nav-toggle");
  const mobileNav = document.getElementById("menu-mobile");

  const toggleNav = () => {
    if (!navToggle || !mobileNav) return;
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    mobileNav.hidden = expanded;
    mobileNav.classList.toggle("is-open", !expanded);
    body.classList.toggle("no-scroll", !expanded);
  };

  if (navToggle && mobileNav) {
    mobileNav.hidden = true;
    navToggle.addEventListener("click", toggleNav);
    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (navToggle.getAttribute("aria-expanded") === "true") {
          toggleNav();
        }
      });
    });
  }

  const animatedElements = document.querySelectorAll("[data-animate]");
  if (animatedElements.length) {
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

  root.setAttribute("data-theme", "dark");

  const LANGUAGE_KEY = "petitchardon-language";
  const languageButtons = document.querySelectorAll("[data-lang-toggle]");

  const collectOriginal = (element, datasetKey, getter) => {
    if (!element.dataset[datasetKey]) {
      element.dataset[datasetKey] = getter();
    }
  };

  const setTextContent = (element, value) => {
    element.innerHTML = value;
  };

  const applyLanguage = (lang) => {
    root.setAttribute("lang", lang === "en" ? "en" : "fr");
    localStorage.setItem(LANGUAGE_KEY, lang);

    document.querySelectorAll("[data-i18n-en]").forEach((el) => {
      collectOriginal(el, "i18nFr", () => el.innerHTML.trim());
      const frText = el.dataset.i18nFr || "";
      const enText = el.dataset.i18nEn || frText;
      setTextContent(el, lang === "en" ? enText : frText);
    });

    document.querySelectorAll("[data-i18n-en-placeholder]").forEach((el) => {
      collectOriginal(el, "i18nFrPlaceholder", () => el.getAttribute("placeholder") || "");
      const frValue = el.dataset.i18nFrPlaceholder || "";
      const enValue = el.dataset.i18nEnPlaceholder || frValue;
      el.setAttribute("placeholder", lang === "en" ? enValue : frValue);
    });

    document.querySelectorAll("[data-i18n-en-aria-label]").forEach((el) => {
      collectOriginal(el, "i18nFrAriaLabel", () => el.getAttribute("aria-label") || "");
      const frValue = el.dataset.i18nFrAriaLabel || "";
      const enValue = el.dataset.i18nEnAriaLabel || frValue;
      el.setAttribute("aria-label", lang === "en" ? enValue : frValue);
    });

    document.querySelectorAll("[data-i18n-en-title]").forEach((el) => {
      collectOriginal(el, "i18nFrTitle", () => el.getAttribute("title") || "");
      const frValue = el.dataset.i18nFrTitle || "";
      const enValue = el.dataset.i18nEnTitle || frValue;
      el.setAttribute("title", lang === "en" ? enValue : frValue);
    });

    document.querySelectorAll("[data-i18n-en-value]").forEach((el) => {
      collectOriginal(el, "i18nFrValue", () => el.getAttribute("value") || "");
      const frValue = el.dataset.i18nFrValue || "";
      const enValue = el.dataset.i18nEnValue || frValue;
      el.setAttribute("value", lang === "en" ? enValue : frValue);
    });

    languageButtons.forEach((btn) => {
      btn.setAttribute("aria-pressed", lang === "en" ? "true" : "false");
    });
  };

  const defaultLanguage = (() => {
    const stored = localStorage.getItem(LANGUAGE_KEY);
    if (stored) return stored;
    const browser = (navigator.language || "fr").slice(0, 2).toLowerCase();
    return browser === "en" ? "en" : "fr";
  })();

  applyLanguage(defaultLanguage);

  languageButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const nextLanguage = root.getAttribute("lang") === "en" ? "fr" : "en";
      applyLanguage(nextLanguage);
    });
  });

  const yearEl = document.getElementById("annee-actuelle");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

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

  const contactForm = document.querySelector("[data-form]");
  if (contactForm) {
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const feedback = contactForm.querySelector(".form-feedback");
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!submitBtn) return;

      const frLabel = submitBtn.dataset.i18nFr || submitBtn.textContent.trim();
      const enLabel = submitBtn.dataset.i18nEn || frLabel;
      const frSending = submitBtn.dataset.i18nFrSending || "envoi en cours…";
      const enSending = submitBtn.dataset.i18nEnSending || "sending…";
      const lang = root.getAttribute("lang") === "en" ? "en" : "fr";

      submitBtn.disabled = true;
      submitBtn.textContent = lang === "en" ? enSending : frSending;
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
          const frMessage = feedback.dataset.i18nFr || feedback.textContent.trim();
          const enMessage = feedback.dataset.i18nEn || frMessage;
          feedback.hidden = false;
          feedback.textContent = lang === "en" ? enMessage : frMessage;
          feedback.dataset.state = "success";
        }
      } catch (error) {
        if (feedback) {
          const frError = feedback.dataset.i18nFrError || feedback.textContent.trim();
          const enError = feedback.dataset.i18nEnError || frError;
          feedback.hidden = false;
          feedback.textContent = root.getAttribute("lang") === "en" ? enError : frError;
          feedback.dataset.state = "error";
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = root.getAttribute("lang") === "en" ? enLabel : frLabel;
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "d" && event.shiftKey) {
      document.body.classList.toggle("layout-debug");
    }
  });
});
  const header = document.querySelector(".site-header");
  const logo = document.querySelector(".site-header .brand img");
  if (header && logo) {
    header.classList.add("is-top");
    const handleScroll = () => {
      const isTop = window.scrollY < 50;
      header.classList.toggle("is-top", isTop);
      header.classList.toggle("is-scrolled", !isTop);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
  }
