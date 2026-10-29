import { smoothstep } from '~/utils/math';
import { stopsAt } from '~/utils/timeline';

// The page moves in steps, like slides: every wheel gesture, swipe or arrow key goes to the next
// place where a scene comes to rest (stopsAt), and the morph in between plays by time instead of
// following the wheel or the finger.

/** How long one step takes. */
const STEP_MS = 1600;

/**
 * A pause in wheel events this long starts a new gesture. Trackpads keep sending events for a
 * while after a flick, and they all belong to the same step.
 */
const GESTURE_GAP_MS = 200;

/**
 * Someone can swipe again while the inertia of the last swipe is still running down, with no
 * pause in between. Once the wheel has slowed to under half its top speed, an event RESWIPE
 * times stronger than the one before it (and at least RESWIPE_MIN) starts a new gesture.
 */
const RESWIPE = 1.5;
const RESWIPE_MIN = 8;

/** How far a finger has to move before a swipe counts. */
const SWIPE_PX = 36;

const KEY_STEPS: Record<string, 1 | -1> = {
  ArrowDown: 1,
  PageDown: 1,
  ' ': 1,
  ArrowUp: -1,
  PageUp: -1,
};

export const useSceneStepper = () => {
  const narrow = useNarrowLayout();
  const { revealedAt } = usePageLoader();

  let moving: 1 | -1 | null = null;
  let queued: 1 | -1 | null = null;
  let frame = 0;

  const glide = (to: number, direction: 1 | -1) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.scrollTo(0, to);
      return;
    }
    const from = window.scrollY;
    const startedAt = performance.now();
    moving = direction;
    const tick = (now: number) => {
      const t = Math.min((now - startedAt) / STEP_MS, 1);
      window.scrollTo(0, from + (to - from) * smoothstep(0, 1, t));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
        return;
      }
      moving = null;
      const next = queued;
      queued = null;
      if (next) step(next);
    };
    frame = requestAnimationFrame(tick);
  };

  const step = (direction: 1 | -1) => {
    // Not while the intro screen is on or the phone menu is open.
    if (revealedAt.value === null || document.getElementById('phone-menu')) return;
    // A step the same way as the one playing waits for it to end. One the other way turns it
    // around, back to where it came from.
    if (moving === direction) {
      queued = direction;
      return;
    }
    if (moving) {
      cancelAnimationFrame(frame);
      moving = null;
      queued = null;
    }
    const y = window.scrollY;
    const stops = stopsAt(narrow.value).map((stop) => Math.round(stop * window.innerHeight));
    const target =
      direction > 0 ? stops.find((stop) => stop > y + 2) : stops.findLast((stop) => stop < y - 2);
    if (target !== undefined) glide(target, direction);
  };

  let lastWheelAt = 0;
  let lastDelta = 0;
  let topDelta = 0;
  let wheelStepped = false;
  const onWheel = (event: WheelEvent) => {
    // Pinch zoom (ctrlKey), sideways scrolling and the phone menu keep their own behavior.
    if (event.defaultPrevented || event.ctrlKey) return;
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    event.preventDefault();
    const delta = event.deltaY;
    if (delta === 0) return;
    // A new gesture starts after a pause, when the wheel turns the other way, or when it speeds
    // up again while the last swipe runs down.
    const now = performance.now();
    const paused = now - lastWheelAt > GESTURE_GAP_MS;
    const turned = Math.sign(delta) !== Math.sign(lastDelta);
    const swipedAgain =
      Math.abs(lastDelta) < topDelta / 2 &&
      Math.abs(delta) >= RESWIPE_MIN &&
      Math.abs(delta) > Math.abs(lastDelta) * RESWIPE;
    if (paused || turned || swipedAgain) {
      topDelta = 0;
      wheelStepped = false;
    }
    lastWheelAt = now;
    lastDelta = delta;
    topDelta = Math.max(topDelta, Math.abs(delta));
    if (wheelStepped) return;
    wheelStepped = true;
    step(delta > 0 ? 1 : -1);
  };

  let touchStart: { x: number; y: number } | null = null;
  let swiped = false;
  const onTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    touchStart =
      touch && event.touches.length === 1 ? { x: touch.clientX, y: touch.clientY } : null;
    swiped = false;
  };
  const onTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0];
    // Two fingers zoom.
    if (!touchStart || !touch || event.touches.length > 1) return;
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;
    // Sideways swipes still scroll the tab bar in Work.
    if (Math.abs(dx) > Math.abs(dy)) return;
    event.preventDefault();
    if (swiped || Math.abs(dy) < SWIPE_PX) return;
    swiped = true;
    step(dy < 0 ? 1 : -1);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const direction = event.key === ' ' && event.shiftKey ? -1 : KEY_STEPS[event.key];
    if (!direction || event.altKey || event.ctrlKey || event.metaKey) return;
    // Space still presses a focused link or button.
    if (event.key === ' ' && event.target instanceof Element && event.target.closest('a, button')) {
      return;
    }
    event.preventDefault();
    step(direction);
  };

  onMounted(() => {
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('keydown', onKeyDown);
  });

  onBeforeUnmount(() => {
    cancelAnimationFrame(frame);
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('keydown', onKeyDown);
  });
};
