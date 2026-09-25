import * as THREE from 'three';
import { R6Rig, characterSystem } from './character';
import { BodyPartColors, GameSettings, FaceType, NpcBehavior } from './types';
import { soundManager } from './sound';
import { textureService } from './textures';

export interface PhysicsObject {
  id: string;
  type: 'crate' | 'bomb' | 'trampoline' | 'part' | 'rocket';
  mesh: THREE.Object3D;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  angularVelocity: THREE.Vector3;
  size: THREE.Vector3;
  mass: number;
  restitution: number;
  isGrounded: boolean;
  isStatic?: boolean;
  fuseTimer?: number;
  exploded?: boolean;
  lifeTime?: number;
  maxLife?: number;
  damage?: number;
  targetRig?: R6Rig;
}

export interface BlastEffect {
  mesh: THREE.Mesh;
  light: THREE.PointLight;
  duration: number;
  elapsed: number;
  maxRadius: number;
}

export interface NpcEntity {
  rig: R6Rig;
  velocity: THREE.Vector3;
  isGrounded: boolean;
  aiTimer: number;
  aiDir: THREE.Vector3;
  speed: number;
  behavior: NpcBehavior;
}

export class PhysicsEngine {
  public scene: THREE.Scene;
  public objects: PhysicsObject[] = [];
  public noobs: NpcEntity[] = [];
  public blastEffects: BlastEffect[] = [];
  public baseplateSize: number = 240;
  public onPlayerDied?: (deathPos: THREE.Vector3) => void;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public update(dt: number, settings: GameSettings, playerRig: R6Rig | null, playerVelocity: THREE.Vector3): boolean {
    const cappedDt = Math.min(dt, 0.05);

    // 1. Update Player Physics
    let playerFell = false;
    if (playerRig && !playerRig.isDead) {
      playerRig.root.position.x += playerVelocity.x * cappedDt;
      playerRig.root.position.y += playerVelocity.y * cappedDt;
      playerRig.root.position.z += playerVelocity.z * cappedDt;

      // Baseplate floor collision
      const halfSize = this.baseplateSize / 2;
      const onPlate = Math.abs(playerRig.root.position.x) <= halfSize && Math.abs(playerRig.root.position.z) <= halfSize;

      if (onPlate && playerRig.root.position.y <= 0) {
        if (playerVelocity.y < -15) {
          soundManager.play('land', 0.5);
        }
        playerRig.root.position.y = 0;
        playerVelocity.y = 0;
      } else if (!onPlate && playerRig.root.position.y < -80) {
        playerFell = true;
      }

      // Check collision with trampolines
      for (const obj of this.objects) {
        if (obj.type === 'trampoline') {
          const distXZ = Math.hypot(playerRig.root.position.x - obj.position.x, playerRig.root.position.z - obj.position.z);
          if (distXZ < 3.5 && Math.abs(playerRig.root.position.y - obj.position.y) < 2.0) {
            playerVelocity.y = 55;
            soundManager.play('jump', 1.0);
          }
        }
      }
    }

    // 2. Update Noob NPCs with Dynamic AI
    for (let i = this.noobs.length - 1; i >= 0; i--) {
      const npc = this.noobs[i];
      if (npc.rig.isDead) continue;

      npc.aiTimer -= cappedDt;

      // AI Decision Making
      if (npc.behavior === 'follow' && playerRig && !playerRig.isDead) {
        const dx = playerRig.root.position.x - npc.rig.root.position.x;
        const dz = playerRig.root.position.z - npc.rig.root.position.z;
        const dist = Math.hypot(dx, dz);

        if (dist > 3.0 && dist < 70) {
          npc.aiDir.set(dx / dist, 0, dz / dist);
          npc.rig.root.rotation.y = Math.atan2(dx, dz);
        } else {
          npc.aiDir.set(0, 0, 0);
        }
      } else if (npc.behavior === 'flee' && playerRig && !playerRig.isDead) {
        const dx = npc.rig.root.position.x - playerRig.root.position.x;
        const dz = npc.rig.root.position.z - playerRig.root.position.z;
        const dist = Math.hypot(dx, dz);

        if (dist < 22 && dist > 0.1) {
          npc.aiDir.set(dx / dist, 0, dz / dist);
          npc.rig.root.rotation.y = Math.atan2(dx, dz);
        } else {
          npc.aiDir.set(0, 0, 0);
        }
      } else if (npc.behavior === 'idle') {
        npc.aiDir.set(0, 0, 0);
      } else {
        // Wander
        if (npc.aiTimer <= 0) {
          npc.aiTimer = 1.8 + Math.random() * 3.2;
          if (Math.random() > 0.3) {
            const angle = Math.random() * Math.PI * 2;
            npc.aiDir.set(Math.cos(angle), 0, Math.sin(angle));
            npc.rig.root.rotation.y = angle;
          } else {
            npc.aiDir.set(0, 0, 0);
          }
        }
      }

      // Apply NPC horizontal velocity
      if (npc.isGrounded) {
        if (npc.aiDir.lengthSq() > 0.05) {
          npc.velocity.x = npc.aiDir.x * npc.speed;
          npc.velocity.z = npc.aiDir.z * npc.speed;
        } else {
          npc.velocity.x *= 0.82;
          npc.velocity.z *= 0.82;
        }
      }

      // Gravity
      npc.velocity.y -= settings.gravity * cappedDt;
      npc.rig.root.position.x += npc.velocity.x * cappedDt;
      npc.rig.root.position.y += npc.velocity.y * cappedDt;
      npc.rig.root.position.z += npc.velocity.z * cappedDt;

      // Floor
      const halfSize = this.baseplateSize / 2;
      const onPlate = Math.abs(npc.rig.root.position.x) <= halfSize && Math.abs(npc.rig.root.position.z) <= halfSize;

      if (onPlate && npc.rig.root.position.y <= 0) {
        npc.rig.root.position.y = 0;
        npc.velocity.y = 0;
        npc.isGrounded = true;
      } else {
        npc.isGrounded = false;
      }

      // Trampoline check for NPC
      for (const obj of this.objects) {
        if (obj.type === 'trampoline') {
          const distXZ = Math.hypot(npc.rig.root.position.x - obj.position.x, npc.rig.root.position.z - obj.position.z);
          if (distXZ < 3.5 && Math.abs(npc.rig.root.position.y - obj.position.y) < 2.0) {
            npc.velocity.y = 52;
            soundManager.play('jump', 0.7);
          }
        }
      }

      // Fell into void
      if (npc.rig.root.position.y < -90) {
        this.destroyNoob(i);
        continue;
      }

      // Animation
      const isMoving = Math.hypot(npc.velocity.x, npc.velocity.z) > 0.8;
      characterSystem.updateAnimation(npc.rig, cappedDt, isMoving, npc.isGrounded);
    }

    // 3. Update Sandbox Physics Objects
    for (let i = this.objects.length - 1; i >= 0; i--) {
      const obj = this.objects[i];

      if (obj.isStatic) continue;

      // Gravity
      obj.velocity.y -= settings.gravity * cappedDt;

      // Air resistance
      obj.velocity.x *= 0.995;
      obj.velocity.z *= 0.995;

      // Position update
      obj.position.x += obj.velocity.x * cappedDt;
      obj.position.y += obj.velocity.y * cappedDt;
      obj.position.z += obj.velocity.z * cappedDt;

      // Rotation update
      obj.mesh.rotation.x += obj.angularVelocity.x * cappedDt;
      obj.mesh.rotation.y += obj.angularVelocity.y * cappedDt;
      obj.mesh.rotation.z += obj.angularVelocity.z * cappedDt;

      // Sync mesh
      obj.mesh.position.copy(obj.position);

      // Floor bounce & friction
      const halfSize = this.baseplateSize / 2;
      const onPlate = Math.abs(obj.position.x) <= halfSize && Math.abs(obj.position.z) <= halfSize;
      const floorLevel = obj.size.y / 2;

      if (onPlate && obj.position.y <= floorLevel) {
        obj.position.y = floorLevel;
        obj.mesh.position.y = floorLevel;

        if (Math.abs(obj.velocity.y) > 3) {
          obj.velocity.y = -obj.velocity.y * obj.restitution;
        } else {
          obj.velocity.y = 0;
          obj.isGrounded = true;
        }

        // Ground friction
        obj.velocity.x *= 0.88;
        obj.velocity.z *= 0.88;
        obj.angularVelocity.multiplyScalar(0.92);
      } else {
        obj.isGrounded = false;
      }

      // Bomb ticking & explosion
      if (obj.type === 'bomb' && !obj.exploded) {
        obj.fuseTimer = (obj.fuseTimer ?? 3) - cappedDt;

        // Visual blinking pulse
        const mesh = obj.mesh as THREE.Group;
        const fuseLight = mesh.getObjectByName('fuseLight') as THREE.PointLight;
        if (fuseLight) {
          const freq = (3 - obj.fuseTimer) * 8 + 2;
          fuseLight.intensity = Math.sin(Date.now() * 0.01 * freq) > 0 ? 3 : 0.2;
        }

        if (obj.fuseTimer <= 0) {
          this.detonateBomb(obj, playerRig, playerVelocity);
          this.removeObject(i);
          continue;
        }
      }

      // Rocket projectile
      if (obj.type === 'rocket') {
        // Explode on ground hit or after 4 seconds
        obj.lifeTime = (obj.lifeTime ?? 0) + cappedDt;
        if (obj.isGrounded || (obj.lifeTime ?? 0) > 4) {
          this.createExplosion(obj.position, 16, 75, playerRig, playerVelocity);
          this.removeObject(i);
          continue;
        }
      }

      // Life decay for broken parts
      if (obj.type === 'part') {
        obj.lifeTime = (obj.lifeTime ?? 0) + cappedDt;
        if ((obj.lifeTime ?? 0) > (obj.maxLife ?? 10)) {
          this.removeObject(i);
          continue;
        }
      }

      // Void cleanup
      if (obj.position.y < -100) {
        this.removeObject(i);
        continue;
      }
    }

    // 4. Update Blast Effects
    for (let i = this.blastEffects.length - 1; i >= 0; i--) {
      const blast = this.blastEffects[i];
      blast.elapsed += cappedDt;
      const progress = blast.elapsed / blast.duration;

      if (progress >= 1) {
        this.scene.remove(blast.mesh);
        this.scene.remove(blast.light);
        this.blastEffects.splice(i, 1);
      } else {
        const radius = 1 + progress * blast.maxRadius;
        blast.mesh.scale.set(radius, radius, radius);
        (blast.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - progress) * 0.85;
        blast.light.intensity = (1 - progress) * 8;
      }
    }

    return playerFell;
  }

