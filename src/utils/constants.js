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

export const CUSTOMIZER_OPTIONS = {
  casing: [
    {
      id: 'rose-gold',
      name: '18k 5N Rose Gold',
      subtitle: 'Warm 75% noble gold alloy with copper & silver',
      color: 0xdf9a68,
      metalness: 0.98,
      roughness: 0.14,
      specs: 'Density: 15.5 g/cm³ | Vickers: 160 HV'
    },
    {
      id: 'platinum',
      name: '950 Platinum',
      subtitle: 'High-density pure silvery white noble metal',
      color: 0xeef2f7,
      metalness: 1.0,
      roughness: 0.08,
      specs: 'Density: 21.4 g/cm³ | Vickers: 220 HV'
    },
    {
      id: 'titanium',
      name: 'Grade 5 Titanium',
      subtitle: 'Ultra-lightweight micro-blasted aerospace alloy',
      color: 0x929eaf,
      metalness: 0.85,
      roughness: 0.28,
      specs: 'Ti-6Al-4V | Vickers: 350 HV | Featherlight'
    },
    {
      id: 'obsidian',
      name: 'Obsidian PVD Carbon',
      subtitle: 'Diamond-like carbon physical vapor deposition',
      color: 0x181a20,
      metalness: 0.92,
      roughness: 0.22,
      specs: 'Coating: 3.5µm DLC | Vickers: 3,000 HV'
    },
    {
      id: 'yellow-gold',
      name: '18k 3N Yellow Gold',
      subtitle: 'Regal mirror-polished classic manufacture gold',
      color: 0xd8b240,
      metalness: 0.96,
      roughness: 0.16,
      specs: 'Density: 15.3 g/cm³ | Vickers: 150 HV'
    }
  ],
  dial: [
    {
      id: 'skeleton',
      name: 'Open-worked Skeleton',
      subtitle: 'Architectural apertures revealing mechanical caliber',
      color: 0x0c1b33,
      faceOpacity: 0.18,
      isSkeleton: true,
      specs: 'Hand-beveled anglage cutouts'
    },
    {
      id: 'sunburst-blue',
      name: 'Royal Sunburst Blue',
      subtitle: '60-ray galvanic sunray brushed maritime lacquer',
      color: 0x0c1b33,
      faceOpacity: 1.0,
      isSkeleton: false,
      specs: 'Galvanic Blue Lacquer | Azuré Sub-dial'
    },
    {
      id: 'racing-green',
      name: 'British Racing Green',
      subtitle: 'Deep imperial sunburst emerald finish',
      color: 0x083321,
      faceOpacity: 1.0,
      isSkeleton: false,
      specs: 'Translucent Emerald Enamel'
    },
    {
      id: 'enamel-black',
      name: 'Grand Feu Enamel Black',
      subtitle: 'Traditional 800°C oven-fired vitreous enamel',
      color: 0x0c0e12,
      faceOpacity: 1.0,
      isSkeleton: false,
      specs: 'Grand Feu Vitreous Enamel'
    },
    {
      id: 'frosted-silver',
      name: 'Frosted Rhodium Silver',
      subtitle: 'Micro-bead blasted German silver plate',
      color: 0xdadfe6,
      faceOpacity: 1.0,
      isSkeleton: false,
      specs: 'Rhodium Electroplated Graining'
    }
  ],
  lume: [
    {
      id: 'bgw9',
      name: 'Super-LumiNova BGW9',
      subtitle: 'Crisp glacial cyan glow (long emission duration)',
      color: 0x00f5d4,
      specs: 'Day: White | Night: Glacial Cyan'
    },
    {
      id: 'c3',
      name: 'Super-LumiNova C3',
      subtitle: 'Peak relative brightness vivid green emission',
      color: 0x44ff99,
      specs: 'Day: Light Green | Night: Vivid Emerald'
    },
    {
      id: 'crimson',
      name: 'Crimson Nightfall',
      subtitle: 'Deep tactical ruby luminescence for stealth',
      color: 0xff2a5f,
      specs: 'Day: Crimson | Night: Phosphor Red'
    },
    {
      id: 'gilt',
      name: 'Old Radium Gilt',
      subtitle: 'Warm vintage golden amber luminescence',
      color: 0xf5a623,
      specs: 'Day: Warm Amber | Night: Golden Glare'
    }
  ],
  bezel: [
    {
      id: 'ceramic',
      name: 'Zirconia Ceramic (ZrO₂)',
      subtitle: '1,500 HV scratch-proof mirror polished bezel',
      color: 0x151c28,
      metalness: 0.40,
      roughness: 0.06,
      specs: 'Diamond-ground tachymeter bezel'
    },
    {
      id: 'polished',
      name: 'Mirror-Polished Alloy',
      subtitle: 'Flawlessly lapped bezel matching case metallurgy',
      matchCase: true,
      specs: 'Hand-lapped Black Polish finish'
    },
    {
      id: 'fluted',
      name: 'Fluted Ring',
      subtitle: 'Faceted 120-notch light-catching fluted ring',
      color: 0xd8b240,
      metalness: 0.96,
      roughness: 0.14,
      specs: 'Coin-edge faceted light refractors'
    }
  ],
  strap: [
    {
      id: 'alligator-brown',
      name: 'Havana Alligator Leather',
      subtitle: 'Hand-stitched square-scale leather with saddle seam',
      color: 0x2c1d14,
      metalness: 0.08,
      roughness: 0.72,
      specs: 'Hand-stitched Ecru thread | Deployant clasp'
    },
    {
      id: 'alligator-black',
      name: 'Matte Onyx Alligator',
      subtitle: 'Deep carbon velvet finish with tone-on-tone seam',
      color: 0x141619,
      metalness: 0.06,
      roughness: 0.75,
      specs: 'Black PVD Deployant Buckle'
    },
    {
      id: 'milanese-mesh',
      name: 'Milanese Mesh',
      subtitle: 'Supple woven stainless steel fine chain mesh',
      color: 0xc4ccd6,
      metalness: 0.95,
      roughness: 0.22,
      specs: 'Woven Milanese 316L mesh band'
    },
    {
      id: 'oyster-bracelet',
      name: '3-Link Brushed Bracelet',
      subtitle: 'Solid 3-link metal bracelet with satin-brushed flanks',
      matchCase: true,
      specs: 'Solid screw-in links | Glidelock clasp'
    }
  ]
};

