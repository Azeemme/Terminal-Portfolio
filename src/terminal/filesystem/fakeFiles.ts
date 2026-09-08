import type { DirEntry } from "../types";
import { profile } from "../../data/profile";
import {
  links,
  contactLinks,
  GITHUB_USERNAME as DATA_GITHUB_USERNAME,
  EMAIL_ADDRESS as DATA_EMAIL_ADDRESS,
  RESUME_PATH,
} from "../../data/links";

/**
 * Terminal-shaped view of the shared data layer (`src/data`). The terminal
 * commands and boot sequence import their constants from here so there is a
 * single source of truth with Portfolio and `/hi` (plan §9).
 */

export const RESUME_URL = RESUME_PATH;

// Also available via import.meta.env.VITE_GITHUB_USERNAME (see Terminal context).
export const GITHUB_USERNAME = DATA_GITHUB_USERNAME;

export const LINKEDIN_URL = links.linkedin.href;
export const EMAIL_ADDRESS = DATA_EMAIL_ADDRESS;
export const PORTFOLIO_PHOTO_URL = links.photography.href;
export const GITHUB_URL = links.github.href;

export const PORTFOLIO_REPO_NAME = "Terminal-Portfolio";
export const PORTFOLIO_OWNER = GITHUB_USERNAME;

/** Positioning line — plan §9. */
export const POSITIONING_TITLE = profile.title;
export const POSITIONING_TAGLINE = profile.tagline;

export const WHOAMI_CONTENT = [
  profile.name,
  `${profile.title} — ${profile.tagline}`,
  "",
  profile.intro,
  "",
  profile.education,
].join("\n");

export const CONTACT_CONTENT = contactLinks
  .map((link) => {
    const value = link.href.startsWith("mailto:") ? link.href.slice("mailto:".length) : link.href;
    return `${link.label.padEnd(10)}${value}`;
  })
  .join("\n");

export const FAKE_FILES: DirEntry[] = [
  { name: "whoami.txt", type: "file", sha: "fake-whoami", isFake: true },
  { name: "contact.txt", type: "file", sha: "fake-contact", isFake: true },
  { name: "resume.pdf", type: "file", sha: "fake-resume", isFake: true },
];

export function getFakeFileContent(filename: string): string | null {
  switch (filename) {
    case "whoami.txt":
      return WHOAMI_CONTENT;
    case "contact.txt":
      return CONTACT_CONTENT;
    default:
      return null;
  }
}
