"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function HomePage() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  const navLink = (path: string) =>
    `relative px-2 py-1 transition ${
      pathname === path
        ? "text-slate-900 font-semibold after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-slate-900"
        : "text-slate-600 hover:text-slate-900"
    }`;

  return (
    <div className="min-h-screen bg-white">
      {/* 🔝 NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-(--line) bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 backdrop-blur shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-10">
          {/* 🧩 LOGO */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--bg-soft) font-bold text-slate-900 shadow-sm">
              F
            </div>
            <span className="text-lg font-semibold text-slate-900">
              FlowForge
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <Link href="/projects" className={navLink("/projects")}>
              Projects
            </Link>

            <Link href="/dashboard" className={navLink("/dashboard")}>
              Dashboard
            </Link>

            <div className="ml-6 flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-lg px-3 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="accent-btn rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition hover:shadow-md hover:scale-105"
              >
                Sign up
              </Link>
            </div>
          </nav>

          {/* 🍔 MOBILE BUTTON */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden rounded-lg p-2 text-slate-700 hover:bg-slate-100"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* 📱 MOBILE MENU */}
        {menuOpen && (
          <div className="md:hidden border-t border-(--line) bg-white px-4 py-4 space-y-3 animate-fadeIn">
            <Link href="/projects" className={navLink("/projects")}>
              Projects
            </Link>
            <Link href="/dashboard" className={navLink("/dashboard")}>
              Dashboard
            </Link>
            <Link href="/login" className={navLink("/login")}>
              Login
            </Link>
            <Link
              href="/signup"
              className="block accent-btn rounded-xl px-4 py-2 text-center"
            >
              Sign up
            </Link>
          </div>
        )}
      </header>

      {/* ✨ MAIN */}
      <main
        className={`mx-auto grid min-h-[calc(100vh-6rem)] max-w-7xl items-center gap-12 px-4 py-10 md:grid-cols-2 md:px-10 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {/* LEFT */}
        <section>
          <p className="chip inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            Team Workflow
          </p>

          <h1 className="mt-5 text-4xl font-bold leading-tight text-slate-900 md:text-6xl">
            Build faster with shared momentum.
          </h1>

          <p className="mt-5 max-w-lg text-slate-600 md:text-lg">
            FlowForge keeps your projects, workspace updates, and team chat in
            one focused command center.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/dashboard"
              className="accent-btn rounded-xl px-6 py-3 text-sm font-semibold transition hover:scale-105"
            >
              Get Started
            </Link>

            <Link
              href="/projects"
              className="rounded-xl border border-(--line) bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Explore Projects
            </Link>
          </div>
        </section>

        {/* RIGHT PANEL */}
        <section className="panel p-6 transition hover:shadow-xl md:p-8">
          <h2 className="text-xl font-semibold text-slate-900">
            Live Activity
          </h2>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-(--bg-soft) p-4 transition hover:scale-[1.02]">
              <span className="text-sm text-slate-600">New Task Added</span>
              <span className="text-xs text-slate-400">2m ago</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-(--bg-soft) p-4 transition hover:scale-[1.02]">
              <span className="text-sm text-slate-600">Project Updated</span>
              <span className="text-xs text-slate-400">10m ago</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-(--bg-soft) p-4 transition hover:scale-[1.02]">
              <span className="text-sm text-slate-600">New Member Joined</span>
              <span className="text-xs text-slate-400">1h ago</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
