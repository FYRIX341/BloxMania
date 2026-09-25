import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { soundManager } from '../sound';
import { bloxStore } from '../../services/bloxStore';
import { AccessoryBuilder } from '../accessories';
import { characterSystem, R6Rig } from '../character';
import { textureService } from '../textures';
import { LogOut, Rocket, Bomb, Sword, Box, Trophy, Users } from 'lucide-react';

interface DoomspireGameProps {
  onLeaveGame: () => void;
}

export const DoomspireGame: React.FC<DoomspireGameProps> = ({ onLeaveGame }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [teamScores, setTeamScores] = useState({ Red: 100, Blue: 100, Green: 100, Yellow: 100 });
  const [activeWeapon, setActiveWeapon] = useState<'rocket' | 'bomb' | 'sword' | 'trowel'>('rocket');
  const [isPauseOpen, setIsPauseOpen] = useState(false);
  const [myTeam] = useState<'Red' | 'Blue' | 'Green' | 'Yellow'>('Red');
  const [eliminations, setEliminations] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = textureService.loadSkybox();

    const camera = new THREE.PerspectiveCamera(65, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Light
    const amb = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(amb);
    const sun = new THREE.DirectionalLight(0xffeedd, 1.4);
    sun.position.set(50, 100, 30);
    sun.castShadow = true;
    scene.add(sun);

    // 2. Build 4 Doomspires
    const spires = [
      { team: 'Red', color: 0xd63031, x: -35, z: -35 },
      { team: 'Blue', color: 0x0984e3, x: 35, z: -35 },
      { team: 'Green', color: 0x00b894, x: -35, z: 35 },
      { team: 'Yellow', color: 0xfdcb6e, x: 35, z: 35 },
    ];

    const spireMeshes: THREE.Mesh[] = [];
    const brickParts: { mesh: THREE.Mesh; vel: THREE.Vector3 }[] = [];

    for (const sp of spires) {
      // Main Spire Tower (Height 60, Base 18x18)
      const towerGeo = new THREE.BoxGeometry(18, 60, 18);
      const towerMat = new THREE.MeshStandardMaterial({
        color: sp.color,
        map: textureService.getStudTexture(4, 12),
        roughness: 0.5,
      });
      const tower = new THREE.Mesh(towerGeo, towerMat);
      tower.position.set(sp.x, 30, sp.z);
      tower.castShadow = true;
      tower.receiveShadow = true;
      scene.add(tower);
      spireMeshes.push(tower);

      // Spire Roof battlement
      const roofGeo = new THREE.BoxGeometry(22, 2, 22);
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x2d3436, roughness: 0.6 });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.set(sp.x, 61, sp.z);
      scene.add(roof);
    }

    // Bridges connecting spires
    const bridgeGeo = new THREE.BoxGeometry(52, 1, 4);
    const bridgeMat = new THREE.MeshStandardMaterial({ color: 0x6d451b, map: textureService.getCrateTexture() });

    const b1 = new THREE.Mesh(bridgeGeo, bridgeMat);
    b1.position.set(0, 30, -35);
    scene.add(b1);

    const b2 = new THREE.Mesh(bridgeGeo, bridgeMat);
    b2.position.set(0, 30, 35);
    scene.add(b2);

    const b3 = new THREE.Mesh(bridgeGeo, bridgeMat);
    b3.position.set(-35, 30, 0);
    b3.rotation.y = Math.PI / 2;
    scene.add(b3);

    const b4 = new THREE.Mesh(bridgeGeo, bridgeMat);
    b4.position.set(35, 30, 0);
    b4.rotation.y = Math.PI / 2;
    scene.add(b4);

    // 3. Player Character
    const state = bloxStore.getState();
    const playerRig = characterSystem.createR6('You', state.colors, true, state.face, state.equipped);
    playerRig.root.position.set(-35, 62, -35); // Spawn on Red Spire roof
    scene.add(playerRig.root);

    // 4. Enemy Team Bots
    const bots: { rig: R6Rig; team: string; vel: THREE.Vector3; aiTimer: number }[] = [];
    const botColors = [
      { team: 'Blue', color: '#0984e3', x: 35, z: -35 },
      { team: 'Green', color: '#00b894', x: -35, z: 35 },
      { team: 'Yellow', color: '#fdcb6e', x: 35, z: 35 },
    ];

    for (const b of botColors) {
      const botRig = characterSystem.createR6(`${b.team} Defender`, {
        head: '#F5CD30',
        torso: b.color,
        leftArm: '#F5CD30',
        rightArm: '#F5CD30',
        leftLeg: '#2c3e50',
        rightLeg: '#2c3e50',
      }, false, 'checkit');
      botRig.root.position.set(b.x, 62, b.z);
      scene.add(botRig.root);
      bots.push({ rig: botRig, team: b.team, vel: new THREE.Vector3(), aiTimer: 2 });
    }

    // Camera Orbit
    let yaw = 0;
    let pitch = 0.3;
    let dist = 14;
    let isMouseDown = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const keys: Record<string, boolean> = {};
    const playerVel = new THREE.Vector3();

    // Rockets & Projectiles
    const rockets: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[] = [];

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.code] = true;
      if (e.code === 'Digit1') setActiveWeapon('rocket');
      if (e.code === 'Digit2') setActiveWeapon('bomb');
      if (e.code === 'Digit3') setActiveWeapon('sword');
      if (e.code === 'Digit4') setActiveWeapon('trowel');
      if (e.code === 'Space' && playerRig.root.position.y <= 62.5) {
        playerVel.y = 35;
        soundManager.play('jump');
      }
      if (e.key === 'Escape' || e.code === 'Escape') {
        setIsPauseOpen((prev) => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2) {
        isMouseDown = true;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      } else if (e.button === 0) {
        // Fire weapon
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

        if (activeWeapon === 'rocket') {
          soundManager.play('explosion', 0.4);
          const rGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.8, 8);
          const rMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.6 });
          const rMesh = new THREE.Mesh(rGeo, rMat);
          rMesh.position.copy(playerRig.root.position).add(new THREE.Vector3(0, 3, 0));
          rMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), raycaster.ray.direction.clone().normalize());
          scene.add(rMesh);

          rockets.push({
            mesh: rMesh,
            vel: raycaster.ray.direction.clone().normalize().multiplyScalar(50),
            life: 0,
          });
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isMouseDown) {
        yaw -= (e.clientX - prevMouseX) * 0.006;
        pitch = Math.max(-0.2, Math.min(1.2, pitch + (e.clientY - prevMouseY) * 0.006));
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 2) isMouseDown = false;
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp);
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Loop
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Player Movement
      let mx = 0;
      let mz = 0;
      if (keys['KeyW']) mz -= 1;
      if (keys['KeyS']) mz += 1;
      if (keys['KeyA']) mx -= 1;
      if (keys['KeyD']) mx += 1;

      if (mx !== 0 || mz !== 0) {
        const len = Math.hypot(mx, mz);
        const nx = mx / len;
        const nz = mz / len;
        const sin = Math.sin(yaw);
        const cos = Math.cos(yaw);
        const wx = nx * cos + nz * sin;
        const wz = -nx * sin + nz * cos;

        playerVel.x = wx * 22;
        playerVel.z = wz * 22;
        playerRig.root.rotation.y = Math.atan2(wx, wz);
      } else {
        playerVel.x *= 0.8;
        playerVel.z *= 0.8;
      }

      playerVel.y -= 75 * dt; // Gravity
      playerRig.root.position.addScaledVector(playerVel, dt);

      // Floor check (Spire roof or bridge)
      if (playerRig.root.position.y <= 61 && Math.abs(playerRig.root.position.x - -35) < 10 && Math.abs(playerRig.root.position.z - -35) < 10) {
        playerRig.root.position.y = 61;
        playerVel.y = 0;
      } else if (playerRig.root.position.y <= 30 && (Math.abs(playerRig.root.position.x) < 40 && Math.abs(playerRig.root.position.z) < 40)) {
        if (playerRig.root.position.y < 30) playerRig.root.position.y = 30;
        playerVel.y = 0;
      } else if (playerRig.root.position.y < -50) {
        // Fell into void: respawn
        soundManager.play('oof');
        playerRig.root.position.set(-35, 62, -35);
        playerVel.set(0, 0, 0);
      }

      // Update Rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.life += dt;
        r.mesh.position.addScaledVector(r.vel, dt);

        // Check hit enemy bots
        let hit = false;
        for (let bIdx = bots.length - 1; bIdx >= 0; bIdx--) {
          const bot = bots[bIdx];
          if (bot.rig.root.position.distanceTo(r.mesh.position) < 4) {
            soundManager.play('explosion');
            soundManager.play('oof');
            bot.rig.root.position.y = -100; // Knock into void
            setEliminations((prev) => prev + 1);
            bloxStore.addBloxies(15);
            hit = true;
            break;
          }
        }

        if (hit || r.life > 3 || r.mesh.position.y < 0) {
          scene.remove(r.mesh);
          rockets.splice(i, 1);
        }
      }

      // Camera follow
      const target = playerRig.root.position.clone().add(new THREE.Vector3(0, 3, 0));
      const camOffset = new THREE.Vector3(
        Math.sin(yaw) * Math.cos(pitch) * dist,
        Math.sin(pitch) * dist,
        Math.cos(yaw) * Math.cos(pitch) * dist
      );
      camera.position.copy(target).add(camOffset);
      camera.lookAt(target);

      renderer.render(scene, camera);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp);
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none font-sans">
      <div ref={containerRef} className="absolute inset-0 cursor-crosshair" />

      {/* Top HUD */}
      <div className="fixed top-3 left-3 right-3 z-40 flex items-center justify-between px-4 py-2 bg-black/75 backdrop-blur-xl border border-white/10 rounded-2xl text-white">
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 rounded-xl bg-red-600 font-black text-xs">
            DOOMSPIRE
          </div>
          <span className="font-extrabold text-sm text-zinc-100">Team: <strong className="text-red-400">RED</strong></span>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5 text-amber-300">
            <Trophy className="w-4 h-4" />
            <span>Eliminations: {eliminations}</span>
          </div>
          <button
            onClick={() => setIsPauseOpen(true)}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-xl transition"
          >
            Menu (Esc)
          </button>
        </div>
      </div>

      {/* Weapon Hotbar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 p-1.5 bg-black/80 backdrop-blur-md border border-white/15 rounded-2xl text-white">
        {[
          { id: 'rocket' as const, key: '1', label: 'Rocket', icon: <Rocket className="w-5 h-5 text-orange-400" /> },
          { id: 'bomb' as const, key: '2', label: 'Bomb', icon: <Bomb className="w-5 h-5 text-red-400" /> },
          { id: 'sword' as const, key: '3', label: 'Sword', icon: <Sword className="w-5 h-5 text-zinc-300" /> },
          { id: 'trowel' as const, key: '4', label: 'Trowel', icon: <Box className="w-5 h-5 text-amber-400" /> },
        ].map((w) => (
          <button
            key={w.id}
            onClick={() => setActiveWeapon(w.id)}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl border transition ${
              activeWeapon === w.id
                ? 'bg-red-600/30 border-red-500 shadow-md shadow-red-500/30 scale-105'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <span className="text-[10px] font-mono text-zinc-400 absolute top-1 left-1.5">{w.key}</span>
            {w.icon}
            <span className="text-[9px] mt-0.5">{w.label}</span>
          </button>
        ))}
      </div>

      {/* Pause Menu Modal */}
      {isPauseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md text-white">
          <div className="w-full max-w-sm bg-zinc-950 border border-white/20 rounded-2xl p-6 flex flex-col gap-4 text-center">
            <h2 className="text-lg font-black text-red-400">Doomspire Brickbattle</h2>
            <p className="text-xs text-zinc-400">Defend your red spire and blast away enemy towers!</p>

            <button
              onClick={() => setIsPauseOpen(false)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-xs"
            >
              Resume Match
            </button>

            <button
              onClick={onLeaveGame}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 rounded-xl font-bold text-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Leave to BloxMania</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
