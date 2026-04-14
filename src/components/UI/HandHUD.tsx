import React, { useRef, useEffect } from 'react';
import type { HandLandmarkerResult } from '@mediapipe/tasks-vision';

interface HandHUDProps {
  resultsRef: React.RefObject<HandLandmarkerResult | null>;
}

const HandHUD: React.FC<HandHUDProps> = ({ resultsRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    let frameId: number;
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const results = resultsRef.current;
      if (results && results.landmarks) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';

        results.landmarks.forEach(landmarks => {
          // Draw joints (simple lines for now)
          const drawLink = (from: number, to: number) => {
            const start = landmarks[from];
            const end = landmarks[to];
            ctx.beginPath();
            ctx.moveTo(start.x * canvas.width, start.y * canvas.height);
            ctx.lineTo(end.x * canvas.width, end.y * canvas.height);
            ctx.stroke();
          };

          // Finger connections based on MediaPipe hand index
          // Thumb
          for (let i = 0; i < 4; i++) drawLink(i, i+1);
          // Fingers
          for (let i = 0; i < 4; i++) {
            const root = 1 + i * 4;
            drawLink(0, root + 1);
            for (let j = root + 1; j < root + 4; j++) drawLink(j, j+1);
          }

          // Draw fingertips as glowing dots
          landmarks.forEach((pt, i) => {
            if ([4, 8, 12, 16, 20].includes(i)) {
              ctx.fillStyle = '#60a5fa';
              ctx.shadowBlur = 10;
              ctx.shadowColor = '#38bdf8';
              ctx.beginPath();
              ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 6, 0, Math.PI * 2);
              ctx.fill();
            }
          });
        });
      }
      frameId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frameId);
  }, [resultsRef]);

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 5,
        transform: 'scaleX(-1)'
      }}
    />
  );
};

export default HandHUD;
