// Horologia - Chapter-Driven Procedural 3D Mechanical Watch
import * as THREE from 'three';
import { WATCH_PARTS, MATERIAL_SCHEMES, CUSTOMIZER_OPTIONS } from '../utils/constants.js';

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
    this.currentConfig = { ...(MATERIAL_SCHEMES[0].config || {
      casing: 'rose-gold',
      dial: 'sunburst-blue',
      lume: 'bgw9',
      bezel: 'ceramic',
      strap: 'alligator-brown'
    }) };
    this.currentChapter = 0;

    // Oscillation state for gentle hero swing
    this.oscillationTime = 0;

    this.gearRotations = { seconds: 0, minutes: 0, hours: 0, balance: 0 };

    this.initMaterials();
    this.buildWatch();
    this.scene.add(this.group);
  }

  createDialTexture(scheme, config) {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    const cx = 1024;
    const cy = 1024;

    // Dial background: rich radial gradient
    const dialColorInt = scheme.dialColor ?? 0x0c1b33;
    const baseColor = new THREE.Color(dialColorInt);
    const centerColor = baseColor.clone().offsetHSL(0, 0.08, 0.14);
    const midColor = baseColor.clone();
    const edgeColor = baseColor.clone().offsetHSL(0, 0.05, -0.06);

    const grad = ctx.createRadialGradient(cx, cy, 60, cx, cy, 1020);
    grad.addColorStop(0, `#${centerColor.getHexString()}`);
    grad.addColorStop(0.38, `#${midColor.getHexString()}`);
    grad.addColorStop(0.75, `#${baseColor.clone().offsetHSL(0, 0, -0.03).getHexString()}`);
    grad.addColorStop(1, `#${edgeColor.getHexString()}`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 2048, 2048);

    // 1. Sunburst radial brushed lines (360 lines)
    ctx.save();
    ctx.translate(cx, cy);
    const lineCount = 360;
    for (let i = 0; i < lineCount; i++) {
      const a = (i / lineCount) * Math.PI * 2;
      const alpha = 0.03 + 0.07 * Math.sin(i * 12);
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 60, Math.sin(a) * 60);
      ctx.lineTo(Math.cos(a) * 980, Math.sin(a) * 980);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Outer Railway Minute Track ("Chemin de fer")
    ctx.strokeStyle = 'rgba(224, 186, 78, 0.85)'; // Luxury warm gold
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 940, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 910, 0, Math.PI * 2);
    ctx.stroke();

    // 60 Minute & Second Ticks
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
      const isFive = (i % 5 === 0);
      const r1 = 910;
      const r2 = isFive ? 950 : 930;

      ctx.strokeStyle = isFive ? 'rgba(245, 215, 120, 0.98)' : 'rgba(215, 180, 80, 0.65)';
      ctx.lineWidth = isFive ? 4.5 : 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
      ctx.stroke();

      // 5-Minute Arabic Micro Numerals
      if (isFive) {
        const num = (i === 0 ? '60' : (i < 10 ? '0' + i : '' + i));
        const rText = 872;
        const tx = cx + Math.cos(a) * rText;
        const ty = cy + Math.sin(a) * rText;
        ctx.save();
        ctx.translate(tx, ty);
        ctx.fillStyle = 'rgba(235, 205, 120, 0.95)';
        ctx.font = '600 24px "Cinzel", "Playfair Display", Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(num, 0, 0);
        ctx.restore();
      }
    }

    // 3. Sub-Seconds Register at 6 o'clock (Petite Seconde)
    const subX = cx;
    const subY = cy + 440;
    const subR = 260;

    // Recessed background circle
    ctx.fillStyle = 'rgba(4, 8, 16, 0.68)';
    ctx.beginPath();
    ctx.arc(subX, subY, subR, 0, Math.PI * 2);
    ctx.fill();

    // Concentric Azuré Snailing
    for (let r = 20; r < subR; r += 12) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(subX, subY, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Sub-dial rim ring
    ctx.strokeStyle = 'rgba(224, 186, 78, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(subX, subY, subR - 5, 0, Math.PI * 2);
    ctx.stroke();

    // Sub-dial ticks & numerals
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const isQuarter = (i % 3 === 0);
      const r1 = subR - 22;
      const r2 = subR - 8;
      ctx.strokeStyle = isQuarter ? 'rgba(245, 215, 120, 0.98)' : 'rgba(215, 180, 80, 0.55)';
      ctx.lineWidth = isQuarter ? 3 : 1.5;
      ctx.beginPath();
      ctx.moveTo(subX + Math.cos(a) * r1, subY + Math.sin(a) * r1);
      ctx.lineTo(subX + Math.cos(a) * r2, subY + Math.sin(a) * r2);
      ctx.stroke();

      if (isQuarter) {
        const secVal = (i * 5 === 0) ? '60' : '' + (i * 5);
        ctx.fillStyle = 'rgba(235, 205, 120, 0.9)';
        ctx.font = '500 18px "Cinzel", Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(secVal, subX + Math.cos(a) * (subR - 40), subY + Math.sin(a) * (subR - 40));
      }
    }

    // 4. Haute Horlogerie Brand Typography
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // "HOROLOGIA"
    ctx.fillStyle = 'rgba(245, 215, 130, 0.98)';
    ctx.font = '700 48px "Cinzel", "Playfair Display", Georgia, serif';
    ctx.fillText('HOROLOGIA', cx, cy - 360);

    // "HAUTE HORLOGERIE"
    ctx.fillStyle = 'rgba(215, 185, 110, 0.88)';
    ctx.font = '500 20px "Cinzel", Georgia, serif';
    ctx.fillText('HAUTE HORLOGERIE', cx, cy - 305);

    // "GENÈVE"
    ctx.fillStyle = 'rgba(195, 165, 95, 0.78)';
    ctx.font = '400 16px "Cinzel", Georgia, serif';
    ctx.fillText('GENÈVE', cx, cy - 265);

    // "CHRONOMÈTRE"
    ctx.fillStyle = 'rgba(225, 195, 120, 0.88)';
    ctx.font = '600 18px "Cinzel", Georgia, serif';
    ctx.fillText('CHRONOMÈTRE', cx, cy + 120);

    // "OFFICIELLEMENT CERTIFIÉ"
    ctx.fillStyle = 'rgba(185, 155, 95, 0.75)';
    ctx.font = '400 13px "Cinzel", Georgia, serif';
    ctx.fillText('OFFICIELLEMENT CERTIFIÉ', cx, cy + 148);

    // "SWISS MADE"
    ctx.fillStyle = 'rgba(205, 175, 110, 0.8)';
    ctx.font = '500 15px "Cinzel", Georgia, serif';
    ctx.fillText('SWISS   •   MADE', cx, cy + 965);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
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
    // Generate ultra-crisp procedural 2048x2048 Haute Horlogerie dial texture
    this.dialTexture = this.createDialTexture(s, this.currentConfig);

    // Solid opaque dial face — textured with high-resolution sunburst & railway minute track
    this.materials.dialFace = new THREE.MeshStandardMaterial({
      map: this.dialTexture,
      metalness: 0.10,
      roughness: 0.35,
      envMapIntensity: 1.8
    });
    // Authentic PBR Double-Domed Sapphire Crystal with Internal AR Sheen
    // roughness: 0.0 + high specular clearcoat ensures dial face is 100% crisp without transmission blur
    this.materials.glass = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.08,
      roughness: 0.0,
      transmission: 0.0,
      reflectivity: 0.90,
      clearcoat: 1.0,
      clearcoatRoughness: 0.0,
      specularColor: new THREE.Color(0xdceeff),
      transparent: true,
      opacity: 0.10,
      depthWrite: false
    });

    // Exhibition Sapphire Crystal Caseback
    this.materials.exhibitionGlass = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.05,
      roughness: 0.02,
      transmission: 0.0,
      reflectivity: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      transparent: true,
      opacity: 0.12,
      depthWrite: false
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
    this.buildEnergyFlowVisualizer(); // 12. Kinetic Energy Transmission Spline Visualizer

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
    // Spans z = -0.26 to z = +0.22 (height 0.48 centered at z = -0.02)
    const caseGeo = new THREE.CylinderGeometry(1.45, 1.45, 0.48, 64, 1, true);
    const caseMesh = new THREE.Mesh(caseGeo, this.materials.case);
    caseMesh.rotation.x = Math.PI / 2;
    caseMesh.position.z = -0.02;
    caseMesh.castShadow = true;
    caseMesh.receiveShadow = true;
    caseGroup.add(caseMesh);

    // Polished stepped bezel collar (hollow ring seat framing the dial)
    const collarShape = new THREE.Shape();
    collarShape.absarc(0, 0, 1.47, 0, Math.PI * 2, false);
    const collarHole = new THREE.Path();
    collarHole.absarc(0, 0, 1.33, 0, Math.PI * 2, true);
    collarShape.holes.push(collarHole);

    const stepCollar = new THREE.Mesh(
      new THREE.ExtrudeGeometry(collarShape, {
        depth: 0.05,
        bevelEnabled: true,
        bevelThickness: 0.008,
        bevelSize: 0.008
      }),
      this.materials.case
    );
    stepCollar.position.z = 0.10;
    caseGroup.add(stepCollar);

    // Exhibition case back ring (recessed behind mainplate)
    const backRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.42, 0.05, 16, 64),
      this.materials.case
    );
    backRing.position.z = -0.26;
    caseGroup.add(backRing);

    // Exhibition sapphire crystal display caseback (strictly behind rotor)
    const exhibitionGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(1.26, 1.26, 0.015, 48),
      this.materials.exhibitionGlass
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
      depth: 0.025,
      bevelEnabled: true,
      bevelThickness: 0.008,
      bevelSize: 0.008
    });
    const rotorMesh = new THREE.Mesh(geo, this.materials.plate);
    rotorMesh.position.z = -0.015;
    rotorGroup.add(rotorMesh);

    // 22k Solid Gold Heavy Outer Segment
    const weightShape = new THREE.Shape();
    weightShape.absarc(0, 0, 0.86, 0, Math.PI, false);
    weightShape.absarc(0, 0, 0.68, Math.PI, 0, true);
    weightShape.closePath();

    const weightGeo = new THREE.ExtrudeGeometry(weightShape, {
      depth: 0.030,
      bevelEnabled: true,
      bevelThickness: 0.006,
      bevelSize: 0.006
    });
    const weightMesh = new THREE.Mesh(weightGeo, this.materials.gear);
    weightMesh.position.z = -0.018;
    rotorGroup.add(weightMesh);

    // Central ball bearing race with 7 micro ceramic bearings
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.035, 32), this.materials.case);
    hub.rotation.x = Math.PI / 2;
    hub.position.z = -0.01;
    rotorGroup.add(hub);

    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const ball = new THREE.Mesh(
        new THREE.SphereGeometry(0.018, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.1, roughness: 0.05 })
      );
      ball.position.set(Math.cos(angle) * 0.13, Math.sin(angle) * 0.13, -0.01);
      rotorGroup.add(ball);
    }

    rotorGroup.position.z = -0.20;
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

    // Outer Dial Chapter Ring / Rehaut
    const ringShape = new THREE.Shape();
    ringShape.absarc(0, 0, 1.34, 0, Math.PI * 2, false);
    const rh = new THREE.Path();
    rh.absarc(0, 0, 1.22, 0, Math.PI * 2, true);
    ringShape.holes.push(rh);

    const dialRing = new THREE.Mesh(
      new THREE.ExtrudeGeometry(ringShape, {
        depth: 0.025,
        bevelEnabled: true,
        bevelThickness: 0.006,
        bevelSize: 0.006
      }),
      this.materials.dial
    );
    dialRing.position.z = 0.13;
    dialGroup.add(dialRing);

    // ── Hands Assembly (Isolated Depth Planes, Zero Z-Fighting) ──
    const handsGroup = new THREE.Group();

    // Helper: Precision Faceted Dauphine Hand with clean lume canal
    const createDauphineHand = (length, width, zPos) => {
      const handGroup = new THREE.Group();

      const bladeShape = new THREE.Shape();
      bladeShape.moveTo(0, -0.07);
      bladeShape.lineTo(-width * 0.5, 0.12);
      bladeShape.lineTo(0, length);
      bladeShape.lineTo(width * 0.5, 0.12);
      bladeShape.lineTo(0, -0.07);
      bladeShape.closePath();

      // Extruded blade with bevel for authentic faceted light reflection
      const bladeMesh = new THREE.Mesh(
        new THREE.ExtrudeGeometry(bladeShape, {
          depth: 0.012,
          bevelEnabled: true,
          bevelThickness: 0.004,
          bevelSize: 0.004,
          bevelSegments: 2
        }),
        this.materials.case
      );
      handGroup.add(bladeMesh);

      // SuperLumiNova inlay canal sitting on top (+0.014 clearance)
      const lumeShape = new THREE.Shape();
      lumeShape.moveTo(0, 0.15);
      lumeShape.lineTo(-width * 0.22, 0.20);
      lumeShape.lineTo(0, length * 0.88);
      lumeShape.lineTo(width * 0.22, 0.20);
      lumeShape.lineTo(0, 0.15);
      lumeShape.closePath();

      const lumeMesh = new THREE.Mesh(
        new THREE.ExtrudeGeometry(lumeShape, { depth: 0.004, bevelEnabled: false }),
        this.materials.lume
      );
      lumeMesh.position.z = 0.014;
      handGroup.add(lumeMesh);

      handGroup.position.z = zPos;
      return handGroup;
    };

    // 1. Hour Hand at z = 0.19
    this.hourHandMesh = createDauphineHand(0.68, 0.075, 0.19);
    handsGroup.add(this.hourHandMesh);

    // 2. Minute Hand at z = 0.23
    this.minHandMesh = createDauphineHand(1.05, 0.060, 0.23);
    handsGroup.add(this.minHandMesh);

    // 3. Seconds Hand (Needle in flame-blued steel/gold with crest counterweight) at z = 0.27
    const secGroup = new THREE.Group();
    const scShape = new THREE.Shape();
    scShape.moveTo(-0.008, -0.26);
    scShape.lineTo(0.008, -0.26);
    scShape.lineTo(0.004, 1.18);
    scShape.lineTo(-0.004, 1.18);
    scShape.closePath();

    this.secHandMesh = new THREE.Mesh(
      new THREE.ExtrudeGeometry(scShape, { depth: 0.008, bevelEnabled: false }),
      this.materials.lume
    );
    secGroup.add(this.secHandMesh);

    // Counterweight disc with hollow center
    const counterShape = new THREE.Shape();
    counterShape.absarc(0, -0.16, 0.055, 0, Math.PI * 2, false);
    const counterHole = new THREE.Path();
    counterHole.absarc(0, -0.16, 0.028, 0, Math.PI * 2, true);
    counterShape.holes.push(counterHole);

    const counterMesh = new THREE.Mesh(
      new THREE.ExtrudeGeometry(counterShape, { depth: 0.009, bevelEnabled: false }),
      this.materials.case
    );
    counterMesh.position.z = 0.001;
    this.secHandMesh.add(counterMesh);

    secGroup.position.z = 0.27;
    handsGroup.add(secGroup);

    // 4. Center Pinion Cap covering arbor at z = 0.30
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.065, 0.025, 32),
      this.materials.case
    );
    cap.rotation.x = Math.PI / 2;
    cap.position.z = 0.30;
    handsGroup.add(cap);

    this.registerPart('dial', dialGroup, WATCH_PARTS.DIAL);
    this.registerPart('hands', handsGroup, WATCH_PARTS.HANDS);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 10. Solid Sunburst Dial Face with Procedural Haute Horlogerie Artwork
  // ─────────────────────────────────────────────────────────────────────────
  buildDialFace() {
    const dialFaceGroup = new THREE.Group();

    // Solid dial plate with ultra-crisp 2048x2048 procedural canvas texture
    const faceGeo = new THREE.CircleGeometry(1.30, 64);
    const faceMesh = new THREE.Mesh(faceGeo, this.materials.dialFace);
    faceMesh.position.z = 0.126;
    dialFaceGroup.add(faceMesh);

    // Subtle brushed bevel backing rim for 3D thickness when exploded
    const backingGeo = new THREE.CylinderGeometry(1.30, 1.30, 0.008, 64);
    const backingMesh = new THREE.Mesh(backingGeo, this.materials.dial);
    backingMesh.rotation.x = Math.PI / 2;
    backingMesh.position.z = 0.110;
    dialFaceGroup.add(backingMesh);

    // 12 Diamond-Cut Applied Hour Markers with SuperLumiNova Inlays
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const isQuarter = (i % 3 === 0);

      const markerGroup = new THREE.Group();
      const markerMesh = new THREE.Mesh(
        new THREE.BoxGeometry(isQuarter ? 0.060 : 0.035, 0.16, 0.022),
        this.materials.case
      );
      markerGroup.add(markerMesh);

      // Lume strip on top of marker (+0.013 clearance)
      const lumeMesh = new THREE.Mesh(
        new THREE.BoxGeometry(isQuarter ? 0.032 : 0.018, 0.11, 0.006),
        this.materials.lume
      );
      lumeMesh.position.z = 0.013;
      markerGroup.add(lumeMesh);

      markerGroup.position.set(Math.sin(angle) * 1.15, Math.cos(angle) * 1.15, 0.138);
      markerGroup.rotation.z = -angle;
      dialFaceGroup.add(markerGroup);
    }

    this.registerPart('dialFace', dialFaceGroup, WATCH_PARTS.DIAL_FACE);
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
    bzH.absarc(0, 0, 1.33, 0, Math.PI * 2, true);
    bzShape.holes.push(bzH);

    const bezelMesh = new THREE.Mesh(
      new THREE.ExtrudeGeometry(bzShape, {
        depth: 0.15,
        bevelEnabled: true,
        bevelThickness: 0.018,
        bevelSize: 0.018
      }),
      this.materials.bezel
    );
    bezelMesh.position.z = 0.18;
    bezelMesh.castShadow = true;
    bezelGroup.add(bezelMesh);

    // Engraved Bezel Markers & 12 o'clock Luminescent Pearl Triangle
    for (let i = 0; i < 60; i += 5) {
      const angle = (i / 60) * Math.PI * 2;
      const isTriangle = (i === 0);
      const isMajor = (i % 15 === 0);

      if (isTriangle) {
        const triShape = new THREE.Shape();
        triShape.moveTo(-0.04, -0.04);
        triShape.lineTo(0.04, -0.04);
        triShape.lineTo(0, 0.05);
        triShape.closePath();
        const triMesh = new THREE.Mesh(
          new THREE.ExtrudeGeometry(triShape, { depth: 0.012, bevelEnabled: false }),
          this.materials.lume
        );
        triMesh.position.set(0, 1.40, 0.34);
        bezelGroup.add(triMesh);
      } else {
        const dot = new THREE.Mesh(
          new THREE.CylinderGeometry(isMajor ? 0.022 : 0.012, isMajor ? 0.022 : 0.012, 0.012, 12),
          this.materials.lume
        );
        dot.rotation.x = Math.PI / 2;
        dot.position.set(Math.sin(angle) * 1.40, Math.cos(angle) * 1.40, 0.34);
        bezelGroup.add(dot);
      }
    }

    this.registerPart('bezel', bezelGroup, WATCH_PARTS.BEZEL);

    // ── Authentic Physical Double-Domed Sapphire Crystal ──
    const glassGroup = new THREE.Group();

    // Pristine curved crystal disc (radius 1.33, thickness 0.024)
    const crystalGeo = new THREE.CylinderGeometry(1.33, 1.33, 0.024, 64);
    const crystalMesh = new THREE.Mesh(crystalGeo, this.materials.glass);
    crystalMesh.rotation.x = Math.PI / 2;
    crystalMesh.position.z = 0.35;
    glassGroup.add(crystalMesh);

    this.registerPart('sapphireGlass', glassGroup, WATCH_PARTS.SAPPHIRE_GLASS);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 12. Kinetic Energy Flow Transmission Spline Visualizer
  // ─────────────────────────────────────────────────────────────────────────
  buildEnergyFlowVisualizer() {
    this.energyFlowGroup = new THREE.Group();
    this.energyFlowGroup.name = 'energyFlowVisualizer';

    // 7 Mechanical Transmission Nodes:
    // 1. Mainspring Barrel: (-0.42, -0.35, -0.06)
    // 2. Center Wheel: (0.00, 0.00, -0.04)
    // 3. Third Wheel: (0.32, 0.28, -0.02)
    // 4. Fourth Wheel: (-0.28, 0.42, 0.00)
    // 5. Escape Wheel: (0.10, 0.60, 0.02)
    // 6. Pallet Fork: (-0.14, 0.52, 0.03)
    // 7. Balance Wheel: (-0.35, 0.30, 0.05)
    this.energyPathPoints = [
      new THREE.Vector3(-0.42, -0.35, -0.06),
      new THREE.Vector3(0.00, 0.00, -0.04),
      new THREE.Vector3(0.32, 0.28, -0.02),
      new THREE.Vector3(-0.28, 0.42, 0.00),
      new THREE.Vector3(0.10, 0.60, 0.02),
      new THREE.Vector3(-0.14, 0.52, 0.03),
      new THREE.Vector3(-0.35, 0.30, 0.05)
    ];

    this.energyFlowCurve = new THREE.CatmullRomCurve3(this.energyPathPoints);
    this.energyFlowCurve.curveType = 'centripetal';

    // Glowing Conduit Tube
    const tubeGeo = new THREE.TubeGeometry(this.energyFlowCurve, 96, 0.014, 8, false);
    this.energyConduitMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.85,
      transparent: true,
      opacity: 0.55,
      roughness: 0.2,
      metalness: 0.6,
      depthWrite: false
    });
    this.energyConduitMesh = new THREE.Mesh(tubeGeo, this.energyConduitMat);
    this.energyFlowGroup.add(this.energyConduitMesh);

    // Node markers at gear pivots
    const nodeGeo = new THREE.SphereGeometry(0.032, 12, 12);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0x67e8f9,
      emissive: 0x38bdf8,
      emissiveIntensity: 1.6,
      metalness: 0.8,
      roughness: 0.15
    });
    this.energyPathPoints.forEach((pt) => {
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.copy(pt);
      this.energyFlowGroup.add(nodeMesh);
    });

    // Instanced Photons travelling along curve
    this.photonCount = 24;
    const photonGeo = new THREE.SphereGeometry(0.022, 12, 12);
    this.photonMat = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      emissive: 0x38bdf8,
      emissiveIntensity: 2.8,
      roughness: 0.1,
      metalness: 0.8
    });
    this.energyPhotons = new THREE.InstancedMesh(photonGeo, this.photonMat, this.photonCount);
    this.energyPhotons.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.energyFlowGroup.add(this.energyPhotons);

    this.photonDummy = new THREE.Object3D();
    this.energyProgress = 0;
    this.isEnergyFlowActive = false;
    this.energyFlowGroup.visible = false;

    this.group.add(this.energyFlowGroup);
  }

  toggleEnergyFlow(forceState = null) {
    this.isEnergyFlowActive = (forceState !== null) ? forceState : !this.isEnergyFlowActive;
    if (this.energyFlowGroup) {
      this.energyFlowGroup.visible = this.isEnergyFlowActive;
    }
    return this.isEnergyFlowActive;
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

    // Gracefully fade energy flow visualizer if watch is exploded
    if (this.energyFlowGroup && this.isEnergyFlowActive && this.energyConduitMat) {
      const fade = Math.max(0, 1 - clampedProgress * 3.5);
      this.energyConduitMat.opacity = 0.55 * fade;
      this.energyFlowGroup.visible = (fade > 0.02);
    }
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

    // Advance photonic pulses along kinetic energy flow spline
    if (this.isEnergyFlowActive && this.energyFlowCurve && this.energyPhotons) {
      this.energyProgress = (this.energyProgress + delta * 0.35) % 1.0;

      for (let i = 0; i < this.photonCount; i++) {
        const t = ((i / this.photonCount) + this.energyProgress) % 1.0;
        this.energyFlowCurve.getPointAt(t, this.photonDummy.position);
        const pulse = 0.8 + 0.35 * Math.sin(t * Math.PI * 6 + this.energyProgress * Math.PI * 4);
        this.photonDummy.scale.set(pulse, pulse, pulse);
        this.photonDummy.updateMatrix();
        this.energyPhotons.setMatrixAt(i, this.photonDummy.matrix);
      }
      this.energyPhotons.instanceMatrix.needsUpdate = true;

      if (this.energyConduitMat) {
        // Synchronized to 4.0 Hz / 28,800 VPH balance wheel harmonic cadence
        this.energyConduitMat.emissiveIntensity = 0.65 + 0.35 * Math.abs(Math.sin(this.gearRotations.balance));
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HAUTE HORLOGERIE ATELIER CUSTOMIZER & MATERIAL SWITCHER
  // ─────────────────────────────────────────────────────────────────────────
  applyMaterialScheme(scheme) {
    this.currentScheme = scheme;
    if (scheme.config) {
      this.currentConfig = { ...scheme.config };
    }
    this.materials.case.color.setHex(scheme.caseColor);
    this.materials.case.metalness = scheme.caseMetalness ?? 0.98;
    this.materials.case.roughness = scheme.caseRoughness ?? 0.14;
    this.materials.bezel.color.setHex(scheme.bezelColor);
    this.materials.dial.color.setHex(scheme.dialColor);

    // Regenerate and bind ultra-crisp dial texture
    if (this.dialTexture) this.dialTexture.dispose();
    this.dialTexture = this.createDialTexture(scheme, this.currentConfig);
    this.materials.dialFace.map = this.dialTexture;
    this.materials.dialFace.color.setHex(0xffffff);
    this.materials.dialFace.metalness = 0.10;
    this.materials.dialFace.roughness = 0.35;
    this.materials.dialFace.needsUpdate = true;

    const isSkeleton = (scheme.config?.dial === 'skeleton');
    this.materials.dialFace.transparent = isSkeleton;
    this.materials.dialFace.opacity = isSkeleton ? 0.18 : 1.0;
    this.materials.dialFace.visible = !isSkeleton;
    this.materials.strap.color.setHex(scheme.strapColor);
    this.materials.gear.color.setHex(scheme.gearColor);
    this.materials.plate.color.setHex(scheme.plateColor);
    this.materials.jewel.color.setHex(scheme.jewelColor);
    this.materials.jewel.emissive.setHex(scheme.jewelColor);
    this.materials.lume.color.setHex(scheme.lumeColor);
    this.materials.lume.emissive.setHex(scheme.lumeColor);
  }

  applyCustomOption(category, optionId) {
    const options = CUSTOMIZER_OPTIONS[category];
    if (!options) return;
    const opt = options.find(o => o.id === optionId);
    if (!opt) return;

    this.currentConfig[category] = optionId;

    if (category === 'casing') {
      this.materials.case.color.setHex(opt.color);
      this.materials.case.metalness = opt.metalness ?? 0.98;
      this.materials.case.roughness = opt.roughness ?? 0.14;

      // Update bezel if matching case
      const currentBezelOpt = CUSTOMIZER_OPTIONS.bezel.find(b => b.id === this.currentConfig.bezel);
      if (currentBezelOpt && currentBezelOpt.matchCase) {
        this.materials.bezel.color.setHex(opt.color);
        this.materials.bezel.metalness = opt.metalness ?? 0.98;
        this.materials.bezel.roughness = 0.08;
      }

      // Update bracelet if matching case
      const currentStrapOpt = CUSTOMIZER_OPTIONS.strap.find(s => s.id === this.currentConfig.strap);
      if (currentStrapOpt && currentStrapOpt.matchCase) {
        this.materials.strap.color.setHex(opt.color);
        this.materials.strap.metalness = opt.metalness ?? 0.95;
        this.materials.strap.roughness = 0.28;
      }
    } else if (category === 'dial') {
      this.materials.dial.color.setHex(opt.color);
      if (this.dialTexture) this.dialTexture.dispose();
      this.dialTexture = this.createDialTexture({ dialColor: opt.color }, this.currentConfig);
      this.materials.dialFace.map = this.dialTexture;
      this.materials.dialFace.color.setHex(0xffffff);
      this.materials.dialFace.metalness = 0.10;
      this.materials.dialFace.roughness = 0.35;
      this.materials.dialFace.needsUpdate = true;

      if (opt.isSkeleton) {
        this.materials.dialFace.transparent = true;
        this.materials.dialFace.opacity = opt.faceOpacity ?? 0.18;
        this.materials.dialFace.visible = false;
      } else {
        this.materials.dialFace.transparent = false;
        this.materials.dialFace.opacity = 1.0;
        this.materials.dialFace.visible = true;
      }
    } else if (category === 'lume') {
      this.materials.lume.color.setHex(opt.color);
      this.materials.lume.emissive.setHex(opt.color);
    } else if (category === 'bezel') {
      if (opt.matchCase) {
        const caseOpt = CUSTOMIZER_OPTIONS.casing.find(c => c.id === this.currentConfig.casing) || CUSTOMIZER_OPTIONS.casing[0];
        this.materials.bezel.color.setHex(caseOpt.color);
        this.materials.bezel.metalness = caseOpt.metalness ?? 0.98;
        this.materials.bezel.roughness = 0.08;
      } else {
        this.materials.bezel.color.setHex(opt.color);
        this.materials.bezel.metalness = opt.metalness ?? 0.40;
        this.materials.bezel.roughness = opt.roughness ?? 0.06;
      }
    } else if (category === 'strap') {
      if (opt.matchCase) {
        const caseOpt = CUSTOMIZER_OPTIONS.casing.find(c => c.id === this.currentConfig.casing) || CUSTOMIZER_OPTIONS.casing[0];
        this.materials.strap.color.setHex(caseOpt.color);
        this.materials.strap.metalness = caseOpt.metalness ?? 0.95;
        this.materials.strap.roughness = 0.28;
      } else {
        this.materials.strap.color.setHex(opt.color);
        this.materials.strap.metalness = opt.metalness ?? 0.08;
        this.materials.strap.roughness = opt.roughness ?? 0.72;
      }
    }
  }

  applyCustomConfig(config) {
    if (!config) return;
    Object.entries(config).forEach(([cat, val]) => {
      this.applyCustomOption(cat, val);
    });
  }

  getWatchSpecifications() {
    const casing = CUSTOMIZER_OPTIONS.casing.find(c => c.id === this.currentConfig.casing) || CUSTOMIZER_OPTIONS.casing[0];
    const dial = CUSTOMIZER_OPTIONS.dial.find(d => d.id === this.currentConfig.dial) || CUSTOMIZER_OPTIONS.dial[0];
    const lume = CUSTOMIZER_OPTIONS.lume.find(l => l.id === this.currentConfig.lume) || CUSTOMIZER_OPTIONS.lume[0];
    const bezel = CUSTOMIZER_OPTIONS.bezel.find(b => b.id === this.currentConfig.bezel) || CUSTOMIZER_OPTIONS.bezel[0];
    const strap = CUSTOMIZER_OPTIONS.strap.find(s => s.id === this.currentConfig.strap) || CUSTOMIZER_OPTIONS.strap[0];

    return {
      referenceNumber: `REF. H-${casing.id.substring(0, 3).toUpperCase()}-${dial.id.substring(0, 3).toUpperCase()}-41`,
      manufacture: 'Horologia Manufacture Genevoise',
      calibre: 'Calibre H-01 In-House Automatic',
      dimensions: '41.0 mm Diameter · 11.4 mm Height · 20.0 mm Lug Width',
      casing: casing.name,
      casingSpecs: casing.specs,
      dial: dial.name,
      dialSpecs: dial.specs,
      lume: lume.name,
      lumeSpecs: lume.specs,
      bezel: bezel.name,
      bezelSpecs: bezel.specs,
      strap: strap.name,
      strapSpecs: strap.specs,
      movementSpecs: {
        frequency: '28,800 VPH (4.0 Hz / 8 Beats per Second)',
        jewels: '27 Single-Crystal Synthetic Rubies in 18k Chatons',
        powerReserve: '72 Hours (Nivaflex Alloy Barrel)',
        escapement: 'Swiss Lever Escapement with Glucydur Variable Inertia Balance',
        hairspring: 'Nivarox Breguet Terminal Curve Overcoil',
        shockAbsorber: 'Dual Incabloc Spring Shock System',
        finishing: 'Anglage Hand-Chamfered Edges, Côtes de Genève, Circular Perlage, 290°C Heat-Blued Screws'
      }
    };
  }
}
