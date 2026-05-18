import { describe, it, expect } from "vitest";
import {
  signupSchema,
  loginSchema,
  reviewSchema,
  commentSchema,
  settingsSchema,
  fetchModelsSchema,
} from "../lib/validators.js";

describe("Validators", () => {
  describe("signupSchema", () => {
    it("accepts valid input", () => {
      const result = signupSchema.safeParse({
        email: "test@example.com",
        password: "123456",
        name: "Test User",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid email", () => {
      const result = signupSchema.safeParse({
        email: "not-an-email",
        password: "123456",
        name: "Test",
      });
      expect(result.success).toBe(false);
    });

    it("rejects short password", () => {
      const result = signupSchema.safeParse({
        email: "test@example.com",
        password: "123",
        name: "Test",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty name", () => {
      const result = signupSchema.safeParse({
        email: "test@example.com",
        password: "123456",
        name: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("accepts valid input", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "password",
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing password", () => {
      const result = loginSchema.safeParse({ email: "test@example.com" });
      expect(result.success).toBe(false);
    });
  });

  describe("reviewSchema", () => {
    it("accepts valid code submission", () => {
      const result = reviewSchema.safeParse({
        code: "console.log('hello')",
        language: "javascript",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty code", () => {
      const result = reviewSchema.safeParse({ code: "", language: "js" });
      expect(result.success).toBe(false);
    });

    it("rejects code exceeding 50000 chars", () => {
      const result = reviewSchema.safeParse({
        code: "x".repeat(50001),
        language: "js",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("commentSchema", () => {
    it("accepts valid comment", () => {
      const result = commentSchema.safeParse({
        name: "User",
        comment: "Great review!",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty comment", () => {
      const result = commentSchema.safeParse({ name: "User", comment: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("settingsSchema", () => {
    it("accepts valid settings", () => {
      const result = settingsSchema.safeParse({
        customEndpoint: "https://api.openai.com/v1/chat/completions",
        customApiKey: "sk-test123",
        customModel: "gpt-4o",
      });
      expect(result.success).toBe(true);
    });

    it("accepts empty strings (clearing settings)", () => {
      const result = settingsSchema.safeParse({
        customEndpoint: "",
        customApiKey: "",
        customModel: "",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid URL", () => {
      const result = settingsSchema.safeParse({
        customEndpoint: "not-a-url",
        customApiKey: "key",
        customModel: "model",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("fetchModelsSchema", () => {
    it("accepts valid input", () => {
      const result = fetchModelsSchema.safeParse({
        endpoint: "https://api.openai.com/v1/chat/completions",
        apiKey: "sk-test",
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing apiKey", () => {
      const result = fetchModelsSchema.safeParse({
        endpoint: "https://api.openai.com/v1/chat/completions",
      });
      expect(result.success).toBe(false);
    });
  });
});
