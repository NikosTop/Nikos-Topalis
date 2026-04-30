const mainMenu = document.querySelector('.mainMenu');
const closeMenu = document.querySelector('.closeMenu');
const openMenu = document.querySelector('.openMenu');
const menuItems = document.querySelectorAll('.mainMenu-links a');
const mainMenuBrand = document.querySelector('.mainMenu-brand');
const ANIM_TIME = 450;

const pageScroller = document.getElementById('page');
const scrollerEl = pageScroller || window;

function getScrollTop() {
  return pageScroller ? pageScroller.scrollTop : window.pageYOffset;
}

function scrollToY(top, behavior = 'auto') {
  if (pageScroller) {
    pageScroller.scrollTo({ top, behavior });
  } else {
    window.scrollTo({ top, behavior });
  }
}

function getTargetTop(target, offset = 0) {
  return target.getBoundingClientRect().top + getScrollTop() - offset;
}

if (window.gsap && window.ScrollTrigger && pageScroller) {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.defaults({ scroller: pageScroller });
}

let menuClosing = false;

function showMenu() {
    if (!mainMenu || !openMenu || menuClosing) return;

    mainMenu.classList.remove('is-closing');
    mainMenu.classList.add('is-open');
    mainMenu.setAttribute('aria-hidden', 'false');
    openMenu.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
}

function closeMenuOverlay(callback) {
    if (!mainMenu || !openMenu || menuClosing) {
        if (typeof callback === 'function') callback();
        return;
    }

    menuClosing = true;
    mainMenu.classList.remove('is-open');
    mainMenu.classList.add('is-closing');
    mainMenu.setAttribute('aria-hidden', 'true');
    openMenu.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');

    setTimeout(() => {
        mainMenu.classList.remove('is-closing');
        menuClosing = false;

        if (typeof callback === 'function') callback();

        if (window.ScrollTrigger) {
            setTimeout(() => {
                ScrollTrigger.refresh(true);
            }, 60);
        }
    }, ANIM_TIME);
}

if (openMenu) {
    openMenu.addEventListener('click', showMenu);
}

if (closeMenu) {
    closeMenu.addEventListener('click', () => {
        closeMenuOverlay();
    });
}

menuItems.forEach((item) => {
  item.addEventListener('click', function (e) {
    const href = this.getAttribute('href');

    if (!href) {
      closeMenuOverlay();
      return;
    }

    e.preventDefault();

    closeMenuOverlay(() => {
      if (href.startsWith('#')) {
        const target = document.querySelector(href);

        if (target) {
          const targetTop = getTargetTop(target);

          scrollToY(targetTop, 'auto');

          if (window.ScrollTrigger) {
            setTimeout(() => {
              ScrollTrigger.refresh(true);
            }, 60);
          }
        } else {
          window.location.hash = href;

          if (window.ScrollTrigger) {
            setTimeout(() => {
              ScrollTrigger.refresh(true);
            }, 60);
          }
        }
      } else {
        window.location.href = href;
      }
    });
  });
});

if (mainMenuBrand) {
  mainMenuBrand.addEventListener('click', function (e) {
    const currentPath = window.location.pathname;
    const isHomepage =
      currentPath.endsWith('index.html') ||
      currentPath === '/' ||
      currentPath.endsWith('/');

    e.preventDefault();

    closeMenuOverlay(() => {
      if (isHomepage) {
        scrollToY(0, 'smooth');

        if (window.ScrollTrigger) {
          setTimeout(() => {
            ScrollTrigger.refresh(true);
          }, 60);
        }
      } else {
        window.location.href = 'index.html';
      }
    });
  });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mainMenu && mainMenu.classList.contains('is-open')) {
        closeMenuOverlay();
    }
});

// // When the user scrolls down 20px from the top of the document, show the button
// window.onscroll = function() {scrollFunction()};

// function scrollFunction() {
//     const topBtn = document.getElementById("topBtn");
//     const windowHeight = window.innerHeight;
//     const documentHeight = document.documentElement.scrollHeight;
//     const scrolledHeight = window.scrollY + windowHeight;

//     if (scrolledHeight >= documentHeight) {
//         topBtn.style.display = "block";
//     } else {
//         topBtn.style.display = "none";
//     }
// }

// // When the user clicks on the button, scroll to the top of the document
// function topFunction() {
//     window.scrollTo({ top: 0, behavior: 'smooth' });
// }

// document.addEventListener("DOMContentLoaded", function() {
//     const skillParagraphs = document.querySelectorAll('.skillspans p');

//     setTimeout(function() {
//         skillParagraphs[0].classList.add('fade-in');
//     }, 1500); 

//     skillParagraphs.forEach((paragraph, index) => {
//         if (index > 0) {
//             setTimeout(function() {
//                 paragraph.classList.add('fade-in');
//             }, (index * 300) + 1000); 
//         }
//     });
// });

// WORK SLIDER

