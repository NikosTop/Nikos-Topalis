import * as THREE from '../js/vendor/three.module.js';
import { createRenderer } from './renderer.js';
import { createCamera } from './camera.js';
import { createLights } from './lights.js';
import { createStarfield } from './starfield.js';
import { createDNA } from './dna.js';
import { createTextRungs } from './text-rungs.js';
import { createScrollController } from './scroll-controller.js';

function getViewportSize() {
  const vv = window.visualViewport;

  return {
    width: Math.round(vv?.width || window.innerWidth || document.documentElement.clientWidth || 1),
    height: Math.round(vv?.height || window.innerHeight || document.documentElement.clientHeight || 1)
  };
}

function pinCanvasToCss(canvas) {
  if (!canvas) return;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
}

function createOverlayRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });

  const { width, height } = getViewportSize();

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(width, height, false); // do not rewrite CSS size
  renderer.setClearColor(0x000000, 0);

  if ('outputColorSpace' in renderer) {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  pinCanvasToCss(canvas);

  return renderer;
}

export async function initAboutScene() {
  const baseCanvas = document.getElementById('webgl-canvas-base');
  const sharpTextCanvas = document.getElementById('webgl-canvas-text-sharp');
  const blurTextCanvas = document.getElementById('webgl-canvas-text-blur');

  pinCanvasToCss(baseCanvas);
  pinCanvasToCss(sharpTextCanvas);
  pinCanvasToCss(blurTextCanvas);

  // ---------- BASE SCENE (stars + DNA strands only) ----------
  const baseScene = new THREE.Scene();

  const bgA = new THREE.Color(0x000000);
  const bgB = new THREE.Color(0x07111c);

  baseScene.background = bgA.clone();
  baseScene.fog = new THREE.FogExp2(0x03060a, 0.0105);

  const baseRenderer = createRenderer(baseCanvas);
  const camera = createCamera();
  createLights(baseScene);

  // lock canvas sizing to CSS, not inline px styles
  pinCanvasToCss(baseCanvas);

  const stars = createStarfield();
  baseScene.add(stars);

  const dnaData = createDNA();
  baseScene.add(dnaData.root);

  const electricA = new THREE.Color('#70b9fd');
  const electricB = new THREE.Color('#8e81be');
  const electricMix = new THREE.Color();

  // ---------- TEXT SCENE (text only) ----------
  const textScene = new THREE.Scene();

  const textRoot = new THREE.Group();
  const textRoller = new THREE.Group();
  textRoot.add(textRoller);

  textRoot.rotation.copy(dnaData.root.rotation);
  textRoot.position.copy(dnaData.root.position);
  textRoot.scale.copy(dnaData.root.scale);

  textScene.add(textRoot);

  const ABOUT_TEXT = {
    en: `
      behavior.

      Every project I work on is built with intention, from the first second
      of a video to the way content flows and connects with the audience.

      Over the past years, I've helped brands improve engagement, optimize their presence,
      and turn content into measurable growth.

      My approach combines structured thinking
      with creative execution, always aiming for clarity, impact, and results.

      Beyond work, I continuously explore creativity through photography and video editing,
      while staying aligned with emerging technologies, especially in the AI space.

      This balance allows me to stay adaptable, precise, and forward-thinking.

      For me, it's simple:
      create work that captures attention, builds connection, and delivers real results.

      I create content that doesn't just look good, it performs.

      With a background in business, marketing, and hands-on experience in e-commerce
      and social media, I focus on the intersection of strategy, creativity, and human
    `,
    el: `
      ανθρώπινης ψυχολογίας.

      Κάθε project το αντιμετωπίζω με τρόπο που του αρμόζει, από το πρώτο δευτερόλεπτο ενός βίντεο μέχρι τον τρόπο που αυτό συνδέεται με το κοινό.

      Τα τελευταία χρόνια έχω βοηθήσει brands να βελτιώσουν την παρουσία τους,
      να αυξήσουν την αλληλεπίδρασή τους με το κοινό και να μετατρέψουν · το περιεχόμενό τους σε ουσιαστικά αποτελέσματα.

      Δουλεύω με τρόπο που συνδυάζει δημιουργικότητα και προσοχή στη λεπτομέρεια,
      πάντα με στόχο το περιεχόμενο να είναι ξεκάθαρο, άμεσο και αποτελεσματικό.

      Πέρα από τη δουλειά μου, συνεχίζω να εξελίσσομαι μέσα από τη φωτογραφία και το μοντάζ σε βίντεο, ενώ παρακολουθώ στενά τις νέες εξελίξεις,
      ιδιαίτερα στον χώρο της AI τεχνολογίας.

      Αυτή η ισορροπία με βοηθά να παραμένω έτοιμος και ευέλικτος, ώστε να προσαρμόζομαι σε κάθε · · νέο project.

      Με απλά λόγια, ο στόχος μου είναι να δημιουργώ δουλειά που τραβά την προσοχή, χτίζει εμπιστοσύνη και πετυχαίνει τους στόχους.

      Δημιουργώ περιεχόμενο · που δεν είναι απλώς ωραίο, αλλά αποδίδει.
    
      Με υπόβαθρο στο business και το marketing, καθώς και πρακτική εμπειρία σε e-commerce και social media,
      δίνω έμφαση στη σύνδεση στρατηγικής, δημιουργικότητας και 
    `
  };

  const lang = (document.documentElement.lang || 'en').toLowerCase();
  const isGreek = lang.startsWith('el') || lang.startsWith('gr');

  const longText = isGreek ? ABOUT_TEXT.el : ABOUT_TEXT.en;

  const atlasPath = isGreek ? '../fonts/tiktok-el.png' : '../fonts/josefin-en.png';
  const fontJsonPath = isGreek ? '../fonts/TikTokSans-Regular.json' : '../fonts/JosefinSans-Regular.json';

  const textData = await createTextRungs({
    helixPoint: dnaData.helixPoint,
    tubeRadius: dnaData.tubeRadius,
    dnaHeight: dnaData.height,
    longText,
    atlasPath,
    fontJsonPath
  });

  function applyResponsiveDNALayout(width) {
  const isMobile = width <= 768;

  if (isMobile) {
    // centered, vertical, top-to-bottom feeling
    dnaData.root.rotation.set(0.0, 0.02, 0.0);
    dnaData.root.position.set(0, 0.03, 0);
  } else {
    // original desktop/tablet diagonal
    dnaData.root.rotation.set(0.02, 0.17, 0.60);
    dnaData.root.position.set(-0.62, 0.03, 0);
  }

  textRoot.rotation.copy(dnaData.root.rotation);
  textRoot.position.copy(dnaData.root.position);
}

  textRoller.add(textData.group);

  // ---------- TEXT RENDERERS ----------
  const sharpTextRenderer = createOverlayRenderer(sharpTextCanvas);
  const blurTextRenderer = createOverlayRenderer(blurTextCanvas);

  const scroll = createScrollController();

  let previousPhase = 0;
  let starBoost = 0;
  let resizeRaf = 0;
  let resizeTimer = 0;

  camera.lookAt(0, 0, 0);

  function getResponsiveSceneScale(width) {
    if (width <= 480) return 0.64;
    if (width <= 601) return 0.72;
    if (width <= 768) return 0.80;
    if (width <= 1024) return 0.84;
    return 1.0;
  }

  function getResponsiveCameraZ(width) {
    if (width <= 480) return 24.5;
    if (width <= 601) return 24.5;
    if (width <= 768) return 23.5;
    if (width <= 1024) return 25.2;
    return 22;
  }

  function resize() {
    const { width, height } = getViewportSize();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    // keep current DNA/text responsive behavior
    camera.aspect = width / Math.max(height, 1);
    camera.position.z = getResponsiveCameraZ(width);
    camera.updateProjectionMatrix();

    // resize buffers only, do not rewrite canvas CSS layout
    baseRenderer.setPixelRatio(dpr);
    baseRenderer.setSize(width, height, false);

    sharpTextRenderer.setPixelRatio(dpr);
    sharpTextRenderer.setSize(width, height, false);

    blurTextRenderer.setPixelRatio(dpr);
    blurTextRenderer.setSize(width, height, false);

    const responsiveScale = getResponsiveSceneScale(width);

    applyResponsiveDNALayout(width);

    dnaData.root.scale.setScalar(1.40 * responsiveScale);

    textRoot.rotation.copy(dnaData.root.rotation);
    textRoot.position.copy(dnaData.root.position);
    textRoot.scale.setScalar(1.40 * responsiveScale);
  }

  function queueResize() {
    cancelAnimationFrame(resizeRaf);
    clearTimeout(resizeTimer);

    resizeRaf = requestAnimationFrame(resize);
    resizeTimer = setTimeout(resize, 180);
  }

  window.addEventListener('resize', queueResize, { passive: true });

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', queueResize, { passive: true });
  }

  window.addEventListener('orientationchange', () => {
    setTimeout(resize, 120);
    setTimeout(resize, 260);
  }, { passive: true });

  function animate() {
    requestAnimationFrame(animate);

    const phase = scroll.tick();

    const textFlow = -phase * 0.20;
    const dnaFlow = phase * 0.008;

    dnaData.roller.rotation.y = dnaFlow * Math.PI * 2;

    textRoller.rotation.y = dnaFlow * Math.PI * 2;
    textData.update(textFlow);

    const scrollDelta = Math.abs(phase - previousPhase);
    previousPhase = phase;

    const glowShift = (Math.sin(phase * 1.2) + 1) * 0.5;
    electricMix.copy(electricA).lerp(electricB, glowShift * 0.42);

    dnaData.tubeA.material.emissive.copy(electricMix);
    dnaData.tubeB.material.emissive.copy(electricMix);
    dnaData.tubeA.material.emissiveIntensity = 0.64 + glowShift * 0.58;
    dnaData.tubeB.material.emissiveIntensity = 0.64 + glowShift * 0.58;

    dnaData.glowTubeA.material.color.copy(electricMix);
    dnaData.glowTubeB.material.color.copy(electricMix);
    dnaData.glowTubeA.material.opacity = 0.05 + glowShift * 0.03;
    dnaData.glowTubeB.material.opacity = 0.05 + glowShift * 0.03;

    // stars are not resized as objects
    starBoost += scrollDelta * 0.20;
    starBoost *= 0.10;
    starBoost = Math.min(starBoost, 0.018);

    stars.rotation.y += 0.00005 + starBoost;
    stars.rotation.x += 0.00001 + starBoost * 0.13;

    const t = (Math.sin(performance.now() * 0.00008) + 1) * 0.5;
    baseScene.background.copy(bgA).lerp(bgB, t * 0.26);
    baseScene.fog.color.copy(baseScene.background);

    baseRenderer.render(baseScene, camera);
    sharpTextRenderer.render(textScene, camera);
    blurTextRenderer.render(textScene, camera);
  }

  resize();
  animate();
}