import { TikTokIcon } from "../ui/TikTokIcon";
import { YouTubeIcon } from "../ui/YouTubeIcon";
import { tiktokProfileUrl, youtubeChannelUrl } from "../home/homeContent";

const footerLinks = [
  ["#/accueil", "Accueil"],
  ["#/decoration", "Décoration"],
  ["#/degustation", "Dégustation"],
  ["#/services", "Nos services"],
  ["#/realisations", "Réalisations"],
  ["#/contact", "Contact"],
];

export function Footer() {
  return (
    <footer className="bg-espresso text-white">
      <div className="container-page py-10 lg:py-12">
        <div className="grid items-center gap-8 border-b border-white/15 pb-9 lg:grid-cols-[1fr_auto_auto]">
          <a className="w-fit rounded-sm" href="#/accueil" aria-label="Savour Et Plus, accueil">
            <img
              className="h-auto w-52 brightness-0 invert"
              src="./images/brand/savour_et_plus_logo.png"
              alt="Savour Et Plus"
              width="797"
              height="145"
              loading="lazy"
            />
          </a>
          <nav className="flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-white/70" aria-label="Navigation de pied de page">
            {footerLinks.map(([href, label]) => (
              <a className="transition hover:text-champagne" href={href} key={href}>
                {label}
              </a>
            ))}
          </nav>
          <nav className="flex flex-wrap gap-x-5 gap-y-3 lg:flex-col" aria-label="Réseaux sociaux">
            <a
              className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-white/75 transition hover:text-champagne"
              href={youtubeChannelUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Savour Et Plus sur YouTube (nouvel onglet)"
            >
              <YouTubeIcon className="h-5 w-5" aria-hidden="true" />
              Youtube · @SavourEtplus
            </a>
            <a
              className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-white/75 transition hover:text-champagne"
              href={tiktokProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Savour Et Plus sur TikTok (nouvel onglet)"
            >
              <TikTokIcon className="h-5 w-5" aria-hidden="true" />
              TikTok · @savouretplus
            </a>
          </nav>
        </div>
        <p className="pt-6 text-xs text-white/50">
          &copy; {new Date().getFullYear()} Savour Et Plus. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
