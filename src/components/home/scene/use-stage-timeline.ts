"use client";

import { useEffect, useMemo, useState } from "react";

const projectStops = {
  interview: 0.35,
  tower: 0.74,
} as const;

function getStage(progress: number) {
  if (progress < 0.54) {
    return "interview" as const;
  }

  return "tower" as const;
}

export function useStageTimeline() {
  const [progress, setProgress] = useState(0.08);
  const [isPlaying, setIsPlaying] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
      if (mediaQuery.matches) {
        setIsPlaying(false);
      }
    };

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (!isPlaying || prefersReducedMotion) {
      return;
    }

    const id = window.setInterval(() => {
      setProgress((value) => {
        const next = value + 0.0045;
        return next >= 0.92 ? 0.08 : Number(next.toFixed(4));
      });
    }, 32);

    return () => window.clearInterval(id);
  }, [isPlaying, prefersReducedMotion]);

  const activeProject = useMemo(() => getStage(progress), [progress]);

  function jumpTo(stage: keyof typeof projectStops) {
    setProgress(projectStops[stage]);
    setIsPlaying(false);
  }

  function replay() {
    setProgress(0.08);
    setIsPlaying(true);
  }

  return {
    progress,
    isPlaying,
    activeProject,
    setProgress,
    setIsPlaying,
    jumpTo,
    replay,
    prefersReducedMotion,
  };
}