export const MATERIAL_SCHEMES = [
  {
    id: 'rose-gold-haute',
    name: 'Rose Gold Haute',
    tagline: '18k Warm Rose Gold & Royal Sapphire',
    caseColor: 0xdf9a68,
    secondaryColor: 0x0c1b33,
    caseMetalness: 0.98,
    caseRoughness: 0.14,
    dialColor: 0x0c1b33,
    bezelColor: 0x151c28,
    strapColor: 0x2c1d14,
    jewelColor: 0xd91e4a,
    lumeColor: 0x00f5d4,
    gearColor: 0xf3cf55,
    plateColor: 0xdedede,
    config: {
      casing: 'rose-gold',
      dial: 'sunburst-blue',
      lume: 'bgw9',
      bezel: 'ceramic',
      strap: 'alligator-brown'
    }
  },
  {
    id: 'obsidian-stealth',
    name: 'Obsidian PVD Stealth',
    tagline: 'Matte Carbon Black & Crimson Red',
    caseColor: 0x181a20,
    secondaryColor: 0xe62655,
    caseMetalness: 0.92,
    caseRoughness: 0.22,
    dialColor: 0x101217,
    bezelColor: 0x1a1e27,
    strapColor: 0x15171c,
    jewelColor: 0xff1744,
    lumeColor: 0xff2a5f,
    gearColor: 0xd4af37,
    plateColor: 0x282f3c,
    config: {
      casing: 'obsidian',
      dial: 'enamel-black',
      lume: 'crimson',
      bezel: 'ceramic',
      strap: 'alligator-black'
    }
  },
  {
    id: 'ice-platinum',
    name: 'Ice Platinum & Cyan',
    tagline: 'Polished Platinum & Polar Cyan Glare',
    caseColor: 0xeef2f7,
    secondaryColor: 0x00f2fe,
    caseMetalness: 1.0,
    caseRoughness: 0.08,
    dialColor: 0x0c1e28,
    bezelColor: 0x1a2e38,
    strapColor: 0x1b2836,
    jewelColor: 0x00c8f8,
    lumeColor: 0x00f2fe,
    gearColor: 0xf4b942,
    plateColor: 0xe2e8f0,
    config: {
      casing: 'platinum',
      dial: 'frosted-silver',
      lume: 'bgw9',
      bezel: 'polished',
      strap: 'milanese-mesh'
    }
  },
  {
    id: 'emerald-sovereign',
    name: 'Emerald Sovereign',
    tagline: 'Brushed Yellow Gold & Imperial Emerald',
    caseColor: 0xd8b240,
    secondaryColor: 0x083321,
    caseMetalness: 0.95,
    caseRoughness: 0.18,
    dialColor: 0x083321,
    bezelColor: 0x062417,
    strapColor: 0x122618,
    jewelColor: 0x27ae60,
    lumeColor: 0x44ff99,
    gearColor: 0xf1c40f,
    plateColor: 0xcccccc,
    config: {
      casing: 'yellow-gold',
      dial: 'racing-green',
      lume: 'c3',
      bezel: 'fluted',
      strap: 'alligator-brown'
    }
  },
  {
    id: 'titanium-futura',
    name: 'Titanium Futura',
    tagline: 'Micro-blasted Grade 5 Titanium & Cobalt',
    caseColor: 0x929eaf,
    secondaryColor: 0x3898ec,
    caseMetalness: 0.85,
    caseRoughness: 0.28,
    dialColor: 0x182330,
    bezelColor: 0x232d3d,
    strapColor: 0x202b36,
    jewelColor: 0x9044d6,
    lumeColor: 0x3898ec,
    gearColor: 0xe67e22,
    plateColor: 0x526075,
    config: {
      casing: 'titanium',
      dial: 'skeleton',
      lume: 'bgw9',
      bezel: 'ceramic',
      strap: 'oyster-bracelet'
    }
  }
];

