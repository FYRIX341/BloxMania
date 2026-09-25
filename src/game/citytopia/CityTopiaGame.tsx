import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { soundManager } from '../sound';
import { bloxStore } from '../../services/bloxStore';
import { AccessoryBuilder } from '../accessories';
import { characterSystem } from '../character';
import { textureService } from '../textures';
import { LogOut, Car, Home, Briefcase, MessageSquare } from 'lucide-react';

interface CityTopiaGameProps {
  onLeaveGame: () => void;
}

export const CityTopiaGame: React.FC<CityTopiaGameProps> = ({ onLeaveGame }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDriving, setIsDriving] = useState(false);
  const [claimedHouse, setClaimedHouse] = useState<string | null>(null);
  const [currentJob, setCurrentJob] = useState('Citizen');
  const [isPauseOpen, setIsPauseOpen] = useState(false);
  const [chatLog, setChatLog] = useState<string[]>([
    'Server: Welcome to CityTopia Roleplay!',
    'Mayor Bob: Don’t forget to check out the new town square!',
  ]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const scene = new THREE.Scene();
    scene.background = textureService.loadSkybox();

    const camera = new THREE.PerspectiveCamera(65, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Sunlight
    const amb = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(amb);
    const sun = new THREE.DirectionalLight(0xfff5e6, 1.3);
    sun.position.set(40, 80, 40);
    sun.castShadow = true;
    scene.add(sun);

    // 1. Town Ground
    const groundGeo = new THREE.BoxGeometry(200, 2, 200);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x27ae60, roughness: 0.8 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -1;
    ground.receiveShadow = true;
    scene.add(ground);

    // Asphalt Roads (Cross-shaped main avenue)
    const roadGeoH = new THREE.BoxGeometry(180, 0.1, 14);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x2d3436, roughness: 0.9 });
    const roadH = new THREE.Mesh(roadGeoH, roadMat);
    roadH.position.y = 0.05;
    scene.add(roadH);

    const roadGeoV = new THREE.BoxGeometry(14, 0.1, 180);
    const roadV = new THREE.Mesh(roadGeoV, roadMat);
    roadV.position.y = 0.05;
    scene.add(roadV);

    // 2. Town Buildings
    const buildings = [
      { name: 'City Hospital', color: 0xffffff, x: -30, z: -30, w: 20, h: 18, d: 20 },
      { name: 'Police Dept', color: 0x2980b9, x: 30, z: -30, w: 18, h: 14, d: 18 },
      { name: 'Pizza Palace', color: 0xe67e22, x: -30, z: 30, w: 16, h: 10, d: 16 },
      { name: 'Town Hall', color: 0xf1c40f, x: 30, z: 30, w: 22, h: 22, d: 22 },
      { name: 'Villa House 1', color: 0x9b59b6, x: -65, z: 0, w: 18, h: 12, d: 18 },
      { name: 'Villa House 2', color: 0x1abc9c, x: 65, z: 0, w: 18, h: 12, d: 18 },
    ];

    for (const b of buildings) {
      const bGeo = new THREE.BoxGeometry(b.w, b.h, b.d);
      const bMat = new THREE.MeshStandardMaterial({ color: b.color, roughness: 0.5 });
      const bMesh = new THREE.Mesh(bGeo, bMat);
      bMesh.position.set(b.x, b.h / 2, b.z);
      bMesh.castShadow = true;
      bMesh.receiveShadow = true;
      scene.add(bMesh);

      // Roof
      const rGeo = new THREE.BoxGeometry(b.w + 2, 1.5, b.d + 2);
      const rMat = new THREE.MeshStandardMaterial({ color: 0x34495e });
      const rMesh = new THREE.Mesh(rGeo, rMat);
      rMesh.position.set(b.x, b.h + 0.75, b.z);
      scene.add(rMesh);
    }

    // 3. Driveable Car
    const carGroup = new THREE.Group();
    const carBodyGeo = new THREE.BoxGeometry(6, 2, 10);
    const carBodyMat = new THREE.MeshStandardMaterial({ color: 0xe74c3c, metalness: 0.3, roughness: 0.2 });
    const carBody = new THREE.Mesh(carBodyGeo, carBodyMat);
    carBody.position.y = 1.5;
    carBody.castShadow = true;
    carGroup.add(carBody);

    // Windshield
    const cabinGeo = new THREE.BoxGeometry(5.2, 1.8, 5);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0x34495e, metalness: 0.6 });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 3, -0.5);
    carGroup.add(cabin);

    // Headlights
    const hLightMat = new THREE.MeshBasicMaterial({ color: 0xffffaa });
    const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.2), hLightMat);
    hl1.position.set(-2, 1.6, 5.05);
    carGroup.add(hl1);
    const hl2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.2), hLightMat);
    hl2.position.set(2, 1.6, 5.05);
    carGroup.add(hl2);

    carGroup.position.set(0, 0, -15);
    scene.add(carGroup);

    // 4. Player Avatar
    const state = bloxStore.getState();
    const playerRig = characterSystem.createR6('You', state.colors, true, state.face, state.equipped);
    playerRig.root.position.set(0, 0, 5);
    scene.add(playerRig.root);

    // Controls
    let yaw = 0;
    let pitch = 0.3;
    let dist = 14;
    let isMouseDown = false;
    let prevX = 0;
    let prevY = 0;

    const keys: Record<string, boolean> = {};
    let carSpeed = 0;
    let carAngle = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.code] = true;
      if (e.code === 'KeyE') {
        // Toggle enter/exit car if near
        const d = playerRig.root.position.distanceTo(carGroup.position);
        if (d < 8) {
          setIsDriving((prev) => {
            const next = !prev;
            if (next) soundManager.play('jump');
            return next;
          });
        }
      }
      if (e.code === 'Space' && !isDriving) {
        playerRig.root.position.y += 0.2;
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
        prevX = e.clientX;
        prevY = e.clientY;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isMouseDown) {
        yaw -= (e.clientX - prevX) * 0.006;
        pitch = Math.max(-0.2, Math.min(1.2, pitch + (e.clientY - prevY) * 0.006));
        prevX = e.clientX;
        prevY = e.clientY;
      }
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp);
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (isDriving) {
        // Drive Car
        if (keys['KeyW']) carSpeed = Math.min(45, carSpeed + 40 * dt);
        else if (keys['KeyS']) carSpeed = Math.max(-20, carSpeed - 30 * dt);
        else carSpeed *= 0.95;

        if (keys['KeyA']) carAngle += 2.2 * dt * (carSpeed / 30);
        if (keys['KeyD']) carAngle -= 2.2 * dt * (carSpeed / 30);

        carGroup.rotation.y = carAngle;
        carGroup.position.x += Math.sin(carAngle) * carSpeed * dt;
        carGroup.position.z += Math.cos(carAngle) * carSpeed * dt;

        // Stick player inside car
        playerRig.root.position.copy(carGroup.position).add(new THREE.Vector3(0, 1.2, 0));
        playerRig.root.rotation.y = carAngle;
      } else {
        // Walk around
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

          playerRig.root.position.x += wx * 18 * dt;
          playerRig.root.position.z += wz * 18 * dt;
          playerRig.root.rotation.y = Math.atan2(wx, wz);
          characterSystem.updateAnimation(playerRig, dt, true, true);
        } else {
          characterSystem.updateAnimation(playerRig, dt, false, true);
        }
      }

      // Camera follow
      const focusTarget = isDriving ? carGroup.position : playerRig.root.position;
      const target = focusTarget.clone().add(new THREE.Vector3(0, 3, 0));
      const camDist = isDriving ? 22 : dist;
      const camOffset = new THREE.Vector3(
        Math.sin(yaw) * Math.cos(pitch) * camDist,
        Math.sin(pitch) * camDist,
        Math.cos(yaw) * Math.cos(pitch) * camDist
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
  }, [isDriving]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none font-sans">
      <div ref={containerRef} className="absolute inset-0 cursor-crosshair" />

      {/* Top HUD */}
      <div className="fixed top-3 left-3 right-3 z-40 flex items-center justify-between px-4 py-2 bg-black/75 backdrop-blur-xl border border-white/10 rounded-2xl text-white">
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 rounded-xl bg-purple-600 font-black text-xs">
            CITYTOPIA
          </div>
          <span className="font-extrabold text-sm text-zinc-100">Job: <strong className="text-amber-300">{currentJob}</strong></span>
          {claimedHouse && (
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Owns {claimedHouse}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs font-bold">
          <button
            onClick={() => setClaimedHouse(claimedHouse ? null : 'Villa House 1')}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-xl transition"
          >
            <Home className="w-3.5 h-3.5 text-purple-400" />
            <span>{claimedHouse ? 'Unclaim House' : 'Claim House'}</span>
          </button>

          <button
            onClick={() => {
              const jobs = ['Police Officer', 'Doctor', 'Pizza Chef', 'Mayor', 'Citizen'];
              const next = jobs[(jobs.indexOf(currentJob) + 1) % jobs.length];
              setCurrentJob(next);
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-xl transition"
          >
            <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
            <span>Change Job</span>
          </button>

          <button
            onClick={() => setIsPauseOpen(true)}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-xl transition"
          >
            Menu (Esc)
          </button>
        </div>
      </div>

      {/* Driving Hint */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-black/80 backdrop-blur-md border border-white/15 rounded-2xl text-white text-xs font-bold flex items-center gap-2">
        <Car className="w-4 h-4 text-red-400" />
        <span>{isDriving ? 'Press [E] to Exit Car (Drive with W, A, S, D)' : 'Walk up to Red Car & Press [E] to Drive'}</span>
      </div>

      {/* Pause Menu Modal */}
      {isPauseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md text-white">
          <div className="w-full max-w-sm bg-zinc-950 border border-white/20 rounded-2xl p-6 flex flex-col gap-4 text-center">
            <h2 className="text-lg font-black text-purple-400">CityTopia Roleplay</h2>
            <p className="text-xs text-zinc-400">Explore houses, drive sports cars, and meet friends!</p>

            <button
              onClick={() => setIsPauseOpen(false)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-xs"
            >
              Resume Game
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
