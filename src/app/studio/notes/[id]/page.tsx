import { notFound } from "next/navigation";
import { NoteEditorForm } from "@/components/studio/note-editor-form";
import { getStudioNoteById } from "@/lib/data/studio";

export default async function StudioNoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const note = await getStudioNoteById(id);

  if (!note) {
    notFound();
  }

  return (
    <main className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Studio Notes</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
          编辑笔记
        </h1>
      </div>
      <NoteEditorForm note={note} />
    </main>
  );
}
