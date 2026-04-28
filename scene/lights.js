import * as THREE from '../js/vendor/three.module.js';

export function createLights(scene) {
  const hemi = new THREE.HemisphereLight(0xffffff, 0x05070b, 1.15);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(6, 8, 10);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x8db8ff, 1.25);
  fill.position.set(-7, -3, 7);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffffff, 0.9);
  rim.position.set(0, 0, 12);
  scene.add(rim);

  return { hemi, key, fill, rim };
}