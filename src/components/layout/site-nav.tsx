import Link from "next/link";
import { siteNavigation } from "@/lib/constants";

export function SiteNav() {
  return (
    <nav aria-label="Primary" className="flex items-center gap-2">
      {siteNavigation.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-full px-4 py-2 text-sm text-slate-600 transition hover:bg-white/60 hover:text-slate-950"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
