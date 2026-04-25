import { NextResponse } from "next/server";
import { hasSupabaseEnv } from "@/lib/env";

export async function GET() {
  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    runtime: "nextjs",
    services: {
      supabaseConfigured: hasSupabaseEnv(),
    },
  });
}
