// app/insights/layout.tsx
import React from "react";
import InsightsSidebar from "@/app/components/InsightsSidebar";

export default function InsightsLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <div className="flex bg-[#f5f7f2] text-[#1d2a20] min-h-screen">
      <InsightsSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {children}
      </div>
    </div>
  );
}