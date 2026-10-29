import { scenes, TRANSITION, type Scene, type SceneId } from '~/scenes';
import { clamp, smoothstep } from '~/utils/math';

/** A scene placed on the scroll axis. All positions are in viewport heights. */
export interface SceneTiming {
  scene: Scene;
  index: number;
  start: number;
  end: number;
  /** Length of the morph into the next scene, 0 for the last one. */
  transition: number;
}

const isLast = (index: number) => index === scenes.length - 1;

const placeScenes = () => {
  let cursor = 0;
  return scenes.map((scene, index): SceneTiming => {
    const start = cursor;
    const end = start + scene.duration;
    const transition = isLast(index) ? 0 : (scene.transition ?? TRANSITION);
    cursor = end + transition;
    return { scene, index, start, end, transition };
  });
};

export const timings = placeScenes();

export const lastTiming = timings.reduce((_, timing) => timing);

/** Total scroll length of the story. */
export const totalLength = lastTiming.end;

export const timingOf = (id: SceneId) => {
  const timing = timings.find((item) => item.scene.id === id);
  if (!timing) throw new Error(`Unknown scene "${id}"`);
  return timing;
};

/** The scene at scroll position s (or the one morphing away), plus the scene after it. */
export const timingAt = (s: number) => {
  const current = timings.find((timing) => s < timing.end + timing.transition) ?? lastTiming;
  return { current, next: timings[current.index + 1] };
};

/**
 * The two scenes blended at scroll position s and how far the morph between them has gone:
 * t = 0 shows only `from`, t = 1 only `to`.
 */
export const blendAt = (s: number) => {
  const { current, next } = timingAt(s);
  if (!next || s <= current.end) return { from: current, to: current, t: 0 };
  return {
    from: current,
    to: next,
    t: smoothstep(current.end, current.end + current.transition, s),
  };
};

// Scene text fades in from 0.1 before the scene starts until 0.4 after it,
// and fades out from 0.35 before the scene ends until 0.05 after it.
const TEXT_IN = { before: 0.1, after: 0.4 };
const TEXT_OUT = { before: 0.35, after: 0.05 };

/** Linear 0..1: how far the text of a scene has faded in. */
export const textEnterAt = ({ start }: SceneTiming, s: number) =>
  clamp((s - start + TEXT_IN.before) / (TEXT_IN.before + TEXT_IN.after));

/** Linear 0..1: how far the text of a scene has faded out. The last scene stays. */
export const textExitAt = ({ index, end }: SceneTiming, s: number) =>
  isLast(index) ? 0 : clamp((s - end + TEXT_OUT.before) / (TEXT_OUT.before + TEXT_OUT.after));

/** The first scene fades in by time after the page opens, not by scrolling. */
export const introEnterAt = (seconds: number) => clamp((seconds - 0.35) / 1.75);

/**
 * Where the scroll comes to rest in a scene: the middle of the stretch where its text is fully
 * in. A scene with narrowHalves rests on each half on narrow screens. The first scene rests at
 * the top and the last one at the bottom.
 */
export const stopsOf = ({ index, start, end, scene }: SceneTiming, narrow: boolean) => {
  if (index === 0) return [0];
  if (isLast(index)) return [totalLength];
  const from = start + TEXT_IN.after;
  const to = end - TEXT_OUT.before;
  if (!narrow || !scene.narrowHalves) return [(from + to) / 2];
  const middle = start + scene.duration / 2;
  return [(from + middle) / 2, (middle + to) / 2];
};

/** Every place the scroll comes to rest, top to bottom. */
export const stopsAt = (narrow: boolean) => timings.flatMap((timing) => stopsOf(timing, narrow));

/** Where a menu link scrolls to: the first place its scene comes to rest. */
export const anchorOf = (timing: SceneTiming, narrow: boolean) => stopsOf(timing, narrow)[0] ?? 0;

/** Index of the scene the reader is on. It switches halfway through a transition. */
export const activeIndexAt = (s: number) =>
  timings.reduce((active, timing) => {
    const previous = timings[timing.index - 1];
    const switchAt = timing.start - (previous ? previous.transition / 2 : 0);
    return s >= switchAt ? timing.index : active;
  }, 0);

/** Opacity of the white flash, peaking halfway through the exit of a 'flash' scene. */
export const flashAt = (s: number) => {
  const timing = timings.find(
    (item) => item.scene.exit === 'flash' && s > item.end && s < item.end + item.transition,
  );
  if (!timing) return 0;
  const middle = timing.end + timing.transition / 2;
  return clamp(1 - Math.abs(s - middle) / (timing.transition * 0.46));
};
