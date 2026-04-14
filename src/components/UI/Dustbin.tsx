import React from 'react';
import { Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Dustbin: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div 
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="glass w-24 h-24 rounded-3xl flex items-center justify-center border-red-500/20 group hover:border-red-500/50 hover:bg-red-500/10 transition-all shadow-[0_0_30px_rgba(239,68,68,0.1)]"
      >
        <div className="bg-red-500/10 p-4 rounded-2xl group-hover:bg-red-500/20 transition-all">
          <Trash2 className="text-red-400 group-hover:text-red-500" size={32} />
        </div>
      </motion.div>
      <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Dustbin</span>
    </div>
  );
};

export default Dustbin;
