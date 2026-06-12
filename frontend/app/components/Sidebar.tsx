"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  Blocks,
  MessageSquare,
  BarChart3,
} from "lucide-react";

function getNavigationState(
  pathname: string,
  path: string
) {
  const isActive =
    pathname === path ||
    pathname.startsWith(`${path}/`);

  return {
    isActive,
    className: `flex items-center gap-2 rounded-xl px-3 py-2 transition ${
      isActive
        ? "bg-teal-700 text-white shadow-sm"
        : "text-slate-700 hover:bg-slate-200"
    }`,
  };
}

export default function Sidebar() {
  const pathname = usePathname();

  const [activePath, setActivePath] =
    useState(pathname);

  useEffect(() => {
    setActivePath(pathname);

    if (pathname) {
      sessionStorage.setItem(
        "sidebar-active-route",
        pathname
      );
    }
  }, [pathname]);

  useEffect(() => {
    const persistedPath =
      sessionStorage.getItem(
        "sidebar-active-route"
      );

    if (
      persistedPath &&
      !activePath
    ) {
      setActivePath(persistedPath);
    }
  }, []);

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/projects",
      label: "Projects",
      icon: FolderKanban,
    },
    {
      href: "/workspace",
      label: "Workspace",
      icon: Blocks,
    },
    {
      href: "/insights/overview",
      label: "Insights",
      icon: BarChart3,
    },
    {
      href: "/chat",
      label: "Chat",
      icon: MessageSquare,
    },
  ];

  return (
    <aside className="panel sticky top-0 z-20 m-2 mb-0 w-[140px] p-3 sm:m-4 sm:w-[180px] md:m-6 md:mb-6 md:h-[calc(100vh-3rem)] md:w-64 md:p-4">
      <div className="mb-4 flex items-center justify-between md:mb-6 md:block">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
          FlowForge
        </h1>

        <span className="chip px-3 py-1 text-xs font-semibold">
          v1
        </span>
      </div>

      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          const navigationState =
            getNavigationState(
              activePath,
              item.href
            );

          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                navigationState.className
              }
            >
              <Icon size={16} />

              <span className="text-sm font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}