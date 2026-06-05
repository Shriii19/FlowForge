"use client";

import type { MemberPerformance } from "./PerformanceSummary";

type MemberAnalyticsProps = {
  members: MemberPerformance[];
  selectedMember: MemberPerformance;
  onSelectMember: (memberId: string) => void;
};

function getCompletionRate(
  completed: number,
  assigned: number
) {
  return assigned > 0
    ? Math.round((completed / assigned) * 100)
    : 0;
}

function getReviewLoad(
  reviews: number
) {
  return Math.min(100, reviews * 4);
}

export default function MemberAnalytics({
  members,
  selectedMember,
  onSelectMember,
}: MemberAnalyticsProps) {
  const analyticsMetrics = useMemo(
    () => {
      const completionRate =
        getCompletionRate(
          selectedMember.completed,
          selectedMember.assigned
        );

      return {
        completionRate,
        reviewLoad: getReviewLoad(
          selectedMember.reviews
        ),
        otherPercent:
          100 - completionRate,
      };
    },
    [selectedMember]
  );

  const {
    completionRate,
    reviewLoad,
    otherPercent,
  } = analyticsMetrics;

  return (
    <section className="grid grid-cols-1 gap-gutter lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] p-card-padding flex flex-col gap-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-primary font-bold">
              {selectedMember.name.split(" ").map((part) => part[0]).join("")}
            </div>
            <div>
              <h4 className="font-headline-md text-headline-md">{selectedMember.name}</h4>
              <p className="font-label-md text-on-surface-variant">{selectedMember.role}</p>
            </div>
          </div>

          <div className="rounded-full bg-primary-container px-4 py-2 font-label-md text-on-primary-container">
            Focus: {selectedMember.focus}
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <span className="font-label-md text-primary uppercase tracking-widest">
              Activity Frequency
            </span>
            <div className="h-24 w-full flex items-end gap-2 rounded-lg bg-surface-container-low p-3">
              {selectedMember.activity.map((height, index) => (
                <button
                  key={`${selectedMember.id}-${index}`}
                  type="button"
                  className="group flex flex-1 items-end h-full"
                  title={`Day ${index + 1}: ${height}% activity`}
                >
                  <span
                    className="w-full rounded-t-md bg-primary/70 transition-all group-hover:bg-primary"
                    style={{ height: `${height}%` }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <span className="font-label-md text-primary uppercase tracking-widest">
              Workload Distribution
            </span>
            <div className="flex items-center gap-5">
              <svg className="w-20 h-20 rotate-[-90deg]" viewBox="0 0 32 32" aria-label="Workload distribution">
                <circle cx="16" cy="16" fill="#d0e4e1" r="16" />
                <circle
                  cx="16"
                  cy="16"
                  fill="transparent"
                  r="16"
                  stroke="#00534e"
                  strokeDasharray={`${completionRate} 100`}
                  strokeWidth="32"
                />
              </svg>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span className="font-data-viz text-data-viz">{completionRate}% Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary-container" />
                  <span className="font-data-viz text-data-viz">{otherPercent}% Open</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-tertiary" />
                  <span className="font-data-viz text-data-viz">{reviewLoad}% Review Load</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] p-4">
        <h3 className="px-2 pb-3 font-headline-md text-headline-md">Members</h3>
        <div className="flex flex-col gap-2">
          {members.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => onSelectMember(member.id)}
              className={`rounded-lg px-3 py-3 text-left transition ${
                selectedMember.id === member.id
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-low hover:bg-secondary-container"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-label-md">{member.name}</span>
                <span className="text-xs">
                  {getCompletionRate(
                    member.completed,
                    member.assigned
                  )}%
                </span>
              </div>
              <p className="mt-1 text-xs opacity-75">{member.role}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
