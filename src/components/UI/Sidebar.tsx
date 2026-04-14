import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Box, Circle, Globe, Moon, Atom } from 'lucide-react';

const Sidebar: React.FC = () => {
  const addObject = useAppStore(state => state.addObject);

  const categories = [
    {
      title: 'Shapes',
      items: [
        { label: 'Cube', icon: <Box size={20} />, action: () => addObject({ id: Math.random().toString(), type: 'shape', shapeType: 'cube', position: [0, 2, 0], isKinematic: true }) },
        { label: 'Sphere', icon: <Circle size={20} />, action: () => addObject({ id: Math.random().toString(), type: 'shape', shapeType: 'sphere', position: [0, 2, 0], isKinematic: true }) },
        { label: 'Torus', icon: <div className="w-5 h-5 border-4 border-blue-400 rounded-full" />, action: () => addObject({ id: Math.random().toString(), type: 'shape', shapeType: 'torus', position: [0, 2, 0], isKinematic: true }) },
      ]
    },
    {
      title: 'Space',
      items: [
        { label: 'Earth', icon: <Globe size={20} />, action: () => addObject({ id: Math.random().toString(), type: 'planet', planetType: 'earth', position: [0, 2, 0], isKinematic: true }) },
        { label: 'Moon', icon: <Moon size={20} />, action: () => addObject({ id: Math.random().toString(), type: 'planet', planetType: 'moon', position: [2, 1, 0], isKinematic: true }) },
        { label: 'Mars', icon: <Globe size={20} className="text-red-400" />, action: () => addObject({ id: Math.random().toString(), type: 'planet', planetType: 'mars', position: [0, 2.5, 0], isKinematic: true }) },
        { label: 'Jupiter', icon: <Globe size={20} className="text-orange-300" />, action: () => addObject({ id: Math.random().toString(), type: 'planet', planetType: 'jupiter', position: [0, 3, 0], isKinematic: true }) },
        { label: 'Asteroid', icon: <div className="w-5 h-5 bg-gray-500 rounded-full blur-[1px]" />, action: () => addObject({ id: Math.random().toString(), type: 'planet', planetType: 'asteroid', position: [-2, 3, 0], isKinematic: true }) },
      ]
    },
    {
      title: 'Molecules',
      items: [
        { label: 'Hydrogen', icon: <Atom size={20} className="text-white" />, action: () => addObject({ id: Math.random().toString(), type: 'molecule', element: 'H', position: [0, 2, 0], isKinematic: true }) },
        { label: 'Oxygen', icon: <Atom size={20} className="text-red-500" />, action: () => addObject({ id: Math.random().toString(), type: 'molecule', element: 'O', position: [1, 2, 0], isKinematic: true }) },
        { label: 'Water', icon: <Atom size={20} className="text-blue-400" />, action: () => addObject({ id: Math.random().toString(), type: 'molecule', element: 'H2O', position: [0, 2, 0], isKinematic: true }) },
        { label: 'Carbon Dir.', icon: <Atom size={20} className="text-gray-400" />, action: () => addObject({ id: Math.random().toString(), type: 'molecule', element: 'CO2', position: [0, 2, 0], isKinematic: true }) },
        { label: 'Methane', icon: <Atom size={20} className="text-green-400" />, action: () => addObject({ id: Math.random().toString(), type: 'molecule', element: 'CH4', position: [0, 2, 0], isKinematic: true }) },
        { label: 'Salt', icon: <Atom size={20} className="text-yellow-400" />, action: () => addObject({ id: Math.random().toString(), type: 'molecule', element: 'NaCl', position: [0, 2, 0], isKinematic: true }) },
      ]
    }
  ];

  return (
    <div className="glass h-full p-6 flex flex-col gap-8 border-r border-white/10 backdrop-blur-xl">
      <div className="mb-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          HOLOLAB
        </h1>
        <p className="text-xs text-blue-300 tracking-widest mt-1">G-AR SCIENCE SYSTEM</p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-8 custom-scrollbar">
        {categories.map((cat, i) => (
          <div key={i} className="space-y-4">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold px-2">
              {cat.title}
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {cat.items.map((item, j) => (
                <button
                  key={j}
                  onClick={item.action}
                  className="glass-card group flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-400/50 transition-all text-sm"
                >
                  <div className="text-blue-400 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <span className="text-white/80 group-hover:text-white">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="pt-4 border-t border-white/5">
        <div className="flex items-center gap-2 text-xs text-white/30 px-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          SYSTEM ONLINE
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
