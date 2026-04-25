import { RoundedBox, Sparkles } from "@react-three/drei";
import { Character } from "@/components/home/scene/character";
import { Platform } from "@/components/home/scene/platform";
import { Spotlight } from "@/components/home/scene/spotlight";

type StageSceneProps = {
  progress: number;
};

function interpolatePath(progress: number): [number, number, number] {
  if (progress < 0.34) {
    return [-1.95 + progress * 3.6, 0.18, 0.56];
  }

  if (progress < 0.48) {
    return [-0.75 + (progress - 0.34) * 1.7, 0.52, 0.32];
  }

  if (progress < 0.72) {
    return [-0.52 + (progress - 0.48) * 3.45, 0.18, 0.56];
  }

  return [0.26 + (progress - 0.72) * 2.45, 0.18, 0.52];
}

export function StageScene({ progress }: StageSceneProps) {
  const characterPosition = interpolatePath(progress);

  return (
    <group position={[0, -1.22, 0]}>
      <color attach="background" args={["#d9ebff"]} />
      <ambientLight intensity={2.2} />
      <directionalLight position={[4, 7, 6]} intensity={2.8} color="#ffffff" />
      <directionalLight position={[-4, 4, 3]} intensity={1.1} color="#dff6ff" />
      <pointLight position={[0, 2.4, 1.6]} intensity={24} distance={7} color="#ffffff" />

      <Sparkles
        count={42}
        scale={[7.2, 3.8, 4]}
        size={3.6}
        speed={0.24}
        color="#f8fdff"
        position={[0, 1.8, -0.5]}
      />

      <mesh position={[0, -0.74, -1.7]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8.8, 5.4]} />
        <meshStandardMaterial color="#d8ebff" roughness={0.88} />
      </mesh>

      <mesh position={[-2.45, 2.18, -1.66]}>
        <sphereGeometry args={[0.88, 32, 32]} />
        <meshStandardMaterial color="#f7fbff" roughness={0.95} />
      </mesh>
      <mesh position={[-1.62, 1.92, -1.46]}>
        <sphereGeometry args={[0.64, 32, 32]} />
        <meshStandardMaterial color="#f7fbff" roughness={0.95} />
      </mesh>
      <mesh position={[2.2, 2.02, -1.36]}>
        <sphereGeometry args={[0.74, 32, 32]} />
        <meshStandardMaterial color="#f7fbff" roughness={0.95} />
      </mesh>
      <mesh position={[2.88, 2.18, -1.44]}>
        <sphereGeometry args={[0.96, 32, 32]} />
        <meshStandardMaterial color="#f7fbff" roughness={0.95} />
      </mesh>

      <mesh position={[0.14, -0.26, -0.18]}>
        <cylinderGeometry args={[2.7, 2.98, 0.26, 64]} />
        <meshStandardMaterial color="#d5ebff" roughness={0.42} metalness={0.06} />
      </mesh>
      <mesh position={[0.14, -0.16, -0.18]}>
        <torusGeometry args={[2.18, 0.12, 32, 120]} />
        <meshStandardMaterial color="#f8fcff" roughness={0.24} metalness={0.12} />
      </mesh>

      <Platform position={[0.14, -0.04, 0.18]} scale={[5.2, 0.28, 1.92]} color="#d9efff" />
      <Platform position={[-1.98, 0.04, 0.56]} scale={[0.76, 0.18, 0.76]} color="#f9fdff" />
      <Platform position={[-1.32, 0.04, 0.56]} scale={[0.76, 0.18, 0.76]} color="#f9fdff" />
      <Platform position={[-0.66, 0.04, 0.56]} scale={[0.76, 0.18, 0.76]} color="#f9fdff" />
      <Platform position={[0, 0.04, 0.56]} scale={[0.76, 0.18, 0.76]} color="#f9fdff" />
      <Platform position={[0.66, 0.04, 0.56]} scale={[0.76, 0.18, 0.76]} color="#f9fdff" />

      <RoundedBox args={[0.58, 0.26, 0.58]} radius={0.08} position={[-0.46, 0.2, 0.26]}>
        <meshPhysicalMaterial
          color="#97dfff"
          transparent
          opacity={0.9}
          roughness={0.08}
          transmission={0.92}
          thickness={1.4}
        />
      </RoundedBox>
      <RoundedBox args={[0.58, 0.26, 0.58]} radius={0.08} position={[1.14, -0.04, 0.36]}>
        <meshPhysicalMaterial
          color="#bbff9e"
          transparent
          opacity={0.9}
          roughness={0.08}
          transmission={0.92}
          thickness={1.4}
        />
      </RoundedBox>
      <group position={[1.72, 0.02, 0.42]} rotation={[0, 0, 0.62]}>
        <RoundedBox args={[0.14, 0.86, 0.14]} radius={0.04}>
          <meshStandardMaterial color="#c7ef82" roughness={0.48} />
        </RoundedBox>
        <RoundedBox args={[0.14, 0.86, 0.14]} radius={0.04} position={[0.28, 0, 0]}>
          <meshStandardMaterial color="#c7ef82" roughness={0.48} />
        </RoundedBox>
        <RoundedBox args={[0.42, 0.12, 0.14]} radius={0.04} position={[0.14, -0.18, 0]}>
          <meshStandardMaterial color="#c7ef82" roughness={0.48} />
        </RoundedBox>
      </group>

      <mesh position={[-0.1, 0.8, -0.38]} rotation={[-0.2, 0, 0]}>
        <torusGeometry args={[0.84, 0.04, 16, 80]} />
        <meshStandardMaterial color="#5aa7ff" emissive="#c7e6ff" emissiveIntensity={0.68} />
      </mesh>
      <mesh position={[2.02, 0.62, -0.22]} rotation={[-0.24, 0, 0]}>
        <torusGeometry args={[0.74, 0.04, 16, 80]} />
        <meshStandardMaterial color="#b9ef65" emissive="#e8ffba" emissiveIntensity={0.72} />
      </mesh>

      <Spotlight position={[-0.1, 0.4, -0.38]} />
      <Spotlight position={[1.96, 0.08, -0.22]} />

      <group position={[-0.08, 0.76, -0.38]}>
        <RoundedBox args={[1.16, 0.94, 0.1]} radius={0.14}>
          <meshPhysicalMaterial
            color="#101827"
            roughness={0.18}
            metalness={0.22}
            transmission={0.08}
          />
        </RoundedBox>
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[0.92, 0.64]} />
          <meshBasicMaterial color="#69b3ff" transparent opacity={0.88} />
        </mesh>
      </group>

      <group position={[1.96, 0.38, -0.22]}>
        <RoundedBox args={[1.04, 0.84, 0.1]} radius={0.14}>
          <meshPhysicalMaterial
            color="#182033"
            roughness={0.18}
            metalness={0.22}
            transmission={0.08}
          />
        </RoundedBox>
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[0.82, 0.56]} />
          <meshBasicMaterial color="#d2ff8d" transparent opacity={0.86} />
        </mesh>
      </group>

      <Character position={characterPosition} />
    </group>
  );
}
