import type { PublicNoteRecord } from "@/lib/data/notes";
import { NoteCard } from "@/components/notes/note-card";

export function NoteList({ notes }: { notes: PublicNoteRecord[] }) {
  return (
    <div className="grid gap-5">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
}
