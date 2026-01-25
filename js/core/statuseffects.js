// Status Effects System - Poison, burning, frozen, bleeding, etc.
import { CONFIG } from '../config.js';

export const STATUS_EFFECTS = {
    POISON: {
        name: 'Poisoned',
        icon: '☠️',
        color: '#00ff00',
        damagePerSecond: 2,
        duration: 10,
        stackable: true,
        maxStacks: 3,
        canCleanse: true,
        cleansedBy: ['antidote', 'milk']
    },
    BURNING: {
        name: 'Burning',
        icon: '🔥',
        color: '#ff4400',
        damagePerSecond: 3,
        duration: 5,
        stackable: false,
        canCleanse: true,
        cleansedBy: ['water', 'roll'], // Water block or dodge roll
        extinguishedByRain: true
    },
    FROZEN: {
        name: 'Frozen',
        icon: '🥶',
        color: '#00ccff',
        damagePerSecond: 1,
        duration: 8,
        stackable: false,
        slowAmount: 0.5, // 50% slower
        canCleanse: true,
        cleansedBy: ['fire', 'warmth']
    },
    BLEEDING: {
        name: 'Bleeding',
        icon: '🩸',
        color: '#cc0000',
        damagePerSecond: 1.5,
        duration: 6,
        stackable: true,
        maxStacks: 5,
        canCleanse: true,
        cleansedBy: ['bandage', 'heal']
    },
    STUNNED: {
        name: 'Stunned',
        icon: '💫',
        color: '#ffff00',
        damagePerSecond: 0,
        duration: 2,
        stackable: false,
        preventMovement: true,
        preventAttack: true
    },
    SLOWED: {
        name: 'Slowed',
        icon: '🐌',
        color: '#8888ff',
        damagePerSecond: 0,
        duration: 4,
        stackable: false,
        slowAmount: 0.6
    },
    WEAKNESS: {
        name: 'Weakened',
        icon: '💔',
        color: '#888888',
        damagePerSecond: 0,
        duration: 10,
        stackable: false,
        damageReduction: 0.5 // Deal 50% less damage
    },
    REGENERATION: {
        name: 'Regenerating',
        icon: '💚',
        color: '#00ff88',
        healPerSecond: 3,
        duration: 10,
        stackable: false,
        isBuff: true
    },
    STRENGTH: {
        name: 'Strengthened',
        icon: '💪',
        color: '#ff8800',
        duration: 30,
        stackable: false,
        damageBonus: 1.5, // 50% more damage
        isBuff: true
    },
    SPEED: {
        name: 'Speed Boost',
        icon: '⚡',
        color: '#ffff00',
        duration: 15,
        stackable: false,
        speedBonus: 1.4, // 40% faster
        isBuff: true
    },
    INVISIBLE: {
        name: 'Invisible',
        icon: '👻',
        color: '#ccccff',
        duration: 20,
        stackable: false,
        invisible: true,
        isBuff: true
    },
    RAGE: {
        name: 'Enraged',
        icon: '😡',
        color: '#ff0000',
        duration: 10,
        stackable: false,
        damageBonus: 2.0,
        damageTakenBonus: 1.3, // Take 30% more damage
        isBuff: true
    }
};

// Active effect instance
class ActiveEffect {
    constructor(type, source = null, stacks = 1) {
        this.type = type;
        this.config = STATUS_EFFECTS[type];
        this.source = source;
        this.stacks = stacks;
        this.remainingTime = this.config.duration;
        this.tickTimer = 0;
    }
    
    update(deltaTime, target) {
        this.remainingTime -= deltaTime;
        this.tickTimer += deltaTime;
        
        // Apply damage/heal every second
        if (this.tickTimer >= 1) {
            this.tickTimer -= 1;
            
            // Damage
            if (this.config.damagePerSecond) {
                const damage = this.config.damagePerSecond * this.stacks;
                if (typeof target.takeDamage === 'function') {
                    target.takeDamage(damage, this.type.toLowerCase());
                } else if (target.health !== undefined) {
                    target.health -= damage;
                }
            }
            
            // Heal
            if (this.config.healPerSecond) {
                const heal = this.config.healPerSecond * this.stacks;
                target.health = Math.min(target.maxHealth || 100, target.health + heal);
            }
        }
        
        return this.remainingTime > 0;
    }
    
    addStack() {
        if (this.config.stackable && this.stacks < (this.config.maxStacks || 99)) {
            this.stacks++;
            this.remainingTime = this.config.duration; // Refresh duration
        }
    }
}

export class StatusEffectSystem {
    constructor(game) {
        this.game = game;
        
        // Active effects on player
        this.playerEffects = new Map();
        
        // Effects on entities (enemies, pets)
        this.entityEffects = new Map(); // entity -> Map<type, ActiveEffect>
    }
    
