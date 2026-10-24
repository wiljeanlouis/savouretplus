import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { parseAppHash } from "../../domain/navigation";
import {
  getScrollInstruction,
  scrollElementIntoView,
  scrollWindowImmediately,
  type AppLocation,
  type NavigationAction,
} from "./scrollRestoration";

const HISTORY_KEY = "__savouretplusScrollKey";
let fallbackKey = 0;

function createHistoryKey() {
  return globalThis.crypto?.randomUUID?.() ?? `scroll-${Date.now()}-${fallbackKey++}`;
}

function readHistoryKey(state: unknown) {
  if (!state || typeof state !== "object") return null;
  const key = (state as Record<string, unknown>)[HISTORY_KEY];
  return typeof key === "string" ? key : null;
}

function writeHistoryKey(key: string) {
  const state = history.state && typeof history.state === "object" ? history.state : {};
  history.replaceState({ ...state, [HISTORY_KEY]: key }, "", window.location.href);
}

function ensureHistoryKey() {
  const currentKey = readHistoryKey(history.state);
  if (currentKey) return currentKey;

  const key = createHistoryKey();
  writeHistoryKey(key);
  return key;
}

type HashNavigationState = {
  location: AppLocation;
  action: NavigationAction;
  entryKey: string;
  restoredTop?: number;
  sequence: number;
};

export function useHashNavigation() {
  const positionsRef = useRef(new Map<string, number>());
  const currentEntryKeyRef = useRef("");
  const pendingPopKeyRef = useRef<string | null>(null);
  const [navigation, setNavigation] = useState<HashNavigationState>(() => {
    const entryKey = ensureHistoryKey();
    currentEntryKeyRef.current = entryKey;
    positionsRef.current.set(entryKey, window.scrollY);
    return {
      location: parseAppHash(window.location.hash),
      action: "INITIAL",
      entryKey,
      sequence: 0,
    };
  });

  useEffect(() => {
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = "manual";

    const rememberPosition = () => {
      positionsRef.current.set(currentEntryKeyRef.current, window.scrollY);
    };

    const onPopState = (event: PopStateEvent) => {
      pendingPopKeyRef.current = readHistoryKey(event.state) ?? "";
    };

    const onHashChange = () => {
      rememberPosition();
      const isPop = pendingPopKeyRef.current !== null;
      let entryKey = isPop ? pendingPopKeyRef.current : null;

      if (!entryKey) {
        entryKey = createHistoryKey();
        writeHistoryKey(entryKey);
      }

      pendingPopKeyRef.current = null;
      currentEntryKeyRef.current = entryKey;
      const restoredTop = isPop ? positionsRef.current.get(entryKey) : undefined;

      setNavigation((current) => ({
        location: parseAppHash(window.location.hash),
        action: isPop ? "POP" : "PUSH",
        entryKey,
        restoredTop,
        sequence: current.sequence + 1,
      }));
    };

    window.addEventListener("scroll", rememberPosition, { passive: true });
    window.addEventListener("popstate", onPopState);
    window.addEventListener("hashchange", onHashChange);

    return () => {
      rememberPosition();
      history.scrollRestoration = previousRestoration;
      window.removeEventListener("scroll", rememberPosition);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  return navigation;
}

export function useNavigationScroll(navigation: HashNavigationState) {
  const previousLocationRef = useRef<AppLocation | null>(null);

  useLayoutEffect(() => {
    const previousLocation = previousLocationRef.current;
    previousLocationRef.current = navigation.location;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const instruction = getScrollInstruction({
      previousLocation,
      location: navigation.location,
      action: navigation.action,
      restoredTop: navigation.restoredTop,
      reducedMotion,
    });

    if (instruction.type === "none") return;

    if (instruction.type === "section") {
      const frame = window.requestAnimationFrame(() => {
        const target = document.getElementById(instruction.id);
        if (target) scrollElementIntoView(target, instruction.smooth);
      });
      return () => window.cancelAnimationFrame(frame);
    }

    const targetTop = instruction.type === "restore" ? instruction.top : 0;
    scrollWindowImmediately(targetTop);

    if (instruction.type !== "restore" || targetTop === 0) return;

    let frame = 0;
    let stopped = false;
    let observer: ResizeObserver | null = null;
    let timeout = 0;

    const stopRestoration = () => {
      if (stopped) return;
      stopped = true;
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      observer?.disconnect();
      window.removeEventListener("wheel", stopRestoration);
      window.removeEventListener("touchstart", stopRestoration);
      window.removeEventListener("pointerdown", stopRestoration);
      window.removeEventListener("keydown", stopRestoration);
    };

    const retryRestoration = () => {
      if (stopped) return;
      const maximumTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      if (maximumTop >= targetTop && Math.abs(window.scrollY - targetTop) <= 1) {
        stopRestoration();
        return;
      }
      scrollWindowImmediately(Math.min(targetTop, maximumTop));
    };

    frame = window.requestAnimationFrame(retryRestoration);
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(retryRestoration);
      observer.observe(document.documentElement);
    }
    window.addEventListener("wheel", stopRestoration, { passive: true });
    window.addEventListener("touchstart", stopRestoration, { passive: true });
    window.addEventListener("pointerdown", stopRestoration, { passive: true });
    window.addEventListener("keydown", stopRestoration);
    timeout = window.setTimeout(stopRestoration, 3000);

    return stopRestoration;
  }, [navigation.sequence]);
}
