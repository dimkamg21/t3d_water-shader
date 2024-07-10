import * as THREE from 'three';
import Time from './Utils/Time';
import Sizes from './Utils/Sizes';
import Camera from './Camera/Camera';
import Resources from './Utils/Resources';
import Renderer from './Renderer/Renderer';
import World from './World/World';
import source from './source';

let instance = null;

class Experience {
    constructor(canvas) {
        if (instance) {
            return instance;
        }

        instance = this;

        // Global access
        window.experience = this;

        // Options
        this.canvas = canvas;
        this.scene = new THREE.Scene();
        this.sizes = new Sizes();
        this.time = new Time();
        this.resources = new Resources(source);
        this.world = new World();
        this.camera = new Camera();
        this.renderer = new Renderer();

        // Resize event
        this.sizes.on('resize', () => {
            this.resizes();
        });

        // Tick event
        this.time.on('tick', () => {
            this.update();
        });

        // Initialize camera after resources are ready
        this.resources.on('ready', () => {
            this.camera.initialize();
        });
    }

    resizes() {
        this.camera.resize();
        this.renderer.resize();
    }

    update() {
        this.renderer.update();
        this.camera.update();
    }
}

export default Experience;
