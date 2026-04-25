"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import type { StudioNoteRecord } from "@/lib/data/studio";

type NoteEditorFormProps = {
  note?: StudioNoteRecord | null;
};

export function NoteEditorForm({ note }: NoteEditorFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: note?.title ?? "",
    slug: note?.slug ?? "",
    excerpt: note?.excerpt ?? "",
    tags: note?.tags.join(", ") ?? "",
    status: note?.status ?? "draft",
    isPinned: note?.isPinned ?? false,
    publishedAt: note?.publishedAt?.slice(0, 16) ?? "",
    contentMarkdown: note?.contentMarkdown ?? "# New note",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const response = await fetch(
      note ? `/api/studio/notes/${note.id}` : "/api/studio/notes",
      {
        method: note ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      },
    );

    const payload = await response.json().catch(() => null);

    setSaving(false);

    if (!response.ok) {
      setMessage(payload?.error ?? "保存失败。");
      return;
    }

    setMessage("已保存。");

    startTransition(() => {
      router.refresh();
      if (!note && payload?.id) {
        router.push(`/studio/notes/${payload.id}`);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <input
          className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
        />
        <input
          className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500"
          name="slug"
          placeholder="slug"
          value={form.slug}
          onChange={(event) => updateField("slug", event.target.value)}
        />
      </div>

      <textarea
        className="min-h-[96px] rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4 text-white outline-none placeholder:text-slate-500"
        name="excerpt"
        placeholder="Excerpt"
        value={form.excerpt}
        onChange={(event) => updateField("excerpt", event.target.value)}
      />

      <div className="grid gap-4 md:grid-cols-[1fr_180px_150px]">
        <input
          className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500"
          name="tags"
          placeholder="tags, comma separated"
          value={form.tags}
          onChange={(event) => updateField("tags", event.target.value)}
        />
        <input
          className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
          type="datetime-local"
          value={form.publishedAt}
          onChange={(event) => updateField("publishedAt", event.target.value)}
        />
        <select
          className="rounded-[1.4rem] border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
          value={form.status}
          onChange={(event) => updateField("status", event.target.value as "draft" | "published")}
        >
          <option value="draft">draft</option>
          <option value="published">published</option>
        </select>
      </div>

      <label className="inline-flex items-center gap-3 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={form.isPinned}
          onChange={(event) => updateField("isPinned", event.target.checked)}
        />
        Pin this note
      </label>

      <textarea
        className="min-h-[420px] rounded-[1.8rem] border border-white/10 bg-white/5 px-4 py-4 font-mono text-sm text-white outline-none"
        name="contentMarkdown"
        value={form.contentMarkdown}
        onChange={(event) => updateField("contentMarkdown", event.target.value)}
      />

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-400">{message ?? "Markdown-first editor"}</p>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {saving ? "Saving..." : "Save note"}
        </button>
      </div>
    </form>
  );
}
