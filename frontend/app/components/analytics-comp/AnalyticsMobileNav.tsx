import Link from "next/link";

export default function AnalyticsMobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface flex justify-around items-center h-16 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] z-50">
      <Link className="flex flex-col items-center gap-1 text-on-surface-variant" href="/insights/overview">
        <span className="material-symbols-outlined">dashboard</span>
        <span className="text-[10px] font-label-md">Overview</span>
      </Link>

      <Link className="flex flex-col items-center gap-1 text-primary" href="/insights/analytics">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
          insights
        </span>
        <span className="text-[10px] font-label-md font-bold">Analytics</span>
      </Link>

      <Link className="flex flex-col items-center gap-1 text-on-surface-variant" href="/insights/tasks">
        <span className="material-symbols-outlined">route</span>
        <span className="text-[10px] font-label-md">Tasks</span>
      </Link>

      <Link className="flex flex-col items-center gap-1 text-on-surface-variant" href="/insights/feed">
        <span className="material-symbols-outlined">forum</span>
        <span className="text-[10px] font-label-md">Feed</span>
      </Link>
    </nav>
  );
}
