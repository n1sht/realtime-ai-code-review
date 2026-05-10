import Link from "next/link";
import dynamic from "next/dynamic";
import ReviewContent from "./ReviewContent";

import CommentsSection from "./CommentsSection";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const response = await fetch(`http://localhost:3001/reviews/${id}`);
  const review = await response.json();

  return (
    <main style={{ maxWidth: "860px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1rem" }}>
        <Link href="/reviews">
          <button className="nes-btn" style={{ fontSize: "8px" }}>
            BACK
          </button>
        </Link>
      </div>

      <ReviewContent
        code={review.code}
        language={review.language}
        codeReview={review.codeReview}
      />

      <CommentsSection reviewId={id} />
    </main>
  );
}
