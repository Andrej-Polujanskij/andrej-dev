<template>
  <!-- Text on the left and the sphere on the right; on phones both are centered, the text
       on top of the sphere. -->
  <SceneSection
    id="intro"
    class="flex flex-col items-center justify-center px-5 py-[calc(env(safe-area-inset-bottom,0px)+72px)] lg:items-start lg:px-content lg:py-0"
  >
    <div
      class="flex max-w-[760px] flex-col items-center gap-6 text-center max-lg:[text-shadow:0_0_14px_var(--color-bg),0_0_28px_var(--color-bg)] lg:items-start lg:text-left"
    >
      <Reveal>
        <Badge size="lg"><Icon name="layers" />JavaScript developer · Vilnius</Badge>
      </Reveal>
      <RevealWords
        tag="h1"
        :delay="0.1"
        text="From landing pages to large-scale platforms"
        class="max-w-[10.4em] text-[clamp(38px,4vw,72px)] leading-[1.04] text-wrap"
      />
      <Reveal
        tag="p"
        :delay="0.45"
        class="max-w-[26em] text-lead text-muted xl:max-w-[33em] short:hidden"
      >
        6+ years building for the web. Marketing funnels that convert and
        <span class="whitespace-nowrap">real-time</span> apps that hundreds of people use every day.
      </Reveal>
      <Reveal
        :delay="0.6"
        class="flex flex-wrap items-center justify-center gap-3 lg:justify-start"
      >
        <ButtonLink href="#contact" @click.prevent="scrollToScene('contact')">
          Get in touch
        </ButtonLink>
        <ButtonLink href="#work" variant="ghost" @click.prevent="scrollToScene('work')">
          See my work
        </ButtonLink>
      </Reveal>
    </div>
  </SceneSection>
</template>
