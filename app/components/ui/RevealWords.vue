<script setup lang="ts">
import { clamp, smoothstep } from '~/utils/math';
import { blurUntilVisible } from '~/utils/style';

// Like <Reveal>, but the words appear one after another.
const {
  text,
  delay = 0,
  tag = 'h2',
} = defineProps<{ text: string; delay?: number; tag?: string }>();

const { enter, exit } = useSceneContext();

const words = computed(() => text.split(' '));

const wordStyles = computed(() => {
  const shown = smoothstep(delay * 0.55, 1, enter.value);
  const hidden = smoothstep(0, 1, exit.value);
  const count = words.value.length;
  return words.value.map((_, index) => {
    const opacity = clamp(shown * (count * 0.6 + 1) - index * 0.6) * (1 - hidden);
    return { opacity, filter: blurUntilVisible(opacity, 12) };
  });
});
</script>

<template>
  <component :is="tag" :aria-label="text">
    <span
      v-for="(word, index) in words"
      :key="index"
      aria-hidden="true"
      class="inline-block whitespace-pre will-change-[opacity,filter]"
      :style="wordStyles[index]"
      >{{ index < words.length - 1 ? `${word} ` : word }}</span
    >
  </component>
</template>
