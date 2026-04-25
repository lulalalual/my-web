import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { PublicNoteRecord } from "@/lib/data/notes";
import type { ProjectRecord } from "@/lib/types";

export type StudioNoteRecord = PublicNoteRecord;

export type StudioProjectRecord = ProjectRecord;

export type StudioSettingsRecord = {
  heroTitle: string;
  heroSubtitle: string;
  socialLinks: string;
  projectOrder: string;
};

export async function getStudioNotes() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return [] as StudioNoteRecord[];
  }

  const { data, error } = await supabase
    .from("notes")
    .select("*, note_tags(tag)")
    .order("updated_at", { ascending: false });

  if (error || !data) {
    return [] as StudioNoteRecord[];
  }

  return data.map((note) => ({
    id: note.id,
    slug: note.slug,
    title: note.title,
    excerpt: note.excerpt,
    contentMarkdown: note.content_markdown,
    coverImage: note.cover_image,
    status: note.status,
    isPinned: note.is_pinned,
    publishedAt: note.published_at,
    updatedAt: note.updated_at,
    createdAt: note.created_at,
    tags: note.note_tags?.map((tag) => tag.tag) ?? [],
  })) as StudioNoteRecord[];
}

export async function getStudioNoteById(id: string) {
  const notes = await getStudioNotes();
  return notes.find((note) => note.id === id) ?? null;
}

export async function getStudioProjects() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return [] as StudioProjectRecord[];
  }

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("order_index", { ascending: true });

  if (error || !data) {
    return [] as StudioProjectRecord[];
  }

  return data.map((project) => ({
    id: project.id,
    slug: project.slug as ProjectRecord["slug"],
    title: project.title,
    summary: project.summary,
    description: project.description,
    techStack: project.tech_stack,
    highlights: project.highlights,
    coverImage: project.cover_image,
    repoUrl: project.repo_url,
    demoUrl: project.demo_url,
    orderIndex: project.order_index,
    isPublished: project.is_published,
  }));
}

export async function getStudioSettings() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      heroTitle: "iPhone-styled 3D journeys for projects and notes.",
      heroSubtitle:
        "A liquid-glass personal site where a tiny character auto-runs through projects and writing.",
      socialLinks: "[]",
      projectOrder: "interview-master,tower-defense-duo",
    } satisfies StudioSettingsRecord;
  }

  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) {
    return {
      heroTitle: "",
      heroSubtitle: "",
      socialLinks: "[]",
      projectOrder: "",
    } satisfies StudioSettingsRecord;
  }

  return {
    heroTitle: data.hero_title,
    heroSubtitle: data.hero_subtitle,
    socialLinks: JSON.stringify(data.social_links, null, 2),
    projectOrder: data.project_order.join(","),
  } satisfies StudioSettingsRecord;
}
