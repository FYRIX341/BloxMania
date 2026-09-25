import React from 'react';
import { X, Box, Bomb, UserPlus, Users, Sparkles, Skull, RefreshCw, Zap, ShieldAlert } from 'lucide-react';

interface SpawnMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCustomNpc: () => void;
  onSpawnCharacter: (type: 'clone' | 'noob' | 'guest' | 'zombie' | 'gold' | 'random') => void;
  onSpawnHorde: () => void;
  onSpawnCrate: () => void;
  onSpawnBomb: () => void;
  onSpawnTrampoline: () => void;
  onResetSandbox: () => void;
}

export const SpawnMenu: React.FC<SpawnMenuProps> = ({
  isOpen,
  onClose,
  onOpenCustomNpc,
  onSpawnCharacter,
  onSpawnHorde,
  onSpawnCrate,
  onSpawnBomb,
  onSpawnTrampoline,
  onResetSandbox,
}) => {
  if (!isOpen) return null;

  const characters = [
    {
      id: 'clone' as const,
      label: 'Clone of You',
      desc: 'Matches your custom colors',
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
      color: 'hover:border-purple-400/40',
    },
    {
      id: 'noob' as const,
      label: 'Classic Noob',
      desc: 'Traditional yellow/blue R6',
      icon: <UserPlus className="w-4 h-4 text-yellow-400" />,
      color: 'hover:border-yellow-400/40',
    },
    {
      id: 'guest' as const,
      label: 'Guest 666',
      desc: 'Dark & Red cursed guest',
      icon: <Skull className="w-4 h-4 text-red-500" />,
      color: 'hover:border-red-400/40',
    },
    {
      id: 'zombie' as const,
      label: 'Zombie Noob',
      desc: 'Green undead ragdoll',
      icon: <ShieldAlert className="w-4 h-4 text-emerald-400" />,
      color: 'hover:border-emerald-400/40',
    },
    {
      id: 'gold' as const,
      label: 'Golden Noob',
      desc: 'Pure shiny gold avatar',
      icon: <Sparkles className="w-4 h-4 text-amber-300" />,
      color: 'hover:border-amber-400/40',
    },
    {
      id: 'random' as const,
      label: 'Random Avatar',
      desc: 'Random retro colors & outfit',
      icon: <UserPlus className="w-4 h-4 text-cyan-300" />,
      color: 'hover:border-cyan-400/40',
    },
  ];

  const objects = [
    {
      label: 'Wooden Crate',
      desc: 'Pushable & stackable block',
      icon: <Box className="w-4 h-4 text-amber-500" />,
      onClick: onSpawnCrate,
      color: 'hover:border-amber-400/40',
    },
    {
      label: 'Classic Bomb',
      desc: '3-second timed explosive',
      icon: <Bomb className="w-4 h-4 text-red-400" />,
      onClick: onSpawnBomb,
      color: 'hover:border-red-400/40',
    },
    {
      label: 'Trampoline',
      desc: 'High bounce spring pad',
      icon: <Zap className="w-4 h-4 text-emerald-400" />,
      onClick: onSpawnTrampoline,
      color: 'hover:border-emerald-400/40',
    },
  ];

  return (
    <div className="fixed top-18 right-3 z-40 w-80 max-h-[85vh] overflow-y-auto bg-black/85 backdrop-blur-2xl border border-amber-500/30 rounded-2xl p-4 text-white shadow-2xl select-none flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div>
          <div className="text-sm font-extrabold text-amber-300">Spawn Menu</div>
          <div className="text-[11px] text-zinc-400">Click to place into 3D world</div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Characters Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>Characters</span>
          </span>
          <button
            onClick={onSpawnHorde}
            className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 transition"
          >
            <Users className="w-3 h-3" />
            <span>Spawn Mob (x5)</span>
          </button>
        </div>

        {/* Custom NPC Spawner Banner Button */}
        <button
          onClick={() => {
            onClose();
            onOpenCustomNpc();
          }}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-purple-600/20 border border-amber-400/40 hover:border-amber-300 transition text-left"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500 text-black">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-200">Custom NPC Creator</div>
              <div className="text-[10px] text-zinc-300">Choose Face, Colors, Speed & AI</div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-400 text-black shadow-sm">
            Open
          </span>
        </button>

        <div className="grid grid-cols-2 gap-1.5">
          {characters.map((char) => (
            <button
              key={char.id}
              onClick={() => onSpawnCharacter(char.id)}
              className={`flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition text-left ${char.color}`}
            >
              <div className="p-1.5 rounded-lg bg-black/40 border border-white/10 shrink-0">
                {char.icon}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-zinc-100 truncate">{char.label}</div>
                <div className="text-[9px] text-zinc-400 truncate">{char.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Physics Objects Section */}
      <div className="flex flex-col gap-1.5 pt-2 border-t border-white/10">
        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5 mb-0.5">
          <Box className="w-3.5 h-3.5" />
          <span>Physics Objects</span>
        </span>

        {objects.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className={`flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition text-left ${item.color}`}
          >
            <div className="p-2 rounded-lg bg-black/40 border border-white/10">
              {item.icon}
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-100">{item.label}</div>
              <div className="text-[10px] text-zinc-400">{item.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Reset Sandbox Button */}
      <div className="pt-2 border-t border-white/10">
        <button
          onClick={onResetSandbox}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white/5 hover:bg-red-500/20 text-zinc-300 hover:text-red-200 border border-white/10 hover:border-red-500/30 rounded-xl text-xs font-bold transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset All Sandbox Objects</span>
        </button>
      </div>
    </div>
  );
};
