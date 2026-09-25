import * as THREE from 'three';
import type { R6Rig } from './character';
import { EquippedAccessories } from '../services/bloxStore';

export class AccessoryBuilder {
  public static attachAccessories(rig: R6Rig, equipped: EquippedAccessories) {
    const removeNamedChild = (parent: THREE.Object3D, name: string) => {
      const child = parent.getObjectByName(name);
      if (child) {
        parent.remove(child);
      }
    };

    // Remove existing accessories from limbs
    removeNamedChild(rig.head, 'acc_top');
    removeNamedChild(rig.torso, 'acc_back');
    removeNamedChild(rig.torso, 'acc_shoulder');
    removeNamedChild(rig.torso, 'acc_neck');
    removeNamedChild(rig.torso, 'acc_front');
    removeNamedChild(rig.torso, 'acc_waist');
    removeNamedChild(rig.rightArm, 'acc_gear');

    // 1. TOP ACCESSORY (Head / Hat / Dominus)
    if (equipped.top) {
      const hatGroup = this.createTopAccessory(equipped.top);
      if (hatGroup) {
        hatGroup.name = 'acc_top';
        rig.head.add(hatGroup);
      }
    }

    // 2. BACK ACCESSORY (Wings / Swords / Jetpack)
    if (equipped.back) {
      const backGroup = this.createBackAccessory(equipped.back);
      if (backGroup) {
        backGroup.name = 'acc_back';
        rig.torso.add(backGroup);
      }
    }

    // 3. SHOULDER ACCESSORY (Pet / Parrot / Dragon)
    if (equipped.shoulder) {
      const shoulderGroup = this.createShoulderAccessory(equipped.shoulder);
      if (shoulderGroup) {
        shoulderGroup.name = 'acc_shoulder';
        rig.torso.add(shoulderGroup);
      }
    }

    // 4. NECK ACCESSORY (Gold Chain / Scarf / Tie)
    if (equipped.neck) {
      const neckGroup = this.createNeckAccessory(equipped.neck);
      if (neckGroup) {
        neckGroup.name = 'acc_neck';
        rig.torso.add(neckGroup);
      }
    }

    // 5. FRONT ACCESSORY (Badge / Vest)
    if (equipped.front) {
      const frontGroup = this.createFrontAccessory(equipped.front);
      if (frontGroup) {
        frontGroup.name = 'acc_front';
        rig.torso.add(frontGroup);
      }
    }

    // 6. WAIST ACCESSORY (Sword / Tail / Belt)
    if (equipped.waist) {
      const waistGroup = this.createWaistAccessory(equipped.waist);
      if (waistGroup) {
        waistGroup.name = 'acc_waist';
        rig.torso.add(waistGroup);
      }
    }

    // 7. GEAR ACCESSORY (Held in right hand)
    if (equipped.gear) {
      const gearGroup = this.createGearAccessory(equipped.gear);
      if (gearGroup) {
        gearGroup.name = 'acc_gear';
        rig.rightArm.add(gearGroup);
      }
    }
  }

