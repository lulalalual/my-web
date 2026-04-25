import { IPhoneShell } from "@/components/chrome/iphone-shell";
import { HomeStage } from "@/components/home/home-stage";
import { LiquidGlassPanel } from "@/components/chrome/liquid-glass-panel";

export function HomeHero() {
  return (
    <section className="mx-auto grid max-w-[1350px] gap-10 xl:min-h-[calc(100vh-7rem)] xl:grid-cols-2 xl:items-center xl:gap-16">
      <div className="order-2 max-w-2xl space-y-7 xl:order-1">
        <LiquidGlassPanel className="inline-flex items-center gap-3 rounded-full px-4 py-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-sky-300 via-blue-400 to-cyan-300 text-lg font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
            L
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">
              lulalalual
            </p>
            <p className="text-sm text-slate-700">Owner-only GitHub studio</p>
          </div>
        </LiquidGlassPanel>

        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-slate-500">
            Apple Toy-Like Portfolio
          </p>
          <h1 className="max-w-2xl text-[3.25rem] font-semibold leading-[0.96] tracking-[-0.05em] text-slate-950 md:text-[4.8rem]">
            iPhone-styled 3D journeys for projects and notes.
          </h1>
          <p className="max-w-xl text-lg leading-8 text-slate-600 md:text-[1.16rem]">
            A liquid-glass personal site where a tiny character auto-runs
            through your achievements, unlocks projects, and leads visitors
            into a private Markdown studio behind GitHub login.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-slate-600">
          <span className="glass-panel inline-flex rounded-full px-4 py-2">
            React Three Fiber stage
          </span>
          <span className="glass-panel inline-flex rounded-full px-4 py-2">
            GitHub OAuth owner gate
          </span>
          <span className="glass-panel inline-flex rounded-full px-4 py-2">
            Vercel + Supabase
          </span>
        </div>

        <div className="grid max-w-xl gap-4 md:grid-cols-2">
          <LiquidGlassPanel className="glass-interactive rounded-[2rem] px-5 py-5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-200 to-blue-500 text-xl text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              ◫
            </div>
            <p className="text-xl font-semibold text-slate-900">Projects</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              计算机面试大师与塔防双人会按关卡自动解锁展示。
            </p>
          </LiquidGlassPanel>
          <LiquidGlassPanel className="glass-interactive rounded-[2rem] px-5 py-5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-lime-100 to-lime-300 text-xl text-lime-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              ☰
            </div>
            <p className="text-xl font-semibold text-slate-900">Notes</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Markdown 在线编辑、发布与管理，只允许你的 GitHub 账号写入。
            </p>
          </LiquidGlassPanel>
        </div>
      </div>

      <div className="order-1 flex justify-center xl:order-2 xl:justify-end">
        <div className="w-full max-w-[470px]">
          <IPhoneShell>
            <HomeStage />
          </IPhoneShell>
        </div>
      </div>
    </section>
  );
}
