# BrightCHAMPS US landing-page template (case study, Next.js)

One template for every US ad (deck slide 07): `/us/{angle}?trk={a|b}`.

| Signal | Values | Changes |
|---|---|---|
| `angle` (path) | `amc8`, `cogat`, `ai-coding`, `math` | Headline, curriculum, reviews, teachers |
| `trk` | `a` Indian-American, `b` mainstream US | Trust message, stats, US academic lead, offers |
| state | `?state=TX`, else Vercel geo header | Reviews title, nudges; time zone comes from the browser |

Helpers: `?demo=1` shows a signal switcher, `?debug=1` shows the live tracking-event log.

## Run

```bash
npm install
npm run dev        # http://localhost:3000/us/amc8?trk=b&state=TX&demo=1
npm run build && npm start
```

## Where things live

- `src/app/us/[angle]/page.tsx`: the 11 sections, in deck order
- `src/components/BookingForm.tsx`: two-step form, slot picker, thank-you, intent score
- `src/components/Widgets.tsx`: deadline bar, nudge, sticky CTA, page tracking, demo/debug tools
- `src/lib/content.ts`: all copy, by angle and track
- `src/lib/intent.ts`: intent score (Hot 60+ / Warm 35–59 / Cold <35 → $60 / $30 / $5)
- `src/lib/tracking.ts`: dataLayer events; Lead and QualifiedLead carry an `event_id` for CAPI dedupe
- `src/app/api/leads/route.ts`: lead intake stub; connect it to the CRM

## Before launch

- Replace sample reviews with verified Trustpilot reviews tagged by state.
- Feed the nudge from real bookings in the last hour.
- Add the hired US academic lead's name and photo (`US_LEAD` in `content.ts`), and the US curriculum council's real name.
- Swap in Track B hero creative with US families.

## Deploy on Vercel

1. vercel.com → Add New → Project → import `rochanreddy/brightchamps_casestudy`.
2. Keep the defaults (framework: Next.js, root directory: `./`) and click Deploy.
3. Share `https://<your-project>.vercel.app/us/amc8?trk=b&demo=1`. On Vercel, the visitor's state comes from the geo header automatically.
