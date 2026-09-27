# maxvp.github.io

My personal portfolio website, found at [maxvphillips.com](https://www.maxvphillips.com/).

Plain HTML and CSS with no framework, no package manager, and no build step for deploys. The only tooling is two POSIX shell scripts for adding entries to the projects list.

```
projects/*.md            one file per project (source for the projects list)
scripts/
  new-project.sh         creates a new projects/*.md entry
  build-projects.sh      regenerates the list in site/projects/index.html
  project.awk            renders one entry as HTML (used by build-projects.sh)
site/                    deployed exactly as-is
  index.html             home page (hand-edited)
  projects/index.html    projects page (the list inside it is generated)
  projects/…/*.pdf       project files linked from the projects list
  style.css              all styles; colors and fonts are at the top
  img/                   headshot and project thumbnails (webp)
  fonts/                 self-hosted EB Garamond (latin subset)
  _redirects             Cloudflare Pages redirects (old /archive and /blog URLs)
  sitemap.xml            hand-maintained; add a URL if you add a page
```

## Preview locally

The pages use root-relative paths (`/style.css`), so serve `site/` rather than opening the files directly:

```bash
python3 -m http.server --directory site 4321   # http://localhost:4321
```

Refresh the browser after each change.

## Edit the site

- **Home page:** edit `site/index.html` directly.
- **Styles:** everything is in `site/style.css`. The colors (`--background-color`, `--text-color` and `--border-color`) and font stacks are at the top. The serif is EB Garamond, and the sans and mono fonts use system fonts.
- **Header and footer:** `site/index.html` and `site/projects/index.html` share the same `<head>` and footer, so change both.

## Add a project

The scripts only need `sh`, `awk`, `sed` and `sort`, so they work on any macOS or Linux machine.

```bash
scripts/new-project.sh "Project title"            # dated this month
scripts/new-project.sh "Project title" 2024-05    # or a specific YYYY-MM
```

This creates `projects/YYYY-MM-project-title.md`. If `$EDITOR` is set, it opens the file and rebuilds the page when you close the editor. Otherwise, edit the file and run:

```bash
scripts/build-projects.sh
```

That rewrites the list between the `BEGIN PROJECTS` and `END PROJECTS` comments in `site/projects/index.html`, newest first. Same-month entries are ordered by file name. Don't edit between those comments by hand; everything outside them is normal HTML. If an entry is invalid, the script stops with an error and leaves the page untouched.

Commit both the `.md` file and the updated page.

To edit or remove an existing project, change or delete its file in `projects/` and run `scripts/build-projects.sh`.

### Entry format

```markdown
---
title: Frameflow AI screenshot tool
date: 2025-12
client: Cloudflare
url: https://example.com/project
featured: true
image: /img/projects/frameflow.webp
preview: /img/projects/frameflow-large.webp
alt:
---

One or two sentences about the project, with [links](https://example.com),
_emphasis_ and `code`.

- Lists work too.
```

- `title` and `date` (`YYYY-MM`) are required. Leave any other field empty to omit it.
- `client` appears as the subtitle. `url` links the title and thumbnail.
- `featured: true` includes the entry in the default "featured" view.
- `image` is an optional thumbnail (shown at 64×64), `preview` is an optional larger image shown on hover, and `alt` is the thumbnail's alt text.
- The body supports paragraphs, `- ` lists, `[links](url)`, `_emphasis_` or `*emphasis*`, and `` `code` ``. Anything else appears as plain text.
- Use plain ASCII quotes and apostrophes (`'` and `"`), not curly ones.

### Images

Thumbnails go in `site/img/projects/`. Any web format works; the existing ones are webp. Make a 128×128 thumbnail and, optionally, an 800px preview:

```bash
# macOS
sips -z 128 128 original.png --out site/img/projects/name.png
sips -Z 800 original.png --out site/img/projects/name-large.png

# Linux (ImageMagick 7; on ImageMagick 6, use `convert` instead of `magick`)
magick original.png -resize 128x128^ -gravity center -extent 128x128 site/img/projects/name.png
magick original.png -resize 800x800 site/img/projects/name-large.png
```

## Deploy

The site is hosted on Cloudflare Pages, connected to this GitHub repo. Pushing to `main` deploys to production, and other branches get preview URLs.

Pages build settings:

| Setting | Value |
| --- | --- |
| Framework preset | None |
| Build command | *(empty)* |
| Build output directory | `site` |

Before pushing a meaningful change, update the "Last updated" date in the footer of both `site/index.html` and `site/projects/index.html` (format: `Sep 27, 2026`).
