import React, { useState } from 'react';
import { CATALOG_ITEMS, ItemCategory, CatalogItem } from '../catalog/catalogData';
import { bloxStore } from '../services/bloxStore';
import { ShoppingBag, Sparkles, Check, Tag, ShieldAlert, ArrowLeft } from 'lucide-react';

interface MarketplaceViewProps {
  onBackToHub: () => void;
  onOpenAvatarEditor: () => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  onBackToHub,
  onOpenAvatarEditor,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const state = bloxStore.getState();

  const categories: { id: ItemCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Items' },
    { id: 'top', label: 'Hats & Dominus' },
    { id: 'back', label: 'Back & Wings' },
    { id: 'shoulder', label: 'Shoulder Pets' },
    { id: 'neck', label: 'Neck' },
    { id: 'gear', label: 'Gear & Tools' },
    { id: 'shirt', label: 'Shirts' },
    { id: 'tshirt', label: 'T-Shirts' },
    { id: 'pants', label: 'Pants' },
  ];

  const filteredItems = CATALOG_ITEMS.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      return item.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const handleBuy = (item: CatalogItem) => {
    if (state.ownedItems.includes(item.id)) {
      // Already owned: equip!
      bloxStore.equipItem(item.category as any, item.id);
      setToast(`Equipped ${item.name}!`);
      setTimeout(() => setToast(null), 2500);
      return;
    }

    if (state.bloxies < item.price) {
      setToast(`Not enough Bloxies! You need ${item.price.toLocaleString()} Bloxies.`);
      setTimeout(() => setToast(null), 2500);
      return;
    }

    const bought = bloxStore.buyItem(item.id, item.price);
    if (bought) {
      bloxStore.equipItem(item.category as any, item.id);
      setToast(`Purchased and equipped ${item.name}!`);
      setTimeout(() => setToast(null), 2500);
    }
  };

  return (
    <div className="w-full min-h-screen bg-zinc-950 text-white select-none p-4 sm:p-8 flex flex-col gap-6">
      {/* Top Bar Header */}
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
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-black font-black">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl font-black text-amber-300">Avatar Marketplace</h1>
              <p className="text-xs text-zinc-400">Discover legendary accessories, Dominus hoods & clothing</p>
            </div>
          </div>
        </div>

        {/* Currency & Avatar Editor Quick Link */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-extrabold text-sm shadow-md">
            <span>🟡</span>
            <span className="font-mono">{state.bloxies.toLocaleString()} Bloxies</span>
          </div>

          <button
            onClick={onOpenAvatarEditor}
            className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-lg shadow-purple-600/30"
          >
            Open Avatar Editor
          </button>
        </div>
      </div>

      {/* Featured Highlight Banner: Vampirus Devilius Dominus */}
      <div className="w-full p-6 rounded-3xl bg-gradient-to-r from-red-950 via-zinc-900 to-purple-950 border border-red-500/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-black/60 border border-red-500/50 flex items-center justify-center text-3xl shadow-inner shrink-0">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-red-600/30 text-red-300 border border-red-500/30 text-[10px] font-black uppercase tracking-wider">
                Mythic Dominus
              </span>
              <span className="text-xs text-zinc-400">Most Expensive in BloxMania</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Vampirus Devilius Dominus
            </h2>
            <p className="text-xs text-zinc-300 max-w-xl mt-1">
              Forged in the abyss. Features obsidian horned wings, hollow shadowy hood, and eternal dark aura.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-[10px] text-zinc-400 uppercase font-bold block">Price</span>
            <span className="text-xl font-black font-mono text-amber-300">🟡 800,000 Bloxies</span>
          </div>
          <button
            onClick={() => handleBuy(CATALOG_ITEMS[0])}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-xs shadow-xl shadow-red-600/40 transition active:scale-95"
          >
            {state.ownedItems.includes('dom_vampirus') ? 'Equip Dominus' : 'Buy Now'}
          </button>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
                selectedCategory === c.id
                  ? 'bg-amber-400 text-black border-amber-300 shadow-md shadow-amber-400/20'
                  : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search items..."
          className="w-full md:w-64 px-3.5 py-1.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 placeholder-zinc-500"
        />
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredItems.map((item) => {
          const isOwned = state.ownedItems.includes(item.id);
          const isEquipped = Object.values(state.equipped).includes(item.id);

          return (
            <div
              key={item.id}
              className="flex flex-col justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/40 transition group hover:shadow-xl"
            >
              <div>
                {/* Visual Thumbnail */}
                <div
                  className="w-full h-32 rounded-xl bg-black/50 flex flex-col items-center justify-center relative overflow-hidden border border-white/5"
                  style={{
                    backgroundColor: item.colorHex ? `${item.colorHex}22` : '#18181b',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-lg"
                    style={{ backgroundColor: item.colorHex || '#555' }}
                  >
                    {item.category === 'top'
                      ? '🎩'
                      : item.category === 'back'
                      ? '🦇'
                      : item.category === 'gear'
                      ? '⚔️'
                      : item.category === 'shirt' || item.category === 'tshirt'
                      ? '👕'
                      : item.category === 'pants'
                      ? '👖'
                      : '✨'}
                  </div>

                  {/* Rarity Pill */}
                  <span
                    className={`absolute top-2 left-2 text-[9px] uppercase font-black px-1.5 py-0.5 rounded ${
                      item.rarity === 'mythic'
                        ? 'bg-red-600/80 text-white'
                        : item.rarity === 'legendary'
                        ? 'bg-purple-600/80 text-white'
                        : item.rarity === 'epic'
                        ? 'bg-amber-500/80 text-black'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {item.rarity}
                  </span>

                  {isEquipped && (
                    <span className="absolute bottom-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-black">
                      EQUIPPED
                    </span>
                  )}
                </div>

                {/* Details */}
                <h3 className="font-extrabold text-xs text-zinc-100 mt-2 truncate group-hover:text-amber-300 transition">
                  {item.name}
                </h3>
                <p className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5 leading-snug">
                  {item.description}
                </p>
              </div>

              {/* Price & Buy Button */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10">
                <span className="font-mono text-xs font-bold text-amber-300">
                  {item.price === 0 ? 'FREE' : `🟡 ${item.price.toLocaleString()}`}
                </span>

                <button
                  onClick={() => handleBuy(item)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                    isEquipped
                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                      : isOwned
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : item.price === 0
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-amber-500 hover:bg-amber-400 text-black shadow-sm'
                  }`}
                >
                  {isEquipped ? 'Equipped' : isOwned ? 'Equip' : item.price === 0 ? 'Get Free' : 'Buy'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl bg-black/90 border border-amber-400 text-white font-bold text-xs shadow-2xl animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
};
