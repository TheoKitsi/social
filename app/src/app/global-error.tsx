"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "system-ui", background: "#1F1F1F", color: "#fff" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Something went wrong</h2>
          <button onClick={reset} style={{ padding: "0.5rem 1rem", background: "#FFD700", color: "#1F1F1F", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
