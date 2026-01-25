// Tool Enchantments System - Add magical properties to tools and weapons
import { CONFIG } from '../config.js';

export const ENCHANTMENT_TYPES = {
    // Weapon enchantments
    FIRE_ASPECT: {
        id: 'fire_aspect',
        name: 'Fire Aspect',
        icon: '🔥',
        maxLevel: 3,
        category: 'weapon',
        description: 'Sets targets on fire',
        effect: { type: 'burning', durationPerLevel: 3 }
    },
    FROST_BITE: {
        id: 'frost_bite',
        name: 'Frost Bite',
        icon: '❄️',
        maxLevel: 3,
        category: 'weapon',
        description: 'Slows targets',
        effect: { type: 'frozen', durationPerLevel: 2 }
    },
    LIFESTEAL: {
        id: 'lifesteal',
        name: 'Lifesteal',
        icon: '💉',
        maxLevel: 5,
        category: 'weapon',
        description: 'Heals on hit',
        effect: { type: 'heal', percentPerLevel: 5 }
    },
    SHARPNESS: {
        id: 'sharpness',
        name: 'Sharpness',
        icon: '⚔️',
        maxLevel: 5,
        category: 'weapon',
        description: 'Increases damage',
        effect: { type: 'damage', bonusPerLevel: 2 }
    },
    KNOCKBACK: {
        id: 'knockback',
        name: 'Knockback',
        icon: '💨',
        maxLevel: 2,
        category: 'weapon',
        description: 'Pushes targets back',
        effect: { type: 'knockback', forcePerLevel: 3 }
    },
    VENOMOUS: {
        id: 'venomous',
        name: 'Venomous',
        icon: '🐍',
        maxLevel: 3,
        category: 'weapon',
        description: 'Poisons targets',
        effect: { type: 'poison', durationPerLevel: 4 }
    },
    BLEEDING: {
        id: 'bleeding',
        name: 'Bleeding',
        icon: '🩸',
        maxLevel: 3,
        category: 'weapon',
        description: 'Causes bleeding damage',
        effect: { type: 'bleeding', durationPerLevel: 3 }
    },
    THUNDERSTRIKE: {
        id: 'thunderstrike',
        name: 'Thunderstrike',
        icon: '⚡',
        maxLevel: 2,
        category: 'weapon',
        description: 'Chance to strike with lightning',
        effect: { type: 'lightning', chancePerLevel: 10, damage: 15 }
    },
    
    // Tool enchantments
    EFFICIENCY: {
        id: 'efficiency',
        name: 'Efficiency',
        icon: '⚡',
        maxLevel: 5,
        category: 'tool',
        description: 'Faster harvesting',
        effect: { type: 'speed', bonusPerLevel: 20 }
    },
    FORTUNE: {
        id: 'fortune',
        name: 'Fortune',
        icon: '🍀',
        maxLevel: 3,
        category: 'tool',
        description: 'More drops',
        effect: { type: 'loot', bonusPerLevel: 33 }
    },
    UNBREAKING: {
        id: 'unbreaking',
        name: 'Unbreaking',
        icon: '🛡️',
        maxLevel: 3,
        category: 'tool',
        description: 'Increased durability',
        effect: { type: 'durability', bonusPerLevel: 50 }
    },
    SILK_TOUCH: {
        id: 'silk_touch',
        name: 'Silk Touch',
        icon: '🕸️',
        maxLevel: 1,
        category: 'tool',
        description: 'Drops blocks intact',
        effect: { type: 'silk_touch' }
    },
    AUTO_SMELT: {
        id: 'auto_smelt',
        name: 'Auto Smelt',
        icon: '🔥',
        maxLevel: 1,
        category: 'tool',
        description: 'Automatically smelts ores',
        effect: { type: 'auto_smelt' }
    },
    
    // Armor enchantments
    PROTECTION: {
        id: 'protection',
        name: 'Protection',
        icon: '🛡️',
        maxLevel: 4,
        category: 'armor',
        description: 'Reduces damage taken',
        effect: { type: 'defense', bonusPerLevel: 4 }
    },
    FIRE_PROTECTION: {
        id: 'fire_protection',
        name: 'Fire Protection',
        icon: '🔥',
        maxLevel: 4,
        category: 'armor',
        description: 'Reduces fire damage',
        effect: { type: 'fire_resist', bonusPerLevel: 8 }
    },
    FROST_PROTECTION: {
        id: 'frost_protection',
        name: 'Frost Protection',
        icon: '❄️',
        maxLevel: 4,
        category: 'armor',
        description: 'Reduces cold damage',
        effect: { type: 'cold_resist', bonusPerLevel: 8 }
    },
    THORNS: {
        id: 'thorns',
        name: 'Thorns',
        icon: '🌵',
        maxLevel: 3,
        category: 'armor',
        description: 'Damages attackers',
        effect: { type: 'reflect', damagePerLevel: 2 }
    },
    REGENERATION: {
        id: 'regeneration',
        name: 'Regeneration',
        icon: '💚',
        maxLevel: 2,
        category: 'armor',
        description: 'Slowly heals over time',
        effect: { type: 'regen', healPerLevel: 1, interval: 5 }
    },
    SWIFTNESS: {
        id: 'swiftness',
        name: 'Swiftness',
        icon: '👟',
        maxLevel: 3,
        category: 'armor',
        description: 'Increases movement speed',
        effect: { type: 'speed', bonusPerLevel: 5 }
    }
};