  private static createTopAccessory(id: string): THREE.Group | null {
    const group = new THREE.Group();

    if (id === 'dom_vampirus') {
      // The legendary 800,000 Bloxies Vampirus Devilius Dominus
      // Crimson-black shadowy hood
      const hoodGeo = new THREE.BoxGeometry(1.4, 1.4, 1.4);
      const hoodMat = new THREE.MeshStandardMaterial({
        color: 0x4a0e17,
        roughness: 0.2,
        metalness: 0.3,
      });
      const hood = new THREE.Mesh(hoodGeo, hoodMat);
      hood.position.set(0, 0.1, -0.05);
      group.add(hood);

      // Dark face void ring
      const ringGeo = new THREE.TorusGeometry(0.55, 0.15, 12, 24);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(0, 0, 0.65);
      group.add(ring);

      // Demonic horns (Left & Right)
      const hornGeo = new THREE.ConeGeometry(0.18, 1.3, 12);
      const hornMat = new THREE.MeshStandardMaterial({
        color: 0x111111,
        metalness: 0.8,
        roughness: 0.2,
      });

      const hornLeft = new THREE.Mesh(hornGeo, hornMat);
      hornLeft.position.set(-0.8, 0.9, 0);
      hornLeft.rotation.z = 0.55;
      hornLeft.rotation.x = -0.2;
      group.add(hornLeft);

      const hornRight = new THREE.Mesh(hornGeo, hornMat);
      hornRight.position.set(0.8, 0.9, 0);
      hornRight.rotation.z = -0.55;
      hornRight.rotation.x = -0.2;
      group.add(hornRight);

      // Glowing Demonic Eyes inside hood void
      const eyeGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
      const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
      eyeL.position.set(-0.25, 0.1, 0.6);
      group.add(eyeL);

      const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
      eyeR.position.set(0.25, 0.1, 0.6);
      group.add(eyeR);

      // Subtle crimson point light
      const light = new THREE.PointLight(0xff0033, 2, 4);
      light.position.set(0, 0.2, 0.8);
      group.add(light);

      return group;
    }

    if (id === 'dom_infernus') {
      // Fiery Dominus Infernus
      const hoodGeo = new THREE.BoxGeometry(1.4, 1.4, 1.4);
      const hoodMat = new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.3 });
      const hood = new THREE.Mesh(hoodGeo, hoodMat);
      hood.position.set(0, 0.1, -0.05);
      group.add(hood);

      // Burning horns
      const hornGeo = new THREE.ConeGeometry(0.18, 1.2, 8);
      const hornMat = new THREE.MeshStandardMaterial({ color: 0xf39c12, roughness: 0.2 });
      const hornL = new THREE.Mesh(hornGeo, hornMat);
      hornL.position.set(-0.75, 0.85, 0);
      hornL.rotation.z = 0.5;
      group.add(hornL);

      const hornR = new THREE.Mesh(hornGeo, hornMat);
      hornR.position.set(0.75, 0.85, 0);
      hornR.rotation.z = -0.5;
      group.add(hornR);

      const eyeGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
      const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
      eyeL.position.set(-0.25, 0.1, 0.6);
      group.add(eyeL);
      const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
      eyeR.position.set(0.25, 0.1, 0.6);
      group.add(eyeR);

