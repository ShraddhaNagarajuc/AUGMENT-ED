import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { Float, OrbitControls } from "@react-three/drei";

// --- Components ---

const Atom = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Spin logic
      groupRef.current.rotation.y += 0.005;
      groupRef.current.rotation.x += 0.002;
    }
  });

  return (
    <group ref={groupRef} scale={0.6}>
      {/* Core */}
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={3} toneMapped={false} />
        <pointLight distance={5} intensity={5} color="#00ff88" />
      </mesh>

      {/* Electron Rings */}
      <group>
        {/* Ring 1 */}
        <group rotation={[Math.PI / 3, 0, 0]}>
          <mesh>
            <torusGeometry args={[2.5, 0.05, 16, 100]} />
            <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={2} transparent opacity={0.6} toneMapped={false} />
          </mesh>
          <mesh position={[2.5, 0, 0]}>
            <sphereGeometry args={[0.15]} />
            <meshStandardMaterial color="#00ccff" emissive="white" emissiveIntensity={2} toneMapped={false} />
          </mesh>
        </group>

        {/* Ring 2 */}
        <group rotation={[-Math.PI / 3, 0, 0]}>
          <mesh>
            <torusGeometry args={[2.5, 0.05, 16, 100]} />
            <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={2} transparent opacity={0.6} toneMapped={false} />
          </mesh>
          <mesh position={[2.5, 0, 0]}>
            <sphereGeometry args={[0.15]} />
            <meshStandardMaterial color="#00ccff" emissive="white" emissiveIntensity={2} toneMapped={false} />
          </mesh>
        </group>

        {/* Ring 3 */}
        <group rotation={[0, Math.PI / 2, 0]}>
          <mesh>
            <torusGeometry args={[2.5, 0.05, 16, 100]} />
            <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={2} transparent opacity={0.6} toneMapped={false} />
          </mesh>
          <mesh position={[2.5, 0, 0]}>
            <sphereGeometry args={[0.15]} />
            <meshStandardMaterial color="#00ccff" emissive="white" emissiveIntensity={2} toneMapped={false} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

// --- Scene Manager ---

const StoryScene = () => {
  return (
    <group position={[3.5, 0, 0]}> {/* Position shifted to right */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Atom />
      </Float>
    </group>
  );
};

export const ARStoryAnimation = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      <Canvas camera={{ position: [0, 0, 10], fov: 35 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <StoryScene />
      </Canvas>
    </div>
  );
};
