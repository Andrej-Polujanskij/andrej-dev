import type { InjectionKey } from 'vue';
import type { SceneId } from '~/scenes';
import { anchorOf, introEnterAt, textEnterAt, textExitAt, timingOf } from '~/utils/timeline';

/**
 * Where a scene sits on the scroll axis and how visible its text is right now.
 * enter and exit run from 0 to 1 while the text fades in and out.
 */
export const useScene = (id: SceneId) => {
  const timing = timingOf(id);
  const { progress, seconds, reducedMotion } = useScrollProgress();

  const enter = computed(() => {
    if (timing.index > 0) return textEnterAt(timing, progress.value);
    return reducedMotion.value ? 1 : introEnterAt(seconds.value);
  });
  const exit = computed(() => textExitAt(timing, progress.value));
  const visible = computed(() => enter.value > 0 && exit.value < 1);
  const active = computed(() => enter.value > 0.5 && exit.value < 0.5);

  return { timing, progress, enter, exit, visible, active };
};

export type SceneContext = ReturnType<typeof useScene>;

const sceneKey: InjectionKey<SceneContext> = Symbol('scene');

export const provideScene = (scene: SceneContext) => provide(sceneKey, scene);

/** The scene of the nearest <SceneSection>. */
export const useSceneContext = () => {
  const scene = inject(sceneKey);
  if (!scene) throw new Error('useSceneContext() must be used inside <SceneSection>');
  return scene;
};

export const scrollToScene = (id: SceneId) => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({
    top: anchorOf(timingOf(id)) * window.innerHeight,
    behavior: reduce ? 'auto' : 'smooth',
  });
};
