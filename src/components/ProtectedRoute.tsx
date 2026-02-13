"use client";

// ProtectedRoute wraps pages that require login.
// If the user isn't logged in, it redirects them to /login.
// While checking auth status, it shows a loading spinner.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Once loading is done, if there's no user, redirect to login
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // While checking auth, show a loading state
  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          <p className="mt-3 text-sm text-gray-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // If not logged in (redirect is happening), show nothing
  if (!user) {
    return null;
  }

  // User is logged in — show the page content
  return <>{children}</>;
}
