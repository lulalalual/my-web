import Link from "next/link";
import { NoteArticle } from "@/components/notes/note-article";
import { estimateReadingMinutes, formatArticleDate } from "@/lib/markdown";
import { requirePublishedNote } from "@/lib/data/notes";

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const note = await requirePublishedNote(slug);

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <section className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
          Notes
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-slate-950 md:text-6xl">
          {note.title}
        </h1>
        <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-500">
          <span className="glass-panel rounded-full px-4 py-2">
            {formatArticleDate(note.publishedAt)}
          </span>
          <span className="glass-panel rounded-full px-4 py-2">
            {estimateReadingMinutes(note.contentMarkdown)} min read
          </span>
        </div>
      </section>

      <NoteArticle markdown={note.contentMarkdown} />

      <div className="mt-8">
        <Link
          href="/notes"
          className="glass-interactive inline-flex rounded-full border border-white/70 bg-white/55 px-5 py-3 text-sm font-medium text-slate-800"
        >
          返回笔记列表
        </Link>
      </div>
    </main>
  );
}
