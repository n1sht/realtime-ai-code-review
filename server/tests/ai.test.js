import { describe, it, expect } from "vitest";

const parseAIResponse = (content) => {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        raw: content,
        issues: Array.isArray(parsed.issues) ? parsed.issues : [],
        summary: parsed.summary || "",
      };
    }
  } catch {
  }
  return { raw: content, issues: [], summary: content.slice(0, 200) };
};

describe("parseAIResponse", () => {
  it("parses valid structured JSON response", () => {
    const input = JSON.stringify({
      summary: "Found 2 issues",
      issues: [
        { number: 1, severity: "critical", issue: "SQL injection", line: "5", fix: "Use parameterized queries" },
        { number: 2, severity: "warning", issue: "No error handling", line: "10", fix: "Add try-catch" },
      ],
    });

    const result = parseAIResponse(input);
    expect(result.issues).toHaveLength(2);
    expect(result.issues[0].severity).toBe("critical");
    expect(result.summary).toBe("Found 2 issues");
  });

  it("handles JSON with surrounding text", () => {
    const input = `Here is my analysis:\n${JSON.stringify({
      summary: "One issue",
      issues: [{ number: 1, severity: "suggestion", issue: "Use const", line: "1", fix: "const x = 1" }],
    })}\nEnd of review.`;

    const result = parseAIResponse(input);
    expect(result.issues).toHaveLength(1);
  });

  it("returns raw content when JSON is invalid", () => {
    const input = "This is just plain text review with no JSON.";
    const result = parseAIResponse(input);
    expect(result.issues).toHaveLength(0);
    expect(result.raw).toBe(input);
  });

  it("handles empty issues array", () => {
    const input = JSON.stringify({ summary: "No issues found.", issues: [] });
    const result = parseAIResponse(input);
    expect(result.issues).toHaveLength(0);
    expect(result.summary).toBe("No issues found.");
  });

  it("handles malformed JSON gracefully", () => {
    const input = '{"summary": "test", "issues": [broken}';
    const result = parseAIResponse(input);
    expect(result.issues).toHaveLength(0);
  });
});
