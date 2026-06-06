export function BreadcrumbHero({ title, image, subtitle }) {
  return (
    <section className="relative overflow-hidden bg-zinc-950 text-white">
      <img className="absolute inset-0 h-full w-full object-cover opacity-55" src={image} alt="" />
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/72 to-zinc-950/15" />
      <div className="container-page relative flex min-h-72 items-end py-12">
        <div className="max-w-2xl">
          <h1 className="mt-3 font-serif text-5xl font-extrabold tracking-tight sm:text-6xl">{title}</h1>
          {subtitle ? <p className="mt-4 max-w-xl text-lg text-zinc-200">{subtitle}</p> : null}
        </div>
      </div>
    </section>
  );
}
