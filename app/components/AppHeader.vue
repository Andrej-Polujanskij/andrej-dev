<script setup lang="ts">
import { scenes, type SceneId } from '~/scenes';
import { activeIndexAt } from '~/utils/timeline';

const { progress } = useScrollProgress();
const activeIndex = computed(() => activeIndexAt(progress.value));

// When the intro starts to fade out, the capsule tightens up and turns darker, so it takes
// less room and stays readable over brighter scenes. Tied to the intro, so both change together.
const { exit: introExit } = useScene('intro');
const compact = computed(() => introExit.value > 0.05);

const menuOpen = ref(false);

const goTo = (id: SceneId) => {
  menuOpen.value = false;
  scrollToScene(id);
};

// Local time in Vilnius. Set only in the browser, so the static HTML never shows the build time.
const vilniusTime = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Vilnius',
  hour: '2-digit',
  minute: '2-digit',
});
const time = ref('');
const timeParts = computed(() => time.value.split(':'));
let clock: ReturnType<typeof setInterval> | undefined;
onMounted(() => {
  const tick = () => (time.value = vilniusTime.format(new Date()));
  tick();
  clock = setInterval(tick, 10_000);
});
onBeforeUnmount(() => clearInterval(clock));

// The menu item under the mouse gets a faint highlight that slides along, like the active one.
const hovered = ref<number | null>(null);

const roundButton =
  'grid size-11 cursor-pointer place-items-center rounded-full border border-line bg-white/4 text-ink';
</script>

<template>
  <!-- Phones: name on the left, menu button on the right.
       Wide screens: one capsule in the middle with the name, the menu and the local time. -->
  <!-- While the phone menu is open the header stays on top of it, so its button can close it. -->
  <header
    class="absolute inset-x-0 top-0 flex items-center justify-between bg-linear-to-b from-bg/60 to-transparent pt-[calc(env(safe-area-inset-top,0px)+12px)] pr-4 pb-3 pl-5 motion-reduce:transition-none lg:justify-center lg:px-gutter lg:pb-[22px] lg:transition-[padding] lg:duration-500"
    :class="[
      menuOpen ? 'z-60' : 'z-30',
      compact
        ? 'lg:pt-[calc(env(safe-area-inset-top,0px)+14px)]'
        : 'lg:pt-[calc(env(safe-area-inset-top,0px)+22px)]',
    ]"
    @keydown.esc="menuOpen = false"
  >
    <button
      type="button"
      class="flex cursor-pointer items-center gap-2.5 py-1.5 text-[15px] font-medium tracking-[0.01em] lg:hidden"
      @click="goTo('intro')"
    >
      <span aria-hidden="true" class="text-gradient font-mono font-semibold">&lt;/&gt;</span>
      Andrej Polujanskij
    </button>

    <div
      class="hidden items-center rounded-full border border-white/10 py-1 backdrop-blur-xl transition-[padding,background-color] duration-500 motion-reduce:transition-none lg:flex"
      :class="compact ? 'bg-[rgb(10_10_20/0.85)] px-5' : 'bg-[rgb(10_10_20/0.6)] px-6 xl:px-7'"
    >
      <button
        type="button"
        class="flex cursor-pointer items-center gap-2.5 text-[15px] font-medium tracking-[0.01em]"
        @click="goTo('intro')"
      >
        <span aria-hidden="true" class="text-gradient font-mono font-semibold">&lt;/&gt;</span>
        Andrej Polujanskij
      </button>
      <i
        class="h-5 w-px bg-white/15 transition-[margin] duration-500 motion-reduce:transition-none"
        :class="compact ? 'mx-5' : 'mx-6 xl:mx-9'"
      />

      <!-- Equal-width links, so the highlight can slide from one to the next. -->
      <nav
        aria-label="Main"
        class="relative grid"
        :style="{ gridTemplateColumns: `repeat(${scenes.length}, minmax(0, 1fr))` }"
        @mouseleave="hovered = null"
      >
        <i
          class="absolute inset-y-0 left-0 rounded-full bg-white/[0.04] transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none"
          :class="hovered === null ? 'opacity-0' : 'opacity-100'"
          :style="{
            width: `calc(100% / ${scenes.length})`,
            transform: `translateX(${(hovered ?? activeIndex) * 100}%)`,
          }"
        />
        <i
          class="absolute inset-y-0 left-0 rounded-full bg-white/12 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
          :style="{
            width: `calc(100% / ${scenes.length})`,
            transform: `translateX(${activeIndex * 100}%)`,
          }"
        />
        <a
          v-for="(scene, index) in scenes"
          :key="scene.id"
          :href="`#${scene.id}`"
          :aria-current="index === activeIndex ? 'true' : undefined"
          class="relative px-5 text-center text-sm transition-[color,padding] duration-250 hover:text-ink motion-reduce:transition-none"
          :class="[index === activeIndex ? 'text-ink' : 'text-ink/60', compact ? 'py-1.5' : 'py-2']"
          @mouseenter="hovered = index"
          @click.prevent="goTo(scene.id)"
        >
          {{ scene.label }}
        </a>
      </nav>

      <i
        class="h-5 w-px bg-white/15 transition-[margin] duration-500 motion-reduce:transition-none"
        :class="compact ? 'mx-5' : 'mx-6 xl:mx-9'"
      />
      <!-- Fixed width, so the capsule does not grow when the time appears after load. -->
      <span class="w-[14ch] font-mono text-[13px] whitespace-nowrap text-ink/60 tabular-nums">
        <template v-if="time">
          Vilnius {{ timeParts[0] }}<span class="animate-blink motion-reduce:animate-none">:</span
          >{{ timeParts[1] }}
        </template>
      </span>
    </div>

    <!-- Two lines that turn into a cross: they meet in the middle first, then rotate. -->
    <button
      type="button"
      :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
      :aria-expanded="menuOpen"
      aria-controls="phone-menu"
      :class="[roundButton, 'lg:hidden', { open: menuOpen }]"
      @click="menuOpen = !menuOpen"
    >
      <span aria-hidden="true" class="relative block h-4 w-4">
        <span class="line top-[5px]"><i /></span>
        <span class="line top-[10px]"><i /></span>
      </span>
    </button>
  </header>

  <!-- Phone menu: the panel unrolls from the top, then the links drop in one after another.
       It swallows touch and wheel scrolling, so the page stays put behind it. -->
  <Transition name="menu" :duration="{ enter: 700, leave: 450 }">
    <nav
      v-if="menuOpen"
      id="phone-menu"
      aria-label="Menu"
      class="absolute inset-0 z-50 flex touch-none flex-col bg-[rgb(3_3_10/0.94)] px-5 pt-[calc(env(safe-area-inset-top,0px)+96px)] backdrop-blur-[18px] lg:hidden"
      @keydown.esc="menuOpen = false"
      @wheel.prevent
    >
      <a
        v-for="(scene, index) in scenes"
        :key="scene.id"
        :href="`#${scene.id}`"
        :aria-current="index === activeIndex ? 'true' : undefined"
        class="item flex items-baseline gap-4 border-b border-line py-4 text-[32px] font-light tracking-[-0.02em]"
        :class="index === activeIndex ? 'text-ink' : 'text-ink/55'"
        :style="{ '--i': index }"
        @click.prevent="goTo(scene.id)"
      >
        <span class="text-gradient font-mono text-xs font-medium">0{{ index + 1 }}</span>
        {{ scene.label }}
      </a>
      <p
        class="item mt-auto pb-[calc(env(safe-area-inset-bottom,0px)+32px)] font-mono text-[13px] text-ink/55"
        :style="{ '--i': scenes.length }"
      >
        <template v-if="time">Vilnius {{ time }}</template>
      </p>
    </nav>
  </Transition>
