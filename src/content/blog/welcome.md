---
title: 'Welcome to my new blog!'
description: 'Reflections on migrating my portfolio to Astro.'
pubDate: '2026-02-04'
heroImage: '/mugi.jpg'
---

Hello world! This is my first blog post on my newly migrated site. 

## Why Astro?

I decided to migrate to [Astro](https://astro.build) because I wanted a lightweight, content-focused framework that allows me to write posts in Markdown/MDX easily.

### The Process

The migration involved:
1. Moving my existing portfolio content to Content Collections.
2. Replicating my custom build scripts with Astro's native data fetching.
3. preserving the exact style of my previous site.

Now I can just add a `.md` file to `src/content/blog` and it appears here!

```javascript
console.log("Hello Astro!");
```
