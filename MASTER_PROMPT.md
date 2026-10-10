# HOROLOGIA: Production Transformation Master Prompt & Architectural Blueprint

> **Objective:** Transform Horologia from a fragile creative coding experiment into a world-class, production-grade **Digital Haute Horlogerie Atelier & Community Watch Design Platform**.  
> **Standard:** Lighthouse 100 (Performance, Accessibility, Best Practices, SEO), 60 FPS WebGL rendering, enterprise-grade security, mobile perfection, and uncompromising Swiss luxury aesthetics.

---

## 🏛️ Project Purpose & Core Vision

Horologia is defined by three inseparable pillars:
1. **Luxury First (The Aesthetic Foundation):** The digital equivalent of a Patek Philippe, Audemars Piguet, or A. Lange & Söhne manufacture. Every bevel, light reflection, metallic brush, sound click, and typography choice must evoke peerless luxury craftsmanship.
2. **Community Watch Design Platform (The Core Social Action):** An interactive 3D **Atelier** where collectors and enthusiasts design bespoke timepieces, publish their creations to a global community showcase, like and fork community builds, and export high-resolution renders and specifications.
3. **Haute Horlogerie Educational Experience (The Intellectual Hook):** An interactive, anatomically precise deconstruction of the mechanical movement—educating visitors on the physics of the Swiss lever escapement, gear ratios, synthetic ruby jewel friction reduction, and traditional finishing arts (anglage, perlage, Côtes de Genève).

---

## 📐 System Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                        HOROLOGIA CORE PLATFORM                         │
└────────────────────────────────────────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┼──────────────────────────────┐
    ▼                               ▼                              ▼
┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐
│   3D ENGINE & SCENE    │  │   AUDIO & KINEMATICS   │  │   ATELIER & SOCIAL     │
├────────────────────────┤  ├────────────────────────┤  ├────────────────────────┤
│ • Studio HDR PMREM     │  │ • 28,800 VPH Clock (8Hz│  │ • Realtime Customizer  │
│ • Micro-PBR Materials  │  │ • Pre-cached PCM Audio │  │ • Community Showcase   │
│ • Non-destructive Rim  │  │ • Synchronized Balance │  │ • Fork & Share Builds  │
│ • Safe Memory Lifecycle│  │ • Escapement Impulse   │  │ • WebGL Thumbnail Gen  │
└────────────────────────┘  └────────────────────────┘  └────────────────────────┘
    │                               │                              │
    └───────────────────────────────┼──────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 RESPONSIVE LUXURY UI & EDUCATION HUB                   │
├────────────────────────────────────────────────────────────────────────┤
│ • Mobile Bottom Sheets • Semantic A11y (ARIA) • Energy Flow Diagrams   │
│ • Camera Director      • Touch Orbit/Zoom      • Lighthouse 100 Suite  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 The 6-Phase Execution Roadmap

---

### Phase 1: Security, Infrastructure & Foundation Overhaul (Vercel-Ready)
**Goal:** Completely remove Firebase, eliminate vulnerabilities, deprecated APIs, dead dependencies, and establish a rock-solid foundation ready for Vercel Hobby deployment (`[projectname]-kvn.vercel.app`).

#### Tasks:
1. **Completely Remove Firebase & External Backend Bloat:**
   - Uninstall and purge the `firebase` npm package and `.firebase/` config directory.
   - Delete `src/components/FirebaseManager.js` and eliminate the "Connect Firebase" UI button and modal entirely.
   - Replace with a zero-dependency, high-performance `DesignStorageManager.js` using browser `LocalStorage` / `IndexedDB`, exportable JSON schema, and URL-hash/query state encoding (`?design=...`) for instant cross-device sharing on Vercel without server databases.
   - Structure the codebase for direct deployment on Vercel Hobby tier (instant static edge serving, zero cloud costs).
   - Note: Project is pending a brand rename before final Vercel deployment under `[projectname]-kvn.vercel.app`.
2. **Fix Asset & Runtime Errors:**
   - Supply a sharp, luxury SVG/PNG favicon at `/public/favicon.ico` and `/public/favicon.svg` to eliminate 404 errors.
   - Update Three.js shadow maps from deprecated `THREE.PCFSoftShadowMap` to `THREE.PCFShadowMap`.
   - Remove unused dependencies (`canvas-confetti`) from `package.json` to reduce bundle payload and attack surface.
3. **Decoupled Event & State Management:**
   - Implement a lightweight State Store (`src/core/Store.js`) managing active chapter, customizer parameters, audio state, and modal visibility.
   - Eliminate tight coupling between DOM event listeners and Three.js rendering loops.

#### Acceptance Criteria:
* Zero Firebase dependencies or references remaining in `package.json` or source code.
* Zero console errors and zero console deprecation warnings on initial load.
* Full Vercel build compatibility (`npm run build` generates a pristine static distribution in `dist/`).
* Clean production build with minified bundle size under 250 KB (excluding Three.js core).

---

### Phase 2: Visual Renaissance & Photorealistic 3D Craftsmanship
**Goal:** Elevate 3D rendering from primitive low-poly extrusions to authentic Haute Horlogerie photorealism.

#### Tasks:
1. **Studio HDRI Lighting Pipeline:**
   - Replace the empty dark sphere with a dedicated Three.js studio lighting environment using `PMREMGenerator`.
   - Add simulated softboxes (warm overhead key, cool rim kicker, neutral fill) to provide metallic highlights on polished bevels.
   - Configure tone mapping with `ACESFilmicToneMapping` and calibrated exposure so *Obsidian PVD* retains crisp silhouette edges and contrast against the dark background.
2. **Micro-Geometry & Anatomical Accuracy:**
   - **Fix the "Zombie Red Pimple":** Correct the Z-coordinate offset of all ruby jewels so they sit flush inside mainplate countersinks and under the dial plate (`z < 0.12`).
   - **Case & Lugs Ergonomics:** Redesign lugs with ergonomic downward curvature matching authentic luxury case geometries, featuring chamfered edges and brushed flanks.
   - **Strap Finish:** Upgrade the strap geometry from a squashed tube to an authentic contoured strap with stitched edge borders and a deployant clasp.
   - **Skeleton Mainplate:** Replace crude circular cutouts with open-worked, architectural movement bridges featuring beveled interior borders.
   - **Gears:** Refine gear teeth profiles with realistic involute/cycloidal tooth shapes, arbors, and polished pinion pin centers.
3. **Ultra-PBR Material Suite:**
   - **18k 5N Rose Gold:** Metalness 0.98, Roughness 0.14, warm copper-gold specular color.
   - **950 Platinum:** Metalness 1.0, Roughness 0.08, crisp silvery specular.
   - **Grade 5 Titanium:** Metalness 0.85, Roughness 0.28, satin micro-blasted sheen.
   - **Obsidian PVD:** Metalness 0.90, Roughness 0.22, deep carbon black with distinct specular highlights.
   - **Domed Sapphire Glass:** Transmission 0.96, Roughness 0.02, IOR 1.77, physical thickness with subtle antireflective blue tint.
4. **Cinematic Camera Choreography:**
   - Recalibrate chapter camera coordinates and lookAt vectors to ensure every component remains centered across all viewports (desktop widescreen, tablet, mobile portrait).
   - Chapter 5 (Balance Wheel) and Chapter 6 (Gears) must frame the active mechanisms in the visual center without viewport clipping.

#### Acceptance Criteria:
* Zero geometry clipping through the dial face.
* Metals show realistic studio light reflections across all material presets.
* Exploded parts remain perfectly balanced within the viewport at all scroll stages.

---

### Phase 3: Horological Kinematics & Audio Physics Engine
**Goal:** Deliver mathematically authentic movement kinematics and a zero-alloc audio synthesizer.

#### Tasks:
1. **Mathematical Correction to 28,800 VPH:**
   - Correct the ticking frequency in `SoundEngine.js`:
     $$\text{Tick Interval} = \frac{1000 \text{ ms}}{8 \text{ ticks/sec}} = 125 \text{ ms}$$
   - The ticking engine must fire at exactly **125 ms** to represent true 28,800 VPH (4 Hz balance oscillation producing 8 vibrations per second).
2. **Dual-Pallet Acoustic Simulation:**
   - Differentiate the acoustic timbre of the **Entry Pallet Jewel** versus the **Exit Pallet Jewel** (subtly alternating frequencies and decay envelopes every 125 ms) to capture the authentic cadence of a Swiss lever escapement.
   - Implement tactile ratchet clicks when dragging the explode slider or rotating the crown.
3. **Zero-Allocation Audio Pipeline:**
   - Pre-render all metallic impact clicks, friction noise, and expansion whooshes into immutable, pre-allocated `AudioBuffer` objects at initialization.
   - Trigger playback exclusively via lightweight `AudioBufferSourceNode` connections.
   - Eliminate all dynamic `createBuffer` and float array loops during runtime to prevent garbage collection pauses.
4. **Mechanical Kinematic Synchronization:**
   - Couple the balance wheel's harmonic oscillation ($\sin(\omega t)$) directly to the step rotation of the escape wheel.
   - Synchronize the continuous sweep of the seconds hand with the escapement gear train.

#### Acceptance Criteria:
* Exact 8-beats-per-second (125 ms) acoustic cadence representing true 28,800 VPH.
* Zero main-thread memory allocations in the audio loop during active playback.
* Fluid, physically coordinated movement between balance wheel, pallet fork, and escape wheel.

---

### Phase 4: The Atelier (Community Watch Design Platform)
**Goal:** Build the core social platform allowing visitors to design, customize, save, fork, and showcase custom timepieces.

#### Tasks:
1. **The Atelier Customizer Suite:**
   - Allow granular customization of:
     - **Casing & Lugs:** 18k Rose Gold, 950 Platinum, Grade 5 Titanium, Obsidian PVD, Yellow Gold.
     - **Dial Finish:** Open-worked Skeleton, Sunburst Blue, British Racing Green, Enamel Black, Frosted Silver.
     - **Hands & Indices:** Faceted Dauphine or Baton hands with BGW9 (Blue) or C3 (Green) Super-LumiNova.
     - **Bezel:** Mirror-polished, High-tech Ceramic, or Fluted.
     - **Strap:** Alligator Leather, Milanese Mesh, or 3-Link Brushed Bracelet.
2. **Instant WebGL Snapshot Generator:**
   - Implement a 1-click snapshot method that hides UI overlays, frames the 3D model, and renders an optimized WebP thumbnail of the custom watch directly from the WebGL canvas.
3. **Community Showcase & Forking:**
   - Users can name their creation, add an optional artisan note, and publish it to the Showcase Gallery.
   - **Forking Mechanism:** Community designs can be viewed in 3D and "Forked" into the Atelier—allowing any user to load the configuration, modify it, and save their own variation.
   - **Persistent Storage:** Synchronize builds with Firestore (when configured) or seamless `LocalStorage` with local like counters and instant UI responsiveness.
4. **Export & Share:**
   - Generate a sharable URL with URL-encoded design parameters (e.g. `?design=c1-d2-h1-s3`) so users can share their specific watch configuration anywhere without requiring an account.
   - Provide an exportable "Artisan Specification Sheet" modal summarizing the watch dimensions, materials, and caliber specifications.

#### Acceptance Criteria:
* Users can customize, name, preview, and save builds in under 30 seconds.
* 1-click "Fork Build" loads community configurations instantly into the 3D model.
* URL deep-linking accurately reconstructs the exact custom watch configuration.

---

### Phase 5: Haute Horlogerie Educational Experience
**Goal:** Turn the scroll-driven deconstruction into an interactive, masterclass-level educational journey.

#### Tasks:
1. **Interactive Raycasting 2.0 (Non-Destructive Highlights):**
   - Eliminate the opaque yellow emissive filter.
   - Implement a luxury outline pass or subtle specular rim glow on hovered meshes.
   - Exclude the outer Sapphire Crystal from intercepting raycasts during assembled mode, allowing users to hover hands, sub-dials, and movement gears directly.
2. **Deep Component Dossier HUD:**
   - Display rich, horologically accurate data for each component:
     - **Component Anatomy & Function:** How it transfers power, reduces friction, or regulates time.
     - **Material & Metallurgy:** Physical properties, hardness ratings (Vickers / Mohs), and finishes.
     - **Traditional Finishing Techniques:** Explanations of Anglage (hand-chamfering), Perlage (circular graining), and Côtes de Genève (Geneva stripes).
3. **Interactive Energy Flow Visualizer:**
   - Add a toggleable "Energy Flow" mode that illuminates the mechanical power path with subtle light particles traveling from:
     $$\text{Mainspring Barrel} \longrightarrow \text{Center Wheel} \longrightarrow \text{Third Wheel} \longrightarrow \text{Fourth Wheel} \longrightarrow \text{Escape Wheel} \longrightarrow \text{Balance Wheel}$$

#### Acceptance Criteria:
* Hovering parts produces crisp, elegant outlines without obscuring internal components.
* Users can click any part to focus the camera and open its detailed horological dossier.
* Educational diagrams and metrics reflect authentic Swiss horological engineering.

---

### Phase 6: Mobile Perfection, Accessibility & Lighthouse 100
**Goal:** Deliver flawless responsiveness, full accessibility, and verified 100/100 Lighthouse performance.

#### Tasks:
1. **Mobile UX Transformation:**
   - Replace rigid desktop overlays with fluid **Bottom-Sheet Drawers** on mobile devices (< 768px).
   - Ensure the header navigation condenses into an elegant glassmorphism action bar with an intuitive hamburger/drawer menu.
   - Implement smooth touch gestures: single-finger drag to rotate, two-finger pinch to zoom in/out, and horizontal swipe for chapter navigation.
   - Ensure `#part-inspector` is accessible on mobile via an on-demand bottom sheet when tapping components.
2. **Accessibility (WCAG 2.1 AA Compliant):**
   - Provide full keyboard navigation for all interactive controls (slider, chapters, customizer drawer, modals).
   - Add comprehensive `aria-label`, `role="dialog"`, `aria-expanded`, and focus trapping on all modals and drawers.
   - Ensure color contrast ratios for all UI text against dark glass backgrounds exceed 4.5:1.
   - Support `prefers-reduced-motion` by transitioning from continuous scrolling to smooth crossfades and static exploded states.
3. **Lighthouse 100 Optimization:**
   - **Performance:** Dynamic `devicePixelRatio` capping (max 2), frustum culling, geometry sharing, WebP image formats, asynchronous font loading for `Cinzel` and `Inter`.
   - **SEO:** Complete OpenGraph metadata, Twitter cards, semantic HTML5 structure (`<main>`, `<header>`, `<article>`), schema.org `Product` and `EducationalOrganization` JSON-LD structured data.
   - **Best Practices:** Strict CSP compatibility, zero deprecated APIs, HTTPS-ready assets.

#### Acceptance Criteria:
* 100% Lighthouse scores across all 4 categories (Performance, Accessibility, Best Practices, SEO) on desktop and mobile.
* Stable 60 FPS on mid-range mobile hardware.
* Flawless layout without text truncations, overflow scrollbars, or element overlap on 360px to 4K displays.

---

## 🛠️ Implementation Verification Commands

Run these verification steps to prove production readiness:

```bash
# 1. Verify build integrity & bundle size
npm run build

# 2. Preview production build locally
npm run preview

# 3. Audit memory leaks
# Open Chrome DevTools -> Performance -> Start profiling -> Scroll through all 7 chapters 3x -> Stop -> Verify JS Heap & GPU memory return to baseline
```

---

*Horologia is now ready to be elevated from a prototype into the definitive Haute Horlogerie 3D web experience.*
