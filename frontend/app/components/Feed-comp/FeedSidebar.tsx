"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

type FeedSidebarProps = {
  onCreateInsight: () => void;
};

type NavigationItem = {
  href: string;
  label: string;
  icon: string;
};

type NavigationState = {
  activeRoute: string;
  previousRoute: string;
  transitionCount: number;
};

const navigationItems: NavigationItem[] = [
  {
    href: "/insights/overview",
    label: "Overview",
    icon: "dashboard",
  },
  {
    href: "/insights/analytics",
    label: "Analytics",
    icon: "insights",
  },
  {
    href: "/insights/tasks",
    label: "Tasks",
    icon: "route",
  },
  {
    href: "/insights/feed",
    label: "Feed",
    icon: "forum",
  },
];

function createNavigationState(
  route: string
): NavigationState {
  return {
    activeRoute: route,
    previousRoute: "",
    transitionCount: 0,
  };
}

function isActiveRoute(
  currentRoute: string,
  route: string
) {
  return (
    currentRoute === route ||
    currentRoute.startsWith(
      `${route}/`
    )
  );
}

export default function FeedSidebar({
  onCreateInsight,
}: FeedSidebarProps) {
  const pathname =
    usePathname();

  const [
    navigationState,
    setNavigationState,
  ] = useState<NavigationState>(
    createNavigationState(
      pathname ?? ""
    )
  );

  useEffect(() => {
    setNavigationState(
      (current) => ({
        activeRoute:
          pathname ?? "",
        previousRoute:
          current.activeRoute,
        transitionCount:
          current.transitionCount + 1,
      })
    );
  }, [pathname]);

  const resolvedNavigation =
    useMemo(
      () =>
        navigationItems.map(
          (item) => ({
            ...item,
            active:
              isActiveRoute(
                navigationState.activeRoute,
                item.href
              ),
          })
        ),
      [navigationState.activeRoute]
    );

  return (
    <aside className="hidden md:flex flex-col h-full p-4 gap-2 w-64 bg-surface-container-low border-r border-outline-variant">
      <div className="mb-8 px-2 py-4">
        <h1 className="font-headline-md text-headline-md font-extrabold text-primary">
          Project Alpha
        </h1>

        <p className="font-label-md text-label-md text-on-surface-variant">
          Enterprise Flow
        </p>
      </div>

      <nav className="flex-1 space-y-1">
        <div className="hidden">
          {navigationState.transitionCount}
        </div>

        {resolvedNavigation.map(
          (item) => (
            <Link
              key={item.href}
              href={item.href}
              data-route={
                item.href
              }
              data-active={
                item.active
              }
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                item.active
                  ? "bg-secondary-container text-on-secondary-container font-semibold translate-x-1"
                  : "text-on-surface-variant hover:bg-surface-variant"
              }`}
            >
              <span className="material-symbols-outlined">
                {item.icon}
              </span>

              <span className="font-label-md text-label-md">
                {item.label}
              </span>
            </Link>
          )
        )}
      </nav>

      <button
        className="mb-6 w-full flex items-center justify-center gap-2 bg-primary text-on-primary py-3 rounded-lg font-label-md text-label-md hover:opacity-90 transition-all duration-200 active:scale-95"
        type="button"
        onClick={onCreateInsight}
      >
        <span className="material-symbols-outlined">
          add
        </span>
        New Insight
      </button>

      <div className="border-t border-outline-variant pt-4 space-y-1">
        <Link
          className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors duration-200"
          href="#"
        >
          <span className="material-symbols-outlined">
            settings
          </span>
          <span className="font-label-md text-label-md">
            Settings
          </span>
        </Link>

        <Link
          className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors duration-200"
          href="#"
        >
          <span className="material-symbols-outlined">
            help_outline
          </span>
          <span className="font-label-md text-label-md">
            Support
          </span>
        </Link>
      </div>
    </aside>
  );
}