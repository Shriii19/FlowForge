import Link from "next/link";

type FeedSidebarProps = {
  onCreateInsight: () => void;
};

export default function FeedSidebar({ onCreateInsight }: FeedSidebarProps) {
  return (
    <aside className="hidden md:flex flex-col h-full p-4 gap-2 w-64 bg-surface-container-low border-r border-outline-variant">
      <div className="mb-8 px-2 py-4">
        <h1 className="font-headline-md text-headline-md font-extrabold text-primary">
          Project Alpha
        </h1>
        <p className="font-label-md text-label-md text-on-surface-variant">
          Enterprise Flow
        </p>
      </div>

      <nav className="flex-1 space-y-1">
        <Link className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors duration-200" href="/insights/overview">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-label-md text-label-md">Overview</span>
        </Link>

        <Link className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors duration-200" href="/insights/analytics">
          <span className="material-symbols-outlined">insights</span>
          <span className="font-label-md text-label-md">Analytics</span>
        </Link>

        <Link className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors duration-200" href="/insights/tasks">
          <span className="material-symbols-outlined">route</span>
          <span className="font-label-md text-label-md">Tasks</span>
        </Link>

        <Link className="flex items-center gap-3 px-4 py-3 bg-secondary-container text-on-secondary-container font-semibold rounded-lg translate-x-1 transition-transform" href="/insights/feed">
          <span className="material-symbols-outlined">forum</span>
          <span className="font-label-md text-label-md">Feed</span>
        </Link>
      </nav>

      <button
        className="mb-6 w-full flex items-center justify-center gap-2 bg-primary text-on-primary py-3 rounded-lg font-label-md text-label-md hover:opacity-90 transition-all duration-200 active:scale-95"
        type="button"
        onClick={onCreateInsight}
      >
        <span className="material-symbols-outlined">add</span>
        New Insight
      </button>

      <div className="border-t border-outline-variant pt-4 space-y-1">
        <Link className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors duration-200" href="#">
          <span className="material-symbols-outlined">settings</span>
          <span className="font-label-md text-label-md">Settings</span>
        </Link>
        <Link className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors duration-200" href="#">
          <span className="material-symbols-outlined">help_outline</span>
          <span className="font-label-md text-label-md">Support</span>
        </Link>
      </div>
    </aside>
  );
}
