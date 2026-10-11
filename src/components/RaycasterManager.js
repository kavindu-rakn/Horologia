// Horologia - Raycasting & Interactive HUD Inspector Manager
import * as THREE from 'three';
import { soundEngine } from '../audio/SoundEngine.js';

export class RaycasterManager {
  constructor(sceneManager, watchModel, hudCallback) {
    this.sceneManager = sceneManager;
    this.watchModel = watchModel;
    this.hudCallback = hudCallback;

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

    window.addEventListener('click', () => {
      if (this.hoveredPart) {
        soundEngine.playRatchetWinding();
      }
    });
  }

  update() {
    this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);

    const meshesToIntersect = [];
    Object.values(this.watchModel.parts).forEach(partGroup => {
      partGroup.traverse(child => {
        if (child.isMesh && child.visible) {
          child.userData.parentPartId = partGroup.userData.partId;
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
    const isSapphire = partGroup.userData && partGroup.userData.partId === 'sapphireGlass';
    partGroup.traverse(child => {
      if (child.isMesh && child.material) {
        // Save reference to shared original material
        if (!child.userData.originalMaterial) {
          child.userData.originalMaterial = child.material;
        }

        // Clone material so shared instances are not mutated globally
        const highlightMat = child.material.clone();
        if (isSapphire || (highlightMat.transmission && highlightMat.transmission > 0.5)) {
          // Sapphire crystal: preserve transmission, subtle azure AR tint instead of muddy yellow
          if (highlightMat.emissive) {
            highlightMat.emissive.setHex(0x38bdf8);
            highlightMat.emissiveIntensity = 0.12;
          }
        } else if (highlightMat.emissive) {
          highlightMat.emissive.setHex(0xd4af37);
          highlightMat.emissiveIntensity = 0.45;
        }
        child.material = highlightMat;
      }
    });
  }

  clearHover() {
    if (!this.hoveredPart) return;

    this.hoveredPart.traverse(child => {
      if (child.isMesh && child.userData.originalMaterial) {
        const clonedMat = child.material;
        // Cleanly restore original shared material
        child.material = child.userData.originalMaterial;
        delete child.userData.originalMaterial;

        // Cleanly dispose cloned material to prevent WebGL shader leak
        if (clonedMat && clonedMat !== child.material) {
          clonedMat.dispose();
        }
      }
    });

    this.hoveredPart = null;
  }
}
