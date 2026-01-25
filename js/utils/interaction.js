import { CONFIG, BLOCKS, BLOCK_DATA } from '../config.js';

/**
 * Shared utility for handling world interaction (raycasting, selection)
 */
export const InteractionUtils = {
    /**
     * Cast a ray from screen coordinates to find the target block
     * @param {Object} game - Game instance with world, camera, input
     * @param {number} range - Maximum reach distance
     * @returns {Object|null} - { x, y, z, face, distance, type: 'block'|'entity' }
     */
    getSelection(game, range = CONFIG.MINING_RANGE) {
        if (!game.player || !game.camera) return null;

        const player = game.player;
        const camera = game.camera;
        const mouse = game.input.mouse;

        // Get player screen position
        const playerScreen = camera.worldToScreen(player.x, player.y, player.z);

        // Calculate direction from player to mouse on screen
        const dx = mouse.x - playerScreen.x;
        const dy = mouse.y - playerScreen.y;

        // Convert screen delta to isometric world direction
        // In isometric: moving right on screen = +X, -Y in world
        //               moving down on screen = +X, +Y in world
        // Note: These divisors come from the specific projection; usually Width/2 and Height/2
        const isoX = (dx / (CONFIG.TILE_WIDTH / 2) + dy / (CONFIG.TILE_HEIGHT / 2)) / 2;
        const isoY = (dy / (CONFIG.TILE_HEIGHT / 2) - dx / (CONFIG.TILE_WIDTH / 2)) / 2;

        // Normalize
        const mag = Math.sqrt(isoX * isoX + isoY * isoY);
        if (mag === 0) return null;

        const dirX = isoX / mag;
        const dirY = isoY / mag;

        // Raycast
        // We step through the world to find the first solid block
        // We also check "cursor depth" approximation

        // 1. Raycast for blocks
        const stepSize = 0.5;
        let bestHit = null;
        let minDist = range + 1;

        // Check along the ray
        for (let d = 0.5; d <= range; d += stepSize) {
            const checkX = player.x + dirX * d;
            const checkY = player.y + dirY * d;

            // Check a column of blocks around the player's height
            // We look from eye level down to feet
            // Player Z is at feet. Eye level ~+1.5?
            // Actually, let's check a range relative to player Z

            for (let zOffset = 2; zOffset >= -1; zOffset--) {
                const checkZ = Math.floor(player.z + zOffset);
                const bx = Math.floor(checkX);
                const by = Math.floor(checkY);

                // Only valid coords
                const block = game.world.getBlock(bx, by, checkZ);
                if (block !== BLOCKS.AIR && block !== BLOCKS.WATER) {

                    // SCREEN SPACE CHECK
                    // Ensure the mouse is actually hovering this block visually
                    // Project block center to screen
                    // We check center of top face usually, or center of volume?
                    // Center of volume is safer for generic HIT.
                    // block coords are integer corner. Center is +0.5

                    // Actually, worldToScreen might project the "anchor" (bottom center? top center?)
                    // Let's assume input to worldToScreen is world coords.
                    const screenPos = camera.worldToScreen(bx + 0.5, by + 0.5, checkZ + 0.5);

                    // Check distance on screen
                    // TILE_WIDTH=64, TILE_HEIGHT=32.
                    // Hit box should be roughly the sprite size.
                    // Let's use a conservative box of half-tile.
                    const dx = Math.abs(mouse.x - screenPos.x);
                    const dy = Math.abs(mouse.y - screenPos.y); // Note: Project might map Z differently

                    // Sprite is 64x64 or 64x96. Center is roughly middle.
                    // Lets accept if within 24px radius (approx)
                    const hitRadius = 24 * camera.zoom;

                    if (dx <= hitRadius && dy <= hitRadius) {
                        // Found a VISUAL hit
                        const dist3D = Math.sqrt(
                            Math.pow(bx + 0.5 - player.x, 2) +
                            Math.pow(by + 0.5 - player.y, 2) +
                            Math.pow(checkZ + 0.5 - player.z, 2)
                        );

                        if (dist3D < minDist) {
                            minDist = dist3D;
                            bestHit = {
                                x: bx,
                                y: by,
                                z: checkZ,
                                distance: dist3D,
                                type: 'block',
                                blockId: block,
                                face: 'top'
                            };
                        }
                    }
                }
            }
        }

        // 2. Mouse-Plane intersection (Optional improvement)
        // If no block hit, where IS the cursor in the world if we project to z=player.z?
        if (!bestHit) {
            // "Air" selection at varying Z?
            // Usually we just want to highlight the block on the ground.
            // Let's rely on the iteration above finding the ground.
        }

        return bestHit;
    },

    /**
     * Get the potential placement position adjacent to a target block
     * @param {Object} game - Game instance
     * @param {Object} hit - Result from getSelection
     * @returns {Object|null} - { x, y, z } for placement
     */
    getPlacementPosition(game, hit) {
        if (!hit) return null;

        const { x, y, z } = hit;
        const player = game.player;

        // Simple logic: Place on top if floor, or side if wall.
        // We need 'face' logic here.

        // Let's re-calculate face based on precise intersection or relative position
        // If player is much higher, place on top.
        if (player.z >= z + 1) {
            return { x, y, z: z + 1 };
        }

        // Determine quadrant relative to block center
        const dx = player.x - (x + 0.5);
        const dy = player.y - (y + 0.5);

        if (Math.abs(dx) > Math.abs(dy)) {
            // X-axis predominant
            return { x: x + Math.sign(dx), y, z };
        } else {
            // Y-axis predominant
            return { x, y: y + Math.sign(dy), z };
        }
    }
};
