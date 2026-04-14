import { useEffect, useRef } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import type { HandLandmarkerResult } from '@mediapipe/tasks-vision';

export const useHandTracking = (sourceRef: React.RefObject<HTMLVideoElement | HTMLCanvasElement>) => {
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const resultsRef = useRef<HandLandmarkerResult | null>(null);
  const requestRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    async function initMediaPipe() {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      
      const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 2,
        minHandDetectionConfidence: 0.7,
        minHandPresenceConfidence: 0.7,
        minTrackingConfidence: 0.7
      });
      
      landmarkerRef.current = handLandmarker;
    }

    initMediaPipe();

    return () => {
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

    const detect = async () => {
      if (landmarkerRef.current && sourceRef.current) {
        const isVideo = sourceRef.current instanceof HTMLVideoElement;
        const isReady = isVideo ? (sourceRef.current as HTMLVideoElement).readyState >= 2 : true;

        if (isReady) {
          const startTimeMs = performance.now();
          const results = landmarkerRef.current.detectForVideo(sourceRef.current, startTimeMs);
          resultsRef.current = results;
        }
      }
      requestRef.current = requestAnimationFrame(detect);
    };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(detect);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return { resultsRef };
};
