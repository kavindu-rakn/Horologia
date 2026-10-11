// Horologia - Mechanical Watch Constants & Presets

export const WATCH_PARTS = {
  SAPPHIRE_GLASS: {
    id: 'sapphireGlass',
    name: 'Domed Sapphire Crystal',
    category: 'Exterior Protection',
    material: 'Single-Crystal Synthetic Corundum (Al₂O₃)',
    hardness: '9 Mohs Scale · 2,200 HV Vickers (Diamond-Scratch Only)',
    function: 'Hermetically seals the movement and dial assembly while providing crystal-clear optical transmission with zero chromatic aberration.',
    specs: 'Thickness: 1.8mm | AR Coating: Dual-sided internal multilayer blue anti-reflective',
    metallurgy: 'Crystallized at 2,050°C using the Verneuil flame-fusion process. Optical transmission exceeds 99.2% with a refractive index of 1.77.',
    physicsPrinciple: 'Fresnel Refraction & Optical Phase Cancellation via quarter-wavelength dielectric metal-oxide destructive interference thin films.',
    finishingTechnique: 'Diamond-powder slurry grinding followed by precision spherical mechanical buffing for flawless curvature.',
    focusCamera: { camera: { x: 0.1, y: 0.8, z: 4.5 }, lookAt: { x: 0, y: 0.2, z: 0.3 } }
  },
  BEZEL: {
    id: 'bezel',
    name: 'Ceramic Rotating Bezel',
    category: 'Exterior Architecture',
    material: 'Zirconium Oxide Ceramic (ZrO₂)',
    hardness: '1,500 HV Vickers (Diamond-Proof & UV-Inert)',
    function: 'Bi-directional rotatable calibrated ring displaying laser-etched tachymetric scales with smooth 120-click ball-bearing detents.',
    specs: 'Ratchet Teeth: 120 clicks | Finish: Mirror-polished bevels with satin top ring',
    metallurgy: 'Sintered at 1,400°C under 2,000 atmospheres of isostatic pressure, yielding a virtually scratch-proof and color-permanent crystalline matrix.',
    physicsPrinciple: 'Spring-loaded ball-bearing mechanical detent indexation with unidirectional kinematic ratchet pawl lock.',
    finishingTechnique: 'Precision diamond-wheel faceting and PVD platinum deposition in laser-engraved graduations.',
    focusCamera: { camera: { x: 0.0, y: 0.5, z: 3.8 }, lookAt: { x: 0, y: 0.1, z: 0.2 } }
  },
  CASE: {
    id: 'outerCase',
    name: 'Haute Horlogerie Chassis & Lugs',
    category: 'Exterior Chassis',
    material: 'Grade 5 Titanium (Ti-6Al-4V) / 18k 5N Rose Gold',
    hardness: '350 HV (Titanium) / 160 HV (Rose Gold)',
    function: 'Structural pressure hull safeguarding the delicate kinematic gear train against shocks, moisture, and dust up to 10 ATM (100 meters).',
    specs: 'Diameter: 41.0mm | Height: 11.4mm | Lug-to-Lug: 48.0mm',
    metallurgy: 'Aerospace-grade alpha-beta titanium alloy combining 6% aluminum and 4% vanadium for high tensile strength (950 MPa) at half the weight of steel.',
    physicsPrinciple: 'Hydrostatic pressure redistribution across curved case flanks and dual fluorocarbon O-ring hermetic sealing.',
    finishingTechnique: 'Contrasting satin-brushed flanks with hand-lapped mirror-polished swept bevel chamfers along the lug contours.',
    focusCamera: { camera: { x: 0.3, y: 0.4, z: 4.8 }, lookAt: { x: 0, y: 0, z: 0 } }
  },
  CROWN: {
    id: 'crown',
    name: 'Winding Crown & Setting Stem',
    category: 'Kinematic Interface',
    material: 'Matching Case Alloy with Onyx Cabochon',
    hardness: 'Case Equivalent',
    function: 'Manual winding of the mainspring barrel and two-position clutch-stem setting of hour and minute pinions.',
    specs: 'Flutes: 24 precision knurled teeth | Seals: Triple-lock gasket system',
    metallurgy: 'Micro-turned alloy with recessed internal square arbor coupling to the sliding winding pinion.',
    physicsPrinciple: 'Breguet winding ratchet gearing allowing forward torque transmission while ratcheting freely backwards.',
    finishingTechnique: 'Micro-knurled grip flutes with high-polish cabochon end-stone and laser-engraved manufacture crest.',
    focusCamera: { camera: { x: 1.8, y: 0.1, z: 2.8 }, lookAt: { x: 1.2, y: 0, z: 0 } }
  },
  DIAL: {
    id: 'dial',
    name: 'Skeletonized Engine Dial',
    category: 'Face & Display',
    material: 'Galvanic Coated German Silver & 18k Applied Indices',
    hardness: '180 HV German Silver',
    function: 'Architectural hour marker frame revealing the oscillating balance wheel and kinetic gear train while ensuring instant legibility.',
    specs: 'Thickness: 0.45mm | Cutouts: 5 open-worked skeleton apertures',
    metallurgy: 'Maillechort (60% Cu, 20% Ni, 20% Zn) alloyed for dimensional stability across thermal variations.',
    physicsPrinciple: 'Visual contrast optimization and luminous phosphorescent light emission.',
    finishingTechnique: 'Perlage on dial base, galvanic sunburst bath coating, and diamond-polished faceted hour markers.',
    focusCamera: { camera: { x: 0.0, y: 0.1, z: 3.2 }, lookAt: { x: 0, y: 0.0, z: 0.15 } }
  },
  HANDS: {
    id: 'hands',
    name: 'Faceted Dauphine Hands Assembly',
    category: 'Face & Display',
    material: 'Tempered Carbon Steel & 18k Rose Gold',
    hardness: '60 HRC Hardened Steel',
    function: 'Tri-axial precision time indication driven by the hour wheel, center pinion, and fourth wheel sub-seconds arbor.',
    specs: 'Lume: Swiss Super-LumiNova BGW9/C3 | Canal Depth: 0.12mm',
    metallurgy: 'Hardened high-carbon spring steel stamped, hand-beveled, and heat-blued at exactly 290°C for corrosion resistance.',
    physicsPrinciple: 'Inertial balance counterweighting ensuring minimum torque drag on the gear train wheel pivots.',
    finishingTechnique: 'Dual-surface diamond-cut: one flank mirror-polished, opposite flank satin-brushed for light-catching readability.',
    focusCamera: { camera: { x: 0.1, y: 0.1, z: 2.8 }, lookAt: { x: 0, y: 0.0, z: 0.22 } }
  },
  MAINPLATE: {
    id: 'mainplate',
    name: 'Architectural Skeleton Mainplate',
    category: 'Movement Chassis',
    material: 'Rhodium-Plated Maillechort (German Silver)',
    hardness: '190 HV',
    function: 'The anatomical foundation of the movement, housing all 27 synthetic ruby jewel bearings, train arbors, and escapement pivots.',
    specs: 'Diameter: 36.6mm | Thickness: 1.8mm | Apertures: 7 skeletonized bays',
    metallurgy: 'Traditional unplated German silver develops a noble warm golden patina over decades, renowned in Glashütte and Geneva watchmaking.',
    physicsPrinciple: 'Torsional rigidity and dimensional stability within ±1 micron under temperature swings between -10°C and +60°C.',
    finishingTechnique: 'Hand-chamfered anglage (45° beveled interior angles) and circular perlage graining applied with boxwood pegs.',
    focusCamera: { camera: { x: -0.2, y: -0.1, z: 3.2 }, lookAt: { x: 0, y: 0, z: -0.05 } }
  },
  BRIDGES: {
    id: 'bridges',
    name: 'Beveled Movement Bridges',
    category: 'Movement Chassis',
    material: 'German Silver with Heat-Blued Screws',
    hardness: '190 HV',
    function: 'Rigid top arches securing the gear train arbors, escape wheel, and balance cock in micron-precise alignment.',
    specs: 'Decoration: Côtes de Genève stripes | Screws: 290°C thermally blued',
    metallurgy: 'Stress-relieved brass and German silver bridges fitted with pressed gold chatons holding synthetic ruby cups.',
    physicsPrinciple: 'Kinematic constraint of three-point arbor axis stability with zero axial end-shake play.',
    finishingTechnique: 'Côtes de Genève (Geneva stripes) linear abrasive brushing with micro-beveled specular anglage edges.',
    focusCamera: { camera: { x: 0.2, y: 0.3, z: 3.0 }, lookAt: { x: 0.1, y: 0.1, z: 0.08 } }
  },
  MAINSPRING: {
    id: 'mainspring',
    name: 'Mainspring Barrel Assembly',
    category: 'Kinetic Power Reserve',
    material: 'Nivaflex Elastic Super-Alloy',
    hardness: '600 HV',
    function: 'Stores mechanical potential energy generated by crown winding or automatic rotor oscillation, delivering steady torque for 72 hours.',
    specs: 'Power Reserve: 72 Hours | Torque: 8.5 N·mm | Spring Length: 420mm',
    metallurgy: 'Complex multi-component alloy (Co-Ni-Cr-Mo-Fe) impervious to magnetic fields and virtually immune to fatigue fracture.',
    physicsPrinciple: 'Hooke’s Elastic Potential: Energy stored as $U = \\frac{1}{2} k \\theta^2$, discharged smoothly through an S-shaped slipping bridal spring.',
    finishingTechnique: 'Radial snailing (colimaçonnage) on the barrel cover with diamond-turned teeth.',
    focusCamera: { camera: { x: -0.8, y: -0.6, z: 2.8 }, lookAt: { x: -0.55, y: -0.45, z: -0.05 } }
  },
  GEAR_TRAIN: {
    id: 'gearTrain',
    name: 'Haute Horlogerie Gear Train',
    category: 'Kinematic Transmission',
    material: 'CuBe Brass Wheels & Hardened 20AP Steel Pinions',
    hardness: 'Gears: 220 HV | Pinions: 62 HRC Steel',
    function: 'Multiplies mainspring rotational speed from 1 turn per 8 hours up to 480 discrete steps per minute at the seconds arbor.',
    specs: 'Gear Ratios: Center (1:1), 3rd (1:7.5), 4th (1:60 - Seconds Arbor)',
    metallurgy: 'Beryllium bronze wheels mounted on polished carbon steel arbors with burnished pivots running inside ruby bearings.',
    physicsPrinciple: 'Cycloidal gear tooth profiles maintaining constant angular velocity ratio with minimal frictional loss.',
    finishingTechnique: 'Circular satin graining on wheel spokes, hand-chamfered arms, and mirror-burnished pinion leaves.',
    focusCamera: { camera: { x: 0.2, y: -0.3, z: 2.6 }, lookAt: { x: 0.0, y: -0.2, z: 0.04 } }
  },
  ESCAPEMENT: {
    id: 'escapement',
    name: 'Swiss Lever Escapement & Pallet Fork',
    category: 'Regulation & Impulse',
    material: 'Hardened Silicon (Si) & Synthetic Ruby Pallets',
    hardness: 'Silicon: 1,100 HV | Ruby: 2,200 HV',
    function: 'Converts rotary gear train power into 8 discrete impulses per second, alternating locking and impulse faces every 125 ms.',
    specs: 'Frequency: 8 beats/sec | Pallet Angle: 12° Lift | Banking: ±0.14 rad',
    metallurgy: 'Deep Reactive-Ion Etched (DRIE) monocrystalline silicon escape wheel with synthetic ruby entry/exit pallet jewels.',
    physicsPrinciple: 'Conservation of angular momentum and kinematic deadbeat draw angle preventing accidental unlocking.',
    finishingTechnique: 'Specular black polish (poli noir) on steel pallet fork body with mirror-lapped ruby impulse faces.',
    focusCamera: { camera: { x: -0.4, y: 0.4, z: 2.4 }, lookAt: { x: -0.22, y: 0.38, z: 0.03 } }
  },
  BALANCE_WHEEL: {
    id: 'balanceWheel',
    name: 'Variable Inertia Balance Wheel & Hairspring',
    category: 'Harmonic Oscillator',
    material: 'Glucydur Alloy & Nivarox Breguet Overcoil',
    hardness: '380 HV Glucydur',
    function: 'The heartbeat of the watch. Oscillates with simple harmonic motion at 28,800 VPH (4.0 Hz) to regulate timekeeping precision to ±2 sec/day.',
    specs: 'Frequency: 4.0 Hz (28,800 VPH) | Poising: 4 Microstella Gold Screws',
    metallurgy: 'Beryllium bronze (Glucydur) with low thermal expansion paired with self-compensating Nivarox alloy hairspring.',
    physicsPrinciple: 'Simple Harmonic Motion: Period $T = 2\\pi \\sqrt{\\frac{I}{C}}$ where $I$ is moment of inertia and $C$ is hairspring torque stiffness.',
    finishingTechnique: 'Dynamic poising with 18k solid gold inertia weights and hand-formed Breguet terminal curve overcoil.',
    focusCamera: { camera: { x: -0.2, y: 0.7, z: 2.2 }, lookAt: { x: -0.14, y: 0.55, z: 0.06 } }
  },
  TOURBILLON: {
    id: 'tourbillon',
    name: 'Flying Tourbillon Regulator',
    category: 'Haute Horlogerie Complication',
    material: 'Grade 5 Titanium & 18k Gold Counterweights',
    hardness: '350 HV',
    function: 'Rotates the entire escapement and balance assembly 360° every 60 seconds to negate positional gravity errors across wrist orientations.',
    specs: 'Cage Weight: 0.28 grams | Components: 67 micro-parts | Rotation: 1 RPM',
    metallurgy: 'Skeletonized titanium cage machined to 5-micron tolerances for minimum rotational inertia.',
    physicsPrinciple: 'Gravitational vector averaging over time: $\\int_0^{60} \\vec{g}(\\theta) d\\theta = 0$.',
    finishingTechnique: 'Mirror-polished titanium cage arms, hand-beveled interior angles, and blued balance cock screws.',
    focusCamera: { camera: { x: -0.15, y: 0.55, z: 2.0 }, lookAt: { x: -0.14, y: 0.52, z: 0.05 } }
  },
  ROTOR: {
    id: 'rotor',
    name: 'Automatic Oscillating Rotor',
    category: 'Kinetic Winding',
    material: 'Heavy 22k Solid Gold Outer Rim & Titanium Hub',
    hardness: 'Solid 22k Gold (Density: 19.3 g/cm³)',
    function: 'Converts kinetic wrist motion into potential energy within the mainspring barrel via bi-directional ball-bearing winding.',
    specs: 'Bearing: 7 Ceramic micro-balls | Efficiency: Magic Lever bi-directional',
    metallurgy: 'High-density 22k gold outer mass maximizes moment of inertia, while skeletonized titanium spokes minimize central friction.',
    physicsPrinciple: 'Newtonian rotational inertia and centrifugal torque transfer through reversing reduction gears.',
    finishingTechnique: 'Open-worked manufacture crest with radial Côtes de Genève stripes and hand-beveled chamfers.',
    focusCamera: { camera: { x: 0.4, y: -0.4, z: 4.2 }, lookAt: { x: 0.0, y: -0.3, z: -0.1 } }
  },
  JEWELS: {
    id: 'jewels',
    name: 'Synthetic Ruby Bearings & Gold Chatons',
    category: 'Friction Reduction',
    material: 'Single-Crystal Synthetic Corundum (Al₂O₃ + Cr) in 18k Chatons',
    hardness: '9 Mohs Scale · 2,200 HV Vickers',
    function: 'Ultra-hard olive-cut bearing surfaces that eliminate arbor pivot wear and minimize frictional torque coefficient to 0.015.',
    specs: 'Jewel Count: 27 Rubies | Chatons: 18k Yellow Gold secured by blued screws',
    metallurgy: 'Single-crystal aluminum oxide doped with chromium for authentic pigeon-blood red hue. Olive-drilled pivot holes hold micro-droplets of synthetic oil.',
    physicsPrinciple: 'Amontons’ Friction Law: $\\mu = 0.015$, reducing rotational friction by 85% compared to metal-on-metal bushings.',
    finishingTechnique: 'Diamond-burnished olive cups set inside screw-mounted 18k yellow gold chaton collars.',
    focusCamera: { camera: { x: 0.1, y: 0.2, z: 2.4 }, lookAt: { x: 0.0, y: 0.1, z: 0.05 } }
  },
  STRAP: {
    id: 'strap',
    name: 'Hand-Stitched Strap & Deployant Clasp',
    category: 'Ergonomics & Wearability',
    material: 'Louisiana Alligator Leather / Titanium Mesh',
    hardness: 'Supple Luxury Grade',
    function: 'Ergonomically secures the 41mm case flush to the wrist with quick-release spring bars and a dual-blade butterfly deployant clasp.',
    specs: 'Width: 20mm tapering to 18mm | Clasp: Dual push-button butterfly deployant',
    metallurgy: 'Deployant clasp milled from matching case alloy with ceramic ball-bearing locking detents.',
    physicsPrinciple: 'Dual-axis ergonomic curvature distributing watch weight (88g) evenly across the radial wrist bone.',
    finishingTechnique: 'Traditional saddle-stitching with ecru waxed linen thread and hand-lacquered edge glazing.',
    focusCamera: { camera: { x: 0.0, y: -1.2, z: 4.5 }, lookAt: { x: 0.0, y: -0.8, z: 0.0 } }
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
