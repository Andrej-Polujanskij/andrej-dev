# Andrej Polujanskij · personal site

A one-page personal site. While you scroll, a single WebGL particle cloud morphs through four shapes (sphere, DNA helix, wave horizon, galaxy) and the text of each scene fades in word by word.

## Tech stack

- Nuxt 4 (static generation), Vue 3, TypeScript
- Tailwind CSS 4
- Plain WebGL2 for the particles, no 3D library
- @nuxt/fonts (Geist and Geist Mono, served from the site itself)
- ESLint, Prettier, Husky

## Getting started

Requires Node 22.19+ or 24.11+ and yarn 1.

```bash
yarn install
yarn dev              # http://localhost:3000
```

Other commands:

```bash
yarn generate         # static build to .output/public
yarn lint
yarn typecheck
yarn format
```

## Where to change things

| What                                               | Where                                                                                                                           |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Work features, principles, skills, contacts        | `app/data/content.ts`                                                                                                           |
| Headings, intro sentences and the Work mocks       | the section components in `app/components/sections/`                                                                            |
| Order, length, camera and brightness of the scenes | `app/scenes.ts`                                                                                                                 |
| Colors, fonts, text sizes                          | `app/assets/css/main.css` (`@theme`)                                                                                            |
| The particle shapes                                | `app/particles/shaders/particles.vert.glsl` (one function per shape) and `app/particles/formations.ts` (where the points start) |
| Site address for social previews                   | `siteUrl` in `nuxt.config.ts`                                                                                                   |

`app/scenes.ts` is the single source of truth for the scroll story. Scroll positions, text timing, menu links, the camera path and the particle morphs are all derived from it. To give a scene more time, raise its `duration`. If you reorder scenes, reorder the section components in `app/pages/index.vue` the same way.

## Structure

```
app/
  scenes.ts           the scroll story
  data/content.ts     lists of text content
  pages/index.vue     the pinned stage with all sections
  components/
    sections/         one component per scene
    ui/               Reveal, RevealWords, SceneSection, Badge, ButtonLink, Icon
    ParticleCanvas.vue    runs the particle renderer every frame
    AppHeader.vue, ScrollRail.vue
  composables/        scroll progress, scene timing, narrow layout
  utils/              timeline (derived from scenes.ts), math helpers
  particles/          WebGL engine, no Vue: renderer, formations, camera, shaders
public/               favicon and the social preview image (og.png)
```
