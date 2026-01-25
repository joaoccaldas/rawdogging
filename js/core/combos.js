// Combat Combo System - Chain attacks for bonus damage
import { CONFIG } from '../config.js';

export const COMBO_DEFINITIONS = {
    // Basic combos
    QUICK_STRIKE: {
        id: 'quick_strike',
        name: 'Quick Strike',
        sequence: ['light', 'light', 'light'],
        damage_multiplier: 1.5,
        window: 1.0,
        icon: '⚡',
        description: 'Three quick attacks'
    },
    HEAVY_SLAM: {
        id: 'heavy_slam',
        name: 'Heavy Slam',
        sequence: ['heavy', 'heavy'],
        damage_multiplier: 2.0,
        window: 1.5,
        icon: '💥',
        description: 'Two powerful strikes'
    },
    SWIFT_ASSAULT: {
        id: 'swift_assault',
        name: 'Swift Assault',
        sequence: ['light', 'light', 'heavy'],
        damage_multiplier: 2.5,
        window: 1.2,
        icon: '🌪️',
        description: 'Two quick hits into a finisher'
    },
    CRUSHING_BLOW: {
        id: 'crushing_blow',
        name: 'Crushing Blow',
        sequence: ['heavy', 'light', 'heavy'],
        damage_multiplier: 3.0,
        window: 1.5,
        icon: '🔨',
        description: 'Devastating three-hit combo'
    },
    
    // Directional combos
    DASH_STRIKE: {
        id: 'dash_strike',
        name: 'Dash Strike',
        sequence: ['dodge', 'light'],
        damage_multiplier: 1.8,
        window: 0.8,
        icon: '💨',
        description: 'Dodge into a quick attack'
    },
    COUNTER_ATTACK: {
        id: 'counter_attack',
        name: 'Counter Attack',
        sequence: ['block', 'heavy'],
        damage_multiplier: 2.5,
        window: 1.0,
        icon: '🛡️',
        description: 'Block then punish'
    },
    
    // Advanced combos
    WHIRLWIND: {
        id: 'whirlwind',
        name: 'Whirlwind',
        sequence: ['light', 'light', 'light', 'heavy'],
        damage_multiplier: 3.5,
        window: 1.5,
        icon: '🌀',
        description: 'Spinning multi-hit attack',
        aoe: true,
        aoeRadius: 3
    },
    EXECUTION: {
        id: 'execution',
        name: 'Execution',
        sequence: ['heavy', 'heavy', 'heavy'],
        damage_multiplier: 4.0,
        window: 2.0,
        icon: '💀',
        description: 'Maximum damage finisher'
    },
    
    // Special combos (require specific weapons)
    SPEAR_THRUST: {
        id: 'spear_thrust',
        name: 'Spear Thrust',
        sequence: ['light', 'light', 'special'],
        damage_multiplier: 2.2,
        window: 1.0,
        icon: '🔱',
        description: 'Piercing spear combo',
        requiresWeapon: ['spear', 'wooden_spear']
    },
    BOW_BARRAGE: {
        id: 'bow_barrage',
        name: 'Bow Barrage',
        sequence: ['light', 'light', 'light', 'light'],
        damage_multiplier: 1.2, // Per arrow
        window: 2.0,
        icon: '🏹',
        description: 'Rapid arrow volley',
        requiresWeapon: ['bow'],
        multiHit: 4
    }
};

export const ATTACK_TYPES = {
    LIGHT: 'light',
    HEAVY: 'heavy',
    SPECIAL: 'special',
    DODGE: 'dodge',
    BLOCK: 'block'
};

export class ComboSystem {
    constructor(game) {
        this.game = game;
        
        // Current combo input buffer
        this.inputBuffer = [];
        
        // Time since last input
        this.inputTimer = 0;
        
        // Maximum time between inputs
        this.comboWindow = 1.0;
        
        // Active combo being performed
        this.activeCombo = null;
        
        // Combo cooldown
        this.comboCooldown = 0;
        
        // Stats
        this.combosPerformed = 0;
        this.highestCombo = 0;
        
        // Combo multiplier (increases with consecutive combos)
        this.comboStreak = 0;
        this.streakTimer = 0;
    }
    
    update(deltaTime) {
        // Update input timer
        this.inputTimer += deltaTime;
        
        // Clear buffer if too much time passed
        if (this.inputTimer > this.comboWindow && this.inputBuffer.length > 0) {
            this.inputBuffer = [];
            this.activeCombo = null;
        }
        
        // Update cooldown
        if (this.comboCooldown > 0) {
            this.comboCooldown -= deltaTime;
        }
        
        // Update streak timer
        if (this.streakTimer > 0) {
            this.streakTimer -= deltaTime;
            if (this.streakTimer <= 0) {
                this.comboStreak = 0;
            }
        }
    }
    
    // Register an attack input
    registerInput(attackType) {
        // Reset timer
        this.inputTimer = 0;
        
        // Add to buffer
        this.inputBuffer.push(attackType);
        
        // Limit buffer size
        if (this.inputBuffer.length > 5) {
            this.inputBuffer.shift();
        }
        
        // Check for matching combos
        return this.checkCombos();
    }
    
    // Check if current inputs match any combo
    checkCombos() {
        const weapon = this.game.player?.getEquippedWeapon?.();
        const weaponType = weapon?.type || 'default';
        
        for (const [key, combo] of Object.entries(COMBO_DEFINITIONS)) {
            // Check weapon requirement
            if (combo.requiresWeapon && !combo.requiresWeapon.includes(weaponType)) {
                continue;
            }
            
            // Check if buffer ends with combo sequence
            if (this.matchesSequence(combo.sequence)) {
                return this.executeCombo(combo);
            }
        }
        
        return null;
    }
    
