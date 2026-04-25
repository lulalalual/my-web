import { RoundedBox } from "@react-three/drei";

type PlatformProps = {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
};

export function Platform({ position, scale, color }: PlatformProps) {
  return (
    <RoundedBox args={[1, 1, 1]} position={position} scale={scale} radius={0.12}>
      <meshStandardMaterial color={color} roughness={0.45} metalness={0.12} />
    </RoundedBox>
  );
}
