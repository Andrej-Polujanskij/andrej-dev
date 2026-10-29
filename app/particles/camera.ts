import { clamp, lerpVec3, smoothstep, type Vec3 } from '~/utils/math';
import type { Scene } from '~/scenes';
import { timingAt } from '~/utils/timeline';

export interface CameraPose {
  eye: Vec3;
  target: Vec3;
}

const FIELD_OF_VIEW = (46 * Math.PI) / 180;

// Mostly eased, with a little linear motion so the camera never fully stops mid-scroll.
const ease = (u: number) => {
  const t = clamp(u);
  return t * 0.3 + smoothstep(0, 1, t) * 0.7;
};

const between = (from: CameraPose, to: CameraPose, u: number): CameraPose => ({
  eye: lerpVec3(from.eye, to.eye, ease(u)),
  target: lerpVec3(from.target, to.target, ease(u)),
});

/** Where a 'flash' exit dives to: almost at the target, looking further along the same line. */
const diveInto = ({ eye, target }: CameraPose): CameraPose => ({
  eye: lerpVec3(eye, target, 0.9),
  target: lerpVec3(eye, target, 1.5),
});

const cameraOf = (scene: Scene, narrow: boolean) => (narrow && scene.narrowCamera) || scene.camera;

/** Camera pose at scroll position s, following the cameras in the scene list. */
export const cameraAt = (s: number, narrow: boolean): CameraPose => {
  const { current, next } = timingAt(s);
  const { start, end, transition } = current;
  const camera = cameraOf(current.scene, narrow);
  if (!next || s <= end) return between(camera.start, camera.end, (s - start) / (end - start));

  const u = (s - end) / transition;
  const nextStart = cameraOf(next.scene, narrow).start;
  if (current.scene.exit !== 'flash') return between(camera.end, nextStart, u);
  // Dive in during the first half; the second half is hidden by the flash.
  return u < 0.5 ? between(camera.end, diveInto(camera.end), u * 2) : nextStart;
};

// The furthest the camera moves back on narrow screens. A camera that looks far into the
// distance, like the one over the horizon, would otherwise end up so far back that the
// shape in front of it fades out.
const MAX_PULL_BACK = 12;

/** Pulls the camera back on narrow screens and lets the mouse orbit it a little. */
export const adjustForViewport = (
  { eye, target }: CameraPose,
  aspect: number,
  pointer: { x: number; y: number },
): CameraPose => {
  const fit = aspect < 1 ? clamp(0.9 / aspect, 1, 2) : aspect < 1.3 ? 1.15 : 1;
  const pullBack = Math.min(fit, 1 + MAX_PULL_BACK / distanceOf({ eye, target }));
  const [x, y, z] = lerpVec3(target, eye, pullBack);
  const yaw = pointer.x * 0.2;
  const dx = x - target[0];
  const dz = z - target[2];
  return {
    eye: [
      target[0] + dx * Math.cos(yaw) + dz * Math.sin(yaw),
      y - pointer.y * 0.21,
      target[2] - dx * Math.sin(yaw) + dz * Math.cos(yaw),
    ],
    target,
  };
};

const subtract = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const normalize = (v: Vec3): Vec3 => {
  const length = Math.hypot(...v) || 1;
  return [v[0] / length, v[1] / length, v[2] / length];
};

// 4x4 matrices are column-major arrays, as WebGL expects.
const perspective = (fov: number, aspect: number, near: number, far: number) => {
  const f = 1 / Math.tan(fov / 2);
  const range = 1 / (near - far);
  // prettier-ignore
  return [
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * range, -1,
    0, 0, 2 * far * near * range, 0,
  ];
};

const lookAt = (eye: Vec3, target: Vec3) => {
  const z = normalize(subtract(eye, target));
  const x = normalize(cross([0, 1, 0], z));
  const y = cross(z, x);
  // prettier-ignore
  return [
    x[0], y[0], z[0], 0,
    x[1], y[1], z[1], 0,
    x[2], y[2], z[2], 0,
    -dot(x, eye), -dot(y, eye), -dot(z, eye), 1,
  ];
};

const multiply = (a: number[], b: number[]) => {
  const out = new Float32Array(16);
  for (let column = 0; column < 4; column++) {
    for (let row = 0; row < 4; row++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) sum += (a[k * 4 + row] ?? 0) * (b[column * 4 + k] ?? 0);
      out[column * 4 + row] = sum;
    }
  }
  return out;
};

/** How far the camera is from what it looks at. */
export const distanceOf = ({ eye, target }: CameraPose) => Math.hypot(...subtract(eye, target));

export const viewProjection = ({ eye, target }: CameraPose, aspect: number) =>
  multiply(perspective(FIELD_OF_VIEW, aspect, 0.05, 120), lookAt(eye, target));
