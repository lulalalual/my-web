import { hasSupabaseEnv } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type SocialLinkRecord = {
  label: string;
  href: string;
};

export type PublicSiteSettings = {
  heroTitle: string;
  heroSubtitle: string;
  socialLinks: SocialLinkRecord[];
  projectOrder: string[];
};

const fallbackSiteSettings: PublicSiteSettings = {
  heroTitle: "像 iPhone 一样展示项目与笔记的 3D 个人网站。",
  heroSubtitle:
    "这是一个带液态玻璃质感的个人网站，小人会自动穿过关卡，依次展示你的项目成果，并引导访问者进入只属于你的 Markdown 写作后台。",
  socialLinks: [
    {
      label: "GitHub",
      href: "https://github.com/lulalalual",
    },
  ],
  projectOrder: ["interview-master", "tower-defense-duo"],
};

export async function getPublicSiteSettings() {
  if (!hasSupabaseEnv()) {
    return fallbackSiteSettings;
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return fallbackSiteSettings;
  }

  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) {
    return fallbackSiteSettings;
  }

  return {
    heroTitle: data.hero_title || fallbackSiteSettings.heroTitle,
    heroSubtitle: data.hero_subtitle || fallbackSiteSettings.heroSubtitle,
    socialLinks: Array.isArray(data.social_links)
      ? (data.social_links.filter(
          (item: unknown): item is SocialLinkRecord =>
            typeof item === "object" &&
            item !== null &&
            "label" in item &&
            "href" in item &&
            typeof item.label === "string" &&
            typeof item.href === "string",
        ) as SocialLinkRecord[])
      : fallbackSiteSettings.socialLinks,
    projectOrder:
      data.project_order.length > 0
        ? data.project_order
        : fallbackSiteSettings.projectOrder,
  } satisfies PublicSiteSettings;
}
