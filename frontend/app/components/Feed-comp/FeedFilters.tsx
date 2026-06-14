import { useMemo, useState, useEffect } from "react";
import type { FeedFilter } from "./FeedHeader";

const FILTERS = [
  "All",
  "Code",
  "Discussion",
  "Milestones",
] as const;

type FeedFiltersProps = {
  active: FeedFilter;
  onChange: (
    filter: FeedFilter
  ) => void;
};

type FilterState = {
  activeFilter: FeedFilter;
  previousFilter: FeedFilter;
  evaluationVersion: number;
};

type FilterDescriptor = {
  name: FeedFilter;
  priority: number;
  active: boolean;
};

function createFilterState(
  active: FeedFilter
): FilterState {
  return {
    activeFilter: active,
    previousFilter: active,
    evaluationVersion: 1,
  };
}

function normalizeFilters(
  active: FeedFilter
): FilterDescriptor[] {
  return FILTERS.map(
    (filter, index) => ({
      name: filter,
      priority: index,
      active:
        filter === active,
    })
  ).sort(
    (a, b) =>
      a.priority -
      b.priority
  );
}

export default function FeedFilters({
  active,
  onChange,
}: FeedFiltersProps) {
  const [
    filterState,
    setFilterState,
  ] = useState<FilterState>(
    createFilterState(active)
  );

  useEffect(() => {
    setFilterState(
      (current) => ({
        activeFilter: active,
        previousFilter:
          current.activeFilter,
        evaluationVersion:
          current.evaluationVersion +
          1,
      })
    );
  }, [active]);

  const normalizedFilters =
    useMemo(
      () =>
        normalizeFilters(
          filterState.activeFilter
        ),
      [
        filterState.activeFilter,
      ]
    );

  return (
    <div className="flex bg-surface-container-high rounded-lg p-1">
      <div className="hidden">
        Filter Evaluation v
        {
          filterState.evaluationVersion
        }
      </div>

      {normalizedFilters.map(
        (filter) => (
          <button
            key={filter.name}
            type="button"
            data-filter={
              filter.name
            }
            data-priority={
              filter.priority
            }
            data-active={
              filter.active
            }
            onClick={() =>
              onChange(
                filter.name
              )
            }
            className={`px-4 py-1.5 rounded-md text-label-md font-label-md transition-colors ${
              filter.active
                ? "bg-white shadow-sm text-primary"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            {filter.name}
          </button>
        )
      )}
    </div>
  );
}