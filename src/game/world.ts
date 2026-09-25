import * as THREE from 'three';
import { R6Rig, characterSystem } from './character';
import { PhysicsEngine, PhysicsObject } from './physics';
import { GameSettings, ToolType, BodyPartColors, FaceType, CustomNpcConfig } from './types';
import { soundManager } from './sound';
import { textureService } from './textures';
import { bloxStore, EquippedAccessories } from '../services/bloxStore';

export interface WorldCallbacks {
  onHealthChange: (health: number) => void;
  onRespawnCountdown?: (seconds: number | null) => void;
  onLeaderboardUpdate: () => void;
  onFpsUpdate: (fps: number) => void;
  onTogglePauseMenu?: () => void;
}

export class GameWorld {
  public container: HTMLElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public physics: PhysicsEngine;
  public player: R6Rig | null = null;
  public playerVelocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public isPlayerGrounded: boolean = true;

  // Respawn & Death Camera
  public isRespawning: boolean = false;
  public respawnTimer: number = 0;
  public deathPosition: THREE.Vector3 = new THREE.Vector3(0, 2, 0);

  // Camera Orbit controls
  public cameraDistance: number = 14;
  public cameraYaw: number = 0;
  public cameraPitch: number = 0.35;
  public isRightMouseDown: boolean = false;
  public mousePrevX: number = 0;
  public mousePrevY: number = 0;

  // Input states
  public keys: Record<string, boolean> = {};
  public joystickVector: { x: number; y: number } = { x: 0, y: 0 };
  public mobileSprint: boolean = false;

  // Tools & Interaction
  public activeTool: ToolType = 'none';
  public grabbedObject: PhysicsObject | null = null;
  public grabbedNoob: { rig: R6Rig; velocity: THREE.Vector3 } | null = null;
  public grabDistance: number = 10;
  public laserLine: THREE.Line | null = null;

  // Settings & Animation Loop
  public settings: GameSettings;
  public callbacks: WorldCallbacks;
  private animationFrameId: number | null = null;
  private lastTime: number = performance.now();
  private frameCount: number = 0;
  private fpsTimer: number = 0;

  constructor(container: HTMLElement, settings: GameSettings, callbacks: WorldCallbacks) {
    this.container = container;
    this.settings = { ...settings };
    this.callbacks = callbacks;

    // 1. Initialize Scene & Retro Skybox
    this.scene = new THREE.Scene();
    const skybox = textureService.loadSkybox();
    this.scene.background = skybox;

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(
      65,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );

    // 3. Renderer with Retro Lighting
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    container.appendChild(this.renderer.domElement);

    // 4. Lighting (Classic Sunny Roblox Day)
    const ambientLight = new THREE.AmbientLight(0xddeeff, 0.7);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff6e5, 1.4);
    sunLight.position.set(60, 100, 40);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 250;
    const shadowD = 70;
    sunLight.shadow.camera.left = -shadowD;
    sunLight.shadow.camera.right = shadowD;
    sunLight.shadow.camera.top = shadowD;
    sunLight.shadow.camera.bottom = -shadowD;
    this.scene.add(sunLight);

    // 5. Physics Engine
    this.physics = new PhysicsEngine(this.scene);
    this.physics.onPlayerDied = (deathPos: THREE.Vector3) => {
      this.handlePlayerDeath(deathPos);
    };

    // 6. Build Baseplate & Spawn Location
    this.buildEnvironment();

    // 7. Spawn Initial Player
    this.spawnPlayer();

    // 8. Spawn Initial Sandbox Toys
    this.spawnInitialObjects();

    // 9. Attach Event Listeners
    this.setupInputs();

