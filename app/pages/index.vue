<script setup lang="ts">
import { flashAt, totalLength } from '~/utils/timeline';

const { progress, reducedMotion } = useScrollProgress();
const flashOpacity = computed(() => flashAt(progress.value) * (reducedMotion.value ? 0.5 : 0.95));
</script>

<template>
  <main class="relative" :style="{ height: `calc(${totalLength + 1} * 100svh)` }">
    <!-- The page is as tall as the whole scroll story; the stage stays pinned while it scrolls. -->
    <div class="sticky top-0 h-svh overflow-hidden">
      <ParticleCanvas />
      <div
        class="pointer-events-none absolute inset-0 z-40 bg-white"
        :style="{ opacity: flashOpacity }"
      />
      <AppHeader />
      <ScrollRail />

      <!-- Same order as the scene list in scenes.ts -->
      <IntroSection />
      <WorkSection />
      <SkillsSection />
      <ContactSection />
    </div>
  </main>
</template>
