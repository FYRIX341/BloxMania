export type BodyPartColors = {
  head: string;
  torso: string;
  leftArm: string;
  rightArm: string;
  leftLeg: string;
  rightLeg: string;
};

export type FaceType =
  | 'default'
  | 'chill'
  | 'man'
  | 'checkit'
  | 'epic'
  | 'winning'
  | 'grin'
  | 'tongue'
  | 'skeptical'
  | 'shocked';

export interface FaceDefinition {
  id: FaceType;
  name: string;
  description: string;
}

export type NpcBehavior = 'wander' | 'follow' | 'idle' | 'flee';

export type CharacterData = {
  id: string;
  name: string;
  isPlayer: boolean;
  health: number;
  maxHealth: number;
  x: number;
  y: number;
  z: number;
  face: FaceType;
  speed?: number;
  behavior?: NpcBehavior;
  colors: BodyPartColors;
};

export type CustomNpcConfig = {
  name: string;
  face: FaceType;
  colors: BodyPartColors;
  speed: number;
  health: number;
  behavior: NpcBehavior;
};

export type ToolType = 'none' | 'gravity' | 'rocket' | 'sword' | 'bomb' | 'crate' | 'spawner';

export type SandboxObjectType = 'noob' | 'crate' | 'bomb' | 'trampoline' | 'part' | 'rocket_projectile';

export type GameSettings = {
  walkSpeed: number;
  runSpeed: number;
  jumpPower: number;
  gravity: number;
  runningEnabled: boolean;
  face: FaceType;
  colors: BodyPartColors;
  soundEnabled: boolean;
  volume: number;
};
