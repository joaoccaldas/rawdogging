// Camera / Viewport Management
import { CONFIG } from '../config.js';

export class Camera {
    constructor(game) {
        this.game = game;
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.targetZ = 0;
        this.zoom = 1;
        this.width = 0;
        this.height = 0;
        this.smoothing = 1.0; // Instant lock to fix centering

        this.followedEntity = null;
        this.shake = { x: 0, y: 0, intensity: 0, duration: 0 };
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.zoom = 1; // Force reset zoom
    }

    follow(entity) {
        this.followedEntity = entity;
        // Immediate update of targets to prevent lag?
        if (entity) {
            this.targetX = entity.x;
            this.targetY = entity.y;
            this.targetZ = entity.z;
        }
    }

    snapToTarget() {
        if (this.followedEntity) {
            this.targetX = this.followedEntity.x;
            this.targetY = this.followedEntity.y;
            this.targetZ = this.followedEntity.z;
            this.x = this.targetX;
            this.y = this.targetY;
            this.z = this.targetZ;
        }
    }

    update(deltaTime) {
        // Update target from followed entity
        if (this.followedEntity) {
            this.targetX = this.followedEntity.x;
            this.targetY = this.followedEntity.y;
            this.targetZ = this.followedEntity.z;
        }

        // Smooth camera follow
        this.x += (this.targetX - this.x) * this.smoothing;
        this.y += (this.targetY - this.y) * this.smoothing;
        this.z += (this.targetZ - this.z) * this.smoothing;

        // Update shake
        if (this.shake.duration > 0) {
            this.shake.duration -= deltaTime;
            this.shake.x = (Math.random() - 0.5) * this.shake.intensity;
            this.shake.y = (Math.random() - 0.5) * this.shake.intensity;
        } else {
            this.shake.x = 0;
            this.shake.y = 0;
        }
    }

    addShake(intensity, duration) {
        this.shake.intensity = Math.max(this.shake.intensity, intensity);
        this.shake.duration = Math.max(this.shake.duration, duration);
    }

    // Convert world coordinates to isometric screen coordinates
    // Convert world coordinates to isometric screen coordinates
    worldToScreen(worldX, worldY, worldZ = 0) {
        // Isometric projection of target point
        const isoX = (worldX - worldY) * (CONFIG.TILE_WIDTH / 2);
        const isoY = (worldX + worldY) * (CONFIG.TILE_HEIGHT / 2) - worldZ * CONFIG.TILE_DEPTH;

        // Isometric projection of camera center (this.x, this.y, this.z)
        const camIsoX = (this.x - this.y) * (CONFIG.TILE_WIDTH / 2);
        const camIsoY = (this.x + this.y) * (CONFIG.TILE_HEIGHT / 2) - this.z * CONFIG.TILE_DEPTH;

        // Apply camera offset:
        // We want (camIsoX, camIsoY) to be at (this.width/2, this.height/2).
        // screenX = (isoX - camIsoX) * zoom + center + shake

        const screenX = (isoX - camIsoX) * this.zoom + this.width / 2 + this.shake.x;
        const screenY = (isoY - camIsoY) * this.zoom + this.height / 2 + this.shake.y;

        return { x: screenX, y: screenY };
    }

    worldToScreenX(x, y) {
        return (x - y) * (CONFIG.TILE_WIDTH / 2);
    }

    worldToScreenY(x, y, z = 0) {
        return (x + y) * (CONFIG.TILE_HEIGHT / 2) - z * CONFIG.TILE_DEPTH;
    }

    // Convert screen coordinates to world coordinates
    screenToWorld(screenX, screenY, assumedZ = null) {
        // Reverse the transformations
        const relX = (screenX - this.width / 2 - this.shake.x) / this.zoom;
        const relY = (screenY - this.height / 2 - this.shake.y) / this.zoom;

        // Get camera isometric position (without Z for base calculation)
        const camIsoX = (this.x - this.y) * (CONFIG.TILE_WIDTH / 2);
        const camIsoY = (this.x + this.y) * (CONFIG.TILE_HEIGHT / 2);
        
        // The clicked isometric position relative to world origin
        const isoX = relX + camIsoX;
        
        // For Y, we need to account for Z offset
        // The camera is offset by -z * TILE_DEPTH in screen space
        // When converting back, we assume we're clicking at a certain Z level
        const targetZ = assumedZ !== null ? assumedZ : this.z;
        const zOffset = targetZ * CONFIG.TILE_DEPTH;
        const isoY = relY + camIsoY + zOffset;

        // Reverse isometric projection
        // isoX = (x - y) * (W/2)  =>  x - y = isoX / (W/2)
        // isoY = (x + y) * (H/2)  =>  x + y = isoY / (H/2)
        // Solving: x = ((x-y) + (x+y)) / 2, y = ((x+y) - (x-y)) / 2
        
        const xMinusY = isoX / (CONFIG.TILE_WIDTH / 2);
        const xPlusY = isoY / (CONFIG.TILE_HEIGHT / 2);
        
        const worldX = (xMinusY + xPlusY) / 2;
        const worldY = (xPlusY - xMinusY) / 2;

        return { x: worldX, y: worldY, z: targetZ };
    }

    // Get visible chunk coordinates
    getVisibleChunks() {
        const chunks = [];
        const renderDist = CONFIG.RENDER_DISTANCE;

        const centerChunkX = Math.floor(this.x / CONFIG.CHUNK_SIZE);
        const centerChunkY = Math.floor(this.y / CONFIG.CHUNK_SIZE);

        for (let dx = -renderDist; dx <= renderDist; dx++) {
            for (let dy = -renderDist; dy <= renderDist; dy++) {
                chunks.push({
                    x: centerChunkX + dx,
                    y: centerChunkY + dy
                });
            }
        }

        return chunks;
    }

    // Check if a world position is visible
    isVisible(worldX, worldY, worldZ = 0, margin = 100) {
        const screen = this.worldToScreen(worldX, worldY, worldZ);
        return screen.x >= -margin &&
            screen.x <= this.width + margin &&
            screen.y >= -margin &&
            screen.y <= this.height + margin;
    }

    setZoom(zoom) {
        this.zoom = Math.max(0.5, Math.min(2, zoom));
    }
}
