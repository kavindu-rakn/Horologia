// Horologia - Chapter-Driven Procedural 3D Mechanical Watch
import * as THREE from 'three';
import { gsap } from 'gsap';
import { WATCH_PARTS, MATERIAL_SCHEMES } from '../utils/constants.js';

// ── Chapter explosion targets ─────────────────────────────────────────────
// Offsets from each part's assembled position. Parts not listed = stay assembled.
const CHAPTER_TARGETS = {
  // Ch0 — Hero: fully assembled, ready-to-wear
  0: {},

  // Ch1 — Sapphire Crystal & Bezel lift off, revealing dial face
  1: {
    sapphireGlass: { x: 0,    y: 0.1,  z: 3.2 },
    bezel:         { x: 0,    y: 0,    z: 2.0 },
  },

  // Ch2 — Solid dial face + ring lift off, revealing movement + hands
  2: {
    sapphireGlass: { x: 0,    y: 0.15, z: 3.6 },
    bezel:         { x: 0,    y: 0,    z: 2.4 },
    dialFace:      { x: -0.1, y: 0.05, z: 1.6 },
    dial:          { x: -0.2, y: 0,    z: 1.0 },
    hands:         { x: -0.05,y: 0.05, z: 1.9 },
  },

  // Ch3 — Gear train spreads laterally
  3: {
    sapphireGlass: { x: 0,    y: 0.15, z: 3.6 },
    bezel:         { x: 0,    y: 0,    z: 2.4 },
    dialFace:      { x: -0.1, y: 0.05, z: 1.6 },
    dial:          { x: -0.2, y: 0,    z: 1.0 },
    hands:         { x: -0.05,y: 0.05, z: 1.9 },
    gearTrain:     { x: -1.2, y: 0.6,  z: 0.4 },
  },

  // Ch4 — Balance wheel floats upper-left
  4: {
    sapphireGlass: { x: 0,    y: 0.15, z: 3.6 },
    bezel:         { x: 0.2,  y: 0,    z: 2.4 },
    dialFace:      { x: -0.1, y: 0.05, z: 1.6 },
    dial:          { x: -0.2, y: 0,    z: 1.0 },
    hands:         { x: -0.05,y: 0.05, z: 1.9 },
    gearTrain:     { x: -1.8, y: 0.8,  z: 0.6 },
    balanceWheel:  { x: -2.2, y: 1.4,  z: 1.2 },
  },

  // Ch5 — Bridges & Jewels scatter
  5: {
    sapphireGlass: { x: 1.8,  y: 1.0,  z: 3.8 },
    bezel:         { x: 1.4,  y: 0.6,  z: 2.8 },
    dialFace:      { x: 0.5,  y: 0.4,  z: 2.0 },
    dial:          { x: 0.2,  y: 0.1,  z: 1.4 },
    hands:         { x: 0.4,  y: 0.3,  z: 2.0 },
    gearTrain:     { x: -1.8, y: 0.8,  z: 0.6 },
    balanceWheel:  { x: -2.4, y: 1.6,  z: 1.4 },
    bridges:       { x: 1.6,  y: -1.0, z: 0.8 },
    jewels:        { x: 0.2,  y: 1.8,  z: 1.6 },
  },

  // Ch6 — Full holographic matrix: everything scattered in 3D space
  6: {
    sapphireGlass: { x: 2.2,  y: 1.4,  z: 4.5 },
    bezel:         { x: 1.8,  y: 0.9,  z: 3.2 },
    dialFace:      { x: 0.8,  y: 0.6,  z: 2.6 },
    dial:          { x: 0.4,  y: 0.2,  z: 1.6 },
    hands:         { x: 0.8,  y: 0.5,  z: 2.4 },
    gearTrain:     { x: -2.2, y: 1.0,  z: 0.8 },
    balanceWheel:  { x: -2.8, y: 1.8,  z: 1.8 },
    bridges:       { x: 2.0,  y: -1.4, z: 1.0 },
    jewels:        { x: 0.4,  y: 2.4,  z: 2.0 },
    mainplate:     { x: 0,    y: 0,    z: -0.6 },
    outerCase:     { x: 0,    y: -0.2, z: -1.2 },
    rotor:         { x: 0.4,  y: -0.8, z: -2.0 },
    strap:         { x: 0,    y: -0.6, z: -2.8 },
  },
};

