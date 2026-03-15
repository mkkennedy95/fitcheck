import type { Metadata } from "next";
import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import PWARegistration from "@/components/PWARegistration";
import "./globals.css";

export const metadata: Metadata = {
  title: "FitCheck — Smart Wardrobe Manager",
  description:
    "Upload your wardrobe, get AI-powered outfit recommendations based on weather, occasion, and your personal style.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FitCheck",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  themeColor: "#0a0a5e",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
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
        <PWARegistration />
        <AuthProvider>
          <Navbar />
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
