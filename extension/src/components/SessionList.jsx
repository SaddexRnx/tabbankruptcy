import { useState } from "react";
import { RotateCcw, Trash2, ChevronDown, ChevronRight, Inbox } from "lucide-react";

export default function SessionList({ sessions, onRestore, onDelete, t }) {
  if (sessions.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center px-6 text-neutral-500">
        <Inbox size={28} className="mb-2 text-neutral-400" />
        <p className="text-sm">{t("noSessions")}</p>
        <p className="text-[11px] mt-1">{t("whenYouDeclare")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sessions.map((s) => (
        <SessionCard
          key={s.id}
          session={s}
          onRestore={() => onRestore(s)}
          onDelete={() => onDelete(s.id)}
          t={t}
        />
      ))}
    </div>
  );
}

function SessionCard({ session, onRestore, onDelete, t }) {
  const [open, setOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const date = new Date(session.createdAt);
  const dateLabel = date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
      <div className="flex items-center gap-2 p-2.5">
        <button
          onClick={() => setOpen((v) => !v)}
          className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-500"
          aria-label="Expand"
        >
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{session.name}</div>
          <div className="text-[11px] text-neutral-500">
            {session.tabs.length} {session.tabs.length === 1 ? t("tab") : t("tabs")} · {dateLabel}
          </div>
        </div>
        <button
          onClick={onRestore}
          title={t("restoreAll")}
          className="p-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900"
        >
          <RotateCcw size={12} />
        </button>
        <button
          onClick={() => (confirmDel ? onDelete() : setConfirmDel(true))}
          onMouseLeave={() => setConfirmDel(false)}
          title={confirmDel ? t("clickAgain") : t("delete")}
          className={`p-1.5 rounded-md border transition ${
            confirmDel
              ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white"
              : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900"
          }`}
        >
          <Trash2 size={12} />
        </button>
      </div>

      {open && (
        <ul className="border-t border-neutral-200 dark:border-neutral-800 max-h-56 overflow-y-auto tb-scroll">
          {session.tabs.map((tab, i) => (
            <li
              key={i}
              className="flex items-center gap-2 px-3 py-1.5 text-[12px] hover:bg-neutral-50 dark:hover:bg-neutral-900"
            >
              {tab.favIconUrl ? (
                <img
                  src={tab.favIconUrl}
                  alt=""
                  className="w-3.5 h-3.5 rounded-sm flex-shrink-0"
                  onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                />
              ) : (
                <div className="w-3.5 h-3.5 rounded-sm bg-neutral-200 dark:bg-neutral-800 flex-shrink-0" />
              )}
              <span className="truncate flex-1" title={tab.title}>
                {tab.title}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