export class WatchModel {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.parts = {};
    this.materials = {};
    this.currentScheme = MATERIAL_SCHEMES[0];
    this.currentChapter = 0;

    // Oscillation state for gentle hero swing
    this.oscillationTime = 0;

    this.gearRotations = { seconds: 0, minutes: 0, hours: 0, balance: 0 };

    this.initMaterials();
    this.buildWatch();
    this.scene.add(this.group);
  }

  initMaterials() {
    const s = this.currentScheme;
    this.materials.case = new THREE.MeshStandardMaterial({ color: s.caseColor, metalness: s.caseMetalness, roughness: s.caseRoughness, envMapIntensity: 3.2 });
    this.materials.bezel = new THREE.MeshStandardMaterial({ color: s.bezelColor, metalness: 0.95, roughness: 0.08, envMapIntensity: 3.5 });
    this.materials.dial = new THREE.MeshStandardMaterial({ color: s.dialColor, metalness: 0.6, roughness: 0.2, envMapIntensity: 2.0 });
    // Solid opaque dial face — deep navy/dark base
    this.materials.dialFace = new THREE.MeshStandardMaterial({ color: 0x0d1420, metalness: 0.4, roughness: 0.35, envMapIntensity: 1.5 });
    this.materials.glass = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.05, roughness: 0.02, transmission: 0.94, thickness: 0.5, transparent: true, opacity: 0.22, ior: 1.77, reflectivity: 0.95 });
    this.materials.plate = new THREE.MeshStandardMaterial({ color: s.plateColor, metalness: 0.9, roughness: 0.18, envMapIntensity: 2.5 });
    this.materials.gear = new THREE.MeshStandardMaterial({ color: s.gearColor, metalness: 0.95, roughness: 0.12, envMapIntensity: 3.0 });
    this.materials.escapement = new THREE.MeshStandardMaterial({ color: 0x556677, metalness: 0.92, roughness: 0.12 });
    this.materials.jewel = new THREE.MeshPhysicalMaterial({ color: s.jewelColor, metalness: 0.1, roughness: 0.08, transmission: 0.88, transparent: true, opacity: 0.95, emissive: s.jewelColor, emissiveIntensity: 0.4 });
    this.materials.lume = new THREE.MeshStandardMaterial({ color: s.lumeColor, emissive: s.lumeColor, emissiveIntensity: 0.9, roughness: 0.12 });
    this.materials.strap = new THREE.MeshStandardMaterial({ color: s.strapColor, metalness: 0.1, roughness: 0.65 });
    this.materials.hairspring = new THREE.LineBasicMaterial({ color: 0x4169e1, linewidth: 2 });
  }

  buildWatch() {
    // Build order: back-to-front, so assembled state looks correct
    this.buildStrap();       // 1. Leather strap with buckle
    this.buildOuterCase();   // 2. Case, lugs, crown
    this.buildMainplate();   // 3. Skeleton mainplate
    this.buildRotor();       // 4. Rotor (BEHIND mainplate, z=-0.55)
    this.buildGearTrain();   // 5. Gear train on mainplate
    this.buildEscapementAndBalance(); // 6. Balance wheel
    this.buildBridges();     // 7. Micro-bridges
    this.buildJewels();      // 8. Ruby jewels
    this.buildDialAndHands(); // 9. Skeleton dial ring + hands
    this.buildDialFace();    // 10. SOLID opaque dial face (sits above ring, below glass)
    this.buildBezelAndGlass(); // 11. Bezel + sapphire glass (topmost)

    // Initial orientation: clean 3/4 front-facing angle
    // Slight upward tilt so you see the face and the rim depth
    this.group.rotation.set(0.38, -0.22, 0.0);
    this.group.position.set(0, 0, 0);
  }

  registerPart(id, meshOrGroup, partMeta) {
    meshOrGroup.userData = {
      partId: id,
      partInfo: partMeta,
      assembled: meshOrGroup.position.clone(),
    };
    this.parts[id] = meshOrGroup;
    this.group.add(meshOrGroup);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 1. Leather Strap with Pin Buckle
  // ─────────────────────────────────────────────────────────────────────────
  buildStrap() {
    const strapGroup = new THREE.Group();

    const makeBand = (yDir, isTop) => {
      const pts = [];
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        const y = yDir * (1.35 + t * (isTop ? 1.6 : 1.0));
        const z = -0.05 - Math.sin(t * Math.PI * 0.45) * 0.55;
        pts.push(new THREE.Vector3(0, y, z));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      const geo = new THREE.TubeGeometry(curve, 20, 0.42, 12, false);
      const mesh = new THREE.Mesh(geo, this.materials.strap);
      mesh.scale.set(1.35, 1, 0.28);
      return mesh;
    };

    strapGroup.add(makeBand(1, true));   // top band
    strapGroup.add(makeBand(-1, false)); // bottom band (shorter — has buckle)

    // ── Pin Buckle at the bottom end ──
    const buckleGroup = new THREE.Group();

    // Outer rectangular frame
    const frameShape = new THREE.Shape();
    frameShape.moveTo(-0.5, -0.12);
    frameShape.lineTo(0.5, -0.12);
    frameShape.lineTo(0.5, 0.12);
    frameShape.lineTo(-0.5, 0.12);
    frameShape.closePath();
    // Cut out inner opening
    const frameHole = new THREE.Path();
    frameHole.moveTo(-0.36, -0.07);
    frameHole.lineTo(0.36, -0.07);
    frameHole.lineTo(0.36, 0.07);
    frameHole.lineTo(-0.36, 0.07);
    frameHole.closePath();
    frameShape.holes.push(frameHole);

    const frameGeo = new THREE.ExtrudeGeometry(frameShape, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01 });
    const frameMesh = new THREE.Mesh(frameGeo, this.materials.case);
    frameMesh.rotation.x = Math.PI / 2;
    buckleGroup.add(frameMesh);

    // Center pin bar
    const pinGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.95, 12);
    const pinMesh = new THREE.Mesh(pinGeo, this.materials.case);
    pinMesh.rotation.z = Math.PI / 2;
    buckleGroup.add(pinMesh);

    // Position buckle at tail end of bottom strap
    buckleGroup.position.set(0, -2.65, -0.32);
    strapGroup.add(buckleGroup);

    this.registerPart('strap', strapGroup, WATCH_PARTS.STRAP);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Outer Case, Lugs, Crown
  // ─────────────────────────────────────────────────────────────────────────
  buildOuterCase() {
    const caseGroup = new THREE.Group();

    // Case barrel (needs rotation to be a vertical ring, not a flat disk!)
    const caseGeo = new THREE.CylinderGeometry(1.45, 1.45, 0.42, 64, 1, true);
    const caseMesh = new THREE.Mesh(caseGeo, this.materials.case);
    caseMesh.rotation.x = Math.PI / 2;
    caseGroup.add(caseMesh);

    // Case back ring
    const backRing = new THREE.Mesh(new THREE.TorusGeometry(1.42, 0.06, 16, 64), this.materials.case);
    backRing.position.z = -0.26; // Pushed back to make room for rotor
    caseGroup.add(backRing);


    // Crown (winding stem)

    // Lugs — 4 elegant curved extensions (re-positioned to perfectly intersect r=1.45 case barrel)
    [[-0.8, 1.15], [0.8, 1.15], [-0.8, -1.15], [0.8, -1.15]].forEach(([lx, ly]) => {
      const shape = new THREE.Shape();
      shape.moveTo(-0.14, 0);
      shape.lineTo(0.14, 0);
      shape.quadraticCurveTo(0.12, 0.28, 0.08, 0.58);
      shape.lineTo(-0.08, 0.58);
      shape.quadraticCurveTo(-0.12, 0.28, -0.14, 0);
      shape.closePath();

      const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.22, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025 });
      const lug = new THREE.Mesh(geo, this.materials.case);
      const isTop = ly > 0;
      lug.position.set(lx, ly, -0.11);
      
      // All lugs tilt backwards towards the wrist
      lug.rotation.x = 0.38; 
      
      if (isTop) {
        // Top lugs point up, splay left/right
        lug.rotation.z = lx > 0 ? -0.12 : 0.12;
      } else {
        // Bottom lugs must be rotated 180deg (Math.PI) to point DOWN instead of UP!
        lug.rotation.z = lx > 0 ? (Math.PI + 0.12) : (Math.PI - 0.12);
      }
      
      caseGroup.add(lug);
    });

    // Crown (winding stem)
    const crownGroup = new THREE.Group();
    const crownGeo = new THREE.CylinderGeometry(0.22, 0.20, 0.32, 32);
    const crownMesh = new THREE.Mesh(crownGeo, this.materials.case);
    crownMesh.rotation.z = Math.PI / 2;
    crownGroup.add(crownMesh);
    // Crown grooves (decorative rings)
    for (let i = 0; i < 5; i++) {
      const grooveGeo = new THREE.TorusGeometry(0.21, 0.018, 8, 32);
      const grooveMesh = new THREE.Mesh(grooveGeo, this.materials.bezel);
      grooveMesh.rotation.y = Math.PI / 2;
      grooveMesh.position.x = -0.08 + i * 0.04;
      crownGroup.add(grooveMesh);
    }
    crownGroup.position.set(1.6, 0, 0);
    caseGroup.add(crownGroup);

    this.registerPart('outerCase', caseGroup, WATCH_PARTS.CASE);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Skeleton Mainplate
  // ─────────────────────────────────────────────────────────────────────────
  buildMainplate() {
    const plateGroup = new THREE.Group();
    const plateShape = new THREE.Shape();
    plateShape.absarc(0, 0, 1.35, 0, Math.PI * 2, false);
    const h1 = new THREE.Path(); h1.absarc(-0.4, 0.35, 0.45, 0, Math.PI * 2, true);
    const h2 = new THREE.Path(); h2.absarc(0.45, -0.3, 0.4, 0, Math.PI * 2, true);
    plateShape.holes.push(h1, h2);
    const geo = new THREE.ExtrudeGeometry(plateShape, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015 });
    const plateMesh = new THREE.Mesh(geo, this.materials.plate);
    plateMesh.position.z = -0.18;
    plateGroup.add(plateMesh);
    this.registerPart('mainplate', plateGroup, WATCH_PARTS.MAINPLATE);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Automatic Winding Rotor
  // Radius 0.88 — stays within case barrel at any tilt angle
  // z = -0.72 — fully behind mainplate, never visible from front
  // ─────────────────────────────────────────────────────────────────────────
  buildRotor() {
    const rotorGroup = new THREE.Group();

    const shape = new THREE.Shape();
    shape.absarc(0, 0, 0.88, 0, Math.PI, false);
    const rh = new THREE.Path();
    rh.absarc(0, 0, 0.30, 0, Math.PI, true);
    shape.holes.push(rh);

    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012 });
    const rotorMesh = new THREE.Mesh(geo, this.materials.gear);
    rotorMesh.position.z = -0.08;
    rotorGroup.add(rotorMesh);

    const weightShape = new THREE.Shape();
    weightShape.absarc(0, 0, 0.85, 0, Math.PI * 0.65, false);
    weightShape.absarc(0, 0, 0.66, Math.PI * 0.65, 0, true);
    weightShape.closePath();
    const weightGeo = new THREE.ExtrudeGeometry(weightShape, { depth: 0.09, bevelEnabled: false });
    const weightMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.98, roughness: 0.05 });
    const weightMesh = new THREE.Mesh(weightGeo, weightMat);
    weightMesh.position.z = -0.06;
    rotorGroup.add(weightMesh);

    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.08, 32), this.materials.case);
    hub.rotation.x = Math.PI / 2;
    hub.position.z = -0.06;
    rotorGroup.add(hub);

    rotorGroup.position.z = -0.23; // Tucked right inside the case back ring, safely behind mainplate
    this.registerPart('rotor', rotorGroup, WATCH_PARTS.ROTOR);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 5. Gear Train
  // ─────────────────────────────────────────────────────────────────────────
  buildGearTrain() {
    const gearGroup = new THREE.Group();

    const createGear = (radius, teeth, thickness = 0.035) => {
      const gearShape = new THREE.Shape();
      const outer = radius, inner = radius * 0.85;
      for (let i = 0; i < teeth; i++) {
        const a1 = (i / teeth) * Math.PI * 2, a2 = ((i + 0.3) / teeth) * Math.PI * 2;
        const a3 = ((i + 0.6) / teeth) * Math.PI * 2, a4 = ((i + 0.9) / teeth) * Math.PI * 2;
        if (i === 0) gearShape.moveTo(Math.cos(a1) * inner, Math.sin(a1) * inner);
        gearShape.lineTo(Math.cos(a2) * outer, Math.sin(a2) * outer);
        gearShape.lineTo(Math.cos(a3) * outer, Math.sin(a3) * outer);
        gearShape.lineTo(Math.cos(a4) * inner, Math.sin(a4) * inner);
      }
      const hole = new THREE.Path();
      hole.absarc(0, 0, radius * 0.3, 0, Math.PI * 2, true);
      gearShape.holes.push(hole);
      return new THREE.Mesh(new THREE.ExtrudeGeometry(gearShape, { depth: thickness, bevelEnabled: false }), this.materials.gear);
    };

    this.mainspringGear = createGear(0.48, 28, 0.05);
    this.mainspringGear.position.set(-0.42, -0.35, -0.09);
    gearGroup.add(this.mainspringGear);

    this.centerGear = createGear(0.36, 20, 0.035);
    this.centerGear.position.set(0, 0, -0.07);
    gearGroup.add(this.centerGear);

    this.thirdGear = createGear(0.28, 16, 0.035);
    this.thirdGear.position.set(0.32, 0.28, -0.05);
    gearGroup.add(this.thirdGear);

    this.fourthGear = createGear(0.22, 14, 0.035);
    this.fourthGear.position.set(-0.28, 0.42, -0.04);
    gearGroup.add(this.fourthGear);

    this.escapeGear = createGear(0.16, 12, 0.035);
    this.escapeGear.position.set(0.1, 0.6, -0.03);
    gearGroup.add(this.escapeGear);

    this.registerPart('gearTrain', gearGroup, WATCH_PARTS.GEAR_TRAIN);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 6. Balance Wheel & Escapement
  // ─────────────────────────────────────────────────────────────────────────
  buildEscapementAndBalance() {
    const escGroup = new THREE.Group();
    const balShape = new THREE.Shape();
    balShape.absarc(0, 0, 0.35, 0, Math.PI * 2, false);
    const bh = new THREE.Path(); bh.absarc(0, 0, 0.28, 0, Math.PI * 2, true);
    balShape.holes.push(bh);
    this.balanceWheelMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(balShape, { depth: 0.03, bevelEnabled: false }), this.materials.gear);
    this.balanceWheelMesh.add(new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.04, 0.03), this.materials.gear));

    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 8), this.materials.lume);
      screw.position.set(Math.cos(angle) * 0.32, Math.sin(angle) * 0.32, 0.015);
      this.balanceWheelMesh.add(screw);
    }

    const curvePoints = [];
    for (let i = 0; i < 100; i++) {
      const t = i / 100, a = t * Math.PI * 2 * 3.5, r = 0.05 + t * 0.2;
      curvePoints.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0.02));
    }
    this.balanceWheelMesh.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curvePoints), this.materials.hairspring));
    this.balanceWheelMesh.position.set(-0.35, 0.3, 0.08);
    escGroup.add(this.balanceWheelMesh);

    const pf = new THREE.Group();
    pf.add(new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.025), this.materials.escapement));
    const rg = new THREE.BoxGeometry(0.04, 0.04, 0.04);
    const r1 = new THREE.Mesh(rg, this.materials.jewel); r1.position.set(-0.08, 0.03, 0);
    const r2 = new THREE.Mesh(rg, this.materials.jewel); r2.position.set(0.08, 0.03, 0);
    pf.add(r1, r2);
    pf.position.set(-0.14, 0.52, 0.06);
    escGroup.add(pf);

    this.registerPart('balanceWheel', escGroup, WATCH_PARTS.BALANCE_WHEEL);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 7. Skeleton Micro-Bridges
  // ─────────────────────────────────────────────────────────────────────────
  buildBridges() {
    const bridgeGroup = new THREE.Group();
    const makeBridge = (points, zPos) => {
      const shape = new THREE.Shape();
      shape.moveTo(...points[0]);
      points.slice(1).forEach(p => shape.lineTo(...p));
      shape.closePath();
      const mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01 }), this.materials.plate);
      mesh.position.z = zPos;
      return mesh;
    };
    bridgeGroup.add(makeBridge([[-0.6, 0.45], [-0.15, 0.45], [-0.25, 0.15], [-0.6, 0.25]], -0.12));
    bridgeGroup.add(makeBridge([[0.15, -0.45], [0.55, -0.2], [0.45, -0.5]], -0.12));

    const screwMat = new THREE.MeshStandardMaterial({ color: 0x1e90ff, metalness: 0.9, roughness: 0.1 });
    [[-0.5, 0.35], [0.45, -0.35]].forEach(([sx, sy]) => {
      const s = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 16), screwMat);
      s.rotation.x = Math.PI / 2;
      s.position.set(sx, sy, -0.09);
      bridgeGroup.add(s);
    });

    this.registerPart('bridges', bridgeGroup, WATCH_PARTS.BRIDGES);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 8. Ruby Jewel Bearings
  // ─────────────────────────────────────────────────────────────────────────
  buildJewels() {
    const jewelGroup = new THREE.Group();
    const geo = new THREE.CylinderGeometry(0.065, 0.065, 0.035, 16);
    [[0, 0, -0.03], [-0.42, -0.35, -0.05], [0.32, 0.28, -0.02], [-0.28, 0.42, 0.01], [-0.35, 0.3, 0.15], [0.1, 0.6, 0.03]].forEach(([jx, jy, jz]) => {
      const j = new THREE.Mesh(geo, this.materials.jewel);
      j.rotation.x = Math.PI / 2;
      j.position.set(jx, jy, jz);
      jewelGroup.add(j);
    });
    this.registerPart('jewels', jewelGroup, WATCH_PARTS.JEWELS);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 9. Skeleton Dial Ring & Hands
  // ─────────────────────────────────────────────────────────────────────────
  buildDialAndHands() {
    const dialGroup = new THREE.Group();
    const ringShape = new THREE.Shape();
    ringShape.absarc(0, 0, 1.35, 0, Math.PI * 2, false);
    const rh = new THREE.Path(); rh.absarc(0, 0, 1.05, 0, Math.PI * 2, true);
    ringShape.holes.push(rh);
    const dialRing = new THREE.Mesh(new THREE.ExtrudeGeometry(ringShape, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008 }), this.materials.dial);
    dialRing.position.z = 0.15;
    dialGroup.add(dialRing);

    // Hour indices on the ring
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const isQ = i % 3 === 0;
      const idx = new THREE.Mesh(new THREE.BoxGeometry(isQ ? 0.06 : 0.035, 0.16, 0.04), this.materials.case);
      idx.position.set(Math.sin(angle) * 1.2, Math.cos(angle) * 1.2, 0.21); // Lifted above dial surface
      idx.rotation.z = -angle;
      dialGroup.add(idx);
    }

    const handsGroup = new THREE.Group();

    // Hour hand
    const hrShape = new THREE.Shape();
    hrShape.moveTo(-0.03, 0); hrShape.lineTo(-0.02, 0.65); hrShape.lineTo(0, 0.8); hrShape.lineTo(0.02, 0.65); hrShape.lineTo(0.03, 0); hrShape.closePath();
    this.hourHandMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(hrShape, { depth: 0.02, bevelEnabled: false }), this.materials.case);
    const hrLume = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.4, 0.025), this.materials.lume);
    hrLume.position.set(0, 0.38, 0.005);
    this.hourHandMesh.add(hrLume);
    this.hourHandMesh.position.z = 0.22;
    handsGroup.add(this.hourHandMesh);

    // Minute hand
    const mnShape = new THREE.Shape();
    mnShape.moveTo(-0.025, 0); mnShape.lineTo(-0.018, 0.95); mnShape.lineTo(0, 1.1); mnShape.lineTo(0.018, 0.95); mnShape.lineTo(0.025, 0); mnShape.closePath();
    this.minHandMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(mnShape, { depth: 0.02, bevelEnabled: false }), this.materials.case);
    const mnLume = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.65, 0.025), this.materials.lume);
    mnLume.position.set(0, 0.55, 0.005);
    this.minHandMesh.add(mnLume);
    this.minHandMesh.position.z = 0.25;
    handsGroup.add(this.minHandMesh);

    // Second hand
    const scShape = new THREE.Shape();
    scShape.moveTo(-0.01, -0.25); scShape.lineTo(0.01, -0.25); scShape.lineTo(0.006, 1.15); scShape.lineTo(-0.006, 1.15); scShape.closePath();
    this.secHandMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(scShape, { depth: 0.012, bevelEnabled: false }), this.materials.lume);
    const counter = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.015, 16), this.materials.case);
    counter.rotation.x = Math.PI / 2;
    counter.position.set(0, -0.15, 0.008);
    this.secHandMesh.add(counter);
    this.secHandMesh.position.z = 0.28;
    handsGroup.add(this.secHandMesh);

    // Center cap
    const capGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.025, 24);
    const cap = new THREE.Mesh(capGeo, this.materials.case);
    cap.rotation.x = Math.PI / 2;
    cap.position.z = 0.3;
    handsGroup.add(cap);

    dialGroup.add(handsGroup);
    this.registerPart('dial', dialGroup, WATCH_PARTS.DIAL);
    this.registerPart('hands', handsGroup, WATCH_PARTS.HANDS);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 10. SOLID Opaque Dial Face (NEW)
  // This covers the skeleton movement at 0%, giving a fully assembled look.
  // It lifts off in Chapter 2 along with the dial ring.
  // ─────────────────────────────────────────────────────────────────────────
  buildDialFace() {
    const dialFaceGroup = new THREE.Group();

    // Main solid disc — sits just below the hands
    const faceGeo = new THREE.CylinderGeometry(1.28, 1.28, 0.03, 64);
    const faceMesh = new THREE.Mesh(faceGeo, this.materials.dialFace);
    faceMesh.rotation.x = Math.PI / 2;
    faceMesh.position.z = 0.13; // just below hands (hands at z=0.22-0.28)
    dialFaceGroup.add(faceMesh);

    // Sunburst texture lines (decorative radial grooves)
    const lineMat = new THREE.LineBasicMaterial({ color: 0x1a2030, transparent: true, opacity: 0.6 });
    for (let i = 0; i < 60; i++) {
      const angle = (i / 60) * Math.PI * 2;
      const pts = [
        new THREE.Vector3(Math.cos(angle) * 0.08, Math.sin(angle) * 0.08, 0.145),
        new THREE.Vector3(Math.cos(angle) * 1.22, Math.sin(angle) * 1.22, 0.145),
      ];
      dialFaceGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
    }

    // Sub-dial circle (small seconds indicator at 6 o'clock position)
    const subShape = new THREE.Shape();
    subShape.absarc(0, -0.72, 0.22, 0, Math.PI * 2, false);
    const subHole = new THREE.Path();
    subHole.absarc(0, -0.72, 0.18, 0, Math.PI * 2, true);
    subShape.holes.push(subHole);
    const subGeo = new THREE.ExtrudeGeometry(subShape, { depth: 0.005, bevelEnabled: false });
    const subDial = new THREE.Mesh(subGeo, new THREE.MeshStandardMaterial({ color: 0x1a2030, metalness: 0.3, roughness: 0.5 }));
    subDial.position.z = 0.145;
    dialFaceGroup.add(subDial);

    // Dial logo text area (raised ridge near 12 o'clock)
    const ridgeGeo = new THREE.BoxGeometry(0.35, 0.04, 0.006);
    const ridgeMesh = new THREE.Mesh(ridgeGeo, this.materials.bezel);
    ridgeMesh.position.set(0, 0.4, 0.155);
    dialFaceGroup.add(ridgeMesh);

    // Register the solid dial face as its own part
    const dialFaceMeta = {
      name: 'Solid Dial Face',
      category: 'Exterior',
      function: 'The decorative face of the watch, hiding the movement and providing a readable surface for the hands and markers.',
      material: 'Lacquered Brass',
      specs: 'Sunburst Finish · Sub-Seconds Indicator'
    };

    this.registerPart('dialFace', dialFaceGroup, dialFaceMeta);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 11. Bezel & Sapphire Crystal Glass
  // ─────────────────────────────────────────────────────────────────────────
  buildBezelAndGlass() {
    const bezelGroup = new THREE.Group();
    const bzShape = new THREE.Shape();
    bzShape.absarc(0, 0, 1.48, 0, Math.PI * 2, false);
    const bzH = new THREE.Path(); bzH.absarc(0, 0, 1.32, 0, Math.PI * 2, true);
    bzShape.holes.push(bzH);
    const bezelMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(bzShape, { depth: 0.16, bevelEnabled: true, bevelThickness: 0.022, bevelSize: 0.022 }), this.materials.bezel);
    bezelMesh.position.z = 0.18;
    bezelGroup.add(bezelMesh);

    for (let i = 0; i < 60; i += 5) {
      const angle = (i / 60) * Math.PI * 2;
      const isMajor = i % 15 === 0;
      const dot = new THREE.Mesh(new THREE.CylinderGeometry(isMajor ? 0.025 : 0.012, isMajor ? 0.025 : 0.012, 0.015, 12), this.materials.lume);
      dot.rotation.x = Math.PI / 2;
      dot.position.set(Math.sin(angle) * 1.4, Math.cos(angle) * 1.4, 0.35);
      bezelGroup.add(dot);
    }
    this.registerPart('bezel', bezelGroup, WATCH_PARTS.BEZEL);

    const glassGroup = new THREE.Group();
    // Main glass disc
    const glassMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.32, 1.32, 0.09, 64), this.materials.glass);
    glassMesh.rotation.x = Math.PI / 2;
    glassMesh.position.z = 0.36;
    glassGroup.add(glassMesh);
    // Domed top surface
    const domeGeo = new THREE.SphereGeometry(1.32, 64, 16, 0, Math.PI * 2, 0, 0.14);
    const domeMesh = new THREE.Mesh(domeGeo, this.materials.glass);
    domeMesh.position.z = 0.36;
    glassGroup.add(domeMesh);

    this.registerPart('sapphireGlass', glassGroup, WATCH_PARTS.SAPPHIRE_GLASS);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CHAPTER ENGINE — Tweens all parts to target positions
  // ─────────────────────────────────────────────────────────────────────────
  explodeToChapter(chapterIndex, duration = 1.6) {
    this.currentChapter = chapterIndex;
    // Note: Parts explosion is now exclusively driven by continuous scroll via `explodeByProgress`.
    // GSAP tweens were removed here so they don't fight the user's scroll position!
  }

  // Manual slider (maps 0..1 across 6 chapters)
  explodeByProgress(progress) {
    const totalChapters = 6;
    const chapterFloat = progress * totalChapters;
    const chapter = Math.min(Math.floor(chapterFloat), totalChapters - 1);
    const chapterProgress = chapterFloat - Math.floor(chapterFloat);

    const startTargets = CHAPTER_TARGETS[chapter] || {};
    const endTargets = CHAPTER_TARGETS[Math.min(chapter + 1, totalChapters)] || {};

    Object.entries(this.parts).forEach(([id, partGroup]) => {
      const assembled = partGroup.userData.assembled;
      const sT = startTargets[id] || { x: 0, y: 0, z: 0 };
      const eT = endTargets[id] || { x: 0, y: 0, z: 0 };

      partGroup.position.set(
        assembled.x + sT.x + (eT.x - sT.x) * chapterProgress,
        assembled.y + sT.y + (eT.y - sT.y) * chapterProgress,
        assembled.z + sT.z + (eT.z - sT.z) * chapterProgress
      );
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // KINEMATIC SIMULATION (called every frame)
  // ─────────────────────────────────────────────────────────────────────────
  updateKinematics(delta) {
    this.gearRotations.balance += delta * 25;
    if (this.balanceWheelMesh) this.balanceWheelMesh.rotation.z = Math.sin(this.gearRotations.balance) * 0.8;
    this.gearRotations.seconds += delta * (Math.PI * 2 / 60);
    if (this.secHandMesh) this.secHandMesh.rotation.z = -this.gearRotations.seconds;
    if (this.escapeGear) this.escapeGear.rotation.z = this.gearRotations.seconds * 6;
    this.gearRotations.minutes += delta * (Math.PI * 2 / 3600);
    if (this.minHandMesh) this.minHandMesh.rotation.z = -this.gearRotations.minutes;
    if (this.centerGear) this.centerGear.rotation.z = this.gearRotations.minutes;
    this.gearRotations.hours += delta * (Math.PI * 2 / 43200);
    if (this.hourHandMesh) this.hourHandMesh.rotation.z = -this.gearRotations.hours;
    if (this.mainspringGear) this.mainspringGear.rotation.z = -this.gearRotations.hours * 0.5;
    if (this.thirdGear) this.thirdGear.rotation.z = this.gearRotations.seconds * 2;
    if (this.fourthGear) this.fourthGear.rotation.z = this.gearRotations.seconds * 4;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MATERIAL SCHEME SWITCHER
  // ─────────────────────────────────────────────────────────────────────────
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
