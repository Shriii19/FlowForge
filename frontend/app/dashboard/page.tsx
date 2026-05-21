"use client";

import { useState, useEffect } from "react";
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

export default function Dashboard() {
  const [filter, setFilter] = useState("This Month");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const [user, setUser] = useState({ name: "User", role: "member" });

  useEffect(() => {
    const getUser = async () => {
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const name =
          session.user.user_metadata?.full_name ||
          session.user.email ||
          "User";
        setUser({ name, role: "member" });
      }
    };
    getUser();
  }, []);

  // ✅ Dynamic chart data based on filter
  const chartData =
    filter === "This Week"
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

  const stats = [
    { title: "Velocity", value: "—", icon: TrendingUp },
    { title: "Deploys", value: "—", icon: Rocket },
    { title: "Incidents", value: "—", icon: AlertTriangle },
  ];

  const [team, setTeam] = useState<{ name: string; email: string }[]>([]);
  const [teamLoading, setTeamLoading] = useState(true);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        if (!supabase) { setTeamLoading(false); return; }
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { setTeamLoading(false); return; }
        const { data, error } = await supabase
          .from("profiles")
          .select("name, email")
          .limit(10);
        if (!error && data) setTeam(data);
      } catch (err) {
        console.error("Failed to fetch team members:", err);
      } finally {
        setTeamLoading(false);
      }
    };
    fetchTeamMembers();
  }, []);

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const avatarColors = [
    "#10b981", "#3b82f6", "#8b5cf6",
    "#f59e0b", "#ef4444", "#06b6d4",
  ];

  const getAvatarColor = (name: string) =>
    avatarColors[name.charCodeAt(0) % avatarColors.length];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* 🔍 SEARCH */}
        <div className="flex items-center gap-3 w-full max-w-2xl bg-white px-5 py-3 rounded-2xl border shadow-sm focus-within:ring-2 focus-within:ring-emerald-500 transition">
          <Search size={18} className="text-slate-400" />
          <input
            placeholder="Search projects, tasks, or messages..."
            className="w-full outline-none text-sm"
          />
        </div>

        {/* 👋 HEADER */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Dashboard Overview
            </h1>
            <p className="text-slate-500 mt-1">Welcome back, {user.name} 👋</p>
          </div>

          {/* 🟢 ACTION BUTTONS */}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/projects"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
            >
              📁 Projects
            </Link>
            <Link
              href="/workspace"
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 transition"
            >
              👥 Workspace
            </Link>

            {/* 🔐 ROLE-BASED BUTTON */}
            {user.role === "admin" && (
              <Link
                href="/projects"
                className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-emerald-800 transition"
              >
                ➕ New Sprint
              </Link>
            )}
          </div>
        </div>

        {/* 📊 STATS */}
        <div className="grid gap-6 sm:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-lg transition hover:-translate-y-1"
              >
                <div className="flex justify-between">
                  <p className="text-sm text-slate-500">{stat.title}</p>
                  <Icon size={18} className="text-slate-400" />
                </div>
                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* 📈 CHART */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Productivity Analytics
              </h2>
              <p className="text-sm text-slate-500">
                Track your team&apos;s performance trends over time
              </p>
            </div>

            {/* ✅ FILTER BUTTONS */}
            <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
              {["This Week", "This Month"].map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`px-4 py-1.5 text-sm rounded-lg transition ${
                    filter === item
                      ? "bg-white shadow text-slate-900"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* ✅ FIX: Use inline styles for guaranteed dimensions */}
          <div style={{ width: "100%", minWidth: 0, height: "300px", overflow: "hidden" }}>
            {mounted && (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 📊 INSIGHTS OVERVIEW */}
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-900">
              Insights Overview
            </h2>
            <p className="text-sm text-slate-500">
              Key analytics and intelligent recommendations to guide your
              workflow.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/insights/overview"
                className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition"
              >
                Overview
              </Link>
              <Link
                href="/insights/analytics"
                className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition"
              >
                Analytics
              </Link>
              <Link
                href="/insights/feed"
                className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition"
              >
                Feed
              </Link>
              <Link
                href="/insights/tasks"
                className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition"
              >
                Tasks
              </Link>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* 📊 PROJECT INSIGHTS */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition">
              <h3 className="text-lg font-semibold text-slate-900">
                Project Insights
              </h3>

              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p>✔ 12 tasks completed this week</p>
                <p>✔ 3 projects ahead of schedule</p>
                <p>⚠ 1 project needs attention</p>
              </div>

              <Link
                href="/insights/overview"
                className="mt-5 inline-block text-sm font-medium text-emerald-600 hover:underline"
              >
                View detailed report →
              </Link>
            </div>

            {/* 🤖 AI INSIGHTS */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-6 rounded-2xl shadow-sm hover:shadow-md transition">
              <h3 className="text-lg font-semibold">AI Insights 🤖</h3>

              <p className="mt-3 text-sm text-emerald-100">
                Your productivity increased by 18%. Completing pending tasks
                today can further boost efficiency by 10%.
              </p>

              <Link
                href="/insights/analytics"
                className="mt-5 inline-block bg-white text-emerald-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-100 transition"
              >
                View Recommendations
              </Link>
            </div>

            {/* 🚧 PROJECTS IN PROGRESS */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition">
              <h3 className="text-lg font-semibold text-slate-900">
                Projects In Progress
              </h3>

              <div className="mt-4 space-y-4">
                {[
                  { name: "Project Alpha", progress: "70%" },
                  { name: "Client Dashboard", progress: "50%" },
                  { name: "AI Assistant", progress: "85%" },
                ].map((project) => (
                  <div key={project.name}>
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>{project.name}</span>
                      <span>{project.progress}</span>
                    </div>

                    <div className="mt-1 h-2 bg-slate-200 rounded-full">
                      <div
                        className="h-2 bg-emerald-500 rounded-full"
                        style={{ width: project.progress }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/insights/tasks"
                className="mt-5 inline-block text-sm font-medium text-emerald-600 hover:underline"
              >
                Manage projects →
              </Link>
            </div>
          </div>
        </div>

        {/* 👥 TEAM */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-slate-900">
            Team Members
          </h2>

          {teamLoading ? (
            <div className="flex gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-slate-200 mx-auto" />
                  <div className="h-2 w-10 bg-slate-200 rounded mt-2 mx-auto" />
                </div>
              ))}
            </div>
          ) : team.length > 0 ? (
            <div className="flex flex-wrap gap-5">
              {team.map((member) => (
                <div key={member.email} className="text-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-semibold hover:scale-105 transition mx-auto"
                    style={{ backgroundColor: getAvatarColor(member.name) }}
                  >
                    {getInitials(member.name)}
                  </div>
                  <p className="text-xs mt-2 text-slate-600 max-w-[60px] truncate">
                    {member.name}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-700">No team members yet</p>
              <p className="text-xs text-slate-400 mt-1">Invite your team to get started</p>
            </div>
          )}
        </div>

        {/* 📌 BOTTOM */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>✔ New sprint created</li>
              <li>✔ Task updated in Project Alpha</li>
              <li>✔ Team member joined workspace</li>
            </ul>
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-semibold">Upgrade Workspace 🚀</h2>
            <p className="text-sm mt-2 text-slate-300">
              Unlock advanced analytics, integrations, and priority support.
            </p>

            <button className="mt-4 bg-white text-slate-900 px-4 py-2 rounded-xl text-sm font-semibold hover:scale-105 transition">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 🔹 Buttons */
const btn =
  "rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition";

const btnLight =
  "rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition";

const btnStrong =
  "rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 transition";

/* 🔹 Card */
type CardProps = {
  icon: React.ReactNode;
  title: string;
  link: string;
};

function Card({ icon, title, link }: CardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-lg transition hover:-translate-y-1">
      <div className="mb-3 text-slate-700">{icon}</div>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <Link href={link} className="mt-4 inline-block text-sm hover:underline">
        Open →
      </Link>
    </div>
  );
}
