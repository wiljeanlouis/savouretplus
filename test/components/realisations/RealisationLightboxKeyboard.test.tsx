import { afterEach, describe, expect, it, vi } from "vitest";
import { RealisationLightbox } from "../../../src/components/realisations/RealisationLightbox";

const hooks = vi.hoisted(() => ({ effects: [] as (() => (() => void))[], refs: [] as unknown[] }));
vi.mock("react", async (importOriginal) => ({
  ...await importOriginal<typeof import("react")>(),
  useEffect: (effect: () => (() => void)) => hooks.effects.push(effect),
  useRef: (initial: unknown) => ({ current: hooks.refs.length ? hooks.refs.shift() : initial }),
}));

afterEach(() => {
  hooks.effects = [];
  hooks.refs = [];
  vi.unstubAllGlobals();
});

describe("photographic lightbox keyboard", () => {
  it("navigates photographs, closes with Escape, traps Tab and restores focus", () => {
    const first = { focus: vi.fn() };
    const last = { focus: vi.fn() };
    const trigger = { focus: vi.fn() };
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    vi.stubGlobal("window", { addEventListener, removeEventListener });
    const document = { activeElement: last };
    vi.stubGlobal("document", document);
    hooks.refs = [{ querySelectorAll: () => [first, last] }, first];
    const onClose = vi.fn();
    const onNavigate = vi.fn();
    RealisationLightbox({
      images: [{ src: "./images/one.jpg", alt: "Une" }, { src: "./images/two.jpg", alt: "Deux" }],
      activeIndex: 0, title: "Fixture non publiée", onClose, onNavigate,
      returnFocusRef: { current: trigger as unknown as HTMLElement },
    });
    const cleanup = hooks.effects[0]();
    expect(first.focus).toHaveBeenCalledOnce();
    const keydown = addEventListener.mock.calls[0][1];
    keydown({ key: "ArrowRight" });
    keydown({ key: "ArrowLeft" });
    expect(onNavigate.mock.calls).toEqual([[1], [-1]]);
    keydown({ key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
    const preventDefault = vi.fn();
    keydown({ key: "Tab", preventDefault });
    expect(preventDefault).toHaveBeenCalledOnce();
    expect(first.focus).toHaveBeenCalledTimes(2);
    document.activeElement = first;
    keydown({ key: "Tab", shiftKey: true, preventDefault });
    expect(last.focus).toHaveBeenCalledOnce();
    cleanup();
    expect(removeEventListener).toHaveBeenCalledWith("keydown", keydown);
    expect(trigger.focus).toHaveBeenCalledOnce();
  });
});
