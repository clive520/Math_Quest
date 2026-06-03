"use client";

import { useEffect, useState } from "react";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const [returnUrl, setReturnUrl] = useState("");

  useEffect(() => {
    // Generate the callback URL based on the current origin
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    setReturnUrl(`${origin}/auth/callback`);
  }, []);

  const handleSSOLogin = () => {
    if (!returnUrl) return;
    const ssoUrl = `https://sso-auth-system.web.app/?return_url=${encodeURIComponent(returnUrl)}`;
    window.location.href = ssoUrl;
  };

  return (
    <div className="shell" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
      <div className="card" style={{ maxWidth: "450px", width: "100%", padding: "40px 32px", textAlign: "center" }}>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "2rem", color: "var(--color-indigo-900)", marginBottom: "8px" }}>Math Quest</h1>
          <p style={{ color: "var(--color-slate-500)", fontSize: "1.1rem" }}>數學闖關任務系統</p>
        </div>

        <div style={{ backgroundColor: "var(--color-slate-50)", padding: "24px", borderRadius: "12px", marginBottom: "32px", border: "1px solid var(--color-slate-200)" }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "16px", color: "var(--color-slate-800)" }}>系統登入</h2>
          <p style={{ color: "var(--color-slate-600)", marginBottom: "24px", fontSize: "0.95rem", lineHeight: 1.5 }}>
            本系統已整合「鹿陽國小單一認證系統」。<br/>請點擊下方按鈕進行登入。
          </p>
          
          <button 
            onClick={handleSSOLogin}
            className="button primary" 
            style={{ 
              width: "100%", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: "12px",
              padding: "16px",
              fontSize: "1.1rem"
            }}
          >
            <LogIn size={20} />
            <span>前往單一認證系統 (SSO) 登入</span>
          </button>
        </div>

        <p style={{ fontSize: "0.85rem", color: "var(--color-slate-400)" }}>
          如果您遇到登入問題，請聯繫系統管理員。
        </p>
      </div>
    </div>
  );
}
