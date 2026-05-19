"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/app/lib/supabase";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [nextPath, setNextPath] = useState<string | null>(null);

  const redirectPath = nextPath && nextPath.startsWith("/") ? nextPath : "/dashboard";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    queueMicrotask(() => setNextPath(params.get("next")));
  }, []);

  const handleLogin = async () => {
    if (!supabase) {
      alert("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in frontend/.env.local.");
      return;
    }

    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }

    if (!supabase) {
      alert("Supabase is not configured.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) alert(error.message);
    else router.push(redirectPath);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">
      <div className="bg-zinc-900 p-6 rounded-xl w-80">
        <h1 className="text-xl mb-4">Login</h1>

        <input
          className="w-full p-2 mb-3 bg-zinc-800 rounded"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full p-2 mb-3 bg-zinc-800 rounded"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading || !isSupabaseConfigured}
          className="w-full rounded bg-indigo-600 p-2 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {!isSupabaseConfigured && (
          <p className="mt-3 text-center text-xs text-amber-300">
            Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in frontend/.env.local
          </p>
        )}

        <p className="mt-4 text-center text-sm text-zinc-300">
          New here?{" "}
          <Link href={nextPath ? `/signup?next=${encodeURIComponent(nextPath)}` : "/signup"} className="text-indigo-400 hover:text-indigo-300">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
