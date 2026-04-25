import { NextResponse } from "next/server";
import { ensureSlug, getOwnerSupabaseOrResponse, parseTagList } from "@/lib/studio-server";

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
  const slug = ensureSlug(body.slug, body.title);
  const tags = parseTagList(body.tags);

  const { error } = await supabase
    .from("notes")
    .update({
      title: body.title ?? "",
      slug,
      excerpt: body.excerpt ?? "",
      content_markdown: body.contentMarkdown ?? "",
      status: body.status === "published" ? "published" : "draft",
      is_pinned: Boolean(body.isPinned),
      published_at: body.publishedAt ? new Date(body.publishedAt).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await supabase.from("note_tags").delete().eq("note_id", id);

  if (tags.length > 0) {
    await supabase.from("note_tags").insert(tags.map((tag) => ({ note_id: id, tag })));
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { response, supabase } = await getOwnerSupabaseOrResponse();

  if (response || !supabase) {
    return response!;
  }

  const { error } = await supabase.from("notes").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
