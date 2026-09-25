import { useEffect, useRef, useState, useCallback } from 'react';
import { GameWorld } from './game/world';
import { GameSettings, ToolType, CharacterData, FaceType, CustomNpcConfig } from './game/types';
import { soundManager } from './game/sound';
import { bloxStore } from './services/bloxStore';

// Portal views & modals
import { BloxManiaHub } from './portal/BloxManiaHub';
import { MarketplaceView } from './portal/MarketplaceView';
import { AvatarEditorView } from './portal/AvatarEditorView';
import { FriendsView } from './portal/FriendsView';
import { AdPlayerModal } from './portal/AdPlayerModal';
import { DailyRewardModal } from './portal/DailyRewardModal';

// Games
import { DoomspireGame } from './game/doomspire/DoomspireGame';
import { CityTopiaGame } from './game/citytopia/CityTopiaGame';
import { TowerDefenseGame } from './game/towerdefense/TowerDefenseGame';

// In-Game UI Components
import { TopBar } from './components/TopBar';
import { AstraMenu } from './components/AstraMenu';
import { SpawnMenu } from './components/SpawnMenu';
import { ToolHotbar } from './components/ToolHotbar';
import { Leaderboard } from './components/Leaderboard';
import { MobileControls } from './components/MobileControls';
import { RenameModal } from './components/RenameModal';
import { ControlsOverlay } from './components/ControlsOverlay';
import { RobloxPauseMenu } from './components/RobloxPauseMenu';
import { CustomNpcSpawnerModal } from './components/CustomNpcSpawnerModal';
import { AvatarCustomizerModal } from './components/AvatarCustomizerModal';
import { RefreshCw, Skull } from 'lucide-react';
import * as THREE from 'three';

export type ViewState =
  | 'hub'
  | 'sandbox'
  | 'doomspire'
  | 'citytopia'
  | 'towerdefense'
  | 'marketplace'
  | 'avatar'
  | 'friends';

const DEFAULT_SETTINGS: GameSettings = {
  walkSpeed: 24,
  runSpeed: 42,
  jumpPower: 38,
  gravity: 98,
  runningEnabled: true,
  soundEnabled: true,
  volume: 0.8,
  face: 'default',
  colors: {
    head: '#F5CD30',
    torso: '#0D69AC',
    leftArm: '#F5CD30',
    rightArm: '#F5CD30',
    leftLeg: '#A4BD47',
    rightLeg: '#A4BD47',
  },
};

