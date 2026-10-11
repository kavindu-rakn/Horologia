// Horologia - Raycasting & Interactive HUD Inspector Manager
import * as THREE from 'three';
import { soundEngine } from '../audio/SoundEngine.js';

export class RaycasterManager {
  constructor(sceneManager, watchModel, hudCallback, clickCallback = null) {
    this.sceneManager = sceneManager;
    this.watchModel = watchModel;
    this.hudCallback = hudCallback;
    this.clickCallback = clickCallback;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-999, -999);
    this.hoveredPart = null;

    this.bindEvents();
  }

  bindEvents() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('mouseleave', () => {
      this.clearHover();
      if (this.hudCallback) this.hudCallback(null, null);
    });

    window.addEventListener('click', (e) => {
      // Don't trigger if click was on UI controls
      if (e.target.closest('#site-header, #chapter-card, #explode-hud, #chapter-dots, #material-lab, .modal-overlay')) {
        return;
      }
      if (this.hoveredPart && this.clickCallback) {
        soundEngine.playRatchetWinding();
        this.clickCallback(this.hoveredPart.userData.partInfo, this.hoveredPart.userData.partId);
      }
    });
  }

  update() {
    this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);

    const isAssembled = (this.watchModel.currentChapter === 0);
    const meshesToIntersect = [];

    Object.values(this.watchModel.parts).forEach(partGroup => {
      const partId = partGroup.userData.partId;
      // In assembled mode, exclude outer sapphire crystal so users can hover dial, hands, & movement
      if (isAssembled && partId === 'sapphireGlass') {
        return;
      }

      partGroup.traverse(child => {
        if (child.isMesh && child.visible) {
          child.userData.parentPartId = partId;
          meshesToIntersect.push(child);
        }
      });
    });

    const intersects = this.raycaster.intersectObjects(meshesToIntersect, false);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      const partId = hitMesh.userData.parentPartId;
      const partGroup = this.watchModel.parts[partId];

      if (partGroup && partGroup !== this.hoveredPart) {
        this.clearHover();
        this.hoveredPart = partGroup;
        this.applyHighlight(partGroup);

        soundEngine.playMetallicClick(soundEngine.ctx ? soundEngine.ctx.currentTime : 0, 0.15);

        if (this.hudCallback) {
          this.hudCallback(partGroup.userData.partInfo, partGroup.userData.partId);
        }
      }
    } else {
      if (this.hoveredPart) {
        this.clearHover();
        if (this.hudCallback) {
          this.hudCallback(null, null);
        }
      }
    }
  }

  applyHighlight(partGroup) {
    const isSapphire = (partGroup.userData?.partId === 'sapphireGlass');
    partGroup.traverse(child => {
      if (child.isMesh && child.material && child.material.emissive) {
        if (!child.userData.hasHighlight) {
          child.userData.prevEmissive = child.material.emissive.getHex();
          child.userData.prevEmissiveIntensity = child.material.emissiveIntensity;
          child.userData.hasHighlight = true;
        }

        if (isSapphire) {
          child.material.emissive.setHex(0x38bdf8);
          child.material.emissiveIntensity = 0.12;
        } else {
          // Subtle champagne gold rim glow without altering base PBR texture/metalness
          child.material.emissive.setHex(0xc9a44a);
          child.material.emissiveIntensity = 0.28;
        }
      }
    });
  }

  clearHover() {
    if (!this.hoveredPart) return;

    this.hoveredPart.traverse(child => {
      if (child.isMesh && child.material && child.userData.hasHighlight) {
        if (child.material.emissive) {
          child.material.emissive.setHex(child.userData.prevEmissive);
          child.material.emissiveIntensity = child.userData.prevEmissiveIntensity;
        }
        delete child.userData.prevEmissive;
        delete child.userData.prevEmissiveIntensity;
        delete child.userData.hasHighlight;
      }
    });

    this.hoveredPart = null;
  }
}
