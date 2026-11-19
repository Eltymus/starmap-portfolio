import * as THREE from 'three';
import { additiveMaterial } from './materials';
import { random, clamp } from '../../lib/math';
import { HEX } from '../../lib/theme';
import type { Chapter, Figure } from '../../data/types';
import { createStarGeometry, createStarMaterial, STAR_TYPE } from './star-points';
import { createStripeTexture, createRingTexture } from './textures';
import { buildPenTrails } from './trails';

const DISTANCE = 40;
const SCALE = 1.42;
const DUST_COUNT = 90;
const RING_COUNT = 6;
const DRAW_SPEED = 0.0095;
const HOVER_RADIUS = 26;
const OFFSCREEN = 999;

const stripeTexture = createStripeTexture();
const ringTexture = createRingTexture();
const ribbonGeometry = new THREE.PlaneGeometry(1, 1);

const fadeTo = (current: number, target: number, rate: number): number => current + (target - current) * rate;

type GlowMesh = THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;

/** A straight piece of a pen trail, with its position along the trail. */
interface Segment {
  a: THREE.Vector2;
  b: THREE.Vector2;
  /** Indices of the stars at either end. */
  ia: number;
  ib: number;
  trail: number;
  length: number;
  /** Distance along the trail where this segment begins. */
  start: number;
  angle: number;
  ribbon: GlowMesh;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
}

interface Ring {
  mesh: GlowMesh;
  /** Progress of the expanding ring, 0…1; 1 means idle. */
  t: number;
  big: number;
}

/** Where the pointer is, in viewport pixels. */
export interface Pointer {
  x: number;
  y: number;
}

/** The star note under the pointer: screen position, text and chapter index. */
export interface HoveredNote {
  sx: number;
  sy: number;
  txt: string;
  n: number;
}

export interface ConstellationFrame {
  index: number;
  isActive: boolean;
  time: number;
  dt: number;
  camera: THREE.Camera;
  canvasRect: DOMRect;
  pointer: Pointer;
}

type PenPosition = readonly [x: number, y: number] | null;

/**
 * One chapter's constellation in the 3D sky: stars, the pen that draws the strokes,
 * the engraving behind it, its label and the sparkle effects.
 */
export class Constellation {
  private readonly figure: Figure;
  private readonly notes: Chapter['starNotes'];
  private readonly group = new THREE.Group();

  private sizes!: Float32Array;
  private baseSizes!: number[];
  private starGeometry!: THREE.BufferGeometry;
  private starMaterial!: THREE.ShaderMaterial;
  private ignition!: Float32Array;
  private flash!: Float32Array;
  private lit!: Uint8Array;

  private segments!: Segment[];
  private totalLength!: number;
  private trailCount!: number;
  private linePositions!: Float32Array;
  private lineGeometry!: THREE.BufferGeometry;
  private lineMaterial!: THREE.LineBasicMaterial;
  private glowMaterial!: THREE.MeshBasicMaterial;
  private guide!: THREE.LineSegments<THREE.BufferGeometry, THREE.LineDashedMaterial>;

  private art!: GlowMesh;
  private label!: GlowMesh;
  private pen!: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  private penPositions!: Float32Array;
  private dust!: THREE.Points;
  private dustPositions!: Float32Array;
  private dustSizes!: Float32Array;
  private particles!: Particle[];
  private rings!: Ring[];

  private drawn = 0;
  private done = false;
  private visited = false;
  private hovered = -1;
  private lastDrawn: number | undefined = undefined;
  private sizesSettled = false;
  private dustActive = false;

  constructor(chapter: Chapter, direction: THREE.Vector3, scene: THREE.Scene) {
    this.figure = chapter.figure;
    this.notes = chapter.starNotes;
    this.group.position.copy(direction).multiplyScalar(DISTANCE);
    this.group.lookAt(0, 0, 0);
    this.group.scale.setScalar(SCALE);
    scene.add(this.group);

    this.createStars();
    this.createStrokes();
    this.createArtAndLabel(chapter.skyLabelY);
    this.createPen();
    this.createDust();
    this.createRings();
  }

  private createStars(): void {
    const { points } = this.figure;
    const count = points.length;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    this.sizes = new Float32Array(count);
    this.baseSizes = [];
    points.forEach((p, k) => {
      positions.set([p[0], p[1], 0.05], k * 3);
      colors.set([1, 0.93, 0.78], k * 3);
      this.baseSizes.push(6 + ((k * 37) % 4));
      this.sizes[k] = this.baseSizes[k] * 0.35;
    });
    this.starGeometry = createStarGeometry(
      positions,
      colors,
      this.sizes,
      new Float32Array(count).fill(STAR_TYPE.cross)
    );
    this.starMaterial = createStarMaterial({ twinkle: 0.25, maxSize: 44, flare: 0.7, alpha: 0.6 });
    this.group.add(new THREE.Points(this.starGeometry, this.starMaterial));
    this.ignition = new Float32Array(count);
    this.flash = new Float32Array(count);
    this.lit = new Uint8Array(count);
  }

