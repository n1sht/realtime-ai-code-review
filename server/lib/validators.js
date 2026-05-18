import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(128),
  name: z.string().min(1).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128),
});

export const reviewSchema = z.object({
  code: z.string().min(1).max(50000),
  language: z.string().min(1).max(30),
});

export const settingsSchema = z.object({
  customEndpoint: z.string().url().max(500).or(z.literal("")),
  customApiKey: z.string().max(500),
  customModel: z.string().max(200),
});

export const fetchModelsSchema = z.object({
  endpoint: z.string().url().max(500),
  apiKey: z.string().min(1).max(500),
});

export const commentSchema = z.object({
  name: z.string().min(1).max(100),
  comment: z.string().min(1).max(5000),
});
