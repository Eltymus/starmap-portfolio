import * as THREE from 'three';
import { random } from '../../lib/math';

const DURATION = 1100;

export const createShootingStar = (scene: THREE.Scene) => {
  const geometry = new THREE.BufferGeometry();
  const positions = new THREE.BufferAttribute(new Float32Array(6), 3).setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute('position', positions);
  geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array([0, 0, 0, 1, 0.9, 0.7]), 3));
  const material = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending
  });
  scene.add(new THREE.Line(geometry, material));

  let current: { origin: THREE.Vector3; velocity: THREE.Vector3; t: number } | null = null;
  let nextAt = 3000;

  return (time: number, dt: number, viewDirection: THREE.Vector3, enabled: boolean): void => {
    if (!enabled) {
      current = null;
      material.opacity = 0;
      return;
    }
    if (!current && time > nextAt) {
      const origin = viewDirection
        .clone()
        .multiplyScalar(70)
        .add(new THREE.Vector3((random() - 0.5) * 50, 14 + random() * 10, (random() - 0.5) * 20));
      current = {
        origin,
        velocity: new THREE.Vector3(-(0.6 + random()), -0.45, (random() - 0.5) * 0.3).normalize(),
        t: 0
      };
    }
    if (!current) return;
    current.t += dt / DURATION;
    const head = current.origin.clone().addScaledVector(current.velocity, current.t * 34);
    const tail = head.clone().addScaledVector(current.velocity, -7);
    positions.set([tail.x, tail.y, tail.z, head.x, head.y, head.z]);
    positions.needsUpdate = true;
    material.opacity = Math.sin(Math.min(1, current.t) * Math.PI);
    if (current.t >= 1) {
      current = null;
      material.opacity = 0;
      nextAt = time + 4000 + random() * 6000;
    }
  };
};