    // Check if input buffer matches a sequence
    matchesSequence(sequence) {
        if (this.inputBuffer.length < sequence.length) return false;
        
        const bufferEnd = this.inputBuffer.slice(-sequence.length);
        for (let i = 0; i < sequence.length; i++) {
            if (bufferEnd[i] !== sequence[i]) return false;
        }
        
        return true;
    }
    
    // Execute a matched combo
    executeCombo(combo) {
        if (this.comboCooldown > 0) return null;
        
        this.activeCombo = combo;
        
        // Clear input buffer
        this.inputBuffer = [];
        
        // Calculate damage
        let damage = this.calculateComboDamage(combo);
        
        // Update stats
        this.combosPerformed++;
        this.comboStreak++;
        this.streakTimer = 3.0; // Reset streak timer
        
        if (this.comboStreak > this.highestCombo) {
            this.highestCombo = this.comboStreak;
        }
        
        // Set cooldown based on combo
        this.comboCooldown = combo.sequence.length * 0.2;
        
        // Show combo notification
        this.game.ui?.showMessage(
            `${combo.icon} ${combo.name}! (${this.comboStreak}x streak)`,
            2000
        );
        
        // Apply AOE damage if applicable
        if (combo.aoe) {
            this.applyAOEDamage(damage, combo.aoeRadius);
        }
        
        // Trigger combo effect
        this.triggerComboEffect(combo);
        
        return {
            combo: combo,
            damage: damage,
            streak: this.comboStreak
        };
    }
    
    // Calculate combo damage
    calculateComboDamage(combo) {
        const player = this.game.player;
        if (!player) return 0;
        
        let baseDamage = player.getAttackDamage?.() || player.attack || 10;
        
        // Apply combo multiplier
        let damage = baseDamage * combo.damage_multiplier;
        
        // Apply streak bonus (5% per streak)
        damage *= 1 + (this.comboStreak * 0.05);
        
        // Apply multi-hit
        if (combo.multiHit) {
            damage *= combo.multiHit;
        }
        
        return Math.floor(damage);
    }
    
    // Apply AOE damage around player
    applyAOEDamage(damage, radius) {
        const player = this.game.player;
        if (!player) return;
        
        const entities = this.game.entities || [];
        
        for (const entity of entities) {
            if (entity === player || entity.tamed || entity.friendly) continue;
            
            const dx = entity.x - player.x;
            const dy = entity.y - player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist <= radius) {
                // Damage falls off with distance
                const falloff = 1 - (dist / radius) * 0.5;
                entity.takeDamage?.(Math.floor(damage * falloff));
            }
        }
    }
    
    // Trigger visual/audio effects for combo
    triggerComboEffect(combo) {
        const player = this.game.player;
        if (!player) return;
        
        // Spawn particles
        if (this.game.particles) {
            const colors = ['#FFD700', '#FF6600', '#FF0000'];
            for (let i = 0; i < 10; i++) {
                this.game.particles.spawn(
                    player.x,
                    player.y,
                    player.z + 1,
                    {
                        type: 'spark',
                        color: colors[Math.floor(Math.random() * colors.length)],
                        lifetime: 0.5,
                        velocity: {
                            x: (Math.random() - 0.5) * 5,
                            y: (Math.random() - 0.5) * 5,
                            z: Math.random() * 3
                        }
                    }
                );
            }
        }
        
        // Screen shake for heavy combos
        if (combo.damage_multiplier >= 2.5) {
            this.game.camera?.shake?.(0.2, 5);
        }
    }
    
    // Get available combos for current weapon
    getAvailableCombos() {
        const weapon = this.game.player?.getEquippedWeapon?.();
        const weaponType = weapon?.type || 'default';
        
        return Object.values(COMBO_DEFINITIONS).filter(combo => {
            if (!combo.requiresWeapon) return true;
            return combo.requiresWeapon.includes(weaponType);
        });
    }
    
    // Get current input progress toward any combo
    getComboProgress() {
        if (this.inputBuffer.length === 0) return [];
        
        const progress = [];
        const weapon = this.game.player?.getEquippedWeapon?.();
        const weaponType = weapon?.type || 'default';
        
        for (const combo of Object.values(COMBO_DEFINITIONS)) {
            if (combo.requiresWeapon && !combo.requiresWeapon.includes(weaponType)) {
                continue;
            }
            
            // Check how much of the combo is matched
            let matched = 0;
            for (let i = 0; i < Math.min(this.inputBuffer.length, combo.sequence.length); i++) {
                if (this.inputBuffer[i] === combo.sequence[i]) {
                    matched++;
                } else {
                    break;
                }
            }
            
            if (matched > 0 && matched < combo.sequence.length) {
                progress.push({
                    combo: combo,
                    progress: matched,
                    total: combo.sequence.length,
                    nextInput: combo.sequence[matched]
                });
            }
        }
        
        return progress;
    }
    
    // Reset combo state
    resetCombo() {
        this.inputBuffer = [];
        this.activeCombo = null;
        this.inputTimer = 0;
    }
    
    // Serialize
    serialize() {
        return {
            combosPerformed: this.combosPerformed,
            highestCombo: this.highestCombo
        };
    }
    
    deserialize(data) {
        if (data) {
            this.combosPerformed = data.combosPerformed || 0;
            this.highestCombo = data.highestCombo || 0;
        }
    }
    
    reset() {
        this.inputBuffer = [];
        this.inputTimer = 0;
        this.activeCombo = null;
        this.comboCooldown = 0;
        this.comboStreak = 0;
        this.streakTimer = 0;
    }
}
