import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { GalaxyBackground } from '../effects/GalaxyBackgroud.js';
import { DistanceIndicator } from '../ui/DistanceIndicator.js';

export class SceneManager {
    constructor() {
        this.scene = new THREE.Scene();
        this.renderer = this._createRenderer();
        this.camera = this._createCamera();
        this.controls = null;
        this.composer = null;
        this.backgroundSystem = null;
        this.distanceIndicator = new DistanceIndicator();
        this._initSceneSettings();
    }

    init(config) {
        console.log(config)
        this._setupRenderDom();
        this._setupCamera(config.camera);
        this._setupControls(config.controls);
        this._setupPostProcessing(config.postProcessing); // 修改配置路径
        this._setupBackground(config.background);
        this._setupAmbientLight(config.lighting.ambient);
        this._setupGalacticLight(config.lighting.galactic);
        return this.getSceneObjects();
    }

    // 私有方法 ==================================================
    _createRenderer() {
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            logarithmicDepthBuffer: true, // 启用对数深度缓冲
            powerPreference: "high-performance"
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.autoClear = false;
        return renderer;
    }

    _createCamera() {
        return new THREE.PerspectiveCamera(
            45, // 更宽的视野角
            window.innerWidth / window.innerHeight,
            1e3, // 近裁剪面 (km)
            1e18  // 远裁剪面 (1万亿公里)
        );
    }

    _initSceneSettings() {
        this.scene.fog = new THREE.FogExp2(0x000000, 1e-10); // 指数雾
        THREE.ColorManagement.enabled = true; // 启用色彩管理
    }

    _setupRenderDom() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        document.body.appendChild(this.distanceIndicator.domElement);
    }

    _setupCamera(config = {}) {
        // 安全解构配置
        const cameraConfig = config.camera || this._getDefaultCameraConfig();
        
        // 验证位置参数
        const position = Array.isArray(cameraConfig.position) ? 
          cameraConfig.position : [0, 1e8, 5e8];
        
        // 验证观察点参数
        const lookAt = Array.isArray(cameraConfig.lookAt) ? 
          cameraConfig.lookAt : [0, 0, 0];
    
        this.camera.position.fromArray(position);
        this.camera.lookAt(new THREE.Vector3(...lookAt));
    }

    _getDefaultCameraConfig() {
        return {
            position: [0, 1e8, 5e8],
            lookAt: [0, 0, 0]
        };
    }
    _setupControls(config) {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        Object.assign(this.controls, {
            dampingFactor: 0.05,
            enableDamping: true,
            screenSpacePanning: true,
            minDistance: 1e5,  // 最小缩放距离 (1000公里)
            maxDistance: 1e16, // 最大缩放距离 (1光年)
            ...config
        });

        // 自定义平移速度曲线
        this.controls.getDistance = (() => {
            const original = this.controls.getDistance.bind(this.controls);
            return () => {
                const d = original();
                return Math.log10(d) * 1e6; // 对数距离缩放
            };
        })();
    }

    _setupPostProcessing(config = {}) {
        // 初始化EffectComposer
        this.composer = new EffectComposer(this.renderer);
        // 安全解构配置
        const bloomConfig = config.bloom || {
          strength: 1.0,
          radius: 0.5,
          threshold: 0.1
        };
    
        const { strength, radius, threshold } = bloomConfig;
    
        const bloomPass = new UnrealBloomPass(
          new THREE.Vector2(window.innerWidth, window.innerHeight),
          strength,
          radius,
          threshold
        );
        
        this.composer.addPass(bloomPass);
        console.log("后处理效果初始化完成");
    }
    _getBloomParams(config) {
        // 默认参数
        const defaults = {
          strength: 1.0,
          radius: 0.5,
          threshold: 0.1
        };
      
        // 从正确路径获取配置
        return {
          strength: config?.strength ?? defaults.strength,
          radius: config?.radius ?? defaults.radius,
          threshold: config?.threshold ?? defaults.threshold
        };
      }
    _getSafeNumber(value, defaultValue) {
    return typeof value === 'number' ? value : defaultValue;
    }
    _setupBackground(config) {
        this.backgroundSystem = new GalaxyBackground(config);
        this.scene.add(this.backgroundSystem.mesh);
    }

    _setupAmbientLight(intensity) {
        const safeIntensity = typeof intensity === 'number' ? intensity : 0.4;
        const light = new THREE.AmbientLight(0xffffff, safeIntensity);
        light.name = 'ambient_light';
        this.scene.add(light);
    }

    _setupGalacticLight(config) {
        const directionalLight = new THREE.DirectionalLight(
            config.color, 
            config.intensity
        );
        directionalLight.position.set(...config.direction);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
    }

    // 公共方法 ==================================================
    updateAspectRatio() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.composer.setSize(width, height);
    }

    update(deltaTime) {
        this.backgroundSystem.update(this.camera);
        this.distanceIndicator.update(this.camera.position);
        this.controls.update();
        this.composer.render(deltaTime);
    }

    getSceneObjects() {
        return {
            scene: this.scene,
            camera: this.camera,
            renderer: this.renderer,
            controls: this.controls,
            composer: this.composer
        };
    }

    // 事件处理 ==================================================
    onWindowResize() {
        this.updateAspectRatio();
    }

    toggleDebugMode(enable) {
        this.renderer.debug.checkShaderErrors = enable;
        this.scene.traverse(obj => {
            if (obj.material) {
                obj.material.wireframe = enable;
            }
        });
    }
}