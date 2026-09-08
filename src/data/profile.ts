/**
 * Shared profile data — Stage 2 finalized copy (approved Stage 2 design).
 * Consumed by Portfolio, Terminal, the mobile presentation, routing metadata,
 * and `/hi`.
 */

export interface ProfileLink {
  label: string
  href: string
  /** External links open in a new tab and are labelled as such for a11y. */
  external: boolean
}

export interface Profile {
  name: string
  /** Primary positioning line. */
  title: string
  /** Secondary positioning line (mono, uppercase). */
  tagline: string
  focusAreas: string[]
  education: string
  /** Short introduction (hero). */
  intro: string
  /** Short "About" copy. */
  about: string
  location: string
  /** Right-side profile "facts" panel. */
  facts: {
    school: string
    based: string
    /** Current engagement — must stay accurate to today's date. */
    now: { role: string; org: string }
  }
}

export const profile: Profile = {
  name: 'Azeem Ehtisham',
  title: 'Software & Systems Engineer',
  tagline: 'XR · Full-Stack · Infrastructure',
  focusAreas: ['XR', 'Full-Stack', 'Infrastructure'],
  education: 'Purdue University — Computer Information Technology',
  intro:
    'I build mixed-reality training software, full-stack telemetry systems, and the ' +
    'infrastructure that keeps them running — from Quest headsets to a solar-powered ' +
    'cabin in the Ozarks.',
  about:
    'Computer Information Technology at Purdue. My work spans mixed-reality applications, ' +
    'full-stack product development, and infrastructure — usually where software has to ' +
    'meet real hardware.',
  location: 'West Lafayette, Indiana',
  facts: {
    school: 'Purdue University — Computer Information Technology',
    based: 'West Lafayette, Indiana',
    now: {
      role: 'Undergraduate Research Fellow',
      org: 'Purdue SURF · OUR Scholars Program',
    },
  },
}
