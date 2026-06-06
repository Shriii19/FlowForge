"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

import CommandPalette from "./CommandPalette";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

function getLayoutState(pathname: string | null) {
  const isPublicRoute =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/signup";

  const isInsightsRoute =
    pathname?.startsWith("/insights");

  const hideSidebar =
    isPublicRoute || isInsightsRoute;

  const mainClass = hideSidebar
    ? "min-w-0 flex-1 overflow-x-hidden"
    : "min-w-0 flex-1 overflow-x-hidden p-6";

  return {
    isPublicRoute,
    isInsightsRoute,
    hideSidebar,
    mainClass,
  };
}


export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const {
    isPublicRoute,
    hideSidebar,
    mainClass,
  } = useMemo(
    () => getLayoutState(pathname),
    [pathname]
  );

  return (
    <div className="flex min-h-screen w-full bg-[#f5f7f2]">
      <CommandPalette />

      {!hideSidebar && <Sidebar />}

      <div className="flex min-w-0 flex-1 flex-col">
        {!isPublicRoute && (
          <div className="sticky top-0 z-40">
            <TopNavbar />
          </div>
        )}

        <main className={mainClass}>
          {children}
        </main>
      </div>
    </div>
  );
}