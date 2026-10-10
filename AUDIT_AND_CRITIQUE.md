# HOROLOGIA: The Forensic Technical & Aesthetic Audit

> **Date:** October 10, 2026  
> **Target:** Horologia (`http://localhost:5173/`, commit head)  
> **Environment:** Chrome DevTools, Three.js r185, Vite 8, Web Audio API  
> **Verdict:** High-concept creative pitch held together by procedural primitives, severe memory leaks, horological math errors, and critical UX oversights.

---

## 1. Executive Summary: The Illusion vs. The Reality

Horologia introduces itself with grand marketing copy:  
> *"Haute Horlogerie meets modern WebGL storytelling. An interactive 3D mechanical watch movement that gracefully dismantles gear by gear..."*

In reality, live browser inspection reveals an enormous gulf between what the project advertises and what it delivers:
* **Advertised:** 200+ hand-finished parts, 27 synthetic ruby jewels, 28,800 VPH precision movement, Côtes de Genève, hand-chamfered anglage, and a community showcase.
* **Delivered:** ~15 crude procedural Three.js meshes, 6 ruby cylinders, audio ticking at half speed (14,400 VPH), GPU shader memory leaks on every cursor movement, an intrusive "DIY backend" configuration prompt for end users, and total interface failure on mobile viewports.

---

## 2. Visual & 3D Rendering Disasters

### 2.1 The "Zombie Red Pimple" on the Dial Face
* **Location:** Chapter 0 (Hero View) / `src/components/WatchModel.js` (`buildJewels()` line 450)
* **The Defect:** One of the movement's ruby bearings is positioned at `z = 0.15`, while the solid brass dial face sits at `z = 0.145`.
* **Visual Impact:** A glaring, emissive magenta-red cylinder protrudes through the pristine watch dial. It looks like an accidental dead pixel, a rendering artifact, or an inflamed pustule directly next to the hands in the brand's primary presentation shot.

### 2.2 The "Murky Yellow" Sapphire Hover Veil
* **Location:** `src/components/RaycasterManager.js` (`applyHighlight()` lines 86–91)
* **The Defect:** On hover, the raycaster highlights parts by setting `emissive = 0xd4af37` at `0.55` intensity.
* **Visual Impact:** Because the transparent Domed Sapphire Crystal mesh covers the entire face of the watch, moving the mouse near the center causes the crystal to intercept the raycast. The crystal immediately shifts from transparent glass into a murky, yellowish-brown fog that blinds the user and blocks all visibility of the hands, sub-dials, and movement beneath.

### 2.3 The Obsidian PVD "Black Hole" Collapse
* **Location:** `src/components/SceneManager.js` (`initEnvironment()` lines 106–132) & `src/utils/constants.js`
* **The Defect:** When switching to the *Obsidian PVD Stealth* preset, the case and dial turn matte black. The scene does not use an HDRI environment map; it relies on a single procedural sphere (`0x1a1e2e`) with two weak point lights.
* **Visual Impact:** Without High Dynamic Range reflection data or Fresnel rim lighting, the black watch case reflects nothing. It turns into a featureless black silhouette that disappears completely into the black webpage background.

### 2.4 Blocky, Primitive 3D Geometry
* **The Strap:** Built using `TubeGeometry` scaled by `(1.35, 1, 0.28)`. It looks like an untextured, squashed rubber plumbing pipe rather than alligator leather or a precision steel bracelet.
* **The Lugs:** Basic 2D shapes extruded into flat, straight pegs. They do not contour to the wrist or case barrel, looking like glued wooden blocks.
* **The Mainplate:** A flat disk with two circular holes punched through it, resembling a bowling ball or an electrical wall plate rather than a Swiss movement chassis.
* **The Gears:** Primitive cylinders with blocky square teeth extruded along the circumference without proper cycloidal or involute gear teeth profiles.

### 2.5 Camera Clipping & Choreography Failure
* **Chapter 5 (Balance Wheel):** The camera angle focuses on the top-left while the balance wheel and gear train are clipped off the bottom-right corner of the screen.
* **Chapter 7 (Full Explode):** The components are flung across 3D space with no visual balance. 40% of the right side of the screen is empty black void, while parts on the bottom overlap and collide with the Explode HUD slider.

---

## 3. Horological & Mathematical Inaccuracies

### 3.1 The 28,800 VPH Frequency Blunder
* **Location:** `src/audio/SoundEngine.js` (`startTicking()` lines 48–52)
```javascript
this.tickInterval = setInterval(() => {
  if (this.isTicking && !this.isMuted) {
    this.playTick();
  }
}, 250); // 4 ticks per second = 4Hz / 28,800 VPH
```
* **The Error:** A 4 Hz balance wheel completes 4 complete oscillations per second. Each oscillation produces **2 vibrations (semi-oscillations/ticks)** as the pallet jewels engage the escape wheel teeth. Therefore:
  $$\text{Beat Rate} = 4 \text{ Hz} \times 2 \text{ beats} \times 3600 \text{ s} = 28,800 \text{ VPH (8 ticks/sec = 125 ms interval)}$$
