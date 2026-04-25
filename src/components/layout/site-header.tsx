import Link from "next/link";
import { LiquidGlassPanel } from "@/components/chrome/liquid-glass-panel";
import { SiteNav } from "@/components/layout/site-nav";
import { siteTitle } from "@/lib/constants";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 px-4 py-4 md:px-8">
      <LiquidGlassPanel className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/" className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-700">
          {siteTitle}
        </Link>
        <SiteNav />
      </LiquidGlassPanel>
    </header>
  );
}
