import { BodyPartColors, FaceType } from '../game/types';

export interface EquippedAccessories {
  top?: string;       // Hat / Dominus / Cap
  back?: string;      // Wings / Swords / Cape
  shoulder?: string;  // Shoulder Pet / Bird
  neck?: string;      // Chain / Scarf
  front?: string;     // Badge / Vest
  waist?: string;     // Belt / Tail
  gear?: string;      // Held item (Trowel, Sword, Coil)
  shirt?: string;     // Shirt texture id
  tshirt?: string;    // Graphic decal id on chest
  pants?: string;     // Pants texture id
}

export interface Quest {
  id: string;
  title: string;
  desc: string;
  reward: number;
  progress: number;
  max: number;
  completed: boolean;
  claimed: boolean;
}

export interface Friend {
  id: string;
  name: string;
  status: 'online' | 'in_game' | 'offline';
  game?: string;
  avatarHead: string;
  face: FaceType;
}

export interface BloxState {
  bloxies: number;
  ownedItems: string[];
  equipped: EquippedAccessories;
  colors: BodyPartColors;
  face: FaceType;
  lastDailyClaim: number | null;
  lastAdWatched: number | null;
  playTimeMinutes: number;
  quests: Quest[];
}

const STORAGE_KEY = 'bloxmania_save_v1';

const DEFAULT_STATE: BloxState = {
  bloxies: 250, // Starting bonus
  ownedItems: [
    'free_cap',
    'free_shirt',
    'free_tshirt_smile',
    'free_pants',
    'face_default',
    'face_chill',
    'gear_classic_trowel',
  ],
  equipped: {
    top: 'free_cap',
    shirt: 'free_shirt',
    tshirt: 'free_tshirt_smile',
    pants: 'free_pants',
  },
  colors: {
    head: '#F5CD30',
    torso: '#0D69AC',
    leftArm: '#F5CD30',
    rightArm: '#F5CD30',
    leftLeg: '#A4BD47',
    rightLeg: '#A4BD47',
  },
  face: 'default',
  lastDailyClaim: null,
  lastAdWatched: null,
  playTimeMinutes: 0,
  quests: [
    {
      id: 'q1',
      title: 'Play Any Game for 3 Minutes',
      desc: 'Earn Bloxies just by exploring any game.',
      reward: 25,
      progress: 0,
      max: 3,
      completed: false,
      claimed: false,
    },
    {
      id: 'q2',
      title: 'Equip an Accessory',
      desc: 'Customize your avatar in the Avatar Editor.',
      reward: 15,
      progress: 0,
      max: 1,
      completed: false,
      claimed: false,
    },
    {
      id: 'q3',
      title: 'Watch Ads for Bloxies',
      desc: 'Support BloxMania sponsors to get instant currency.',
      reward: 20,
      progress: 0,
      max: 1,
      completed: false,
      claimed: false,
    },
    {
      id: 'q4',
      title: 'Sandbox Explorer',
      desc: 'Spawn 5 sandbox toys or crates.',
      reward: 30,
      progress: 0,
      max: 5,
      completed: false,
      claimed: false,
    },
  ],
};

class BloxStore {
  private state: BloxState;
  private listeners: Set<() => void> = new Set();
  private playTimer: number | null = null;

  constructor() {
    this.state = this.loadState();
    this.startPassivePlayTracker();
  }

  private loadState(): BloxState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_STATE,
          ...parsed,
          equipped: { ...DEFAULT_STATE.equipped, ...parsed.equipped },
          colors: { ...DEFAULT_STATE.colors, ...parsed.colors },
        };
      }
    } catch (e) {
      console.warn('Failed to load BloxState:', e);
    }
    return DEFAULT_STATE;
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to save BloxState:', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public getState(): BloxState {
    return this.state;
  }

  public addBloxies(amount: number) {
    this.state.bloxies = Math.max(0, this.state.bloxies + amount);
    this.saveState();
  }

  public buyItem(itemId: string, cost: number): boolean {
    if (this.state.ownedItems.includes(itemId)) {
      return true;
    }
    if (this.state.bloxies < cost) {
      return false;
    }
    this.state.bloxies -= cost;
    this.state.ownedItems.push(itemId);
    this.saveState();
    return true;
  }

  public equipItem(slot: keyof EquippedAccessories, itemId?: string) {
    if (itemId) {
      this.state.equipped[slot] = itemId;
    } else {
      delete this.state.equipped[slot];
    }
    this.updateQuestProgress('q2', 1);
    this.saveState();
  }

  public setColors(colors: BodyPartColors) {
    this.state.colors = { ...colors };
    this.saveState();
  }

  public setFace(face: FaceType) {
    this.state.face = face;
    this.saveState();
  }

  public canClaimDaily(): boolean {
    if (!this.state.lastDailyClaim) return true;
    const now = Date.now();
    // 20 hours for friendly daily reward window
    return now - this.state.lastDailyClaim >= 20 * 60 * 60 * 1000;
  }

  public claimDaily(): boolean {
    if (!this.canClaimDaily()) return false;
    this.state.lastDailyClaim = Date.now();
    this.addBloxies(100);
    return true;
  }

  public canWatchAds(): { available: boolean; remainingSeconds: number } {
    if (!this.state.lastAdWatched) return { available: true, remainingSeconds: 0 };
    const now = Date.now();
    const cooldownMs = 10 * 60 * 1000; // 10 minutes
    const diff = now - this.state.lastAdWatched;
    if (diff >= cooldownMs) {
      return { available: true, remainingSeconds: 0 };
    }
    return { available: false, remainingSeconds: Math.ceil((cooldownMs - diff) / 1000) };
  }

  public completeWatchingAds(): boolean {
    const check = this.canWatchAds();
    if (!check.available) return false;
    this.state.lastAdWatched = Date.now();
    this.addBloxies(10);
    this.updateQuestProgress('q3', 1);
    return true;
  }

  public updateQuestProgress(questId: string, delta: number) {
    const q = this.state.quests.find((item) => item.id === questId);
    if (q && !q.completed) {
      q.progress = Math.min(q.max, q.progress + delta);
      if (q.progress >= q.max) {
        q.completed = true;
      }
      this.saveState();
    }
  }

  public claimQuestReward(questId: string): boolean {
    const q = this.state.quests.find((item) => item.id === questId);
    if (q && q.completed && !q.claimed) {
      q.claimed = true;
      this.addBloxies(q.reward);
      this.saveState();
      return true;
    }
    return false;
  }

  private startPassivePlayTracker() {
    if (this.playTimer) return;
    // Every 60 seconds (1 minute), give 1 Bloxy passively while in-game!
    this.playTimer = window.setInterval(() => {
      this.state.playTimeMinutes += 1;
      this.addBloxies(1);
      this.updateQuestProgress('q1', 1);
    }, 60000);
  }
}

export const bloxStore = new BloxStore();
