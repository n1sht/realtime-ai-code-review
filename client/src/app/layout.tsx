import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./AuthContext";

export const metadata: Metadata = {
  title: "CodeReview AI | Professional BYOK Code Reviews",
  description: "Automated AI code reviews for engineering teams. Bring your own API key (BYOK), collaborate in real-time, and ship better code faster without the bloat.",
  keywords: ["Code Review", "AI", "SaaS", "Developer Tools", "Programming", "BYOK", "OpenAI"],
  authors: [{ name: "Developer" }],
  openGraph: {
    title: "CodeReview AI | Professional BYOK Code Reviews",
    description: "Automated AI code reviews for engineering teams.",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
