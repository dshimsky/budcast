import type { Session, User as AuthUser } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "../types/database";

interface AuthContextValue {
  session: Session | null;
  authUser: AuthUser | null;
  profile: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  async function loadProfile(userId: string) {
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.warn("[Auth] Failed to load profile:", error.message);
        setProfile(null);
        return;
      }
      setProfile(data);
    } finally {
      setProfileLoading(false);
    }
  }

  async function refreshProfile() {
    if (authUser?.id) await loadProfile(authUser.id);
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSessionLoading((current) => (current ? false : current));
      setProfileLoading((current) => (current ? false : current));
    }, 3000);

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setAuthUser(session?.user ?? null);
        if (session?.user) {
          setProfileLoading(true);
          loadProfile(session.user.id).finally(() => setSessionLoading(false));
        } else {
          setSessionLoading(false);
        }
      })
      .catch((err) => {
        console.warn("[Auth] getSession failed:", err?.message ?? err);
        setSessionLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthUser(session?.user ?? null);
      if (session?.user) {
        setProfileLoading(true);
        loadProfile(session.user.id);
      } else {
        setProfile(null);
        setProfileLoading(false);
      }
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const loading = sessionLoading || profileLoading;

  return (
    <AuthContext.Provider
      value={{ session, authUser, profile, loading, signIn, signUp, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