* **The Reality:** Firing every 250 ms produces 4 ticks per second, which equals **14,400 VPH**—the slow cadence of an 18th-century antique clock, not a modern Swiss luxury watch. Confusing the oscillation frequency with the tick rate is an embarrassing oversight for a project branded as *Haute Horlogerie*.

### 3.2 Fabricated Component Counts
* **Claims:** "Over 200 hand-finished components", "27 synthetic ruby jewels".
* **Reality:** The codebase only instantiates **6 ruby jewel meshes** (plus 2 pallet jewels), and approximately 15 distinct functional mesh groups.

---

## 4. Code Quality & Technical Sins

### 4.1 Critical WebGL Material Memory Leak
* **Location:** `src/components/RaycasterManager.js` (`applyHighlight()` lines 86–91 & `clearHover()` lines 99–105)
```javascript
// applyHighlight:
const highlightMat = child.material.clone();
child.material = highlightMat;

// clearHover:
child.material = child.userData.originalMaterial;
delete child.userData.originalMaterial;
```
* **Impact:** Every single time the cursor touches a part, `child.material.clone()` creates a new Three.js material instance and compiles a new WebGL shader program. When hover clears, the reference is dropped without calling `highlightMat.dispose()`. Moving the cursor back and forth generates thousands of orphaned GPU shader programs, causing severe memory bloat and frame stuttering.

### 4.2 Main-Thread Audio Garbage Collection Churn
* **Location:** `src/audio/SoundEngine.js` (`playMetallicClick()` line 87, `playExpansionWhoosh()` line 127)
```javascript
const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
const data = buffer.getChannelData(0);
for (let i = 0; i < bufferSize; i++) {
  data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
}
```
* **Impact:** Every single tick (and every hover/scroll whoosh) allocates a new `AudioBuffer` and computes PCM noise on the main thread in a `for` loop. This generates constant memory allocation and triggers frequent JavaScript garbage collection pauses, causing frame drops during 3D scrolling.

### 4.3 Deprecated APIs & Console Errors
* **Deprecated Three.js API:** `THREE.PCFSoftShadowMap` is deprecated in Three.js r185, producing warnings on load.
* **Missing Assets:** Network request for `/favicon.ico` returns a 404 error.
* **Dead Dependencies:** `package.json` installs `canvas-confetti`, while `src/main.js` line 11 leaves a comment: `// confetti removed — not appropriate for a luxury watch experience`.

---

## 5. UI/UX & Product Design Absurdities

### 5.1 The "DIY Backend" Firebase Modal
* **Location:** `index.html` & `src/components/FirebaseManager.js`
* Clicking the **⚡ Firebase** button prompts end users to:
  1. Open the Firebase Console in another tab
  2. Create a Google Cloud project
  3. Enable Firestore in test mode
  4. Copy their private `firebaseConfig` JSON
  5. Paste it into an input field on the website
* **Product Impact:** Expecting luxury consumer website visitors to provision their own cloud infrastructure just to save a watch configuration is absurd. Furthermore, the "Showcase" modal uses fake hardcoded users (`Philippe_Watchmaker`, `VibeCoder_Zero`) with hundreds of mock likes to fake community activity.

### 5.2 Mobile Viewport Catastrophe (390×844)
* **Header Collapse:** Navigation buttons overflow off the right screen edge. "Material Lab" is truncated; "Showcase" and "Firebase" are completely inaccessible.
* **Layout Suffocation:** The Chapter card covers over 55% of the screen height, completely suffocating the 3D model.
* **UI Clashing:** The vertical dot navigation on the right renders directly over the watch bezel.
* **Feature Deletion:** `#part-inspector` is given `display: none` in CSS, completely disabling the component inspection feature for mobile users.

---

## 6. Scorecard

| Dimension | Score | Assessment |
| :--- | :---: | :--- |
| **Concept & Storytelling** | **8.5 / 10** | Compelling premise and scroll narrative structure. |
| **3D Modeling & Micro-Geometry** | **2.5 / 10** | Crude extruded primitives; completely unworthy of "Haute Horlogerie". |
| **Lighting & PBR Materials** | **3.0 / 10** | Missing studio HDRI; muddy metals; stealth materials vanish. |
| **Horological Accuracy** | **3.0 / 10** | Audio ticking at half speed; fabricated part counts; jewel clipping bug. |
| **Code Architecture & Memory** | **3.5 / 10** | Severe WebGL material shader leak; main-thread PCM noise buffer churn. |
| **UI/UX & Mobile Responsiveness** | **2.0 / 10** | Complete mobile collapse; absurd DIY Firebase onboarding; fake community stats. |
| **Lighthouse Performance & SEO** | **4.0 / 10** | Console warnings, 404s, missing accessibility attributes, no structured metadata. |
