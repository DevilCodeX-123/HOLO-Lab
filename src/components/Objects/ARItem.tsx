import React, { useState, useRef } from 'react';
import { useSphere, useBox } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { GlobalGestures } from '../../hooks/useGestures';
import { soundManager } from '../../services/SoundManager';
import { useAppStore } from '../../store/useAppStore';

interface ARItemProps {
  id: string;
  type: 'cube' | 'sphere' | 'cone' | 'torus';
  initialPosition: [number, number, number];
  gestures: React.MutableRefObject<GlobalGestures>;
  isKinematic: boolean;
}

const ARItem: React.FC<ARItemProps> = ({ id, type, initialPosition, gestures, isKinematic: storeKinematic }) => {
  const [grabbedBy, setGrabbedBy] = useState<number | null>(null);
  const updateObject = useAppStore(state => state.updateObject);
  
  const [ref, api] = type === 'sphere' 
    ? useSphere(() => ({ 
        mass: 1, 
        position: initialPosition, 
        type: (grabbedBy !== null || storeKinematic) ? 'Kinematic' : 'Dynamic',
        args: [0.5] 
      }))
    : useBox(() => ({ 
        mass: 1, 
        position: initialPosition, 
        type: (grabbedBy !== null || storeKinematic) ? 'Kinematic' : 'Dynamic',
        args: [0.5, 0.5, 0.5] 
      }));

  const lastVelocity = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!gestures.current || !ref.current) return;
    
    // Check for pinch from any hand
    let anyHandPinching = false;
    gestures.current.hands.forEach((gesture, index) => {
      const dist = gesture.position.distanceTo(new THREE.Vector3().setFromMatrixPosition(ref.current!.matrixWorld));
      
      if (gesture.isPinching && dist < 0.8) {
        if (grabbedBy === null) soundManager.playGrab();
        anyHandPinching = true;
        setGrabbedBy(index);
        
        api.velocity.set(0, 0, 0);
        api.position.set(gesture.position.x, gesture.position.y, gesture.position.z);
        lastVelocity.current.copy(gesture.velocity);
      }
    });

    if (!anyHandPinching && grabbedBy !== null) {
      // Released: switch back to dynamic and apply hand velocity (Throw)
      setGrabbedBy(null);
      
      // If velocity is high, enable actual physics (gravity)
      if (lastVelocity.current.length() > 2) {
        soundManager.playThrow();
        updateObject(id, { isKinematic: false });
        api.velocity.set(lastVelocity.current.x, lastVelocity.current.y, lastVelocity.current.z);
      } else {
        // Slow release = Float
        api.velocity.set(0, 0, 0);
      }
    }

    // Check Dustbin collision (logic handled in app state usually, but simplified here)
    if (ref.current && ref.current.position.x > 4 && ref.current.position.y > 0) {
      // In Dustbin area
      // removeObject(id); 
    }
  });

  return (
    <mesh ref={ref as any} castShadow>
      {type === 'sphere' ? <sphereGeometry args={[0.5, 32, 32]} /> : 
       type === 'torus' ? <torusGeometry args={[0.4, 0.15, 16, 50]} /> :
       type === 'cone' ? <coneGeometry args={[0.4, 0.8, 32]} /> :
       <boxGeometry args={[0.5, 0.5, 0.5]} />}
      <meshStandardMaterial 
        color={grabbedBy !== null ? "#38bdf8" : "#f8fafc"} 
        metalness={0.9} 
        roughness={0.1}
        envMapIntensity={1}
      />
    </mesh>
  );
};

export default ARItem;
