import React from 'react';
import { useSphere } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import type { HandLandmarkerResult } from '@mediapipe/tasks-vision';
import { useAppStore } from '../../store/useAppStore';

interface HandPhysicsProps {
  resultsRef: React.RefObject<HandLandmarkerResult | null>;
}

const LandmarkSphere = ({ index, handIndex, resultsRef }: { index: number, handIndex: number, resultsRef: any }) => {
  const [ref, api] = useSphere(() => ({
    type: 'Kinematic',
    args: [0.05],
    position: [0, 0, 0],
  }));

  useFrame(() => {
    const results = resultsRef.current;
    if (results && results.landmarks && results.landmarks[handIndex]) {
      const landmark = results.landmarks[handIndex][index];
      // Convert normalized to scene coordinates
      const x = (landmark.x - 0.5) * -10;
      const y = (0.5 - landmark.y) * 6;
      const z = (landmark.z * -5);
      api.position.set(x, y, z);
    } else {
      api.position.set(0, -100, 0); // Hide off-screen
    }
  });

  return (
    <mesh ref={ref as any}>
      <sphereGeometry args={[0.05, 16, 16]} />
      <meshStandardMaterial 
        color="#38bdf8" 
        transparent 
        opacity={index === 8 || index === 4 ? 0.4 : 0.1} // More visible tips
      />
    </mesh>
  );
};

const HandPhysics: React.FC<HandPhysicsProps> = ({ resultsRef }) => {
  const handMode = useAppStore(state => state.handMode);
  
  // Create 21 points for each of the 2 hands
  const landmarkIndices = Array.from({ length: 21 }, (_, i) => i);

  return (
    <group visible={handMode === 'skeleton'}>
      {landmarkIndices.map(i => <LandmarkSphere key={`h0-${i}`} index={i} handIndex={0} resultsRef={resultsRef} />)}
      {landmarkIndices.map(i => <LandmarkSphere key={`h1-${i}`} index={i} handIndex={1} resultsRef={resultsRef} />)}
    </group>
  );
};

export default HandPhysics;
