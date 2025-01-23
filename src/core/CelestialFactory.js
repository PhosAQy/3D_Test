import * as THREE from 'three';

export class CelestialFactory {
    static createBaseBody(params) {
        const geometry = new THREE.SphereGeometry(params.radius, 32, 32);
        const texture = new THREE.TextureLoader().load(params.texture);
        return { geometry, texture };
    }

    static createStar(params) {
        const { geometry, texture } = this.createBaseBody(params);
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const star = new THREE.Mesh(geometry, material);
        star.position.set(
            params.position.x,
            params.position.y,
            params.position.z
        );
        this._addStarGlow(star, params);
        return star;
    }

    static createPlanet(params) {
        const { geometry, texture } = this.createBaseBody(params);
        const material = new THREE.MeshLambertMaterial({ map: texture });
        const planet = new THREE.Mesh(geometry, material);
        planet.position.x = params.distance;
        return planet;
    }

    static _addStarGlow(sun, params) {
        // 加载光晕贴图
        const glowTexture = new THREE.TextureLoader().load('./public/textures/sun_glow.jpg');
        
        // 创建光晕材质（共用）
        const glowMaterial = new THREE.MeshBasicMaterial({
            map: glowTexture,
            color: 0xFFDD88,       // 光晕颜色
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side:THREE.DoubleSide
        });

        // 创建三个正交方向的Sprite
        const glowSprites = new THREE.Group();
        
        // X-Y平面Sprite
        const spriteXY = new THREE.Sprite(glowMaterial);
        spriteXY.scale.set(params.radius * 6, params.radius * 6, 1);
        glowSprites.add(spriteXY);

        // X-Z平面Sprite（旋转90度）
        const spriteXZ = new THREE.Sprite(glowMaterial);
        spriteXZ.scale.set(params.radius * 6, params.radius * 6, 1);
        spriteXZ.rotation.x = Math.PI/2;
        glowSprites.add(spriteXZ);

        // Y-Z平面Sprite（旋转90度）
        const spriteYZ = new THREE.Sprite(glowMaterial);
        spriteYZ.scale.set(params.radius * 6, params.radius * 6, 1);
        spriteYZ.rotation.y = Math.PI/2;
        glowSprites.add(spriteYZ);
      
        // 将光晕组添加到太阳
        sun.add(glowSprites);
        sun.glow = glowSprites;



    }

    static createOrbit(distance) {
        const geometry = new THREE.RingGeometry(distance, distance + 0.1, 64);
        const material = new THREE.MeshBasicMaterial({
            color: "white",
            side: THREE.DoubleSide,
            opacity: 1,
            transparent: true
        });
        const orbit = new THREE.Mesh(geometry, material);
        orbit.rotation.x = Math.PI / 2;
        return orbit;
    }
}