import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// Google Fonts
const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@400;500;600;700&display=swap";
document.head.appendChild(link);

// Global reset
const style = document.createElement("style");
style.textContent = `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { -webkit-font-smoothing: antialiased; }`;
document.head.appendChild(style);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
