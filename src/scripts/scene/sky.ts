import * as THREE from 'three';
import { additiveMaterial } from './materials';
import { random, gaussian } from '../../lib/math';
import { HEX, STAR_TEMPERATURES } from '../../lib/theme';
import { createStarCloud, STAR_TYPE } from './star-points';
import { type OrnamentKind, createHazeTexture, createStarNameTexture, createOrnamentTexture } from './textures';

const MILKY_WAY_TILT = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.55, 0, 0.4));
const ECLIPTIC_TILT = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.41, 0.3, 0));
const GRID_RADIUS = 96;
const ECLIPTIC_RADIUS = 94;

const NAMED_STARS = [
  'Vega',
  'Altair',
  'Deneb',
  'Sirius',
  'Capella',
  'Rigel',
  'Arcturus',
  'Aldebaran',
  'Spica',
  'Polaris',
  'Antares',
  'Regulus'
];

interface NamedStar {
  label: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  name: string;
}

const SKY_ORNAMENTS: readonly { kind: OrnamentKind; azimuth: number; elevation: number; size: number }[] = [
  { kind: 'moon', azimuth: 0.05, elevation: 0.62, size: 13 },
  { kind: 'saturn', azimuth: -1.25, elevation: 0.55, size: 12 },
  { kind: 'comet', azimuth: -2.6, elevation: 0.62, size: 12 },
  { kind: 'sun', azimuth: -3.7, elevation: 0.55, size: 12 },
  { kind: 'saturn', azimuth: -4.9, elevation: -0.3, size: 9 }
];

export const directionFromAngles = (azimuth: number, elevation: number): THREE.Vector3 =>
  new THREE.Vector3(
    Math.sin(azimuth) * Math.cos(elevation),
    Math.sin(elevation),
    -Math.cos(azimuth) * Math.cos(elevation)
  );

const randomTemperature = (): number => STAR_TEMPERATURES[Math.floor(random() * STAR_TEMPERATURES.length)];

const addStarFields = (sky: THREE.Group): void => {
  sky.add(
    createStarCloud(
      5000,
      (_i, position, color) => {
        position.set(gaussian(), gaussian(), gaussian()).normalize().multiplyScalar(110);
        color.setHSL(0.6 + random() * 0.08, 0.3, 0.75).multiplyScalar(0.35 + random() * 0.35);
        return 1.2 + random() * 1.3;
      },
      { twinkle: 0.55, maxSize: 4 }
    )
  );

  sky.add(
    createStarCloud(
      9000,
      (_i, position, color) => {
        const a = random() * Math.PI * 2;
        const spread = gaussian() * (0.1 + 0.06 * Math.sin(a * 3));
        position.set(Math.cos(a), spread, Math.sin(a)).normalize().multiplyScalar(105).applyQuaternion(MILKY_WAY_TILT);
        color.setHSL(random() < 0.25 ? 0.1 : 0.62, 0.4, 0.7).multiplyScalar(0.18 + random() * 0.3);
        return 1.3 + random() * 1.8;
      },
      { twinkle: 0.5, maxSize: 4 }
    )
  );

  sky.add(
    createStarCloud(
      1400,
      (_i, position, color, star) => {
        position.set(gaussian(), gaussian(), gaussian()).normalize().multiplyScalar(104);
        color.set(randomTemperature()).multiplyScalar(0.55 + random() * 0.3);
        star.type = STAR_TYPE.dot;
        return 2.2 + random() * 1.8;
      },
      { twinkle: 0.7, maxSize: 6 }
    )
  );

  sky.add(
    createStarCloud(
      320,
      (_i, position, color, star) => {
        position.set(gaussian(), gaussian(), gaussian()).normalize().multiplyScalar(100);
        color.set(randomTemperature());
        star.type = random() < 0.55 ? STAR_TYPE.glint : random() < 0.7 ? STAR_TYPE.cross : STAR_TYPE.flare;
        return (star.type === STAR_TYPE.flare ? 9 : 5) + random() * 6;
      },
      { twinkle: 0.5, maxSize: 18, flare: 0.9 }
    )
  );
};

const addMilkyWayHaze = (sky: THREE.Group): void => {
  const texture = createHazeTexture();
  for (let k = 0; k < 22; k++) {
    const a = (k / 22) * Math.PI * 2 + random() * 0.1;
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.07 + random() * 0.07,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        color: random() < 0.3 ? HEX.hazeBlue : HEX.hazeGold
      })
    );
    sprite.position
      .set(Math.cos(a), gaussian() * 0.06, Math.sin(a))
      .normalize()
      .multiplyScalar(100)
      .applyQuaternion(MILKY_WAY_TILT);
    sprite.scale.setScalar(22 + random() * 26);
    sky.add(sprite);
  }
};

const addOpenCluster = (sky: THREE.Group): void => {
  const center = new THREE.Vector3(0.75, 0.42, 0.5).normalize();
  sky.add(
    createStarCloud(
      11,
      (i, position, color, star) => {
        position
          .copy(center)
          .multiplyScalar(98)
          .add(new THREE.Vector3(gaussian() * 3, gaussian() * 2.2, gaussian() * 3));
        color.set(HEX.clusterBlue);
        star.type = i < 4 ? STAR_TYPE.flare : STAR_TYPE.cross;
        return i < 4 ? 12 : 6 + random() * 3;
      },
      { twinkle: 0.35, maxSize: 22, flare: 1 }
    )
  );
};

