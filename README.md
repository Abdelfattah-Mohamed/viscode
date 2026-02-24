# VisCode — DSA Algorithm Visualizer

> Watch data structures and algorithms come alive, step-by-step, synced to real code.

![VisCode preview](https://raw.githubusercontent.com/YOUR_USERNAME/viscode/main/preview.png)

## Features

- **7 Blind 75 problems** visualized with smooth animations
- **4 languages** — C++, Java, JavaScript, Python — all syntax-highlighted
- **Step-by-step playback** with play/pause, speed control, and manual stepping
- **Custom inputs** — edit any input and re-run instantly
- **Plain-English explanations** for every algorithm decision
- **Similar problems** — smart tag-based recommendations after each problem
- **Dark / Light / System** theme
- **Auth system** — sign up, log in, or continue as guest

## Problems

| Problem | Category | Difficulty |
|---|---|---|
| Two Sum | Arrays | Easy |
| Longest Consecutive Sequence | Arrays | Medium |
| Contains Duplicate | Arrays | Easy |
| Valid Anagram | Arrays | Easy |
| Best Time to Buy & Sell Stock | Sliding Window | Easy |
| Binary Search | Binary Search | Easy |
| Climbing Stairs | Dynamic Programming | Easy |

## Quick Start

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/viscode.git
cd viscode

# 2. Install
npm install

# 3. Develop
npm run dev
# → http://localhost:5173

# 4. Build for production
npm run build
```

## Project Structure

```
viscode/
├── public/
│   └── favicon.svg
├── src/
│   ├── data/
│   │   ├── themes.js          # Light/dark color tokens
│   │   ├── problems.js        # All 7 problem definitions + metadata
│   │   └── stepGenerators.js  # Animation step producers per problem
│   ├── hooks/
│   │   ├── useTheme.js        # Resolves system/light/dark preference
│   │   ├── useStepPlayer.js   # Play/pause/speed animation engine
│   │   └── useAuth.js         # localStorage-based auth
│   ├── components/
│   │   ├── ui/
│   │   │   ├── NavBar.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── LogoMark.jsx
│   │   │   ├── ThemeToggle.jsx
│   │   │   ├── StepControls.jsx
│   │   │   ├── InputEditor.jsx
│   │   │   └── AuthScreen.jsx
│   │   ├── visualizers/
│   │   │   ├── ArrayVisualizer.jsx
│   │   │   ├── ConsecutiveVisualizer.jsx
│   │   │   ├── DuplicateViz.jsx
│   │   │   ├── AnagramViz.jsx
│   │   │   ├── StockViz.jsx
│   │   │   ├── BinarySearchViz.jsx
│   │   │   └── ClimbingViz.jsx
│   │   ├── CodePanel.jsx
│   │   ├── ExplanationPanel.jsx
│   │   └── SimilarProblems.jsx
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── ProblemsPage.jsx
│   │   └── AppPage.jsx
│   ├── App.jsx                # Root router
│   └── main.jsx               # Entry point
├── index.html
├── vite.config.js
└── package.json
```

## Adding a New Problem

1. **Add the problem definition** to `src/data/problems.js` inside `PROBLEMS` and `PROB_LIST`.
2. **Write a step generator** in `src/data/stepGenerators.js` and register it in `STEP_GENERATORS`.
3. **Create a visualizer component** in `src/components/visualizers/`.
4. **Export it** from `src/components/visualizers/index.js`.
5. **Add a render condition** in `src/pages/AppPage.jsx` (the `{problem.visualizer === "..." && ...}` block).

## Deploy

### GitHub Pages (automatic via CI)
Push to `main` — the included GitHub Actions workflow builds and deploys automatically.

### Vercel (recommended)
```bash
npx vercel
```
Vercel auto-detects Vite. No configuration needed.

### Netlify
```bash
npm run build
# Drag-and-drop the `dist/` folder to netlify.com/drop
```

## Tech Stack

- **React 18** + **Vite 5**
- No UI library — all styles are inline CSS-in-JS
- No state management library — plain `useState` / `useMemo`
- `localStorage` for auth persistence

## License

MIT — free to use, modify, and distribute.
