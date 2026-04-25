import Link from "next/link";
import { ProjectDetailHero } from "@/components/projects/project-detail-hero";
import { ProjectHighlightGrid } from "@/components/projects/project-highlight-grid";
import { requirePublishedProject } from "@/lib/data/projects";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await requirePublishedProject(slug);

  return (
    <main>
      <ProjectDetailHero project={project} />
      <ProjectHighlightGrid highlights={project.highlights} />

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="glass-panel rounded-[2rem] px-6 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            继续浏览
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/projects"
              className="glass-interactive rounded-full border border-white/70 bg-white/55 px-5 py-3 text-sm font-medium text-slate-800"
            >
              返回项目列表
            </Link>
            <Link
              href="/notes"
              className="glass-interactive rounded-full border border-white/70 bg-white/55 px-5 py-3 text-sm font-medium text-slate-800"
            >
              查看笔记
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
