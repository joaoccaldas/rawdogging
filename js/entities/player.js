import { Entity } from './entity.js';
import { ItemEntity } from './item.js';
import { ITEMS, CONFIG, BLOCKS, BLOCK_DATA } from '../config.js';
import { Enemy } from '../entities/enemy.js';

export class Player extends Entity {
    constructor(game, x, y, z) {
        super(game, x, y, z);
        this.emoji = '🧍';
        this.width = 0.6;
        this.height = 0.6;
        this.depth = 1.8;

        // Spawn Point
        this.spawnPoint = { x, y, z };

        // Stats
        this.health = CONFIG.PLAYER_MAX_HEALTH;
        this.maxHealth = CONFIG.PLAYER_MAX_HEALTH;
        this.hunger = CONFIG.PLAYER_MAX_HUNGER;
        this.maxHunger = CONFIG.PLAYER_MAX_HUNGER;

        // Fall damage tracking
        this.fallStartZ = this.z;
        this.wasFalling = false;

        // Swimming/drowning
        this.isInWater = false;
        this.isSwimming = false;
        this.airTime = CONFIG.DROWNING_TIME;
        this.drowningTimer = 0;

        // Progression
        this.xp = 0;
        this.level = 1;
        this.nextLevelXp = 100;

        // Physics
        this.speed = CONFIG.PLAYER_SPEED;
        this.jumpForce = CONFIG.PLAYER_JUMP_FORCE;
        this.grounded = false;

        // Inventory
        this.inventory = new Array(CONFIG.INVENTORY_SIZE).fill(null);
        this.hotbar = new Array(CONFIG.HOTBAR_SIZE).fill(null);
        this.selectedSlot = 0;

        // Initial items - Stone Age starter kit
        this.hotbar[0] = { ...ITEMS.club, count: 1 };
        this.hotbar[1] = { ...ITEMS.cobblestone, count: 5 };
        this.hotbar[2] = { ...ITEMS.stick, count: 8 };
        this.hotbar[2] = { ...ITEMS.cooked_meat, count: 5 };

        // Interaction
        this.interactionRange = CONFIG.MINING_RANGE;
        this.lastAttackTime = 0;
        this.walkTimer = 0; // Steps

        // UI refs
        this.ui = {
            hearts: document.getElementById('health-text'),
            hunger: document.getElementById('hunger-text'),
            hotbar: document.getElementById('hotbar'),
            level: document.getElementById('level-text'),
            xpBar: document.getElementById('xp-fill')
        };

        this.updateUI();
    }

    update(deltaTime) {
        // Safety Check for NaNs
        if (isNaN(this.x) || isNaN(this.y) || isNaN(this.z)) {
            console.error('Player coordinates are NaN! Resetting to spawn.');
            this.x = 0.5; this.y = 0.5; this.z = 20;
            this.vx = 0; this.vy = 0; this.vz = 0;
        }

        this.handleInput(deltaTime);
        this.applyPhysics(deltaTime);
        this.updateSurvival(deltaTime);
        this.updateUI();
    }

    updateSurvival(deltaTime) {
        // Hunger drain over time
        if (this.hunger > 0) {
            this.hunger -= CONFIG.HUNGER_DRAIN_RATE * deltaTime;
            this.hunger = Math.max(0, this.hunger);
        }

        // Hunger damage when starving
        if (this.hunger <= CONFIG.HUNGER_DAMAGE_THRESHOLD) {
            this.hungerDamageTimer = (this.hungerDamageTimer || 0) + deltaTime;
            if (this.hungerDamageTimer >= 1) { // Damage every second
                this.hungerDamageTimer = 0;
                this.takeDamage(CONFIG.HUNGER_DAMAGE_RATE, null, 'starvation');
            }
        }

        // Health regeneration when well-fed (hunger > 80%)
        if (this.hunger > this.maxHunger * 0.8 && this.health < this.maxHealth) {
            this.regenTimer = (this.regenTimer || 0) + deltaTime;
            if (this.regenTimer >= 2) { // Regen every 2 seconds
                this.regenTimer = 0;
                this.health = Math.min(this.maxHealth, this.health + 1);
            }
        }
        
        // Process active effects
        this.updateEffects(deltaTime);

        // Drowning logic
        if (this.isInWater && !this.isSwimming) {
            this.airTime -= deltaTime;
            if (this.airTime <= 0) {
                this.drowningTimer += deltaTime;
                if (this.drowningTimer >= 1) {
                    this.drowningTimer = 0;
                    this.takeDamage(CONFIG.DROWNING_DAMAGE, null, 'drowning');
                }
            }
        } else {
            // Restore air when out of water
            this.airTime = Math.min(CONFIG.DROWNING_TIME, this.airTime + deltaTime * 2);
            this.drowningTimer = 0;
        }
    }
    
    updateEffects(deltaTime) {
        if (!this.activeEffects) return;
        
        // Regeneration effect
        if (this.activeEffects.regen) {
            this.activeEffects.regen.timer += deltaTime;
            if (this.activeEffects.regen.timer >= 1) {
                this.activeEffects.regen.timer = 0;
                if (this.health < this.maxHealth) {
                    this.health = Math.min(this.maxHealth, this.health + 2);
                    this.game.particles.emit(this.x, this.y, this.z + 1.5, '#4ade80', 3);
                }
            }
            
            this.activeEffects.regen.duration -= deltaTime;
            if (this.activeEffects.regen.duration <= 0) {
                delete this.activeEffects.regen;
            }
        }
    }

