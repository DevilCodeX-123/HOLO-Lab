import React, { useState, useRef } from 'react';
import { useSphere } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { GlobalGestures } from '../../hooks/useGestures';
import { soundManager } from '../../services/SoundManager.ts';

interface PlanetProps {
  planetType: 'earth' | 'moon' | 'asteroid' | 'mars' | 'jupiter';
  initialPosition: [number, number, number];
  gestures: React.MutableRefObject<GlobalGestures>;
}

const Planet: React.FC<PlanetProps> = ({ planetType, initialPosition, gestures }) => {
  const [isOpen] = useState(false);
  const [grabbedBy, setGrabbedBy] = useState<number | null>(null);
  
  // High quality textures from public CDN
  const textures = useTexture({
    map: planetType === 'earth' 
      ? 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg'
      : planetType === 'moon'
      ? 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg'
      : planetType === 'mars'
      ? 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/mars_1k.jpg'
      : planetType === 'jupiter'
      ? 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/jupiter_1k.jpg'
      : 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/planets/asteroid.jpg'
  });

  const [ref, api] = useSphere(() => ({ 
    mass: planetType === 'asteroid' ? 0.5 : planetType === 'jupiter' ? 20 : 5, 
    position: initialPosition, 
    args: [planetType === 'earth' ? 0.8 : planetType === 'jupiter' ? 1.5 : planetType === 'moon' ? 0.4 : 0.6] 
  }));

  const lastVelocity = useRef(new THREE.Vector3());

  useFrame((_state, delta) => {
    // 1. Rotation Logic (Visual)
    if (ref.current) {
      if (planetType === 'earth') {
        ref.current.rotation.y += delta * 0.2; // Earth rotates
      } else if (planetType === 'mars') {
        ref.current.rotation.y += delta * 0.15;
      } else {
        ref.current.rotation.y += delta * 0.1;
      }
    }

    // 2. Gesture Logic
    let anyHandPinching = false;
    
    if (gestures.current && ref.current) {
      gestures.current.hands.forEach((gesture, index) => {
        const currentPlanetPos = new THREE.Vector3().setFromMatrixPosition(ref.current!.matrixWorld);
        const dist = gesture.position.distanceTo(currentPlanetPos);
        
        // Select/Grab
        if (gesture.isPinching && dist < 1.0) {
          if (grabbedBy === null) soundManager.playGrab();
          anyHandPinching = true;
          setGrabbedBy(index);
          api.position.set(gesture.position.x, gesture.position.y, gesture.position.z);
          api.velocity.set(0, 0, 0);
          lastVelocity.current.copy(gesture.velocity);
        }
      });
    }

    if (!anyHandPinching && grabbedBy !== null) {
      setGrabbedBy(null);
      soundManager.playThrow();
      api.velocity.set(lastVelocity.current.x, lastVelocity.current.y, lastVelocity.current.z);
    }
  });

  return (
    <group ref={ref as any}>
      {/* Outer Layer */}
      <mesh castShadow scale={isOpen ? [1.5, 1.5, 1.5] : [1, 1, 1]}>
        <sphereGeometry args={[planetType === 'earth' ? 0.8 : 0.4, 32, 32]} />
        <meshStandardMaterial {...textures} />
      </mesh>

      {/* Earth Internal Layers (Visible when open) */}
      {isOpen && planetType === 'earth' && (
        <group>
          <mesh>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial color="orange" emissive="red" emissiveIntensity={0.5} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.2, 32, 32]} />
            <meshStandardMaterial color="yellow" emissive="yellow" emissiveIntensity={1} />
          </mesh>
        </group>
      )}
    </group>
  );
};

export default Planet;
