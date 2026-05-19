"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const client = supabase;

    if (!client) {
      router.push("/login");
      return;
    }

    const getUser = async () => {
      const { data } = await client.auth.getUser();

      if (!data.user) {
        router.push("/login");
      } else {
        setUser(data.user);
      }
    };

    getUser();

    // 🔥 Listen for auth changes
    const { data: listener } = client.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) router.push("/login");
        else setUser(session.user);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, [router]);

  return user;
}
