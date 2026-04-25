# Personal Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a new personal site with an iPhone-styled 3D homepage, project showcase, Markdown notes system, and GitHub-authenticated owner-only editing.

**Architecture:** Use a single Next.js App Router app deployed to Vercel. Public pages read published content from Supabase, while `/studio` routes require Supabase GitHub auth and an allowlist check for the GitHub username `lulalalual`. The homepage combines DOM-based liquid-glass chrome with a React Three Fiber scene for the toy-like auto-play project journey.

**Tech Stack:** Next.js, TypeScript, Tailwind CSS, Framer Motion, React Three Fiber, @react-three/drei, Supabase Auth, Supabase Postgres, GitHub OAuth, Vercel

---

### Task 1: Scaffold the application and baseline tooling

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Create: `.env.example`
- Create: `.gitignore`
- Create: `README.md`

- [ ] **Step 1: Create the Next.js app shell**

```bash
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Expected: a working App Router project rooted at `D:\1\c++\个人网站`.

- [ ] **Step 2: Install runtime dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr framer-motion three @react-three/fiber @react-three/drei clsx gray-matter react-markdown remark-gfm rehype-slug rehype-autolink-headings rehype-highlight lucide-react zod
```

- [ ] **Step 3: Install dev dependencies**

```bash
npm install -D @types/three
```

- [ ] **Step 4: Replace the starter home page with a neutral boot screen**

```tsx
// src/app/page.tsx
export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6">
        <p className="text-sm tracking-[0.2em] text-[var(--muted)]">
          personal site bootstrap
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 5: Define the global design tokens**

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #edf4ff;
  --fg: #0f172a;
  --muted: #64748b;
  --line: rgba(148, 163, 184, 0.22);
  --glass: rgba(255, 255, 255, 0.5);
  --glass-strong: rgba(255, 255, 255, 0.74);
  --shadow: 0 24px 80px rgba(15, 23, 42, 0.14);
}

html,
body {
  min-height: 100%;
}

body {
  margin: 0;
  background:
    radial-gradient(circle at top, rgba(191, 219, 254, 0.9), transparent 35%),
    linear-gradient(180deg, #f8fbff 0%, #edf4ff 45%, #e8eefb 100%);
  color: var(--fg);
}
```

- [ ] **Step 6: Verify the scaffold boots**

Run: `npm run dev`

Expected: Next.js starts successfully and `http://localhost:3000` shows the boot screen.

- [ ] **Step 7: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold nextjs personal site"
```

### Task 2: Create the project structure and shared app shell

**Files:**
- Create: `src/lib/constants.ts`
- Create: `src/lib/types.ts`
- Create: `src/components/chrome/iphone-shell.tsx`
- Create: `src/components/chrome/liquid-glass-panel.tsx`
- Create: `src/components/layout/site-header.tsx`
- Create: `src/components/layout/site-footer.tsx`
- Create: `src/components/layout/site-nav.tsx`
- Create: `src/app/(public)/layout.tsx`
- Create: `src/app/(public)/projects/page.tsx`
- Create: `src/app/(public)/notes/page.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Define shared content types**

```ts
// src/lib/types.ts
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
```

- [ ] **Step 2: Create public route layout**

```tsx
// src/app/(public)/layout.tsx
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
```

- [ ] **Step 3: Create the iPhone chrome wrapper**

```tsx
// src/components/chrome/iphone-shell.tsx
import type { ReactNode } from "react";

export function IPhoneShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[430px] rounded-[3rem] border border-white/60 bg-white/30 p-3 shadow-[var(--shadow)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute left-1/2 top-3 h-7 w-28 -translate-x-1/2 rounded-full bg-slate-950/90" />
      <div className="overflow-hidden rounded-[2.4rem] border border-white/50 bg-white/40">
        {children}
      </div>
      <div className="mx-auto mt-3 h-1.5 w-28 rounded-full bg-slate-900/70" />
    </div>
  );
}
```

- [ ] **Step 4: Move the home page under the public route group**

```tsx
// src/app/page.tsx
export { default } from "./(public)/page";
```

- [ ] **Step 5: Add placeholder pages for projects and notes**

```tsx
// src/app/(public)/projects/page.tsx
export default function ProjectsIndexPage() {
  return <main className="mx-auto max-w-6xl px-6 py-24">Projects</main>;
}
```

```tsx
// src/app/(public)/notes/page.tsx
export default function NotesIndexPage() {
  return <main className="mx-auto max-w-6xl px-6 py-24">Notes</main>;
}
```

