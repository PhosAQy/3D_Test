import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
export class GuiManager {
    constructor(options, celestialBodies) {
        this.gui = new GUI();
        this.options = options;
        this.celestialBodies = celestialBodies;
        this.init();
    }

    init() {
        this._createAnimationControls();
        this._createSpeedControls();
    }

    _createAnimationControls() {
        const folder = this.gui.addFolder('动画控制');
        folder.add(this.options, 'animation').name('运行动画');
        folder.add(this.options, 'showOrbit').name('显示轨道');
    }

    _createSpeedControls() {
        const folder = this.gui.addFolder('速度控制');
        const rotationFolder = folder.addFolder('自转速度');
        const revolutionFolder = folder.addFolder('公转速度');
        for (const key in this.celestialBodies) {
            if (this.celestialBodies.hasOwnProperty(key)) { // 避免遍历到原型链上的属性
                const celestialBody = this.celestialBodies[key];
        // 添加其他行星控制...
                rotationFolder.add(celestialBody, 'rotationSpeed', -0.01, 0.01).name(celestialBody.name + '自转');
                if (celestialBody.revolutionSpeed) {
                    revolutionFolder.add(celestialBody, 'revolutionSpeed', -0.1, 0.1).name(celestialBody.name + '公转');
                }
            }
        }
    }
}