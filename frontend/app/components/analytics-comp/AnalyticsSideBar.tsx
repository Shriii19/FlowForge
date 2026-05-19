import Link from "next/link";

export default function AnalyticsSidebar() {
  return (
    <aside className="hidden md:flex flex-col h-screen w-64 bg-surface-container-low border-r border-outline-variant p-4 gap-2 sticky top-0">
      <div className="mb-8 px-2">
        <h1 className="font-headline-md text-headline-md font-extrabold text-primary">
          Flow Insights
        </h1>
        <p className="font-label-md text-label-md text-on-surface-variant">
          Enterprise Flow
        </p>
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        <Link className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors duration-200" href="/insights/overview">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-label-md">Overview</span>
        </Link>

        <Link className="flex items-center gap-3 px-3 py-2 bg-secondary-container text-on-secondary-container font-semibold rounded-lg translate-x-1 transition-transform" href="/insights/analytics">
          <span className="material-symbols-outlined">insights</span>
          <span className="font-label-md">Analytics</span>
        </Link>

        <Link className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors duration-200" href="/insights/tasks">
          <span className="material-symbols-outlined">route</span>
          <span className="font-label-md">Tasks</span>
        </Link>

        <Link className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors duration-200" href="/insights/feed">
          <span className="material-symbols-outlined">forum</span>
          <span className="font-label-md">Feed</span>
        </Link>
      </nav>

      <button className="mt-4 mb-8 w-full py-3 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all">
        New Insight
      </button>

      <div className="flex flex-col gap-2 pt-4 border-t border-outline-variant">
        <Link className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors" href="#">
          <span className="material-symbols-outlined">settings</span>
          <span className="font-label-md">Settings</span>
        </Link>
        <Link className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors" href="#">
          <span className="material-symbols-outlined">help_outline</span>
          <span className="font-label-md">Support</span>
        </Link>
      </div>
    </aside>
  );
}
