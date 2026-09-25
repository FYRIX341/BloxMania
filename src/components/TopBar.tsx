import React from 'react';
import { Volume2, VolumeX, Menu, Plus, RefreshCw, Palette, UserPlus } from 'lucide-react';

interface TopBarProps {
  playerAlive: boolean;
  respawnCountdown?: number | null;
  fps: number;
  objectCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenPauseMenu: () => void;
  onOpenAvatarEditor: () => void;
  onOpenSpawnMenu: () => void;
  onOpenCustomNpc: () => void;
  onOpenAstraMenu: () => void;
  onResetCharacter: () => void;
  onLeaveGame?: () => void;
  isPauseOpen: boolean;
  isAstraOpen: boolean;
  isSpawnOpen: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  playerAlive,
  respawnCountdown,
  fps,
  objectCount,
  soundEnabled,
  onToggleSound,
  onOpenPauseMenu,
  onOpenAvatarEditor,
  onOpenSpawnMenu,
  onOpenCustomNpc,
  onOpenAstraMenu,
  onResetCharacter,
  onLeaveGame,
  isPauseOpen,
  isAstraOpen,
  isSpawnOpen,
}) => {
  return (
    <div className="fixed top-3 left-3 right-3 z-40 flex items-center justify-between px-3 sm:px-4 py-2 bg-black/65 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl text-white select-none">
      {/* Brand & Roblox Esc Menu Trigger */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Classic Roblox Logo / Pause Menu Trigger Button */}
        <button
          onClick={onOpenPauseMenu}
          title="Open Roblox Pause Menu (Esc)"
          className={`flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border transition group ${
            isPauseOpen
              ? 'bg-red-600/40 border-red-500 shadow-md shadow-red-500/30 text-white'
              : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-200'
          }`}
        >
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-red-600 to-amber-500 flex items-center justify-center font-black text-white text-xs shadow-inner">
            A
          </div>
          <span className="font-extrabold text-xs hidden sm:inline group-hover:text-amber-300 transition">
            Menu <span className="font-mono text-[10px] text-zinc-400 font-normal">[Esc]</span>
          </span>
        </button>

        {onLeaveGame && (
          <button
            onClick={onLeaveGame}
            title="Leave to BloxMania Hub"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-red-500/30 bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs font-bold transition"
          >
            <span>Leave</span>
          </button>
        )}

        <div className="hidden lg:block border-l border-white/10 pl-3">
          <div className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-yellow-200 via-amber-300 to-white bg-clip-text text-transparent">
            Noob Sandbox 3D
          </div>
          <div className="text-[10px] text-zinc-400 font-medium">Astra Revival &bull; 2007-2013 Sky</div>
        </div>
      </div>

      {/* Live Status Indicators */}
      <div className="flex items-center gap-2 sm:gap-4 text-xs">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-lg border border-white/10">
          <span
            className={`w-2 h-2 rounded-full animate-pulse ${
              playerAlive ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'
            }`}
          />
          <span className="text-zinc-300 font-medium">
            {playerAlive
              ? 'Alive'
              : respawnCountdown
              ? `Respawning (${respawnCountdown}s)`
              : 'Disassembled'}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-lg border border-white/10 text-zinc-300">
          <span className="text-zinc-400">Entities:</span>
          <span className="font-mono font-semibold text-amber-300">{objectCount}</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-white/10 text-zinc-400 font-mono text-[11px]">
          <span>{fps} FPS</span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-zinc-300 hover:text-white"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
        </button>

        {!playerAlive && (
          <button
            onClick={onResetCharacter}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/30"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Respawn</span>
          </button>
        )}

        {/* Custom NPC Spawner */}
        <button
          onClick={onOpenCustomNpc}
          title="Create Custom NPC"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 transition shadow-sm"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Custom NPC</span>
        </button>

        {/* Avatar Customizer */}
        <button
          onClick={onOpenAvatarEditor}
          title="Avatar & Face Customizer"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-400/30 transition"
        >
          <Palette className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Avatar</span>
        </button>

        {/* Spawn Menu */}
        <button
          onClick={onOpenSpawnMenu}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition ${
            isSpawnOpen
              ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/30'
              : 'bg-white/5 hover:bg-white/10 text-zinc-200 border-white/10'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Spawn</span>
        </button>

        {/* Astra Physics Sliders */}
        <button
          onClick={onOpenAstraMenu}
          title="Astra Physics Menu"
          className={`p-2 rounded-xl border transition ${
            isAstraOpen
              ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/30'
              : 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10'
          }`}
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
