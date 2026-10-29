import type { Vec3 } from '~/utils/math';

/** The shapes the particle cloud can take. The order matches uWeights in particles.vert.glsl. */
export const FORMATIONS = ['sphere', 'helix', 'horizon', 'galaxy'] as const;

export type Formation = (typeof FORMATIONS)[number];

export interface ParticleAttribute {
  name: string;
  size: 2 | 3 | 4;
  data: Float32Array;
}

export interface ParticleData {
  count: number;
  attributes: ParticleAttribute[];
}

const TAU = Math.PI * 2;

/** Seeded random numbers, so the cloud looks the same on every visit. */
const createRandom = (seed: number) => {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const gaussian = () => {
    let u = 0;
    while (!u) u = next();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * next());
  };
  return { next, gaussian };
};

type Random = ReturnType<typeof createRandom>;

/** A buffer with `size` numbers for every particle. */
const fill = (count: number, size: number, point: (index: number) => number[]) => {
  const data = new Float32Array(count * size);
  for (let i = 0; i < count; i++) data.set(point(i), i * size);
  return data;
};

/**
 * Visits grid points in a scattered order, so any first part of the buffer still covers the
 * whole shape. Slow devices draw only the first part.
 */
const scatter = (count: number) => {
  let stride = 7919;
  while (count % stride === 0 || stride % 2 === 0) stride += 2;
  return (index: number) => (index * stride) % count;
};

/** Points along meridian lines of a unit sphere. */
const sphere = (count: number, meridians: number, pointsPerMeridian: number) => {
  const order = scatter(count);
  return fill(count, 3, (index) => {
    const j = order(index);
    const theta = ((j % meridians) / meridians) * TAU;
    const phi = ((Math.floor(j / meridians) + 0.5) / pointsPerMeridian) * Math.PI;
    return [Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta)];
  });
};

/** Two strands, the rungs between them and a haze of dust. */
const helix = (count: number, { next, gaussian }: Random) =>
  fill(count, 4, () => {
    const height = (next() - 0.5) * 12;
    const kind = next();
    if (kind < 0.62) {
      const angle = height * 1.15 + (next() < 0.5 ? 0 : Math.PI);
      const radius = 0.95 + gaussian() * 0.13;
      return [
        Math.cos(angle) * radius + gaussian() * 0.11,
        height + gaussian() * 0.09,
        Math.sin(angle) * radius + gaussian() * 0.11,
        0.55,
      ];
    }
    if (kind < 0.84) {
      const rungHeight = Math.round(height / 0.36) * 0.36;
      const angle = rungHeight * 1.15;
      const across = 0.95 * (1 - 2 * next());
      return [
        Math.cos(angle) * across + gaussian() * 0.035,
        rungHeight + gaussian() * 0.035,
        Math.sin(angle) * across + gaussian() * 0.035,
        0.5,
      ];
    }
    const radius = Math.abs(gaussian()) * 0.75 + 0.3;
    const angle = next() * TAU;
    return [Math.cos(angle) * radius, height, Math.sin(angle) * radius, 0.18];
  });

/** A wide grid, denser towards the horizon. The waves are animated in the shader. */
const horizon = (count: number, compact: boolean, { gaussian }: Random) => {
  const order = scatter(count);
  const columns = compact ? 380 : 620;
  const rows = Math.ceil(count / columns);
  return fill(count, 3, (index) => {
    const j = order(index);
    const x = ((j % columns) / columns - 0.5) * 80 + gaussian() * 0.02;
    const z = Math.pow(Math.floor(j / columns) / rows, 1.15) * 80 - 72;
    return [x, 0, z];
  });
};

const GALAXY_RINGS = [0.95, 1.75, 3, 4.6];

/** Rings, haze around them, dust and a core, as (radius, angle, height, kind). */
const galaxy = (count: number, { next, gaussian }: Random) =>
  fill(count, 4, () => {
    const ring = GALAXY_RINGS[Math.floor(next() * GALAXY_RINGS.length)] ?? 1;
    const kind = next();
    if (kind >= 0.82)
      return [Math.abs(gaussian() * 0.22) + 0.05, next() * TAU, gaussian() * 0.06, 3];

    const type = kind < 0.36 ? 0 : kind < 0.64 ? 1 : 2;
    const spread =
      type === 0
        ? ring + gaussian() * 0.025
        : type === 1
          ? ring + gaussian() * 0.14
          : Math.pow(next(), 0.7) * 6.5;
    const radius = Math.abs(spread) + 0.05;
    return [radius, next() * TAU, gaussian() * 0.02 * (1 + radius * 0.3), type];
  });

/** A random number per particle and a flag for the 3% that sparkle brighter. */
const seeds = (count: number, { next }: Random) =>
  fill(count, 2, () => [next(), next() < 0.03 ? 1 : 0]);

/** All formations for every particle. Compact means fewer particles, for phones. */
export const createParticleData = (compact: boolean): ParticleData => {
  const meridians = compact ? 200 : 260;
  const pointsPerMeridian = compact ? 420 : 642;
  const count = meridians * pointsPerMeridian;
  return {
    count,
    attributes: [
      { name: 'aSphere', size: 3, data: sphere(count, meridians, pointsPerMeridian) },
      { name: 'aHelix', size: 4, data: helix(count, createRandom(2)) },
      { name: 'aHorizon', size: 3, data: horizon(count, compact, createRandom(3)) },
      { name: 'aGalaxy', size: 4, data: galaxy(count, createRandom(5)) },
      { name: 'aSeed', size: 2, data: seeds(count, createRandom(6)) },
    ],
  };
};

export interface LayoutOffsets {
  sphere: Vec3;
}

/** How much bigger the sphere looks on narrow screens, so the text fits in its dark middle. */
const NARROW_ZOOM = 1.35;

/**
 * Moves the sphere out of the way of the text on wide screens, to the right. On narrow ones it
 * stays in the middle and comes closer to the camera, framing the centered text.
 * distance is how far the camera is from the shape.
 */
export const layoutOffsets = (aspect: number, narrow: boolean, distance: number): LayoutOffsets => {
  if (narrow) return { sphere: [0, 0, distance * (1 - 1 / NARROW_ZOOM)] };
  const right = aspect > 1.45 ? 1 : 0.8;
  return { sphere: [3.5 * right, 0, 0] };
};
