import { SettingsForm } from "@/components/studio/settings-form";
import { getStudioSettings } from "@/lib/data/studio";

export default async function StudioSettingsPage() {
  const settings = await getStudioSettings();

  return (
    <main className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Studio Settings</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
          管理首页文案与站点设置
        </h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          这些字段会直接驱动首页 Hero、页脚社交链接，以及首页项目的展示顺序。
        </p>
      </div>
      <SettingsForm settings={settings} />
    </main>
  );
}