document.addEventListener("DOMContentLoaded", function () {
  const slider = document.querySelector(".slider");
  const track  = document.querySelector(".slide-track");
  if (!slider || !track) return;

  // Robust touch detection (works on S24 too)
  const isTouch =
    (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
    ("ontouchstart" in window) ||
    window.matchMedia?.("(pointer: coarse)")?.matches;

  // ===== Swipe hint (SVG) — ONLY on touch =====
  // IMPORTANT: this will also force-hide it on desktop so it never affects layout there.
  // ===== Swipe hint: show ONLY when user reaches slider section (touch only) =====
const section = document.querySelector(".video-slider-section");
const hint = document.querySelector(".video-slider-section .slider-hint");

if (hint) hint.classList.add("is-hidden"); // keep hidden by default

if (isTouch && section && hint) {
  const ioHint = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;

      // show once per visit when section enters viewport
      hint.classList.remove("is-hidden");
      hint.style.opacity = "1";

      setTimeout(() => {
        hint.classList.add("is-hidden"); // fully collapses via CSS
      }, 5000);

      ioHint.disconnect(); // run only once
    },
    { threshold: 0.35 } // shows when ~35% of section is visible
  );

  ioHint.observe(section);
}

  // ---------- Thumbnails ----------
  const thumbs = track.querySelectorAll(".yt[data-id]");
  thumbs.forEach((el) => {
    const id = el.getAttribute("data-id");
    if (!id) return;

    const maxres = `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
    const hq     = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

    const img = new Image();
    img.onload  = () => { el.style.backgroundImage = `url(${maxres})`; };
    img.onerror = () => { el.style.backgroundImage = `url(${hq})`; };
    img.src = maxres;

    if (!el.querySelector(".play")) {
      const p = document.createElement("span");
      p.className = "play";
      el.appendChild(p);
    }
  });

  // ---------- Helpers: reset player -> thumbnail ----------
  function ensurePlayIcon(yt) {
    if (!yt.querySelector(".play")) {
      const p = document.createElement("span");
      p.className = "play";
      yt.appendChild(p);
    }
  }

  function resetYt(yt) {
    if (!yt || !yt.classList.contains("is-playing")) return;
    yt.classList.remove("is-playing");
    yt.innerHTML = "";
    ensurePlayIcon(yt);
  }

  function resetAllYt() {
    track.querySelectorAll(".yt.is-playing").forEach(resetYt);
  }

  // Reset when tap outside slider
  document.addEventListener("pointerdown", (e) => {
    if (slider.contains(e.target)) return;
    resetAllYt();
  }, { passive: true });

  // Reset when scrolled away
  const ioReset = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) resetAllYt();
  }, { threshold: 0.15 });
  ioReset.observe(slider);

  // ---------- Open video ----------
  function openVideo(yt, autoplay) {
    if (!yt || yt.classList.contains("is-playing")) return;

    const id = yt.getAttribute("data-id");
    if (!id) return;

    yt.classList.add("is-playing");
    yt.innerHTML = "";

    const iframe = document.createElement("iframe");
    iframe.allowFullscreen = true;

    iframe.setAttribute(
      "allow",
      autoplay
        ? "autoplay; encrypted-media; picture-in-picture"
        : "encrypted-media; picture-in-picture"
    );

    iframe.style.position = "absolute";
    iframe.style.inset = "0";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "0";

    const base = `https://www.youtube.com/embed/${id}?playsinline=1&rel=0`;
    iframe.src = autoplay ? `${base}&autoplay=1` : base;

    yt.appendChild(iframe);
  }

  // ---------- TOUCH DEVICES: swipe-only + tap-to-open (tap != swipe) ----------
  if (isTouch) {
    let startX = 0, startY = 0;
    let moved = false;
    let targetYt = null;

    track.addEventListener("touchstart", (e) => {
      const t = e.touches[0];
      const yt = e.target.closest?.(".yt[data-id]");
      if (!yt || yt.classList.contains("is-playing")) {
        targetYt = null;
        return;
      }
      startX = t.clientX;
      startY = t.clientY;
      moved = false;
      targetYt = yt;
    }, { passive: true });

    track.addEventListener("touchmove", (e) => {
      if (!targetYt) return;
      const t = e.touches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;

      // If user swipes horizontally -> do NOT open video
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
        moved = true;
        targetYt = null;
      }
    }, { passive: true });

    track.addEventListener("touchend", () => {
      if (!targetYt) return;
      if (!moved) openVideo(targetYt, false); // no autoplay on touch (most stable)
      targetYt = null;
      moved = false;
    }, { passive: true });

    // ✅ No desktop loop on touch devices
    return;
  }

  // ---------- DESKTOP: click opens with autoplay ----------
  track.addEventListener("pointerdown", (e) => {
    const yt = e.target.closest?.(".yt[data-id]");
    if (!yt || yt.classList.contains("is-playing")) return;
    openVideo(yt, true);
  }, { passive: true });

  // ---------- DESKTOP: auto-moving loop ----------
  track.style.transition = "none";

  let step = 0;
  function measureStep() {
    const first = track.children[0];
    if (!first) return;

    const w = first.getBoundingClientRect().width;
    const cs = getComputedStyle(track);
    const gap = parseFloat(cs.gap || cs.columnGap || "0") || 0;

    step = w + gap;
  }

  let x = 0;
  let paused = false;

  const SPEED = 90;
  const MAX_DT = 0.05;

  function setX(v) {
    x = v;
    track.style.transform = `translate3d(${Math.round(x)}px,0,0)`;
  }

  let inView = true;
  const ioRun = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (!entry.isIntersecting) paused = true;
    else { paused = false; tick.last = 0; }
  }, { threshold: 0.15 });
  ioRun.observe(slider);

  function tick(t) {
    if (!tick.last) tick.last = t;

    let dt = (t - tick.last) / 1000;
    if (dt > MAX_DT) dt = MAX_DT;
    tick.last = t;

    if (!paused && inView && step > 0) {
      setX(x - SPEED * dt);

      // if first slide has a playing iframe, reset before reorder (stability)
      const firstSlide = track.firstElementChild;
      const playingYt = firstSlide?.querySelector?.(".yt.is-playing");
      if (playingYt) resetYt(playingYt);

      while (-x >= step) {
        track.appendChild(track.firstElementChild);
        setX(x + step);
      }
    }

    requestAnimationFrame(tick);
  }

  slider.addEventListener("mouseenter", () => { paused = true; });
  slider.addEventListener("mouseleave", () => { paused = false; tick.last = 0; });

  document.addEventListener("visibilitychange", () => {
    tick.last = 0;
    paused = document.hidden ? true : false;
    if (!document.hidden) tick.last = 0;
  });

  measureStep();
  window.addEventListener("resize", measureStep, { passive: true });

  setX(0);
  requestAnimationFrame(tick);
});

