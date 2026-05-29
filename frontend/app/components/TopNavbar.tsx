"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import NotificationsPanel from "./NotificationsPanel";

export default function TopNavbar() {
  const pathname = usePathname();

  return (
    <header className="h-20 border-b border-outline-variant bg-white">
      <div className="flex h-full items-center justify-between px-8">

        {/* Left Side */}
        <div className="flex items-center gap-10">
          <Link
            href="/dashboard"
            className="text-[20px] font-bold text-primary"
          >
            FlowForge
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/projects"
              className={`pb-1 text-sm transition-colors ${
                pathname.startsWith("/projects")
                  ? "border-b-2 border-primary font-semibold text-primary"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              Projects
            </Link>

            <Link
              href="/dashboard"
              className={`pb-1 text-sm transition-colors ${
                pathname.startsWith("/dashboard")
                  ? "border-b-2 border-primary font-semibold text-primary"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              Dashboard
            </Link>

            <Link
              href="/insights/overview"
              className={`pb-1 text-sm transition-colors ${
                pathname.startsWith("/insights")
                  ? "border-b-2 border-primary font-semibold text-primary"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              Insights
            </Link>
          </nav>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-5">
          <NotificationsPanel />

          <button
            className="
              rounded-full p-2
              text-on-surface-variant
              transition-all duration-200
              hover:bg-surface-container-low
            "
            type="button"
          >
            <span className="material-symbols-outlined">
              settings
            </span>
          </button>

          <img
            alt="User profile"
            src="https://i.pravatar.cc/80?img=32"
            className="
              h-10 w-10 rounded-full
              border border-outline-variant
              object-cover
            "
          />
        </div>
      </div>
    </header>
  );
}