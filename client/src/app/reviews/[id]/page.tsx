"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "../../AuthContext";
import NavBar from "../../NavBar";
import ReviewContent from "./ReviewContent";
import CommentsSection from "./CommentsSection";

type ReviewData = {
  _id: string;
  code: string;
  language: string;
  codeReview: string;
};

export default function ReviewPage() {
  const { user, token, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [review, setReview] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push(`/?redirect=/reviews/${id}`);
      return;
    }

    axios
      .get(`http://localhost:3001/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        setReview(res.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [authLoading, user, token, id, router]);

  if (authLoading || loading) {
    return <div className="loader">Loading...</div>;
  }

  if (!review) {
    return (
      <div className="app-shell">
        <NavBar />
        <div className="card">
          <p style={{ color: "var(--error)", fontSize: "0.85rem" }}>Review not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <NavBar />
      <div style={{ marginBottom: "1rem" }}>
        <Link href="/reviews">
          <button className="btn btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back
          </button>
        </Link>
      </div>

      <ReviewContent
        code={review.code}
        language={review.language}
        codeReview={review.codeReview}
      />

      <CommentsSection reviewId={id} />
    </div>
  );
}