// HERO-IMAGE-SCROLL

gsap.registerPlugin(ScrollTrigger);

(() => {
  const hero = document.querySelector(".hero");
  const media = document.querySelector(".hero-media");
  const mediaZoom = document.querySelector(".hero-media-zoom");
  const bg = document.querySelector(".hero-bg");
  const services = document.querySelector(".services-section");
  const root = document.documentElement;

  if (!hero || !media || !mediaZoom || !bg || !services) return;

  let pinSpacer = null;

  const syncPinnedLayer = () => {
    media.style.pointerEvents = "none";

    const parent = media.parentNode;
    if (parent && parent.classList.contains("pin-spacer")) {
      pinSpacer = parent;
      pinSpacer.style.pointerEvents = "none";
      pinSpacer.style.overflow = "clip";
      pinSpacer.style.maxWidth = "100vw";
      pinSpacer.style.boxSizing = "border-box";
    }
  };

  const mm = gsap.matchMedia();

  // DESKTOP: keep pin
  mm.add("(min-width: 901px) and (pointer: fine)", () => {
    gsap.set(mediaZoom, {
      transformOrigin: "center bottom",
      force3D: true
    });

    gsap.set(bg, {
      force3D: true
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        endTrigger: services,
        end: "top 40%",
        scrub: true,
        pin: media,
        pinReparent: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: syncPinnedLayer,
        onEnterBack: () => {
          syncPinnedLayer();
          if (pinSpacer) pinSpacer.style.visibility = "visible";
        }
      }
    });

    tl.to(mediaZoom, {
      scale: 1.12,
      ease: "none",
      force3D: true
    }, 0)
    .to(bg, {
      scale: 1.20,
      ease: "none",
      force3D: true
    }, 0);

    const mediaFade = gsap.to(media, {
      autoAlpha: 0,
      ease: "none",
      scrollTrigger: {
        trigger: services,
        start: "top bottom",
        end: "top 40%",
        scrub: true,
        invalidateOnRefresh: true,
        onRefresh: syncPinnedLayer,
        onLeave: () => {
          if (pinSpacer) pinSpacer.style.visibility = "hidden";
        },
        onEnterBack: () => {
          if (pinSpacer) pinSpacer.style.visibility = "visible";
          syncPinnedLayer();
        }
      }
    });

    const bgFade = gsap.to(bg, {
      autoAlpha: 0,
      ease: "none",
      scrollTrigger: {
        trigger: services,
        start: "top bottom",
        end: "top 40%",
        scrub: true,
        invalidateOnRefresh: true
      }
    });

    syncPinnedLayer();

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      mediaFade.scrollTrigger?.kill();
      mediaFade.kill();
      bgFade.scrollTrigger?.kill();
      bgFade.kill();
      gsap.set([media, mediaZoom, bg], { clearProps: "transform,opacity,visibility" });
    };
  });

  // TOUCH / TABLET / MOBILE: NO PIN, keep fixed-at-bottom + zoom + fade
  mm.add("(pointer: coarse), (max-width: 1024px)", () => {
    gsap.set(mediaZoom, {
      transformOrigin: "center bottom",
      force3D: true
    });

    gsap.set(bg, {
      force3D: true
    });

    // IMPORTANT: start already in the fixed touch state
    // because your page always resets to top on load/pageshow
    root.classList.add("hero-touch-active");

    const heroActive = ScrollTrigger.create({
      trigger: hero,
      start: "top top",
      endTrigger: services,
      end: "top 40%",
      invalidateOnRefresh: true,
      onToggle: (self) => {
        root.classList.toggle("hero-touch-active", self.isActive);
      }
    });

    // make sure the correct class is applied immediately after ST measures
    requestAnimationFrame(() => {
      root.classList.toggle(
        "hero-touch-active",
        heroActive.isActive || getScrollTop() <= 2
      );
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        endTrigger: services,
        end: "top 40%",
        scrub: true,
        invalidateOnRefresh: true
      }
    });

    tl.to(mediaZoom, {
      scale: 1.12,
      ease: "none",
      force3D: true
    }, 0)
    .to(bg, {
      scale: 1.20,
      ease: "none",
      force3D: true
    }, 0);

    const mediaFade = gsap.to(media, {
      autoAlpha: 0,
      ease: "none",
      scrollTrigger: {
        trigger: services,
        start: "top bottom",
        end: "top 30%",
        scrub: true,
        invalidateOnRefresh: true
      }
    });

    const bgFade = gsap.to(bg, {
      autoAlpha: 0,
      ease: "none",
      scrollTrigger: {
        trigger: services,
        start: "top bottom",
        end: "top 40%",
        scrub: true,
        invalidateOnRefresh: true
      }
    });

    return () => {
      heroActive.kill();
      tl.scrollTrigger?.kill();
      tl.kill();
      mediaFade.scrollTrigger?.kill();
      mediaFade.kill();
      bgFade.scrollTrigger?.kill();
      bgFade.kill();
      root.classList.remove("hero-touch-active");
      gsap.set([media, mediaZoom, bg], { clearProps: "transform,opacity,visibility" });
    };
  });
})();

