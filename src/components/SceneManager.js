// Horologia - Three.js Scene, Camera & Studio Renderer Manager
import * as THREE from 'three';
import { gsap } from 'gsap';

export class SceneManager {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Camera lookAt target — animated per chapter
    this.lookAtTarget = new THREE.Vector3(0, 0, 0);
    this.currentLookAt = new THREE.Vector3(0, 0, 0);

    this.initRenderer();
    this.initCamera();
    this.initScene();
    this.initLighting();
    this.initEnvironment();

    window.addEventListener('resize', this.onResize.bind(this));
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 100);
    // Initial hero position: slightly above, looking at center
    this.camera.position.set(0, 1.5, 7.5);
    this.camera.lookAt(0, 0, 0);
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x08090d, 0.04);

    // Subtle grid floor
    const gridHelper = new THREE.GridHelper(20, 40, 0x1a1c24, 0x111318);
    gridHelper.position.y = -3.5;
    gridHelper.material.opacity = 0.35;
    gridHelper.material.transparent = true;
    this.scene.add(gridHelper);
  }

  initLighting() {
    // Warm ambient
    this.ambientLight = new THREE.AmbientLight(0xfff0d8, 0.35);
    this.scene.add(this.ambientLight);

    // Key light — warm top
    this.keyLight = new THREE.DirectionalLight(0xfff3e0, 2.8);
    this.keyLight.position.set(3, 6, 4);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.set(2048, 2048);
    this.keyLight.shadow.camera.near = 0.1;
    this.keyLight.shadow.camera.far = 30;
    this.keyLight.shadow.camera.left = -8;
    this.keyLight.shadow.camera.right = 8;
    this.keyLight.shadow.camera.top = 8;
    this.keyLight.shadow.camera.bottom = -8;
    this.keyLight.shadow.bias = -0.001;
    this.scene.add(this.keyLight);

    // Cool rim light
    this.rimLight = new THREE.DirectionalLight(0x4488ff, 1.4);
    this.rimLight.position.set(-5, 2, -4);
    this.scene.add(this.rimLight);

    // Fill light (warm, from below-front)
    this.fillLight = new THREE.DirectionalLight(0xffe8b0, 0.8);
    this.fillLight.position.set(0, -3, 5);
    this.scene.add(this.fillLight);

    // Accent under-glow (golden)
    this.underGlow = new THREE.PointLight(0xc9a44a, 0.6, 8);
    this.underGlow.position.set(0, -2, 2);
    this.scene.add(this.underGlow);

    // Spotlight for drama — tracks watch center
    this.spotLight = new THREE.SpotLight(0xffffff, 3.0);
    this.spotLight.position.set(0, 8, 3);
    this.spotLight.angle = 0.35;
    this.spotLight.penumbra = 0.5;
    this.spotLight.decay = 1.5;
    this.spotLight.castShadow = true;
    this.spotLight.target.position.set(0, 0, 0);
    this.scene.add(this.spotLight);
    this.scene.add(this.spotLight.target);
  }

  initEnvironment() {
    // Procedural gradient environment map
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();

    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x0a0c12);

    const envGeometry = new THREE.SphereGeometry(50, 32, 32);
    const envMaterial = new THREE.MeshBasicMaterial({
      color: 0x1a1e2e,
      side: THREE.BackSide
    });
    envScene.add(new THREE.Mesh(envGeometry, envMaterial));

    // Add a few point lights to the env scene for reflection variety
    const el1 = new THREE.PointLight(0xc9a44a, 1, 100);
    el1.position.set(20, 10, 10);
    envScene.add(el1);
    const el2 = new THREE.PointLight(0x4488cc, 0.8, 100);
    el2.position.set(-20, -5, -10);
    envScene.add(el2);

    const envRT = pmremGenerator.fromScene(envScene);
    this.scene.environment = envRT.texture;
    this.envMap = envRT.texture;
    pmremGenerator.dispose();
  }

  /**
   * Animate camera to a new position with smooth GSAP tween.
   * @param {Object} pos — {x, y, z} target camera position
   * @param {Object} lookAt — {x, y, z} target lookAt point
   * @param {number} duration — seconds
   * @param {string} ease — GSAP easing
   */
  animateCamera(pos, lookAt, duration = 1.6, ease = 'power2.inOut') {
    gsap.to(this.camera.position, {
      x: pos.x,
      y: pos.y,
      z: pos.z,
      duration,
      ease,
      overwrite: 'auto'
    });
    gsap.to(this.lookAtTarget, {
      x: lookAt.x,
      y: lookAt.y,
      z: lookAt.z,
      duration,
      ease,
      overwrite: 'auto'
    });
  }

  update() {
    // Smoothly interpolate lookAt each frame
    this.currentLookAt.lerp(this.lookAtTarget, 0.06);
    this.camera.lookAt(this.currentLookAt);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
}
