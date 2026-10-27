export interface Principle {
  title: string;
  text: string;
}

export interface SkillGroup {
  name: string;
  /** The group as a code identifier, for the stack.ts editor. */
  key: string;
  items: string[];
}

export interface Feature {
  /** Small label above the title. */
  label: string;
  title: string;
  points: string[];
  /** The product it belongs to, shown at the bottom of the card. */
  project: string;
}

export const skills: SkillGroup[] = [
  { name: 'Languages', key: 'languages', items: ['TypeScript', 'JavaScript'] },
  { name: 'Frontend', key: 'frontend', items: ['Vue.js', 'Nuxt', 'React', 'Next.js', 'Tailwind'] },
  { name: 'Backend', key: 'backend', items: ['Node.js', 'Express', 'MongoDB', 'SQL', 'REST'] },
  {
    name: 'Real-time & state',
    key: 'realtime',
    items: ['WebSocket', 'WebRTC', 'Pinia', 'TanStack'],
  },
  {
    name: 'Testing & tools',
    key: 'tooling',
    items: ['Vitest', 'Cypress', 'Vite', 'Docker', 'Git'],
  },
  { name: 'AI', key: 'ai', items: ['Claude Code', 'Cursor', 'Claude API', 'AI\u00a0agents'] },
];

/** Things I built, one card each in the work carousel. */
export const features: Feature[] = [
  {
    label: 'Real-time',
    title: 'Live call control',
    points: [
      'Call state over WebSocket',
      'Telephony via WebRTC',
      'Built for all-day use by agents',
    ],
    project: 'Call center',
  },
  {
    label: 'Analytics',
    title: 'Team performance',
    points: ['Call history', 'Agent performance and leaderboards', 'Teams and permissions'],
    project: 'Call center',
  },
  {
    label: 'Builder',
    title: 'Visual page builder',
    points: ['Drag-and-drop blocks', 'Pages composed block by block', 'New pages without new code'],
    project: 'Site builder',
  },
  {
    label: 'CMS',
    title: 'No-dev publishing',
    points: [
      'Rich-text and visual modes',
      'Complete sites, start to finish',
      'Used by non-technical teams',
    ],
    project: 'Site builder',
  },
  {
    label: 'Lead capture',
    title: 'Branching lead forms',
    points: [
      'Quiz-style questions',
      'Logic that follows the answers',
      'A LiveChat step to follow up',
    ],
    project: 'Landing pages',
  },
  {
    label: 'Conversion',
    title: 'Checkout flows',
    points: [
      'From landing page to checkout',
      'Built to keep visitors moving',
      'Covered by Cypress tests',
    ],
    project: 'Landing pages',
  },
  {
    label: 'Research',
    title: 'Research agent',
    points: [
      'Reads sources on a schedule',
      'Filters and ranks by criteria',
      'Writes short summaries',
    ],
    project: 'AI agents',
  },
  {
    label: 'Dev workflow',
    title: 'Dev workflow agents',
    points: [
      'Reviews merge requests',
      'Turns tickets into implementation plans',
      'Built on Node and the Claude API',
    ],
    project: 'AI agents',
  },
];

/** How I work, shown above the work carousel. */
export const principles: Principle[] = [
  {
    title: 'Clear communication',
    text: 'I explain trade-offs early, so nobody is surprised at release.',
  },
  {
    title: 'Built to last',
    text: 'Typed, tested and readable, so the next change is as easy as the first.',
  },
  { title: 'Product first', text: 'I ask why before how, and ship what users actually need.' },
  {
    title: 'AI in the loop',
    text: 'AI speeds up research, debugging and tests. The judgment stays mine.',
  },
];

export const contact = {
  email: 'andrej_polujanskij@icloud.com',
  location: 'Vilnius, Lithuania',
  linkedin: 'https://linkedin.com/in/andrej-polujanskij',
};

/**
 * Brand color of each tool, shown when the tool is hovered in the stack.ts editor. Tools with a
 * black logo or no brand color are left out and glow white instead.
 */
export const brandColors: Record<string, string> = {
  TypeScript: '#4f9cf9',
  JavaScript: '#f7df1e',
  'Vue.js': '#42b883',
  Nuxt: '#00dc82',
  React: '#61dafb',
  Tailwind: '#38bdf8',
  'Node.js': '#6cc24a',
  MongoDB: '#00ed64',
  Pinia: '#ffd859',
  TanStack: '#ff4154',
  Vitest: '#fcc72b',
  Cypress: '#69d3a7',
  Vite: '#bd34fe',
  Docker: '#2496ed',
  Git: '#f05032',
  'Claude Code': '#ff7a2f',
  'Claude API': '#ff7a2f',
};
