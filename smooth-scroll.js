(() => {
  if (!window.Lenis) return;

  const startLenis = () => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduceMotion) return;

    const page = document.getElementById("page");
    if (!page) return;

    const lenis = new Lenis({
      wrapper: page,
      content: page,
      eventsTarget: page,
      lerp: 0.05,
      smoothWheel: true,
      normalizeWheel: true,
      smoothTouch: false
    });

    window.__lenis = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    if (window.ScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
      ScrollTrigger.defaults({ scroller: page });
    }
  };

  window.addEventListener("loader:done", startLenis, { once: true });

  const loaderEl = document.getElementById("site-loader");
  if (!loaderEl || getComputedStyle(loaderEl).display === "none") {
    startLenis();
  }
})();