    handleInput(deltaTime) {
        const input = this.game.input;
        if (!input) return;
        
        const cam = this.game.camera;

        // Movement
        const move = input.getMovement() || { x: 0, y: 0 };

        // Relative to camera
        // Note: Simple movement for now, ignoring camera rotation as it's fixed isometric
        // In true isometric, 'up' is up-right or up-left depending on convention.
        // Here we'll map W to 'North' (decreasing Y, decreasing X in iso?? No wait)
        // Let's stick to world coordinates: +X is R, +Y is D.
        // Isometric: X axis goes down-right, Y axis goes down-left.
        // To move 'Up' on screen (negative Screen Y), we need to move negative X and negative Y in world.
        // To move 'Right' on screen, we need +X and -Y.

        // Let's implement standard controls relative to screen:
        // W (Up) -> -X, -Y
        // S (Down) -> +X, +Y
        // A (Left) -> -X, +Y
        // D (Right) -> +X, -Y

        // Isometric Control Mapping
        // W (Up) -> -X, -Y
        // S (Down) -> +X, +Y
        // A (Left) -> -X, +Y
        // D (Right) -> +X, -Y

        // But getMovement returns normalized x/y (-1 to 1).
        // move.y < 0 is Up. move.x < 0 is Left.

        let dx = 0;
        let dy = 0;

        // Apply basis vectors
        // Up/Down (Y axis of input)
        // Up (-1) => -X, -Y
        dx += move.y;
        dy += move.y;

        // Left/Right (X axis of input)
        // Right (+1) => +X, -Y
        dx += move.x;
        dy -= move.x;

        // Normalize again to cap speed?
        // If holding W (-X, -Y) and D (+X, -Y), result is (0, -2Y).
        // Should trigger pure "Up-Right" screen movement.

        if (dx !== 0 || dy !== 0) {
            const len = Math.sqrt(dx * dx + dy * dy);
            dx /= len;
            dy /= len;
            // Slower movement in water
            const currentSpeed = this.isInWater ? CONFIG.SWIM_SPEED : this.speed;
            this.vx = dx * currentSpeed;
            this.vy = dy * currentSpeed;
        } else {
            // Explicitly zero velocity when no movement input
            this.vx = 0;
            this.vy = 0;
        }

        // Jump / Swim up
        if (input.isJumping()) {
            if (this.isInWater) {
                // Swimming up
                this.vz = CONFIG.SWIM_SPEED * 2;
            } else if (this.grounded) {
                this.vz = this.jumpForce;
                this.grounded = false;
                this.game.audio.play('jump');
            }
        }

        // Mining / Attacking
        if (input.isMining()) {
            this.tryMine();
        }

        if (input.isAttacking()) {
            this.tryAttack();
        }

        // Placing / Using
        if (input.isUsing()) {
            this.tryPlace();
        }
    }

