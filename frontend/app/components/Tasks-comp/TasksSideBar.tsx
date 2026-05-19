"use client";

import React from "react";
import Link from "next/link";

export default function TasksSidebar() {
  return (
    <aside className="hidden md:flex flex-col h-screen w-72 bg-transparent p-8 gap-8 z-50 shrink-0">
      <div className="px-2">
        <h2 className="font-headline-md text-[20px] tracking-tight font-extrabold text-primary">
          Project Alpha
        </h2>
        <p className="font-label-md text-[11px] uppercase tracking-widest text-on-surface-variant opacity-60">
          Flow Engine
        </p>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        <Link className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:text-primary transition-all duration-300 group" href="/insights/overview">
          <span className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform">dashboard</span>
          <span className="font-label-md text-label-md">Overview</span>
        </Link>

        <Link className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:text-primary transition-all duration-300 group" href="/insights/analytics">
          <span className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform">insights</span>
          <span className="font-label-md text-label-md">Analytics</span>
        </Link>

        <Link className="flex items-center gap-4 px-4 py-3 text-primary font-bold transition-all duration-300" href="/insights/tasks">
          <span className="material-symbols-outlined text-[22px]">route</span>
          <span className="font-label-md text-label-md">Tasks</span>
        </Link>

        <Link className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:text-primary transition-all duration-300 group" href="/insights/feed">
          <span className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform">forum</span>
          <span className="font-label-md text-label-md">Feed</span>
        </Link>
      </nav>

      <div className="flex flex-col gap-4 pt-8 border-t border-outline-variant/30">
        <button className="bg-primary text-on-primary font-label-md text-[13px] py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Insight
        </button>

        <div className="flex flex-col gap-1">
          <Link className="flex items-center gap-4 px-4 py-2 text-on-surface-variant hover:text-primary transition-colors" href="#">
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span className="font-label-md text-label-md">Settings</span>
          </Link>
          <Link className="flex items-center gap-4 px-4 py-2 text-on-surface-variant hover:text-primary transition-colors" href="#">
            <span className="material-symbols-outlined text-[20px]">help_outline</span>
            <span className="font-label-md text-label-md">Support</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
