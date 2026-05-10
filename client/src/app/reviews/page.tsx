import Link from "next/link";

type Review = {
  _id: string;
  language: string;
  code: string;
  createdAt: string;
};

const Reviews = async () => {
  const response = await fetch("http://localhost:3001/reviews");
  const reviews: Review[] = await response.json();

  return (
    <main style={{ maxWidth: "860px", margin: "0 auto" }}>
      <div className="nes-container with-title is-dark">
        <p className="title" style={{ fontSize: "10px" }}>
          ALL REVIEWS
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <p style={{ fontSize: "8px", color: "#92cc41" }}>
            {reviews.length} REVIEW{reviews.length !== 1 ? "S" : ""} STORED
          </p>
          <Link href="/">
            <button className="nes-btn is-success" style={{ fontSize: "8px" }}>
              + NEW REVIEW
            </button>
          </Link>
        </div>

        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {reviews.map((r) => (
            <Link
              key={r._id}
              href={`/reviews/${r._id}`}
              style={{ textDecoration: "none" }}
            >
              <div
                className="nes-container is-dark"
                style={{ cursor: "pointer", borderColor: "#444" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <span className="nes-badge">
                    <span className="is-success" style={{ fontSize: "7px" }}>
                      {r.language.toUpperCase()}
                    </span>
                  </span>
                  <span style={{ fontSize: "7px", color: "#666" }}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "8px",
                    color: "#aaa",
                    fontFamily: "monospace",
                    margin: 0,
                    lineHeight: "1.8",
                  }}
                >
                  {r.code.slice(0, 100)}...
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Reviews;
