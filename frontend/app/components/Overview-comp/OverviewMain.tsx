"use client";

import { useEffect, useState } from "react";
import StatsCard from "./StatsCard";
import Heatmap from "./Heatmap";

type OverviewInsights = {
  projectName: string;
  velocity: number;
  momentum: number;
  activeTasks: number;
  completedTasks: number;
  heatmap: number[];
  recentActivity: Array<{ id: string; label: string; time: string }>;
  topContributors: string[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const fallbackOverview: OverviewInsights = {
  projectName: "Project Alpha",
  velocity: 0,
  momentum: 0,
  activeTasks: 0,
  completedTasks: 0,
  heatmap: Array.from({ length: 365 }, (_, index) => index % 6),
  recentActivity: [],
  topContributors: [],
};

export default function OverviewMain() {
  const [overview, setOverview] = useState<OverviewInsights>(fallbackOverview);
  const [status, setStatus] = useState("Loading backend overview...");

  useEffect(() => {
    const controller = new AbortController();

    async function loadOverview() {
      try {
        const response = await fetch(`${API_URL}/api/insights/overview`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Failed to load overview insights");
        const body = (await response.json()) as OverviewInsights;
        setOverview(body);
        setStatus("Synced with backend insights.");
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setStatus("Showing local overview because backend insights are unavailable.");
        }
      }
    }

    void loadOverview();
    return () => controller.abort();
  }, []);

  return (
    <div className="flex-1">
      <div className="max-w-4xl mx-auto mb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12">
          <div>
            <div className="inline-flex items-center gap-3 bg-secondary-container30 px-3 py-1 rounded-full mb-6">
              <span className="material-symbols-outlined text-16px text-primary">analytics</span>
              <span className="text-11px font-bold text-primary uppercase">{overview.projectName} Evolution</span>
            </div>

            <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface tracking-tight mb-4 leading-1.1">Project Evolution</h1>

            <p className="text-on-surface-variant font-body-lg text-body-lg leading-relaxed max-w-xl">
              A backend-synced view of task velocity, activity density, and contributor movement across the current project.
            </p>
            <p className="mt-3 text-12px text-on-surface-variant60">{status}</p>
          </div>

          <div className="flex gap-4">
            <StatsCard label="Total Velocity" value={String(overview.velocity)} sub={<><span className="material-symbols-outlined">trending_up</span>{overview.completedTasks}</>} />
            <StatsCard label="Sprint Momentum" value={String(overview.momentum)} sub={<><span className="material-symbols-outlined">bolt</span>{overview.activeTasks} Active</>} />
          </div>
        </div>

        <div className="flex flex-col gap-6 xl:flex-row">
          <div className="flex-1">
            <Heatmap values={overview.heatmap} />
          </div>

          <aside className="w-full xl:w-80">
            <div className="glass-panel rounded-2xl p-6 mb-6">
              <h4 className="font-headline-md text-16px text-primary mb-3">Recent Activity</h4>
              {overview.recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {overview.recentActivity.map((item) => (
                    <div key={item.id}>
                      <p className="text-on-surface text-13px font-medium">{item.label}</p>
                      <p className="text-on-surface-variant50 text-11px">{item.time}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-on-surface-variant70 text-13px">No backend activity to display.</p>
              )}
            </div>

            <div className="glass-panel rounded-2xl p-6">
              <h4 className="font-headline-md text-16px text-primary mb-3">Top Contributors</h4>
              <p className="text-on-surface-variant70 text-13px">
                {overview.topContributors.length > 0 ? overview.topContributors.join(" / ") : "No contributor data yet"}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
