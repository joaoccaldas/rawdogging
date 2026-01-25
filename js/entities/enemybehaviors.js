// Enhanced Enemy Behaviors - Special AI for Medieval, Industrial, and Modern enemies
import { CONFIG, BLOCKS, BLOCK_DATA, ENEMIES } from '../config.js';

// Special behaviors for different enemy types
export const ENEMY_BEHAVIORS = {
    // Medieval behaviors
    canUseWeapons: {
        init(enemy) {
            enemy.weapon = enemy.stats.weapon || 'sword';
            enemy.attackRange = enemy.weapon === 'crossbow' ? 8 : 1.5;
        },
        update(enemy, deltaTime, player) {
            if (enemy.weapon === 'crossbow' || enemy.stats.rangedAttack) {
                return handleRangedAttack(enemy, player);
            }
            return false;
        }
    },
    
    rangedAttack: {
        init(enemy) {
            enemy.projectileCooldown = 2000;
            enemy.lastProjectileTime = 0;
            enemy.attackRange = 10;
        },
        update(enemy, deltaTime, player) {
            return handleRangedAttack(enemy, player);
        }
    },
    
    armor: {
        init(enemy) {
            enemy.armorValue = enemy.stats.armor || 0;
        },
        takeDamage(enemy, amount) {
            // Reduce damage by armor
            const reduction = Math.min(amount * 0.8, enemy.armorValue);
            return Math.max(1, amount - reduction);
        }
    },
    
    // Industrial behaviors
    flying: {
        init(enemy) {
            enemy.flyHeight = 3;
            enemy.hoverOffset = 0;
        },
        update(enemy, deltaTime, player) {
            // Hover behavior
            enemy.hoverOffset += deltaTime * 2;
            const targetZ = enemy.game.world.getHeight(Math.floor(enemy.x), Math.floor(enemy.y)) + enemy.flyHeight;
            
            // Smooth flying
            const zDiff = targetZ + Math.sin(enemy.hoverOffset) * 0.3 - enemy.z;
            enemy.vz += zDiff * 0.1;
            enemy.vz *= 0.9; // Damping
            
            return false;
        },
        applyPhysics(enemy) {
            // Override gravity for flying enemies
            enemy.vz *= 0.95;
            return true; // Skip normal gravity
        }
    },
    
    steam_blast: {
        cooldown: 5000,
        use(enemy, player) {
            // Area damage steam attack
            const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
            if (dist < 5) {
                player.takeDamage(enemy.damage * 0.5, enemy);
                
                // Push player back
                const dx = player.x - enemy.x;
                const dy = player.y - enemy.y;
                const len = Math.sqrt(dx * dx + dy * dy);
                if (len > 0) {
                    player.vx += (dx / len) * 8;
                    player.vy += (dy / len) * 8;
                }
                
                // Steam particles
                for (let i = 0; i < 20; i++) {
                    const angle = (i / 20) * Math.PI * 2;
                    const px = enemy.x + Math.cos(angle) * 2;
                    const py = enemy.y + Math.sin(angle) * 2;
                    enemy.game.particles.emit(px, py, enemy.z + 1, '#cccccc', 3);
                }
                
                enemy.game.audio.play('steam');
            }
        }
    },
    
    // Modern behaviors
    canHack: {
        init(enemy) {
            enemy.hackCooldown = 10000;
            enemy.lastHackTime = 0;
            enemy.hackRange = 15;
        },
        update(enemy, deltaTime, player) {
            const now = Date.now();
            if (now - enemy.lastHackTime < enemy.hackCooldown) return false;
            
            const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
            if (dist < enemy.hackRange) {
                enemy.lastHackTime = now;
                
                // Disable nearby machines temporarily
                if (enemy.game.machineSystem) {
                    const machines = Array.from(enemy.game.machineSystem.machines.values());
                    for (const machine of machines) {
                        const machineDist = Math.hypot(machine.x - enemy.x, machine.y - enemy.y);
                        if (machineDist < 10) {
                            machine.powered = false;
                            setTimeout(() => { machine.powered = true; }, 5000);
                        }
                    }
                }
                
                // Visual feedback
                enemy.game.particles.emit(enemy.x, enemy.y, enemy.z + 1, '#00ff00', 15);
                enemy.game.ui?.showMessage('⚠️ Systems hacked!', 2000);
                
                return true;
            }
            return false;
        }
    },
    
    laser_sweep: {
        cooldown: 4000,
        use(enemy, player) {
            // Sweeping laser attack
            const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
            
            // Fire laser in arc
            for (let a = -0.5; a <= 0.5; a += 0.1) {
                const laserAngle = angle + a;
                const laserX = enemy.x + Math.cos(laserAngle) * 6;
                const laserY = enemy.y + Math.sin(laserAngle) * 6;
                
                // Check if player is in laser path
                const dx = player.x - enemy.x;
                const dy = player.y - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 6) {
                    const playerAngle = Math.atan2(dy, dx);
                    if (Math.abs(playerAngle - laserAngle) < 0.2) {
                        player.takeDamage(enemy.damage * 0.3, enemy);
                    }
                }
                
                // Laser visual
                enemy.game.particles.emit(laserX, laserY, enemy.z + 1, '#ff0000', 2);
            }
            
            enemy.game.audio.play('laser');
        }
    }
};

