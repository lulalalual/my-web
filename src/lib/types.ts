export type ProjectSlug = "interview-master" | "tower-defense-duo";

export type ProjectRecord = {
  id: string;
  slug: ProjectSlug;
  title: string;
  summary: string;
  description: string;
  techStack: string[];
  highlights: string[];
  coverImage: string | null;
  repoUrl: string | null;
  demoUrl: string | null;
  orderIndex: number;
  isPublished: boolean;
};

export type NoteRecord = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  contentMarkdown: string;
  coverImage: string | null;
  status: "draft" | "published";
  isPinned: boolean;
  publishedAt: string | null;
  updatedAt: string;
  tags: string[];
};
