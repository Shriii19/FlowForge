"use client";

type AnalyticsHeaderProps = {
  sprintA: string;
  sprintB: string;
  sprints: string[];
  query: string;
  onQueryChange: (query: string) => void;
  onSprintAChange: (sprint: string) => void;
  onSprintBChange: (sprint: string) => void;
};

export default function AnalyticsHeader({
  sprintA,
  sprintB,
  sprints,
  query,
  onQueryChange,
  onSprintAChange,
  onSprintBChange,
}: AnalyticsHeaderProps) {
  return (
    <div className="border-b border-outline-variant bg-white px-6 py-4">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">

          <select
            value={sprintA}
            onChange={(event) =>
              onSprintAChange(event.target.value)
            }
            className="
              rounded-lg border border-outline-variant
              bg-surface-container-low
              px-3 py-2
              outline-none transition
              focus:border-primary
            "
          >
            {sprints.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={sprintB}
            onChange={(event) =>
              onSprintBChange(event.target.value)
            }
            className="
              rounded-lg border border-outline-variant
              bg-surface-container-low
              px-3 py-2
              outline-none transition
              focus:border-primary
            "
          >
            {sprints.map((item) => (
              <option key={`compare-${item}`} value={item}>
                {item}
              </option>
            ))}
          </select>

          <input
            value={query}
            onChange={(event) =>
              onQueryChange(event.target.value)
            }
            placeholder="Search member, role, or focus..."
            className="
              min-w-0 flex-1 rounded-lg
              border border-outline-variant
              bg-surface-container-low
              px-4 py-2
              outline-none transition
              focus:border-primary
            "
          />
        </div>
      </div>
    </div>
  );
}