"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import AnalyticsHeader from "@/app/components/analytics-comp/AnalyticsHeader";
import PerformanceSummary, {
  type AnalyticsMetric,
  type MemberPerformance,
} from "@/app/components/analytics-comp/PerformanceSummary";
import MemberAnalytics from "@/app/components/analytics-comp/MemberAnalytics";
import SprintLeaderboard, {
  type LeaderboardSortKey,
} from "@/app/components/analytics-comp/SprintLeaderboard";
import AnalyticsMobileNav from "@/app/components/analytics-comp/AnalyticsMobileNav";
import TrendMetricCard from "@/app/components/analytics-comp/TrendMetricCard";

const sprintData: Record<string, MemberPerformance[]> = {
  "Sprint 42": [
    {
      id: "alex",
      name: "Alex Rivera",
      role: "Lead Frontend Engineer",
      assigned: 85,
      completed: 72,
      reviews: 18,
      focus: "Frontend",
      activity: [30, 50, 80, 100, 90, 60, 20, 85],
      image: "https://i.pravatar.cc/96?img=11",
    },
    {
      id: "jordan",
      name: "Jordan Smith",
      role: "Backend Engineer",
      assigned: 60,
      completed: 58,
      reviews: 15,
      focus: "API",
      activity: [45, 65, 55, 80, 70, 64, 58, 75],
      image: "https://i.pravatar.cc/96?img=12",
    },
    {
      id: "casey",
      name: "Casey Morgan",
      role: "Fullstack Developer",
      assigned: 95,
      completed: 90,
      reviews: 24,
      focus: "Fullstack",
      activity: [70, 40, 90, 100, 50, 80, 30, 95],
      image: "https://i.pravatar.cc/96?img=13",
    },
    {
      id: "riley",
      name: "Riley Lee",
      role: "QA Analyst",
      assigned: 45,
      completed: 45,
      reviews: 11,
      focus: "QA",
      activity: [35, 55, 42, 62, 78, 45, 68, 72],
      image: "https://i.pravatar.cc/96?img=14",
    },
    {
      id: "morgan",
      name: "Morgan Patel",
      role: "Product Engineer",
      assigned: 80,
      completed: 40,
      reviews: 9,
      focus: "Product",
      activity: [25, 35, 52, 48, 60, 42, 38, 50],
      image: "https://i.pravatar.cc/96?img=15",
    },
    {
      id: "quinn",
      name: "Quinn Taylor",
      role: "DevOps Engineer",
      assigned: 70,
      completed: 68,
      reviews: 14,
      focus: "Ops",
      activity: [55, 68, 72, 75, 62, 74, 80, 78],
      image: "https://i.pravatar.cc/96?img=16",
    },
  ],
  "Sprint 41": [
    {
      id: "alex",
      name: "Alex Rivera",
      role: "Lead Frontend Engineer",
      assigned: 76,
      completed: 70,
      reviews: 21,
      focus: "Frontend",
      activity: [44, 58, 62, 88, 92, 70, 55, 81],
      image: "https://i.pravatar.cc/96?img=11",
    },
    {
      id: "jordan",
      name: "Jordan Smith",
      role: "Backend Engineer",
      assigned: 72,
      completed: 61,
      reviews: 12,
      focus: "API",
      activity: [40, 48, 65, 72, 68, 71, 52, 64],
      image: "https://i.pravatar.cc/96?img=12",
    },
    {
      id: "casey",
      name: "Casey Morgan",
      role: "Fullstack Developer",
      assigned: 88,
      completed: 84,
      reviews: 20,
      focus: "Fullstack",
      activity: [58, 74, 82, 95, 76, 86, 62, 91],
      image: "https://i.pravatar.cc/96?img=13",
    },
    {
      id: "riley",
      name: "Riley Lee",
      role: "QA Analyst",
      assigned: 52,
      completed: 49,
      reviews: 16,
      focus: "QA",
      activity: [62, 60, 70, 66, 78, 74, 72, 80],
      image: "https://i.pravatar.cc/96?img=14",
    },
    {
      id: "morgan",
      name: "Morgan Patel",
      role: "Product Engineer",
      assigned: 66,
      completed: 59,
      reviews: 10,
      focus: "Product",
      activity: [32, 46, 58, 62, 60, 55, 64, 68],
      image: "https://i.pravatar.cc/96?img=15",
    },
  ],
};

