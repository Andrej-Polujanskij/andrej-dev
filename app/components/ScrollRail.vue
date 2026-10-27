<script setup lang="ts">
import { scenes } from '~/scenes';
import { clamp, smoothstep } from '~/utils/math';
import { activeIndexAt, totalLength } from '~/utils/timeline';

const RAIL_HEIGHT = 92;
const THUMB_HEIGHT = 22;

const { progress } = useScrollProgress();

const pad = (value: number) => String(value).padStart(2, '0');
const thumbTop = computed(() => clamp(progress.value / totalLength) * (RAIL_HEIGHT - THUMB_HEIGHT));
const counter = computed(() => `${pad(activeIndexAt(progress.value) + 1)} / ${pad(scenes.length)}`);
const hintOpacity = computed(() => 1 - smoothstep(0.2, 0.8, progress.value));
</script>

<template>
  <div aria-hidden="true">
    <div
      class="absolute top-1/2 right-2 z-30 hidden w-[3px] -translate-y-1/2 rounded-[3px] bg-white/10 lg:block"
      :style="{ height: `${RAIL_HEIGHT}px` }"
    >
      <i
        class="absolute left-0 w-full rounded-[3px] bg-white/60"
        :style="{ top: `${thumbTop}px`, height: `${THUMB_HEIGHT}px` }"
      />
    </div>
    <div
      class="absolute bottom-[calc(env(safe-area-inset-bottom,0px)+30px)] left-gutter z-30 font-mono text-xs text-dim tabular-nums"
    >
      {{ counter }}
    </div>
    <!-- Mouse outline with a wheel dot that keeps rolling down. -->
    <div
      class="absolute bottom-[calc(env(safe-area-inset-bottom,0px)+26px)] left-1/2 z-30 hidden h-[34px] w-[22px] -translate-x-1/2 justify-center rounded-full border border-white/40 pt-1.5 lg:flex"
      :style="{ opacity: hintOpacity }"
    >
      <i
        class="h-1.5 w-[3px] animate-scroll-wheel rounded-full bg-white/70 motion-reduce:animate-none"
      />
    </div>
  </div>
</template>
