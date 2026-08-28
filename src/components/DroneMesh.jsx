import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

export function DroneMesh({ drone }) {
  const groupRef = useRef();
  const ringRef = useRef();
  const engineRef = useRef();

  // Randomize start phase for organic movement
  const randomOffset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      // Hovering movement
      groupRef.current.position.y = 2 + Math.sin(time * drone.baseSpeed + randomOffset) * 0.5;
      
      // Orbiting around base (0,0,0) slowly
      const radius = Math.sqrt(drone.x * drone.x + drone.z * drone.z) || 5;
      const angle = time * (drone.baseSpeed * 0.2) + randomOffset;
      groupRef.current.position.x = Math.cos(angle) * radius;
      groupRef.current.position.z = Math.sin(angle) * radius;
      
      // Drone looks towards where it's going
      groupRef.current.rotation.y = -angle;
    }
    
    if (ringRef.current) {
      ringRef.current.rotation.x += delta * 2;
      ringRef.current.rotation.y += delta * 3;
    }

    if (engineRef.current) {
      engineRef.current.intensity = 1.5 + Math.sin(state.clock.elapsedTime * 10) * 0.5;
    }
  });

  const color = drone.level > 10 ? '#ff9100' : drone.level > 5 ? '#a855f7' : '#00e5ff';

  return (
    <group ref={groupRef} position={[drone.x, 2, drone.z]} scale={0.6 + drone.level * 0.02}>
      {/* Drone Core */}
      <mesh castShadow receiveShadow>
        <octahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color="#1a202c" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Engine Glow */}
      <mesh position={[0, -0.4, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} />
        <pointLight ref={engineRef} color={color} distance={4} intensity={2} />
      </mesh>

      {/* Rotating Ring */}
      <mesh ref={ringRef} castShadow>
        <torusGeometry args={[0.8, 0.05, 16, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}
