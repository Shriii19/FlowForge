"use client";
import CommandPalette from "./CommandPalette";
import NotificationsPanel from "./NotificationsPanel";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isPublicRoute =
    pathname === "/" || pathname === "/login" || pathname === "/signup";
  const isInsightsRoute = pathname?.startsWith("/insights");

  const hideSidebar = isPublicRoute || isInsightsRoute;

  // Let Insights pages control their own padding
  const mainClass = hideSidebar
    ? "min-w-0 flex-1 overflow-x-hidden"
    : "min-w-0 flex-1 overflow-x-hidden p-6";

  return (
    <div className="flex min-h-screen relative w-full">
      <CommandPalette />

      {!hideSidebar && <Sidebar />}

      <div className="flex-1 flex flex-col">
        {!isPublicRoute && (
          <div
            className="
              sticky top-0 z-40
              flex items-center justify-end
              border-b border-outline-variant
              bg-white/80
              px-6 py-4
              backdrop-blur-xl
            "
          >
            <NotificationsPanel />
          </div>
        )}

        <main className={mainClass}>
          {children}
        </main>
      </div>
    </div>
  );
}
