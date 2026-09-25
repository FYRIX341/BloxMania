import React, { useState, useEffect } from 'react';
import { X, Play, CheckCircle, Sparkles, Tv } from 'lucide-react';
import { bloxStore } from '../services/bloxStore';

interface AdPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed: (amount: number) => void;
}

export const AdPlayerModal: React.FC<AdPlayerModalProps> = ({
  isOpen,
  onClose,
  onRewardClaimed,
}) => {
  const [currentAdIndex, setCurrentAdIndex] = useState(0); // 0 = first ad, 1 = second ad, 2 = done
  const [countdown, setCountdown] = useState(5);
  const [isPlaying, setIsPlaying] = useState(true);

  const ads = [
    {
      title: 'Bloxy Cola™',
      tagline: 'Taste the Classic Brick Flavor!',
      desc: 'Now with 100% more Carbonated Studs! Preferred by 9 out of 10 Noobs across the metaverse.',
      bg: 'from-red-600 via-amber-600 to-yellow-500',
      icon: '🥤',
    },
    {
      title: "Noob's Fresh Pizza Palace",
      tagline: 'Hot & Cheesy Delivered in 3 Studs!',
      desc: 'Made fresh in CityTopia! Use code BLOXMANIA for a free digital pepperoni slice on your avatar.',
      bg: 'from-amber-600 via-orange-600 to-red-700',
      icon: '🍕',
    },
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentAdIndex(0);
      setCountdown(5);
      return;
    }

    if (currentAdIndex < 2) {
      setCountdown(5);
      const timer = window.setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            if (currentAdIndex === 0) {
              setCurrentAdIndex(1);
            } else {
              setCurrentAdIndex(2);
              bloxStore.completeWatchingAds();
              onRewardClaimed(10);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen, currentAdIndex, onRewardClaimed]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
      <div className="w-full max-w-md bg-zinc-950 border border-white/20 rounded-3xl p-6 shadow-2xl text-white flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Tv className="w-5 h-5 text-amber-400" />
            <span className="font-extrabold text-sm text-zinc-100">
              BloxMania TV &bull; Sponsor Commercial
            </span>
          </div>
          {currentAdIndex >= 2 && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Commercial Stage */}
        {currentAdIndex < 2 ? (
          <div className="flex flex-col gap-4">
            <div
              className={`w-full h-52 rounded-2xl bg-gradient-to-br ${ads[currentAdIndex].bg} p-6 flex flex-col justify-between shadow-xl relative overflow-hidden`}
            >
              <div className="flex items-center justify-between text-xs font-bold bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-white/90 w-fit">
                <span>Ad {currentAdIndex + 1} of 2</span>
              </div>

              <div className="flex flex-col items-center text-center my-auto">
                <span className="text-5xl mb-2 animate-bounce">{ads[currentAdIndex].icon}</span>
                <h3 className="text-xl font-black text-white drop-shadow-md">
                  {ads[currentAdIndex].title}
                </h3>
                <p className="text-xs font-bold text-yellow-200 mt-1">
                  {ads[currentAdIndex].tagline}
                </p>
                <p className="text-[11px] text-white/80 mt-1 max-w-xs">
                  {ads[currentAdIndex].desc}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-white/80">
                <span>Sponsor: BloxMania Media</span>
                <span className="font-mono font-bold bg-black/50 px-2 py-0.5 rounded-lg">
                  Next in {countdown}s
                </span>
              </div>
            </div>

            <div className="text-center text-xs text-zinc-400">
              Watch both kid-safe commercials to claim your <strong>10 Bloxies</strong>!
            </div>
          </div>
        ) : (
          /* Finished Screen */
          <div className="flex flex-col items-center text-center gap-3 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 shadow-xl">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-emerald-300">
              +10 Bloxies Claimed!
            </h3>
            <p className="text-xs text-zinc-300 max-w-xs">
              Thanks for watching! Your Bloxies have been added to your wallet. You can watch ads again in 10 minutes.
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg transition"
            >
              Collect & Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
