import { Sparkles } from "@react-three/drei";

type SpotlightProps = {
  position: [number, number, number];
};

export function Spotlight({ position }: SpotlightProps) {
  return (
    <group position={position}>
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.75, 1.1, 0.12, 48]} />
        <meshStandardMaterial color="#eef6ff" roughness={0.22} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.5, 0.62, 1.06, 48]} />
        <meshPhysicalMaterial
          color="#eef7ff"
          transparent
          opacity={0.5}
          roughness={0.05}
          transmission={0.92}
          thickness={1.2}
        />
      </mesh>
      <Sparkles
        count={18}
        scale={[1.2, 1.2, 1.2]}
        size={3}
        speed={0.3}
        position={[0, 0.6, 0]}
        color="#d9ff7a"
      />
    </group>
  );
}
