import type { PublicNoteRecord } from "@/lib/data/notes";
import { createServerSupabaseClient } from "@/lib/supabase/server";
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
    tags: note.note_tags?.map((tag: { tag: string }) => tag.tag) ?? [],
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
      heroTitle: "像 iPhone 一样展示项目与笔记的 3D 个人网站。",
      heroSubtitle:
        "这是一个带液态玻璃质感的个人网站，小人会自动穿过关卡，展示项目与写作内容。",
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

export function getFallbackStudioProjects() {
  return [
    {
      id: "fallback-interview-master",
      slug: "interview-master",
      title: "计算机面试大师",
      summary: "AI 模拟面试、代码执行、系统设计与简历分析一体化训练平台。",
      description:
        "一个产品化程度很高的技术面试训练系统，围绕真实面试流程设计流式对话、代码编辑与执行、系统设计白板、简历 ATS 扫描和面试回放。",
      techStack: ["React 18", "TypeScript", "Vite", "Tailwind v4", "Electron"],
      highlights: [
        "流式 AI 面试与多面试官风格",
        "Monaco 编辑器与多语言代码执行",
      ],
      coverImage: null,
      repoUrl: null,
      demoUrl: null,
      orderIndex: 1,
      isPublished: true,
    },
    {
      id: "fallback-tower-defense-duo",
      slug: "tower-defense-duo",
      title: "塔防双人",
      summary: "基于 C++ 与 SDL2 的双人协作塔防与角色操作混合玩法游戏。",
      description:
        "一款原生 C++ 桌面游戏项目，围绕双人配合、角色操作、塔放置升级、敌人波次和外置关卡配置构建完整的塔防体验。",
      techStack: ["C++", "SDL2", "SDL2_image", "SDL2_mixer", "cJSON"],
      highlights: [
        "双人协作与角色技能配合",
        "JSON/CSV 驱动的关卡和数值配置",
      ],
      coverImage: null,
      repoUrl: null,
      demoUrl: null,
      orderIndex: 2,
      isPublished: true,
    },
  ] as StudioProjectRecord[];
}
