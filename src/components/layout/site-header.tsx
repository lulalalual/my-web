import Link from "next/link";
import { LiquidGlassPanel } from "@/components/chrome/liquid-glass-panel";
import { SiteNav } from "@/components/layout/site-nav";
import { getPublicSiteSettings } from "@/lib/data/site-settings";
import { siteTitle } from "@/lib/constants";

export async function SiteHeader() {
  const settings = await getPublicSiteSettings();
  const primaryLink = settings.socialLinks[0];

  return (
    <header className="sticky top-0 z-20 px-4 py-4 md:px-8">
      <LiquidGlassPanel className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-700">
            {siteTitle}
          </Link>
          {primaryLink ? (
            <Link
              href={primaryLink.href}
              target="_blank"
              rel="noreferrer"
              className="hidden text-xs uppercase tracking-[0.22em] text-slate-500 md:inline-flex"
            >
              {primaryLink.label}
            </Link>
          ) : null}
        </div>
        <SiteNav />
      </LiquidGlassPanel>
    </header>
  );
}
