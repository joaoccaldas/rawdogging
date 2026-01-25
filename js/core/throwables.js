// Throwable Weapons System - Ranged primitive combat
import { CONFIG } from '../config.js';

// Throwable weapon types
export const THROWABLE_TYPES = {
    rock: {
        name: 'Rock',
        damage: 5,
        range: 8,
        speed: 12,
        gravity: 0.3,
        stackSize: 16,
        sprite: '🪨',
        craftable: false // Picked up from ground
    },
    throwing_spear: {
        name: 'Throwing Spear',
        damage: 15,
        range: 12,
        speed: 15,
        gravity: 0.15,
        stackSize: 8,
        sprite: '🗡️',
        craftable: true
    },
    bone_javelin: {
        name: 'Bone Javelin',
        damage: 20,
        range: 15,
        speed: 18,
        gravity: 0.1,
        stackSize: 8,
        sprite: '🦴',
        craftable: true
    },
    bronze_javelin: {
        name: 'Bronze Javelin',
        damage: 30,
        range: 18,
        speed: 20,
        gravity: 0.08,
        stackSize: 5,
        sprite: '⚔️',
        craftable: true
    },
    snowball: {
        name: 'Snowball',
        damage: 1,
        range: 10,
        speed: 14,
        gravity: 0.2,
        stackSize: 32,
        sprite: '⚪',
        effect: 'slow',
        effectDuration: 2000,
        craftable: false // Made from snow
    },
    torch_thrown: {
        name: 'Thrown Torch',
        damage: 3,
        range: 6,
        speed: 10,
        gravity: 0.25,
        stackSize: 16,
        sprite: '🔥',
        effect: 'fire',
        effectDuration: 3000,
        craftable: true
    },
    bola: {
        name: 'Bola',
        damage: 2,
        range: 10,
        speed: 12,
        gravity: 0.2,
        stackSize: 8,
        sprite: '⚫',
        effect: 'stun',
        effectDuration: 3000,
        craftable: true
    }
};

// Recipes for throwables
export const THROWABLE_RECIPES = {
    throwing_spear: {
        result: 'throwing_spear',
        count: 2,
        requires: { stick: 2, flint: 1 }
    },
    bone_javelin: {
        result: 'bone_javelin',
        count: 2,
        requires: { bone: 3, fiber: 2 }
    },
    bronze_javelin: {
        result: 'bronze_javelin',
        count: 2,
        requires: { bronze_ingot: 2, stick: 1 }
    },
    torch_thrown: {
        result: 'torch_thrown',
        count: 4,
        requires: { stick: 2, coal: 1, fiber: 1 }
    },
    bola: {
        result: 'bola',
        count: 2,
        requires: { fiber: 4, stone: 3 }
    }
};

