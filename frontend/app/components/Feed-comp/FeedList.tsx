"use client";

import { useMemo, useRef } from "react";
import FeedItem from "./FeedItem";

export type FeedActivityType =
  | "code"
  | "discussion"
  | "milestone";

export type FeedActivityItem = {
  id: string;
  type: FeedActivityType;
  actor: string;
  action: string;
  title: string;
  body: string;
  time: string;
  group: string;
  meta: string;
  image: string | null;
  progress: number | null;
};

type FeedListProps = {
  items: FeedActivityItem[];
  totalCount: number;
  onLoadMore: () => void;
};

type PaginationSnapshot = {
  totalItems: number;
  visibleItems: number;
  pageVersion: number;
};

type PaginationDiagnostics = {
  reconciliationCount: number;
  boundaryAdjustments: number;
  datasetMutations: number;
};

function createPaginationSnapshot(
  items: FeedActivityItem[],
  totalCount: number
): PaginationSnapshot {
  return {
    totalItems: totalCount,
    visibleItems: items.length,
    pageVersion: Date.now(),
  };
}

function detectDatasetMutation(
  current: PaginationSnapshot,
  previous: PaginationSnapshot | null
) {
  if (!previous) {
    return false;
  }

  return (
    current.totalItems !== previous.totalItems ||
    current.visibleItems !== previous.visibleItems
  );
}

function normalizePaginationBoundary(
  visibleItems: number,
  totalItems: number
) {
  return Math.min(
    visibleItems,
    totalItems
  );
}

function reconcilePaginationState(
  snapshot: PaginationSnapshot
) {
  return {
    ...snapshot,
    visibleItems:
      normalizePaginationBoundary(
        snapshot.visibleItems,
        snapshot.totalItems
      ),
  };
}

function buildPaginationDiagnostics(): PaginationDiagnostics {
  return {
    reconciliationCount: 0,
    boundaryAdjustments: 0,
    datasetMutations: 0,
  };
}

export default function FeedList({
  items,
  totalCount,
  onLoadMore,
}: FeedListProps) {
  const previousSnapshotRef =
    useRef<PaginationSnapshot | null>(
      null
    );

  const diagnosticsRef =
    useRef<PaginationDiagnostics>(
      buildPaginationDiagnostics()
    );

  const paginationSnapshot =
    useMemo(
      () =>
        reconcilePaginationState(
          createPaginationSnapshot(
            items,
            totalCount
          )
        ),
      [items, totalCount]
    );

  const datasetMutated =
    detectDatasetMutation(
      paginationSnapshot,
      previousSnapshotRef.current
    );

  if (datasetMutated) {
    diagnosticsRef.current.datasetMutations += 1;
    diagnosticsRef.current.reconciliationCount += 1;
  }

  previousSnapshotRef.current =
    paginationSnapshot;

  const groupedItems = useMemo(
    () =>
      items.reduce<
        Record<
          string,
          FeedActivityItem[]
        >
      >((acc, item) => {
        if (!acc[item.group]) {
          acc[item.group] = [];
        }

        acc[item.group].push(item);

        return acc;
      }, {}),
    [items]
  );

  return (
    <>
      {Object.entries(groupedItems).map(
        ([group, groupItems]) => (
          <section
            key={group}
            className="space-y-gutter"
          >
            <div className="flex items-center gap-4 py-4">
              <span className="font-label-md text-label-md text-outline uppercase tracking-widest">
                {group}
              </span>

              <div className="h-px bg-outline-variant flex-1" />
            </div>

            {groupItems.map((item) => (
              <FeedItem
                key={item.id}
                item={item}
              />
            ))}
          </section>
        )
      )}

      {items.length === 0 && (
        <div className="glass-card rounded-xl p-10 text-center text-on-surface-variant">
          No activity matches the
          current filters.
        </div>
      )}

      {items.length <
        totalCount && (
        <div className="flex justify-center py-12">
          <button
            type="button"
            onClick={onLoadMore}
            className="px-8 py-3 border border-outline-variant text-primary font-label-md text-label-md rounded-full hover:bg-white hover:shadow-sm transition-all duration-300"
          >
            Load older activity
          </button>
        </div>
      )}

      <div
        className="hidden"
        data-page-version={
          paginationSnapshot.pageVersion
        }
        data-visible-items={
          paginationSnapshot.visibleItems
        }
        data-total-items={
          paginationSnapshot.totalItems
        }
        data-reconciliations={
          diagnosticsRef.current
            .reconciliationCount
        }
        data-dataset-mutations={
          diagnosticsRef.current
            .datasetMutations
        }
      />
    </>
  );
}