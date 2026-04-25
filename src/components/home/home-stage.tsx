"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, Float, PerspectiveCamera } from "@react-three/drei";
import { StageControls } from "@/components/home/stage-controls";
import { StageScene } from "@/components/home/stage-scene";
import { useStageTimeline } from "@/components/home/scene/use-stage-timeline";

type StageCard = {
  title: string;
  subtitle: string;
};

type HomeStageProps = {
  projectCards?: StageCard[];
};

export function HomeStage({ projectCards }: HomeStageProps) {
  const timeline = useStageTimeline();

  return (
    <div className="relative h-[780px] overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.96),_rgba(202,228,255,0.96)_32%,_rgba(188,221,255,0.92)_58%,_rgba(231,244,255,0.94)_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(255,255,255,0.9),transparent_18%),radial-gradient(circle_at_82%_24%,rgba(255,255,255,0.72),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0)_26%,rgba(255,255,255,0.3)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(180deg,rgba(229,243,255,0),rgba(210,231,255,0.55)_50%,rgba(210,231,255,0.88)_100%)]" />
      <Canvas className="absolute inset-0" shadows dpr={[1, 1.8]}>
        <PerspectiveCamera makeDefault position={[0, 1.95, 4.9]} fov={36} />
        <Float floatIntensity={0.2} rotationIntensity={0.05}>
          <StageScene progress={timeline.progress} />
        </Float>
        <ContactShadows position={[0, -1.68, 0]} opacity={0.4} scale={8.5} blur={2.8} far={3.4} />
      </Canvas>
      <StageControls {...timeline} projectCards={projectCards} />
    </div>
  );
}
