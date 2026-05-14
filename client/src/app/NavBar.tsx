"use client";

import Link from "next/link";
import { useAuth } from "./AuthContext";

export default function NavBar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="nav">
      <Link href="/" className="nav-brand">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
        CodeReview AI
      </Link>
      <div className="nav-actions">
        <span className="nav-user">
          {user.name}
          {user.isPro ? (
            <span className="badge badge-success" style={{ marginLeft: "6px" }}>PRO</span>
          ) : user.trialEndsAt ? (
            <span style={{ 
              marginLeft: "6px", 
              fontSize: "0.65rem", 
              color: new Date(user.trialEndsAt) < new Date() ? "var(--error)" : "var(--warning)" 
            }}>
              {new Date(user.trialEndsAt) < new Date() ? "(Trial Expired)" : `(Trial: ${Math.ceil((new Date(user.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}d left)`}
            </span>
          ) : null}
        </span>
        <Link href="/reviews">
          <button className="btn btn-sm">Reviews</button>
        </Link>
        <Link href="/settings">
          <button className="btn btn-sm">Settings</button>
        </Link>
        <button className="btn btn-sm btn-ghost" onClick={logout}>
          Log out
        </button>
      </div>
    </nav>
  );
}
