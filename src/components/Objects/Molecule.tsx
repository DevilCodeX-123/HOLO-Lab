import React, { useState, useRef } from 'react';
import { useSphere } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { GlobalGestures } from '../../hooks/useGestures';
import { soundManager } from '../../services/SoundManager.ts';

interface MoleculeProps {
  element: 'H' | 'O' | 'H2O' | 'CO2' | 'CH4' | 'NaCl';
  initialPosition: [number, number, number];
  gestures: React.MutableRefObject<GlobalGestures>;
  isKinematic?: boolean;
}

const Molecule: React.FC<MoleculeProps> = ({ element, initialPosition, gestures, isKinematic = true }) => {
  const [grabbedBy, setGrabbedBy] = useState<number | null>(null);
  
  const getMoleculeInfo = () => {
    switch(element) {
      case 'H': return { color: '#ffffff', size: 0.2, mass: 0.1 };
      case 'O': return { color: '#ef4444', size: 0.35, mass: 0.3 };
      case 'H2O': return { color: '#38bdf8', size: 0.45, mass: 0.5 };
      case 'CO2': return { color: '#94a3b8', size: 0.5, mass: 0.6 };
      case 'CH4': return { color: '#10b981', size: 0.5, mass: 0.6 };
      case 'NaCl': return { color: '#fbbf24', size: 0.5, mass: 0.8 };
      default: return { color: '#ffffff', size: 0.2, mass: 0.1 };
    }
  };

  const { color, size, mass } = getMoleculeInfo();

  const [ref, api] = useSphere(() => ({ 
    mass, 
    position: initialPosition, 
    type: (grabbedBy !== null || isKinematic) ? 'Kinematic' : 'Dynamic',
    args: [size] 
  }));

  const lastVelocity = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!gestures.current || !ref.current) return;

    let anyHandPinching = false;
    gestures.current.hands.forEach((gesture, index) => {
      const currentMolPos = new THREE.Vector3().setFromMatrixPosition(ref.current!.matrixWorld);
      const dist = gesture.position.distanceTo(currentMolPos);
      
      if (gesture.isPinching && dist < 0.5) {
        if (grabbedBy === null) soundManager.playGrab();
        anyHandPinching = true;
        setGrabbedBy(index);
        api.position.set(gesture.position.x, gesture.position.y, gesture.position.z);
        api.velocity.set(0, 0, 0);
        lastVelocity.current.copy(gesture.velocity);
      }
    });

    if (!anyHandPinching && grabbedBy !== null) {
      setGrabbedBy(null);
      soundManager.playThrow();
      api.velocity.set(lastVelocity.current.x, lastVelocity.current.y, lastVelocity.current.z);
    }
  });

  return (
    <group ref={ref as any}>
      {element === 'H2O' ? (
        <group>
          {/* Oxygen */}
          <mesh castShadow>
            <sphereGeometry args={[0.3, 32, 32]} />
            <meshStandardMaterial color="#ef4444" metalness={0.5} roughness={0.2} />
          </mesh>
          {/* Two Hydrogens */}
          <mesh position={[0.4, 0.3, 0]} castShadow>
            <sphereGeometry args={[0.15, 32, 32]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[-0.4, 0.3, 0]} castShadow>
            <sphereGeometry args={[0.15, 32, 32]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      ) : (
        <mesh castShadow>
          <sphereGeometry args={[size, 32, 32]} />
          <meshStandardMaterial color={color} metalness={0.5} roughness={0.2} />
        </mesh>
      )}
      
      <Text
        position={[0, size + 0.2, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {element}
      </Text>
    </group>
  );
};

export default Molecule;
