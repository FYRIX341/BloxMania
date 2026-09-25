import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

interface RenameModalProps {
  isOpen: boolean;
  currentName: string;
  onSave: (newName: string) => void;
  onClose: () => void;
}

export const RenameModal: React.FC<RenameModalProps> = ({
  isOpen,
  currentName,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(currentName);

  useEffect(() => {
    setName(currentName);
  }, [currentName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
      <div className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-2xl p-5 shadow-2xl text-white">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <h3 className="text-sm font-bold text-zinc-100">Rename Character</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-zinc-400 block mb-1.5">Character Name</label>
            <input
              type="text"
              maxLength={20}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name..."
              className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-amber-400 text-white placeholder-zinc-500"
              autoFocus
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-zinc-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black transition shadow-lg shadow-amber-500/20"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Name</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
