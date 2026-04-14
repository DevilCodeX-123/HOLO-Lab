import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { explainEvent } from '../services/GeminiService';
import { soundManager } from '../services/SoundManager.ts';

export const useSimulationManagers = () => {
  const objects = useAppStore(state => state.objects);
  const removeObject = useAppStore(state => state.removeObject);
  const addObject = useAppStore(state => state.addObject);
  const setAiMessage = useAppStore(state => state.setAiMessage);

  useEffect(() => {
    const checkInteractions = async () => {
      // 1. Chemistry Logic: 2H + O -> H2O
      const hAtoms = objects.filter(o => o.type === 'molecule' && o.element === 'H');
      const oAtoms = objects.filter(o => o.type === 'molecule' && o.element === 'O');

      if (hAtoms.length >= 2 && oAtoms.length >= 1) {
        removeObject(hAtoms[0].id);
        removeObject(hAtoms[1].id);
        removeObject(oAtoms[0].id);
        
        soundManager.playPop();
        addObject({ 
          id: Math.random().toString(), 
          type: 'molecule', 
          element: 'H2O', 
          position: oAtoms[0].position 
        });

        const explanation = await explainEvent("Chemistry Success: Two Hydrogen atoms and one Oxygen atom fused to create a Water molecule!");
        setAiMessage(explanation);
      }

      // 2. Planetary Gravity & Interactions
      const earth = objects.find(o => o.type === 'planet' && o.planetType === 'earth');
      const moon = objects.find(o => o.type === 'planet' && o.planetType === 'moon');
      const asteroids = objects.filter(o => o.type === 'planet' && o.planetType === 'asteroid');

      if (earth) {
        // Moon Interaction
        if (moon) {
          const dist = Math.sqrt(
            Math.pow(moon.position[0] - earth.position[0], 2) + 
            Math.pow(moon.position[1] - earth.position[1], 2) +
            Math.pow(moon.position[2] - earth.position[2], 2)
          );

          if (dist < 1.2) {
            removeObject(moon.id);
            soundManager.playPop();
            const explanation = await explainEvent("The Moon reached the Roche limit and collided with Earth! In the early solar system, a similar massive impact led to the Moon's formation.");
            setAiMessage(explanation);
          }
        }

        // Asteroid Interaction
        asteroids.forEach(async (ast) => {
          const dist = Math.sqrt(
            Math.pow(ast.position[0] - earth.position[0], 2) + 
            Math.pow(ast.position[1] - earth.position[1], 2)
          );

          if (dist < 1.0) {
            removeObject(ast.id);
            soundManager.playPop();
            const explanation = await explainEvent("An asteroid collided with Earth! Such events have shaped the planet's atmospheric history and its biological evolution.");
            setAiMessage(explanation);
          }
        });
      }
    };

    const interval = setInterval(checkInteractions, 1000);
    return () => clearInterval(interval);
  }, [objects]);

  return null;
};
