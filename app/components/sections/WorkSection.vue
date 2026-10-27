<script setup lang="ts">
import { features, principles } from '~/data/content';

const projects = [...new Set(features.map((feature) => feature.project))].map((name) => ({
  name,
  items: features.filter((feature) => feature.project === name),
}));

// Address shown in the mock window's title bar, one per product.
const addresses = [
  'dialer.app/live-call',
  'cms.app/page-builder',
  'landing.page/quiz?step=2',
  'agents/research/run',
];

// The mock on show moves on to the next product every CYCLE seconds, in a loop. The active tab's
// underline fills up meanwhile. The mouse resting on the mock or panel holds it; a click on a
// tab shows that product and starts its cycle over.
const CYCLE = 6;
const active = ref(0);
const elapsed = ref(0);
const holding = ref(false);
const { visible } = useScene('work');
const { seconds, reducedMotion } = useScrollProgress();
watch(seconds, (now, before) => {
  if (!visible.value || holding.value || reducedMotion.value) return;
  elapsed.value += Math.min(now - before, 0.1);
  if (elapsed.value < CYCLE) return;
  elapsed.value = 0;
  active.value = (active.value + 1) % projects.length;
});
const pick = (index: number) => {
  active.value = index;
  elapsed.value = 0;
};
const tabProgress = computed(() => (reducedMotion.value ? 1 : elapsed.value / CYCLE));

// Small signs of life in the mocks: the call timer runs, the quiz answer gets picked.
const pad = (value: number) => String(value).padStart(2, '0');
const callTime = computed(() => {
  const total = 134 + Math.floor(seconds.value % 600);
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
});
// Each mock plays its little story from the start when it is shown: time since it came in,
// minus the moment the old mock takes to fade out.
const shownAt = ref(0);
watch(active, () => (shownAt.value = seconds.value));
const mockTime = computed(() => seconds.value - shownAt.value - 0.3);
const answerPicked = computed(() => mockTime.value > 1.6);

// The research agent works through its steps one by one, then shows what it found.
const agentSteps = ['Read 12 sources', 'Filter by criteria', 'Rank 5 matches', 'Write summary'];
const agentStep = computed(() => Math.min(agentSteps.length, Math.floor(mockTime.value / 1.1)));

// Heights of the voice level bars in the call mock, as fractions of the meter.
const voiceBars = [
  0.4, 0.7, 0.5, 0.9, 0.6, 1, 0.75, 0.5, 0.85, 0.45, 0.65, 0.95, 0.55, 0.8, 0.4, 0.6, 0.9, 0.5,
  0.75, 1, 0.6, 0.45, 0.85, 0.55, 0.7, 0.4, 0.65, 0.5,
];
const leaders = [
  { width: 92, score: 128 },
  { width: 74, score: 104 },
  { width: 61, score: 91 },
  { width: 45, score: 76 },
];

// The mock window and the panel below it share one look: dark, slightly see-through glass.
const card =
  'rounded-[22px] border border-white/10 bg-[rgb(10_10_20/0.8)] shadow-[0_50px_100px_-40px_#000] backdrop-blur-xl';

// Arrow keys, Home and End move between the tabs, as in any tab list.
const tabButtons = useTemplateRef('tabButtons');
const onTabKeydown = (event: KeyboardEvent) => {
  const count = projects.length;
  const keys: Record<string, number> = {
    ArrowRight: (active.value + 1) % count,
    ArrowLeft: (active.value - 1 + count) % count,
    Home: 0,
    End: count - 1,
  };
  const next = keys[event.key];
  if (next === undefined) return;
  event.preventDefault();
  pick(next);
  tabButtons.value?.[next]?.focus();
};
</script>

