import { NoteList } from "@/components/notes/note-list";
import { getPublishedNotes } from "@/lib/data/notes";

export default async function NotesIndexPage() {
  const notes = await getPublishedNotes();

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <section className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
          笔记
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-slate-950 md:text-6xl">
          像 iPhone 备忘录，但为技术内容而设计。
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          支持 Markdown 在线编辑、发布与管理。当前在未接 Supabase 时会先展示本地默认文章，便于你直接看站点效果。
        </p>
      </section>

      <NoteList notes={notes} />
    </main>
  );
}
