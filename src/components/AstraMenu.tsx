import React from 'react';
import { X, RotateCcw, Trash2, Zap, Palette, Gauge, Sliders } from 'lucide-react';
import { GameSettings, BodyPartColors } from '../game/types';

interface AstraMenuProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onResetCharacter: () => void;
  onDeleteCharacter: () => void;
  onClearSandbox: () => void;
}

export const AstraMenu: React.FC<AstraMenuProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetCharacter,
  onDeleteCharacter,
  onClearSandbox,
}) => {
  if (!isOpen) return null;

  const handleColorChange = (part: keyof BodyPartColors, color: string) => {
    onUpdateSettings({
      colors: {
        ...settings.colors,
        [part]: color,
      },
    });
  };

  const applyPreset = (preset: { name: string; colors: BodyPartColors }) => {
    onUpdateSettings({ colors: { ...preset.colors } });
  };

  const presets = [
    {
      name: 'Classic Noob',
      colors: {
        head: '#F5CD30',
        torso: '#0D69AC',
        leftArm: '#F5CD30',
        rightArm: '#F5CD30',
        leftLeg: '#A4BD47',
        rightLeg: '#A4BD47',
      },
    },
    {
      name: 'Guest 666',
      colors: {
        head: '#F5CD30',
        torso: '#c0392b',
        leftArm: '#F5CD30',
        rightArm: '#F5CD30',
        leftLeg: '#2c3e50',
        rightLeg: '#2c3e50',
      },
    },
    {
      name: 'Golden Noob',
      colors: {
        head: '#f1c40f',
        torso: '#f39c12',
        leftArm: '#f1c40f',
        rightArm: '#f1c40f',
        leftLeg: '#e67e22',
        rightLeg: '#e67e22',
      },
    },
    {
      name: 'Classic Bacon',
      colors: {
        head: '#ffd1a4',
        torso: '#2980b9',
        leftArm: '#ffd1a4',
        rightArm: '#ffd1a4',
        leftLeg: '#34495e',
        rightLeg: '#34495e',
      },
    },
  ];

  return (
    <div className="fixed top-18 right-3 z-40 w-80 max-h-[85vh] overflow-y-auto bg-black/80 backdrop-blur-2xl border border-purple-500/30 rounded-2xl p-5 text-white shadow-2xl select-none flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-purple-600 flex items-center justify-center">
            <Sliders className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <div className="text-base font-extrabold text-purple-200">Astra Menu</div>
            <div className="text-[11px] text-zinc-400">Character & Physics Settings</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Physics Sliders */}
      <div className="flex flex-col gap-3">
        <div className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
          <Gauge className="w-3.5 h-3.5" />
          <span>Movement Physics</span>
        </div>

        {/* Walk Speed */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-zinc-300">
            <span>Walk Speed</span>
            <span className="font-mono text-purple-300 font-bold">{settings.walkSpeed}</span>
          </div>
          <input
            type="range"
            min={10}
            max={50}
            step={1}
            value={settings.walkSpeed}
            onChange={(e) => onUpdateSettings({ walkSpeed: Number(e.target.value) })}
            className="w-full accent-purple-500 cursor-pointer"
          />
        </div>

        {/* Jump Power */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-zinc-300">
            <span>Jump Power</span>
            <span className="font-mono text-purple-300 font-bold">{settings.jumpPower}</span>
          </div>
          <input
            type="range"
            min={20}
            max={75}
            step={1}
            value={settings.jumpPower}
            onChange={(e) => onUpdateSettings({ jumpPower: Number(e.target.value) })}
            className="w-full accent-purple-500 cursor-pointer"
          />
        </div>

        {/* Run Speed */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-zinc-300">
            <span>Run Speed</span>
            <span className="font-mono text-purple-300 font-bold">{settings.runSpeed}</span>
          </div>
          <input
            type="range"
            min={25}
            max={75}
            step={1}
            value={settings.runSpeed}
            onChange={(e) => onUpdateSettings({ runSpeed: Number(e.target.value) })}
            className="w-full accent-purple-500 cursor-pointer"
          />
        </div>

        {/* Gravity */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-zinc-300">
            <span>Gravity</span>
            <span className="font-mono text-purple-300 font-bold">
              {settings.gravity < 50 ? 'Moon' : settings.gravity > 120 ? 'Heavy' : 'Normal'} ({settings.gravity})
            </span>
          </div>
          <input
            type="range"
            min={25}
            max={180}
            step={5}
            value={settings.gravity}
            onChange={(e) => onUpdateSettings({ gravity: Number(e.target.value) })}
            className="w-full accent-purple-500 cursor-pointer"
          />
        </div>

        {/* Running Toggle */}
        <button
          onClick={() => onUpdateSettings({ runningEnabled: !settings.runningEnabled })}
          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold border transition ${
            settings.runningEnabled
              ? 'bg-purple-600/40 border-purple-500 text-purple-100'
              : 'bg-white/5 border-white/10 text-zinc-400'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span>Shift Sprinting</span>
          </span>
          <span className="font-mono">{settings.runningEnabled ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Colors & Customization */}
      <div className="flex flex-col gap-3 pt-2 border-t border-white/10">
        <div className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" />
            <span>Body Part Colors</span>
          </span>
        </div>

        {/* Quick Presets */}
        <div className="grid grid-cols-2 gap-1.5">
          {presets.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className="text-[11px] py-1 px-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-left truncate transition"
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* 6 Individual Color Pickers */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {(
            [
              ['head', 'Head'],
              ['torso', 'Torso'],
              ['leftArm', 'Left Arm'],
              ['rightArm', 'Right Arm'],
              ['leftLeg', 'Left Leg'],
              ['rightLeg', 'Right Leg'],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between px-2.5 py-1.5 bg-white/5 rounded-xl border border-white/10">
              <span className="text-zinc-300 text-[11px]">{label}</span>
              <input
                type="color"
                value={settings.colors[key]}
                onChange={(e) => handleColorChange(key, e.target.value)}
                className="w-5 h-5 rounded cursor-pointer border-none bg-transparent"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
        <button
          onClick={onResetCharacter}
          className="flex items-center justify-center gap-2 py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-purple-600/30"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Character (OOF)</span>
        </button>

        <button
          onClick={onDeleteCharacter}
          className="flex items-center justify-center gap-2 py-2 px-3 bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/30 rounded-xl text-xs font-bold transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Disassemble Character</span>
        </button>

        <button
          onClick={onClearSandbox}
          className="flex items-center justify-center gap-2 py-2 px-3 bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 rounded-xl text-xs font-bold transition"
        >
          <span>Clear All Sandbox Objects</span>
        </button>
      </div>
    </div>
  );
};
