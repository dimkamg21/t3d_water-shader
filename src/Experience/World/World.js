import Experience from '../Experience';
import Environment from './Environment';
import Floor from './Floor';
import Water from './Water';

const DEFAULT_WORLD_EDGES = {
    min: { x: null, z: null },
    max: { x: null, z: null },
    centerX: null,
    centerZ: null,
};

export default class World {
    constructor() {
        this.experience = new Experience();
        this.resources = this.experience.resources;

        this.worldEdges = DEFAULT_WORLD_EDGES;

        this.resources.on('ready', () => {
            console.log('here');
            this.environment = new Environment();
            this.floor = new Floor();
            this.water = new Water();
        });
    }
}
