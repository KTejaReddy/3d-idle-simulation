import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles, Float, Environment, ContactShadows } from '@react-three/drei';
import { useGameStore, VERSES, getGeneratorsForVerse } from '../store/gameStore';

function GeneratorMesh({ genData, verseInfo, index, total }) {
  const meshRef = useRef();
  
  // Arrange generators in a circle around the core
  const angle = (index / total) * Math.PI * 2;
  const radius = 6 + (index % 2) * 2; // Stagger radius
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01 + (index * 0.005);
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2 + index) * 0.3;
    }
  });

  // Calculate size based on generator count
  const scale = 0.5 + Math.min(genData.count * 0.05, 1.5);
  
  if (genData.count === 0) return null;

  return (
    <group position={[x, 0, z]}>
      {/* Tether to core */}
      <mesh position={[-x/2, 0, -z/2]} rotation={[0, -angle, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, radius, 8]} />
        <meshBasicMaterial color={verseInfo.color} transparent opacity={0.3} />
      </mesh>

      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh ref={meshRef} scale={scale}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial 
            color={verseInfo.color} 
            emissive={verseInfo.color} 
            emissiveIntensity={0.5} 
            roughness={0.2} 
            metalness={0.8} 
          />
        </mesh>
      </Float>
    </group>
  );
}

function VerseCore({ verseInfo }) {
  const coreRef = useRef();
  
  useFrame((state) => {
    if (coreRef.current) {
      coreRef.current.rotation.y -= 0.005;
      coreRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={coreRef} position={[0, 4, 0]}>
        <dodecahedronGeometry args={[2.5, 0]} />
        <meshStandardMaterial 
          color={verseInfo.color} 
          emissive={verseInfo.color} 
          emissiveIntensity={0.2} 
          roughness={0.1} 
          metalness={0.5} 
        />
        <pointLight color={verseInfo.color} intensity={5} distance={30} />
      </mesh>
    </Float>
  );
}

function SceneContent() {
  const currentVerse = useGameStore((state) => state.currentVerse);
  const rawGenerators = useGameStore((state) => state.generators);
  
  const generators = useMemo(() => {
    return getGeneratorsForVerse(currentVerse).map(t => {
      const count = rawGenerators[t.id] || 0;
      const cost = Math.floor(t.baseCost * Math.pow(1.15, count));
      return { ...t, count, cost };
    });
  }, [currentVerse, rawGenerators]);
  
  const verseInfo = useMemo(() => VERSES.find(v => v.id === currentVerse), [currentVerse]);

  // Derive light colors to be bright and stylized
  const isDark = ['space', 'horror', 'underground'].includes(verseInfo.id);

  return (
    <>
      <color attach="background" args={[isDark ? '#111827' : '#f0f9ff']} />
      <fog attach="fog" args={[isDark ? '#111827' : '#f0f9ff', 15, 60]} />
      
      <ambientLight intensity={isDark ? 0.4 : 0.8} />
      <directionalLight position={[10, 20, 10]} intensity={1.5} color="#ffffff" castShadow shadow-mapSize={[1024, 1024]} />

      {/* Atmospheric Particles matching Verse */}
      <Sparkles 
        count={200} 
        scale={40} 
        size={6} 
        speed={0.4} 
        color={verseInfo.color} 
        opacity={0.8} 
      />
      {isDark && <Stars radius={50} depth={50} count={3000} factor={4} saturation={1} fade speed={1} />}

      <Environment preset={isDark ? "night" : "city"} />

      {/* Stylized Low-Poly Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <cylinderGeometry args={[20, 20, 1, 32]} />
        <meshStandardMaterial 
          color={isDark ? '#1f2937' : '#ffffff'} 
          roughness={0.8} 
          metalness={0.1} 
        />
      </mesh>

      {/* Central Core */}
      <VerseCore verseInfo={verseInfo} />

      {/* Automated Generators */}
      {generators.map((gen, idx) => (
        <GeneratorMesh 
          key={gen.id} 
          genData={gen} 
          verseInfo={verseInfo} 
          index={idx} 
          total={generators.length} 
        />
      ))}
    </>
  );
}

export function GameScene() {
  return (
    <div className="scene-layer">
      <Canvas 
        shadows 
        gl={{ powerPreference: "high-performance", antialias: false, preserveDrawingBuffer: true }}
        camera={{ position: [0, 15, 25], fov: 45 }}
      >
        <SceneContent />
        <OrbitControls 
          makeDefault 
          autoRotate 
          autoRotateSpeed={0.5} 
          maxPolarAngle={Math.PI / 2 - 0.1}
          minDistance={10}
          maxDistance={40}
          target={[0, 2, 0]}
          enableDamping
          enablePan={false}
        />
      </Canvas>
    </div>
  );
}