export const DEMO_COMMUNITY_DESIGNS = [
  {
    id: 'demo-1',
    refNumber: 'REF. H-1845-ROSE',
    title: 'Grand Complication 1845',
    creator: 'Philippe_Watchmaker',
    likes: 428,
    schemeId: 'rose-gold-haute',
    config: {
      casing: 'rose-gold',
      dial: 'sunburst-blue',
      lume: 'bgw9',
      bezel: 'ceramic',
      strap: 'alligator-brown'
    },
    timestamp: '2 hours ago',
    description: 'Classic 18k 5N Rose Gold casing with deep royal sapphire sunburst dial, ceramic tachymeter, and Havana alligator leather.'
  },
  {
    id: 'demo-2',
    refNumber: 'REF. H-2099-STEALTH',
    title: 'Cyber Chrono 2099',
    creator: 'VibeCoder_Zero',
    likes: 312,
    schemeId: 'obsidian-stealth',
    config: {
      casing: 'obsidian',
      dial: 'enamel-black',
      lume: 'crimson',
      bezel: 'ceramic',
      strap: 'alligator-black'
    },
    timestamp: '5 hours ago',
    description: 'Black PVD DLC titanium body with Crimson luminescent Dauphine hands and Grand Feu enamel dial for night endurance.'
  },
  {
    id: 'demo-3',
    refNumber: 'REF. H-950-ZENITH',
    title: 'Polar Zenith Tourbillon',
    creator: 'Elena_Horology',
    likes: 289,
    schemeId: 'ice-platinum',
    config: {
      casing: 'platinum',
      dial: 'frosted-silver',
      lume: 'bgw9',
      bezel: 'polished',
      strap: 'milanese-mesh'
    },
    timestamp: '1 day ago',
    description: 'Pure 950 platinum polish paired with frosted rhodium German silver dial, mirror bezel, and woven Milanese mesh band.'
  }
];
