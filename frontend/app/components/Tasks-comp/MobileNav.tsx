"use client";

import React from "react";
import Link from "next/link";

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-surface/90 backdrop-blur-xl border border-outline-variant shadow-2xl rounded-2xl h-16 flex items-center justify-around px-4 z-50">
      <Link className="p-2 text-on-surface-variant" href="/insights/overview">
        <span className="material-symbols-outlined">dashboard</span>
      </Link>
      <Link className="p-2 text-on-surface-variant" href="/insights/analytics">
        <span className="material-symbols-outlined">insights</span>
      </Link>
      <Link className="p-3 bg-primary text-on-primary rounded-xl" href="/insights/tasks">
        <span className="material-symbols-outlined">route</span>
      </Link>
      <Link className="p-2 text-on-surface-variant" href="/insights/feed">
        <span className="material-symbols-outlined">forum</span>
      </Link>
    </nav>
  );
}
