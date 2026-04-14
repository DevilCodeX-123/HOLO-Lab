import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { RotateCcw, Hand, Eye, Settings2, Wind } from 'lucide-react';

const BottomPanel: React.FC = () => {
  const { gravity, setGravity, handMode, setHandMode, undo } = useAppStore();

  const controls = [
    { label: 'Gravity', value: gravity.toFixed(1), min: -20, max: 20, icon: <Wind size={16} />, onChange: (v: number) => setGravity(v) },
  ];

  return (
    <div className="glass px-8 py-4 flex items-center justify-between gap-12 border-t border-white/10 mx-auto max-w-4xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-8">
        {controls.map((ctrl, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold flex items-center gap-1">
                {ctrl.icon} {ctrl.label}
              </span>
              <span className="text-xs text-blue-400 font-mono">{ctrl.value}</span>
            </div>
            <input 
              type="range" 
              min={ctrl.min} 
              max={ctrl.max} 
              step="0.1"
              value={parseFloat(ctrl.value)}
              onChange={(e) => ctrl.onChange(parseFloat(e.target.value))}
              className="w-40 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500 overflow-hidden"
            />
          </div>
        ))}
      </div>

      <div className="h-10 w-[1px] bg-white/10" />

      <div className="flex items-center gap-4">
        <button 
          onClick={() => setHandMode(handMode === 'skeleton' ? 'ghost' : 'skeleton')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border ${
            handMode === 'skeleton' ? 'bg-blue-500 text-white border-blue-400' : 'bg-white/5 text-white/60 border-white/5'
          }`}
        >
          {handMode === 'skeleton' ? <Hand size={18} /> : <Eye size={18} />}
          <span className="text-sm font-semibold">{handMode === 'skeleton' ? 'Skeleton' : 'Ghost'}</span>
        </button>

        <button 
          onClick={undo}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-white/60 border border-white/5 hover:bg-white/10 hover:text-white transition-all"
        >
          <RotateCcw size={18} />
          <span className="text-sm font-semibold">Undo</span>
        </button>
      </div>

      <div className="h-10 w-[1px] bg-white/10" />

      <div className="flex items-center gap-2 text-white/80">
        <div className="bg-blue-500/20 p-2 rounded-lg">
          <Settings2 size={20} className="text-blue-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-white/40 leading-tight">SYSTEM</span>
          <span className="text-xs font-bold leading-tight tracking-wider">v1.2.4</span>
        </div>
      </div>
    </div>
  );
};

export default BottomPanel;
