import React, { useState } from 'react';
import { Users, UserPlus, Play, MessageSquare, ArrowLeft, Check, Search } from 'lucide-react';
import { Friend } from '../services/bloxStore';

interface FriendsViewProps {
  onBackToHub: () => void;
  onJoinGame: (gameId: string) => void;
}

const INITIAL_FRIENDS: Friend[] = [
  {
    id: 'f1',
    name: 'Builderman',
    status: 'in_game',
    game: 'Doomspire Brickbattle',
    avatarHead: '#F5CD30',
    face: 'default',
  },
  {
    id: 'f2',
    name: 'Shedletsky',
    status: 'in_game',
    game: 'Noob Sandbox 3D',
    avatarHead: '#F5CD30',
    face: 'checkit',
  },
  {
    id: 'f3',
    name: 'Telamon',
    status: 'in_game',
    game: 'CityTopia',
    avatarHead: '#F5CD30',
    face: 'epic',
  },
  {
    id: 'f4',
    name: 'Clockwork',
    status: 'in_game',
    game: 'Tower Defense',
    avatarHead: '#F5CD30',
    face: 'man',
  },
  {
    id: 'f5',
    name: 'NoobMaster_2008',
    status: 'online',
    avatarHead: '#F5CD30',
    face: 'chill',
  },
  {
    id: 'f6',
    name: 'BloxPrincess',
    status: 'online',
    avatarHead: '#ffd1a4',
    face: 'winning',
  },
];

export const FriendsView: React.FC<FriendsViewProps> = ({ onBackToHub, onJoinGame }) => {
  const [friends, setFriends] = useState<Friend[]>(INITIAL_FRIENDS);
  const [search, setSearch] = useState('');
  const [friendCode, setFriendCode] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const filtered = friends.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (friendCode.trim()) {
      const newFriend: Friend = {
        id: `f_${Date.now()}`,
        name: friendCode.trim(),
        status: 'online',
        avatarHead: '#F5CD30',
        face: 'default',
      };
      setFriends([newFriend, ...friends]);
      setFriendCode('');
      setToast(`Sent friend request to ${newFriend.name}!`);
      setTimeout(() => setToast(null), 2500);
    }
  };

  return (
    <div className="w-full min-h-screen bg-zinc-950 text-white select-none p-4 sm:p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHub}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BloxMania Hub</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl font-black text-blue-300">Friends & Party</h1>
              <p className="text-xs text-zinc-400">Join your friends in games and chat across BloxMania</p>
            </div>
          </div>
        </div>

        {/* Add Friend Input */}
        <form onSubmit={handleAddFriend} className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={friendCode}
            onChange={(e) => setFriendCode(e.target.value)}
            placeholder="Add friend username..."
            className="px-3.5 py-1.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-blue-400"
          />
          <button
            type="submit"
            className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>
      </div>

      {/* Friends Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map((f) => (
          <div
            key={f.id}
            className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-400/40 transition"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-md border border-black/20"
                style={{ backgroundColor: f.avatarHead }}
              >
                🙂
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-zinc-100">{f.name}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      f.status === 'in_game'
                        ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                        : 'bg-blue-400'
                    }`}
                  />
                  <span className="text-[11px] text-zinc-400 truncate max-w-[150px]">
                    {f.status === 'in_game' ? `Playing ${f.game}` : 'Online on Web'}
                  </span>
                </div>
              </div>
            </div>

            {f.status === 'in_game' && f.game && (
              <button
                onClick={() => {
                  if (f.game === 'Doomspire Brickbattle') onJoinGame('doomspire');
                  else if (f.game === 'Noob Sandbox 3D') onJoinGame('sandbox');
                  else if (f.game === 'CityTopia') onJoinGame('citytopia');
                  else if (f.game === 'Tower Defense') onJoinGame('towerdefense');
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Join</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl bg-black/90 border border-blue-400 text-white font-bold text-xs shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  );
};