  public detonateBomb(bomb: PhysicsObject, playerRig: R6Rig | null, playerVelocity: THREE.Vector3) {
    this.createExplosion(bomb.position, 18, 90, playerRig, playerVelocity);
  }

  public createExplosion(
    center: THREE.Vector3,
    blastRadius: number = 18,
    maxDamage: number = 100,
    playerRig: R6Rig | null = null,
    playerVelocity: THREE.Vector3 | null = null
  ) {
    soundManager.play('explosion', 1.0);

    // 1. Visual blast sphere
    const sphereGeo = new THREE.SphereGeometry(1, 16, 16);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0xffaa22,
      transparent: true,
      opacity: 0.85,
      wireframe: false,
    });
    const blastMesh = new THREE.Mesh(sphereGeo, sphereMat);
    blastMesh.position.copy(center);
    this.scene.add(blastMesh);

    const blastLight = new THREE.PointLight(0xff6600, 10, blastRadius * 2);
    blastLight.position.copy(center);
    this.scene.add(blastLight);

    this.blastEffects.push({
      mesh: blastMesh,
      light: blastLight,
      duration: 0.35,
      elapsed: 0,
      maxRadius: blastRadius * 0.65,
    });

    // 2. Blast impulse and damage to Player
    if (playerRig && !playerRig.isDead && playerVelocity) {
      const dist = playerRig.root.position.distanceTo(center);
      if (dist < blastRadius) {
        const power = 1 - dist / blastRadius;
        const dir = new THREE.Vector3().subVectors(playerRig.root.position, center).normalize();
        dir.y = Math.max(0.4, dir.y);

        playerVelocity.x += dir.x * power * 45;
        playerVelocity.y += dir.y * power * 55;
        playerVelocity.z += dir.z * power * 45;

        const damage = Math.round(power * maxDamage);
        playerRig.health = Math.max(0, playerRig.health - damage);
        characterSystem.updateBillboard(playerRig);

        if (playerRig.health <= 0) {
          this.disassembleRig(playerRig, dir.multiplyScalar(power * 25));
        }
      }
    }

    // 3. Blast impulse and damage to Noobs
    for (let i = this.noobs.length - 1; i >= 0; i--) {
      const npc = this.noobs[i];
      if (npc.rig.isDead) continue;

      const dist = npc.rig.root.position.distanceTo(center);
      if (dist < blastRadius) {
        const power = 1 - dist / blastRadius;
        const dir = new THREE.Vector3().subVectors(npc.rig.root.position, center).normalize();
        dir.y = Math.max(0.4, dir.y);

        npc.velocity.x += dir.x * power * 50;
        npc.velocity.y += dir.y * power * 60;
        npc.velocity.z += dir.z * power * 50;

        const damage = Math.round(power * maxDamage);
        npc.rig.health = Math.max(0, npc.rig.health - damage);
        characterSystem.updateBillboard(npc.rig);

        if (npc.rig.health <= 0) {
          this.disassembleRig(npc.rig, dir.multiplyScalar(power * 30));
          this.destroyNoob(i, false);
        }
      }
    }

    // 4. Blast impulse to other physics objects
    for (const obj of this.objects) {
      if (obj.isStatic) continue;

      const dist = obj.position.distanceTo(center);
      if (dist < blastRadius && dist > 0.1) {
        const power = 1 - dist / blastRadius;
        const dir = new THREE.Vector3().subVectors(obj.position, center).normalize();
        dir.y = Math.max(0.3, dir.y);

        obj.velocity.add(dir.multiplyScalar(power * 60));
        obj.angularVelocity.add(
          new THREE.Vector3(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20
          )
        );

        // Chain detonate nearby bombs
        if (obj.type === 'bomb' && !obj.exploded) {
          obj.fuseTimer = 0.05;
        }
      }
    }
  }

  /**
   * Classic Roblox Dismemberment / OOF disassembly
   * Spatters Head, Torso, Left/Right Arm, Left/Right Leg with physical velocity
   */
  public disassembleRig(rig: R6Rig, baseImpulse: THREE.Vector3 = new THREE.Vector3()) {
    soundManager.play('oof', 1.0);
    rig.isDead = true;
    rig.root.visible = false;

    if (rig.isPlayer && this.onPlayerDied) {
      this.onPlayerDied(rig.root.position.clone());
    }

    const partsDef = [
      { name: 'Head', size: new THREE.Vector3(1.25, 1.2, 1.25), offset: new THREE.Vector3(0, 4.6, 0), color: rig.colors.head, isHead: true },
      { name: 'Torso', size: new THREE.Vector3(2, 2, 1), offset: new THREE.Vector3(0, 3, 0), color: rig.colors.torso },
      { name: 'LeftArm', size: new THREE.Vector3(1, 2, 1), offset: new THREE.Vector3(-1.5, 3, 0), color: rig.colors.leftArm },
      { name: 'RightArm', size: new THREE.Vector3(1, 2, 1), offset: new THREE.Vector3(1.5, 3, 0), color: rig.colors.rightArm },
      { name: 'LeftLeg', size: new THREE.Vector3(1, 2, 1), offset: new THREE.Vector3(-0.5, 1, 0), color: rig.colors.leftLeg },
      { name: 'RightLeg', size: new THREE.Vector3(1, 2, 1), offset: new THREE.Vector3(0.5, 1, 0), color: rig.colors.rightLeg },
    ];

    for (const def of partsDef) {
      const geo = new THREE.BoxGeometry(def.size.x, def.size.y, def.size.z);
      let mat: THREE.Material | THREE.Material[];

      if (def.isHead) {
        const faceTex = textureService.getFaceTexture(rig.face || 'default', def.color);
        const headFaceMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          map: faceTex,
          roughness: 0.35,
        });
        const headNormal = new THREE.MeshStandardMaterial({
          color: new THREE.Color(def.color),
          roughness: 0.35,
        });
        mat = [headNormal, headNormal, headNormal, headNormal, headFaceMat, headNormal];
      } else {
        mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(def.color),
          map: textureService.getStudTexture(1, 1),
          roughness: 0.35,
        });
      }

      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const worldPos = new THREE.Vector3().copy(rig.root.position).add(def.offset);
      mesh.position.copy(worldPos);
      this.scene.add(mesh);

      const scatterX = (Math.random() - 0.5) * 18 + baseImpulse.x;
      const scatterY = Math.random() * 22 + 8 + Math.max(0, baseImpulse.y);
      const scatterZ = (Math.random() - 0.5) * 18 + baseImpulse.z;

      this.objects.push({
        id: `part_${Date.now()}_${Math.random()}`,
        type: 'part',
        mesh,
        position: worldPos,
        velocity: new THREE.Vector3(scatterX, scatterY, scatterZ),
        angularVelocity: new THREE.Vector3(
          (Math.random() - 0.5) * 16,
          (Math.random() - 0.5) * 16,
          (Math.random() - 0.5) * 16
        ),
        size: def.size,
        mass: 1,
        restitution: 0.3,
        isGrounded: false,
        lifeTime: 0,
        maxLife: 10,
      });
    }
  }

  public spawnNoob(
    x: number,
    z: number,
    colors: BodyPartColors,
    name: string = 'Noob',
    face: FaceType = 'default',
    speed: number = 7,
    health: number = 100,
    behavior: NpcBehavior = 'wander'
  ): R6Rig {
    const rig = characterSystem.createR6(name, colors, false, face);
    rig.health = health;
    rig.maxHealth = health;
    characterSystem.updateBillboard(rig);
    rig.root.position.set(x, 2, z);
    this.scene.add(rig.root);

    this.noobs.push({
      rig,
      velocity: new THREE.Vector3(0, 0, 0),
      isGrounded: false,
      aiTimer: 2,
      aiDir: new THREE.Vector3(0, 0, 0),
      speed,
      behavior,
    });

    return rig;
  }

  public spawnMultipleNoobs(
    count: number,
    center: THREE.Vector3,
    colors: BodyPartColors,
    baseName: string = 'Noob',
    face: FaceType = 'default',
    speed: number = 7,
    behavior: NpcBehavior = 'wander'
  ): R6Rig[] {
    const spawned: R6Rig[] = [];
    const radius = Math.min(18, 3 + count * 0.8);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = center.x + Math.cos(angle) * radius;
      const z = center.z + Math.sin(angle) * radius;
      const name = `${baseName} #${Math.floor(Math.random() * 900 + 100)}`;
      spawned.push(this.spawnNoob(x, z, colors, name, face, speed, 100, behavior));
    }
    return spawned;
  }

  public spawnCrate(position: THREE.Vector3): PhysicsObject {
    const size = new THREE.Vector3(3, 3, 3);
    const geo = new THREE.BoxGeometry(size.x, size.y, size.z);
    const mat = new THREE.MeshStandardMaterial({
      map: textureService.getCrateTexture(),
      roughness: 0.55,
      metalness: 0.1,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    const obj: PhysicsObject = {
      id: `crate_${Date.now()}_${Math.random()}`,
      type: 'crate',
      mesh,
      position: position.clone(),
      velocity: new THREE.Vector3(0, 0, 0),
      angularVelocity: new THREE.Vector3(0, 0, 0),
      size,
      mass: 5,
      restitution: 0.2,
      isGrounded: false,
    };
    this.objects.push(obj);
    return obj;
  }

  public spawnBomb(position: THREE.Vector3, throwVelocity?: THREE.Vector3): PhysicsObject {
    const group = new THREE.Group();

    // Bomb body: black sphere
    const sphereGeo = new THREE.SphereGeometry(1.2, 16, 16);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.25,
      metalness: 0.4,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.castShadow = true;
    group.add(sphere);

    // Bomb neck
    const neckGeo = new THREE.CylinderGeometry(0.3, 0.4, 0.4, 12);
    const neckMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
    const neck = new THREE.Mesh(neckGeo, neckMat);
    neck.position.y = 1.3;
    group.add(neck);

    // Fuse spark light
    const fuseLight = new THREE.PointLight(0xff2200, 2, 8);
    fuseLight.name = 'fuseLight';
    fuseLight.position.y = 1.6;
    group.add(fuseLight);

    group.position.copy(position);
    this.scene.add(group);

    const obj: PhysicsObject = {
      id: `bomb_${Date.now()}_${Math.random()}`,
      type: 'bomb',
      mesh: group,
      position: position.clone(),
      velocity: throwVelocity ? throwVelocity.clone() : new THREE.Vector3(0, 2, 0),
      angularVelocity: new THREE.Vector3(Math.random() * 2, Math.random() * 2, Math.random() * 2),
      size: new THREE.Vector3(2.4, 2.4, 2.4),
      mass: 2,
      restitution: 0.45,
      isGrounded: false,
      fuseTimer: 3.0,
      exploded: false,
    };
    this.objects.push(obj);
    return obj;
  }

  public spawnTrampoline(position: THREE.Vector3): PhysicsObject {
    const group = new THREE.Group();

    // Outer frame: red ring/box
    const frameGeo = new THREE.BoxGeometry(6, 0.6, 6);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xd63031, roughness: 0.4 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.castShadow = true;
    group.add(frame);

    // Spring canvas: bright yellow top with studs
    const matGeo = new THREE.BoxGeometry(5.2, 0.7, 5.2);
    const matMat = new THREE.MeshStandardMaterial({
      color: 0xfdcb6e,
      map: textureService.getStudTexture(4, 4),
      roughness: 0.3,
    });
    const bounceMat = new THREE.Mesh(matGeo, matMat);
    bounceMat.position.y = 0.1;
    bounceMat.castShadow = true;
    bounceMat.receiveShadow = true;
    group.add(bounceMat);

    group.position.copy(position);
    this.scene.add(group);

    const obj: PhysicsObject = {
      id: `trampoline_${Date.now()}_${Math.random()}`,
      type: 'trampoline',
      mesh: group,
      position: position.clone(),
      velocity: new THREE.Vector3(0, 0, 0),
      angularVelocity: new THREE.Vector3(0, 0, 0),
      size: new THREE.Vector3(6, 0.8, 6),
      mass: 100,
      restitution: 0.1,
      isGrounded: true,
      isStatic: true,
    };
    this.objects.push(obj);
    return obj;
  }

  public fireRocket(from: THREE.Vector3, direction: THREE.Vector3) {
    const geo = new THREE.CylinderGeometry(0.3, 0.3, 2, 8);
    const mat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.5 });
    const mesh = new THREE.Mesh(geo, mat);

    // Rotate to face direction
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
    mesh.position.copy(from);
    this.scene.add(mesh);

    const obj: PhysicsObject = {
      id: `rocket_${Date.now()}`,
      type: 'rocket',
      mesh,
      position: from.clone(),
      velocity: direction.clone().normalize().multiplyScalar(45),
      angularVelocity: new THREE.Vector3(0, 0, 0),
      size: new THREE.Vector3(1, 1, 1),
      mass: 1,
      restitution: 0,
      isGrounded: false,
      lifeTime: 0,
    };
    this.objects.push(obj);
  }

  public removeObject(index: number) {
    const obj = this.objects[index];
    if (obj) {
      this.scene.remove(obj.mesh);
      this.objects.splice(index, 1);
    }
  }

  public destroyNoob(index: number, disassemble: boolean = true) {
    const npc = this.noobs[index];
    if (!npc) return;

    if (disassemble && !npc.rig.isDead) {
      this.disassembleRig(npc.rig);
    }
    this.scene.remove(npc.rig.root);
    this.noobs.splice(index, 1);
  }

  public clearSandbox() {
    for (const obj of this.objects) {
      this.scene.remove(obj.mesh);
    }
    this.objects = [];

    for (const npc of this.noobs) {
      this.scene.remove(npc.rig.root);
    }
    this.noobs = [];

    for (const blast of this.blastEffects) {
      this.scene.remove(blast.mesh);
      this.scene.remove(blast.light);
    }
    this.blastEffects = [];
  }
}
