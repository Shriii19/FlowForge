"use client";

import React from "react";

export default function TasksHeader() {
  return (
    <header className="flex justify-between items-center w-full px-4 md:px-margin-desktop h-20 bg-transparent z-40 shrink-0">
      <div className="flex items-center gap-12">
        <h1 className="font-headline-md text-[26px] font-bold text-on-surface">
          Flow Insights
        </h1>

        <div className="hidden lg:flex items-center gap-8">
          <a className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md" href="#">
            Projects
          </a>
          <a className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md" href="#">
            Dashboard
          </a>
          <a className="text-primary font-bold border-b-2 border-primary pb-1 font-label-md text-label-md" href="#">
            Insights
          </a>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center bg-surface-container-low/50 backdrop-blur px-4 py-2 rounded-xl border border-outline-variant/50">
          <span className="material-symbols-outlined text-outline text-[20px]">search</span>
          <input
            className="bg-transparent border-none focus:ring-0 text-body-md font-body-md w-48 placeholder:text-outline"
            placeholder="Search tasks..."
            type="text"
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2.5 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-all">
            <span className="material-symbols-outlined text-[22px]">notifications</span>
          </button>
          <img
            alt="User profile"
            className="w-9 h-9 rounded-full border-2 border-surface shadow-sm ml-2"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkg4vnO8f5CYXs98lXGmEBvpJyvEeFPY6KpI0D_WhJwkurBhewAXswpL7cAddlTuhyR3U9Yk7rCC4QV5tyDr0o5el9lVbLOgvEy_qlV0DyU9TlHmMDHO4uZFtQcTplFQsXMmQOR-dZXVcZUPmKq_m27_2QK0GkIeecDTElHOJNFY7pLXTxpxz2cAsyUuYpFz_aAdJmFIESRW7TrFVHQ8zx3z2-_8VPIKY6tZawlDn4j6nMx6noasR9sKFo1YvfhZp-qJ3HPbjktw5E"
          />
        </div>
      </div>
    </header>
  );
}
