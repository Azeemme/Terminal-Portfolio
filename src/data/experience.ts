/**
 * Shared experience data. Stage 1 seeds only the one role documented in the
 * repository; finalized history, dates, and bullet points are a Stage 2 task.
 * Do not invent roles, dates, or outcomes.
 */

export interface ExperienceEntry {
  id: string
  role: string
  organization: string
  /** Human-readable date range. `null` end means current. */
  start: string | null
  end: string | null
  summary: string
  /** `true` while finalized copy/dates are pending (Stage 2). */
  placeholder: boolean
}

export const experience: ExperienceEntry[] = [
  {
    id: 'datamine-space-force',
    role: 'Research Team Lead',
    organization: "U.S. Space Force — Purdue Data Mine",
    start: null,
    end: null,
    summary:
      'Leads a 12-person research team for the U.S. Space Force through Purdue University’s Data Mine program.',
    placeholder: true,
  },
]
