"use client";

// AuthProvider wraps the entire app and tracks the logged-in user.
//
// WHAT IS A "CONTEXT"?
// React Context is a way to share data across all components without
// passing it through every level manually. Think of it like a global
// variable, but done the React way.
//
// HOW IT WORKS:
// 1. We create a "context" that holds the current user
// 2. We wrap the app in an <AuthProvider>, which listens for auth changes
// 3. Any component can call useAuth() to get the current user

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

// The shape of data our auth context provides
interface AuthContextType {
  user: User | null;       // The logged-in user, or null if not logged in
  loading: boolean;        // True while we're checking if someone is logged in
  signOut: () => Promise<void>;
}

// Create the context with a default value (used before the provider loads)
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

// Custom hook — any component can call useAuth() to get user info
export function useAuth() {
  return useContext(AuthContext);
}

// The provider component that wraps the app
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Check if someone is already logged in when the page loads
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for login/logout events (e.g., user signs in on another tab)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Clean up the listener when this component unmounts
    return () => subscription.unsubscribe();
  }, []);

  // Sign out function that any component can call
  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
