import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HireHub Job Application Platform",
  description: "A modern job application platform for candidates and hiring teams.",
  icons: {
    icon: "/hirehub-favicon.svg",
    shortcut: "/hirehub-favicon.svg",
    apple: "/hirehub-favicon.svg",
  },
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
