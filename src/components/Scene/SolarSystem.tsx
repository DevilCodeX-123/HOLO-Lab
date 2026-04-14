import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Use pure colors instead of texture URLs — avoids network crashes that black-screen the site
const PLANET_DATA = [
  { name: 'mercury', dist: 2.0, size: 0.15, speed: 0.04, color: '#b5b5b5' },
  { name: 'venus',   dist: 3.2, size: 0.25, speed: 0.015, color: '#e8cda0' },
  { name: 'earth',   dist: 4.5, size: 0.3,  speed: 0.01,  color: '#3a7bd5' },
  { name: 'mars',    dist: 6.0, size: 0.22, speed: 0.008,  color: '#c1440e' },
  { name: 'jupiter', dist: 8.5, size: 0.6,  speed: 0.002,  color: '#c88b3a' },
  { name: 'saturn',  dist: 11.0, size: 0.5, speed: 0.0009, color: '#e4d191' },
];

const OrbitPlanet: React.FC<{ data: typeof PLANET_DATA[0] }> = ({ data }) => {
  const orbitRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);

  useFrame((_state, delta) => {
    if (orbitRef.current) orbitRef.current.rotation.y += data.speed * delta * 50;
    if (planetRef.current) planetRef.current.rotation.y += delta * 0.5;
  });

  return (
    <group ref={orbitRef}>
      <mesh ref={planetRef} position={[data.dist, 0, 0]} castShadow receiveShadow>
        <sphereGeometry args={[data.size, 32, 32]} />
        <meshStandardMaterial color={data.color} roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Visual Orbit Line */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[data.dist - 0.01, data.dist + 0.01, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

const SolarSystem: React.FC = () => {
  return (
    <group scale={[0.5, 0.5, 0.5]}>
      {/* The Sun */}
      <mesh>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshStandardMaterial
          emissive="#ffa500"
          emissiveIntensity={3}
          color="#ffde66"
        />
        <pointLight intensity={10} distance={100} color="#ffde66" castShadow />
      </mesh>

      {/* Orbiting Planets */}
      {PLANET_DATA.map((planet) => (
        <OrbitPlanet key={planet.name} data={planet} />
      ))}
    </group>
  );
};

export default SolarSystem;
