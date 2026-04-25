export function ProjectHighlightGrid({ highlights }: { highlights: string[] }) {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20">
      <div className="grid gap-4 md:grid-cols-2">
        {highlights.map((highlight, index) => (
          <article
            key={highlight}
            className="glass-panel rounded-[2rem] px-6 py-6"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              亮点 {index + 1}
            </p>
            <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-900">
              {highlight}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
