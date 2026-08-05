// Horologia - Procedural 3D Mechanical Watch Generator (Three.js)
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
      envMapIntensity: 2.5
    });

    this.materials.bezel = new THREE.MeshStandardMaterial({
      color: s.bezelColor,
      metalness: 0.95,
      roughness: 0.1,
      envMapIntensity: 3.0
    });

    this.materials.dial = new THREE.MeshStandardMaterial({
      color: s.dialColor,
      metalness: 0.5,
      roughness: 0.25,
      envMapIntensity: 1.5
    });

    this.materials.glass = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.1,
      roughness: 0.02,
      transmission: 0.92,
      thickness: 0.8,
      transparent: true,
      opacity: 0.35,
      ior: 1.77,
      reflectivity: 0.9
    });

    this.materials.plate = new THREE.MeshStandardMaterial({
      color: s.plateColor,
      metalness: 0.88,
      roughness: 0.2,
      envMapIntensity: 2.0
    });

    this.materials.gear = new THREE.MeshStandardMaterial({
      color: s.gearColor,
      metalness: 0.95,
      roughness: 0.15,
      envMapIntensity: 2.5
    });

    this.materials.escapement = new THREE.MeshStandardMaterial({
      color: 0x556677,
      metalness: 0.9,
      roughness: 0.15
    });

    this.materials.jewel = new THREE.MeshPhysicalMaterial({
      color: s.jewelColor,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.85,
      transparent: true,
      opacity: 0.9,
      emissive: s.jewelColor,
      emissiveIntensity: 0.3
    });

    this.materials.lume = new THREE.MeshStandardMaterial({
      color: s.lumeColor,
      emissive: s.lumeColor,
      emissiveIntensity: 0.8,
      roughness: 0.2
    });

    this.materials.strap = new THREE.MeshStandardMaterial({
      color: s.strapColor,
      metalness: 0.15,
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

    // Default angle: angled slightly for dramatic 3D luxury presentation
    this.group.rotation.x = 0.25;
    this.group.rotation.y = -0.35;
    this.group.position.set(0, 0, 0);
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

  // --- 1. Strap & Buckle ---
  buildStrap() {
    const strapGroup = new THREE.Group();

    const shape = new THREE.Shape();
    shape.moveTo(-0.9, 0);
    shape.lineTo(0.9, 0);
    shape.lineTo(0.8, -3.2);
    shape.lineTo(-0.8, -3.2);
    shape.closePath();

    const extrudeSettings = { depth: 0.15, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.04, bevelThickness: 0.04 };
    const strapGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    const topStrap = new THREE.Mesh(strapGeo, this.materials.strap);
    topStrap.rotation.x = Math.PI / 2;
    topStrap.position.set(0, 1.75, -0.08);

    const bottomStrap = topStrap.clone();
    bottomStrap.rotation.z = Math.PI;
    bottomStrap.position.set(0, -1.75, 0.08);

    strapGroup.add(topStrap, bottomStrap);
    // Explode Vector: Down/Back
    this.registerPart('strap', strapGroup, WATCH_PARTS.STRAP, new THREE.Vector3(0, 0, -1.8));
  }

  // --- 2. Outer Case & Crown ---
  buildOuterCase() {
    const caseGroup = new THREE.Group();

    // Main Case Cylinder (Radius 1.75)
    const caseGeo = new THREE.CylinderGeometry(1.75, 1.75, 0.6, 64, 1, true);
    const caseMesh = new THREE.Mesh(caseGeo, this.materials.case);
    caseGroup.add(caseMesh);

    // 4 Lugs
    const lugGeo = new THREE.BoxGeometry(0.25, 0.9, 0.4);
    const lugPositions = [
      [-1.1, 1.75, 0], [1.1, 1.75, 0],
      [-1.1, -1.75, 0], [1.1, -1.75, 0]
    ];

    lugPositions.forEach(pos => {
      const lug = new THREE.Mesh(lugGeo, this.materials.case);
      lug.position.set(...pos);
      lug.rotation.z = (pos[1] > 0 ? -1 : 1) * 0.12;
      caseGroup.add(lug);
    });

    // Winding Crown & Stem
    const crownGroup = new THREE.Group();
    const crownGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.35, 32);
    const crownMesh = new THREE.Mesh(crownGeo, this.materials.case);
    crownMesh.rotation.z = Math.PI / 2;
    crownGroup.add(crownMesh);

    const crestGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.36, 16);
    const crestMesh = new THREE.Mesh(crestGeo, this.materials.lume);
    crestMesh.rotation.z = Math.PI / 2;
    crownGroup.add(crestMesh);

    crownGroup.position.set(1.9, 0, 0);
    caseGroup.add(crownGroup);

    this.registerPart('outerCase', caseGroup, WATCH_PARTS.CASE, new THREE.Vector3(0, 0, -1.2));
  }

  // --- 3. Skeleton Mainplate ---
  buildMainplate() {
    const plateGroup = new THREE.Group();

    const plateShape = new THREE.Shape();
    plateShape.absarc(0, 0, 1.6, 0, Math.PI * 2, false);

    const hole1 = new THREE.Path();
    hole1.absarc(-0.45, 0.4, 0.5, 0, Math.PI * 2, true);
    const hole2 = new THREE.Path();
    hole2.absarc(0.5, -0.3, 0.4, 0, Math.PI * 2, true);
    plateShape.holes.push(hole1, hole2);

    const plateGeo = new THREE.ExtrudeGeometry(plateShape, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02 });
    const plateMesh = new THREE.Mesh(plateGeo, this.materials.plate);
    plateMesh.position.z = -0.25;
    plateGroup.add(plateMesh);

    this.registerPart('mainplate', plateGroup, WATCH_PARTS.MAINPLATE, new THREE.Vector3(0, 0, -0.7));
  }

  // --- 4. Gear Train ---
  buildGearTrain() {
    const gearGroup = new THREE.Group();

    const createGear = (radius, teeth, thickness = 0.06) => {
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
    this.mainspringGear = createGear(0.65, 32, 0.09);
    this.mainspringGear.position.set(-0.6, -0.5, -0.12);
    gearGroup.add(this.mainspringGear);

    // Center Gear
    this.centerGear = createGear(0.5, 24, 0.06);
    this.centerGear.position.set(0, 0, -0.1);
    gearGroup.add(this.centerGear);

    // Third Wheel
    this.thirdGear = createGear(0.38, 20, 0.06);
    this.thirdGear.position.set(0.45, 0.4, -0.08);
    gearGroup.add(this.thirdGear);

    // Fourth Wheel (Seconds)
    this.fourthGear = createGear(0.3, 16, 0.06);
    this.fourthGear.position.set(-0.4, 0.6, -0.06);
    gearGroup.add(this.fourthGear);

    // Escape Wheel
    this.escapeGear = createGear(0.22, 12, 0.05);
    this.escapeGear.position.set(0.15, 0.85, -0.04);
    gearGroup.add(this.escapeGear);

    this.registerPart('gearTrain', gearGroup, WATCH_PARTS.GEAR_TRAIN, new THREE.Vector3(0, 0, -0.2));
  }

  // --- 5. Escapement & Balance Wheel ---
  buildEscapementAndBalance() {
    const escGroup = new THREE.Group();

    // Balance Wheel Ring
    const balShape = new THREE.Shape();
    balShape.absarc(0, 0, 0.45, 0, Math.PI * 2, false);
    const balHole = new THREE.Path();
    balHole.absarc(0, 0, 0.36, 0, Math.PI * 2, true);
    balShape.holes.push(balHole);

    const balGeo = new THREE.ExtrudeGeometry(balShape, { depth: 0.04, bevelEnabled: false });
    this.balanceWheelMesh = new THREE.Mesh(balGeo, this.materials.gear);

    const spokeGeo = new THREE.BoxGeometry(0.85, 0.06, 0.04);
    const spoke = new THREE.Mesh(spokeGeo, this.materials.gear);
    this.balanceWheelMesh.add(spoke);

    for (let i = 0; i < 4; i++) {
      const screwGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.06, 8);
      const screw = new THREE.Mesh(screwGeo, this.materials.lume);
      const angle = (i / 4) * Math.PI * 2;
      screw.position.set(Math.cos(angle) * 0.42, Math.sin(angle) * 0.42, 0.02);
      this.balanceWheelMesh.add(screw);
    }

    // Coiled Hairspring
    const curvePoints = [];
    const coils = 4.0;
    for (let i = 0; i < 120; i++) {
      const t = i / 120;
      const angle = t * Math.PI * 2 * coils;
      const r = 0.06 + t * 0.25;
      curvePoints.push(new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r, 0.025));
    }
    const hairspringGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const hairspringMesh = new THREE.Line(hairspringGeo, this.materials.hairspring);
    this.balanceWheelMesh.add(hairspringMesh);

    this.balanceWheelMesh.position.set(-0.45, 0.4, 0.12);
    escGroup.add(this.balanceWheelMesh);

    // Pallet Fork
    const palletFork = new THREE.Group();
    const forkBodyGeo = new THREE.BoxGeometry(0.24, 0.05, 0.03);
    const forkBody = new THREE.Mesh(forkBodyGeo, this.materials.escapement);
    palletFork.add(forkBody);

    const rubyGeo = new THREE.BoxGeometry(0.05, 0.05, 0.05);
    const ruby1 = new THREE.Mesh(rubyGeo, this.materials.jewel);
    const ruby2 = new THREE.Mesh(rubyGeo, this.materials.jewel);
    ruby1.position.set(-0.1, 0.04, 0);
    ruby2.position.set(0.1, 0.04, 0);
    palletFork.add(ruby1, ruby2);

    palletFork.position.set(-0.18, 0.7, 0.1);
    escGroup.add(palletFork);

    this.registerPart('balanceWheel', escGroup, WATCH_PARTS.BALANCE_WHEEL, new THREE.Vector3(0, 0, 0.3));
  }

  // --- 6. Architectural Bridges ---
  buildBridges() {
    const bridgeGroup = new THREE.Group();

    const bridgeShape = new THREE.Shape();
    bridgeShape.moveTo(-0.9, 0.15);
    bridgeShape.quadraticCurveTo(-0.4, 0.9, 0, 0.85);
    bridgeShape.quadraticCurveTo(0.4, 0.8, 0.65, 0.25);
    bridgeShape.lineTo(0.4, 0.08);
    bridgeShape.quadraticCurveTo(-0.4, 0.3, -0.75, 0.08);
    bridgeShape.closePath();

    const bridgeGeo = new THREE.ExtrudeGeometry(bridgeShape, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015 });
    const bridgeMesh = new THREE.Mesh(bridgeGeo, this.materials.plate);
    bridgeMesh.position.z = 0.2;
    bridgeGroup.add(bridgeMesh);

    const screwGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.05, 16);
    const screwMat = new THREE.MeshStandardMaterial({ color: 0x1e90ff, metalness: 0.9, roughness: 0.1 });

    [ [-0.75, 0.15], [0.55, 0.25] ].forEach(pos => {
      const s = new THREE.Mesh(screwGeo, screwMat);
      s.rotation.x = Math.PI / 2;
      s.position.set(pos[0], pos[1], 0.26);
      bridgeGroup.add(s);
    });

    this.registerPart('bridges', bridgeGroup, WATCH_PARTS.BRIDGES, new THREE.Vector3(0, 0, 0.8));
  }

  // --- 7. Synthetic Ruby Jewels ---
  buildJewels() {
    const jewelGroup = new THREE.Group();

    const jewelGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.06, 16);
    const jewelPositions = [
      [0, 0, -0.04],
      [-0.6, -0.5, -0.06],
      [0.45, 0.4, -0.03],
      [-0.4, 0.6, -0.01],
      [-0.45, 0.4, 0.22],
      [0.15, 0.85, 0.04]
    ];

    jewelPositions.forEach(pos => {
      const j = new THREE.Mesh(jewelGeo, this.materials.jewel);
      j.rotation.x = Math.PI / 2;
      j.position.set(...pos);
      jewelGroup.add(j);
    });

    this.registerPart('jewels', jewelGroup, WATCH_PARTS.JEWELS, new THREE.Vector3(0, 0, 1.2));
  }

  // --- 8. Automatic Rotor ---
  buildRotor() {
    const rotorGroup = new THREE.Group();

    const shape = new THREE.Shape();
    shape.absarc(0, 0, 1.45, 0, Math.PI, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, 0.4, 0, Math.PI, true);
    shape.holes.push(hole);

    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015 });
    const rotorMesh = new THREE.Mesh(geo, this.materials.gear);
    rotorMesh.position.z = -0.38;
    rotorGroup.add(rotorMesh);

    const hubGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.09, 32);
    const hubMesh = new THREE.Mesh(hubGeo, this.materials.case);
    hubMesh.rotation.x = Math.PI / 2;
    hubMesh.position.z = -0.35;
    rotorGroup.add(hubMesh);

    this.registerPart('rotor', rotorGroup, WATCH_PARTS.ROTOR, new THREE.Vector3(0, 0, -1.9));
  }

  // --- 9. Skeleton Dial & Hands ---
  buildDialAndHands() {
    const dialGroup = new THREE.Group();

    const ringShape = new THREE.Shape();
    ringShape.absarc(0, 0, 1.6, 0, Math.PI * 2, false);
    const ringHole = new THREE.Path();
    ringHole.absarc(0, 0, 1.3, 0, Math.PI * 2, true);
    ringShape.holes.push(ringHole);

    const ringGeo = new THREE.ExtrudeGeometry(ringShape, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01 });
    const dialRing = new THREE.Mesh(ringGeo, this.materials.dial);
    dialRing.position.z = 0.35;
    dialGroup.add(dialRing);

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const isQuarter = (i % 3 === 0);
      const indexGeo = new THREE.BoxGeometry(isQuarter ? 0.06 : 0.04, 0.18, 0.03);
      const indexMesh = new THREE.Mesh(indexGeo, this.materials.case);
      indexMesh.position.set(Math.sin(angle) * 1.45, Math.cos(angle) * 1.45, 0.38);
      indexMesh.rotation.z = -angle;
      dialGroup.add(indexMesh);
    }

    const handsGroup = new THREE.Group();

    // Hour Hand
    const hourHandShape = new THREE.Shape();
    hourHandShape.moveTo(-0.04, 0);
    hourHandShape.lineTo(-0.03, 0.8);
    hourHandShape.lineTo(0, 1.0);
    hourHandShape.lineTo(0.03, 0.8);
    hourHandShape.lineTo(0.04, 0);
    hourHandShape.closePath();
    const hourGeo = new THREE.ExtrudeGeometry(hourHandShape, { depth: 0.025, bevelEnabled: false });
    this.hourHandMesh = new THREE.Mesh(hourGeo, this.materials.case);

    const hourLumeGeo = new THREE.BoxGeometry(0.03, 0.5, 0.03);
    const hourLume = new THREE.Mesh(hourLumeGeo, this.materials.lume);
    hourLume.position.set(0, 0.45, 0.005);
    this.hourHandMesh.add(hourLume);
    this.hourHandMesh.position.z = 0.40;
    handsGroup.add(this.hourHandMesh);

    // Minute Hand
    const minHandShape = new THREE.Shape();
    minHandShape.moveTo(-0.035, 0);
    minHandShape.lineTo(-0.025, 1.2);
    minHandShape.lineTo(0, 1.4);
    minHandShape.lineTo(0.025, 1.2);
    minHandShape.lineTo(0.035, 0);
    minHandShape.closePath();
    const minGeo = new THREE.ExtrudeGeometry(minHandShape, { depth: 0.025, bevelEnabled: false });
    this.minHandMesh = new THREE.Mesh(minGeo, this.materials.case);

    const minLumeGeo = new THREE.BoxGeometry(0.025, 0.8, 0.03);
    const minLume = new THREE.Mesh(minLumeGeo, this.materials.lume);
    minLume.position.set(0, 0.7, 0.005);
    this.minHandMesh.add(minLume);
    this.minHandMesh.position.z = 0.43;
    handsGroup.add(this.minHandMesh);

    // Second Hand
    const secHandShape = new THREE.Shape();
    secHandShape.moveTo(-0.012, -0.3);
    secHandShape.lineTo(0.012, -0.3);
    secHandShape.lineTo(0.008, 1.45);
    secHandShape.lineTo(-0.008, 1.45);
    secHandShape.closePath();
    const secGeo = new THREE.ExtrudeGeometry(secHandShape, { depth: 0.015, bevelEnabled: false });
    this.secHandMesh = new THREE.Mesh(secGeo, this.materials.lume);

    const counterGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.02, 16);
    const counterMesh = new THREE.Mesh(counterGeo, this.materials.case);
    counterMesh.rotation.x = Math.PI / 2;
    counterMesh.position.set(0, -0.2, 0.01);
    this.secHandMesh.add(counterMesh);

    this.secHandMesh.position.z = 0.46;
    handsGroup.add(this.secHandMesh);

    dialGroup.add(handsGroup);

    this.registerPart('dial', dialGroup, WATCH_PARTS.DIAL, new THREE.Vector3(0, 0, 1.6));
    this.registerPart('hands', handsGroup, WATCH_PARTS.HANDS, new THREE.Vector3(0, 0, 2.0));
  }

  // --- 10. Bezel & Sapphire Glass ---
  buildBezelAndGlass() {
    const bezelGroup = new THREE.Group();

    const bezelShape = new THREE.Shape();
    bezelShape.absarc(0, 0, 1.8, 0, Math.PI * 2, false);
    const bezelHole = new THREE.Path();
    bezelHole.absarc(0, 0, 1.6, 0, Math.PI * 2, true);
    bezelShape.holes.push(bezelHole);

    const bezelGeo = new THREE.ExtrudeGeometry(bezelShape, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03 });
    const bezelMesh = new THREE.Mesh(bezelGeo, this.materials.bezel);
    bezelMesh.position.z = 0.3;
    bezelGroup.add(bezelMesh);

    for (let i = 0; i < 60; i += 5) {
      const angle = (i / 60) * Math.PI * 2;
      const isMajor = (i % 15 === 0);
      const dotGeo = new THREE.CylinderGeometry(isMajor ? 0.03 : 0.015, isMajor ? 0.03 : 0.015, 0.02, 12);
      const dotMesh = new THREE.Mesh(dotGeo, this.materials.lume);
      dotMesh.rotation.x = Math.PI / 2;
      dotMesh.position.set(Math.sin(angle) * 1.7, Math.cos(angle) * 1.7, 0.51);
      bezelGroup.add(dotMesh);
    }

    this.registerPart('bezel', bezelGroup, WATCH_PARTS.BEZEL, new THREE.Vector3(0, 0, 2.4));

    const glassGroup = new THREE.Group();
    const glassGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.1, 64);
    const glassMesh = new THREE.Mesh(glassGeo, this.materials.glass);
    glassMesh.rotation.x = Math.PI / 2;
    glassMesh.position.z = 0.55;
    glassGroup.add(glassMesh);

    this.registerPart('sapphireGlass', glassGroup, WATCH_PARTS.SAPPHIRE_GLASS, new THREE.Vector3(0, 0, 2.8));
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
