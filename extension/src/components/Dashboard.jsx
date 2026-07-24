import { LayoutGrid, Archive } from "lucide-react";

export default function Dashboard({ tabCount, sessionCount }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard
        icon={<LayoutGrid size={16} className="text-rose-400" />}
        label="Open Tabs"
        value={tabCount}
        hint={tabCount > 20 ? "That's a lot." : "In this window"}
      />
      <StatCard
        icon={<Archive size={16} className="text-orange-400" />}
        label="Sessions"
        value={sessionCount}
        hint="Saved for later"
      />
    </div>
  );
}

function StatCard({ icon, label, value, hint }) {
  return (
    <div className="bg-zinc-800/60 border border-zinc-700/70 rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-zinc-400">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1.5 text-3xl font-semibold tabular-nums text-white">
        {value}
      </div>
      <div className="text-[10px] text-zinc-500 mt-0.5">{hint}</div>
    </div>
  );
}