<template>
  <!-- Heading and principles on the left, a small mock of each product's interface on the right. -->
  <SceneSection
    id="work"
    class="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] content-center items-start gap-12 px-content pt-[max(96px,11vh)] pb-[max(56px,7vh)] low:pt-[76px] low:pb-[60px]"
  >
    <div
      class="flex flex-col items-start gap-6 [text-shadow:0_0_12px_var(--color-bg),0_0_24px_var(--color-bg)] low:gap-4"
    >
      <Reveal>
        <Badge size="lg"><Icon name="window" />Work</Badge>
      </Reveal>
      <!-- Narrow enough to always break after the comma. -->
      <RevealWords
        :delay="0.1"
        text="Whole features, not just screens"
        class="max-w-[8em] text-heading"
      />
      <Reveal tag="p" :delay="0.35" class="max-w-[30em] text-lead text-muted">
        Years on the same product team, building the tools a business runs on every day. I take
        features from the first requirement to production.
      </Reveal>
      <ol class="mt-4 flex w-full max-w-[520px] flex-col low:mt-0">
        <Reveal
          v-for="(principle, index) in principles"
          :key="principle.title"
          tag="li"
          :delay="0.45 + index * 0.07"
          class="grid grid-cols-[40px_minmax(0,1fr)] gap-3 border-t border-line py-3.5 low:py-2.5"
        >
          <span class="text-gradient font-mono text-xs font-medium">0{{ index + 1 }}</span>
          <div>
            <b class="text-[15px] font-medium">{{ principle.title }}</b>
            <p class="mt-0.5 text-sm text-pretty text-ink/70">{{ principle.text }}</p>
          </div>
        </Reveal>
      </ol>
    </div>

    <Reveal
      :delay="0.3"
      class="flex flex-col gap-5 low:gap-3"
      @mouseenter="holding = true"
      @mouseleave="holding = false"
    >
      <!-- What the right side is: a small heading, which product is on show, and why sketches. -->
      <div
        class="flex flex-col gap-1.5 [text-shadow:0_0_12px_var(--color-bg),0_0_24px_var(--color-bg)]"
      >
        <div class="flex items-baseline justify-between gap-4">
          <h3 class="text-[22px] font-normal">What I've built</h3>
          <span class="text-gradient font-mono text-[13px] font-medium tabular-nums">
            0{{ active + 1 }} / 0{{ projects.length }}
          </span>
        </div>
        <p class="text-sm text-ink/70 low:hidden">
          Selected projects, shown as simplified sketches.
        </p>
      </div>

      <!-- The window around the mock. -->
      <div aria-hidden="true" :class="['overflow-hidden', card]">
        <div class="flex items-center gap-2 border-b border-line px-4 py-3">
          <i class="size-2.5 rounded-full bg-white/15" />
          <i class="size-2.5 rounded-full bg-white/15" />
          <i class="size-2.5 rounded-full bg-white/15" />
          <span class="ml-3 font-mono text-[13px] text-ink/70">{{ addresses[active] }}</span>
        </div>

        <div class="relative h-[340px] p-5 low:h-[268px]">
          <!-- Call-center: live call with controls, a small leaderboard beside it. -->
          <div
            class="absolute inset-5 grid grid-cols-[1.4fr_1fr] gap-4 transition-[opacity,transform] duration-300 ease-out"
            :class="
              active === 0
                ? 'translate-y-0 opacity-100 delay-300'
                : 'pointer-events-none translate-y-2 opacity-0'
            "
          >
            <div class="flex flex-col rounded-2xl border border-line bg-white/3 p-5">
              <div class="flex items-center gap-2 text-xs">
                <span
                  class="size-2 animate-pulse rounded-full bg-[#4ade80] shadow-[0_0_10px_#4ade80]"
                />
                <span class="text-ink/80">Live call</span>
                <span class="ml-auto font-mono text-dim tabular-nums">{{ callTime }}</span>
              </div>
              <span class="mt-5 text-2xl font-light">Incoming call</span>
              <span class="mt-1 font-mono text-xs text-ink/55">Inbound · Queue 3 · Connected</span>
              <!-- Voice level of the call, moving like a live audio meter. -->
              <div class="mt-auto flex h-10 items-center gap-[3px] low:h-7">
                <span
                  v-for="(height, bar) in voiceBars"
                  :key="bar"
                  class="w-1 animate-voice rounded-full bg-linear-to-t from-brand-blue to-brand-violet motion-reduce:animate-none"
                  :style="{ height: `${height * 100}%`, animationDelay: `${bar * -0.13}s` }"
                />
              </div>
              <div class="mt-4 grid grid-cols-4 gap-2 low:mt-3">
                <span
                  v-for="label in ['Mute', 'Hold', 'Transfer']"
                  :key="label"
                  class="rounded-lg border border-line py-2 text-center text-[11px] text-ink/70"
                >
                  {{ label }}
                </span>
                <span class="rounded-lg bg-[#ef4444]/80 py-2 text-center text-[11px]">End</span>
              </div>
            </div>
            <div class="flex flex-col gap-3 rounded-2xl border border-line bg-white/3 p-4">
              <span class="font-mono text-[10px] tracking-[0.14em] text-ink/55 uppercase">
                Leaderboard
              </span>
              <div v-for="(leader, row) in leaders" :key="row" class="flex items-center gap-2.5">
                <span
                  class="size-5 shrink-0 rounded-full bg-linear-to-br from-white/25 to-white/5"
                />
                <div class="flex min-w-0 flex-1 flex-col gap-1">
                  <span class="h-1.5 w-1/2 rounded-full bg-white/15" />
                  <span
                    class="h-1.5 rounded-full bg-linear-to-r from-brand-blue to-brand-violet"
                    :style="{ width: `${leader.width}%` }"
                  />
                </div>
                <span class="font-mono text-[11px] text-ink/70 tabular-nums">{{
                  leader.score
                }}</span>
              </div>
            </div>
          </div>

          <!-- Website builder: blocks palette, a page made of blocks, one being dragged in. -->
          <div
            class="absolute inset-5 grid grid-cols-[110px_1fr] gap-4 transition-[opacity,transform] duration-300 ease-out"
            :class="
              active === 1
                ? 'translate-y-0 opacity-100 delay-300'
                : 'pointer-events-none translate-y-2 opacity-0'
            "
          >
            <div class="flex flex-col gap-2 rounded-2xl border border-line bg-white/3 p-3">
              <span class="font-mono text-[10px] tracking-[0.14em] text-ink/55 uppercase"
                >Blocks</span
              >
              <span
                v-for="block in ['Hero', 'Text', 'Form', 'Gallery', 'Pricing', 'FAQ']"
                :key="block"
                class="rounded-lg border border-line px-2.5 py-1.5 text-[11px] text-ink/70"
              >
                {{ block }}
              </span>
            </div>
            <div
              class="relative flex flex-col gap-2.5 rounded-2xl border border-line bg-white/3 p-4"
            >
              <div class="h-16 rounded-lg bg-linear-to-r from-brand-blue/40 to-brand-violet/40" />
              <div class="flex flex-col gap-1.5 px-1">
                <span class="h-1.5 w-3/4 rounded-full bg-white/20" />
                <span class="h-1.5 w-1/2 rounded-full bg-white/12" />
              </div>
              <div
                class="h-12 rounded-lg border border-dashed border-brand-violet/70 bg-brand-violet/10"
              />
              <div class="grid grid-cols-3 gap-2">
                <span class="h-10 rounded-lg bg-white/8" />
                <span class="h-10 rounded-lg bg-white/8" />
                <span class="h-10 rounded-lg bg-white/8" />
              </div>
              <div
                class="mt-auto flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2.5 low:hidden"
              >
                <span class="size-1.5 rounded-full bg-[#4ade80]" />
                <span class="font-mono text-[10px] text-ink/55">Saved · ready to publish</span>
                <span class="ml-auto rounded-md bg-brand-violet/70 px-2.5 py-1 text-[10px]">
                  Publish
                </span>
              </div>
              <!-- The Form block travels from the palette into the dashed drop zone. -->
              <span
                :key="shownAt"
                class="absolute top-[42%] left-[40%] animate-drag-in rounded-lg border border-brand-violet bg-[rgb(30_24_60)] px-3 py-2 text-[11px] shadow-[0_12px_30px_-8px_#000] motion-reduce:animate-none"
              >
                Form
              </span>
            </div>
          </div>

          <!-- Funnel: a quiz step with one answer picked, a LiveChat bubble below. -->
          <div
            class="absolute inset-5 flex flex-col gap-3 transition-[opacity,transform] duration-300 ease-out"
            :class="
              active === 2
                ? 'translate-y-0 opacity-100 delay-300'
                : 'pointer-events-none translate-y-2 opacity-0'
            "
          >
            <div class="rounded-2xl border border-line bg-white/3 p-5 low:p-4">
              <div class="flex items-center justify-between font-mono text-[10px] text-ink/55">
                <span>STEP 2 / 4</span>
                <span class="h-1 w-24 overflow-hidden rounded-full bg-white/10">
                  <span class="block h-full w-1/2 bg-linear-to-r from-brand-violet to-brand-red" />
                </span>
              </div>
              <span class="mt-4 block text-lg font-light low:mt-2.5"
                >How soon do you need coverage?</span
              >
              <div class="mt-4 grid grid-cols-3 gap-2 low:mt-3">
                <span class="rounded-lg border border-line py-2.5 text-center text-xs text-ink/70">
                  This month
                </span>
                <span
                  class="rounded-lg border py-2.5 text-center text-xs transition-colors duration-500"
                  :class="
                    answerPicked
                      ? 'border-brand-red/80 bg-brand-red/15 text-ink'
                      : 'border-line text-ink/70'
                  "
                >
                  Next 3 months
                </span>
                <span class="rounded-lg border border-line py-2.5 text-center text-xs text-ink/70">
                  Just looking
                </span>
              </div>
            </div>
            <div
              class="ml-auto flex max-w-[70%] items-end gap-2 transition-[opacity,transform] duration-500"
              :class="answerPicked ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'"
            >
              <span class="rounded-2xl rounded-br-sm bg-white/8 px-4 py-2.5 text-xs text-ink/80">
                Great, an agent can walk you through plans now. Want to chat?
              </span>
              <span
                class="size-7 shrink-0 rounded-full bg-linear-to-br from-brand-violet to-brand-red"
              />
            </div>
            <div
              class="mt-auto flex items-center gap-3 rounded-2xl border border-line bg-white/3 px-4 py-3 low:hidden"
            >
              <span class="font-mono text-[10px] text-ink/55">CHECKOUT</span>
              <span class="h-1.5 w-20 rounded-full bg-white/15" />
              <span class="h-1.5 w-14 rounded-full bg-white/10" />
              <span
                class="ml-auto rounded-lg bg-linear-to-r from-brand-violet to-brand-red px-3.5 py-1.5 text-[11px]"
              >
                Continue
              </span>
            </div>
          </div>

          <!-- AI agents: a research run ticking through its steps, then the summary it wrote. -->
          <div
            class="absolute inset-5 grid grid-cols-[1fr_1.15fr] gap-4 transition-[opacity,transform] duration-300 ease-out"
            :class="
              active === 3
                ? 'translate-y-0 opacity-100 delay-300'
                : 'pointer-events-none translate-y-2 opacity-0'
            "
          >
            <div class="flex flex-col gap-3 rounded-2xl border border-line bg-white/3 p-4">
              <div class="flex items-center gap-2">
                <span class="font-mono text-[10px] tracking-[0.14em] text-ink/55 uppercase">
                  Agent run
                </span>
                <span
                  class="ml-auto rounded-full border border-brand-violet/50 px-2 py-0.5 font-mono text-[10px] text-ink/70"
                >
                  claude
                </span>
              </div>
              <div
                v-for="(step, index) in agentSteps"
                :key="step"
                class="flex items-center gap-2.5 text-xs transition-colors duration-300"
                :class="index <= agentStep ? 'text-ink/85' : 'text-ink/35'"
              >
                <!-- Done: green dot. Running: pulsing violet. Waiting: hollow. -->
                <span
                  class="size-2 shrink-0 rounded-full transition-colors duration-300"
                  :class="
                    index < agentStep
                      ? 'bg-[#4ade80]'
                      : index === agentStep
                        ? 'animate-pulse bg-brand-violet shadow-[0_0_10px_var(--color-brand-violet)]'
                        : 'border border-white/25'
                  "
                />
                {{ step }}
              </div>
              <!-- Where the agent reads from. -->
              <div class="mt-auto flex flex-wrap gap-1.5 low:hidden">
                <span
                  v-for="source in ['Docs', 'Blogs', 'GitHub', 'RSS', 'APIs']"
                  :key="source"
                  class="rounded-md border border-line px-2 py-1 font-mono text-[10px] text-ink/60"
                >
                  {{ source }}
                </span>
              </div>
            </div>
            <div class="flex flex-col gap-2.5 rounded-2xl border border-line bg-white/3 p-4">
              <span class="font-mono text-[10px] tracking-[0.14em] text-ink/55 uppercase">
                Summary
              </span>
              <div
                v-for="(width, line) in [92, 80, 86, 64, 74, 40]"
                :key="line"
                class="h-1.5 origin-left rounded-full bg-white/18 transition-transform duration-500"
                :style="{
                  width: `${width}%`,
                  transform: `scaleX(${agentStep >= agentSteps.length - 1 ? 1 : 0})`,
                  transitionDelay: `${line * 90}ms`,
                }"
              />
              <div
                class="mt-auto flex items-center gap-2 transition-opacity duration-500"
                :class="agentStep >= agentSteps.length ? 'opacity-100' : 'opacity-0'"
              >
                <span class="size-1.5 rounded-full bg-[#4ade80]" />
                <span class="font-mono text-[10px] text-ink/55">5 results · sent</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- One panel: tabs to switch between products, then what the mock shows. -->
      <div :class="['overflow-hidden', card]">
        <div
          role="tablist"
          aria-label="Projects"
          class="flex border-b border-line px-2 xl:px-3"
          @keydown="onTabKeydown"
        >
          <button
            v-for="(project, index) in projects"
            :id="`work-tab-${index}`"
            ref="tabButtons"
            :key="project.name"
            type="button"
            role="tab"
            aria-controls="work-tabpanel"
            :aria-selected="index === active"
            :tabindex="index === active ? 0 : -1"
            class="relative cursor-pointer px-2.5 py-4 text-[clamp(13px,1.05vw,15px)] whitespace-nowrap transition-colors duration-300 xl:px-3 low:py-3"
            :class="index === active ? 'font-medium text-ink' : 'text-ink/60 hover:text-ink'"
            @click="pick(index)"
          >
            {{ project.name }}
            <!-- Under the active tab a brand gradient line fills up until the next product. -->
            <i
              v-if="index === active"
              class="absolute inset-x-2.5 -bottom-px h-0.5 overflow-hidden rounded-full bg-white/12 xl:inset-x-3"
            >
              <i
                class="block h-full origin-left bg-linear-to-r from-brand-red to-brand-blue"
                :style="{ transform: `scaleX(${tabProgress})` }"
              />
            </i>
          </button>
        </div>
        <div
          id="work-tabpanel"
          role="tabpanel"
          :aria-labelledby="`work-tab-${active}`"
          class="grid grid-cols-2 gap-6 px-6 py-5 low:py-4"
        >
          <div v-for="feature in projects[active]?.items" :key="feature.title">
            <span
              class="text-gradient font-mono text-[11px] font-medium tracking-[0.14em] uppercase"
            >
              {{ feature.label }}
            </span>
            <b class="mt-1.5 block text-xl font-medium text-ink">{{ feature.title }}</b>
            <p class="mt-1.5 text-sm leading-[1.55] text-pretty text-ink/80">
              {{ feature.points.join(' · ') }}
            </p>
          </div>
        </div>
      </div>
    </Reveal>
  </SceneSection>
</template>
