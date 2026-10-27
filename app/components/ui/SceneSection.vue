<script setup lang="ts">
import type { SceneId } from '~/scenes';

const { id } = defineProps<{ id: SceneId }>();

const scene = useScene(id);
provideScene(scene);
const { visible, active } = scene;
</script>

<template>
  <!-- One full-screen layer per scene; it is only visible and clickable while its scene is on. -->
  <section
    :id
    class="absolute inset-0 z-10"
    :style="{ visibility: visible ? 'visible' : 'hidden', pointerEvents: active ? 'auto' : 'none' }"
  >
    <slot />
  </section>
</template>
