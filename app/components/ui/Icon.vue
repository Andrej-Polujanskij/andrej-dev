<script setup lang="ts">
type IconName = 'layers' | 'window' | 'code' | 'arrowUpRight' | 'mail' | 'menu' | 'close';

// Stroke icons on a 16 x 16 grid.
const paths: Record<IconName, string[]> = {
  layers: ['M8 1.8 14.2 5 8 8.2 1.8 5 8 1.8Z', 'm1.8 8 6.2 3.2L14.2 8', 'm1.8 11 6.2 3.2 6.2-3.2'],
  window: [
    'M3.4 2.5h9.2a1.6 1.6 0 0 1 1.6 1.6v7.8a1.6 1.6 0 0 1-1.6 1.6H3.4a1.6 1.6 0 0 1-1.6-1.6V4.1a1.6 1.6 0 0 1 1.6-1.6Z',
    'M1.8 5.6h12.4M5.4 5.6v7.9',
  ],
  code: ['M5.5 4 1.8 8l3.7 4M10.5 4l3.7 4-3.7 4'],
  arrowUpRight: ['M3.3 12.7 12.7 3.3M5.3 3.3h7.4v7.4'],
  mail: [
    'M2.6 3.7h10.8a.9.9 0 0 1 .9.9v6.8a.9.9 0 0 1-.9.9H2.6a.9.9 0 0 1-.9-.9V4.6a.9.9 0 0 1 .9-.9Z',
    'm2 4.4 6 4.4 6-4.4',
  ],
  menu: ['M2.5 5.5h11M2.5 10.5h11'],
  close: ['m3.5 3.5 9 9M12.5 3.5l-9 9'],
};

const { name } = defineProps<{ name: IconName }>();
</script>

<template>
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    stroke-width="1.3"
    stroke-linejoin="round"
    aria-hidden="true"
    class="shrink-0"
  >
    <path v-for="d in paths[name]" :key="d" :d="d" />
  </svg>
</template>
