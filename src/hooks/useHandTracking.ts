import { useEffect, useRef } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import type { HandLandmarkerResult } from '@mediapipe/tasks-vision';

export const useHandTracking = (sourceRef: React.RefObject<HTMLVideoElement | HTMLCanvasElement | null>) => {
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const resultsRef = useRef<HandLandmarkerResult | null>(null);
  const requestRef = useRef<number | undefined>(undefined);
  const isRunningRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function initMediaPipe() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );

        if (cancelled) return;

        const handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "CPU"
          },
          runningMode: "VIDEO",
          numHands: 1,           // reduced from 2 → 1 to halve CPU load
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        if (cancelled) {
          handLandmarker.close();
          return;
        }

        landmarkerRef.current = handLandmarker;
      } catch (err) {
        console.warn("MediaPipe init failed, hand tracking disabled:", err);
      }
    }

    initMediaPipe();

    return () => {
      cancelled = true;
      isRunningRef.current = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let lastDetectTime = 0;
    const DETECT_INTERVAL_MS = 100; // only detect 10fps max — prevents CPU overload crash

    const detect = () => {
      requestRef.current = requestAnimationFrame(detect);

      if (!landmarkerRef.current || !sourceRef.current) return;

      const now = performance.now();
      if (now - lastDetectTime < DETECT_INTERVAL_MS) return;
      lastDetectTime = now;

      try {
        const source = sourceRef.current;
        const isVideo = source instanceof HTMLVideoElement;
        const isReady = isVideo ? (source as HTMLVideoElement).readyState >= 2 : true;

        if (isReady) {
          const results = landmarkerRef.current.detectForVideo(source, now);
          resultsRef.current = results;
        }
      } catch (err) {
        // Silent fail — never let a detection error crash the app
        console.warn("Hand detection error:", err);
      }
    };

    requestRef.current = requestAnimationFrame(detect);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return { resultsRef };
};
