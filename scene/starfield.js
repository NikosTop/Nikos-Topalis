import * as THREE from '../js/vendor/three.module.js';

function createStarTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  const center = size / 2;

  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.30, 'rgba(255,255,255,0.95)');
  gradient.addColorStop(0.68, 'rgba(255,255,255,0.22)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createNebulaTexture() {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);

  const colors = [
    'rgba(26,42,74,0.12)',   // #1a2a4a
    'rgba(45,63,107,0.10)',  // #2d3f6b
    'rgba(107,92,255,0.07)'  // #6b5cff
  ];

  // use MANY softer blobs so no single circle is visible
  for (let i = 0; i < 90; i += 1) {
    const x = size * (0.08 + Math.random() * 0.84);
    const y = size * (0.08 + Math.random() * 0.84);
    const r = size * (0.08 + Math.random() * 0.18);
    const color = colors[i % colors.length];

    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(0.38, color.replace(/0\.\d+\)/, '0.035)'));
    g.addColorStop(0.72, color.replace(/0\.\d+\)/, '0.012)'));
    g.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // blur repeatedly so the texture becomes cloud-like, not circles
  const blurCanvas = document.createElement('canvas');
  blurCanvas.width = size;
  blurCanvas.height = size;
  const blurCtx = blurCanvas.getContext('2d');

  blurCtx.clearRect(0, 0, size, size);
  blurCtx.filter = 'blur(36px)';
  blurCtx.drawImage(canvas, 0, 0);

  ctx.clearRect(0, 0, size, size);
  ctx.filter = 'blur(22px)';
  ctx.drawImage(blurCanvas, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

function createStarsLayer({
  count,
  spread,
  color,
  size,
  opacity,
  texture
}) {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * spread;
    positions[i3 + 1] = (Math.random() - 0.5) * spread;
    positions[i3 + 2] = (Math.random() - 0.5) * spread;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    map: texture,
    color,
    size,
    sizeAttenuation: true,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false
  });

  return new THREE.Points(geometry, material);
}

export function createStarfield() {
  const group = new THREE.Group();

  const starTexture = createStarTexture();
  const nebulaTexture = createNebulaTexture();

  const w = window.innerWidth;

  const starScale =
    w <= 480 ? 1.90 :
    w <= 768 ? 1.60 :
    w <= 1024 ? 1.40 :
    1.0;

  // main white stars
  const whiteStars = createStarsLayer({
    count: 1700,
    spread: 120,
    color: 0xffffff,
    size: 0.28 * starScale,
    opacity: 0.92,
    texture: starTexture
  });

  // cool pale-blue stars
  const blueStars = createStarsLayer({
    count: 620,
    spread: 124,
    color: 0xbfd0ff,
    size: 0.34 * starScale,
    opacity: 0.82,
    texture: starTexture
  });

  // pale warm sunlight stars
  const warmStars = createStarsLayer({
    count: 180,
    spread: 124,
    color: 0xffefcf,
    size: 0.42 * starScale,
    opacity: 0.70,
    texture: starTexture
  });

  // sparse larger stars for depth
  const largeStars = createStarsLayer({
    count: 110,
    spread: 126,
    color: 0xe8eeff,
    size: 0.48 * starScale,
    opacity: 0.48,
    texture: starTexture
  });

  group.add(whiteStars, blueStars, warmStars, largeStars);

    const nebulaMatA = new THREE.MeshBasicMaterial({
    map: nebulaTexture,
    transparent: true,
    opacity: 0.11,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false
  });

  const nebulaMatB = new THREE.MeshBasicMaterial({
    map: nebulaTexture,
    transparent: true,
    opacity: 0.08,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false
  });

  const nebulaMatC = new THREE.MeshBasicMaterial({
    map: nebulaTexture,
    transparent: true,
    opacity: 0.06,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false
  });

  // 2–3 subtle, diffused clouds behind the scene
  const cloudA = new THREE.Mesh(new THREE.PlaneGeometry(52, 38), nebulaMatA);
  cloudA.position.set(-22, 14, -42);
  cloudA.rotation.z = -0.22;
  group.add(cloudA);

  const cloudB = new THREE.Mesh(new THREE.PlaneGeometry(42, 31), nebulaMatB);
  cloudB.position.set(18, 4, -46);
  cloudB.rotation.z = 0.35;
  group.add(cloudB);

  const cloudC = new THREE.Mesh(new THREE.PlaneGeometry(50, 36), nebulaMatC);
  cloudC.position.set(24, -18, -50);
  cloudC.rotation.z = -0.12;
  group.add(cloudC);

  group.userData = {
    clouds: [cloudA, cloudB, cloudC]
  };

  return group;
}