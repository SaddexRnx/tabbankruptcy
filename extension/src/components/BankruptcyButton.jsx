import { useState } from "react";
import { Gavel, X } from "lucide-react";

export default function BankruptcyButton({ tabCount, onDeclare }) {
  const [confirming, setConfirming] = useState(false);
  const [name, setName] = useState("");

  const submit = () => {
    onDeclare(name.trim());
    setConfirming(false);
    setName("");
  };

  if (confirming) {
    return (
      <div className="bg-zinc-800/70 border border-zinc-700 rounded-xl p-3 space-y-3 animate-in fade-in">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-white">
              Name this session
            </p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {tabCount} tab{tabCount === 1 ? "" : "s"} will be saved & closed.
            </p>
          </div>
          <button
            onClick={() => setConfirming(false)}
            className="p-1 rounded-md hover:bg-zinc-700 text-zinc-400"
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
          placeholder="Leave blank for auto name"
          className="w-full bg-zinc-900 border border-zinc-700 focus:border-rose-500/70 focus:ring-1 focus:ring-rose-500/40 outline-none rounded-lg px-3 py-2 text-sm placeholder-zinc-600"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setConfirming(false)}
            className="flex-1 py-2 rounded-lg text-sm text-zinc-300 bg-zinc-700/60 hover:bg-zinc-700"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="flex-1 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-orange-500 hover:brightness-110 active:scale-[0.98] transition"
          >
            Confirm
          </button>
        </div>
      </div>
    );
  }

  const disabled = tabCount === 0;
  return (
    <button
      onClick={() => setConfirming(true)}
      disabled={disabled}
      className={`w-full group relative overflow-hidden rounded-xl px-4 py-4 text-left border transition
        ${
          disabled
            ? "bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed"
            : "bg-gradient-to-br from-rose-500 to-orange-500 border-rose-400/40 text-white hover:shadow-lg hover:shadow-rose-500/30 active:scale-[0.985]"
        }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-black/20 flex items-center justify-center group-hover:rotate-[-8deg] transition-transform">
          <Gavel size={20} />
        </div>
        <div className="flex-1">
          <div className="text-base font-bold tracking-tight">
            Declare Bankruptcy
          </div>
          <div className="text-[11px] opacity-90">
            Close & archive all {tabCount} tab{tabCount === 1 ? "" : "s"}
          </div>
        </div>
      </div>
    </button>
  );
}