// ROTATING ANIMATION EDITS-SOCIAL

(() => {
  const cube = document.getElementById("keywordCube");
  if (!cube || !window.gsap) return;

  const step = 90;

  // όπως το σωστό σου
  const hold = 0;
  const spin = 1.8;

  const faces = [
    cube.querySelector(".cube-face--front"),
    cube.querySelector(".cube-face--bottom"),
    cube.querySelector(".cube-face--back"),
    cube.querySelector(".cube-face--top"),
  ];
  if (faces.some(f => !f)) return;

  gsap.set(faces, { opacity: 1 });

  const tl = gsap.timeline({ repeat: -1 });
  tl.set(cube, { rotationX: 0 });

  function turn(toRot, fromIdx, toIdx) {
    tl.to({}, { duration: hold });

    const seg = gsap.timeline();

    // Το επόμενο ξεκινάει από 0 (ώστε να κάνει fade-in σε όλο το spin)
    seg.set(faces[toIdx], { opacity: 0 }, 0);

    // Περιστροφή (ίδιο)
    seg.to(cube, { rotationX: toRot, duration: spin, ease: "power3.inOut" }, 0);

    // ✅ FADES ΣΕ ΟΛΟ ΤΟ SPIN (ταυτόχρονα με το γύρισμα)
    seg.to(faces[fromIdx], { opacity: 0, duration: spin, ease: "power3.inOut" }, 0);
    seg.to(faces[toIdx],   { opacity: 1, duration: spin, ease: "power3.inOut" }, 0);

    // reset του old face για τον επόμενο κύκλο
    seg.set(faces[fromIdx], { opacity: 1 }, spin);

    tl.add(seg);
  }

  turn(+step, 0, 1);
  turn(+2 * step, 1, 2);
  turn(+3 * step, 2, 3);
  turn(+4 * step, 3, 0);
})();

// LOADING SCREEN (waits for hero assets + keeps scroll locked until intro ends)

