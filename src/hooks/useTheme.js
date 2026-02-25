import { useState, useEffect } from "react";
import { THEMES } from "../data/themes";

export function useTheme(mode) {
  const [resolved, setResolved] = useState(() =>
    mode === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      : mode
  );

  useEffect(() => {
    if (mode !== "system") { setResolved(mode); return; }
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setResolved(mq.matches ? "dark" : "light");
    const handler = e => setResolved(e.matches ? "dark" : "light");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode]);

  const theme = THEMES[resolved] ?? THEMES.light;
  theme._resolved = resolved;
  return theme;
}
