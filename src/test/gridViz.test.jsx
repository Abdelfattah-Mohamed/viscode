import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import GridViz from "../components/visualizers/GridViz";

const theme = {
  _resolved: "light",
  ink: "#111827",
  inkMuted: "#6b7280",
  border: "#d1d5db",
  surfaceAlt: "#f9fafb",
  green: "#10b981",
  blue: "#2563eb",
  yellow: "#facc15",
  red: "#ef4444",
  shadowSm: "none",
};

describe("GridViz", () => {
  it("renders Word Search II character codes as board letters", () => {
    render(
      <GridViz
        problemId="word-search-ii"
        t={theme}
        stepState={{
          grid: [[79, 65], [35, 84]],
          visited: [[false, false], [true, false]],
          current: null,
          word: "OAT",
          matched: "OA",
        }}
      />
    );

    expect(screen.getByText("O")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("#")).toBeInTheDocument();
    expect(screen.getByText("T")).toBeInTheDocument();
    expect(screen.queryByText("79")).not.toBeInTheDocument();
    expect(screen.queryByText("35")).not.toBeInTheDocument();
  });
});
