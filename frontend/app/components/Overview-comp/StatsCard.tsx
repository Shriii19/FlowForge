import React from "react";

type Props = {
  label: string;
  value: string;
  sub?: React.ReactNode;
  icon?: string;
};

export default function StatsCard({ label, value, sub, icon }: Props) {
  return (
    <div className="glass-panel p-6 rounded-2xl min-w-180px glow-soft">
      <p className="font-label-md text-11px text-secondary60 mb-2 uppercase tracking-widest">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="font-headline-lg text-36px text-primary font-extrabold tracking-tighter">{value}</span>
        {sub ? <span className="text-primary font-bold text-13px opacity-70 flex items-center gap-1">{sub}</span> : null}
      </div>
      {icon ? <span className="material-symbols-outlined text-14px">{icon}</span> : null}
    </div>
  );
}