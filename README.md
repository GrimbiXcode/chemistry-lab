# chemistry lab

An interactive chemistry learning web app for school-level students — a pure frontend
single-page application with no backend.

The app offers 10 learning modules (matter, atoms, periodic table, bonds, formulas,
reactions, pH, separation, energy, and the mole), each with 3 learning steps, quiz
questions, and an interactive lab. On top of that: a glossary, a mistake-review mode, and
an exam mode. Gamification through XP, levels, and progress tracking — all persisted in
`localStorage`.

The UI language is German by default, with translations into 20 languages (including RTL
support for Arabic and Urdu).

## Tech Stack

- **React 19 + TypeScript** (strict mode), built with **Vite 7**
- **react-router 7** with `HashRouter` (works on any static host without server rewrites)
- **Tailwind CSS 3.4** + **shadcn/ui** (Radix primitives)
- **lucide-react** icons, **recharts**, **react-hook-form** / **zod**

## Getting Started

Requires Node.js 20+.

```bash
npm ci            # install dependencies
npm run dev       # dev server on http://localhost:3000
npm run build     # type-check + production build to dist/
npm run preview   # preview the production build locally
npm run lint      # ESLint
```

## Docker

A multi-stage `Dockerfile` builds the app and serves it via nginx:

```bash
docker build -t chemistry-lab .
docker run -p 8080:80 chemistry-lab
# open http://localhost:8080
```

## CI/CD (GitHub Actions)

- **Push to `main`** — builds the Docker image as a verification check (no push).
- **Tag push (`v*`)** — builds the image and pushes it to the GitHub Container Registry
  (`ghcr.io/<owner>/chemistry-lab`) with the tag name and `latest` as image tags.

## Project Structure

```
src/
  pages/          route pages (home, module, glossary, review, exam, labs)
  components/     layout, quiz, shared components, ui/ (shadcn), labs/ (10 labs)
  data/           module metadata and lab content
  hooks/          progress (localStorage), i18n data
  i18n/           i18n provider + 20 locale files (de.json is the reference)
  lib/            utilities (cn)
```

All visible text goes through the i18n system (`t('key')`); progress is stored in
`localStorage`. See `AGENTS.md` for detailed conventions.

## Deployment

`npm run build` produces static files in `dist/`. Thanks to `base: './'` and
`HashRouter`, the build runs on any static host or sub-path without server configuration —
or simply use the Docker image above.
