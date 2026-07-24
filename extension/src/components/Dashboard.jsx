import { LayoutGrid, Archive } from "lucide-react";

export default function Dashboard({ tabCount, sessionCount, t }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard
        icon={<LayoutGrid size={14} />}
        label={t("openTabs")}
        value={tabCount}
        hint={tabCount > 20 ? t("thatsALot") : t("inThisWindow")}
      />
      <StatCard
        icon={<Archive size={14} />}
        label={t("sessions")}
        value={sessionCount}
        hint={t("savedForLater")}
      />
    </div>
  );
}

function StatCard({ icon, label, value, hint }) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-neutral-500">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1.5 text-3xl font-semibold tabular-nums">{value}</div>
      <div className="text-[10px] text-neutral-500 mt-0.5">{hint}</div>
    </div>
  );
}
