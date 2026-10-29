import { clamp } from '~/utils/math';
import { totalLength } from '~/utils/timeline';

// Shared by every component. Module-level state is fine here: the site is generated as static
// HTML, so the server never renders more than one visitor.
const progress = ref(0);
const seconds = ref(0);
const pointer = reactive({ x: 0, y: 0 });
const reducedMotion = ref(false);
let started = false;

const start = () => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const pointerTarget = { x: 0, y: 0 };
  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    pointerTarget.x = event.clientX / window.innerWidth - 0.5;
    pointerTarget.y = event.clientY / window.innerHeight - 0.5;
  };
  window.addEventListener('pointermove', onPointerMove, { passive: true });

  // The page's intro starts when the intro screen opens, so it plays in front of the reader.
  const { revealedAt } = usePageLoader();
  let lastFrameAt = performance.now();
  const tick = (now: number) => {
    const elapsed = Math.min(now - lastFrameAt, 100);
    lastFrameAt = now;

    // Glide towards the real scroll position instead of jumping with the scroll wheel.
    const scrolled = clamp(window.scrollY / window.innerHeight, 0, totalLength);
    const follow = 1 - Math.pow(0.0006, elapsed / 1000);
    const next = reducedMotion.value
      ? scrolled
      : progress.value + (scrolled - progress.value) * follow;
    progress.value = Math.abs(next - scrolled) < 0.0004 ? scrolled : next;

    seconds.value = revealedAt.value === null ? 0 : Math.max(0, now - revealedAt.value) / 1000;
    pointer.x += (pointerTarget.x - pointer.x) * 0.05;
    pointer.y += (pointerTarget.y - pointer.y) * 0.05;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

/**
 * Updated every animation frame once the page is interactive:
 * - progress: scroll position in viewport heights, smoothed
 * - seconds: time since the intro screen started to open (0 until then)
 * - pointer: mouse position from -0.5 to 0.5, smoothed
 */
export const useScrollProgress = () => {
  if (import.meta.client && !started) {
    started = true;
    onNuxtReady(start);
  }
  return {
    progress: readonly(progress),
    seconds: readonly(seconds),
    pointer: readonly(pointer),
    reducedMotion: readonly(reducedMotion),
  };
};
