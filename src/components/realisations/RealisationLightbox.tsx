import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { RealisationImage } from "../../domain/realisation";

type RealisationLightboxProps = {
  images: RealisationImage[];
  activeIndex: number;
  title: string;
  onClose: () => void;
  onNavigate: (offset: number) => void;
  returnFocusRef?: { current: HTMLElement | null };
};

export function RealisationLightbox({
  images,
  activeIndex,
  title,
  onClose,
  onNavigate,
  returnFocusRef,
}: RealisationLightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const callbacksRef = useRef({ onClose, onNavigate });
  callbacksRef.current = { onClose, onNavigate };
  const activeImage = images[activeIndex];

  useEffect(() => {
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") callbacksRef.current.onClose();
      if (event.key === "ArrowLeft" && images.length > 1) callbacksRef.current.onNavigate(-1);
      if (event.key === "ArrowRight" && images.length > 1) callbacksRef.current.onNavigate(1);
      if (event.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("button, [href]");
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      returnFocusRef?.current?.focus();
    };
  }, [images.length, returnFocusRef]);

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-50 grid place-items-center bg-espresso/95 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Galerie de la réalisation ${title}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-6xl">
        <div className="mb-3 flex items-center justify-between gap-3 text-white">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-champagne">{title}</p>
            <p className="mt-1 text-sm text-white/60">
              {activeIndex + 1} / {images.length}
            </p>
          </div>
          <button
            ref={closeRef}
            className="grid h-10 w-10 place-items-center rounded-full text-white/75 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne"
            type="button"
            onClick={onClose}
            aria-label="Fermer la galerie"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="relative grid min-h-72 place-items-center overflow-hidden bg-black shadow-2xl">
          <img
            className="max-h-[78svh] w-full object-contain"
            src={activeImage.src}
            alt={activeImage.alt}
          />
          {images.length > 1 ? (
            <>
              <LightboxButton side="left" label="Photographie précédente" onClick={() => onNavigate(-1)}>
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </LightboxButton>
              <LightboxButton side="right" label="Photographie suivante" onClick={() => onNavigate(1)}>
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </LightboxButton>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function LightboxButton({ side, label, onClick, children }) {
  return (
    <button
      className={`absolute top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-espresso shadow-md transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine ${side === "left" ? "left-3" : "right-3"}`}
      type="button"
      onClick={onClick}
      aria-label={label}
    >
      {children}
    </button>
  );
}