- [ ] **Step 6: Verify route wiring**

Run: `npm run dev`

Expected: `/`, `/projects`, and `/notes` all render without build errors.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: add shared site shell and route structure"
```

### Task 3: Add Supabase clients, GitHub auth, and owner-only studio guard

**Files:**
- Create: `src/lib/env.ts`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/auth.ts`
- Create: `src/middleware.ts`
- Create: `src/app/auth/callback/route.ts`
- Create: `src/app/login/page.tsx`
- Create: `src/app/studio/layout.tsx`
- Create: `src/app/studio/page.tsx`
- Create: `src/components/auth/login-button.tsx`
- Modify: `.env.example`

- [ ] **Step 1: Declare the required environment variables**

```env
# .env.example
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
GITHUB_OWNER_USERNAME=lulalalual
```

- [ ] **Step 2: Create a typed env helper**

```ts
// src/lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  GITHUB_OWNER_USERNAME: z.string().min(1),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  GITHUB_OWNER_USERNAME: process.env.GITHUB_OWNER_USERNAME,
});
```

- [ ] **Step 3: Create the owner check**

```ts
// src/lib/auth.ts
import { env } from "@/lib/env";

export function isOwnerUsername(username: string | null | undefined) {
  return username?.toLowerCase() === env.GITHUB_OWNER_USERNAME.toLowerCase();
}
```

- [ ] **Step 4: Implement the Supabase server helpers**

```ts
// src/lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { isOwnerUsername } from "@/lib/auth";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      },
    },
  });
}

export async function getServerViewer() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireOwner() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isOwnerUsername(user.user_metadata.user_name)) {
    redirect("/login");
  }

  return supabase;
}
```

- [ ] **Step 5: Build the login page**

```tsx
// src/app/login/page.tsx
import { LoginButton } from "@/components/auth/login-button";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-6">
      <div className="w-full rounded-[2rem] border border-white/60 bg-white/50 p-8 shadow-[var(--shadow)] backdrop-blur-xl">
        <h1 className="text-2xl font-semibold">Sign in to Studio</h1>
        <p className="mt-3 text-sm text-slate-500">
          GitHub auth is enabled, but only the owner account can edit content.
        </p>
        <div className="mt-8">
          <LoginButton />
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 6: Guard the studio layout**

```tsx
// src/app/studio/layout.tsx
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerViewer } from "@/lib/supabase/server";
import { isOwnerUsername } from "@/lib/auth";

export default async function StudioLayout({ children }: { children: ReactNode }) {
  const viewer = await getServerViewer();

  if (!viewer) {
    redirect("/login");
  }

  if (!isOwnerUsername(viewer.user_metadata.user_name)) {
    redirect("/");
  }

  return <div className="min-h-screen bg-slate-950 text-white">{children}</div>;
}
```

- [ ] **Step 7: Verify auth flow locally**

Run: `npm run dev`

Expected: `/studio` redirects to `/login` when logged out.

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: add supabase auth and studio guard"
```

### Task 4: Create the Supabase schema and row-level security

**Files:**
- Create: `supabase/migrations/20260425_initial_schema.sql`
- Create: `supabase/seed.sql`
- Create: `src/lib/db.types.ts`
- Modify: `README.md`

- [ ] **Step 1: Write the base schema**

```sql
-- supabase/migrations/20260425_initial_schema.sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  github_id text unique,
  github_username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  summary text not null,
  description text not null,
  tech_stack text[] not null default '{}',
  highlights text[] not null default '{}',
  cover_image text,
  repo_url text,
  demo_url text,
  order_index int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table notes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text not null,
  content_markdown text not null default '',
  cover_image text,
  status text not null check (status in ('draft', 'published')) default 'draft',
  is_pinned boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table note_tags (
  note_id uuid not null references notes(id) on delete cascade,
  tag text not null,
  primary key (note_id, tag)
);

create table site_settings (
  id int primary key default 1,
  hero_title text not null,
  hero_subtitle text not null,
  social_links jsonb not null default '[]'::jsonb,
  project_order text[] not null default '{}',
  updated_at timestamptz not null default now(),
  constraint single_settings_row check (id = 1)
);
```

- [ ] **Step 2: Add read/write policies**

