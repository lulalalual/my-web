"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import type { StudioSettingsRecord } from "@/lib/data/studio";

export function SettingsForm({ settings }: { settings: StudioSettingsRecord }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState(settings);

  function updateField<K extends keyof StudioSettingsRecord>(
    key: K,
    value: StudioSettingsRecord[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const response = await fetch("/api/studio/settings", {
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

    setMessage("站点设置已更新。");
    startTransition(() => router.refresh());
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <input
        className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
        value={form.heroTitle}
        onChange={(event) => updateField("heroTitle", event.target.value)}
        placeholder="Hero title"
      />
      <textarea
        className="min-h-[120px] rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4 text-white outline-none"
        value={form.heroSubtitle}
        onChange={(event) => updateField("heroSubtitle", event.target.value)}
        placeholder="Hero subtitle"
      />
      <textarea
        className="min-h-[180px] rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4 font-mono text-sm text-white outline-none"
        value={form.socialLinks}
        onChange={(event) => updateField("socialLinks", event.target.value)}
        placeholder='[{"label":"GitHub","href":"https://github.com/lulalalual"}]'
      />
      <input
        className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
        value={form.projectOrder}
        onChange={(event) => updateField("projectOrder", event.target.value)}
        placeholder="interview-master,tower-defense-duo"
      />

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-400">{message ?? "Site settings"}</p>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {saving ? "Saving..." : "Save settings"}
        </button>
      </div>
    </form>
  );
}
