import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareerConnect Job Application Platform",
  description: "A modern job application platform for candidates and hiring teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-background text-text">
        {children}
      </body>
    </html>
  );
}
