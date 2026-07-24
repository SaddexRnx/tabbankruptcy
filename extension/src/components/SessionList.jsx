import { useState } from "react";
import { RotateCcw, Trash2, ChevronDown, ChevronRight, Inbox } from "lucide-react";

export default function SessionList({ sessions, onRestore, onDelete }) {
  if (sessions.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-6 text-zinc-500">
        <Inbox size={32} className="mb-2 text-zinc-600" />
        <p className="text-sm text-zinc-400">No sessions yet</p>
        <p className="text-[11px] mt-1">
          When you declare bankruptcy, your tabs land here.
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-2">
      {sessions.map((s) => (
        <SessionCard
          key={s.id}
          session={s}
          onRestore={() => onRestore(s)}
          onDelete={() => onDelete(s.id)}
        />
      ))}
    </div>
  );
}

function SessionCard({ session, onRestore, onDelete }) {
  const [open, setOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const date = new Date(session.createdAt);
  const dateLabel = date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-zinc-800/60 border border-zinc-700/70 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 p-2.5">
        <button
          onClick={() => setOpen((v) => !v)}
          className="p-1 rounded-md hover:bg-zinc-700 text-zinc-400"
          aria-label="Expand"
        >
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white truncate">
            {session.name}
          </div>
          <div className="text-[11px] text-zinc-500">
            {session.tabs.length} tab{session.tabs.length === 1 ? "" : "s"} ·{" "}
            {dateLabel}
          </div>
        </div>
        <button
          onClick={onRestore}
          title="Restore all tabs"
          className="p-1.5 rounded-md bg-zinc-700/60 hover:bg-emerald-500/20 hover:text-emerald-300 text-zinc-300 transition"
        >
          <RotateCcw size={13} />
        </button>
        <button
          onClick={() => (confirmDel ? onDelete() : setConfirmDel(true))}
          onMouseLeave={() => setConfirmDel(false)}
          title={confirmDel ? "Click again to confirm" : "Delete"}
          className={`p-1.5 rounded-md transition ${
            confirmDel
              ? "bg-rose-500 text-white"
              : "bg-zinc-700/60 hover:bg-rose-500/20 hover:text-rose-300 text-zinc-300"
          }`}
        >
          <Trash2 size={13} />
        </button>
      </div>

      {open && (
        <ul className="border-t border-zinc-700/70 max-h-56 overflow-y-auto tb-scroll">
          {session.tabs.map((t, i) => (
            <li
              key={i}
              className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-zinc-300 hover:bg-zinc-800"
            >
              {t.favIconUrl ? (
                <img
                  src={t.favIconUrl}
                  alt=""
                  className="w-3.5 h-3.5 rounded-sm flex-shrink-0"
                  onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                />
              ) : (
                <div className="w-3.5 h-3.5 rounded-sm bg-zinc-700 flex-shrink-0" />
              )}
              <span className="truncate flex-1" title={t.title}>
                {t.title}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
