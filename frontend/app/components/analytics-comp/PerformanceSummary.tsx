"use client";

import { useMemo } from "react";

export type AnalyticsMetric =
  | "completed"
  | "assigned";

export type MemberPerformance = {
  id: string;
  name: string;
  role: string;
  assigned: number;
  completed: number;
  reviews: number;
  focus: string;
  activity: number[];
  image: string;
};

type PerformanceSummaryProps = {
  members: MemberPerformance[];
  metric: AnalyticsMetric;
  onMetricChange: (
    metric: AnalyticsMetric
  ) => void;
};

function calculateTotals(
  members: MemberPerformance[]
) {
  return members.reduce(
    (acc, member) => {
      acc.completed +=
        member.completed;
      acc.assigned +=
        member.assigned;
      acc.reviews +=
        member.reviews;

      return acc;
    },
    {
      completed: 0,
      assigned: 0,
      reviews: 0,
    }
  );
}

function calculateCompletionRate(
  completed: number,
  assigned: number
) {
  return assigned > 0
    ? Math.round(
        (completed / assigned) *
          100
      )
    : 0;
}

export default function PerformanceSummary({
  members,
  metric,
  onMetricChange,
}: PerformanceSummaryProps) {
  const analyticsTotals =
    useMemo(
      () =>
        calculateTotals(
          members
        ),
      [members]
    );

  const completedTotal =
    analyticsTotals.completed;

  const assignedTotal =
    analyticsTotals.assigned;

  const reviewTotal =
    analyticsTotals.reviews;

  const completionRate =
    calculateCompletionRate(
      completedTotal,
      assignedTotal
    );

  return (
    <section>
      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary">
            Contribution Analytics
          </h2>

          <p className="text-body-md text-on-surface-variant">
            Explore workload
            balance, delivery
            velocity, and review
            activity by sprint.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-surface-container-low px-4 py-3">
            <p className="text-label-md text-on-surface-variant">
              Completion
            </p>

            <p className="font-headline-md text-primary">
              {completionRate}%
            </p>
          </div>

          <div className="rounded-lg bg-surface-container-low px-4 py-3">
            <p className="text-label-md text-on-surface-variant">
              Completed
            </p>

            <p className="font-headline-md text-primary">
              {completedTotal}
            </p>
          </div>

          <div className="rounded-lg bg-surface-container-low px-4 py-3">
            <p className="text-label-md text-on-surface-variant">
              Reviews
            </p>

            <p className="font-headline-md text-primary">
              {reviewTotal}
            </p>
          </div>
        </div>
      </header>

      <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] p-card-padding">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div>
            <h3 className="font-headline-md text-headline-md">
              Task Completion
              Velocity
            </h3>

            <p className="font-label-md text-label-md text-on-surface-variant">
              Toggle between
              completed work and
              assigned workload.
            </p>
          </div>

          <div className="flex rounded-lg bg-surface-container-low p-1 font-label-md">
            {(
              [
                "completed",
                "assigned",
              ] as const
            ).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() =>
                  onMetricChange(
                    item
                  )
                }
                className={`rounded-md px-4 py-2 capitalize transition ${
                  metric === item
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6 min-h-72 items-end">
          {members.map(
            (member) => {
              const activeValue =
                member[
                  metric
                ];

              return (
                <div
                  key={
                    member.id
                  }
                  className="flex h-full flex-col items-center justify-end gap-3"
                >
                  <div className="relative flex h-56 w-full items-end justify-center rounded-lg bg-surface-container-low px-3 pt-3">
                    <div
                      className="w-full rounded-t-lg bg-primary transition-all duration-300"
                      style={{
                        height: `${activeValue}%`,
                      }}
                      title={`${member.name}: ${activeValue}% ${metric}`}
                    />

                    <span className="absolute top-3 rounded-full bg-surface px-2 py-1 text-xs font-bold text-primary shadow-sm">
                      {
                        activeValue
                      }
                      %
                    </span>
                  </div>

                  <span className="max-w-full truncate font-label-md text-on-surface-variant">
                    {member.name
                      .split(
                        " "
                      )[0]}
                  </span>
                </div>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
}