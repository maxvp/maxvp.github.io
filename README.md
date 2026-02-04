# maxvp.github.io

My personal portfolio website, found at [maxvphillips.com](https://www.maxvphillips.com/).

## Tech Stack

Built with [Astro](https://astro.build).

## Development

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Run development server**:
    ```bash
    npm run dev
    ```
    This will start the server at `http://localhost:4321`.

3.  **Build for production**:
    ```bash
    npm run build
    ```
    Output will be in the `dist/` directory.

## Managing Content

### Portfolio Items
Add new portfolio entries as Markdown files in `src/content/portfolio/`.
Frontmatter schema:
```yaml
---
title: "Project Title"
date: YYYY-MM
client: "Client Name" # Optional
clientUrl: "https://..." # Optional
url: "https://..." # Link to project
featured: false # Set to true to show in Featured tab
image: "/path/to/image.jpg" # Optional
imageAlt: "Description" # Optional
---
```

### Blog Posts
Add new blog posts in `src/content/blog/`.
Frontmatter schema:
```yaml
---
title: "Blog Post Title"
description: "Short description" # Optional
pubDate: "YYYY-MM-DD"
updatedDate: "YYYY-MM-DD" # Optional
heroImage: "/path/to/image.jpg" # Optional
---
```
