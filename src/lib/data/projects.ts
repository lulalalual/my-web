import { notFound } from "next/navigation";
import type { Database } from "@/lib/db.types";
import { hasSupabaseEnv } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ProjectRecord, ProjectSlug } from "@/lib/types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

const fallbackProjects: ProjectRecord[] = [
  {
    id: "fallback-interview-master",
    slug: "interview-master",
    title: "计算机面试大师",
    summary: "AI 模拟面试、代码执行、系统设计与简历分析一体化训练平台。",
    description:
      "一个产品化程度很高的技术面试训练系统，围绕真实面试流程设计流式对话、代码编辑与执行、系统设计白板、简历 ATS 扫描和面试回放，形成完整训练闭环，并同时支持 Web 与 Electron 桌面端交付。",
    techStack: [
      "React 18",
      "TypeScript",
      "Vite",
      "Tailwind v4",
      "Zustand",
      "Framer Motion",
      "Monaco Editor",
      "Electron",
      "Express",
    ],
    highlights: [
      "流式 AI 面试与多面试官风格",
      "Monaco 编辑器与多语言代码执行",
      "ATS 简历分析与导出能力",
      "系统设计白板与面试回放复盘",
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
      "一款原生 C++ 桌面游戏项目，使用 SDL2 及其图像、音频、文字扩展库，围绕双人配合、角色操作、塔放置升级、敌人波次和外置关卡配置构建完整的塔防体验，并以 Visual Studio 工程和可执行包方式交付。",
    techStack: [
      "C++",
      "SDL2",
      "SDL2_image",
      "SDL2_mixer",
      "SDL2_ttf",
      "cJSON",
      "MSVC v143",
    ],
    highlights: [
      "双人协作与角色技能配合",
      "三类塔与多级成长参数",
      "敌人波次、多出生点与资源管理",
      "JSON/CSV 驱动的关卡和数值配置",
    ],
    coverImage: null,
    repoUrl: null,
    demoUrl: null,
    orderIndex: 2,
    isPublished: true,
  },
];

function mapProject(row: ProjectRow): ProjectRecord {
  return {
    id: row.id,
    slug: row.slug as ProjectSlug,
    title: row.title,
    summary: row.summary,
    description: row.description,
    techStack: row.tech_stack,
    highlights: row.highlights,
    coverImage: row.cover_image,
    repoUrl: row.repo_url,
    demoUrl: row.demo_url,
    orderIndex: row.order_index,
    isPublished: row.is_published,
  };
}

export async function getPublishedProjects() {
  if (!hasSupabaseEnv()) {
    return fallbackProjects;
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return fallbackProjects;
  }

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("is_published", true)
    .order("order_index", { ascending: true });

  if (error || !data) {
    return fallbackProjects;
  }

  return data.map(mapProject);
}

export async function getPublishedProjectBySlug(slug: string) {
  const projects = await getPublishedProjects();
  return projects.find((project) => project.slug === slug) ?? null;
}

export async function requirePublishedProject(slug: string) {
  const project = await getPublishedProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return project;
}
