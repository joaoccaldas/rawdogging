// Dynamic Lighting System
import { CONFIG, BLOCK_DATA, BLOCKS } from '../config.js';

export class LightingSystem {
    constructor(game) {
        this.game = game;
        this.lightMap = new Map(); // key: "x,y,z" -> light level 0-15
        this.lightSources = []; // { x, y, z, level, color }
        this.sunlightLevel = 15;
        this.updateQueue = [];
        this.maxLightLevel = 15;
    }

    update(deltaTime) {
        // Update sunlight based on time of day
        const timeOfDay = this.game.world?.timeOfDay || 0.5;
        
        if (timeOfDay < CONFIG.DAWN_START || timeOfDay > 0.9) {
            // Night
            this.sunlightLevel = 4;
        } else if (timeOfDay < 0.35) {
            // Dawn transition
            const t = (timeOfDay - CONFIG.DAWN_START) / 0.15;
            this.sunlightLevel = Math.floor(4 + t * 11);
        } else if (timeOfDay < CONFIG.DUSK_START) {
            // Day
            this.sunlightLevel = 15;
        } else {
            // Dusk transition
            const t = (timeOfDay - CONFIG.DUSK_START) / 0.2;
            this.sunlightLevel = Math.floor(15 - t * 11);
        }
    }

    // Get light level at a position
    getLightLevel(x, y, z) {
        const key = `${Math.floor(x)},${Math.floor(y)},${Math.floor(z)}`;
        const cached = this.lightMap.get(key);
        if (cached !== undefined) return cached;

        // Calculate light level
        let lightLevel = 0;
        
        // Check sunlight (simplified - from above)
        const surfaceZ = this.game.world.getHeight(Math.floor(x), Math.floor(y));
        if (z > surfaceZ) {
            lightLevel = this.sunlightLevel;
        } else {
            // Underground - reduced light
            const depthPenalty = Math.min(10, (surfaceZ - z) * 2);
            lightLevel = Math.max(0, this.sunlightLevel - depthPenalty);
        }

        // Check nearby light sources (torches, campfires, etc.)
        for (const source of this.lightSources) {
            const dist = Math.sqrt(
                Math.pow(x - source.x, 2) + 
                Math.pow(y - source.y, 2) + 
                Math.pow(z - source.z, 2)
            );
            if (dist < source.level) {
                const contribution = Math.max(0, source.level - dist);
                lightLevel = Math.max(lightLevel, contribution);
            }
        }

        // Check block light sources in range
        const checkRadius = 8;
        for (let dx = -checkRadius; dx <= checkRadius; dx++) {
            for (let dy = -checkRadius; dy <= checkRadius; dy++) {
                for (let dz = -checkRadius; dz <= checkRadius; dz++) {
                    const bx = Math.floor(x) + dx;
                    const by = Math.floor(y) + dy;
                    const bz = Math.floor(z) + dz;
                    const block = this.game.world.getBlock(bx, by, bz);
                    const blockData = BLOCK_DATA[block];
                    
                    if (blockData && blockData.lightLevel > 0) {
                        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
                        if (dist < blockData.lightLevel) {
                            const contribution = Math.max(0, blockData.lightLevel - dist);
                            lightLevel = Math.max(lightLevel, contribution);
                        }
                    }
                }
            }
        }

        // Clamp and cache
        lightLevel = Math.min(this.maxLightLevel, Math.max(0, lightLevel));
        this.lightMap.set(key, lightLevel);
        
        return lightLevel;
    }

    // Convert light level to brightness multiplier (0.1 - 1.0)
    getBrightness(x, y, z) {
        const level = this.getLightLevel(x, y, z);
        return 0.1 + (level / this.maxLightLevel) * 0.9;
    }

    // Add a dynamic light source
    addLightSource(x, y, z, level, color = '#FFFFFF') {
        this.lightSources.push({ x, y, z, level, color });
        this.invalidateArea(x, y, z, level);
    }

    // Remove a light source
    removeLightSource(x, y, z) {
        const idx = this.lightSources.findIndex(
            s => Math.floor(s.x) === Math.floor(x) && 
                 Math.floor(s.y) === Math.floor(y) && 
                 Math.floor(s.z) === Math.floor(z)
        );
        if (idx !== -1) {
            const source = this.lightSources[idx];
            this.lightSources.splice(idx, 1);
            this.invalidateArea(x, y, z, source.level);
        }
    }

    // Invalidate cached light values in an area
    invalidateArea(x, y, z, radius) {
        const keysToDelete = [];
        for (const key of this.lightMap.keys()) {
            const [kx, ky, kz] = key.split(',').map(Number);
            const dist = Math.sqrt(
                Math.pow(kx - x, 2) + 
                Math.pow(ky - y, 2) + 
                Math.pow(kz - z, 2)
            );
            if (dist <= radius + 1) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(k => this.lightMap.delete(k));
    }

    // Called when a block is placed or removed
    onBlockChange(x, y, z) {
        this.invalidateArea(x, y, z, 10);
    }

    // Clear cache (call when moving to new area)
    clearCache() {
        this.lightMap.clear();
    }
}
