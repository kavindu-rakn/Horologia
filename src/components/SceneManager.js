// Horologia - Three.js Scene, Camera, Lighting & Studio Renderer Manager
import * as THREE from 'three';

export class SceneManager {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.width = this.container.clientWidth || window.innerWidth;
    this.height = this.container.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0b0c10, 0.015);

    // Front-facing PerspectiveCamera looking at 3D origin (0, 0, 0)
    this.camera = new THREE.PerspectiveCamera(38, this.width / this.height, 0.1, 100);
    this.updateCameraForViewport();

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.4;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    this.mouse = new THREE.Vector2(0, 0);
    this.targetMouse = new THREE.Vector2(0, 0);

    this.initLighting();
    this.initEnvironmentMap();
    this.bindEvents();
  }

  updateCameraForViewport() {
    // Camera is centered looking straight at the scene
    const isDesktop = this.width > 900;
    const baseZ = isDesktop ? 9.5 : 12.0;
    this.camera.position.set(0, 0, baseZ);
    this.camera.lookAt(0, 0, 0);
  }

  initLighting() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    this.scene.add(this.ambientLight);

    // Gold Key Light
    this.keyLight = new THREE.SpotLight(0xfff5ea, 6.0, 40, Math.PI / 3, 0.4, 1);
    this.keyLight.position.set(5, 5, 8);
    this.keyLight.castShadow = true;
    this.scene.add(this.keyLight);

    // Cyan Rim Light
    this.rimLight = new THREE.DirectionalLight(0x00d2ff, 3.5);
    this.rimLight.position.set(-7, 4, -4);
    this.scene.add(this.rimLight);

    // Bottom Fill Light
    this.bottomLight = new THREE.DirectionalLight(0xd4af37, 1.8);
    this.bottomLight.position.set(0, -6, 4);
    this.scene.add(this.bottomLight);
  }

  initEnvironmentMap() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#0b0d12');
    grad.addColorStop(0.2, '#3a4b60');
    grad.addColorStop(0.5, '#ffffff'); // Horizon sheen
    grad.addColorStop(0.8, '#1e2633');
    grad.addColorStop(1, '#0b0d12');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    this.scene.environment = texture;
  }

  bindEvents() {
    window.addEventListener('resize', () => this.onWindowResize());
    window.addEventListener('mousemove', (e) => {
      this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });
  }

  onWindowResize() {
    this.width = this.container.clientWidth || window.innerWidth;
    this.height = this.container.clientHeight || window.innerHeight;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.updateCameraForViewport();

    this.renderer.setSize(this.width, this.height);
  }

  update() {
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

    this.keyLight.position.x = 5 + this.mouse.x * 2.0;
    this.keyLight.position.y = 5 + this.mouse.y * 2.0;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
