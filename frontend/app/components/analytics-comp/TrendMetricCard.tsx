type TrendMetricCardProps = {
  label: string;
  current: number;
  previous: number;
};

export default function TrendMetricCard({
  label,
  current,
  previous,
}: TrendMetricCardProps) {
  const difference = current - previous;

  const percentage =
    previous === 0
      ? 0
      : (difference / previous) * 100;

  const trend =
    difference > 0
      ? "▲"
      : difference < 0
      ? "▼"
      : "●";

  const colorClass =
    difference > 0
      ? "text-green-600"
      : difference < 0
      ? "text-red-600"
      : "text-gray-500";

  return (
    <div className="rounded-xl border p-4">
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {current} vs {previous}
      </p>

      <p className={`mt-1 text-sm ${colorClass}`}>
        {trend}{" "}
        {difference > 0 ? "+" : ""}
        {difference}
        {" ("}
        {percentage > 0 ? "+" : ""}
        {percentage.toFixed(1)}%
        {")"}
      </p>
    </div>
  );
}