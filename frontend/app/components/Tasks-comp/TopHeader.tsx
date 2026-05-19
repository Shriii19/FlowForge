"use client";

import React from "react";

export default function TopHeader() {
  return (
    <header className="bg-surface80 backdrop-blur-md sticky top-0 z-50 border-b border-surface-variant50">
      <div className="flex justify-between items-center w-full px-margin-desktop max-w-container-max mx-auto h-20">
        <div className="flex items-center gap-12">
          <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight">
            Flow Insights
          </span>

          <nav className="hidden md:flex items-center gap-8">
            <a className="text-on-surface-variant70 hover:text-primary transition-colors font-label-md text-label-md" href="#">
              Projects
            </a>
            <a className="text-on-surface-variant70 hover:text-primary transition-colors font-label-md text-label-md" href="#">
              Dashboard
            </a>
            <a className="text-primary font-semibold border-b-2 border-primary40 pb-1 font-label-md text-label-md" href="#">
              Insights
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative group">
            <span className="material-symbols-outlined text-on-surface-variant70 p-2 rounded-full hover:bg-surface-container transition-all cursor-pointer">
              notifications
            </span>
          </div>

          <div className="relative group">
            <span className="material-symbols-outlined text-on-surface-variant70 p-2 rounded-full hover:bg-surface-container transition-all cursor-pointer">
              settings
            </span>
          </div>

          <img
            alt="User profile"
            className="w-9 h-9 rounded-full object-cover ring-1 ring-outline-variant"
            src="https://lh3.googleusercontent.com/a-/AOh14Ghexample"
          />
        </div>
      </div>
    </header>
  );
}