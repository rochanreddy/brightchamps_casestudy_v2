"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { Angle } from "@/lib/content";
import { formatUsPhone, intentScore, isValidUsMobile, tierOf } from "@/lib/intent";
import { track, uuid } from "@/lib/tracking";

type Step1 = { userType: "parent" | "student"; parentName: string; email: string; phone: string; childName: string; grade: string; consent: boolean };
type Step2 = { laptop: "" | "yes" | "no"; reason: "" | "buy" | "demo"; when: "" | "after_demo" | "this_week" | "this_month" | "exploring" };

const GRADES = ["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const WEEKDAY_HOURS = [16, 17, 18, 19, 15, 20]; // after school first, local time
const WEEKEND_HOURS = [10, 11, 14, 15, 16, 9];
const NOTICE_MS = 3 * 36e5; // a teacher needs 3h to be assigned
const PARTIAL_KEY = "bc_partial_lead";

function hoursFor(day: Date) {
  const weekend = day.getDay() === 0 || day.getDay() === 6;
  return (weekend ? WEEKEND_HOURS : WEEKDAY_HOURS).filter((h) => {
    const s = new Date(day);
    s.setHours(h, 0, 0, 0);
    return s.getTime() >= Date.now() + NOTICE_MS;
  });
}

function nextDays() {
  const d0 = new Date();
  d0.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(d0);
    d.setDate(d0.getDate() + i);
    return d;
  }).filter((d) => hoursFor(d).length > 0);
}

const fmtTime = (d: Date) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

