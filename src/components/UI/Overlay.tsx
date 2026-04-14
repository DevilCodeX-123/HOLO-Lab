import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Bot, Mic, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Overlay: React.FC = () => {
  const aiMessage = useAppStore(state => state.aiMessage);
  const isRecording = useAppStore(state => state.isRecording);
  const [displayText, setDisplayText] = useState("");

  // Typewriter effect for AI Mentor
  useEffect(() => {
    let currentText = "";
    let i = 0;
    const interval = setInterval(() => {
      if (i < aiMessage.length) {
        currentText += aiMessage[i];
        setDisplayText(currentText);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 20);
    return () => clearInterval(interval);
  }, [aiMessage]);

  return (
    <div className="flex flex-col items-center gap-4 max-w-2xl text-center pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
           key={aiMessage}
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: 20 }}
           className="glass p-6 px-8 rounded-2xl flex items-start gap-4 border-blue-400/30 shadow-[0_0_30px_rgba(56,189,248,0.2)]"
        >
          <div className="bg-blue-500/20 p-3 rounded-xl border border-blue-400/50">
            <Bot className="text-blue-400 animate-pulse" size={24} />
          </div>
          <div className="flex flex-col items-start gap-1">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1">
              <Sparkles size={10} /> AI Mentor
            </span>
            <p className="text-white text-lg leading-relaxed font-medium">
              {displayText}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {isRecording && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-3 bg-red-500/20 backdrop-blur-md px-4 py-2 rounded-full border border-red-500/50 text-red-400 text-xs font-bold"
        >
          <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          LISTENING...
        </motion.div>
      )}
    </div>
  );
};

export default Overlay;
