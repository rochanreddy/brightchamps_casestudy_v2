// Intent score (deck slide 08): what parents tell us + what we observe.
// Hot 60+ → call within 5 min · Warm 35–59 → text, then call · Cold <35 → nurture.

export type LeadAnswers = {
  userType: "parent" | "student";
  email: string;
  laptop: "yes" | "no";
  reason: "buy" | "demo";
  when: "after_demo" | "this_week" | "this_month" | "exploring";
  slot: Date;
  highIntentAd: boolean;
  isMobileDevice: boolean;
  secondsOnPage: number;
};

const DISPOSABLE = /@(mailinator|guerrillamail|10minutemail|tempmail|yopmail|trashmail|sharklasers)\./i;

export function intentScore(a: LeadAnswers) {
  const hours = (a.slot.getTime() - Date.now()) / 36e5;
  let s = 0;
  if (a.userType === "parent") s += 10;
  s += a.reason === "buy" ? 20 : 5;
  s += { after_demo: 20, this_week: 15, this_month: 10, exploring: 0 }[a.when];
  s += hours <= 48 ? 10 : hours <= 96 ? 5 : 0; // sooner slots get attended more
  if (a.highIntentAd) s += 5;
  s += a.laptop === "yes" ? 10 : -5;
  s += DISPOSABLE.test(a.email) ? -15 : 5;
  s += 5; // validated +1 mobile
  if (!a.isMobileDevice) s += 3;
  if (a.secondsOnPage > 30) s += 2;
  return Math.max(0, Math.min(100, s));
}

export function tierOf(score: number) {
  if (score >= 60) return { tier: "hot", value: 60, action: "call_within_5_min" } as const;
  if (score >= 35) return { tier: "warm", value: 30, action: "text_then_call" } as const;
  return { tier: "cold", value: 5, action: "nurture" } as const;
}

export function isValidUsMobile(digits: string) {
  return /^[2-9]\d{2}[2-9]\d{6}$/.test(digits) && !/^(\d)\1{9}$/.test(digits) && digits.slice(3, 6) !== "555";
}

export function formatUsPhone(raw: string) {
  const d = raw.replace(/\D/g, "").replace(/^1(?=\d{10})/, "").slice(0, 10);
  if (d.length > 6) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  if (d.length > 3) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return d;
}
