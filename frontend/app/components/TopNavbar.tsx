"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import NotificationsPanel from "./NotificationsPanel";

const NAVIGATION_ITEMS = [
  {
    href: "/projects",
    label: "Projects",
    match: "/projects",
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    match: "/dashboard",
  },
  {
    href: "/insights/overview",
    label: "Insights",
    match: "/insights",
  },
] as const;

export default function TopNavbar() {
  const pathname = usePathname();

  const [persistedRoute, setPersistedRoute] =
    useState("Home");

  const [navigationRecovered, setNavigationRecovered] =
    useState(false);

  useEffect(() => {
    const savedRoute =
      sessionStorage.getItem(
        "flowforge-active-route"
      );

    if (savedRoute) {
      setPersistedRoute(savedRoute);
      setNavigationRecovered(true);
    }
  }, []);

  useEffect(() => {
    if (!pathname) {
      return;
    }

    sessionStorage.setItem(
      "flowforge-last-path",
      pathname
    );
  }, [pathname]);

  const navigationItems = useMemo(() => {
    return NAVIGATION_ITEMS.map((item) => ({
      ...item,
      isActive: pathname.startsWith(item.match),
    }));
  }, [pathname]);

  const activeRouteLabel = useMemo(() => {
    return (
      navigationItems.find(
        (item) => item.isActive
      )?.label ?? "Home"
    );
  }, [navigationItems]);

  useEffect(() => {
    sessionStorage.setItem(
      "flowforge-active-route",
      activeRouteLabel
    );

    setPersistedRoute(
      activeRouteLabel
    );
  }, [activeRouteLabel]);

  const profileImage = useMemo(
    () => "https://i.pravatar.cc/80?img=32",
    []
  );

  return (
    <header className="h-20 border-b border-outline-variant bg-white">
      <div className="flex h-full items-center justify-between px-8">
        {/* Left Side */}
        <div className="flex items-center gap-10">
          <Link
            href="/dashboard"
            className="text-[20px] font-bold text-primary"
          >
            FlowForge
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`pb-1 text-sm transition-colors ${
                  item.isActive
                    ? "border-b-2 border-primary font-semibold text-primary"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-5">
          <NotificationsPanel />

          <span
            className="
              hidden lg:inline-flex
              rounded-full
              bg-surface-container-low
              px-3 py-1
              text-xs
              font-medium
            "
          >
            {persistedRoute}
          </span>

          {navigationRecovered && (
            <span
              className="
                hidden xl:inline-flex
                rounded-full
                bg-primary-container
                px-2 py-1
                text-[10px]
                font-medium
              "
            >
              State Restored
            </span>
          )}

          <button
            className="
              rounded-full p-2
              text-on-surface-variant
              transition-all duration-200
              hover:bg-surface-container-low
            "
            type="button"
          >
            <span className="material-symbols-outlined">
              settings
            </span>
          </button>

          <img
            alt="User profile"
            src={profileImage}
            className="
              h-10 w-10 rounded-full
              border border-outline-variant
              object-cover
            "
          />
        </div>
      </div>
    </header>
  );
}