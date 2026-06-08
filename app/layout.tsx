import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EduLoan — Student Loan Management",
  description: "Apply, track, and manage educational loans. A demo platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
