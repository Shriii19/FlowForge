"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase, isSupabaseConfigured } from "@/app/lib/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleReset = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!supabase) {
      setErrorMsg("Supabase is not configured.");
      return;
    }

    if (!email.trim()) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg(
        "Password reset email sent! Please check your inbox and follow the link."
      );
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: "var(--bg-page)" }}
    >
      <div
        className="panel w-full max-w-sm rounded-2xl p-8"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--line)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        }}
      >
        {/* Logo */}
        <div className="mb-6 flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: "var(--accent)" }}
          >
            FF
          </div>
          <span
            className="text-sm font-semibold tracking-tight"
            style={{ color: "var(--text-main)" }}
          >
            FlowForge
          </span>
        </div>

        <h1
          className="text-2xl font-bold tracking-tight mb-1"
          style={{ color: "var(--text-main)" }}
        >
          Forgot Password?
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          Enter your email and we'll send you a reset link.
        </p>

        <input
          type="email"
          className="w-full rounded-xl px-4 py-2.5 mb-4 text-sm focus:outline-none"
          style={{
            background: "var(--bg-soft)",
            border: "1px solid var(--line)",
            color: "var(--text-main)",
          }}
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {errorMsg && (
          <div
            className="mb-4 rounded-xl px-4 py-2.5 text-sm"
            style={{
              background: "var(--bg-soft)",
              border: "1px solid var(--line)",
              color: "var(--text-main)",
            }}
          >
            ⚠ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 rounded-xl px-4 py-2.5 text-sm text-green-600"
            style={{
              background: "var(--bg-soft)",
              border: "1px solid var(--line)",
            }}
          >
            ✓ {successMsg}
          </div>
        )}

        <button
          onClick={handleReset}
          disabled={loading || !isSupabaseConfigured}
          className="accent-btn w-full rounded-xl py-2.5 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Sending reset link..." : "Send Reset Link"}
        </button>

        <p className="mt-5 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-medium underline underline-offset-4"
            style={{ color: "var(--accent)" }}
          >
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}