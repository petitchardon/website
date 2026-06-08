/* =====================================================================
   L'Atelier vivant — choreographed kinetic layer.
   - Controlled parallax on [data-parallax] tied to scroll (NO drag).
   - Tags <html> with .atelier-kinetic to unlock restraint-safe flourishes.
   - Fully disabled under prefers-reduced-motion; never reveals content
     (all elements are visible & placed by CSS at rest).
   This runs IN ADDITION to main.js, which keeps nav/theme/reveal/tilt/form.
   ===================================================================== */
(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (reduce.matches) {
    // Composed, static. Make sure no inline parallax offset lingers.
    root.style.setProperty("--pscroll", "0");
    return;
  }

  root.classList.add("atelier-kinetic");

  const items = Array.from(document.querySelectorAll("[data-parallax]"));
  let ticking = false;

  const update = () => {
    ticking = false;
    if (!items.length) return;
    const vh = window.innerHeight || 1;

    for (const el of items) {
      const rect = el.getBoundingClientRect();
      // progress: -1 (below viewport) → 0 (centered) → +1 (above)
      const center = rect.top + rect.height / 2;
      const progress = (center - vh / 2) / vh; // roughly -1..1
      // clamp so motion stays held/tasteful
      const clamped = Math.max(-1.1, Math.min(1.1, progress));
      el.style.setProperty("--pscroll", clamped.toFixed(3));
    }
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  // Only attach if there is anything to move.
  if (items.length) {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
  }

  // If the user flips to reduced-motion mid-session, stand everything down.
  const onPrefChange = (e) => {
    if (e.matches) {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      root.classList.remove("atelier-kinetic");
      items.forEach((el) => el.style.setProperty("--pscroll", "0"));
    }
  };
  if (typeof reduce.addEventListener === "function") {
    reduce.addEventListener("change", onPrefChange);
  } else if (typeof reduce.addListener === "function") {
    reduce.addListener(onPrefChange);
  }
})();
