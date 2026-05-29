"use client";

import { useEffect, useMemo, useState } from "react";
import PerformanceSummary, {
  type AnalyticsMetric,
  type MemberPerformance,
} from "@/app/components/analytics-comp/PerformanceSummary";
import MemberAnalytics from "@/app/components/analytics-comp/MemberAnalytics";
import SprintLeaderboard, {
  type LeaderboardSortKey,
} from "@/app/components/analytics-comp/SprintLeaderboard";
import AnalyticsMobileNav from "@/app/components/analytics-comp/AnalyticsMobileNav";

const sprintData: Record<string, MemberPerformance[]> = {
  "Sprint 42": [
    { id: "alex", name: "Alex Rivera", role: "Lead Frontend Engineer", assigned: 85, completed: 72, reviews: 18, focus: "Frontend", activity: [30, 50, 80, 100, 90, 60, 20, 85], image: "https://i.pravatar.cc/96?img=11" },
    { id: "jordan", name: "Jordan Smith", role: "Backend Engineer", assigned: 60, completed: 58, reviews: 15, focus: "API", activity: [45, 65, 55, 80, 70, 64, 58, 75], image: "https://i.pravatar.cc/96?img=12" },
    { id: "casey", name: "Casey Morgan", role: "Fullstack Developer", assigned: 95, completed: 90, reviews: 24, focus: "Fullstack", activity: [70, 40, 90, 100, 50, 80, 30, 95], image: "https://i.pravatar.cc/96?img=13" },
    { id: "riley", name: "Riley Lee", role: "QA Analyst", assigned: 45, completed: 45, reviews: 11, focus: "QA", activity: [35, 55, 42, 62, 78, 45, 68, 72], image: "https://i.pravatar.cc/96?img=14" },
    { id: "morgan", name: "Morgan Patel", role: "Product Engineer", assigned: 80, completed: 40, reviews: 9, focus: "Product", activity: [25, 35, 52, 48, 60, 42, 38, 50], image: "https://i.pravatar.cc/96?img=15" },
    { id: "quinn", name: "Quinn Taylor", role: "DevOps Engineer", assigned: 70, completed: 68, reviews: 14, focus: "Ops", activity: [55, 68, 72, 75, 62, 74, 80, 78], image: "https://i.pravatar.cc/96?img=16" },
  ],
  "Sprint 41": [
    { id: "alex", name: "Alex Rivera", role: "Lead Frontend Engineer", assigned: 76, completed: 70, reviews: 21, focus: "Frontend", activity: [44, 58, 62, 88, 92, 70, 55, 81], image: "https://i.pravatar.cc/96?img=11" },
    { id: "jordan", name: "Jordan Smith", role: "Backend Engineer", assigned: 72, completed: 61, reviews: 12, focus: "API", activity: [40, 48, 65, 72, 68, 71, 52, 64], image: "https://i.pravatar.cc/96?img=12" },
    { id: "casey", name: "Casey Morgan", role: "Fullstack Developer", assigned: 88, completed: 84, reviews: 20, focus: "Fullstack", activity: [58, 74, 82, 95, 76, 86, 62, 91], image: "https://i.pravatar.cc/96?img=13" },
    { id: "riley", name: "Riley Lee", role: "QA Analyst", assigned: 52, completed: 49, reviews: 16, focus: "QA", activity: [62, 60, 70, 66, 78, 74, 72, 80], image: "https://i.pravatar.cc/96?img=14" },
    { id: "morgan", name: "Morgan Patel", role: "Product Engineer", assigned: 66, completed: 59, reviews: 10, focus: "Product", activity: [32, 46, 58, 62, 60, 55, 64, 68], image: "https://i.pravatar.cc/96?img=15" },
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
  const [sprint, setSprint] = useState("Sprint 42");
  const [metric, setMetric] = useState<AnalyticsMetric>("completed");
  const [selectedMemberId, setSelectedMemberId] = useState("casey");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<LeaderboardSortKey>("score");
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadAnalytics() {
      setIsLoading(true);
      setLoadError("");
      try {
        const response = await fetch(`${API_URL}/api/analytics`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Failed to load analytics");
        const body = (await response.json()) as AnalyticsResponse;
        const nextData = body.sprints.reduce<Record<string, MemberPerformance[]>>(
          (acc, item) => {
            acc[item.label] = item.members;
            return acc;
          },
          {}
        );

        if (Object.keys(nextData).length > 0) {
          setData(nextData);
          const firstSprint = Object.keys(nextData)[0];
          setSprint((current) => (nextData[current] ? current : firstSprint));
          setSelectedMemberId((current) => {
            const activeMembers = nextData[firstSprint] || [];
            return activeMembers.some((member) => member.id === current)
              ? current
              : activeMembers[0]?.id || current;
          });
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setLoadError("Showing local analytics because the backend is unavailable.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    void loadAnalytics();
    return () => controller.abort();
  }, []);

  const members = useMemo(
    () => data[sprint] || Object.values(data)[0] || [],
    [data, sprint]
  );
  const selectedMember = members.find((member) => member.id === selectedMemberId) ?? members[0];

  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return members;
    return members.filter((member) =>
      [member.name, member.role, member.focus].some((value) =>
        value.toLowerCase().includes(normalizedQuery)
      )
    );
  }, [members, query]);

  return (
  <>
    <div className="border-b border-outline-variant bg-white px-6 py-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <select
          value={sprint}
          onChange={(event) => {
            const nextSprint = event.target.value;
            setSprint(nextSprint);
            setSelectedMemberId(data[nextSprint][0]?.id || "");
          }}
          className="rounded-lg border border-outline-variant px-3 py-2"
        >
          {Object.keys(data).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search member, role, or focus..."
          className="flex-1 rounded-lg border border-outline-variant px-4 py-2"
        />
      </div>
    </div>

    <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
        <div className="p-6 md:p-margin-desktop max-w-container-max mx-auto w-full flex flex-col gap-gutter pb-20 md:pb-8">
          {(isLoading || loadError) && (
            <div className="rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
              {isLoading ? "Refreshing analytics from backend..." : loadError}
            </div>
          )}
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
            sprint={sprint}
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
