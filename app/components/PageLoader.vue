<script setup lang="ts">
// The intro screen: </> draws itself, opens up into <andrej-dev/>, then the screen opens like an
// iris onto the page. The animation is plain CSS, so it plays from the static HTML before the app
// has loaded; the app only decides when the screen opens.
const { leaving, gone, reveal } = usePageLoader();

/** Length of the screen's own animation. */
const PLAY_MS = 2400;

// The CSS animation started when the screen was first painted, which can be well before the app
// is ready. Its own clock says how much of it has played; the screen opens when it is done.
const loader = useTemplateRef('loader');
onMounted(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const played = loader.value?.getAnimations()[0]?.currentTime;
  const elapsed = typeof played === 'number' ? played : PLAY_MS;
  setTimeout(reveal, reduce ? 0 : Math.max(0, PLAY_MS - elapsed));
});

// Each letter takes its color from the brand gradient, red on the left to violet on the right.
const NAME = 'andrej-dev';
const RED = [255, 122, 107];
const VIOLET = [154, 139, 255];
const letters = [...NAME].map((char, index) => {
  const t = index / (NAME.length - 1);
  const [r, g, b] = RED.map((channel, k) =>
    Math.round(channel + ((VIOLET[k] ?? channel) - channel) * t),
  );
  return { char, color: `rgb(${r} ${g} ${b})` };
});
</script>

<template>
  <div
    v-if="!gone"
    id="page-loader"
    ref="loader"
    class="page-loader"
    :class="{ leaving }"
    aria-hidden="true"
  >
    <div class="glow" />
    <div class="stage">
      <div class="mark">
        <svg class="bracket-left" viewBox="0 0 20 40">
          <path pathLength="1" d="M15 6 5 20l10 14" />
        </svg>
        <span class="name">
          <span
            v-for="(letter, index) in letters"
            :key="index"
            class="letter"
            :style="{ color: letter.color, '--i': index }"
            >{{ letter.char }}</span
          >
        </span>
        <svg class="slash" viewBox="0 0 16 40"><path pathLength="1" d="M11 5 5 35" /></svg>
        <svg class="bracket-right" viewBox="0 0 20 40">
          <path pathLength="1" d="M5 6l10 14L5 34" />
        </svg>
      </div>
      <div class="meta">
        <span><span class="role">JavaScript developer · </span>Vilnius</span>
        <span class="count" />
      </div>
      <div class="bar"><i /></div>
    </div>
  </div>
</template>

<style scoped>
/* Typed custom properties, so the iris radius and the percentage can be animated. */
@property --hole {
  syntax: '<length>';
  inherits: false;
  initial-value: 0px;
}

@property --n {
  syntax: '<integer>';
  inherits: false;
  initial-value: 0;
}

.page-loader {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: var(--color-bg);
  /* The iris: a see-through circle in the middle, with a soft edge, that grows when leaving. */
  mask-image: radial-gradient(
    circle at 50% 50%,
    transparent calc(var(--hole) - 10vmax),
    #000 var(--hole)
  );
  /* If the app never loads, get out of the way anyway. */
  animation: loader-fallback 0s 6s forwards;
}

.page-loader.leaving {
  animation: iris-open 1s cubic-bezier(0.65, 0, 0.35, 1) forwards;
}

.glow {
  position: absolute;
  width: 46vmax;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgb(154 107 255 / 0.22),
    rgb(255 90 69 / 0.08) 45%,
    transparent 70%
  );
  filter: blur(40px);
  opacity: 0;
  animation: glow 2.4s ease-in-out forwards;
}

.stage {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
}

.leaving .stage {
  animation: stage-out 0.55s cubic-bezier(0.55, 0, 1, 0.45) forwards;
}

.mark {
  display: flex;
  align-items: center;
  font-family: var(--font-mono);
  font-size: clamp(40px, 6.5vw, 112px);
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.02em;
}

.mark svg {
  height: 1.2em;
  overflow: visible;
  fill: none;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.mark path {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: draw 0.7s cubic-bezier(0.65, 0, 0.35, 1) forwards;
}

.bracket-left {
  stroke: #ff7a6b;
  filter: drop-shadow(0 0 10px rgb(255 122 107 / 0.6));
}

.slash {
  stroke: #cc83c5;
  filter: drop-shadow(0 0 10px rgb(204 131 197 / 0.6));
}

.slash path {
  animation-delay: 0.35s;
}

.slash {
  margin-inline: -0.12em -0.04em;
}

.bracket-right {
  stroke: #9a8bff;
  filter: drop-shadow(0 0 10px rgb(154 139 255 / 0.6));
}

.bracket-left path,
.bracket-right path {
  animation-delay: 0.1s;
}

/* The brackets start together as </> and part to make room for the name. */
.name {
  display: inline-flex;
  max-width: 0;
  padding-block: 0.3em;
  margin-block: -0.3em;
  overflow: hidden;
  white-space: nowrap;
  animation: open-name 0.7s cubic-bezier(0.65, 0, 0.35, 1) 0.95s forwards;
}

.letter {
  display: inline-block;
  opacity: 0;
  transform: translateY(0.45em);
  filter: blur(8px);
  animation:
    letter-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) calc(1.1s + var(--i) * 45ms) forwards,
    shine 0.55s ease-in-out calc(1.85s + var(--i) * 35ms);
}

.meta {
  display: flex;
  width: min(70vw, clamp(260px, 26vw, 420px));
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: clamp(11px, 0.85vw, 13px);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-dim);
  opacity: 0;
  animation: fade-in 0.6s ease-out 1.3s forwards;
}

/* On phones only the city fits next to the percentage. */
@media (max-width: 520px) {
  .role {
    display: none;
  }
}

.count {
  counter-reset: n var(--n);
  font-variant-numeric: tabular-nums;
  animation: count 2.2s cubic-bezier(0.4, 0, 0.2, 1) 0.1s forwards;
}

.count::after {
  content: counter(n) '%';
}

.bar {
  width: min(70vw, clamp(260px, 26vw, 420px));
  height: 1px;
  margin-top: -16px;
  background: rgb(255 255 255 / 0.1);
}

.bar i {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #ff7a6b, #9a8bff);
  box-shadow: 0 0 12px rgb(154 139 255 / 0.8);
  transform: scaleX(0);
  transform-origin: left;
  animation: fill 2.2s cubic-bezier(0.4, 0, 0.2, 1) 0.1s forwards;
}

@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes open-name {
  to {
    max-width: 10.5ch;
    padding-inline: 0.15em 0.05em;
  }
}

@keyframes letter-in {
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

/* A wave of light running over the name, letter by letter. */
@keyframes shine {
  50% {
    color: #fff;
    text-shadow:
      0 0 18px currentColor,
      0 0 36px rgb(154 107 255 / 0.8);
  }
}

@keyframes glow {
  40% {
    opacity: 1;
    transform: scale(1.08);
  }
  100% {
    opacity: 0.7;
    transform: scale(1);
  }
}

@keyframes fade-in {
  to {
    opacity: 1;
  }
}

@keyframes count {
  to {
    --n: 100;
  }
}

@keyframes fill {
  to {
    transform: scaleX(1);
  }
}

@keyframes stage-out {
  to {
    opacity: 0;
    transform: scale(1.15);
    filter: blur(12px);
  }
}

@keyframes iris-open {
  from {
    --hole: 0px;
  }
  to {
    --hole: 160vmax;
  }
}

@keyframes loader-fallback {
  to {
    visibility: hidden;
  }
}

@media (prefers-reduced-motion: reduce) {
  .page-loader {
    display: none;
  }
}
</style>
