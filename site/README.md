# azeemme.com — deploy package

Portfolio for Azeem Ehtisham. This folder is a **finished static site**: no build step, no dependencies to install. Deploy it as-is.

## Files
- `index.html` — the whole site (markup + logic in one file)
- `support.js` — runtime the page needs; must sit next to `index.html`
- `water-bg.js` — WebGL water-ripple background, loaded by `index.html` via relative `import()`
- `assets/` — all images the site references (17 files)
- `Resume.pdf` — **not included**; the site links to `https://azeemme.com/Resume.pdf`, so place it at the site root

## Deploy (for Claude Code)
1. Put this folder's contents at the root of the hosting target (GitHub Pages, Netlify, Vercel, Cloudflare Pages — any static host).
2. Add `Resume.pdf` at the root.
3. Serve over HTTP(S). Do not open via `file://` — the relative `import()` of `water-bg.js` needs a server. Local test: `npx serve .` or `python3 -m http.server`.
4. Point the domain `azeemme.com` at the host (the page's `og:url` / `og:image` use `https://azeemme.com/`).

Do not rewrite, minify, or port the code to a framework unless asked — it is final.

## External requests
- Google Fonts (Archivo) from `fonts.googleapis.com`
- No other third-party scripts

## Checks after deploy
- Landing screen ("WHO ARE YOU?") shows a busy animated water ripple; choosing either option eases it into a quiet, sparse version.
- `https://azeemme.com/#hiring`, `#builder`, `#researcher`, `#suits`, `#bxr` deep-link into the site.
- All images load (check the browser console for 404s under `/assets/`).
- Social preview image: `https://azeemme.com/assets/suits-hololens-test.jpg`.
