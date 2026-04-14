import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { Physics } from '@react-three/cannon';
import SceneContainer from './components/Scene/SceneContainer.tsx';
import Sidebar from './components/UI/Sidebar.tsx';
import BottomPanel from './components/UI/BottomPanel.tsx';
import Dustbin from './components/UI/Dustbin.tsx';
import Overlay from './components/UI/Overlay.tsx';
import HandHUD from './components/UI/HandHUD.tsx';
import { useVoiceControl } from './hooks/useVoiceControl';
import { useSimulationManagers } from './hooks/useSimulationManagers';
import { useHandTracking } from './hooks/useHandTracking.ts';

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { resultsRef } = useHandTracking(videoRef);
  
  // Initialize Background Services
  useVoiceControl();
  useSimulationManagers();

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: false
        });
        activeStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    };
    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Hand-UI Interaction Logic (Drag & Drop)
  useEffect(() => {
    let lastGrabbing = false;
    let lastClickTime = 0;
    let frameId: number;

    const checkInteraction = () => {
      const results = resultsRef.current;
      if (results && results.landmarks && results.landmarks[0]) {
        const hand = results.landmarks[0];
        const indexTip = hand[8];
        const x = (1 - indexTip.x) * window.innerWidth;
        const y = indexTip.y * window.innerHeight;

        // Use Pinch or Grab for selection
        const thumbTip = hand[4];
        const dist = Math.sqrt(Math.pow(indexTip.x - thumbTip.x, 2) + Math.pow(indexTip.y - thumbTip.y, 2));
        const isGrabbing = dist < 0.04;

        const now = Date.now();
        if (isGrabbing && !lastGrabbing && now - lastClickTime > 1500) {
          // Check if hovering over sidebar
          const element = document.elementFromPoint(x, y);
          if (element?.closest('.glass-card')) {
            const btn = element.closest('.glass-card') as HTMLElement;
            btn.click();
            lastClickTime = now;
          }
        }
        
        lastGrabbing = isGrabbing;
      }
      frameId = requestAnimationFrame(checkInteraction);
    };
    
    checkInteraction();
    return () => cancelAnimationFrame(frameId);
  }, [resultsRef]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-transparent font-sans">
      {/* System Status Indicator */}
      <div className="absolute top-2 right-2 flex items-center gap-2 z-[100] bg-black/50 px-3 py-1 rounded-full border border-white/10 text-[10px] text-white/50">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
        HOLOLAB 2.0 ACTIVE
      </div>
      {/* Visible Camera Background (Video) */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="camera-feed"
      />

      {/* Hand Skeleton Overlay */}
      <HandHUD resultsRef={resultsRef} />

      {/* 3D Scene Layer */}
      <div className="canvas-container">
        <Canvas
          shadows
          camera={{ position: [0, 0, 5], fov: 50 }}
          gl={{ alpha: true, antialias: true }}
        >
          <color attach="background" args={['transparent']} />
          <ambientLight intensity={0.4} />
          <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={2} castShadow />
          <pointLight position={[-10, 10, -10]} intensity={1} color="#60a5fa" />
          
          <Physics gravity={[0, -9.81, 0]}>
            <SceneContainer resultsRef={resultsRef} />
          </Physics>

          <Environment preset="sunset" />
        </Canvas>
      </div>

      {/* UI Interaction Layer */}
      <div className="ui-overlay">
        <div className="row-span-2">
          <Sidebar />
        </div>
        <div className="flex items-start justify-center pt-8">
          <Overlay />
        </div>
        <div className="flex items-center justify-center">
          <Dustbin />
        </div>
        <div className="col-start-2 col-span-2 self-end pb-8">
          <BottomPanel />
        </div>
      </div>
    </div>
  );
};

export default App;
