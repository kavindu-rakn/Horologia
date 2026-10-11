// Horologia — 7-Chapter Cinematic Scroll Engine
import { SceneManager } from './components/SceneManager.js';
import { WatchModel } from './components/WatchModel.js';
import { RaycasterManager } from './components/RaycasterManager.js';
import { soundEngine } from './audio/SoundEngine.js';
import { DesignStorageManager } from './core/DesignStorageManager.js';
import { appStore } from './core/Store.js';
import { MATERIAL_SCHEMES, CUSTOMIZER_OPTIONS } from './utils/constants.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// ── Chapter Definitions ──────────────────────────────────────────────────────
// Each chapter controls: camera, lookAt, watch group rotation, card content
const CHAPTERS = [
  {
    num: '01',
    title: 'The Art of Mechanical Precision',
    body: 'A single mechanical watch contains over 200 hand-finished components — each one indispensable. This masterpiece is crafted to endure for centuries, powered by nothing but the human wrist.',
    tags: ['28,800 VPH', 'Swiss Lever Escapement'],
    camera: { x: 0.2,  y: 0.8,  z: 7.2  },
    lookAt: { x: 0.2,  y: 0.0,  z: 0    },
    watchRot: { x: 0.38, y: -0.22, z: 0.0 },
    watchPos: { x: 0.35, y: 0.0,  z: 0   },
    autoRotate: true,   // gentle oscillation, not full spin
  },
  {
    num: '02',
    title: 'Domed Sapphire Crystal & Ceramic Bezel',
    body: 'Synthetic corundum — 9 Mohs hardness, second only to diamond. The domed sapphire crystal refracts light across the movement, while the ceramic bezel resists scratches and corrosion permanently.',
    tags: ['Al₂O₃ Corundum', 'Anti-Reflective Coating', '9H Hardness'],
    camera: { x: 0.8,  y: 1.6,  z: 6.6  },
    lookAt: { x: 0.2,  y: 0.3,  z: 0.6  },
    watchRot: { x: 0.36, y: -0.16, z: 0.0 },
    watchPos: { x: 0.35, y: -0.1, z: 0   },
    autoRotate: false,
  },
  {
    num: '03',
    title: 'Skeleton Dial & Luminescent Hands',
    body: 'The skeletonized dial ring reveals the movement beneath. Each hand is finished with SuperLumiNova C3 lume — glowing for up to 8 hours in complete darkness, charged by ambient light.',
    tags: ['SuperLumiNova C3', 'Beveled Indexes', 'Open-Worked Movement'],
    camera: { x: 0.4,  y: 0.9,  z: 5.6  },
    lookAt: { x: 0.15, y: 0.1,  z: 0.4  },
    watchRot: { x: 0.24, y: -0.12, z: 0.0 },
    watchPos: { x: 0.35, y: -0.1, z: 0   },
    autoRotate: false,
  },
  {
    num: '04',
    title: 'The Precision Gear Train',
    body: 'Five interlocking brass wheels transmit power from the mainspring barrel to the escapement. Each wheel tooth is hand-chamfered with an angle graver — a process taking 3 hours per wheel.',
    tags: ['Mainspring Barrel', 'Brass Alloy', 'Hand-Chamfered Teeth'],
    camera: { x: -2.0, y: 1.4,  z: 5.6  },
    lookAt: { x: -0.8, y: 0.4,  z: 0.3  },
    watchRot: { x: 0.30, y: 0.25, z: 0.0 },
    watchPos: { x: 0.55, y: -0.15, z: 0  },
    autoRotate: false,
  },
  {
    num: '05',
    title: 'Balance Wheel & Hairspring',
    body: 'The heart of the movement oscillates at 28,800 vibrations per hour — 4 Hz — governed by an isochronal flat hairspring. Each oscillation is regulated to ±2 seconds per day accuracy.',
    tags: ['4 Hz Oscillation', 'Glucydur Balance', 'Nivarox Hairspring'],
    camera: { x: -2.2, y: 1.8,  z: 5.2  },
    lookAt: { x: -1.4, y: 1.0,  z: 0.6  },
    watchRot: { x: 0.28, y: 0.22, z: 0.0 },
    watchPos: { x: 0.60, y: -0.25, z: 0  },
    autoRotate: false,
  },
  {
    num: '06',
    title: 'Bridges, Jewels & Architecture',
    body: '27 synthetic ruby jewels act as friction-free bearings for the gear pivots. The architectural mainplate bridges are hand-anglaged using a 45° chamfer — visible only under 10x magnification.',
    tags: ['27 Jewels', 'Côtes de Genève', 'Blued Screws'],
    camera: { x: 1.2,  y: 1.4,  z: 6.2  },
    lookAt: { x: 0.4,  y: 0.3,  z: 0.6  },
    watchRot: { x: 0.30, y: -0.15, z: 0.0 },
    watchPos: { x: 0.30, y: -0.10, z: 0  },
    autoRotate: false,
  },
  {
    num: '07',
    title: 'The Complete Holographic Matrix',
    body: 'Every component laid bare — 200+ parts in perfect spatial harmony. From the oscillating rotor that winds the mainspring, to the hairspring that governs each tick. This is time, deconstructed.',
    tags: ['200+ Components', 'Haute Horlogerie', 'Bespoke Movement'],
    camera: { x: 1.2,  y: 2.2,  z: 9.0  },
    lookAt: { x: 0.1,  y: 0.2,  z: 0    },
    watchRot: { x: 0.35, y: -0.25, z: 0.0 },
    watchPos: { x: 0.25, y: 0.0,  z: 0   },
    autoRotate: true,   // gentle oscillation in final holographic view
  },
];

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── Main App ─────────────────────────────────────────────────────────────────
class HorologiaApp {
  constructor() {
    window.app = this;
    this.container = document.getElementById('canvas-container');
    this.sceneManager = new SceneManager(this.container);
    this.watchModel = new WatchModel(this.sceneManager.scene);
    this.storageManager = new DesignStorageManager();

    // Check URL parameters for custom shared design via DesignStorageManager
    const initialConfig = this.storageManager.decodeShareableURL();
    if (initialConfig) {
      if (initialConfig.schemeId) {
        const match = MATERIAL_SCHEMES.find(s => s.id === initialConfig.schemeId);
        if (match) this.watchModel.applyMaterialScheme(match);
      }
      if (initialConfig.config) {
        this.watchModel.applyCustomConfig(initialConfig.config);
      }
    }

    this.currentChapter = 0;
    this.lastTime = performance.now();
    this.oscillationTime = 0;    // For gentle hero/final chapter ±15° swing
    this.manualControl = false;  // True when user drags the explode slider
    this.userHasRotated = false; // True when user manually rotates via drag
    this.isDragging = false;     // True when user drag-rotates the watch
    this.dragStart = { x: 0, y: 0 };
    this.dragRotStart = { x: 0, y: 0 };

    this.initSmoothScroll();
    this.initChapterEngine();
    this.initRaycaster();
    this.initUI();
    this.initDragRotate();   // ← drag-to-inspect any angle
    this.initMaterialLab();
    this.initSpecificationModal();
    this.initComponentDossierModal();
    this.initShowcaseGallery();
    this.initShareButton();

    // Activate hero chapter
    this.activateChapter(0, false);

    this.animate();
  }

