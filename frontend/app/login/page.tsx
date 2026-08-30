"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/app/lib/supabase";
import { useToast } from "@/app/context/ToastContext";
import { z } from "zod";

export default function Login() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [nextPath, setNextPath] = useState<string | null>(null);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const redirectPath = nextPath && nextPath.startsWith("/") ? nextPath : "/dashboard";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    queueMicrotask(() => setNextPath(params.get("next")));
  }, []);

  const handleLogin = async () => {
    if (!supabase) {
      showToast("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in frontend/.env.local.", "error");
      return;
    }

    if (!email || !password) {
      showToast("Please enter your email and password.", "error");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      showToast(error.message, "error");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      router.push("/dashboard");
      router.refresh();
    }
  };

  const emailSchema = z.string().email("Invalid email address");
  const passwordSchema = z.string().min(8, "Password must be at least 8 characters");

  const validateEmail = () => {
    const result = emailSchema.safeParse(email);
    setEmailError(result.success ? "" : (result.error?.errors?.[0]?.message ?? "Invalid email"));
  };

  const validatePassword = () => {
    const result = passwordSchema.safeParse(password);
    setPasswordError(result.success ? "" : (result.error?.errors?.[0]?.message ?? "Invalid password"));
  };

  const isFormValid =
    emailSchema.safeParse(email).success &&
    passwordSchema.safeParse(password).success;

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">
      <form
        onSubmit={(e) => { e.preventDefault(); handleLogin(); }}
        className="bg-zinc-900 p-6 rounded-xl w-80"
      >
        <h1 className="text-xl mb-4">Login</h1>

        <input
          type="email"
          className={`w-full p-2 bg-zinc-800 rounded ${emailError ? "border border-red-500 mb-1" : "mb-3"}`}
          placeholder="Email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
          onBlur={validateEmail}
        />
        {emailError && (
          <p className="text-red-400 text-xs mb-3">{emailError}</p>
        )}

        <input
          type="password"
          className={`w-full p-2 bg-zinc-800 rounded ${passwordError ? "border border-red-500 mb-1" : "mb-3"}`}
          placeholder="Password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
          onBlur={validatePassword}
        />
        {passwordError && (
          <p className="text-red-400 text-xs mb-3">{passwordError}</p>
        )}

        <div className="flex justify-end mb-4">
          <Link
            href="/forgot-password"
            className="text-xs underline underline-offset-4"
            style={{ color: "var(--text-muted)" }}
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading || !isSupabaseConfigured || !isFormValid}
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
          <Link
            href={nextPath ? `/signup?next=${encodeURIComponent(nextPath)}` : "/signup"}
            className="text-indigo-400 hover:text-indigo-300"
          >
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}