export const ENCHANTMENT_RARITY = {
    COMMON: { weight: 50, color: '#AAAAAA', maxEnchants: 1 },
    UNCOMMON: { weight: 30, color: '#55FF55', maxEnchants: 2 },
    RARE: { weight: 15, color: '#5555FF', maxEnchants: 3 },
    EPIC: { weight: 4, color: '#AA00AA', maxEnchants: 4 },
    LEGENDARY: { weight: 1, color: '#FFAA00', maxEnchants: 5 }
};

class Enchantment {
    constructor(typeId, level = 1) {
        const type = ENCHANTMENT_TYPES[typeId.toUpperCase()] || 
                    Object.values(ENCHANTMENT_TYPES).find(e => e.id === typeId);
        
        if (!type) {
            throw new Error(`Unknown enchantment: ${typeId}`);
        }
        
        this.id = type.id;
        this.name = type.name;
        this.icon = type.icon;
        this.category = type.category;
        this.description = type.description;
        this.effect = type.effect;
        this.maxLevel = type.maxLevel;
        this.level = Math.min(level, type.maxLevel);
    }
    
    // Get effect value for current level
    getEffectValue(key) {
        if (!this.effect[key]) return 0;
        return this.effect[key] * this.level;
    }
    
    // Get display string
    getDisplayString() {
        const numerals = ['I', 'II', 'III', 'IV', 'V'];
        const levelStr = this.level <= 5 ? numerals[this.level - 1] : this.level;
        return `${this.icon} ${this.name} ${levelStr}`;
    }
    
    serialize() {
        return {
            id: this.id,
            level: this.level
        };
    }
    
    static deserialize(data) {
        return new Enchantment(data.id, data.level);
    }
}

export class EnchantmentSystem {
    constructor(game) {
        this.game = game;
        
        // Enchanted items registry
        this.enchantedItems = new Map();
        
        // Enchanting costs
        this.baseCost = { experience: 10, materials: ['crystal', 'ancient_dust'] };
    }
    
    // Apply enchantment to item
    enchantItem(itemId, enchantmentId, level = 1) {
        const enchantment = new Enchantment(enchantmentId, level);
        
        // Get or create item enchantments
        if (!this.enchantedItems.has(itemId)) {
            this.enchantedItems.set(itemId, []);
        }
        
        const enchants = this.enchantedItems.get(itemId);
        
        // Check for existing enchantment of same type
        const existingIndex = enchants.findIndex(e => e.id === enchantment.id);
        if (existingIndex >= 0) {
            // Upgrade if new level is higher
            if (level > enchants[existingIndex].level) {
                enchants[existingIndex] = enchantment;
            }
        } else {
            enchants.push(enchantment);
        }
        
        this.game.ui?.showMessage(
            `✨ Applied ${enchantment.getDisplayString()} to item!`,
            2000
        );
        
        return enchantment;
    }
    
    // Remove enchantment from item
    removeEnchantment(itemId, enchantmentId) {
        const enchants = this.enchantedItems.get(itemId);
        if (!enchants) return false;
        
        const index = enchants.findIndex(e => e.id === enchantmentId);
        if (index >= 0) {
            enchants.splice(index, 1);
            return true;
        }
        return false;
    }
    
