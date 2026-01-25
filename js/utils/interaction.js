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

        // 2. Mouse-Plane intersection - If no block hit, find ground position for placement
        if (!bestHit) {
            // Calculate world position based on mouse and player position
            const playerScreen = camera.worldToScreen(player.x, player.y, player.z);
            const dx = mouse.x - playerScreen.x;
            const dy = mouse.y - playerScreen.y;
            
            // Convert screen delta to isometric world direction
            const isoX = (dx / (CONFIG.TILE_WIDTH / 2) + dy / (CONFIG.TILE_HEIGHT / 2)) / 2;
            const isoY = (dy / (CONFIG.TILE_HEIGHT / 2) - dx / (CONFIG.TILE_WIDTH / 2)) / 2;
            
            // Calculate target position at a fixed distance
            const mag = Math.sqrt(isoX * isoX + isoY * isoY);
            if (mag > 0) {
                const targetDist = Math.min(range, 3); // Default 3 blocks away
                const targetX = Math.floor(player.x + (isoX / mag) * targetDist);
                const targetY = Math.floor(player.y + (isoY / mag) * targetDist);
                
                // Find the ground level at this position
                let groundZ = Math.floor(player.z);
                for (let z = Math.floor(player.z) + 2; z >= 0; z--) {
                    const block = game.world.getBlock(targetX, targetY, z);
                    if (block !== BLOCKS.AIR && block !== BLOCKS.WATER) {
                        groundZ = z + 1; // Place on top of this block
                        break;
                    }
                }
                
                return {
                    x: targetX,
                    y: targetY,
                    z: groundZ - 1, // The block we're "targeting" is below placement
                    distance: targetDist,
                    type: 'ground',
                    blockId: game.world.getBlock(targetX, targetY, groundZ - 1),
                    face: 'top'
                };
            }
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

        const { x, y, z, face, type } = hit;
        const player = game.player;

        // For ground-type hits (no specific block targeted), place at the hit location's top
        if (type === 'ground') {
            return { x, y, z: z + 1 };
        }

        // Check if the position above the hit block is free - prefer stacking
        const aboveBlock = game.world.getBlock(x, y, z + 1);
        if (aboveBlock === BLOCKS.AIR) {
            return { x, y, z: z + 1 };
        }

        // If above is occupied, try sides based on player position
        // Determine quadrant relative to block center
        const dx = player.x - (x + 0.5);
        const dy = player.y - (y + 0.5);

        // Try the side the player is on
        let sideX = x, sideY = y;
        if (Math.abs(dx) > Math.abs(dy)) {
            sideX = x + Math.sign(dx);
        } else {
            sideY = y + Math.sign(dy);
        }
        
        // Check if side position is free
        if (game.world.getBlock(sideX, sideY, z) === BLOCKS.AIR) {
            return { x: sideX, y: sideY, z };
        }

        // Fallback to top even if occupied (will fail placement check later)
        return { x, y, z: z + 1 };
    },
    
    /**
     * Check if a block is a crafting station
     * @param {number} blockId - Block ID to check
     * @returns {string|null} - Station type or null
     */
    getStationType(blockId) {
        const stationMap = {
            [BLOCKS.CRAFTING_TABLE]: 'crafting_table',
            [BLOCKS.FURNACE]: 'furnace',
            [BLOCKS.ANVIL]: 'anvil',
            [BLOCKS.CAMPFIRE]: 'campfire',
            [BLOCKS.CHEST]: 'chest',
            [BLOCKS.CAULDRON]: 'cauldron'
        };
        return stationMap[blockId] || null;
    },
    
    /**
     * Check if a block is interactable (door, lever, chest, etc.)
     * @param {number} blockId - Block ID to check
     * @returns {boolean}
     */
    isInteractable(blockId) {
        const interactables = [
            BLOCKS.DOOR,
            BLOCKS.TRAPDOOR,
            BLOCKS.CHEST,
            BLOCKS.FURNACE,
            BLOCKS.CRAFTING_TABLE,
            BLOCKS.ANVIL,
            BLOCKS.BED,
            BLOCKS.LEVER,
            BLOCKS.BUTTON
        ];
        return interactables.includes(blockId);
    },
    
    /**
     * Handle interaction with a specific block
     * @param {Object} game - Game instance
     * @param {number} blockId - Block being interacted with
     * @param {number} x - Block x position
     * @param {number} y - Block y position
     * @param {number} z - Block z position
     * @returns {boolean} - Whether interaction was handled
     */
    handleBlockInteraction(game, blockId, x, y, z) {
        const stationType = this.getStationType(blockId);
        
        // Handle crafting stations
        if (stationType && game.craftingStations) {
            game.craftingStations.openStation(stationType, x, y, z);
            game.audio?.play('open');
            return true;
        }
        
        // Handle chests
        if (blockId === BLOCKS.CHEST && game.storage) {
            game.storage.openChestAt(x, y, z);
            game.audio?.play('open');
            return true;
        }
        
        // Handle doors
        if (blockId === BLOCKS.DOOR) {
            const currentState = game.world.getBlockState?.(x, y, z) || {};
            const isOpen = currentState.open || false;
            game.world.setBlockState?.(x, y, z, { ...currentState, open: !isOpen });
            game.audio?.play(isOpen ? 'close' : 'open');
            return true;
        }
        
        // Handle beds
        if (blockId === BLOCKS.BED) {
            if (game.world.isNight?.()) {
                game.player.spawnPoint = { x, y, z: z + 1 };
                game.ui?.showNotification('Spawn point set!', 'success');
                game.world.skipToMorning?.();
                return true;
            } else {
                game.ui?.showNotification('You can only sleep at night', 'warning');
                return true;
            }
        }
        
        return false;
    }
};
