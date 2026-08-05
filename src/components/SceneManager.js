// Horologia - Three.js Scene, Camera, Lighting & Studio Renderer Manager
import * as THREE from 'three';

export class SceneManager {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.width = this.container.clientWidth || window.innerWidth;
    this.height = this.container.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0b0c10, 0.02);

    // Centered front PerspectiveCamera looking directly at watch origin (0, 0, 0)
    this.camera = new THREE.PerspectiveCamera(40, this.width / this.height, 0.1, 100);
    this.updateCameraForViewport();

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // Subtle Mouse tracking
    this.mouse = new THREE.Vector2(0, 0);
    this.targetMouse = new THREE.Vector2(0, 0);

    this.initLighting();
    this.initEnvironmentMap();
    this.bindEvents();
  }

  updateCameraForViewport() {
    // Offset camera slightly to the right on wide screens so watch sits beside left story card
    const isDesktop = this.width > 900;
    const baseZ = isDesktop ? 10.0 : 12.5;
    const offsetX = isDesktop ? 1.2 : 0;
    this.camera.position.set(offsetX, 0, baseZ);
    this.camera.lookAt(offsetX * 0.5, 0, 0);
  }

  initLighting() {
    // Dark luxury studio ambient
    this.ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(this.ambientLight);

    // Key Light (Gold tint)
    this.keyLight = new THREE.SpotLight(0xfff5ea, 5.0, 40, Math.PI / 3, 0.4, 1);
    this.keyLight.position.set(6, 6, 10);
    this.keyLight.castShadow = true;
    this.scene.add(this.keyLight);

    // Rim Light (High contrast Cyan)
    this.rimLight = new THREE.DirectionalLight(0x00d2ff, 3.2);
    this.rimLight.position.set(-8, 5, -5);
    this.scene.add(this.rimLight);

    // Bottom Fill Light (Eliminates pitch black undersides)
    this.bottomLight = new THREE.DirectionalLight(0xd4af37, 1.5);
    this.bottomLight.position.set(0, -8, 4);
    this.scene.add(this.bottomLight);
  }

  initEnvironmentMap() {
    // Generate studio metallic reflection texture
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#0b0d12');
    grad.addColorStop(0.25, '#3a4b60');
    grad.addColorStop(0.5, '#ffffff'); // Crisp metallic reflection horizon line
    grad.addColorStop(0.75, '#202836');
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

    this.keyLight.position.x = 6 + this.mouse.x * 2.0;
    this.keyLight.position.y = 6 + this.mouse.y * 2.0;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