export default function BookingForm({ angle, title }: { angle: Angle; title: string }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [s1, setS1] = useState<Step1>({ userType: "parent", parentName: "", email: "", phone: "", childName: "", grade: "", consent: false });
  const [s2, setS2] = useState<Step2>({ laptop: "", reason: "", when: "" });
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [days, setDays] = useState<Date[]>([]);
  const [day, setDay] = useState<Date | null>(null);
  const [slot, setSlot] = useState<Date | null>(null);
  const [tz, setTz] = useState({ name: "", short: "" });
  const [calAdded, setCalAdded] = useState(false);
  const leadId = useRef(uuid());
  const started = useRef(false);
  const qualified = useRef(false);
  const startedAt = useRef(Date.now());
  const cardRef = useRef<HTMLDivElement>(null);
  const thanksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const name = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const short = new Intl.DateTimeFormat("en-US", { timeZoneName: "short" }).formatToParts(new Date()).find((p) => p.type === "timeZoneName")?.value ?? "";
    setTz({ name, short });
    // Bring back a half-finished form for returning parents.
    try {
      const saved = JSON.parse(localStorage.getItem(PARTIAL_KEY) ?? "null");
      if (saved) setS1((p) => ({ ...p, ...saved, consent: false }));
    } catch {}
  }, []);

  useEffect(() => {
    if (step === 3) thanksRef.current?.focus();
    if (step !== 1) cardRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [step]);

  const slots = useMemo(() => (day ? hoursFor(day).map((h) => { const s = new Date(day); s.setHours(h, 0, 0, 0); return s; }) : []), [day]);

  function onFocus() {
    if (started.current) return;
    started.current = true;
    track("form_start");
  }

  function submitStep1(e: FormEvent) {
    e.preventDefault();
    const digits = s1.phone.replace(/\D/g, "");
    const errs = {
      parentName: s1.parentName.trim().length < 2,
      email: !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(s1.email.trim()),
      phone: !isValidUsMobile(digits),
      childName: !s1.childName.trim(),
      grade: !s1.grade,
      consent: !s1.consent,
    };
    setErrors(errs);
    const firstBad = Object.entries(errs).find(([, v]) => v)?.[0];
    if (firstBad) {
      document.getElementById(`f-${firstBad}`)?.focus();
      return;
    }
    // Partial record: in production this POSTs to the CRM so recovery texts reach parents who stop here.
    const partial = { userType: s1.userType, parentName: s1.parentName.trim(), email: s1.email.trim().toLowerCase(), phone: s1.phone, childName: s1.childName.trim(), grade: s1.grade };
    try { localStorage.setItem(PARTIAL_KEY, JSON.stringify(partial)); } catch {}
    track("form_partial", { lead_id: leadId.current, grade: s1.grade, user_type: s1.userType });
    const ds = nextDays();
    setDays(ds);
    setDay(ds[0] ?? null);
    setSlot(null);
    setStep(2);
  }

  function pickSlot(s: Date) {
    setSlot(s);
    setErrors((e) => ({ ...e, slot: false }));
    track("slot_selected", { lead_id: leadId.current, hours_ahead: Math.round((s.getTime() - Date.now()) / 36e5) });
  }

  function answer<K extends keyof Step2>(k: K, v: Step2[K]) {
    const next = { ...s2, [k]: v };
    setS2(next);
    if (!qualified.current && next.laptop && next.reason && next.when) {
      qualified.current = true;
      track("qualify_answered", { lead_id: leadId.current });
    }
  }

  function submitStep2(e: FormEvent) {
    e.preventDefault();
    const errs = { slot: !slot, questions: !(s2.laptop && s2.reason && s2.when) };
    setErrors(errs);
    if (errs.slot || errs.questions || !slot) return;
    const score = intentScore({
      userType: s1.userType,
      email: s1.email,
      laptop: s2.laptop as "yes" | "no",
      reason: s2.reason as "buy" | "demo",
      when: s2.when as Exclude<Step2["when"], "">,
      slot,
      highIntentAd: angle === "amc8" || angle === "cogat",
      isMobileDevice: /Mobi|Android/i.test(navigator.userAgent),
      secondsOnPage: (Date.now() - startedAt.current) / 1000,
    });
    const t = tierOf(score);
    const id = leadId.current;
    track("Lead", { event_id: `lead_${id}`, lead_id: id });
    track("QualifiedLead", { event_id: `ql_${id}`, lead_id: id, intent_score: score, tier: t.tier, value: t.value, currency: "USD" });
    // POST the full lead to the CRM; the server hashes PII and sends the same event_ids server-side.
    // Skipped in the standalone HTML file (opened from disk, no server).
    if (location.protocol !== "file:") void fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead_id: id, angle, ...s1, ...s2, slot: slot.toISOString(), time_zone: tz.name, intent_score: score, tier: t.tier }),
      keepalive: true,
    }).catch(() => {});
    try { localStorage.removeItem(PARTIAL_KEY); } catch {}
    setStep(3);
    window.dispatchEvent(new Event("bc:booked"));
  }

  function addToCalendar() {
    if (!slot) return;
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const end = new Date(slot.getTime() + 36e5);
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//BrightCHAMPS//Free Class//EN", "BEGIN:VEVENT",
      `UID:${leadId.current}@brightchamps.com`, `DTSTAMP:${fmt(new Date())}`, `DTSTART:${fmt(slot)}`, `DTEND:${fmt(end)}`,
      `SUMMARY:${s1.childName}'s free BrightCHAMPS class`,
      "DESCRIPTION:The class link arrives by text and email. Laptop + webcam + mic. Join 5 minutes early.",
      "BEGIN:VALARM", "TRIGGER:-PT30M", "ACTION:DISPLAY", "DESCRIPTION:Class in 30 minutes", "END:VALARM",
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = "brightchamps-free-class.ics";
    a.click();
    setCalAdded(true);
    track("calendar_add", { lead_id: leadId.current });
  }

  const set = <K extends keyof Step1>(k: K, v: Step1[K]) => {
    setS1((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: false }));
  };

  return (
    <div className="formcard card" id="book" ref={cardRef}>
      {step === 1 && (
        <form onSubmit={submitStep1} onFocus={onFocus} noValidate>
          <div className="form-head">
            <h2>{title}</h2>
            <span className="step-count">Step 1 of 2</span>
          </div>
          <Progress n={1} />

          <fieldset className="field">
            <legend className="flabel">I am the…</legend>
            <div className="seg">
              {(["parent", "student"] as const).map((v) => (
                <label key={v} className={s1.userType === v ? "on" : ""}>
                  <input type="radio" name="userType" value={v} checked={s1.userType === v}
                    onChange={() => { set("userType", v); track("user_type_selected", { user_type: v }); }} />
                  {v === "parent" ? "Parent / guardian" : "Student"}
                </label>
              ))}
            </div>
          </fieldset>
          {s1.userType === "student" && <p className="hint">Great! Please add a parent&apos;s details. We&apos;ll confirm the class with them.</p>}

          <Field id="parentName" label="Parent's full name" error="Please enter the parent's name." bad={errors.parentName}>
            <input id="f-parentName" className="input" autoComplete="name" value={s1.parentName} onChange={(e) => set("parentName", e.target.value)} aria-invalid={!!errors.parentName} />
          </Field>
          <Field id="email" label="Parent's email" error="Please enter a valid email." bad={errors.email}>
            <input id="f-email" className="input" type="email" inputMode="email" autoComplete="email" value={s1.email} onChange={(e) => set("email", e.target.value)} aria-invalid={!!errors.email} />
          </Field>
          <Field id="phone" label="Parent's mobile" error="Please enter a 10-digit US mobile number." bad={errors.phone}>
            <div className={`phone${errors.phone ? " bad" : ""}`}>
              <span aria-hidden="true">🇺🇸 +1</span>
              <input id="f-phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="(201) 555-0142"
                value={s1.phone} onChange={(e) => set("phone", formatUsPhone(e.target.value))} aria-invalid={!!errors.phone} />
            </div>
          </Field>
          <div className="row2">
            <Field id="childName" label="Child's first name" error="Required." bad={errors.childName}>
              <input id="f-childName" className="input" autoComplete="off" value={s1.childName} onChange={(e) => set("childName", e.target.value)} aria-invalid={!!errors.childName} />
            </Field>
            <Field id="grade" label="Child's grade" error="Required." bad={errors.grade}>
              <select id="f-grade" className="input" value={s1.grade} onChange={(e) => set("grade", e.target.value)} aria-invalid={!!errors.grade}>
                <option value="">Select</option>
                {GRADES.map((g) => <option key={g} value={g}>{g === "K" ? "Kindergarten" : `Grade ${g}`}</option>)}
              </select>
            </Field>
          </div>

          <label className={`consent${errors.consent ? " bad" : ""}`}>
            <input id="f-consent" type="checkbox" checked={s1.consent} onChange={(e) => set("consent", e.target.checked)} />
            <span>
              I agree to get texts and calls from BrightCHAMPS about this booking, including by automated means. Consent isn&apos;t a condition of purchase.
              Msg &amp; data rates may apply. Reply STOP to opt out. <a href="https://brightchamps.com/privacy-policy" target="_blank" rel="noopener">Privacy</a>
            </span>
          </label>
          {errors.consent && <p className="err" role="alert">Please tick the box so we can confirm your class.</p>}

          <button className="btn block lg" type="submit">Continue → Pick a time</button>
          <Assurances />
        </form>
      )}

      {step === 2 && (
        <form onSubmit={submitStep2} noValidate>
          <div className="form-head">
            <h2>Pick a time for {s1.childName || "your child"}</h2>
            <span className="step-count">Step 2 of 2</span>
          </div>
          <Progress n={2} />

          <p className="flabel">Day</p>
          <div className="days" role="group" aria-label="Choose a day">
            {days.map((d, i) => (
              <button key={d.getTime()} type="button" className="day" aria-pressed={day?.getTime() === d.getTime()} onClick={() => { setDay(d); setSlot(null); }}>
                <small>{i === 0 && d.toDateString() === new Date().toDateString() ? "Today" : d.toLocaleDateString("en-US", { weekday: "short" })}</small>
                <b>{d.getDate()}</b>
                <small>{d.toLocaleDateString("en-US", { month: "short" })}</small>
              </button>
            ))}
          </div>
          <p className="flabel">Time <span className="muted">· 60-min live class</span></p>
          <div className="slots" role="group" aria-label="Choose a time">
            {slots.map((s, i) => {
              const weekend = s.getDay() === 0 || s.getDay() === 6;
              return (
                <button key={s.getTime()} type="button" className="slot" aria-pressed={slot?.getTime() === s.getTime()} onClick={() => pickSlot(s)}>
                  {fmtTime(s)}
                  {i < 3 && <span className="tag">{weekend ? "Popular" : "After school"}</span>}
                </button>
              );
            })}
          </div>
          <p className="tzline">🌎 Shown in your time zone: {tz.name.replace(/_/g, " ")}{tz.short && ` (${tz.short})`}</p>
          {errors.slot && <p className="err" role="alert">Please pick a time.</p>}

          <Choice label="Does your child have a laptop or desktop?" value={s2.laptop} onChange={(v) => answer("laptop", v)}
            options={[["yes", "Yes"], ["no", "Tablet only"]]} />
          <Choice label="Why are you booking?" value={s2.reason} onChange={(v) => answer("reason", v)}
            options={[["buy", "Looking for a course"], ["demo", "Just the free class"]]} />
          <Choice label="When do you plan to start?" value={s2.when} onChange={(v) => answer("when", v)} grid
            options={[["after_demo", "Right after the class"], ["this_week", "This week"], ["this_month", "This month"], ["exploring", "Just exploring"]]} />
          {errors.questions && <p className="err" role="alert">Please answer the three questions above.</p>}

          <button className="btn block lg" type="submit">Book my free class</button>
          <button className="back" type="button" onClick={() => setStep(1)}>← Edit details</button>
        </form>
      )}

      {step === 3 && slot && (
        <div className="ty" ref={thanksRef} tabIndex={-1}>
          <div className="check" aria-hidden="true">
            <svg width="34" height="34" viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <h2>Booking confirmed</h2>
          <Progress n={3} />
          <div className="when">
            <span>{s1.childName}&apos;s free class</span>
            <b>{slot.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</b>
            <b>{fmtTime(slot)}–{fmtTime(new Date(slot.getTime() + 36e5))} {tz.short}</b>
          </div>
          <button className="btn block" type="button" onClick={addToCalendar}>{calAdded ? "✓ Added to calendar" : "📅 Add to calendar"}</button>
          <ol className="checklist">
            <li><b>Laptop or desktop</b> with Chrome, charged and plugged in</li>
            <li><b>Webcam and mic</b> on, in a quiet spot</li>
            <li><b>Notebook and pencil</b> for working through problems</li>
            <li><b>Join 5 minutes early.</b> The Zoom link comes by text and email.</li>
          </ol>
          <div className="yesbox">📱 We just texted <b>{s1.phone}</b>. <b>Reply YES</b> to confirm your seat.</div>
        </div>
      )}
    </div>
  );
}

function Progress({ n }: { n: 1 | 2 | 3 }) {
  return <div className="steps" aria-hidden="true"><i className="on" /><i className={n > 1 ? "on" : ""} /></div>;
}

function Assurances() {
  return <div className="assure"><span>🔒 No card needed</span><span>↻ Reschedule anytime</span><span>⏱ 30 seconds</span></div>;
}

function Field({ id, label, error, bad, children }: { id: string; label: string; error: string; bad?: boolean; children: React.ReactNode }) {
  return (
    <div className="field">
      <label className="flabel" htmlFor={`f-${id}`}>{label}</label>
      {children}
      {bad && <p className="err" role="alert">{error}</p>}
    </div>
  );
}

function Choice<V extends string>({ label, value, onChange, options, grid }: { label: string; value: string; onChange: (v: V) => void; options: [V, string][]; grid?: boolean }) {
  return (
    <fieldset className="field">
      <legend className="flabel">{label}</legend>
      <div className={`seg${grid ? " grid2" : ""}`}>
        {options.map(([v, text]) => (
          <label key={v} className={value === v ? "on" : ""}>
            <input type="radio" checked={value === v} onChange={() => onChange(v)} />
            {text}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
