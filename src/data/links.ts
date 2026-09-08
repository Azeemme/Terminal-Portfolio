/**
 * Shared contact / external links. Single source of truth for Portfolio,
 * Terminal (`social`, `contact`, `open …`), the dock Resume action, and /hi.
 */

import type { ProfileLink } from './profile'

export const GITHUB_USERNAME = 'Azeemme'

/** Static resume asset. Never routed; opened directly in a new tab (plan §7). */
export const RESUME_PATH = '/Resume.pdf'

export const links = {
  github: {
    label: 'GitHub',
    href: `https://github.com/${GITHUB_USERNAME}`,
    external: true,
  },
  linkedin: {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/azeemehtisham/',
    external: true,
  },
  email: {
    label: 'Email',
    href: 'mailto:azeemmehtisham@gmail.com',
    external: true,
  },
  photography: {
    label: 'Photography',
    href: 'https://ehtishamphoto.pixieset.com',
    external: true,
  },
  resume: {
    label: 'Resume',
    href: RESUME_PATH,
    external: true,
  },
} as const satisfies Record<string, ProfileLink>

export const EMAIL_ADDRESS = 'azeemmehtisham@gmail.com'

/** Ordered list for compact contact rows. */
export const contactLinks: ProfileLink[] = [
  links.github,
  links.linkedin,
  links.email,
  links.photography,
]