const addNamedStars = (sky: THREE.Group): NamedStar[] =>
  NAMED_STARS.map((name, k) => {
    const azimuth = (k / 12) * Math.PI * 2 + 0.37;
    const elevation = (k % 2 ? 1 : -1) * (0.38 + (k % 3) * 0.16) + (name === 'Polaris' ? 0.9 : 0);
    const direction = directionFromAngles(azimuth, elevation).normalize();
    sky.add(
      createStarCloud(
        1,
        (_i, position, color, star) => {
          position.copy(direction).multiplyScalar(96);
          color.set(STAR_TEMPERATURES[k % STAR_TEMPERATURES.length]);
          star.type = STAR_TYPE.flare;
          return 15;
        },
        { twinkle: 0.3, maxSize: 30, flare: 1 }
      )
    );
    const label = new THREE.Mesh(new THREE.PlaneGeometry(10, 1.9), additiveMaterial({ opacity: 0 }));
    label.position.copy(direction).multiplyScalar(96);
    label.lookAt(0, 0, 0);
    label.translateX(-5.9);
    label.translateY(-1.1);
    sky.add(label);
    return { label, name };
  });

const ringPoints = (radius: number, rotation: THREE.Quaternion, segments = 180): THREE.BufferGeometry => {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius).applyQuaternion(rotation));
  }
  return new THREE.BufferGeometry().setFromPoints(points);
};

const addCelestialGrid = (sky: THREE.Group): void => {
  const gridMaterial = new THREE.LineDashedMaterial({
    color: HEX.gold,
    dashSize: 0.9,
    gapSize: 0.9,
    transparent: true,
    opacity: 0.09
  });
  for (let k = 0; k < 6; k++) {
    const meridian = new THREE.Line(
      ringPoints(
        GRID_RADIUS,
        new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, (k * Math.PI) / 6, 0, 'YXZ'))
      ),
      gridMaterial
    );
    meridian.computeLineDistances();
    sky.add(meridian);
  }
  [-60, -30, 0, 30, 60].forEach((degrees) => {
    const latitude = (degrees * Math.PI) / 180;
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 180; i++) {
      const a = (i / 180) * Math.PI * 2;
      points.push(
        new THREE.Vector3(
          Math.cos(a) * Math.cos(latitude) * GRID_RADIUS,
          Math.sin(latitude) * GRID_RADIUS,
          Math.sin(a) * Math.cos(latitude) * GRID_RADIUS
        )
      );
    }
    const parallel = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), gridMaterial);
    parallel.computeLineDistances();
    sky.add(parallel);
  });
};

const addEcliptic = (sky: THREE.Group): void => {
  sky.add(
    new THREE.Line(
      ringPoints(ECLIPTIC_RADIUS, ECLIPTIC_TILT, 360),
      new THREE.LineBasicMaterial({ color: HEX.gold, transparent: true, opacity: 0.22 })
    )
  );
  const ticks: THREE.Vector3[] = [];
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    const length = i % 6 ? 0.9 : 2.2;
    const p = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
    ticks.push(
      p
        .clone()
        .multiplyScalar(ECLIPTIC_RADIUS)
        .add(new THREE.Vector3(0, -length / 2, 0))
        .applyQuaternion(ECLIPTIC_TILT),
      p
        .clone()
        .multiplyScalar(ECLIPTIC_RADIUS)
        .add(new THREE.Vector3(0, length / 2, 0))
        .applyQuaternion(ECLIPTIC_TILT)
    );
  }
  sky.add(
    new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(ticks),
      new THREE.LineBasicMaterial({ color: HEX.gold, transparent: true, opacity: 0.22 })
    )
  );
};

export const createSky = (scene: THREE.Scene) => {
  const sky = new THREE.Group();
  scene.add(sky);
  addStarFields(sky);
  addMilkyWayHaze(sky);
  addOpenCluster(sky);
  const namedStars = addNamedStars(sky);
  addCelestialGrid(sky);
  addEcliptic(sky);

  const paintStarNames = () => {
    namedStars.forEach(({ label, name }) => {
      label.material.map = createStarNameTexture(name);
      label.material.opacity = 0.7;
      label.material.needsUpdate = true;
    });
  };

  const addOrnaments = () => {
    SKY_ORNAMENTS.forEach(({ kind, azimuth, elevation, size }) => {
      const ornament = new THREE.Mesh(
        new THREE.PlaneGeometry(size, size),
        additiveMaterial({ map: createOrnamentTexture(kind), opacity: 0.55 })
      );
      ornament.position.copy(directionFromAngles(azimuth, elevation)).multiplyScalar(60);
      ornament.lookAt(0, 0, 0);
      sky.add(ornament);
    });
  };

  return { sky, paintStarNames, addOrnaments };
};
