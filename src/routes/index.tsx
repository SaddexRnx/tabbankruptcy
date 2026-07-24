import { createFileRoute } from "@tanstack/react-router";
import { Download, Gavel, Landmark, Archive, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TabBankruptcy — Declare bankruptcy on your browser tabs" },
      {
        name: "description",
        content:
          "A Chrome extension that saves all your open tabs into a named session, closes them, and lets you restore any time. Free your RAM in one click.",
      },
      { property: "og:title", content: "TabBankruptcy — File for tab relief" },
      {
        property: "og:description",
        content:
          "Save all your open tabs, close them, restore later. One-click tab bankruptcy for Chrome.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const download = () => {
    fetch("/tab-bankruptcy.zip")
      .then((res) => {
        if (!res.ok) throw new Error(`Download failed: ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "tab-bankruptcy.zip";
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch((err) => alert(err.message));
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-6 py-16">
        {/* Hero */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 shadow-lg shadow-rose-500/30">
            <Landmark size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              TabBankruptcy
            </h1>
            <p className="text-xs text-zinc-500">
              A Chrome extension · Manifest V3
            </p>
          </div>
        </div>

        <h2 className="mt-10 text-4xl font-bold tracking-tight sm:text-5xl">
          Hoarding tabs?{" "}
          <span className="bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
            Declare bankruptcy.
          </span>
        </h2>
        <p className="mt-4 max-w-xl text-zinc-400">
          One click saves every open tab into a named session, closes them all,
          and frees your RAM. Restore anytime.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={download}
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-5 py-3 font-semibold text-white shadow-lg shadow-rose-500/25 transition hover:brightness-110 active:scale-[0.98]"
          >
            <Download size={18} />
            Download extension (.zip)
          </button>
          <a
            href="#install"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-3 font-medium text-zinc-200 hover:bg-zinc-800"
          >
            Install guide
          </a>
        </div>

        {/* Features */}
        <section className="mt-16 grid gap-4 sm:grid-cols-3">
          <Feature
            icon={<Gavel size={18} className="text-rose-400" />}
            title="Declare Bankruptcy"
            body="Names, saves, and closes every tab in one motion."
          />
          <Feature
            icon={<Archive size={18} className="text-orange-400" />}
            title="Session History"
            body="Every archive is safely stored locally on your machine."
          />
          <Feature
            icon={<RotateCcw size={18} className="text-emerald-400" />}
            title="Restore Anytime"
            body="Reopen an entire session with a single click."
          />
        </section>

        {/* Install */}
        <section id="install" className="mt-16">
          <h3 className="text-lg font-semibold">Install it</h3>
          <ol className="mt-4 space-y-3 text-sm text-zinc-300">
            <Step n={1}>Download and unzip the file above.</Step>
            <Step n={2}>
              Open{" "}
              <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs">
                chrome://extensions
              </code>{" "}
              in Chrome (also works in Edge, Brave, Arc, Opera).
            </Step>
            <Step n={3}>
              Enable <b>Developer mode</b> (toggle in the top-right).
            </Step>
            <Step n={4}>
              Click <b>Load unpacked</b> and select the unzipped folder.
            </Step>
            <Step n={5}>
              Pin TabBankruptcy from the extensions menu and start filing.
            </Step>
          </ol>
        </section>

        <footer className="mt-16 border-t border-zinc-900 pt-6 text-xs text-zinc-600">
          Local-first · No accounts · No tracking · Data stays in your browser.
        </footer>
      </div>
    </main>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="flex items-center gap-2">
        {icon}
        <h4 className="text-sm font-semibold text-white">{title}</h4>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-zinc-400">{body}</p>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-300">
        {n}
      </span>
      <span className="pt-0.5">{children}</span>
    </li>
  );
}
