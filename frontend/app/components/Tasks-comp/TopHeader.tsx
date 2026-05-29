"use client";

import React from "react";

export default function TopHeader() {
  return (
    <header className="border-b border-surface-variant50 bg-white">
      <div className="mx-auto flex h-20 w-full max-w-container-max items-center justify-between px-margin-desktop">

        {/* Title */}
        <div className="flex items-center">
          <span className="font-headline-md text-headline-md font-bold tracking-tight text-primary">
            Flow Insights
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
          <div className="relative group">
            <span className="material-symbols-outlined cursor-pointer rounded-full p-2 text-on-surface-variant70 transition-all hover:bg-surface-container">
              notifications
            </span>
          </div>

          <div className="relative group">
            <span className="material-symbols-outlined cursor-pointer rounded-full p-2 text-on-surface-variant70 transition-all hover:bg-surface-container">
              settings
            </span>
          </div>

          <img
            alt="User profile"
            className="h-9 w-9 rounded-full object-cover ring-1 ring-outline-variant"
            src="https://lh3.googleusercontent.com/a-/AOh14Ghexample"
          />
        </div>
      </div>
    </header>
  );
}