(() => {
  const loader = document.getElementById("site-loader");
  const progressEl = document.getElementById("loaderProgress");
  if (!loader || !progressEl || !window.gsap) return;

  const root = document.documentElement;
  const body = document.body;

  const panelTop = loader.querySelector(".loader-panel--top");
  const panelBottom = loader.querySelector(".loader-panel--bottom");
  const diag = loader.querySelector(".loader-diag");
  const copy = loader.querySelector(".loader-copy");

  const heroImg = document.querySelector(".hero-media img");
  const loopImg = document.querySelector(".hero-loop-media img");
  const resultsSection = document.querySelector(".results-section");
  const resultsImg = document.querySelector(".results-photo img");

  const heroBgUrl = "hero-background.jpg";

  let loaderOpened = false;

  const setAngle = () => {
    const ang = Math.atan2(window.innerHeight, window.innerWidth);
    root.style.setProperty("--diag-angle", `${ang}rad`);
  };

  setAngle();
  window.addEventListener("resize", setAngle);

  // lock scroll immediately
  root.classList.add("hero-intro-lock");
  body.classList.add("is-scroll-locked");

  gsap.set(loader, { opacity: 1 });
  gsap.set(progressEl, {
    scaleX: 0,
    transformOrigin: "left center",
    force3D: true
  });

  // slow moving loader while assets are loading
  const fillTween = gsap.to(progressEl, {
    scaleX: 0.88,
    duration: 2.4,
    ease: "power1.out"
  });

  function waitForImage(img) {
    return new Promise((resolve) => {
      if (!img) return resolve();

      const done = () => {
        if (img.decode) {
          img.decode().catch(() => {}).finally(resolve);
        } else {
          resolve();
        }
      };

      if (img.complete && img.naturalWidth > 0) {
        done();
        return;
      }

      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", resolve, { once: true });
    });
  }

  function preloadImage(src) {
    return new Promise((resolve) => {
      if (!src) return resolve();

      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = src;
    });
  }

  function waitForFonts() {
    if (!document.fonts || !document.fonts.ready) {
      return Promise.resolve();
    }
    return document.fonts.ready.catch(() => {});
  }

  function warmResultsSection() {
    return new Promise((resolve) => {
      if (!resultsSection) return resolve();

      const oldWillChange = resultsSection.style.willChange;
      const oldTransform = resultsSection.style.transform;
      const oldOpacity = resultsSection.style.opacity;

      resultsSection.style.willChange = "transform, opacity";
      resultsSection.style.transform = "translateZ(0)";
      resultsSection.style.opacity = "0.999";

      // force the browser to build the layers while the loader is still visible
      resultsSection.getBoundingClientRect();

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resultsSection.style.willChange = oldWillChange;
          resultsSection.style.transform = oldTransform;
          resultsSection.style.opacity = oldOpacity;
          resolve();
        });
      });
    });
  }

  function minDelay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  Promise.all([
    waitForImage(heroImg),
    waitForImage(loopImg),
    waitForImage(resultsImg),
    preloadImage(heroBgUrl),
    waitForFonts(),
    warmResultsSection(),
    minDelay(600) // keeps it from flashing too quickly on fast loads
  ]).then(finishLoader);

  // emergency fallback
  setTimeout(() => {
    finishLoader();
  }, 8000);

  function finishLoader() {
    if (loaderOpened) return;
    loaderOpened = true;

    fillTween.kill();

    gsap.to(progressEl, {
      scaleX: 1,
      duration: 0.45,
      ease: "power2.out",
      force3D: true,
      onComplete: openSplit
    });
  }

  function openSplit() {
    gsap.set(progressEl, { width: "100%" });
    gsap.set([diag, copy], { opacity: 0 });

    // keep only the hero image visible first
    root.classList.add("reveal-hero");

    // reveal page behind doors, but KEEP scroll locked
    root.classList.remove("is-loading");

    const heroBg = document.querySelector(".hero .hero-bg");
    const heroContainer = document.querySelector(".hero .hero-container");
    const heroNav = document.querySelector(".hero .hero-nav");
    const heroCta = document.querySelector(".hero .hero-side-btn--c");
    const heroRevealEls = [heroContainer, heroCta, heroNav].filter(Boolean);

    if (heroRevealEls.length) {
      gsap.set(heroRevealEls, { autoAlpha: 0 });
    }

    const doorsTl = gsap.timeline({
      defaults: { ease: "power2.inOut" }
    });

    doorsTl
    .to(panelTop, { yPercent: -120, duration: 1.2, ease: "power2.inOut" }, 0)
    .to(panelBottom, { yPercent: 120, duration: 1.2, ease: "power2.inOut" }, 0);

    if (heroImg) {
      gsap.killTweensOf(heroImg);

      gsap.fromTo(
        heroImg,
        { scale: 0.85, y: 0, transformOrigin: "center bottom" },
        {
          scale: 1,
          y: 0,
          duration: 1.45,
          ease: "power2.out",
          delay: 0.05,
          overwrite: "auto",
          clearProps: "transform",
          onComplete: () => {
            if (heroRevealEls.length) {
              gsap.to(heroRevealEls, {
                autoAlpha: 1,
                duration: 0.75,
                ease: "power2.out",
                onStart: () => {
                  root.classList.remove("reveal-hero");
                },
                onComplete: unlockPage
              });
            } else {
              root.classList.remove("reveal-hero");
              unlockPage();
            }
          }
        }
      );
    } else {
      root.classList.remove("reveal-hero");
      unlockPage();
    }

    doorsTl.eventCallback("onComplete", () => {
      loader.style.display = "none";
    });
  }

  function unlockPage() {
    root.classList.remove("hero-intro-lock");
    body.classList.remove("is-scroll-locked");

    window.dispatchEvent(new Event("loader:done"));

    if (window.ScrollTrigger) {
      setTimeout(() => ScrollTrigger.refresh(), 50);
    }
  }
})();