    applyPhysics(deltaTime) {
        const dt = Math.min(deltaTime, 0.1); // Cap delta to prevent tunneling

        // Debug: Log first 5 frames of physics
        if (!this._debugFrameCount) this._debugFrameCount = 0;
        this._debugFrameCount++;
        const shouldLog = this._debugFrameCount <= 5;

        if (shouldLog) {
            console.log(`Physics[${this._debugFrameCount}]: pos(${this.x.toFixed(2)},${this.y.toFixed(2)},${this.z.toFixed(2)}) vel(${this.vx.toFixed(2)},${this.vy.toFixed(2)},${this.vz.toFixed(2)}) grounded=${this.grounded} dt=${dt.toFixed(4)}`);
        }

        // Check if in water
        const blockAtFeet = this.game.world.getBlock(Math.floor(this.x), Math.floor(this.y), Math.floor(this.z));
        const blockAtHead = this.game.world.getBlock(Math.floor(this.x), Math.floor(this.y), Math.floor(this.z + 1));
        const wasInWater = this.isInWater;
        this.isInWater = blockAtFeet === BLOCKS.WATER || blockAtHead === BLOCKS.WATER;
        this.isSwimming = blockAtHead === BLOCKS.WATER; // Fully submerged

        // Water entry splash
        if (this.isInWater && !wasInWater) {
            this.game.audio.play('splash');
            this.game.particles.emit(this.x, this.y, this.z, '#4169E1', 10);
        }

        // Track fall start position
        if (!this.grounded && this.vz < 0 && !this.wasFalling) {
            this.fallStartZ = this.z;
            this.wasFalling = true;
        }

        // Apply gravity (reduced in water)
        if (!this.grounded) {
            if (this.isInWater) {
                // Water physics - slower fall, can swim up
                this.vz -= CONFIG.GRAVITY * CONFIG.WATER_DRAG;
                this.vz = Math.max(this.vz, -2); // Terminal velocity in water
                
                // Apply water drag to horizontal movement
                this.vx *= 0.95;
                this.vy *= 0.95;
            } else {
                this.vz -= CONFIG.GRAVITY;
            }
        } else {
            // Ground friction when no input
            // Only apply if we're not actively moving via input
            // The handleInput already sets vx/vy to 0 when no input
        }

        // Knockback decay
        if (Math.abs(this.vx) > this.speed) this.vx *= 0.9;
        if (Math.abs(this.vy) > this.speed) this.vy *= 0.9;

        // Invincibility
        if (this.invincibleTime > 0) this.invincibleTime -= deltaTime * 1000;

        // Footsteps
        if (this.grounded && (this.vx !== 0 || this.vy !== 0)) {
            this.walkTimer -= deltaTime;
            if (this.walkTimer <= 0) {
                this.walkTimer = 0.4; // Step interval
                // Pitch shift for variety? Audio manager handles simple play
                this.game.audio.play('walk');
            }
        } else {
            this.walkTimer = 0; // Reset
        }

        // Predict next position
        const nextX = this.x + this.vx * dt;
        const nextY = this.y + this.vy * dt;
        const nextZ = this.z + this.vz * dt;

        // Collision detection (Simple box vs block center check)
        // Check X
        if (!this.checkCollision(nextX, this.y, this.z)) {
            this.x = nextX;
        } else {
            // Wall collision feedback
            if (Math.abs(this.vx) > this.speed * 0.5) {
                this.game.particles.emit(nextX + (this.vx > 0 ? this.width : 0), this.y + this.height/2, this.z + 0.5, '#888888', 3);
            }
            this.vx = 0;
        }

        // Check Y
        if (!this.checkCollision(this.x, nextY, this.z)) {
            this.y = nextY;
        } else {
            // Wall collision feedback
            if (Math.abs(this.vy) > this.speed * 0.5) {
                this.game.particles.emit(this.x + this.width/2, nextY + (this.vy > 0 ? this.height : 0), this.z + 0.5, '#888888', 3);
            }
            this.vy = 0;
        }

        // Check Z (Ground/Ceiling)
        if (!this.checkCollision(this.x, this.y, nextZ)) {
            this.z = nextZ;
            this.grounded = false;
        } else {
            if (this.vz < 0) {
                // Landing on ground - check for fall damage
                if (this.wasFalling && !this.isInWater) {
                    const fallDistance = this.fallStartZ - this.z;
                    if (fallDistance >= CONFIG.FALL_DAMAGE_MIN_HEIGHT) {
                        const damage = Math.floor((fallDistance - CONFIG.FALL_DAMAGE_MIN_HEIGHT + 1) * CONFIG.FALL_DAMAGE_MULTIPLIER);
                        this.takeDamage(damage, null, 'fall');
                        this.game.camera.addShake(damage * 0.5, 0.2);
                    }
                }
                this.wasFalling = false;
                
                // Landing on ground
                this.grounded = true;
                // Snap to the top of the block we landed on
                // Find the actual ground level by checking from current position down
                const groundZ = Math.floor(this.z);
                this.z = groundZ;
                this.vz = 0;
            } else {
                // Hit ceiling
                this.vz = 0;
            }
        }

        // World Bounds (Bottom)
        if (this.z < -50) {
            console.warn(`Player fell out of world! Resetting from Z=${this.z}`);
            this.x = 0;
            this.y = 0;
            this.z = 50; // High Respawn
            this.vz = 0;
            this.grounded = false;
            if (this.game.camera) this.game.camera.snapToTarget();
        }
    }

    checkCollision(x, y, z) {
        const world = this.game.world;

        // Check bounding box corners
        // Small margin to allow fitting in 1x1 holes
        const margin = 0.2; // Slightly larger margin to prevent wall sticking? No, smaller margin = tighter fit. 
        // If margin is 0.1, Width 0.6. Box is x+0.1 to x+0.5. Inside one block (floor).
        // If x=0.9. Box x+0.1=1.0. x+0.5=1.4. Checks block 1. Correct.
        // It seems fine.

        const minX = Math.floor(x + margin);
        const maxX = Math.floor(x + this.width - margin);
        const minY = Math.floor(y + margin);
        const maxY = Math.floor(y + this.height - margin);
        const minZ = Math.floor(z);
        const maxZ = Math.floor(z + this.depth - 0.1); // Don't check head if exactly at integer limit?

        for (let bx = minX; bx <= maxX; bx++) {
            for (let by = minY; by <= maxY; by++) {
                for (let bz = minZ; bz < maxZ; bz++) {
                    const block = world.getBlock(bx, by, bz);
                    if (block !== BLOCKS.AIR && block !== BLOCKS.WATER && BLOCK_DATA[block]?.solid) {
                        return true;
                    }
                }
            }
        }
        // Debug: log collision miss (disabled to reduce spam)
        // if (Math.random() < 0.01) {
        //     console.log(`Collision MISS: pos(${x.toFixed(2)},${y.toFixed(2)},${z.toFixed(2)}) checking blocks(${minX}-${maxX}, ${minY}-${maxY}, ${minZ}-${maxZ}) block@(${minX},${minY},${minZ})=${world.getBlock(minX, minY, minZ)}`);
        // }
        return false;
    }

