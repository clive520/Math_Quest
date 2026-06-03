"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  return (
    <div style={{ padding: "32px", textAlign: "center", fontFamily: "sans-serif" }}>
      <h2 style={{ color: "red" }}>出錯了！(Application Error)</h2>
      <p style={{ margin: "16px 0", padding: "16px", backgroundColor: "#f8d7da", color: "#721c24", borderRadius: "8px", wordBreak: "break-all", whiteSpace: "pre-wrap", textAlign: "left" }}>
        <strong>Error Message:</strong> {error.message}
        <br/><br/>
        <strong>Digest:</strong> {error.digest}
        <br/><br/>
        <strong>Stack:</strong> {error.stack}
      </p>
      <button
        onClick={() => reset()}
        style={{ padding: "8px 16px", fontSize: "16px", cursor: "pointer", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px" }}
      >
        重試 (Try again)
      </button>
    </div>
  );
}
