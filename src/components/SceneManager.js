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
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
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

    // Subtle luxury studio pedestal floor
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x07090e,
      roughness: 0.85,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -3.8;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Subtle dark circular vignette ring
    const gridHelper = new THREE.GridHelper(16, 32, 0x1f2433, 0x0c0f18);
    gridHelper.position.y = -3.79;
    gridHelper.material.opacity = 0.25;
    gridHelper.material.transparent = true;
    this.scene.add(gridHelper);
  }

  initLighting() {
    // Warm balanced ambient
    this.ambientLight = new THREE.AmbientLight(0xfff5ea, 0.45);
    this.scene.add(this.ambientLight);

    // Primary studio key light — angled overhead warm daylight
    this.keyLight = new THREE.DirectionalLight(0xfffaed, 3.2);
    this.keyLight.position.set(4, 7, 5);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.set(2048, 2048);
    this.keyLight.shadow.camera.near = 0.1;
    this.keyLight.shadow.camera.far = 25;
    this.keyLight.shadow.camera.left = -6;
    this.keyLight.shadow.camera.right = 6;
    this.keyLight.shadow.camera.top = 6;
    this.keyLight.shadow.camera.bottom = -6;
    this.keyLight.shadow.bias = -0.0005;
    this.scene.add(this.keyLight);

    // Razor-sharp lateral rim kicker — provides crisp edge bevel separation
    this.rimLight = new THREE.DirectionalLight(0xd6e8ff, 2.2);
    this.rimLight.position.set(-6, 3, -4);
    this.scene.add(this.rimLight);

    // Front soft fill light — ensures dial textures and sub-dials are legible
    this.fillLight = new THREE.DirectionalLight(0xfff0db, 1.2);
    this.fillLight.position.set(0, -1, 6);
    this.scene.add(this.fillLight);

    // Under-chassis accent glow — illuminates movement bridges during exploded scroll
    this.underGlow = new THREE.PointLight(0xd4af37, 0.8, 10);
    this.underGlow.position.set(0, -1.8, 1.5);
    this.scene.add(this.underGlow);

    // High-focus theatrical spot tracks center
    this.spotLight = new THREE.SpotLight(0xffffff, 2.5);
    this.spotLight.position.set(0, 9, 4);
    this.spotLight.angle = 0.42;
    this.spotLight.penumbra = 0.6;
    this.spotLight.decay = 1.2;
    this.spotLight.castShadow = true;
    this.spotLight.target.position.set(0, 0, 0);
    this.scene.add(this.spotLight);
    this.scene.add(this.spotLight.target);
  }

  initEnvironment() {
    // Studio HDRI light stage using PMREMGenerator
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();

    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x07090e);

    // Studio enclosure sphere
    const envDome = new THREE.Mesh(
      new THREE.SphereGeometry(60, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x090c14, side: THREE.BackSide })
    );
    envScene.add(envDome);

    // ── Simulated Studio Softbox Panels ─────────────────────────────────────
    // 1. Overhead Master Softbox: wide white gradient for bezel and sapphire crystal glint
    const topSoftbox = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 16),
      new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
    );
    topSoftbox.position.set(0, 14, 2);
    topSoftbox.rotation.x = Math.PI / 2;
    envScene.add(topSoftbox);

    // 2. Lateral Right Key Softbox: warm white studio strip
    const rightSoftbox = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 20),
      new THREE.MeshBasicMaterial({ color: 0xfff6e6, side: THREE.DoubleSide })
    );
    rightSoftbox.position.set(12, 5, 4);
    rightSoftbox.rotation.y = -Math.PI / 3;
    envScene.add(rightSoftbox);

    // 3. Lateral Left Rim Softbox: cool cyan-tinted highlight strip for chamfer bevels
    const leftSoftbox = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 18),
      new THREE.MeshBasicMaterial({ color: 0xd9ebff, side: THREE.DoubleSide })
    );
    leftSoftbox.position.set(-14, 4, -4);
    leftSoftbox.rotation.y = Math.PI / 3;
    envScene.add(leftSoftbox);

    // 4. Low Horizon Warm Bounce: creates natural ground bounce for case flanks
    const bottomBounce = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshBasicMaterial({ color: 0x241d15, side: THREE.DoubleSide })
    );
    bottomBounce.position.set(0, -10, 0);
    bottomBounce.rotation.x = -Math.PI / 2;
    envScene.add(bottomBounce);

    // 5. Pinpoint Specular Sparkle Lights
    const glint1 = new THREE.PointLight(0xffffff, 1.8, 80);
    glint1.position.set(10, 10, 8);
    envScene.add(glint1);

    const glint2 = new THREE.PointLight(0xffdf99, 1.2, 80);
    glint2.position.set(-8, 6, -8);
    envScene.add(glint2);

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