    tryMine() {
        // Mining cooldown check
        const now = Date.now();
        if (!this.lastMineTime) this.lastMineTime = 0;
        if (now - this.lastMineTime < 250) return; // 250ms cooldown between mines
        
        // Get player screen position
        const playerScreen = this.game.camera.worldToScreen(this.x, this.y, this.z);
        const mouseX = this.game.input.mouse.x;
        const mouseY = this.game.input.mouse.y;
        
        // Calculate direction from player to mouse on screen
        const dx = mouseX - playerScreen.x;
        const dy = mouseY - playerScreen.y;
        
        // Convert screen direction to isometric world direction
        // In isometric: moving right on screen = +X, -Y in world
        //               moving down on screen = +X, +Y in world
        const isoX = (dx / (CONFIG.TILE_WIDTH / 2) + dy / (CONFIG.TILE_HEIGHT / 2)) / 2;
        const isoY = (dy / (CONFIG.TILE_HEIGHT / 2) - dx / (CONFIG.TILE_WIDTH / 2)) / 2;
        
        // Normalize and scale to get target offset (max ~3 blocks away)
        const mag = Math.sqrt(isoX * isoX + isoY * isoY);
        let targetOffsetX = 0, targetOffsetY = 0;
        if (mag > 0.5) {
            const scale = Math.min(3, mag) / mag;
            targetOffsetX = isoX * scale;
            targetOffsetY = isoY * scale;
        }
        
        // Target block position
        const bx = Math.floor(this.x + targetOffsetX);
        const by = Math.floor(this.y + targetOffsetY);
        
        // Find the surface block or block at player level
        const playerZ = Math.floor(this.z);
        let bz = this.game.world.getHeight(bx, by);
        
        // Prefer blocks at or near player's level
        if (Math.abs(bz - playerZ) > 2) {
            // Look for blocks near player level
            for (let checkZ = playerZ; checkZ >= playerZ - 2; checkZ--) {
                const checkBlock = this.game.world.getBlock(bx, by, checkZ);
                if (checkBlock !== BLOCKS.AIR && checkBlock !== BLOCKS.WATER) {
                    bz = checkZ;
                    break;
                }
            }
        }

        // Distance check
        const dist = Math.hypot(bx + 0.5 - this.x, by + 0.5 - this.y, bz - this.z);
        
        console.log(`Mining: player(${this.x.toFixed(1)},${this.y.toFixed(1)},${this.z.toFixed(1)}) target(${bx},${by},${bz}) dist=${dist.toFixed(2)}`);
        
        if (dist > this.interactionRange) {
            console.log('Block too far');
            return;
        }
        
        const block = this.game.world.getBlock(bx, by, bz);
        
        if (block === BLOCKS.AIR) {
            console.log('Block is air');
            return;
        }
        if (block === BLOCKS.BEDROCK) {
            console.log('Block is bedrock');
            return;
        }
        
        const blockInfo = BLOCK_DATA[block];
        if (!blockInfo) {
            console.log('No block info');
            return;
        }

        // Tool check - hardness > 2 needs pickaxe
        const tool = this.getSelectedItem();
        let canMine = true;
        if (blockInfo.hardness > 2) {
            canMine = tool && tool.type === 'tool' && tool.toolType === 'pickaxe';
            if (!canMine) {
                console.log('Need pickaxe for this block');
                this.game.camera.addShake(3, 0.1);
                return;
            }
        }

        // SUCCESS - Mine the block
        this.lastMineTime = now;
        console.log(`Mining SUCCESS! Block: ${blockInfo.name}, Drops: ${blockInfo.drops}`);
        
        // Reduce tool durability
        if (tool && tool.durability !== undefined) {
            tool.durability--;
            if (tool.durability <= 0) {
                this.hotbar[this.selectedSlot] = null;
                this.game.audio.play('break');
            }
            this.updateUI();
        }

        // Create item drop
        if (blockInfo.drops) {
            const dropX = bx + 0.5 + (Math.random() - 0.5) * 0.2;
            const dropY = by + 0.5 + (Math.random() - 0.5) * 0.2;
            const dropZ = bz + 0.5;

            const item = new ItemEntity(this.game, dropX, dropY, dropZ, blockInfo.drops);
            item.vx = (Math.random() - 0.5) * 2;
            item.vy = (Math.random() - 0.5) * 2;
            item.vz = 3;

            this.game.entities.push(item);
        }

        // Remove the block
        this.game.world.setBlock(bx, by, bz, BLOCKS.AIR);
        this.game.audio.play('mine');
        this.game.particles.emit(bx + 0.5, by + 0.5, bz + 0.5, blockInfo.color || '#888', 8);
        
        // Notify side quest system about mined block
        if (this.game.sideQuests) {
            this.game.sideQuests.onBlockMined(block);
        }
    }

