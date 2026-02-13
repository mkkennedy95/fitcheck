"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

// Navigation links — only shown when logged in
const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/wardrobe", label: "My Wardrobe" },
  { href: "/outfit", label: "Get Outfit" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="bg-navy text-white shadow-lg">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / App Name */}
          <Link href="/" className="text-xl font-bold tracking-tight">
            FitCheck
          </Link>

          {/* Right side: nav links + auth */}
          <div className="flex items-center gap-1">
            {/* Only show nav links if the user is logged in */}
            {user &&
              navLinks.map((link) => {
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

            {/* Auth buttons */}
            {!loading && (
              <>
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="ml-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    Log Out
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <Link
                      href="/login"
                      className="rounded-lg px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/signup"
                      className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
