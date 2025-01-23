import * as THREE from 'three';

export class GalaxyBackground {
    constructor(config = {}) { // 添加默认参数
        console.log('银河系背景配置:', config);
        // 合并配置与默认值
        this.config = {
          starCount: 1000000,  // 默认值
          diskRadius: 1e5,     // 默认值 (kpc)
          ...config            // 用户配置覆盖
        };
    
        this.starCount = this.config.starCount;
        this.galacticDiskRadius = this.config.diskRadius;
        this.init();
    }

    init() {
        const positions = new Float32Array(this.starCount * 3);
        const colors = new Float32Array(this.starCount * 3);
        
        // 生成银河系恒星分布
        for(let i = 0; i < this.starCount; i++) {
            // 生成极坐标下的分布
            const r = this.galacticDiskRadius * Math.sqrt(Math.random());
            const θ = Math.random() * Math.PI * 2;
            const z = (Math.random() - 0.5) * 0.1 * this.galacticDiskRadius;

            // 转换为笛卡尔坐标
            positions[i*3] = r * Math.cos(θ);
            positions[i*3+1] = z;
            positions[i*3+2] = r * Math.sin(θ);

            // 设置颜色
            const color = new THREE.Color();
            const temp = 2500 + Math.random() * 6000; // 恒星温度
            // color.setTemperature(temp);
            colors[i*3] = color.r;
            colors[i*3+1] = color.g;
            colors[i*3+2] = color.b;
        }

        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', 
            new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color',
            new THREE.BufferAttribute(colors, 3));

        this.material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            depthWrite: false
        });

        this.mesh = new THREE.Points(this.geometry, this.material);
        this.mesh.frustumCulled = false;
    }

    update(camera) {
        // 根据相机位置调整星空旋转
        this.mesh.rotation.y = camera.position.x * 1e-6;
    }
}