import { Entity } from './entity.js';
import { CONFIG, ENEMIES, BOSSES, ITEMS, BLOCKS, BLOCK_DATA } from '../config.js';
import { ItemEntity } from './item.js';

export class Enemy extends Entity {
    constructor(game, x, y, z, typeKey, isBoss = false) {
        super(game, x, y, z);
        this.typeKey = typeKey;
        this.isBoss = isBoss;
        
        // Get stats from appropriate source
        this.stats = isBoss ? BOSSES[typeKey] : ENEMIES[typeKey];
        if (!this.stats) {
            console.warn(`Enemy type not found: ${typeKey}`);
            this.stats = ENEMIES.WOLF; // Fallback
        }

        this.emoji = this.stats.emoji;
        this.width = isBoss ? 1.5 : 0.8;
        this.height = isBoss ? 1.5 : 0.8;
        this.depth = isBoss ? 2.0 : 1.2;

        this.health = this.stats.health;
        this.maxHealth = this.stats.health;
        this.speed = this.stats.speed;
        this.damage = this.stats.damage;

        // AI State
        this.state = 'IDLE';
        this.stateTimer = 0;
        this.target = null;
        this.lastAttackTime = 0;
        this.attackCooldown = isBoss ? 800 : 1000;
        
        // Boss-specific
        this.abilities = this.stats.abilities || [];
        this.lastAbilityTime = 0;
        this.abilityCooldown = 5000;
        this.enraged = false; // Bosses enrage at low health

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
        
        // Boss enrage mechanic
        if (this.isBoss && this.health < this.maxHealth * 0.3 && !this.enraged) {
            this.enraged = true;
            this.speed *= 1.5;
            this.damage *= 1.3;
            this.attackCooldown *= 0.7;
            if (this.game.ui) {
                this.game.ui.showMessage(`⚡ ${this.stats.name} is ENRAGED!`, 3000);
            }
            this.game.particles.emit(this.x, this.y, this.z + 1, '#ff4444', 30);
        }
        
        // Boss abilities
        if (this.isBoss && this.abilities.length > 0) {
            const now = Date.now();
            if (now - this.lastAbilityTime >= this.abilityCooldown && distToPlayer < 15) {
                this.useAbility();
                this.lastAbilityTime = now;
            }
        }

        // State Transitions
        const aggroRange = this.isBoss ? 20 : 10;
        if (this.stats.aggressive && distToPlayer < aggroRange) {
            if (distToPlayer < CONFIG.ATTACK_RANGE * (this.isBoss ? 1.5 : 1)) {
                this.state = 'ATTACK';
            } else {
                this.state = 'CHASE';
            }
        } else if (this.state === 'CHASE' && distToPlayer > (this.isBoss ? 30 : 15)) {
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
        this.game.particles.emit(this.x, this.y, this.z + 0.5, '#ff0000', this.isBoss ? 50 : 15);
        this.game.audio.play(this.isBoss ? 'boss_death' : 'hit');
        
        // Give player XP and notify quest system
        const xpReward = this.stats.xp || 10;
        if (this.game.player && !this.game.player.isDead) {
            this.game.player.gainXP(xpReward);
            this.game.particles.emitText(this.x, this.y, this.z + 1.5, `+${xpReward} XP`, '#ffd700');
            
            // Boss kill message
            if (this.isBoss && this.game.ui) {
                this.game.ui.showMessage(`🏆 ${this.stats.name} DEFEATED! +${xpReward} XP`, 5000);
            }
            
            // Notify quest system about the kill
            if (this.game.questManager) {
                this.game.questManager.onEnemyKilled(this.typeKey);
            }
            
            // Notify skills system for combat XP
            if (this.game.skills) {
                this.game.skills.addSkillXp('COMBAT', this.isBoss ? 100 : 20);
                this.game.skills.addSkillXp('HUNTING', this.isBoss ? 50 : 10);
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
    
    // Boss ability system
    useAbility() {
        if (this.abilities.length === 0) return;
        
        const ability = this.abilities[Math.floor(Math.random() * this.abilities.length)];
        const player = this.game.player;
        
        switch (ability) {
            case 'charge':
                // Rush toward player
                if (player) {
                    const dx = player.x - this.x;
                    const dy = player.y - this.y;
                    const len = Math.sqrt(dx * dx + dy * dy);
                    if (len > 0) {
                        this.vx = (dx / len) * this.speed * 3;
                        this.vy = (dy / len) * this.speed * 3;
                    }
                    this.game.particles.emit(this.x, this.y, this.z + 0.5, '#ffaa00', 20);
                }
                break;
                
            case 'stomp':
                // Area damage around boss
                if (player) {
                    const dist = Math.hypot(player.x - this.x, player.y - this.y);
                    if (dist < 4) {
                        player.takeDamage(this.damage * 1.5, this);
                        player.vz += 8; // Launch player up
                    }
                    this.game.particles.emit(this.x, this.y, this.z, '#8b4513', 30);
                }
                break;
                
            case 'summon_pack':
                // Spawn helper wolves
                for (let i = 0; i < 3; i++) {
                    const angle = (i / 3) * Math.PI * 2;
                    const spawnX = this.x + Math.cos(angle) * 3;
                    const spawnY = this.y + Math.sin(angle) * 3;
                    const wolf = new Enemy(this.game, spawnX, spawnY, this.z, 'WOLF');
                    this.game.entities.push(wolf);
                }
                this.game.audio.play('growl');
                break;
                
            case 'howl':
                // Buff self and terrify player (slow them)
                this.speed *= 1.2;
                setTimeout(() => { this.speed /= 1.2; }, 5000);
                this.game.particles.emit(this.x, this.y, this.z + 1.5, '#aaaaff', 25);
                this.game.audio.play('growl');
                break;
                
            case 'roar':
                // Stun/knockback player
                if (player) {
                    const dx = player.x - this.x;
                    const dy = player.y - this.y;
                    const len = Math.sqrt(dx * dx + dy * dy);
                    if (len > 0 && len < 8) {
                        player.vx += (dx / len) * 10;
                        player.vy += (dy / len) * 10;
                        player.vz += 3;
                    }
                }
                this.game.particles.emit(this.x, this.y, this.z + 1, '#ffff00', 30);
                this.game.audio.play('growl');
                break;
                
            case 'swipe':
                // Wide attack arc
                if (player) {
                    const dist = Math.hypot(player.x - this.x, player.y - this.y);
                    if (dist < 3) {
                        player.takeDamage(this.damage * 2, this);
                    }
                }
                break;
        }
    }
}
