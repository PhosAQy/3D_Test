import { SceneManager } from './src/core/SceneManager.js';
import { StellarSystem } from './src/system/StellarSystem.js';
import { GuiManager } from './src/ui/GuiManager.js';
import { loadConfigs, configs } from './src/core/Config.js';

class AstronomySimulator {
    constructor() {
        this.simulationOptions = {
            animationSpeed: 1.0,
            showOrbits: true,
            showBackground: true,
            debugMode: false
        };
        
        this.init();
    }

    async init() {
        // 加载所有配置文件
        await loadConfigs();
        console.log('Loaded config:', configs); // 添加调试日志
        
        // 初始化场景管理系统
        this.sceneManager = new SceneManager();
        const sceneObjects = this.sceneManager.init(configs);
        
        // 创建恒星系统
        this.stellarSystems = this._createStellarSystems(
            configs.galacticCore,
            sceneObjects.scene
        );
        
        // 初始化用户界面
        this.gui = new GuiManager(
            this.simulationOptions,
            this.stellarSystems,
            this.sceneManager
        );
        
        // 设置事件监听
        this._setupEventListeners();
        
        // 启动模拟循环
        this.startSimulationLoop(sceneObjects);
    }

    _createStellarSystems(starSystemsConfig, scene) {
        return starSystemsConfig.starSystems.map(system => {
            return new StellarSystem(
                scene,
                system,
                configs.scene.simulationParams
            );
        });
    }

    _setupEventListeners() {
        window.addEventListener('resize', () => {
            this.sceneManager.onWindowResize();
        });
        
        window.addEventListener('keydown', (event) => {
            if (event.key === 'd') {
                this.simulationOptions.debugMode = !this.simulationOptions.debugMode;
                this.sceneManager.toggleDebugMode(this.simulationOptions.debugMode);
            }
        });
    }

    startSimulationLoop({ composer, stats }) {
        const clock = new THREE.Clock();
        
        const simulationLoop = () => {
            requestAnimationFrame(simulationLoop);
            
            const deltaTime = clock.getDelta();
            
            // 更新所有恒星系统
            this.stellarSystems.forEach(system => {
                system.update(
                    this.simulationOptions.animationSpeed,
                    this.simulationOptions.showOrbits,
                    deltaTime
                );
            });
            
            // 更新场景管理
            this.sceneManager.update(deltaTime);
            
            // 执行渲染
            composer.render(deltaTime);
            stats.update();
        };
        
        simulationLoop();
    }
}

// 启动模拟器
new AstronomySimulator();