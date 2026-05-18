"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/app/lib/supabase";

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // Supabase puts the session tokens in the URL hash after redirect
    // We listen for the auth state change to confirm the session is valid
    if (!supabase) return;

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "PASSWORD_RECOVERY" && session) {
          setSessionReady(true);
        }
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleUpdatePassword = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!supabase) {
      setErrorMsg("Supabase is not configured.");
      return;
    }

    if (!password || !confirmPassword) {
      setErrorMsg("Please fill in both password fields.");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg("Password updated successfully! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2500);
    }
  };

  const inputStyle = {
    background: "var(--bg-soft)",
    border: "1px solid var(--line)",
    color: "var(--text-main)",
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
          Reset Password
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          Enter your new password below.
        </p>

        {/* New Password */}
        <div className="relative mb-3">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full rounded-xl px-4 py-2.5 pr-16 text-sm focus:outline-none"
            style={inputStyle}
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative mb-4">
          <input
            type={showConfirm ? "text" : "password"}
            className="w-full rounded-xl px-4 py-2.5 pr-16 text-sm focus:outline-none"
            style={inputStyle}
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            {showConfirm ? "Hide" : "Show"}
          </button>
        </div>

        {/* Password match indicator */}
        {confirmPassword && (
          <p className={`text-xs mb-3 ${password === confirmPassword ? "text-green-500" : "text-red-500"}`}>
            {password === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
          </p>
        )}

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
          onClick={handleUpdatePassword}
          disabled={loading || !isSupabaseConfigured}
          className="accent-btn w-full rounded-xl py-2.5 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Updating password..." : "Update Password"}
        </button>

        <p className="mt-5 text-center text-sm" style={{ color: "var(--text-muted)" }}>
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