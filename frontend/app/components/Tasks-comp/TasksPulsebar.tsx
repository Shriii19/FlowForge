export type TaskPulseStage = {
  label: string;
  value: number;
  active: boolean;
};

type TaskPulseBarProps = {
  stages: TaskPulseStage[];
};

export default function TaskPulseBar({ stages }: TaskPulseBarProps) {
  return (
    <div className="bg-surface-container-lowest/40 backdrop-blur p-1 rounded-2xl border border-outline-variant/30 flex flex-col md:flex-row items-stretch shadow-sm">
      {stages.map((stage, index) => (
        <div
          key={stage.label}
          className={`flex-1 px-8 py-4 border-outline-variant/20 group hover:bg-surface-container-low/50 transition-colors ${
            index < stages.length - 1 ? "md:border-r" : ""
          } ${index === 0 ? "rounded-l-xl" : ""} ${index === stages.length - 1 ? "border-r-0 rounded-r-xl" : ""}`}
        >
          <span className="font-label-md text-[10px] text-outline uppercase tracking-widest block mb-1">
            {stage.label}
          </span>
          <div className="flex items-baseline gap-1">
            <span className={`font-headline-md text-[22px] ${stage.active ? "text-primary" : "text-on-surface"}`}>
              {stage.value}
            </span>
            <span className="font-body-md text-on-surface-variant text-[14px]">days</span>
          </div>
        </div>
      ))}
    </div>
  );
}
