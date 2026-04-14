import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGestures } from '../../hooks/useGestures.ts';
import HandPhysics from './HandPhysics';
import ARItem from '../Objects/ARItem';
import Planet from '../Objects/Planet.tsx';
import Molecule from '../Objects/Molecule.tsx';
import SolarSystem from './SolarSystem.tsx';
import { useAppStore } from '../../store/useAppStore';

import type { HandLandmarkerResult } from '@mediapipe/tasks-vision';

interface SceneContainerProps {
  resultsRef: React.RefObject<HandLandmarkerResult | null>;
}

const SceneContainer: React.FC<SceneContainerProps> = ({ resultsRef }) => {
  const gesturesRef = useGestures(resultsRef);
  const objects = useAppStore(state => state.objects);
  const sceneScale = useAppStore(state => state.sceneScale);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_state, _delta) => {
    if (groupRef.current && gesturesRef.current) {
      const s = sceneScale * gesturesRef.current.zoomFactor;
      groupRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group ref={groupRef}>
      <HandPhysics resultsRef={resultsRef} />
      <SolarSystem />
      {objects.map((obj) => {
        if (obj.type === 'planet') {
          return (
            <Planet 
              key={obj.id} 
              planetType={obj.planetType as any}
              initialPosition={obj.position}
              gestures={gesturesRef}
            />
          );
        }

        if (obj.type === 'molecule') {
          return (
            <Molecule 
              key={obj.id}
              element={obj.element as any}
              initialPosition={obj.position}
              gestures={gesturesRef}
            />
          );
        }

        return (
          <ARItem 
            key={obj.id}
            id={obj.id}
            type={obj.shapeType as any || obj.type}
            initialPosition={obj.position}
            gestures={gesturesRef}
            isKinematic={obj.isKinematic}
          />
        );
      })}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};

export default SceneContainer;
