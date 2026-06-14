"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
import type {
  User,
  Session,
  AuthChangeEvent,
} from "@supabase/supabase-js";

type AuthStatus =
  | "initializing"
  | "authenticated"
  | "unauthenticated"
  | "recovering"
  | "error";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<AuthStatus>("initializing");

  const router = useRouter();
  const mountedRef = useRef(true);

  if (!supabase) {
    return {
      user: null,
      loading: false,
      status: "error" as const,
      isAuthenticated: false,
    };
  }

  const clearAuthState = () => {
    if (!mountedRef.current) return;

    setUser(null);
    setStatus("unauthenticated");
    setLoading(false);
  };

  const restoreSession = async (
    retryCount = 0
  ): Promise<Session | null> => {
    try {
      const {
        data: { session },
        error,
      } = await supabase!.auth.getSession();

      if (error) throw error;

      return session;
    } catch (error) {
      if (retryCount < 2) {
        await new Promise((resolve) =>
          setTimeout(resolve, 500 * (retryCount + 1))
        );

        return restoreSession(retryCount + 1);
      }

      throw error;
    }
  };

  const validateRecoveredSession = async (
    session: Session | null
  ): Promise<boolean> => {
    if (!session?.access_token) {
      return false;
    }

    try {
      const { data, error } = await supabase!.auth.getUser();

      if (error || !data.user) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    mountedRef.current = true;

    const initializeAuth = async () => {
      try {
        setStatus("recovering");

        const session = await restoreSession();

        const isValid = await validateRecoveredSession(session);

        if (!mountedRef.current) return;

        if (!session || !isValid) {
          clearAuthState();

          await supabase!.auth.signOut();

          router.replace("/login");
          return;
        }

        setUser(session.user);
        setStatus("authenticated");
      } catch {
        if (!mountedRef.current) return;

        clearAuthState();
        setStatus("error");

        router.replace("/login");
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase!.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session) => {
        if (!mountedRef.current) return;

        switch (event) {
          case "INITIAL_SESSION":
          case "SIGNED_IN":
          case "TOKEN_REFRESHED":
          case "USER_UPDATED": {
            const valid = await validateRecoveredSession(session);

            if (!valid) {
              clearAuthState();
              router.replace("/login");
              return;
            }

            setUser(session?.user ?? null);
            setStatus("authenticated");
            break;
          }

          case "SIGNED_OUT": {
            clearAuthState();
            router.replace("/login");
            break;
          }

          default: {
            if (!session) {
              clearAuthState();
              router.replace("/login");
            }
          }
        }

        setLoading(false);
      }
    );

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [router]);

  return {
    user,
    loading,
    status,
    isAuthenticated: status === "authenticated",
  };
}