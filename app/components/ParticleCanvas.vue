<script setup lang="ts">
import { adjustForViewport, cameraAt, distanceOf, viewProjection } from '~/particles/camera';
import { createParticleData, FORMATIONS, layoutOffsets } from '~/particles/formations';
import { createParticleRenderer, type Look, type ParticleRenderer } from '~/particles/renderer';
import { lerp, smoothstep } from '~/utils/math';
import { blendAt } from '~/utils/timeline';

const canvas = useTemplateRef('canvas');
const supported = ref(true);
const { progress, seconds, pointer, reducedMotion } = useScrollProgress();
const narrow = useNarrowLayout();

let renderer: ParticleRenderer | null = null;
let compact = false;
let frameRequest = 0;

const mixLooks = (from: Look, to: Look, t: number): Look => ({
  exposure: lerp(from.exposure, to.exposure, t),
  bloom: lerp(from.bloom, to.bloom, t),
  bloomRadius: lerp(from.bloomRadius, to.bloomRadius, t),
  streak: lerp(from.streak ?? 0, to.streak ?? 0, t),
});

const resize = () => {
  if (!renderer || !canvas.value) return;
  const pixelRatio = Math.min(window.devicePixelRatio || 1, compact ? 2 : 1.5);
  renderer.resize(canvas.value.clientWidth, canvas.value.clientHeight, pixelRatio);
};

const draw = () => {
  frameRequest = requestAnimationFrame(draw);
  if (!renderer || !canvas.value) return;

  const s = progress.value;
  const aspect = canvas.value.clientWidth / canvas.value.clientHeight;
  const { from, to, t } = blendAt(s);
  const camera = adjustForViewport(cameraAt(s, narrow.value), aspect, pointer);

  renderer.render({
    viewProjection: viewProjection(camera, aspect),
    eye: camera.eye,
    weights: FORMATIONS.map(
      (formation) =>
        (from.scene.formation === formation ? 1 - t : 0) +
        (to.scene.formation === formation ? t : 0),
    ),
    look: mixLooks(from.scene.look, to.scene.look, t),
    time: reducedMotion.value ? 3 : performance.now() / 1000,
    intro: reducedMotion.value ? 1 : smoothstep(0.15, 1.8, seconds.value),
    offsets: layoutOffsets(aspect, narrow.value, distanceOf(camera)),
  });
};

onMounted(() => {
  if (!canvas.value) return;
  compact = Math.min(window.innerWidth, window.innerHeight) < 700;
  renderer = createParticleRenderer(canvas.value, createParticleData(compact));
  if (!renderer) {
    supported.value = false;
    return;
  }
  resize();
  window.addEventListener('resize', resize);
  draw();
});

onBeforeUnmount(() => {
  cancelAnimationFrame(frameRequest);
  window.removeEventListener('resize', resize);
  renderer?.dispose();
});
</script>

<template>
  <canvas ref="canvas" aria-hidden="true" class="absolute inset-0 block size-full" />
  <!-- Without WebGL2 a soft glow stands in for the particles. -->
  <div
    v-if="!supported"
    class="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgb(255_90_69/0.22),rgb(80_104_255/0.16)_38%,transparent_66%)]"
  />
</template>
