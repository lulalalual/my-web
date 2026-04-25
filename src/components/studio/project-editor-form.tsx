"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import type { StudioProjectRecord } from "@/lib/data/studio";

export function ProjectEditorForm({ project }: { project: StudioProjectRecord }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: project.title,
    slug: project.slug,
    summary: project.summary,
    description: project.description,
    techStack: project.techStack.join("\n"),
    highlights: project.highlights.join("\n"),
    repoUrl: project.repoUrl ?? "",
    demoUrl: project.demoUrl ?? "",
    orderIndex: String(project.orderIndex),
    isPublished: project.isPublished,
  });

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const response = await fetch(`/api/studio/projects/${project.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const payload = await response.json().catch(() => null);

    setSaving(false);

    if (!response.ok) {
      setMessage(payload?.error ?? "保存失败。");
      return;
    }

    setMessage("项目已更新。");
    startTransition(() => router.refresh());
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel rounded-[2rem] border-white/10 bg-white/8 p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-white">{project.title}</h2>
        <label className="text-sm text-slate-300">
          <input
            type="checkbox"
            className="mr-2"
            checked={form.isPublished}
            onChange={(event) => updateField("isPublished", event.target.checked)}
          />
          已发布
        </label>
      </div>

      <div className="mt-5 grid gap-4">
        <input
          className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
        />
        <input
          className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
          value={form.slug}
          onChange={(event) => updateField("slug", event.target.value as StudioProjectRecord["slug"])}
        />
        <textarea
          className="min-h-[96px] rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4 text-white outline-none"
          value={form.summary}
          onChange={(event) => updateField("summary", event.target.value)}
        />
        <textarea
          className="min-h-[180px] rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4 text-white outline-none"
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <textarea
            className="min-h-[180px] rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4 text-white outline-none"
            value={form.techStack}
            onChange={(event) => updateField("techStack", event.target.value)}
          />
          <textarea
            className="min-h-[180px] rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4 text-white outline-none"
            value={form.highlights}
            onChange={(event) => updateField("highlights", event.target.value)}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <input
            className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
            placeholder="仓库链接"
            value={form.repoUrl}
            onChange={(event) => updateField("repoUrl", event.target.value)}
          />
          <input
            className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
            placeholder="演示链接"
            value={form.demoUrl}
            onChange={(event) => updateField("demoUrl", event.target.value)}
          />
          <input
            className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
            placeholder="排序"
            value={form.orderIndex}
            onChange={(event) => updateField("orderIndex", event.target.value)}
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-sm text-slate-400">{message ?? "项目编辑器"}</p>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {saving ? "保存中..." : "保存项目"}
        </button>
      </div>
    </form>
  );
}
