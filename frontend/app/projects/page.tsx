"use client";

import { Plus, CalendarClock, Users, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured, supabase } from "@/app/lib/supabase";
import { useState, useEffect, useMemo } from "react";
import ProjectDialog from "@/app/components/ProjectDialog";


type Project = {
  id: string;
  name: string;
  desc: string;
  members: number;
  due: string | null;
  tags: string[];
  createdAt: string;
};

function filterProjects(
  projects: Array<
    Project & { searchText?: string }
  >,
  query: string
) {
  const normalizedQuery =
    query.trim().toLowerCase();

  if (!normalizedQuery) {
    return projects;
  }

  return projects.filter((project) =>
    project.searchText?.includes(
      normalizedQuery
    )
  );
}

export default function ProjectsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const loadProjects = async (accessToken?: string | null) => {
      if (!accessToken){
         setIsLoading(false);
         return;
        }
        setIsLoading(true);
      try {
        const res = await fetch("/api/projects", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!res.ok) throw new Error("Failed to load the Projects");
        const body = await res.json();
        setProjects(body.projects || []);
      } catch (error) {
        console.error("Error in loading projects ", error);
      } finally{
        setIsLoading(false);
      }
    };

    // Load once on mount using the current session.
    supabase.auth
    .getSession()
    .then(({ data }) => loadProjects(data.session?.access_token))
    .catch((error) => {
      console.error("Error in loading session ", error);
      setIsLoading(false);
    });
    // Refetch whenever auth state changes.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      loadProjects(session?.access_token);
    });

    return () => subscription.unsubscribe();
  }, []);

  const searchableProjects = useMemo(
    () =>
      projects.map((project) => ({
        ...project,
        searchText: [
          project.name,
          ...(project.tags || []),
        ]
          .join(" ")
          .toLowerCase(),
      })),
    [projects]
  );

  const filteredProjects = useMemo(
    () =>
      filterProjects(
        searchableProjects,
        debouncedSearchTerm
      ),
    [searchableProjects, debouncedSearchTerm]
  );

  const hasProjects = filteredProjects.length > 0;

  const handleNewProject = () => {
    if (!isSupabaseConfigured || !supabase) {
      router.push("/login?next=/projects");
      return;
    }

    setOpen(true);
  };

  const handleProjectCreated = (newProject: Project) => {
    setProjects((prev) => [
      {
        name: newProject.name || "",
        desc: newProject.desc || "",
        members: newProject.members || 0,
        due: newProject.due || null,
        tags: newProject.tags || [],
        id: newProject.id,
        createdAt: newProject.createdAt || new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-10">
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="chip inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide">FlowForge</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Projects</h1>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
          <div className="relative flex-1 sm:w-64 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <button
            onClick={handleNewProject}
            className="accent-btn flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition whitespace-nowrap"
          >
            <Plus size={18} />
            New Project
          </button>
        </div>
      </div>

      <ProjectDialog
        isOpen={open}
        onClose={() => setOpen(false)}
        onCreated={handleProjectCreated}
      />

      {isLoading ? (
        <div className="panel flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 h-10 w-10 rounded-full bg-slate-100 animate-pulse" />
          <h3 className="text-lg font-semibold text-slate-900">Loading projects...</h3>
          <p className="mt-1 text-slate-500">Fetching your latest updates.</p>
        </div>
      ) : hasProjects ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="panel group cursor-pointer p-5 transition hover:-translate-y-1"
            >
              <h2 className="mb-2 text-lg font-semibold text-slate-900 group-hover:text-emerald-700">
                {project.name}
              </h2>
              <p className="mb-4 line-clamp-2 text-sm text-slate-600">{project.desc}</p>

              <div className="mb-4 flex flex-wrap gap-2">
                {project.tags && project.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Users size={14} className="text-slate-400" />
                  <span className="font-medium text-slate-700">{project.members || 0}</span>
                  <span className="hidden sm:inline">members</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarClock size={14} className="text-slate-400" />
                  <span>{project.due ? project.due : "No deadline"}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="panel flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 rounded-full bg-slate-50 p-4 text-slate-400">
            <Search size={32} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No projects found</h3>
          <p className="mt-1 text-slate-500">Try adjusting your search terms or tags.</p>
          <button
            onClick={() => setSearchTerm("")}
            className="mt-6 text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
