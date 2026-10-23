export function CatalogLoadingState() {
  return (
    <div
      className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
      role="status"
      aria-busy="true"
      aria-label="Chargement du catalogue"
    >
      {[0, 1, 2].map((item) => (
        <article
          className="animate-pulse overflow-hidden border border-blush/50 bg-white shadow-[0_18px_50px_rgba(53,42,43,0.06)]"
          key={item}
        >
          <div className="aspect-[4/3] border-b border-blush/40 bg-blush/35" />
          <div className="p-6">
            <div className="h-3 w-2/5 bg-wine/20" />
            <div className="mt-4 h-8 w-3/4 bg-espresso/15" />
            <div className="mt-5 space-y-3">
              <div className="h-4 w-full bg-espresso/10" />
              <div className="h-4 w-5/6 bg-espresso/10" />
            </div>
            <div className="mt-7 border-t border-blush/40 pt-5">
              <div className="h-5 w-1/2 bg-espresso/10" />
              <div className="mt-4 h-11 w-full bg-wine/20" />
            </div>
          </div>
        </article>
      ))}
      <span className="sr-only">Chargement du catalogue…</span>
    </div>
  );
}
