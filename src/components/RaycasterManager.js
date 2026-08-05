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

    window.addEventListener('click', () => {
      if (this.hoveredPart) {
        soundEngine.playRatchetWinding();
      }
    });
  }

  update() {
    this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);

    // Get all meshes inside watch model parts
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
    partGroup.traverse(child => {
      if (child.isMesh && child.material) {
        child.userData.originalEmissive = child.material.emissive ? child.material.emissive.getHex() : 0;
        child.userData.originalEmissiveIntensity = child.material.emissiveIntensity || 0;

        if (child.material.emissive) {
          child.material.emissive.setHex(0xd4af37);
          child.material.emissiveIntensity = 0.6;
        }
      }
    });
  }

  clearHover() {
    if (!this.hoveredPart) return;

    this.hoveredPart.traverse(child => {
      if (child.isMesh && child.material && child.userData.originalEmissive !== undefined) {
        if (child.material.emissive) {
          child.material.emissive.setHex(child.userData.originalEmissive);
          child.material.emissiveIntensity = child.userData.originalEmissiveIntensity;
        }
      }
    });

    this.hoveredPart = null;
  }
}
