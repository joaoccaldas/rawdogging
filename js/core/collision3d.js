/**
 * 3D Collision System
 * Handles AABB collision detection for voxel world
 */

import { BLOCKS, BLOCK_DATA, CONFIG } from '../config.js';

export class Collision3D {
    constructor(game) {
        this.game = game;
    }
    
    /**
     * Check if an AABB collides with solid blocks
     * @param {number} x - Entity X position
     * @param {number} y - Entity Y position  
     * @param {number} z - Entity Z position
     * @param {number} width - Entity width (X)
     * @param {number} height - Entity height (Y)
     * @param {number} depth - Entity depth (Z/vertical)
     * @returns {boolean} True if collision detected
     */
    checkAABB(x, y, z, width, height, depth) {
        // Get bounding box in world coordinates
        const minX = Math.floor(x);
        const maxX = Math.floor(x + width);
        const minY = Math.floor(y);
        const maxY = Math.floor(y + height);
        const minZ = Math.floor(z);
        const maxZ = Math.floor(z + depth);
        
        // Check all blocks that could intersect
        for (let bx = minX; bx <= maxX; bx++) {
            for (let by = minY; by <= maxY; by++) {
                for (let bz = minZ; bz <= maxZ; bz++) {
                    const block = this.game.world.getBlock(bx, by, bz);
                    if (this.isSolidBlock(block)) {
                        // Precise AABB check
                        if (this.aabbIntersects(
                            x, y, z, x + width, y + height, z + depth,
                            bx, by, bz, bx + 1, by + 1, bz + 1
                        )) {
                            return true;
                        }
                    }
                }
            }
        }
        
        return false;
    }
    
    /**
     * Check if two AABBs intersect
     */
    aabbIntersects(minAX, minAY, minAZ, maxAX, maxAY, maxAZ,
                   minBX, minBY, minBZ, maxBX, maxBY, maxBZ) {
        return (minAX < maxBX && maxAX > minBX &&
                minAY < maxBY && maxAY > minBY &&
                minAZ < maxBZ && maxAZ > minBZ);
    }
    
    /**
     * Check if a block is solid (blocks movement)
     */
    isSolidBlock(blockId) {
        if (blockId === BLOCKS.AIR || blockId === undefined) return false;
        const data = BLOCK_DATA[blockId];
        if (!data) return false;
        return data.solid !== false;
    }
    
    /**
     * Move an entity with collision response
     * Returns the actual movement that occurred
     */
    moveWithCollision(entity, dx, dy, dz) {
        const w = entity.width || 0.6;
        const h = entity.height || 0.6;
        const d = entity.depth || 1.8;
        
        const result = { x: 0, y: 0, z: 0, grounded: false, hitWall: false, hitCeiling: false };
        
        // Move along X axis
        const newX = entity.x + dx;
        if (!this.checkAABB(newX, entity.y, entity.z, w, h, d)) {
            entity.x = newX;
            result.x = dx;
        } else {
            // Try stepping up (auto-step)
            if (entity.grounded && dz >= 0 && !this.checkAABB(newX, entity.y, entity.z + 1, w, h, d)) {
                entity.x = newX;
                entity.z += 1;
                result.x = dx;
                result.z = 1;
            } else {
                result.hitWall = true;
            }
        }
        
        // Move along Y axis
        const newY = entity.y + dy;
        if (!this.checkAABB(entity.x, newY, entity.z, w, h, d)) {
            entity.y = newY;
            result.y = dy;
        } else {
            // Try stepping up
            if (entity.grounded && dz >= 0 && !this.checkAABB(entity.x, newY, entity.z + 1, w, h, d)) {
                entity.y = newY;
                entity.z += 1;
                result.y = dy;
                result.z = 1;
            } else {
                result.hitWall = true;
            }
        }
        
        // Move along Z axis (vertical)
        const newZ = entity.z + dz;
        if (!this.checkAABB(entity.x, entity.y, newZ, w, h, d)) {
            entity.z = newZ;
            result.z += dz;
        } else {
            if (dz < 0) {
                // Falling - snap to ground
                result.grounded = true;
                entity.z = Math.floor(entity.z);
            } else {
                // Hit ceiling
                result.hitCeiling = true;
            }
        }
        
        return result;
    }
    