// Projectile class for in-flight throwables
class Projectile {
    constructor(x, y, z, vx, vy, vz, type, owner) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.vx = vx;
        this.vy = vy;
        this.vz = vz;
        this.type = type;
        this.owner = owner;
        this.config = THROWABLE_TYPES[type];
        this.alive = true;
        this.lifetime = 0;
        this.maxLifetime = 5000; // 5 seconds max flight time
        this.rotation = 0;
    }
    
    update(deltaTime, world, enemies, player) {
        if (!this.alive) return;
        
        this.lifetime += deltaTime * 1000;
        if (this.lifetime > this.maxLifetime) {
            this.alive = false;
            return;
        }
        
        // Apply gravity
        this.vz -= this.config.gravity;
        
        // Move projectile
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.z += this.vz * deltaTime;
        
        // Rotate sprite
        this.rotation += deltaTime * 5;
        
        // Check world collision
        const blockX = Math.floor(this.x);
        const blockY = Math.floor(this.y);
        const blockZ = Math.floor(this.z);
        
        if (world && world.getBlock) {
            const block = world.getBlock(blockX, blockY, blockZ);
            if (block && block !== 'air' && block !== 'water') {
                this.onImpact(null, world);
                return;
            }
        }
        
        // Check ground collision
        if (this.z <= 0) {
            this.onImpact(null, world);
            return;
        }
        
        // Check enemy collision
        if (enemies && this.owner === 'player') {
            for (const enemy of enemies) {
                if (!enemy.alive) continue;
                
                const dx = this.x - enemy.x;
                const dy = this.y - enemy.y;
                const dz = this.z - enemy.z;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                
                if (dist < 1.5) {
                    this.onImpact(enemy, world);
                    return;
                }
            }
        }
        
        // Check player collision (for enemy projectiles)
        if (player && this.owner !== 'player') {
            const dx = this.x - player.x;
            const dy = this.y - player.y;
            const dz = this.z - player.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (dist < 1) {
                this.onImpact(player, world);
                return;
            }
        }
    }
    
    onImpact(target, world) {
        this.alive = false;
        
        if (target) {
            // Deal damage
            if (typeof target.takeDamage === 'function') {
                target.takeDamage(this.config.damage, 'projectile');
            } else if (target.health !== undefined) {
                target.health -= this.config.damage;
            }
            
            // Apply effects
            if (this.config.effect) {
                this.applyEffect(target);
            }
        }
        
        // Special behavior for torch - might start fire
        if (this.type === 'torch_thrown' && world) {
            const blockX = Math.floor(this.x);
            const blockY = Math.floor(this.y);
            const blockZ = Math.floor(this.z);
            
            // Check if we can place fire
            const blockBelow = world.getBlock(blockX, blockY, blockZ - 1);
            if (blockBelow && blockBelow !== 'air' && blockBelow !== 'water') {
                // Could spawn fire particle or campfire here
            }
        }
    }
    
    applyEffect(target) {
        if (!this.config.effect) return;
        
        switch (this.config.effect) {
            case 'slow':
                target.slowedUntil = Date.now() + this.config.effectDuration;
                target.slowAmount = 0.5;
                break;
                
            case 'fire':
                target.burningUntil = Date.now() + this.config.effectDuration;
                break;
                
            case 'stun':
                target.stunnedUntil = Date.now() + this.config.effectDuration;
                break;
        }
    }
}

export class ThrowableSystem {
    constructor(game) {
        this.game = game;
        this.projectiles = [];
        this.aimLine = null;
        this.isAiming = false;
        this.selectedThrowable = null;
    }
    
    // Start aiming (right-click with throwable equipped)
    startAim(throwableType) {
        if (!THROWABLE_TYPES[throwableType]) return;
        
        this.isAiming = true;
        this.selectedThrowable = throwableType;
    }
    
    // Cancel aiming
    cancelAim() {
        this.isAiming = false;
        this.selectedThrowable = null;
        this.aimLine = null;
    }
    
    // Calculate trajectory for aim preview
    calculateTrajectory(startX, startY, startZ, targetX, targetY, targetZ) {
        const config = THROWABLE_TYPES[this.selectedThrowable];
        if (!config) return [];
        
        // Direction to target
        const dx = targetX - startX;
        const dy = targetY - startY;
        const dz = targetZ - startZ;
        const horizontalDist = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate launch angle for parabolic trajectory
        const speed = config.speed;
        const gravity = config.gravity * 60; // Convert to proper units
        
        // Initial velocities
        const ratio = Math.min(1, horizontalDist / config.range);
        const vHorizontal = speed * ratio;
        const vx = (dx / horizontalDist) * vHorizontal || 0;
        const vy = (dy / horizontalDist) * vHorizontal || 0;
        const vz = (dz / horizontalDist) * vHorizontal + gravity * 0.5;
        
        // Simulate trajectory
        const points = [];
        let px = startX, py = startY, pz = startZ;
        let pvx = vx, pvy = vy, pvz = vz;
        
        for (let i = 0; i < 30; i++) {
            points.push({ x: px, y: py, z: pz });
            
            px += pvx * 0.1;
            py += pvy * 0.1;
            pz += pvz * 0.1;
            pvz -= gravity * 0.1;
            
            if (pz < 0) break;
        }
        
        return points;
    }
    
