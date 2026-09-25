import React, { useState, useEffect } from 'react';
import { bloxStore, BloxState } from '../services/bloxStore';
import {
  Gamepad2,
  ShoppingBag,
  Users,
  Palette,
  Gift,
  Tv,
  Play,
  Trophy,
  Flame,
  Sparkles,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

interface BloxManiaHubProps {
  onPlayGame: (gameId: 'sandbox' | 'doomspire' | 'citytopia' | 'towerdefense') => void;
  onOpenMarketplace: () => void;
  onOpenAvatarEditor: () => void;
  onOpenFriends: () => void;
  onOpenWatchAds: () => void;
  onOpenDailyReward: () => void;
}

export const BloxManiaHub: React.FC<BloxManiaHubProps> = ({
  onPlayGame,
  onOpenMarketplace,
  onOpenAvatarEditor,
  onOpenFriends,
  onOpenWatchAds,
  onOpenDailyReward,
}) => {
  const [storeState, setStoreState] = useState<BloxState>(bloxStore.getState());
  const [adCooldown, setAdCooldown] = useState(bloxStore.canWatchAds());

  useEffect(() => {
    const unsub = bloxStore.subscribe(() => {
      setStoreState({ ...bloxStore.getState() });
    });

    const interval = setInterval(() => {
      setAdCooldown(bloxStore.canWatchAds());
    }, 1000);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  const games = [
    {
      id: 'doomspire' as const,
      title: 'Doomspire Brickbattle',
      tagline: 'Team Battle on 4 Massive Spires',
      desc: 'Fight Red, Blue, Green & Yellow teams! Use rocket launchers, bombs, trowels, and swords to knock out enemy towers.',
      badge: 'TOP TRENDING',
      playing: '38.4k Playing',
      likes: '97% 👍',
      gradient: 'from-red-600 to-amber-700',
      icon: '🏰',
    },
    {
      id: 'sandbox' as const,
      title: 'Noob Sandbox 3D',
      tagline: 'Classic 2007-2013 Astra Revival',
      desc: 'Full physics sandbox featuring R6 avatars, Lego OOF dismemberment, bombs, fling gravity gun, trampolines, and custom NPC spawner.',
      badge: 'COMMUNITY FAVORITE',
      playing: '24.1k Playing',
      likes: '99% 👍',
      gradient: 'from-emerald-600 to-blue-700',
      icon: '📦',
    },
    {
      id: 'citytopia' as const,
      title: 'CityTopia Roleplay',
      tagline: 'Brookhaven Style Life Simulation',
      desc: 'Explore a vibrant 3D town, own modern villas, drive sports cars with real steering, roleplay jobs as police or chef, and chat with friends!',
      badge: 'ROLEPLAY',
      playing: '45.2k Playing',
      likes: '96% 👍',
      gradient: 'from-purple-600 to-indigo-700',
      icon: '🏙️',
    },
    {
      id: 'towerdefense' as const,
      title: 'Retro Tower Defense',
      tagline: 'Strategic Wave Survival',
      desc: 'Deploy slingshotters, cannons, and laser towers along the winding path to stop waves of invading Noobs and Giant Bosses for Bloxies rewards!',
      badge: 'STRATEGY',
      playing: '18.9k Playing',
      likes: '95% 👍',
      gradient: 'from-blue-600 to-cyan-700',
      icon: '🛡️',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-zinc-950 text-white select-none font-sans flex flex-col">
      {/* BloxMania Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3 bg-zinc-900/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between shadow-2xl">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-red-600 via-amber-500 to-yellow-400 flex items-center justify-center font-black text-black text-lg shadow-lg shadow-red-600/30 border border-white/20">
            B
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight bg-gradient-to-r from-red-500 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
                BloxMania
              </span>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
                Kid-Safe
              </span>
            </div>
            <div className="text-[10px] text-zinc-400">Play, Build & Customize</div>
          </div>
        </div>

        {/* Center Portal Navigation */}
        <nav className="hidden md:flex items-center gap-1.5">
          <button
            onClick={() => {}}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white font-extrabold text-xs"
          >
            <Gamepad2 className="w-4 h-4 text-amber-400" />
            <span>Games</span>
          </button>

          <button
            onClick={onOpenMarketplace}
            className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/10 text-zinc-300 hover:text-white font-bold text-xs transition"
          >
            <ShoppingBag className="w-4 h-4 text-yellow-400" />
            <span>Marketplace</span>
          </button>

          <button
            onClick={onOpenAvatarEditor}
            className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/10 text-zinc-300 hover:text-white font-bold text-xs transition"
          >
            <Palette className="w-4 h-4 text-purple-400" />
            <span>Avatar</span>
          </button>

          <button
            onClick={onOpenFriends}
            className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/10 text-zinc-300 hover:text-white font-bold text-xs transition"
          >
            <Users className="w-4 h-4 text-blue-400" />
            <span>Friends</span>
          </button>
        </nav>

        {/* Right: Currency & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Bloxies Wallet */}
          <div
            onClick={onOpenMarketplace}
            title="Click to spend Bloxies in Marketplace"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-300 font-extrabold text-xs sm:text-sm cursor-pointer hover:bg-amber-500/25 transition shadow-sm"
          >
            <span className="text-base">🟡</span>
            <span className="font-mono">{storeState.bloxies.toLocaleString()}</span>
            <span className="text-[10px] uppercase font-bold text-amber-400/80 hidden sm:inline">Bloxies</span>
          </div>

          {/* Daily Reward Button */}
          <button
            onClick={onOpenDailyReward}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-xs transition border ${
              bloxStore.canClaimDaily()
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black border-yellow-300 animate-pulse shadow-lg shadow-amber-500/30'
                : 'bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Daily Reward</span>
          </button>

          {/* Watch Ads for Bloxies */}
          <button
            onClick={onOpenWatchAds}
            disabled={!adCooldown.available}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition border ${
              adCooldown.available
                ? 'bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border-purple-400/40 shadow-sm'
                : 'bg-white/5 text-zinc-500 border-white/10 cursor-not-allowed'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>
              {adCooldown.available
                ? '+10 Ads'
                : `${Math.floor(adCooldown.remainingSeconds / 60)}:${String(
                    adCooldown.remainingSeconds % 60
                  ).padStart(2, '0')}`}
            </span>
          </button>
        </div>
      </header>

      {/* Main Body Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 flex flex-col gap-8">
        {/* Hero Featured Game Carousel: Doomspire Brickbattle */}
        <div className="w-full rounded-3xl bg-gradient-to-r from-red-900 via-zinc-900 to-blue-950 p-6 sm:p-10 border border-white/15 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-red-600 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1">
                <Flame className="w-3 h-3 fill-current" />
                <span>Featured Game</span>
              </span>
              <span className="text-xs font-bold text-amber-300">★ 98% Positive Ratings</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
              Doomspire Brickbattle 3D
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Enter the iconic four-spire team arena! Wield explosive rocket launchers, bombs, superballs, swords, and trowels to collapse enemy spires and claim victory!
            </p>

            <div className="flex items-center gap-4 text-xs font-bold text-zinc-400 mt-2">
              <span>🎮 Multiplayer 4 Teams</span>
              <span>•</span>
              <span>💣 Destructible Physics</span>
              <span>•</span>
              <span>🟡 Win Bloxies per Match</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={() => onPlayGame('doomspire')}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black text-sm shadow-xl shadow-emerald-500/30 transition active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>PLAY DOOMSPIRE NOW</span>
            </button>
          </div>
        </div>

        {/* Free Currency & Passive Bloxies Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 to-transparent border border-amber-500/30 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-300">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-300">Daily Rewards</div>
              <div className="text-[11px] text-zinc-400">Get 100 free Bloxies every 24h</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/15 to-transparent border border-purple-500/30 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/20 text-purple-300">
              <Tv className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-purple-300">Watch Sponsor Ads</div>
              <div className="text-[11px] text-zinc-400">Watch 2 fun ads &rarr; +10 Bloxies</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-transparent border border-emerald-500/30 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-300">Passive Play Time</div>
              <div className="text-[11px] text-zinc-400">Earn 1 Bloxy every minute in-game!</div>
            </div>
          </div>
        </div>

        {/* All Games Grid */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-black text-white">Popular Games on BloxMania</h2>
            </div>
            <span className="text-xs text-zinc-400">Choose a game to play in 3D</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {games.map((g) => (
              <div
                key={g.id}
                className="flex flex-col justify-between rounded-3xl bg-zinc-900 border border-white/10 hover:border-amber-400/50 transition overflow-hidden group shadow-xl hover:shadow-2xl"
              >
                {/* Visual Banner */}
                <div
                  className={`w-full h-40 bg-gradient-to-br ${g.gradient} p-4 flex flex-col justify-between relative overflow-hidden`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-black/40 text-[9px] font-black uppercase text-white/90">
                      {g.badge}
                    </span>
                    <span className="text-[11px] font-bold text-white/90 drop-shadow">
                      {g.likes}
                    </span>
                  </div>

                  <div className="flex flex-col items-center my-auto">
                    <span className="text-4xl drop-shadow-md group-hover:scale-110 transition duration-300">
                      {g.icon}
                    </span>
                  </div>

                  <span className="text-[10px] text-white/80 font-medium">
                    {g.playing}
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-4 flex flex-col justify-between flex-1 gap-3">
                  <div>
                    <h3 className="font-black text-sm text-zinc-100 group-hover:text-amber-300 transition">
                      {g.title}
                    </h3>
                    <p className="text-[10px] font-bold text-amber-400/90 mt-0.5">
                      {g.tagline}
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-1 line-clamp-3 leading-snug">
                      {g.desc}
                    </p>
                  </div>

                  <button
                    onClick={() => onPlayGame(g.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play Now</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quests Section */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-white/10 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-black text-white">Daily Quests & Achievements</h3>
            </div>
            <span className="text-xs text-zinc-400">Complete tasks to earn bonus Bloxies</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {storeState.quests.map((q) => (
              <div
                key={q.id}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-200">
                    <span className="truncate pr-1">{q.title}</span>
                    <span className="text-amber-300 shrink-0 font-mono">+{q.reward}</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{q.desc}</p>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (q.progress / q.max) * 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-zinc-400">
                    <span>{q.progress}/{q.max}</span>
                    {q.claimed ? (
                      <span className="text-zinc-500 font-bold">Claimed</span>
                    ) : q.completed ? (
                      <button
                        onClick={() => bloxStore.claimQuestReward(q.id)}
                        className="px-2 py-0.5 rounded bg-emerald-500 text-black font-black text-[9px] hover:bg-emerald-400 shadow-sm"
                      >
                        Claim Reward
                      </button>
                    ) : (
                      <span className="text-zinc-500">In Progress</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-4 sm:px-8 border-t border-white/10 bg-zinc-950 text-center text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-zinc-300">BloxMania</span>
          <span>&bull;</span>
          <span>Classic Retro Metaverse Experience</span>
        </div>
        <div className="flex items-center gap-4 text-zinc-400">
          <span>Safe for Kids</span>
          <span>•</span>
          <span>No Real Money Needed</span>
          <span>•</span>
          <span>Free Bloxies Daily</span>
        </div>
      </footer>
    </div>
  );
};
