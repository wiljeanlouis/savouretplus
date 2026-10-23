import { ArrowRight, ChevronDown, Menu, ShoppingBag, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { decorationCategories } from "../../domain/decoration";
import { cn } from "../../shared/utils";
import { Button } from "../ui/button";

const navItems = [
  { href: "#/accueil", label: "Accueil", route: "accueil" },
  { href: "#/degustation", label: "Dégustation", route: "degustation" },
  { href: "#/soumission", label: "Nos services", route: "soumission" },
  { href: "#/accueil?section=realisations", label: "Réalisations" },
  { href: "#/contact", label: "Contact", route: "contact" },
];

const navLinkClass =
  "relative rounded-sm px-2 py-3 text-[0.78rem] font-semibold text-espresso/75 transition hover:text-wine focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine";

export function Header({ activeRoute, cartCount }) {
  const [open, setOpen] = useState(false);
  const [decorationOpen, setDecorationOpen] = useState(false);
  const decorationMenuRef = useRef(null);

  useEffect(() => {
    function closeDecorationMenu(event) {
      if (!decorationMenuRef.current?.contains(event.target)) setDecorationOpen(false);
    }

    function closeOnEscape(event) {
      if (event.key === "Escape") {
        setDecorationOpen(false);
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeDecorationMenu);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeDecorationMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-blush/45 bg-ivory/95 shadow-[0_8px_30px_rgba(53,42,43,0.04)] backdrop-blur-xl">
      <div className="container-page flex h-[4.75rem] items-center justify-between gap-4 lg:h-[5.25rem]">
        <a className="shrink-0 rounded-sm" href="#/accueil" aria-label="Savour Et Plus, accueil">
          <img
            className="h-auto w-[10.5rem] sm:w-[12.5rem]"
            src="./images/brand/savour_et_plus_logo.png"
            alt="Savour Et Plus"
            width="797"
            height="145"
          />
        </a>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Navigation principale">
          <DesktopNavLink item={navItems[0]} activeRoute={activeRoute} />
          <div
            className="group relative"
            ref={decorationMenuRef}
            onMouseEnter={() => setDecorationOpen(true)}
            onMouseLeave={() => setDecorationOpen(false)}
          >
            <div className="flex items-center">
              <a
                className={cn(
                  navLinkClass,
                  "rounded-r-none pr-0.5",
                  activeRoute === "decoration" && "text-wine after:absolute after:inset-x-2 after:bottom-1 after:h-px after:bg-wine",
                )}
                href="#/decoration"
                aria-current={activeRoute === "decoration" ? "page" : undefined}
              >
                Décoration
              </a>
              <button
                className={cn(
                  "rounded-sm rounded-l-none py-3 pl-0.5 pr-2 text-espresso/70 transition hover:text-wine focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine",
                  activeRoute === "decoration" && "text-wine",
                )}
                type="button"
                aria-label="Afficher les catégories de décoration"
                aria-expanded={decorationOpen}
                aria-haspopup="true"
                aria-controls="decoration-desktop-menu"
                onClick={() => setDecorationOpen((current) => !current)}
                onFocus={() => setDecorationOpen(true)}
              >
                <ChevronDown className={cn("h-3.5 w-3.5 transition", decorationOpen && "rotate-180")} />
              </button>
            </div>
            {decorationOpen ? (
              <div className="absolute left-0 top-full z-50 min-w-60 pt-2" id="decoration-desktop-menu">
                <div className="grid border border-blush/60 bg-white p-2 shadow-xl shadow-espresso/10">
                  {decorationCategories.map((category) => (
                    <a
                      className="rounded-sm px-3 py-2.5 text-sm font-semibold text-espresso/75 transition hover:bg-blush/25 hover:text-wine focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine"
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
          {navItems.slice(1).map((item) => (
            <DesktopNavLink item={item} activeRoute={activeRoute} key={item.label} />
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button asChild className="hidden h-11 px-4 xl:inline-flex">
            <a href="#/soumission">
              Demander une soumission
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </Button>
          <Button
            asChild
            className={cn(
              "relative border-transparent bg-transparent hover:bg-blush/25",
              activeRoute === "panier" && "bg-blush/35 text-wine",
            )}
            variant="ghost"
            size="icon"
          >
            <a
              href="#/panier"
              aria-current={activeRoute === "panier" ? "page" : undefined}
              aria-label={`Voir le panier, ${cartCount} article${cartCount > 1 ? "s" : ""}`}
              onClick={() => setOpen(false)}
            >
              <ShoppingBag className="h-[1.15rem] w-[1.15rem]" />
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-wine px-1 text-[9px] font-bold text-white">
                {cartCount}
              </span>
            </a>
          </Button>
          <Button
            className="lg:hidden"
            variant="ghost"
            size="icon"
            type="button"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-blush/50 bg-ivory lg:hidden" id="mobile-navigation" aria-label="Navigation mobile">
          <div className="container-page grid gap-0.5 py-4">
            <MobileNavLink item={navItems[0]} activeRoute={activeRoute} onClick={() => setOpen(false)} />
            <div>
              <div className="flex items-center">
                <a
                  className={cn(
                    "flex-1 rounded-sm rounded-r-none px-3 py-3 text-sm font-semibold text-espresso/80",
                    activeRoute === "decoration" && "bg-blush/30 text-wine",
                  )}
                  href="#/decoration"
                  aria-current={activeRoute === "decoration" ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  Décoration
                </a>
                <button
                  className={cn(
                    "rounded-sm rounded-l-none px-4 py-3 text-espresso/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine",
                    activeRoute === "decoration" && "bg-blush/30 text-wine",
                  )}
                  type="button"
                  aria-label="Afficher les catégories de décoration"
                  aria-expanded={decorationOpen}
                  aria-controls="decoration-mobile-menu"
                  onClick={() => setDecorationOpen((current) => !current)}
                >
                  <ChevronDown className={cn("h-4 w-4 transition", decorationOpen && "rotate-180")} />
                </button>
              </div>
              {decorationOpen ? (
                <div className="ml-4 grid border-l border-blush pl-2" id="decoration-mobile-menu">
                  {decorationCategories.map((category) => (
                    <a
                      className="rounded-sm px-3 py-3 text-sm font-medium text-espresso/70 hover:bg-blush/25 hover:text-wine"
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
            {navItems.slice(1).map((item) => (
              <MobileNavLink item={item} activeRoute={activeRoute} onClick={() => setOpen(false)} key={item.label} />
            ))}
            <Button asChild className="mt-3 w-full">
              <a href="#/soumission" onClick={() => setOpen(false)}>
                Demander une soumission
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
          </div>
        </nav>
      ) : null}
    </header>
  );
}

function DesktopNavLink({ item, activeRoute }) {
  const active = item.route && activeRoute === item.route;
  return (
    <a
      className={cn(
        navLinkClass,
        active && "text-wine after:absolute after:inset-x-2 after:bottom-1 after:h-px after:bg-wine",
      )}
      href={item.href}
      aria-current={active ? "page" : undefined}
    >
      {item.label}
    </a>
  );
}

function MobileNavLink({ item, activeRoute, onClick }) {
  const active = item.route && activeRoute === item.route;
  return (
    <a
      className={cn(
        "rounded-sm px-3 py-3 text-sm font-semibold text-espresso/80",
        active && "bg-blush/30 text-wine",
      )}
      href={item.href}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
    >
      {item.label}
    </a>
  );
}
