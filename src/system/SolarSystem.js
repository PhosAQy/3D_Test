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
                pointLight.position.set(body.position);
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

            body.meshObject = celestial;
            body.meshGroup = group;
        }
    }

    update(animationEnabled, showOrbit) {
        for (const body of Object.values(this.celestialBodies)) {
            if (!animationEnabled) continue;
            
            body.meshObject.rotation.y += body.rotationSpeed;
            if (body.revolutionSpeed) {
                body.meshObject.parent.rotation.y += body.revolutionSpeed;
            }
            
            if (body.meshOrbit) {
                body.meshOrbit.visible = showOrbit;
            }
        }
    }
}