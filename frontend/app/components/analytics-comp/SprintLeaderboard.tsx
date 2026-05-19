"use client";

import { useMemo } from "react";
import type { MemberPerformance } from "./PerformanceSummary";

export type LeaderboardSortKey = "score" | "completed" | "reviews";

type SprintLeaderboardProps = {
  sprint: string;
  members: MemberPerformance[];
  sortKey: LeaderboardSortKey;
  onSortChange: (sortKey: LeaderboardSortKey) => void;
};

function impactScore(member: MemberPerformance) {
  return Number((member.completed * 0.8 + member.reviews * 1.6).toFixed(1));
}

export default function SprintLeaderboard({
  sprint,
  members,
  sortKey,
  onSortChange,
}: SprintLeaderboardProps) {
  const sortedRows = useMemo(() => {
    return [...members].sort((a, b) => {
      if (sortKey === "score") return impactScore(b) - impactScore(a);
      return b[sortKey] - a[sortKey];
    });
  }, [members, sortKey]);

  return (
    <section>
      <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="px-card-padding py-6 bg-surface-container-low border-b border-outline-variant flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-headline-md text-headline-md">
              Sprint Participation Leaderboard
            </h3>
            <p className="text-label-md text-on-surface-variant">
              Sort by impact score, completed work, or peer reviews.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1 bg-primary-container text-on-primary-container rounded-full font-label-md">
              Active Sprint: {sprint.replace("Sprint ", "")}
            </div>
            {(["score", "completed", "reviews"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onSortChange(item)}
                className={`rounded-full px-3 py-1 font-label-md capitalize transition ${
                  sortKey === item
                    ? "bg-primary text-on-primary"
                    : "bg-surface hover:bg-secondary-container"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-on-surface-variant font-label-md border-b border-outline-variant">
                <th className="px-card-padding py-4">Rank</th>
                <th className="px-card-padding py-4">Member</th>
                <th className="px-card-padding py-4">Stories Resolved</th>
                <th className="px-card-padding py-4">Peer Reviews</th>
                <th className="px-card-padding py-4 text-right">Impact Score</th>
              </tr>
            </thead>
            <tbody className="font-body-md">
              {sortedRows.map((row, index) => (
                <tr key={row.id} className="border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors">
                  <td className="px-card-padding py-4 font-bold text-primary">
                    {(index + 1).toString().padStart(2, "0")}
                  </td>
                  <td className="px-card-padding py-4">
                    <div className="flex items-center gap-3">
                      <img alt={row.name} className="w-8 h-8 rounded-full" src={row.image} />
                      <div>
                        <span>{row.name}</span>
                        <p className="text-xs text-on-surface-variant">{row.focus}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-card-padding py-4 font-data-viz">{row.completed}</td>
                  <td className="px-card-padding py-4 font-data-viz">{row.reviews}</td>
                  <td className="px-card-padding py-4 text-right font-bold text-primary">{impactScore(row)}</td>
                </tr>
              ))}
              {sortedRows.length === 0 && (
                <tr>
                  <td className="px-card-padding py-8 text-center text-on-surface-variant" colSpan={5}>
                    No members match the current search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
