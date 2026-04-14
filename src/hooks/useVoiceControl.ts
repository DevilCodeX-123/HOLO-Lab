import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';

export const useVoiceControl = () => {
  const addObject = useAppStore(state => state.addObject);
  const setAiMessage = useAppStore(state => state.setAiMessage);
  const setIsRecording = useAppStore(state => state.setIsRecording);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      console.log("Voice Command:", transcript);

      if (transcript.includes('add earth')) {
        addObject({ id: Math.random().toString(), type: 'planet', planetType: 'earth', position: [0, 2, 0], isKinematic: true });
        setAiMessage("Adding Earth to your scene! 🌍");
      } else if (transcript.includes('add moon')) {
        addObject({ id: Math.random().toString(), type: 'planet', planetType: 'moon', position: [1, 1, 0], isKinematic: true });
        setAiMessage("Behold the Moon! 🌙");
      } else if (transcript.includes('delete object') || transcript.includes('remove')) {
        setAiMessage("Which object should I remove? Try dragging it to the bin.");
      } else if (transcript.includes('reset gravity')) {
        useAppStore.getState().setGravity(-9.81);
        setAiMessage("Gravity restored to normal Earth levels. ⚓");
      }
    };

    recognition.start();
    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  return null;
};
