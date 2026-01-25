import { Entity } from './entity.js';
import { CONFIG, ITEMS } from '../config.js';

export class ItemEntity extends Entity {
    constructor(game, x, y, z, itemType) {
        super(game, x, y, z);
        this.itemType = itemType;
        this.itemData = ITEMS[itemType];

        this.width = 0.4;
        this.height = 0.4;
        this.depth = 0.4;
        this.emoji = this.itemData ? this.itemData.emoji : '❓';
        this.size = 0.5;

        // Float animation
        this.floatOffset = Math.random() * Math.PI * 2;
        this.originalZ = z;
        this.creationTime = Date.now();

        // Physics
        this.grounded = false;

        // Pickup
        this.pickupDelay = 500; // ms before can be picked up
    }

    update(deltaTime) {
        const now = Date.now();

        // Floating animation
        if (this.grounded) {
            this.z = this.originalZ + Math.sin((now / 500) + this.floatOffset) * 0.1;
        } else {
            // Gravity
            this.vz -= CONFIG.GRAVITY * deltaTime * 0.5; // Slower gravity for items?
            this.z += this.vz * deltaTime;

            // Floor collision
            const floor = Math.floor(this.z);
            if (this.game.world.getBlock(Math.floor(this.x), Math.floor(this.y), floor) !== 0) {
                this.blockCollision(floor + 1);
            }
        }

        // Pickup Logic
        if (now - this.creationTime > this.pickupDelay) {
            this.checkPickup();
        }
    }

    blockCollision(groundZ) {
        this.z = groundZ;
        this.vz = 0;
        this.grounded = true;
        this.originalZ = this.z;
    }

    checkPickup() {
        const player = this.game.player;
        if (!player) return;

        const dist = Math.sqrt(
            Math.pow(this.x - player.x, 2) +
            Math.pow(this.y - player.y, 2) +
            Math.pow(this.z - player.z, 2)
        );

        if (dist < 1.5) { // Pickup range
            if (player.addItem(this.itemType)) {
                this.isDead = true;
                // TODO: Play pickup sound
            }
        }
    }
}
