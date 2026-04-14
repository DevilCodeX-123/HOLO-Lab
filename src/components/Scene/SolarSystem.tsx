import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

const PLANET_DATA = [
  { name: 'mercury', dist: 2.0, size: 0.15, speed: 0.04, texture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/mercury.jpg' },
  { name: 'venus', dist: 3.2, size: 0.25, speed: 0.015, texture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/venus_surface.jpg' },
  { name: 'earth', dist: 4.5, size: 0.3, speed: 0.01, texture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg' },
  { name: 'mars', dist: 6.0, size: 0.22, speed: 0.008, texture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/mars_1k.jpg' },
  { name: 'jupiter', dist: 8.5, size: 0.6, speed: 0.002, texture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/jupiter_1k.jpg' },
  { name: 'saturn', dist: 11.0, size: 0.5, speed: 0.0009, texture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/saturn.png' },
];

const OrbitPlanet: React.FC<{ data: any }> = ({ data }) => {
  const orbitRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(data.texture) as any;

  useFrame((_state, delta) => {
    if (orbitRef.current) orbitRef.current.rotation.y += data.speed * delta * 50;
    if (planetRef.current) planetRef.current.rotation.y += delta * 0.5;
  });

  return (
    <group ref={orbitRef}>
      <mesh ref={planetRef} position={[data.dist, 0, 0]} castShadow receiveShadow>
        <sphereGeometry args={[data.size, 32, 32]} />
        <meshStandardMaterial map={texture} roughness={0.7} metalness={0.2} />
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
  const sunTexture = useTexture('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/sun.jpg');

  return (
    <group scale={[0.5, 0.5, 0.5]}>
      {/* The Sun */}
      <mesh>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshStandardMaterial 
          emissiveMap={sunTexture} 
          emissive="#ffa500" 
          emissiveIntensity={10} 
          map={sunTexture} 
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
