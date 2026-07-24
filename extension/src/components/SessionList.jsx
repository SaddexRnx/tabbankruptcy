import { useState, useRef, useEffect } from "react";
import { RotateCcw, Trash2, ChevronDown, ChevronRight, Inbox, Tag, StickyNote, X, Check, ExternalLink, History as HistoryIcon } from "lucide-react";

export default function SessionList({
  sessions, onRestore, onRestoreInWindow, onDelete, onUpdate, onRestoreRevision,
  selectedIds, onToggleSelect, t,
}) {
  if (sessions.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center px-6 text-neutral-500">
        <Inbox size={28} className="mb-2 text-neutral-400" aria-hidden="true" />
        <p className="text-sm">{t("noSessions")}</p>
        <p className="text-[11px] mt-1">{t("whenYouDeclare")}</p>
      </div>
    );
  }
  return (
    <ul className="space-y-2" role="list" aria-label={t("sessions")}>
      {sessions.map((s) => (
        <li key={s.id}>
          <SessionCard
            session={s}
            selected={selectedIds?.has(s.id)}
            onToggleSelect={() => onToggleSelect(s.id)}
            onRestore={() => onRestore(s)}
            onRestoreInWindow={() => onRestoreInWindow(s)}
            onDelete={() => onDelete(s.id)}
            onUpdate={(patch) => onUpdate(s.id, patch)}
            onRestoreRevision={(rev) => onRestoreRevision(s.id, rev)}
            t={t}
          />
        </li>
      ))}
    </ul>
  );
}

