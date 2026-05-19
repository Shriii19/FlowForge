"use client"

const InsightsPage = () => {
  const navItems = [
    {
        label: 'Overview',
        active: true,
    },
    {
        label: "Analytics",
        active: false,
    },
    {
        label: "Tasks",
        active: false,
    },
    {
        label: "Feed",
        active: false,
    },
  ];
  return (
    <div className="min-h-screen bg [#f6f7f5]">
        <div className="grid min-h-screen gird-cols-[240px_1fr_320px]">
            <aside className="border-r border-slate-200 p-6">
               <div>
                  <h1>
                    Flow Insights
                  </h1>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                    Enterprise Flow
                  </p>
               </div>
               <nav className="mtt-16 space-y-2">
                <button className="flex w-full items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
                    Overiew
                </button>
                <button className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-500">
                    Analytics
                </button>
                <button className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-500">
                    Tasks
                </button>
                <button className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-500">
                    Feed
                </button>
               </nav>
            </aside>

            <main className="p-10">
                <div className="max-w-5xl">
                   <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">
                        Project Alpha Evolution
                      </p>
                      <h1 className="mt-6 text-7xl font-semibold leading-none tracking-tight text-slate-950">
                        Project
                        <br />
                        Evolution
                      </h1>
                      <p className="mt-8 max-w-md text-lg leading-8 text-slate-500">
                        Acomprehensive deep-dive into project development,
                        velocity trends, and realtime contributor synchronization.
                      </p>
                   </div>
                </div>
            </main>

            <aside className="border border-slate-200 p-6">
                Realtime feed
            </aside>
        </div>
    </div>
  )
}

export default InsightsPage