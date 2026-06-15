"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import {
  LayoutDashboard,
  FolderKanban,
  Blocks,
  MessageSquare,
  BarChart3,
} from "lucide-react";

type NavigationItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

type NavigationItemState =
  NavigationItem & {
    isActive: boolean;
    className: string;
  };

function getNavigationState(
  pathname: string,
  path: string
) {
  const isActive =
    pathname === path ||
    pathname.startsWith(`${path}/`);

  return {
    isActive,
    className: `flex items-center gap-2 rounded-xl px-3 py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${
      isActive
        ? "bg-teal-700 text-white shadow-sm"
        : "text-slate-700 hover:bg-slate-200"
    }`,
  };
}

const NAVIGATION_ITEMS: NavigationItem[] =
  [
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

function persistActiveRoute(
  pathname: string
) {
  sessionStorage.setItem(
    "sidebar-active-route",
    pathname
  );
}

function getPersistedRoute() {
  return sessionStorage.getItem(
    "sidebar-active-route"
  );
}

function buildNavigationItems(
  pathname: string
): NavigationItemState[] {
  return NAVIGATION_ITEMS.map(
    (item) => {
      const state =
        getNavigationState(
          pathname,
          item.href
        );

      return {
        ...item,
        isActive:
          state.isActive,
        className:
          state.className,
      };
    }
  );
}
function getNavigationAriaLabel(
  label: string,
  isActive: boolean
) {
  return isActive
    ? `${label} (current page)`
    : label;
}

export default function Sidebar() {
  const pathname = usePathname();

  const [activePath, setActivePath] =
    useState(pathname);

  const saveActiveRoute =
    useCallback(
      (pathname: string) => {
        persistActiveRoute(
          pathname
        );
      },
      []
    );

  useEffect(() => {
    setActivePath(pathname);

    if (pathname) {
      saveActiveRoute(pathname);
    }
  }, [pathname, saveActiveRoute]);

  useEffect(() => {
    const persistedPath =
      getPersistedRoute();

    if (
      persistedPath &&
      !activePath
    ) {
      setActivePath(persistedPath);
    }
  }, []);

  const navigationItems =
    useMemo(
      () =>
        buildNavigationItems(
          activePath
        ),
      [activePath]
    );

  return (
    <aside
      aria-label="Sidebar"
      aria-labelledby="sidebar-title"
      className="panel sticky top-0 z-20 m-2 mb-0 w-[140px] p-3 sm:m-4 sm:w-[180px] md:m-6 md:mb-6 md:h-[calc(100vh-3rem)] md:w-64 md:p-4"
    >
      <div className="mb-4 flex items-center justify-between md:mb-6 md:block">
        <h1
          id="sidebar-title"
          className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl"
        >
          FlowForge
        </h1>

        <span
          className="chip px-3 py-1 text-xs font-semibold"
          aria-label="Application version 1"
        >
          v1
        </span>
      </div>

      <nav
        aria-label="Primary navigation"
      >
        <ul className="flex flex-col gap-2">
        {navigationItems.map(
          (item) => {
            const Icon =
              item.icon;

            return (
              <li key={item.href}>
                <Link
                href={item.href}
                className={
                  item.className
                }
                aria-current={
                  item.isActive
                    ? "page"
                    : undefined
                }
                aria-label={
                  getNavigationAriaLabel(
                    item.label,
                    item.isActive
                  )
                }
                title={
                  item.label
                }
              >
                <Icon
                  size={16}
                  aria-hidden="true"
                />

                <span className="text-sm font-medium">
                  {item.label}
                </span>
              </Link>
            </li>
          );
          }
        )}
      </ul>
      </nav>
    </aside>
  );
}