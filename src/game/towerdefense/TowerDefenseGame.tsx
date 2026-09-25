import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { soundManager } from '../sound';
import { bloxStore } from '../../services/bloxStore';
import { LogOut, Shield, Zap, Target, Play } from 'lucide-react';

interface TowerDefenseGameProps {
  onLeaveGame: () => void;
}

interface Tower {
  mesh: THREE.Mesh;
  type: 'slingshot' | 'cannon' | 'laser';
  range: number;
  damage: number;
  rate: number;
  cooldown: number;
  cost: number;
}

interface Enemy {
  mesh: THREE.Mesh;
  hp: number;
  maxHp: number;
  speed: number;
  pathIndex: number;
}

export const TowerDefenseGame: React.FC<TowerDefenseGameProps> = ({ onLeaveGame }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [wave, setWave] = useState(1);
  const [coins, setCoins] = useState(150);
  const [baseHp, setBaseHp] = useState(100);
  const [isPauseOpen, setIsPauseOpen] = useState(false);
  const [selectedTower, setSelectedTower] = useState<'slingshot' | 'cannon' | 'laser'>('slingshot');

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x74b9ff);

    const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 45, 45);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(amb);
    const sun = new THREE.DirectionalLight(0xffeedd, 1.2);
    sun.position.set(30, 60, 30);
    scene.add(sun);

    // Map: Green baseplate
    const plateGeo = new THREE.BoxGeometry(70, 2, 70);
    const plateMat = new THREE.MeshStandardMaterial({ color: 0x27ae60 });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.y = -1;
    scene.add(plate);

    // Path waypoints
    const waypoints = [
      new THREE.Vector3(-30, 0.1, -20),
      new THREE.Vector3(15, 0.1, -20),
      new THREE.Vector3(15, 0.1, 10),
      new THREE.Vector3(-15, 0.1, 10),
      new THREE.Vector3(-15, 0.1, 30),
      new THREE.Vector3(30, 0.1, 30),
    ];

    // Path segments
    for (let i = 0; i < waypoints.length - 1; i++) {
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const dist = p1.distanceTo(p2);
      const isX = Math.abs(p1.x - p2.x) > 0.1;
      const roadGeo = new THREE.BoxGeometry(isX ? dist + 4 : 4, 0.2, isX ? 4 : dist + 4);
      const roadMat = new THREE.MeshStandardMaterial({ color: 0xdfe6e9 });
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.position.set(mid.x, 0.1, mid.z);
      scene.add(road);
    }

    // Base fortress at end of path
    const fortGeo = new THREE.BoxGeometry(8, 8, 8);
    const fortMat = new THREE.MeshStandardMaterial({ color: 0x2d3436 });
    const fort = new THREE.Mesh(fortGeo, fortMat);
    fort.position.set(30, 4, 30);
    scene.add(fort);

    const towers: Tower[] = [];
    const enemies: Enemy[] = [];
    let spawnTimer = 0;
    let waveEnemiesRemaining = 10;

    const handlePointerDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const ray = new THREE.Raycaster();
      ray.setFromCamera(mouse, camera);
      const hits = ray.intersectObject(plate);
      if (hits.length > 0) {
        const pt = hits[0].point;
        // Check cost
        const cost = selectedTower === 'slingshot' ? 50 : selectedTower === 'cannon' ? 100 : 200;
        setCoins((prev) => {
          if (prev < cost) return prev;

          // Place Tower Mesh
          const tGeo = new THREE.CylinderGeometry(1.2, 1.6, 4, 8);
          const tColor = selectedTower === 'slingshot' ? 0xf39c12 : selectedTower === 'cannon' ? 0x2d3436 : 0x0984e3;
          const tMat = new THREE.MeshStandardMaterial({ color: tColor, roughness: 0.3 });
          const tMesh = new THREE.Mesh(tGeo, tMat);
          tMesh.position.set(pt.x, 2, pt.z);
          scene.add(tMesh);

          towers.push({
            mesh: tMesh,
            type: selectedTower,
            range: selectedTower === 'slingshot' ? 14 : selectedTower === 'cannon' ? 18 : 22,
            damage: selectedTower === 'slingshot' ? 20 : selectedTower === 'cannon' ? 45 : 80,
            rate: selectedTower === 'slingshot' ? 1.0 : selectedTower === 'cannon' ? 1.8 : 0.6,
            cooldown: 0,
            cost,
          });

          soundManager.play('land');
          return prev - cost;
        });
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.code === 'Escape') {
        setIsPauseOpen((prev) => !prev);
      }
    };

    renderer.domElement.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown, true);

    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Spawn Enemies
      spawnTimer += dt;
      if (spawnTimer > 1.8 && waveEnemiesRemaining > 0) {
        spawnTimer = 0;
        waveEnemiesRemaining--;

        const eGeo = new THREE.BoxGeometry(2, 2.5, 2);
        const eMat = new THREE.MeshStandardMaterial({ color: 0xF5CD30 });
        const eMesh = new THREE.Mesh(eGeo, eMat);
        eMesh.position.copy(waypoints[0]);
        scene.add(eMesh);

        enemies.push({
          mesh: eMesh,
          hp: 60 + wave * 25,
          maxHp: 60 + wave * 25,
          speed: 8 + wave * 0.5,
          pathIndex: 0,
        });
      }

      // Update Enemies
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        const nextWp = waypoints[e.pathIndex + 1];
        if (!nextWp) {
          // Reached Base: damage base
          setBaseHp((prev) => Math.max(0, prev - 10));
          soundManager.play('oof');
          scene.remove(e.mesh);
          enemies.splice(i, 1);
          continue;
        }

        const dir = new THREE.Vector3().subVectors(nextWp, e.mesh.position);
        const dist = dir.length();
        if (dist < 1.0) {
          e.pathIndex++;
        } else {
          dir.normalize();
          e.mesh.position.addScaledVector(dir, e.speed * dt);
        }
      }

      // Towers attack nearest enemy
      for (const t of towers) {
        t.cooldown -= dt;
        if (t.cooldown <= 0) {
          for (let i = enemies.length - 1; i >= 0; i--) {
            const e = enemies[i];
            if (t.mesh.position.distanceTo(e.mesh.position) <= t.range) {
              t.cooldown = t.rate;
              e.hp -= t.damage;
              soundManager.play('jump', 0.2);

              if (e.hp <= 0) {
                scene.remove(e.mesh);
                enemies.splice(i, 1);
                setCoins((prev) => prev + 25);
                soundManager.play('oof', 0.5);
              }
              break;
            }
          }
        }
      }

      // Wave completion check
      if (waveEnemiesRemaining === 0 && enemies.length === 0) {
        setWave((prev) => prev + 1);
        waveEnemiesRemaining = 10 + wave * 2;
        setCoins((prev) => prev + 100);
        bloxStore.addBloxies(10); // Reward 10 Bloxies per wave!
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      renderer.domElement.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown, true);
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, [wave, selectedTower]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none font-sans">
      <div ref={containerRef} className="absolute inset-0 cursor-crosshair" />

      {/* Top HUD */}
      <div className="fixed top-3 left-3 right-3 z-40 flex items-center justify-between px-4 py-2 bg-black/75 backdrop-blur-xl border border-white/10 rounded-2xl text-white">
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 rounded-xl bg-blue-600 font-black text-xs">
            TOWER DEFENSE
          </div>
          <span className="font-extrabold text-sm">Wave: <strong className="text-amber-300">{wave}</strong></span>
          <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            Coins: ${coins}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-400/30">
            Base HP: {baseHp}%
          </span>
        </div>

        <button
          onClick={() => setIsPauseOpen(true)}
          className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-xl transition text-xs font-bold"
        >
          Menu (Esc)
        </button>
      </div>

      {/* Tower Selector Hotbar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 p-1.5 bg-black/80 backdrop-blur-md border border-white/15 rounded-2xl text-white">
        {[
          { id: 'slingshot' as const, label: 'Slingshot', cost: 50, icon: <Target className="w-5 h-5 text-amber-400" /> },
          { id: 'cannon' as const, label: 'Cannon', cost: 100, icon: <Shield className="w-5 h-5 text-zinc-300" /> },
          { id: 'laser' as const, label: 'Laser Blaster', cost: 200, icon: <Zap className="w-5 h-5 text-cyan-400" /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTower(t.id)}
            className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl border transition ${
              selectedTower === t.id
                ? 'bg-blue-600/30 border-blue-400 shadow-md shadow-blue-500/30 scale-105'
                : 'bg-white/5 border-white/10'
            }`}
          >
            {t.icon}
            <span className="text-xs font-bold mt-1">{t.label}</span>
            <span className="text-[10px] text-amber-300 font-mono font-bold">${t.cost}</span>
          </button>
        ))}
      </div>

      {/* Pause Menu Modal */}
      {isPauseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md text-white">
          <div className="w-full max-w-sm bg-zinc-950 border border-white/20 rounded-2xl p-6 flex flex-col gap-4 text-center">
            <h2 className="text-lg font-black text-blue-400">Tower Defense</h2>
            <p className="text-xs text-zinc-400">Place towers on the grass to stop invading Noobs!</p>

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
