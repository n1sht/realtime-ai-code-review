"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import NavBar from "./NavBar";
import Alert from "./Alert";
import CodeEditor from "./CodeEditor";

function AuthPage({ defaultMode, onBack }: { defaultMode: "login" | "signup", onBack: () => void }) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        if (!name) {
          setAlert({ type: "error", message: "Name is required." });
          setLoading(false);
          return;
        }
        await signup(email, password, name);
      }

      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get("redirect");
      if (redirectUrl) {
        router.push(redirectUrl);
      }
    } catch (error: any) {
      const msg = error.response?.data?.error || "Something went wrong.";
      setAlert({ type: "error", message: msg });
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell" style={{ position: "relative" }}>
      <div style={{ position: "absolute", top: "1.5rem", left: "1.5rem" }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px" }}>
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }}>
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            CodeReview AI
          </div>
          <p className="auth-subtitle">
            {mode === "login" ? "Sign in to your account" : "Create a new account"}
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div className="input-group">
                <label className="input-label" htmlFor="auth-name">Name</label>
                <input
                  id="auth-name"
                  type="text"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
            )}

            <div className="input-group">
              <label className="input-label" htmlFor="auth-email">Email</label>
              <input
                id="auth-email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {loading ? "Loading..." : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="auth-switch">
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button onClick={() => setMode("signup")}>Sign up</button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button onClick={() => setMode("login")}>Sign in</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { token } = useAuth();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!code.trim()) {
      setAlert({ type: "error", message: "Paste some code first." });
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:3001/reviews",
        { code, language },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      router.push(`/reviews/${response.data._id}`);
    } catch (error: any) {
      const msg = error.response?.data?.error || "Review failed. Check your AI settings.";
      setAlert({ type: "error", message: msg });
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <NavBar />
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <form onSubmit={handleSubmit}>
        <div className="card section-gap">
          <div className="card-header">
            <div>
              <h1 className="card-title">New code review</h1>
              <p className="card-desc">Paste your code and get an AI-powered review</p>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Language</label>
            <div className="select-wrap">
              <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="c">C</option>
                <option value="cpp">C++</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Code</label>
            <CodeEditor
              value={code}
              onChange={setCode}
              language={language}
              placeholder="// paste your code here..."
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Submit for review"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Home() {
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState<"login" | "signup" | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("redirect")) {
        setShowAuth("login");
      }
    }
  }, []);

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  if (user) {
    return <Dashboard />;
  }

  if (showAuth) {
    return <AuthPage defaultMode={showAuth} onBack={() => setShowAuth(null)} />;
  }

  return (
    <main className="app-shell" style={{ maxWidth: "1000px" }}>
      <nav className="nav" style={{ borderBottom: "none", paddingBottom: 0 }}>
        <div className="nav-brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          CodeReview AI
        </div>
        <div className="nav-actions">
          <button className="btn btn-ghost" onClick={() => setShowAuth("login")}>Log in</button>
          <button className="btn btn-primary" onClick={() => setShowAuth("signup")}>Sign up</button>
        </div>
      </nav>

      <header style={{ padding: "8rem 0 6rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "3.5rem", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: "1.5rem", lineHeight: 1.1 }}>
          Ship better code, <br/>
          <span style={{ color: "var(--text-secondary)" }}>faster than ever.</span>
        </h1>
        <p style={{ fontSize: "1.1rem", color: "var(--text-muted)", maxWidth: "600px", margin: "0 auto 2.5rem", lineHeight: 1.6 }}>
          Automated code reviews powered by the latest AI models. Bring your own API key to save costs, or use our managed pro tier.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button className="btn btn-primary" style={{ padding: "0.75rem 1.5rem", fontSize: "0.9rem" }} onClick={() => setShowAuth("signup")}>
            Start your 5-day trial
          </button>
          <a href="#features" className="btn" style={{ padding: "0.75rem 1.5rem", fontSize: "0.9rem" }}>
            Explore features
          </a>
        </div>
      </header>

      <section id="features" style={{ padding: "4rem 0", borderTop: "1px solid var(--border)" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "2.5rem", textAlign: "center" }}>
          Built for professional engineering teams.
        </h2>
        <div className="stat-row">
          <div className="card" style={{ textAlign: "left" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}>Bring Your Own Key</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Connect your own OpenAI-compatible endpoint. Perfect for local models or using your own API credits to save costs.
            </p>
          </div>
          <div className="card" style={{ textAlign: "left" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}>Real-time Collaboration</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Share review links directly with your team. Discuss AI feedback and leave comments in real-time synced via WebSockets.
            </p>
          </div>
          <div className="card" style={{ textAlign: "left" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}>Developer First</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              No bloat, no generic AI slop. A professional, IDE-style interface designed strictly for fast, efficient workflows.
            </p>
          </div>
        </div>
      </section>

      <footer style={{ padding: "2rem 0", textAlign: "center", borderTop: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "4rem" }}>
        &copy; {new Date().getFullYear()} CodeReview AI. All rights reserved.
      </footer>
    </main>
  );
}
