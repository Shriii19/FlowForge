"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/app/lib/supabase";
import { signupSchema } from "@/lib/validations/auth";

function generatePassword(length = 14): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const symbols = "!@#$%^&*()-_=+[]{}";
  const all = upper + lower + digits + symbols;
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  // Ensure at least one of each required type
  const required = [
    upper[array[0] % upper.length],
    lower[array[1] % lower.length],
    digits[array[2] % digits.length],
    symbols[array[3] % symbols.length],
  ];
  const rest = Array.from(array.slice(4), (n) => all[n % all.length]);
  const combined = [...required, ...rest];
  // Shuffle
  for (let i = combined.length - 1; i > 0; i--) {
    const j = array[i % array.length] % (i + 1);
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }
  return combined.join("");
}

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nextPath, setNextPath] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState<"" | "weak" | "medium" | "strong">("");

  const [submissionId, setSubmissionId] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submissionLockRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    queueMicrotask(() => setNextPath(params.get("next")));
  }, []);

  const handleGeneratePassword = () => {
    const pwd = generatePassword(14);
    setPassword(pwd);
    setConfirmPassword(pwd);
    setShowPassword(true);
    setShowConfirm(true);
  };

  const handleCopy = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSignup = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (submissionLockRef.current || isSubmitting) {
      return;
    }

    submissionLockRef.current = true;
    setIsSubmitting(true);

    const currentSubmissionId =
      crypto.randomUUID();

    setSubmissionId(currentSubmissionId);

    if (!supabase) {
      setErrorMsg("Supabase is not configured.");

      submissionLockRef.current = false;
      setIsSubmitting(false);

      return;
    }

    if (!name.trim() || !username.trim() || !email.trim() || !password) {
      setErrorMsg("Please fill in all required fields.");

      submissionLockRef.current = false;
      setIsSubmitting(false);

      return;
    }

    if (mobile && !/^\+?[0-9\s\-]{7,15}$/.test(mobile)) {
      setErrorMsg("Please enter a valid mobile number.");

      submissionLockRef.current = false;
      setIsSubmitting(false);

      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");

      submissionLockRef.current = false;
      setIsSubmitting(false);

      return;
    }

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");

      submissionLockRef.current = false;
      setIsSubmitting(false);

      return;
    }

    setLoading(true);
    let res: Response | null = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Submission-Id":
              currentSubmissionId,
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
            name: name.trim(),
            username: username.trim(),
            mobile: mobile.trim(),
          }),
        });

        if (res.ok) {
          break;
        }
      } catch {
        setRetryCount(attempt + 1);
      }
    }

    if (!res) {
      setErrorMsg(
        "Unable to complete signup request."
      );

      submissionLockRef.current = false;
      setIsSubmitting(false);
      setLoading(false);

      return;
    }
    let result: { error?: string } = {};
    let error: { message: string } | null = null;
    try {
      result = await res.json();
      if (result.error){
        error = {message: result.error}
      }
    } catch {
      error = {
        message: "Failed to parse server response."
      };

      setErrorMsg(
        "An unexpected error occurred. Please try again."
      );

      submissionLockRef.current = false;
      setIsSubmitting(false);
      setLoading(false);

      return;
    }

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("rate limit") || msg.includes("too many")) {
        setErrorMsg("Too many signup attempts. Please wait a few minutes and try again, or use a different email.");
      } else if (msg.includes("already registered") || msg.includes("user already")) {
        setErrorMsg("This email is already registered. Try logging in instead.");
      } else {
        setErrorMsg(error.message);
      }
    } else {
      setSuccessMsg(
        "Account created! Please check your email to confirm your account."
      );

      setTimeout(() => {
        router.push(
          nextPath
            ? `/login?next=${encodeURIComponent(nextPath)}`
            : "/login"
        );
      }, 2500);
    }

    submissionLockRef.current = false;
    setIsSubmitting(false);
    setLoading(false);
    };

  const validateEmailField = () => {
    const result = signupSchema.shape.email.safeParse(email);
    setEmailError(result.success ? "" : (result.error?.errors?.[0]?.message ?? "Invalid email"));
  };

  const validateUsernameField = () => {
    const result = signupSchema.shape.username.safeParse(username);
    setUsernameError(result.success ? "" : (result.error?.errors?.[0]?.message ?? "Invalid username"));
  };

  const getPasswordStrength = (pwd: string): "" | "weak" | "medium" | "strong" => {
    if (!pwd) return "";
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    if (pwd.length >= 10 && hasUpper && hasLower && hasNumber) return "strong";
    if (pwd.length >= 8) return "medium";
    return "weak";
  };

  const inputClass =
    "w-full p-2 mb-3 bg-zinc-800 rounded border border-zinc-700 focus:outline-none focus:border-indigo-500";

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white py-8">
      <div className="bg-zinc-900 p-6 rounded-xl w-full max-w-sm shadow-xl">
        <h1 className="text-2xl font-semibold mb-1">Create Account</h1>
        <p className="text-zinc-400 text-sm mb-5">Sign up for FlowForge</p>

        {/* Name */}
        <input
          className={inputClass}
          placeholder="Full Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Username */}
        <input
          className={`w-full p-2 bg-zinc-800 rounded border ${usernameError ? "border-red-500 mb-1" : "border-zinc-700 mb-3"} focus:outline-none focus:border-indigo-500`}
          placeholder="Username *"
          value={username}
          onChange={(e) => { setUsername(e.target.value.replace(/\s/g, "")); setUsernameError(""); }}
          onBlur={validateUsernameField}
        />
        {usernameError && (
          <p className="text-red-400 text-xs mb-3">{usernameError}</p>
        )}

        {/* Email */}
        <input
          type="email"
          className={`w-full p-2 bg-zinc-800 rounded border ${emailError ? "border-red-500 mb-1" : "border-zinc-700 mb-3"} focus:outline-none focus:border-indigo-500`}
          placeholder="Email *"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
          onBlur={validateEmailField}
        />
        {emailError && (
          <p className="text-red-400 text-xs mb-3">{emailError}</p>
        )}

        {/* Mobile */}
        <input
          type="tel"
          className={inputClass}
          placeholder="Mobile Number (optional)"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />

        {/* Auto-generate password button */}
        <div className="flex items-center gap-2 mb-3">
          <button
            type="button"
            onClick={handleGeneratePassword}
            className="flex-1 rounded bg-zinc-700 hover:bg-zinc-600 p-2 text-sm transition-colors"
          >
            ⚡ Generate Strong Password
          </button>
          {password && (
            <button
              type="button"
              onClick={handleCopy}
              className="rounded bg-zinc-700 hover:bg-zinc-600 px-3 py-2 text-sm transition-colors"
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
          )}
        </div>

        {/* Password */}
        <div className="relative mb-3">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full p-2 pr-16 bg-zinc-800 rounded border border-zinc-700 focus:outline-none focus:border-indigo-500"
            placeholder="Password *"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordStrength(getPasswordStrength(e.target.value));
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* Password strength indicator */}
        {passwordStrength && (
          <div className="flex items-center gap-2 mb-3 -mt-1">
            <div className="flex gap-1">
              <div className={`h-1 w-8 rounded ${passwordStrength === "weak" ? "bg-red-500" : passwordStrength === "medium" ? "bg-yellow-400" : "bg-green-500"}`} />
              <div className={`h-1 w-8 rounded ${passwordStrength === "medium" || passwordStrength === "strong" ? (passwordStrength === "medium" ? "bg-yellow-400" : "bg-green-500") : "bg-zinc-600"}`} />
              <div className={`h-1 w-8 rounded ${passwordStrength === "strong" ? "bg-green-500" : "bg-zinc-600"}`} />
            </div>
            <span className={`text-xs ${passwordStrength === "weak" ? "text-red-400" : passwordStrength === "medium" ? "text-yellow-400" : "text-green-400"}`}>
              {passwordStrength === "weak" ? "Weak" : passwordStrength === "medium" ? "Medium" : "Strong"}
            </span>
          </div>
        )}

        {/* Confirm Password */}
        <div className="relative mb-4">
          <input
            type={showConfirm ? "text" : "password"}
            className="w-full p-2 pr-16 bg-zinc-800 rounded border border-zinc-700 focus:outline-none focus:border-indigo-500"
            placeholder="Confirm Password *"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
          >
            {showConfirm ? "Hide" : "Show"}
          </button>
        </div>

        {/* Password match indicator */}
        {confirmPassword && (
          <p className={`text-xs mb-3 -mt-2 ${password === confirmPassword ? "text-green-400" : "text-red-400"}`}>
            {password === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
          </p>
        )}

        {errorMsg && (
          <p className="mb-3 rounded bg-red-900/50 border border-red-700 px-3 py-2 text-sm text-red-300">{errorMsg}</p>
        )}

        {submissionId && (
          <p className="mb-2 text-xs text-zinc-400">
            Submission ID: {submissionId}
          </p>
        )}

        {retryCount > 0 && (
          <p className="mb-2 text-xs text-yellow-400">
            Retry attempts: {retryCount}
          </p>
        )}

        {successMsg && (
          <p className="mb-3 rounded bg-green-900/50 border border-green-700 px-3 py-2 text-sm text-green-300">{successMsg}</p>
        )}

        <button
          onClick={handleSignup}
          disabled={loading || isSubmitting}
          className="w-full rounded bg-indigo-600 hover:bg-indigo-500 p-2 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading || isSubmitting
            ? "Processing..."
            : "Sign Up"}
        </button>

        <p className="mt-4 text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <Link
            href={nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login"}
            className="text-indigo-400 hover:text-indigo-300"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