// Helper function for ranged attacks
function handleRangedAttack(enemy, player) {
    const now = Date.now();
    if (now - enemy.lastProjectileTime < enemy.projectileCooldown) return false;
    
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (dist > enemy.attackRange || dist < 2) return false;
    
    enemy.lastProjectileTime = now;
    
    // Fire projectile
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    
    // Create projectile (use throwables system if available)
    if (enemy.game.throwables) {
        const projectileType = enemy.stats.age === 'modern' ? 'laser' : 
                               enemy.stats.age === 'industrial' ? 'bullet' : 'arrow';
        enemy.game.throwables.throwProjectile(
            enemy.x, enemy.y, enemy.z + 1,
            dx / len, dy / len, 0.1,
            projectileType,
            enemy.damage * 0.5,
            enemy
        );
    } else {
        // Simple projectile damage
        const accuracy = 0.8 + Math.random() * 0.2;
        if (accuracy > 0.7) {
            setTimeout(() => {
                const currentDist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
                if (currentDist < enemy.attackRange * 1.5) {
                    player.takeDamage(enemy.damage * 0.5, enemy);
                    enemy.game.particles.emit(player.x, player.y, player.z + 1, '#ff4444', 5);
                }
            }, 300);
        }
    }
    
    // Muzzle flash/arrow particles
    enemy.game.particles.emit(enemy.x, enemy.y, enemy.z + 1, '#ffff00', 3);
    
    return true;
}

// Enemy behavior manager
export class EnemyBehaviorManager {
    constructor(game) {
        this.game = game;
    }

    initEnemy(enemy) {
        const stats = enemy.stats;
        
        // Initialize behaviors based on enemy properties
        if (stats.canUseWeapons) {
            ENEMY_BEHAVIORS.canUseWeapons.init(enemy);
        }
        if (stats.rangedAttack) {
            ENEMY_BEHAVIORS.rangedAttack.init(enemy);
        }
        if (stats.armor) {
            ENEMY_BEHAVIORS.armor.init(enemy);
        }
        if (stats.flying) {
            ENEMY_BEHAVIORS.flying.init(enemy);
        }
        if (stats.canHack) {
            ENEMY_BEHAVIORS.canHack.init(enemy);
        }
    }

    updateEnemy(enemy, deltaTime) {
        const stats = enemy.stats;
        const player = this.game.player;
        
        if (!player || enemy.isDead) return;
        
        // Run behavior updates
        if (stats.flying) {
            ENEMY_BEHAVIORS.flying.update(enemy, deltaTime, player);
        }
        if (stats.canHack) {
            ENEMY_BEHAVIORS.canHack.update(enemy, deltaTime, player);
        }
        if (stats.rangedAttack || stats.canUseWeapons) {
            const behavior = stats.rangedAttack ? ENEMY_BEHAVIORS.rangedAttack : ENEMY_BEHAVIORS.canUseWeapons;
            if (behavior.update(enemy, deltaTime, player)) {
                // Ranged attack was performed, don't chase as aggressively
                enemy.state = 'RANGED';
            }
        }
        
        // Use abilities
        if (stats.abilities && stats.abilities.length > 0) {
            this.tryUseAbility(enemy, player);
        }
    }

    tryUseAbility(enemy, player) {
        const now = Date.now();
        if (now - enemy.lastAbilityTime < (enemy.abilityCooldown || 5000)) return;
        
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (dist > 15) return;
        
        const abilityName = enemy.stats.abilities[Math.floor(Math.random() * enemy.stats.abilities.length)];
        const ability = ENEMY_BEHAVIORS[abilityName];
        
        if (ability && ability.use) {
            ability.use(enemy, player);
            enemy.lastAbilityTime = now;
        }
    }

    modifyDamage(enemy, amount) {
        if (enemy.stats.armor && ENEMY_BEHAVIORS.armor.takeDamage) {
            return ENEMY_BEHAVIORS.armor.takeDamage(enemy, amount);
        }
        return amount;
    }

