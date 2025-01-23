import { SceneManager } from './src/core/SceneManager.js';
import { SolarSystem } from './src/system/SolarSystem.js';
import { GuiManager } from './src/ui/GuiManager.js';
// import celestialConfig from './src/config/celestial.json'
import { loadConfigs, configs } from './src/core/Config.js';

class SolarSystemApp {
    constructor() {
        this.options = {
            animation: true,
            showOrbit: true
        };
        
        this.init();
    }

    async init() {
        await loadConfigs()
        // 初始化场景
        const sceneManager = new SceneManager();
        console.log("sm:", sceneManager)
        const { scene, renderer, camera, controls, stats } = sceneManager.init();
        // const scene = sceneManager.scene
        // const renderer = sceneManager.renderer
        // const camera = sceneManager.camera
        // const stats = sceneManager.stats

        const celestialConfig = configs['celestial']
        console.log(celestialConfig)
        // 创建太阳系
        console.log(scene)
        this.solarSystem = new SolarSystem(scene, celestialConfig);
        
        // 初始化GUI
        new GuiManager(this.options, celestialConfig);
        
        // 启动动画循环
        this.animate(renderer, scene, camera, stats);
    }

    animate(renderer, scene, camera, stats) {
        const animateLoop = () => {
            requestAnimationFrame(animateLoop);
            
            this.solarSystem.update(
                this.options.animation,
                this.options.showOrbit
            );
            
            renderer.render(scene, camera);
            stats.update();
        };
        animateLoop();
    }
}

// 启动应用
new SolarSystemApp();