// ===== SERVICES: late reveal + bg parallax + animated line =====
(() => {
  if (!window.gsap || !window.ScrollTrigger) return;

  const section = document.querySelector(".services-section");
  if (!section) return;

  const title = section.querySelector(".services-title");
  const items = section.querySelectorAll(".service-item");
  const imgb = section.querySelectorAll(".services-image-wrapper");
  const bg = section.querySelector(".services-bg");
  const line = section.querySelector(".services-line");

  ScrollTrigger.config({ ignoreMobileResize: true });

  // Initial states
  if (bg) gsap.set(bg, { autoAlpha: 0 });
  if (imgb) gsap.set(bg, { autoAlpha: 0 });
  if (title) gsap.set(title, { autoAlpha: 0, y: 28 });
  if (items?.length) gsap.set(items, { autoAlpha: 0, y: 28 });
  if (line) gsap.set(line, { autoAlpha: 0, scaleY: 0 });

  // Later trigger (so it happens higher / not too soon)
  const startLate = "top 60%";
  const endLate   = "top 25%";

  // BG fade + subtle parallax
  if (bg) {
    gsap.to(bg, {
      autoAlpha: 1,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: startLate,
        end: endLate,
        scrub: true
      }
    });
  }

  if (imgb) {
    gsap.to(imgb, {
      autoAlpha: 1,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: startLate,
        end: endLate,
        scrub: true
      }
    });
  }

  // Line draw (same timing feel as content)
  if (line) {
    gsap.to(line, {
      autoAlpha: 1,
      scaleY: 1,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top 55%",
        end: "top 30%",
        scrub: true
      }
    });
  }

  // Title
  if (title) {
    gsap.to(title, {
      autoAlpha: 1,
      y: 0,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top 75%",
        end: "top 60%",
        scrub: true
      }
    });
  }

  // Items
  if (items?.length) {
    gsap.to(items, {
      autoAlpha: 1,
      y: 0,
      ease: "none",
      stagger: 0.15,
      scrollTrigger: {
        trigger: section,
        start: "top 50%",
        end: "top 20%",
        scrub: true
      }
    });
  }

  const ps = section.querySelectorAll(".service-item p");

  // initial blur state for paragraphs only
  if (ps?.length) gsap.set(ps, { filter: "blur(5px)", opacity: 0.9 });

  // paragraphs unblur smoothly as you scroll down
  if (ps?.length) {
    gsap.to(ps, {
      filter: "blur(0px)",
      opacity: 1,
      ease: "none",
      stagger: 0.12,
      scrollTrigger: {
        trigger: section,
        start: "top 20%",
        end: "top 10%",
        scrub: true
      }
    });
  }
})();

// ===== SLIDER SECTION: reveal on scroll (same feel as Services) =====
(() => {
  if (!window.gsap || !window.ScrollTrigger) return;

  const section = document.querySelector(".video-slider-section");
  if (!section) return;

  const title = section.querySelector(".video-title");
  const wrap  = section.querySelector(".slider-wrapper");

  // Initial states
  if (title) gsap.set(title, { autoAlpha: 0, y: 28 });
  if (wrap)  gsap.set(wrap,  { autoAlpha: 0, y: 28 });

  // Reveal (same timings vibe as Services)
  if (title) {
    gsap.to(title, {
      autoAlpha: 1,
      y: 0,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top 75%",
        end: "top 60%",
        scrub: true
      }
    });
  }

  if (wrap) {
    gsap.to(wrap, {
      autoAlpha: 1,
      y: 0,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top 50%",
        end: "top 20%",
        scrub: true
      }
    });
  }
})();

// RESULTS: unlock on hover (desktop) and tap (mobile)

document.addEventListener("DOMContentLoaded", () => {
  const panel = document.querySelector("[data-results]");
  if (!panel) return;

  const stats = panel.querySelectorAll(".stat");

  const isTouch =
    (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
    window.matchMedia?.("(pointer: coarse)")?.matches;

  if (isTouch) {
    // Mobile: tap reveals ONLY (no toggle back)
    stats.forEach(stat => {
      stat.addEventListener("click", () => {
        if (!stat.classList.contains("is-revealed")) {
          stat.classList.add("is-revealed");
        }
      });
    });

    // Prevent links inside from triggering stat click
    const links = panel.querySelectorAll(".results-contact-link");
    links.forEach(link => {
      link.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    });

  } else {
    // Desktop: first hover unlocks permanently
    stats.forEach(stat => {
      stat.addEventListener("mouseenter", () => {
        stat.classList.add("is-revealed");
      });

      // Optional: keyboard accessibility
      stat.addEventListener("focus", () => {
        stat.classList.add("is-revealed");
      });
    });
  }

  // KEEPING YOUR RESET EXACTLY AS IS
  const resultsSection = document.querySelector(".results-section");
  const resetReveals = () =>
    stats.forEach(s => s.classList.remove("is-revealed"));

  if (resultsSection) {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) resetReveals();
      },
      { threshold: 0.12 }
    );

    io.observe(resultsSection);
  }
});

// ===== Pause CSS animations when section is offscreen =====

