import * as THREE from '../js/vendor/three.module.js';

export function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    30,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  );

  camera.position.set(0, 0, 22);

  return camera;
}