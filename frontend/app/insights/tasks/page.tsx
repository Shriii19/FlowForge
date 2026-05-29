"use client";

import { useEffect, useMemo, useState } from "react";
import TaskPulseBar, { type TaskPulseStage } from "@/app/components/Tasks-comp/TasksPulsebar";
import TaskFlow, { type TaskFlowNode } from "@/app/components/Tasks-comp/TasksFlow";
import TaskHistoryTable, { type TaskHistoryRow } from "@/app/components/Tasks-comp/TaskHistoryTable";
import MobileNav from "@/app/components/Tasks-comp/MobileNav";

type TaskInsights = {
  summary: {
    totalTasks: number;
    completedTasks: number;
    activeTasks: number;
    completionRate: number;
  };
  stages: TaskPulseStage[];
  flowNodes: TaskFlowNode[];
  history: TaskHistoryRow[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const fallbackInsights: TaskInsights = {
  summary: {
    totalTasks: 0,
    completedTasks: 0,
    activeTasks: 0,
    completionRate: 0,
  },
  stages: [
    { label: "Todo", value: 0, active: false },
    { label: "In Progress", value: 0, active: false },
    { label: "Review", value: 0, active: false },
    { label: "Total Cycle", value: 0, active: false },
  ],
  flowNodes: [
    { label: "Todo", sub: "Queue", value: 0, active: false },
    { label: "In Progress", sub: "Active", value: 0, active: false },
    { label: "Review", sub: "Verify", value: 0, active: false },
    { label: "Done", sub: "Archived", value: 0, active: false },
  ],
  history: [],
};

export default function InsightsTasksPage() {
  const [insights, setInsights] = useState<TaskInsights>(fallbackInsights);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Loading backend task insights...");

  useEffect(() => {
    const controller = new AbortController();

    async function loadTaskInsights() {
      try {
        const response = await fetch(`${API_URL}/api/insights/tasks`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Failed to load task insights");
        const body = (await response.json()) as TaskInsights;
        setInsights(body);
        setStatus("Synced with backend task data.");
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setStatus("Showing local task insights because backend data is unavailable.");
        }
      }
    }

    void loadTaskInsights();
    return () => controller.abort();
  }, []);

  const filteredHistory = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return insights.history;
    return insights.history.filter((row) =>
      [row.task, row.assignee, row.state, row.trigger].some((value) =>
        value.toLowerCase().includes(normalizedQuery)
      )
    );
  }, [insights.history, query]);

  return (
    <>

      <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
        <div className="px-4 md:px-margin-desktop pb-12 pt-6 pb-20 md:pb-8">
          <div className="max-w-container-max mx-auto space-y-gutter">
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="font-headline-lg text-[36px] tracking-tight text-on-surface">
                    Task Journey Tracking
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant/80">
                    Backend-backed lifecycle analysis for {insights.summary.totalTasks} tasks, {insights.summary.completionRate}% complete.
                  </p>
                  <p className="mt-2 text-label-md text-on-surface-variant/60">{status}</p>
                </div>
              </div>

              <TaskPulseBar stages={insights.stages} />
            </div>

            <TaskFlow nodes={insights.flowNodes} />
            <TaskHistoryTable rows={filteredHistory} query={query} onQueryChange={setQuery} />
          </div>
        </div>
      </div>
      <MobileNav />
    </>
  );
}
