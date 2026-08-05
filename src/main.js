// Horologia - Main Application Entry Point
import { SceneManager } from './components/SceneManager.js';
import { WatchModel } from './components/WatchModel.js';
import { RaycasterManager } from './components/RaycasterManager.js';
import { soundEngine } from './audio/SoundEngine.js';
import { FirebaseManager } from './components/FirebaseManager.js';
import { MATERIAL_SCHEMES } from './utils/constants.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import confetti from 'canvas-confetti';

gsap.registerPlugin(ScrollTrigger);

class HorologiaApp {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.sceneManager = new SceneManager(this.container);
    this.watchModel = new WatchModel(this.sceneManager.scene);
    this.firebaseManager = new FirebaseManager();

    this.explodeProgress = 0;
    this.lastTime = performance.now();

    this.initSmoothScroll();
    this.initRaycaster();
    this.initScrollAnimations();
    this.initUI();
    this.initMaterialLab();
    this.initShowcaseGallery();
    this.initFirebaseGuide();

    window.addEventListener('resize', () => {
      const isDesktop = window.innerWidth > 900;
      this.watchModel.group.position.x = isDesktop ? 1.1 : 0;
    });

    this.animate();
  }

  initSmoothScroll() {
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });

    this.lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  initScrollAnimations() {
    gsap.to(this, {
      explodeProgress: 1.0,
      scrollTrigger: {
        trigger: '.scroll-container',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        onUpdate: (self) => {
          this.updateExplosion(self.progress);
          this.updateStoryCards(self.progress);
        }
      }
    });

    // Dramatic 3/4 Isometric Perspective Rotation Timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.scroll-container',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2
      }
    });

    tl.to(this.watchModel.group.rotation, { x: 0.52, y: -0.55, z: 0.12 }, 0)
      .to(this.watchModel.group.rotation, { x: 0.65, y: -0.75, z: 0.2 }, 0.3)
      .to(this.watchModel.group.rotation, { x: 0.45, y: -0.35, z: 0.05 }, 0.6)
      .to(this.watchModel.group.rotation, { x: 0.6, y: -0.65, z: 0.15 }, 1.0);
  }

  updateExplosion(val) {
    this.explodeProgress = val;
    this.watchModel.updateExplosion(val);

    const slider = document.getElementById('explode-slider');
    const label = document.getElementById('explode-percent');
    if (slider) slider.value = val;
    if (label) label.textContent = `${Math.round(val * 100)}%`;
  }

  updateStoryCards(progress) {
    const cards = document.querySelectorAll('.story-card');
    const total = cards.length;
    cards.forEach((card, idx) => {
      const targetStart = idx / total;
      const targetEnd = (idx + 1) / total;
      if (progress >= targetStart - 0.05 && progress <= targetEnd + 0.05) {
        card.classList.add('visible');
      } else {
        card.classList.remove('visible');
      }
    });
  }

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
          titleEl.textContent = partInfo.name;
          catEl.textContent = partInfo.category;
          descEl.textContent = partInfo.function;
          metaEl.textContent = `${partInfo.material} | ${partInfo.specs || ''}`;
          inspectorEl.classList.add('active');
        } else {
          inspectorEl.classList.remove('active');
        }
      }
    );
  }

  initUI() {
    const slider = document.getElementById('explode-slider');
    if (slider) {
      slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.updateExplosion(val);
        soundEngine.playExpansionWhoosh();
      });
    }

    const btnSound = document.getElementById('btn-sound');
    const soundIcon = document.getElementById('sound-icon');
    const soundLabel = document.getElementById('sound-label');

    btnSound.addEventListener('click', () => {
      soundEngine.init();
      const muted = soundEngine.toggleMute();
      soundIcon.textContent = muted ? '🔇' : '🔊';
      soundLabel.textContent = muted ? 'Muted' : 'Audio On';
    });

    window.addEventListener('click', () => soundEngine.init(), { once: true });
  }

  initMaterialLab() {
    const labDrawer = document.getElementById('material-lab');
    const btnCustomizer = document.getElementById('btn-customizer');
    const btnCloseLab = document.getElementById('btn-close-lab');
    const presetContainer = document.getElementById('preset-container');

    btnCustomizer.addEventListener('click', () => {
      labDrawer.classList.toggle('open');
      btnCustomizer.classList.toggle('active');
    });

    btnCloseLab.addEventListener('click', () => {
      labDrawer.classList.remove('open');
      btnCustomizer.classList.remove('active');
    });

    presetContainer.innerHTML = MATERIAL_SCHEMES.map(s => `
      <div class="preset-card ${s.id === this.watchModel.currentScheme.id ? 'active' : ''}" data-scheme-id="${s.id}">
        <div class="preset-color-swatch" style="background: #${s.caseColor.toString(16).padStart(6, '0')}"></div>
        <div class="preset-info">
          <h4>${s.name}</h4>
          <p>${s.tagline}</p>
        </div>
      </div>
    `).join('');

    presetContainer.addEventListener('click', (e) => {
      const card = e.target.closest('.preset-card');
      if (!card) return;

      const schemeId = card.dataset.schemeId;
      const targetScheme = MATERIAL_SCHEMES.find(s => s.id === schemeId);
      if (targetScheme) {
        this.watchModel.applyMaterialScheme(targetScheme);
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

      const newDesign = await this.firebaseManager.saveDesign({
        title,
        creator,
        description: desc,
        schemeId: this.watchModel.currentScheme.id
      });

      saveModal.classList.remove('open');
      saveForm.reset();

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      alert(`🎉 Watch creation "${title}" saved to showcase!`);
    });
  }

  initShowcaseGallery() {
    const showcaseModal = document.getElementById('showcase-modal');
    const btnShowcase = document.getElementById('btn-showcase');
    const btnCloseShowcase = document.getElementById('btn-close-showcase');
    const galleryContainer = document.getElementById('gallery-container');

    btnShowcase.addEventListener('click', async () => {
      showcaseModal.classList.add('open');
      this.renderShowcaseCards(galleryContainer);
    });

    btnCloseShowcase.addEventListener('click', () => showcaseModal.classList.remove('open'));
  }

  async renderShowcaseCards(container) {
    container.innerHTML = `<p style="color: var(--text-muted);">Loading community watches...</p>`;
    const designs = await this.firebaseManager.fetchCommunityDesigns();

    container.innerHTML = designs.map(d => `
      <div class="gallery-card">
        <h4>${d.title}</h4>
        <p style="font-size: 0.75rem; color: var(--accent-gold);">By ${d.creator} • ${d.timestamp || 'Recently'}</p>
        <p>${d.description || 'Custom Horologia movement finish.'}</p>
        <div class="card-footer">
          <button class="like-btn" data-id="${d.id}">❤️ ${d.likes || 1}</button>
          <button class="load-btn" data-scheme-id="${d.schemeId}">Load Design</button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.load-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const schemeId = e.target.dataset.schemeId;
        const scheme = MATERIAL_SCHEMES.find(s => s.id === schemeId) || MATERIAL_SCHEMES[0];
        this.watchModel.applyMaterialScheme(scheme);
        soundEngine.playRatchetWinding();
        document.getElementById('showcase-modal').classList.remove('open');
      });
    });

    container.querySelectorAll('.like-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        await this.firebaseManager.likeDesign(id);
        this.renderShowcaseCards(container);
      });
    });
  }

  initFirebaseGuide() {
    const guideModal = document.getElementById('firebase-modal');
    const btnGuide = document.getElementById('btn-firebase-guide');
    const btnCloseGuide = document.getElementById('btn-close-firebase');
    const configForm = document.getElementById('firebase-config-form');

    btnGuide.addEventListener('click', () => guideModal.classList.add('open'));
    btnCloseGuide.addEventListener('click', () => guideModal.classList.remove('open'));

    configForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const rawJson = document.getElementById('firebase-config-json').value;
      try {
        const parsed = JSON.parse(rawJson);
        const success = this.firebaseManager.connect(parsed);
        if (success) {
          alert('⚡ Live Firebase project connected successfully!');
          guideModal.classList.remove('open');
        } else {
          alert('⚠️ Invalid Firebase configuration object.');
        }
      } catch (err) {
        alert('⚠️ Invalid JSON format.');
      }
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const now = performance.now();
    const delta = (now - this.lastTime) / 1000;
    this.lastTime = now;

    this.watchModel.updateKinematics(delta);
    this.sceneManager.update();
    this.raycasterManager.update();
    this.sceneManager.render();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new HorologiaApp();
});
