import React from "react";
import TopHeader from "@/app/components/Tasks-comp/TopHeader";
import OverviewMain from "@/app/components/Overview-comp/OverviewMain";

export default function InsightsOverviewPage() {
  return (
    <>
      <TopHeader />
      <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
        <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-12">
          <OverviewMain />
        </div>
      </div>
    </>
  );
}