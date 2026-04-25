import Link from "next/link";
import { LiquidGlassPanel } from "@/components/chrome/liquid-glass-panel";
import { getPublicSiteSettings } from "@/lib/data/site-settings";

export async function SiteFooter() {
  const settings = await getPublicSiteSettings();

  return (
    <footer className="px-4 pb-8 pt-2 md:px-8">
      <LiquidGlassPanel className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <p>Apple-styled portfolio shell with owner-only Markdown studio.</p>
        <div className="flex flex-wrap gap-3">
          {settings.socialLinks.map((item) => (
            <Link
              key={`${item.label}-${item.href}`}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="text-slate-600 transition hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </LiquidGlassPanel>
    </footer>
  );
}
