"use client";

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
    <div className="flex min-h-screen relative">
      {!hideSidebar && <Sidebar />}
      <main className={mainClass}>{children}</main>
    </div>
  );
}
