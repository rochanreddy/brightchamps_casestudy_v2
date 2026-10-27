"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AMC8_DEADLINE, ANGLES, OFFERS, STATES, type Angle, type Track } from "@/lib/content";
import { onTrack, setTrackingContext, track, uuid } from "@/lib/tracking";

/* 1 · Deadline bar: counts down to a real campaign date */
export function DeadlineBar({ angle, trk }: { angle: Angle; trk: Track }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const at = now ?? Date.now();
  const offer = angle === "amc8" ? AMC8_DEADLINE : OFFERS.find((o) => (o.trk === "*" || o.trk === trk) && new Date(o.end).getTime() > at);
  if (!offer) return <div className="deadline">Free 1:1 classes this week · No card needed</div>;

  const ms = Math.max(0, new Date(offer.end).getTime() - at);
  const d = Math.floor(ms / 864e5), h = Math.floor((ms % 864e5) / 36e5), m = Math.floor((ms % 36e5) / 6e4), s = Math.floor((ms % 6e4) / 1e3);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="deadline" role="status">
      <span>{offer.text}</span>
      {now !== null && (
        <span className="cd">
          {d > 1 ? <>{d} days left</> : <>{d * 24 + h}h {pad(m)}m {pad(s)}s</>}
        </span>
      )}
    </div>
  );
}

/* Page-level tracking: lp_view, lp_engaged */
export function PageTracker({ angle, trk, state }: { angle: Angle; trk: Track; state: string }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    setTrackingContext({ angle, trk, state: state || null, session_id: uuid() });
    track("lp_view", { referrer: document.referrer || null, utm_source: searchParams.get("utm_source"), utm_campaign: searchParams.get("utm_campaign") });
    const start = Date.now();
    let done = false;
    const engage = () => {
      if (done) return;
      done = true;
      track("lp_engaged", { secs: Math.round((Date.now() - start) / 1000) });
      removeEventListener("scroll", onScroll);
    };
    const onScroll = () => scrollY > innerHeight * 0.6 && engage();
    const t = setTimeout(engage, 15000);
    addEventListener("scroll", onScroll, { passive: true });
    return () => { clearTimeout(t); removeEventListener("scroll", onScroll); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

/* 4 · Nudge. Production: fed by real bookings in the last hour; hidden when there are none. */
export function Nudge({ stateName, offerKey }: { stateName: string; offerKey: string }) {
  const [shown, setShown] = useState<{ place: string; mins: number } | null>(null);
  const off = useRef(false);
  useEffect(() => {
    const places = stateName ? [stateName, stateName] : ["Texas", "New Jersey"];
    const mins = [14, 37];
    const timers: ReturnType<typeof setTimeout>[] = [];
    const booked = () => { off.current = true; setShown(null); };
    addEventListener("bc:booked", booked);
    [12000, 40000].forEach((delay, i) => {
      timers.push(setTimeout(() => {
        if (off.current) return;
        setShown({ place: places[i], mins: mins[i] });
        track("nudge_shown", { n: i + 1 });
        timers.push(setTimeout(() => setShown(null), 6500));
      }, delay));
    });
    return () => { timers.forEach(clearTimeout); removeEventListener("bc:booked", booked); };
  }, [stateName]);

  return (
    <div className={`nudge${shown ? " show" : ""}`} role="status" aria-live="polite">
      <div className="dot" aria-hidden="true">✓</div>
      <div>
        <p>A parent in <b>{shown?.place}</b> booked a free {offerKey} class</p>
        <small>{shown?.mins} min ago · <a href="#book" onClick={() => { track("nudge_clicked"); setShown(null); }}>Book yours →</a></small>
      </div>
      <button className="x" type="button" aria-label="Dismiss" onClick={() => { off.current = true; setShown(null); }}>×</button>
    </div>
  );
}

/* Sticky mobile CTA: only while the form is off screen */
export function StickyCta() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = document.getElementById("book");
    if (!el) return;
    let booked = false;
    const onBooked = () => { booked = true; setShow(false); };
    addEventListener("bc:booked", onBooked);
    const io = new IntersectionObserver(([e]) => setShow(!booked && !e.isIntersecting && scrollY > 200), { threshold: 0.1 });
    io.observe(el);
    return () => { io.disconnect(); removeEventListener("bc:booked", onBooked); };
  }, []);
  return (
    <div className={`mcta${show ? " show" : ""}`}>
      <small>No card needed · Reschedule anytime</small>
      <CtaLink where="sticky" className="btn">Book free class</CtaLink>
    </div>
  );
}

export function CtaLink({ where, className, children }: { where: string; className?: string; children: React.ReactNode }) {
  return (
    <a href="#book" className={className} onClick={() => {
      track("cta_click", { where });
      setTimeout(() => document.getElementById("f-parentName")?.focus({ preventScroll: true }), 500);
    }}>{children}</a>
  );
}

/* ?demo=1: switch template signals live. ?debug=1: show tracking events. */
export function DevTools({ angle, trk, state }: { angle: Angle; trk: Track; state: string }) {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [log, setLog] = useState<string[]>([]);
  const demo = sp.get("demo") === "1", debug = sp.get("debug") === "1";

  useEffect(() => {
    if (!debug) return;
    return onTrack((name, p) => {
      const extra = Object.entries(p).filter(([k]) => !["angle", "trk", "state", "session_id"].includes(k) && p[k] != null).map(([k, v]) => `${k}=${v}`).join(" ");
      setLog((l) => [...l, `${name} ${extra}`]);
    });
  }, [debug]);

  if (!demo && !debug) return null;

  const go = (next: { angle?: string; trk?: string; state?: string }) => {
    const q = new URLSearchParams(sp.toString());
    q.set("trk", next.trk ?? trk);
    const st = next.state ?? state;
    if (st) q.set("state", st); else q.delete("state");
    const base = pathname.replace(/\/us\/[^/]+/, `/us/${next.angle ?? angle}`);
    router.push(`${base}?${q.toString()}`);
  };

  return (
    <>
      {demo && (
        <div className="demo">
          <b>Template signals</b>
          <label>angle<select value={angle} onChange={(e) => go({ angle: e.target.value })}>{ANGLES.map((a) => <option key={a}>{a}</option>)}</select></label>
          <label>trk<select value={trk} onChange={(e) => go({ trk: e.target.value })}><option value="a">A · Indian-American</option><option value="b">B · Mainstream US</option></select></label>
          <label>state<select value={state} onChange={(e) => go({ state: e.target.value })}><option value="">Auto</option>{Object.entries(STATES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
        </div>
      )}
      {debug && (
        <div className="dbg" aria-label="Tracking events">
          <b>Tracking events</b>
          {log.map((l, i) => <div key={i}><em>{l.split(" ")[0]}</em> {l.split(" ").slice(1).join(" ")}</div>)}
        </div>
      )}
    </>
  );
}
