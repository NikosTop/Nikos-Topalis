import * as THREE from '../js/vendor/three.module.js';

export function createDNA() {
  const root = new THREE.Group();
  const roller = new THREE.Group();
  root.add(roller);

  // wider + slightly more curve
  const turns = 4;
  const height = 58;
  const radius = 2.72;
  const tubeRadius = 0.18;
  const pointsCount = 620;

  function helixPoint(t, side = 1, inset = 0) {
    const angle = t * Math.PI * 2 * turns;
    const y = (t - 0.5) * height;
    const r = Math.max(0.001, radius - inset);
    const phase = side === 1 ? 0 : Math.PI;

    return new THREE.Vector3(
      Math.cos(angle + phase) * r,
      y,
      Math.sin(angle + phase) * r
    );
  }

  // top = pale blue, center = white, bottom = pale violet
  function getStrandColorAtT(t) {
    const topColor = new THREE.Color('#95d1ff');
    const centerColor = new THREE.Color('#ffffff');
    const bottomColor = new THREE.Color('#eadfff');

    let color = new THREE.Color();

    if (t < 0.5) {
      const k = t / 0.5;
      color.lerpColors(topColor, centerColor, k);
    } else {
      const k = (t - 0.5) / 0.5;
      color.lerpColors(centerColor, bottomColor, k);
    }

    // very subtle cool-end tint shift, around 5–10%
    color.offsetHSL(0.0, 0.0, 0.0);
    return color;
  }

  function applyGradientToTubeGeometry(geometry) {
    const pos = geometry.attributes.position;
    const colors = [];

    for (let i = 0; i < pos.count; i += 1) {
      const y = pos.getY(i);
      const t = THREE.MathUtils.clamp((y + height * 0.5) / height, 0, 1);
      const c = getStrandColorAtT(t);
      colors.push(c.r, c.g, c.b);
    }

    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  }

  const strandA = [];
  const strandB = [];

  for (let i = 0; i < pointsCount; i += 1) {
    const t = i / (pointsCount - 1);
    strandA.push(helixPoint(t, 1, 0));
    strandB.push(helixPoint(t, -1, 0));
  }

  const strandMaterial = new THREE.MeshPhysicalMaterial({
    vertexColors: true,
    color: 0xffffff,
    emissive: 0x9fc8ff,
    emissiveIntensity: 0.05,
    roughness: 0.18,
    metalness: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    reflectivity: 0.5
  });

  const curveA = new THREE.CatmullRomCurve3(strandA);
  const curveB = new THREE.CatmullRomCurve3(strandB);

  const geometryA = new THREE.TubeGeometry(curveA, 1000, tubeRadius, 24, false);
  const geometryB = new THREE.TubeGeometry(curveB, 1000, tubeRadius, 24, false);

  applyGradientToTubeGeometry(geometryA);
  applyGradientToTubeGeometry(geometryB);

  const tubeA = new THREE.Mesh(geometryA, strandMaterial);
  const tubeB = new THREE.Mesh(geometryB, strandMaterial);

  roller.add(tubeA, tubeB);
  
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x58b8ff,
    transparent: true,
    opacity: 0.03
  });

  const glowTubeA = new THREE.Mesh(
    new THREE.TubeGeometry(curveA, 1000, tubeRadius * 1.2, 24, false),
    glowMaterial
  );

  const glowTubeB = new THREE.Mesh(
    new THREE.TubeGeometry(curveB, 1000, tubeRadius * 1.2, 24, false),
    glowMaterial
  );

  roller.add(glowTubeA, glowTubeB);

  root.rotation.set(0.02, 0.17, 0.60);
  root.position.set(-0.62, 0.03, 0);
  root.scale.set(1.40, 1.40, 1.40);

  return {
    root,
    roller,
    turns,
    height,
    radius,
    tubeRadius,
    helixPoint,
    tubeA,
    tubeB,
    glowTubeA,
    glowTubeB
  };
}