import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    {
      ok: true,
      app: "ORGTAL",
      version: "1.0-prototipo",
      timestamp: new Date().toISOString(),
      checks: {
        web: true,
        supabaseConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        evidenceBucket: process.env.NEXT_PUBLIC_SUPABASE_EVIDENCE_BUCKET || "evidencias"
      }
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
