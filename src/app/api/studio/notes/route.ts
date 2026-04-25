import { NextResponse } from "next/server";
import { ensureSlug, getOwnerSupabaseOrResponse, parseTagList } from "@/lib/studio-server";

export async function POST(request: Request) {
  const { response, supabase } = await getOwnerSupabaseOrResponse();

  if (response || !supabase) {
    return response!;
  }

  const body = await request.json();
  const slug = ensureSlug(body.slug, body.title);
  const tags = parseTagList(body.tags);

  const { data, error } = await supabase
    .from("notes")
    .insert({
      title: body.title ?? "",
      slug,
      excerpt: body.excerpt ?? "",
      content_markdown: body.contentMarkdown ?? "",
      status: body.status === "published" ? "published" : "draft",
      is_pinned: Boolean(body.isPinned),
      published_at: body.publishedAt ? new Date(body.publishedAt).toISOString() : null,
    })
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Create failed" }, { status: 400 });
  }

  if (tags.length > 0) {
    await supabase.from("note_tags").insert(tags.map((tag) => ({ note_id: data.id, tag })));
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