    update(deltaTime) {
        const player = this.game.player;
        if (!player) return;
        
        // Update player effects
        this.updateEffects(this.playerEffects, player, deltaTime);
        
        // Apply modifiers to player
        this.applyPlayerModifiers(player);
        
        // Update entity effects
        for (const [entity, effects] of this.entityEffects) {
            if (!entity.alive && entity.alive !== undefined) {
                this.entityEffects.delete(entity);
                continue;
            }
            this.updateEffects(effects, entity, deltaTime);
        }
        
        // Check for rain extinguishing fire
        if (this.game.weather?.currentWeather?.extinguishesFire) {
            if (this.playerEffects.has('BURNING')) {
                this.removeEffect('BURNING');
                this.game.ui?.showMessage('🌧️ Rain extinguished the fire!', 2000);
            }
        }
    }
    
    updateEffects(effectsMap, target, deltaTime) {
        for (const [type, effect] of effectsMap) {
            const stillActive = effect.update(deltaTime, target);
            if (!stillActive) {
                effectsMap.delete(type);
            }
        }
    }
    
    applyPlayerModifiers(player) {
        // Reset modifiers
        let speedMult = 1;
        let damageMult = 1;
        let damageTakenMult = 1;
        let canMove = true;
        let canAttack = true;
        let isInvisible = false;
        
        for (const [type, effect] of this.playerEffects) {
            const config = effect.config;
            
            if (config.slowAmount) {
                speedMult *= config.slowAmount;
            }
            if (config.speedBonus) {
                speedMult *= config.speedBonus;
            }
            if (config.damageBonus) {
                damageMult *= config.damageBonus;
            }
            if (config.damageReduction) {
                damageMult *= config.damageReduction;
            }
            if (config.damageTakenBonus) {
                damageTakenMult *= config.damageTakenBonus;
            }
            if (config.preventMovement) {
                canMove = false;
            }
            if (config.preventAttack) {
                canAttack = false;
            }
            if (config.invisible) {
                isInvisible = true;
            }
        }
        
        // Apply to player
        player.statusSpeedMult = speedMult;
        player.statusDamageMult = damageMult;
        player.statusDamageTakenMult = damageTakenMult;
        player.statusCanMove = canMove;
        player.statusCanAttack = canAttack;
        player.statusInvisible = isInvisible;
    }
    
    // Apply effect to player
    applyToPlayer(type, source = null) {
        if (!STATUS_EFFECTS[type]) return;
        
        if (this.playerEffects.has(type)) {
            this.playerEffects.get(type).addStack();
        } else {
            this.playerEffects.set(type, new ActiveEffect(type, source));
            
            const config = STATUS_EFFECTS[type];
            const prefix = config.isBuff ? '✨' : '⚠️';
            this.game.ui?.showMessage(`${prefix} ${config.icon} ${config.name}!`, 2000);
        }
    }
    
    // Apply effect to entity
    applyToEntity(entity, type, source = null) {
        if (!STATUS_EFFECTS[type] || !entity) return;
        
        if (!this.entityEffects.has(entity)) {
            this.entityEffects.set(entity, new Map());
        }
        
        const effects = this.entityEffects.get(entity);
        if (effects.has(type)) {
            effects.get(type).addStack();
        } else {
            effects.set(type, new ActiveEffect(type, source));
        }
    }
    
    // Remove effect from player
    removeEffect(type) {
        this.playerEffects.delete(type);
    }
    
    // Remove effect from entity
    removeEntityEffect(entity, type) {
        if (this.entityEffects.has(entity)) {
            this.entityEffects.get(entity).delete(type);
        }
    }
    
    // Cleanse effect with item
    cleanse(cleanserId) {
        for (const [type, effect] of this.playerEffects) {
            if (effect.config.canCleanse && effect.config.cleansedBy?.includes(cleanserId)) {
                this.playerEffects.delete(type);
                this.game.ui?.showMessage(`💊 Cleansed ${effect.config.name}!`, 2000);
            }
        }
    }
    
    // Check if player has effect
    hasEffect(type) {
        return this.playerEffects.has(type);
    }
    
    // Get active player effects for UI
    getActiveEffects() {
        return Array.from(this.playerEffects.entries()).map(([type, effect]) => ({
            type,
            icon: effect.config.icon,
            name: effect.config.name,
            color: effect.config.color,
            remaining: Math.ceil(effect.remainingTime),
            stacks: effect.stacks,
            isBuff: effect.config.isBuff
        }));
    }
    
    // Clear all debuffs
    clearDebuffs() {
        for (const [type, effect] of this.playerEffects) {
            if (!effect.config.isBuff) {
                this.playerEffects.delete(type);
            }
        }
    }
    
    // Clear all effects
    clearAll() {
        this.playerEffects.clear();
    }
    
    // Serialize for save
    serialize() {
        const effects = [];
        for (const [type, effect] of this.playerEffects) {
            effects.push({
                type,
                stacks: effect.stacks,
                remainingTime: effect.remainingTime
            });
        }
        return { effects };
    }
    
    deserialize(data) {
        this.playerEffects.clear();
        if (!data?.effects) return;
        
        for (const e of data.effects) {
            const effect = new ActiveEffect(e.type, null, e.stacks);
            effect.remainingTime = e.remainingTime;
            this.playerEffects.set(e.type, effect);
        }
    }
    
    reset() {
        this.playerEffects.clear();
        this.entityEffects.clear();
    }
}
