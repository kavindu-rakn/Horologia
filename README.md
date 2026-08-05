# Horologia - Exploded 3D Mechanical Watch Movement

> **Haute Horlogerie meets modern WebGL storytelling.** An interactive 3D mechanical watch movement that gracefully dismantles gear by gear as you scroll, featuring interactive raycasting tooltips, real-time PBR material customization, synthesized Web Audio mechanics, and Firebase cloud persistence.

---

## ✨ Features

- **Procedural 3D Mechanical Watch**: 14 discrete components including Sapphire Glass, Ceramic Bezel, Outer Case Lugs, Skeleton Dial & Hands, Skeleton Mainplate, Architectural Movement Bridges, 5-stage Gear Train with teeth, Escapement & Pallet jewels, Glucydur Balance Wheel with Breguet hairspring, Tourbillon cage, 27 Synthetic Ruby Jewels, Automatic Rotor, and Hand-Stitched Strap.
- **Scroll-Driven Exploded Assembly**: Scroll-driven 3D matrix expansion revealing the inner clockwork powered by Three.js, GSAP ScrollTrigger, and Lenis smooth scrolling.
- **Interactive Component Inspector**: Real-time HUD tooltips displaying component name, hardness scale, friction coefficient, material composition, and horological function on hover.
- **Synthesized Web Audio Ticking Engine**: Web Audio API ticker running at 28,800 VPH (4Hz) with alternating pallet jewel clicks, ratchet winding feedback, and expansion whoosh sounds.
- **Bespoke Material Lab Customizer**: Real-time PBR material swapper featuring preset schemes (*Rose Gold Haute*, *Obsidian Stealth PVD*, *Ice Platinum*, *Emerald Sovereign*, *Titanium Futura*).
- **Firebase Firestore & Local Storage Sync**: Save custom watch creations, publish them to a global showcase gallery, like community designs, and load them live with 1 click.

---

## 🛠️ Tech Stack

- **Bundler**: Vite
- **Core**: Vanilla JavaScript (ES6+)
- **3D / WebGL**: Three.js
- **Animations**: GSAP (ScrollTrigger) & Lenis Smooth Scroll
- **Backend & Database**: Firebase Firestore & Anonymous Auth (with LocalStorage fallback)
- **Audio Engine**: Synthesized Web Audio API
- **Styling**: Vanilla CSS & Custom Glassmorphism System

---

## 🚀 Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Horologia.git
   cd Horologia
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local dev server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## ⚡ Firebase Cloud Configuration (Optional)

Horologia works **100% out of the box** using browser LocalStorage persistence. To connect your own free Firebase Cloud Firestore database:

1. Create a project at [Firebase Console](https://console.firebase.google.com/).
2. Enable Firestore Database in Test Mode.
3. Click the **⚡ Firebase Setup** button in the app header and paste your `firebaseConfig` JSON object!

---

## 📜 License

MIT License - feel free to use and expand upon for your own creative coding projects!
