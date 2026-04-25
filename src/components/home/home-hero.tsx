import Link from "next/link";
import { IPhoneShell } from "@/components/chrome/iphone-shell";
import { LiquidGlassPanel } from "@/components/chrome/liquid-glass-panel";
import { HomeStage } from "@/components/home/home-stage";
import type { PublicSiteSettings } from "@/lib/data/site-settings";
import type { ProjectRecord } from "@/lib/types";

type HomeHeroProps = {
  settings: PublicSiteSettings;
  projects: ProjectRecord[];
};

export function HomeHero({ settings, projects }: HomeHeroProps) {
  const orderedProjects = settings.projectOrder
    .map((slug) => projects.find((project) => project.slug === slug))
    .filter((project): project is ProjectRecord => Boolean(project));
  const featuredProjects = orderedProjects.length > 0 ? orderedProjects : projects;

  return (
    <section className="mx-auto grid max-w-[1350px] gap-10 xl:min-h-[calc(100vh-7rem)] xl:grid-cols-2 xl:items-center xl:gap-16">
      <div className="order-2 max-w-2xl space-y-7 xl:order-1">
        <LiquidGlassPanel className="inline-flex items-center gap-3 rounded-full px-4 py-3 shadow-[0_24px_80px_rgba(148,163,184,0.22)]">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-sky-300 via-blue-400 to-cyan-300 text-lg font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
            L
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">
              lulalalual
            </p>
            <p className="text-sm text-slate-700">仅限本人登录的 GitHub 后台</p>
          </div>
        </LiquidGlassPanel>

        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-slate-500">
            Apple 风格玩具感作品集
          </p>
          <h1 className="max-w-2xl text-[3.25rem] font-semibold leading-[0.96] tracking-[-0.05em] text-slate-950 md:text-[4.8rem]">
            {settings.heroTitle}
          </h1>
          <p className="max-w-xl text-lg leading-8 text-slate-600 md:text-[1.16rem]">
            {settings.heroSubtitle}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-slate-600">
          <span className="glass-panel inline-flex rounded-full px-4 py-2">
            React Three Fiber 舞台
          </span>
          <span className="glass-panel inline-flex rounded-full px-4 py-2">
            GitHub OAuth 所有者权限
          </span>
          <span className="glass-panel inline-flex rounded-full px-4 py-2">
            Vercel 与 Supabase
          </span>
        </div>

        <div className="grid max-w-xl gap-4 md:grid-cols-2">
          <Link href="/projects">
            <LiquidGlassPanel className="glass-interactive rounded-[2rem] px-5 py-5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-200 to-blue-500 text-xl text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                ◫
              </div>
              <p className="text-xl font-semibold text-slate-900">项目</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {featuredProjects
                  .slice(0, 2)
                  .map((project) => project.title)
                  .join(" 与 ")}
                会按关卡自动解锁展示。
              </p>
            </LiquidGlassPanel>
          </Link>
          <Link href="/notes">
            <LiquidGlassPanel className="glass-interactive rounded-[2rem] px-5 py-5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-lime-100 to-lime-300 text-xl text-lime-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                ☰
              </div>
              <p className="text-xl font-semibold text-slate-900">笔记</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                支持 Markdown 在线编辑、发布与管理，只允许你的 GitHub 账号写入。
              </p>
            </LiquidGlassPanel>
          </Link>
        </div>

        <div className="flex flex-wrap gap-3">
          {settings.socialLinks.map((item) => (
            <Link
              key={`${item.label}-${item.href}`}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="glass-interactive glass-panel rounded-full px-4 py-2 text-sm text-slate-700"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="glass-interactive glass-panel rounded-full px-4 py-2 text-sm text-slate-700"
          >
            进入后台
          </Link>
        </div>
      </div>

      <div className="order-1 flex justify-center xl:order-2 xl:justify-end">
        <div className="w-full max-w-[470px]">
          <IPhoneShell>
            <HomeStage
              projectCards={featuredProjects.slice(0, 2).map((project) => ({
                title: project.title,
                subtitle: project.summary,
              }))}
            />
          </IPhoneShell>
        </div>
      </div>
    </section>
  );
}