    // 10. Start Loop
    this.startLoop();
  }

  private buildEnvironment() {
    const baseSize = this.physics.baseplateSize;

    // Classic Green Baseplate
    const plateGeo = new THREE.BoxGeometry(baseSize, 4, baseSize);
    const studTexture = textureService.getStudTexture(baseSize / 4, baseSize / 4);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x2e8b2b, // Classic Roblox bright green
      map: studTexture,
      roughness: 0.6,
      metalness: 0.05,
    });
    const baseplate = new THREE.Mesh(plateGeo, plateMat);
    baseplate.position.y = -2;
    baseplate.receiveShadow = true;
    this.scene.add(baseplate);

    // Outer Dark Gray Rim
    const rimGeo = new THREE.BoxGeometry(baseSize + 4, 3.8, baseSize + 4);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.position.y = -2.1;
    rim.receiveShadow = true;
    this.scene.add(rim);

    // Classic 12x12 Gray Spawn Location Pad
    const spawnGeo = new THREE.BoxGeometry(10, 0.4, 10);
    const spawnMat = new THREE.MeshStandardMaterial({
      map: textureService.getSpawnDecalTexture(),
      roughness: 0.4,
    });
    const spawnPad = new THREE.Mesh(spawnGeo, spawnMat);
    spawnPad.position.set(0, 0.2, 0);
    spawnPad.receiveShadow = true;
    this.scene.add(spawnPad);

    // Laser line for Gravity Gun
    const laserGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const laserMat = new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 3 });
    this.laserLine = new THREE.Line(laserGeo, laserMat);
    this.laserLine.visible = false;
    this.scene.add(this.laserLine);
  }

  public handlePlayerDeath(pos?: THREE.Vector3) {
    if (this.isRespawning) return;
    this.isRespawning = true;
    this.respawnTimer = 3.2;

    if (pos) {
      this.deathPosition.copy(pos);
    } else if (this.player) {
      this.deathPosition.copy(this.player.root.position);
    }

    soundManager.updateWalking(false);
    this.callbacks.onHealthChange(0);
    this.callbacks.onRespawnCountdown?.(3);
    this.callbacks.onLeaderboardUpdate();
  }

  public spawnPlayer() {
    if (this.player) {
      this.scene.remove(this.player.root);
      this.player = null;
    }

    this.isRespawning = false;
    this.respawnTimer = 0;

    const bloxState = bloxStore.getState();
    const colors = this.settings.colors || bloxState.colors;
    const face = this.settings.face || bloxState.face;
    this.player = characterSystem.createR6('You', colors, true, face, bloxState.equipped);
    // Position on top of spawn pad (0, 0.4, 0)
    this.player.root.position.set(0, 0.4, 0);
    this.scene.add(this.player.root);
    this.playerVelocity.set(0, 0, 0);
    this.isPlayerGrounded = true;

    this.callbacks.onHealthChange(100);
    this.callbacks.onRespawnCountdown?.(null);
    this.callbacks.onLeaderboardUpdate();
  }

  private spawnInitialObjects() {
    // Spawn 2 friendly Noobs with classic faces
    this.physics.spawnNoob(-8, 8, {
      head: '#F5CD30',
      torso: '#0D69AC',
      leftArm: '#F5CD30',
      rightArm: '#F5CD30',
      leftLeg: '#A4BD47',
      rightLeg: '#A4BD47',
    }, 'Noob', 'default', 7, 100, 'wander');

    this.physics.spawnNoob(8, -8, {
      head: '#F5CD30',
      torso: '#c0392b',
      leftArm: '#F5CD30',
      rightArm: '#F5CD30',
      leftLeg: '#2c3e50',
      rightLeg: '#2c3e50',
    }, 'Guest 666', 'checkit', 8, 120, 'wander');

    // Spawn Crates
    this.physics.spawnCrate(new THREE.Vector3(-10, 2, -10));
    this.physics.spawnCrate(new THREE.Vector3(-10, 5, -10));
    this.physics.spawnCrate(new THREE.Vector3(-10, 8, -10));

    // Spawn Trampoline
    this.physics.spawnTrampoline(new THREE.Vector3(14, 0.4, 14));

    // Spawn a bomb
    this.physics.spawnBomb(new THREE.Vector3(6, 3, 6));

    this.callbacks.onLeaderboardUpdate();
  }

  private setupInputs() {
    // Keyboard
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      // Escape key toggles Roblox Pause Menu
      if (e.code === 'Escape' || e.key === 'Escape') {
        e.preventDefault();
        this.callbacks.onTogglePauseMenu?.();
      }

      // Tool shortcuts (1-6)
      if (e.code === 'Digit1') this.setTool(this.activeTool === 'gravity' ? 'none' : 'gravity');
      if (e.code === 'Digit2') this.setTool(this.activeTool === 'rocket' ? 'none' : 'rocket');
      if (e.code === 'Digit3') this.setTool(this.activeTool === 'sword' ? 'none' : 'sword');
      if (e.code === 'Digit4') this.setTool(this.activeTool === 'bomb' ? 'none' : 'bomb');
      if (e.code === 'Digit5') this.setTool(this.activeTool === 'crate' ? 'none' : 'crate');
      if (e.code === 'Digit6') this.setTool(this.activeTool === 'spawner' ? 'none' : 'spawner');

      if (e.code === 'Space') {
        this.tryJump();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Mouse Controls (Camera Orbit & Tool actions)
    const dom = this.renderer.domElement;

    dom.addEventListener('mousedown', (e) => {
      if (e.button === 2) {
        // Right click: camera orbit
        this.isRightMouseDown = true;
        this.mousePrevX = e.clientX;
        this.mousePrevY = e.clientY;
      } else if (e.button === 0) {
        // Left click: tool action / grab
        this.onPointerDown(e.clientX, e.clientY);
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isRightMouseDown) {
        const dx = e.clientX - this.mousePrevX;
        const dy = e.clientY - this.mousePrevY;
        this.mousePrevX = e.clientX;
        this.mousePrevY = e.clientY;

        this.cameraYaw -= dx * 0.006;
        this.cameraPitch = Math.max(-0.25, Math.min(1.4, this.cameraPitch + dy * 0.006));
      }

      if (this.grabbedObject || this.grabbedNoob) {
        this.updateGrabbedPosition();
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 2) {
        this.isRightMouseDown = false;
      } else if (e.button === 0) {
        this.onPointerUp();
      }
    });

    // Disable default right-click context menu on canvas
    dom.addEventListener('contextmenu', (e) => e.preventDefault());

    // Zoom
    dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.cameraDistance = Math.max(3, Math.min(45, this.cameraDistance + e.deltaY * 0.025));
    }, { passive: false });

    // Window Resize
    window.addEventListener('resize', this.onResize);
  }

  private onResize = () => {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  public tryJump() {
    if (!this.player || this.player.isDead || !this.isPlayerGrounded) return;
    this.playerVelocity.y = this.settings.jumpPower;
    this.isPlayerGrounded = false;
    soundManager.play('jump', 0.8);
  }

  public setTool(tool: ToolType) {
    this.activeTool = tool;
    if (this.laserLine) this.laserLine.visible = false;
    this.grabbedObject = null;
    this.grabbedNoob = null;
  }

  private onPointerDown(clientX: number, clientY: number) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    // If using Rocket Tool: fire rocket toward target
    if (this.activeTool === 'rocket') {
      if (this.player && !this.player.isDead) {
        const from = this.player.root.position.clone().add(new THREE.Vector3(0, 3, 0));
        const dir = raycaster.ray.direction.clone();
        this.physics.fireRocket(from, dir);
        soundManager.play('explosion', 0.4);
      }
      return;
    }

    // If using Bomb Tool: throw bomb
    if (this.activeTool === 'bomb') {
      if (this.player && !this.player.isDead) {
        const from = this.player.root.position.clone().add(new THREE.Vector3(0, 3.5, 0));
        const throwVel = raycaster.ray.direction.clone().multiplyScalar(28).add(new THREE.Vector3(0, 8, 0));
        this.physics.spawnBomb(from, throwVel);
        this.callbacks.onLeaderboardUpdate();
      }
      return;
    }

    // If using Crate Tool: place crate
    if (this.activeTool === 'crate') {
      if (this.player && !this.player.isDead) {
        const placePos = this.player.root.position.clone().add(
          new THREE.Vector3(Math.sin(this.cameraYaw) * -5, 2, Math.cos(this.cameraYaw) * -5)
        );
        this.physics.spawnCrate(placePos);
        this.callbacks.onLeaderboardUpdate();
      }
      return;
    }

    // If using Sword Tool: swing and knockback nearby objects
    if (this.activeTool === 'sword') {
      this.swingSword();
      return;
    }

    // If using Spawner Tool: spawn character where clicked
    if (this.activeTool === 'spawner') {
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const hitPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, hitPoint);
      if (hitPoint) {
        this.spawnCharacter('noob', hitPoint);
        soundManager.play('jump', 0.6);
      }
      return;
    }

    // Gravity / Fling tool or direct click
    const intersectables: THREE.Object3D[] = [];
    for (const obj of this.physics.objects) {
      if (!obj.isStatic) intersectables.push(obj.mesh);
    }
    for (const npc of this.physics.noobs) {
      intersectables.push(npc.rig.torso);
    }

    const hits = raycaster.intersectObjects(intersectables, true);
    if (hits.length > 0) {
      const hitObj = hits[0].object;

      // Check if it belongs to a Noob NPC
      for (const npc of this.physics.noobs) {
        if (hitObj === npc.rig.torso || npc.rig.root.getObjectById(hitObj.id)) {
          this.grabbedNoob = npc;
          this.grabDistance = Math.min(22, this.camera.position.distanceTo(npc.rig.root.position));
          if (this.laserLine) this.laserLine.visible = true;
          return;
        }
      }

      // Check physics objects
      for (const obj of this.physics.objects) {
        if (obj.mesh === hitObj || obj.mesh.getObjectById(hitObj.id)) {
          this.grabbedObject = obj;
          this.grabDistance = Math.min(22, this.camera.position.distanceTo(obj.position));
          if (this.laserLine) this.laserLine.visible = true;
          return;
        }
      }
    }
  }

  private swingSword() {
    if (!this.player || this.player.isDead) return;

    soundManager.play('oof', 0.4);
    // Player right arm swings forward
    this.player.rightArm.rotation.x = -1.5;

    // Check hit radius in front of player
    const forward = new THREE.Vector3(-Math.sin(this.cameraYaw), 0, -Math.cos(this.cameraYaw)).normalize();
    const swingCenter = this.player.root.position.clone().add(forward.multiplyScalar(4));

    // Launch crates and noobs
    for (const obj of this.physics.objects) {
      if (obj.position.distanceTo(swingCenter) < 5) {
        obj.velocity.add(new THREE.Vector3(forward.x * 35, 18, forward.z * 35));
        obj.angularVelocity.set((Math.random() - 0.5) * 15, 10, (Math.random() - 0.5) * 15);
      }
    }

    for (let i = this.physics.noobs.length - 1; i >= 0; i--) {
      const npc = this.physics.noobs[i];
      if (npc.rig.root.position.distanceTo(swingCenter) < 5) {
        npc.velocity.add(new THREE.Vector3(forward.x * 40, 20, forward.z * 40));
        npc.rig.health -= 35;
        characterSystem.updateBillboard(npc.rig);
        if (npc.rig.health <= 0) {
          this.physics.destroyNoob(i);
          this.callbacks.onLeaderboardUpdate();
        }
      }
    }
  }

  private updateGrabbedPosition() {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    const targetPos = raycaster.ray.origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(this.grabDistance));

    if (this.grabbedObject) {
      const impulse = targetPos.clone().sub(this.grabbedObject.position).multiplyScalar(15);
      this.grabbedObject.velocity.copy(impulse);

      if (this.laserLine && this.player) {
        const from = this.player.root.position.clone().add(new THREE.Vector3(0, 3, 0));
        this.laserLine.geometry.setFromPoints([from, this.grabbedObject.position]);
      }
    } else if (this.grabbedNoob) {
      const impulse = targetPos.clone().sub(this.grabbedNoob.rig.root.position).multiplyScalar(15);
      this.grabbedNoob.velocity.copy(impulse);

      if (this.laserLine && this.player) {
        const from = this.player.root.position.clone().add(new THREE.Vector3(0, 3, 0));
        this.laserLine.geometry.setFromPoints([from, this.grabbedNoob.rig.root.position]);
      }
    }
  }

  private onPointerUp() {
    if (this.grabbedObject) {
      // Add fling launch velocity!
      this.grabbedObject.velocity.multiplyScalar(1.5);
      this.grabbedObject = null;
    }
    if (this.grabbedNoob) {
      this.grabbedNoob.velocity.multiplyScalar(1.5);
      this.grabbedNoob = null;
    }
    if (this.laserLine) {
      this.laserLine.visible = false;
    }
  }

  private updatePlayerMovement(dt: number) {
    if (!this.player || this.player.isDead) return;

    // Movement Vector from WASD or Mobile Joystick
    let moveX = 0;
    let moveZ = 0;

    if (this.keys['KeyW'] || this.keys['ArrowUp']) moveZ -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) moveZ += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveX -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) moveX += 1;

    // Add Mobile touch joystick
    moveX += this.joystickVector.x;
    moveZ += this.joystickVector.y;

    const inputLen = Math.hypot(moveX, moveZ);
    const isMoving = inputLen > 0.1;

    const isSprinting = (this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.mobileSprint) && this.settings.runningEnabled;
    const currentSpeed = isSprinting ? this.settings.runSpeed : this.settings.walkSpeed;

    if (isMoving) {
      // Normalize
      const normX = moveX / Math.max(1, inputLen);
      const normZ = moveZ / Math.max(1, inputLen);

      // Rotate by Camera Yaw
      const sin = Math.sin(this.cameraYaw);
      const cos = Math.cos(this.cameraYaw);
      const worldMoveX = normX * cos + normZ * sin;
      const worldMoveZ = -normX * sin + normZ * cos;

      this.playerVelocity.x = worldMoveX * currentSpeed;
      this.playerVelocity.z = worldMoveZ * currentSpeed;

      // Rotate character to face movement direction
      const targetAngle = Math.atan2(worldMoveX, worldMoveZ);
      this.player.root.rotation.y = targetAngle;
    } else {
      // Ground friction
      this.playerVelocity.x *= 0.75;
      this.playerVelocity.z *= 0.75;
    }

    // Gravity
    this.playerVelocity.y -= this.settings.gravity * dt;

    // Ground status
    this.isPlayerGrounded = this.player.root.position.y <= 0.05;

    // Update Footsteps Sound
    soundManager.updateWalking(isMoving && this.isPlayerGrounded);

    // Update animations
    characterSystem.updateAnimation(this.player, dt, isMoving, this.isPlayerGrounded);
  }

  private updateCamera() {
    let targetPos: THREE.Vector3;

    if (this.isRespawning || !this.player || this.player.isDead) {
      // Elevate target position smoothly above death location so camera never clips into ground or spawnpoint
      if (this.deathPosition.y < -20) {
        // Fell into void: gracefully watch baseplate from above
        targetPos = new THREE.Vector3(0, 3.5, 0);
      } else {
        targetPos = new THREE.Vector3(
          this.deathPosition.x,
          Math.max(2.0, this.deathPosition.y + 2.0),
          this.deathPosition.z
        );
      }
    } else {
      targetPos = this.player.root.position.clone().add(new THREE.Vector3(0, 2.8, 0));
    }

    // Spherical orbit calculation
    const dist = this.isRespawning ? Math.max(12, this.cameraDistance) : this.cameraDistance;
    const pitch = this.isRespawning ? Math.max(0.32, this.cameraPitch) : this.cameraPitch;

    const offset = new THREE.Vector3(
      Math.sin(this.cameraYaw) * Math.cos(pitch) * dist,
      Math.sin(pitch) * dist,
      Math.cos(this.cameraYaw) * Math.cos(pitch) * dist
    );

    const cameraDesiredPos = targetPos.clone().add(offset);
    this.camera.position.lerp(cameraDesiredPos, 0.18);
    this.camera.lookAt(targetPos);
  }

  private startLoop() {
    const loop = (now: number) => {
      const dt = Math.min((now - this.lastTime) / 1000, 0.1);
      this.lastTime = now;

      // FPS tracking
      this.frameCount++;
      this.fpsTimer += dt;
      if (this.fpsTimer >= 0.5) {
        this.callbacks.onFpsUpdate(Math.round((this.frameCount / this.fpsTimer)));
        this.frameCount = 0;
        this.fpsTimer = 0;
      }

      // Handle Automatic Respawn Timer
      if (this.isRespawning) {
        this.respawnTimer -= dt;
        const displaySec = Math.max(1, Math.ceil(this.respawnTimer));
        this.callbacks.onRespawnCountdown?.(displaySec);

        if (this.respawnTimer <= 0) {
          this.spawnPlayer();
        }
      }

      // 1. Player movement
      this.updatePlayerMovement(dt);

      // 2. Physics simulation
      const playerFell = this.physics.update(dt, this.settings, this.player, this.playerVelocity);
      if (playerFell && this.player && !this.player.isDead) {
        this.deathPosition.copy(this.player.root.position);
        this.physics.disassembleRig(this.player);
        this.handlePlayerDeath();
      }

      // 3. Camera follow
      this.updateCamera();

      // 4. Render
      this.renderer.render(this.scene, this.camera);

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  public updateColors(colors: BodyPartColors) {
    this.settings.colors = { ...colors };
    bloxStore.setColors(colors);
    if (this.player && !this.player.isDead) {
      characterSystem.updateColors(this.player, colors);
    }
  }

  public updateFace(face: FaceType) {
    this.settings.face = face;
    bloxStore.setFace(face);
    if (this.player && !this.player.isDead) {
      characterSystem.updateFace(this.player, face);
    }
  }

  public updateClothing(equipped: EquippedAccessories) {
    if (this.player && !this.player.isDead) {
      characterSystem.updateClothing(this.player, equipped);
    }
  }

  public resetPlayer() {
    this.spawnPlayer();
  }

  public killPlayer() {
    if (this.player && !this.player.isDead) {
      this.deathPosition.copy(this.player.root.position);
      this.physics.disassembleRig(this.player, new THREE.Vector3(0, 10, 0));
      this.handlePlayerDeath();
    }
  }

  public spawnCustomNpc(config: CustomNpcConfig): R6Rig {
    let posX = 0;
    let posZ = 0;

    if (this.player && !this.player.isDead) {
      const forward = new THREE.Vector3(-Math.sin(this.cameraYaw), 0, -Math.cos(this.cameraYaw));
      posX = this.player.root.position.x + forward.x * 7 + (Math.random() - 0.5) * 4;
      posZ = this.player.root.position.z + forward.z * 7 + (Math.random() - 0.5) * 4;
    } else {
      posX = (Math.random() - 0.5) * 20;
      posZ = (Math.random() - 0.5) * 20;
    }

    const rig = this.physics.spawnNoob(
      posX,
      posZ,
      config.colors,
      config.name,
      config.face,
      config.speed,
      config.health,
      config.behavior
    );
    this.callbacks.onLeaderboardUpdate();
    return rig;
  }

  public spawnCharacter(
    type: 'clone' | 'noob' | 'guest' | 'zombie' | 'gold' | 'random',
    customPos?: THREE.Vector3
  ): R6Rig {
    let colors: BodyPartColors;
    let name: string;
    let face: FaceType = 'default';

    if (type === 'clone') {
      colors = { ...this.settings.colors };
      face = this.settings.face || 'default';
      name = `Clone #${Math.floor(Math.random() * 900 + 100)}`;
    } else if (type === 'guest') {
      colors = {
        head: '#F5CD30',
        torso: '#c0392b',
        leftArm: '#F5CD30',
        rightArm: '#F5CD30',
        leftLeg: '#2c3e50',
        rightLeg: '#2c3e50',
      };
      face = 'checkit';
      name = `Guest ${Math.floor(Math.random() * 9000 + 1000)}`;
    } else if (type === 'zombie') {
      colors = {
        head: '#55efc4',
        torso: '#2d3436',
        leftArm: '#55efc4',
        rightArm: '#55efc4',
        leftLeg: '#636e72',
        rightLeg: '#636e72',
      };
      face = 'shocked';
      name = `Zombie Noob #${Math.floor(Math.random() * 900 + 100)}`;
    } else if (type === 'gold') {
      colors = {
        head: '#f1c40f',
        torso: '#f39c12',
        leftArm: '#f1c40f',
        rightArm: '#f1c40f',
        leftLeg: '#e67e22',
        rightLeg: '#e67e22',
      };
      face = 'winning';
      name = `Golden Noob #${Math.floor(Math.random() * 900 + 100)}`;
    } else if (type === 'random') {
      const retroPalettes = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#34495e', '#e67e22', '#1abc9c'];
      const faces: FaceType[] = ['chill', 'man', 'checkit', 'epic', 'winning', 'grin', 'tongue', 'skeptical'];
      face = faces[Math.floor(Math.random() * faces.length)];
      colors = {
        head: '#F5CD30',
        torso: retroPalettes[Math.floor(Math.random() * retroPalettes.length)],
        leftArm: '#F5CD30',
        rightArm: '#F5CD30',
        leftLeg: retroPalettes[Math.floor(Math.random() * retroPalettes.length)],
        rightLeg: retroPalettes[Math.floor(Math.random() * retroPalettes.length)],
      };
      name = `Player_${Math.floor(Math.random() * 9000 + 1000)}`;
    } else {
      colors = {
        head: '#F5CD30',
        torso: '#0D69AC',
        leftArm: '#F5CD30',
        rightArm: '#F5CD30',
        leftLeg: '#A4BD47',
        rightLeg: '#A4BD47',
      };
      face = 'default';
      name = `Noob #${Math.floor(Math.random() * 900 + 100)}`;
    }

    let posX = 0;
    let posZ = 0;
    if (customPos) {
      posX = customPos.x;
      posZ = customPos.z;
    } else if (this.player && !this.player.isDead) {
      const forward = new THREE.Vector3(-Math.sin(this.cameraYaw), 0, -Math.cos(this.cameraYaw));
      posX = this.player.root.position.x + forward.x * 7 + (Math.random() - 0.5) * 4;
      posZ = this.player.root.position.z + forward.z * 7 + (Math.random() - 0.5) * 4;
    } else {
      posX = (Math.random() - 0.5) * 20;
      posZ = (Math.random() - 0.5) * 20;
    }

    const rig = this.physics.spawnNoob(posX, posZ, colors, name, face, 7, 100, 'wander');
    this.callbacks.onLeaderboardUpdate();
    return rig;
  }

  public spawnHorde(count: number = 5) {
    const center = this.player && !this.player.isDead
      ? this.player.root.position.clone()
      : new THREE.Vector3(0, 0, 0);

    const colors: BodyPartColors = {
      head: '#F5CD30',
      torso: '#0D69AC',
      leftArm: '#F5CD30',
      rightArm: '#F5CD30',
      leftLeg: '#A4BD47',
      rightLeg: '#A4BD47',
    };

    this.physics.spawnMultipleNoobs(count, center, colors, 'Noob');
    this.callbacks.onLeaderboardUpdate();
  }

  public renameEntity(id: string, newName: string) {
    if (this.player && (id === 'player' || this.player.name === id)) {
      this.player.name = newName;
      characterSystem.updateBillboard(this.player);
      this.callbacks.onLeaderboardUpdate();
      return;
    }

    for (const npc of this.physics.noobs) {
      if (npc.rig.name === id) {
        npc.rig.name = newName;
        characterSystem.updateBillboard(npc.rig);
        this.callbacks.onLeaderboardUpdate();
        return;
      }
    }
  }

  public destroy() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.onResize);
    soundManager.updateWalking(false);
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
