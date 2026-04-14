import { create } from 'zustand';

export type PlanetType = 'earth' | 'moon' | 'asteroid' | 'mars' | 'jupiter' | 'sun' | 'mercury' | 'venus' | 'saturn' | 'uranus' | 'neptune';
export type ElementType = 'H' | 'O' | 'H2O' | 'CO2' | 'CH4' | 'NaCl';
export type ShapeType = 'cube' | 'sphere' | 'cone' | 'torus';

interface ARItem {
  id: string;
  type: 'planet' | 'molecule' | 'shape';
  planetType?: PlanetType;
  element?: ElementType;
  shapeType?: ShapeType;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  isKinematic: boolean; // true = float, false = fall
  velocity?: [number, number, number];
}

interface Action {
  type: 'add' | 'delete' | 'move';
  targetId: string;
  previousState?: any;
}

interface HoloState {
  objects: ARItem[];
  gravity: number;
  sceneScale: number;
  simSpeed: number;
  handMode: 'skeleton' | 'ghost';
  history: Action[];
  aiMessage: string;
  isRecording: boolean;
  
  // Actions
  addObject: (obj: ARItem) => void;
  removeObject: (id: string) => void;
  updateObject: (id: string, updates: Partial<ARItem>) => void;
  setGravity: (g: number) => void;
  setSceneScale: (scale: number) => void;
  setHandMode: (mode: 'skeleton' | 'ghost') => void;
  setAiMessage: (msg: string) => void;
  setIsRecording: (isRec: boolean) => void;
  undo: () => void;
}

export const useAppStore = create<HoloState>((set) => ({
  objects: [],
  gravity: -9.81,
  sceneScale: 1,
  simSpeed: 1,
  handMode: 'skeleton',
  history: [],
  aiMessage: "Welcome to HoloLab 2.0! Use your hands to drag items from the menu into the 3D space.",
  isRecording: false,

  addObject: (obj) => set((state) => ({ 
    objects: [...state.objects, { ...obj, isKinematic: obj.isKinematic ?? true }],
    history: [...state.history, { type: 'add', targetId: obj.id }]
  })),

  removeObject: (id) => set((state) => ({ 
    objects: state.objects.filter(o => o.id !== id),
    history: [...state.history, { type: 'delete', targetId: id }]
  })),

  updateObject: (id, updates) => set((state) => ({
    objects: state.objects.map(o => o.id === id ? { ...o, ...updates } : o)
  })),

  setGravity: (g) => set({ gravity: g }),
  setSceneScale: (scale) => set({ sceneScale: scale }),
  setHandMode: (mode) => set({ handMode: mode }),
  setAiMessage: (msg) => set({ aiMessage: msg }),
  setIsRecording: (isRec) => set({ isRecording: isRec }),

  undo: () => set((state) => {
    if (state.history.length === 0) return state;
    const lastAction = state.history[state.history.length - 1];
    const newHistory = state.history.slice(0, -1);
    
    if (lastAction.type === 'add') {
      return { 
        objects: state.objects.filter(o => o.id !== lastAction.targetId),
        history: newHistory
      };
    }
    return { history: newHistory };
  }),
}));