      return group;
    }

    if (id === 'dom_frigidus') {
      // Freezing Cyan Dominus
      const hoodGeo = new THREE.BoxGeometry(1.4, 1.4, 1.4);
      const hoodMat = new THREE.MeshStandardMaterial({ color: 0x00cec9, roughness: 0.2 });
      const hood = new THREE.Mesh(hoodGeo, hoodMat);
      hood.position.set(0, 0.1, -0.05);
      group.add(hood);

      const hornGeo = new THREE.ConeGeometry(0.18, 1.2, 8);
      const hornMat = new THREE.MeshStandardMaterial({ color: 0x74b9ff, roughness: 0.1 });
      const hornL = new THREE.Mesh(hornGeo, hornMat);
      hornL.position.set(-0.75, 0.85, 0);
      hornL.rotation.z = 0.5;
      group.add(hornL);

      const hornR = new THREE.Mesh(hornGeo, hornMat);
      hornR.position.set(0.75, 0.85, 0);
      hornR.rotation.z = -0.5;
      group.add(hornR);

      const eyeGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
      const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
      eyeL.position.set(-0.25, 0.1, 0.6);
      group.add(eyeL);
      const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
      eyeR.position.set(0.25, 0.1, 0.6);
      group.add(eyeR);

      return group;
    }

    if (id === 'golden_crown') {
      // Golden Crown
      const crownGeo = new THREE.CylinderGeometry(0.75, 0.65, 0.45, 8);
      const crownMat = new THREE.MeshStandardMaterial({ color: 0xf1c40f, metalness: 0.8, roughness: 0.2 });
      const crown = new THREE.Mesh(crownGeo, crownMat);
      crown.position.set(0, 0.8, 0);
      group.add(crown);
      return group;
    }

    if (id === 'valk_helm') {
      // Valkyrie Helm with side wings
      const helmGeo = new THREE.SphereGeometry(0.72, 12, 12);
      const helmMat = new THREE.MeshStandardMaterial({ color: 0xbdc3c7, metalness: 0.7, roughness: 0.2 });
      const helm = new THREE.Mesh(helmGeo, helmMat);
      helm.position.set(0, 0.2, 0);
      group.add(helm);

      const wingGeo = new THREE.BoxGeometry(0.1, 0.8, 0.4);
      const wingMat = new THREE.MeshStandardMaterial({ color: 0xf1c40f, roughness: 0.3 });
      const wingL = new THREE.Mesh(wingGeo, wingMat);
      wingL.position.set(-0.75, 0.6, 0);
      wingL.rotation.z = 0.3;
      group.add(wingL);

      const wingR = new THREE.Mesh(wingGeo, wingMat);
      wingR.position.set(0.75, 0.6, 0);
      wingR.rotation.z = -0.3;
      group.add(wingR);
      return group;
    }

    if (id === 'sparkle_fedora') {
      // Fedora
      const brimGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.08, 16);
      const crownGeo = new THREE.CylinderGeometry(0.65, 0.7, 0.5, 16);
      const fedoraMat = new THREE.MeshStandardMaterial({ color: 0x6c5ce7, roughness: 0.3 });
      const brim = new THREE.Mesh(brimGeo, fedoraMat);
      brim.position.set(0, 0.65, 0);
      group.add(brim);

      const crown = new THREE.Mesh(crownGeo, fedoraMat);
      crown.position.set(0, 0.9, 0);
      group.add(crown);
      return group;
    }

    if (id === 'free_cap' || id.includes('cap')) {
      // Classic Baseball Cap
      const domeGeo = new THREE.SphereGeometry(0.7, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
      const capMat = new THREE.MeshStandardMaterial({ color: 0xd63031, roughness: 0.5 });
      const dome = new THREE.Mesh(domeGeo, capMat);
      dome.position.set(0, 0.5, 0);
      group.add(dome);

      // Visor
      const visorGeo = new THREE.BoxGeometry(0.7, 0.06, 0.45);
      const visor = new THREE.Mesh(visorGeo, capMat);
      visor.position.set(0, 0.52, 0.7);
      group.add(visor);
      return group;
    }

    return null;
  }

  private static createBackAccessory(id: string): THREE.Group | null {
    const group = new THREE.Group();
    group.position.set(0, 0, -0.6); // Attached to back of torso

    if (id === 'back_devil_wings' || id === 'back_angel_wings') {
      const isDevil = id === 'back_devil_wings';
      const wingColor = isDevil ? 0xc0392b : 0xffffff;

      const wingGeo = new THREE.BoxGeometry(1.6, 1.2, 0.08);
      const wingMat = new THREE.MeshStandardMaterial({
        color: wingColor,
        roughness: 0.4,
        metalness: isDevil ? 0.3 : 0.0,
      });

      const wingL = new THREE.Mesh(wingGeo, wingMat);
      wingL.position.set(-1.2, 0.3, 0);
      wingL.rotation.y = 0.3;
      wingL.rotation.z = -0.2;
      group.add(wingL);

      const wingR = new THREE.Mesh(wingGeo, wingMat);
      wingR.position.set(1.2, 0.3, 0);
      wingR.rotation.y = -0.3;
      wingR.rotation.z = 0.2;
      group.add(wingR);

      return group;
    }

    if (id === 'back_katana') {
      // Dual Crossed Katanas
      const bladeGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.2, 8);
      const bladeMat = new THREE.MeshStandardMaterial({ color: 0xf39c12, metalness: 0.8 });

      const k1 = new THREE.Mesh(bladeGeo, bladeMat);
      k1.rotation.z = 0.75;
      group.add(k1);

      const k2 = new THREE.Mesh(bladeGeo, bladeMat);
      k2.rotation.z = -0.75;
      group.add(k2);

      return group;
    }

    if (id === 'back_cape') {
      // Flowing Cape
      const capeGeo = new THREE.BoxGeometry(1.6, 2.2, 0.05);
      const capeMat = new THREE.MeshStandardMaterial({ color: 0xe74c3c, roughness: 0.6 });
      const cape = new THREE.Mesh(capeGeo, capeMat);
      cape.position.set(0, -0.8, -0.05);
      cape.rotation.x = 0.15;
      group.add(cape);
      return group;
    }

    if (id === 'back_jetpack') {
      // Retro Rocket Jetpack
      const tankGeo = new THREE.CylinderGeometry(0.22, 0.22, 1.4, 12);
      const tankMat = new THREE.MeshStandardMaterial({ color: 0x95a5a6, metalness: 0.6 });
      const t1 = new THREE.Mesh(tankGeo, tankMat);
      t1.position.set(-0.45, 0, 0);
      group.add(t1);

      const t2 = new THREE.Mesh(tankGeo, tankMat);
      t2.position.set(0.45, 0, 0);
      group.add(t2);

      return group;
    }

    return null;
  }

  private static createShoulderAccessory(id: string): THREE.Group | null {
    const group = new THREE.Group();
    group.position.set(-1.5, 0.9, 0); // Left shoulder

    if (id === 'shld_dragon') {
      const bodyGeo = new THREE.BoxGeometry(0.35, 0.35, 0.6);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf1c40f, metalness: 0.6 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.set(0, 0.25, 0);
      group.add(body);

      const headGeo = new THREE.ConeGeometry(0.18, 0.4, 8);
      const head = new THREE.Mesh(headGeo, bodyMat);
      head.position.set(0, 0.45, 0.35);
      head.rotation.x = 1.2;
      group.add(head);

      return group;
    }

    if (id === 'shld_parrot') {
      const bodyGeo = new THREE.SphereGeometry(0.25, 8, 8);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x00b894 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.set(0, 0.3, 0);
      group.add(body);
      return group;
    }

    if (id === 'shld_pet_noob') {
      const noobGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
      const noobMat = new THREE.MeshStandardMaterial({ color: 0xF5CD30 });
      const miniNoob = new THREE.Mesh(noobGeo, noobMat);
      miniNoob.position.set(0, 0.3, 0);
      group.add(miniNoob);
      return group;
    }

    return null;
  }

  private static createNeckAccessory(id: string): THREE.Group | null {
    const group = new THREE.Group();
    group.position.set(0, 1.0, 0); // Base of neck

    if (id === 'neck_gold_chain') {
      const chainGeo = new THREE.TorusGeometry(0.45, 0.08, 8, 16);
      const chainMat = new THREE.MeshStandardMaterial({ color: 0xf39c12, metalness: 0.9, roughness: 0.1 });
      const chain = new THREE.Mesh(chainGeo, chainMat);
      chain.rotation.x = 1.2;
      group.add(chain);
      return group;
    }

    if (id === 'neck_scarf') {
      const scarfGeo = new THREE.TorusGeometry(0.55, 0.15, 8, 16);
      const scarfMat = new THREE.MeshStandardMaterial({ color: 0xd63031, roughness: 0.6 });
      const scarf = new THREE.Mesh(scarfGeo, scarfMat);
      scarf.rotation.x = 1.4;
      group.add(scarf);
      return group;
    }

    return null;
  }

  private static createGearAccessory(id: string): THREE.Group | null {
    const group = new THREE.Group();
    group.position.set(0, -1.0, 0.6); // Hand position

    if (id === 'gear_classic_trowel') {
      // Classic Trowel
      const handleGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8);
      const handleMat = new THREE.MeshStandardMaterial({ color: 0xa06e3b });
      const handle = new THREE.Mesh(handleGeo, handleMat);
      group.add(handle);

      const bladeGeo = new THREE.BoxGeometry(0.35, 0.45, 0.04);
      const bladeMat = new THREE.MeshStandardMaterial({ color: 0xbdc3c7, metalness: 0.8 });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.set(0, 0.35, 0);
      blade.rotation.x = 0.2;
      group.add(blade);
      return group;
    }

    if (id === 'gear_gravity_coil' || id === 'gear_speed_coil') {
      const isGrav = id === 'gear_gravity_coil';
      const coilColor = isGrav ? 0x0984e3 : 0xd63031;

      const ringGeo = new THREE.TorusGeometry(0.22, 0.06, 8, 16);
      const ringMat = new THREE.MeshStandardMaterial({ color: coilColor, metalness: 0.6, roughness: 0.2 });

      for (let i = 0; i < 3; i++) {
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.y = (i - 1) * 0.2;
        group.add(ring);
      }
      return group;
    }

    if (id === 'gear_slingshot') {
      const handleGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.45, 8);
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });
      const handle = new THREE.Mesh(handleGeo, woodMat);
      group.add(handle);

      const forkLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8), woodMat);
      forkLeft.position.set(-0.15, 0.3, 0);
      forkLeft.rotation.z = -0.3;
      group.add(forkLeft);

      const forkRight = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8), woodMat);
      forkRight.position.set(0.15, 0.3, 0);
      forkRight.rotation.z = 0.3;
      group.add(forkRight);
      return group;
    }

    if (id === 'gear_golden_trophy') {
      const trophyMat = new THREE.MeshStandardMaterial({ color: 0xf1c40f, metalness: 0.9, roughness: 0.1 });
      const baseMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 0.25, 16), trophyMat);
      baseMesh.position.y = 0;
      group.add(baseMesh);

      const cupMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.1, 0.45, 16), trophyMat);
      cupMesh.position.y = 0.35;
      group.add(cupMesh);
      return group;
    }

    return null;
  }

  private static createFrontAccessory(id: string): THREE.Group | null {
    const group = new THREE.Group();

    if (id === 'front_badge') {
      // Golden Sheriff Star Badge pinned on chest
      const badgeGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.06, 6);
      const badgeMat = new THREE.MeshStandardMaterial({ color: 0xf1c40f, metalness: 0.8, roughness: 0.2 });
      const badge = new THREE.Mesh(badgeGeo, badgeMat);
      badge.rotation.x = Math.PI / 2;
      badge.position.set(0.45, 0.35, 0.53);
      group.add(badge);
      return group;
    }

    if (id === 'front_vest') {
      // Tactical Kevlar Vest
      const vestGeo = new THREE.BoxGeometry(2.1, 1.8, 1.15);
      const vestMat = new THREE.MeshStandardMaterial({ color: 0x2d3436, roughness: 0.7 });
      const vest = new THREE.Mesh(vestGeo, vestMat);
      vest.position.set(0, -0.1, 0);
      group.add(vest);
      return group;
    }

    return null;
  }

  private static createWaistAccessory(id: string): THREE.Group | null {
    const group = new THREE.Group();

    if (id === 'waist_sword') {
      // Side Rapier Sword at hip
      const scabbardGeo = new THREE.BoxGeometry(0.12, 1.8, 0.12);
      const scabbardMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
      const scabbard = new THREE.Mesh(scabbardGeo, scabbardMat);
      scabbard.position.set(-1.15, -0.6, 0);
      scabbard.rotation.z = -0.3;
      scabbard.rotation.x = 0.2;
      group.add(scabbard);

      // Gold hilt
      const hiltMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xf1c40f, metalness: 0.8 })
      );
      hiltMesh.position.set(-0.85, 0.3, -0.18);
      group.add(hiltMesh);
      return group;
    }

    if (id === 'waist_tail') {
      // Fluffy Fox Tail behind waist
      const tailGeo = new THREE.ConeGeometry(0.25, 1.4, 12);
      const tailMat = new THREE.MeshStandardMaterial({ color: 0xe67e22, roughness: 0.7 });
      const tail = new THREE.Mesh(tailGeo, tailMat);
      tail.position.set(0, -0.8, -0.7);
      tail.rotation.x = -1.1;
      group.add(tail);
      return group;
    }

    if (id === 'waist_belt') {
      // Utility belt around waist
      const beltGeo = new THREE.BoxGeometry(2.15, 0.3, 1.15);
      const beltMat = new THREE.MeshStandardMaterial({ color: 0x1e272e, roughness: 0.8 });
      const belt = new THREE.Mesh(beltGeo, beltMat);
      belt.position.set(0, -0.9, 0);
      group.add(belt);

      // Brass buckle
      const buckleMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.35, 0.08),
        new THREE.MeshStandardMaterial({ color: 0xf39c12, metalness: 0.9 })
      );
      buckleMesh.position.set(0, -0.9, 0.58);
      group.add(buckleMesh);
      return group;
    }

    return null;
  }
}
