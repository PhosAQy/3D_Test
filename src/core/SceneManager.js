import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import { configs } from '../core/Config.js';

export class SceneManager {
    constructor() {
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            1, 
            3000
        );
        this.controls = null;
        this.stats = new Stats();
    }

    init() {
        const sceneConfig = configs['scene']
        // 初始化渲染器
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(sceneConfig.backgroundColor);
        document.body.appendChild(this.renderer.domElement);

        // 初始化相机
        this.camera.position.set(
            sceneConfig.cameraPosition.x,
            sceneConfig.cameraPosition.y,
            sceneConfig.cameraPosition.z
        );
        this.camera.lookAt(0, 0, 0);

        // 初始化控制器
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        // 初始化性能监视器
        document.body.appendChild(this.stats.domElement);

        // 设置背景
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load('./public/textures/space.jpg', (texture) => {
            this.scene.background = texture;
        });
        
        //环境光:没有特定方向，整体改变场景的光照明暗
        const ambient = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambient);
        return {
            scene: this.scene,
            camera: this.camera,
            renderer: this.renderer,
            controls: this.controls,
            stats: this.stats
        };
    }
}