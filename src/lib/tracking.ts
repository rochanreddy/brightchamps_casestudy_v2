// Conversion events (deck slide 09). Everything goes to the dataLayer; GTM forwards
// Lead / QualifiedLead to Meta CAPI and Google Enhanced Conversions with the same event_id,
// so the browser and server copies are counted once.

type Params = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: Params[];
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

let base: Params = {};
const listeners = new Set<(name: string, p: Params) => void>();

export function setTrackingContext(ctx: Params) {
  base = { ...base, ...ctx };
}

export function onTrack(fn: (name: string, p: Params) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function track(name: string, params: Params = {}) {
  if (typeof window === "undefined") return;
  const p = { ...base, ...params };
  (window.dataLayer ??= []).push({ event: name, ...p });
  if (window.fbq && (name === "Lead" || name === "QualifiedLead")) {
    window.fbq(name === "Lead" ? "track" : "trackCustom", name, p, p.event_id ? { eventID: p.event_id } : undefined);
  }
  window.gtag?.("event", name, p);
  listeners.forEach((fn) => fn(name, p));
}

export function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 3) | 8).toString(16);
  });
}
