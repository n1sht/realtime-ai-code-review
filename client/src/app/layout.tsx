import type { Metadata } from "next";
import "nes.css/css/nes.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Code Review",
  description: "AI Code Review Assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
