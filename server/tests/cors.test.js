import { describe, expect, it } from "vitest";
import {
  isAllowedOrigin,
  normalizeOrigin,
  parseAllowedOrigins,
} from "../lib/cors.js";

describe("CORS origin helpers", () => {
  it("normalizes trailing slashes from configured origins", () => {
    expect(normalizeOrigin("https://realtime-ai-code-review.vercel.app/")).toBe(
      "https://realtime-ai-code-review.vercel.app",
    );
  });

  it("allows a browser origin when CLIENT_ORIGIN was configured with a trailing slash", () => {
    const allowedOrigins = parseAllowedOrigins(
      "https://realtime-ai-code-review.vercel.app/",
    );

    expect(
      isAllowedOrigin(
        "https://realtime-ai-code-review.vercel.app",
        allowedOrigins,
      ),
    ).toBe(true);
  });

  it("supports wildcard origins for preview deployments", () => {
    const allowedOrigins = parseAllowedOrigins("https://*.vercel.app");

    expect(isAllowedOrigin("https://feature-branch.vercel.app", allowedOrigins)).toBe(
      true,
    );
  });

  it("allows Vercel preview deployments even when CLIENT_ORIGIN only names production", () => {
    const allowedOrigins = parseAllowedOrigins(
      "https://realtime-ai-code-review.vercel.app",
    );

    expect(
      isAllowedOrigin(
        "https://realtime-ai-code-review-git-main-n1sht.vercel.app",
        allowedOrigins,
      ),
    ).toBe(true);
  });

  it("rejects unrelated origins", () => {
    const allowedOrigins = parseAllowedOrigins(
      "https://realtime-ai-code-review.vercel.app",
    );

    expect(isAllowedOrigin("https://example.com", allowedOrigins)).toBe(false);
  });
});
