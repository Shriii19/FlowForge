const COLORS = [
  "bg-surface-container30",
  "bg-primary10",
  "bg-primary20",
  "bg-primary40",
  "bg-primary60",
  "bg-primary80",
];

type HeatmapProps = {
  values: number[];
};

export default function Heatmap({ values }: HeatmapProps) {
  const cells = values.length > 0 ? values : Array.from({ length: 365 }, (_, index) => index % COLORS.length);

  return (
    <section className="glass-panel rounded-3xl p-8 mb-16 glow-soft">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <h3 className="font-headline-md text-20px text-primary">Contribution Density</h3>
          <span className="px-2 py-0.5 bg-surface-container rounded text-10px font-bold text-on-surface-variant60 uppercase tracking-widest">Last 52 Weeks</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-11px text-on-surface-variant50">Less</span>
          <div className="flex gap-1">
            {COLORS.map((color) => (
              <div key={color} className={`heatmap-square ${color}`} />
            ))}
          </div>
          <span className="text-11px text-on-surface-variant50">More</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-4 custom-scrollbar">
        <div className="grid grid-rows-7 grid-flow-col gap-1.5 min-w-700px">
          {cells.map((value, index) => (
            <div
              key={index}
              className={`heatmap-square ${COLORS[value % COLORS.length]} transition-colors hover:ring-2 hover:ring-primary20 cursor-help`}
              title={`${value} activity points`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
