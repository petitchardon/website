/* La Galerie — cinematic exhibition layer.
   Native scrolling is preserved everywhere. This file only adds decorative
   enhancements on top: a cursor spotlight, gentle depth parallax, scroll
   reveals, and a room-index that tracks the current "salle". Everything here
   is progressive: with JS off, prefers-reduced-motion, or no pointer, the page
   is a calm, fully-legible static gallery. */
(() => {
  const ready = (fn) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  };

  ready(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    // ---------- Scroll reveals (camera-move feel) ----------
    // Reuse the established [data-animate] pattern, but for finer-grained items
    // inside a salle. Resting state is visible (CSS), JS only adds the entrance.
    const revealItems = document.querySelectorAll("[data-reveal]");
    if (revealItems.length) {
      if (reduceMotion) {
        revealItems.forEach((el) => el.classList.add("is-revealed"));
      } else {
        const reveal = (el) => el.classList.add("is-revealed");
        const revealObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                reveal(entry.target);
                revealObserver.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
        );
        revealItems.forEach((el) => revealObserver.observe(el));

        // Robustness net: a plate that has already scrolled past the top of the
        // viewport (e.g. during a fast programmatic scroll, or a deep-link jump)
        // must never stay hidden. On every scroll, reveal anything whose top has
        // entered the lower 92% of the viewport. Cheap, passive, idempotent.
        const sweep = () => {
          const h = window.innerHeight;
          revealItems.forEach((el) => {
            if (el.classList.contains("is-revealed")) return;
            const top = el.getBoundingClientRect().top;
            // Reveal anything whose top has entered (or passed) the viewport.
            if (top < h) reveal(el);
          });
        };
        window.addEventListener("scroll", sweep, { passive: true });
        window.addEventListener("resize", sweep, { passive: true });
        sweep();
      }
    }

    // ---------- Room index sync ----------
    // Highlight the salle currently centered in the viewport. Decorative; the
    // links still work as plain anchors with or without this.
    const roomLinks = new Map();
    document.querySelectorAll("[data-room-link]").forEach((link) => {
      roomLinks.set(link.getAttribute("data-room-link"), link);
    });
    const rooms = Array.from(document.querySelectorAll("[data-room]"));
    const indexRail = document.querySelector("[data-room-index]");

    if (rooms.length && roomLinks.size) {
      const setActiveRoom = (id) => {
        roomLinks.forEach((link, key) => {
          link.classList.toggle("is-current", key === id);
        });
      };
      const roomObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.getAttribute("data-room");
              if (roomLinks.has(id)) setActiveRoom(id);
              // Fade the rail away once we walk past the last room.
              if (indexRail) {
                indexRail.classList.toggle("is-dimmed", id === "colophon");
              }
            }
          });
        },
        { threshold: 0.01, rootMargin: "-45% 0px -45% 0px" }
      );
      rooms.forEach((room) => roomObserver.observe(room));
    }

    // Reveal the room rail only once the visitor has entered the exhibition
    // (kept hidden over the hero so the entrance stays uncluttered).
    if (indexRail) {
      const onScroll = () => {
        indexRail.classList.toggle("is-active", window.scrollY > window.innerHeight * 0.6);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    // ---------- Everything below is motion + pointer only ----------
    if (reduceMotion) return;

    // ---------- Cursor spotlight ----------
    // A soft gallery light that follows the pointer. Pure decoration.
    const spotlight = document.querySelector("[data-spotlight]");
    if (spotlight && finePointer) {
      let targetX = window.innerWidth / 2;
      let targetY = window.innerHeight * 0.4;
      let currentX = targetX;
      let currentY = targetY;
      let rafId = null;
      let idleTimer = null;

      const render = () => {
        // Ease toward the pointer for a cinematic drift.
        currentX += (targetX - currentX) * 0.12;
        currentY += (targetY - currentY) * 0.12;
        spotlight.style.setProperty("--spot-x", `${currentX}px`);
        spotlight.style.setProperty("--spot-y", `${currentY}px`);
        if (Math.abs(targetX - currentX) > 0.5 || Math.abs(targetY - currentY) > 0.5) {
          rafId = requestAnimationFrame(render);
        } else {
          rafId = null;
        }
      };

      const onMove = (event) => {
        targetX = event.clientX;
        targetY = event.clientY;
        spotlight.classList.add("is-lit");
        if (rafId === null) rafId = requestAnimationFrame(render);
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => spotlight.classList.remove("is-lit"), 2600);
      };

      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onMove, { passive: true });
    }

    // ---------- Depth parallax ----------
    // Translate flagged layers a touch slower than scroll for gallery depth.
    const parallaxEls = Array.from(document.querySelectorAll("[data-parallax]")).map((el) => ({
      el,
      depth: parseFloat(el.getAttribute("data-parallax")) || 0.05,
    }));

    if (parallaxEls.length && finePointer) {
      let ticking = false;
      const update = () => {
        const mid = window.innerHeight / 2;
        parallaxEls.forEach(({ el, depth }) => {
          const rect = el.getBoundingClientRect();
          const offset = (rect.top + rect.height / 2 - mid) * depth;
          el.style.transform = `translate3d(0, ${(-offset).toFixed(2)}px, 0)`;
        });
        ticking = false;
      };
      const onScroll = () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      };
      // NB: do not call update() synchronously here. Applying a translate3d
      // transform at load promotes the element to a compositor layer during the
      // first-paint window, which can make Lighthouse miss the contentful paint
      // (NO_FCP). Parallax starts on the first real scroll/resize instead — by
      // then FCP has long been recorded, and the layers are below the fold.
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
    }
  });
})();
