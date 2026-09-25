import * as THREE from 'three';
import { BodyPartColors, FaceType } from './types';
import { textureService } from './textures';
import { AccessoryBuilder } from './accessories';
import { EquippedAccessories } from '../services/bloxStore';

export interface R6Rig {
  root: THREE.Group;
  head: THREE.Mesh;
  torso: THREE.Mesh;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftArmMesh: THREE.Mesh;
  rightArmMesh: THREE.Mesh;
  leftLegMesh: THREE.Mesh;
  rightLegMesh: THREE.Mesh;
  nameBillboard: THREE.Sprite;
  colors: BodyPartColors;
  face: FaceType;
  equipped?: EquippedAccessories;
  health: number;
  maxHealth: number;
  name: string;
  isDead: boolean;
  facingAngle: number;
  walkCycle: number;
  isPlayer: boolean;
}

export class CharacterSystem {
  private materialsCache: Map<string, THREE.MeshStandardMaterial> = new Map();

  private getMaterial(colorHex: string, hasStuds: boolean = false): THREE.MeshStandardMaterial {
    const key = `${colorHex}_${hasStuds}`;
    if (this.materialsCache.has(key)) {
      return this.materialsCache.get(key)!;
    }

    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      roughness: 0.35,
      metalness: 0.05,
    });

    if (hasStuds) {
      mat.map = textureService.getStudTexture(2, 2);
    }

    this.materialsCache.set(key, mat);
    return mat;
  }

  public createR6(
    name: string,
    colors: BodyPartColors,
    isPlayer: boolean = false,
    face: FaceType = 'default',
    equipped?: EquippedAccessories
  ): R6Rig {
    const root = new THREE.Group();

    // Canonical R6 scales in Three.js units (1 stud = approx 0.8m)
    // Torso: width 2, height 2, depth 1
    const torsoGeo = new THREE.BoxGeometry(2, 2, 1);
    const torsoBaseMat = this.getMaterial(colors.torso, true);
    const torsoFrontTex = textureService.getTorsoFrontTexture(equipped?.shirt, equipped?.tshirt, colors.torso);
    const torsoFrontMat = new THREE.MeshStandardMaterial({
      map: torsoFrontTex,
      roughness: 0.4,
    });
    // Materials: [+X, -X, +Y, -Y, +Z (front), -Z]
    const torsoMats = [
      torsoBaseMat,
      torsoBaseMat,
      torsoBaseMat,
      torsoBaseMat,
      torsoFrontMat,
      torsoBaseMat,
    ];
    const torso = new THREE.Mesh(torsoGeo, torsoMats);
    torso.position.y = 3;
    torso.castShadow = true;
    torso.receiveShadow = true;
    root.add(torso);

    // Head: 1.25 x 1.2 x 1.25 with face texture on front (+Z face)
    const headGeo = new THREE.BoxGeometry(1.25, 1.2, 1.25);
    const faceTex = textureService.getFaceTexture(face, colors.head);
    const headFaceMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: faceTex,
      roughness: 0.35,
    });
    const headNormalMat = this.getMaterial(colors.head);
    // Box materials: [+X, -X, +Y, -Y, +Z (front), -Z]
    const headMats = [
      headNormalMat,
      headNormalMat,
      this.getMaterial(colors.head, true), // top studs
      headNormalMat,
      headFaceMat, // Face on front
      headNormalMat,
    ];
    const head = new THREE.Mesh(headGeo, headMats);
    head.position.set(0, 1.6, 0);
    head.castShadow = true;
    torso.add(head);

    // Top stud on head (classic Roblox cylinder bump on head)
    const studGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.22, 16);
    const studMesh = new THREE.Mesh(studGeo, headNormalMat);
    studMesh.position.set(0, 0.65, 0);
    head.add(studMesh);

    // Arms: width 1, height 2, depth 1
    // Left Arm Pivot at shoulder
    const leftArm = new THREE.Group();
    leftArm.position.set(-1.5, 0.9, 0);
    const armGeo = new THREE.BoxGeometry(1, 2, 1);
    const leftArmMat = this.getMaterial(colors.leftArm);
    const leftArmMesh = new THREE.Mesh(armGeo, leftArmMat);
    leftArmMesh.position.set(0, -0.9, 0); // offset down from shoulder pivot
    leftArmMesh.castShadow = true;
    leftArm.add(leftArmMesh);
    torso.add(leftArm);

    // Right Arm Pivot at shoulder
    const rightArm = new THREE.Group();
    rightArm.position.set(1.5, 0.9, 0);
    const rightArmMat = this.getMaterial(colors.rightArm);
    const rightArmMesh = new THREE.Mesh(armGeo, rightArmMat);
    rightArmMesh.position.set(0, -0.9, 0);
    rightArmMesh.castShadow = true;
    rightArm.add(rightArmMesh);
    torso.add(rightArm);

    // Legs: width 1, height 2, depth 1
    // Pants texture if equipped
    let legMaterial = this.getMaterial(colors.leftLeg);
    if (equipped?.pants) {
      legMaterial = new THREE.MeshStandardMaterial({
        map: textureService.getPantsTexture(equipped.pants, colors.leftLeg),
        roughness: 0.5,
      });
    }

    // Left Leg Pivot at hip
    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.5, -1.0, 0);
    const legGeo = new THREE.BoxGeometry(1, 2, 1);
    const leftLegMesh = new THREE.Mesh(legGeo, legMaterial);
    leftLegMesh.position.set(0, -1.0, 0);
    leftLegMesh.castShadow = true;
    leftLeg.add(leftLegMesh);
    torso.add(leftLeg);

    // Right Leg Pivot at hip
    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.5, -1.0, 0);
    const rightLegMesh = new THREE.Mesh(legGeo, legMaterial);
    rightLegMesh.position.set(0, -1.0, 0);
    rightLegMesh.castShadow = true;
    rightLeg.add(rightLegMesh);
    torso.add(rightLeg);

    // Classic 3D Billboard Name Tag and Health Bar
    const nameBillboard = this.createNameBillboard(name, 100, 100);
    nameBillboard.position.set(0, 3.1, 0);
    torso.add(nameBillboard);

    const rig: R6Rig = {
      root,
      head,
      torso,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      leftArmMesh,
      rightArmMesh,
      leftLegMesh,
      rightLegMesh,
      nameBillboard,
      colors: { ...colors },
      face,
      equipped: equipped ? { ...equipped } : undefined,
      health: 100,
      maxHealth: 100,
      name,
      isDead: false,
      facingAngle: 0,
      walkCycle: 0,
      isPlayer,
    };

    // Attach 3D Accessories
    if (equipped) {
      AccessoryBuilder.attachAccessories(rig, equipped);
    }

    return rig;
  }

  public updateColors(rig: R6Rig, colors: BodyPartColors) {
    rig.colors = { ...colors };

    // Update torso materials with clothing
    const torsoBaseMat = this.getMaterial(colors.torso, true);
    const torsoFrontTex = textureService.getTorsoFrontTexture(rig.equipped?.shirt, rig.equipped?.tshirt, colors.torso);
    const torsoFrontMat = new THREE.MeshStandardMaterial({
      map: torsoFrontTex,
      roughness: 0.4,
    });
    rig.torso.material = [
      torsoBaseMat,
      torsoBaseMat,
      torsoBaseMat,
      torsoBaseMat,
      torsoFrontMat,
      torsoBaseMat,
    ];

    const headMat = this.getMaterial(colors.head);
    const faceTex = textureService.getFaceTexture(rig.face, colors.head);
    const faceMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: faceTex,
      roughness: 0.35,
    });
    rig.head.material = [headMat, headMat, this.getMaterial(colors.head, true), headMat, faceMat, headMat];

    rig.leftArmMesh.material = this.getMaterial(colors.leftArm);
    rig.rightArmMesh.material = this.getMaterial(colors.rightArm);

    if (rig.equipped?.pants) {
      const pantsMat = new THREE.MeshStandardMaterial({
        map: textureService.getPantsTexture(rig.equipped.pants, colors.leftLeg),
        roughness: 0.5,
      });
      rig.leftLegMesh.material = pantsMat;
      rig.rightLegMesh.material = pantsMat;
    } else {
      rig.leftLegMesh.material = this.getMaterial(colors.leftLeg);
      rig.rightLegMesh.material = this.getMaterial(colors.rightLeg);
    }
  }

  public updateClothing(rig: R6Rig, equipped: EquippedAccessories) {
    rig.equipped = { ...equipped };
    this.updateColors(rig, rig.colors);
    AccessoryBuilder.attachAccessories(rig, equipped);
  }

  public updateFace(rig: R6Rig, face: FaceType) {
    rig.face = face;
    const headMat = this.getMaterial(rig.colors.head);
    const faceTex = textureService.getFaceTexture(face, rig.colors.head);
    const faceMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: faceTex,
      roughness: 0.35,
    });
    rig.head.material = [headMat, headMat, this.getMaterial(rig.colors.head, true), headMat, faceMat, headMat];
  }

  public updateAnimation(rig: R6Rig, dt: number, isMoving: boolean, isGrounded: boolean) {
    if (rig.isDead) return;

    if (!isGrounded) {
      // Classic jump pose: legs forward slightly, arms slightly up and out
      rig.leftLeg.rotation.x = -0.55;
      rig.rightLeg.rotation.x = -0.45;
      rig.leftArm.rotation.x = 0.45;
      rig.rightArm.rotation.x = 0.45;
      rig.leftArm.rotation.z = -0.2;
      rig.rightArm.rotation.z = 0.2;
      return;
    }

    if (isMoving) {
      rig.walkCycle += dt * 14;
      const swing = Math.sin(rig.walkCycle);

      // Classic R6 walk: limbs swing in exact opposite pairs
      rig.leftArm.rotation.x = swing * 0.85;
      rig.rightArm.rotation.x = -swing * 0.85;
      rig.leftLeg.rotation.x = -swing * 0.85;
      rig.rightLeg.rotation.x = swing * 0.85;

      rig.leftArm.rotation.z = -0.05;
      rig.rightArm.rotation.z = 0.05;

      // Gentle vertical torso bob
      rig.torso.position.y = 3 + Math.abs(Math.sin(rig.walkCycle * 2)) * 0.15;
    } else {
      // Idle pose: smoothly dampen to zero
      rig.walkCycle = 0;
      rig.leftArm.rotation.x *= 0.8;
      rig.rightArm.rotation.x *= 0.8;
      rig.leftLeg.rotation.x *= 0.8;
      rig.rightLeg.rotation.x *= 0.8;
      rig.leftArm.rotation.z = -0.05;
      rig.rightArm.rotation.z = 0.05;
      rig.torso.position.y = 3;
    }
  }

  public updateBillboard(rig: R6Rig) {
    const canvas = (rig.nameBillboard.material as THREE.SpriteMaterial).map?.image as HTMLCanvasElement;
    if (!canvas) return;

    this.drawBillboardCanvas(canvas, rig.name, rig.health, rig.maxHealth);
    ((rig.nameBillboard.material as THREE.SpriteMaterial).map as THREE.CanvasTexture).needsUpdate = true;
  }

  private createNameBillboard(name: string, health: number, maxHealth: number): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 80;
    this.drawBillboardCanvas(canvas, name, health, maxHealth);

    const texture = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(3.2, 1.0, 1);
    return sprite;
  }

  private drawBillboardCanvas(canvas: HTMLCanvasElement, name: string, health: number, maxHealth: number) {
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Text Shadow
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000000';
    ctx.fillText(name, 129, 31);

    // Text Front
    ctx.fillStyle = '#ffffff';
    ctx.fillText(name, 128, 30);

    // Health Bar Background
    const barWidth = 140;
    const barHeight = 10;
    const barX = (canvas.width - barWidth) / 2;
    const barY = 46;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);

    // Health Fill (Classic Green to Red gradient)
    const ratio = Math.max(0, Math.min(1, health / maxHealth));
    ctx.fillStyle = ratio > 0.5 ? '#2ecc71' : ratio > 0.2 ? '#f39c12' : '#e74c3c';
    ctx.fillRect(barX, barY, barWidth * ratio, barHeight);
  }
}

export const characterSystem = new CharacterSystem();
