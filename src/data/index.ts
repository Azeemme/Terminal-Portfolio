/** Shared data layer — single source of truth for Portfolio, Terminal, routing, and /hi. */

export type { Profile, ProfileLink } from './profile'
export { profile } from './profile'

export type {
  Project,
  ProjectStatus,
  ProjectLink,
  ProjectMedia,
  CaseStudySection,
} from './projects'
export {
  projects,
  projectSlugs,
  getProject,
  visibleProjects,
  featuredProjects,
} from './projects'

export type { ExperienceEntry } from './experience'
export { experience } from './experience'

export {
  links,
  contactLinks,
  GITHUB_USERNAME,
  EMAIL_ADDRESS,
  RESUME_PATH,
} from './links'
