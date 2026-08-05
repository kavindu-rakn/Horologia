// Horologia - Mechanical Watch Constants & Presets

export const WATCH_PARTS = {
  SAPPHIRE_GLASS: {
    id: 'sapphireGlass',
    name: 'Domed Sapphire Crystal',
    category: 'Exterior',
    material: 'Synthetic Corundum (Al₂O₃)',
    hardness: '9 Mohs Scale (Scratch-Proof)',
    function: 'Protects the internal dial assembly with anti-reflective double-domed coating.',
    specs: 'Thickness: 1.8mm | AR Coating: Dual-sided internal blue anti-reflective'
  },
  BEZEL: {
    id: 'bezel',
    name: 'Ceramic Rotating Bezel',
    category: 'Exterior',
    material: 'Zirconium Oxide Ceramic (ZrO₂)',
    hardness: '1,500 HV Vickers',
    function: 'Bi-directional rotatable ring with laser-etched tachymeter markings.',
    specs: 'Ratchet Teeth: 120 clicks | Finish: Mirror-polished bevels'
  },
  CASE: {
    id: 'outerCase',
    name: 'Haute Horlogerie Case & Lugs',
    category: 'Exterior',
    material: 'Grade 5 Titanium / 18k Rose Gold',
    function: 'Water-resistant chassis housing the mechanical movement.',
    specs: 'Diameter: 41mm | Water Resistance: 100m / 10 ATM'
  },
  CROWN: {
    id: 'crown',
    name: 'Winding Crown & Stem',
    category: 'Exterior',
    material: 'Matching Case Alloy',
    function: 'Manual winding of the mainspring barrel and precise time setting.',
    specs: 'Triple-lock gasket system | Knurled high-grip teeth'
  },
  DIAL: {
    id: 'dial',
    name: 'Skeletonized Engine Dial',
    category: 'Face & Hands',
    material: 'PVD Coated Brass Ring with Applied Indices',
    function: 'Frame for hour markers revealing the balance wheel and gear train beneath.',
    specs: 'Thickness: 0.4mm | Surface: Sunburst brush with laser cutouts'
  },
  HANDS: {
    id: 'hands',
    name: 'Luminescent Hands Assembly',
    category: 'Face & Hands',
    material: 'Blued Steel / Rose Gold with Super-LumiNova',
    function: 'Precision time indication driven by hour, minute, and second pinions.',
    specs: 'Lume: Swiss Super-LumiNova BGW9 / C3 | Counterweight: Horologia Crest'
  },
  MAINPLATE: {
    id: 'mainplate',
    name: 'Skeleton Mainplate',
    category: 'Movement Chassis',
    material: 'Rhodium-Plated German Silver',
    function: 'The foundation chassis supporting all gear arbors, jewels, and bridges.',
    specs: 'Decoration: Perlage & Anglage hand-chamfered edges'
  },
  BRIDGES: {
    id: 'bridges',
    name: 'Architectural Movement Bridges',
    category: 'Movement Chassis',
    material: 'Brushed German Silver',
    function: 'Secures gear pivots in place with micro-torqued blued steel screws.',
    specs: 'Screws: Heat-blued at 290°C | Engraving: 28,800 VPH'
  },
  MAINSPRING: {
    id: 'mainspring',
    name: 'Mainspring Barrel Assembly',
    category: 'Power Reserve',
    material: 'Nivaflex Elastic Alloy Barrel',
    function: 'Stores mechanical energy derived from automatic rotor motion or crown winding.',
    specs: 'Power Reserve: 72 Hours | Torque: 8.5 N·mm'
  },
  GEAR_TRAIN: {
    id: 'gearTrain',
    name: 'Horological Gear Train',
    category: 'Kinematics',
    material: '24k Gold-Plated Brass & Hardened Steel Arbors',
    function: 'Transfers rotational power from mainspring barrel to escapement wheel at precise gear ratios.',
    specs: 'Gear Ratios: Center (1:1), 3rd (1:7.5), 4th (1:60 - Seconds wheel)'
  },
  ESCAPEMENT: {
    id: 'escapement',
    name: 'Swiss Lever Escapement',
    category: 'Oscillator',
    material: 'Hardened Silicon (Si) & Synthetic Ruby Pallets',
    function: 'Converts rotary gear train motion into precise impulses that drive the balance wheel.',
    specs: 'Friction: Ultra-low friction silicon pallet teeth | Impulse Angle: 52°'
  },
  BALANCE_WHEEL: {
    id: 'balanceWheel',
    name: 'Variable Inertia Balance Wheel',
    category: 'Oscillator',
    material: 'Glucydur Alloy with Gold Poising Screws',
    function: 'The heartbeat of the watch. Oscillates back and forth to regulate timekeeping precision.',
    specs: 'Frequency: 4Hz (28,800 Vibrations Per Hour) | Hairspring: Breguet Overcoil'
  },
  TOURBILLON: {
    id: 'tourbillon',
    name: 'Flying Tourbillon Cage',
    category: 'Complication',
    material: 'Titanium Grade 5 Cage (Weight: 0.28 grams)',
    function: 'Rotates 360° every 60 seconds to negate gravitational errors on the balance spring.',
    specs: 'Components: 67 individual micro-parts | Rotation: 1 RPM'
  },
  ROTOR: {
    id: 'rotor',
    name: 'Automatic Winding Rotor',
    category: 'Power Reserve',
    material: 'Heavy 22k Solid Gold Outer Segment',
    function: 'Bi-directional rotor that winds mainspring via kinetic wrist movement.',
    specs: 'Bearing: Ceramic micro-ball bearings | Efficiency: Bidirectional magic-lever'
  },
  JEWELS: {
    id: 'jewels',
    name: 'Synthetic Ruby Bearings',
    category: 'Friction Reduction',
    material: 'Single-Crystal Synthetic Ruby (Al₂O₃ + Cr)',
    function: 'Ultra-hard jewel bearings that prevent gear arbor friction and wear.',
    specs: 'Count: 27 Rubies | Friction Coefficient: 0.015 (Lubricated)'
  },
  STRAP: {
    id: 'strap',
    name: 'Hand-Stitched Strap & Clasp',
    category: 'Exterior',
    material: 'Genuine Alligator Leather / Titanium Mesh',
    function: 'Secures watch comfortably with quick-release spring bars and deployant clasp.',
    specs: 'Width: 20mm tapering to 18mm | Buckle: Dual push-button deployant'
  }
};

