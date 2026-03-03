# Frontend Technical Test

Monorepo for the frontend developer technical test, using **Turborepo**, **React**, **Vite**, **Tailwind CSS**, and a shared **UI package** with shadcn-style components.

## Structure

- **`apps/web`** – React + Vite + Tailwind app (candidate app)
- **`packages/ui`** – Shared `@repo/ui` package with shadcn components

## Setup

This repo uses **pnpm** and a pnpm workspace (`pnpm-workspace.yaml`).

```bash
pnpm install
```

## Scripts

- **`pnpm dev`** – Start the web app in development
- **`pnpm build`** – Build all apps
- **`pnpm lint`** – Lint all packages

## UI Package (`@repo/ui`)

Import components from the single entrypoint:

```tsx
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@repo/ui'
```

All shadcn-style components are exported from `@repo/ui` (button, card, input, label, dialog, form, etc.).

Theme (CSS variables for light/dark) is defined in `apps/web/src/index.css`. The web app uses the UI package’s Tailwind preset so all design tokens are available.

## Data layer

Data fetching follows the same pattern as our main frontend monorepo:

- **API** – Plain async functions in `apps/web/src/api/*.api.ts` (e.g. `users.api.ts`, `formalities.api.ts`) that call the backend. A shared `client.ts` provides a small `fetchApi<T>()` helper.