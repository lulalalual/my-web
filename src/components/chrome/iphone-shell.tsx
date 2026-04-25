import type { ReactNode } from "react";

export function IPhoneShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[450px] rounded-[3.2rem] border border-white/70 bg-white/35 p-3 shadow-[0_36px_120px_rgba(15,23,42,0.18)] backdrop-blur-3xl">
      <div className="pointer-events-none absolute inset-x-8 top-8 h-12 rounded-full bg-white/35 blur-2xl" />
      <div className="pointer-events-none absolute left-1/2 top-3 h-7 w-28 -translate-x-1/2 rounded-full bg-slate-950/90 shadow-[0_8px_18px_rgba(15,23,42,0.35)]" />
      <div className="overflow-hidden rounded-[2.55rem] border border-white/60 bg-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
        {children}
      </div>
      <div className="mx-auto mt-3 h-1.5 w-28 rounded-full bg-slate-900/70" />
    </div>
  );
}
