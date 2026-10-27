<script setup lang="ts">
const { href, variant = 'primary' } = defineProps<{
  href: string;
  variant?: 'primary' | 'ghost';
}>();

const external = computed(() => href.startsWith('http'));
</script>

<template>
  <a
    :href
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener' : undefined"
    :class="
      variant === 'primary'
        ? 'inline-flex items-center gap-3.5 rounded-full py-2.5 pr-2.5 pl-6 text-sm leading-none text-ink transition-[filter] duration-250 gradient-border hover:brightness-130 motion-reduce:transition-none'
        : 'inline-flex items-center rounded-full bg-white/6 px-6 py-[15px] text-sm text-ink/82 transition-colors duration-250 hover:bg-white/10 hover:text-ink motion-reduce:transition-none'
    "
  >
    <slot />
    <span
      v-if="variant === 'primary'"
      class="grid size-[30px] place-items-center rounded-full border border-white/28"
    >
      <Icon name="arrowUpRight" class="size-[11px]" />
    </span>
  </a>
</template>
