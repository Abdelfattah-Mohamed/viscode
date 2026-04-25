# VisCode — DSA Algorithm Visualizer

> **Watch data structures and algorithms come alive.** Step through solutions in C++, Java, JavaScript, and Python with live animations synced to the code. Built for interview prep and learning.

---

## What is VisCode?

VisCode is a **web app** that helps you understand classic coding problems by **visualizing** how algorithms run step-by-step. Instead of reading code in isolation, you see:

- **The code** (syntax-highlighted, with the active line highlighted)
- **The visualization** (arrays, pointers, trees, linked lists, etc.)
- **Plain-English explanations** for each step

You can change inputs, switch languages, adjust playback speed, and share a specific problem + test case via URL. Perfect for **Blind 75**-style practice and technical interview prep.

---

## Quick Start (Local Dev)

### 1) Install dependencies

```bash
npm install
```

### 2) Create local env file

Copy `.env.example` to `.env` and fill the values you plan to use:

```bash
cp .env.example .env
```

Minimum useful setup:

- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (for cloud profile/favorites/flags/notes)
- Optional: `VITE_EMAILJS_*` for email verification
- Optional: `VITE_GOOGLE_CLIENT_ID` for Google sign-in

If email provider variables are missing, verification uses the demo fallback code noted in `.env.example`.

### 3) Run the app

```bash
npm run dev
```

Open the local URL shown by Vite (typically `http://localhost:5173`).

### 4) Build for production (optional check)

```bash
npm run build
npm run preview
```

### 5) Optional Supabase schema setup

To fully enable cloud persistence and billing tables:

- Run `supabase/schema.sql` in your Supabase SQL Editor.
- For CLI tasks in this project, use `npx supabase ...` (see Supabase CLI note below).

---

## Screenshots

Add your own screenshots to `docs/screenshots/` and reference them below. Example filenames: `home.png`, `problems.png`, `visualizer.png`, `profile.png`.

### Home

Landing page with hero, stats, and **Continue Where You Left Off** (last 5 problems). Use **Start Visualizing** or **Browse Problems** to dive in.

| Light | Dark |
|-------|------|
| ![Home — light](docs/screenshots/home-light.png) | ![Home — dark](docs/screenshots/home-dark.png) |

*Place screenshots in `docs/screenshots/home-light.png` and `docs/screenshots/home-dark.png`.*

### Problems

Browse all problems with search, category filters, and **Favorites** / **Flagged** filters. **Recently Visited** shows your last 5 problems; cards fit on screen without scrolling on medium/large viewports.

| Light | Dark |
|-------|------|
| ![Problems — light](docs/screenshots/problems-light.png) | ![Problems — dark](docs/screenshots/problems-dark.png) |

*Place screenshots in `docs/screenshots/problems-light.png` and `docs/screenshots/problems-dark.png`.*

### Visualizer (App)

The main learning view: **problem statement** (with favorite/flag and **share**), **code** (Solution / Explanation tabs, language selector, copy button), and **whiteboard** (step description + animation). Use **?** in the whiteboard header for keyboard shortcuts.  
Pro users also get **editable custom inputs** and **personal notes** directly in the workspace.

| Light | Dark |
|-------|------|
| ![Visualizer — light](docs/screenshots/visualizer-light.png) | ![Visualizer — dark](docs/screenshots/visualizer-dark.png) |

*Place screenshots in `docs/screenshots/visualizer-light.png` and `docs/screenshots/visualizer-dark.png`.*

### Profile

User profile with account summary, avatar picker, study lists (**Favorites** / **Flagged** tabs), and account actions.

### Billing

Dedicated billing page with current subscription state, plan comparison, feature highlights, and upgrade/cancel/resume actions.

| Light | Dark |
|-------|------|
| ![Profile — light](docs/screenshots/profile-light.png) | ![Profile — dark](docs/screenshots/profile-dark.png) |

*Place screenshots in `docs/screenshots/profile-light.png` and `docs/screenshots/profile-dark.png`.*

---

## Features

- **100+ visualized problems** across Arrays, Sliding Window, Binary Search, Dynamic Programming, Trees, Graphs, Linked Lists, Backtracking, and more
- **4 languages** — C++, Java, JavaScript, Python — with syntax highlighting and per-step line mapping
- **Step-by-step playback** — play/pause, speed control, next/previous, jump to start/end
- **Plain-English explanations** for each algorithm decision (Solution vs Explanation tab)
- **Similar problems** — tag-based recommendations after each problem
- **Share a visualization** — copy a URL with problem ID and custom input in query params so others open the same test case
- **Recently visited** — last 5 problems stored in `localStorage`; quick-access on Home and Problems (fits on screen without scrolling on medium+)
- **Favorites & Flagged** — per-user lists persisted in Supabase; visible on profile and filterable on Problems
- **Access tiers**
  - **Free:** Famous Algorithms category
  - **Pro:** Full problem library + editable custom inputs + personal notes
- **Billing system** — weekly/monthly/yearly/lifetime plans with hosted checkout and subscription management
- **Auth** — sign up, log in, or continue as guest; **Sign in with Google** (optional); email verification (EmailJS); password reset; cross-device login via Supabase
- **Themes** — Light / Dark / System (respects `prefers-color-scheme` on first visit)
- **Keyboard shortcuts** — Space (play/pause), ←/→ or A/D (prev/next), Home/End, L (language), E (Solution/Explanation), ? (help); ? button in whiteboard header
- **Mobile-friendly** — responsive layout; visualizer and code stack on small screens

---

## Problem Coverage

The library includes classic interview problems plus advanced algorithm visualizations such as:

- **Famous Algorithms:** Bellman-Ford, Floyd-Warshall, Kosaraju, Tarjan SCC, Kruskal, Prim, Dijkstra, A*, BFS/DFS, Union-Find, Fenwick Tree, Segment Tree, 0/1 Knapsack
- **Core interview sets:** Blind 75-style problems and additional practice problems
- **Categories:** Arrays, Strings, Trees, Graphs, Dynamic Programming, Backtracking, Heaps, Stacks, Intervals, Linked Lists, and more

---

## Tech Stack

- **React 18** + **Vite 7**
- **Supabase** — auth, profiles, user_problem_flags, verification_codes
- **EmailJS** — optional email verification and password reset
- **Google Identity Services** — optional Sign in with Google (`VITE_GOOGLE_CLIENT_ID`)
- Inline styles (no UI library); `localStorage` + Supabase for persistence

## Supabase CLI Note

This repo does not pin the Supabase CLI as a local dependency. For Supabase CLI tasks, use:

- `npx supabase login`
- `npx supabase link --project-ref <YOUR_PROJECT_REF>`
- `npx supabase functions deploy <function-name>`

You can also install Supabase CLI globally if you prefer, but `npx supabase ...` is the default in this project.

---

## License

MIT — use, modify, and distribute freely.