    // Get all enchantments on item
    getItemEnchantments(itemId) {
        return this.enchantedItems.get(itemId) || [];
    }
    
    // Check if item has specific enchantment
    hasEnchantment(itemId, enchantmentId) {
        const enchants = this.enchantedItems.get(itemId);
        if (!enchants) return false;
        return enchants.some(e => e.id === enchantmentId);
    }
    
    // Get enchantment level on item
    getEnchantmentLevel(itemId, enchantmentId) {
        const enchants = this.enchantedItems.get(itemId);
        if (!enchants) return 0;
        
        const enchant = enchants.find(e => e.id === enchantmentId);
        return enchant ? enchant.level : 0;
    }
    
    // Calculate total bonus from enchantment type
    getTotalBonus(itemId, effectType) {
        const enchants = this.getItemEnchantments(itemId);
        let total = 0;
        
        for (const enchant of enchants) {
            if (enchant.effect.type === effectType) {
                // Find the per-level key
                for (const [key, value] of Object.entries(enchant.effect)) {
                    if (key.includes('PerLevel') || key.includes('perLevel')) {
                        total += value * enchant.level;
                    }
                }
            }
        }
        
        return total;
    }
    
    // Apply weapon enchantment effects on hit
    applyWeaponEffects(itemId, target, baseDamage) {
        const enchants = this.getItemEnchantments(itemId);
        let totalDamage = baseDamage;
        
        for (const enchant of enchants) {
            if (enchant.category !== 'weapon') continue;
            
            switch (enchant.effect.type) {
                case 'damage':
                    totalDamage += enchant.getEffectValue('bonusPerLevel');
                    break;
                    
                case 'burning':
                    this.game.statusEffects?.applyToEntity?.(
                        target, 'burning',
                        enchant.getEffectValue('durationPerLevel')
                    );
                    break;
                    
                case 'frozen':
                    this.game.statusEffects?.applyToEntity?.(
                        target, 'frozen',
                        enchant.getEffectValue('durationPerLevel')
                    );
                    break;
                    
                case 'poison':
                    this.game.statusEffects?.applyToEntity?.(
                        target, 'poison',
                        enchant.getEffectValue('durationPerLevel')
                    );
                    break;
                    
                case 'bleeding':
                    this.game.statusEffects?.applyToEntity?.(
                        target, 'bleeding',
                        enchant.getEffectValue('durationPerLevel')
                    );
                    break;
                    
                case 'heal':
                    const healAmount = Math.floor(baseDamage * enchant.getEffectValue('percentPerLevel') / 100);
                    this.game.player?.heal?.(healAmount);
                    break;
                    
                case 'knockback':
                    const force = enchant.getEffectValue('forcePerLevel');
                    const player = this.game.player;
                    if (player && target) {
                        const dx = target.x - player.x;
                        const dy = target.y - player.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist > 0) {
                            target.vx = (target.vx || 0) + (dx / dist) * force;
                            target.vy = (target.vy || 0) + (dy / dist) * force;
                        }
                    }
                    break;
                    
                case 'lightning':
                    const chance = enchant.getEffectValue('chancePerLevel');
                    if (Math.random() * 100 < chance) {
                        target.takeDamage?.(enchant.effect.damage);
                        this.spawnLightningEffect(target.x, target.y, target.z);
                    }
                    break;
            }
        }
        
