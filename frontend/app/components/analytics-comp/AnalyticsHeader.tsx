"use client";

import Link from "next/link";

type AnalyticsHeaderProps = {
  sprint: string;
  sprints: string[];
  query: string;
  onQueryChange: (query: string) => void;
  onSprintChange: (sprint: string) => void;
};

export default function AnalyticsHeader({
  sprint,
  sprints,
  query,
  onQueryChange,
  onSprintChange,
}: AnalyticsHeaderProps) {
  return (
    <header className="sticky top-0 z-10 w-full bg-surface/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-container-max flex-col gap-3 px-6 py-3 md:px-margin-desktop lg:flex-row lg:items-center">
        <div className="flex items-center gap-8 flex-1">
          <div className="md:hidden font-headline-md font-bold text-primary">
            Flow Insights
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link className="text-on-surface-variant hover:text-primary transition-colors font-label-md" href="/projects">
              Projects
            </Link>
            <Link className="text-on-surface-variant hover:text-primary transition-colors font-label-md" href="/dashboard">
              Dashboard
            </Link>
            <Link className="text-primary font-bold border-b-2 border-primary pb-1 font-label-md" href="/insights/analytics">
              Insights
            </Link>
          </nav>
        </div>

        <div className="flex flex-1 flex-col gap-3 sm:flex-row lg:max-w-2xl">
          <select
            value={sprint}
            onChange={(event) => onSprintChange(event.target.value)}
            className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 font-label-md outline-none transition focus:border-primary"
          >
            {sprints.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search member, role, or focus..."
            className="min-w-0 flex-1 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2 font-label-md outline-none transition focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-all duration-200 active:scale-90" type="button">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-all duration-200 active:scale-90" type="button">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-outline-variant overflow-hidden">
            <img
              alt="User profile"
              className="w-full h-full object-cover"
              src="https://i.pravatar.cc/80?img=32"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
