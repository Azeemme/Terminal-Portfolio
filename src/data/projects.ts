/**
 * Shared project data.
 *
 * Stage 1 rules:
 * - Every project below is a PLACEHOLDER. Finalized copy, media, links, metrics,
 *   and outcomes are added in Stage 2 (plan Stage 2 §3).
 * - Do not invent metrics or outcomes. Summaries and technology lists here are
 *   drawn only from the approved implementation plan.
 * - `status` / `featured` are presentation logic only. Client-bundled data is
 *   NOT an access-control mechanism — never put confidential content here.
 */

export type ProjectStatus = 'public' | 'hidden' | 'coming-soon'

export interface ProjectLink {
  label: string
  href: string
  external: boolean
}

export interface CaseStudySection {
  heading: string
  /** Placeholder-friendly prose. Replaced with real case-study copy in Stage 2. */
  body: string
}

export interface ProjectMedia {
  kind: 'image' | 'video' | 'placeholder'
  /** Omitted for `kind: 'placeholder'`. */
  src?: string
  /** Required for a11y even on placeholder blocks. */
  alt: string
  poster?: string
}

export interface Project {
  slug: string
  title: string
  category: string
  summary: string
  featured: boolean
  status: ProjectStatus
  role: string
  /** Human-readable date or range. */
  date: string
  technologies: string[]
  sections: CaseStudySection[]
  links: ProjectLink[]
  media: ProjectMedia[]
  /** Demo needs desktop keyboard/mouse; annotated differently on mobile (plan §6). */
  desktopOnlyDemo: boolean
  /** External demo URL. Labelled "Desktop Demo" in the UI (plan §6). */
  demoUrl?: string
  /** `true` while finalized content/media is pending (Stage 2). */
  placeholder: boolean
}

const PLACEHOLDER_SECTIONS: CaseStudySection[] = [
  {
    heading: 'Overview',
    body: 'Placeholder — a finalized case study (context, contribution, technical approach, challenges, and results) is added in Stage 2.',
  },
]

export const projects: Project[] = [
  {
    slug: 'bioreactorxr',
    title: 'BioreactorXR',
    category: 'Mixed Reality',
    summary:
      'Multiplayer mixed-reality education and training around a life-size virtual bioreactor with shared sessions.',
    featured: true,
    status: 'public',
    role: 'Placeholder — finalized in Stage 2',
    date: 'Placeholder',
    technologies: ['Unity', 'Meta Quest 3', 'Unity Relay', 'Netcode for GameObjects'],
    sections: PLACEHOLDER_SECTIONS,
    links: [],
    media: [
      { kind: 'placeholder', alt: 'BioreactorXR media placeholder — added in Stage 2' },
    ],
    desktopOnlyDemo: true,
    demoUrl: undefined,
    placeholder: true,
  },
  {
    slug: 'suits',
    title: 'NASA SUITS',
    category: 'Systems / XR',
    summary:
      'NASA Spacesuit User Interface Technologies challenge — systems design and hardware/software integration for an HMD and rover mission workflow.',
    featured: true,
    status: 'public',
    role: 'Placeholder — finalized in Stage 2',
    date: 'Placeholder',
    technologies: ['Placeholder — finalized in Stage 2'],
    sections: PLACEHOLDER_SECTIONS,
    links: [],
    media: [
      { kind: 'placeholder', alt: 'NASA SUITS media placeholder — added in Stage 2' },
    ],
    desktopOnlyDemo: false,
    placeholder: true,
  },
  {
    slug: 'stylegentsia',
    title: 'Stylegentsia',
    category: 'Software / Systems',
    summary:
      'Placeholder — a complementary software/systems project. Final selection and content confirmed in Stage 2 (plan Stage 2 §3).',
    featured: true,
    status: 'coming-soon',
    role: 'Placeholder — finalized in Stage 2',
    date: 'Placeholder',
    technologies: ['Placeholder — finalized in Stage 2'],
    sections: PLACEHOLDER_SECTIONS,
    links: [],
    media: [
      { kind: 'placeholder', alt: 'Project media placeholder — added in Stage 2' },
    ],
    desktopOnlyDemo: false,
    placeholder: true,
  },
]

export const projectSlugs: readonly string[] = projects.map((p) => p.slug)

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
