"use client";

import { ProjectPedestalCard } from "@/components/home/project-pedestal-card";

type StageControlsProps = {
  progress: number;
  isPlaying: boolean;
  prefersReducedMotion?: boolean;
  activeProject: "interview" | "tower";
  projectCards?: Array<{
    title: string;
    subtitle: string;
  }>;
  setProgress: (progress: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  jumpTo: (stage: "interview" | "tower") => void;
  replay: () => void;
};

export function StageControls({
  progress,
  isPlaying,
  prefersReducedMotion,
  activeProject,
  projectCards,
  setProgress,
  setIsPlaying,
  jumpTo,
  replay,
}: StageControlsProps) {
  const cards = projectCards ?? [
    {
      title: "计算机面试大师",
      subtitle: "AI 模拟面试、代码编辑器与系统设计评审",
    },
    {
      title: "塔防双人",
      subtitle: "SDL2 双人塔防、波次、防御塔与升级机制",
    },
  ];

  return (
    <>
      <div className="pointer-events-none absolute inset-x-6 bottom-32 z-20 flex gap-3">
        <div className="pointer-events-auto flex-1">
          <ProjectPedestalCard
            title={cards[0]?.title ?? "计算机面试大师"}
            subtitle={cards[0]?.subtitle ?? "AI 模拟面试、代码编辑器与系统设计评审"}
            accent="blue"
            active={activeProject === "interview"}
          />
        </div>
        <div className="pointer-events-auto flex-1">
          <ProjectPedestalCard
            title={cards[1]?.title ?? "塔防双人"}
            subtitle={cards[1]?.subtitle ?? "SDL2 双人塔防、波次、防御塔与升级机制"}
            accent="lime"
            active={activeProject === "tower"}
          />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-4 top-4 z-20">
        <div className="glass-panel pointer-events-auto flex items-center justify-between rounded-[1.8rem] px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-slate-500">
              Auto Journey
            </p>
            <p className="mt-1 text-sm font-medium text-slate-800">
              {prefersReducedMotion
                ? "Reduced motion mode"
                : activeProject === "interview"
                  ? "Approaching 计算机面试大师"
                  : "Approaching 塔防双人"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.9)]" />
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={prefersReducedMotion}
              className="glass-interactive rounded-full border border-white/70 bg-white/55 px-4 py-2 text-sm font-medium text-slate-800"
            >
              {prefersReducedMotion ? "Static" : isPlaying ? "Pause" : "Play"}
            </button>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-4 bottom-4 z-20">
        <div className="glass-panel pointer-events-auto rounded-[2rem] px-4 py-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => jumpTo("interview")}
                className="glass-interactive rounded-full border border-white/70 bg-white/55 px-4 py-2 text-sm font-medium text-slate-700"
              >
                Interview
              </button>
              <button
                type="button"
                onClick={() => jumpTo("tower")}
                className="glass-interactive rounded-full border border-white/70 bg-white/55 px-4 py-2 text-sm font-medium text-slate-700"
              >
                Tower
              </button>
            </div>
            <button
              type="button"
              onClick={replay}
              className="glass-interactive rounded-full border border-white/70 bg-white/55 px-4 py-2 text-sm font-medium text-slate-700"
            >
              Replay
            </button>
          </div>
          <input
            type="range"
            min={0.08}
            max={0.92}
            step={0.01}
            value={progress}
            onChange={(event) => {
              setProgress(Number(event.target.value));
              setIsPlaying(false);
            }}
            className="h-2 w-full cursor-pointer accent-sky-500"
            aria-label="Stage progress"
          />
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
            <div className="flex h-12 items-center justify-center rounded-[1.4rem] border border-white/70 bg-gradient-to-br from-sky-50 to-sky-100 text-sky-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
              Projects
            </div>
            <div className="flex h-12 items-center justify-center rounded-[1.4rem] border border-white/70 bg-gradient-to-br from-lime-50 to-lime-100 text-lime-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
              Notes
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
