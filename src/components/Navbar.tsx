"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Navigation links for the app
const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/wardrobe", label: "My Wardrobe" },
  { href: "/outfit", label: "Get Outfit" },
];

export default function Navbar() {
  // usePathname tells us which page we're currently on
  // so we can highlight the active nav link
  const pathname = usePathname();

  return (
    <nav className="bg-navy text-white shadow-lg">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / App Name */}
          <Link href="/" className="text-xl font-bold tracking-tight">
            FitCheck
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent text-white"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
