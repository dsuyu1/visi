# VISI website

The website for the Vaquero Information Security Initiative, a student organization
at the University of Texas Rio Grande Valley.

Built on [Nextjs-tailwindcss-blog-template](https://github.com/codebucks27/Nextjs-tailwindcss-blog-template)
by CodeBucks (MIT, see `LICENSE-template`), with VISI branding and content.

## Stack

- Next.js 16 (App Router, Turbopack) and React 19
- Tailwind CSS v4 — configured in CSS, in `src/app/globals.css` under `@theme`
- [Velite](https://velite.js.org/) turns the MDX in `content/blogs` into typed data
- `next-sitemap` writes `sitemap.xml` and `robots.txt` after every build

## Running it

```bash
npm install
npm run dev     # http://localhost:3000
```

`npm run dev` and `npm run build` run `velite build --clean` first, which compiles
the posts into `.velite/` and copies post images into `public/blogs/`.

Other scripts:

```bash
npm run build          # production build + sitemap
npm run start          # serve the production build
npm run lint           # eslint
npm run content:watch  # rebuild content on change
```

## Writing a post

Each post is a folder under `content/blogs/` holding an `index.mdx` and its cover
image. Create `content/blogs/your-post-slug/index.mdx`:

```mdx
---
title: "Your title"
description: "One or two sentences — this shows up on cards and in search results."
image: cover.jpg
publishedAt: 2026-10-01 18:00:00
updatedAt: 2026-10-01 18:00:00
author: "VISI"
isPublished: true
tags:
- workshops
- ctf
slug: your-post-slug
---

Body goes here. Markdown, plus code blocks with syntax highlighting.
```

Notes:

- `slug` has to match the folder name, and `image` is a file in that same folder.
- The first tag is the one shown on cards, and every tag becomes a category page
  at `/categories/<tag>`.
- Set `isPublished: false` to keep a draft out of the build.
- The home page shows the newest post as the hero, the next three as featured, and
  the six after that as recent — so it reads best with at least ten posts.

**The posts currently in `content/blogs/` are placeholders.** Replace them as real
writeups come in.

## Branding

- Logo: `public/logo.png`. The favicons, apple icon, and social banner are generated
  from it, so regenerate those if it changes.
- Name, description, email, social links, and site URL: `src/utils/siteMetaData.js`.
- Colors: the `@theme` block in `src/app/globals.css` — `--color-accent` (light mode),
  `--color-accentDark` (dark mode), and `--color-dark`, taken from the logo.

## Still to do

- `siteUrl` in `src/utils/siteMetaData.js` is a placeholder. It feeds the sitemap and
  the Open Graph tags, so set it to the real domain before launch.
- The contact form and the footer's email signup are the template's — they validate
  input but don't send anything yet. Both are marked with a TODO.
- View counts on posts are optional. They stay hidden unless you add the Supabase
  keys from `.env.example` to `.env.local`.
