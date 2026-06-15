"use client";

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
  normalizedKey: string;
};

type FilterValidation = {
  valid: boolean;
  reason: string | null;
};

type FilterQueryMetadata = {
  querySignature: string;
  evaluatedAt: number;
  filterCount: number;
};

type FilterEvaluationSummary = {
  normalized: boolean;
  validationPassed: boolean;
  resultConsistency: boolean;
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

function normalizeFilterName(
  filter: FeedFilter
) {
  return filter
    .toLowerCase()
    .trim();
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
      normalizedKey:
        normalizeFilterName(
          filter
        ),
    })
  ).sort(
    (a, b) =>
      a.priority -
      b.priority
  );
}

function validateFilterSelection(
  filter: FeedFilter
): FilterValidation {
  const exists =
    FILTERS.includes(filter);

  return {
    valid: exists,
    reason: exists
      ? null
      : "Unknown filter",
  };
}

function buildQueryMetadata(
  filters: FilterDescriptor[]
): FilterQueryMetadata {
  return {
    querySignature:
      filters
        .map(
          (filter) =>
            filter.normalizedKey
        )
        .join("|"),
    evaluatedAt:
      Date.now(),
    filterCount:
      filters.length,
  };
}

function buildEvaluationSummary(
  validation: FilterValidation
): FilterEvaluationSummary {
  return {
    normalized: true,
    validationPassed:
      validation.valid,
    resultConsistency:
      validation.valid,
  };
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

  const filterValidation =
    useMemo(
      () =>
        validateFilterSelection(
          filterState.activeFilter
        ),
      [
        filterState.activeFilter,
      ]
    );

  const queryMetadata =
    useMemo(
      () =>
        buildQueryMetadata(
          normalizedFilters
        ),
      [normalizedFilters]
    );

  const evaluationSummary =
    useMemo(
      () =>
        buildEvaluationSummary(
          filterValidation
        ),
      [filterValidation]
    );

  return (
    <div className="flex bg-surface-container-high rounded-lg p-1">
      <div className="hidden">
        Filter Evaluation v
        {
          filterState.evaluationVersion
        }
      </div>

      <div className="hidden">
        {
          queryMetadata.querySignature
        }
      </div>

      <div className="hidden">
        {
          evaluationSummary.validationPassed
            ? "valid"
            : "invalid"
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
            data-normalized-key={
              filter.normalizedKey
            }
            onClick={() => {
              const validation =
                validateFilterSelection(
                  filter.name
                );

              if (
                validation.valid
              ) {
                onChange(
                  filter.name
                );
              }
            }}
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