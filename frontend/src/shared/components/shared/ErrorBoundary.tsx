import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("KindLoop crashed:", error);
  }

  handleReload = () => {
    try {
      window.localStorage.removeItem("language");
      window.localStorage.removeItem("auth-storage");
      window.localStorage.removeItem("kindloop_guest_preview_id");
    } catch {
      // ignore
    }
    window.location.replace("/");
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            padding: 24,
            fontFamily: "system-ui, sans-serif",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: 12,
          }}
        >
          <h1 style={{ margin: 0, color: "#359364" }}>KindLoop</h1>
          <p style={{ color: "#64748b", maxWidth: 360, direction: "rtl" }}>
            הדף לא נטען. לחצי על רענון ונסי שוב.
          </p>
          <p style={{ color: "#64748b", maxWidth: 360 }}>
            The page failed to load. Refresh and try again.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            style={{
              background: "#359364",
              color: "white",
              border: 0,
              borderRadius: 10,
              padding: "10px 20px",
              fontWeight: 600,
            }}
          >
            Reload / רענון
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