    addItem(itemKey, count = 1) {
        const itemDef = ITEMS[itemKey];
        if (!itemDef) {
            console.log(`addItem: No item definition for ${itemKey}`);
            return false;
        }

        // Play pickup sound and show notification
        this.game.audio.play('pickup');
        this.showItemPickup(itemDef.name, itemDef.emoji);
        
        // Notify quest system
        if (this.game.questManager) {
            this.game.questManager.onItemCollected(itemKey, count);
        }
        
        // Notify side quest system
        if (this.game.sideQuests) {
            this.game.sideQuests.onItemCollected(itemKey, count);
        }

        // Check for existing stack
        if (itemDef.stackable) {
            for (let i = 0; i < this.inventory.length; i++) {
                if (this.inventory[i] && this.inventory[i].type === itemDef.type && this.inventory[i].name === itemDef.name) {
                    if (this.inventory[i].count < CONFIG.STACK_SIZE) {
                        this.inventory[i].count += count;
                        this.updateUI();
                        return true;
                    }
                }
            }
            // Check hotbar too
            for (let i = 0; i < this.hotbar.length; i++) {
                if (this.hotbar[i] && this.hotbar[i].type === itemDef.type && this.hotbar[i].name === itemDef.name) {
                    if (this.hotbar[i].count < CONFIG.STACK_SIZE) {
                        this.hotbar[i].count += count;
                        this.updateUI();
                        return true;
                    }
                }
            }
        }

        // Find empty slot in Hotbar first
        for (let i = 0; i < this.hotbar.length; i++) {
            if (!this.hotbar[i]) {
                this.hotbar[i] = { ...itemDef, count: count };
                this.updateUI();
                return true;
            }
        }

        // Then Inventory
        for (let i = 0; i < this.inventory.length; i++) {
            if (!this.inventory[i]) {
                this.inventory[i] = { ...itemDef, count: count };
                this.updateUI();
                return true;
            }
        }

        return false; // Inventory full
    }
    
    showItemPickup(itemName, emoji) {
        // Create floating text notification
        const notification = document.createElement('div');
        notification.className = 'item-pickup-notification';
        notification.innerHTML = `${emoji || '📦'} +1 ${itemName}`;
        document.body.appendChild(notification);
        
        // Remove after animation
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }

    tryPlace() {
        // Placement cooldown
        const now = Date.now();
        if (!this.lastPlaceTime) this.lastPlaceTime = 0;
        if (now - this.lastPlaceTime < 250) return;
        
        const item = this.getSelectedItem();
        if (!item) return;

        // Get target position using raycast-like approach
        const playerScreen = this.game.camera.worldToScreen(this.x, this.y, this.z);
        const mouseX = this.game.input.mouse.x;
        const mouseY = this.game.input.mouse.y;
        
        // Convert screen delta to isometric world direction
        const dx = mouseX - playerScreen.x;
        const dy = mouseY - playerScreen.y;
        
        // Isometric to world coordinate conversion
        const isoX = (dx / (CONFIG.TILE_WIDTH / 2) + dy / (CONFIG.TILE_HEIGHT / 2)) / 2;
        const isoY = (dy / (CONFIG.TILE_HEIGHT / 2) - dx / (CONFIG.TILE_WIDTH / 2)) / 2;
        
        // Normalize and scale direction
        const mag = Math.sqrt(isoX * isoX + isoY * isoY);
        
        // Cast a ray from player to find target block
        let targetBlock = null;
        let placePosition = null;
        
        // Step along the ray direction
        for (let dist = 1; dist <= this.interactionRange; dist += 0.5) {
            const scale = dist / Math.max(0.1, mag);
            const checkX = Math.floor(this.x + isoX * scale);
            const checkY = Math.floor(this.y + isoY * scale);
            
            // Check at player's Z level, above, and below
            for (let zOffset = 1; zOffset >= -1; zOffset--) {
                const checkZ = Math.floor(this.z) + zOffset;
                const block = this.game.world.getBlock(checkX, checkY, checkZ);
                const blockData = BLOCK_DATA[block];
                
                if (block !== BLOCKS.AIR && blockData && blockData.solid) {
                    // Found a solid block, place adjacent to it
                    targetBlock = { x: checkX, y: checkY, z: checkZ };
                    
                    // Determine which face to place on (prefer top)
                    const aboveBlock = this.game.world.getBlock(checkX, checkY, checkZ + 1);
                    if (aboveBlock === BLOCKS.AIR) {
                        placePosition = { x: checkX, y: checkY, z: checkZ + 1 };
                    } else {
                        // Try adjacent horizontal positions
                        const adjacentOffsets = [
                            { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
                            { dx: 0, dy: -1 }, { dx: 0, dy: 1 }
                        ];
                        for (const off of adjacentOffsets) {
                            const adjBlock = this.game.world.getBlock(checkX + off.dx, checkY + off.dy, checkZ);
                            if (adjBlock === BLOCKS.AIR) {
                                placePosition = { x: checkX + off.dx, y: checkY + off.dy, z: checkZ };
                                break;
                            }
                        }
                    }
                    break;
                }
            }
            if (targetBlock) break;
        }
        
        // Fallback: place at surface near mouse position
        if (!placePosition) {
            const targetOffsetX = mag > 0.5 ? (isoX / mag) * Math.min(3, mag) : 0;
            const targetOffsetY = mag > 0.5 ? (isoY / mag) * Math.min(3, mag) : 0;
            
            const bx = Math.floor(this.x + targetOffsetX);
            const by = Math.floor(this.y + targetOffsetY);
            const surfaceZ = this.game.world.getHeight(bx, by);
            
            if (surfaceZ > 0) {
                placePosition = { x: bx, y: by, z: surfaceZ + 1 };
            }
        }
        
        if (!placePosition) return;
        
        const bx = placePosition.x;
        const by = placePosition.y;
        const playerZ = Math.floor(this.z);
        let surfaceZ = placePosition.z - 1;
        
        // Hoe Logic (Till Dirt)
        if (item.type === 'tool' && item.toolType === 'hoe') {
            const dist = Math.hypot(bx + 0.5 - this.x, by + 0.5 - this.y, surfaceZ - this.z);
            if (dist <= this.interactionRange) {
                const block = this.game.world.getBlock(bx, by, surfaceZ);
                if (block === BLOCKS.DIRT || block === BLOCKS.GRASS) {
                    this.lastPlaceTime = now;
                    this.game.world.setBlock(bx, by, surfaceZ, BLOCKS.FARMLAND);
                    this.game.audio.play('place');
                    item.durability--;
                    if (item.durability <= 0) this.hotbar[this.selectedSlot] = null;
                    this.updateUI();
                    return;
                }
            }
        }

        // Eating food
        if (item.type === 'food') {
            if (this.hunger < this.maxHunger || item.health > 0) {
                this.lastPlaceTime = now;
                this.hunger = Math.min(this.maxHunger, this.hunger + (item.hunger || 0));
                this.health = Math.min(this.maxHealth, this.health + (item.health || 0));
                this.game.audio.play('pickup'); // Eating sound
                this.game.particles.emitText(this.x, this.y, this.z + 2, `+${item.hunger} 🍖`, '#4ade80');
                
                // Notify quest system about food consumption
                const itemKey = Object.keys(ITEMS).find(k => ITEMS[k].name === item.name);
                if (this.game.questManager && itemKey) {
                    this.game.questManager.onItemConsumed(itemKey);
                }
                
                // Apply special effects
                if (item.effect === 'regen') {
                    this.activeEffects = this.activeEffects || {};
                    this.activeEffects.regen = {
                        duration: item.effectDuration || 10,
                        timer: 0
                    };
                    this.game.particles.emitText(this.x, this.y, this.z + 2.5, '✨ Regeneration!', '#ffd700');
                }
                
                if (item.stackable && item.count > 1) {
                    item.count--;
                } else {
                    this.hotbar[this.selectedSlot] = null;
                }
                this.updateUI();
                return;
            }
        }

        // Block placement
        if (item.type === 'block' || item.type === 'placeable') {
            // Use the calculated placement position
            let placeZ = placePosition.z;
            
            const dist = Math.hypot(bx + 0.5 - this.x, by + 0.5 - this.y, placeZ - this.z);
            if (dist > this.interactionRange) return;
            
            // Check if space is empty
            if (this.game.world.getBlock(bx, by, placeZ) !== BLOCKS.AIR) return;
            
            // Check collision with player (can't place inside self)
            if (this.checkCollisionWithBlock(bx, by, placeZ)) return;
            
            // Get block ID to place
            let blockId = item.blockId;
            if (!blockId && item.type === 'placeable') {
                // Torch, seeds, etc - need special handling
                if (item.name === 'Torch') {
                    blockId = BLOCKS.TORCH;
                } else if (item.name === 'Seeds') {
                    // Can only plant on farmland
                    if (this.game.world.getBlock(bx, by, placeZ - 1) !== BLOCKS.FARMLAND) return;
                    blockId = BLOCKS.WHEAT_CROP;
                }
            }
            
            if (blockId !== undefined) {
                this.lastPlaceTime = now;
                this.game.world.setBlock(bx, by, placeZ, blockId);
                this.game.audio.play('place');
                this.game.particles.emit(bx + 0.5, by + 0.5, placeZ + 0.5, '#ffffff', 5);
                
                // Notify quest system about block placement
                if (this.game.questManager) {
                    this.game.questManager.onBlockPlaced(blockId);
                }
                
                // Notify side quest system about block placement
                if (this.game.sideQuests) {
                    this.game.sideQuests.onBlockPlaced(blockId);
                }
                
                // Consume item
                if (item.stackable && item.count > 1) {
                    item.count--;
                } else {
                    this.hotbar[this.selectedSlot] = null;
                }
                this.updateUI();
            }
        }
    }

    checkCollisionWithBlock(bx, by, bz) {
        // Check if the block position overlaps with player
        const margin = 0.1;
        const playerMinX = this.x + margin;
        const playerMaxX = this.x + this.width - margin;
        const playerMinY = this.y + margin;
        const playerMaxY = this.y + this.height - margin;
        const playerMinZ = this.z;
        const playerMaxZ = this.z + this.depth;
        
        // Block bounds
        const blockMinX = bx;
        const blockMaxX = bx + 1;
        const blockMinY = by;
        const blockMaxY = by + 1;
        const blockMinZ = bz;
        const blockMaxZ = bz + 1;
        
        // AABB collision
        return !(playerMaxX < blockMinX || playerMinX > blockMaxX ||
                 playerMaxY < blockMinY || playerMinY > blockMaxY ||
                 playerMaxZ < blockMinZ || playerMinZ > blockMaxZ);
    }

    tryAttack() {
        const now = Date.now();
        if (now - this.lastAttackTime < CONFIG.ATTACK_COOLDOWN) return;
        this.lastAttackTime = now;
        
        // Visual swing effect
        this.swingTime = 200;
        this.swingAngle = 0;

        // Get tool damage and critical chance
        const tool = this.getSelectedItem();
        let baseDamage = 1; // Fist damage
        if (tool && tool.type === 'weapon') baseDamage = tool.damage;
        else if (tool && tool.type === 'tool') baseDamage = tool.damage || 2;

        // Critical hit chance (10% base, higher with swords)
        const critChance = tool?.type === 'weapon' ? 0.15 : 0.10;
        const isCrit = Math.random() < critChance;
        const damage = isCrit ? Math.floor(baseDamage * 1.5) : baseDamage;

        // Emit swing particles
        const angle = Math.atan2(
            this.game.input.mouse.y - this.game.camera.worldToScreen(this.x, this.y, this.z).y,
            this.game.input.mouse.x - this.game.camera.worldToScreen(this.x, this.y, this.z).x
        );
        this.game.particles.emit(
            this.x + Math.cos(angle) * 0.8,
            this.y + Math.sin(angle) * 0.8,
            this.z + 1,
            '#ffffff', 3
        );
        
        // Play swing sound
        this.game.audio.play('hit');

        // Check for enemies in attack cone
        const enemies = this.game.entities.filter(e => e instanceof Enemy && !e.isDead);
        let hitCount = 0;
        
        for (const enemy of enemies) {
            const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y, enemy.z - this.z);
            if (dist <= CONFIG.ATTACK_RANGE) {
                // Calculate angle to enemy
                const enemyAngle = Math.atan2(enemy.y - this.y, enemy.x - this.x);
                const angleDiff = Math.abs(this.normalizeAngle(angle - enemyAngle));
                
                // Check if within 90 degree cone
                if (angleDiff < Math.PI / 2) {
                    enemy.takeDamage(damage, this);
                    hitCount++;
                    
                    // Screen flash for hit feedback
                    if (this.game.renderer) {
                        this.game.renderer.flashHit(0.4);
                    }
                    
                    // Damage number popup on enemy
                    const dmgColor = isCrit ? '#ffd700' : '#ffffff';
                    this.game.particles.emitText(enemy.x, enemy.y, enemy.z + 2, `${damage}`, dmgColor);
                    
                    // Hit particles on enemy
                    this.game.particles.emit(enemy.x, enemy.y, enemy.z + 1, '#ff4444', 8);
                    
                    // Critical hit visual
                    if (isCrit) {
                        this.game.particles.emitText(enemy.x, enemy.y, enemy.z + 2.5, "CRIT!", '#ffd700');
                        this.game.camera.addShake(3, 0.15);
                        this.game.audio.play('hit'); // Double sound for crit
                    }
                    
                    // XP for hitting enemies
                    this.gainXP(1);
                    
                    // Reduce durability on hit
                    if (tool && (tool.type === 'weapon' || tool.type === 'tool')) {
                        tool.durability--;
                        if (tool.durability <= 0) {
                            this.hotbar[this.selectedSlot] = null;
                            this.game.particles.emitText(this.x, this.y, this.z + 2, "🔨 Broke!", '#ff6b6b');
                        }
                        this.updateUI();
                    }
                }
            }
        }
        
        // XP bonus for multi-kill
        if (hitCount >= 2) {
            this.gainXP(hitCount);
        }
    }
    