    // Throw projectile
    throw(startX, startY, startZ, targetX, targetY, targetZ, throwableType, owner = 'player') {
        const config = THROWABLE_TYPES[throwableType];
        if (!config) return false;
        
        // Direction to target
        const dx = targetX - startX;
        const dy = targetY - startY;
        const dz = targetZ - startZ;
        const horizontalDist = Math.sqrt(dx * dx + dy * dy);
        
        if (horizontalDist === 0) return false;
        
        // Calculate velocities
        const speed = config.speed;
        const gravity = config.gravity * 60;
        
        const ratio = Math.min(1, horizontalDist / config.range);
        const vHorizontal = speed * ratio * 0.5;
        const vx = (dx / horizontalDist) * vHorizontal;
        const vy = (dy / horizontalDist) * vHorizontal;
        const vz = Math.max(2, (dz / horizontalDist) * vHorizontal + gravity * 0.3);
        
        // Create projectile
        const projectile = new Projectile(
            startX, startY, startZ + 1.5, // Start at shoulder height
            vx, vy, vz,
            throwableType,
            owner
        );
        
        this.projectiles.push(projectile);
        
        // Play throw sound
        if (this.game.audio) {
            this.game.audio.playSound('throw');
        }
        
        this.cancelAim();
        return true;
    }
    
    update(deltaTime) {
        const world = this.game.world;
        const enemies = this.game.enemies || [];
        const player = this.game.player;
        
        // Update all projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            proj.update(deltaTime, world, enemies, player);
            
            if (!proj.alive) {
                // Spawn impact particles
                if (this.game.particles) {
                    this.game.particles.spawn(
                        proj.x, proj.y, proj.z,
                        'impact',
                        3
                    );
                }
                this.projectiles.splice(i, 1);
            }
        }
    }
    
    render(ctx, camera) {
        // Render all projectiles
        for (const proj of this.projectiles) {
            const screenPos = camera.worldToScreen(proj.x, proj.y, proj.z);
            
            ctx.save();
            ctx.translate(screenPos.x, screenPos.y);
            ctx.rotate(proj.rotation);
            
            // Draw projectile sprite
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(proj.config.sprite, 0, 0);
            
            ctx.restore();
        }
        
        // Render aim line if aiming
        if (this.isAiming && this.aimLine && this.aimLine.length > 1) {
            ctx.strokeStyle = 'rgba(255, 255, 100, 0.5)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            
            const start = camera.worldToScreen(
                this.aimLine[0].x,
                this.aimLine[0].y,
                this.aimLine[0].z
            );
            ctx.moveTo(start.x, start.y);
            
            for (let i = 1; i < this.aimLine.length; i++) {
                const pos = camera.worldToScreen(
                    this.aimLine[i].x,
                    this.aimLine[i].y,
                    this.aimLine[i].z
                );
                ctx.lineTo(pos.x, pos.y);
            }
            
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
    
    // Check if item is a throwable
    static isThrowable(itemKey) {
        return THROWABLE_TYPES.hasOwnProperty(itemKey);
    }
}

// Export throwable items for config integration
export const THROWABLE_ITEMS = {
    rock: {
        name: 'Rock',
        type: 'throwable',
        stackSize: 16,
        description: 'A small rock. Can be thrown at enemies.'
    },
    throwing_spear: {
        name: 'Throwing Spear',
        type: 'throwable',
        stackSize: 8,
        description: 'Light spear designed for throwing.'
    },
    bone_javelin: {
        name: 'Bone Javelin',
        type: 'throwable',
        stackSize: 8,
        description: 'Aerodynamic javelin made from bone.'
    },
    bronze_javelin: {
        name: 'Bronze Javelin',
        type: 'throwable',
        stackSize: 5,
        description: 'Heavy bronze-tipped javelin.'
    },
    snowball: {
        name: 'Snowball',
        type: 'throwable',
        stackSize: 32,
        description: 'Packed snow. Slows enemies on hit.'
    },
    torch_thrown: {
        name: 'Throwing Torch',
        type: 'throwable',
        stackSize: 16,
        description: 'Torch designed to be thrown. Sets enemies on fire.'
    },
    bola: {
        name: 'Bola',
        type: 'throwable',
        stackSize: 8,
        description: 'Weighted rope weapon. Stuns enemies.'
    }
};
