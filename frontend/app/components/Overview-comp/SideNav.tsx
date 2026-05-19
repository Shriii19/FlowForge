"use client";

import React from "react";
import Link from "next/link";

export default function SideNav() {
  return (
    <aside className="hidden lg:flex flex-col w-64 p-6 border-r border-outline-variant20 sticky top-20 h-calc100vh-80px bg-surface30">
      <div className="flex items-center gap-3 px-2 py-4 mb-8">
        <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center text-on-primary-container">
          <span className="material-symbols-outlined">analytics</span>
        </div>
        <div>
          <h2 className="font-headline-md text-18px font-bold text-primary leading-none">Project Alpha</h2>
          <p className="text-11px text-on-surface-variant60 uppercase tracking-widest mt-1">Enterprise</p>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        <Link className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all bg-primary10 text-primary font-semibold" href="/insights/overview">
          <span className="material-symbols-outlined text-20px">dashboard</span>
          <span className="font-label-md text-label-md">Overview</span>
        </Link>

        <Link className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-on-surface-variant70 hover:text-primary hover:bg-primary5" href="/insights/overview">
          <span className="material-symbols-outlined text-20px">insights</span>
          <span className="font-label-md text-label-md">Insights</span>
        </Link>

        <Link className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-on-surface-variant70 hover:text-primary hover:bg-primary5" href="/insights/analytics">
          <span className="material-symbols-outlined text-20px">insights</span>
          <span className="font-label-md text-label-md">Analytics</span>
        </Link>

        <Link className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-on-surface-variant70 hover:text-primary hover:bg-primary5" href="/insights/tasks">
          <span className="material-symbols-outlined text-20px">routes</span>
          <span className="font-label-md text-label-md">Tasks</span>
        </Link>

        <Link className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-on-surface-variant70 hover:text-primary hover:bg-primary5" href="/insights/feed">
          <span className="material-symbols-outlined text-20px">forum</span>
          <span className="font-label-md text-label-md">Feed</span>
        </Link>
      </nav>

      <button className="mt-8 w-full bg-primary text-on-primary py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-primary10 transition-all active:scale-95 flex items-center justify-center gap-2">
        <span className="material-symbols-outlined text-18px">add</span>
        New Insight
      </button>

      <div className="mt-auto pt-6 border-t border-outline-variant20">
        <a className="flex items-center gap-3 px-4 py-2 text-on-surface-variant50 hover:text-primary transition-colors" href="#">
          <span className="material-symbols-outlined text-18px">settings</span>
          <span className="text-13px font-medium">Settings</span>
        </a>

        <a className="flex items-center gap-3 px-4 py-2 text-on-surface-variant50 hover:text-primary transition-colors" href="#">
          <span className="material-symbols-outlined text-18px">help_outline</span>
          <span className="text-13px font-medium">Support</span>
        </a>
      </div>
    </aside>
  );
}