        return totalDamage;
    }
    
    // Apply tool enchantment effects
    applyToolEffects(itemId, action, result) {
        const enchants = this.getItemEnchantments(itemId);
        
        for (const enchant of enchants) {
            if (enchant.category !== 'tool') continue;
            
            switch (enchant.effect.type) {
                case 'speed':
                    result.speedBonus = (result.speedBonus || 0) + enchant.getEffectValue('bonusPerLevel');
                    break;
                    
                case 'loot':
                    result.lootMultiplier = (result.lootMultiplier || 1) + enchant.getEffectValue('bonusPerLevel') / 100;
                    break;
                    
                case 'durability':
                    result.durabilityMultiplier = (result.durabilityMultiplier || 1) + enchant.getEffectValue('bonusPerLevel') / 100;
                    break;
                    
                case 'silk_touch':
                    result.silkTouch = true;
                    break;
                    
                case 'auto_smelt':
                    result.autoSmelt = true;
                    break;
            }
        }
        
        return result;
    }
    
    // Get armor bonus from enchantments
    getArmorBonus(armorItemIds) {
        const bonuses = {
            defense: 0,
            fireResist: 0,
            coldResist: 0,
            reflect: 0,
            regen: 0,
            regenInterval: Infinity,
            speed: 0
        };
        
        for (const itemId of armorItemIds) {
            const enchants = this.getItemEnchantments(itemId);
            
            for (const enchant of enchants) {
                if (enchant.category !== 'armor') continue;
                
                switch (enchant.effect.type) {
                    case 'defense':
                        bonuses.defense += enchant.getEffectValue('bonusPerLevel');
                        break;
                    case 'fire_resist':
                        bonuses.fireResist += enchant.getEffectValue('bonusPerLevel');
                        break;
                    case 'cold_resist':
                        bonuses.coldResist += enchant.getEffectValue('bonusPerLevel');
                        break;
                    case 'reflect':
                        bonuses.reflect += enchant.getEffectValue('damagePerLevel');
                        break;
                    case 'regen':
                        bonuses.regen += enchant.getEffectValue('healPerLevel');
                        bonuses.regenInterval = Math.min(bonuses.regenInterval, enchant.effect.interval);
                        break;
                    case 'speed':
                        bonuses.speed += enchant.getEffectValue('bonusPerLevel');
                        break;
                }
            }
        }
        
        return bonuses;
    }
    
    // Generate random enchantment
    generateRandomEnchantment(category = null, rarity = 'common') {
        const availableEnchants = Object.values(ENCHANTMENT_TYPES).filter(e => 
            !category || e.category === category
        );
        
        if (availableEnchants.length === 0) return null;
        
        const type = availableEnchants[Math.floor(Math.random() * availableEnchants.length)];
        
        // Determine level based on rarity
        const rarityInfo = ENCHANTMENT_RARITY[rarity.toUpperCase()] || ENCHANTMENT_RARITY.COMMON;
        const maxLevel = Math.min(type.maxLevel, rarityInfo.maxEnchants);
        const level = Math.floor(Math.random() * maxLevel) + 1;
        
        return new Enchantment(type.id, level);
    }
    
    // Spawn lightning visual effect
    spawnLightningEffect(x, y, z) {
        if (!this.game.particles) return;
        
        for (let i = 0; i < 15; i++) {
            this.game.particles.spawn(x, y, z + Math.random() * 2, {
                type: 'spark',
                color: '#FFFFFF',
                lifetime: 0.3,
                velocity: {
                    x: (Math.random() - 0.5) * 4,
                    y: (Math.random() - 0.5) * 4,
                    z: Math.random() * 3
                }
            });
        }
    }
    
    // Render enchantment glow on item slot
    renderItemGlow(ctx, x, y, width, height, itemId) {
        const enchants = this.getItemEnchantments(itemId);
        if (enchants.length === 0) return;
        
        // Determine glow color based on highest tier enchantment
        let glowColor = '#AAAAAA'; // Common
        let highestTier = 'common';
        
        for (const enchant of enchants) {
            const level = enchant.level;
            if (level >= 4) {
                glowColor = '#FFAA00'; // Legendary
                highestTier = 'legendary';
                break;
            } else if (level >= 3 && highestTier !== 'legendary') {
                glowColor = '#AA00AA'; // Epic
                highestTier = 'epic';
            } else if (level >= 2 && highestTier !== 'epic' && highestTier !== 'legendary') {
                glowColor = '#5555FF'; // Rare
                highestTier = 'rare';
            } else if (highestTier === 'common') {
                glowColor = '#55FF55'; // Uncommon
                highestTier = 'uncommon';
            }
        }
        
        // Animated shimmer
        const time = Date.now() / 1000;
        const shimmer = 0.4 + Math.sin(time * 3) * 0.2;
        
        ctx.save();
        
        // Outer glow
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 8 + Math.sin(time * 2) * 3;
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 2;
        ctx.globalAlpha = shimmer;
        ctx.strokeRect(x - 1, y - 1, width + 2, height + 2);
        
        // Inner shimmer effect
        ctx.globalAlpha = shimmer * 0.3;
        const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.5, glowColor);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width, height);
        
        ctx.restore();
        
        // Enchantment count indicator
        if (enchants.length > 1) {
            ctx.save();
            ctx.fillStyle = glowColor;
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(`✦${enchants.length}`, x + width - 2, y + 10);
            ctx.restore();
        }
    }
    
    // Render enchantment tooltip
    renderEnchantmentTooltip(ctx, x, y, itemId) {
        const enchants = this.getItemEnchantments(itemId);
        if (enchants.length === 0) return 0;
        
        ctx.save();
        ctx.font = '11px Courier New';
        
        let offsetY = 0;
        for (const enchant of enchants) {
            // Get color based on level
            const colors = ['#AAAAAA', '#55FF55', '#5555FF', '#AA00AA', '#FFAA00'];
            ctx.fillStyle = colors[Math.min(enchant.level - 1, 4)];
            ctx.fillText(enchant.getDisplayString(), x, y + offsetY);
            offsetY += 14;
        }
        
        ctx.restore();
        return offsetY;
    }
    
    // Render wielded weapon enchant particles
    renderWieldedEnchantments(ctx, player) {
        const heldItem = player.getHeldItem?.();
        if (!heldItem) return;
        
        const enchants = this.getItemEnchantments(heldItem.id);
        if (enchants.length === 0) return;
        
        // Spawn occasional particles based on enchantment type
        if (Math.random() < 0.05) {
            for (const enchant of enchants) {
                let particleColor = '#FFFFFF';
                
                switch (enchant.effect.type) {
                    case 'burning': particleColor = '#FF4500'; break;
                    case 'frozen': particleColor = '#00BFFF'; break;
                    case 'poison': particleColor = '#00FF00'; break;
                    case 'lightning': particleColor = '#FFFF00'; break;
                    case 'heal': particleColor = '#FF69B4'; break;
                    case 'damage': particleColor = '#FF0000'; break;
                }
                
                const offsetX = (Math.random() - 0.5) * 0.5;
                const offsetY = (Math.random() - 0.5) * 0.5;
                
                this.game.particles?.spawn?.(
                    player.x + offsetX,
                    player.y + offsetY,
                    player.z + 1 + Math.random() * 0.5,
                    {
                        type: 'spark',
                        color: particleColor,
                        lifetime: 0.5,
                        velocity: {
                            x: (Math.random() - 0.5) * 0.5,
                            y: (Math.random() - 0.5) * 0.5,
                            z: 0.5 + Math.random() * 0.5
                        }
                    }
                );
            }
        }
    }
    
    // Update method for continuous effects
    update(deltaTime) {
        // Render particles for player's equipped enchantments
        if (this.game.player) {
            this.renderWieldedEnchantments(null, this.game.player);
        }
    }
    
    // Get enchantments by category for UI
    getEnchantmentsByCategory(category) {
        return Object.values(ENCHANTMENT_TYPES).filter(e => e.category === category);
    }
    
    // Can enchant check
    canEnchant(itemId, enchantmentId) {
        const enchants = this.getItemEnchantments(itemId);
        const enchantType = ENCHANTMENT_TYPES[enchantmentId.toUpperCase()] ||
                          Object.values(ENCHANTMENT_TYPES).find(e => e.id === enchantmentId);
        
        if (!enchantType) return false;
        
        // Check if already has max enchantments
        if (enchants.length >= 5) return false;
        
        // Check for incompatible enchantments
        // (could add logic for mutually exclusive enchants)
        
        return true;
    }
    
    // Serialize
    serialize() {
        const items = {};
        for (const [itemId, enchants] of this.enchantedItems.entries()) {
            items[itemId] = enchants.map(e => e.serialize());
        }
        return { enchantedItems: items };
    }
    
    deserialize(data) {
        if (data?.enchantedItems) {
            this.enchantedItems.clear();
            for (const [itemId, enchants] of Object.entries(data.enchantedItems)) {
                this.enchantedItems.set(
                    itemId,
                    enchants.map(e => Enchantment.deserialize(e))
                );
            }
        }
    }
    
    reset() {
        this.enchantedItems.clear();
    }
}