    normalizeAngle(angle) {
        while (angle > Math.PI) angle -= Math.PI * 2;
        while (angle < -Math.PI) angle += Math.PI * 2;
        return angle;
    }

    takeDamage(amount, source, damageType = 'attack') {
        if (this.invincibleTime > 0) return;

        this.health -= amount;
        this.game.audio.play('hurt');
        
        // Screen flash for damage feedback
        if (this.game.renderer) {
            this.game.renderer.flashDamage(Math.min(1, amount / 10));
        }
        
        // Different colors for damage types
        let damageColor = '#ff6b6b';
        if (damageType === 'fall') damageColor = '#ff9500';
        if (damageType === 'drowning') damageColor = '#4169E1';
        if (damageType === 'starvation') damageColor = '#8B4513';
        
        this.game.particles.emitText(this.x, this.y, this.z + 2, `-${Math.floor(amount)}`, damageColor);
        this.invincibleTime = CONFIG.INVINCIBILITY_TIME;

        // Camera shake on damage - stronger shake for higher damage
        this.game.camera.addShake(Math.min(5, amount * 0.5), 0.2);

        // Knockback (only from entity sources)
        if (source) {
            const dx = this.x - source.x;
            const dy = this.y - source.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len > 0) {
                this.vx += (dx / len) * CONFIG.KNOCKBACK_FORCE;
                this.vy += (dy / len) * CONFIG.KNOCKBACK_FORCE;
                this.vz += 2;
                this.grounded = false;
            }
        }

        this.updateUI();

