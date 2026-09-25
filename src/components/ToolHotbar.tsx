import React from 'react';
import { Magnet, Rocket, Sword, Bomb, Box, UserPlus } from 'lucide-react';
import { ToolType } from '../game/types';

interface ToolHotbarProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
}

export const ToolHotbar: React.FC<ToolHotbarProps> = ({ activeTool, onSelectTool }) => {
  const tools: { id: ToolType; key: string; name: string; icon: React.ReactNode }[] = [
    { id: 'gravity', key: '1', name: 'Gravity Fling', icon: <Magnet className="w-5 h-5 text-cyan-400" /> },
    { id: 'rocket', key: '2', name: 'Rocket', icon: <Rocket className="w-5 h-5 text-orange-400" /> },
    { id: 'sword', key: '3', name: 'Classic Sword', icon: <Sword className="w-5 h-5 text-zinc-200" /> },
    { id: 'bomb', key: '4', name: 'Bomb Throw', icon: <Bomb className="w-5 h-5 text-red-400" /> },
    { id: 'crate', key: '5', name: 'Crate Place', icon: <Box className="w-5 h-5 text-amber-400" /> },
    { id: 'spawner', key: '6', name: 'Noob Wand', icon: <UserPlus className="w-5 h-5 text-yellow-300" /> },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1.5 bg-black/75 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl select-none">
      {tools.map((t) => {
        const isActive = activeTool === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onSelectTool(isActive ? 'none' : t.id)}
            className={`relative flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl transition border ${
              isActive
                ? 'bg-white/20 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-105'
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-zinc-300'
            }`}
          >
            {/* Slot Number Badge */}
            <span className="absolute top-1 left-1.5 text-[10px] font-mono font-bold text-zinc-400">
              {t.key}
            </span>

            {/* Icon */}
            <div className="mt-1">{t.icon}</div>

            {/* Label */}
            <span className="text-[9px] font-medium text-zinc-300 truncate max-w-[50px] mt-0.5">
              {t.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};