```sql
alter table profiles enable row level security;
alter table projects enable row level security;
alter table notes enable row level security;
alter table note_tags enable row level security;
alter table site_settings enable row level security;

create policy "public read projects" on projects
for select using (is_published = true);

create policy "public read published notes" on notes
for select using (status = 'published');

create policy "public read note tags" on note_tags
for select using (
  exists (
    select 1 from notes
    where notes.id = note_tags.note_id
      and notes.status = 'published'
  )
);

create policy "owner full access profiles" on profiles
for all using (auth.jwt() ->> 'user_name' = 'lulalalual')
with check (auth.jwt() ->> 'user_name' = 'lulalalual');

create policy "owner full access projects" on projects
for all using (auth.jwt() ->> 'user_name' = 'lulalalual')
with check (auth.jwt() ->> 'user_name' = 'lulalalual');

create policy "owner full access notes" on notes
for all using (auth.jwt() ->> 'user_name' = 'lulalalual')
with check (auth.jwt() ->> 'user_name' = 'lulalalual');

create policy "owner full access note tags" on note_tags
for all using (auth.jwt() ->> 'user_name' = 'lulalalual')
with check (auth.jwt() ->> 'user_name' = 'lulalalual');

create policy "owner full access site settings" on site_settings
for all using (auth.jwt() ->> 'user_name' = 'lulalalual')
with check (auth.jwt() ->> 'user_name' = 'lulalalual');
```

- [ ] **Step 3: Seed the two known projects**

```sql
-- supabase/seed.sql
insert into projects (slug, title, summary, description, tech_stack, highlights, order_index, is_published)
values
  (
    'interview-master',
    '计算机面试大师',
    'AI 模拟面试与系统设计训练平台',
    'AI 驱动的全栈技术面试实战平台，包含流式交互、代码编辑、系统设计白板与复盘能力。',
    array['React', 'TypeScript', 'Vite', 'Tailwind', 'Zustand', 'Express'],
    array['Streaming UX', 'Monaco 编辑器', '系统设计白板', '能力雷达'],
    1,
    true
  ),
  (
    'tower-defense-duo',
    '塔防双人',
    '基于 C++ 与 SDL2 的双人塔防游戏',
    '双人协作塔防项目，包含敌人波次、塔类型、放置与升级机制以及完整的游戏资源系统。',
    array['C++', 'SDL2'],
    array['双人协作', '塔放置升级', '敌人波次系统', '资源管理'],
    2,
    true
  );
```

- [ ] **Step 4: Create database type aliases without CLI placeholders**

```ts
// src/lib/db.types.ts
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          slug: string;
          title: string;
          summary: string;
          description: string;
          tech_stack: string[];
          highlights: string[];
          cover_image: string | null;
          repo_url: string | null;
          demo_url: string | null;
          order_index: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      notes: {
        Row: {
          id: string;
          slug: string;
          title: string;
          excerpt: string;
          content_markdown: string;
          cover_image: string | null;
          status: "draft" | "published";
          is_pinned: boolean;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
}
```

- [ ] **Step 5: Verify migrations in Supabase**

Run: apply the migration and seed in Supabase SQL Editor.

Expected: tables exist, policies compile, and both projects are queryable.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add supabase schema and seed data"
```

### Task 5: Implement the homepage 3D stage, iPhone shell, and liquid glass UI

**Files:**
- Create: `src/app/(public)/page.tsx`
- Create: `src/components/home/home-hero.tsx`
- Create: `src/components/home/home-stage.tsx`
- Create: `src/components/home/stage-scene.tsx`
- Create: `src/components/home/stage-controls.tsx`
- Create: `src/components/home/project-pedestal-card.tsx`
- Create: `src/components/home/scene/use-stage-timeline.ts`
- Create: `src/components/home/scene/character.tsx`
- Create: `src/components/home/scene/platform.tsx`
- Create: `src/components/home/scene/spotlight.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Create the homepage composition**

```tsx
// src/app/(public)/page.tsx
import { HomeHero } from "@/components/home/home-hero";

export default function HomePage() {
  return (
    <main className="px-4 py-10 md:px-8 md:py-16">
      <HomeHero />
    </main>
  );
}
```

- [ ] **Step 2: Create the hero wrapper**