export default function App() {
  // Navigation: Starts at the BloxMania website menu as requested!
  const [currentView, setCurrentView] = useState<ViewState>('hub');

  // Ad & Daily Reward Modals (accessible from anywhere)
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [isDailyModalOpen, setIsDailyModalOpen] = useState(false);

  // 3D Sandbox State
  const containerRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<GameWorld | null>(null);

  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = bloxStore.getState();
    return {
      ...DEFAULT_SETTINGS,
      colors: saved.colors || DEFAULT_SETTINGS.colors,
      face: saved.face || DEFAULT_SETTINGS.face,
    };
  });

  const [playerAlive, setPlayerAlive] = useState(true);
  const [respawnCountdown, setRespawnCountdown] = useState<number | null>(null);
  const [fps, setFps] = useState(60);
  const [objectCount, setObjectCount] = useState(0);
  const [activeTool, setActiveTool] = useState<ToolType>('none');

  // Menus in Sandbox
  const [isPauseOpen, setIsPauseOpen] = useState(false);
  const [isAstraOpen, setIsAstraOpen] = useState(false);
  const [isSpawnOpen, setIsSpawnOpen] = useState(false);
  const [isCustomNpcOpen, setIsCustomNpcOpen] = useState(false);
  const [isAvatarEditorOpen, setIsAvatarEditorOpen] = useState(false);

  const [characters, setCharacters] = useState<CharacterData[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null);
  const [isMobileSprinting, setIsMobileSprinting] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2400);
  }, []);

  // Global Escape Key Listener: Always reliably opens/closes Roblox Pause Menu
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.code === 'Escape') {
        if (currentView === 'sandbox') {
          e.preventDefault();
          e.stopPropagation();
          setIsPauseOpen((prev) => !prev);
          setIsAstraOpen(false);
          setIsSpawnOpen(false);
          setIsCustomNpcOpen(false);
          setIsAvatarEditorOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleGlobalKeyDown, { capture: true });
  }, [currentView]);

  const refreshLeaderboard = useCallback(() => {
    if (!worldRef.current) return;
    const list: CharacterData[] = [];
    const world = worldRef.current;

    if (world.player) {
      list.push({
        id: 'player',
        name: world.player.name,
        isPlayer: true,
        health: world.player.health,
        maxHealth: world.player.maxHealth,
        x: world.player.root.position.x,
        y: world.player.root.position.y,
        z: world.player.root.position.z,
        face: world.player.face || 'default',
        colors: world.player.colors,
      });
    }

    for (const npc of world.physics.noobs) {
      list.push({
        id: npc.rig.name,
        name: npc.rig.name,
        isPlayer: false,
        health: npc.rig.health,
        maxHealth: npc.rig.maxHealth,
        x: npc.rig.root.position.x,
        y: npc.rig.root.position.y,
        z: npc.rig.root.position.z,
        face: npc.rig.face || 'default',
        speed: npc.speed,
        behavior: npc.behavior,
        colors: npc.rig.colors,
      });
    }

    setCharacters(list);
    setObjectCount(world.physics.objects.length + world.physics.noobs.length);
  }, []);

  // Initialize Game World only when in Sandbox view
  useEffect(() => {
    if (currentView !== 'sandbox' || !containerRef.current) return;

    const saved = bloxStore.getState();
    const currentSettings = {
      ...settings,
      colors: saved.colors,
      face: saved.face,
    };

    const world = new GameWorld(containerRef.current, currentSettings, {
      onHealthChange: (hp) => {
        setPlayerAlive(hp > 0);
        refreshLeaderboard();
      },
      onRespawnCountdown: (countdownSec) => {
        setRespawnCountdown(countdownSec);
        if (countdownSec === null) {
          setPlayerAlive(true);
        }
      },
      onLeaderboardUpdate: () => {
        refreshLeaderboard();
      },
      onFpsUpdate: (currentFps) => {
        setFps(currentFps);
      },
      onTogglePauseMenu: () => {
        setIsPauseOpen((prev) => !prev);
        setIsAstraOpen(false);
        setIsSpawnOpen(false);
        setIsCustomNpcOpen(false);
        setIsAvatarEditorOpen(false);
      },
    });

    worldRef.current = world;
    refreshLeaderboard();

    // Hotkey 'R' to instantly respawn when dead
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyR' && (!world.player || world.player.isDead)) {
        world.resetPlayer();
        setPlayerAlive(true);
        setRespawnCountdown(null);
        showToast('Respawned!');
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      world.destroy();
      worldRef.current = null;
    };
  }, [currentView, refreshLeaderboard, showToast]);

  // Update Settings
  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      if (newSettings.colors) {
        bloxStore.setColors(newSettings.colors);
      }
      if (newSettings.face) {
        bloxStore.setFace(newSettings.face);
      }
      if (worldRef.current) {
        worldRef.current.settings = merged;
        if (newSettings.colors) {
          worldRef.current.updateColors(newSettings.colors);
        }
        if (newSettings.face) {
          worldRef.current.updateFace(newSettings.face);
        }
        if (newSettings.volume !== undefined) {
          soundManager.setVolume(newSettings.volume);
        }
      }
      return merged;
    });
  };

  const handleUpdateFace = (face: FaceType) => {
    handleUpdateSettings({ face });
    showToast(`Face set to ${face}`);
  };

  const handleToggleSound = () => {
    const next = !settings.soundEnabled;
    handleUpdateSettings({ soundEnabled: next });
    soundManager.setEnabled(next);
  };

  const handleSelectTool = (tool: ToolType) => {
    setActiveTool(tool);
    if (worldRef.current) {
      worldRef.current.setTool(tool);
    }
  };

  // Spawning & Reset Actions
  const handleSpawnCharacter = (type: 'clone' | 'noob' | 'guest' | 'zombie' | 'gold' | 'random') => {
    if (!worldRef.current) return;
    const rig = worldRef.current.spawnCharacter(type);
    refreshLeaderboard();
    showToast(`Spawned ${rig.name}!`);
  };

  const handleSpawnCustomNpc = (config: CustomNpcConfig) => {
    if (!worldRef.current) return;
    const rig = worldRef.current.spawnCustomNpc(config);
    refreshLeaderboard();
    showToast(`Spawned custom NPC "${rig.name}"!`);
  };

  const handleSpawnHorde = () => {
    if (!worldRef.current) return;
    worldRef.current.spawnHorde(5);
    refreshLeaderboard();
    showToast('Spawned Mob of 5 Noobs!');
  };

  const handleSpawnCrate = () => {
    if (!worldRef.current || !worldRef.current.player) return;
    const pPos = worldRef.current.player.root.position;
    const spawnPos = new THREE.Vector3(
      pPos.x + Math.sin(worldRef.current.cameraYaw) * -6,
      pPos.y + 4,
      pPos.z + Math.cos(worldRef.current.cameraYaw) * -6
    );
    worldRef.current.physics.spawnCrate(spawnPos);
    refreshLeaderboard();
    bloxStore.updateQuestProgress('q4', 1);
    showToast('Crate spawned!');
  };

  const handleSpawnBomb = () => {
    if (!worldRef.current || !worldRef.current.player) return;
    const pPos = worldRef.current.player.root.position;
    const spawnPos = new THREE.Vector3(
      pPos.x + Math.sin(worldRef.current.cameraYaw) * -6,
      pPos.y + 4,
      pPos.z + Math.cos(worldRef.current.cameraYaw) * -6
    );
    worldRef.current.physics.spawnBomb(spawnPos);
    refreshLeaderboard();
    bloxStore.updateQuestProgress('q4', 1);
    showToast('Bomb placed!');
  };

  const handleSpawnTrampoline = () => {
    if (!worldRef.current || !worldRef.current.player) return;
    const pPos = worldRef.current.player.root.position;
    const spawnPos = new THREE.Vector3(
      pPos.x + Math.sin(worldRef.current.cameraYaw) * -10,
      0.4,
      pPos.z + Math.cos(worldRef.current.cameraYaw) * -10
    );
    worldRef.current.physics.spawnTrampoline(spawnPos);
    refreshLeaderboard();
    showToast('Trampoline placed!');
  };

  const handleResetCharacter = () => {
    if (!worldRef.current) return;
    worldRef.current.resetPlayer();
    setPlayerAlive(true);
    setRespawnCountdown(null);
    showToast('Character respawned!');
  };

  const handleDeleteCharacter = () => {
    if (!worldRef.current) return;
    worldRef.current.killPlayer();
    setPlayerAlive(false);
    showToast('Character disassembled!');
  };

  const handleClearSandbox = () => {
    if (!worldRef.current) return;
    worldRef.current.physics.clearSandbox();
    refreshLeaderboard();
    showToast('Sandbox cleared!');
  };

  const handleSaveRename = (newName: string) => {
    if (!worldRef.current || !renameTarget) return;
    worldRef.current.renameEntity(renameTarget.id, newName);
    refreshLeaderboard();
    showToast(`Renamed to "${newName}"`);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-zinc-950 font-sans select-none text-white">
      {/* 1. MAIN BLOXMANIA WEBSITE PORTAL */}
      {currentView === 'hub' && (
        <BloxManiaHub
          onPlayGame={(gameId) => {
            setCurrentView(gameId);
          }}
          onOpenMarketplace={() => setCurrentView('marketplace')}
          onOpenAvatarEditor={() => setCurrentView('avatar')}
          onOpenFriends={() => setCurrentView('friends')}
          onOpenWatchAds={() => setIsAdModalOpen(true)}
          onOpenDailyReward={() => setIsDailyModalOpen(true)}
        />
      )}

      {/* 2. MARKETPLACE VIEW */}
      {currentView === 'marketplace' && (
        <MarketplaceView
          onBackToHub={() => setCurrentView('hub')}
          onOpenAvatarEditor={() => setCurrentView('avatar')}
        />
      )}

      {/* 3. AVATAR & ACCESSORIES EDITOR VIEW */}
      {currentView === 'avatar' && (
        <AvatarEditorView
          onBackToHub={() => setCurrentView('hub')}
          onOpenMarketplace={() => setCurrentView('marketplace')}
        />
      )}

      {/* 4. FRIENDS VIEW */}
      {currentView === 'friends' && (
        <FriendsView
          onBackToHub={() => setCurrentView('hub')}
          onJoinGame={(gameId) => {
            const lower = gameId.toLowerCase();
            if (lower.includes('doomspire')) setCurrentView('doomspire');
            else if (lower.includes('citytopia')) setCurrentView('citytopia');
            else if (lower.includes('tower') || lower.includes('defense')) setCurrentView('towerdefense');
            else setCurrentView('sandbox');
          }}
        />
      )}

      {/* 5. DOOMSPIRE BRICKBATTLE GAME */}
      {currentView === 'doomspire' && (
        <DoomspireGame onLeaveGame={() => setCurrentView('hub')} />
      )}

      {/* 6. CITYTOPIA ROLEPLAY GAME */}
      {currentView === 'citytopia' && (
        <CityTopiaGame onLeaveGame={() => setCurrentView('hub')} />
      )}

      {/* 7. RETRO TOWER DEFENSE GAME */}
      {currentView === 'towerdefense' && (
        <TowerDefenseGame onLeaveGame={() => setCurrentView('hub')} />
      )}

      {/* 8. NOOB SANDBOX 3D GAME */}
      {currentView === 'sandbox' && (
        <>
          {/* 3D Canvas Viewport */}
          <div ref={containerRef} className="absolute inset-0 cursor-crosshair bg-black" />

          {/* Top Bar Navigation */}
          <TopBar
            playerAlive={playerAlive}
            respawnCountdown={respawnCountdown}
            fps={fps}
            objectCount={objectCount}
            soundEnabled={settings.soundEnabled}
            onToggleSound={handleToggleSound}
            onOpenPauseMenu={() => setIsPauseOpen((prev) => !prev)}
            onOpenAvatarEditor={() => {
              setIsAvatarEditorOpen(true);
              setIsAstraOpen(false);
              setIsSpawnOpen(false);
              setIsPauseOpen(false);
            }}
            onOpenSpawnMenu={() => {
              setIsSpawnOpen(!isSpawnOpen);
              setIsAstraOpen(false);
              setIsPauseOpen(false);
            }}
            onOpenCustomNpc={() => {
              setIsCustomNpcOpen(true);
              setIsAstraOpen(false);
              setIsSpawnOpen(false);
              setIsPauseOpen(false);
            }}
            onOpenAstraMenu={() => {
              setIsAstraOpen(!isAstraOpen);
              setIsSpawnOpen(false);
              setIsPauseOpen(false);
            }}
            onResetCharacter={handleResetCharacter}
            onLeaveGame={() => setCurrentView('hub')}
            isPauseOpen={isPauseOpen}
            isAstraOpen={isAstraOpen}
            isSpawnOpen={isSpawnOpen}
          />

          {/* Leaderboard / Character List */}
          <Leaderboard
            characters={characters}
            onOpenRename={(id, currentName) => setRenameTarget({ id, name: currentName })}
          />

          {/* Astra Menu Panel */}
          <AstraMenu
            isOpen={isAstraOpen}
            onClose={() => setIsAstraOpen(false)}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onResetCharacter={handleResetCharacter}
            onDeleteCharacter={handleDeleteCharacter}
            onClearSandbox={handleClearSandbox}
          />

          {/* Spawn Menu Panel */}
          <SpawnMenu
            isOpen={isSpawnOpen}
            onClose={() => setIsSpawnOpen(false)}
            onOpenCustomNpc={() => setIsCustomNpcOpen(true)}
            onSpawnCharacter={handleSpawnCharacter}
            onSpawnHorde={handleSpawnHorde}
            onSpawnCrate={handleSpawnCrate}
            onSpawnBomb={handleSpawnBomb}
            onSpawnTrampoline={handleSpawnTrampoline}
            onResetSandbox={handleClearSandbox}
          />

          {/* Classic Roblox ESC Pause Menu */}
          <RobloxPauseMenu
            isOpen={isPauseOpen}
            onClose={() => setIsPauseOpen(false)}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            characters={characters}
            onResetCharacter={handleResetCharacter}
            onOpenAvatarEditor={() => setIsAvatarEditorOpen(true)}
            onOpenRename={(id, currentName) => setRenameTarget({ id, name: currentName })}
            onLeaveGame={() => {
              setIsPauseOpen(false);
              setCurrentView('hub');
            }}
            gameTitle="Noob Sandbox 3D"
          />

          {/* Custom NPC Spawner Modal */}
          <CustomNpcSpawnerModal
            isOpen={isCustomNpcOpen}
            onClose={() => setIsCustomNpcOpen(false)}
            onSpawn={handleSpawnCustomNpc}
          />

          {/* Avatar & Classic Face Customizer Modal */}
          <AvatarCustomizerModal
            isOpen={isAvatarEditorOpen}
            onClose={() => setIsAvatarEditorOpen(false)}
            colors={settings.colors}
            currentFace={settings.face}
            onUpdateColors={(colors) => handleUpdateSettings({ colors })}
            onUpdateFace={handleUpdateFace}
            onResetCharacter={handleResetCharacter}
          />

          {/* Hotbar Tool Inventory */}
          <ToolHotbar activeTool={activeTool} onSelectTool={handleSelectTool} />

          {/* Desktop Controls Overlay */}
          <ControlsOverlay />

          {/* Mobile Touch Controls */}
          <MobileControls
            onJoystickMove={(vec) => {
              if (worldRef.current) {
                worldRef.current.joystickVector = vec;
              }
            }}
            onJump={() => {
              if (worldRef.current) {
                worldRef.current.tryJump();
              }
            }}
            onToggleSprint={(sprint) => {
              setIsMobileSprinting(sprint);
              if (worldRef.current) {
                worldRef.current.mobileSprint = sprint;
              }
            }}
            isSprinting={isMobileSprinting}
          />

          {/* Classic Roblox Death Overlay & Respawn Prompt */}
          {!playerAlive && (
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-3 p-4 bg-black/85 backdrop-blur-2xl border border-red-500/40 rounded-2xl shadow-2xl text-white select-none animate-bounce-short">
              <div className="flex items-center gap-2 text-red-400 font-extrabold text-sm sm:text-base">
                <Skull className="w-5 h-5 animate-pulse" />
                <span>OOF! You were disassembled</span>
              </div>

              <div className="text-xs text-zinc-300 font-medium">
                {respawnCountdown !== null ? (
                  <span>
                    Respawning in <strong className="text-amber-300 font-mono text-sm">{respawnCountdown}s</strong>...
                  </span>
                ) : (
                  <span>Respawning shortly...</span>
                )}
              </div>

              <button
                onClick={handleResetCharacter}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/40 transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Respawn Now (Press R)</span>
              </button>
            </div>
          )}

          {/* Rename Dialog Modal */}
          <RenameModal
            isOpen={!!renameTarget}
            currentName={renameTarget?.name || ''}
            onSave={handleSaveRename}
            onClose={() => setRenameTarget(null)}
          />
        </>
      )}

      {/* Global Watch Ads Commercial Modal */}
      <AdPlayerModal
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
        onRewardClaimed={(amt) => {
          showToast(`+${amt} Bloxies earned from watching sponsor ads!`);
        }}
      />

      {/* Global Daily Reward Modal */}
      <DailyRewardModal
        isOpen={isDailyModalOpen}
        onClose={() => setIsDailyModalOpen(false)}
        onClaimed={() => {
          showToast('+100 Bloxies Daily Reward Claimed!');
        }}
      />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-black/85 backdrop-blur-xl border border-white/20 text-white text-xs font-semibold rounded-2xl shadow-2xl pointer-events-none">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
