import React from 'react';
import { Users, Edit3 } from 'lucide-react';
import { CharacterData } from '../game/types';

interface LeaderboardProps {
  characters: CharacterData[];
  onOpenRename: (id: string, currentName: string) => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ characters, onOpenRename }) => {
  return (
    <div className="fixed top-18 left-3 z-30 w-56 sm:w-64 max-h-80 overflow-y-auto bg-black/65 backdrop-blur-xl border border-white/10 rounded-2xl p-3 text-white shadow-xl select-none hidden sm:block">
      {/* Title */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs font-bold text-zinc-300 uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-amber-400" />
          <span>Characters</span>
        </div>
        <span className="font-mono text-amber-300 font-bold">{characters.length}</span>
      </div>

      {/* List */}
      <div className="flex flex-col gap-1.5">
        {characters.length === 0 ? (
          <div className="text-[11px] text-zinc-500 italic py-2 text-center">No characters active</div>
        ) : (
          characters.map((c) => {
            const healthRatio = Math.max(0, Math.min(1, c.health / c.maxHealth));
            return (
              <div
                key={c.id}
                className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 text-xs hover:border-white/15 transition"
              >
                <div className="flex flex-col flex-1 mr-2 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: c.colors.head || '#f5cd30' }}
                    />
                    <span className="font-bold truncate text-zinc-200">{c.name}</span>
                    {c.isPlayer && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-400/20">
                        You
                      </span>
                    )}
                  </div>

                  {/* Health Bar */}
                  <div className="w-full h-1.5 bg-black/40 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-200 ${
                        healthRatio > 0.5 ? 'bg-emerald-400' : healthRatio > 0.2 ? 'bg-amber-400' : 'bg-red-500'
                      }`}
                      style={{ width: `${healthRatio * 100}%` }}
                    />
                  </div>
                </div>

                {/* Rename Button */}
                <button
                  onClick={() => onOpenRename(c.id, c.name)}
                  title="Rename"
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