(() => {

  const sections = document.querySelectorAll(
    ".results-section, .services-section, .video-slider-section"
  );

  if (!sections.length) return;

  const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

      const animEls = entry.target.querySelectorAll(
        "[style*='animation'], .stat, .results-screen, .results-hint"
      );

      animEls.forEach(el => {
        el.style.animationPlayState = entry.isIntersecting ? "running" : "paused";
      });

    });

  }, {
    threshold: 0.1
  });

  sections.forEach(sec => observer.observe(sec));

})();

// RESULTS BACKGROUND LIGHTING (independent from photo animation)

(() => {

  if (!window.gsap || !window.ScrollTrigger) return;

  const section = document.querySelector(".results-section");
  const glow = document.querySelector(".results-glow");
  const dark = document.querySelector(".results-darkfade");

  if (!section || !glow || !dark) return;

  gsap.set(glow,{ scale:1.1 });

  const tl = gsap.timeline({
    scrollTrigger:{
      trigger: section,
      start: "top 50%",
      end: "+=120%",   // MUCH longer scroll distance
      scrub: true
    }
  });

  tl.to(glow,{
    opacity:1,
    scale:1,
    ease:"none"
  },0.15)

  .to(glow,{
    opacity:1,
    ease:"none"
  },0.75)

  .to(dark,{
    opacity:1,
    ease:"none"
  },0.92)

  .to(glow,{
    opacity:0,
    ease:"none"
  },0.96);

})();

/* =========================
   RIBBON ANIMATION SYSTEM
========================= */

// ===== RIBBONS =====

function initRibbons(){

const ribbons = document.querySelectorAll(".ribbon");

let scrollDir = 1;
let scrollBoost = 0;
let lastScroll = getScrollTop();

// detect scroll direction ONCE
scrollerEl.addEventListener("scroll", () => {
  let current = getScrollTop();
  let delta = current - lastScroll;

  scrollDir = delta > 0 ? 1 : -1;
  scrollBoost = Math.min(Math.abs(delta) * 0.65, 58);
  lastScroll = current;
}, { passive: true });


ribbons.forEach((ribbon) => {
  const inner = ribbon.querySelector(".ribbon-inner");
  const item  = ribbon.querySelector(".ribbon-item");

  if (!inner || !item) return;

  let itemWidth = item.offsetWidth;
  let clones = Math.ceil(window.innerWidth / itemWidth) + 3;

  for (let i = 0; i < clones; i++) {
    inner.appendChild(item.cloneNode(true));
  }

  let x = 0;

  /* bind direction to class, not DOM order */
  // const baseSpeed = ribbon.classList.contains("ribbon-orange") ? -1.8 : 1.8;
  // if this is the opposite of your old look, just swap the signs:
  const baseSpeed = ribbon.classList.contains("ribbon-orange") ? 1.8 : -1.8;

  let inView = true;

  const observer = new IntersectionObserver(([e]) => {
    inView = e.isIntersecting;
  }, { threshold: .15 });

  observer.observe(ribbon);

  function tick() {
    if (!inView || document.hidden) {
      requestAnimationFrame(tick);
      return;
    }

    let speed = (baseSpeed + Math.sign(baseSpeed) * scrollBoost) * scrollDir;
    x += speed;

    if (x <= -itemWidth) x += itemWidth;
    if (x >= 0) x -= itemWidth;

    inner.style.transform = `translate3d(${x}px,0,0)`;
    scrollBoost *= 0.92;

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
});

}

window.addEventListener("load",initRibbons);

// ===== RESULTS SECTION: reveal on scroll =====
(() => {
  if (!window.gsap || !window.ScrollTrigger) return;

  const section = document.querySelector(".results-section");
  if (!section) return;

  const title = section.querySelector(".results-title");
  const panel = section.querySelector(".results-panel");
  const photo = section.querySelector(".results-photo");

  gsap.set(title, { autoAlpha: 0, y: 24 });
  gsap.set([panel, photo], { autoAlpha: 0, y: 24 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top 70%",
      end: "top 35%",
      scrub: true
    }
  });

  // title first
  tl.to(title, {
    autoAlpha: 1,
    y: 0,
    ease: "none"
  }, 0);

  // then the rest
  tl.to(photo, {
    autoAlpha: 1,
    y: 0,
    ease: "none"
  }, 0.25);

  tl.to(panel, {
    autoAlpha: 1,
    y: 0,
    ease: "none"
  }, 0.30);
})();

// SITE LOOP-----------

