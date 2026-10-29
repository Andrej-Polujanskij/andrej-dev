import type { CameraPose } from '~/particles/camera';
import type { Formation } from '~/particles/formations';
import type { Look } from '~/particles/renderer';

export type SceneId = 'intro' | 'work' | 'skills' | 'contact';

export interface Scene {
  id: SceneId;
  /** Link text in the header menu. */
  label: string;
  /** The shape the particle cloud takes while this scene is on screen. */
  formation: Formation;
  /** How long the scene stays on screen, in viewport heights of scrolling. */
  duration: number;
  /** How long the morph into the next scene takes. Defaults to TRANSITION. */
  transition?: number;
  /** 'flash': the camera dives in and a white flash hides the cut to the next scene. */
  exit?: 'flash';
  /** The camera moves from start to end while the scene is on screen. */
  camera: { start: CameraPose; end: CameraPose };
  /** Used instead of camera on narrow screens, where the text takes more of the screen. */
  narrowCamera?: { start: CameraPose; end: CameraPose };
  /** On narrow screens the scene shows its content in two halves, one after the other. */
  narrowHalves?: boolean;
  look: Look;
}

/** Default length of the morph between two scenes, in viewport heights. */
export const TRANSITION = 0.8;

/**
 * The whole scroll story, top to bottom. Scroll positions, text timing, menu links and the
 * particle morphs are all derived from this list (see utils/timeline.ts).
 */
export const scenes: Scene[] = [
  {
    id: 'intro',
    label: 'Home',
    formation: 'sphere',
    duration: 1.4,
    camera: {
      start: { eye: [0, 0, 10.2], target: [0, 0, 0] },
      end: { eye: [0, 0.25, 10.8], target: [0, 0, 0] },
    },
    look: { exposure: 2.3, bloom: 0.8, bloomRadius: 14 },
  },
  {
    id: 'work',
    label: 'Work',
    formation: 'helix',
    duration: 1.6,
    narrowHalves: true,
    camera: {
      start: { eye: [0.2, 0.6, 8.4], target: [0.8, 0, 0] },
      end: { eye: [0.2, 1.2, 8], target: [0.8, 0.3, 0] },
    },
    look: { exposure: 0.55, bloom: 0.85, bloomRadius: 28 },
  },
  {
    id: 'skills',
    label: 'Skills',
    formation: 'horizon',
    duration: 1.6,
    transition: 0.35,
    exit: 'flash',
    camera: {
      start: { eye: [0, 3.6, 12], target: [0, 9, -40] },
      end: { eye: [0, 3.3, 10.6], target: [0, 8.4, -40] },
    },
    // Tilted further up, so the horizon sinks below the code on phones.
    narrowCamera: {
      start: { eye: [0, 3.6, 12], target: [0, 18, -40] },
      end: { eye: [0, 3.3, 10.6], target: [0, 17.4, -40] },
    },
    look: { exposure: 1.1, bloom: 0.55, bloomRadius: 16 },
  },
  {
    id: 'contact',
    label: 'Contact',
    formation: 'galaxy',
    duration: 1.2,
    camera: {
      start: { eye: [0, 1.1, 4.6], target: [0, 0.35, 0] },
      end: { eye: [0, 2.7, 10.8], target: [0, 0.3, 0] },
    },
    look: { exposure: 0.95, bloom: 0.6, bloomRadius: 26, streak: 0.1 },
  },
];