    /**
     * Raycast through voxels to find first solid block hit
     */
    raycast(originX, originY, originZ, dirX, dirY, dirZ, maxDistance = 10) {
        // Normalize direction
        const len = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);
        if (len === 0) return null;
        dirX /= len;
        dirY /= len;
        dirZ /= len;
        
        // DDA algorithm for voxel traversal
        let x = Math.floor(originX);
        let y = Math.floor(originY);
        let z = Math.floor(originZ);
        
        const stepX = dirX >= 0 ? 1 : -1;
        const stepY = dirY >= 0 ? 1 : -1;
        const stepZ = dirZ >= 0 ? 1 : -1;
        
        const tDeltaX = dirX !== 0 ? Math.abs(1 / dirX) : Infinity;
        const tDeltaY = dirY !== 0 ? Math.abs(1 / dirY) : Infinity;
        const tDeltaZ = dirZ !== 0 ? Math.abs(1 / dirZ) : Infinity;
        
        let tMaxX = dirX !== 0 ? ((dirX > 0 ? (x + 1 - originX) : (originX - x)) / Math.abs(dirX)) : Infinity;
        let tMaxY = dirY !== 0 ? ((dirY > 0 ? (y + 1 - originY) : (originY - y)) / Math.abs(dirY)) : Infinity;
        let tMaxZ = dirZ !== 0 ? ((dirZ > 0 ? (z + 1 - originZ) : (originZ - z)) / Math.abs(dirZ)) : Infinity;
        
        let t = 0;
        let face = null;
        
        while (t < maxDistance) {
            const block = this.game.world.getBlock(x, y, z);
            
            if (this.isSolidBlock(block)) {
                return {
                    x, y, z,
                    blockId: block,
                    face: face,
                    distance: t
                };
            }
            
            // Step to next voxel
            if (tMaxX < tMaxY) {
                if (tMaxX < tMaxZ) {
                    t = tMaxX;
                    tMaxX += tDeltaX;
                    x += stepX;
                    face = stepX > 0 ? 'left' : 'right';
                } else {
                    t = tMaxZ;
                    tMaxZ += tDeltaZ;
                    z += stepZ;
                    face = stepZ > 0 ? 'bottom' : 'top';
                }
            } else {
                if (tMaxY < tMaxZ) {
                    t = tMaxY;
                    tMaxY += tDeltaY;
                    y += stepY;
                    face = stepY > 0 ? 'back' : 'front';
                } else {
                    t = tMaxZ;
                    tMaxZ += tDeltaZ;
                    z += stepZ;
                    face = stepZ > 0 ? 'bottom' : 'top';
                }
            }
        }
        
        return null;
    }
    
    /**
     * Check if player would collide with a block placement
     */
    wouldCollideWithBlock(entity, blockX, blockY, blockZ) {
        const w = entity.width || 0.6;
        const h = entity.height || 0.6;
        const d = entity.depth || 1.8;
        
        return this.aabbIntersects(
            entity.x, entity.y, entity.z, entity.x + w, entity.y + h, entity.z + d,
            blockX, blockY, blockZ, blockX + 1, blockY + 1, blockZ + 1
        );
    }
    
    /**
     * Get all entities within range of a point
     */
    getEntitiesInRange(x, y, z, range) {
        const entities = [];
        const rangeSq = range * range;
        
        for (const entity of this.game.entities) {
            const dx = entity.x - x;
            const dy = entity.y - y;
            const dz = entity.z - z;
            const distSq = dx * dx + dy * dy + dz * dz;
            
            if (distSq <= rangeSq) {
                entities.push({
                    entity,
                    distance: Math.sqrt(distSq)
                });
            }
        }
        
        // Sort by distance
        entities.sort((a, b) => a.distance - b.distance);
        return entities;
    }
    
    /**
     * Check line of sight between two points
     */
    hasLineOfSight(x1, y1, z1, x2, y2, z2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dz = z2 - z1;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        const hit = this.raycast(x1, y1, z1, dx, dy, dz, dist);
        return hit === null;
    }
}
