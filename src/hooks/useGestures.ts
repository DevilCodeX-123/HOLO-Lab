import { useRef, useEffect } from 'react';
import type { HandLandmarkerResult } from '@mediapipe/tasks-vision';
import * as THREE from 'three';

export interface GestureState {
  isPinching: boolean;
  isGrabbing: boolean;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  handedness: string;
}

export interface GlobalGestures {
  hands: GestureState[];
  zoomFactor: number;
}

export const useGestures = (resultsRef: React.RefObject<HandLandmarkerResult | null>) => {
  const gesturesRef = useRef<GlobalGestures>({ hands: [], zoomFactor: 1 });
  const lastPositions = useRef<THREE.Vector3[][]>([[], []]); 
  const lastHandsDist = useRef<number | null>(null);

  useEffect(() => {
    const updateGestures = () => {
      if (!resultsRef.current || !resultsRef.current.landmarks) {
        gesturesRef.current.hands = [];
        requestAnimationFrame(updateGestures);
        return;
      }

      const hands: GestureState[] = resultsRef.current.landmarks.map((landmarks, index) => {
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const palmCenter = landmarks[0];

        const toSceneX = (val: number) => (val - 0.5) * -10;
        const toSceneY = (val: number) => (0.5 - val) * 6;
        const toSceneZ = (val: number) => (val * -5);

        const currentPos = new THREE.Vector3(toSceneX(indexTip.x), toSceneY(indexTip.y), toSceneZ(indexTip.z));
        const pinchDist = Math.sqrt(Math.pow(thumbTip.x - indexTip.x, 2) + Math.pow(thumbTip.y - indexTip.y, 2));
        const isPinching = pinchDist < 0.05;

        const isGrabbing = landmarks.slice(8, 21).every(l => {
          const d = Math.sqrt(Math.pow(l.x - palmCenter.x, 2) + Math.pow(l.y - palmCenter.y, 2));
          return d < 0.15;
        }) && !isPinching;

        const history = lastPositions.current[index] || [];
        history.push(currentPos.clone());
        if (history.length > 5) history.shift();
        lastPositions.current[index] = history;
        
        const velocity = new THREE.Vector3();
        if (history.length > 1) {
          velocity.subVectors(history[history.length - 1], history[0]).multiplyScalar(10);
        }

        return {
          isPinching,
          isGrabbing,
          position: currentPos,
          velocity,
          handedness: resultsRef.current?.handednesses?.[index]?.[0]?.categoryName || 'Unknown'
        };
      });

      // Two-Hand Zoom Logic
      let zoomDelta = 1;
      if (hands.length === 2 && hands[0] && hands[1]) {
        const dist = hands[0].position.distanceTo(hands[1].position);
        if (lastHandsDist.current !== null && lastHandsDist.current !== 0) {
          zoomDelta = dist / lastHandsDist.current;
        }
        lastHandsDist.current = dist;
      } else {
        lastHandsDist.current = null;
      }

      gesturesRef.current = {
        hands,
        zoomFactor: THREE.MathUtils.clamp(gesturesRef.current.zoomFactor * (zoomDelta || 1), 0.5, 3)
      };
      
      requestAnimationFrame(updateGestures);
    };

    const animId = requestAnimationFrame(updateGestures);
    return () => cancelAnimationFrame(animId);
  }, []);

  return gesturesRef;
};
