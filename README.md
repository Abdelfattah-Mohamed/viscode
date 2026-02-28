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

The main learning view: **problem statement** (with favorite/flag and **share**), **code** (Solution / Explanation tabs, language selector, copy button), and **whiteboard** (custom input, step description, animation). Use **?** in the whiteboard header for keyboard shortcuts.

| Light | Dark |
|-------|------|
| ![Visualizer — light](docs/screenshots/visualizer-light.png) | ![Visualizer — dark](docs/screenshots/visualizer-dark.png) |

*Place screenshots in `docs/screenshots/visualizer-light.png` and `docs/screenshots/visualizer-dark.png`.*

### Profile

User profile with **Favorites** and **Flagged** problem lists. Manage account and sign out.

| Light | Dark |
|-------|------|
| ![Profile — light](docs/screenshots/profile-light.png) | ![Profile — dark](docs/screenshots/profile-dark.png) |

*Place screenshots in `docs/screenshots/profile-light.png` and `docs/screenshots/profile-dark.png`.*

---

## Features

- **24 Blind 75–style problems** across Arrays, Sliding Window, Binary Search, DP, Trees, Two Pointers, Stack, and Linked Lists
- **4 languages** — C++, Java, JavaScript, Python — with syntax highlighting and per-step line mapping
- **Step-by-step playback** — play/pause, speed control, next/previous, jump to start/end
- **Custom inputs** — edit any input and re-run the visualization instantly
- **Plain-English explanations** for each algorithm decision (Solution vs Explanation tab)
- **Similar problems** — tag-based recommendations after each problem
- **Share a visualization** — copy a URL with problem ID and custom input in query params so others open the same test case
- **Recently visited** — last 5 problems stored in `localStorage`; quick-access on Home and Problems (fits on screen without scrolling on medium+)
- **Favorites & Flagged** — per-user lists persisted in Supabase; visible on profile and filterable on Problems
- **Auth** — sign up, log in, or continue as guest; **Sign in with Google** (optional); email verification (EmailJS); password reset; cross-device login via Supabase
- **Themes** — Light / Dark / System (respects `prefers-color-scheme` on first visit)
- **Keyboard shortcuts** — Space (play/pause), ←/→ or A/D (prev/next), Home/End, L (language), E (Solution/Explanation), ? (help); ? button in whiteboard header
- **Mobile-friendly** — responsive layout; visualizer and code stack on small screens

---

## Problems

| Problem | Category | Difficulty |
|---------|----------|------------|
| Two Sum | Arrays | Easy |
| Longest Consecutive Sequence | Arrays | Medium |
| Contains Duplicate | Arrays | Easy |
| Valid Anagram | Arrays | Easy |
| Best Time to Buy & Sell Stock | Sliding Window | Easy |
| Binary Search | Binary Search | Easy |
| Climbing Stairs | Dynamic Programming | Easy |
| Maximum Subarray (Kadane) | Arrays | Medium |
| Subtree of Another Tree | Trees | Easy |
| Valid Palindrome | Two Pointers | Easy |
| Valid Parentheses | Stack | Easy |
| Product of Array Except Self | Arrays | Medium |
| Maximum Product Subarray | Dynamic Programming | Medium |
| House Robber | Dynamic Programming | Medium |
| Missing Number | Arrays | Easy |
| Maximum Depth of Binary Tree | Trees | Easy |
| Invert Binary Tree | Trees | Easy |
| Same Tree | Trees | Easy |
| Reverse Linked List | Linked Lists | Easy |
| 3Sum | Two Pointers | Medium |
| Container With Most Water | Two Pointers | Medium |
| Merge Two Sorted Lists | Linked Lists | Easy |
| Merge Intervals | Intervals | Medium |
| Linked List Cycle | Linked Lists | Easy |

---

## Tech Stack

- **React 18** + **Vite 7**
- **Supabase** — auth, profiles, user_problem_flags, verification_codes
- **EmailJS** — optional email verification and password reset
- **Google Identity Services** — optional Sign in with Google (`VITE_GOOGLE_CLIENT_ID`)
- Inline styles (no UI library); `localStorage` + Supabase for persistence

---

## License

MIT — use, modify, and distribute freely.
