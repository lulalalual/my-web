import Link from "next/link";
import { getPublishedProjects } from "@/lib/data/projects";

export default async function ProjectsIndexPage() {
  const projects = await getPublishedProjects();

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <section className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
          项目
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-slate-950 md:text-6xl">
          游戏化首页之外的完整项目页。
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          这里展开每个项目的背景、能力结构和实现亮点。首页负责惊艳，这里负责讲清楚。
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.slug}`}
            className="glass-panel glass-interactive rounded-[2rem] px-6 py-6"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              项目 {project.orderIndex}
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
              {project.title}
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              {project.summary}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {project.techStack.slice(0, 4).map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/70 bg-white/60 px-3 py-2 text-sm text-slate-700"
                >
                  {item}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
