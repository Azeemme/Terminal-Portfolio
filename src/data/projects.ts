/**
 * Shared project data — Stage 2 finalized content.
 *
 * Content rules (see docs/portfolio-revamp-status.md → Stage 2 → verified-fact
 * decisions):
 * - Every field below is drawn from the approved Stage 2 design and/or the
 *   master resume. No invented metrics or outcomes.
 * - Optional fields that could not be verified are OMITTED, not faked, and are
 *   recorded in the status doc.
 * - `status` / `featured` are presentation logic only, not access control.
 */

export type ProjectStatus = 'public' | 'hidden' | 'coming-soon'

/** A structured metadata field — homepage 3-field grid, facts rail, system flow. */
export interface FactField {
  label: string
  value: string
  /** Render the value in the teal "reading" colour. */
  highlight?: boolean
}

export interface ProjectAction {
  label: string
  href: string
  kind: 'primary' | 'secondary' | 'ghost-teal'
  external: boolean
  /** Internal router link (renders <Link>); mutually exclusive with `external`. */
  internal?: boolean
}

export interface ProjectMedia {
  /** Path under /public. A labelled graph-paper placeholder shows until the file exists. */
  src: string
  alt: string
  /** CSS object-position for the capture crop. */
  objectPosition?: string
  /** Overlay caption on the capture panel (uppercase mono). */
  caption?: string
}

export interface CaseStudySection {
  heading: string
  body: string
}

export interface Project {
  slug: string
  /** Display index, e.g. "01". */
  index: string
  title: string
  /** e.g. "Mixed Reality", "Full-Stack · Infrastructure". */
  category: string
  /** Small chip beside the index, e.g. "Live demo". */
  tag?: string
  featured: boolean
  status: ProjectStatus

  /** One-line card summary. */
  cardSummary: string
  /** Fuller detail-page summary. */
  summary: string

  /** Homepage 3-field (or 2-field) grid. */
  facts: FactField[]
  /** Homepage technology chips. */
  technologies: string[]
  /** Homepage card actions. */
  actions: ProjectAction[]
  media: ProjectMedia

  /* ---- project detail ---- */
  /** Breadcrumb-strip external actions. */
  detailActions: ProjectAction[]
  /** Detail hero capture caption. */
  detailCaption?: string
  /** Facts rail fields. */
  detailFacts: FactField[]
  /** Facts rail technology chips. */
  detailTechnologies: string[]
  /** Prose sections (Archivo body copy). */
  sections: CaseStudySection[]
  /** Instrument-style system-flow strip (omit unknown stages). */
  systemFlow?: FactField[]
  /** Demo notice block (teal left border) — replaces the system-flow strip. */
  demoNotice?: string

  /** Demo needs a desktop keyboard/mouse; annotated differently on mobile (plan §6). */
  desktopOnlyDemo: boolean
  /** External demo URL. */
  demoUrl?: string
}

const DETAIL_LINK = (slug: string): ProjectAction => ({
  label: 'View Project →',
  href: `/projects/${slug}`,
  kind: 'secondary',
  external: false,
  internal: true,
})