export const MATERIAL_SCHEMES = [
  {
    id: 'rose-gold-haute',
    name: 'Rose Gold Haute',
    tagline: '18k Warm Rose Gold & Royal Sapphire',
    caseColor: 0xe09f67,
    caseMetalness: 0.9,
    caseRoughness: 0.2,
    dialColor: 0x0a192f,
    bezelColor: 0x050d1a,
    strapColor: 0x3d2314,
    jewelColor: 0xe6194b,
    lumeColor: 0x00f5d4,
    gearColor: 0xf4d03f,
    plateColor: 0xc0c0c0
  },
  {
    id: 'obsidian-stealth',
    name: 'Obsidian PVD Stealth',
    tagline: 'Matte Carbon Black & Crimson Red',
    caseColor: 0x1f242d,
    caseMetalness: 0.7,
    caseRoughness: 0.35,
    dialColor: 0x0d0f12,
    bezelColor: 0x12151a,
    strapColor: 0x1a1a1a,
    jewelColor: 0xff0055,
    lumeColor: 0xff3366,
    gearColor: 0xd4af37,
    plateColor: 0x2c3540
  },
  {
    id: 'ice-platinum',
    name: 'Ice Platinum & Cyan',
    tagline: 'Polished Platinum & Polar Cyan Glare',
    caseColor: 0xe5e9f0,
    caseMetalness: 0.95,
    caseRoughness: 0.12,
    dialColor: 0x0f2027,
    bezelColor: 0x203a43,
    strapColor: 0x1a2a3a,
    jewelColor: 0x00d2ff,
    lumeColor: 0x00f2fe,
    gearColor: 0xf5af19,
    plateColor: 0xd0d8e0
  },
  {
    id: 'emerald-sovereign',
    name: 'Emerald Sovereign',
    tagline: 'Brushed Yellow Gold & Imperial Emerald',
    caseColor: 0xd4af37,
    caseMetalness: 0.88,
    caseRoughness: 0.25,
    dialColor: 0x062c1b,
    bezelColor: 0x03170e,
    strapColor: 0x122416,
    jewelColor: 0x2ecc71,
    lumeColor: 0x55ff99,
    gearColor: 0xf1c40f,
    plateColor: 0xbdc3c7
  },
  {
    id: 'titanium-futura',
    name: 'Titanium Futura',
    tagline: 'Micro-blasted Grade 5 Titanium & Cobalt',
    caseColor: 0x8a95a5,
    caseMetalness: 0.6,
    caseRoughness: 0.45,
    dialColor: 0x182026,
    bezelColor: 0x243038,
    strapColor: 0x2d3b45,
    jewelColor: 0x9b59b6,
    lumeColor: 0x3498db,
    gearColor: 0xe67e22,
    plateColor: 0x4a5568
  }
];

export const DEMO_COMMUNITY_DESIGNS = [
  {
    id: 'demo-1',
    title: 'Grand Complication 1845',
    creator: 'Philippe_Watchmaker',
    likes: 428,
    schemeId: 'rose-gold-haute',
    timestamp: '2 hours ago',
    description: 'Classic 18k Rose Gold casing with deep royal sapphire skeleton dial and ruby jewel pivots.'
  },
  {
    id: 'demo-2',
    title: 'Cyber Chrono 2099',
    creator: 'VibeCoder_Zero',
    likes: 312,
    schemeId: 'obsidian-stealth',
    timestamp: '5 hours ago',
    description: 'Black PVD titanium body with Crimson luminescent hands built for nighttime endurance.'
  },
  {
    id: 'demo-3',
    title: 'Polar Zenith Tourbillon',
    creator: 'Elena_Horology',
    likes: 289,
    schemeId: 'ice-platinum',
    timestamp: '1 day ago',
    description: 'Pure platinum polish paired with glacier cyan inner dials and sapphire crystal pivots.'
  }
];
