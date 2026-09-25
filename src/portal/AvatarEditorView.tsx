import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { bloxStore } from '../services/bloxStore';
import { CATALOG_ITEMS, ItemCategory, CatalogItem } from '../catalog/catalogData';
import { characterSystem, R6Rig } from '../game/character';
import { AccessoryBuilder } from '../game/accessories';
import { textureService } from '../game/textures';
import { FaceType, BodyPartColors } from '../game/types';
import { ArrowLeft, Check, Sparkles, RefreshCw, Palette, Shirt, Tag } from 'lucide-react';

interface AvatarEditorViewProps {
  onBackToHub: () => void;
  onOpenMarketplace: () => void;
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

export const AvatarEditorView: React.FC<AvatarEditorViewProps> = ({
  onBackToHub,
  onOpenMarketplace,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<R6Rig | null>(null);

  const [activeTab, setActiveTab] = useState<'accessories' | 'clothing' | 'body'>('accessories');
  const [activeCategory, setActiveCategory] = useState<ItemCategory>('top');
  const [storeState, setStoreState] = useState(bloxStore.getState());

  useEffect(() => {
    return bloxStore.subscribe(() => {
      setStoreState({ ...bloxStore.getState() });
    });
  }, []);

  // 3D Avatar Preview Viewport
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x18181b);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 3.2, 10.5);
    camera.lookAt(0, 2.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Lights
    const amb = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(amb);
    const keyLight = new THREE.DirectionalLight(0xffeedd, 1.2);
    keyLight.position.set(5, 10, 8);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xddeeff, 0.6);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    // Pedestal floor
    const pedGeo = new THREE.CylinderGeometry(3.5, 3.5, 0.4, 32);
    const pedMat = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      map: textureService.getStudTexture(2, 2),
      roughness: 0.4,
    });
    const ped = new THREE.Mesh(pedGeo, pedMat);
    ped.position.y = -0.2;
    scene.add(ped);

    // Build R6 Avatar Rig with equipped accessories & clothing
    const rig = characterSystem.createR6('You', storeState.colors, true, storeState.face, storeState.equipped);
    rig.root.position.set(0, 0, 0);
    scene.add(rig.root);
    rigRef.current = rig;

    // Drag to rotate avatar
    let isMouseDown = false;
    let prevX = 0;
    let avatarRotation = 0;

    const onMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      prevX = e.clientX;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (isMouseDown) {
        avatarRotation += (e.clientX - prevX) * 0.012;
        prevX = e.clientX;
      }
    };
    const onMouseUp = () => {
      isMouseDown = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    let animId: number;
    const loop = () => {
      if (rig) {
        rig.root.rotation.y = avatarRotation;
      }
      renderer.render(scene, camera);
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update 3D Avatar dynamically when colors, face or equipped items change
  useEffect(() => {
    if (rigRef.current) {
      characterSystem.updateColors(rigRef.current, storeState.colors);
      characterSystem.updateFace(rigRef.current, storeState.face);
      characterSystem.updateClothing(rigRef.current, storeState.equipped);
    }
  }, [storeState]);

  const ownedCatalogItems = CATALOG_ITEMS.filter((item) =>
    storeState.ownedItems.includes(item.id)
  );

  const filteredOwned = ownedCatalogItems.filter((item) => {
    if (activeTab === 'accessories') {
      return ['top', 'back', 'shoulder', 'neck', 'front', 'waist', 'gear'].includes(item.category) && item.category === activeCategory;
    }
    if (activeTab === 'clothing') {
      return ['shirt', 'tshirt', 'pants'].includes(item.category) && item.category === activeCategory;
    }
    return false;
  });

  return (
    <div className="w-full min-h-screen bg-zinc-950 text-white select-none p-4 sm:p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHub}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BloxMania Hub</span>
          </button>
          <h1 className="text-xl font-black text-amber-300">Avatar Customizer</h1>
        </div>

        <button
          onClick={onOpenMarketplace}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shadow-md shadow-amber-500/20"
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Get More Items in Marketplace</span>
        </button>
      </div>

      {/* Main Studio Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 3D Live Interactive Viewport */}
        <div className="lg:col-span-5 h-[480px] lg:h-full min-h-[420px] rounded-3xl bg-zinc-900 border border-white/10 relative overflow-hidden flex flex-col">
          <div ref={containerRef} className="w-full flex-1 cursor-grab active:cursor-grabbing" />
          <div className="p-3 bg-black/60 backdrop-blur-md border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400">
            <span>Click & Drag to rotate 3D avatar</span>
            <span className="font-mono text-amber-300">Real-Time R6 Rig</span>
          </div>
        </div>

        {/* Right: Customization Wardrobe Tabs */}
        <div className="lg:col-span-7 flex flex-col gap-4 bg-zinc-900/60 p-5 rounded-3xl border border-white/10">
          {/* Main Category Tabs */}
          <div className="flex gap-2 border-b border-white/10 pb-3">
            {[
              { id: 'accessories' as const, label: 'Accessories', icon: <Sparkles className="w-4 h-4" /> },
              { id: 'clothing' as const, label: 'Clothing', icon: <Shirt className="w-4 h-4" /> },
              { id: 'body' as const, label: 'Skin & Face', icon: <Palette className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'accessories') setActiveCategory('top');
                  if (tab.id === 'clothing') setActiveCategory('shirt');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === tab.id
                    ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                    : 'bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Sub-Pills for Accessories & Clothing */}
          {activeTab === 'accessories' && (
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
              {(
                [
                  ['top', 'Hats & Dominus'],
                  ['back', 'Back & Wings'],
                  ['shoulder', 'Shoulder'],
                  ['neck', 'Neck'],
                  ['front', 'Front'],
                  ['waist', 'Waist'],
                  ['gear', 'Gear'],
                ] as const
              ).map(([cat, label]) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition ${
                    activeCategory === cat
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'bg-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {activeTab === 'clothing' && (
            <div className="flex gap-1.5 pb-1 text-xs">
              {(
                [
                  ['shirt', 'Shirts'],
                  ['tshirt', 'T-Shirts (Decals)'],
                  ['pants', 'Pants'],
                ] as const
              ).map(([cat, label]) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition ${
                    activeCategory === cat
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'bg-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Content Pane: Items Grid or Body Colors */}
          {activeTab !== 'body' ? (
            <div className="flex-1 min-h-[280px]">
              {filteredOwned.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-8 bg-black/30 rounded-2xl border border-dashed border-white/10 h-full">
                  <p className="text-xs text-zinc-400 mb-2">No owned items in this slot yet!</p>
                  <button
                    onClick={onOpenMarketplace}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md"
                  >
                    Browse Free & Epic Items in Marketplace
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredOwned.map((item) => {
                    const isEquipped = storeState.equipped[item.category as keyof typeof storeState.equipped] === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-2xl border transition flex flex-col justify-between ${
                          isEquipped
                            ? 'bg-amber-500/20 border-amber-400 shadow-md shadow-amber-400/20'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex flex-col items-center text-center mb-2">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-1.5 shadow-md"
                            style={{ backgroundColor: item.colorHex || '#444' }}
                          >
                            {item.category === 'top' ? '👑' : item.category === 'back' ? '🦇' : '✨'}
                          </div>
                          <h4 className="font-extrabold text-xs text-zinc-100 truncate w-full">
                            {item.name}
                          </h4>
                        </div>

                        <button
                          onClick={() => {
                            bloxStore.equipItem(
                              item.category as any,
                              isEquipped ? undefined : item.id
                            );
                          }}
                          className={`w-full py-1.5 rounded-xl font-bold text-xs transition ${
                            isEquipped
                              ? 'bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/30'
                              : 'bg-amber-500 hover:bg-amber-400 text-black shadow-sm'
                          }`}
                        >
                          {isEquipped ? 'Unequip' : 'Equip'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Skin Colors & Face Selection */
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[440px]">
              {/* Faces */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block mb-2">
                  Classic Faces
                </span>
                <div className="grid grid-cols-5 gap-2">
                  {CLASSIC_FACES.map((f) => {
                    const isSelected = storeState.face === f.id;
                    const thumb = textureService.getFaceThumbnail(f.id);
                    return (
                      <button
                        key={f.id}
                        onClick={() => bloxStore.setFace(f.id)}
                        className={`flex flex-col items-center gap-1 p-1.5 rounded-xl border transition ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-400 shadow-md shadow-amber-400/20 scale-105'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <img
                          src={thumb}
                          alt={f.name}
                          className="w-10 h-10 rounded-lg object-contain bg-[#F5CD30]"
                        />
                        <span className="text-[9px] font-bold text-zinc-300 truncate w-full text-center">
                          {f.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 6 Body Part Colors */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block mb-2">
                  Limb Colors
                </span>
                <div className="grid grid-cols-3 gap-2 text-xs">
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
                      <span className="text-zinc-300 text-[11px]">{label}</span>
                      <input
                        type="color"
                        value={storeState.colors[key]}
                        onChange={(e) => {
                          bloxStore.setColors({
                            ...storeState.colors,
                            [key]: e.target.value,
                          });
                        }}
                        className="w-5 h-5 rounded cursor-pointer border-none bg-transparent"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