export const projects: Project[] = [
  {
    slug: 'bioreactorxr',
    index: '01',
    title: 'BioreactorXR',
    category: 'Mixed Reality',
    tag: 'Live demo',
    featured: true,
    status: 'public',
    cardSummary: 'Multiplayer mixed-reality training on a life-size virtual bioreactor.',
    summary:
      'Multiplayer mixed-reality training on a life-size virtual bioreactor, with 35 interactive components and shared sessions.',
    facts: [
      { label: 'Platform', value: 'Quest 3' },
      { label: 'Components', value: '35', highlight: true },
      { label: 'Session', value: 'Multiplayer' },
    ],
    technologies: ['Unity', 'Netcode', 'Unity Relay', 'WebGL build'],
    actions: [
      {
        label: 'Try Live Demo ↗',
        href: 'https://bioreactorxr.azeemme.com',
        kind: 'primary',
        external: true,
      },
      DETAIL_LINK('bioreactorxr'),
    ],
    media: {
      src: '/projects/bioreactorxr.webp',
      alt: 'BioreactorXR — inspecting the peristaltic feed pumps on a life-size virtual bioreactor',
      objectPosition: 'center 42%',
      caption: 'Capture 01 · component inspection',
    },
    detailActions: [
      {
        label: 'Try Live Demo ↗',
        href: 'https://bioreactorxr.azeemme.com',
        kind: 'primary',
        external: true,
      },
    ],
    detailCaption: 'Capture 01 · component inspection, 1 of 35',
    detailFacts: [
      { label: 'Role', value: 'Undergrad Research Fellow' },
      { label: 'Since', value: 'May 2026', highlight: true },
      { label: 'Platform', value: 'Quest 3 · WebGL' },
      { label: 'Components', value: '35 interactive', highlight: true },
    ],
    detailTechnologies: ['Unity', 'Netcode', 'Unity Relay'],
    sections: [
      {
        heading: 'Context',
        body: 'Industrial bioreactors are expensive, scarce and hazardous to learn on. BioreactorXR puts a full-scale one in a headset so several people can walk around the same vessel, open panels and rehearse procedures together.',
      },
    ],
    demoNotice:
      'Runs in the browser at bioreactorxr.azeemme.com and opens in a new tab. Keyboard and mouse recommended — the headset build is not required to understand the project.',
    desktopOnlyDemo: true,
    demoUrl: 'https://bioreactorxr.azeemme.com',
  },

  {
    slug: 'off-grid-telemetry',
    index: '02',
    title: 'Off-Grid Telemetry Platform',
    category: 'Full-Stack · Infrastructure',
    featured: true,
    status: 'public',
    cardSummary:
      'Real-time monitoring and historical analytics for a solar-powered remote cabin.',
    summary:
      'Real-time monitoring and historical analytics for a solar-powered remote cabin in the Ozarks.',
    facts: [
      { label: 'Data', value: 'Live + Historical' },
      { label: 'Stack', value: 'PHP 8 · MySQL', highlight: true },
      { label: 'Deploy', value: 'Remote / Web' },
    ],
    technologies: ['PHP 8', 'MySQL', 'Chart.js', 'REST'],
    actions: [
      DETAIL_LINK('off-grid-telemetry'),
      {
        label: 'Live Dashboard ↗',
        href: 'https://ziae.net/app/dashboard-light.html',
        kind: 'ghost-teal',
        external: true,
      },
    ],
    media: {
      src: '/projects/offgrid-dashboard.webp',
      alt: 'Off-Grid Telemetry dashboard — live battery, solar and temperature readings',
      objectPosition: 'top center',
      caption: 'Live dashboard',
    },
    detailActions: [
      {
        label: 'Live Dashboard ↗',
        href: 'https://ziae.net/app/dashboard-light.html',
        kind: 'primary',
        external: true,
      },
    ],
    detailCaption: 'Capture 01 · live readings + battery banks',
    detailFacts: [
      { label: 'Hosting', value: 'Shared · FTP deploy' },
      { label: 'Build step', value: 'None', highlight: true },
    ],
    detailTechnologies: ['PHP 8', 'MySQL', 'Vanilla JS', 'Chart.js', 'Docker'],
    sections: [
      {
        heading: 'Context',
        body: 'The cabin runs entirely on solar, with no one on site most of the year. The platform pulls telemetry off the batteries and arrays, keeps the history, and puts current state and trends behind one dashboard you can check from anywhere.',
      },
    ],
    systemFlow: [
      { label: '01 Source', value: 'Solar cabin' },
      { label: '02 Store', value: 'MySQL', highlight: true },
      { label: '03 Serve', value: 'PHP 8 · 11 endpoints', highlight: true },
      { label: '04 Present', value: '6 pages · Chart.js', highlight: true },
    ],
    desktopOnlyDemo: false,
  },

  {
    slug: 'suits',
    index: '03',
    title: 'NASA SUITS',
    category: 'XR Systems · Leadership',
    featured: true,
    status: 'public',
    cardSummary:
      'VISOR — an astronaut-facing HoloLens 2 interface with a wrist-mounted display and a voice assistant, built to NASA mission requirements.',
    summary:
      'VISOR — an astronaut-facing HoloLens 2 interface with a wrist-mounted display and an on-device voice assistant, built to NASA SUITS mission requirements.',
    facts: [
      { label: 'Hardware', value: 'HoloLens 2 · Pi' },
      { label: 'Duration', value: '2025 – Present', highlight: true },
    ],
    technologies: ['HoloLens 2', 'Raspberry Pi', 'RAG', 'HW/SW integration'],
    actions: [DETAIL_LINK('suits')],
    media: {
      src: '/projects/suits-hardware.webp',
      alt: 'VISOR project poster — astronaut-interface architecture linking suit telemetry, mission control, a Raspberry Pi edge node and the HoloLens 2 headset, with a photo of the head-mounted and wrist-mounted displays worn',
      objectPosition: 'center 58%',
      caption: 'Astronaut interface — architecture + HMD/WMD',
    },
    detailActions: [],
    detailCaption: 'VISOR — astronaut interface architecture + HMD/WMD',
    detailFacts: [
      { label: 'Role', value: 'Team Lead' },
      { label: 'Since', value: 'Sep 2025', highlight: true },
      { label: 'Hardware', value: 'HoloLens 2 · Raspberry Pi 5' },
    ],
    detailTechnologies: ['HoloLens 2', 'Raspberry Pi 5', 'On-device LLM', 'HW/SW integration'],
    sections: [
      {
        heading: 'Context',
        body: "NASA's SUITS challenge asks student teams to design the astronaut-facing interface for an EVA — the displays, audio and guidance an astronaut would use during a spacewalk. VISOR is Purdue's entry: a HoloLens 2 heads-up interface backed by a wrist-mounted display and an on-device voice assistant.",
      },
      {
        heading: 'Contribution',
        body: 'As team lead I directed the system architecture and the on-site test week with NASA’s evaluators, co-authored the 40-plus-page technical proposal, and aligned the subteams on the data flow between the suit telemetry system, mission control, the Raspberry Pi edge node and the headset.',
      },
    ],
    systemFlow: [
      { label: '01 Suit telemetry', value: 'TSS' },
      { label: '02 Mission control', value: 'Ground station' },
      { label: '03 Edge node', value: 'Raspberry Pi 5', highlight: true },
      { label: '04 Display', value: 'HoloLens 2', highlight: true },
    ],
    desktopOnlyDemo: false,
  },
]

/**
 * Standalone literal (not `projects.map(...)`) so route parsing can import just
 * the slug list without pulling the full project prose into the entry bundle.
 * `data.test.ts` asserts this stays in sync with `projects`.
 */
export const projectSlugs = ['bioreactorxr', 'off-grid-telemetry', 'suits'] as const

/**
 * Slug → display title. A tiny standalone map so `DocumentTitle` / route parsing
 * can label a project route without importing the full case-study prose.
 * `data.test.ts` asserts it stays in sync with `projects`.
 */
export const projectTitles: Record<string, string> = {
  bioreactorxr: 'BioreactorXR',
  'off-grid-telemetry': 'Off-Grid Telemetry Platform',
  suits: 'NASA SUITS',
}

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}

/** Projects visible in listings. `hidden` is presentation-only filtering. */
export function visibleProjects(): Project[] {
  return projects.filter((p) => p.status !== 'hidden')
}

export function featuredProjects(): Project[] {
  return visibleProjects().filter((p) => p.featured)
}
