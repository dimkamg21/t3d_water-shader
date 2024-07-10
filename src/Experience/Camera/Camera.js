import * as THREE from 'three';
import Experience from '../Experience';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

const MIN_HEIGHT = 2;
const instructions = document.getElementById('instructions');

export default class Camera {
    constructor() {
        this.experience = new Experience();
        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.canvas = this.experience.canvas;
        this.time = this.experience.time;
        this.raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0));
        this.world = this.experience.world;

        this.CAMERA_POSITION = 5;

        // Delayed initialization
        this.initialized = false;
    }

    initialize() {
        this.floorY = this.world.floor.model.position.y;

        this.setInstance();
        this.setControls();
        this.setEventListener();

        this.initialized = true;
    }

    setInstance() {
        this.instance = new THREE.PerspectiveCamera(
            75, this.sizes.width / this.sizes.height, 0.1, 500
        );

        const initCameraY = this.CAMERA_POSITION + this.floorY;
        this.instance.position.set(1, initCameraY, 10);
        this.scene.add(this.instance);
    }

    setControls() {
        this.controls = new PointerLockControls(this.instance, this.canvas);

        this.motionControl = {
            moveForward: false,
            moveRight: false,
            moveBackward: false,
            moveLeft: false,
        };

        this.pointerControlsVelocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();

        this.scene.add(this.controls.getObject());
    }

    setEventListener() {
        instructions.addEventListener('click', () => {
            this.controls.lock();
        });

        this.controls.addEventListener('lock', () => {
            instructions.style.display = 'none';
        });

        this.controls.addEventListener('unlock', () => {
            instructions.style.display = null;
        });

        document.addEventListener('keydown', (e) => {
            switch (e.code) {
                case 'KeyW':
                    this.motionControl.moveForward = true;
                    break;
                case 'KeyD':
                    this.motionControl.moveRight = true;
                    break;
                case 'KeyS':
                    this.motionControl.moveBackward = true;
                    break;
                case 'KeyA':
                    this.motionControl.moveLeft = true;
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            switch (e.code) {
                case 'KeyW':
                    this.motionControl.moveForward = false;
                    break;
                case 'KeyD':
                    this.motionControl.moveRight = false;
                    break;
                case 'KeyS':
                    this.motionControl.moveBackward = false;
                    break;
                case 'KeyA':
                    this.motionControl.moveLeft = false;
                    break;
            }
        });
    }

    resize() {
        if (!this.initialized) return;

        this.instance.aspect = this.sizes.width / this.sizes.height;
        this.instance.updateProjectionMatrix();
    }

    update() {
        if (!this.initialized) return;

        if (this.controls.isLocked) {
            let distanceToGround = MIN_HEIGHT;
            let groundY = null;

            const pointerControlsX = this.controls.getObject().position.x;
            const pointerControlsY = this.controls.getObject().position.y;
            const pointerControlsZ = this.controls.getObject().position.z;

            this.raycaster.ray.origin.copy(this.controls.getObject().position);

            const intersections = this.raycaster.intersectObjects(this.scene.children, true);

            if (intersections.length) {
                distanceToGround = pointerControlsY - intersections[0].point.y;

                groundY = Math.max(intersections[0].point.y, 0);
            } else {
                distanceToGround = pointerControlsY;
            }

            this.pointerControlsVelocity.x -= this.pointerControlsVelocity.x * 10.0 * this.time.delta;
            this.pointerControlsVelocity.z -= this.pointerControlsVelocity.z * 10.0 * this.time.delta;

            this.direction.z = Number(this.motionControl.moveForward) - Number(this.motionControl.moveBackward);
            this.direction.x = Number(this.motionControl.moveRight) - Number(this.motionControl.moveLeft);
            this.direction.normalize();

            if (this.motionControl.moveForward || this.motionControl.moveBackward) {
                this.pointerControlsVelocity.z -= this.direction.z * 200.0 * this.time.delta;
            }
            if (this.motionControl.moveLeft || this.motionControl.moveRight) {
                this.pointerControlsVelocity.x -= this.direction.x * 200.0 * this.time.delta;
            }

            if (distanceToGround > this.CAMERA_POSITION) {
                this.pointerControlsVelocity.y -= 9.8 * 12 * this.time.delta;
            }

            this.controls.moveRight(-this.pointerControlsVelocity.x * this.time.delta);
            this.controls.moveForward(-this.pointerControlsVelocity.z * this.time.delta);

            this.controls.getObject().position.y += this.pointerControlsVelocity.y * this.time.delta;

            if (this.controls.getObject().position.y < groundY + this.CAMERA_POSITION) {
                this.pointerControlsVelocity.y = 0;
                this.controls.getObject().position.y = groundY + this.CAMERA_POSITION;
            }

            if (pointerControlsX > this.world.worldEdges.max.x 
             || pointerControlsX < this.world.worldEdges.min.x) {
                this.controls.getObject().position.x =
                    pointerControlsX > this.world.worldEdges.centerX
                        ? this.world.worldEdges.max.x
                        : this.world.worldEdges.min.x;
            }

            if (pointerControlsZ > this.world.worldEdges.max.z 
                || pointerControlsZ < this.world.worldEdges.min.z) {
                   this.controls.getObject().position.z =
                       pointerControlsZ > this.world.worldEdges.centerZ
                           ? this.world.worldEdges.max.z
                           : this.world.worldEdges.min.z;
               }
        }
    }
}
