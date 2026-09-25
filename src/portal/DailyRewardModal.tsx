import React from 'react';
import { X, Gift, Sparkles, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { bloxStore } from '../services/bloxStore';

interface DailyRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimed: () => void;
}

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
  isOpen,
  onClose,
  onClaimed,
}) => {
  if (!isOpen) return null;

  const handleClaim = () => {
    const success = bloxStore.claimDaily();
    if (success) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback
      }
      onClaimed();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
      <div className="w-full max-w-sm bg-zinc-950 border border-amber-500/30 rounded-3xl p-6 shadow-2xl text-white flex flex-col items-center text-center gap-4">
        {/* Close Button */}
        <div className="w-full flex justify-end">
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Icon */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-black shadow-xl shadow-amber-500/30 animate-bounce">
          <Gift className="w-10 h-10" />
        </div>

        <div>
          <h2 className="text-xl font-black text-amber-300">Daily Reward Ready!</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Log in every day to claim your free Bloxies and save up for legendary accessories!
          </p>
        </div>

        {/* Reward amount */}
        <div className="w-full py-4 px-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-2xl font-black font-mono text-amber-300">+100 BLOXIES</span>
        </div>

        <button
          onClick={handleClaim}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-sm rounded-2xl shadow-xl shadow-amber-500/30 transition active:scale-95 flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Claim 100 Bloxies Now</span>
        </button>
      </div>
    </div>
  );
};
