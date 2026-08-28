import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from 'zustand';

export function MachineMesh({ machine }) {
  const groupRef = useRef();
  const rotorRef = useRef();
  const lightRef = useRef();

  useFrame((state, delta) => {
    if (rotorRef.current) {
      // Speed of rotation based on level
      rotorRef.current.rotation.y += delta * (1 + machine.level * 0.1);
    }
    if (lightRef.current) {
      // Pulse effect
      lightRef.current.intensity = 2 + Math.sin(state.clock.elapsedTime * 2) * 1;
    }
  });

  // Calculate visuals based on level
  const color = useMemo(() => {
    if (machine.level < 5) return '#3b82f6'; // Blue
    if (machine.level < 15) return '#8b5cf6'; // Purple
    if (machine.level < 30) return '#ec4899'; // Pink
    return '#f59e0b'; // Gold/Orange
  }, [machine.level]);

  const scale = 1 + (machine.level * 0.02);

  return (
    <group ref={groupRef} position={machine.position} scale={[scale, scale, scale]}>
      {/* Base */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 1, 1.5]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} metalness={0.5} />
      </mesh>
      
      {/* Rotor/Moving Part */}
      <mesh ref={rotorRef} position={[0, 1.25, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.5, 8]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Energy Core / Glow */}
      <mesh position={[0, 1.8, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={2} 
          toneMapped={false} 
        />
        <pointLight ref={lightRef} color={color} distance={3} intensity={2} />
      </mesh>

      {/* Conveyor connection (visual detail) */}
      <mesh position={[1, 0.25, 0]} receiveShadow>
        <boxGeometry args={[0.5, 0.2, 0.8]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
    </group>
  );
}
