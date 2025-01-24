import { CelestialFactory } from '../core/CelestialFactory.js';
import * as THREE from 'three';

export class SolarSystem {
    constructor(scene, celestialConfig) {
        this.scene = scene;
        this.celestialBodies = celestialConfig;
        this.init();
    }

    init() {
        for (const [key, body] of Object.entries(this.celestialBodies)) {
            const group = new THREE.Group();
            console.log(this.scene)
            this.scene.add(group);

            var celestial
            if (body.type === 'star') {
                celestial = CelestialFactory.createStar(body)
                const pointLight = new THREE.PointLight(body.pointLight.color, body.pointLight.intensity);
                pointLight.position.fromArray(body.position);
                this.scene.add(pointLight);
            } else {
                celestial = CelestialFactory.createPlanet(body)
            }
                
            group.add(celestial);
            
            if (body.type === 'planet') {
                const orbit = CelestialFactory.createOrbit(body.distance);
                group.add(orbit);
                body.meshOrbit = orbit;
            }
            if (body.ring) {
                const spriteMaterial = new THREE.MeshBasicMaterial({
                    map: new THREE.TextureLoader().load(body.ring.texture),
                    blending: THREE.AdditiveBlending,
                    side:THREE.DoubleSide
                });
                const sprite = new THREE.Sprite(spriteMaterial);
                const glowScale = 2; // 光晕大小
                sprite.scale.set(body.ring.outerRadius * glowScale, body.ring.outerRadius * glowScale, 1);
                sprite.rotation.x = Math.PI/2;
                celestial.add(sprite);
                
                // 将sprite存储为sun对象的属性
                celestial.glow = sprite;
            }
            body.meshObject = celestial;
            body.meshGroup = group;
        }
    }

    update(animationEnabled, showOrbit) {
        for (const body of Object.values(this.celestialBodies)) {
            if (!animationEnabled) continue;
            
            // 自转：保持不变
            body.meshObject.rotation.y += body.rotationSpeed;
            
            // 公转：椭圆轨道计算
            if (body.revolutionSpeed && body.orbit) {
                // 参数解构
                const { semiMajorAxis, eccentricity } = body.orbit;
                
                // 累积真近点角（简化计算）
                body.revolutionAngle = (body.revolutionAngle || 0) + body.revolutionSpeed;
                
                // 椭圆极坐标公式
                const r = semiMajorAxis * (1 - eccentricity ** 2) / (1 + eccentricity * Math.cos(body.revolutionAngle));
                
                // 计算轨道位置
                body.meshObject.position.x = r * Math.cos(body.revolutionAngle);
                body.meshObject.position.z = r * Math.sin(body.revolutionAngle);
            }
    
            // 显示/隐藏轨道（需同步更新轨道几何体）
            if (body.meshOrbit) {
                body.meshOrbit.visible = showOrbit;
                // 如果存在椭圆轨道线，需要更新其顶点数据（可选）
                this.updateOrbitGeometry(body); 
            }
        }
    }
    updateOrbitGeometry(body) {
        const points = [];
        const { semiMajorAxis, eccentricity } = body.orbit;
        
        // 生成椭圆轨迹点
        for (let theta = 0; theta < Math.PI * 2; theta += 0.02) {
            const r = semiMajorAxis * (1 - eccentricity ** 2) / (1 + eccentricity * Math.cos(theta));
            points.push(new THREE.Vector3(
                r * Math.cos(theta),
                0, // 保持轨道在 XY 平面
                r * Math.sin(theta)
            ));
        }
        
        // 创建轨道线
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0x444444 });
        body.meshOrbit = new THREE.LineLoop(geometry, material);
        
        // 添加至场景
        this.scene.add(body.meshOrbit);
    }
}