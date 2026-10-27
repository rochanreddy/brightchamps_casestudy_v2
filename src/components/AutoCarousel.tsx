"use client";

import { useEffect, useRef } from "react";

const SPEED = 32; // px per second
const RESUME_MS = 2500; // pause after a swipe before auto-scroll resumes
const PHONE = "(max-width: 759px)";

// Phone: a continuous, looping auto-scroll row the parent can also swipe.
// Desktop: the children render as the normal grid; the duplicate set is hidden by CSS.
export default function AutoCarousel({ className, children }: { className: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = ref.current;
    if (!track) return;
    const phone = matchMedia(PHONE);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");

    let raf = 0, last = 0, pos = 0, lastSet = 0, pausedUntil = 0, touching = false;
    // Distance from the first item to its copy: one full loop.
    const loopWidth = () => {
      const first = track.firstElementChild as HTMLElement | null;
      const copy = track.querySelector<HTMLElement>(".dup-set > *");
      return first && copy ? copy.offsetLeft - first.offsetLeft : 0;
    };
    const wrap = () => {
      const loop = loopWidth();
      if (!loop) return;
      if (track.scrollLeft >= loop) track.scrollLeft -= loop;
      else if (track.scrollLeft <= 0) track.scrollLeft += loop;
    };

    const frame = (t: number) => {
      const dt = last ? Math.min(t - last, 64) : 0;
      last = t;
      // Any movement we didn't make (swipe, trackpad, keyboard) hands control to the user for a moment.
      if (Math.abs(track.scrollLeft - lastSet) > 2) {
        wrap();
        pos = track.scrollLeft;
        pausedUntil = t + RESUME_MS;
      }
      if (!touching && t > pausedUntil) {
        pos += (SPEED * dt) / 1000;
        const loop = loopWidth();
        if (loop && pos >= loop) pos -= loop;
        track.scrollLeft = pos;
      }
      lastSet = track.scrollLeft;
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      last = 0;
      if (phone.matches && !reduced.matches) raf = requestAnimationFrame(frame);
    };

    const down = () => { touching = true; };
    const up = () => { touching = false; pausedUntil = performance.now() + RESUME_MS; pos = track.scrollLeft; };
    const onScroll = () => { if (touching || performance.now() < pausedUntil) { wrap(); pos = track.scrollLeft; } };
    const onWheel = () => { pausedUntil = performance.now() + RESUME_MS; };

    track.addEventListener("touchstart", down, { passive: true });
    track.addEventListener("touchend", up);
    track.addEventListener("touchcancel", up);
    track.addEventListener("pointerdown", down);
    track.addEventListener("pointerup", up);
    track.addEventListener("pointercancel", up);
    track.addEventListener("scroll", onScroll, { passive: true });
    track.addEventListener("wheel", onWheel, { passive: true });
    phone.addEventListener("change", start);
    start();

    return () => {
      cancelAnimationFrame(raf);
      phone.removeEventListener("change", start);
      track.removeEventListener("touchstart", down);
      track.removeEventListener("touchend", up);
      track.removeEventListener("touchcancel", up);
      track.removeEventListener("pointerdown", down);
      track.removeEventListener("pointerup", up);
      track.removeEventListener("pointercancel", up);
      track.removeEventListener("scroll", onScroll);
      track.removeEventListener("wheel", onWheel);
    };
  }, []);

  return (
    <div ref={ref} className={`${className} carousel`}>
      {children}
      <div className="dup-set" aria-hidden="true" inert>
        {children}
      </div>
    </div>
  );
}
