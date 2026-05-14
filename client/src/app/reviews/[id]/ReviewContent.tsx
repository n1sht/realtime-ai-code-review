"use client";

import ReactMarkdown from "react-markdown";
import CodeEditor from "../../CodeEditor";

type Props = {
  code: string;
  language: string;
  codeReview: string;
};

export default function ReviewContent({ code, language, codeReview }: Props) {
  return (
    <>
      <div className="section-gap">
        <div style={{ marginBottom: "0.5rem" }}>
          <span className="input-label">Submitted code</span>
          <span className="badge" style={{ marginLeft: "0.5rem" }}>{language}</span>
        </div>
        <CodeEditor
          value={code}
          onChange={() => {}}
          language={language}
          readOnly
        />
      </div>

      <div className="card section-gap">
        <div className="card-header">
          <h2 className="card-title">AI Review</h2>
          <span className="badge badge-success">Complete</span>
        </div>
        <div className="review-prose">
          <ReactMarkdown>{codeReview}</ReactMarkdown>
        </div>
      </div>
    </>
  );
}