```tsx
// src/components/home/home-hero.tsx
import { IPhoneShell } from "@/components/chrome/iphone-shell";
import { HomeStage } from "@/components/home/home-stage";

export function HomeHero() {
  return (
    <section className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
      <div className="space-y-6">
        <p className="text-sm uppercase tracking-[0.28em] text-slate-500">lulalalual</p>
        <h1 className="max-w-xl text-5xl font-semibold leading-tight text-slate-950 md:text-6xl">
          An iPhone-styled 3D playground for projects and notes.
        </h1>
        <p className="max-w-xl text-base leading-8 text-slate-600">
          The homepage auto-plays a toy-like project journey. Published notes live alongside it, and studio editing stays owner-only.
        </p>
      </div>
      <IPhoneShell>
        <HomeStage />
      </IPhoneShell>
    </section>
  );
}
```

- [ ] **Step 3: Create the stage timeline state**

```ts
// src/components/home/scene/use-stage-timeline.ts
"use client";

import { useEffect, useState } from "react";

export function useStageTimeline() {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const id = window.setInterval(() => {
      setProgress((value) => (value >= 1 ? 0 : Number((value + 0.01).toFixed(2))));
    }, 80);
    return () => window.clearInterval(id);
  }, [isPlaying]);

  return { progress, isPlaying, setIsPlaying, setProgress };
}
```

- [ ] **Step 4: Build the Three scene host**

```tsx
// src/components/home/home-stage.tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { Float, PerspectiveCamera } from "@react-three/drei";
import { useStageTimeline } from "@/components/home/scene/use-stage-timeline";
import { StageControls } from "@/components/home/stage-controls";
import { StageScene } from "@/components/home/stage-scene";

export function HomeStage() {
  const timeline = useStageTimeline();

  return (
    <div className="relative h-[760px] overflow-hidden bg-gradient-to-b from-sky-100 via-blue-50 to-lime-100">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 2.1, 8]} fov={35} />
        <ambientLight intensity={1.6} />
        <directionalLight position={[5, 8, 4]} intensity={2.2} />
        <Float floatIntensity={0.4} rotationIntensity={0.12}>
          <StageScene progress={timeline.progress} />
        </Float>
      </Canvas>
      <StageControls {...timeline} />
    </div>
  );
}
```

- [ ] **Step 5: Implement the scene composition**

```tsx
// src/components/home/stage-scene.tsx
import { Character } from "@/components/home/scene/character";
import { Platform } from "@/components/home/scene/platform";
import { Spotlight } from "@/components/home/scene/spotlight";

export function StageScene({ progress }: { progress: number }) {
  const characterX = -2.6 + progress * 5.2;

  return (
    <group position={[0, -1.4, 0]}>
      <Platform position={[0, 0, 0]} scale={[7, 0.4, 2.8]} color="#84cc16" />
      <Platform position={[-0.4, 0.36, -0.8]} scale={[1.2, 0.4, 1]} color="#f59e0b" />
      <Platform position={[1.2, 0.5, -0.2]} scale={[0.8, 0.8, 0.8]} color="#334155" />
      <Spotlight position={[2.6, 1.8, 0.2]} />
      <Character position={[characterX, 0.42, 0.4]} />
    </group>
  );
}
```

- [ ] **Step 6: Add liquid glass control styling**

```css
/* append to src/app/globals.css */
.glass-panel {
  background: linear-gradient(180deg, rgba(255,255,255,.72), rgba(255,255,255,.38));
  border: 1px solid rgba(255,255,255,.6);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.65),
    0 18px 44px rgba(15,23,42,.14);
  backdrop-filter: blur(22px) saturate(140%);
}
```

- [ ] **Step 7: Verify homepage performance and layout**

Run: `npm run dev`

Expected: the home page renders a styled iPhone shell with an animating stage and no hydration errors.

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: build homepage iphone shell and 3d stage"
```

### Task 6: Build project data access and project detail pages

**Files:**
- Create: `src/lib/data/projects.ts`
- Create: `src/app/(public)/projects/[slug]/page.tsx`
- Create: `src/app/(public)/projects/[slug]/not-found.tsx`
- Create: `src/components/projects/project-detail-hero.tsx`
- Create: `src/components/projects/project-highlight-grid.tsx`
- Modify: `src/app/(public)/projects/page.tsx`

- [ ] **Step 1: Create the public project queries**

```ts
// src/lib/data/projects.ts
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getPublishedProjects() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("is_published", true)
    .order("order_index", { ascending: true });

  if (error) throw error;
  return data;
}
```

- [ ] **Step 2: Render the projects index**

```tsx
// src/app/(public)/projects/page.tsx
import Link from "next/link";
import { getPublishedProjects } from "@/lib/data/projects";