function SessionCard({ session, selected, onToggleSelect, onRestore, onRestoreInWindow, onDelete, onUpdate, onRestoreRevision, t }) {
  const [open, setOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [editMeta, setEditMeta] = useState(false);
  const [showRevs, setShowRevs] = useState(false);
  const [notes, setNotes] = useState(session.notes || "");
  const [tagDraft, setTagDraft] = useState("");
  const tags = session.tags || [];
  const revisions = session.revisions || [];
  const notesRef = useRef(null);

  useEffect(() => { if (editMeta && notesRef.current) notesRef.current.focus(); }, [editMeta]);

  const date = new Date(session.createdAt);
  const dateLabel = date.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const addTag = () => {
    const v = tagDraft.trim().replace(/,/g, "");
    if (!v || tags.includes(v)) { setTagDraft(""); return; }
    onUpdate({ tags: [...tags, v] }); setTagDraft("");
  };
  const removeTag = (tg) => onUpdate({ tags: tags.filter((x) => x !== tg) });
  const saveNotes = () => { onUpdate({ notes }); setEditMeta(false); };

  return (
    <div className={`rounded-xl border overflow-hidden transition ${
      selected ? "border-neutral-900 dark:border-white ring-1 ring-neutral-900 dark:ring-white"
               : "border-neutral-200 dark:border-neutral-800"}`}>
      <div className="flex items-center gap-2 p-2.5">
        <input
          type="checkbox" checked={!!selected} onChange={onToggleSelect}
          aria-label={`${t("select")} ${session.name}`}
          className="h-3.5 w-3.5 accent-neutral-900 dark:accent-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white rounded-sm"
        />
        <button onClick={() => setOpen((v) => !v)}
          className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white"
          aria-label={open ? t("collapse") : t("expand")} aria-expanded={open}>
          {open ? <ChevronDown size={14} aria-hidden="true" /> : <ChevronRight size={14} aria-hidden="true" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{session.name}</div>
          <div className="text-[11px] text-neutral-500 flex items-center gap-1 flex-wrap">
            <span>{session.tabs.length} {session.tabs.length === 1 ? t("tab") : t("tabs")} · {dateLabel}</span>
            {revisions.length > 0 && (
              <button
                onClick={() => setShowRevs((v) => !v)}
                aria-expanded={showRevs}
                className="inline-flex items-center gap-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 text-[9px] hover:bg-neutral-200 dark:hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white"
              >
                <HistoryIcon size={9} aria-hidden="true" /> v{(session.version || 1) + revisions.length} · {revisions.length} {t("revisions")}
              </button>
            )}
          </div>
          {(tags.length > 0 || session.notes) && !editMeta && (
            <div className="flex flex-wrap items-center gap-1 mt-1">
              {tags.map((tg) => (
                <span key={tg} className="inline-flex items-center gap-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[10px] px-1.5 py-0.5">
                  <Tag size={8} aria-hidden="true" /> {tg}
                </span>
              ))}
              {session.notes && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-neutral-500" title={session.notes}>
                  <StickyNote size={9} aria-hidden="true" />
                  <span className="truncate max-w-[140px]">{session.notes}</span>
                </span>
              )}
            </div>
          )}
        </div>
        <IconBtn onClick={() => setEditMeta((v) => !v)} label={t("editMeta")}><StickyNote size={12} aria-hidden="true" /></IconBtn>
        <IconBtn onClick={onRestoreInWindow} label={t("restoreInWindow")}><ExternalLink size={12} aria-hidden="true" /></IconBtn>
        <IconBtn onClick={onRestore} label={t("restoreAll")}><RotateCcw size={12} aria-hidden="true" /></IconBtn>
        <button
          onClick={() => (confirmDel ? onDelete() : setConfirmDel(true))}
          onMouseLeave={() => setConfirmDel(false)}
          onBlur={() => setConfirmDel(false)}
          aria-label={confirmDel ? t("clickAgain") : t("delete")}
          title={confirmDel ? t("clickAgain") : t("delete")}
          className={`p-1.5 rounded-md border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white ${
            confirmDel ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white"
                       : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900"
          }`}>
          <Trash2 size={12} aria-hidden="true" />
        </button>
      </div>

      {showRevs && revisions.length > 0 && (
        <div className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-2 space-y-1">
          <div className="text-[10px] uppercase tracking-wide text-neutral-500">{t("revisionHistory")}</div>
          <ul className="space-y-1">
            {revisions.map((r, i) => (
              <li key={i} className="flex items-center gap-2 text-[11px]">
                <span className="flex-1 truncate">
                  v{(session.version || 1) + revisions.length - 1 - i} · {new Date(r.revisedAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  <span className="text-neutral-500 ml-1">({r.reason} · {r.tabs.length} {t("tabs")})</span>
                </span>
                <button
                  onClick={() => onRestoreRevision(r)}
                  className="px-1.5 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-white dark:hover:bg-neutral-800 text-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white"
                >
                  {t("restoreThis")}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {editMeta && (
        <div className="border-t border-neutral-200 dark:border-neutral-800 p-2.5 space-y-2 bg-neutral-50 dark:bg-neutral-900">
          <label className="block text-[10px] uppercase tracking-wide text-neutral-500" htmlFor={`notes-${session.id}`}>{t("notes")}</label>
          <textarea id={`notes-${session.id}`} ref={notesRef} rows={2}
            value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("notesPlaceholder")}
            className="w-full px-2 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs outline-none focus:border-neutral-900 dark:focus:border-white resize-none" />
          <label className="block text-[10px] uppercase tracking-wide text-neutral-500" htmlFor={`tag-${session.id}`}>{t("tags")}</label>
          <div className="flex flex-wrap items-center gap-1">
            {tags.map((tg) => (
              <span key={tg} className="inline-flex items-center gap-1 rounded-full bg-neutral-200 dark:bg-neutral-800 text-[10px] px-2 py-0.5">
                {tg}
                <button type="button" onClick={() => removeTag(tg)} aria-label={`${t("remove")} ${tg}`}
                  className="hover:text-red-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900 dark:focus-visible:ring-white rounded-full">
                  <X size={9} aria-hidden="true" />
                </button>
              </span>
            ))}
            <input id={`tag-${session.id}`} value={tagDraft} onChange={(e) => setTagDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }}
              placeholder={t("addTag")}
              className="flex-1 min-w-[80px] px-2 py-1 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-[11px] outline-none focus:border-neutral-900 dark:focus:border-white" />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setNotes(session.notes || ""); setEditMeta(false); }}
              className="px-2 py-1 rounded-md text-[11px] border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white">
              {t("cancel")}
            </button>
            <button onClick={saveNotes}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-neutral-900 dark:focus-visible:ring-white">
              <Check size={10} aria-hidden="true" /> {t("save")}
            </button>
          </div>
        </div>
      )}

      {open && (
        <ul className="border-t border-neutral-200 dark:border-neutral-800 max-h-56 overflow-y-auto tb-scroll">
          {session.tabs.length === 0 && (
            <li className="px-3 py-2 text-[11px] text-neutral-500 italic">{t("emptySessionTabs")}</li>
          )}
          {session.tabs.map((tab, i) => (
            <li key={i} className="group flex items-center gap-2 px-3 py-1.5 text-[12px] hover:bg-neutral-50 dark:hover:bg-neutral-900">
              {tab.favIconUrl ? (
                <img src={tab.favIconUrl} alt="" className="w-3.5 h-3.5 rounded-sm flex-shrink-0"
                  onError={(e) => (e.currentTarget.style.visibility = "hidden")} />
              ) : (
                <div className="w-3.5 h-3.5 rounded-sm bg-neutral-200 dark:bg-neutral-800 flex-shrink-0" aria-hidden="true" />
              )}
              <span className="truncate flex-1" title={tab.title}>{tab.title}</span>
              <button
                onClick={() => onUpdate({ tabs: session.tabs.filter((_, j) => j !== i) })}
                aria-label={`${t("removeTab")}: ${tab.title}`}
                title={t("removeTab")}
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white transition"
              >
                <X size={11} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function IconBtn({ children, onClick, label }) {
  return (
    <button onClick={onClick} aria-label={label} title={label}
      className="p-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white">
      {children}
    </button>
  );
}
