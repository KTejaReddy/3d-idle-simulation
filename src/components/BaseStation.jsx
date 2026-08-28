import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export function BaseStation({ planetColor }) {
  const coreRef = useRef();
  const antennaRef = useRef();

  useFrame((state, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.y -= delta * 0.5;
    }
    if (antennaRef.current) {
      // pulsing glow on antenna
      antennaRef.current.intensity = 2 + Math.sin(state.clock.elapsedTime * 4) * 1;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Main Base structure */}
      <mesh position={[0, 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3, 4, 4, 8]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Glowing Core inside Base */}
      <mesh ref={coreRef} position={[0, 2.5, 0]}>
        <torusKnotGeometry args={[1.5, 0.2, 64, 16]} />
        <meshStandardMaterial color={planetColor} emissive={planetColor} emissiveIntensity={1.5} toneMapped={false} />
      </mesh>

      {/* Antenna Spire */}
      <mesh position={[0, 5.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.3, 3, 8]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>
      
      {/* Antenna Beacon */}
      <mesh position={[0, 7.1, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={2} toneMapped={false} />
        <pointLight ref={antennaRef} color="#00e5ff" intensity={2} distance={10} />
      </mesh>

      {/* Landing Pad Base */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[8, 8, 0.2, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.2, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <ringGeometry args={[7, 7.5, 32]} />
        <meshBasicMaterial color={planetColor} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}
