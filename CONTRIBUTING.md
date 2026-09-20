# Contributing

Thanks for helping improve the VISI website.

## Pull request expectations

- Keep PRs small and focused.
- Include a clear title and a short description of what changed and why.
- Run `npm run build` and `npm run lint` before pushing.
- If you add images, check that they render on the site.

## Adding a post

Posts live in `content/blogs/`. One folder per post, holding the MDX and the cover
image:

```
content/blogs/my-workshop-recap/
├── index.mdx
└── cover.jpg
```

The frontmatter format is documented in the README. The short version:

```mdx
---
title: "My workshop recap"
description: "What the session covered."
image: cover.jpg
publishedAt: 2026-10-01 18:00:00
updatedAt: 2026-10-01 18:00:00
author: "Your Name"
isPublished: true
tags:
- workshops
slug: my-workshop-recap
---
```

`slug` must match the folder name. Run `npm run dev` and open the post to check it
before opening a PR — a missing image or a malformed date fails the content build
with a message pointing at the file.

Use existing tags where one fits, so the category pages stay useful. Set
`isPublished: false` if you want to merge a draft without publishing it.

## Adding an event, member, or partner

All of it lives in `src/utils/siteContent.js` — add an entry to `EVENTS`, `MEMBERS`,
`PARTNERS`, `WORK_ITEMS`, or `RESOURCES` and the matching page picks it up.

Events use ISO dates (`"2026-10-14"`), which is what sorts them into upcoming
versus past. Flyers go in `public/events/` and are referenced as
`imageSrc: "/events/your-flyer.png"`; a portrait flyer is fine, since the cards
fit the whole image rather than cropping it.

## Changing the site itself

- Pages: `src/app/`
- Components: `src/components/`
- Club name, links, and email: `src/utils/siteMetaData.js`
- Events, members, partners, work, resources: `src/utils/siteContent.js`
- Colors and fonts: the `@theme` block in `src/app/globals.css`
