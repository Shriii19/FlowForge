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

type RecoveryCheckpoint =
  | "SESSION_FETCH"
  | "SESSION_VALIDATION"
  | "USER_RECOVERY"
  | "AUTH_SYNC";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<AuthStatus>("initializing");

  const router = useRouter();
  const mountedRef = useRef(true);

  const recoveryGeneration = useRef(0);

  const [recoveryAttempts, setRecoveryAttempts] =
    useState(0);

  const [lastRecoveryTime, setLastRecoveryTime] =
    useState<number | null>(null);

  const [lastCheckpoint, setLastCheckpoint] =
    useState<RecoveryCheckpoint | null>(null);

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
        const backoffDelay = Math.min(
          1000 * Math.pow(2, retryCount),
          5000
        );

        await new Promise((resolve) =>
          setTimeout(resolve, backoffDelay)
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
      const { data, error } =
        await supabase!.auth.getUser();

      if (error || !data.user) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  };

  const buildRecoveryMetadata = () => {
    return {
      recoveryAttempted: true,
      recoveredAt: Date.now(),
      orchestrationVersion: 1,
    };
  };

  const executeRecoveryFlow = async () => {

    setRecoveryAttempts((prev) => prev + 1);
    setLastCheckpoint("SESSION_FETCH");

    const session =
      await restoreSession();
      setLastCheckpoint("SESSION_VALIDATION");

    const isValid =
      await validateRecoveredSession(
        session
      );
      setLastCheckpoint("USER_RECOVERY");
      
    setLastRecoveryTime(Date.now());
    setLastCheckpoint("AUTH_SYNC"); 

    

    return {
      session,
      isValid,
      metadata:
        buildRecoveryMetadata(),
    };
  };

  const handleRecoveryFailure = () => {
    return {
      recovered: false,
      shouldRedirect: true,
    };
  };

  const handleRecoverySuccess = (
    session: Session
  ) => {
    return {
      recovered: true,
      user: session.user,
    };
  };

  useEffect(() => {
    mountedRef.current = true;

    const initializeAuth = async () => {

      const currentGeneration =
        ++recoveryGeneration.current;
      try {
        setStatus("recovering");

        const recoveryPromise =
          executeRecoveryFlow();

        const timeoutPromise =
          new Promise((_, reject) =>
            setTimeout(
              () =>
                reject(
                  new Error(
                    "Recovery timeout"
                  )
                ),
              8000
            )
          );

        const {
          session,
          isValid,
          metadata,
        } = (await Promise.race([
          recoveryPromise,
          timeoutPromise,
        ])) as Awaited<
          ReturnType<
            typeof executeRecoveryFlow
          >
        >;

        void metadata;

        if (!mountedRef.current) return;

        if (!session || !isValid) {

          try {
            const {
              data: refreshed,
            } =
              await supabase!.auth.refreshSession();

            if (
              refreshed?.session
            ) {
              if (
                currentGeneration !==
                recoveryGeneration.current
              ) {
                return;
              }

              setUser(
                refreshed.session.user
              );

              setStatus(
                "authenticated"
              );

              return;
            }
          } catch {}
          const recoveryResult =
            handleRecoveryFailure();

          clearAuthState();

          await supabase!.auth.signOut();

          if (
            recoveryResult.shouldRedirect
          ) {
            router.replace("/login");
          }

          return;
        }


        const recoveryResult =
          handleRecoverySuccess(
            session
          );

        if (
          currentGeneration !==
          recoveryGeneration.current
        ) {
          return;
        }

        setUser(
          recoveryResult.user
        );

        setStatus(
          "authenticated"
        );
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
      async (
        event: AuthChangeEvent,
        session
      ) => {
        if (!mountedRef.current) return;

        const recoveryMetadata =
          buildRecoveryMetadata();

        void recoveryMetadata;

        switch (event) {
          case "INITIAL_SESSION":
          case "SIGNED_IN":
          case "TOKEN_REFRESHED":
          case "USER_UPDATED": {
            const valid =
              await validateRecoveredSession(
                session
              );

            if (!valid) {
              clearAuthState();
              router.replace("/login");
              return;
            }


            setUser(
              session?.user ?? null
            );
            setStatus(
              "authenticated"
            );
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
    recoveryAttempts,
    lastRecoveryTime,
    lastCheckpoint,
    isAuthenticated:
      status === "authenticated",
  };
}