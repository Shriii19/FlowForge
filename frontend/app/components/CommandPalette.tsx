"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const commands = [
  { id: 1, label: "Dashboard", href: "/dashboard" },
  { id: 2, label: "Projects", href: "/projects" },
  { id: 3, label: "Insights Overview", href: "/insights/overview" },
  { id: 4, label: "Insights Tasks", href: "/insights/tasks" },
  { id: 5, label: "Insights Feed", href: "/insights/feed" },
];

export default function CommandPalette() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [recentCommands, setRecentCommands] = useState<typeof commands>([]);
  
  
  useEffect(() => {
    const stored = localStorage.getItem("flowforge-recent-commands");

    if (stored) {
      setRecentCommands(JSON.parse(stored));
    }
  }, []);
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isShortcut =
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k";

      if (isShortcut) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }

      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;

    return commands.filter((command) =>
      command.label.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  useEffect(() => {
    function handleNavigation(event: KeyboardEvent) {
      if (!open) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();

        setSelected((prev) =>
          prev === filteredCommands.length - 1 ? 0 : prev + 1
        );
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();

        setSelected((prev) =>
          prev === 0 ? filteredCommands.length - 1 : prev - 1
        );
      }

      if (event.key === "Enter") {
        const command = filteredCommands[selected];

        if (command) {
          const updatedRecent = [
            command,
            ...recentCommands.filter((item) => item.id !== command.id),
          ].slice(0, 5);

          setRecentCommands(updatedRecent);

          localStorage.setItem(
            "flowforge-recent-commands",
            JSON.stringify(updatedRecent)
          );

          router.push(command.href);

          setOpen(false);
          setQuery("");
        }
      }
    }

    window.addEventListener("keydown", handleNavigation);

    return () => {
      window.removeEventListener("keydown", handleNavigation);
    };
  }, [open, filteredCommands, selected, router]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-center bg-black/30 backdrop-blur-sm pt-32 px-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-2xl animate-in zoom-in-95 fade-in duration-200 ease-out">
        
        <div className="flex items-center gap-3 border-b border-outline-variant px-4 py-4">
          <span className="material-symbols-outlined text-outline">
            search
          </span>

          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search pages and actions..."
            className="flex-1 bg-transparent outline-none text-on-surface placeholder:text-outline"
          />

          <span className="rounded-md border border-outline-variant bg-surface-container-low px-2 py-1 text-[10px] text-outline">
            ESC
          </span>
        </div>

        {!query && recentCommands.length > 0 && (
  <>
    <div className="px-4 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-widest text-outline">
      Recent
    </div>

    {recentCommands.map((command) => (
      <button
        key={`recent-${command.id}`}
        onClick={() => {
          router.push(command.href);

          setOpen(false);
          setQuery("");
        }}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-all duration-200 hover:bg-surface-container-low"
      >
        <span className="font-medium text-on-surface">
          {command.label}
        </span>

        <span className="rounded-md border border-outline-variant bg-surface-container-low px-2 py-1 text-[10px] text-outline">
          Recent
        </span>
      </button>
    ))}

    <div className="my-2 border-t border-outline-variant" />
  </>
)}

        <div className="max-h-80 overflow-y-auto py-2">
          
          <div className="px-4 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-widest text-outline">
            Navigation
          </div>

          {filteredCommands.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
              
              <span className="material-symbols-outlined text-4xl text-outline/60">
                search_off
              </span>

              <p className="text-sm font-medium text-on-surface">
                No commands found
              </p>

              <p className="text-xs text-outline">
                Try searching for pages or actions.
              </p>
            </div>
          ) : (
            filteredCommands.map((command, index) => (
              <button
                key={command.id}
                onClick={() => {

                  const updatedRecent = [
                    command,
                    ...recentCommands.filter((item) => item.id !== command.id),
                  ].slice(0, 5);

                  setRecentCommands(updatedRecent);

                  localStorage.setItem(
                    "flowforge-recent-commands",
                    JSON.stringify(updatedRecent)
                  );

                  router.push(command.href);

                  setOpen(false);
                  setQuery("");
                }}
                className={`flex w-full items-center justify-between px-4 py-3 text-left transition-all duration-200 ${
                  selected === index
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-surface-container-low"
                }`}
              >
                <span className="font-medium">
                  {command.label}
                </span>

                <span className="rounded-md border border-outline-variant bg-surface-container-low px-2 py-1 text-[10px] text-outline">
                  Enter
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}