import { LiquidGlassPanel } from "@/components/chrome/liquid-glass-panel";
import type { ProjectRecord } from "@/lib/types";

export function ProjectDetailHero({ project }: { project: ProjectRecord }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <LiquidGlassPanel className="overflow-hidden rounded-[2.5rem] p-8 md:p-10">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">
              项目详情
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-slate-950 md:text-6xl">
              {project.title}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              {project.description}
            </p>
          </div>

          <div className="grid gap-4">
            <div className="glass-panel rounded-[2rem] px-5 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                项目概览
              </p>
              <p className="mt-3 text-lg font-medium text-slate-900">
                {project.summary}
              </p>
            </div>
            <div className="glass-panel rounded-[2rem] px-5 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                技术栈
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.techStack.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/70 bg-white/60 px-3 py-2 text-sm text-slate-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </LiquidGlassPanel>
    </section>
  );
}
