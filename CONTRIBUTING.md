# Contributing

Thanks for helping improve the VISI website.

## Pull request expectations

- Keep PRs small and focused.
- Include a clear title and a short description of what changed and why.
- If you add images, ensure they render correctly on the site.

## Adding / updating members

Member data lives in:

`src/lib/content.ts`

Look for:

`export const MEMBERS: Member[] = [...]`

Each member entry supports:

- `name` (required)
- `role` (required)
- `focus` (optional)
- `avatarUrl` (optional) — a path to an image in `public/`

### 1) Add your profile picture (optional)

Put your image in:

`public/members/`

Example:

`public/members/jane-doe.jpg`

Then reference it like:

`avatarUrl: "/members/jane-doe.jpg"`

### 2) Add yourself to `MEMBERS`

Add a new object to the array:

```ts
export const MEMBERS: Member[] = [
  {
    name: "Jane Doe",
    role: "Researcher",
    focus: "Threat intel",
    avatarUrl: "/members/jane-doe.jpg",
  },
];
```

