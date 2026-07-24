import { useState } from "react";
import { Gavel, X } from "lucide-react";

export default function BankruptcyButton({ tabCount, onDeclare, confirmBeforeClose, t }) {
  const [confirming, setConfirming] = useState(false);
  const [name, setName] = useState("");

  const submit = () => {
    onDeclare(name.trim());
    setConfirming(false);
    setName("");
  };

  const start = () => {
    if (!confirmBeforeClose) {
      onDeclare("");
    } else {
      setConfirming(true);
    }
  };

  if (confirming) {
    return (
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">{t("nameThisSession")}</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              {t("tabsWillBeSaved", { n: tabCount })}
            </p>
          </div>
          <button
            onClick={() => setConfirming(false)}
            className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
            aria-label="Cancel"
          >
            <X size={14} />
          </button>
        </div>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={t("leaveBlank")}
          className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-white outline-none rounded-lg px-3 py-2 text-sm placeholder-neutral-400"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setConfirming(false)}
            className="flex-1 py-2 rounded-lg text-sm border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            {t("cancel")}
          </button>
          <button
            onClick={submit}
            className="flex-1 py-2 rounded-lg text-sm font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 active:scale-[0.98] transition"
          >
            {t("confirm")}
          </button>
        </div>
      </div>
    );
  }

  const disabled = tabCount === 0;
  return (
    <button
      onClick={start}
      disabled={disabled}
      className={`w-full group relative rounded-xl px-4 py-4 text-left border transition ${
        disabled
          ? "border-neutral-200 dark:border-neutral-800 text-neutral-400 cursor-not-allowed"
          : "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-transparent hover:opacity-90 active:scale-[0.985]"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:rotate-[-8deg] ${
            disabled
              ? "bg-neutral-100 dark:bg-neutral-900"
              : "bg-white/15 dark:bg-neutral-900/10"
          }`}
        >
          <Gavel size={18} />
        </div>
        <div className="flex-1">
          <div className="text-base font-bold tracking-tight">
            {t("declareBankruptcy")}
          </div>
          <div className="text-[11px] opacity-80">
            {t("closeAndArchive", { n: tabCount })}
          </div>
        </div>
      </div>
    </button>
  );
}
