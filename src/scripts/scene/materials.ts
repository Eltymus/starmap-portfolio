import * as THREE from 'three';

/** A transparent, additively blended material that never writes depth: the look of glowing gold ink. */
export const additiveMaterial = (options: THREE.MeshBasicMaterialParameters = {}): THREE.MeshBasicMaterial =>
  new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, ...options });
