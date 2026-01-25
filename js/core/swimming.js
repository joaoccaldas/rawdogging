// Swimming System - Underwater exploration with breath meter
import { CONFIG, BLOCKS, BLOCK_DATA } from '../config.js';

export const SWIM_CONFIG = {
    // Breath settings
    MAX_BREATH: 100,
    BREATH_DRAIN_RATE: 10, // per second underwater
    BREATH_REGEN_RATE: 30, // per second above water
    DROWNING_DAMAGE: 5, // damage per second when out of breath
    
    // Swimming movement
    SWIM_SPEED_MULTIPLIER: 0.7,
    DIVE_SPEED: 3,
    SURFACE_SPEED: 4,
    
    // Water detection
    WATER_BLOCK_IDS: [BLOCKS.WATER], // Use block IDs instead of strings
    SWIM_DEPTH_THRESHOLD: 0.5, // How deep before swimming
    
    // Visibility
    UNDERWATER_VISIBILITY: 0.6,
    UNDERWATER_TINT: { r: 0, g: 0.2, b: 0.5, a: 0.3 }
};

export class SwimmingSystem {
    constructor(game) {
        this.game = game;
        
        // Current state
        this.isInWater = false;
        this.isUnderwater = false;
        this.isSwimming = false;
        this.waterDepth = 0;
        
        // Breath meter
        this.breath = SWIM_CONFIG.MAX_BREATH;
        this.isDrowning = false;
        
        // Movement state
        this.isDiving = false;
        this.isSurfacing = false;
        
        // Drowning damage timer
        this.drownDamageTimer = 0;
        
        // Water entry/exit effects
        this.splashCooldown = 0;
    }
    
    update(deltaTime) {
        const player = this.game.player;
        if (!player) return;
        
        // Update splash cooldown
        if (this.splashCooldown > 0) {
            this.splashCooldown -= deltaTime;
        }
        
        // Check water state
        const wasInWater = this.isInWater;
        const wasUnderwater = this.isUnderwater;
        
        this.checkWaterState(player);
        
        // Handle water entry/exit
        if (this.isInWater && !wasInWater) {
            this.onEnterWater(player);
        } else if (!this.isInWater && wasInWater) {
            this.onExitWater(player);
        }
        
        // Handle underwater entry/exit
        if (this.isUnderwater && !wasUnderwater) {
            this.onSubmerge(player);
        } else if (!this.isUnderwater && wasUnderwater) {
            this.onSurface(player);
        }
        
        // Update breath
        this.updateBreath(deltaTime, player);
        
        // Apply movement modifiers
        this.applyMovementModifiers(player);
    }
    
    checkWaterState(player) {
        const world = this.game.world;
        if (!world) {
            this.isInWater = false;
            this.isUnderwater = false;
            this.waterDepth = 0;
            return;
        }
        
        const px = Math.floor(player.x);
        const py = Math.floor(player.y);
        const pz = Math.floor(player.z);
        
        // Check block at feet and below feet
        const blockAtFeet = world.getBlock(px, py, pz);
        const blockBelowFeet = world.getBlock(px, py, pz - 1);
        const blockAtHead = world.getBlock(px, py, pz + 1);
        
        // Player is in water only if:
        // 1. Block at feet level is water AND
        // 2. Player is NOT standing on solid ground (block below feet is not solid)
        const blockBelowData = BLOCK_DATA[blockBelowFeet];
        const isStandingOnSolid = blockBelowData && blockBelowData.solid;
        
        // Check if actually in water (not just at water surface while standing on ground)
        const feetInWater = this.isWaterBlock(blockAtFeet);
        const headInWater = this.isWaterBlock(blockAtHead);
        
        // If standing on solid ground at water's edge, not considered "in water"
        // unless the water is deeper (head level)
        if (feetInWater && isStandingOnSolid && !headInWater) {
            // Standing at water's edge on solid ground - not swimming
            this.isInWater = false;
            this.isUnderwater = false;
        } else {
            this.isInWater = feetInWater || headInWater;
            this.isUnderwater = headInWater;
        }
        
        // Calculate water depth
        this.waterDepth = 0;
        if (this.isInWater) {
            for (let z = pz; z >= pz - 10; z--) {
                if (this.isWaterBlock(world.getBlock(px, py, z))) {
                    this.waterDepth++;
                } else {
                    break;
                }
            }
        }
        
        // Determine swimming state
        this.isSwimming = this.isInWater && this.waterDepth >= SWIM_CONFIG.SWIM_DEPTH_THRESHOLD;
    }
    
    isWaterBlock(blockId) {
        if (!blockId) return false;
        // Check if block ID is a water block
        return blockId === BLOCKS.WATER;
    }
    
    updateBreath(deltaTime, player) {
        if (this.isUnderwater) {
            // Drain breath
            this.breath -= SWIM_CONFIG.BREATH_DRAIN_RATE * deltaTime;
            
            // Check for drowning
            if (this.breath <= 0) {
                this.breath = 0;
                this.isDrowning = true;
                
                // Apply drowning damage
                this.drownDamageTimer += deltaTime;
                if (this.drownDamageTimer >= 1) {
                    this.drownDamageTimer = 0;
                    player.takeDamage?.(SWIM_CONFIG.DROWNING_DAMAGE);
                    this.game.ui?.showMessage('💨 Drowning!', 1000);
                    
                    // Spawn bubbles
                    this.spawnBubbles(player.x, player.y, player.z);
                }
            }
        } else {
            // Regen breath
            if (this.breath < SWIM_CONFIG.MAX_BREATH) {
                this.breath += SWIM_CONFIG.BREATH_REGEN_RATE * deltaTime;
                this.breath = Math.min(this.breath, SWIM_CONFIG.MAX_BREATH);
            }
            
            this.isDrowning = false;
            this.drownDamageTimer = 0;
        }
    }
    
