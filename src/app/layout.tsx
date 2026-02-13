import type { Metadata } from "next";
import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "FitCheck — Smart Wardrobe Manager",
  description:
    "Upload your wardrobe, get AI-powered outfit recommendations based on weather, occasion, and your personal style.",
};

// RootLayout wraps every page in the app.
// AuthProvider tracks login state, Navbar shows navigation,
// and {children} is replaced with the current page.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AuthProvider>
          <Navbar />
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
