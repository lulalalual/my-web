import Link from "next/link";

export default function ProjectNotFound() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-24">
      <div className="glass-panel rounded-[2rem] px-8 py-10">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
          Project Not Found
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-slate-950">
          这个项目还没有公开页面。
        </h1>
        <Link
          href="/projects"
          className="glass-interactive mt-8 inline-flex rounded-full border border-white/70 bg-white/55 px-5 py-3 text-sm font-medium text-slate-800"
        >
          返回项目列表
        </Link>
      </div>
    </main>
  );
}
