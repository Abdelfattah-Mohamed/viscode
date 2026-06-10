import { Component } from "react";
import { trackEvent } from "../utils/analytics";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    try {
      trackEvent("app_crashed", {
        message: String(error?.message || error).slice(0, 300),
        componentStack: String(info?.componentStack || "").slice(0, 500),
      });
    } catch {
      // Reporting must never throw.
    }
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div
        role="alert"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fbf8f1",
          color: "#1c1c2e",
          fontFamily: "'DM Sans', sans-serif",
          padding: 24,
        }}
      >
        <div
          style={{
            maxWidth: 440,
            width: "100%",
            textAlign: "center",
            background: "#fff",
            border: "1.5px solid #d8d2c5",
            borderRadius: 18,
            padding: "36px 28px",
            boxShadow: "0 18px 50px rgba(28,28,46,0.12)",
          }}
        >
          <div style={{ fontSize: "2.4rem", marginBottom: 10 }} aria-hidden="true">⚠️</div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "0 0 8px" }}>
            Something went wrong
          </h1>
          <p style={{ margin: "0 0 20px", color: "#6b6b7b", fontSize: "0.95rem", lineHeight: 1.6 }}>
            An unexpected error occurred. Your progress is saved — reloading usually fixes it.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "11px 22px",
                fontSize: "0.95rem",
                fontWeight: 800,
                border: "1.5px solid #1c1c2e",
                borderRadius: 10,
                background: "#1c1c2e",
                color: "#ffd862",
                cursor: "pointer",
              }}
            >
              Reload the app
            </button>
            <button
              onClick={() => { window.location.href = "/"; }}
              style={{
                padding: "11px 22px",
                fontSize: "0.95rem",
                fontWeight: 800,
                border: "1.5px solid #d8d2c5",
                borderRadius: 10,
                background: "#fff",
                color: "#1c1c2e",
                cursor: "pointer",
              }}
            >
              Go home
            </button>
          </div>
          {import.meta.env.DEV && (
            <pre
              style={{
                marginTop: 20,
                textAlign: "left",
                fontSize: "0.72rem",
                background: "#f6f2e9",
                border: "1px solid #d8d2c5",
                borderRadius: 10,
                padding: 12,
                overflow: "auto",
                maxHeight: 180,
                whiteSpace: "pre-wrap",
              }}
            >
              {String(this.state.error?.stack || this.state.error)}
            </pre>
          )}
        </div>
      </div>
    );
  }
}
