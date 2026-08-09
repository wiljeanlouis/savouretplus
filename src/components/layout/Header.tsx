import { ChevronDown, Menu, ShoppingBag, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { decorationCategories } from "../../domain/decoration";
import { cn } from "../../shared/utils";
import { Button } from "../ui/button";

const navItems = [
  ["degustation", "Dégustation"],
  ["soumission", "Soumission"],
  ["contact", "Contact"],
];

export function Header({ activeRoute, cartCount }) {
  const [open, setOpen] = useState(false);
  const [decorationOpen, setDecorationOpen] = useState(false);
  const decorationMenuRef = useRef(null);

  useEffect(() => {
    function closeDecorationMenu(event) {
      if (!decorationMenuRef.current?.contains(event.target)) {
        setDecorationOpen(false);
      }
    }

    function closeOnEscape(event) {
      if (event.key === "Escape") setDecorationOpen(false);
    }

    document.addEventListener("pointerdown", closeDecorationMenu);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeDecorationMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-white/85 backdrop-blur-xl">
      <div className="container-page flex h-20 items-center justify-between gap-4">
        <a className="flex items-center gap-3" href="#/accueil" aria-label="Savour Et Plus">
          <img className="h-14 w-auto" src="./images/brand/savour_et_plus_logo.png" alt="Savour Et Plus" />
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          <a
            className={cn(
              "rounded-md px-3 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950",
              activeRoute === "accueil" && "bg-rose-50 text-rose-700",
            )}
            href="#/accueil"
          >
            Accueil
          </a>
          <div
            className="group relative"
            ref={decorationMenuRef}
            onMouseEnter={() => setDecorationOpen(true)}
            onMouseLeave={() => setDecorationOpen(false)}
          >
            <div className="flex items-center">
              <a
                className={cn(
                  "rounded-l-md py-2 pl-3 pr-1 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950",
                  activeRoute === "decoration" && "bg-rose-50 text-rose-700",
                )}
                href="#/decoration"
              >
                Décoration
              </a>
              <button
                className={cn(
                  "rounded-r-md py-2 pl-1 pr-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500",
                  activeRoute === "decoration" && "bg-rose-50 text-rose-700",
                )}
                type="button"
                aria-label="Afficher les catégories de décoration"
                aria-expanded={decorationOpen}
                aria-haspopup="true"
                aria-controls="decoration-desktop-menu"
                onClick={() => setDecorationOpen((current) => !current)}
                onFocus={() => setDecorationOpen(true)}
              >
                <ChevronDown
                  className={cn("h-4 w-4 transition", decorationOpen && "rotate-180")}
                />
              </button>
            </div>
            {decorationOpen ? (
              <div
                className="absolute left-0 top-full z-50 min-w-56 pt-2"
                id="decoration-desktop-menu"
              >
                <div className="grid rounded-xl border border-zinc-200 bg-white p-2 shadow-xl shadow-zinc-950/10">
                  {decorationCategories.map((category) => (
                    <a
                      className="rounded-lg px-3 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                      href={`#/decoration?categorie=${category.slug}`}
                      key={category.id}
                      onClick={() => setDecorationOpen(false)}
                    >
                      {category.label}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          {navItems.map(([route, label]) => (
            <a
              className={cn(
                "rounded-md px-3 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950",
                activeRoute === route && "bg-rose-50 text-rose-700",
              )}
              href={`#/${route}`}
              key={route}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            asChild
            className={cn(
              "relative",
              activeRoute === "panier" && "border-rose-300 bg-rose-50 text-rose-700",
            )}
            variant="outline"
            size="icon"
          >
            <a
              href="#/panier"
              aria-current={activeRoute === "panier" ? "page" : undefined}
              aria-label={`Voir le panier, ${cartCount} article${cartCount > 1 ? "s" : ""}`}
              onClick={() => setOpen(false)}
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-rose-600 px-1 text-[11px] font-bold text-white">
                {cartCount}
              </span>
            </a>
          </Button>
          <Button className="md:hidden" variant="ghost" size="icon" type="button" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-zinc-200 bg-white md:hidden">
          <div className="container-page grid py-3">
            <a
              className={cn(
                "rounded-md px-3 py-3 text-sm font-semibold text-zinc-700",
                activeRoute === "accueil" && "bg-rose-50 text-rose-700",
              )}
              href="#/accueil"
              onClick={() => setOpen(false)}
            >
              Accueil
            </a>
            <div>
              <div className="flex items-center">
                <a
                  className={cn(
                    "flex-1 rounded-l-md px-3 py-3 text-sm font-semibold text-zinc-700",
                    activeRoute === "decoration" && "bg-rose-50 text-rose-700",
                  )}
                  href="#/decoration"
                  onClick={() => setOpen(false)}
                >
                  Décoration
                </a>
                <button
                  className={cn(
                    "rounded-r-md px-4 py-3 text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500",
                    activeRoute === "decoration" && "bg-rose-50 text-rose-700",
                  )}
                  type="button"
                  aria-label="Afficher les catégories de décoration"
                  aria-expanded={decorationOpen}
                  aria-haspopup="true"
                  aria-controls="decoration-mobile-menu"
                  onClick={() => setDecorationOpen((current) => !current)}
                >
                  <ChevronDown
                    className={cn("h-4 w-4 transition", decorationOpen && "rotate-180")}
                  />
                </button>
              </div>
              {decorationOpen ? (
                <div className="ml-4 grid border-l border-rose-200 pl-2" id="decoration-mobile-menu">
                  {decorationCategories.map((category) => (
                    <a
                      className="rounded-md px-3 py-3 text-sm font-medium text-zinc-600 hover:bg-rose-50 hover:text-rose-700"
                      href={`#/decoration?categorie=${category.slug}`}
                      key={category.id}
                      onClick={() => {
                        setOpen(false);
                        setDecorationOpen(false);
                      }}
                    >
                      {category.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
            {navItems.map(([route, label]) => (
              <a
                className={cn(
                  "rounded-md px-3 py-3 text-sm font-semibold text-zinc-700",
                  activeRoute === route && "bg-rose-50 text-rose-700",
                )}
                href={`#/${route}`}
                key={route}
                onClick={() => setOpen(false)}
              >
                {label}
              </a>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
