"use client";

import FeedFilters from "./FeedFilters";

export type FeedFilter = "All" | "Code" | "Discussion" | "Milestones";

type FeedHeaderProps = {
  activeFilter: FeedFilter;
  query: string;
  isLoading: boolean;
  status: string;
  onCreateInsight: () => void;
  onFilterChange: (filter: FeedFilter) => void;
  onQueryChange: (query: string) => void;
};

export default function FeedHeader({
  activeFilter,
  query,
  isLoading,
  status,
  onCreateInsight,
  onFilterChange,
  onQueryChange,
}: FeedHeaderProps) {
  return (
    <header className="w-full glass-card sticky top-0 z-10 px-4 md:px-margin-desktop py-4 border-b border-white/40">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="font-headline-md text-headline-md text-primary">
            Activity Feed
          </h2>
          <p className="text-label-md text-on-surface-variant">
            {isLoading ? "Refreshing backend activity..." : status || "Live project updates from tasks and team messages."}
          </p>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search feed..."
            className="min-w-0 rounded-lg border border-outline-variant bg-white px-4 py-2 text-label-md outline-none transition focus:border-primary lg:w-64"
          />

          <FeedFilters active={activeFilter} onChange={onFilterChange} />

          <button
            type="button"
            onClick={onCreateInsight}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-label-md font-label-md text-on-primary transition-all hover:opacity-90 active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Insight
          </button>
        </div>
      </div>
    </header>
  );
}
