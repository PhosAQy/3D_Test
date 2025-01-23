import * as THREE from 'three';

export class CelestialFactory {
    // 共享几何体缓存
    static geometryCache = new Map();
    // 纹理缓存
    static textureCache = new Map();
    
    // 核心创建方法 ==============================================
    static createCelestial(config) {
        switch(config.type) {
            case 'star':
                return this.createStar(config);
            case 'planet':
                return this.createPlanet(config);
            case 'natural-satellite':
                return this.createMoon(config);
            case 'ring-system':
                return this.createPlanetaryRings(config);
            case 'nebula':
                return this.createNebula(config);
            default:
                console.error(`Unsupported celestial type: ${config.type}`);
                return new THREE.Object3D();
        }
    }

    // 恒星创建方法 ==============================================
    static createStar(config) {
        const starGroup = new THREE.Group();
        
        // 主星体
        const starMesh = this._createStarBody(config);
        starGroup.add(starMesh);

        // 日冕效果
        const corona = this._createStarCorona(config);
        starGroup.add(corona);

        // 引力透镜效果
        if (config.class === 'black-hole') {
            starGroup.add(this._createBlackHoleEffect(config));
        }

        return starGroup;
    }

    static _createStarBody(config) {
        const geometry = this.getGeometry('sphere', config.physicalParams.radius);
        const texture = this.loadTexture(`${config.class}_diffuse.jpg`);
        const material = new THREE.MeshPhongMaterial({
            map: texture,
            emissive: this._getStarEmissiveColor(config.class),
            emissiveIntensity: 1.5
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = THREE.MathUtils.degToRad(config.physicalParams.axialTilt || 0);
        return mesh;
    }

    static _createStarCorona(config) {
        const coronaGeometry = new THREE.SphereGeometry(
            config.physicalParams.radius * 1.2, 
            64, 
            64
        );
        
        const coronaMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vPosition;
                void main() {
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vPosition;
                uniform vec3 color;
                void main() {
                    float intensity = 1.0 - smoothstep(0.0, 1.0, length(vPosition));
                    gl_FragColor = vec4(color, intensity * 0.3);
                }
            `,
            uniforms: {
                color: { value: new THREE.Color(this._getStarCoronaColor(config.class)) }
            },
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        return new THREE.Mesh(coronaGeometry, coronaMaterial);
    }

    // 行星创建方法 ==============================================
    static createPlanet(config) {
        const planetGroup = new THREE.Group();
        
        // 主行星体
        const planetMesh = this._createPlanetBody(config);
        planetGroup.add(planetMesh);

        // 大气层效果
        if (config.atmosphere) {
            planetGroup.add(this._createAtmosphere(config));
        }

        // 行星环
        if (config.ringSystem) {
            planetGroup.add(this.createPlanetaryRings(config.ringSystem));
        }

        return planetGroup;
    }

    static _createPlanetBody(config) {
        console.log(config)
        const geometry = this.getGeometry('sphere', config.physicalParams.radius);
        // const textures = this._loadPlanetTextures(config);
        
        const material = new THREE.MeshStandardMaterial({
            map: config.textures,
            // normalMap: textures.normal,
            // roughnessMap: textures.roughness,
            metalness: config.category === 'gas-giant' ? 0.3 : 0.1,
            roughness: 0.8
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = THREE.MathUtils.degToRad(config.physicalParams.axialTilt);
        return mesh;
    }

    // 卫星创建方法 ==============================================
    static createMoon(config) {
        const geometry = this.getGeometry('sphere', config.physicalParams.radius);
        const texture = this.loadTexture('moon_diffuse.jpg');
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            normalScale: new THREE.Vector2(0.5, 0.5)
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = THREE.MathUtils.degToRad(config.physicalParams.axialTilt || 0);
        return mesh;
    }

    // 行星环创建方法 ============================================
    static createPlanetaryRings(config) {
        const ringGeometry = new THREE.RingGeometry(
            config.innerRadius,
            config.outerRadius,
            64
        );

        const texture = this.loadTexture(config.texture);
        const material = new THREE.MeshPhongMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true,
            alphaMap: texture,
            depthWrite: false
        });

        const rings = new THREE.Mesh(ringGeometry, material);
        rings.rotation.x = THREE.MathUtils.degToRad(90);
        return rings;
    }

    // 轨道创建方法 ==============================================
    static createOrbit(semiMajorAxis, eccentricity) {
        const points = [];
        const a = semiMajorAxis;
        const e = eccentricity;
        
        for(let theta = 0; theta <= Math.PI * 2; theta += 0.02) {
            const r = (a * (1 - e*e)) / (1 + e * Math.cos(theta));
            points.push(new THREE.Vector3(
                r * Math.cos(theta),
                0,
                r * Math.sin(theta)
            ));
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0x444444,
            transparent: true,
            opacity: 0.5
        });

        return new THREE.Line(geometry, material);
    }

    // 工具方法 ==================================================
    static getGeometry(type, params) {
        const cacheKey = `${type}_${JSON.stringify(params)}`;
        if (!this.geometryCache.has(cacheKey)) {
            let geometry;
            switch(type) {
                case 'sphere':
                    geometry = new THREE.SphereGeometry(
                        params.radius, 
                        64, 
                        64
                    );
                    break;
                // 可扩展其他几何类型
            }
            this.geometryCache.set(cacheKey, geometry);
        }
        return this.geometryCache.get(cacheKey);
    }

    static loadTexture(path) {
        if (!this.textureCache.has(path)) {
            const texture = new THREE.TextureLoader().load(path);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            this.textureCache.set(path, texture);
        }
        return this.textureCache.get(path);
    }

    // 私有方法 ==================================================
    _loadPlanetTextures(config) {
        return {
            albedo: this.loadTexture(`${config.category}_albedo.jpg`),
            normal: this.loadTexture(`${config.category}_normal.jpg`),
            roughness: this.loadTexture(`${config.category}_roughness.jpg`)
        };
    }

    static _getStarEmissiveColor(starClass) {
        const colorMap = {
            'O': 0x9db4ff,
            'B': 0xaabfff,
            'A': 0xcad7ff,
            'F': 0xf8f7ff,
            'G': 0xfff4ea,
            'K': 0xffd2a1,
            'M': 0xffcc6f
        };
        return new THREE.Color(colorMap[starClass[0]] || 0xffffff);
    }

    static _getStarCoronaColor(starClass) {
        const coronaColorMap = {
            'O': 0x0044ff,
            'B': 0x0055ff,
            'G': 0xffaa00
        };
        return coronaColorMap[starClass[0]] || 0xff8800;
    }
}