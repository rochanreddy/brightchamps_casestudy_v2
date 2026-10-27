import { NextResponse } from "next/server";

// Lead intake. Production: write to the CRM, then send Lead / QualifiedLead server-side
// (Meta Conversions API, Google Enhanced Conversions for Leads) with the browser's event_id
// and SHA-256-hashed email and phone, so each lead is counted once.
export async function POST(req: Request) {
  const lead = await req.json().catch(() => null);
  if (!lead?.lead_id || !lead?.email || !lead?.phone) {
    return NextResponse.json({ ok: false, error: "missing fields" }, { status: 400 });
  }
  console.info("[lead]", lead.lead_id, lead.angle, lead.tier, lead.intent_score);
  return NextResponse.json({ ok: true, lead_id: lead.lead_id });
}