  private createStrokes(): void {
    const { points } = this.figure;
    const trails = buildPenTrails(this.figure);
    this.glowMaterial = additiveMaterial({ map: stripeTexture, color: HEX.gold, opacity: 0 });
    this.segments = [];
    this.totalLength = 0;
    trails.forEach((trail, trailIndex) => {
      let start = 0;
      trail.forEach((step) => {
        const a = new THREE.Vector2(points[step.a][0], points[step.a][1]);
        const b = new THREE.Vector2(points[step.b][0], points[step.b][1]);
        const length = a.distanceTo(b);
        this.segments.push({
          a,
          b,
          ia: step.a,
          ib: step.b,
          trail: trailIndex,
          length,
          start,
          angle: Math.atan2(b.y - a.y, b.x - a.x),
          ribbon: new THREE.Mesh(ribbonGeometry, this.glowMaterial)
        });
        start += length;
      });
      this.totalLength = Math.max(this.totalLength, start);
    });
    this.trailCount = trails.length;

    this.linePositions = new Float32Array(this.segments.length * 6);
    this.lineGeometry = new THREE.BufferGeometry();
    this.lineGeometry.setAttribute('position', new THREE.BufferAttribute(this.linePositions, 3));
    this.lineMaterial = new THREE.LineBasicMaterial({
      color: HEX.strokeWhite,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.group.add(new THREE.LineSegments(this.lineGeometry, this.lineMaterial));

    this.segments.forEach((segment) => {
      segment.ribbon.rotation.z = segment.angle;
      segment.ribbon.visible = false;
      this.group.add(segment.ribbon);
    });

    const guidePositions: number[] = [];
    this.segments.forEach((s) => guidePositions.push(s.a.x, s.a.y, 0, s.b.x, s.b.y, 0));
    this.guide = new THREE.LineSegments(
      new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(guidePositions, 3)),
      new THREE.LineDashedMaterial({ color: HEX.gold, dashSize: 0.12, gapSize: 0.22, transparent: true, opacity: 0 })
    );
    this.guide.computeLineDistances();
    this.group.add(this.guide);
  }

  private createArtAndLabel(labelY: number): void {
    this.art = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), additiveMaterial({ opacity: 0 }));
    this.art.position.z = -0.05;
    this.group.add(this.art);
    this.label = new THREE.Mesh(new THREE.PlaneGeometry(9, 1.93), additiveMaterial({ opacity: 0 }));
    this.label.position.set(0, labelY, 0);
    this.group.add(this.label);
  }

  private createPen(): void {
    const count = this.trailCount;
    this.penPositions = new Float32Array(count * 3).fill(OFFSCREEN);
    this.pen = new THREE.Points(
      createStarGeometry(
        this.penPositions,
        new Float32Array(count * 3).map((_, k) => [1, 0.92, 0.75][k % 3]),
        new Float32Array(count).fill(20),
        new Float32Array(count).fill(STAR_TYPE.cross)
      ),
      createStarMaterial({ twinkle: 0, maxSize: 64, flare: 1.4, alpha: 0 })
    );
    this.group.add(this.pen);
  }

  private createDust(): void {
    this.dustPositions = new Float32Array(DUST_COUNT * 3).fill(OFFSCREEN);
    this.dustSizes = new Float32Array(DUST_COUNT);
    this.dust = new THREE.Points(
      createStarGeometry(
        this.dustPositions,
        new Float32Array(DUST_COUNT * 3).map((_, k) => (k % 3 === 2 ? 0.6 : 1)),
        this.dustSizes,
        new Float32Array(DUST_COUNT).fill(STAR_TYPE.glint)
      ),
      createStarMaterial({ twinkle: 0.5, maxSize: 14, flare: 0.8 })
    );
    this.group.add(this.dust);
    this.particles = [];
    for (let k = 0; k < DUST_COUNT; k++) this.particles.push({ x: 0, y: 0, vx: 0, vy: 0, life: 0, size: 0 });
  }

  private createRings(): void {
    this.rings = [];
    for (let k = 0; k < RING_COUNT; k++) {
      const mesh = new THREE.Mesh(ribbonGeometry, additiveMaterial({ map: ringTexture, opacity: 0 }));
      mesh.position.z = 0.06;
      this.group.add(mesh);
      this.rings.push({ mesh, t: 1, big: 1 });
    }
  }

  setArt(artTexture: THREE.Texture, labelTexture: THREE.Texture): void {
    this.art.material.map = artTexture;
    this.art.material.needsUpdate = true;
    this.label.material.map = labelTexture;
    this.label.material.needsUpdate = true;
  }

  private burst(x: number, y: number, big = false): void {
    const ring = this.rings.find((r) => r.t >= 1) || this.rings[0];
    ring.t = 0;
    ring.big = big ? 3.2 : 1;
    ring.mesh.position.x = x;
    ring.mesh.position.y = y;
  }

  private emitDust(x: number, y: number, count: number): void {
    for (let k = 0; k < count; k++) {
      const particle = this.particles.find((q) => q.life <= 0);
      if (!particle) return;
      particle.x = x;
      particle.y = y;
      const a = random() * Math.PI * 2;
      const speed = 0.003 + random() * 0.012;
      particle.vx = Math.cos(a) * speed;
      particle.vy = Math.sin(a) * speed - 0.002;
      particle.life = 1;
      particle.size = 2 + random() * 4;
    }
  }

  private ignite(vertex: number, x: number, y: number, isActive: boolean, dustCount: number): void {
    this.lit[vertex] = 1;
    this.flash[vertex] = 1;
    if (isActive) {
      this.burst(x, y);
      this.emitDust(x, y, dustCount);
    }
  }

  private updateStrokes(isActive: boolean, penPositions: PenPosition[]): void {
    const drawn = this.drawn;
    const idle = !isActive && this.lastDrawn === drawn;
    this.lastDrawn = drawn;
    if (idle) return;
    this.segments.forEach((s, k) => {
      const t = clamp((drawn - s.start) / s.length, 0, 1);
      const ex = s.a.x + (s.b.x - s.a.x) * t;
      const ey = s.a.y + (s.b.y - s.a.y) * t;
      this.linePositions.set([s.a.x, s.a.y, 0, ex, ey, 0], k * 6);
      if (t > 0) {
        const length = s.length * t;
        s.ribbon.visible = true;
        s.ribbon.scale.set(length, 0.42, 1);
        s.ribbon.position.set(s.a.x + ((s.b.x - s.a.x) * t) / 2, s.a.y + ((s.b.y - s.a.y) * t) / 2, 0.01);
      } else s.ribbon.visible = false;
      if (t > 0 && t < 1) penPositions[s.trail] = [ex, ey];
      if (drawn > s.start && !this.lit[s.ia]) this.ignite(s.ia, s.a.x, s.a.y, isActive, 8);
      if (t >= 1 && !this.lit[s.ib]) this.ignite(s.ib, s.b.x, s.b.y, isActive, 10);
    });
    this.lineGeometry.attributes.position.needsUpdate = true;
  }

  private updateOpacities(isActive: boolean, index: number, time: number): void {
    const done = this.done;
    this.lineMaterial.opacity = fadeTo(this.lineMaterial.opacity, isActive ? 0.95 : this.visited ? 0.32 : 0, 0.06);
    this.glowMaterial.opacity = fadeTo(
      this.glowMaterial.opacity,
      isActive ? 0.55 + 0.12 * Math.sin(time * 0.002 + index) : this.visited ? 0.14 : 0,
      0.06
    );
    this.guide.material.opacity = fadeTo(
      this.guide.material.opacity,
      isActive && !done ? 0.28 : !this.visited ? 0.06 : 0,
      0.05
    );
    this.art.material.opacity = fadeTo(
      this.art.material.opacity,
      isActive && this.drawn > this.totalLength * 0.55 ? 0.75 : 0,
      isActive ? 0.03 : 0.08
    );
    this.label.material.opacity = fadeTo(
      this.label.material.opacity,
      isActive && done ? 1 : this.visited ? 0.25 : 0,
      0.05
    );
    this.starMaterial.uniforms.uAlpha.value = fadeTo(
      this.starMaterial.uniforms.uAlpha.value,
      isActive ? 1 : this.visited ? 0.55 : 0.35,
      0.06
    );
  }

  private updateStarSizes(isActive: boolean, time: number): void {
    for (let v = 0; v < this.baseSizes.length; v++) {
      this.ignition[v] += ((this.lit[v] ? 1 : 0) - this.ignition[v]) * 0.12;
      this.flash[v] *= 0.94;
      const pulse =
        isActive && this.done && this.notes[v] ? 1 + 0.16 * (0.5 + 0.5 * Math.sin(time * 0.004 + v * 1.7)) : 1;
      this.sizes[v] =
        this.baseSizes[v] *
        (0.35 + 0.65 * this.ignition[v]) *
        (1 + this.flash[v] * 1.1) *
        pulse *
        (this.hovered === v ? 1.5 : 1);
    }
    let moving = isActive;
    if (!moving) {
      for (let v = 0; v < this.baseSizes.length; v++) {
        if (this.flash[v] > 0.01 || Math.abs(this.ignition[v] - (this.lit[v] ? 1 : 0)) > 0.01) {
          moving = true;
          break;
        }
      }
    }
    if (moving || !this.sizesSettled) this.starGeometry.attributes.aSize.needsUpdate = true;
    this.sizesSettled = !moving;
  }

  private updatePen(isActive: boolean, penPositions: PenPosition[]): void {
    const uniforms = this.pen.material.uniforms;
    const anyPen = isActive && penPositions.some((q) => q);
    if (!anyPen) {
      uniforms.uAlpha.value *= 0.85;
      return;
    }
    const positions = this.penPositions;
    penPositions.forEach((q, k) => {
      if (q) {
        positions.set([q[0], q[1], 0.08], k * 3);
        if (random() < 0.7) this.emitDust(q[0], q[1], 1);
      } else positions.set([OFFSCREEN, OFFSCREEN, 0], k * 3);
    });
    this.pen.geometry.attributes.position.needsUpdate = true;
    uniforms.uAlpha.value += (1 - uniforms.uAlpha.value) * 0.3;
  }

  private updateDust(dt: number): void {
    let anyDust = false;
    this.particles.forEach((p, k) => {
      if (p.life > 0) {
        anyDust = true;
        p.x += p.vx * dt * 0.06;
        p.y += p.vy * dt * 0.06;
        p.vy -= 0.00002 * dt;
        p.life -= 0.0011 * dt;
        this.dustPositions[k * 3] = p.x;
        this.dustPositions[k * 3 + 1] = p.y;
        this.dustPositions[k * 3 + 2] = 0.07;
        this.dustSizes[k] = p.size * Math.max(0, p.life);
      } else {
        this.dustSizes[k] = 0;
      }
    });
    if (anyDust || this.dustActive) {
      this.dust.geometry.attributes.position.needsUpdate = true;
      this.dust.geometry.attributes.aSize.needsUpdate = true;
    }
    this.dustActive = anyDust;
  }

  private updateRings(dt: number): void {
    this.rings.forEach((ring) => {
      ring.mesh.visible = ring.t < 1;
    });
    this.rings.forEach((ring) => {
      if (ring.t < 1) {
        ring.t = Math.min(1, ring.t + dt * 0.0012);
        const e = 1 - Math.pow(1 - ring.t, 3);
        ring.mesh.scale.setScalar((0.3 + e * 2.2) * ring.big);
        ring.mesh.material.opacity = (1 - ring.t) * 0.45;
      } else ring.mesh.material.opacity = 0;
    });
  }

  private findHoveredNote(camera: THREE.Camera, rect: DOMRect, pointer: Pointer, index: number): HoveredNote | null {
    for (const key in this.notes) {
      const v = +key;
      const projected = new THREE.Vector3(this.figure.points[v][0], this.figure.points[v][1], 0.05)
        .applyMatrix4(this.group.matrixWorld)
        .project(camera);
      const sx = (projected.x * 0.5 + 0.5) * rect.width + rect.left;
      const sy = (-projected.y * 0.5 + 0.5) * rect.height + rect.top;
      if (Math.hypot(sx - pointer.x, sy - pointer.y) < HOVER_RADIUS) {
        this.hovered = v;
        return { sx, sy, txt: this.notes[key], n: index };
      }
    }
    return null;
  }

  /** Advances one frame; returns the star note under the pointer, if any. */
  update({ index, isActive, time, dt, camera, canvasRect, pointer }: ConstellationFrame): HoveredNote | null {
    if (isActive) {
      this.visited = true;
      this.drawn = Math.min(this.totalLength, this.drawn + dt * DRAW_SPEED);
    }
    const penPositions: PenPosition[] = new Array(this.trailCount).fill(null);
    this.updateStrokes(isActive, penPositions);

    const done = this.drawn >= this.totalLength - 1e-3;
    if (done && !this.done) {
      this.done = true;
      if (isActive) {
        for (let v = 0; v < this.baseSizes.length; v++) this.flash[v] = 1.2;
        this.burst(0, 0, true);
      }
    }
    this.updateOpacities(isActive, index, time);
    this.updateStarSizes(isActive, time);
    this.updatePen(isActive, penPositions);
    this.updateDust(dt);

    this.art.visible = this.art.material.opacity > 0.004;
    this.label.visible = this.label.material.opacity > 0.004;
    this.guide.visible = this.guide.material.opacity > 0.004;
    this.updateRings(dt);

    this.hovered = -1;
    if (isActive && done) return this.findHoveredNote(camera, canvasRect, pointer, index);
    return null;
  }
}
