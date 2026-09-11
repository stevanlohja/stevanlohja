# stevanlohja

Live at <https://stevanlohja.github.io/stevanlohja/>.

Personal portfolio site. Static HTML, CSS and JavaScript. No framework, no build step, no
dependencies to install, no tracking.

Seven sections, ordered so the site serves a developer-relations reader and an
infrastructure/SRE reader equally:

| # | Section | What it carries |
|---|---------|-----------------|
| 01 | What I do | Four function panels (dev rel, solutions engineering, protocol ops & SRE, automation) plus the throughline |
| 02 | Developer relations | Community, Contributor Hub, onboarding, documentation, events, ecosystem comms & standards |
| 03 | Partners I enabled | The ten publicly announced partners |
| 04 | Operator enablement | The operations half of the partner work |
| 05 | Projects | Nine engineering projects, filterable |
| 06 | Experience | Timeline |
| 07 | Skills & standards work | Toolkit, governance, education |

```
.
├── index.html      single page, all content
├── css/styles.css  design tokens + layout (light and dark)
├── js/main.js      progressive enhancement only
├── assets/
│   ├── Stevan-Lohja-Resume.pdf
│   └── stevan-lohja.jpg    portrait, 399x399, 24 KB
├── .nojekyll       serve _-prefixed paths on GitHub Pages
└── README.md
```

## Run it locally

Open `index.html` directly, or serve it:

```bash
python3 -m http.server 8000    # then http://localhost:8000
```

## Deploy to GitHub Pages

```bash
cd ~/Code/stevanlohja.com
git init -b main
git add .
git commit -m "Portfolio site"
gh repo create stevanlohja.com --public --source=. --push
```

Then in the repo: **Settings → Pages → Source: Deploy from a branch → `main` / root**.
For the apex domain, add a `CNAME` file containing `stevanlohja.com` and point DNS at
GitHub's Pages IPs. Any static host works equally well (Netlify, Cloudflare Pages, S3).

## The portrait

`assets/stevan-lohja.jpg` is **self-hosted, not hotlinked** from `pbs.twimg.com` — that CDN path
contains a mutable image id and will break the moment the profile photo changes. It appears in
three places: the hero (a circle that scales from 104px on a phone to 300px on a wide desktop),
the nav brand at 24px (it replaced the green status dot), and as the `og:image` / `twitter:image`
for link previews.

Two details worth preserving:

- `object-position: 50% 44%` lifts the face slightly into the circle, so the crop does not favour
  the shoulders.
- The portrait is **first in the DOM** inside `.hero__top`, with explicit `grid-column` placement
  moving it to the right at 940px and up. That gives the face-first reading order on a phone with
  no `order` hack, and keeps screen-reader order sensible.

To swap the photo, replace the file and keep the name — nothing else needs to change. The
`og:image` URLs are absolute and point at `https://stevanlohja.github.io/stevanlohja/`.

## Content sources

Copy is derived from `FNO_OPS/projects/job-search/resume.md` and the public résumé variant.
Keep the two in sync when either changes.

Partner cards are built from the ten official Midnight announcement posts, with text and dates
verified through the public `publish.twitter.com/oembed` endpoint. To add a partner, copy an
existing `<article class="pcard">` block, set `data-cat`, and update the count in the matching
filter chip.

The developer-relations cards and the project cards both use `.jcard`, distinguished only by the
grid they sit in. **The filters are scoped to `#pgrid` and `#jgrid` on purpose** — an unscoped
`.jcard` selector would make the project filter hide the developer-relations cards too. Keep that
scoping if you touch `wireFilter` in `js/main.js`.

## The naming rule this site follows

Every organisation named on this site is named **only because Midnight publicly announced the
relationship itself**, and every card links to that announcement. This mirrors the rule in
`FNO_OPS/projects/alerting-agent/archive/public-demo-script-2026-08-26.md`: no operator, partner
or entity name from the fleet on a public surface unless it is already public.

Deliberately absent, and it should stay that way:

- Operator-identifying performance, availability or SLA data
- Contract terms, compensation, or anything derived from the executed agreements
- Incident specifics tied to a named operator
- Internal repository, cloud project, VM, channel or secret resource names
- Colleague names and contact details; the L1 support vendor's name
- The telemetry endpoint hostname, webhook URLs, genesis hash, internal OKR identifiers

Before publishing a change, re-read the do-not-say list in that demo script.

## Notes on the JavaScript

Everything degrades. With JS disabled you still get all ten partner cards with their quotes and
announcement links, all nine project cards, and full navigation — only filtering, the theme
toggle and the inline post embeds are lost.

- **Theme** is set before first paint by a small inline script in `<head>`, so there is no flash.
  Stored choice wins; otherwise it follows the OS.
- **Post embeds** are lazy. `platform.twitter.com/widgets.js` loads on the first "Show post"
  click, never on page load. If the widget does not become visible within a few seconds — the
  visitor blocks third-party frames, the post was removed, the network is slow — the card shows a
  link to the announcement instead of sitting silently empty. Verify this path stays working
  after any change to the embed code.
- **Filter chip counts are hardcoded** in `index.html`. If you add or remove a card, update the
  `<span class="n">` value on the matching chip.
- **Two CSS specificity traps** worth remembering, both already fixed: `.fn p` beats a bare
  `.fn__k`, so the key line is pinned with `margin-top: auto` on `.fn p.fn__k`; and the hero role
  segments need real whitespace between them, because `white-space: nowrap` runs with no space
  between them give the browser no break opportunity and overflow the viewport.

## Verified during the build

- HTML: no unclosed or mismatched tags; no broken in-page anchors
- All ten tweet IDs resolve (HTTP 200) and are authored by `@MidnightNtwrk` / `@midnightfdn`
- Filter counts match the actual cards (partners 6/3/1/10, projects 3/4/5/2/9)
- Neither filter touches the six developer-relations cards (verified 6/6 visible across every
  filter state)
- Theme toggle round-trips and persists; all eight metric tiles render prefixes and suffixes
- Function-panel key lines sit flush on the card bottom in both rows
- Zero horizontal overflow at 320, 360, 390, 414, 768 and 1024px (re-checked after the portrait)
- Portrait renders in both themes; on a phone it sits above the name, on desktop to its right
