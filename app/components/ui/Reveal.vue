<script setup lang="ts">
import { smoothstep } from '~/utils/math';
import { blurUntilVisible } from '~/utils/style';

// Fades, unblurs and lifts its content in when the scene enters, and out when it leaves.
// A higher delay starts later but finishes together with the rest.
const { delay = 0, tag = 'div' } = defineProps<{ delay?: number; tag?: string }>();

const { enter, exit } = useSceneContext();

const style = computed(() => {
  const shown = smoothstep(delay * 0.55, 1, enter.value);
  const hidden = smoothstep(0, 1, exit.value);
  const opacity = shown * (1 - hidden);
  return {
    opacity,
    filter: blurUntilVisible(opacity, 10),
    transform: `translate3d(0, ${((1 - shown) * 14 - hidden * 10).toFixed(1)}px, 0)`,
  };
});
</script>

<template>
  <component :is="tag" :style="style" class="will-change-[opacity,filter,transform]">
    <slot />
  </component>
</template>
