import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

export const ControlsOverlay: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 left-4 z-30 select-none hidden md:block">
      {isOpen ? (
        <div className="p-3.5 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl text-white text-xs w-64 flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5 font-bold text-zinc-200">
            <span>Controls Guide</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-zinc-300">
            <span className="font-mono text-amber-300">W A S D</span>
            <span>Move</span>

            <span className="font-mono text-amber-300">Space</span>
            <span>Jump</span>

            <span className="font-mono text-amber-300">Shift</span>
            <span>Sprint</span>

            <span className="font-mono text-amber-300">Right Click</span>
            <span>Orbit Camera</span>

            <span className="font-mono text-amber-300">Scroll</span>
            <span>Zoom In/Out</span>

            <span className="font-mono text-amber-300">Left Click</span>
            <span>Use Tool / Fling</span>

            <span className="font-mono text-amber-300">1 - 6</span>
            <span>Select Hotbar (6: Wand)</span>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-zinc-300 hover:text-white rounded-xl text-xs font-medium transition shadow-lg"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Controls</span>
        </button>
      )}
    </div>
  );
};
