import axios from "axios";

type ApiErrorResponse = {
  error?: string;
  message?: string;
};

const LOCAL_API_URL = "http://localhost:3001";

function normalizeApiUrl(url: string) {
  return url.replace(/\/+$/, "");
}

export const API = normalizeApiUrl(
  process.env.NEXT_PUBLIC_API_URL?.trim() || LOCAL_API_URL,
);

function isLocalApiUrl() {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(API);
}

function getConnectionErrorMessage() {
  if (isLocalApiUrl()) {
    return "Cannot reach the API. This deployment is still pointing at localhost; set NEXT_PUBLIC_API_URL in Vercel to your Render backend URL and redeploy.";
  }

  return `Cannot reach the API at ${API}. Check that the Render service is running and CLIENT_ORIGIN includes your Vercel URL.`;
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const serverMessage = error.response?.data?.error || error.response?.data?.message;
    if (serverMessage) {
      return serverMessage;
    }

    if (!error.response || error.code === "ERR_NETWORK") {
      return getConnectionErrorMessage();
    }
  }

  return fallback;
}
