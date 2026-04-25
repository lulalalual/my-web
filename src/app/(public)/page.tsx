import { HomeHero } from "@/components/home/home-hero";
import { getPublishedProjects } from "@/lib/data/projects";
import { getPublicSiteSettings } from "@/lib/data/site-settings";

export default async function PublicHomePage() {
  const [settings, projects] = await Promise.all([
    getPublicSiteSettings(),
    getPublishedProjects(),
  ]);

  return (
    <main className="px-4 py-10 md:px-8 md:py-16">
      <HomeHero settings={settings} projects={projects} />
    </main>
  );
}
