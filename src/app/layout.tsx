import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

// Metadata shows up in the browser tab and search engine results
export const metadata: Metadata = {
  title: "FitCheck — Smart Wardrobe Manager",
  description:
    "Upload your wardrobe, get AI-powered outfit recommendations based on weather, occasion, and your personal style.",
};

// RootLayout wraps every page in the app.
// The navbar appears on all pages, and {children} is replaced
// with the content of whichever page you're viewing.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
