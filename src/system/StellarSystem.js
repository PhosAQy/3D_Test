import { CelestialFactory } from '../core/CelestialFactory.js';
import * as THREE from 'three';

export class StellarSystem {
    constructor(scene, galacticConfig) {
        this.scene = scene;
        this.galacticConfig = galacticConfig;
        this.celestialRegistry = new Map();
        this.init();
    }

    init() {
        const referencePoint = this.galacticConfig.galacticCore?.referencePoint || [0, 0, 0];
        // 初始化银河系坐标系
        const galacticGroup = new THREE.Group();
        console.log(this.galacticConfig)
        galacticGroup.position.fromArray(
            referencePoint
                .map(v => v * 3.086e16) // 转换kpc为公里
        );
        this.scene.add(galacticGroup);

        // 遍历所有恒星系
        // this.galacticConfig.galacticCore.starSystems.forEach(system => {
            this.createStarSystem(
                this.galacticConfig.celestialHierarchy.centralBody, 
                galacticGroup,
                this.galacticConfig.position
            );
        // });
    }

    createStarSystem(rootBody, parentGroup, systemPosition) {
        const systemGroup = new THREE.Group();
        systemGroup.position.fromArray(systemPosition.map(v => v * 3.086e16)); // kpc转公里
        parentGroup.add(systemGroup);

        // 递归创建天体
        const createCelestial = (bodyConfig, parent) => {
            const bodyGroup = new THREE.Group();
            parent.add(bodyGroup);

            // 创建天体本体
            const celestial = this.createCelestialBody(bodyConfig);
            bodyGroup.add(celestial.mesh);

            // 注册天体
            this.celestialRegistry.set(bodyConfig.id, {
                ...celestial,
                group: bodyGroup,
                config: bodyConfig
            });

            // 创建轨道可视化
            if (bodyConfig.orbitalParams) {
                const orbit = CelestialFactory.createOrbit(
                    bodyConfig.orbitalParams.semiMajorAxis,
                    bodyConfig.orbitalParams.eccentricity
                );
                bodyGroup.add(orbit);
            }

            // 递归创建子天体
            if (bodyConfig.children) {
                bodyConfig.children.forEach(child => 
                    createCelestial(child, bodyGroup)
                );
            }

            return bodyGroup;
        };

        createCelestial(rootBody, systemGroup);
    }

    createCelestialBody(config) {
        let celestial;
        switch(config.type) {
            case 'star':
                celestial = CelestialFactory.createStar(config);
                
                // 恒星光照系统
                const luminosity = config.physicalParams.luminosity / 3.828e26; // 以太阳光度为单位
                const starLight = new THREE.PointLight(
                    this.getStarColor(config.class),
                    luminosity
                );
                celestial.add(starLight);
                break;

            case 'planet':
                celestial = CelestialFactory.createPlanet(config);
                break;

            case 'natural-satellite':
                celestial = CelestialFactory.createMoon(config);
                break;

            default:
                console.warn(`Unknown celestial type: ${config.type}`);
        }

        return {
            mesh: celestial,
            rotationSpeed: this.calculateRotationSpeed(config),
            revolutionSpeed: this.calculateRevolutionSpeed(config)
        };
    }

    update(animationEnabled, showOrbit, timeScale = 1.0) {
        this.celestialRegistry.forEach(entry => {
            const { mesh, group, config } = entry;

            // 天体自转
            if (animationEnabled && entry.rotationSpeed) {
                mesh.rotation.y += entry.rotationSpeed * timeScale;
                
                // 应用自转轴倾角
                if (config.physicalParams?.axialTilt) {
                    mesh.rotation.x = THREE.MathUtils.degToRad(
                        config.physicalParams.axialTilt
                    );
                }
            }

            // 轨道公转
            if (animationEnabled && entry.revolutionSpeed) {
                group.rotation.y += entry.revolutionSpeed * timeScale;
            }

            // 更新轨道可视化
            if (config.orbitalParams) {
                group.children.forEach(child => {
                    if (child instanceof THREE.Line) {
                        child.visible = showOrbit;
                    }
                });
            }

            // 动态计算椭圆轨道位置
            if (config.orbitalParams && animationEnabled) {
                this.updateOrbitalPosition(group, config);
            }
        });
    }

    // 椭圆轨道位置计算
    updateOrbitalPosition(group, config) {
        const orbit = config.orbitalParams;
        const time = Date.now() * 0.001; // 获取实时时间
        
        // 使用开普勒方程计算位置
        const M = (2 * Math.PI * time) / orbit.period;
        let E = M;
        for (let i = 0; i < 10; i++) {
            E = M + orbit.eccentricity * Math.sin(E);
        }

        const x = orbit.semiMajorAxis * (Math.cos(E) - orbit.eccentricity);
        const z = orbit.semiMajorAxis * Math.sqrt(1 - orbit.eccentricity**2) * Math.sin(E);
        
        group.position.set(x, 0, z);
    }

    // 工具方法
    getStarColor(starClass) {
        const colorMap = {
            'O': 0x9db4ff,
            'B': 0xaabfff,
            'A': 0xcad7ff,
            'F': 0xf8f7ff,
            'G': 0xfff4ea,
            'K': 0xffd2a1,
            'M': 0xffcc6f
        };
        return colorMap[starClass[0]] || 0xffffff;
    }

    calculateRotationSpeed(config) {
        if (!config.rotation?.period) return 0;
        return (2 * Math.PI) / (config.rotation.period * 3600); // 转换为弧度/秒
    }

    calculateRevolutionSpeed(config) {
        if (!config.orbitalParams?.period) return 0;
        return (2 * Math.PI) / (config.orbitalParams.period * 31557600); // 年转秒
    }
}