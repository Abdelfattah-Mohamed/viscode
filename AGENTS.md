# AGENTS.md

## Cursor Cloud specific instructions

### Overview

VisCode is a React 18 + Vite 7 SPA that visualizes DSA algorithms step-by-step. The frontend is the primary service; Supabase (auth/DB) and Stripe (billing) are optional cloud dependencies that degrade gracefully when not configured.

### Running the app

- `npm run dev` — starts Vite dev server on `http://localhost:5173`
- `npm run build` — production build to `dist/`
- `npm run validate:problems` — validates problem data integrity (89 problems, 15 categories)

### Known issues

- **ESLint v10 / `.eslintrc.cjs` mismatch:** The project specifies `eslint: ^10.0.2` but uses the legacy `.eslintrc.cjs` config format (dropped in ESLint v9+). ESLint will not run until either the config is migrated to `eslint.config.js` flat config or ESLint is downgraded to v8. Missing plugins: `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`.

### Environment variables

- Copy `.env.example` to `.env`. The app works without any values set (uses localStorage fallback, demo verification code `123456`).
- For full cloud features, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

### Architecture notes

- No backend process to run locally — all backend is Supabase Edge Functions (Deno/TypeScript in `supabase/functions/`).
- The app renders entirely client-side. Without Supabase credentials, auth features show a sign-in modal that can be dismissed with "Continue as Guest".
- Problem data lives in `src/data/problems.js`; step generators in `src/data/stepGenerators.js`.
