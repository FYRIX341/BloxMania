import React, { useState } from 'react';
import { X, UserPlus, Sparkles, Activity, Shield, Zap } from 'lucide-react';
import { CustomNpcConfig, FaceType, NpcBehavior, BodyPartColors } from '../game/types';
import { textureService } from '../game/textures';

interface CustomNpcSpawnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpawn: (config: CustomNpcConfig) => void;
}

const CLASSIC_FACES: { id: FaceType; name: string }[] = [
  { id: 'default', name: 'Classic Smile' },
  { id: 'chill', name: 'Chill Face' },
  { id: 'man', name: 'Man Face' },
  { id: 'checkit', name: 'Check It' },
  { id: 'epic', name: 'Epic Face' },
  { id: 'winning', name: 'Winning Smile' },
  { id: 'grin', name: 'Grin' },
  { id: 'tongue', name: 'Silly Fun' },
  { id: 'skeptical', name: 'Skeptical' },
  { id: 'shocked', name: 'Shocked / OOF' },
];

export const CustomNpcSpawnerModal: React.FC<CustomNpcSpawnerModalProps> = ({
  isOpen,
  onClose,
  onSpawn,
}) => {
  const [name, setName] = useState('Custom Noob');
  const [face, setFace] = useState<FaceType>('default');
  const [speed, setSpeed] = useState(8);
  const [health, setHealth] = useState(100);
  const [behavior, setBehavior] = useState<NpcBehavior>('wander');
  const [colors, setColors] = useState<BodyPartColors>({
    head: '#F5CD30',
    torso: '#0D69AC',
    leftArm: '#F5CD30',
    rightArm: '#F5CD30',
    leftLeg: '#A4BD47',
    rightLeg: '#A4BD47',
  });

  if (!isOpen) return null;

  const handleColorChange = (part: keyof BodyPartColors, color: string) => {
    setColors((prev) => ({ ...prev, [part]: color }));
  };

  const handlePreset = (presetColors: BodyPartColors, presetFace: FaceType = 'default') => {
    setColors(presetColors);
    setFace(presetFace);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSpawn({
      name: name.trim() || 'Custom Noob',
      face,
      colors,
      speed,
      health,
      behavior,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-zinc-950/95 border border-amber-500/40 rounded-2xl p-5 shadow-2xl text-white flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-500 flex items-center justify-center text-black font-black">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-amber-300">Custom NPC Spawner</h2>
              <p className="text-[11px] text-zinc-400">Design your own 3D character with custom face, speed & colors</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          {/* NPC Name */}
          <div>
            <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block mb-1.5">
              Character Name
            </label>
            <input
              type="text"
              maxLength={24}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Friendly Noob"
              className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Classic Face Selection */}
          <div>
            <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block mb-1.5">
              Select Classic Roblox Face
            </label>
            <div className="grid grid-cols-5 gap-2">
              {CLASSIC_FACES.map((f) => {
                const isSelected = face === f.id;
                const thumb = textureService.getFaceThumbnail(f.id);
                return (
                  <button
                    type="button"
                    key={f.id}
                    onClick={() => setFace(f.id)}
                    className={`flex flex-col items-center gap-1 p-1.5 rounded-xl border transition ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/20 scale-105'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <img
                      src={thumb}
                      alt={f.name}
                      className="w-12 h-12 rounded-lg object-contain bg-[#F5CD30] border border-black/20"
                    />
                    <span className="text-[9px] font-bold text-zinc-200 truncate w-full text-center">
                      {f.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Behavior Selection */}
          <div>
            <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block mb-1.5">
              NPC AI Behavior
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'wander' as const, label: 'Wander', desc: 'Walks around' },
                { id: 'follow' as const, label: 'Follow', desc: 'Follows player' },
                { id: 'flee' as const, label: 'Flee', desc: 'Runs away' },
                { id: 'idle' as const, label: 'Idle', desc: 'Stands still' },
              ].map((b) => (
                <button
                  type="button"
                  key={b.id}
                  onClick={() => setBehavior(b.id)}
                  className={`flex flex-col items-center p-2 rounded-xl border text-center transition ${
                    behavior === b.id
                      ? 'bg-purple-600/30 border-purple-400 text-purple-200'
                      : 'bg-white/5 border-white/10 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span className="font-bold text-xs">{b.label}</span>
                  <span className="text-[9px] opacity-75">{b.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stats: Speed & Health */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
            <div>
              <div className="flex justify-between text-zinc-300 mb-1">
                <span className="flex items-center gap-1 font-medium">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>Speed</span>
                </span>
                <span className="font-mono font-bold text-amber-300">{speed} studs/s</span>
              </div>
              <input
                type="range"
                min={3}
                max={30}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-zinc-300 mb-1">
                <span className="flex items-center gap-1 font-medium">
                  <Shield className="w-3 h-3 text-emerald-400" />
                  <span>Health</span>
                </span>
                <span className="font-mono font-bold text-emerald-300">{health} HP</span>
              </div>
              <input
                type="range"
                min={20}
                max={400}
                step={10}
                value={health}
                onChange={(e) => setHealth(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Skin Colors Customization */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                Body Part Colors
              </label>
              {/* Presets */}
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() =>
                    handlePreset(
                      {
                        head: '#F5CD30',
                        torso: '#0D69AC',
                        leftArm: '#F5CD30',
                        rightArm: '#F5CD30',
                        leftLeg: '#A4BD47',
                        rightLeg: '#A4BD47',
                      },
                      'default'
                    )
                  }
                  className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/15 text-[10px] text-zinc-300"
                >
                  Classic
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handlePreset(
                      {
                        head: '#F5CD30',
                        torso: '#c0392b',
                        leftArm: '#F5CD30',
                        rightArm: '#F5CD30',
                        leftLeg: '#2c3e50',
                        rightLeg: '#2c3e50',
                      },
                      'checkit'
                    )
                  }
                  className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/15 text-[10px] text-zinc-300"
                >
                  Guest
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handlePreset(
                      {
                        head: '#55efc4',
                        torso: '#2d3436',
                        leftArm: '#55efc4',
                        rightArm: '#55efc4',
                        leftLeg: '#636e72',
                        rightLeg: '#636e72',
                      },
                      'shocked'
                    )
                  }
                  className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/15 text-[10px] text-zinc-300"
                >
                  Zombie
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
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
                <div
                  key={key}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10"
                >
                  <span className="text-zinc-300 text-[10px] truncate">{label}</span>
                  <input
                    type="color"
                    value={colors[key]}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer border-none bg-transparent"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-zinc-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black transition shadow-lg shadow-amber-500/30"
            >
              <UserPlus className="w-4 h-4" />
              <span>Spawn Custom NPC</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
