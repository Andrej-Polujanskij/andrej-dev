<script setup lang="ts">
const { siteUrl } = useRuntimeConfig().public;

const title = 'Andrej Polujanskij · JavaScript Developer';
const description =
  'JavaScript developer from Vilnius with 6+ years of experience. Real-time apps, internal platforms and AI-native development with Vue, TypeScript and Node.';

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogType: 'website',
  ogUrl: siteUrl,
  ogImage: `${siteUrl}/og.png`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  twitterCard: 'summary_large_image',
});

useHead({
  link: [{ rel: 'canonical', href: siteUrl }],
});
</script>

<template>
  <NuxtPage />
</template>
