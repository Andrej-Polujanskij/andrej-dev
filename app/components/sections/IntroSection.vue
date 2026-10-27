<template>
  <!-- Text on the left and the sphere on the right; on phones the sphere sits above the text. -->
  <SceneSection
    id="intro"
    class="flex flex-col justify-end px-5 pb-[calc(env(safe-area-inset-bottom,0px)+72px)] lg:justify-center lg:px-content lg:pb-0"
  >
    <div class="flex max-w-[760px] flex-col items-start gap-6 text-left">
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
      <Reveal :delay="0.6" class="flex flex-wrap items-center gap-3">
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
