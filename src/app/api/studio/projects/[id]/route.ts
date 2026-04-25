import { NextResponse } from "next/server";
import { ensureSlug, getOwnerSupabaseOrResponse, parseListText } from "@/lib/studio-server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { response, supabase } = await getOwnerSupabaseOrResponse();

  if (response || !supabase) {
    return response!;
  }

  const body = await request.json();

  const { error } = await supabase
    .from("projects")
    .update({
      title: body.title ?? "",
      slug: ensureSlug(body.slug, body.title),
      summary: body.summary ?? "",
      description: body.description ?? "",
      tech_stack: parseListText(body.techStack),
      highlights: parseListText(body.highlights),
      repo_url: body.repoUrl || null,
      demo_url: body.demoUrl || null,
      order_index: Number(body.orderIndex) || 0,
      is_published: Boolean(body.isPublished),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
