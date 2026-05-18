import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ReviewContent from "../app/reviews/[id]/ReviewContent";

describe("ReviewContent", () => {
  const shortCode = 'console.log("hello");\nconst x = 1;';
  const longCode = Array.from({ length: 50 }, (_, i) => `const line${i} = ${i};`).join("\n");

  it("renders submitted code", () => {
    render(
      <ReviewContent
        code={shortCode}
        language="javascript"
        codeReview="No issues found."
        issues={[]}
      />
    );
    expect(screen.getByText("javascript")).toBeInTheDocument();
  });

  it("shows structured issues with severity badges", () => {
    const issues = [
      { number: 1, severity: "critical" as const, issue: "SQL injection risk", line: "5", fix: "Use parameterized queries" },
      { number: 2, severity: "warning" as const, issue: "Missing null check", line: "10", fix: "Add if (x != null)" },
    ];

    render(
      <ReviewContent
        code={shortCode}
        language="javascript"
        codeReview=""
        issues={issues}
      />
    );

    expect(screen.getByText("Critical")).toBeInTheDocument();
    expect(screen.getByText("Warning")).toBeInTheDocument();
    expect(screen.getByText("SQL injection risk")).toBeInTheDocument();
    expect(screen.getByText("Missing null check")).toBeInTheDocument();
  });

  it("shows 'Show more' button for long code", () => {
    render(
      <ReviewContent
        code={longCode}
        language="javascript"
        codeReview="Looks good"
        issues={[]}
      />
    );

    const showMoreBtn = screen.getByText(/Show more/);
    expect(showMoreBtn).toBeInTheDocument();
  });

  it("expands code when 'Show more' is clicked", () => {
    render(
      <ReviewContent
        code={longCode}
        language="javascript"
        codeReview="Looks good"
        issues={[]}
      />
    );

    fireEvent.click(screen.getByText(/Show more/));
    expect(screen.getByText(/Show less/)).toBeInTheDocument();
  });

  it("falls back to markdown when no structured issues", () => {
    render(
      <ReviewContent
        code={shortCode}
        language="javascript"
        codeReview="The code looks perfect."
        issues={[]}
      />
    );

    expect(screen.getByText("The code looks perfect.")).toBeInTheDocument();
  });
});
