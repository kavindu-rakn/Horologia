// Horologia - Chapter-Driven Procedural 3D Mechanical Watch
import * as THREE from 'three';
import { gsap } from 'gsap';
import { WATCH_PARTS, MATERIAL_SCHEMES } from '../utils/constants.js';

// ── Chapter explosion targets: where each part ends up in each chapter ──
// Each entry: [x, y, z] final position offset from initial assembled position
// Parts not listed for a chapter stay at their assembled position (0,0,0 offset)
const CHAPTER_TARGETS = {
  // Ch0 — Hero: all assembled
  0: {},

  // Ch1 — Sapphire & Bezel: glass and bezel float forward toward camera
  1: {
    sapphireGlass: { x: 0,    y: 0.1,  z: 3.2  },
    bezel:         { x: 0,    y: 0,    z: 2.0  },
  },

  // Ch2 — Dial & Hands: add dial + hands lifting, bezel stays forward
  2: {
    sapphireGlass: { x: 0,    y: 0.15, z: 3.6  },
    bezel:         { x: 0,    y: 0,    z: 2.4  },
    hands:         { x: -0.1, y: 0.1,  z: 1.8  },
    dial:          { x: -0.2, y: 0,    z: 1.2  },
  },

  // Ch3 — Gear Train: gears spread out laterally across the scene
  3: {
    sapphireGlass: { x: 0,    y: 0.15, z: 3.6  },
    bezel:         { x: 0,    y: 0,    z: 2.4  },
    hands:         { x: -0.1, y: 0.1,  z: 1.8  },
    dial:          { x: -0.2, y: 0,    z: 1.2  },
    gearTrain:     { x: -1.2, y: 0.6,  z: 0.4  },
  },

  // Ch4 — Balance Wheel & Escapement: balance wheel floats upper-left
  4: {
    sapphireGlass: { x: 0,    y: 0.15, z: 3.6  },
    bezel:         { x: 0.2,  y: 0,    z: 2.4  },
    hands:         { x: -0.1, y: 0.1,  z: 1.8  },
    dial:          { x: -0.2, y: 0,    z: 1.2  },
    gearTrain:     { x: -1.8, y: 0.8,  z: 0.6  },
    balanceWheel:  { x: -2.2, y: 1.4,  z: 1.2  },
  },

  // Ch5 — Bridges & Jewels: structural layers separate
  5: {
    sapphireGlass: { x: 1.8,  y: 1.0,  z: 3.8  },
    bezel:         { x: 1.4,  y: 0.6,  z: 2.8  },
    hands:         { x: 0.4,  y: 0.3,  z: 2.0  },
    dial:          { x: 0.2,  y: 0.1,  z: 1.4  },
    gearTrain:     { x: -1.8, y: 0.8,  z: 0.6  },
    balanceWheel:  { x: -2.4, y: 1.6,  z: 1.4  },
    bridges:       { x: 1.6,  y: -1.0, z: 0.8  },
    jewels:        { x: 0.2,  y: 1.8,  z: 1.6  },
  },

  // Ch6 — Full Holographic Matrix: everything scattered in 3D space
  6: {
    sapphireGlass: { x: 2.2,  y: 1.4,  z: 4.5  },
    bezel:         { x: 1.8,  y: 0.9,  z: 3.2  },
    hands:         { x: 0.8,  y: 0.5,  z: 2.4  },
    dial:          { x: 0.4,  y: 0.2,  z: 1.6  },
    gearTrain:     { x: -2.2, y: 1.0,  z: 0.8  },
    balanceWheel:  { x: -2.8, y: 1.8,  z: 1.8  },
    bridges:       { x: 2.0,  y: -1.4, z: 1.0  },
    jewels:        { x: 0.4,  y: 2.4,  z: 2.0  },
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

    this.gearRotations = { seconds: 0, minutes: 0, hours: 0, balance: 0 };
    this.autoRotate = true;
    this.autoRotateY = 0;

    this.initMaterials();
    this.buildWatch();
    this.scene.add(this.group);
  }

  initMaterials() {
    const s = this.currentScheme;
    this.materials.case = new THREE.MeshStandardMaterial({ color: s.caseColor, metalness: s.caseMetalness, roughness: s.caseRoughness, envMapIntensity: 3.2 });
    this.materials.bezel = new THREE.MeshStandardMaterial({ color: s.bezelColor, metalness: 0.95, roughness: 0.08, envMapIntensity: 3.5 });
    this.materials.dial = new THREE.MeshStandardMaterial({ color: s.dialColor, metalness: 0.6, roughness: 0.2, envMapIntensity: 2.0 });
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

    // Start with a nice 3/4 angle showing depth
    this.group.rotation.x = 0.42;
    this.group.rotation.y = -0.4;
    this.group.rotation.z = 0.0;

    // Center the watch
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

  // ─── Build Methods ──────────────────────────────────────

  buildStrap() {
    const strapGroup = new THREE.Group();
    const makeBand = (yDir) => {
      const pts = [];
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        const y = yDir * (1.45 + t * 1.7);
        const z = -0.28 - Math.sin(t * Math.PI * 0.5) * 0.7;
        pts.push(new THREE.Vector3(0, y, z));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      const geo = new THREE.TubeGeometry(curve, 20, 0.42, 16, false);
      const mesh = new THREE.Mesh(geo, this.materials.strap);
      mesh.scale.set(1.4, 1, 0.22);
      return mesh;
    };
    strapGroup.add(makeBand(1), makeBand(-1));
    this.registerPart('strap', strapGroup, WATCH_PARTS.STRAP);
  }

  buildOuterCase() {
    const caseGroup = new THREE.Group();
    const caseGeo = new THREE.CylinderGeometry(1.45, 1.45, 0.4, 64, 1, true);
    caseGroup.add(new THREE.Mesh(caseGeo, this.materials.case));

    const backRing = new THREE.Mesh(new THREE.TorusGeometry(1.42, 0.06, 16, 64), this.materials.case);
    backRing.position.z = -0.2;
    caseGroup.add(backRing);

    [[-0.95, 1.42], [0.95, 1.42], [-0.95, -1.42], [0.95, -1.42]].forEach(([lx, ly]) => {
      const shape = new THREE.Shape();
      shape.moveTo(-0.15, 0); shape.lineTo(0.15, 0);
      shape.lineTo(0.1, 0.55); shape.lineTo(-0.1, 0.55);
      shape.closePath();
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03 });
      const lug = new THREE.Mesh(geo, this.materials.case);
      const isTop = ly > 0;
      lug.position.set(lx, ly * 0.9, -0.1);
      lug.rotation.x = isTop ? 0.35 : -0.35;
      lug.rotation.z = lx > 0 ? -0.15 : 0.15;
      if (!isTop) lug.rotation.x *= -1;
      caseGroup.add(lug);
    });

    const crownGroup = new THREE.Group();
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.28, 32), this.materials.case);
    crown.rotation.z = Math.PI / 2;
    crownGroup.add(crown);
    const crest = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.29, 16), this.materials.lume);
    crest.rotation.z = Math.PI / 2;
    crownGroup.add(crest);
    crownGroup.position.set(1.58, 0, 0);
    caseGroup.add(crownGroup);

    this.registerPart('outerCase', caseGroup, WATCH_PARTS.CASE);
  }

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
      const hole = new THREE.Path(); hole.absarc(0, 0, radius * 0.3, 0, Math.PI * 2, true);
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

  buildEscapementAndBalance() {
    const escGroup = new THREE.Group();
    const balShape = new THREE.Shape();
    balShape.absarc(0, 0, 0.35, 0, Math.PI * 2, false);
    const bh = new THREE.Path(); bh.absarc(0, 0, 0.28, 0, Math.PI * 2, true);
    balShape.holes.push(bh);
    this.balanceWheelMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(balShape, { depth: 0.03, bevelEnabled: false }), this.materials.gear);
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.04, 0.03), this.materials.gear);
    this.balanceWheelMesh.add(spoke);

    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 8), this.materials.lume);
      screw.position.set(Math.cos(angle) * 0.32, Math.sin(angle) * 0.32, 0.015);
      this.balanceWheelMesh.add(screw);
    }

    const curvePoints = [];
    for (let i = 0; i < 100; i++) {
      const t = i / 100, angle = t * Math.PI * 2 * 3.5, r = 0.05 + t * 0.2;
      curvePoints.push(new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r, 0.02));
    }
    this.balanceWheelMesh.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curvePoints), this.materials.hairspring));
    this.balanceWheelMesh.position.set(-0.35, 0.3, 0.08);
    escGroup.add(this.balanceWheelMesh);

    const pf = new THREE.Group();
    pf.add(new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.025), this.materials.escapement));
    const rubyGeo = new THREE.BoxGeometry(0.04, 0.04, 0.04);
    const r1 = new THREE.Mesh(rubyGeo, this.materials.jewel); r1.position.set(-0.08, 0.03, 0);
    const r2 = new THREE.Mesh(rubyGeo, this.materials.jewel); r2.position.set(0.08, 0.03, 0);
    pf.add(r1, r2);
    pf.position.set(-0.14, 0.52, 0.06);
    escGroup.add(pf);

    this.registerPart('balanceWheel', escGroup, WATCH_PARTS.BALANCE_WHEEL);
  }

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

  buildRotor() {
    const rotorGroup = new THREE.Group();
    const shape = new THREE.Shape();
    shape.absarc(0, 0, 1.2, 0, Math.PI, false);
    const rh = new THREE.Path(); rh.absarc(0, 0, 0.35, 0, Math.PI, true);
    shape.holes.push(rh);
    const rotorMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01 }), this.materials.gear);
    rotorMesh.position.z = -0.1;
    rotorGroup.add(rotorMesh);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.07, 32), this.materials.case);
    hub.rotation.x = Math.PI / 2;
    hub.position.z = -0.08;
    rotorGroup.add(hub);
    rotorGroup.position.z = -0.55; // Safe: behind mainplate
    this.registerPart('rotor', rotorGroup, WATCH_PARTS.ROTOR);
  }

  buildDialAndHands() {
    const dialGroup = new THREE.Group();
    const ringShape = new THREE.Shape();
    ringShape.absarc(0, 0, 1.35, 0, Math.PI * 2, false);
    const rh = new THREE.Path(); rh.absarc(0, 0, 1.05, 0, Math.PI * 2, true);
    ringShape.holes.push(rh);
    const dialRing = new THREE.Mesh(new THREE.ExtrudeGeometry(ringShape, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008 }), this.materials.dial);
    dialRing.position.z = 0.15;
    dialGroup.add(dialRing);

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const isQ = i % 3 === 0;
      const idx = new THREE.Mesh(new THREE.BoxGeometry(isQ ? 0.05 : 0.03, 0.14, 0.025), this.materials.case);
      idx.position.set(Math.sin(angle) * 1.2, Math.cos(angle) * 1.2, 0.17);
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

    dialGroup.add(handsGroup);
    this.registerPart('dial', dialGroup, WATCH_PARTS.DIAL);
    this.registerPart('hands', handsGroup, WATCH_PARTS.HANDS);
  }

  buildBezelAndGlass() {
    const bezelGroup = new THREE.Group();
    const bzShape = new THREE.Shape();
    bzShape.absarc(0, 0, 1.48, 0, Math.PI * 2, false);
    const bzH = new THREE.Path(); bzH.absarc(0, 0, 1.32, 0, Math.PI * 2, true);
    bzShape.holes.push(bzH);
    const bezelMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(bzShape, { depth: 0.15, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02 }), this.materials.bezel);
    bezelMesh.position.z = 0.18;
    bezelGroup.add(bezelMesh);

    for (let i = 0; i < 60; i += 5) {
      const angle = (i / 60) * Math.PI * 2;
      const isMajor = i % 15 === 0;
      const dot = new THREE.Mesh(new THREE.CylinderGeometry(isMajor ? 0.025 : 0.012, isMajor ? 0.025 : 0.012, 0.015, 12), this.materials.lume);
      dot.rotation.x = Math.PI / 2;
      dot.position.set(Math.sin(angle) * 1.4, Math.cos(angle) * 1.4, 0.34);
      bezelGroup.add(dot);
    }
    this.registerPart('bezel', bezelGroup, WATCH_PARTS.BEZEL);

    const glassGroup = new THREE.Group();
    const glassMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.32, 1.32, 0.08, 64), this.materials.glass);
    glassMesh.rotation.x = Math.PI / 2;
    glassMesh.position.z = 0.35;
    glassGroup.add(glassMesh);
    this.registerPart('sapphireGlass', glassGroup, WATCH_PARTS.SAPPHIRE_GLASS);
  }

  // ─────────────────────────────────────────────────────────────────
  // CHAPTER-DRIVEN EXPLOSION ENGINE
  // Called when entering a chapter. Smoothly tweens each part to
  // its target position for that chapter.
  // ─────────────────────────────────────────────────────────────────
  explodeToChapter(chapterIndex, duration = 1.6) {
    this.currentChapter = chapterIndex;
    const targets = CHAPTER_TARGETS[chapterIndex] || {};

    Object.entries(this.parts).forEach(([id, partGroup]) => {
      const assembled = partGroup.userData.assembled;
      const target = targets[id];

      const tx = assembled.x + (target ? target.x : 0);
      const ty = assembled.y + (target ? target.y : 0);
      const tz = assembled.z + (target ? target.z : 0);

      gsap.to(partGroup.position, {
        x: tx, y: ty, z: tz,
        duration,
        ease: 'power2.inOut',
        overwrite: 'auto'
      });
    });
  }

  // Manual slider control (0..1 maps across all 6 chapters)
  explodeByProgress(progress) {
    // Map 0..1 to 0..6 chapters
    const totalChapters = 6;
    const chapterFloat = progress * totalChapters;
    const chapter = Math.min(Math.floor(chapterFloat), totalChapters);
    const chapterProgress = chapterFloat - Math.floor(chapterFloat);

    const startTargets = CHAPTER_TARGETS[chapter] || {};
    const endTargets = CHAPTER_TARGETS[Math.min(chapter + 1, totalChapters)] || {};

    Object.entries(this.parts).forEach(([id, partGroup]) => {
      const assembled = partGroup.userData.assembled;

      const sTarget = startTargets[id] || { x: 0, y: 0, z: 0 };
      const eTarget = endTargets[id] || { x: 0, y: 0, z: 0 };

      const tx = assembled.x + sTarget.x + (eTarget.x - sTarget.x) * chapterProgress;
      const ty = assembled.y + sTarget.y + (eTarget.y - sTarget.y) * chapterProgress;
      const tz = assembled.z + sTarget.z + (eTarget.z - sTarget.z) * chapterProgress;

      partGroup.position.set(tx, ty, tz);
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // KINEMATIC SIMULATION
  // ─────────────────────────────────────────────────────────────────
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
