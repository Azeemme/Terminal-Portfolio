/**
 * Shared profile data. Consumed by Portfolio, Terminal, mobile presentation,
 * routing metadata, and /hi.
 *
 * Stage 1 keeps only facts that already existed in the repository
 * (see `src/terminal/filesystem/fakeFiles.ts` history). Finalized copy is a
 * Stage 2 concern — do not invent metrics, outcomes, or experience here.
 */

export interface ProfileLink {
  label: string
  href: string
  /** External links open in a new tab and are labelled as such for a11y. */
  external: boolean
}

export interface Profile {
  name: string
  /** Primary positioning line (plan §9). */
  title: string
  /** Secondary positioning line (plan §9). */
  tagline: string
  education: string
  /** Short introduction. Placeholder copy is replaced in Stage 2. */
  intro: string
  /** Longer "About" copy. Placeholder copy is replaced in Stage 2. */
  about: string
  location: string
  /** Headline focus areas (from the plan §9 positioning line — not an invented skill list). */
  focusAreas: string[]
}

export const profile: Profile = {
  name: 'Azeem Ehtisham',
  title: 'Software & Systems Engineer',
  tagline: 'XR | Full-Stack | Infrastructure',
  education: 'Purdue University — Computer Information Technology',
  intro:
    "I build XR experiences, full-stack applications, and reliable infrastructure. " +
    "Currently leading a 12-person research team for the U.S. Space Force through " +
    "Purdue's Data Mine program.",
  about:
    "I'm a Software & Systems Engineer studying Computer Information Technology at " +
    "Purdue University. My work spans mixed-reality applications, full-stack product " +
    "development, and infrastructure. I currently lead a 12-person research team for " +
    "the U.S. Space Force through Purdue's Data Mine program.",
  location: 'West Lafayette, Indiana',
  focusAreas: ['XR', 'Full-Stack', 'Infrastructure'],
}
