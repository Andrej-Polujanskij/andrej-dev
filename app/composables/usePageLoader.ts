// The intro screen that covers the page while it loads (PageLoader.vue). The page's own intro
// animation waits for it: revealedAt is the moment the screen starts to open, in
// performance.now() time. Module-level state, like useScrollProgress.
const leaving = ref(false);
const gone = ref(false);
const revealedAt = ref<number | null>(null);

/** How long the screen takes to open before it is removed. */
const EXIT_MS = 1000;

const reveal = () => {
  if (leaving.value) return;
  leaving.value = true;
  revealedAt.value = performance.now();
  setTimeout(() => (gone.value = true), EXIT_MS);
};

export const usePageLoader = () => ({
  leaving: readonly(leaving),
  gone: readonly(gone),
  revealedAt: readonly(revealedAt),
  reveal,
});
