import React from 'react';
import { X, Sparkles, Check, RotateCcw, Palette } from 'lucide-react';
import { BodyPartColors, FaceType } from '../game/types';
import { textureService } from '../game/textures';

interface AvatarCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  colors: BodyPartColors;
  currentFace: FaceType;
  onUpdateColors: (colors: BodyPartColors) => void;
  onUpdateFace: (face: FaceType) => void;
  onResetCharacter: () => void;
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

export const AvatarCustomizerModal: React.FC<AvatarCustomizerModalProps> = ({
  isOpen,
  onClose,
  colors,
  currentFace,
  onUpdateColors,
  onUpdateFace,
  onResetCharacter,
}) => {
  if (!isOpen) return null;

  const presets = [
    {
      name: 'Classic Noob',
      face: 'default' as FaceType,
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
      face: 'checkit' as FaceType,
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
      face: 'winning' as FaceType,
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
      name: 'Chill Guy',
      face: 'chill' as FaceType,
      colors: {
        head: '#ffd1a4',
        torso: '#27ae60',
        leftArm: '#ffd1a4',
        rightArm: '#ffd1a4',
        leftLeg: '#2c3e50',
        rightLeg: '#2c3e50',
      },
    },
    {
      name: 'Man Face Chad',
      face: 'man' as FaceType,
      colors: {
        head: '#F5CD30',
        torso: '#8e44ad',
        leftArm: '#F5CD30',
        rightArm: '#F5CD30',
        leftLeg: '#2c3e50',
        rightLeg: '#2c3e50',
      },
    },
    {
      name: 'Zombie',
      face: 'shocked' as FaceType,
      colors: {
        head: '#55efc4',
        torso: '#2d3436',
        leftArm: '#55efc4',
        rightArm: '#55efc4',
        leftLeg: '#636e72',
        rightLeg: '#636e72',
      },
    },
  ];

  const handleColorChange = (part: keyof BodyPartColors, color: string) => {
    onUpdateColors({
      ...colors,
      [part]: color,
    });
  };

  const handleApplyPreset = (p: typeof presets[0]) => {
    onUpdateColors(p.colors);
    onUpdateFace(p.face);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-zinc-950/95 border border-purple-500/40 rounded-2xl p-5 shadow-2xl text-white flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-purple-600 flex items-center justify-center text-white font-black">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-purple-200">Avatar Customizer</h2>
              <p className="text-[11px] text-zinc-400">Change your classic Roblox face, skin, and limb colors</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Classic Faces Selection */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Classic Roblox Faces</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">
              Selected: {CLASSIC_FACES.find((f) => f.id === currentFace)?.name}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {CLASSIC_FACES.map((f) => {
              const isSelected = currentFace === f.id;
              const thumb = textureService.getFaceThumbnail(f.id);
              return (
                <button
                  type="button"
                  key={f.id}
                  onClick={() => onUpdateFace(f.id)}
                  className={`flex flex-col items-center gap-1 p-1.5 rounded-xl border transition ${
                    isSelected
                      ? 'bg-purple-600/30 border-purple-400 shadow-md shadow-purple-600/40 scale-105'
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

        {/* 2. Quick Presets */}
        <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
            Iconic Avatars
          </span>
          <div className="grid grid-cols-3 gap-2">
            {presets.map((p) => (
              <button
                type="button"
                key={p.name}
                onClick={() => handleApplyPreset(p)}
                className="flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left text-xs transition"
              >
                <div
                  className="w-4 h-4 rounded-full border border-black/20 shrink-0"
                  style={{ backgroundColor: p.colors.head }}
                />
                <span className="font-semibold text-zinc-200 truncate">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. 6 Body Part Color Pickers */}
        <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
            Limb Colors
          </span>
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
                <span className="text-zinc-300 text-[11px] truncate">{label}</span>
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

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={onResetCharacter}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 rounded-xl text-xs font-bold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Character</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition shadow-lg shadow-purple-600/30"
          >
            <Check className="w-4 h-4" />
            <span>Done Customizing</span>
          </button>
        </div>
      </div>
    </div>
  );
};
