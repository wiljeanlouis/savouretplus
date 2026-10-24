import type { parseAppHash } from "../../domain/navigation";

export type AppLocation = ReturnType<typeof parseAppHash>;
export type NavigationAction = "INITIAL" | "PUSH" | "POP";

export type ScrollInstruction =
  | { type: "none" }
  | { type: "top" }
  | { type: "restore"; top: number }
  | { type: "section"; id: string; smooth: boolean };

export function getPageKey(location: AppLocation) {
  if (location.route === "decoration-detail") {
    return `${location.route}:${location.decorationSlug ?? ""}`;
  }

  if (location.route === "realisation-detail") {
    return `${location.route}:${location.realisationSlug ?? ""}`;
  }

  return location.route;
}

export function getScrollInstruction({
  previousLocation,
  location,
  action,
  restoredTop,
  reducedMotion,
}: {
  previousLocation: AppLocation | null;
  location: AppLocation;
  action: NavigationAction;
  restoredTop?: number;
  reducedMotion: boolean;
}): ScrollInstruction {
  const samePage = previousLocation
    ? getPageKey(previousLocation) === getPageKey(location)
    : false;

  if (location.section) {
    return {
      type: "section",
      id: location.section,
      smooth: samePage && !reducedMotion,
    };
  }

  if (action === "POP") {
    return { type: "restore", top: restoredTop ?? 0 };
  }

  if (samePage) {
    return { type: "none" };
  }

  return { type: "top" };
}

function withoutCssSmoothScroll(callback: () => void) {
  const root = document.documentElement;
  const previousBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  callback();
  root.style.scrollBehavior = previousBehavior;
}

export function scrollWindowImmediately(top: number) {
  withoutCssSmoothScroll(() => window.scrollTo({ left: 0, top, behavior: "auto" }));
}

export function scrollElementIntoView(element: HTMLElement, smooth: boolean) {
  if (smooth) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  withoutCssSmoothScroll(() => {
    element.scrollIntoView({ behavior: "auto", block: "start" });
  });
}
