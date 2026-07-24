import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Starter App" },
      { name: "description", content: "A clean TanStack Start template." },
      { property: "og:title", content: "Starter App" },
      { property: "og:description", content: "A clean TanStack Start template." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          Starter App
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Start building your project here.
        </p>
      </div>
    </main>
  );
}
