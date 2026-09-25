import * as THREE from 'three';

class TextureService {
  private cubeTexture: THREE.CubeTexture | null = null;
  private studTexture: THREE.CanvasTexture | null = null;
  private faceTexture: THREE.Texture | null = null;
  private crateTexture: THREE.CanvasTexture | null = null;
  private spawnDecalTexture: THREE.CanvasTexture | null = null;

  public loadSkybox(): THREE.CubeTexture {
    if (this.cubeTexture) return this.cubeTexture;

    // Ordered: +X, -X, +Y, -Y, +Z, -Z
    // right, left, up, down, front, back
    const loader = new THREE.CubeTextureLoader();
    try {
      this.cubeTexture = loader.load([
        '/sky/sky512_rt.png',
        '/sky/sky512_lf.png',
        '/sky/sky512_up.png',
        '/sky/sky512_dn.png',
        '/sky/sky512_ft.png',
        '/sky/sky512_bk.png',
      ]);
    } catch (err) {
      console.warn('Failed loading cube skybox textures, using fallback color', err);
    }

    return this.cubeTexture!;
  }

  /**
   * Generates or loads the classic Roblox top stud texture
   */
  public getStudTexture(repeatX: number = 1, repeatY: number = 1): THREE.CanvasTexture {
    if (!this.studTexture) {
      const size = 128;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;

      // Neutral background base
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);

      // Draw 2x2 grid of circular studs with 3D bevel shading
      const studRadius = 18;
      const positions = [
        { x: size * 0.25, y: size * 0.25 },
        { x: size * 0.75, y: size * 0.25 },
        { x: size * 0.25, y: size * 0.75 },
        { x: size * 0.75, y: size * 0.75 },
      ];

      for (const pos of positions) {
        // Outer dark shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        ctx.beginPath();
        ctx.arc(pos.x + 1.5, pos.y + 2, studRadius + 1, 0, Math.PI * 2);
        ctx.fill();

        // Stud body
        const grad = ctx.createLinearGradient(pos.x, pos.y - studRadius, pos.x, pos.y + studRadius);
        grad.addColorStop(0, '#f2f2f2');
        grad.addColorStop(1, '#b5b5b5');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, studRadius, 0, Math.PI * 2);
        ctx.fill();

        // Inner bevel highlight
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, studRadius - 2, Math.PI * 0.8, Math.PI * 1.8);
        ctx.stroke();

