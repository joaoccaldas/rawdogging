import { Entity } from './entity.js';
import { ItemEntity } from './item.js';
import { ITEMS, CONFIG, BLOCKS, BLOCK_DATA } from '../config.js';
import { Enemy } from '../entities/enemy.js';
import { InteractionUtils } from '../utils/interaction.js';

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
        this.distanceWalked = 0; // For First Steps tutorial
        this.jumpForce = CONFIG.PLAYER_JUMP_FORCE;
        this.grounded = false;

        // Physics Polish
        this.coyoteTime = 0; // Time since left ground
        this.jumpBuffer = 0; // Time since jump press

        // Movement Dynamics
        this.baseSpeed = CONFIG.PLAYER_SPEED;
        this.sprintSpeed = CONFIG.PLAYER_SPEED * 1.6;
        this.isSprinting = false;
        this.dashCooldown = 0;

        // View Bobbing
        this.bobTime = 0;
        this.bobAmount = 0.1;


        // Inventory
        this.inventory = new Array(CONFIG.INVENTORY_SIZE).fill(null);
        this.hotbar = new Array(CONFIG.HOTBAR_SIZE).fill(null);
        this.selectedSlot = 0;

        // Equipment Slots (for armor integration)
        this.equipment = {
            head: null,
            chest: null,
            legs: null,
            feet: null
        };

        // Initial items - Stone Age starter kit
        this.hotbar[0] = { ...ITEMS.club, count: 1 };
        this.hotbar[1] = { ...ITEMS.cobblestone, count: 5 };
        this.hotbar[2] = { ...ITEMS.stick, count: 8 };
        this.hotbar[3] = { ...ITEMS.cooked_meat, count: 5 };

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
            console.error('Player coordinates are NaN! Resetting to safe spawn.');
            const safeSpawn = this.game.world.getSafeSpawnPoint(0, 0);
            this.x = safeSpawn.x;
            this.y = safeSpawn.y;
            this.z = safeSpawn.z;
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
        if (this.game.introCinematic) return;
        const input = this.game.input;
        if (!input) return;

        const cam = this.game.camera;

        // Movement
        const move = input.getMovement() || { x: 0, y: 0 };

        // Sprint Logic
        this.isSprinting = input.isSprinting() && (move.x !== 0 || move.y !== 0);

        // Consume Stamina
        if (this.isSprinting && this.game.stamina) {
            if (this.game.stamina.current > 0) {
                this.game.stamina.consume(15 * deltaTime); // 15 unit/sec
            } else {
                this.isSprinting = false; // Exhausted
            }
        }

        // Check Dash
        if (this.dashCooldown > 0) this.dashCooldown -= deltaTime;
        if (input.checkDash && input.checkDash() && this.dashCooldown <= 0) {
            this.performDash(input);
        }

        // Isometric Control Mapping
        // W (Up) -> -X, -Y
        // S (Down) -> +X, +Y
        // A (Left) -> -X, +Y
        // D (Right) -> +X, -Y

        let dx = 0;
        let dy = 0;

        // Up/Down (Y axis of input)
        // Up (-1) => -X, -Y
        dx += move.y;
        dy += move.y;

        // Left/Right (X axis of input)
        // Right (+1) => +X, -Y
        dx += move.x;
        dy -= move.x;

        if (dx !== 0 || dy !== 0) {
            const len = Math.sqrt(dx * dx + dy * dy);
            dx /= len;
            dy /= len;

            // Speed calculation
            let targetSpeed = this.baseSpeed;
            if (this.isInWater) targetSpeed = CONFIG.SWIM_SPEED;
            else if (this.isSprinting) targetSpeed = this.sprintSpeed;

            this.vx = dx * targetSpeed;
            this.vy = dy * targetSpeed;

            // View Bobbing & Footsteps
            if (this.grounded) {
                const bobFreq = this.isSprinting ? 20 : 12;
                const prevBob = Math.sin(this.bobTime);
                this.bobTime += deltaTime * bobFreq;
                const currentBob = Math.sin(this.bobTime);

                // Bobbing Visuals
                const bobAmp = this.isSprinting ? 5 : 2; // Screen pixels
                if (this.game.camera) {
                    this.game.camera.bobOffset = Math.abs(currentBob) * bobAmp;
                }

                // Footstep Audio (Trigger when bob hits ground/trough)
                // Sine wave goes 1 -> 0 -> -1 -> 0. Let's trigger at -0.9 (bottom)
                if (prevBob > -0.9 && currentBob <= -0.9) {
                    // Raycast down for material
                    const blockBelow = this.game.world.getBlock(Math.floor(this.x), Math.floor(this.y), Math.floor(this.z - 0.1));
                    import('../config.js').then(({ BLOCK_DATA }) => {
                        // This is async inside render loop, suboptimal but safe for prototype
                        // Actually BLOCK_DATA is likely available globally or on instance if passed?
                        // It was imported in Player.js? No, only BLOCKS.
                        // Let's pass block ID string directly to audio
                        this.game.audio.playFootstep(blockBelow); // Audio manager can handle ID
                    });
                }
            } else {
                if (this.game.camera) this.game.camera.bobOffset = 0;
            }
        } else {
            this.vx = 0;
            this.vy = 0;
            this.bobTime = 0;
        }

        // Jump Buffering & Execution
        if (input.isJumping()) {
            this.jumpBuffer = 0.15; // Buffer jump for 150ms
        }

        // Decrease buffer
        if (this.jumpBuffer > 0) this.jumpBuffer -= deltaTime;

        // Consumed buffer
        if (this.jumpBuffer > 0) {
            const canJump = this.grounded || (this.coyoteTime > 0 && !this.isInWater);

            if (this.isInWater) {
                // Swimming up
                this.vz = CONFIG.SWIM_SPEED * 2;
                this.jumpBuffer = 0; // Consumed
            } else if (canJump) {
                this.vz = this.jumpForce;
                this.grounded = false;
                this.coyoteTime = 0; // Consumed
                this.jumpBuffer = 0; // Consumed
                this.game.audio.play('jump');
            }
        }

        // Track distance walked for First Steps tutorial
        if (this.game.firstSteps && (this.vx !== 0 || this.vy !== 0)) {
            const currentMove = Math.sqrt(this.vx * this.vx + this.vy * this.vy) * deltaTime;
            this.distanceWalked += currentMove;

            if (this.distanceWalked >= 15) {
                this.game.firstSteps = false;
                if (this.game.ui) {
                    this.game.ui.showNotification("Success! Now you are officially a walking human.", 'success', 5000);
                }
            }
        }

        // Restriction during "First Steps" tutorial
        if (this.game.firstSteps) {
            if (input.isMining() || input.isAttacking() || input.isUsing()) {
                if (Date.now() - (this.lastRestrictionNotify || 0) > 2000) {
                    this.game.ui?.showNotification("Learn to walk properly first! Use WASD to move around.", 'warning');
                    this.lastRestrictionNotify = Date.now();
                }
            }
            return;
        }

        // Mining / Attacking (Creative Flow: Repeat if held)
        if (input.isMining()) {
            this.mineTimer = (this.mineTimer || 0) + deltaTime;
            if (!this.lastMining || this.mineTimer > 0.25) { // Rapid repeat every 0.25s if held
                this.tryMine();
                this.mineTimer = 0;
            }
            this.lastMining = true;
        } else {
            this.lastMining = false;
            this.mineTimer = 0;
        }

        if (input.isAttacking()) {
            this.tryAttack();
        }

        // Placing / Using (Creative Flow: Repeat if held)
        if (input.isUsing()) {
            this.useTimer = (this.useTimer || 0) + deltaTime;
            if (!this.lastUsing || this.useTimer > 0.2) { // Rapid repeat every 0.2s if held
                this.tryPlace();
                this.useTimer = 0;
            }
            this.lastUsing = true;
        } else {
            this.lastUsing = false;
            this.useTimer = 0;
        }
        if ((this.vx !== 0 || this.vy !== 0)) {
            this.lastUnzeroVx = this.vx;
            this.lastUnzeroVy = this.vy;
        }
    }

    getFacing() {
        const vx = this.lastUnzeroVx || 0;
        const vy = this.lastUnzeroVy || 1; // Default S

        if (Math.abs(vx) > Math.abs(vy)) {
            return vx > 0 ? 'E' : 'W';
        } else {
            return vy > 0 ? 'S' : 'N';
        }
    }

    performDash(input) {
        if (this.game.stamina && this.game.stamina.current < 25) return;

        const move = input.getMovement();
        if (move.x === 0 && move.y === 0) return; // Can't dash in place

        // Consume Cost
        if (this.game.stamina) this.game.stamina.consume(25);

        // Calculate Dash Direction (same rotation)
        const worldDx = (move.x - move.y) * 0.707;
        const worldDy = (move.x + move.y) * 0.707;

        const dashForce = 15; // Instant burst
        this.vx = worldDx * dashForce;
        this.vy = worldDy * dashForce;

        // Small vertical hop
        this.vz = 2;
        this.grounded = false;

        this.dashCooldown = 1.0; // 1 second cooldown

        // Visuals
        this.game.particles.emit(this.x, this.y, this.z, '#ffffff', 10);
        this.game.camera.addShake(2, 0.2); // Impact feel
        this.game.audio.play('jump'); // Placeholder for dash sound
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

        // Coyote Time Logic
        if (this.grounded) {
            this.coyoteTime = 0.1; // Reset coyote time while grounded
        } else {
            this.coyoteTime -= deltaTime;
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
            this.x = nextX;
        } else {
            // Auto-Jump / Step Assist
            // Allow stepping if grounded OR small fall (walking down slope / micro gravity)
            // Use Math.floor(z) + 1 to find the step surface
            const stepTargetZ = Math.floor(this.z) + 1.01;
            const canStep = (this.grounded || this.vz > -5.0) && !this.checkCollision(nextX, this.y, stepTargetZ);

            if (canStep) {
                this.z = stepTargetZ;
                this.x = nextX;
                this.grounded = true;
                this.vz = 0;
                console.log('Auto-Step X triggered');
            } else {
                // Wall collision feedback
                if (Math.abs(this.vx) > this.speed * 0.5) {
                    this.game.particles.emit(nextX + (this.vx > 0 ? this.width : 0), this.y + this.height / 2, this.z + 0.5, '#888888', 3);
                }
                this.vx = 0;
            }
        }
        // Check Y
        if (!this.checkCollision(this.x, nextY, this.z)) {
            this.y = nextY;
        } else {
            // Auto-Jump / Step Assist Y
            const stepTargetZ = Math.floor(this.z) + 1.01;
            const canStep = (this.grounded || this.vz > -5.0) && !this.checkCollision(this.x, nextY, stepTargetZ);

            if (canStep) {
                this.z = stepTargetZ;
                this.y = nextY;
                this.grounded = true;
                this.vz = 0;
            } else {
                // Wall collision feedback
                if (Math.abs(this.vy) > this.speed * 0.5) {
                    this.game.particles.emit(this.x + this.width / 2, nextY + (this.vy > 0 ? this.height : 0), this.z + 0.5, '#888888', 3);
                }
                this.vy = 0;
            }
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

        // Use unified selection to find target
        const hit = InteractionUtils.getSelection(this.game, this.interactionRange);

        if (!hit || hit.type !== 'block') {
            return;
        }

        const { x: bx, y: by, z: bz, blockId: block } = hit;

        // Valid block check
        if (block === BLOCKS.AIR || block === BLOCKS.BEDROCK) {
            return;
        }

        const blockInfo = BLOCK_DATA[block];
        if (!blockInfo) return;

        // Tool check - hardness > 2 needs pickaxe
        const tool = this.getSelectedItem();
        let canMine = true;
        if (blockInfo.hardness > 2) {
            canMine = tool && tool.type === 'tool' && tool.toolType === 'pickaxe';
            if (!canMine) {
                // Throttle error message
                if (now - (this.lastErrorTime || 0) > 1000) {
                    this.game.camera.addShake(3, 0.1);
                    this.game.particles.emitText(bx, by, bz + 1, 'Need Pickaxe!', '#ff4444');
                    this.lastErrorTime = now;
                }
                return;
            }
        }

        // SUCCESS - Mine the block
        this.lastMineTime = now;

        // Reduce tool durability
        if (tool && tool.durability !== undefined) {
            tool.durability--;
            if (tool.durability <= 0) {
                this.hotbar[this.selectedSlot] = null;
                this.game.audio.play('break');
            }
            this.updateUI();
        }

        // Create item drop (Auto-Pickup)
        if (blockInfo.drops) {
            // Try to add directly to inventory
            const added = this.addItem(blockInfo.drops, 1);

            if (!added) {
                // Inventory full, spawn physical drop
                const dropX = bx + 0.5 + (Math.random() - 0.5) * 0.2;
                const dropY = by + 0.5 + (Math.random() - 0.5) * 0.2;
                const dropZ = bz + 0.5;

                const item = new ItemEntity(this.game, dropX, dropY, dropZ, blockInfo.drops);
                item.vx = (Math.random() - 0.5) * 2;
                item.vy = (Math.random() - 0.5) * 2;
                item.vz = 3;

                this.game.entities.push(item);
            } else {
                // Visual feedback for auto-pickup (optional, maybe small particle or sound)
                // addItem handles 'pickup' sound usually.
                // Let's add a small 'poof' particle to show something happened at the block
                this.game.particles.emit(bx + 0.5, by + 0.5, bz + 0.5, '#ffffff', 5);
            }
        }

        // Remove the block
        this.game.world.setBlock(bx, by, bz, BLOCKS.AIR);
        this.game.audio.play('mine');
        this.game.particles.emitBlockParticles(bx, by, bz, block, 12); // Use enhanced block particles

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

        // Add particle feedback above player
        this.game.particles.emitItemPickup(this.x, this.y, this.z + 4, itemDef.emoji, itemDef.name, count);

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

    // Remove an item from inventory/hotbar
    removeItem(itemKey, count = 1) {
        const itemDef = ITEMS[itemKey];
        if (!itemDef) return false;

        let remaining = count;

        // Helper to reduce from list
        const reduceFromList = (list) => {
            for (let i = 0; i < list.length; i++) {
                if (remaining <= 0) break;
                const item = list[i];
                if (item && item.name === itemDef.name) {
                    if (item.count > remaining) {
                        item.count -= remaining;
                        remaining = 0;
                    } else {
                        remaining -= item.count;
                        list[i] = null;
                    }
                }
            }
        };

        // Check hotbar first
        reduceFromList(this.hotbar);
        // Then inventory
        reduceFromList(this.inventory);

        this.updateUI();
        return remaining === 0;
    }

    // Check if player has an item
    hasItem(itemKey, count = 1) {
        const itemDef = ITEMS[itemKey];
        if (!itemDef) return false;

        let total = 0;

        // Check hotbar
        for (const item of this.hotbar) {
            if (item && item.name === itemDef.name) {
                total += item.count;
            }
        }

        // Check inventory
        for (const item of this.inventory) {
            if (item && item.name === itemDef.name) {
                total += item.count;
            }
        }

        return total >= count;
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

        // Use unified selection to find placement
        const hit = InteractionUtils.getSelection(this.game, this.interactionRange);

        if (!hit) {
            // No block targeted
            return;
        }

        // Calculate placement position based on adjacency
        const placePosition = InteractionUtils.getPlacementPosition(this.game, hit);
        if (!placePosition) return;

        const bx = placePosition.x;
        const by = placePosition.y;
        const placeZ = placePosition.z;

        // Hoe Logic (Till Dirt) - Special Case target EXISTING block
        if (item.type === 'tool' && item.toolType === 'hoe') {
            const { x: hx, y: hy, z: hz, blockId } = hit;
            if (blockId === BLOCKS.DIRT || blockId === BLOCKS.GRASS) {
                this.lastPlaceTime = now;
                this.game.world.setBlock(hx, hy, hz, BLOCKS.FARMLAND);
                this.game.audio.play('place');
                item.durability--;
                if (item.durability <= 0) this.hotbar[this.selectedSlot] = null;
                this.updateUI();
                return;
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
            // Check if space is empty
            if (this.game.world.getBlock(bx, by, placeZ) !== BLOCKS.AIR) return;

            // Check collision with player (can't place inside self)
            if (this.checkCollisionWithBlock(bx, by, placeZ)) return;

            // Get block ID to place
            let blockId = item.blockId;

            // Special placement logic (Stairs, etc)
            if (item.placeFunc === 'stairs' && item.baseId) {
                // Determine rotation based on player facing
                const facing = this.getFacing(); // N, S, E, W
                // Config keys are e.g. THATCH_STAIRS_N
                // We need to resolve the generic baseId to specific ID.
                // Assuming baseId is string "THATCH_STAIRS_" 
                // We need to import BLOCKS to resolve string key? 
                // Or we store baseId as a prefix and use BLOCKS[baseId + facing].

                // Since I can't import BLOCKS here easily without adding to top, 
                // I rely on item.blockId being a "default" and offset? 
                // No, Config IDs are explicitly named.

                // Let's assume we can access BLOCKS globally if Config is imported.
                // It is imported as `import { CONFIG, BLOCKS, ... }`.

                const key = item.baseId + facing;
                const dynamicId = BLOCKS[key];
                if (dynamicId !== undefined) {
                    blockId = dynamicId;
                }
            }

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
                            this.game.particles.emitText(this.x, this.y, this.z + 3, "🔨 Broke!", '#ff6b6b');
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

        // Apply armor damage reduction
        let finalDamage = amount;
        if (this.game.armor && damageType === 'attack') {
            const reduction = this.game.armor.getDamageReduction();
            finalDamage = amount * (1 - reduction);
            // Damage the armor
            this.game.armor.onDamageTaken(amount);
        }

        this.health -= finalDamage;
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

        this.game.particles.emitText(this.x, this.y, this.z + 4, `-${Math.floor(amount)}`, damageColor);
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

        // Visual feedback for XP gain
        this.game.particles.emitText(this.x, this.y, this.z + 1.5, `+${amount} XP`, '#00ff88', 16);

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


