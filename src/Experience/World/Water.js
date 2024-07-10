import * as THREE from 'three';
import { Water as WaterShader } from 'three/addons/objects/Water2.js';
import Experience from '../Experience';

export default class Water {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.world = this.experience.world;
        this.resources = this.experience.resources;

        this.setMesh();
        this.setWaterShader();
    }

    setMesh() {
        const floorModel = this.world.floor.model;
        const box = new THREE.Box3().setFromObject(floorModel);

        this.geometry = new THREE.PlaneGeometry(box.max.x * 2, box.max.z * 2);
    }

    setWaterShader() {
        this.water = new WaterShader(this.geometry, {
            scale: 2,
            textureWidth: 1024,
            textureHeight: 1024,
        });

        this.water.rotation.x = Math.PI * -0.5;
        this.water.position.y = 13;
        this.scene.add(this.water);
    }
}
