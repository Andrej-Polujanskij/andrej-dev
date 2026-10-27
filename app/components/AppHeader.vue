<script setup lang="ts">
import { scenes, type SceneId } from '~/scenes';
import { activeIndexAt } from '~/utils/timeline';

const { progress } = useScrollProgress();
const activeIndex = computed(() => activeIndexAt(progress.value));

const menuOpen = ref(false);
const closeButton = useTemplateRef('closeButton');

const goTo = (id: SceneId) => {
  menuOpen.value = false;
  scrollToScene(id);
};

watch(menuOpen, async (open) => {
  if (!open) return;
  await nextTick();
  closeButton.value?.focus();
});

const roundButton =
  'grid size-11 cursor-pointer place-items-center rounded-full border border-line bg-white/4 text-ink';
</script>

<template>
  <header
    class="absolute inset-x-0 top-0 z-30 flex items-center justify-between bg-linear-to-b from-bg/60 to-transparent pt-[calc(env(safe-area-inset-top,0px)+12px)] pr-4 pb-3 pl-5 lg:px-gutter lg:pt-[calc(env(safe-area-inset-top,0px)+26px)] lg:pb-[26px]"
  >
    <button
      type="button"
      class="cursor-pointer py-1.5 text-sm font-medium tracking-[0.01em]"
      @click="goTo('intro')"
    >
      Andrej Polujanskij
    </button>
    <nav aria-label="Main" class="hidden gap-[clamp(16px,2.1vw,30px)] lg:flex">
      <a
        v-for="(scene, index) in scenes"
        :key="scene.id"
        :href="`#${scene.id}`"
        class="py-1.5 text-[13px] transition-colors duration-250 hover:text-ink motion-reduce:transition-none"
        :class="index === activeIndex ? 'text-ink' : 'text-muted'"
        @click.prevent="goTo(scene.id)"
      >
        {{ scene.label }}
      </a>
    </nav>
    <button
      type="button"
      aria-label="Open menu"
      :aria-expanded="menuOpen"
      :class="[roundButton, 'lg:hidden']"
      @click="menuOpen = true"
    >
      <Icon name="menu" class="size-4" />
    </button>
  </header>

  <nav
    v-if="menuOpen"
    aria-label="Menu"
    class="absolute inset-0 z-50 flex flex-col justify-center gap-1.5 bg-[rgb(3_3_10/0.94)] px-7 backdrop-blur-[14px]"
  >
    <button
      ref="closeButton"
      type="button"
      aria-label="Close menu"
      :class="[roundButton, 'absolute top-[calc(env(safe-area-inset-top,0px)+14px)] right-4']"
      @click="menuOpen = false"
    >
      <Icon name="close" class="size-4" />
    </button>
    <a
      v-for="scene in scenes"
      :key="scene.id"
      :href="`#${scene.id}`"
      class="py-2.5 text-[30px] font-light tracking-[-0.02em]"
      @click.prevent="goTo(scene.id)"
    >
      {{ scene.label }}
    </a>
  </nav>
</template>
