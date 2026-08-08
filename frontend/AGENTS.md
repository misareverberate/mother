# AGENTS.md

## Current state

- Frontend app lives in `frontend/` (workspace root is `mother/`). The default session working directory for frontend work is `frontend/`.
- UI/UX prototype of an affiliate-content dashboard (TikTok Shop → posts → X/Telegram). All data is mocked — no backend or real API integration exists yet.

## Commands

Run everything from `frontend/`:

- `npm run dev` — Vite dev server
- `npm run build` — typecheck (`tsc -b`) then production build (`vite build`)
- `npm run lint` — oxlint (`.oxlintrc.json` ignores `node_modules`/`dist`)
- `npm run preview` — serve the production build

There is no test setup.

## Stack & structure

- React 19 + Vite 8 + TypeScript + Tailwind CSS v4 (CSS-first config via `@tailwindcss/vite`, theme tokens in `src/index.css` `@theme`).
- `react-router-dom` for routing, `recharts` for charts, `zustand` for state, `lucide-react` for icons, `clsx` for class merging.
- Path alias `@/` → `src/` (configured in `vite.config.ts` and `tsconfig.app.json`). Always use `@/` imports.
- Pages are lazy-loaded route components (see `src/App.tsx`) — keep them exported as **named** exports (`export function DashboardPage`), not default.

## Architecture notes

- `src/data/` — mock data layer (`products.ts`, `posts.ts`, `metrics.ts`, `revenue.ts`). Deterministic seeded RNG keeps data stable across reloads. Swap these for real API calls later; keep the same types in `src/types.ts`.
- `src/store/useAppStore.ts` — zustand store holding posts/products + toasts. Status changes (publish/archive/restore) live here so they persist across pages.
- `src/components/ui/` — design-system primitives (Button, Card, Badge, Input, Select, Drawer, Modal, ToastHost, TabBar, StatCard). Build new UI on these; do not style each page independently.
- `src/components/charts/` — reusable Recharts wrappers (`TrendArea`, `TrendBars`, `Donut`).
- Key workflow to keep fast: Dashboard "Posts ready for X" queue → copy post (Clipboard API, `CopyButton`) → paste into X → mark as published.

## Conventions

- Branch names use Portuguese (e.g. `feat/criação-da-estrutura-do-frontend`). Match this style for new branches.
- Remote: `https://github.com/misareverberate/mother.git`, default branch `main`.
- UI chrome (navigation, labels) is English; generated post content is in pt-BR (Brazilian market, `R$` currency).
- Do not create app code at the workspace root — it belongs under `frontend/`.
- **Functional color map**: one color = one meaning — `brand` (indigo) for interaction/selection, `emerald` for revenue/growth, `amber` for attention/mock-data, `rose` for errors/declines. KPI icon chips stay neutral (`bg-ink-100 text-ink-600`); only delta values carry a functional tone.
- **Action hierarchy**: Copy is the primary action (indigo filled Button); publish/restore are secondary (outline); archive is ghost.
- **Contrast floor**: small/reading text uses `ink-500` or darker on light surfaces; `ink-400` is reserved for decorative icons, placeholders, strikethrough prices and rank numbers. On dark surfaces, `ink-300`/`ink-400` are the readable tones.
- **Motion**: easing tokens `--ease-snappy` (UI hovers) and `--ease-emphasis` (entrance/emphasis) in `src/index.css` — use those, not hardcoded cubic-bezier values.
- **Product art is deterministic**: `ProductImage` derives its gradient from `CATEGORY_META[category].hue` and shows a category lucide icon — no per-product `image` field, no emoji.

## Notes

- Lint/typecheck: run `npm run lint` and `npm run build` before finishing a task.
- `recharts` is the large chunk in the bundle; it is code-split per page already — avoid importing it in components used by many pages unless needed.
- Mock values are labeled "Mock data" in the UI (see Revenue page) — keep that distinction if extending.