        if (this.health <= 0) {
            this.isDead = true;
            this.game.ui.showDeathScreen(this.game.world.timeOfDay);
        }
    }

    gainXP(amount) {
        this.xp += amount;
        if (this.xp >= this.nextLevelXp) {
            this.xp -= this.nextLevelXp;
            this.level++;
            this.nextLevelXp = Math.floor(this.nextLevelXp * 1.5);
            this.game.audio.play('pickup'); // Level up sound placeholder
            this.game.particles.emitText(this.x, this.y, this.z + 2.5, "LEVEL UP!", '#ffd700');
            this.game.particles.emit(this.x, this.y, this.z + 1, '#ffd700', 20); // Confetti
        }
        this.updateUI();
    }

    checkCollisionWithBlock(bx, by, bz) {
        const margin = 0.1;
        return (
            this.x + this.width - margin > bx && this.x + margin < bx + 1 &&
            this.y + this.height - margin > by && this.y + margin < by + 1 &&
            this.z + this.depth > bz && this.z < bz + 1
        );
    }

    selectHotbarSlot(index) {
        if (index >= 0 && index < CONFIG.HOTBAR_SIZE) {
            this.selectedSlot = index;
        }
    }

    scrollHotbar(delta) {
        this.selectedSlot = (this.selectedSlot + delta + CONFIG.HOTBAR_SIZE) % CONFIG.HOTBAR_SIZE;
    }

    getSelectedItem() {
        return this.hotbar[this.selectedSlot];
    }

    updateUI() {
        if (this.ui.hearts) this.ui.hearts.innerText = `${Math.ceil(this.health)}/${this.maxHealth}`;
        if (this.ui.hunger) this.ui.hunger.innerText = `${Math.ceil(this.hunger)}/${this.maxHunger}`;
        if (this.ui.level) this.ui.level.innerText = `Lvl ${this.level}`;
        if (this.ui.xpBar) {
            const pct = (this.xp / this.nextLevelXp) * 100;
            this.ui.xpBar.style.width = `${pct}%`;
        }
        
        // Update Temperature UI
        const tempFill = document.getElementById('temperature-fill');
        const tempText = document.getElementById('temperature-text');
        if (tempFill && tempText && this.game.temperature) {
            const temp = this.game.temperature.getTemperature();
            tempFill.style.width = `${temp}%`;
            tempText.textContent = `${this.game.temperature.getStatusIcon()} ${temp}°`;
            tempFill.style.background = this.game.temperature.getTemperatureColor();
        }
        
        // Update Armor UI
        const armorText = document.getElementById('armor-text');
        if (armorText && this.game.armor) {
            const defense = this.game.armor.getTotalDefense();
            armorText.textContent = `🛡️ ${defense}`;
        }
        
        // Update Weather UI
        const weatherText = document.getElementById('weather-text');
        if (weatherText && this.game.weather) {
            const weather = this.game.weather.currentWeather;
            weatherText.textContent = `${weather.emoji} ${weather.name}`;
        }
        
        // Update Buffs UI
        const buffsDisplay = document.getElementById('buffs-display');
        if (buffsDisplay && this.game.foodBuffs) {
            const buffs = this.game.foodBuffs.getActiveBuffs();
            buffsDisplay.innerHTML = '';
            for (const buff of buffs) {
                const buffEl = document.createElement('div');
                buffEl.className = 'buff-icon';
                buffEl.innerHTML = `
                    <span>${buff.icon}</span>
                    <span class="buff-timer">${buff.remaining}s</span>
                `;
                buffEl.title = buff.name;
                buffsDisplay.appendChild(buffEl);
            }
        }

        // Render Hotbar
        if (this.ui.hotbar) {
            this.ui.hotbar.innerHTML = '';
            this.hotbar.forEach((item, index) => {
                const slot = document.createElement('div');
                slot.className = `hotbar-slot ${index === this.selectedSlot ? 'selected' : ''}`;
                if (item) {
                    slot.innerText = item.emoji;
                    const count = document.createElement('span');
                    count.className = 'item-count';
                    count.innerText = item.count > 1 ? item.count : '';
                    slot.appendChild(count);

                    // Durability Bar
                    if (item.type === 'tool' || item.type === 'weapon') {
                        const maxDur = ITEMS[Object.keys(ITEMS).find(k => ITEMS[k].name === item.name)].durability;
                        if (maxDur) {
                            const pct = (item.durability / maxDur) * 100;
                            const bar = document.createElement('div');
                            bar.className = 'durability-bar';
                            const color = pct > 50 ? '#51cf66' : pct > 20 ? '#fab005' : '#ff6b6b';

                            bar.style.cssText = `
                                 position: absolute;
                                 bottom: 4px;
                                 left: 4px;
                                 right: 4px;
                                 height: 3px;
                                 background: #333;
                                 border-radius: 1px;
                             `;

                            const fill = document.createElement('div');
                            fill.style.cssText = `
                                width: ${pct}%;
                                height: 100%;
                                background: ${color};
                                border-radius: 1px;
                             `;
                            bar.appendChild(fill);
                            slot.appendChild(bar);
                        }
                    }
                }
                this.ui.hotbar.appendChild(slot);
            });
        }
    }
}


