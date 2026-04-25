import Link from "next/link";
import { LiquidGlassPanel } from "@/components/chrome/liquid-glass-panel";

const studioLinks = [
  { href: "/studio", label: "总览" },
  { href: "/studio/notes", label: "笔记" },
  { href: "/studio/projects", label: "项目" },
  { href: "/studio/settings", label: "设置" },
] as const;

export function StudioSidebar() {
  return (
    <aside className="w-full max-w-xs">
      <LiquidGlassPanel className="rounded-[2rem] border-white/10 bg-white/8 p-4">
        <p className="px-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          后台
        </p>
        <nav className="mt-3 grid gap-2">
          {studioLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-[1.2rem] px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </LiquidGlassPanel>
    </aside>
  );
}
