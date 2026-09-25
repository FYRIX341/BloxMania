import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  LogOut,
  Users,
  Settings as SettingsIcon,
  HelpCircle,
  Palette,
  Volume2,
  VolumeX,
  Gauge,
  Zap,
  Edit3,
} from 'lucide-react';
import { GameSettings, CharacterData } from '../game/types';
import { textureService } from '../game/textures';

interface RobloxPauseMenuProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  characters: CharacterData[];
  onResetCharacter: () => void;
  onOpenAvatarEditor: () => void;
  onOpenRename: (id: string, currentName: string) => void;
  onLeaveGame?: () => void;
  gameTitle?: string;
}

type TabType = 'game' | 'players' | 'settings' | 'controls' | 'avatar';

export const RobloxPauseMenu: React.FC<RobloxPauseMenuProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  characters,
  onResetCharacter,
  onOpenAvatarEditor,
  onOpenRename,
  onLeaveGame,
  gameTitle = 'Noob Sandbox 3D',
}) => {
  const [currentTab, setCurrentTab] = useState<TabType>('game');
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  // Allow ESC to close menu
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.code === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLeaveGame = () => {
    onClose();
    if (onLeaveGame) {
      onLeaveGame();
    }
  };

  const handleReset = () => {
    onResetCharacter();
    setConfirmReset(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md select-none animate-fade-in">
      <div className="w-full max-w-2xl bg-zinc-950/95 border border-white/15 rounded-3xl shadow-2xl text-white overflow-hidden flex flex-col max-h-[90vh]">
        {/* Classic Roblox Menu Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-900/90 border-b border-white/10">
          <div className="flex items-center gap-3">
            {/* Retro Roblox Square Logo / Astra Icon */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-amber-500 flex items-center justify-center shadow-lg font-black text-white text-base tracking-tighter border border-white/20">
              A
            </div>
            <div>
              <div className="text-base font-black tracking-wide bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                {gameTitle}
              </div>
              <div className="text-[11px] text-zinc-400 font-medium">BloxMania Portal &bull; Pause Menu</div>
            </div>
          </div>

          {/* Quick Resume Button */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition shadow-lg shadow-emerald-600/30"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Resume (Esc)</span>
          </button>
        </div>

        {/* Tab Navigation (Roblox Esc Menu Style) */}
        <div className="flex border-b border-white/10 bg-zinc-900/40 px-4 gap-1 overflow-x-auto text-xs font-bold">
          {[
            { id: 'game' as const, label: 'Game', icon: <Play className="w-3.5 h-3.5" /> },
            { id: 'players' as const, label: `Players (${characters.length})`, icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'settings' as const, label: 'Settings', icon: <SettingsIcon className="w-3.5 h-3.5" /> },
            { id: 'controls' as const, label: 'Controls', icon: <HelpCircle className="w-3.5 h-3.5" /> },
            { id: 'avatar' as const, label: 'Avatar & Skin', icon: <Palette className="w-3.5 h-3.5" /> },
          ].map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'avatar') {
                    onClose();
                    onOpenAvatarEditor();
                  } else {
                    setCurrentTab(tab.id);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
                  isActive
                    ? 'border-amber-400 text-amber-300 bg-white/5'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* 1. GAME TAB: Resume, Reset Character, Leave Game */}
          {currentTab === 'game' && (
            <div className="flex flex-col gap-4 max-w-md mx-auto py-4">
              <button
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-emerald-600/30 transition"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Resume Game</span>
              </button>

              {/* Reset Character with Confirmation */}
              {confirmReset ? (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col gap-3 text-center">
                  <div className="text-xs font-bold text-amber-200">
                    Are you sure you want to reset your character?
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmReset(false)}
                      className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-zinc-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-extrabold text-black shadow-md shadow-amber-500/30"
                    >
                      Yes, Reset (OOF)
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/15 active:scale-98 text-zinc-200 font-bold text-xs rounded-2xl border border-white/10 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Character</span>
                </button>
              )}

              {/* Leave Game with Confirmation */}
              {confirmLeave ? (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex flex-col gap-3 text-center">
                  <div className="text-xs font-bold text-red-200">
                    Are you sure you want to leave the game?
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    You will be returned to the BloxMania website hub.
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmLeave(false)}
                      className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-zinc-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleLeaveGame}
                      className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-extrabold text-white shadow-md shadow-red-600/30"
                    >
                      Yes, Leave Game
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmLeave(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-red-600/20 hover:bg-red-600/30 active:scale-98 text-red-300 font-bold text-xs rounded-2xl border border-red-500/30 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Leave Game</span>
                </button>
              )}
            </div>
          )}

          {/* 2. PLAYERS TAB: Lists players & NPCs with live skin & face preview */}
          {currentTab === 'players' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span>Total Characters: {characters.length}</span>
                <span>Active Sandbox Inhabitants</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {characters.map((char) => {
                  const healthRatio = Math.max(0, Math.min(1, char.health / char.maxHealth));
                  const faceThumb = textureService.getFaceThumbnail(char.face || 'default');

                  return (
                    <div
                      key={char.id}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition"
                    >
                      {/* Miniature 2D Character Skin Preview */}
                      <div className="relative w-12 h-14 flex flex-col items-center justify-center bg-black/40 rounded-xl p-1 shrink-0 border border-white/10 overflow-hidden">
                        {/* Head with face */}
                        <div
                          className="w-5 h-5 rounded-sm overflow-hidden flex items-center justify-center shrink-0 border border-black/20"
                          style={{ backgroundColor: char.colors.head }}
                        >
                          <img src={faceThumb} alt="face" className="w-full h-full object-cover" />
                        </div>
                        {/* Torso & Arms */}
                        <div className="flex gap-0.5 mt-0.5">
                          <div
                            className="w-1.5 h-3 rounded-xs"
                            style={{ backgroundColor: char.colors.leftArm }}
                          />
                          <div
                            className="w-3 h-3 rounded-xs"
                            style={{ backgroundColor: char.colors.torso }}
                          />
                          <div
                            className="w-1.5 h-3 rounded-xs"
                            style={{ backgroundColor: char.colors.rightArm }}
                          />
                        </div>
                        {/* Legs */}
                        <div className="flex gap-0.5 mt-0.5">
                          <div
                            className="w-1.5 h-3 rounded-xs"
                            style={{ backgroundColor: char.colors.leftLeg }}
                          />
                          <div
                            className="w-1.5 h-3 rounded-xs"
                            style={{ backgroundColor: char.colors.rightLeg }}
                          />
                        </div>
                      </div>

                      {/* Info & Health */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-zinc-100 truncate">
                            {char.name}
                          </span>
                          {char.isPlayer ? (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-300 border border-blue-400/30">
                              YOU
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                              NPC
                            </span>
                          )}
                        </div>

                        {/* Health Bar */}
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 h-2 bg-black/50 rounded-full overflow-hidden border border-white/10">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                healthRatio > 0.5 ? 'bg-emerald-400' : healthRatio > 0.2 ? 'bg-amber-400' : 'bg-red-500'
                              }`}
                              style={{ width: `${healthRatio * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-zinc-400 font-bold shrink-0">
                            {char.health} HP
                          </span>
                        </div>
                      </div>

                      {/* Rename action */}
                      <button
                        onClick={() => onOpenRename(char.id, char.name)}
                        title="Rename"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. SETTINGS TAB */}
          {currentTab === 'settings' && (
            <div className="flex flex-col gap-4 max-w-lg mx-auto py-2 text-xs">
              {/* Sound & Volume */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-2 text-zinc-200">
                    {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
                    <span>Sound Effects</span>
                  </span>
                  <button
                    onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
                    className={`px-3 py-1 rounded-xl font-bold border transition ${
                      settings.soundEnabled ? 'bg-amber-500/20 text-amber-300 border-amber-400/30' : 'bg-white/5 text-zinc-500 border-white/10'
                    }`}
                  >
                    {settings.soundEnabled ? 'ENABLED' : 'MUTED'}
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-zinc-400 text-[11px]">
                    <span>Master Volume</span>
                    <span className="font-mono text-amber-300 font-bold">{Math.round(settings.volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={settings.volume}
                    onChange={(e) => onUpdateSettings({ volume: Number(e.target.value) })}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>
              </div>

              {/* Movement & Physics */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3">
                <div className="font-bold flex items-center gap-2 text-zinc-200">
                  <Gauge className="w-4 h-4 text-purple-400" />
                  <span>Physics & Mechanics</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-zinc-400 text-[11px]">
                    <span>Walk Speed</span>
                    <span className="font-mono text-purple-300 font-bold">{settings.walkSpeed}</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={50}
                    value={settings.walkSpeed}
                    onChange={(e) => onUpdateSettings({ walkSpeed: Number(e.target.value) })}
                    className="w-full accent-purple-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-zinc-400 text-[11px]">
                    <span>Jump Power</span>
                    <span className="font-mono text-purple-300 font-bold">{settings.jumpPower}</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={75}
                    value={settings.jumpPower}
                    onChange={(e) => onUpdateSettings({ jumpPower: Number(e.target.value) })}
                    className="w-full accent-purple-400 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-zinc-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Shift Sprinting</span>
                  </span>
                  <button
                    onClick={() => onUpdateSettings({ runningEnabled: !settings.runningEnabled })}
                    className={`px-3 py-1 rounded-xl font-bold border transition ${
                      settings.runningEnabled ? 'bg-purple-600/30 text-purple-300 border-purple-400/40' : 'bg-white/5 text-zinc-500 border-white/10'
                    }`}
                  >
                    {settings.runningEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. CONTROLS TAB */}
          {currentTab === 'controls' && (
            <div className="flex flex-col gap-3 max-w-lg mx-auto py-2 text-xs">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2.5">
                <span className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">
                  Movement & Camera
                </span>
                <div className="grid grid-cols-2 gap-2 text-zinc-300 text-[11px]">
                  <div className="flex justify-between p-2 bg-black/40 rounded-xl border border-white/5">
                    <span>Move</span>
                    <span className="font-mono font-bold text-amber-400">W, A, S, D</span>
                  </div>
                  <div className="flex justify-between p-2 bg-black/40 rounded-xl border border-white/5">
                    <span>Jump</span>
                    <span className="font-mono font-bold text-amber-400">Space</span>
                  </div>
                  <div className="flex justify-between p-2 bg-black/40 rounded-xl border border-white/5">
                    <span>Sprint</span>
                    <span className="font-mono font-bold text-amber-400">Shift</span>
                  </div>
                  <div className="flex justify-between p-2 bg-black/40 rounded-xl border border-white/5">
                    <span>Orbit Camera</span>
                    <span className="font-mono font-bold text-amber-400">Right Mouse</span>
                  </div>
                  <div className="flex justify-between p-2 bg-black/40 rounded-xl border border-white/5">
                    <span>Zoom</span>
                    <span className="font-mono font-bold text-amber-400">Scroll Wheel</span>
                  </div>
                  <div className="flex justify-between p-2 bg-black/40 rounded-xl border border-white/5">
                    <span>Pause Menu</span>
                    <span className="font-mono font-bold text-amber-400">Esc</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2.5">
                <span className="font-bold text-cyan-300 uppercase tracking-wider text-[11px]">
                  Hotbar Tools (Keys 1 - 6)
                </span>
                <div className="grid grid-cols-2 gap-2 text-zinc-300 text-[11px]">
                  <div className="flex justify-between p-2 bg-black/40 rounded-xl border border-white/5">
                    <span>Gravity Fling</span>
                    <span className="font-mono font-bold text-cyan-400">[ 1 ]</span>
                  </div>
                  <div className="flex justify-between p-2 bg-black/40 rounded-xl border border-white/5">
                    <span>Rocket Launcher</span>
                    <span className="font-mono font-bold text-orange-400">[ 2 ]</span>
                  </div>
                  <div className="flex justify-between p-2 bg-black/40 rounded-xl border border-white/5">
                    <span>Classic Sword</span>
                    <span className="font-mono font-bold text-zinc-300">[ 3 ]</span>
                  </div>
                  <div className="flex justify-between p-2 bg-black/40 rounded-xl border border-white/5">
                    <span>Bomb Throw</span>
                    <span className="font-mono font-bold text-red-400">[ 4 ]</span>
                  </div>
                  <div className="flex justify-between p-2 bg-black/40 rounded-xl border border-white/5">
                    <span>Crate Place</span>
                    <span className="font-mono font-bold text-amber-400">[ 5 ]</span>
                  </div>
                  <div className="flex justify-between p-2 bg-black/40 rounded-xl border border-white/5">
                    <span>Noob Wand</span>
                    <span className="font-mono font-bold text-yellow-300">[ 6 ]</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
