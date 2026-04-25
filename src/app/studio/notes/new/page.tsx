import { NoteEditorForm } from "@/components/studio/note-editor-form";

export default function StudioNewNotePage() {
  return (
    <main className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Studio Notes</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
          新建笔记
        </h1>
      </div>
      <NoteEditorForm />
    </main>
  );
}
