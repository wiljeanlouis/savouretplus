import { PlayCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="container-page flex flex-col items-center justify-between gap-4 py-8 text-sm text-zinc-500 sm:flex-row">
        <p>&copy; {new Date().getFullYear()} Savour Et Plus. Tous droits réservés.</p>
        <a
          className="inline-flex items-center gap-2 font-semibold text-zinc-700 transition hover:text-rose-700"
          href="https://youtube.com/@SavourEtplus"
          target="_blank"
          rel="noreferrer"
        >
          <PlayCircle className="h-5 w-5" />
          @SavourEtplus
        </a>
      </div>
    </footer>
  );
}
