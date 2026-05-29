"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LineChart,
  Route,
  MessageCircle,
  Plus,
  Settings,
  HelpCircle,
} from "lucide-react";

export default function InsightsSidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/insights/overview",
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      href: "/insights/analytics",
      label: "Analytics",
      icon: LineChart,
    },
    {
      href: "/insights/tasks",
      label: "Tasks",
      icon: Route,
    },
    {
      href: "/insights/feed",
      label: "Feed",
      icon: MessageCircle,
    },
  ];

  return (
    <aside className="panel m-2 mb-0 w-64 p-4 md:m-6 md:mb-6 md:h-[calc(100vh-3rem)] flex flex-col">
      <div className="flex flex-1 flex-col">

        {/* Project Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
            Project Alpha
          </h2>

        <span className="chip mt-2 inline-block px-3 py-1 text-xs font-semibold">
          Enterprise Flow
        </span>
      </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              pathname === item.href ||
              pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 transition ${
                  isActive
                    ? "bg-teal-700 text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-200"
               }`}
              >
                <Icon size={16} />
                <span className="text-sm font-medium">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto border-t border-slate-200 pt-6">

          <button
            className="
              mb-4 flex w-full items-center justify-center gap-2
              rounded-xl bg-teal-700 px-3 py-2
              text-white shadow-sm
              transition hover:bg-teal-800
            "
          >
            <Plus size={16} />
            <span className="text-sm font-medium">
              New Insight
            </span>
          </button>

          <div className="flex flex-col gap-1">
            <Link
              href="#"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-slate-700 transition hover:bg-slate-200"
            >
              <Settings size={16} />
              <span className="text-sm font-medium">
                Settings
              </span>
            </Link>

            <Link
              href="#"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-slate-700 transition hover:bg-slate-200"
            >
              <HelpCircle size={16} />
              <span className="text-sm font-medium">
                Support
              </span>
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}