import { notFound } from "next/navigation";
import type { Database } from "@/lib/db.types";
import { hasSupabaseEnv } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { NoteRecord } from "@/lib/types";

type NoteRow = Database["public"]["Tables"]["notes"]["Row"];

export type PublicNoteRecord = NoteRecord & {
  createdAt?: string;
};

const fallbackNotes: PublicNoteRecord[] = [
  {
    id: "fallback-note-apple-stage",
    slug: "apple-stage-thinking",
    title: "把个人主页做成 iPhone 里的 3D 小舞台",
    excerpt:
      "把作品集从普通卡片页，重构成一个自动通关的 3D 舞台，核心是叙事节奏和产品感，而不是堆特效。",
    contentMarkdown: `# 把个人主页做成 iPhone 里的 3D 小舞台

这次首页不是传统的作品列表，而是一个 **自动推进的 iPhone 风格小舞台**。

## 设计目标

- 第一眼就能记住
- 同时展示项目和个人写作能力
- 让“作品集”更像一个产品，而不是简历页

## 实现思路

1. 用 \`React Three Fiber\` 搭建舞台空间。
2. 用 DOM 做液态玻璃卡片和 iPhone 外壳。
3. 用自动时间轴驱动角色和项目切换。

## 一个简单的时间轴片段

\`\`\`ts
const stops = {
  interview: 0.35,
  tower: 0.74,
};
\`\`\`

> 关键不是做成“真游戏”，而是做成一个有记忆点的交互作品集。
`,
    coverImage: null,
    status: "published",
    isPinned: true,
    publishedAt: "2026-04-25T10:00:00.000Z",
    updatedAt: "2026-04-25T10:00:00.000Z",
    createdAt: "2026-04-25T10:00:00.000Z",
    tags: ["Design", "Portfolio", "R3F"],
  },
  {
    id: "fallback-note-markdown-studio",
    slug: "markdown-studio-direction",
    title: "为什么后台笔记系统坚持 Markdown-first",
    excerpt:
      "在线编辑并不意味着必须上重型富文本。对个人站来说，Markdown-first 更稳、更轻，也更容易迁移。",
    contentMarkdown: `# 为什么后台笔记系统坚持 Markdown-first

如果目标是 **长期写技术笔记**，我更偏向 Markdown-first，而不是先追求复杂块编辑器。

## 好处

- 内容可迁移
- 代码块天然友好
- 结构稳定
- 适合版本管理和导出

## 结论

富文本适合协作文档，Markdown 更适合个人技术站的长期沉淀。
`,
    coverImage: null,
    status: "published",
    isPinned: false,
    publishedAt: "2026-04-24T08:30:00.000Z",
    updatedAt: "2026-04-24T08:30:00.000Z",
    createdAt: "2026-04-24T08:30:00.000Z",
    tags: ["Notes", "Markdown", "Studio"],
  },
];

type NotesSelectRow = NoteRow & {
  note_tags?: Array<{ tag: string }>;
};

function mapNote(row: NotesSelectRow): PublicNoteRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    contentMarkdown: row.content_markdown,
    coverImage: row.cover_image,
    status: row.status,
    isPinned: row.is_pinned,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
    tags: row.note_tags?.map((tag) => tag.tag) ?? [],
  };
}

export async function getPublishedNotes() {
  if (!hasSupabaseEnv()) {
    return fallbackNotes;
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return fallbackNotes;
  }

  const { data, error } = await supabase
    .from("notes")
    .select("*, note_tags(tag)")
    .eq("status", "published")
    .order("is_pinned", { ascending: false })
    .order("published_at", { ascending: false });

  if (error || !data) {
    return fallbackNotes;
  }

  return data.map((row) => mapNote(row as NotesSelectRow));
}

export async function getPublishedNoteBySlug(slug: string) {
  const notes = await getPublishedNotes();
  return notes.find((note) => note.slug === slug) ?? null;
}

export async function requirePublishedNote(slug: string) {
  const note = await getPublishedNoteBySlug(slug);

  if (!note) {
    notFound();
  }

  return note;
}
