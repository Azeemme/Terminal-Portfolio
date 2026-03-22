import type { DirEntry } from "../types";

// TODO: Replace with real resume URL before deploy
export const RESUME_URL = "/Resume.pdf";

export const GITHUB_USERNAME = "Azeemme"; // also available via import.meta.env.VITE_GITHUB_USERNAME

export const LINKEDIN_URL = "https://www.linkedin.com/in/azeemehtisham/";
export const EMAIL_ADDRESS = "azeemmehtisham@gmail.com";
export const PORTFOLIO_PHOTO_URL = "https://ehtishamphoto.pixieset.com";

export const PORTFOLIO_REPO_NAME = "Terminal-Portfolio";
export const PORTFOLIO_OWNER = "Azeemme";

export const WHOAMI_CONTENT = `Hi, I'm Azeem Ehtisham — a software engineer with a passion for
building things that sit at the intersection of technology and
creativity. I work across full-stack web, mobile AR, and systems
programming. Currently exploring creative tech, spatial computing,
and whatever problem seems most interesting this week.`;

export const CONTACT_CONTENT = `Email:    azeemmehtisham@gmail.com
GitHub:   https://github.com/Azeemme
LinkedIn: https://www.linkedin.com/in/azeemehtisham/
Photo:    https://ehtishamphoto.pixieset.com`;

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
