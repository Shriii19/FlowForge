"use client";

import {
  useMemo,
  useEffect,
  useState,
  useCallback,
} from "react";
import { KanbanBoard } from "../components/kanban/KanbanBoard";
import { supabase } from "@/app/lib/supabase";

type Member = {
  name: string;
  email: string;
};

type Activity = {
  text: string;
  time: string;
};

export default function WorkspacePage() {
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const workspaceTimer = window.setTimeout(() => {
      setShowWorkspace(true);
    }, 50);
    return () => {
      window.clearTimeout(workspaceTimer);
    };
  }, []);

  useEffect(() => {
    const fetchWorkspaceData = async () => {
      try {
        if (!supabase) { setLoading(false); return; }
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { setLoading(false); return; }

        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("name, email")
          .limit(10);

        if (!profilesError && profilesData) {
          setMembers(profilesData.map((p) => ({
            name: p.name || "User",
            email: p.email,
          })));
        }

        const { data: projectsData, error: projectsError } = await supabase
          .from("projects")
          .select("name, created_at")
          .order("created_at", { ascending: false })
          .limit(5);

        if (!projectsError && projectsData) {
          setActivities(projectsData.map((p) => ({
            text: `Project "${p.name}" created`,
            time: new Date(p.created_at).toLocaleDateString(),
          })));
        }
      } catch (err) {
        console.error("Failed to fetch workspace data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaceData();
  }, []);

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 p-4 md:grid-cols-3 md:p-10">

      {/* ACTIVE MEMBERS */}
      <div className="panel p-4 md:col-span-1">
        <h2 className="mb-2 text-lg font-semibold text-slate-900">
          Active Developers
        </h2>
        <p className="mb-4 text-sm text-slate-500">
          {loading ? "Loading..." : `${members.length} active contributor${members.length !== 1 ? "s" : ""}`}
        </p>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-lg border border-slate-200 bg-slate-100 p-3">
                <div className="h-3 w-24 rounded bg-slate-300 mb-2" />
                <div className="h-3 w-36 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : members.length > 0 ? (
          <div className="space-y-3">
            {members.map((member, i) => (
              <div key={i} className="rounded-lg border border-(--line) bg-(--bg-soft) p-3">
                <p className="font-medium text-slate-900">{member.name}</p>
                <p className="text-sm text-slate-500 truncate">{member.email}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <svg className="w-8 h-8 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm font-medium text-slate-700">No members yet</p>
            <p className="text-xs text-slate-400 mt-1">Invite your team to get started</p>
          </div>
        )}
      </div>

      {/* KANBAN BOARD */}
      <div className="panel p-6 md:col-span-2">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Workspace Tasks
        </h2>
        <div className="h-[600px]">
          {showWorkspace ? (
            <KanbanBoard />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500">
              Initializing workspace...
            </div>
          )}
        </div>
      </div>

      {/* ACTIVITY FEED */}
      <div className="panel p-4 md:col-span-3">
        <h2 className="mb-2 text-lg font-semibold text-slate-900">
          Activity Feed
        </h2>
        <p className="mb-4 text-sm text-slate-500">
          {loading ? "Loading..." : `${activities.length} recent activit${activities.length !== 1 ? "ies" : "y"}`}
        </p>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-lg border border-slate-200 bg-slate-100 p-3">
                <div className="h-3 w-64 rounded bg-slate-300" />
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          <ul className="space-y-2 text-slate-700">
            {activities.map((activity, i) => (
              <li key={i} className="flex items-center justify-between rounded-lg border border-(--line) bg-(--bg-soft) p-3">
                <span className="flex items-center gap-2">
                  <span className="text-emerald-500">✔</span>
                  {activity.text}
                </span>
                <span className="text-xs text-slate-400 whitespace-nowrap ml-4">
                  {activity.time}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <svg className="w-8 h-8 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-slate-700">No workspace data yet</p>
            <p className="text-xs text-slate-400 mt-1">Create a project to get started</p>
          </div>
        )}
      </div>

    </div>
  );
}