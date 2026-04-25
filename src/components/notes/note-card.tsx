import Link from "next/link";
import { LiquidGlassPanel } from "@/components/chrome/liquid-glass-panel";
import { formatArticleDate } from "@/lib/markdown";
import type { PublicNoteRecord } from "@/lib/data/notes";

export function NoteCard({ note }: { note: PublicNoteRecord }) {
  return (
    <LiquidGlassPanel className="glass-interactive rounded-[2rem] p-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          {note.isPinned ? "置顶笔记" : "笔记"}
        </p>
        <p className="text-sm text-slate-500">
          {formatArticleDate(note.publishedAt)}
        </p>
      </div>
      <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
        <Link href={`/notes/${note.slug}`}>{note.title}</Link>
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
        {note.excerpt}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {note.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-white/70 bg-white/60 px-3 py-2 text-sm text-slate-700"
          >
            {tag}
          </span>
        ))}
      </div>
    </LiquidGlassPanel>
  );
}
