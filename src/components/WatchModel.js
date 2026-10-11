// Horologia - Chapter-Driven Procedural 3D Mechanical Watch
import * as THREE from 'three';
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
    this.materials.case = new THREE.MeshStandardMaterial({
      color: s.caseColor,
      metalness: s.caseMetalness ?? 0.98,
      roughness: s.caseRoughness ?? 0.14,
      envMapIntensity: 3.2
    });
    this.materials.bezel = new THREE.MeshStandardMaterial({
      color: s.bezelColor,
      metalness: 0.95,
      roughness: 0.08,
      envMapIntensity: 3.5
    });
    this.materials.dial = new THREE.MeshStandardMaterial({
      color: s.dialColor,
      metalness: 0.85,
      roughness: 0.18,
      envMapIntensity: 2.4
    });
    // Solid opaque dial face — matching scheme dial tone with deep metallic sheen
    this.materials.dialFace = new THREE.MeshStandardMaterial({
      color: s.dialColor || 0x0a101d,
      metalness: 0.72,
      roughness: 0.24,
      envMapIntensity: 2.2
    });
    // Authentic PBR Double-Domed Sapphire Crystal with Internal AR Sheen
    this.materials.glass = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.0,
      roughness: 0.01,
      transmission: 0.98,
      thickness: 0.35,
      transparent: true,
      opacity: 1.0,
      ior: 1.77, // Sapphire refractive index
      reflectivity: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.01,
      attenuationColor: new THREE.Color(0xdceeff),
      attenuationDistance: 4.0
    });
    this.materials.plate = new THREE.MeshStandardMaterial({
      color: s.plateColor,
      metalness: 0.95,
      roughness: 0.15,
      envMapIntensity: 2.8
    });
    this.materials.gear = new THREE.MeshStandardMaterial({
      color: s.gearColor,
      metalness: 0.98,
      roughness: 0.12,
      envMapIntensity: 3.2
    });
    this.materials.escapement = new THREE.MeshStandardMaterial({
      color: 0x4d5b6e,
      metalness: 0.92,
      roughness: 0.14
    });
    // Single-Crystal Pigeon-Blood Synthetic Ruby
    this.materials.jewel = new THREE.MeshPhysicalMaterial({
      color: s.jewelColor,
      metalness: 0.04,
      roughness: 0.03,
      transmission: 0.84,
      transparent: true,
      opacity: 0.95,
      ior: 1.76,
      emissive: s.jewelColor,
      emissiveIntensity: 0.28,
      thickness: 0.18
    });
    // 18k Yellow Gold Chatons
    this.materials.chaton = new THREE.MeshStandardMaterial({
      color: 0xdfbe65,
      metalness: 0.96,
      roughness: 0.14,
      envMapIntensity: 3.2
    });
    // Thermally Blued Screws (290°C Oxidation)
    this.materials.bluedScrew = new THREE.MeshStandardMaterial({
      color: 0x1b449c,
      metalness: 0.92,
      roughness: 0.12,
      envMapIntensity: 3.0
    });
    this.materials.lume = new THREE.MeshStandardMaterial({
      color: s.lumeColor,
      emissive: s.lumeColor,
      emissiveIntensity: 1.1,
      roughness: 0.14
    });
    this.materials.strap = new THREE.MeshStandardMaterial({
      color: s.strapColor,
      metalness: 0.12,
      roughness: 0.68
    });
    this.materials.stitch = new THREE.MeshStandardMaterial({
      color: 0xd8cca8,
      metalness: 0.05,
      roughness: 0.85
    });
    this.materials.hairspring = new THREE.LineBasicMaterial({
      color: 0x2255cc,
      linewidth: 2
    });
  }

  createBluedScrew(radius = 0.036, height = 0.022) {
    const group = new THREE.Group();
    const head = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 16), this.materials.bluedScrew);
    head.rotation.x = Math.PI / 2;
    group.add(head);

    const slot = new THREE.Mesh(
      new THREE.BoxGeometry(radius * 1.5, radius * 0.22, height * 0.4),
      new THREE.MeshBasicMaterial({ color: 0x081024 })
    );
    slot.position.z = height * 0.35;
    group.add(slot);
    return group;
  }

  createChatonJewel(chatonRadius = 0.075, jewelRadius = 0.046, height = 0.024) {
    const group = new THREE.Group();
    // 18k gold chaton collar
    const chaton = new THREE.Mesh(
      new THREE.CylinderGeometry(chatonRadius, chatonRadius * 0.95, height, 20),
      this.materials.chaton
    );
    chaton.rotation.x = Math.PI / 2;
    group.add(chaton);

    // Synthetic ruby core
    const ruby = new THREE.Mesh(
      new THREE.CylinderGeometry(jewelRadius, jewelRadius, height * 1.1, 20),
      this.materials.jewel
    );
    ruby.rotation.x = Math.PI / 2;
    group.add(ruby);

    // Precision olive-cut pivot hole
    const pivotHole = new THREE.Mesh(
      new THREE.CylinderGeometry(jewelRadius * 0.32, jewelRadius * 0.32, height * 1.2, 12),
      new THREE.MeshBasicMaterial({ color: 0x111111 })
    );
    pivotHole.rotation.x = Math.PI / 2;
    group.add(pivotHole);

    return group;
  }

  buildWatch() {
    // Build order: back-to-front, so assembled state looks correct
    this.buildStrap();       // 1. Hand-stitched leather strap + deployant clasp
    this.buildOuterCase();   // 2. Case, swept chamfer lugs, fluted crown, exhibition back
    this.buildMainplate();   // 3. Architectural skeleton mainplate
    this.buildRotor();       // 4. Oscillating rotor (behind mainplate)
    this.buildGearTrain();   // 5. Kinematic gear train
    this.buildEscapementAndBalance(); // 6. Balance wheel & escapement
    this.buildBridges();     // 7. Beveled movement bridges & blued screws
    this.buildJewels();      // 8. Ruby jewels countersunk in gold chatons
    this.buildDialAndHands(); // 9. Skeleton dial ring & faceted Dauphine hands
    this.buildDialFace();    // 10. Solid sunburst dial face
    this.buildBezelAndGlass(); // 11. Ceramic bezel & physical sapphire glass

    // Initial orientation: clean 3/4 front-facing angle
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
  // 1. Hand-Stitched Leather Strap & Sculpted Deployant Clasp
  // ─────────────────────────────────────────────────────────────────────────
  buildStrap() {
    const strapGroup = new THREE.Group();

    // Padded leather cross-section: flat underside, arched padded top
    const crossSection = new THREE.Shape();
    crossSection.moveTo(-0.52, -0.04);
    crossSection.lineTo(0.52, -0.04);
    crossSection.quadraticCurveTo(0.36, 0.08, 0, 0.10);
    crossSection.quadraticCurveTo(-0.36, 0.08, -0.52, -0.04);
    crossSection.closePath();

    const makePaddedBand = (isTop) => {
      const bandGroup = new THREE.Group();
      const pts = [];
      const steps = 24;
      const yDir = isTop ? 1 : -1;
      const length = isTop ? 1.15 : 0.95;

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        // Ergonomic oval curvature wrapping gracefully around display stand/wrist
        const y = yDir * (1.35 + Math.sin(t * Math.PI * 0.48) * length);
        const z = -0.06 - (1 - Math.cos(t * Math.PI * 0.48)) * 1.25;
        pts.push(new THREE.Vector3(0, y, z));
      }

      const curve = new THREE.CatmullRomCurve3(pts);
      const geo = new THREE.ExtrudeGeometry(crossSection, {
        extrudePath: curve,
        steps: steps,
        bevelEnabled: false
      });
      const bandMesh = new THREE.Mesh(geo, this.materials.strap);
      bandMesh.castShadow = true;
      bandMesh.receiveShadow = true;
      bandGroup.add(bandMesh);

      // Contrast saddle stitch lines running down both perimeter edges
      [-0.44, 0.44].forEach(xOffset => {
        const stitchPts = pts.map(p => new THREE.Vector3(xOffset, p.y, p.z + 0.05));
        const stitchCurve = new THREE.CatmullRomCurve3(stitchPts);
        const stitchGeo = new THREE.TubeGeometry(stitchCurve, steps * 2, 0.012, 6, false);
        const stitchMesh = new THREE.Mesh(stitchGeo, this.materials.stitch);
        bandGroup.add(stitchMesh);
      });

      return { group: bandGroup, endPt: pts[pts.length - 1] };
    };

    const topBand = makePaddedBand(true);
    const bottomBand = makePaddedBand(false);
    strapGroup.add(topBand.group);
    strapGroup.add(bottomBand.group);

    // Bottom strap keeper loops (fixed & floating)
    [-1.65, -1.95].forEach(yPos => {
      const keeperGeo = new THREE.TorusGeometry(0.54, 0.032, 12, 32);
      const keeperMesh = new THREE.Mesh(keeperGeo, this.materials.strap);
      keeperMesh.scale.set(1.0, 0.28, 1.0);
      keeperMesh.rotation.x = Math.PI / 2;
      keeperMesh.position.set(0, yPos, -0.32);
      strapGroup.add(keeperMesh);
    });

    // ── Sculpted Butterfly Deployant Clasp ──
    const claspGroup = new THREE.Group();

    // Outer clasp cover plate with beveled edges
    const claspShape = new THREE.Shape();
    claspShape.moveTo(-0.46, -0.14);
    claspShape.lineTo(0.46, -0.14);
    claspShape.lineTo(0.46, 0.14);
    claspShape.lineTo(-0.46, 0.14);
    claspShape.closePath();

    const claspGeo = new THREE.ExtrudeGeometry(claspShape, {
      depth: 0.07,
      bevelEnabled: true,
      bevelThickness: 0.018,
      bevelSize: 0.018
    });
    const claspCover = new THREE.Mesh(claspGeo, this.materials.case);
    claspCover.rotation.x = Math.PI / 2;
    claspGroup.add(claspCover);

    // Horologia signature emblem ridge on clasp
    const emblemRidge = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.02, 0.01),
      this.materials.bezel
    );
    emblemRidge.position.set(0, 0.045, 0);
    claspGroup.add(emblemRidge);

    // Dual push-button release triggers (left and right)
    [-0.50, 0.50].forEach(x => {
      const trigger = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.03, 0.10),
        this.materials.case
      );
      trigger.position.set(x, 0, 0);
      claspGroup.add(trigger);
    });

    // Deployant bridge arms
    const armGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.88, 12);
    const armMesh = new THREE.Mesh(armGeo, this.materials.case);
    armMesh.rotation.z = Math.PI / 2;
    armMesh.position.set(0, -0.04, 0);
    claspGroup.add(armMesh);

    claspGroup.position.copy(bottomBand.endPt);
    strapGroup.add(claspGroup);

    this.registerPart('strap', strapGroup, WATCH_PARTS.STRAP);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Haute Horlogerie Case, Swept Chamfer Lugs, Fluted Crown
  // ─────────────────────────────────────────────────────────────────────────
  buildOuterCase() {
    const caseGroup = new THREE.Group();

    // Main 41mm Case Barrel (brushed flank with polished stepped bezel seat)
    const caseGeo = new THREE.CylinderGeometry(1.45, 1.45, 0.44, 64, 1, true);
    const caseMesh = new THREE.Mesh(caseGeo, this.materials.case);
    caseMesh.rotation.x = Math.PI / 2;
    caseMesh.castShadow = true;
    caseMesh.receiveShadow = true;
    caseGroup.add(caseMesh);

    // Polished stepped bezel collar
    const stepCollar = new THREE.Mesh(
      new THREE.CylinderGeometry(1.47, 1.45, 0.06, 64),
      this.materials.case
    );
    stepCollar.rotation.x = Math.PI / 2;
    stepCollar.position.z = 0.12;
    caseGroup.add(stepCollar);

    // Exhibition case back ring (recessed behind mainplate)
    const backRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.42, 0.06, 16, 64),
      this.materials.case
    );
    backRing.position.z = -0.26;
    caseGroup.add(backRing);

    // Exhibition sapphire crystal display caseback
    const exhibitionGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(1.26, 1.26, 0.02, 48),
      this.materials.glass
    );
    exhibitionGlass.rotation.x = Math.PI / 2;
    exhibitionGlass.position.z = -0.27;
    caseGroup.add(exhibitionGlass);

    // ── 4 Ergonomically Swept Lugs with Beveled Chamfers ──
    const makeLug = (isRight, isTop) => {
      const lugShape = new THREE.Shape();
      lugShape.moveTo(-0.16, 0);
      lugShape.lineTo(0.16, 0);
      lugShape.quadraticCurveTo(0.14, 0.32, 0.09, 0.65);
      lugShape.lineTo(-0.09, 0.65);
      lugShape.quadraticCurveTo(-0.14, 0.32, -0.16, 0);
      lugShape.closePath();

      const lugGeo = new THREE.ExtrudeGeometry(lugShape, {
        depth: 0.24,
        bevelEnabled: true,
        bevelThickness: 0.035,
        bevelSize: 0.035
      });
      const lugMesh = new THREE.Mesh(lugGeo, this.materials.case);
      lugMesh.castShadow = true;

      const lx = (isRight ? 1 : -1) * 0.82;
      const ly = (isTop ? 1 : -1) * 1.15;
      lugMesh.position.set(lx, ly, -0.12);

      if (isTop) {
        lugMesh.rotation.x = -0.38;
        lugMesh.rotation.z = isRight ? -0.12 : 0.12;
      } else {
        lugMesh.rotation.x = 0.38;
        lugMesh.rotation.z = isRight ? (Math.PI + 0.12) : (Math.PI - 0.12);
      }

      // Spring-bar screw accent on outer lug flank
      const screwPin = this.createBluedScrew(0.024, 0.015);
      screwPin.position.set(isRight ? 0.16 : -0.16, 0.42, 0.12);
      screwPin.rotation.y = isRight ? Math.PI / 2 : -Math.PI / 2;
      lugMesh.add(screwPin);

      return lugMesh;
    };

    caseGroup.add(makeLug(false, true));  // Top-left
    caseGroup.add(makeLug(true, true));   // Top-right
    caseGroup.add(makeLug(false, false)); // Bottom-left
    caseGroup.add(makeLug(true, false));  // Bottom-right

    // ── Knurled Winding Crown at 3 o'clock ──
    const crownGroup = new THREE.Group();
    const crownBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.20, 0.26, 32),
      this.materials.case
    );
    crownBody.rotation.z = Math.PI / 2;
    crownGroup.add(crownBody);

    // 24 fluted grip teeth
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const fluting = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.015, 0.022),
        this.materials.bezel
      );
      fluting.position.set(0, Math.cos(angle) * 0.21, Math.sin(angle) * 0.21);
      crownGroup.add(fluting);
    }

    // Polished Horologia cabochon emblem cap
    const cabochon = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.4),
      this.materials.bezel
    );
    cabochon.rotation.z = -Math.PI / 2;
    cabochon.position.set(0.13, 0, 0);
    crownGroup.add(cabochon);

    crownGroup.position.set(1.60, 0, 0);
    caseGroup.add(crownGroup);

    this.registerPart('outerCase', caseGroup, WATCH_PARTS.CASE);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Skeleton Mainplate with Anglage Chamfers
  // ─────────────────────────────────────────────────────────────────────────
  buildMainplate() {
    const plateGroup = new THREE.Group();
    const plateShape = new THREE.Shape();
    plateShape.absarc(0, 0, 1.35, 0, Math.PI * 2, false);

    // Non-intersecting skeleton apertures for clean Earcut triangulation
    const hBalance = new THREE.Path();
    hBalance.absarc(-0.35, 0.30, 0.30, 0, Math.PI * 2, true);
    const hBarrel = new THREE.Path();
    hBarrel.absarc(-0.42, -0.35, 0.28, 0, Math.PI * 2, true);
    const hTrain = new THREE.Path();
    hTrain.absarc(0.35, 0.15, 0.26, 0, Math.PI * 2, true);
    const hEscapement = new THREE.Path();
    hEscapement.absarc(0.08, 0.55, 0.14, 0, Math.PI * 2, true);

    plateShape.holes.push(hBalance, hBarrel, hTrain, hEscapement);

    const geo = new THREE.ExtrudeGeometry(plateShape, {
      depth: 0.06,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.015
    });
    const plateMesh = new THREE.Mesh(geo, this.materials.plate);
    plateMesh.position.z = -0.18;
    plateMesh.castShadow = true;
    plateMesh.receiveShadow = true;
    plateGroup.add(plateMesh);

    // Decorative circular perlage graining ring on mainplate rim
    const perlageRing = new THREE.Mesh(
      new THREE.RingGeometry(1.22, 1.32, 48),
      new THREE.MeshStandardMaterial({
        color: 0x9fa8b6,
        metalness: 0.92,
        roughness: 0.28,
        side: THREE.DoubleSide
      })
    );
    perlageRing.position.z = -0.119;
    plateGroup.add(perlageRing);

    this.registerPart('mainplate', plateGroup, WATCH_PARTS.MAINPLATE);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Automatic Winding Rotor with Heavy 22k Segment
  // ─────────────────────────────────────────────────────────────────────────
  buildRotor() {
    const rotorGroup = new THREE.Group();

    // Semi-circular oscillating rotor frame
    const shape = new THREE.Shape();
    shape.absarc(0, 0, 0.88, 0, Math.PI, false);
    const rh = new THREE.Path();
    rh.absarc(0, 0, 0.28, 0, Math.PI, true);
    shape.holes.push(rh);

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.06,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.012
    });
    const rotorMesh = new THREE.Mesh(geo, this.materials.plate);
    rotorMesh.position.z = -0.07;
    rotorGroup.add(rotorMesh);

    // 22k Solid Gold Heavy Outer Segment
    const weightShape = new THREE.Shape();
    weightShape.absarc(0, 0, 0.86, 0, Math.PI, false);
    weightShape.absarc(0, 0, 0.68, Math.PI, 0, true);
    weightShape.closePath();

    const weightGeo = new THREE.ExtrudeGeometry(weightShape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01
    });
    const weightMesh = new THREE.Mesh(weightGeo, this.materials.gear);
    weightMesh.position.z = -0.055;
    rotorGroup.add(weightMesh);

    // Central ball bearing race with 7 micro ceramic bearings
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.07, 32), this.materials.case);
    hub.rotation.x = Math.PI / 2;
    hub.position.z = -0.05;
    rotorGroup.add(hub);

    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const ball = new THREE.Mesh(
        new THREE.SphereGeometry(0.022, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.1, roughness: 0.05 })
      );
      ball.position.set(Math.cos(angle) * 0.13, Math.sin(angle) * 0.13, -0.05);
      rotorGroup.add(ball);
    }

    rotorGroup.position.z = -0.23;
    this.registerPart('rotor', rotorGroup, WATCH_PARTS.ROTOR);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 5. Kinematic Gear Train with Spoked Wheels
  // ─────────────────────────────────────────────────────────────────────────
  buildGearTrain() {
    const gearGroup = new THREE.Group();

    const createSpokedGear = (radius, teeth, thickness = 0.035, spokeCount = 5) => {
      const gearMeshGroup = new THREE.Group();

      // Outer toothed rim
      const gearShape = new THREE.Shape();
      const outer = radius;
      const inner = radius * 0.86;
      for (let i = 0; i < teeth; i++) {
        const a1 = (i / teeth) * Math.PI * 2;
        const a2 = ((i + 0.3) / teeth) * Math.PI * 2;
        const a3 = ((i + 0.6) / teeth) * Math.PI * 2;
        const a4 = ((i + 0.9) / teeth) * Math.PI * 2;
        if (i === 0) gearShape.moveTo(Math.cos(a1) * inner, Math.sin(a1) * inner);
        gearShape.lineTo(Math.cos(a2) * outer, Math.sin(a2) * outer);
        gearShape.lineTo(Math.cos(a3) * outer, Math.sin(a3) * outer);
        gearShape.lineTo(Math.cos(a4) * inner, Math.sin(a4) * inner);
      }
      const hole = new THREE.Path();
      hole.absarc(0, 0, inner * 0.88, 0, Math.PI * 2, true);
      gearShape.holes.push(hole);

      const rimMesh = new THREE.Mesh(
        new THREE.ExtrudeGeometry(gearShape, { depth: thickness, bevelEnabled: false }),
        this.materials.gear
      );
      gearMeshGroup.add(rimMesh);

      // Center arbor hub
      const hubMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(radius * 0.22, radius * 0.22, thickness * 1.3, 16),
        this.materials.gear
      );
      hubMesh.rotation.x = Math.PI / 2;
      hubMesh.position.z = thickness * 0.5;
      gearMeshGroup.add(hubMesh);

      // Crossed spokes
      for (let s = 0; s < spokeCount; s++) {
        const spokeAngle = (s / spokeCount) * Math.PI * 2;
        const spoke = new THREE.Mesh(
          new THREE.BoxGeometry(inner * 0.82, radius * 0.05, thickness * 0.85),
          this.materials.gear
        );
        spoke.rotation.z = spokeAngle;
        spoke.position.set(
          Math.cos(spokeAngle) * (inner * 0.41),
          Math.sin(spokeAngle) * (inner * 0.41),
          thickness * 0.5
        );
        gearMeshGroup.add(spoke);
      }

      return gearMeshGroup;
    };

    // 1. Mainspring Barrel Gear (28 teeth)
    this.mainspringGear = createSpokedGear(0.48, 28, 0.05, 5);
    this.mainspringGear.position.set(-0.42, -0.35, -0.09);
    gearGroup.add(this.mainspringGear);

    // 2. Center Wheel (20 teeth)
    this.centerGear = createSpokedGear(0.36, 20, 0.035, 5);
    this.centerGear.position.set(0, 0, -0.07);
    gearGroup.add(this.centerGear);

    // 3. Third Wheel (16 teeth)
    this.thirdGear = createSpokedGear(0.28, 16, 0.035, 4);
    this.thirdGear.position.set(0.32, 0.28, -0.05);
    gearGroup.add(this.thirdGear);

    // 4. Fourth Wheel (14 teeth)
    this.fourthGear = createSpokedGear(0.22, 14, 0.035, 4);
    this.fourthGear.position.set(-0.28, 0.42, -0.04);
    gearGroup.add(this.fourthGear);

    // 5. Escape Wheel (12 ratchet-form teeth)
    this.escapeGear = createSpokedGear(0.16, 12, 0.035, 3);
    this.escapeGear.position.set(0.1, 0.6, -0.03);
    gearGroup.add(this.escapeGear);

    this.registerPart('gearTrain', gearGroup, WATCH_PARTS.GEAR_TRAIN);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 6. Balance Wheel & Swiss Lever Escapement
  // ─────────────────────────────────────────────────────────────────────────
  buildEscapementAndBalance() {
    const escGroup = new THREE.Group();

    // Variable Inertia Glucydur Balance Wheel
    const balShape = new THREE.Shape();
    balShape.absarc(0, 0, 0.35, 0, Math.PI * 2, false);
    const bh = new THREE.Path();
    bh.absarc(0, 0, 0.28, 0, Math.PI * 2, true);
    balShape.holes.push(bh);

    this.balanceWheelMesh = new THREE.Mesh(
      new THREE.ExtrudeGeometry(balShape, { depth: 0.03, bevelEnabled: false }),
      this.materials.gear
    );
    // Crossed diameter spokes
    this.balanceWheelMesh.add(new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.035, 0.028), this.materials.gear));

    // 4 Gold poising micro-screws along the rim
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.035, 8), this.materials.chaton);
      screw.position.set(Math.cos(angle) * 0.32, Math.sin(angle) * 0.32, 0.015);
      this.balanceWheelMesh.add(screw);
    }

    // Coiled Nivarox Flat Hairspring (Archimedean spiral)
    const curvePoints = [];
    for (let i = 0; i < 110; i++) {
      const t = i / 110;
      const a = t * Math.PI * 2 * 3.6;
      const r = 0.05 + t * 0.20;
      curvePoints.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0.02));
    }
    this.balanceWheelMesh.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(curvePoints),
      this.materials.hairspring
    ));

    // Positioned safely within movement: z = 0.04
    this.balanceWheelMesh.position.set(-0.35, 0.3, 0.04);
    escGroup.add(this.balanceWheelMesh);

    // Swiss Lever Pallet Fork & Ruby Pallets
    const pf = new THREE.Group();
    pf.add(new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.025), this.materials.escapement));

    const palletJewelGeo = new THREE.BoxGeometry(0.035, 0.035, 0.035);
    const r1 = new THREE.Mesh(palletJewelGeo, this.materials.jewel);
    r1.position.set(-0.08, 0.03, 0);
    const r2 = new THREE.Mesh(palletJewelGeo, this.materials.jewel);
    r2.position.set(0.08, 0.03, 0);
    pf.add(r1, r2);

    pf.position.set(-0.14, 0.52, 0.02);
    escGroup.add(pf);
    this.palletForkMesh = pf;

    this.registerPart('balanceWheel', escGroup, WATCH_PARTS.BALANCE_WHEEL);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 7. Architectural Skeleton Movement Bridges & Blued Screws
  // ─────────────────────────────────────────────────────────────────────────
  buildBridges() {
    const bridgeGroup = new THREE.Group();

    // 1. Sculpted Barrel Bridge (arched profile framing mainspring barrel)
    const barrelShape = new THREE.Shape();
    barrelShape.moveTo(-0.68, -0.14);
    barrelShape.quadraticCurveTo(-0.45, -0.09, -0.18, -0.15);
    barrelShape.lineTo(-0.24, -0.52);
    barrelShape.quadraticCurveTo(-0.48, -0.58, -0.68, -0.48);
    barrelShape.closePath();

    const barrelBridge = new THREE.Mesh(
      new THREE.ExtrudeGeometry(barrelShape, {
        depth: 0.032,
        bevelEnabled: true,
        bevelThickness: 0.012,
        bevelSize: 0.012
      }),
      this.materials.plate
    );
    barrelBridge.position.z = -0.12;
    barrelBridge.castShadow = true;
    barrelBridge.receiveShadow = true;
    bridgeGroup.add(barrelBridge);

    // 2. Sculpted Train Bridge (flowing finger bridge spanning center & third wheel)
    const trainShape = new THREE.Shape();
    trainShape.moveTo(0.12, 0.08);
    trainShape.quadraticCurveTo(0.36, 0.12, 0.56, 0.16);
    trainShape.quadraticCurveTo(0.50, 0.35, 0.44, 0.48);
    trainShape.quadraticCurveTo(0.24, 0.38, 0.14, 0.40);
    trainShape.closePath();

    const trainBridge = new THREE.Mesh(
      new THREE.ExtrudeGeometry(trainShape, {
        depth: 0.032,
        bevelEnabled: true,
        bevelThickness: 0.012,
        bevelSize: 0.012
      }),
      this.materials.plate
    );
    trainBridge.position.z = -0.08;
    trainBridge.castShadow = true;
    trainBridge.receiveShadow = true;
    bridgeGroup.add(trainBridge);

    // 3. Cantilevered Balance Cock (graceful arm arching over the balance wheel)
    const cockShape = new THREE.Shape();
    cockShape.moveTo(-0.68, 0.46);
    cockShape.quadraticCurveTo(-0.48, 0.48, -0.28, 0.38);
    cockShape.quadraticCurveTo(-0.25, 0.26, -0.36, 0.22);
    cockShape.quadraticCurveTo(-0.52, 0.24, -0.68, 0.22);
    cockShape.closePath();

    const balanceCock = new THREE.Mesh(
      new THREE.ExtrudeGeometry(cockShape, {
        depth: 0.032,
        bevelEnabled: true,
        bevelThickness: 0.012,
        bevelSize: 0.012
      }),
      this.materials.plate
    );
    balanceCock.position.z = 0.02;
    balanceCock.castShadow = true;
    balanceCock.receiveShadow = true;
    bridgeGroup.add(balanceCock);

    // Incabloc shock-protection setting spring on balance cock
    const incabloc = new THREE.Mesh(
      new THREE.TorusGeometry(0.065, 0.014, 8, 24),
      this.materials.chaton
    );
    incabloc.position.set(-0.35, 0.30, 0.055);
    bridgeGroup.add(incabloc);

    // 4 Blued Steel Screws securing bridges
    [
      [-0.52, -0.22, -0.09],
      [-0.35, -0.48, -0.09],
      [0.44, 0.35, -0.05],
      [-0.52, 0.38, 0.05]
    ].forEach(([sx, sy, sz]) => {
      const screw = this.createBluedScrew(0.034, 0.022);
      screw.position.set(sx, sy, sz);
      bridgeGroup.add(screw);
    });

    this.registerPart('bridges', bridgeGroup, WATCH_PARTS.BRIDGES);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 8. Ruby Jewel Bearings Countersunk in 18k Gold Chatons
  // NO JEWELS POKE THROUGH DIAL (Zombie Red Pimple permanently eradicated)
  // ─────────────────────────────────────────────────────────────────────────
  buildJewels() {
    const jewelGroup = new THREE.Group();

    // 6 Movement Pivot Jewels seated within movement depth (-0.06 <= z <= 0.06)
    const jewelCoordinates = [
      [0, 0, -0.05],          // Center wheel arbor
      [-0.42, -0.35, -0.06],  // Mainspring barrel arbor
      [0.32, 0.28, -0.03],    // Third wheel arbor
      [-0.28, 0.42, -0.02],   // Fourth wheel arbor
      [0.10, 0.60, 0.00],     // Escape wheel arbor
      [-0.35, 0.30, 0.058],   // Balance staff upper jewel (inside Incabloc chaton, z < 0.07!)
    ];

    jewelCoordinates.forEach(([jx, jy, jz]) => {
      const chatonJewel = this.createChatonJewel(0.072, 0.046, 0.024);
      chatonJewel.position.set(jx, jy, jz);
      jewelGroup.add(chatonJewel);

      // Pair of micro blued retention screws flanking each chaton
      const s1 = this.createBluedScrew(0.018, 0.014);
      s1.position.set(jx - 0.08, jy, jz);
      const s2 = this.createBluedScrew(0.018, 0.014);
      s2.position.set(jx + 0.08, jy, jz);
      jewelGroup.add(s1, s2);
    });

    this.registerPart('jewels', jewelGroup, WATCH_PARTS.JEWELS);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 9. Skeleton Dial Ring & Faceted Dauphine Hands
  // ─────────────────────────────────────────────────────────────────────────
  buildDialAndHands() {
    const dialGroup = new THREE.Group();

    // Outer Dial Chapter Ring
    const ringShape = new THREE.Shape();
    ringShape.absarc(0, 0, 1.35, 0, Math.PI * 2, false);
    const rh = new THREE.Path();
    rh.absarc(0, 0, 1.05, 0, Math.PI * 2, true);
    ringShape.holes.push(rh);

    const dialRing = new THREE.Mesh(
      new THREE.ExtrudeGeometry(ringShape, {
        depth: 0.03,
        bevelEnabled: true,
        bevelThickness: 0.008,
        bevelSize: 0.008
      }),
      this.materials.dial
    );
    dialRing.position.z = 0.15;
    dialGroup.add(dialRing);

    // 12 Faceted Applied Hour Markers with Lume Inlay
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const isQuarter = i % 3 === 0;

      const idxGroup = new THREE.Group();
      const markerMesh = new THREE.Mesh(
        new THREE.BoxGeometry(isQuarter ? 0.065 : 0.038, 0.17, 0.04),
        this.materials.case
      );
      idxGroup.add(markerMesh);

      // SuperLumiNova strip
      const lumeStrip = new THREE.Mesh(
        new THREE.BoxGeometry(isQuarter ? 0.035 : 0.018, 0.11, 0.01),
        this.materials.lume
      );
      lumeStrip.position.z = 0.021;
      idxGroup.add(lumeStrip);

      idxGroup.position.set(Math.sin(angle) * 1.20, Math.cos(angle) * 1.20, 0.175);
      idxGroup.rotation.z = -angle;
      dialGroup.add(idxGroup);
    }

    // ── Hands Assembly ──
    const handsGroup = new THREE.Group();

    // Helper: Faceted Dauphine Hand with center spine ridge
    const createDauphineHand = (length, width, zPos) => {
      const handGroup = new THREE.Group();

      const leftShape = new THREE.Shape();
      leftShape.moveTo(0, -0.06);
      leftShape.lineTo(-width * 0.5, 0.15);
      leftShape.lineTo(0, length);
      leftShape.lineTo(0, -0.06);
      leftShape.closePath();

      const rightShape = new THREE.Shape();
      rightShape.moveTo(0, -0.06);
      rightShape.lineTo(width * 0.5, 0.15);
      rightShape.lineTo(0, length);
      rightShape.lineTo(0, -0.06);
      rightShape.closePath();

      const leftFacet = new THREE.Mesh(
        new THREE.ExtrudeGeometry(leftShape, { depth: 0.016, bevelEnabled: false }),
        this.materials.case
      );
      const rightFacet = new THREE.Mesh(
        new THREE.ExtrudeGeometry(rightShape, { depth: 0.016, bevelEnabled: false }),
        this.materials.case
      );
      // Subtle dihedral tilt along center spine for authentic light bounce
      leftFacet.rotation.y = 0.05;
      rightFacet.rotation.y = -0.05;
      handGroup.add(leftFacet, rightFacet);

      // SuperLumiNova inlay canal
      const lume = new THREE.Mesh(
        new THREE.BoxGeometry(width * 0.32, length * 0.55, 0.012),
        this.materials.lume
      );
      lume.position.set(0, length * 0.45, 0.01);
      handGroup.add(lume);

      handGroup.position.z = zPos;
      return handGroup;
    };

    // 1. Hour Hand
    this.hourHandMesh = createDauphineHand(0.72, 0.09, 0.22);
    handsGroup.add(this.hourHandMesh);

    // 2. Minute Hand
    this.minHandMesh = createDauphineHand(1.08, 0.075, 0.25);
    handsGroup.add(this.minHandMesh);

    // 3. Seconds Hand (Slender needle with Horologia crest counterweight)
    const scShape = new THREE.Shape();
    scShape.moveTo(-0.009, -0.28);
    scShape.lineTo(0.009, -0.28);
    scShape.lineTo(0.005, 1.18);
    scShape.lineTo(-0.005, 1.18);
    scShape.closePath();

    this.secHandMesh = new THREE.Mesh(
      new THREE.ExtrudeGeometry(scShape, { depth: 0.012, bevelEnabled: false }),
      this.materials.lume
    );
    const counter = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 0.015, 16),
      this.materials.case
    );
    counter.rotation.x = Math.PI / 2;
    counter.position.set(0, -0.16, 0.008);
    this.secHandMesh.add(counter);
    this.secHandMesh.position.z = 0.28;
    handsGroup.add(this.secHandMesh);

    // Diamond-polished center pinion cap
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.065, 0.035, 24),
      this.materials.case
    );
    cap.rotation.x = Math.PI / 2;
    cap.position.z = 0.30;
    handsGroup.add(cap);

    dialGroup.add(handsGroup);
    this.registerPart('dial', dialGroup, WATCH_PARTS.DIAL);
    this.registerPart('hands', handsGroup, WATCH_PARTS.HANDS);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 10. Solid Sunburst Dial Face (Assembled Exterior)
  // ─────────────────────────────────────────────────────────────────────────
  buildDialFace() {
    const dialFaceGroup = new THREE.Group();

    // Solid dial disc sits at z = 0.13 (just below hands at z = 0.22)
    const faceGeo = new THREE.CylinderGeometry(1.28, 1.28, 0.03, 64);
    const faceMesh = new THREE.Mesh(faceGeo, this.materials.dialFace);
    faceMesh.rotation.x = Math.PI / 2;
    faceMesh.position.z = 0.13;
    dialFaceGroup.add(faceMesh);

    // Sunburst optical lines (60 radial brushed reflections)
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x1f2e46,
      transparent: true,
      opacity: 0.5
    });
    for (let i = 0; i < 60; i++) {
      const angle = (i / 60) * Math.PI * 2;
      const pts = [
        new THREE.Vector3(Math.cos(angle) * 0.08, Math.sin(angle) * 0.08, 0.146),
        new THREE.Vector3(Math.cos(angle) * 1.22, Math.sin(angle) * 1.22, 0.146)
      ];
      dialFaceGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
    }

    // Sub-seconds dial at 6 o'clock (recessed snailing rings)
    const subShape = new THREE.Shape();
    subShape.absarc(0, -0.68, 0.24, 0, Math.PI * 2, false);
    const subHole = new THREE.Path();
    subHole.absarc(0, -0.68, 0.20, 0, Math.PI * 2, true);
    subShape.holes.push(subHole);

    const subDial = new THREE.Mesh(
      new THREE.ExtrudeGeometry(subShape, { depth: 0.006, bevelEnabled: false }),
      this.materials.bezel
    );
    subDial.position.z = 0.146;
    dialFaceGroup.add(subDial);

    // Horologia applied brand plaque at 12 o'clock
    const plaque = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.05, 0.008),
      this.materials.case
    );
    plaque.position.set(0, 0.45, 0.152);
    dialFaceGroup.add(plaque);

    const dialFaceMeta = {
      name: 'Solid Sunburst Dial Face',
      category: 'Exterior',
      function: 'Haute Horlogerie sunburst dial face concealing the internal movement and providing high-legibility time indication.',
      material: 'Lacquered Brass / Applied Gold',
      specs: 'Sunburst Finish · Sub-Seconds Register · Diamond-Polished Plaque'
    };

    this.registerPart('dialFace', dialFaceGroup, dialFaceMeta);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 11. Ceramic Bezel & Physical Domed Sapphire Crystal
  // ─────────────────────────────────────────────────────────────────────────
  buildBezelAndGlass() {
    const bezelGroup = new THREE.Group();

    // Ceramic Bezel Ring with coin-edge outer grip
    const bzShape = new THREE.Shape();
    bzShape.absarc(0, 0, 1.48, 0, Math.PI * 2, false);
    const bzH = new THREE.Path();
    bzH.absarc(0, 0, 1.32, 0, Math.PI * 2, true);
    bzShape.holes.push(bzH);

    const bezelMesh = new THREE.Mesh(
      new THREE.ExtrudeGeometry(bzShape, {
        depth: 0.16,
        bevelEnabled: true,
        bevelThickness: 0.022,
        bevelSize: 0.022
      }),
      this.materials.bezel
    );
    bezelMesh.position.z = 0.18;
    bezelMesh.castShadow = true;
    bezelGroup.add(bezelMesh);

    // Engraved Bezel Markers & 12 o'clock Luminescent Pearl Triangle
    for (let i = 0; i < 60; i += 5) {
      const angle = (i / 60) * Math.PI * 2;
      const isTriangle = i === 0;
      const isMajor = i % 15 === 0;

      if (isTriangle) {
        // Luminescent triangle marker at 12 o'clock
        const triShape = new THREE.Shape();
        triShape.moveTo(-0.04, -0.04);
        triShape.lineTo(0.04, -0.04);
        triShape.lineTo(0, 0.05);
        triShape.closePath();
        const triMesh = new THREE.Mesh(
          new THREE.ExtrudeGeometry(triShape, { depth: 0.015, bevelEnabled: false }),
          this.materials.lume
        );
        triMesh.position.set(0, 1.40, 0.35);
        bezelGroup.add(triMesh);
      } else {
        const dot = new THREE.Mesh(
          new THREE.CylinderGeometry(isMajor ? 0.025 : 0.014, isMajor ? 0.025 : 0.014, 0.015, 12),
          this.materials.lume
        );
        dot.rotation.x = Math.PI / 2;
        dot.position.set(Math.sin(angle) * 1.40, Math.cos(angle) * 1.40, 0.35);
        bezelGroup.add(dot);
      }
    }

    this.registerPart('bezel', bezelGroup, WATCH_PARTS.BEZEL);

    // ── Authentic Physical Sapphire Crystal Glass ──
    const glassGroup = new THREE.Group();

    // Base cylindrical gasket rim
    const glassRim = new THREE.Mesh(
      new THREE.CylinderGeometry(1.32, 1.32, 0.08, 64),
      this.materials.glass
    );
    glassRim.rotation.x = Math.PI / 2;
    glassRim.position.z = 0.36;
    glassGroup.add(glassRim);

    // Double-domed crystal top curvature
    const domeGeo = new THREE.SphereGeometry(1.32, 64, 20, 0, Math.PI * 2, 0, 0.16);
    const domeMesh = new THREE.Mesh(domeGeo, this.materials.glass);
    domeMesh.position.z = 0.36;
    glassGroup.add(domeMesh);

    this.registerPart('sapphireGlass', glassGroup, WATCH_PARTS.SAPPHIRE_GLASS);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CHAPTER ENGINE — Scrubbing parts to target explosion positions
  // ─────────────────────────────────────────────────────────────────────────
  explodeToChapter(chapterIndex, duration = 1.6) {
    this.currentChapter = chapterIndex;
  }

  explodeByProgress(progress) {
    const totalChapters = 6;
    const clampedProgress = Math.max(0, Math.min(1, progress));
    const chapterFloat = clampedProgress * totalChapters;
    let chapter = Math.floor(chapterFloat);
    let chapterProgress = chapterFloat - chapter;

    if (chapter >= totalChapters) {
      chapter = totalChapters - 1;
      chapterProgress = 1.0;
    }

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
  // KINEMATIC SIMULATION (28,800 VPH / 4 Hz Escapement Synchronization)
  // ─────────────────────────────────────────────────────────────────────────
  updateKinematics(delta) {
    // 4 Hz Balance Wheel (28,800 VPH): 8 vibrations per second = 8 * pi radians/sec
    this.gearRotations.balance += delta * (Math.PI * 8);
    const balancePhase = this.gearRotations.balance;
    const balanceSin = Math.sin(balancePhase);

    // Harmonic oscillation of Glucydur balance wheel & hairspring
    if (this.balanceWheelMesh) {
      this.balanceWheelMesh.rotation.z = balanceSin * 0.78;
    }

    // Swiss Lever Pallet Fork snaps between banking pins during center zero-crossings
    if (this.palletForkMesh) {
      this.palletForkMesh.rotation.z = Math.tanh(balanceSin * 6) * 0.14;
    }

    // 8-beats-per-second mechanical stepping for Escape Wheel and Seconds Hand
    // 1 tick = 1 semi-oscillation = pi radians of balance phase (8 ticks / second)
    const totalTicks = balancePhase / Math.PI;
    const discreteTick = Math.floor(totalTicks);
    const tickFraction = totalTicks - discreteTick;
    // Snappy mechanical impulse (first 28% of the tick steps forward, locks for remaining 72%)
    const impulseStep = Math.min(tickFraction / 0.28, 1.0);
    const effectiveTick = discreteTick + impulseStep;

    // Seconds Hand advances at 8 distinct beats per second (60s * 8 ticks/s = 480 ticks/rev)
    const secondsRad = (effectiveTick / (60 * 8)) * (Math.PI * 2);
    if (this.secHandMesh) {
      this.secHandMesh.rotation.z = -secondsRad;
    }

    // 12-tooth escape wheel advances 1/24th revolution (15 degrees) per pallet tick
    if (this.escapeGear) {
      this.escapeGear.rotation.z = effectiveTick * (Math.PI * 2 / 24);
    }

    // Minutes Hand & Center Gear (1 rev per hour)
    this.gearRotations.minutes += delta * (Math.PI * 2 / 3600);
    if (this.minHandMesh) this.minHandMesh.rotation.z = -this.gearRotations.minutes;
    if (this.centerGear) this.centerGear.rotation.z = this.gearRotations.minutes;

    // Hours Hand & Mainspring Barrel (1 rev per 12 hours)
    this.gearRotations.hours += delta * (Math.PI * 2 / 43200);
    if (this.hourHandMesh) this.hourHandMesh.rotation.z = -this.gearRotations.hours;
    if (this.mainspringGear) this.mainspringGear.rotation.z = -this.gearRotations.hours * 0.5;

    // 3rd and 4th gear train ratios coupled to escapement (counter-rotational meshing)
    if (this.thirdGear) this.thirdGear.rotation.z = -secondsRad * 2;
    if (this.fourthGear) this.fourthGear.rotation.z = secondsRad * 4;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MATERIAL SCHEME SWITCHER
  // ─────────────────────────────────────────────────────────────────────────
  applyMaterialScheme(scheme) {
    this.currentScheme = scheme;
    this.materials.case.color.setHex(scheme.caseColor);
    this.materials.case.metalness = scheme.caseMetalness ?? 0.98;
    this.materials.case.roughness = scheme.caseRoughness ?? 0.14;
    this.materials.bezel.color.setHex(scheme.bezelColor);
    this.materials.dial.color.setHex(scheme.dialColor);
    this.materials.dialFace.color.setHex(scheme.dialColor || 0x0a101d);
    this.materials.strap.color.setHex(scheme.strapColor);
    this.materials.gear.color.setHex(scheme.gearColor);
    this.materials.plate.color.setHex(scheme.plateColor);
    this.materials.jewel.color.setHex(scheme.jewelColor);
    this.materials.jewel.emissive.setHex(scheme.jewelColor);
    this.materials.lume.color.setHex(scheme.lumeColor);
    this.materials.lume.emissive.setHex(scheme.lumeColor);
  }
}
