/**
 * Shared experience data — Stage 2. Compressed on purpose; the full history
 * lives in the résumé. Every entry is verified against `master_resume.typ`.
 */

export interface ExperienceEntry {
  id: string
  role: string
  organization: string
  /** Human-readable start, e.g. "May 2026". */
  start: string
  /** Human-readable end, or `null` when ongoing. */
  end: string | null
  summary: string
  current: boolean
}

export const experience: ExperienceEntry[] = [
  {
    id: 'datamine-ussf',
    role: 'Team Lead / Scrum Master',
    organization: 'The Data Mine · U.S. Space Force',
    start: 'Jan 2026',
    end: 'Jul 2026',
    summary:
      'Directed a 12-person team delivering a resilient cyber-defense ecosystem across three research workstreams.',
    current: false,
  },
  {
    id: 'surf-bioreactorxr',
    role: 'Undergraduate Research Fellow',
    organization: 'Purdue SURF · OUR Scholars Program',
    start: 'May 2026',
    end: null,
    summary: 'Building the BioreactorXR mixed-reality training application.',
    current: true,
  },
  {
    id: 'brand-studio-photo',
    role: 'Boiler Ambassador Photographer',
    organization: 'Purdue University · Brand Studio',
    start: 'Oct 2024',
    end: null,
    summary: 'Event photography for Purdue Marketing and Student Life.',
    current: true,
  },
]
