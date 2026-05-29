import React from "react";

import OverviewMain from "@/app/components/Overview-comp/OverviewMain";

export default function InsightsOverviewPage() {
  return (
      <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
        <div className="w-full p-4 md:p-10">
          <OverviewMain />
        </div>
      </div>
  );
}