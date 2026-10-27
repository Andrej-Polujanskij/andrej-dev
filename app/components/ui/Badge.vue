<script setup lang="ts">
const { size = 'sm' } = defineProps<{ size?: 'sm' | 'lg' }>();
</script>

<template>
  <span
    class="inline-flex items-center rounded-full border border-line bg-white/4 font-medium tracking-[0.01em] whitespace-nowrap"
    :class="
      size === 'lg'
        ? 'gap-2.5 py-2 pr-4 pl-3.5 text-sm [&_svg]:size-[15px]'
        : 'gap-2 py-[7px] pr-3.5 pl-3 text-xs [&_svg]:size-[13px]'
    "
  >
    <slot />
  </span>
</template>
