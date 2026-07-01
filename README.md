# Unique Flooring API Docs

Public documentation site for the Unique Flooring GraphQL API, built with [Docusaurus](https://docusaurus.io/).

**Live site:** https://devthedev-io.github.io/unique-flooring-docs/

---

## How deployment works

Every push to `main` triggers a GitHub Actions workflow that builds and deploys the site to GitHub Pages automatically. You never need to deploy manually.

---

## Making changes

```bash
# 1. Pull latest
git pull

# 2. Edit markdown files in docs/
# 3. Preview locally (optional — see below)

# 4. Commit and push — site redeploys automatically
git add -A
git commit -m "docs: describe what you changed"
git push
```

---

## File structure

```
docs/
├── intro.md              ← Overview: endpoint, what's public, tech stack
├── getting-started.md    ← Nitro setup + curl quickstart
├── filtering.md          ← Hot Chocolate filter syntax reference
├── errors.md             ← GraphQL error shape
├── auth.md               ← What requires auth vs what's public
└── querying/
    ├── flooring.md       ← Flooring queries + field reference
    ├── wall-cladding.md  ← Wall cladding queries + field reference
    └── decking.md        ← Decking queries + field reference
sidebars.ts               ← Controls the left sidebar order and structure
docusaurus.config.ts      ← Site title, navbar, footer, theme config
src/css/custom.css        ← Brand colors (Skeleton UI crimson theme)
```

---

## Adding a new page

1. Create a `.md` file in `docs/` (or `docs/querying/` for product pages):

```md
---
id: my-page
title: My Page Title
sidebar_position: 7
---

# My Page Title

Content here.
```

2. Register it in `sidebars.ts`:

```ts
apiSidebar: [
  'intro',
  'getting-started',
  // ...
  'my-page',  // ← add here
],
```

3. Push — it appears on the live site automatically.

---

## Updating existing docs

Just edit the relevant `.md` file and push. Common reasons to update:

- **New product fields added to the API** → update the fields reference table in `docs/querying/flooring.md`, `wall-cladding.md`, or `decking.md`
- **New query added** → add an example query block to the relevant page
- **New product type added** → create a new page in `docs/querying/`, add it to `sidebars.ts`
- **Endpoint or auth changes** → update `docs/intro.md` and `docs/auth.md`

---

## Local preview (optional)

```bash
npm install
npm start
```

Opens at `http://localhost:3000/unique-flooring-docs/`. Changes hot-reload in the browser.

---

## Schema reference

The full GraphQL schema SDL is always available at:

```
https://services.uniqueflooring.co.za/graphql?sdl
```

Use this as the source of truth when updating field references in the docs.
