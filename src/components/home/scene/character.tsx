type CharacterProps = {
  position: [number, number, number];
};

export function Character({ position }: CharacterProps) {
  return (
    <group position={position}>
      <mesh position={[0, 0.52, 0]}>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial color="#fffdf6" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <capsuleGeometry args={[0.2, 0.34, 8, 16]} />
        <meshStandardMaterial color="#2450a6" roughness={0.55} />
      </mesh>
      <mesh position={[-0.12, -0.18, 0.02]} rotation={[0.2, 0, -0.15]}>
        <capsuleGeometry args={[0.06, 0.22, 8, 16]} />
        <meshStandardMaterial color="#dce7f7" roughness={0.5} />
      </mesh>
      <mesh position={[0.12, -0.18, 0.02]} rotation={[-0.28, 0, 0.18]}>
        <capsuleGeometry args={[0.06, 0.22, 8, 16]} />
        <meshStandardMaterial color="#dce7f7" roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.34, 0.08]}>
        <capsuleGeometry args={[0.08, 0.26, 8, 16]} />
        <meshStandardMaterial color="#f9fbff" roughness={0.45} />
      </mesh>
    </group>
  );
}
