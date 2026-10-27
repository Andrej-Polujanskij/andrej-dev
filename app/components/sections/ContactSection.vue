<script setup lang="ts">
import { contact } from '~/data/content';

const emailElement = useTemplateRef('emailElement');
const toastMessage = ref('');
const toastVisible = ref(false);
let toastTimer: ReturnType<typeof setTimeout> | undefined;

const showToast = (message: string) => {
  toastMessage.value = message;
  toastVisible.value = true;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toastVisible.value = false), 1800);
};

// Some browsers and embedded views refuse clipboard access; then select the address instead.
const selectEmail = () => {
  if (emailElement.value) window.getSelection()?.selectAllChildren(emailElement.value);
  showToast('Address selected, copy it with Ctrl+C');
};

const copyEmail = () => {
  if (!navigator.clipboard) return selectEmail();
  navigator.clipboard.writeText(contact.email).then(() => showToast('Email copied'), selectEmail);
};
</script>

<template>
  <SceneSection
    id="contact"
    class="flex flex-col items-center justify-between px-gutter pt-[13vh] pb-[calc(env(safe-area-inset-bottom,0px)+10vh)] text-center lg:pt-[12.5vh]"
  >
    <div class="flex flex-col items-center gap-5">
      <Reveal>
        <Badge size="lg"><Icon name="mail" />Contact</Badge>
      </Reveal>
      <RevealWords :delay="0.1" text="Let's talk" class="text-heading" />
    </div>

    <div
      class="flex flex-col items-center gap-5 [text-shadow:0_0_16px_var(--color-bg),0_0_32px_var(--color-bg)]"
    >
      <Reveal tag="p" :delay="0.4" class="max-w-[32em] text-lead text-muted">
        Email is the fastest way to reach me. I'm also on LinkedIn.
      </Reveal>
      <Reveal
        :delay="0.5"
        class="flex flex-wrap items-center justify-center gap-2.5 [text-shadow:none]"
      >
        <code
          ref="emailElement"
          class="rounded-xl border border-line bg-[rgb(10_10_20/0.7)] px-[18px] py-[13px] font-mono text-sm wrap-anywhere select-all"
          >{{ contact.email }}</code
        >
        <button
          type="button"
          class="cursor-pointer rounded-full bg-ink px-5 py-[15px] text-[13px] leading-none font-medium text-bg hover:bg-white"
          @click="copyEmail"
        >
          Copy
        </button>
        <ButtonLink :href="contact.linkedin">LinkedIn</ButtonLink>
      </Reveal>
      <Reveal :delay="0.55" class="font-mono text-[13px] text-muted">
        {{ contact.location }}
      </Reveal>
    </div>

    <div
      class="absolute right-gutter bottom-[calc(env(safe-area-inset-bottom,0px)+30px)] hidden text-xs text-dim lg:block"
    >
      © 2026 Andrej Polujanskij
    </div>

    <div
      role="status"
      aria-live="polite"
      class="pointer-events-none absolute bottom-7 left-1/2 z-60 -translate-x-1/2 rounded-full bg-ink px-4 py-2.5 text-[13px] text-bg transition duration-250 motion-reduce:transition-none"
      :class="toastVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'"
    >
      {{ toastMessage }}
    </div>
  </SceneSection>
</template>
