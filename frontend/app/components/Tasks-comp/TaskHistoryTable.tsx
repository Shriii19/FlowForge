export type TaskHistoryRow = {
  id: string;
  task: string;
  assignee: string;
  avatar: string;
  state: string;
  time: string;
  trigger: string;
  transition: string;
};

type TaskHistoryTableProps = {
  rows: TaskHistoryRow[];
  query: string;
  onQueryChange: (query: string) => void;
};

export default function TaskHistoryTable({ rows, query, onQueryChange }: TaskHistoryTableProps) {
  return (
    <div className="bg-transparent space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <h3 className="font-headline-md text-[20px] text-on-surface font-bold">Journey History</h3>

        <div className="flex items-center gap-6">
          <div
            className="
              group
              flex items-center gap-2
              h-12 px-4
              rounded-2xl
              border border-white/20
              bg-white/70
              backdrop-blur-md
              shadow-sm 
              hover:shadow-lg
              hover:-translate-y-[1px]
              focus-within:scale-[1.01]
              focus-within:shadow-lg
              transition-all duration-300 ease-out
              focus-within:ring-4
              focus-within:ring-primary/20
              focus-within:border-primary
            "
          >
            <span
              className="
                material-symbols-outlined
                text-slate-400
                text-[20px]
                transition-all duration-300
                group-focus-within:text-primary
              "
              aria-hidden="true"
            >
              search
            </span>
            <input
              className="h-full w-56 bg-transparent !border-0 shadow-none outline-none focus:outline-none focus:ring-0 focus:border-0 px-2 text-sm text-on-surface placeholder:text-outline"
              placeholder="Search task ID..."
              type="text"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  onQueryChange("");
               }
              }}
            />
            {query && (
              <button
                type="button"
                onClick={() => onQueryChange("")}
                className="
                  text-slate-400
                  hover:text-primary
                  hover:scale-110
                  active:scale-95
                  transition-all duration-200
                "
                aria-label="Clear search"
              >
                ✕
              </button>
       )}
          </div>
          <button className="text-primary font-label-md text-label-md hover:opacity-70 transition-opacity" type="button">
            Export Records
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low/40 rounded-xl">
              <th className="pl-8 pr-4 py-4 font-label-md text-[11px] text-outline uppercase tracking-widest">Task &amp; Assignee</th>
              <th className="px-4 py-4 font-label-md text-[11px] text-outline uppercase tracking-widest">Current State</th>
              <th className="px-4 py-4 font-label-md text-[11px] text-outline uppercase tracking-widest">Entry Time</th>
              <th className="px-4 py-4 font-label-md text-[11px] text-outline uppercase tracking-widest">Last Transition</th>
              <th className="pl-4 pr-8 py-4 font-label-md text-[11px] text-outline uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-transparent">
            {rows.map((row) => (
              <tr key={row.id} className="group hover:bg-surface-container-low/30 transition-all duration-300">
                <td className="pl-8 pr-4 py-8">
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <img alt={`${row.assignee} Profile`} className="w-11 h-11 rounded-full grayscale hover:grayscale-0 transition-all shadow-sm" src={row.avatar} />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-primary rounded-full border-2 border-surface" />
                    </div>
                    <div>
                      <p className="font-label-md text-[14px] font-bold text-on-surface group-hover:text-primary transition-colors">
                        {row.task}
                      </p>
                      <p className="font-data-viz text-[11px] text-on-surface-variant/60">{row.assignee}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-8">
                  <span className="inline-flex items-center px-2.5 py-1 bg-secondary-container text-on-secondary-container rounded-md text-[11px] font-bold uppercase tracking-wider">
                    {row.state}
                  </span>
                </td>
                <td className="px-4 py-8">
                  <p className="font-data-viz text-[13px] text-on-surface">{row.time}</p>
                  <p className="font-label-md text-[10px] text-outline">{row.trigger}</p>
                </td>
                <td className="px-4 py-8">
                  <p className="font-body-md text-[15px] text-on-surface-variant font-medium">{row.transition}</p>
                  <p className="font-label-md text-[10px] text-outline">From Previous Stage</p>
                </td>
                <td className="pl-4 pr-8 py-8 text-right">
                  <button className="text-outline hover:text-primary transition-colors" type="button">
                    <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="px-8 py-10 text-center text-on-surface-variant" colSpan={5}>
                  No task journey records match the current search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center px-8 py-8 border-t border-outline-variant/10">
        <p className="font-data-viz text-[12px] text-outline">Showing {rows.length} backend journey records</p>
      </div>
    </div>
  );
}