    shouldSkipGravity(enemy) {
        if (enemy.stats.flying && ENEMY_BEHAVIORS.flying.applyPhysics) {
            return ENEMY_BEHAVIORS.flying.applyPhysics(enemy);
        }
        return false;
    }
}

// Raid system for villages
export class RaidSystem {
    constructor(game) {
        this.game = game;
        this.activeRaids = [];
        this.raidCooldown = 600; // 10 minutes between raids
        this.lastRaidTime = 0;
    }

    update(deltaTime) {
        // Check for raid triggers
        const gameTime = Date.now() / 1000;
        
        if (gameTime - this.lastRaidTime > this.raidCooldown) {
            // Check if player is near a village
            if (this.game.villageSystem) {
                const playerVillage = this.game.villageSystem.getVillageAt(
                    this.game.player.x,
                    this.game.player.y
                );
                
                if (playerVillage && Math.random() < 0.01) {
                    this.startRaid(playerVillage);
                }
            }
        }
        
        // Update active raids
        for (let i = this.activeRaids.length - 1; i >= 0; i--) {
            const raid = this.activeRaids[i];
            raid.timer -= deltaTime;
            
            // Check if raid is complete
            const aliveRaiders = raid.raiders.filter(r => !r.isDead);
            
            if (aliveRaiders.length === 0) {
                this.endRaid(raid, true);
                this.activeRaids.splice(i, 1);
            } else if (raid.timer <= 0) {
                this.endRaid(raid, false);
                this.activeRaids.splice(i, 1);
            }
        }
    }

    startRaid(village) {
        this.lastRaidTime = Date.now() / 1000;
        
        const playerAge = this.game.questManager?.currentAge || 'STONE_AGE';
        let raiderTypes = ['BANDIT'];
        let raiderCount = 3 + Math.floor(Math.random() * 4);
        
        // Scale raid based on age
        if (playerAge === 'INDUSTRIAL_AGE') {
            raiderTypes = ['REBEL_SOLDIER', 'FACTORY_DRONE'];
            raiderCount += 2;
        } else if (playerAge === 'MODERN_AGE') {
            raiderTypes = ['CYBER_SOLDIER', 'HACKER_DRONE'];
            raiderCount += 4;
        }
        
        const raid = {
            village,
            raiders: [],
            timer: 180, // 3 minutes
            wave: 1
        };
        
        // Spawn raiders
        for (let i = 0; i < raiderCount; i++) {
            const type = raiderTypes[Math.floor(Math.random() * raiderTypes.length)];
            const angle = (i / raiderCount) * Math.PI * 2;
            const dist = 15 + Math.random() * 5;
            
            const x = village.centerX + Math.cos(angle) * dist;
            const y = village.centerY + Math.sin(angle) * dist;
            const z = this.game.world.getHeight(Math.floor(x), Math.floor(y)) + 1;
            
            // Import Enemy dynamically to avoid circular dependency
            const enemy = this.createRaider(x, y, z, type);
            if (enemy) {
                raid.raiders.push(enemy);
                this.game.entities.push(enemy);
            }
        }
        
        this.activeRaids.push(raid);
        
        // Notify player
        this.game.ui?.showMessage(`⚔️ RAID! ${raiderCount} ${raiderTypes[0]}s attacking the village!`, 5000);
        this.game.audio.play('raid_horn');
        
        // Alert villagers
        if (this.game.villageSystem) {
            for (const villager of village.villagers) {
                if (!villager.isDead) {
                    villager.memory.lastThreat = { x: village.centerX, y: village.centerY, z: village.centerZ };
                    villager.memory.threatTimer = 180;
                    villager.setState('FLEEING');
                }
            }
        }
    }

    createRaider(x, y, z, typeKey) {
        // This would normally import Enemy, but we'll return a config that can be used
        // The actual instantiation should happen in the calling code
        return {
            spawn: { x, y, z, typeKey },
            _isRaiderConfig: true
        };
    }

    endRaid(raid, playerVictory) {
        if (playerVictory) {
            this.game.ui?.showMessage('🏆 Raid defeated! Village saved!', 3000);
            
            // Reputation gain
            if (this.game.villageSystem) {
                raid.village.reputation += 20;
            }
            
            // Bonus rewards
            const xpReward = 100 * raid.wave;
            this.game.player.gainXP(xpReward);
            
            // Quest progress
            if (this.game.questManager) {
                this.game.questManager.onRaidDefeated();
            }
        } else {
            this.game.ui?.showMessage('💀 The village was overrun...', 3000);
            
            // Reputation loss
            if (this.game.villageSystem) {
                raid.village.reputation -= 30;
            }
        }
    }
}