</template>

<style scoped>
/* The burger: each line sits in a wrapper that moves it to the middle, and rotates inside it. */
.line {
  position: absolute;
  left: 2px;
  width: 12px;
  height: 1.5px;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1) 0.2s;
}

.line i {
  display: block;
  height: 100%;
  border-radius: 1px;
  background: currentColor;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.line:first-child {
  --shift: 2.5px;
  --turn: 45deg;
}

.line:last-child {
  --shift: -2.5px;
  --turn: -45deg;
}

/* Opening: meet first, then rotate. Closing runs the other way round. */
.open .line {
  transform: translateY(var(--shift));
  transition-delay: 0s;
}

.open .line i {
  transform: rotate(var(--turn));
  transition-delay: 0.2s;
}

.menu-enter-active,
.menu-leave-active {
  transition: clip-path 0.5s cubic-bezier(0.32, 0.08, 0.24, 1);
}

.menu-leave-active {
  transition-duration: 0.36s;
  transition-delay: 0.08s;
}

.menu-enter-from,
.menu-leave-to {
  clip-path: inset(0 0 100% 0);
}

.menu-enter-to,
.menu-leave-from {
  clip-path: inset(0 0 0 0);
}

.menu-enter-active .item {
  transition:
    opacity 0.4s ease-out,
    transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(0.14s + var(--i) * 0.045s);
}

.menu-leave-active .item {
  transition: opacity 0.15s ease-in;
}

.menu-enter-from .item {
  opacity: 0;
  transform: translateY(-14px);
}

.menu-leave-to .item {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .line,
  .line i,
  .menu-enter-active,
  .menu-leave-active,
  .menu-enter-active .item,
  .menu-leave-active .item {
    transition: none;
  }
}
</style>