        // Inner shadow
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, studRadius - 2, -Math.PI * 0.2, Math.PI * 0.8);
        ctx.stroke();

        // Stud top circle
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y - 1, studRadius * 0.55, 0, Math.PI * 2);
        ctx.fill();
      }

      this.studTexture = new THREE.CanvasTexture(canvas);
      this.studTexture.wrapS = THREE.RepeatWrapping;
      this.studTexture.wrapT = THREE.RepeatWrapping;
    }

    const cloned = this.studTexture.clone();
    cloned.wrapS = THREE.RepeatWrapping;
    cloned.wrapT = THREE.RepeatWrapping;
    cloned.repeat.set(repeatX, repeatY);
    cloned.needsUpdate = true;
    return cloned;
  }

  private faceTextureCache: Map<string, THREE.CanvasTexture> = new Map();
  private faceThumbnailCache: Map<string, string> = new Map();

  /**
   * Generates a classic Roblox face on top of the head color.
   * This completely prevents the WebGL texture multiplication bug that makes faces black.
   */
  public getFaceTexture(faceId: string = 'default', headColor: string = '#F5CD30'): THREE.CanvasTexture {
    const key = `${faceId}_${headColor.toLowerCase()}`;
    if (this.faceTextureCache.has(key)) {
      return this.faceTextureCache.get(key)!;
    }

    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // 1. Fill background with exact Head skin color
    ctx.fillStyle = headColor;
    ctx.fillRect(0, 0, size, size);

    // 2. Render selected face features
    this.drawFaceFeatures(ctx, size, faceId);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    this.faceTextureCache.set(key, texture);
    return texture;
  }

  /**
   * Generates a Data URL image preview for UI selectors
   */
  public getFaceThumbnail(faceId: string): string {
    if (this.faceThumbnailCache.has(faceId)) {
      return this.faceThumbnailCache.get(faceId)!;
    }

    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#F5CD30'; // Classic Roblox yellow head
    ctx.fillRect(0, 0, size, size);
    this.drawFaceFeatures(ctx, size, faceId);

    const dataUrl = canvas.toDataURL('image/png');
    this.faceThumbnailCache.set(faceId, dataUrl);
    return dataUrl;
  }

  private drawFaceFeatures(ctx: CanvasRenderingContext2D, size: number, faceId: string) {
    const cx = size / 2;
    const cy = size / 2;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (faceId) {
      case 'chill': {
        // Chill Face: relaxed drooping curved eye lines
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = size * 0.045;
        // Left eye
        ctx.beginPath();
        ctx.arc(cx - size * 0.2, cy - size * 0.12, size * 0.08, 1.1 * Math.PI, 1.9 * Math.PI);
        ctx.stroke();
        // Right eye
        ctx.beginPath();
        ctx.arc(cx + size * 0.2, cy - size * 0.12, size * 0.08, 1.1 * Math.PI, 1.9 * Math.PI);
        ctx.stroke();
        // Chill relaxed curved smile
        ctx.lineWidth = size * 0.045;
        ctx.beginPath();
        ctx.arc(cx, cy + size * 0.02, size * 0.2, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();
        break;
      }

      case 'man': {
        // The legendary Roblox Man Face: chiseled sharp eyebrows, stylish eyes, smirk
        ctx.strokeStyle = '#111111';
        ctx.fillStyle = '#111111';

        // Angry/Chiseled Eyebrows
        ctx.lineWidth = size * 0.055;
        ctx.beginPath();
        ctx.moveTo(cx - size * 0.32, cy - size * 0.22);
        ctx.lineTo(cx - size * 0.08, cy - size * 0.14);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx + size * 0.08, cy - size * 0.14);
        ctx.lineTo(cx + size * 0.32, cy - size * 0.22);
        ctx.stroke();

        // Eyes with shine
        ctx.beginPath();
        ctx.arc(cx - size * 0.18, cy - size * 0.08, size * 0.065, 0, Math.PI * 2);
        ctx.arc(cx + size * 0.18, cy - size * 0.08, size * 0.065, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx - size * 0.2, cy - size * 0.1, size * 0.02, 0, Math.PI * 2);
        ctx.arc(cx + size * 0.16, cy - size * 0.1, size * 0.02, 0, Math.PI * 2);
        ctx.fill();

        // Confident smirk
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = size * 0.05;
        ctx.beginPath();
        ctx.moveTo(cx - size * 0.22, cy + size * 0.14);
        ctx.quadraticCurveTo(cx, cy + size * 0.24, cx + size * 0.26, cy + size * 0.08);
        ctx.stroke();

        // Dimple
        ctx.beginPath();
        ctx.arc(cx + size * 0.26, cy + size * 0.07, size * 0.025, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      case 'checkit': {
        // Check It: one raised eyebrow, smirk
        ctx.fillStyle = '#111111';
        ctx.strokeStyle = '#111111';

        // High arched right eyebrow
        ctx.lineWidth = size * 0.045;
        ctx.beginPath();
        ctx.arc(cx + size * 0.18, cy - size * 0.22, size * 0.1, 1.1 * Math.PI, 1.9 * Math.PI);
        ctx.stroke();

        // Normal left eyebrow
        ctx.beginPath();
        ctx.moveTo(cx - size * 0.28, cy - size * 0.18);
        ctx.lineTo(cx - size * 0.1, cy - size * 0.16);
        ctx.stroke();

        // Eyes
        ctx.beginPath();
        ctx.arc(cx - size * 0.18, cy - size * 0.07, size * 0.06, 0, Math.PI * 2);
        ctx.arc(cx + size * 0.18, cy - size * 0.07, size * 0.06, 0, Math.PI * 2);
        ctx.fill();

        // Smug tilted smirk
        ctx.beginPath();
        ctx.moveTo(cx - size * 0.2, cy + size * 0.14);
        ctx.quadraticCurveTo(cx, cy + size * 0.22, cx + size * 0.24, cy + size * 0.1);
        ctx.stroke();
        break;
      }

      case 'epic': {
        // Epic Face / Awesome Face: large curved happy anime eyes, wide open mouth with teeth & tongue
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = size * 0.06;

        // Big crescent eyes
        ctx.beginPath();
        ctx.arc(cx - size * 0.22, cy - size * 0.1, size * 0.12, 1.15 * Math.PI, 1.85 * Math.PI);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx + size * 0.22, cy - size * 0.1, size * 0.12, 1.15 * Math.PI, 1.85 * Math.PI);
        ctx.stroke();

        // Big open mouth shape
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx - size * 0.26, cy + size * 0.08);
        ctx.quadraticCurveTo(cx, cy + size * 0.44, cx + size * 0.26, cy + size * 0.08);
        ctx.closePath();
        ctx.fillStyle = '#680b0b'; // dark mouth interior
        ctx.fill();
        ctx.lineWidth = size * 0.035;
        ctx.stroke();
        ctx.clip();

        // Teeth at top of mouth
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - size * 0.26, cy + size * 0.08, size * 0.52, size * 0.07);

        // Tongue
        ctx.fillStyle = '#ff6b81';
        ctx.beginPath();
        ctx.arc(cx, cy + size * 0.34, size * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;
      }

      case 'winning': {
        // Winning Smile: wide open mouth full of teeth grid, wide round eyes
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(cx - size * 0.2, cy - size * 0.12, size * 0.065, 0, Math.PI * 2);
        ctx.arc(cx + size * 0.2, cy - size * 0.12, size * 0.065, 0, Math.PI * 2);
        ctx.fill();

        // Eyebrows
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = size * 0.035;
        ctx.beginPath();
        ctx.arc(cx - size * 0.2, cy - size * 0.22, size * 0.08, 1.2 * Math.PI, 1.8 * Math.PI);
        ctx.arc(cx + size * 0.2, cy - size * 0.22, size * 0.08, 1.2 * Math.PI, 1.8 * Math.PI);
        ctx.stroke();

        // Giant wide smile filled with white teeth
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx - size * 0.28, cy + size * 0.06);
        ctx.quadraticCurveTo(cx, cy + size * 0.36, cx + size * 0.28, cy + size * 0.06);
        ctx.closePath();
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = size * 0.035;
        ctx.stroke();

        // Tooth separators
        ctx.beginPath();
        ctx.moveTo(cx - size * 0.14, cy + size * 0.08);
        ctx.lineTo(cx - size * 0.14, cy + size * 0.24);
        ctx.moveTo(cx, cy + size * 0.08);
        ctx.lineTo(cx, cy + size * 0.28);
        ctx.moveTo(cx + size * 0.14, cy + size * 0.08);
        ctx.lineTo(cx + size * 0.14, cy + size * 0.24);
        ctx.stroke();
        ctx.restore();
        break;
      }

      case 'tongue': {
        // Silly Fun: classic eyes with tongue sticking out
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(cx - size * 0.18, cy - size * 0.1, size * 0.06, 0, Math.PI * 2);
        ctx.arc(cx + size * 0.18, cy - size * 0.1, size * 0.06, 0, Math.PI * 2);
        ctx.fill();

        // Smile
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = size * 0.045;
        ctx.beginPath();
        ctx.arc(cx, cy + size * 0.04, size * 0.2, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();

        // Pink tongue hanging out
        ctx.fillStyle = '#ff6b81';
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = size * 0.025;
        ctx.beginPath();
        ctx.arc(cx + size * 0.04, cy + size * 0.24, size * 0.08, 0, Math.PI);
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'grin': {
        // Mischievous Grin
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(cx - size * 0.18, cy - size * 0.1, size * 0.055, 0, Math.PI * 2);
        ctx.arc(cx + size * 0.18, cy - size * 0.1, size * 0.055, 0, Math.PI * 2);
        ctx.fill();

        // Slanted eyebrows
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = size * 0.04;
        ctx.beginPath();
        ctx.moveTo(cx - size * 0.26, cy - size * 0.18);
        ctx.lineTo(cx - size * 0.08, cy - size * 0.22);
        ctx.moveTo(cx + size * 0.08, cy - size * 0.22);
        ctx.lineTo(cx + size * 0.26, cy - size * 0.18);
        ctx.stroke();

        // Sharp grin
        ctx.lineWidth = size * 0.045;
        ctx.beginPath();
        ctx.arc(cx, cy + size * 0.06, size * 0.22, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        break;
      }

      case 'skeptical': {
        // Skeptical / O_o
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(cx - size * 0.18, cy - size * 0.08, size * 0.075, 0, Math.PI * 2); // Big eye
        ctx.arc(cx + size * 0.18, cy - size * 0.08, size * 0.045, 0, Math.PI * 2); // Small eye
        ctx.fill();

        // High left eyebrow
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = size * 0.045;
        ctx.beginPath();
        ctx.arc(cx - size * 0.18, cy - size * 0.24, size * 0.1, 1.15 * Math.PI, 1.85 * Math.PI);
        ctx.stroke();

        // Flat right eyebrow
        ctx.beginPath();
        ctx.moveTo(cx + size * 0.08, cy - size * 0.16);
        ctx.lineTo(cx + size * 0.28, cy - size * 0.16);
        ctx.stroke();

        // Squiggly line mouth
        ctx.beginPath();
        ctx.moveTo(cx - size * 0.16, cy + size * 0.18);
        ctx.lineTo(cx + size * 0.16, cy + size * 0.14);
        ctx.stroke();
        break;
      }

      case 'shocked': {
        // Shocked / OOF Face
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(cx - size * 0.2, cy - size * 0.12, size * 0.08, 0, Math.PI * 2);
        ctx.arc(cx + size * 0.2, cy - size * 0.12, size * 0.08, 0, Math.PI * 2);
        ctx.fill();

        // Big "O" mouth
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = size * 0.05;
        ctx.beginPath();
        ctx.arc(cx, cy + size * 0.16, size * 0.11, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      case 'default':
      default: {
        // Classic Original Roblox Smile: Two black dot eyes & smooth curved smile
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(cx - size * 0.18, cy - size * 0.08, size * 0.065, 0, Math.PI * 2);
        ctx.arc(cx + size * 0.18, cy - size * 0.08, size * 0.065, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#111111';
        ctx.lineWidth = size * 0.052;
        ctx.beginPath();
        ctx.arc(cx, cy + size * 0.02, size * 0.21, 0.18 * Math.PI, 0.82 * Math.PI, false);
        ctx.stroke();
        break;
      }
    }
  }

  /**
   * Classic Wooden Crate texture with wood planks & X crossbar
   */
  public getCrateTexture(): THREE.CanvasTexture {
    if (this.crateTexture) return this.crateTexture;

    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Wood base
    ctx.fillStyle = '#a06e3b';
    ctx.fillRect(0, 0, size, size);

    // Horizontal planks
    ctx.strokeStyle = '#5a3d1c';
    ctx.lineWidth = 4;
    for (let y = 0; y <= size; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }

    // Outer border frame
    ctx.fillStyle = '#6d451b';
    ctx.fillRect(0, 0, size, 20);
    ctx.fillRect(0, size - 20, size, 20);
    ctx.fillRect(0, 0, 20, size);
    ctx.fillRect(size - 20, 0, 20, size);

    // Diagonal brace
    ctx.strokeStyle = '#6d451b';
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.moveTo(15, 15);
    ctx.lineTo(size - 15, size - 15);
    ctx.stroke();

    // Metal nails at corners
    ctx.fillStyle = '#222222';
    const nailCorners = [
      { x: 10, y: 10 },
      { x: size - 10, y: 10 },
      { x: 10, y: size - 10 },
      { x: size - 10, y: size - 10 },
    ];
    for (const nail of nailCorners) {
      ctx.beginPath();
      ctx.arc(nail.x, nail.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    this.crateTexture = new THREE.CanvasTexture(canvas);
    return this.crateTexture;
  }

  /**
   * Classic Roblox Spawn Location Decal
   */
  public getSpawnDecalTexture(): THREE.CanvasTexture {
    if (this.spawnDecalTexture) return this.spawnDecalTexture;

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#7a7a7a';
    ctx.fillRect(0, 0, size, size);

    // Inner bevel border
    ctx.strokeStyle = '#a0a0a0';
    ctx.lineWidth = 14;
    ctx.strokeRect(10, 10, size - 20, size - 20);

    // Iconic spawn sunray rays
    const cx = size / 2;
    const cy = size / 2;
    const rayCount = 12;

    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < rayCount; i++) {
      const angle = (i * 2 * Math.PI) / rayCount;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle - 0.1) * 210, cy + Math.sin(angle - 0.1) * 210);
      ctx.lineTo(cx + Math.cos(angle + 0.1) * 210, cy + Math.sin(angle + 0.1) * 210);
      ctx.closePath();
      ctx.fill();
    }

    // Center circular badge
    ctx.fillStyle = '#222222';
    ctx.beginPath();
    ctx.arc(cx, cy, 70, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 56, 0, Math.PI * 2);
    ctx.fill();

    // Center text / emblem
    ctx.fillStyle = '#111111';
    ctx.font = 'bold 36px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SPAWN', cx, cy);

    this.spawnDecalTexture = new THREE.CanvasTexture(canvas);
    return this.spawnDecalTexture;
  }

  private clothingCache: Map<string, THREE.CanvasTexture> = new Map();

  /**
   * Generates Front Torso Texture combining Shirt background + T-Shirt Decal
   */
  public getTorsoFrontTexture(shirtId?: string, tshirtId?: string, defaultTorsoColor: string = '#0D69AC'): THREE.CanvasTexture {
    const key = `torso_${shirtId || 'none'}_${tshirtId || 'none'}_${defaultTorsoColor}`;
    if (this.clothingCache.has(key)) {
      return this.clothingCache.get(key)!;
    }

    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // 1. Shirt or Default Torso Base
    let baseColor = defaultTorsoColor;
    if (shirtId === 'free_shirt') baseColor = '#0984e3';
    else if (shirtId === 'shirt_tuxedo') baseColor = '#1e272e';
    else if (shirtId === 'shirt_cyber') baseColor = '#1e272e';
    else if (shirtId === 'shirt_superhero') baseColor = '#e84118';
    else if (shirtId === 'shirt_stripes') baseColor = '#ffffff';

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, size, size);

    // Render shirt details
    if (shirtId === 'free_shirt') {
      // Hoodie V-neck and drawstrings
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(110, 40);
      ctx.lineTo(110, 110);
      ctx.moveTo(146, 40);
      ctx.lineTo(146, 110);
      ctx.stroke();

      // Kangaroo pouch
      ctx.strokeStyle = '#0769b5';
      ctx.lineWidth = 3;
      ctx.strokeRect(40, 160, 176, 70);
    } else if (shirtId === 'shirt_tuxedo') {
      // White shirt triangle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(90, 0);
      ctx.lineTo(166, 0);
      ctx.lineTo(128, 140);
      ctx.closePath();
      ctx.fill();

      // Bowtie
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(110, 30);
      ctx.lineTo(146, 50);
      ctx.lineTo(110, 50);
      ctx.lineTo(146, 30);
      ctx.closePath();
      ctx.fill();

      // Buttons
      ctx.beginPath();
      ctx.arc(128, 75, 4, 0, Math.PI * 2);
      ctx.arc(128, 105, 4, 0, Math.PI * 2);
      ctx.arc(128, 180, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (shirtId === 'shirt_cyber') {
      // Glowing circuit lines
      ctx.strokeStyle = '#00cec9';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#00cec9';
      ctx.shadowBlur = 12;

      ctx.beginPath();
      ctx.moveTo(30, 40);
      ctx.lineTo(100, 40);
      ctx.lineTo(128, 80);
      ctx.lineTo(156, 40);
      ctx.lineTo(226, 40);

      ctx.moveTo(128, 80);
      ctx.lineTo(128, 180);

      ctx.moveTo(70, 140);
      ctx.lineTo(128, 180);
      ctx.lineTo(186, 140);
      ctx.stroke();

      ctx.shadowBlur = 0;
    } else if (shirtId === 'shirt_superhero') {
      // Lightning emblem
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.moveTo(140, 30);
      ctx.lineTo(100, 120);
      ctx.lineTo(135, 120);
      ctx.lineTo(116, 220);
      ctx.lineTo(165, 100);
      ctx.lineTo(130, 100);
      ctx.closePath();
      ctx.fill();
    } else if (shirtId === 'shirt_stripes') {
      ctx.fillStyle = '#2d3436';
      for (let y = 20; y < size; y += 40) {
        ctx.fillRect(0, y, size, 20);
      }
    }

    // 2. Slap T-Shirt Decal on chest front
    if (tshirtId) {
      this.drawTShirtDecal(ctx, size, tshirtId);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    this.clothingCache.set(key, tex);
    return tex;
  }

  private drawTShirtDecal(ctx: CanvasRenderingContext2D, size: number, id: string) {
    const cx = size / 2;
    const cy = 110;

    if (id === 'free_tshirt_smile') {
      // Iconic classic yellow smile sticker
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.arc(cx, cy, 48, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#222222';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Eyes
      ctx.fillStyle = '#111111';
      ctx.beginPath();
      ctx.arc(cx - 16, cy - 12, 6, 0, Math.PI * 2);
      ctx.arc(cx + 16, cy - 12, 6, 0, Math.PI * 2);
      ctx.fill();

      // Smile
      ctx.beginPath();
      ctx.arc(cx, cy + 4, 24, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.stroke();
    } else if (id === 'tshirt_bloxmania') {
      // BloxMania shield badge
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.moveTo(cx - 45, cy - 40);
      ctx.lineTo(cx + 45, cy - 40);
      ctx.lineTo(cx + 40, cy + 20);
      ctx.lineTo(cx, cy + 50);
      ctx.lineTo(cx - 40, cy + 20);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 28px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('BM', cx, cy - 2);
    } else if (id === 'tshirt_doge') {
      // Cute Doge decal
      ctx.fillStyle = '#f39c12';
      ctx.beginPath();
      ctx.arc(cx, cy, 42, 0, Math.PI * 2);
      ctx.fill();

      // Snout
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy + 12, 20, 0, Math.PI * 2);
      ctx.fill();

      // Nose
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(cx, cy + 6, 6, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.beginPath();
      ctx.arc(cx - 15, cy - 10, 5, 0, Math.PI * 2);
      ctx.arc(cx + 15, cy - 10, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#e74c3c';
      ctx.font = 'bold 16px Comic Sans MS, cursive, sans-serif';
      ctx.fillText('WOW', cx + 32, cy - 24);
    } else if (id === 'tshirt_pizza') {
      // Pizza slice
      ctx.fillStyle = '#f39c12';
      ctx.beginPath();
      ctx.moveTo(cx, cy + 45);
      ctx.lineTo(cx - 38, cy - 35);
      ctx.lineTo(cx + 38, cy - 35);
      ctx.closePath();
      ctx.fill();

      // Crust
      ctx.fillStyle = '#d35400';
      ctx.fillRect(cx - 42, cy - 42, 84, 12);

      // Pepperonis
      ctx.fillStyle = '#c0392b';
      ctx.beginPath();
      ctx.arc(cx - 10, cy - 15, 7, 0, Math.PI * 2);
      ctx.arc(cx + 12, cy - 5, 8, 0, Math.PI * 2);
      ctx.arc(cx, cy + 18, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (id === 'tshirt_fire') {
      // Flaming skull
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 45);
      ctx.quadraticCurveTo(cx + 40, cy - 20, cx + 35, cy + 20);
      ctx.lineTo(cx - 35, cy + 20);
      ctx.quadraticCurveTo(cx - 40, cy - 20, cx, cy - 45);
      ctx.fill();

      // Skull
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, 26, 0, Math.PI * 2);
      ctx.fill();

      // Sunglasses
      ctx.fillStyle = '#000000';
      ctx.fillRect(cx - 24, cy - 8, 48, 14);
    }
  }

  /**
   * Generates Pants texture for legs
   */
  public getPantsTexture(pantsId?: string, defaultLegColor: string = '#A4BD47'): THREE.CanvasTexture {
    const key = `pants_${pantsId || 'none'}_${defaultLegColor}`;
    if (this.clothingCache.has(key)) {
      return this.clothingCache.get(key)!;
    }

    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    let color = defaultLegColor;
    if (pantsId === 'free_pants') color = '#2980b9';
    else if (pantsId === 'pants_cargo') color = '#2d3436';
    else if (pantsId === 'pants_gold') color = '#f1c40f';
    else if (pantsId === 'pants_camo') color = '#7f8c8d';

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);

    if (pantsId === 'free_pants') {
      // Denim stitching
      ctx.strokeStyle = '#f39c12';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(10, 10, size - 20, size - 20);
      ctx.setLineDash([]);
    } else if (pantsId === 'pants_cargo') {
      // Cargo pockets
      ctx.fillStyle = '#1e272e';
      ctx.fillRect(20, 40, 88, 40);
      ctx.strokeStyle = '#485460';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 40, 88, 40);
    } else if (pantsId === 'pants_gold') {
      ctx.fillStyle = '#f9ca24';
      ctx.fillRect(0, 0, size, 16);
      ctx.fillRect(0, 60, size, 10);
    } else if (pantsId === 'pants_camo') {
      ctx.fillStyle = '#57606f';
      ctx.beginPath();
      ctx.arc(30, 30, 20, 0, Math.PI * 2);
      ctx.arc(90, 80, 25, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    this.clothingCache.set(key, tex);
    return tex;
  }
}

export const textureService = new TextureService();
