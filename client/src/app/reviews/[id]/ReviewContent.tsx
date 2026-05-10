"use client";

import ReactMarkdown from "react-markdown";

type Props = {
  code: string;
  language: string;
  codeReview: string;
};

export default function ReviewContent({ code, language, codeReview }: Props) {
  return (
    <>
      <div
        className="nes-container with-title is-dark"
        style={{ marginBottom: "1.5rem" }}
      >
        <p className="title" style={{ fontSize: "8px" }}>
          {language.toUpperCase()} CODE
        </p>
        <pre
          style={{
            fontSize: "10px",
            fontFamily: "monospace",
            overflowX: "auto",
            whiteSpace: "pre-wrap",
            color: "#92cc41",
          }}
        >
          {code}
        </pre>
      </div>

      <div
        className="nes-container with-title is-dark"
        style={{ marginBottom: "1.5rem" }}
      >
        <p className="title" style={{ fontSize: "8px" }}>
          AI REVIEW
        </p>
        <div style={{ fontSize: "10px", lineHeight: "2", color: "#fff" }}>
          <div
            style={{
              fontSize: "10px",
              lineHeight: "2",
              color: "#fff",
              overflowX: "hidden",
              wordBreak: "break-word",
            }}
          >
            <ReactMarkdown>{codeReview}</ReactMarkdown>
          </div>
        </div>
      </div>
    </>
  );
}
