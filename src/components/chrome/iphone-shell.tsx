import type { ReactNode } from "react";

export function IPhoneShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[430px] rounded-[3rem] border border-white/60 bg-white/30 p-3 shadow-[var(--shadow)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute left-1/2 top-3 h-7 w-28 -translate-x-1/2 rounded-full bg-slate-950/90" />
      <div className="overflow-hidden rounded-[2.4rem] border border-white/50 bg-white/40">
        {children}
      </div>
      <div className="mx-auto mt-3 h-1.5 w-28 rounded-full bg-slate-900/70" />
    </div>
  );
}