    applyMovementModifiers(player) {
        if (!this.isSwimming) return;
        
        // Slower movement in water
        if (player.speedMultiplier !== undefined) {
            player.speedMultiplier *= SWIM_CONFIG.SWIM_SPEED_MULTIPLIER;
        }
        
        // Handle diving/surfacing input
        const input = this.game.input;
        if (!input) return;
        
        // Dive with crouch/down key
        if (input.isKeyPressed?.('ShiftLeft') || input.isKeyPressed?.('KeyC')) {
            this.isDiving = true;
            this.isSurfacing = false;
            player.vz = -SWIM_CONFIG.DIVE_SPEED;
        }
        // Surface with jump/up key
        else if (input.isKeyPressed?.('Space')) {
            this.isSurfacing = true;
            this.isDiving = false;
            player.vz = SWIM_CONFIG.SURFACE_SPEED;
        }
        else {
            this.isDiving = false;
            this.isSurfacing = false;
            // Natural buoyancy - slowly float up
            if (this.isUnderwater && player.vz < 0.5) {
                player.vz = 0.5;
            }
        }
    }
    
    onEnterWater(player) {
        if (this.splashCooldown > 0) return;
        this.splashCooldown = 0.5;
        
        // Splash effect
        this.spawnSplash(player.x, player.y, player.z);
        this.game.ui?.showMessage('💦 Entered water', 1500);
        
        // Camera effect
        this.game.camera?.addShake?.(2, 0.1);
    }
    
    onExitWater(player) {
        if (this.splashCooldown > 0) return;
        this.splashCooldown = 0.5;
        
        // Splash effect
        this.spawnSplash(player.x, player.y, player.z);
    }
    
    onSubmerge(player) {
        this.game.ui?.showMessage('🫧 Submerged - hold breath!', 2000);
    }
    
    onSurface(player) {
        if (this.breath < SWIM_CONFIG.MAX_BREATH * 0.5) {
            this.game.ui?.showMessage('💨 Caught breath!', 1500);
        }
    }
    
    spawnSplash(x, y, z) {
        if (!this.game.particles) return;
        
        for (let i = 0; i < 15; i++) {
            this.game.particles.spawn(x, y, z, {
                type: 'water',
                color: '#4FC3F7',
                lifetime: 0.8,
                velocity: {
                    x: (Math.random() - 0.5) * 4,
                    y: (Math.random() - 0.5) * 4,
                    z: Math.random() * 3 + 1
                }
            });
        }
    }
    
    spawnBubbles(x, y, z) {
        if (!this.game.particles) return;
        
        for (let i = 0; i < 8; i++) {
            this.game.particles.spawn(x + (Math.random() - 0.5), y + (Math.random() - 0.5), z + 1, {
                type: 'bubble',
                color: '#FFFFFF',
                lifetime: 1.5,
                velocity: {
                    x: (Math.random() - 0.5) * 0.5,
                    y: (Math.random() - 0.5) * 0.5,
                    z: 1 + Math.random()
                }
            });
        }
    }
    
    // Get breath percentage
    getBreathPercent() {
        return this.breath / SWIM_CONFIG.MAX_BREATH;
    }
    
    // Check if player can dive deeper
    canDive() {
        return this.isSwimming && this.waterDepth > 1;
    }
    
    // Apply underwater tint to rendering
    applyUnderwaterEffect(ctx) {
        if (!this.isUnderwater) return;
        
        const tint = SWIM_CONFIG.UNDERWATER_TINT;
        ctx.fillStyle = `rgba(${tint.r * 255}, ${tint.g * 255}, ${tint.b * 255}, ${tint.a})`;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Add bubble overlay occasionally
        if (Math.random() < 0.02) {
            this.drawBubbleOverlay(ctx);
        }
    }
    
    drawBubbleOverlay(ctx) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * ctx.canvas.width;
            const y = Math.random() * ctx.canvas.height;
            const r = 2 + Math.random() * 4;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Render breath bar
    renderBreathBar(ctx, x, y, width, height) {
        if (!this.isUnderwater && this.breath >= SWIM_CONFIG.MAX_BREATH) return;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y, width, height);
        
        // Breath fill
        const percent = this.getBreathPercent();
        let color = '#4FC3F7'; // Blue
        if (percent < 0.3) color = '#FF5722'; // Red when low
        else if (percent < 0.5) color = '#FFC107'; // Yellow when medium
        
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width * percent, height);
        
        // Border
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
        
        // Icon
        ctx.font = '14px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'right';
        ctx.fillText('🫧', x - 5, y + height - 2);
        
        // Percent text
        if (percent < 0.5) {
            ctx.textAlign = 'center';
            ctx.font = 'bold 10px Arial';
            ctx.fillText(`${Math.ceil(percent * 100)}%`, x + width / 2, y + height - 2);
        }
    }
    
    // Serialize
    serialize() {
        return {
            breath: this.breath
        };
    }
    
    deserialize(data) {
        if (data?.breath !== undefined) {
            this.breath = data.breath;
        }
    }
    
    reset() {
        this.isInWater = false;
        this.isUnderwater = false;
        this.isSwimming = false;
        this.waterDepth = 0;
        this.breath = SWIM_CONFIG.MAX_BREATH;
        this.isDrowning = false;
        this.isDiving = false;
        this.isSurfacing = false;
        this.drownDamageTimer = 0;
        this.splashCooldown = 0;
    }
}
