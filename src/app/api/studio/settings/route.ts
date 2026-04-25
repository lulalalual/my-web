import { NextResponse } from "next/server";
import { getOwnerSupabaseOrResponse, parseListText } from "@/lib/studio-server";

export async function PATCH(request: Request) {
  const { response, supabase } = await getOwnerSupabaseOrResponse();

  if (response || !supabase) {
    return response!;
  }

  const body = await request.json();

  let socialLinks;

  try {
    socialLinks = body.socialLinks ? JSON.parse(body.socialLinks) : [];
  } catch {
    return NextResponse.json({ error: "socialLinks 必须是合法 JSON。" }, { status: 400 });
  }

  const { error } = await supabase.from("site_settings").upsert({
    id: 1,
    hero_title: body.heroTitle ?? "",
    hero_subtitle: body.heroSubtitle ?? "",
    social_links: socialLinks,
    project_order: parseListText(body.projectOrder),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
