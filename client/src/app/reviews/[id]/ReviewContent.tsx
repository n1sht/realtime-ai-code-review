"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

type Issue = {
  number: number;
  severity: "critical" | "warning" | "suggestion";
  issue: string;
  line: string;
  fix: string;
};

type Props = {
  code: string;
  language: string;
  codeReview: string;
  issues?: Issue[];
};

const CODE_LINE_LIMIT = 30;

const severityConfig = {
  critical: { label: "Critical", className: "badge-critical" },
  warning: { label: "Warning", className: "badge-warning" },
  suggestion: { label: "Suggestion", className: "badge-suggestion" },
};

function CodeBlock({ code, language }: { code: string; language: string }) {
  const lines = code.split("\n");
  const [expanded, setExpanded] = useState(lines.length <= CODE_LINE_LIMIT);
  const displayLines = expanded ? lines : lines.slice(0, CODE_LINE_LIMIT);

  return (
    <div className="code-block-wrap">
      <div className="code-block-header">
        <span className="badge">{language}</span>
        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
          {lines.length} lines
        </span>
      </div>
      <div className="code-block-body">
        <div className="code-block-lines">
          {displayLines.map((_, i) => (
            <span key={i} className="code-line-num">{i + 1}</span>
          ))}
        </div>
        <pre className="code-block-content">
          <code>{displayLines.join("\n")}</code>
        </pre>
      </div>
      {!expanded && (
        <button
          className="btn btn-sm show-more-btn"
          onClick={() => setExpanded(true)}
        >
          Show more ({lines.length - CODE_LINE_LIMIT} more lines)
        </button>
      )}
      {expanded && lines.length > CODE_LINE_LIMIT && (
        <button
          className="btn btn-sm show-more-btn"
          onClick={() => setExpanded(false)}
        >
          Show less
        </button>
      )}
    </div>
  );
}

function IssueCard({ issue }: { issue: Issue }) {
  const config = severityConfig[issue.severity] || severityConfig.suggestion;

  return (
    <div className={`issue-card issue-${issue.severity}`}>
      <div className="issue-card-header">
        <span className={`badge ${config.className}`}>{config.label}</span>
        {issue.line && (
          <span className="issue-line">Line {issue.line}</span>
        )}
      </div>
      <p className="issue-description">{issue.issue}</p>
      {issue.fix && (
        <div className="issue-fix">
          <span className="issue-fix-label">Fix:</span>
          <pre className="issue-fix-code"><code>{issue.fix}</code></pre>
        </div>
      )}
    </div>
  );
}

export default function ReviewContent({ code, language, codeReview, issues }: Props) {
  const hasStructuredIssues = issues && issues.length > 0;

  return (
    <>
      <div className="section-gap">
        <div style={{ marginBottom: "0.5rem" }}>
          <span className="input-label">Submitted code</span>
        </div>
        <CodeBlock code={code} language={language} />
      </div>

      <div className="card section-gap">
        <div className="card-header">
          <h2 className="card-title">AI Review</h2>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {hasStructuredIssues && (
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {issues.length} issue{issues.length !== 1 ? "s" : ""} found
              </span>
            )}
            <span className="badge badge-success">Complete</span>
          </div>
        </div>

        {hasStructuredIssues ? (
          <div className="issues-list">
            {issues.map((issue, i) => (
              <IssueCard key={i} issue={issue} />
            ))}
          </div>
        ) : (
          <div className="review-prose">
            <ReactMarkdown>{codeReview}</ReactMarkdown>
          </div>
        )}
      </div>
    </>
  );
}
