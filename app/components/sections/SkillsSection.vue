<script setup lang="ts">
import { brandColors, skills } from '~/data/content';

// Pads the keys so the arrays line up like in a formatted file.
const keyWidth = Math.max(...skills.map((group) => group.key.length)) + 1;
const padKey = (key: string) => `${key}:`.padEnd(keyWidth + 1, ' ');

// A tool as a quoted string, split into letters so they can light up one after another.
const letters = (tool: string) => [...`'${tool}'`];
</script>

<template>
  <!-- Text on the left, the stack written out as a TypeScript file on the right. -->
  <SceneSection
    id="skills"
    class="flex flex-col gap-7 px-5 pt-[calc(env(safe-area-inset-top,0px)+96px)] lg:grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start lg:gap-[clamp(32px,5vw,96px)] lg:px-content lg:pt-[max(128px,17vh)]"
  >
    <div class="flex flex-col items-start gap-4 lg:gap-[22px]">
      <Reveal>
        <Badge size="lg"><Icon name="code" />Skills</Badge>
      </Reveal>
      <!-- Narrow enough to always take two lines, also on wide screens. -->
      <RevealWords :delay="0.1" text="The stack behind the work" class="max-w-[8em] text-heading" />
      <Reveal tag="p" :delay="0.4" class="text-lead text-muted short:hidden">
        The whole JavaScript stack, from interface to database. Tools I know well, each one used in
        real projects.
      </Reveal>
    </div>

    <Reveal :delay="0.2" class="overflow-hidden rounded-2xl glass">
      <div class="flex items-center gap-2 border-b border-line px-4 py-3">
        <i class="size-2.5 rounded-full bg-white/15" />
        <i class="size-2.5 rounded-full bg-white/15" />
        <i class="size-2.5 rounded-full bg-white/15" />
        <span class="ml-3 font-mono text-xs text-dim">stack.ts</span>
      </div>
      <div class="group/code py-4 font-mono text-[11.5px] leading-[1.9] lg:py-5 lg:text-sm">
        <Reveal :delay="0.35" class="flex">
          <span class="w-9 shrink-0 pr-3 text-right text-dim/60 lg:w-12">1</span>
          <span>
            <span class="text-brand-violet">export const</span> stack
            <span class="text-dim">= {</span>
          </span>
        </Reveal>
        <Reveal
          v-for="(group, index) in skills"
          :key="group.key"
          :delay="0.4 + index * 0.06"
          class="flex"
        >
          <span class="w-9 shrink-0 pr-3 text-right text-dim/60 lg:w-12">{{ index + 2 }}</span>
          <span class="min-w-0 pr-4 pl-[2ch]">
            <span class="text-[#8ea2ff]">{{ padKey(group.key) }}</span>
            <span class="text-dim">[</span>
            <template v-for="(tool, position) in group.items" :key="tool">
              <!-- On hover a tool lifts and lights up letter by letter in its brand color,
                   while the other tools dim. -->
              <span
                data-tool
                class="group/tool -mx-[0.25ch] inline-block cursor-default rounded-md px-[0.25ch] text-[#ff9a8b] transition-[background-color,opacity,transform] duration-300 ease-out group-has-[[data-tool]:hover]/code:opacity-35 hover:-translate-y-0.5 hover:scale-110 hover:bg-[color-mix(in_srgb,var(--brand)_16%,transparent)] hover:opacity-100! motion-reduce:transition-none"
                :style="{ '--brand': brandColors[tool] ?? '#ffffff' }"
                ><span
                  v-for="(letter, letterIndex) in letters(tool)"
                  :key="letterIndex"
                  class="transition-[color,text-shadow] duration-200 group-hover/tool:text-[var(--brand)] group-hover/tool:[text-shadow:0_0_18px_var(--brand),0_0_4px_var(--brand)] motion-reduce:transition-none"
                  :style="{ transitionDelay: `${letterIndex * 35}ms` }"
                  >{{ letter }}</span
                ></span
              ><span v-if="position < group.items.length - 1" class="text-dim">, </span>
            </template>
            <span class="text-dim">],</span>
          </span>
        </Reveal>
        <Reveal :delay="0.8" class="flex">
          <span class="w-9 shrink-0 pr-3 text-right text-dim/60 lg:w-12">{{
            skills.length + 2
          }}</span>
          <span>
            <span class="text-dim">}</span>
            <span class="text-brand-violet"> satisfies</span> Stack<span class="text-dim">;</span>
            <i
              class="ml-1 inline-block h-[1.1em] w-[0.55ch] translate-y-[0.2em] animate-pulse bg-ink/80 motion-reduce:animate-none"
            />
          </span>
        </Reveal>
      </div>
    </Reveal>
  </SceneSection>
</template>
