export function CatalogLoadingState() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Chargement du catalogue">
      {[0, 1, 2].map((item) => (
        <div className="animate-pulse overflow-hidden rounded-3xl border border-zinc-200 bg-white p-3" key={item}>
          <div className="aspect-[4/3] rounded-2xl bg-rose-100/70" />
          <div className="space-y-3 p-3 pt-5">
            <div className="h-7 w-2/3 rounded bg-zinc-200" />
            <div className="h-4 w-full rounded bg-zinc-100" />
            <div className="h-4 w-4/5 rounded bg-zinc-100" />
            <div className="mt-6 h-11 rounded-md bg-zinc-200" />
          </div>
        </div>
      ))}
      <span className="sr-only">Chargement du catalogue…</span>
    </div>
  );
}
