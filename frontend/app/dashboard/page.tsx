"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/app/lib/supabase";
import Link from "next/link";
import {
  Search,
  TrendingUp,
  Rocket,
  AlertTriangle,
} from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

/* ---------------- CONSTANT DATA ---------------- */

const avatarColors = [
  "#10b981", "#3b82f6", "#8b5cf6",
  "#f59e0b", "#ef4444", "#06b6d4",
];

/* ---------------- PURE FUNCTIONS ---------------- */

function buildChartData(filter: string) {
  return filter === "This Week"
    ? [
        { name: "Mon", value: 10 },
        { name: "Tue", value: 25 },
        { name: "Wed", value: 18 },
        { name: "Thu", value: 40 },
        { name: "Fri", value: 32 },
        { name: "Sat", value: 50 },
        { name: "Sun", value: 45 },
      ]
    : [
        { name: "Week 1", value: 20 },
        { name: "Week 2", value: 35 },
        { name: "Week 3", value: 50 },
        { name: "Week 4", value: 70 },
      ];
}

function buildDashboardMetrics() {
  return [
    { title: "Velocity", value: "—", icon: TrendingUp },
    { title: "Deploys", value: "—", icon: Rocket },
    { title: "Incidents", value: "—", icon: AlertTriangle },
  ];
}

function buildProjectInsights() {
  return [
    "✔ 12 tasks completed this week",
    "✔ 3 projects ahead of schedule",
    "⚠ 1 project needs attention",
  ];
}

/* ---------------- HELPERS ---------------- */

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const getAvatarColor = (name: string) =>
  avatarColors[name.charCodeAt(0) % avatarColors.length];

/* ---------------- COMPONENT ---------------- */

export default function Dashboard() {
  const [filter, setFilter] = useState<"This Week" | "This Month">("This Month");
  const [mounted, setMounted] = useState(false);

  const [user, setUser] = useState({ name: "User", role: "member" });
  const [team, setTeam] = useState<{ name: string; email: string }[]>([]);
  const [activity, setActivity] = useState<{ text: string; time: string }[]>([]);

  const [teamLoading, setTeamLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);

  /* ---------------- MOUNT GUARD ---------------- */

  useEffect(() => {
    setMounted(true);
  }, []);

  /* ---------------- USER FETCH (DEDUPED) ---------------- */

  useEffect(() => {
    let ignore = false;

    const loadUser = async () => {
      if (!supabase) return;

      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!ignore && session?.user) {
        const name =
          session.user.user_metadata?.full_name ||
          session.user.email ||
          "User";

        setUser({ name, role: "member" });
      }
    };

    loadUser();
    return () => {
      ignore = true;
    };
  }, []);

  /* ---------------- TEAM (SAFE + CLEAN) ---------------- */

  useEffect(() => {
    let ignore = false;

    const fetchTeam = async () => {
      try {
        if (!supabase) return setTeamLoading(false);

        const { data } = await supabase
          .from("profiles")
          .select("full_name, email")
          .limit(10);

        if (!ignore && data) {
          setTeam(
            data.map((m: any) => ({
              name: m.full_name || "User",
              email: m.email,
            }))
          );
        }
      } finally {
        if (!ignore) setTeamLoading(false);
      }
    };

    fetchTeam();

    return () => {
      ignore = true;
    };
  }, []);

  /* ---------------- ACTIVITY (SAFE + CLEAN) ---------------- */

  useEffect(() => {
    let ignore = false;

    const fetchActivity = async () => {
      try {
        if (!supabase) return setActivityLoading(false);

        const { data } = await supabase
          .from("projects")
          .select("name, created_at")
          .order("created_at", { ascending: false })
          .limit(5);

        if (!ignore && data) {
          setActivity(
            data.map((p: any) => ({
              text: `Project "${p.name}" created`,
              time: new Date(p.created_at).toLocaleDateString(),
            }))
          );
        }
      } finally {
        if (!ignore) setActivityLoading(false);
      }
    };

    fetchActivity();

    return () => {
      ignore = true;
    };
  }, []);

  /* ---------------- MEMOIZED DERIVED DATA ---------------- */

  const chartData = useMemo(() => buildChartData(filter), [filter]);
  const stats = useMemo(() => buildDashboardMetrics(), []);
  const insights = useMemo(() => buildProjectInsights(), []);

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* SEARCH */}
        <div className="flex items-center gap-3 w-full max-w-2xl bg-white px-5 py-3 rounded-2xl border">
          <Search size={18} className="text-slate-400" />
          <input
            placeholder="Search projects, tasks, or messages..."
            className="w-full outline-none text-sm"
          />
        </div>

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Overview</h1>
            <p className="text-slate-500 mt-1">
              Welcome back, {user.name} 👋
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Link href="/projects" className="px-4 py-2 bg-emerald-600 text-white rounded-xl">
              Projects
            </Link>
            <Link href="/workspace" className="px-4 py-2 bg-emerald-500 text-white rounded-xl">
              Workspace
            </Link>
          </div>
        </div>

        {/* STATS */}
        <div className="grid gap-6 sm:grid-cols-3">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="bg-white p-6 rounded-2xl border">
                <div className="flex justify-between">
                  <p className="text-sm text-slate-500">{s.title}</p>
                  <Icon size={18} />
                </div>
                <p className="text-3xl font-bold mt-3">{s.value}</p>
              </div>
            );
          })}
        </div>

        {/* CHART */}
        <div className="bg-white p-6 rounded-2xl border">
          <div className="flex justify-between mb-4">
            <h2 className="font-semibold">Analytics</h2>

            <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
              {["This Week", "This Month"].map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item as any)}
                  className={`px-4 py-1 rounded-lg ${
                    filter === item ? "bg-white shadow" : ""
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: 300 }}>
            {mounted && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid opacity={0.2} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line dataKey="value" stroke="#10b981" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* TEAM */}
        <div className="bg-white p-6 rounded-2xl border">
          <h2 className="font-semibold mb-4">Team</h2>

          {teamLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="flex gap-4 flex-wrap">
              {team.map((m) => (
                <div key={m.email} className="text-center">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                    style={{ background: getAvatarColor(m.name) }}
                  >
                    {getInitials(m.name)}
                  </div>
                  <p className="text-xs">{m.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ACTIVITY */}
        <div className="bg-white p-6 rounded-2xl border">
          <h2 className="font-semibold mb-4">Recent Activity</h2>

          {activityLoading ? (
            <p>Loading...</p>
          ) : (
            <ul className="text-sm space-y-2">
              {activity.map((a, i) => (
                <li key={i} className="flex justify-between">
                  <span>{a.text}</span>
                  <span className="text-xs text-slate-400">{a.time}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}