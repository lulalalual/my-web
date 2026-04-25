import Link from "next/link";
import { getStudioNotes } from "@/lib/data/studio";

export default async function StudioNotesPage() {
  const notes = await getStudioNotes();

  return (
    <main className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Studio Notes</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
            管理你的 Markdown 笔记
          </h1>
        </div>
        <Link
          href="/studio/notes/new"
          className="rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-950"
        >
          New note
        </Link>
      </div>

      <div className="grid gap-4">
        {notes.map((note) => (
          <Link
            key={note.id}
            href={`/studio/notes/${note.id}`}
            className="glass-panel rounded-[1.8rem] border-white/10 bg-white/8 px-5 py-5"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold text-white">{note.title}</h2>
              <span className="text-sm text-slate-400">{note.status}</span>
            </div>
            <p className="mt-3 text-slate-300">{note.excerpt}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
