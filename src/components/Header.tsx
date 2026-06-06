import { Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

const navItems = [
  ["accueil", "Accueil"],
  ["degustation", "Dégustation"],
  ["soumission", "Soumission"],
  ["contact", "Contact"],
];

export function Header({ activeRoute, cartCount, onCartOpen }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-white/85 backdrop-blur-xl">
      <div className="container-page flex h-20 items-center justify-between gap-4">
        <a className="flex items-center gap-3" href="#/accueil" aria-label="Savour Et Plus">
          <img className="h-14 w-auto" src="./images/savour_et_plus_logo.png" alt="Savour Et Plus" />
        </a>

        <nav className="hidden items-center gap-1 md:flex">
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
          <Button className="relative" variant="outline" size="icon" type="button" onClick={onCartOpen}>
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-rose-600 px-1 text-[11px] font-bold text-white">
              {cartCount}
            </span>
          </Button>
          <Button className="md:hidden" variant="ghost" size="icon" type="button" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-zinc-200 bg-white md:hidden">
          <div className="container-page grid py-3">
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
