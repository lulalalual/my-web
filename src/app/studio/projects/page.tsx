import { ProjectEditorForm } from "@/components/studio/project-editor-form";
import { getStudioProjects } from "@/lib/data/studio";

export default async function StudioProjectsPage() {
  const projects = await getStudioProjects();

  return (
    <main className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Studio Projects</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
          管理作品集项目
        </h1>
      </div>

      <div className="grid gap-5">
        {projects.map((project) => (
          <ProjectEditorForm key={project.id} project={project} />
        ))}
      </div>
    </main>
  );
}