export default async function ProjectsIndexPage() {
  const projects = await getPublishedProjects();

  return (
    <main className="mx-auto max-w-6xl px-6 py-24">
      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.slug}`}
            className="rounded-[2rem] border border-white/60 bg-white/55 p-6 shadow-[var(--shadow)] backdrop-blur-xl"
          >
            <h2 className="text-2xl font-semibold">{project.title}</h2>
            <p className="mt-3 text-slate-600">{project.summary}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Build the dynamic detail route**

```tsx
// src/app/(public)/projects/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getPublishedProjects } from "@/lib/data/projects";

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const projects = await getPublishedProjects();
  const project = projects.find((item) => item.slug === slug);

  if (!project) notFound();

  return (
    <main className="mx-auto max-w-5xl px-6 py-24">
      <h1 className="text-5xl font-semibold">{project.title}</h1>
      <p className="mt-6 text-lg leading-8 text-slate-600">{project.description}</p>
    </main>
  );
}
```

- [ ] **Step 4: Verify both project detail pages**

Run: `npm run dev`

Expected: `/projects/interview-master` and `/projects/tower-defense-duo` render seeded content.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add public project pages"
```

### Task 7: Build the Markdown notes system and public notes pages

**Files:**
- Create: `src/lib/data/notes.ts`
- Create: `src/lib/markdown.ts`
- Create: `src/app/(public)/notes/[slug]/page.tsx`
- Create: `src/components/notes/note-list.tsx`
- Create: `src/components/notes/note-card.tsx`
- Create: `src/components/notes/note-article.tsx`
- Modify: `src/app/(public)/notes/page.tsx`

- [ ] **Step 1: Create published note queries**

```ts
// src/lib/data/notes.ts
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getPublishedNotes() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("notes")
    .select("*, note_tags(tag)")
    .eq("status", "published")
    .order("is_pinned", { ascending: false })
    .order("published_at", { ascending: false });

  if (error) throw error;
  return data;
}
```

- [ ] **Step 2: Render the notes index**

```tsx
// src/app/(public)/notes/page.tsx
import { getPublishedNotes } from "@/lib/data/notes";

export default async function NotesIndexPage() {
  const notes = await getPublishedNotes();

  return (
    <main className="mx-auto max-w-6xl px-6 py-24">
      <div className="grid gap-5">
        {notes.map((note) => (
          <article key={note.id} className="rounded-[2rem] border border-white/60 bg-white/55 p-6 shadow-[var(--shadow)] backdrop-blur-xl">
            <h2 className="text-2xl font-semibold">{note.title}</h2>
            <p className="mt-3 text-slate-600">{note.excerpt}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Build the Markdown detail renderer**

```tsx
// src/components/notes/note-article.tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";

export function NoteArticle({ markdown }: { markdown: string }) {
  return (
    <article className="prose prose-slate max-w-none prose-pre:rounded-2xl">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings, rehypeHighlight]}
      >
        {markdown}
      </ReactMarkdown>
    </article>
  );
}
```

- [ ] **Step 4: Verify note rendering with a seeded note**

Run: create one published note in Supabase, then `npm run dev`

Expected: `/notes` lists it and `/notes/<slug>` renders headings and code blocks correctly.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add public markdown notes system"
```

### Task 8: Build the owner studio for editing notes, projects, and site settings

**Files:**
- Create: `src/app/studio/notes/page.tsx`
- Create: `src/app/studio/notes/new/page.tsx`
- Create: `src/app/studio/notes/[id]/page.tsx`
- Create: `src/app/studio/projects/page.tsx`
- Create: `src/app/studio/settings/page.tsx`
- Create: `src/components/studio/studio-sidebar.tsx`
- Create: `src/components/studio/note-editor-form.tsx`
- Create: `src/components/studio/project-editor-form.tsx`
- Create: `src/components/studio/settings-form.tsx`
- Create: `src/app/api/studio/notes/route.ts`
- Create: `src/app/api/studio/notes/[id]/route.ts`
- Create: `src/app/api/studio/projects/[id]/route.ts`
- Create: `src/app/api/studio/settings/route.ts`

- [ ] **Step 1: Build the studio chrome**

```tsx
// src/app/studio/page.tsx
import Link from "next/link";

export default function StudioHomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-4xl font-semibold">Studio</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Link href="/studio/notes">Notes</Link>
        <Link href="/studio/projects">Projects</Link>
        <Link href="/studio/settings">Settings</Link>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Build the Markdown note editor form**

```tsx
// src/components/studio/note-editor-form.tsx
"use client";

