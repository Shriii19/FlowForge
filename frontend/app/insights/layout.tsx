// app/insights/layout.tsx
import React from "react";
import InsightsSidebar from "@/app/components/InsightsSidebar";

export default function InsightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <InsightsSidebar />

      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}