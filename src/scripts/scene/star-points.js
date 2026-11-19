import * as THREE from 'three';
import { random } from '../../lib/math.js';

const VERTEX_SHADER = `attribute vec3 aColor; attribute float aSize; attribute float aPhase; attribute float aType;
    uniform float uTime; uniform float uPR; uniform float uTw; uniform float uMax;
    varying vec3 vC; varying float vT; varying float vType; varying float vRot; varying float vGl;
    void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv;
      float h1 = fract(aPhase * 43.17), h2 = fract(aPhase * 91.73), h3 = fract(aPhase * 17.31);
      float amp = uTw * (0.35 + 1.4 * h1);
      float w = 0.5 + 0.5 * sin(uTime * 0.001 * (0.5 + h2 * 3.2) + aPhase * 40.0) * (0.6 + 0.4 * sin(uTime * 0.00037 * (1.0 + h3) + aPhase * 9.0));
      float gl = pow(max(0.0, sin(uTime * 0.00045 * (0.4 + h3 * 1.6) + aPhase * 71.0)), 70.0) * step(0.5, aType);
      vT = clamp(1.0 - amp * w, 0.15, 1.0) + gl * 1.3; vGl = gl;
      gl_PointSize = min(uMax, aSize * (1.0 + gl * 0.9) * uPR * (100.0 / max(0.1, -mv.z))); vC = aColor; vType = aType;
      vRot = aPhase * 0.6 + uTime * 0.00004 * step(2.5, aType) + gl * 0.4; }`;

const FRAGMENT_SHADER = `uniform float uAlpha; uniform float uFlare; varying vec3 vC; varying float vT; varying float vType; varying float vRot; varying float vGl;
    void main(){ vec2 p = gl_PointCoord - 0.5; float d = length(p);
      float g = pow(smoothstep(0.5, 0.0, d), 3.0);
      float cr = cos(vRot), sr = sin(vRot); vec2 q = mat2(cr, -sr, sr, cr) * p;
      float r4 = exp(-abs(q.x) * 55.0) * smoothstep(0.5, 0.0, abs(q.y)) + exp(-abs(q.y) * 55.0) * smoothstep(0.5, 0.0, abs(q.x));
      vec2 q2 = mat2(0.7071, -0.7071, 0.7071, 0.7071) * q;
      float r8 = (exp(-abs(q2.x) * 80.0) * smoothstep(0.3, 0.0, abs(q2.y)) + exp(-abs(q2.y) * 80.0) * smoothstep(0.3, 0.0, abs(q2.x))) * 0.7;
      float ring = exp(-pow((d - 0.36) * 30.0, 2.0)) * 0.35 + exp(-pow((d - 0.44) * 60.0, 2.0)) * 0.15;
      float rays = (r4 * step(0.5, vType) + r8 * step(1.5, vType)) * (uFlare + vGl * 1.6) + r4 * vGl * 1.2;
      float rg = ring * step(2.5, vType) * uFlare;
      float core = smoothstep(0.09, 0.0, d);
      float a = clamp(g + rays + rg + core, 0.0, 1.0) * uAlpha * vT; if (a < 0.003) discard;
      gl_FragColor = vec4(vC * (1.0 + core * 0.7), a); }`;

export const STAR_TYPE = { dot: 0, glint: 1, cross: 2, flare: 3 };

const materials = [];
let pixelRatio = 1;

export const setStarPixelRatio = (value) => {
  pixelRatio = value;
  materials.forEach((material) => {
    material.uniforms.uPR.value = value;
  });
};

export const setStarTime = (time) => {
  materials.forEach((material) => {
    material.uniforms.uTime.value = time;
  });
};

export const createStarMaterial = ({ twinkle = 0.35, maxSize = 40, alpha = 1, flare = 0 } = {}) => {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPR: { value: pixelRatio },
      uTw: { value: twinkle },
      uMax: { value: maxSize },
      uAlpha: { value: alpha },
      uFlare: { value: flare }
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  materials.push(material);
  return material;
};

export const createStarGeometry = (positions, colors, sizes, types) => {
  const count = positions.length / 3;
  const phases = new Float32Array(count);
  for (let i = 0; i < count; i++) phases[i] = random();
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute('aType', new THREE.BufferAttribute(types || new Float32Array(count).fill(STAR_TYPE.glint), 1));
  return geometry;
};

export const createStarCloud = (count, placeStar, materialOptions) => {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const types = new Float32Array(count);
  const position = new THREE.Vector3();
  const color = new THREE.Color();
  const star = { type: STAR_TYPE.glint };
  for (let i = 0; i < count; i++) {
    star.type = STAR_TYPE.glint;
    sizes[i] = placeStar(i, position, color, star);
    positions.set([position.x, position.y, position.z], i * 3);
    colors.set([color.r, color.g, color.b], i * 3);
    types[i] = star.type;
  }
  return new THREE.Points(createStarGeometry(positions, colors, sizes, types), createStarMaterial(materialOptions));
};