(() => {

  if (!window.gsap || !window.ScrollTrigger) return;

  const isDesktop =
  window.matchMedia("(min-width: 901px) and (pointer: fine)").matches;

  if (!isDesktop) return;

  const section = document.querySelector(".results-section");
  const hero = document.querySelector(".hero");

  if (!section || !hero) return;

  const title = section.querySelector(".results-title");
  const panel = section.querySelector(".results-panel");
  const photo = section.querySelector(".results-photo");

  const glow = document.querySelector(".results-glow");
  const darkfade = document.querySelector(".results-darkfade");

  const loopLayer = document.querySelector(".hero-loop-underlay");
  const loopBg = loopLayer?.querySelector(".hero-loop-bg");
  const loopMedia = loopLayer?.querySelector(".hero-loop-media");
  const loopContent = loopLayer?.querySelector(".hero-loop-content");

  if (!title || !panel || !photo || !glow || !darkfade || !loopLayer) return;

  gsap.registerPlugin(ScrollTrigger);

  let looping = false;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section.querySelector(".results-photo"),
      start: "98% bottom",
      end: "+=120%",
      scrub: true,
      pin: section.querySelector(".results-photo"),
      anticipatePin: 1,

      onEnter: () => {

        loopLayer.classList.add("is-active");

        gsap.set(loopLayer, { autoAlpha: 0 });
        gsap.set([loopBg, loopMedia, loopContent], { autoAlpha: 0 });

      },

      onLeaveBack: () => {

        loopLayer.classList.remove("is-active");
        gsap.set(loopLayer, { autoAlpha: 0 });

      },

      onUpdate: (self) => {

        if (self.progress > 0.90 && !looping) {
          looping = true;

          const heroTop = getTargetTop(hero);

          requestAnimationFrame(() => {
            scrollToY(heroTop + 1, 'auto');

            gsap.delayedCall(0.01, () => ScrollTrigger.refresh(true));

            setTimeout(() => {
              looping = false;
            }, 60);
          });
        }

      }

    }
  });

  /* RESULTS content fades */
  tl.to(title,{ autoAlpha:0, ease:"none" },0.40);
  tl.to(panel,{ autoAlpha:0, ease:"none" },0.45);

  /* hero loop reveal */
  tl.to(loopLayer,{ autoAlpha:1, ease:"none" },0.65);
  tl.to(loopBg,{ autoAlpha:1, ease:"none" },0.52);
  tl.to(loopMedia,{ autoAlpha:1, ease:"none" },0.70);
  tl.to(loopContent,{ autoAlpha:1, ease:"none" },0.80);

  /* photo zoom */
  tl.to(photo,{
    x: () => window.innerWidth * 0.36,
    scale:1.36,
    transformOrigin:"center center",
    ease:"none"
  },0.67);

  tl.to(photo,{ autoAlpha:0, ease:"none" },0.72);

})();

// // PORTFOLIO SECTION LOAD FROM ABOUT ME PAGE -----------------------------

window.addEventListener("load", () => {
  const params = new URLSearchParams(window.location.search);
  const fromAbout = params.get("from");
  const target = params.get("scroll");

  if (fromAbout === "about" && target) {
    setTimeout(() => {
      const section = document.getElementById(target);
      if (section) {
        smoothScrollTo(section, 2200, 80);
      }
    }, 3000);
  }

  const portfolioLink = document.querySelector('a[href="#portfolio"]');

  if (portfolioLink) {
    portfolioLink.addEventListener("click", (e) => {
      e.preventDefault();

      const section = document.getElementById("portfolio");
      if (section) {
        smoothScrollTo(section, 2200, 80);
      }
    });
  }

  let urlReset = false;

  scrollerEl.addEventListener("scroll", () => {
    if (!urlReset && (fromAbout === "about" || window.location.hash === "#portfolio")) {
      history.replaceState(null, "", window.location.pathname);
      urlReset = true;
    }
  }, { passive: true });
});

function smoothScrollTo(targetElement, duration = 2200, offset = 0) {
  const targetPosition = getTargetTop(targetElement, offset);
  const startPosition = getScrollTop();
  const distance = targetPosition - startPosition;
  let startTime = null;

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;

    const run = easeInOutCubic(timeElapsed, startPosition, distance, duration);
    scrollToY(run, 'auto');

    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  }

  function easeInOutCubic(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t * t + b;
    t -= 2;
    return (c / 2) * (t * t * t + 2) + b;
  }

  requestAnimationFrame(animation);
}

// HERO BG INTRO LAYER (separate from scroll bg)
(() => {
  if (!window.gsap) return;

  const root = document.documentElement;
  const introLayer = document.querySelector(".hero .hero-bg-intro");
  if (!introLayer) return;

  let played = false;

  function playBgIntro() {
    if (played) return;
    played = true;

    gsap.killTweensOf(introLayer);

    gsap.set(introLayer, {
      autoAlpha: 1,
      scale: 0.94
    });

    gsap.to(introLayer, {
      scale: 1,
      duration: 1.45,
      ease: "power2.out",
      overwrite: "auto"
    });

    gsap.to(introLayer, {
      autoAlpha: 0,
      duration: 0.18,
      delay: 1.27,
      ease: "power1.out",
      clearProps: "all"
    });
  }

  const observer = new MutationObserver(() => {
    const loadingGone = !root.classList.contains("is-loading");
    const revealActive = root.classList.contains("reveal-hero");

    if (loadingGone && revealActive) {
      playBgIntro();
      observer.disconnect();
    }
  });

  observer.observe(root, {
    attributes: true,
    attributeFilter: ["class"]
  });

  window.addEventListener("beforeunload", () => observer.disconnect());
})();