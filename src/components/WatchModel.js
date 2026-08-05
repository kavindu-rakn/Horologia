// Horologia - High-Precision Procedural 3D Mechanical Watch Generator
import * as THREE from 'three';
import { WATCH_PARTS, MATERIAL_SCHEMES } from '../utils/constants.js';

export class WatchModel {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.parts = {};
    this.materials = {};
    this.currentScheme = MATERIAL_SCHEMES[0];

    this.gearRotations = {
      seconds: 0,
      minutes: 0,
      hours: 0,
      balance: 0,
      tourbillon: 0
    };

    this.initMaterials();
    this.buildWatch();
    this.scene.add(this.group);
  }

  initMaterials() {
    const s = this.currentScheme;

    this.materials.case = new THREE.MeshStandardMaterial({
      color: s.caseColor,
      metalness: s.caseMetalness,
      roughness: s.caseRoughness,
      envMapIntensity: 3.0
    });

    this.materials.bezel = new THREE.MeshStandardMaterial({
      color: s.bezelColor,
      metalness: 0.95,
      roughness: 0.08,
      envMapIntensity: 3.5
    });

    this.materials.dial = new THREE.MeshStandardMaterial({
      color: s.dialColor,
      metalness: 0.6,
      roughness: 0.2,
      envMapIntensity: 2.0
    });

    this.materials.glass = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.05,
      roughness: 0.02,
      transmission: 0.94,
      thickness: 0.5,
      transparent: true,
      opacity: 0.25,
      ior: 1.77,
      reflectivity: 0.95
    });

    this.materials.plate = new THREE.MeshStandardMaterial({
      color: s.plateColor,
      metalness: 0.9,
      roughness: 0.18,
      envMapIntensity: 2.5
    });

    this.materials.gear = new THREE.MeshStandardMaterial({
      color: s.gearColor,
      metalness: 0.95,
      roughness: 0.12,
      envMapIntensity: 3.0
    });

    this.materials.escapement = new THREE.MeshStandardMaterial({
      color: 0x556677,
      metalness: 0.92,
      roughness: 0.12
    });

    this.materials.jewel = new THREE.MeshPhysicalMaterial({
      color: s.jewelColor,
      metalness: 0.1,
      roughness: 0.08,
      transmission: 0.88,
      transparent: true,
      opacity: 0.95,
      emissive: s.jewelColor,
      emissiveIntensity: 0.4
    });

    this.materials.lume = new THREE.MeshStandardMaterial({
      color: s.lumeColor,
      emissive: s.lumeColor,
      emissiveIntensity: 0.9,
      roughness: 0.12
    });

    this.materials.strap = new THREE.MeshStandardMaterial({
      color: s.strapColor,
      metalness: 0.1,
      roughness: 0.65
    });

    this.materials.hairspring = new THREE.LineBasicMaterial({
      color: 0x4169e1,
      linewidth: 2
    });
  }

  buildWatch() {
    this.buildStrap();
    this.buildOuterCase();
    this.buildMainplate();
    this.buildGearTrain();
    this.buildEscapementAndBalance();
    this.buildBridges();
    this.buildJewels();
    this.buildRotor();
    this.buildDialAndHands();
    this.buildBezelAndGlass();

    // Position watch on right side (x = 1.1) on desktop
    const isDesktop = window.innerWidth > 900;
    this.group.position.set(isDesktop ? 1.1 : 0, 0, 0);

    // Elegant 3D angle (pitch 12°, yaw -18°)
    this.group.rotation.x = 0.2;
    this.group.rotation.y = -0.3;
  }

  registerPart(id, meshOrGroup, partMeta, explodeVec) {
    meshOrGroup.userData = {
      partId: id,
      partInfo: partMeta,
      explodeVector: explodeVec,
      initialPos: meshOrGroup.position.clone(),
      initialRot: meshOrGroup.rotation.clone()
    };
    this.parts[id] = meshOrGroup;
    this.group.add(meshOrGroup);
  }

  // --- 1. Curved Leather / Rubber Strap ---
  buildStrap() {
    const strapGroup = new THREE.Group();

    // Top Strap Segment (Curving backwards)
    const topPoints = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const y = 1.45 + t * 1.6;
      const z = -0.15 - Math.sin(t * Math.PI * 0.5) * 0.8;
      topPoints.push(new THREE.Vector3(0, y, z));
    }
    const topCurve = new THREE.CatmullRomCurve3(topPoints);
    const topGeo = new THREE.TubeGeometry(topCurve, 20, 0.42, 16, false);
    const topStrap = new THREE.Mesh(topGeo, this.materials.strap);
    topStrap.scale.set(1.5, 1, 0.3); // Flatten to strap profile

    // Bottom Strap Segment
    const bottomPoints = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const y = -1.45 - t * 1.6;
      const z = -0.15 - Math.sin(t * Math.PI * 0.5) * 0.8;
      bottomPoints.push(new THREE.Vector3(0, y, z));
    }
    const bottomCurve = new THREE.CatmullRomCurve3(bottomPoints);
    const bottomGeo = new THREE.TubeGeometry(bottomCurve, 20, 0.42, 16, false);
    const bottomStrap = new THREE.Mesh(bottomGeo, this.materials.strap);
    bottomStrap.scale.set(1.5, 1, 0.3);

    strapGroup.add(topStrap, bottomStrap);
    this.registerPart('strap', strapGroup, WATCH_PARTS.STRAP, new THREE.Vector3(0, 0, -1.0));
  }

  // --- 2. Outer Case & Seamless Tapered Lugs ---
  buildOuterCase() {
    const caseGroup = new THREE.Group();

    // Main Case Ring (Radius 1.45)
    const caseGeo = new THREE.CylinderGeometry(1.45, 1.45, 0.4, 64, 1, true);
    const caseMesh = new THREE.Mesh(caseGeo, this.materials.case);
    caseGroup.add(caseMesh);

    // Beveled Case Back Ring
    const backRingGeo = new THREE.TorusGeometry(1.42, 0.06, 16, 64);
    const backRing = new THREE.Mesh(backRingGeo, this.materials.case);
    backRing.position.z = -0.2;
    caseGroup.add(backRing);

    // 4 Seamless Curved Lugs extending outward from case perimeter
    const lugPositions = [
      [-0.95, 1.42, 0], [0.95, 1.42, 0],
      [-0.95, -1.42, 0], [0.95, -1.42, 0]
    ];

    lugPositions.forEach(pos => {
      const shape = new THREE.Shape();
      shape.moveTo(-0.15, 0);
      shape.lineTo(0.15, 0);
      shape.lineTo(0.1, 0.55);
      shape.lineTo(-0.1, 0.55);
      shape.closePath();

      const extrudeSettings = { depth: 0.2, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03 };
      const lugGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      const lug = new THREE.Mesh(lugGeo, this.materials.case);

      const isTop = pos[1] > 0;
      lug.position.set(pos[0], pos[1] * 0.9, -0.1);
      lug.rotation.x = (isTop ? 0.35 : -0.35);
      lug.rotation.z = (pos[0] > 0 ? -0.15 : 0.15);
      if (!isTop) lug.rotation.x *= -1;

      caseGroup.add(lug);
    });

    // Crown & Knurled Stem
    const crownGroup = new THREE.Group();
    const crownGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.28, 32);
    const crownMesh = new THREE.Mesh(crownGeo, this.materials.case);
    crownMesh.rotation.z = Math.PI / 2;
    crownGroup.add(crownMesh);

    const crestGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.29, 16);
    const crestMesh = new THREE.Mesh(crestGeo, this.materials.lume);
    crestMesh.rotation.z = Math.PI / 2;
    crownGroup.add(crestMesh);

    crownGroup.position.set(1.58, 0, 0);
    caseGroup.add(crownGroup);

    this.registerPart('outerCase', caseGroup, WATCH_PARTS.CASE, new THREE.Vector3(0, 0, -0.7));
  }

  // --- 3. Skeleton Mainplate ---
  buildMainplate() {
    const plateGroup = new THREE.Group();

    const plateShape = new THREE.Shape();
    plateShape.absarc(0, 0, 1.35, 0, Math.PI * 2, false);

    // Circular perlage cutouts
    const hole1 = new THREE.Path();
    hole1.absarc(-0.4, 0.35, 0.45, 0, Math.PI * 2, true);
    const hole2 = new THREE.Path();
    hole2.absarc(0.45, -0.3, 0.4, 0, Math.PI * 2, true);
    plateShape.holes.push(hole1, hole2);

    const plateGeo = new THREE.ExtrudeGeometry(plateShape, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015 });
    const plateMesh = new THREE.Mesh(plateGeo, this.materials.plate);
    plateMesh.position.z = -0.18;
    plateGroup.add(plateMesh);

    this.registerPart('mainplate', plateGroup, WATCH_PARTS.MAINPLATE, new THREE.Vector3(0, 0, -0.45));
  }

  // --- 4. Gear Train ---
  buildGearTrain() {
    const gearGroup = new THREE.Group();

    const createGear = (radius, teeth, thickness = 0.035) => {
      const gearShape = new THREE.Shape();
      const outerRadius = radius;
      const innerRadius = radius * 0.85;

      for (let i = 0; i < teeth; i++) {
        const angle1 = (i / teeth) * Math.PI * 2;
        const angle2 = ((i + 0.3) / teeth) * Math.PI * 2;
        const angle3 = ((i + 0.6) / teeth) * Math.PI * 2;
        const angle4 = ((i + 0.9) / teeth) * Math.PI * 2;

        if (i === 0) gearShape.moveTo(Math.cos(angle1) * innerRadius, Math.sin(angle1) * innerRadius);
        gearShape.lineTo(Math.cos(angle2) * outerRadius, Math.sin(angle2) * outerRadius);
        gearShape.lineTo(Math.cos(angle3) * outerRadius, Math.sin(angle3) * outerRadius);
        gearShape.lineTo(Math.cos(angle4) * innerRadius, Math.sin(angle4) * innerRadius);
      }

      const hole = new THREE.Path();
      hole.absarc(0, 0, radius * 0.3, 0, Math.PI * 2, true);
      gearShape.holes.push(hole);

      const geo = new THREE.ExtrudeGeometry(gearShape, { depth: thickness, bevelEnabled: false });
      return new THREE.Mesh(geo, this.materials.gear);
    };

    // Mainspring Barrel
    this.mainspringGear = createGear(0.48, 28, 0.05);
    this.mainspringGear.position.set(-0.42, -0.35, -0.09);
    gearGroup.add(this.mainspringGear);

    // Center Gear
    this.centerGear = createGear(0.36, 20, 0.035);
    this.centerGear.position.set(0, 0, -0.07);
    gearGroup.add(this.centerGear);

    // Third Wheel
    this.thirdGear = createGear(0.28, 16, 0.035);
    this.thirdGear.position.set(0.32, 0.28, -0.05);
    gearGroup.add(this.thirdGear);

    // Fourth Wheel (Seconds)
    this.fourthGear = createGear(0.22, 14, 0.035);
    this.fourthGear.position.set(-0.28, 0.42, -0.04);
    gearGroup.add(this.fourthGear);

    // Escape Wheel
    this.escapeGear = createGear(0.16, 12, 0.035);
    this.escapeGear.position.set(0.1, 0.6, -0.03);
    gearGroup.add(this.escapeGear);

    this.registerPart('gearTrain', gearGroup, WATCH_PARTS.GEAR_TRAIN, new THREE.Vector3(0, 0, -0.2));
  }

  // --- 5. Escapement & Balance Wheel ---
  buildEscapementAndBalance() {
    const escGroup = new THREE.Group();

    // Balance Wheel Ring
    const balShape = new THREE.Shape();
    balShape.absarc(0, 0, 0.35, 0, Math.PI * 2, false);
    const balHole = new THREE.Path();
    balHole.absarc(0, 0, 0.28, 0, Math.PI * 2, true);
    balShape.holes.push(balHole);

    const balGeo = new THREE.ExtrudeGeometry(balShape, { depth: 0.03, bevelEnabled: false });
    this.balanceWheelMesh = new THREE.Mesh(balGeo, this.materials.gear);

    const spokeGeo = new THREE.BoxGeometry(0.65, 0.04, 0.03);
    const spoke = new THREE.Mesh(spokeGeo, this.materials.gear);
    this.balanceWheelMesh.add(spoke);

    for (let i = 0; i < 4; i++) {
      const screwGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.04, 8);
      const screw = new THREE.Mesh(screwGeo, this.materials.lume);
      const angle = (i / 4) * Math.PI * 2;
      screw.position.set(Math.cos(angle) * 0.32, Math.sin(angle) * 0.32, 0.015);
      this.balanceWheelMesh.add(screw);
    }

    // Coiled Hairspring
    const curvePoints = [];
    const coils = 3.5;
    for (let i = 0; i < 100; i++) {
      const t = i / 100;
      const angle = t * Math.PI * 2 * coils;
      const r = 0.05 + t * 0.2;
      curvePoints.push(new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r, 0.02));
    }
    const hairspringGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const hairspringMesh = new THREE.Line(hairspringGeo, this.materials.hairspring);
    this.balanceWheelMesh.add(hairspringMesh);

    this.balanceWheelMesh.position.set(-0.35, 0.3, 0.08);
    escGroup.add(this.balanceWheelMesh);

    // Pallet Fork
    const palletFork = new THREE.Group();
    const forkBodyGeo = new THREE.BoxGeometry(0.18, 0.04, 0.025);
    const forkBody = new THREE.Mesh(forkBodyGeo, this.materials.escapement);
    palletFork.add(forkBody);

    const rubyGeo = new THREE.BoxGeometry(0.04, 0.04, 0.04);
    const ruby1 = new THREE.Mesh(rubyGeo, this.materials.jewel);
    const ruby2 = new THREE.Mesh(rubyGeo, this.materials.jewel);
    ruby1.position.set(-0.08, 0.03, 0);
    ruby2.position.set(0.08, 0.03, 0);
    palletFork.add(ruby1, ruby2);

    palletFork.position.set(-0.14, 0.52, 0.06);
    escGroup.add(palletFork);

    this.registerPart('balanceWheel', escGroup, WATCH_PARTS.BALANCE_WHEEL, new THREE.Vector3(0, 0, 0.15));
  }

  // --- 6. Architectural Skeleton Micro-Bridges (LEAVING CENTER FULLY OPEN) ---
  buildBridges() {
    const bridgeGroup = new THREE.Group();

    // 1. Balance Cock Finger Bridge (Top-Left corner)
    const balBridgeShape = new THREE.Shape();
    balBridgeShape.moveTo(-0.6, 0.45);
    balBridgeShape.lineTo(-0.15, 0.45);
    balBridgeShape.lineTo(-0.25, 0.15);
    balBridgeShape.lineTo(-0.6, 0.25);
    balBridgeShape.closePath();

    const balBridgeGeo = new THREE.ExtrudeGeometry(balBridgeShape, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01 });
    const balBridge = new THREE.Mesh(balBridgeGeo, this.materials.plate);
    balBridge.position.z = -0.12;
    bridgeGroup.add(balBridge);

    // 2. Gear Train Micro-Bridge (Bottom-Right corner)
    const gearBridgeShape = new THREE.Shape();
    gearBridgeShape.moveTo(0.15, -0.45);
    gearBridgeShape.lineTo(0.55, -0.2);
    gearBridgeShape.lineTo(0.45, -0.5);
    gearBridgeShape.closePath();

    const gearBridgeGeo = new THREE.ExtrudeGeometry(gearBridgeShape, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01 });
    const gearBridge = new THREE.Mesh(gearBridgeGeo, this.materials.plate);
    gearBridge.position.z = -0.12;
    bridgeGroup.add(gearBridge);

    // Blue Screws on bridges
    const screwGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.03, 16);
    const screwMat = new THREE.MeshStandardMaterial({ color: 0x1e90ff, metalness: 0.9, roughness: 0.1 });

    [ [-0.5, 0.35], [0.45, -0.35] ].forEach(pos => {
      const s = new THREE.Mesh(screwGeo, screwMat);
      s.rotation.x = Math.PI / 2;
      s.position.set(pos[0], pos[1], -0.09);
      bridgeGroup.add(s);
    });

    this.registerPart('bridges', bridgeGroup, WATCH_PARTS.BRIDGES, new THREE.Vector3(0, 0, 0.35));
  }

  // --- 7. Synthetic Ruby Jewels ---
  buildJewels() {
    const jewelGroup = new THREE.Group();

    const jewelGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.035, 16);
    const jewelPositions = [
      [0, 0, -0.03],
      [-0.42, -0.35, -0.05],
      [0.32, 0.28, -0.02],
      [-0.28, 0.42, 0.01],
      [-0.35, 0.3, 0.15],
      [0.1, 0.6, 0.03]
    ];

    jewelPositions.forEach(pos => {
      const j = new THREE.Mesh(jewelGeo, this.materials.jewel);
      j.rotation.x = Math.PI / 2;
      j.position.set(...pos);
      jewelGroup.add(j);
    });

    this.registerPart('jewels', jewelGroup, WATCH_PARTS.JEWELS, new THREE.Vector3(0, 0, 0.55));
  }

  // --- 8. Automatic Rotor ---
  buildRotor() {
    const rotorGroup = new THREE.Group();

    const shape = new THREE.Shape();
    shape.absarc(0, 0, 1.2, 0, Math.PI, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, 0.35, 0, Math.PI, true);
    shape.holes.push(hole);

    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01 });
    const rotorMesh = new THREE.Mesh(geo, this.materials.gear);
    rotorMesh.position.z = -0.32;
    rotorGroup.add(rotorMesh);

    const hubGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.07, 32);
    const hubMesh = new THREE.Mesh(hubGeo, this.materials.case);
    hubMesh.rotation.x = Math.PI / 2;
    hubMesh.position.z = -0.3;
    rotorGroup.add(hubMesh);

    this.registerPart('rotor', rotorGroup, WATCH_PARTS.ROTOR, new THREE.Vector3(0, 0, -1.3));
  }

  // --- 9. Skeleton Dial & Hands (CLEAN FRONT UNMODIFIED FACE) ---
  buildDialAndHands() {
    const dialGroup = new THREE.Group();

    const ringShape = new THREE.Shape();
    ringShape.absarc(0, 0, 1.35, 0, Math.PI * 2, false);
    const ringHole = new THREE.Path();
    ringHole.absarc(0, 0, 1.05, 0, Math.PI * 2, true);
    ringShape.holes.push(ringHole);

    const ringGeo = new THREE.ExtrudeGeometry(ringShape, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008 });
    const dialRing = new THREE.Mesh(ringGeo, this.materials.dial);
    dialRing.position.z = 0.15;
    dialGroup.add(dialRing);

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const isQuarter = (i % 3 === 0);
      const indexGeo = new THREE.BoxGeometry(isQuarter ? 0.05 : 0.03, 0.14, 0.025);
      const indexMesh = new THREE.Mesh(indexGeo, this.materials.case);
      indexMesh.position.set(Math.sin(angle) * 1.2, Math.cos(angle) * 1.2, 0.17);
      indexMesh.rotation.z = -angle;
      dialGroup.add(indexMesh);
    }

    const handsGroup = new THREE.Group();

    // Hour Hand
    const hourHandShape = new THREE.Shape();
    hourHandShape.moveTo(-0.03, 0);
    hourHandShape.lineTo(-0.02, 0.65);
    hourHandShape.lineTo(0, 0.8);
    hourHandShape.lineTo(0.02, 0.65);
    hourHandShape.lineTo(0.03, 0);
    hourHandShape.closePath();
    const hourGeo = new THREE.ExtrudeGeometry(hourHandShape, { depth: 0.02, bevelEnabled: false });
    this.hourHandMesh = new THREE.Mesh(hourGeo, this.materials.case);

    const hourLumeGeo = new THREE.BoxGeometry(0.02, 0.4, 0.025);
    const hourLume = new THREE.Mesh(hourLumeGeo, this.materials.lume);
    hourLume.position.set(0, 0.38, 0.005);
    this.hourHandMesh.add(hourLume);
    this.hourHandMesh.position.z = 0.22;
    handsGroup.add(this.hourHandMesh);

    // Minute Hand
    const minHandShape = new THREE.Shape();
    minHandShape.moveTo(-0.025, 0);
    minHandShape.lineTo(-0.018, 0.95);
    minHandShape.lineTo(0, 1.1);
    minHandShape.lineTo(0.018, 0.95);
    minHandShape.lineTo(0.025, 0);
    minHandShape.closePath();
    const minGeo = new THREE.ExtrudeGeometry(minHandShape, { depth: 0.02, bevelEnabled: false });
    this.minHandMesh = new THREE.Mesh(minGeo, this.materials.case);

    const minLumeGeo = new THREE.BoxGeometry(0.02, 0.65, 0.025);
    const minLume = new THREE.Mesh(minLumeGeo, this.materials.lume);
    minLume.position.set(0, 0.55, 0.005);
    this.minHandMesh.add(minLume);
    this.minHandMesh.position.z = 0.25;
    handsGroup.add(this.minHandMesh);

    // Second Hand
    const secHandShape = new THREE.Shape();
    secHandShape.moveTo(-0.01, -0.25);
    secHandShape.lineTo(0.01, -0.25);
    secHandShape.lineTo(0.006, 1.15);
    secHandShape.lineTo(-0.006, 1.15);
    secHandShape.closePath();
    const secGeo = new THREE.ExtrudeGeometry(secHandShape, { depth: 0.012, bevelEnabled: false });
    this.secHandMesh = new THREE.Mesh(secGeo, this.materials.lume);

    const counterGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.015, 16);
    const counterMesh = new THREE.Mesh(counterGeo, this.materials.case);
    counterMesh.rotation.x = Math.PI / 2;
    counterMesh.position.set(0, -0.15, 0.008);
    this.secHandMesh.add(counterMesh);

    this.secHandMesh.position.z = 0.28;
    handsGroup.add(this.secHandMesh);

    dialGroup.add(handsGroup);

    this.registerPart('dial', dialGroup, WATCH_PARTS.DIAL, new THREE.Vector3(0, 0, 0.75));
    this.registerPart('hands', handsGroup, WATCH_PARTS.HANDS, new THREE.Vector3(0, 0, 1.0));
  }

  // --- 10. Bezel & Sapphire Glass ---
  buildBezelAndGlass() {
    const bezelGroup = new THREE.Group();

    const bezelShape = new THREE.Shape();
    bezelShape.absarc(0, 0, 1.48, 0, Math.PI * 2, false);
    const bezelHole = new THREE.Path();
    bezelHole.absarc(0, 0, 1.32, 0, Math.PI * 2, true);
    bezelShape.holes.push(bezelHole);

    const bezelGeo = new THREE.ExtrudeGeometry(bezelShape, { depth: 0.15, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02 });
    const bezelMesh = new THREE.Mesh(bezelGeo, this.materials.bezel);
    bezelMesh.position.z = 0.18;
    bezelGroup.add(bezelMesh);

    for (let i = 0; i < 60; i += 5) {
      const angle = (i / 60) * Math.PI * 2;
      const isMajor = (i % 15 === 0);
      const dotGeo = new THREE.CylinderGeometry(isMajor ? 0.025 : 0.012, isMajor ? 0.025 : 0.012, 0.015, 12);
      const dotMesh = new THREE.Mesh(dotGeo, this.materials.lume);
      dotMesh.rotation.x = Math.PI / 2;
      dotMesh.position.set(Math.sin(angle) * 1.4, Math.cos(angle) * 1.4, 0.34);
      bezelGroup.add(dotMesh);
    }

    this.registerPart('bezel', bezelGroup, WATCH_PARTS.BEZEL, new THREE.Vector3(0, 0, 1.25));

    const glassGroup = new THREE.Group();
    const glassGeo = new THREE.CylinderGeometry(1.32, 1.32, 0.08, 64);
    const glassMesh = new THREE.Mesh(glassGeo, this.materials.glass);
    glassMesh.rotation.x = Math.PI / 2;
    glassMesh.position.z = 0.35;
    glassGroup.add(glassMesh);

    this.registerPart('sapphireGlass', glassGroup, WATCH_PARTS.SAPPHIRE_GLASS, new THREE.Vector3(0, 0, 1.45));
  }

  // --- Exploded Assembly Progress (0.0 to 1.0) ---
  updateExplosion(progress) {
    const p = Math.max(0, Math.min(1, progress));

    Object.values(this.parts).forEach(partGroup => {
      const explodeVec = partGroup.userData.explodeVector;
      const initialPos = partGroup.userData.initialPos;

      partGroup.position.x = initialPos.x + explodeVec.x * p;
      partGroup.position.y = initialPos.y + explodeVec.y * p;
      partGroup.position.z = initialPos.z + explodeVec.z * p;
    });
  }

  // --- Continuous Kinematic Gear Simulation ---
  updateKinematics(delta) {
    this.gearRotations.balance += delta * 25;
    if (this.balanceWheelMesh) {
      this.balanceWheelMesh.rotation.z = Math.sin(this.gearRotations.balance) * 0.8;
    }

    this.gearRotations.seconds += delta * (Math.PI * 2 / 60);
    if (this.secHandMesh) {
      this.secHandMesh.rotation.z = -this.gearRotations.seconds;
    }
    if (this.escapeGear) {
      this.escapeGear.rotation.z = this.gearRotations.seconds * 6;
    }

    this.gearRotations.minutes += delta * (Math.PI * 2 / 3600);
    if (this.minHandMesh) {
      this.minHandMesh.rotation.z = -this.gearRotations.minutes;
    }
    if (this.centerGear) {
      this.centerGear.rotation.z = this.gearRotations.minutes;
    }

    this.gearRotations.hours += delta * (Math.PI * 2 / 43200);
    if (this.hourHandMesh) {
      this.hourHandMesh.rotation.z = -this.gearRotations.hours;
    }
    if (this.mainspringGear) {
      this.mainspringGear.rotation.z = -this.gearRotations.hours * 0.5;
    }
  }

  applyMaterialScheme(scheme) {
    this.currentScheme = scheme;

    this.materials.case.color.setHex(scheme.caseColor);
    this.materials.case.metalness = scheme.caseMetalness;
    this.materials.case.roughness = scheme.caseRoughness;

    this.materials.bezel.color.setHex(scheme.bezelColor);
    this.materials.dial.color.setHex(scheme.dialColor);
    this.materials.strap.color.setHex(scheme.strapColor);
    this.materials.gear.color.setHex(scheme.gearColor);
    this.materials.plate.color.setHex(scheme.plateColor);

    this.materials.jewel.color.setHex(scheme.jewelColor);
    this.materials.jewel.emissive.setHex(scheme.jewelColor);

    this.materials.lume.color.setHex(scheme.lumeColor);
    this.materials.lume.emissive.setHex(scheme.lumeColor);
  }
}