  // ── Smooth Scroll Setup ──────────────────────────────────────────────────
  initSmoothScroll() {
    this.lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });
    this.lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => this.lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ── 7-Chapter Scroll Engine ───────────────────────────────────────────────
  initChapterEngine() {
    const totalChapters = CHAPTERS.length; // 7

    CHAPTERS.forEach((chapter, index) => {
      ScrollTrigger.create({
        trigger: '#scroll-proxy',
        start: () => `top+=${index * window.innerHeight}px top`,
        end: () => `top+=${(index + 1) * window.innerHeight}px top`,
        onEnter: () => this.activateChapter(index, true),
        onEnterBack: () => this.activateChapter(index, true),
      });
    });

    // Chapter progress fill — shows position within chapter
    ScrollTrigger.create({
      trigger: '#scroll-proxy',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const fill = document.getElementById('chapter-progress-fill');
        // Progress within the current chapter (0..1)
        const chapterProgress = (self.progress * totalChapters) % 1;
        if (fill) fill.style.width = `${chapterProgress * 100}%`;

        // Update slider (hidden from user when scrolling)
        const slider = document.getElementById('explode-slider');
        const label = document.getElementById('explode-percent');
        const chapterFloat = self.progress * (totalChapters - 1);
        const chapterIdx = Math.floor(chapterFloat);
        // Map slider 0..1 based on scroll position
        const sliderVal = self.progress;
        if (slider) slider.value = sliderVal;
        if (label) label.textContent = `${Math.round(sliderVal * 100)}%`;
        
        // Scrub the watch explosion perfectly to scroll progress
        this.watchModel.explodeByProgress(sliderVal);
      }
    });

    // Dot navigation
    document.querySelectorAll('.dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const ch = parseInt(dot.dataset.chapter);
        const px = (ch + 0.15) * window.innerHeight;
        this.lenis.scrollTo(px, { duration: 1.2 });
      });
    });
  }

  // ── Activate a Chapter — Camera + Explosion + Card ───────────────────────
  activateChapter(index, animate = true) {
    if (index === this.currentChapter && animate) return;
    this.currentChapter = index;
    this.userHasRotated = false; // Reset manual rotation flag on chapter change
    appStore.setState({ currentChapter: index });

    const ch = CHAPTERS[index];
    const duration = animate ? 1.6 : 0;

    // 1. Camera position + lookAt
    this.sceneManager.animateCamera(ch.camera, ch.lookAt, duration);

    // 2. Watch group rotation (chapter-specific dramatic angle)
    if (animate) {
      gsap.to(this.watchModel.group.rotation, {
        x: ch.watchRot.x,
        y: ch.watchRot.y,
        z: ch.watchRot.z,
        duration,
        ease: 'power2.inOut',
        overwrite: 'auto'
      });
      gsap.to(this.watchModel.group.position, {
        x: ch.watchPos.x,
        y: ch.watchPos.y,
        z: ch.watchPos.z,
        duration,
        ease: 'power2.inOut',
        overwrite: 'auto'
      });
    } else {
      this.watchModel.group.rotation.set(ch.watchRot.x, ch.watchRot.y, ch.watchRot.z);
      this.watchModel.group.position.set(ch.watchPos.x, ch.watchPos.y, ch.watchPos.z);
    }

    // 3. Part explosion state
    this.watchModel.explodeToChapter(index, duration);

    // 4. Auto-rotate toggle
    this.watchModel.autoRotate = ch.autoRotate;

    // 5. Acoustic expansion whoosh on chapter transition
    if (animate && index > 0) {
      soundEngine.playExpansionWhoosh();
    }

    // 6. Update chapter card UI
    this.updateChapterCard(index, animate);

    // 6. Update dot nav
    document.querySelectorAll('.dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });

    // 7. Play sound
    if (animate) soundEngine.playRatchetWinding();
  }

  updateChapterCard(index, animate) {
    const ch = CHAPTERS[index];
    const card = document.getElementById('chapter-card');
    const numEl = document.getElementById('chapter-num');
    const titleEl = document.getElementById('chapter-title');
    const bodyEl = document.getElementById('chapter-body');
    const tagsEl = document.getElementById('chapter-tags');

    if (animate) {
      // Fade out
      gsap.to([titleEl, bodyEl, tagsEl], {
        opacity: 0, y: -10, duration: 0.25, ease: 'power2.in',
        onComplete: () => {
          numEl.textContent = ch.num;
          titleEl.textContent = ch.title;
          bodyEl.textContent = ch.body;
          tagsEl.innerHTML = ch.tags.map(t => `<span class="tag">${t}</span>`).join('');
          // Fade in
          gsap.fromTo([titleEl, bodyEl, tagsEl],
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', stagger: 0.06 }
          );
        }
      });
    } else {
      numEl.textContent = ch.num;
      titleEl.textContent = ch.title;
      bodyEl.textContent = ch.body;
      tagsEl.innerHTML = ch.tags.map(t => `<span class="tag">${t}</span>`).join('');
    }
  }

  // ── Part Inspector (Hover) ───────────────────────────────────────────────
  initRaycaster() {
    const inspectorEl = document.getElementById('part-inspector');
    const titleEl = document.getElementById('inspector-title');
    const catEl = document.getElementById('inspector-category');
    const descEl = document.getElementById('inspector-desc');
    const metaEl = document.getElementById('inspector-meta');

    this.raycasterManager = new RaycasterManager(
      this.sceneManager,
      this.watchModel,
      (partInfo, partId) => {
        if (partInfo) {
          appStore.setState({ hoveredPartId: partId });
          titleEl.textContent = partInfo.name;
          catEl.textContent = partInfo.category;
          descEl.textContent = partInfo.function;
          metaEl.textContent = `${partInfo.material}${partInfo.specs ? ' · ' + partInfo.specs : ''}`;
          inspectorEl.classList.add('active');
        } else {
          appStore.setState({ hoveredPartId: null });
          inspectorEl.classList.remove('active');
        }
      },
      (partInfo, partId) => {
        this.openComponentDossier(partInfo, partId);
      }
    );
  }

  // ── Explode Slider (manual override) ────────────────────────────────────
  initUI() {
    const slider = document.getElementById('explode-slider');
    const label = document.getElementById('explode-percent');

    if (slider) {
      slider.addEventListener('pointerdown', () => { this.manualControl = true; });
      slider.addEventListener('pointerup', () => {
        setTimeout(() => { this.manualControl = false; }, 2000);
      });
      let lastSliderStep = 0;
      slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        appStore.setState({ explodeProgress: val });
        if (label) label.textContent = `${Math.round(val * 100)}%`;
        this.watchModel.explodeByProgress(val);

        // Tactile mechanical ratchet click every 2.5% of explosion
        const currentStep = Math.floor(val * 40);
        if (currentStep !== lastSliderStep) {
          lastSliderStep = currentStep;
          soundEngine.playRatchetTick(0.28);
        }
      });
    }

    const btnSound = document.getElementById('btn-sound');
    const soundIcon = document.getElementById('sound-icon');
    const soundLabel = document.getElementById('sound-label');
    btnSound.addEventListener('click', () => {
      soundEngine.init();
      const muted = soundEngine.toggleMute();
      appStore.setState({ isMuted: muted });
      soundIcon.textContent = muted ? '🔇' : '🔊';
      soundLabel.textContent = muted ? 'Muted' : 'Audio On';
    });
    window.addEventListener('click', () => soundEngine.init(), { once: true });

    // Kinetic Energy Flow Conduit Toggle
    const btnEnergyFlow = document.getElementById('btn-energy-flow');
    if (btnEnergyFlow) {
      btnEnergyFlow.addEventListener('click', () => {
        soundEngine.init();
        const isActive = this.watchModel.toggleEnergyFlow();
        if (isActive) {
          btnEnergyFlow.classList.add('active');
          btnEnergyFlow.textContent = '⚡ Kinetic Flow [ON]';
          soundEngine.playRatchetTick(0.4);
        } else {
          btnEnergyFlow.classList.remove('active');
          btnEnergyFlow.textContent = '⚡ Kinetic Flow';
          soundEngine.playMetallicClick();
        }
      });
    }

    // Global Escape key and backdrop dismissal for all modals and drawers
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const dossierModal = document.getElementById('dossier-modal');
        const wasDossierOpen = dossierModal && dossierModal.classList.contains('open');

        document.querySelectorAll('.modal-overlay.open').forEach(modal => {
          modal.classList.remove('open');
        });
        const labDrawer = document.getElementById('material-lab');
        const btnCustomizer = document.getElementById('btn-customizer');
        if (labDrawer && labDrawer.classList.contains('open')) {
          labDrawer.classList.remove('open');
          if (btnCustomizer) btnCustomizer.classList.remove('active');
        }

        if (wasDossierOpen) {
          const ch = CHAPTERS[this.currentChapter];
          if (ch) this.sceneManager.animateCamera(ch.camera, ch.lookAt, 1.2);
        }
      }
    });

    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          const wasDossier = (modal.id === 'dossier-modal');
          modal.classList.remove('open');
          if (wasDossier) {
            const ch = CHAPTERS[this.currentChapter];
            if (ch) this.sceneManager.animateCamera(ch.camera, ch.lookAt, 1.2);
          }
        }
      });
    });
  }

  // ── Atelier Studio (Customizer Suite) ─────────────────────────────────────
  initMaterialLab() {
    const labDrawer = document.getElementById('material-lab');
    const btnCustomizer = document.getElementById('btn-customizer');
    const btnCloseLab = document.getElementById('btn-close-lab');
    const presetContainer = document.getElementById('preset-container');

    const tabPresets = document.getElementById('tab-presets');
    const tabBespoke = document.getElementById('tab-bespoke');
    const presetsView = document.getElementById('presets-view');
    const bespokeView = document.getElementById('bespoke-view');

    // Tab Navigation
    tabPresets.addEventListener('click', () => {
      tabPresets.classList.add('active');
      tabPresets.setAttribute('aria-selected', 'true');
      tabBespoke.classList.remove('active');
      tabBespoke.setAttribute('aria-selected', 'false');
      presetsView.classList.add('active');
      bespokeView.classList.remove('active');
      soundEngine.playRatchetTick(0.2);
    });

    tabBespoke.addEventListener('click', () => {
      tabBespoke.classList.add('active');
      tabBespoke.setAttribute('aria-selected', 'true');
      tabPresets.classList.remove('active');
      tabPresets.setAttribute('aria-selected', 'false');
      bespokeView.classList.add('active');
      presetsView.classList.remove('active');
      soundEngine.playRatchetTick(0.2);
    });

    btnCustomizer.addEventListener('click', () => {
      const isOpen = labDrawer.classList.toggle('open');
      btnCustomizer.classList.toggle('active');
      appStore.setState({ activeModal: isOpen ? 'materialLab' : null });
      if (isOpen) {
        soundEngine.playRatchetTick(0.3);
        this.renderBespokeCustomizer();
      }
    });

    btnCloseLab.addEventListener('click', () => {
      labDrawer.classList.remove('open');
      btnCustomizer.classList.remove('active');
      appStore.setState({ activeModal: null });
    });

    // 1. Render Curated Presets
    presetContainer.innerHTML = MATERIAL_SCHEMES.map(s => `
      <div class="preset-card ${s.id === this.watchModel.currentScheme.id ? 'active' : ''}" data-scheme-id="${s.id}">
        <div class="preset-color-swatch" style="background: linear-gradient(135deg, #${s.caseColor.toString(16).padStart(6, '0')} 50%, #${s.secondaryColor.toString(16).padStart(6, '0')} 50%)"></div>
        <div class="preset-info">
          <h4>${s.name}</h4>
          <p>${s.tagline}</p>
        </div>
      </div>
    `).join('');

    presetContainer.addEventListener('click', (e) => {
      const card = e.target.closest('.preset-card');
      if (!card) return;
      const scheme = MATERIAL_SCHEMES.find(s => s.id === card.dataset.schemeId);
      if (scheme) {
        this.watchModel.applyMaterialScheme(scheme);
        appStore.setState({ schemeId: scheme.id });
        soundEngine.playRatchetWinding();
        document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.renderBespokeCustomizer();
      }
    });

    // 2. Render Bespoke Customizer
    this.renderBespokeCustomizer();

    // 3. Quick Snapshot Action
    const btnSnapshot = document.getElementById('btn-snapshot');
    if (btnSnapshot) {
      btnSnapshot.addEventListener('click', () => {
        soundEngine.playRatchetWinding();
        const casingOpt = this.watchModel.currentConfig.casing || 'custom';
        this.sceneManager.downloadSnapshot(`horologia-${casingOpt}-chronometer.png`);
      });
    }

    // 4. View Certificate of Manufacture
    const btnViewSpecs = document.getElementById('btn-view-specs');
    if (btnViewSpecs) {
      btnViewSpecs.addEventListener('click', () => {
        soundEngine.playRatchetTick(0.3);
        this.openSpecificationModal();
      });
    }

    // 5. Save Design Modal Flow
    const btnOpenSave = document.getElementById('btn-open-save-modal');
    const saveModal = document.getElementById('save-modal');
    const btnCloseSave = document.getElementById('btn-close-save');
    const saveForm = document.getElementById('save-design-form');
    const savePreviewThumb = document.getElementById('save-preview-thumb');
    const saveRefNumber = document.getElementById('save-ref-number');
    const saveSpecSummary = document.getElementById('save-spec-summary');

    btnOpenSave.addEventListener('click', () => {
      soundEngine.playRatchetTick(0.3);
      // Capture live WebGL canvas thumbnail
      const thumbnailDataUrl = this.sceneManager.captureThumbnail(320, 240);
      if (savePreviewThumb && thumbnailDataUrl) {
        savePreviewThumb.src = thumbnailDataUrl;
      }
      const specs = this.watchModel.getWatchSpecifications();
      if (saveRefNumber) saveRefNumber.textContent = specs.referenceNumber;
      if (saveSpecSummary) saveSpecSummary.textContent = `${specs.casing} · ${specs.dial}`;

      saveModal.classList.add('open');
    });

    btnCloseSave.addEventListener('click', () => saveModal.classList.remove('open'));

    saveForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('watch-title').value;
      const creator = document.getElementById('creator-name').value;
      const desc = document.getElementById('design-desc').value;
      const specs = this.watchModel.getWatchSpecifications();
      const thumbnailDataUrl = this.sceneManager.captureThumbnail(320, 240);

      await this.storageManager.saveDesign({
        title,
        creator,
        description: desc,
        schemeId: this.watchModel.currentScheme.id,
        config: { ...this.watchModel.currentConfig },
        refNumber: specs.referenceNumber,
        thumbnail: thumbnailDataUrl,
        specs
      });

      saveModal.classList.remove('open');
      saveForm.reset();
      soundEngine.playRatchetWinding();

      // Subtle luxury notification glow
      const card = document.getElementById('chapter-card');
      if (card) {
        card.style.boxShadow = '0 0 50px rgba(201, 164, 74, 0.7)';
        setTimeout(() => { card.style.boxShadow = ''; }, 1400);
      }
    });
  }

  // ── Render Granular Bespoke Customizer ────────────────────────────────────
  renderBespokeCustomizer() {
    const bespokeContainer = document.getElementById('bespoke-customizer-container');
    if (!bespokeContainer) return;

    const categories = [
      { key: 'casing', title: '1. Casing & Lugs Metallurgy' },
      { key: 'dial', title: '2. Dial Architecture & Finish' },
      { key: 'lume', title: '3. Hands & Super-LumiNova' },
      { key: 'bezel', title: '4. Bezel Ring Finish' },
      { key: 'strap', title: '5. Strap & Clasp Style' }
    ];

    const currentCfg = this.watchModel.currentConfig;
    const caseColorHex = (CUSTOMIZER_OPTIONS.casing.find(c => c.id === currentCfg.casing)?.color || 0xdf9a68).toString(16).padStart(6, '0');

    bespokeContainer.innerHTML = categories.map(cat => {
      const options = CUSTOMIZER_OPTIONS[cat.key] || [];
      return `
        <div class="bespoke-category" data-cat="${cat.key}">
          <div class="bespoke-cat-title">${cat.title}</div>
          <div class="bespoke-grid">
            ${options.map(opt => {
              const isActive = (currentCfg[cat.key] === opt.id);
              let swatchStyle = '';
              if (opt.matchCase) {
                swatchStyle = `background: #${caseColorHex};`;
              } else if (opt.color !== undefined) {
                swatchStyle = `background: #${opt.color.toString(16).padStart(6, '0')};`;
              } else {
                swatchStyle = 'background: #2a3447;';
              }

              return `
                <div class="bespoke-card ${isActive ? 'active' : ''}" data-cat="${cat.key}" data-opt-id="${opt.id}">
                  <div class="bespoke-swatch" style="${swatchStyle}"></div>
                  <div class="bespoke-info">
                    <h5>${opt.name}</h5>
                    <p>${opt.subtitle || ''}</p>
                  </div>
                  ${opt.specs ? `<span class="bespoke-badge">${opt.specs.split('|')[0].trim()}</span>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');

    // Click handler for bespoke options
    bespokeContainer.querySelectorAll('.bespoke-card').forEach(card => {
      card.addEventListener('click', () => {
        const cat = card.dataset.cat;
        const optId = card.dataset.optId;
        this.watchModel.applyCustomOption(cat, optId);
        soundEngine.playRatchetTick(0.28);
        this.renderBespokeCustomizer();
      });
    });
  }

  // ── Haute Horlogerie Certificate / Specification Sheet Modal ─────────────
  initSpecificationModal() {
    const specModal = document.getElementById('spec-modal');
    const btnCloseSpec = document.getElementById('btn-close-spec');
    const btnPrint = document.getElementById('btn-print-certificate');
    const btnShare = document.getElementById('btn-spec-share');

    if (btnCloseSpec) {
      btnCloseSpec.addEventListener('click', () => specModal.classList.remove('open'));
    }

    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        soundEngine.playRatchetWinding();
        window.print();
      });
    }

    if (btnShare) {
      btnShare.addEventListener('click', () => {
        const shareUrl = this.storageManager.encodeShareableURL({
          schemeId: this.watchModel.currentScheme.id,
          config: this.watchModel.currentConfig
        });
        navigator.clipboard?.writeText(shareUrl).then(() => {
          btnShare.textContent = '✓ Link Copied!';
          soundEngine.playRatchetWinding();
          setTimeout(() => { btnShare.textContent = '↗ Share Timepiece'; }, 2000);
        });
      });
    }
  }

  openSpecificationModal(customSpecs = null) {
    const specModal = document.getElementById('spec-modal');
    const certBody = document.getElementById('certificate-body');
    if (!specModal || !certBody) return;

    const specs = customSpecs || this.watchModel.getWatchSpecifications();

    certBody.innerHTML = `
      <div class="cert-header">
        <div class="cert-ref">${escapeHTML(specs.referenceNumber)}</div>
        <div class="cert-model">${escapeHTML(specs.calibre)} · ${escapeHTML(specs.manufacture)}</div>
      </div>
      <div class="cert-grid">
        <div>
          <div class="cert-item-title">Chassis & Lugs</div>
          <div class="cert-item-val">${escapeHTML(specs.casing)}</div>
          <div class="cert-item-sub">${escapeHTML(specs.casingSpecs || '')}</div>
        </div>
        <div>
          <div class="cert-item-title">Dimensions</div>
          <div class="cert-item-val">${escapeHTML(specs.dimensions)}</div>
          <div class="cert-item-sub">Double-Domed Sapphire Crystal (IOR 1.77)</div>
        </div>
        <div>
          <div class="cert-item-title">Dial Architecture</div>
          <div class="cert-item-val">${escapeHTML(specs.dial)}</div>
          <div class="cert-item-sub">${escapeHTML(specs.dialSpecs || '')}</div>
        </div>
        <div>
          <div class="cert-item-title">Bezel Ring</div>
          <div class="cert-item-val">${escapeHTML(specs.bezel)}</div>
          <div class="cert-item-sub">${escapeHTML(specs.bezelSpecs || '')}</div>
        </div>
        <div>
          <div class="cert-item-title">Luminescence</div>
          <div class="cert-item-val">${escapeHTML(specs.lume)}</div>
          <div class="cert-item-sub">${escapeHTML(specs.lumeSpecs || '')}</div>
        </div>
        <div>
          <div class="cert-item-title">Strap & Clasp</div>
          <div class="cert-item-val">${escapeHTML(specs.strap)}</div>
          <div class="cert-item-sub">${escapeHTML(specs.strapSpecs || '')}</div>
        </div>
      </div>
      <div class="cert-movement-block">
        <div class="cert-movement-title">Manufacture Movement Specifications</div>
        <div class="cert-movement-list">
          • <strong>Regulator:</strong> ${escapeHTML(specs.movementSpecs.escapement)}<br>
          • <strong>Oscillator:</strong> ${escapeHTML(specs.movementSpecs.frequency)} (${escapeHTML(specs.movementSpecs.hairspring)})<br>
          • <strong>Jeweling:</strong> ${escapeHTML(specs.movementSpecs.jewels)}<br>
          • <strong>Power Reserve:</strong> ${escapeHTML(specs.movementSpecs.powerReserve)}<br>
          • <strong>Shock Protection:</strong> ${escapeHTML(specs.movementSpecs.shockAbsorber)}<br>
          • <strong>Haute Finishes:</strong> ${escapeHTML(specs.movementSpecs.finishing)}
        </div>
      </div>
    `;

    specModal.classList.add('open');
  }

  // ── Haute Horlogerie Component Dossier Modal ──────────────────────────────
  initComponentDossierModal() {
    const modal = document.getElementById('dossier-modal');
    const btnClose = document.getElementById('btn-close-dossier');
    const btnCloseFooter = document.getElementById('btn-dossier-close-footer');
    const btnFocus = document.getElementById('btn-dossier-focus');

    const closeModal = () => {
      if (modal && modal.classList.contains('open')) {
        modal.classList.remove('open');
        soundEngine.playMetallicClick();
        // Restore active chapter camera framing so user isn't stuck in macro zoom
        const ch = CHAPTERS[this.currentChapter];
        if (ch) {
          this.sceneManager.animateCamera(ch.camera, ch.lookAt, 1.2);
        }
      }
    };

    if (btnClose) btnClose.addEventListener('click', closeModal);
    if (btnCloseFooter) btnCloseFooter.addEventListener('click', closeModal);

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }

    if (btnFocus) {
      btnFocus.addEventListener('click', () => {
        if (this.selectedPartInfo && this.selectedPartInfo.focusCamera) {
          const { camera, lookAt } = this.selectedPartInfo.focusCamera;
          this.sceneManager.animateCamera(camera, lookAt, 1.2);
          soundEngine.playRatchetWinding();
        }
      });
    }
  }

  openComponentDossier(partInfo, partId) {
    if (!partInfo) return;
    this.selectedPartInfo = partInfo;

    const modal = document.getElementById('dossier-modal');
    if (!modal) return;

    // Smoothly animate camera to macro focus coordinates
    if (partInfo.focusCamera) {
      const { camera, lookAt } = partInfo.focusCamera;
      this.sceneManager.animateCamera(camera, lookAt, 1.4);
    }

    // Populate educational dossier metadata
    const titleEl = document.getElementById('dossier-title');
    const catEl = document.getElementById('dossier-category');
    const hardnessEl = document.getElementById('dossier-hardness');
    const materialEl = document.getElementById('dossier-material');
    const functionEl = document.getElementById('dossier-function');
    const specsBadgeEl = document.getElementById('dossier-specs-badge');
    const physicsEl = document.getElementById('dossier-physics');
    const metallurgyEl = document.getElementById('dossier-metallurgy');
    const finishingEl = document.getElementById('dossier-finishing');

    if (titleEl) titleEl.textContent = partInfo.name;
    if (catEl) catEl.textContent = partInfo.category;
    if (hardnessEl) hardnessEl.textContent = partInfo.hardness || 'Certified Horology Standard';
    if (materialEl) materialEl.textContent = partInfo.material;
    if (functionEl) functionEl.textContent = partInfo.function;
    if (specsBadgeEl) {
      specsBadgeEl.textContent = partInfo.specs ? `Specifications: ${partInfo.specs}` : 'Manufacture Standard';
    }
    if (physicsEl) {
      physicsEl.textContent = partInfo.physicsPrinciple || 'Mechanical equilibrium and kinematic conservation of angular momentum.';
    }
    if (metallurgyEl) {
      metallurgyEl.textContent = partInfo.metallurgy || 'Haute Horlogerie certified alloy with superior corrosion and fatigue resistance.';
    }
    if (finishingEl) {
      finishingEl.textContent = partInfo.finishingTechnique || 'Hand-chamfered anglage, circular perlage, and mirror-polished specular bevels.';
    }

    modal.classList.add('open');
  }

  // ── Community Showcase Gallery ───────────────────────────────────────────
  initShowcaseGallery() {
    const showcaseModal = document.getElementById('showcase-modal');
    const btnShowcase = document.getElementById('btn-showcase');
    const btnCloseShowcase = document.getElementById('btn-close-showcase');
    const galleryContainer = document.getElementById('gallery-container');

    btnShowcase.addEventListener('click', async () => {
      soundEngine.playRatchetTick(0.3);
      showcaseModal.classList.add('open');
      await this.renderShowcaseCards(galleryContainer);
    });
    btnCloseShowcase.addEventListener('click', () => showcaseModal.classList.remove('open'));
  }

  async renderShowcaseCards(container) {
    container.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1;">Loading community watches...</p>`;
    const designs = await this.storageManager.fetchCommunityDesigns();

    container.innerHTML = designs.map(d => {
      const casingName = CUSTOMIZER_OPTIONS.casing.find(c => c.id === d.config?.casing)?.name || 'Noble Alloy';
      const dialName = CUSTOMIZER_OPTIONS.dial.find(dial => dial.id === d.config?.dial)?.name || 'Artisan Dial';
      const lumeName = CUSTOMIZER_OPTIONS.lume.find(l => l.id === d.config?.lume)?.name || 'Lume';

      return `
        <div class="gallery-card">
          <div class="gallery-thumb-container">
            ${d.thumbnail ? `
              <img class="gallery-thumb-img" src="${d.thumbnail}" alt="${escapeHTML(d.title)}" />
            ` : `
              <div style="font-size: 2.2rem; filter: drop-shadow(0 0 12px rgba(201,164,74,0.4));">⌚</div>
            `}
          </div>
          <div class="card-header-row">
            <h4>${escapeHTML(d.title)}</h4>
            <span class="ref-badge" style="font-size: 0.62rem;">${escapeHTML(d.refNumber || 'REF. H-BESPOKE')}</span>
          </div>
          <p class="card-creator">By ${escapeHTML(d.creator || 'Anonymous Artisan')} · ${escapeHTML(d.timestamp || 'Recently')}</p>
          <p class="card-desc">${escapeHTML(d.description || 'A bespoke Horologia caliber finish.')}</p>
          <div class="card-tags">
            <span class="tag-pill">${escapeHTML(casingName.split(' ')[0])}</span>
            <span class="tag-pill">${escapeHTML(dialName.split(' ')[0])}</span>
            <span class="tag-pill">${escapeHTML(lumeName.replace('Super-LumiNova ', ''))}</span>
          </div>
          <div class="card-footer-actions">
            <button class="fork-btn" data-id="${escapeHTML(d.id)}" title="Fork this design into Atelier">✦ Fork Build</button>
            <button class="specs-btn" data-id="${escapeHTML(d.id)}" title="Certificate & Specs">📜</button>
            <button class="like-btn" data-id="${escapeHTML(d.id)}">❤ ${d.likes || 1}</button>
            <button class="export-btn" data-id="${escapeHTML(d.id)}" title="Export JSON">⤓</button>
          </div>
        </div>
      `;
    }).join('');

    // Fork Build Action
    container.querySelectorAll('.fork-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const forkDraft = this.storageManager.forkDesign(btn.dataset.id);
        if (forkDraft) {
          if (forkDraft.schemeId) {
            const scheme = MATERIAL_SCHEMES.find(s => s.id === forkDraft.schemeId) || MATERIAL_SCHEMES[0];
            this.watchModel.applyMaterialScheme(scheme);
          }
          if (forkDraft.config) {
            this.watchModel.applyCustomConfig(forkDraft.config);
          }

          // Pre-fill save form
          const titleInput = document.getElementById('watch-title');
          const descInput = document.getElementById('design-desc');
          if (titleInput) titleInput.value = forkDraft.title;
          if (descInput) descInput.value = forkDraft.description;

          // Open Atelier Studio drawer
          const labDrawer = document.getElementById('material-lab');
          const btnCustomizer = document.getElementById('btn-customizer');
          if (labDrawer) labDrawer.classList.add('open');
          if (btnCustomizer) btnCustomizer.classList.add('active');
          document.getElementById('showcase-modal').classList.remove('open');

          this.renderBespokeCustomizer();
          soundEngine.playRatchetWinding();

          // Visual confirmation
          const card = document.getElementById('chapter-card');
          if (card) {
            card.style.boxShadow = '0 0 50px rgba(201, 164, 74, 0.7)';
            setTimeout(() => { card.style.boxShadow = ''; }, 1400);
          }
        }
      });
    });

    // View Specs Action
    container.querySelectorAll('.specs-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const d = designs.find(item => item.id === btn.dataset.id);
        if (d) {
          if (d.specs) {
            this.openSpecificationModal(d.specs);
          } else if (d.config) {
            this.watchModel.applyCustomConfig(d.config);
            this.openSpecificationModal();
          }
          soundEngine.playRatchetTick(0.3);
        }
      });
    });

    // Like Action
    container.querySelectorAll('.like-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        await this.storageManager.likeDesign(btn.dataset.id);
        soundEngine.playRatchetTick(0.2);
        await this.renderShowcaseCards(container);
      });
    });

    // Export JSON Action
    container.querySelectorAll('.export-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const d = designs.find(item => item.id === btn.dataset.id);
        if (d) {
          this.storageManager.exportDesignJSON(d);
          soundEngine.playRatchetWinding();
        }
      });
    });
  }

  // ── Share Current Timepiece Build ─────────────────────────────────────────
  initShareButton() {
    const btnShare = document.getElementById('btn-share-build');
    if (!btnShare) return;

    const defaultLabel = '↗ Share';
    let resetTimer = null;

    btnShare.addEventListener('click', () => {
      const shareUrl = this.storageManager.encodeShareableURL({
        schemeId: this.watchModel.currentScheme.id,
        config: this.watchModel.currentConfig,
        title: 'Bespoke Horologia Chronometer'
      });

      const handleSuccess = () => {
        if (resetTimer) clearTimeout(resetTimer);
        btnShare.textContent = '✓ Copied!';
        soundEngine.playRatchetWinding();
        resetTimer = setTimeout(() => {
          btnShare.textContent = defaultLabel;
        }, 2000);
      };

      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(shareUrl)
          .then(handleSuccess)
          .catch(() => {
            prompt('Copy your custom timepiece URL:', shareUrl);
          });
      } else {
        prompt('Copy your custom timepiece URL:', shareUrl);
      }
    });
  }

  // ── Drag-to-Rotate — lets user inspect back/sides by dragging the canvas ──
  // Left-click drag rotates the watch freely in X and Y.
  // Drag is ignored when over any UI element (chapter card, HUD, header).
  initDragRotate() {
    const canvas = this.container;

    const isOverUI = (e) => {
      const uiIds = ['chapter-card', 'explode-hud', 'site-header', 'chapter-dots', 'part-inspector', 'material-lab'];
      return uiIds.some(id => document.getElementById(id)?.contains(e.target));
    };

    canvas.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || isOverUI(e)) return;
      this.isDragging = true;
      this.userHasRotated = true;
      this.dragStart = { x: e.clientX, y: e.clientY };
      this.dragRotStart = {
        x: this.watchModel.group.rotation.x,
        y: this.watchModel.group.rotation.y,
      };
      // Pause oscillation and chapter rotation while dragging
      this.watchModel.autoRotate = false;
      canvas.style.cursor = 'grabbing';
      e.preventDefault();
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.isDragging) return;
      const dx = (e.clientX - this.dragStart.x) * 0.008;
      const dy = (e.clientY - this.dragStart.y) * 0.008;
      this.watchModel.group.rotation.y = this.dragRotStart.y + dx;
      this.watchModel.group.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2,
        this.dragRotStart.x + dy
      ));
    });

    window.addEventListener('pointerup', () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      canvas.style.cursor = 'grab';
      // Re-enable chapter auto-rotate if applicable
      this.watchModel.autoRotate = CHAPTERS[this.currentChapter].autoRotate;
    });

    canvas.style.cursor = 'grab';
  }

  // ── Render Loop ──────────────────────────────────────────────────────────
  animate() {
    requestAnimationFrame(() => this.animate());

    const now = performance.now();
    const delta = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;
    this.oscillationTime += delta;

    // Gentle ±15° oscillating swing (not full spin — always shows front face)
    if (this.watchModel.autoRotate && !this.userHasRotated) {
      const baseY = CHAPTERS[this.currentChapter].watchRot.y;
      this.watchModel.group.rotation.y = baseY + Math.sin(this.oscillationTime * 0.45) * 0.26;
    }

    this.watchModel.updateKinematics(delta);
    this.sceneManager.update();
    this.raycasterManager.update();
    this.sceneManager.render();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.horologiaApp = new HorologiaApp();
});
