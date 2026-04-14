import React from 'react';
import { useSphere } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import type { HandLandmarkerResult } from '@mediapipe/tasks-vision';

interface HandPhysicsProps {
  resultsRef: React.RefObject<HandLandmarkerResult | null>;
}

// Only track index fingertip (8) — was 42 spheres, now 1.
// 42 rigid bodies + physics simulation was overloading the GPU and crashing WebGL.
const IndexTipSphere = ({ resultsRef }: { resultsRef: any }) => {
  const [ref, api] = useSphere(() => ({
    type: 'Kinematic',
    args: [0.15],
    position: [0, -100, 0],
  }));

  useFrame(() => {
    try {
      const results = resultsRef.current;
      if (results?.landmarks?.[0]) {
        const landmark = results.landmarks[0][8]; // index fingertip
        const x = (landmark.x - 0.5) * -10;
        const y = (0.5 - landmark.y) * 6;
        const z = landmark.z * -5;
        api.position.set(x, y, z);
      } else {
        api.position.set(0, -100, 0);
      }
    } catch (_) {
      api.position.set(0, -100, 0);
    }
  });

  return (
    <mesh ref={ref as any}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial color="#38bdf8" transparent opacity={0.3} />
    </mesh>
  );
};

const HandPhysics: React.FC<HandPhysicsProps> = ({ resultsRef }) => {
  return (
    <group>
      <IndexTipSphere resultsRef={resultsRef} />
    </group>
  );
};

export default HandPhysics;
