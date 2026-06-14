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

function calculateHeatmapStats(
  values: number[]
) {
  if (values.length === 0) {
    return {
      min: 0,
      max: 0,
      average: 0,
      total: 0,
    };
  }

  const total = values.reduce(
    (sum, value) => sum + value,
    0
  );

  return {
    min: Math.min(...values),
    max: Math.max(...values),
    average:
      total / values.length,
    total,
  };
}

function normalizeValue(
  value: number,
  min: number,
  max: number
) {
  if (max === min) {
    return value > 0
      ? COLORS.length - 1
      : 0;
  }

  const normalized =
    (value - min) /
    (max - min);

  return Math.min(
    COLORS.length - 1,
    Math.floor(
      normalized *
        (COLORS.length - 1)
    )
  );
}

function buildHeatmapCells(
  values: number[]
) {
  const fallbackValues =
    Array.from(
      { length: 365 },
      () => 0
    );

  const sourceValues =
    values.length > 0
      ? values
      : fallbackValues;

  const stats =
    calculateHeatmapStats(
      sourceValues
    );

  return sourceValues.map(
    (value) => ({
      value,
      intensity:
        normalizeValue(
          value,
          stats.min,
          stats.max
        ),
    })
  );
}

export default function Heatmap({
  values,
}: HeatmapProps) {
  const heatmapCells =
    buildHeatmapCells(values);

  const stats =
    calculateHeatmapStats(
      values
    );

  return (
    <section className="glass-panel rounded-3xl p-8 mb-16 glow-soft">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <h3 className="font-headline-md text-20px text-primary">
            Contribution Density
          </h3>

          <span className="px-2 py-0.5 bg-surface-container rounded text-10px font-bold text-on-surface-variant60 uppercase tracking-widest">
            Last 52 Weeks
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right text-11px text-on-surface-variant50">
            <div>
              Total: {stats.total}
            </div>

            <div>
              Avg:{" "}
              {stats.average.toFixed(
                1
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-11px text-on-surface-variant50">
              Less
            </span>

            <div className="flex gap-1">
              {COLORS.map(
                (color) => (
                  <div
                    key={color}
                    className={`heatmap-square ${color}`}
                  />
                )
              )}
            </div>

            <span className="text-11px text-on-surface-variant50">
              More
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto pb-4 custom-scrollbar">
        <div className="grid grid-rows-7 grid-flow-col gap-1.5 min-w-700px">
          {heatmapCells.map(
            (
              cell,
              index
            ) => (
              <div
                key={index}
                className={`heatmap-square ${
                  COLORS[
                    cell.intensity
                  ]
                } transition-colors hover:ring-2 hover:ring-primary20 cursor-help`}
                title={`${cell.value} activity points`}
              />
            )
          )}
        </div>
      </div>
    </section>
  );
}