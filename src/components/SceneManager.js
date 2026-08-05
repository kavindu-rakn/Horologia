// Horologia - Three.js Scene, Camera, Lighting & Studio Renderer Manager
import * as THREE from 'three';

export class SceneManager {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.width = this.container.clientWidth || window.innerWidth;
    this.height = this.container.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0b0c10, 0.03);

    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 100);
    this.camera.position.set(0, -3.5, 7.5);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // Mouse tracking for subtle parallax & light angle
    this.mouse = new THREE.Vector2(0, 0);
    this.targetMouse = new THREE.Vector2(0, 0);

    this.initLighting();
    this.initEnvironmentMap();
    this.bindEvents();
  }

  initLighting() {
    // Ambient dark studio base
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(this.ambientLight);

    // Warm Gold Key Light (Dynamic tracking mouse)
    this.keyLight = new THREE.SpotLight(0xfff0dd, 4.5, 30, Math.PI / 4, 0.5, 1);
    this.keyLight.position.set(5, 5, 8);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 2048;
    this.keyLight.shadow.mapSize.height = 2048;
    this.keyLight.shadow.bias = -0.0001;
    this.scene.add(this.keyLight);

    // Cool Cyan Rim Light (High contrast highlight)
    this.rimLight = new THREE.DirectionalLight(0x00d2ff, 2.8);
    this.rimLight.position.set(-6, -4, -3);
    this.scene.add(this.rimLight);

    // Top Down Fill Light
    this.topLight = new THREE.DirectionalLight(0xffffff, 1.5);
    this.topLight.position.set(0, 8, 4);
    this.scene.add(this.topLight);
  }

  initEnvironmentMap() {
    // Generate a procedural studio gradient environment map for metallic reflections
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#101520');
    grad.addColorStop(0.3, '#2a3548');
    grad.addColorStop(0.5, '#ffffff'); // Horizon studio sheen
    grad.addColorStop(0.7, '#1a202c');
    grad.addColorStop(1, '#0b0c10');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

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

    this.renderer.setSize(this.width, this.height);
  }

  update() {
    // Smooth lerp mouse coordinates for camera parallax & lighting
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

    // Subtle KeyLight motion
    this.keyLight.position.x = 5 + this.mouse.x * 2.0;
    this.keyLight.position.y = 5 + this.mouse.y * 2.0;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