import { useState } from "react";

export function NoteEditorForm() {
  const [markdown, setMarkdown] = useState("# New note");

  return (
    <form className="grid gap-4">
      <input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3" name="title" placeholder="Title" />
      <textarea
        className="min-h-[420px] rounded-3xl border border-white/10 bg-white/5 px-4 py-4 font-mono text-sm"
        name="contentMarkdown"
        value={markdown}
        onChange={(event) => setMarkdown(event.target.value)}
      />
      <button className="rounded-full bg-white px-5 py-3 text-slate-950">Save note</button>
    </form>
  );
}
```

- [ ] **Step 3: Add studio write APIs with owner checks**

```ts
// src/app/api/studio/notes/route.ts
import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await requireOwner();
  const body = await request.json();
  const { data, error } = await supabase.from("notes").insert(body).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}
```

- [ ] **Step 4: Verify end-to-end note creation**

Run: `npm run dev`

Expected: owner login reaches `/studio/notes/new`, saving a note persists it to Supabase, and published notes appear on `/notes`.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add owner studio editing flows"
```

### Task 9: Polish responsiveness, motion, and Apple-styled visual fidelity

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/components/home/home-hero.tsx`
- Modify: `src/components/home/home-stage.tsx`
- Modify: `src/components/chrome/iphone-shell.tsx`
- Modify: `src/components/notes/note-article.tsx`
- Modify: `src/components/projects/project-detail-hero.tsx`

- [ ] **Step 1: Add reduced-motion support**

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 2: Tune mobile hero sizing**

```tsx
// in HomeHero
<section className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
```

Keep the iPhone shell below the intro copy on small screens.

- [ ] **Step 3: Add liquid-glass hover and focus states**

```css
.glass-interactive {
  transition: transform 220ms ease, box-shadow 220ms ease, background-color 220ms ease;
}

.glass-interactive:hover,
.glass-interactive:focus-visible {
  transform: translateY(-2px);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.75),
    0 24px 56px rgba(15,23,42,.18);
}
```

- [ ] **Step 4: Verify desktop and mobile layouts**

Run: `npm run dev`

Expected: no clipped iPhone shell, no overflowing prose, and the studio remains usable on narrow screens.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: polish responsive apple-style visuals"
```

### Task 10: Deploy to Vercel and connect production auth

**Files:**
- Modify: `.env.example`
- Modify: `README.md`
- Create: `docs/deployment.md`

- [ ] **Step 1: Create the production environment variable checklist**

```md
<!-- docs/deployment.md -->
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_SITE_URL
- GITHUB_OWNER_USERNAME=lulalalual
```

- [ ] **Step 2: Configure Supabase GitHub provider**

Use Supabase dashboard:

1. Enable GitHub provider in Auth.
2. Set callback URL to `https://<your-vercel-domain>/auth/callback`.
3. Set local callback URL to `http://localhost:3000/auth/callback`.

- [ ] **Step 3: Deploy the site**

```bash
vercel
```

Expected: the app deploys and returns a production URL.

- [ ] **Step 4: Verify production**

Check in the deployed site:

- homepage renders the iPhone 3D experience
- `/projects` and `/notes` load published content
- `/login` starts GitHub OAuth
- logging in as `lulalalual` unlocks `/studio`
- any other account is denied studio editing

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "docs: add deployment and production auth setup"
```

## Test Plan

- Start the app locally with `npm run dev` and confirm `/`, `/projects`, `/notes`, and `/login` render.
- Verify `/studio` redirects to `/login` when logged out.
- Verify only GitHub username `lulalalual` passes the owner gate.
- Seed at least one published note and confirm Markdown headings, code blocks, and tags render correctly.
- Confirm both project detail pages render the seeded content for `计算机面试大师` and `塔防双人`.
- On desktop and mobile widths, verify the iPhone shell, liquid-glass UI, and stage controls stay usable.
- In production on Vercel, verify GitHub OAuth callback, Supabase reads/writes, and public content rendering.

## Assumptions

- The site will be created directly in `D:\1\c++\个人网站`, not inside either existing project folder.
- The only backend editor account is the GitHub username `lulalalual`.
- Supabase will store content directly; Markdown files are not kept in the repo as the source of truth.
- Homepage project nodes initially cover exactly two projects: `计算机面试大师` and `塔防双人`.
- The homepage uses a light Apple-style palette with liquid glass, not dark cyberpunk or pixel-game visuals.
