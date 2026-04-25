"use client";

import clsx from "clsx";

type ProjectPedestalCardProps = {
  title: string;
  subtitle: string;
  accent: "blue" | "lime";
  active: boolean;
};

export function ProjectPedestalCard({
  title,
  subtitle,
  accent,
  active,
}: ProjectPedestalCardProps) {
  return (
    <div
      className={clsx(
        "glass-panel w-full rounded-[2rem] border border-white/70 px-4 py-4 transition duration-300",
        active
          ? "translate-y-0 border-white/80 opacity-100 shadow-[0_28px_72px_rgba(15,23,42,0.18)]"
          : "translate-y-2 opacity-75",
      )}
    >
      <div
        className={clsx(
          "mb-4 inline-flex h-12 w-12 items-center justify-center rounded-[1.2rem] text-sm font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]",
          accent === "blue"
            ? "bg-gradient-to-br from-sky-200 to-blue-500 text-white"
            : "bg-gradient-to-br from-lime-100 to-lime-300 text-lime-800",
        )}
      >
        {accent === "blue" ? "AI" : "TD"}
      </div>
      <p className="text-lg font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>
      <div className="mt-5 flex items-center justify-between">
        <div className="rounded-full border border-white/70 bg-white/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          Level Card
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/55 text-lime-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
          ▶
        </div>
      </div>
    </div>
  );
}
