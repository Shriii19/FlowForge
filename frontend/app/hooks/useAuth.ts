"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const client = supabase;

    if (!client) {
      router.replace("/login");
      return;
    }

    const getUser = async () => {
      const { data } = await client.auth.getUser();

  if (!data.user) {
    router.replace("/login");
  } else {
    setUser(data.user);
  }

  setLoading(false);
    };

    getUser();

    // 🔥 Listen for auth changes
    const { data: listener } = client.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          setUser(null);
          router.replace("/login");
        } else {
          setUser(session.user);
        }

        setLoading(false);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, [router]);

  return { user, loading };
}
