import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { headers } from "next/headers";
import AutoCarousel from "@/components/AutoCarousel";
import BookingForm from "@/components/BookingForm";
import { CtaLink, DeadlineBar, DevTools, Nudge, PageTracker, StickyCta } from "@/components/Widgets";
import {
  ANGLES, ANGLE_CONTENT, ASSETS, AWARDS, FAQS, PARTNERS, PROGRAMS, REVIEWS, STATES, TEACHERS, TRACK_CONTENT, US_LEAD,
  parseAngle, parseTrack, type Teacher,
} from "@/lib/content";

type Props = { params: Promise<{ angle: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export function generateStaticParams() {
  return ANGLES.map((angle) => ({ angle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = ANGLE_CONTENT[parseAngle((await params).angle)];
  return { title: `${c.pill} | BrightCHAMPS`, description: c.sub };
}

export default async function LandingPage({ params, searchParams }: Props) {
  const angle = parseAngle((await params).angle);
  const sp = await searchParams;
  const trk = parseTrack(sp.trk);
  // Visitor's state: ?state= override, else the edge geo header (Vercel), else unknown.
  const h = await headers();
  const geo = h.get("x-vercel-ip-country") === "US" ? h.get("x-vercel-ip-country-region") ?? "" : "";
  const stCode = (typeof sp.state === "string" ? sp.state : geo).toUpperCase();
  const state = STATES[stCode] ? stCode : "";
  const stateName = STATES[state] ?? "";

  const c = ANGLE_CONTENT[angle];
  const t = TRACK_CONTENT[trk];
  const teachers: Teacher[] = trk === "b" ? [US_LEAD, ...TEACHERS[angle]] : TEACHERS[angle];

  return (
    <>
      <Suspense>
        <PageTracker angle={angle} trk={trk} state={state} />
        <DevTools angle={angle} trk={trk} state={state} />
      </Suspense>

      {/* 1 · Deadline bar */}
      <DeadlineBar angle={angle} trk={trk} />

      {/* 2 · Header */}
      <header className="site-header">
        <div className="wrap">
          <a href="#top" aria-label="BrightCHAMPS">
            <Image src={`${ASSETS}/imagekit/website/new_website/DIY/brightchamps_logo_v2.webp`} alt="BrightCHAMPS" width={168} height={36} priority />
          </a>
          <div className="header-right">
            <span className="header-rating"><Stars /> <b>4.6</b> Trustpilot</span>
            <CtaLink where="header" className="btn hide-m">Book free class</CtaLink>
          </div>
        </div>
      </header>

      <main id="top">
        {/* 3 · Hero + stats + form step 1 */}
        <section className="hero">
          <div className="blob b1" aria-hidden="true" />
          <div className="blob b2" aria-hidden="true" />
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <span className="pill"><span className="live" />{c.pill}</span>
              <h1>{c.h1[trk][0]}<em>{c.h1[trk][1]}</em></h1>
              <p className="sub">{c.sub}</p>
              <ul className="ticks">{c.ticks.map((x) => <li key={x}>{x}</li>)}</ul>
              <div className="hero-visual">
                <div className="stats">
                  {t.stats.map(([v, l]) => (
                    <div className="stat" key={l}><b>{v}{l.includes("Trustpilot") && <span className="star">★</span>}</b><span>{l}</span></div>
                  ))}
                </div>
                {/* Track B: swap for creative with US families (deck slide 06) once shot. */}
                <div className="hero-img">
                  <Image src={c.heroImage} alt="" width={340} height={340} priority sizes="340px" />
                  <span className="chip c1">🎥 Live 1:1 class</span>
                  <span className="chip c2">📊 Free skill report</span>
                </div>
              </div>
              <p className="trustline">{t.trustLine}</p>
            </div>
            <BookingForm angle={angle} title={c.formTitle} />
          </div>
        </section>

        {/* Partner strip (from the current page's trust row) */}
        <div className="partners">
          <div className="wrap">
            <span>Curriculum designed with</span>
            {PARTNERS.map((p) => <Image key={p.alt} src={`${ASSETS}${p.src}`} alt={p.alt} width={120} height={40} />)}
          </div>
        </div>

        {/* 5 · How the free class works */}
        <section className="section">
          <div className="wrap">
            <SectionHead art="how" title="How your free class works" lead="Three simple steps, about 60 minutes. No payment and no commitment." />
            <ol className="how">
              <li className="card">
                <Image src={`${ASSETS}/landingPage/icons/laptop_class.svg`} alt="" width={56} height={56} />
                <h3>Pick a time</h3><p>Choose an after-school or weekend slot, shown in your local time zone.</p>
              </li>
              <li className="card">
                <Image src={`${ASSETS}/landingPage/icons/3_star_review.svg`} alt="" width={56} height={56} />
                <h3>Live 1:1 class</h3><p>{c.how2}</p>
              </li>
              <li className="card">
                <Image src={`${ASSETS}/landingPage/icons/rocket.svg`} alt="" width={56} height={56} />
                <h3>Skill report</h3><p>A written report on strengths, gaps and a suggested plan. Yours to keep.</p>
              </li>
            </ol>
          </div>
        </section>

        {/* 6 · Curriculum: this topic only */}
        <section className="section tint">
          <div className="wrap">
            <SectionHead art="journey" title={c.currTitle} lead={c.currLead} />
            <div className="badges">
              {c.badges.map((b, i) => <span key={b} className={`badge ${i ? "sky" : "mint"}`}>✓ {b}</span>)}
              <span className="badge peach">Reviewed by our US curriculum council</span>
            </div>
            <div className="curr-grid">
              {c.modules.map(([title, body], i) => (
                <div className="mod" key={title}><b>{String(i + 1).padStart(2, "0")}</b><div><h3>{title}</h3><p>{body}</p></div></div>
              ))}
            </div>
            <div className="programs">
              {PROGRAMS.map((p) => (
                <div key={p.name} className={`program card${p.popular ? " popular" : ""}`}>
                  {p.popular && <span className="ribbon">Most popular</span>}
                  <Image className="picon" src={`${ASSETS}${p.icon}`} alt="" width={56} height={56} />
                  <h3>{p.name}</h3>
                  <p className="sessions"><b>{p.sessions}</b> live 1:1 sessions</p>
                  <p className="price">${p.perClass}<small>/class</small></p>
                  <p className="blurb">{p.blurb}</p>
                </div>
              ))}
            </div>
            <p className="fineprint">Programs are discussed after the free class. Nothing is charged for the trial.</p>
          </div>
        </section>

        {/* 7 · Accreditations */}
        <section className="section">
          <div className="wrap">
            <SectionHead art="awards" title="Awards & Accolades" lead="Recognized worldwide for great teaching, and trusted by families in 30+ countries." />
            <AutoCarousel className="acc">
              <div className="acc-card tp">
                <div className="tp-score"><b>4.6</b><Stars big /></div>
                <span>Trustpilot · 3,000+ reviews</span>
              </div>
              <div className="acc-card council">
                <div className="flag" aria-hidden="true">🇺🇸</div>
                <b>US Curriculum Council</b>
                <span>Signs off our Common Core &amp; AMC 8 tracks</span>
              </div>
              {AWARDS.map((a) => (
                <div className="acc-card award" key={a.title}>
                  <Image src={`${ASSETS}${a.src}`} alt="" width={120} height={64} />
                  <span className="win">Winner</span>
                  <b>{a.title}</b>
                </div>
              ))}
            </AutoCarousel>
          </div>
        </section>

        {/* 8 · Teachers */}
        <section className="section tint">
          <div className="wrap">
            <SectionHead art="stars" title={t.teachTitle} lead={t.teachLead} />
            <AutoCarousel className={`teachers n${teachers.length}`}>
              {teachers.map((x) => (
                <article key={x.name} className={`tcard card${x.us ? " us" : ""}`}>
                  <div className="tav">
                    {x.img ? <Image src={`${ASSETS}${x.img}`} alt={`${x.name}, teacher`} width={88} height={88} /> : <span aria-hidden="true">🇺🇸</span>}
                  </div>
                  {x.us && <span className="role">US academic lead</span>}
                  <h3>{x.name}</h3>
                  {x.us
                    ? <p className="meta">Joins the last 15 minutes of your class and runs your follow-up call</p>
                    : <p className="meta">{x.years} yrs teaching · <span className="rate">★ {x.rating}</span> ({x.reviews})</p>}
                  <div className="tags">{x.tags.map((g) => <span key={g}>{g}</span>)}</div>
                </article>
              ))}
            </AutoCarousel>
          </div>
        </section>

        {/* 9 · Reviews */}
        <section className="section">
          <div className="wrap">
            <SectionHead art="reviews" title={`What parents in ${stateName || "the US"} say`} lead="Real stories from families learning with BrightCHAMPS.">
              <a className="tp-link" href="https://www.trustpilot.com/review/brightchamps.com" target="_blank" rel="noopener"><Stars /> 4.6 on Trustpilot →</a>
            </SectionHead>
            <div className="reviews rail">
              {REVIEWS[angle].map((r) => (
                <figure key={r.kid} className="rcard card">
                  <div className="rimg">
                    <Image src={`${ASSETS}/landingPage/${r.img}`} alt={`${r.parent} with ${r.kid}`} fill sizes="(min-width: 760px) 360px, 100vw" />
                    <span className="win-badge">🏆 {r.win}</span>
                  </div>
                  <blockquote><Stars /><p>“{r.quote}”</p></blockquote>
                  <figcaption><b>{r.parent}</b><span>Parent of {r.kid}, {r.grade}{stateName && ` · ${stateName}`}</span></figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* 10 · Final call to action */}
        <section className="section">
          <div className="wrap">
            <div className="final">
              <div>
                <h2>{c.final}</h2>
                <p>{t.finalSub}</p>
              </div>
              <div className="final-cta">
                <CtaLink where="final" className="btn yellow lg">Book my free class</CtaLink>
                <div className="fine"><span>✓ No card needed</span><span>✓ Reschedule anytime</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* 11 · FAQs */}
        <section className="section faq-sec">
          <div className="wrap faq">
            <SectionHead art="faq" title="Frequently Asked Questions" lead="Everything you need to know before the free class." />
            {FAQS.map(([q, a]) => (
              <details key={q}><summary>{q}</summary><p>{a}</p></details>
            ))}
            <p className="faq-more">Still unsure? Email <a href="mailto:care@brightchamps.com">care@brightchamps.com</a></p>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="wrap">
          <Image src={`${ASSETS}/imagekit/landingPage/BrightCHAMPS-New-White-Logo.svg`} alt="BrightCHAMPS" width={150} height={32} />
          <nav><a href="https://brightchamps.com/privacy-policy">Privacy</a><a href="https://brightchamps.com/terms-and-conditions">Terms</a><a href="mailto:care@brightchamps.com">care@brightchamps.com</a></nav>
          <p>BrightCHAMPS · Wilmington, Delaware · © 2026 BrightCHAMPS. All rights reserved.</p>
        </div>
      </footer>

      {/* 4 · Nudge */}
      <Nudge stateName={stateName} offerKey={c.key} />
      <StickyCta />
    </>
  );
}

// Section-title illustrations from the current BrightCHAMPS page: a centre icon flanked by two doodles.
const NW = `${ASSETS}/brightchamps-new-website`;
const ART = {
  how: { icon: `${ASSETS}/landingPage/gifs/leaderboard_with_stars.gif`, left: `${NW}/abstract_shape_active.webp`, right: `${NW}/abstract_circle.webp` },
  journey: { icon: `${ASSETS}/imagekit/website/journey_title_icon.webp`, left: `${ASSETS}/imagekit/website/journey_title_left_icon.webp`, right: `${ASSETS}/imagekit/website/journey_title_right_icon.webp` },
  awards: { icon: `${ASSETS}/nw-assests/gifs/awards_accolades_transparent.webp`, left: `${NW}/meetOurStars_stars_group_left.webp`, right: `${NW}/meetOurStars_stars_group_right.webp`, halo: `${NW}/achievements_backgroundBadge.webp` },
  stars: { icon: `${ASSETS}/nw-assests/gifs/meetOurStars_starfish.webp`, left: `${NW}/meetOurStars_stars_group_left.webp`, right: `${NW}/meetOurStars_stars_group_right.webp` },
  reviews: { icon: `${ASSETS}/landingPage/founder_led_first_fold_star.webp`, left: `${NW}/abstract_shape_active.webp`, right: `${NW}/abstract_circle.webp` },
  faq: { icon: `${NW}/faq_colored_question_sign.webp`, left: `${NW}/faq_faq_text.webp`, right: `${NW}/faq_question_mark.webp` },
} as const;

function SectionHead({ art, title, lead, children }: { art: keyof typeof ART; title: string; lead?: string; children?: React.ReactNode }) {
  const a: { icon: string; left: string; right: string; halo?: string } = ART[art];
  return (
    <div className={`shead art-${art}`}>
      <Image className="doodle left" src={a.left} alt="" width={140} height={140} aria-hidden="true" />
      <Image className="doodle right" src={a.right} alt="" width={140} height={140} aria-hidden="true" />
      <div className="shead-icon" aria-hidden="true">
        {a.halo && <Image className="halo" src={a.halo} alt="" width={180} height={180} />}
        <Image src={a.icon} alt="" width={120} height={120} unoptimized={a.icon.endsWith(".gif")} />
      </div>
      <h2>{title}</h2>
      {lead && <p className="lead">{lead}</p>}
      {children}
    </div>
  );
}

function Stars({ big }: { big?: boolean }) {
  return <span className={`tp-stars${big ? " big" : ""}`} aria-label="5 stars">{[0, 1, 2, 3, 4].map((i) => <i key={i}>★</i>)}</span>;
}