type AnalyticsResponse = {
  sprints: Array<{
    label: string;
    members: MemberPerformance[];
  }>;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function InsightsAnalyticsPage() {
  const [data, setData] = useState(sprintData);
  const [sprintA, setSprintA] = useState("Sprint 42");
  const [sprintB, setSprintB] = useState("Sprint 41");
  const [metric, setMetric] = useState<AnalyticsMetric>("completed");
  const [selectedMemberId, setSelectedMemberId] = useState("casey");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<LeaderboardSortKey>("score");
  const [comparisonSort, setComparisonSort] = useState<
    "improvement" | "decline" | "name"
  >("improvement");
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadAnalytics() {
      setIsLoading(true);
      setLoadError("");
      try {
        const session = await supabase?.auth.getSession();

        const token = session?.data.session?.access_token;
        const response = await fetch(`${API_URL}/api/analytics`, {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to load analytics");
        const body = (await response.json()) as AnalyticsResponse;
        const nextData = body.sprints.reduce<
          Record<string, MemberPerformance[]>
        >((acc, item) => {
          acc[item.label] = item.members;
          return acc;
        }, {});

        if (Object.keys(nextData).length > 0) {
          setData(nextData);
          const firstSprint = Object.keys(nextData)[0];
          setSprintA((current) => (nextData[current] ? current : firstSprint));
          setSelectedMemberId((current) => {
            const activeMembers = nextData[firstSprint] || [];
            return activeMembers.some((member) => member.id === current)
              ? current
              : activeMembers[0]?.id || current;
          });
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setLoadError(
            "Showing local analytics because the backend is unavailable.",
          );
        }
      } finally {
        setIsLoading(false);
      }
    }

    void loadAnalytics();
    return () => controller.abort();
  }, []);

  const members = useMemo(
    () => data[sprintA] || Object.values(data)[0] || [],
    [data, sprintA],
  );
  const compareMembers = useMemo(() => data[sprintB] || [], [data, sprintB]);

  const sprintAMetrics = {
    completed: members.reduce((sum, member) => sum + member.completed, 0),
    reviews: members.reduce((sum, member) => sum + member.reviews, 0),
  };

  const sprintBMetrics = {
    completed: compareMembers.reduce(
      (sum, member) => sum + member.completed,
      0,
    ),
    reviews: compareMembers.reduce((sum, member) => sum + member.reviews, 0),
  };
  const contributorComparison = members
    .map((member) => {
      const previousMember = compareMembers.find(
        (item) => item.id === member.id,
      );

      const previousCompleted = previousMember?.completed ?? 0;

      const change = member.completed - previousCompleted;

      return {
        id: member.id,
        name: member.name,
        current: member.completed,
        previous: previousCompleted,
        change,
      };
    })
    .sort((a, b) => {
      if (comparisonSort === "improvement") {
        return b.change - a.change;
      }

      if (comparisonSort === "decline") {
        return a.change - b.change;
      }

      return a.name.localeCompare(b.name);
    });
  const exportContributorComparisonCSV = () => {
    if (contributorComparison.length === 0) {
      return;
    }

    const rows = [
      ["Contributor", sprintA, sprintB, "Change"],
      ...contributorComparison.map((member) => [
        member.name,
        member.current,
        member.previous,
        member.change,
      ]),
    ];

    const csvContent = rows.map((row) => row.join(",")).join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `contributor-comparison-${sprintA}-vs-${sprintB}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const selectedMember =
    members.find((member) => member.id === selectedMemberId) ?? members[0];

  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return members;
    return members.filter((member) =>
      [member.name, member.role, member.focus].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [members, query]);

  return (
    <>
      <AnalyticsHeader
        sprintA={sprintA}
        sprintB={sprintB}
        sprints={Object.keys(data)}
        query={query}
        onQueryChange={setQuery}
        onSprintAChange={(nextSprint) => {
          setSprintA(nextSprint);
          setSelectedMemberId(data[nextSprint][0]?.id || "");
        }}
        onSprintBChange={(nextSprint) => {
          setSprintB(nextSprint);
        }}
      />

      <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
        <div className="p-6 md:p-margin-desktop max-w-container-max mx-auto w-full flex flex-col gap-gutter pb-20 md:pb-8">
          {(isLoading || loadError) && (
            <div className="rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
              {isLoading ? "Refreshing analytics from backend..." : loadError}
            </div>
          )}
          <div className="rounded-2xl border border-outline-variant bg-white p-6">
            <h3 className="text-lg font-semibold">Sprint Comparison</h3>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <TrendMetricCard
                label="Completed Tasks"
                current={sprintAMetrics.completed}
                previous={sprintBMetrics.completed}
              />

              <TrendMetricCard
                label="Reviews"
                current={sprintAMetrics.reviews}
                previous={sprintBMetrics.reviews}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-outline-variant bg-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={exportContributorComparisonCSV}
                  disabled={contributorComparison.length === 0}
                  className="
      rounded-lg
      bg-primary
      px-4 py-2
      text-sm font-medium
      text-white
      disabled:cursor-not-allowed
      disabled:opacity-50
    "
                >
                  Export CSV
                </button>

                <select
                  value={comparisonSort}
                  onChange={(event) =>
                    setComparisonSort(
                      event.target.value as "improvement" | "decline" | "name",
                    )
                  }
                  className="rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="improvement">Highest Improvement</option>

                  <option value="decline">Highest Decline</option>

                  <option value="name">Name</option>
                </select>
              </div>

            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left">Contributor</th>
                    <th className="px-4 py-3 text-center">{sprintA}</th>
                    <th className="px-4 py-3 text-center">{sprintB}</th>
                    <th className="px-4 py-3 text-center">Change</th>
                  </tr>
                </thead>

                <tbody>
                  {contributorComparison.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-8 text-center text-gray-500"
                      >
                        No contributor comparison data available for the
                        selected sprints.
                      </td>
                    </tr>
                  ) : (
                    contributorComparison.map((member) => {
                      const trend =
                        member.change > 0 ? "▲" : member.change < 0 ? "▼" : "●";

                      const colorClass =
                        member.change > 0
                          ? "text-green-600"
                          : member.change < 0
                            ? "text-red-600"
                            : "text-gray-500";

                      return (
                        <tr key={member.id} className="border-b last:border-0">
                          <td className="px-4 py-3 font-medium">
                            {member.name}
                          </td>

                          <td className="px-4 py-3 text-center">
                            {member.current}
                          </td>

                          <td className="px-4 py-3 text-center">
                            {member.previous}
                          </td>

                          <td
                            className={`px-4 py-3 text-center font-medium ${colorClass}`}
                          >
                            {trend} {member.change > 0 ? "+" : ""}
                            {member.change}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <PerformanceSummary
            members={members}
            metric={metric}
            onMetricChange={setMetric}
          />
          <MemberAnalytics
            members={members}
            selectedMember={selectedMember}
            onSelectMember={setSelectedMemberId}
          />
          <SprintLeaderboard
            sprint={sprintA}
            members={filteredMembers}
            sortKey={sortKey}
            onSortChange={setSortKey}
          />
        </div>
      </div>
      <AnalyticsMobileNav />
    </>
  );
}
