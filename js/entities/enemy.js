import { Entity } from './entity.js';
import { CONFIG, ENEMIES, ITEMS, BLOCKS, BLOCK_DATA } from '../config.js';
import { ItemEntity } from './item.js';

export class Enemy extends Entity {
    constructor(game, x, y, z, typeKey) {
        super(game, x, y, z);
        this.typeKey = typeKey;
        this.stats = ENEMIES[typeKey];

        this.emoji = this.stats.emoji;
        this.width = 0.8;
        this.height = 0.8; // Length in Y
        this.depth = 1.2; // Height in Z

        this.health = this.stats.health;
        this.maxHealth = this.stats.health;
        this.speed = this.stats.speed;
        this.damage = this.stats.damage;

        // AI State
        this.state = 'IDLE'; // IDLE, WANDER, CHASE, ATTACK
        this.stateTimer = 0;
        this.target = null;
        this.lastAttackTime = 0;
        this.attackCooldown = 1000; // ms between attacks

        // Physics overrides
        this.jumpForce = 6;
    }

    update(deltaTime) {
        if (this.isDead) return;

        this.updateAI(deltaTime);
        this.applyPhysics(deltaTime);

        // Invincibility flash handled in renderer
        if (this.invincibleTime > 0) {
            this.invincibleTime -= deltaTime * 1000;
        }
    }

    updateAI(deltaTime) {
        const player = this.game.player;
        if (!player) return;

        const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y, player.z - this.z);

        // State Transitions
        if (this.stats.aggressive && distToPlayer < 10) {
            if (distToPlayer < CONFIG.ATTACK_RANGE) {
                this.state = 'ATTACK';
            } else {
                this.state = 'CHASE';
            }
        } else if (this.state === 'CHASE' && distToPlayer > 15) {
            this.state = 'IDLE';
        }

        // Actions
        switch (this.state) {
            case 'IDLE':
                this.vx = 0;
                this.vy = 0;
                this.stateTimer -= deltaTime;
                if (this.stateTimer <= 0) {
                    this.state = 'WANDER';
                    this.stateTimer = 2 + Math.random() * 3;
                    const angle = Math.random() * Math.PI * 2;
                    this.wanderDir = { x: Math.cos(angle), y: Math.sin(angle) };
                }
                break;

            case 'WANDER':
                if (this.wanderDir) {
                    this.vx = this.wanderDir.x * (this.speed * 0.5);
                    this.vy = this.wanderDir.y * (this.speed * 0.5);
                }

                // Jump if blocked
                if (this.vx === 0 && this.vy === 0 && this.grounded) {
                    this.vz = this.jumpForce;
                }

                this.stateTimer -= deltaTime;
                if (this.stateTimer <= 0) {
                    this.state = 'IDLE';
                    this.stateTimer = 1 + Math.random() * 2;
                }
                break;

            case 'CHASE':
                if (player) {
                    const dx = player.x - this.x;
                    const dy = player.y - this.y;
                    const len = Math.sqrt(dx * dx + dy * dy);
                    if (len > 0) {
                        this.vx = (dx / len) * this.speed;
                        this.vy = (dy / len) * this.speed;
                    }

                    // Simple jump logic if hitting wall
                    // Check checking collision ahead implemented in checkCollision?
                    // Actually usually handle 'if not moving but want to move' -> Jump
                    if (Math.abs(this.vx) + Math.abs(this.vy) > 0.1) {
                        // Check one step ahead
                        const nextX = this.x + this.vx * 0.2;
                        const nextY = this.y + this.vy * 0.2;
                        if (this.checkCollision(nextX, nextY, this.z) && this.grounded) {
                            this.vz = this.jumpForce;
                        }
                    }
                }
                break;

            case 'ATTACK':
                this.vx = 0;
                this.vy = 0;
                // Attack Player with cooldown
                if (this.game.player) {
                    const now = Date.now();
                    if (now - this.lastAttackTime >= this.attackCooldown) {
                        this.lastAttackTime = now;
                        this.game.player.takeDamage(this.damage, this);
                        this.game.audio.play('hit');
                    }
                }
                break;
        }

        // Despawn
        if (distToPlayer > CONFIG.ENEMY_DESPAWN_DISTANCE) {
            this.isDead = true;
        }
    }

    applyPhysics(deltaTime) {
        // Same as Player physics mostly, assume inherited usually but we wrote it inline in Player
        // Let's copy-paste simplified version
        const dt = Math.min(deltaTime, 0.1);

        this.vz -= CONFIG.GRAVITY * dt * 60; // Scale gravity for deltaTime

        const nextX = this.x + this.vx * dt;
        const nextY = this.y + this.vy * dt;
        const nextZ = this.z + this.vz * dt;

        if (!this.checkCollision(nextX, this.y, this.z)) this.x = nextX;
        if (!this.checkCollision(this.x, nextY, this.z)) this.y = nextY;

        if (!this.checkCollision(this.x, this.y, nextZ)) {
            this.z = nextZ;
            this.grounded = false;
        } else {
            if (this.vz < 0) {
                this.grounded = true;
                this.z = Math.floor(this.z);
            }
            this.vz = 0;
        }

        if (this.z < -10) this.isDead = true;
    }

    checkCollision(x, y, z) {
        const world = this.game.world;
        const margin = 0.2;
        const minX = Math.floor(x + margin);
        const maxX = Math.floor(x + this.width - margin);
        const minY = Math.floor(y + margin);
        const maxY = Math.floor(y + this.height - margin);
        const minZ = Math.floor(z);
        const maxZ = Math.floor(z + this.depth);

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
        return false;
    }

    takeDamage(amount, source) {
        if (this.isDead) return;
        if (this.invincibleTime > 0) return;

        this.health -= amount;
        this.game.particles.emitText(this.x, this.y, this.z + 1.5, `-${amount}`, '#fff');
        this.invincibleTime = 200;

        // Knockback
        if (source) {
            const dx = this.x - source.x;
            const dy = this.y - source.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len > 0) {
                this.vx += (dx / len) * 5;
                this.vy += (dy / len) * 5;
                this.vz += 2;
                this.grounded = false;
            }
        }

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        this.isDead = true;
        
        // Death particles
        this.game.particles.emit(this.x, this.y, this.z + 0.5, '#ff0000', 15);
        this.game.audio.play('hit');
        
        // Give player XP and notify quest system
        const xpReward = this.stats.xp || 10;
        if (this.game.player && !this.game.player.isDead) {
            this.game.player.gainXP(xpReward);
            this.game.particles.emitText(this.x, this.y, this.z + 1.5, `+${xpReward} XP`, '#ffd700');
            
            // Notify quest system about the kill
            if (this.game.questManager) {
                this.game.questManager.onEnemyKilled(this.typeKey);
            }
        }

        // Drop loot with better distribution
        if (this.stats.drops) {
            this.stats.drops.forEach(([itemKey, min, max]) => {
                const count = Math.floor(min + Math.random() * (max - min + 1));
                for (let i = 0; i < count; i++) {
                    const dropX = this.x + (Math.random() - 0.5) * 0.8;
                    const dropY = this.y + (Math.random() - 0.5) * 0.8;
                    const item = new ItemEntity(this.game, dropX, dropY, this.z + 0.5, itemKey);
                    // Launch items outward in a circle
                    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
                    item.vx = Math.cos(angle) * 2;
                    item.vy = Math.sin(angle) * 2;
                    item.vz = 4 + Math.random() * 2;
                    this.game.entities.push(item);
                }
            });
        }
    }
}
