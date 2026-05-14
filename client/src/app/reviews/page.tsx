"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import NavBar from "../NavBar";
import { useRouter } from "next/navigation";

type Review = {
  _id: string;
  language: string;
  code: string;
  createdAt: string;
};

export default function Reviews() {
  const { user, token, loading: authLoading } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/");
      return;
    }

    axios
      .get("http://localhost:3001/reviews", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setReviews(res.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [authLoading, user, token, router]);

  if (authLoading || loading) {
    return <div className="loader">Loading...</div>;
  }

  const uniqueLangs = new Set(reviews.map((r) => r.language)).size;
  const latest = reviews.length > 0
    ? new Date(reviews[0].createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "—";

  return (
    <div className="app-shell">
      <NavBar />

      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-value">{reviews.length}</div>
          <div className="stat-label">Total Reviews</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{uniqueLangs}</div>
          <div className="stat-label">Languages</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{latest}</div>
          <div className="stat-label">Latest</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h1 className="card-title">Your reviews</h1>
            <p className="card-desc">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
          </div>
          <Link href="/">
            <button className="btn btn-primary btn-sm">+ New review</button>
          </Link>
        </div>

        {reviews.length === 0 ? (
          <div className="empty-state">No reviews yet. Submit your first code review.</div>
        ) : (
          <div className="stack">
            {reviews.map((r) => (
              <Link key={r._id} href={`/reviews/${r._id}`}>
                <div className="review-card">
                  <div className="review-card-header">
                    <span className="badge">{r.language}</span>
                    <span className="review-date">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="review-snippet">
                    {r.code.slice(0, 120)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
