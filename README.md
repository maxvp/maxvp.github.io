# maxvp.github.io

My personal portfolio website, found at [maxvphillips.com](https://www.maxvphillips.com/).

Plain HTML and CSS with no build step. The `site/` directory is deployed exactly as-is to Cloudflare Pages (build command: none, output directory: `site`).

```
projects/*.md          one file per project (source for the projects list)
scripts/               shell scripts for adding projects and rebuilding the list
site/
  index.html           home page
  projects/index.html  projects page (the list inside it is generated)
  style.css            all styles
  img/, fonts/         images and the self-hosted EB Garamond font
  projects/…/*.pdf     project files linked from the projects list
```

## Preview locally

```bash
python3 -m http.server --directory site 4321   # http://localhost:4321
```

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

That rewrites the list between the `BEGIN PROJECTS` and `END PROJECTS` comments in `site/projects/index.html`, newest first. Same-month entries are ordered by file name. Everything outside those comments is hand-edited as usual. Commit both the `.md` file and the updated page.

An entry file looks like this:

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
- `url` links the title (and thumbnail). `featured: true` shows the entry in the default view.
- `image` is an optional thumbnail (shown at 64×64), and `preview` is an optional larger image shown on hover. For example:

  ```bash
  sips -z 128 128 original.png --out site/img/projects/name.png
  sips -Z 800 original.png --out site/img/projects/name-large.png
  ```

- The body supports paragraphs, `- ` lists, links, `_emphasis_`, and `` `code` ``. Anything else appears as plain text.

## After a meaningful change

Update the "Last updated" date in the footer. It appears in both `site/index.html` and `site/projects/index.html`, and the two pages share the same `<head>` and footer, so keep them in sync.
