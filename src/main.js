// Horologia — 7-Chapter Cinematic Scroll Engine
import { SceneManager } from './components/SceneManager.js';
import { WatchModel } from './components/WatchModel.js';
import { RaycasterManager } from './components/RaycasterManager.js';
import { soundEngine } from './audio/SoundEngine.js';
import { DesignStorageManager } from './core/DesignStorageManager.js';
import { appStore } from './core/Store.js';
import { MATERIAL_SCHEMES } from './utils/constants.js';
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
    if (initialConfig && initialConfig.schemeId) {
      const match = MATERIAL_SCHEMES.find(s => s.id === initialConfig.schemeId);
      if (match) this.watchModel.applyMaterialScheme(match);
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
  }

  // ── Material Lab ─────────────────────────────────────────────────────────
  initMaterialLab() {
    const labDrawer = document.getElementById('material-lab');
    const btnCustomizer = document.getElementById('btn-customizer');
    const btnCloseLab = document.getElementById('btn-close-lab');
    const presetContainer = document.getElementById('preset-container');

    btnCustomizer.addEventListener('click', () => {
      const isOpen = labDrawer.classList.toggle('open');
      btnCustomizer.classList.toggle('active');
      appStore.setState({ activeModal: isOpen ? 'materialLab' : null });
    });
    btnCloseLab.addEventListener('click', () => {
      labDrawer.classList.remove('open');
      btnCustomizer.classList.remove('active');
      appStore.setState({ activeModal: null });
    });

    presetContainer.innerHTML = MATERIAL_SCHEMES.map(s => `
      <div class="preset-card ${s.id === this.watchModel.currentScheme.id ? 'active' : ''}" data-scheme-id="${s.id}">
        <div class="preset-color-swatch" style="background: linear-gradient(135deg, #${s.caseColor.toString(16).padStart(6, '0')} 50%, #${s.secondaryColor.toString(16).padStart(6, '0')} 50%)"></div>
        <div class="preset-info"><h4>${s.name}</h4><p>${s.tagline}</p></div>
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
      }
    });

    const btnOpenSave = document.getElementById('btn-open-save-modal');
    const saveModal = document.getElementById('save-modal');
    const btnCloseSave = document.getElementById('btn-close-save');
    const saveForm = document.getElementById('save-design-form');

    btnOpenSave.addEventListener('click', () => saveModal.classList.add('open'));
    btnCloseSave.addEventListener('click', () => saveModal.classList.remove('open'));

    saveForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('watch-title').value;
      const creator = document.getElementById('creator-name').value;
      const desc = document.getElementById('design-desc').value;
      await this.storageManager.saveDesign({ title, creator, description: desc, schemeId: this.watchModel.currentScheme.id });
      saveModal.classList.remove('open');
      saveForm.reset();
      // Saved — subtle luxury notification
      const card = document.getElementById('chapter-card');
      if (card) {
        card.style.boxShadow = '0 0 40px rgba(201, 164, 74, 0.6)';
        setTimeout(() => { card.style.boxShadow = ''; }, 1200);
      }
    });
  }

  // ── Showcase Gallery ─────────────────────────────────────────────────────
  initShowcaseGallery() {
    const showcaseModal = document.getElementById('showcase-modal');
    const btnShowcase = document.getElementById('btn-showcase');
    const btnCloseShowcase = document.getElementById('btn-close-showcase');
    const galleryContainer = document.getElementById('gallery-container');

    btnShowcase.addEventListener('click', async () => {
      showcaseModal.classList.add('open');
      await this.renderShowcaseCards(galleryContainer);
    });
    btnCloseShowcase.addEventListener('click', () => showcaseModal.classList.remove('open'));
  }

  async renderShowcaseCards(container) {
    container.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1;">Loading community watches...</p>`;
    const designs = await this.storageManager.fetchCommunityDesigns();
    container.innerHTML = designs.map(d => `
      <div class="gallery-card">
        <h4>${escapeHTML(d.title)}</h4>
        <p style="font-size: 0.7rem; color: var(--accent-gold); margin-bottom: 6px;">By ${escapeHTML(d.creator)} · ${escapeHTML(d.timestamp || 'Recently')}</p>
        <p>${escapeHTML(d.description || 'A bespoke Horologia movement finish.')}</p>
        <div class="card-footer">
          <button class="like-btn" data-id="${escapeHTML(d.id)}">❤ ${d.likes || 1}</button>
          <button class="load-btn" data-scheme-id="${escapeHTML(d.schemeId)}">Load Design</button>
          <button class="export-btn" data-id="${escapeHTML(d.id)}" title="Export specification JSON">⤓ JSON</button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.load-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const scheme = MATERIAL_SCHEMES.find(s => s.id === btn.dataset.schemeId) || MATERIAL_SCHEMES[0];
        this.watchModel.applyMaterialScheme(scheme);
        soundEngine.playRatchetWinding();
        document.getElementById('showcase-modal').classList.remove('open');
      });
    });
    container.querySelectorAll('.like-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        await this.storageManager.likeDesign(btn.dataset.id);
        await this.renderShowcaseCards(container);
      });
    });
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
        schemeId: this.watchModel.currentScheme.id
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
