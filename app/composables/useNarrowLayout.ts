// Same width as the lg breakpoint in main.css.
const NARROW_QUERY = '(max-width: 899.98px)';

const narrow = ref(false);
let watching = false;

/** True on phones and narrow windows, where the layout stacks into one column. */
export const useNarrowLayout = () => {
  if (import.meta.client && !watching) {
    watching = true;
    onNuxtReady(() => {
      const query = window.matchMedia(NARROW_QUERY);
      narrow.value = query.matches;
      query.addEventListener('change', (event) => {
        narrow.value = event.matches;
      });
    });
  }
  return readonly(narrow);
};
