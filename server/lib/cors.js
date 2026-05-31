const DEFAULT_CLIENT_ORIGINS =
  "http://localhost:3000,https://realtime-ai-code-review.vercel.app,https://*.vercel.app";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const normalizeOrigin = (origin) => origin.trim().replace(/\/+$/, "");

export const parseAllowedOrigins = (
  origins = process.env.CLIENT_ORIGIN || DEFAULT_CLIENT_ORIGINS,
) => {
  const configuredOrigins = origins
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean);

  return Array.from(
    new Set([
      ...configuredOrigins,
      ...DEFAULT_CLIENT_ORIGINS.split(",").map(normalizeOrigin),
    ]),
  );
};

export const isAllowedOrigin = (origin, allowedOrigins = parseAllowedOrigins()) => {
  if (!origin) return true;

  const normalizedOrigin = normalizeOrigin(origin);

  return allowedOrigins.some((allowedOrigin) => {
    if (allowedOrigin === normalizedOrigin) return true;
    if (!allowedOrigin.includes("*")) return false;

    const pattern = new RegExp(
      `^${allowedOrigin.split("*").map(escapeRegex).join(".*")}$`,
    );
    return pattern.test(normalizedOrigin);
  });
};

export const createCorsOptions = (allowedOrigins = parseAllowedOrigins()) => ({
  origin(origin, callback) {
    callback(null, isAllowedOrigin(origin, allowedOrigins));
  },
});
