import type { FeedFilter } from "./FeedHeader";

const FILTERS = ["All", "Code", "Discussion", "Milestones"] as const;

type FeedFiltersProps = {
  active: FeedFilter;
  onChange: (filter: FeedFilter) => void;
};

export default function FeedFilters({ active, onChange }: FeedFiltersProps) {
  return (
    <div className="flex bg-surface-container-high rounded-lg p-1">
      {FILTERS.map((filter) => {
        const isActive = active === filter;
        return (
          <button
            key={filter}
            type="button"
            onClick={() => onChange(filter)}
            className={`px-4 py-1.5 rounded-md text-label-md font-label-md transition-colors ${
              isActive
                ? "bg-white shadow-sm text-primary"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
}
