// Loot Tables - Weighted random drops with rarity tiers
import { CONFIG } from '../config.js';

export const RARITY = {
    COMMON: {
        id: 'common',
        name: 'Common',
        color: '#AAAAAA',
        weight: 60,
        dropMultiplier: 1.0
    },
    UNCOMMON: {
        id: 'uncommon',
        name: 'Uncommon',
        color: '#55FF55',
        weight: 25,
        dropMultiplier: 1.2
    },
    RARE: {
        id: 'rare',
        name: 'Rare',
        color: '#5555FF',
        weight: 10,
        dropMultiplier: 1.5
    },
    EPIC: {
        id: 'epic',
        name: 'Epic',
        color: '#AA00AA',
        weight: 4,
        dropMultiplier: 2.0
    },
    LEGENDARY: {
        id: 'legendary',
        name: 'Legendary',
        color: '#FFAA00',
        weight: 1,
        dropMultiplier: 3.0
    }
};

// Loot tables for different sources
export const LOOT_TABLES = {
    // Enemy drops
    ENEMY_BASIC: {
        id: 'enemy_basic',
        name: 'Basic Enemy',
        drops: [
            { item: 'meat', quantity: [1, 2], weight: 40, rarity: 'common' },
            { item: 'bone', quantity: [1, 3], weight: 30, rarity: 'common' },
            { item: 'hide', quantity: [0, 2], weight: 20, rarity: 'uncommon' },
            { item: 'tooth', quantity: [1, 1], weight: 10, rarity: 'rare' }
        ]
    },
    ENEMY_PREDATOR: {
        id: 'enemy_predator',
        name: 'Predator',
        drops: [
            { item: 'meat', quantity: [2, 4], weight: 35, rarity: 'common' },
            { item: 'bone', quantity: [2, 5], weight: 25, rarity: 'common' },
            { item: 'fur', quantity: [1, 3], weight: 20, rarity: 'uncommon' },
            { item: 'claw', quantity: [1, 2], weight: 15, rarity: 'rare' },
            { item: 'fang', quantity: [1, 1], weight: 5, rarity: 'epic' }
        ]
    },
    ENEMY_BOSS: {
        id: 'enemy_boss',
        name: 'Boss',
        drops: [
            { item: 'boss_trophy', quantity: [1, 1], weight: 100, rarity: 'legendary', guaranteed: true },
            { item: 'ancient_bone', quantity: [3, 6], weight: 40, rarity: 'rare' },
            { item: 'primal_essence', quantity: [1, 2], weight: 30, rarity: 'epic' },
            { item: 'legendary_material', quantity: [1, 1], weight: 10, rarity: 'legendary' }
        ]
    },
    
    // Wildlife drops
    WILDLIFE_RABBIT: {
        id: 'wildlife_rabbit',
        name: 'Rabbit',
        drops: [
            { item: 'meat', quantity: [1, 1], weight: 60, rarity: 'common' },
            { item: 'fur', quantity: [1, 2], weight: 30, rarity: 'uncommon' },
            { item: 'rabbit_foot', quantity: [1, 1], weight: 10, rarity: 'rare' }
        ]
    },
    WILDLIFE_DEER: {
        id: 'wildlife_deer',
        name: 'Deer',
        drops: [
            { item: 'meat', quantity: [2, 4], weight: 50, rarity: 'common' },
            { item: 'hide', quantity: [1, 2], weight: 30, rarity: 'common' },
            { item: 'antler', quantity: [0, 2], weight: 20, rarity: 'uncommon' }
        ]
    },
    WILDLIFE_BOAR: {
        id: 'wildlife_boar',
        name: 'Boar',
        drops: [
            { item: 'meat', quantity: [2, 5], weight: 45, rarity: 'common' },
            { item: 'hide', quantity: [1, 2], weight: 35, rarity: 'common' },
            { item: 'tusk', quantity: [0, 2], weight: 20, rarity: 'uncommon' }
        ]
    },
    WILDLIFE_MAMMOTH: {
        id: 'wildlife_mammoth',
        name: 'Mammoth',
        drops: [
            { item: 'meat', quantity: [5, 10], weight: 40, rarity: 'common' },
            { item: 'mammoth_hide', quantity: [2, 4], weight: 30, rarity: 'uncommon' },
            { item: 'mammoth_tusk', quantity: [0, 2], weight: 20, rarity: 'rare' },
            { item: 'mammoth_bone', quantity: [2, 4], weight: 10, rarity: 'rare' }
        ]
    },
    
    // Mining drops
    MINING_STONE: {
        id: 'mining_stone',
        name: 'Stone Ore',
        drops: [
            { item: 'stone', quantity: [2, 4], weight: 70, rarity: 'common' },
            { item: 'flint', quantity: [0, 2], weight: 20, rarity: 'uncommon' },
            { item: 'gem_rough', quantity: [0, 1], weight: 10, rarity: 'rare' }
        ]
    },
    MINING_COPPER: {
        id: 'mining_copper',
        name: 'Copper Ore',
        drops: [
            { item: 'copper_ore', quantity: [1, 3], weight: 60, rarity: 'common' },
            { item: 'stone', quantity: [1, 2], weight: 30, rarity: 'common' },
            { item: 'gem_rough', quantity: [0, 1], weight: 10, rarity: 'rare' }
        ]
    },
    MINING_IRON: {
        id: 'mining_iron',
        name: 'Iron Ore',
        drops: [
            { item: 'iron_ore', quantity: [1, 2], weight: 50, rarity: 'uncommon' },
            { item: 'stone', quantity: [1, 2], weight: 35, rarity: 'common' },
            { item: 'gold_nugget', quantity: [0, 1], weight: 15, rarity: 'rare' }
        ]
    },
    
    // Chest loot
    CHEST_COMMON: {
        id: 'chest_common',
        name: 'Common Chest',
        rolls: [2, 4],
        drops: [
            { item: 'stone', quantity: [5, 15], weight: 25, rarity: 'common' },
            { item: 'stick', quantity: [5, 10], weight: 25, rarity: 'common' },
            { item: 'fiber', quantity: [5, 10], weight: 20, rarity: 'common' },
            { item: 'berries', quantity: [3, 8], weight: 15, rarity: 'common' },
            { item: 'flint', quantity: [2, 5], weight: 15, rarity: 'uncommon' }
        ]
    },
    CHEST_RARE: {
        id: 'chest_rare',
        name: 'Rare Chest',
        rolls: [3, 5],
        drops: [
            { item: 'iron_ore', quantity: [3, 8], weight: 25, rarity: 'uncommon' },
            { item: 'leather', quantity: [3, 6], weight: 20, rarity: 'uncommon' },
            { item: 'bronze_ingot', quantity: [2, 4], weight: 20, rarity: 'rare' },
            { item: 'gem_rough', quantity: [1, 3], weight: 15, rarity: 'rare' },
            { item: 'ancient_scroll', quantity: [1, 1], weight: 10, rarity: 'rare' },
            { item: 'enchanted_bone', quantity: [1, 2], weight: 10, rarity: 'epic' }
        ]
    },
    CHEST_LEGENDARY: {
        id: 'chest_legendary',
        name: 'Legendary Chest',
        rolls: [4, 6],
        drops: [
            { item: 'gold_ingot', quantity: [3, 8], weight: 25, rarity: 'rare' },
            { item: 'gem_polished', quantity: [2, 4], weight: 20, rarity: 'rare' },
            { item: 'enchanted_ore', quantity: [2, 4], weight: 20, rarity: 'epic' },
            { item: 'legendary_material', quantity: [1, 2], weight: 15, rarity: 'epic' },
            { item: 'artifact_shard', quantity: [1, 1], weight: 10, rarity: 'legendary' },
            { item: 'ancient_weapon', quantity: [1, 1], weight: 5, rarity: 'legendary' },
            { item: 'mythic_core', quantity: [1, 1], weight: 5, rarity: 'legendary' }
        ]
    },
    
    // Fishing
    FISHING_BASIC: {
        id: 'fishing_basic',
        name: 'Basic Fishing',
        drops: [
            { item: 'small_fish', quantity: [1, 1], weight: 40, rarity: 'common' },
            { item: 'medium_fish', quantity: [1, 1], weight: 30, rarity: 'common' },
            { item: 'seaweed', quantity: [1, 2], weight: 15, rarity: 'common' },
            { item: 'large_fish', quantity: [1, 1], weight: 10, rarity: 'uncommon' },
            { item: 'pearl', quantity: [1, 1], weight: 5, rarity: 'rare' }
        ]
    }
};

export class LootTableSystem {
    constructor(game) {
        this.game = game;
        
        // Luck modifier (affects rare+ drops)
        this.luckModifier = 1.0;
    }
    
    // Roll loot from a table
    rollLoot(tableId, modifiers = {}) {
        const table = LOOT_TABLES[tableId.toUpperCase()] || 
                     Object.values(LOOT_TABLES).find(t => t.id === tableId);
        
        if (!table) {
            console.warn(`Loot table not found: ${tableId}`);
            return [];
        }
        
        const loot = [];
        
        // Determine number of rolls
        let rolls = 1;
        if (table.rolls) {
            const [min, max] = table.rolls;
            rolls = Math.floor(Math.random() * (max - min + 1)) + min;
        }
        
        // Apply modifiers
        const luck = (modifiers.luck || 1.0) * this.luckModifier;
        const quantityMod = modifiers.quantity || 1.0;
        
        for (let r = 0; r < rolls; r++) {
            const drop = this.selectDrop(table.drops, luck);
            if (drop) {
                loot.push(this.generateDrop(drop, quantityMod));
            }
        }
        
        // Add guaranteed drops
        for (const drop of table.drops) {
            if (drop.guaranteed) {
                loot.push(this.generateDrop(drop, quantityMod));
            }
        }
        
        // Merge same items
        return this.mergeLoot(loot);
    }
    
    // Select a drop based on weights
    selectDrop(drops, luck = 1.0) {
        // Adjust weights based on luck
        const adjustedDrops = drops.filter(d => !d.guaranteed).map(drop => {
            const rarity = RARITY[drop.rarity?.toUpperCase()] || RARITY.COMMON;
            let weight = drop.weight;
            
            // Luck increases rare+ drop chances
            if (rarity.id !== 'common') {
                weight *= luck;
            }
            
            return { ...drop, adjustedWeight: weight };
        });
        
        // Calculate total weight
        const totalWeight = adjustedDrops.reduce((sum, d) => sum + d.adjustedWeight, 0);
        
        // Roll
        let roll = Math.random() * totalWeight;
        
        for (const drop of adjustedDrops) {
            roll -= drop.adjustedWeight;
            if (roll <= 0) {
                return drop;
            }
        }
        
        return adjustedDrops[0]; // Fallback
    }
    
    // Generate a specific drop with quantity
    generateDrop(drop, quantityMod = 1.0) {
        const [minQty, maxQty] = drop.quantity;
        let quantity = Math.floor(Math.random() * (maxQty - minQty + 1)) + minQty;
        
        // Apply rarity multiplier
        const rarity = RARITY[drop.rarity?.toUpperCase()] || RARITY.COMMON;
        quantity = Math.floor(quantity * rarity.dropMultiplier * quantityMod);
        
        // Ensure at least 1 if rolled
        quantity = Math.max(1, quantity);
        
        return {
            item: drop.item,
            quantity: quantity,
            rarity: rarity.id
        };
    }
    
    // Merge same items in loot array
    mergeLoot(loot) {
        const merged = new Map();
        
        for (const drop of loot) {
            if (merged.has(drop.item)) {
                merged.get(drop.item).quantity += drop.quantity;
            } else {
                merged.set(drop.item, { ...drop });
            }
        }
        
        return Array.from(merged.values());
    }
    
    // Drop loot at position
    dropLoot(loot, x, y, z) {
        for (const drop of loot) {
            // Create item entity
            this.game.spawnItem?.(drop.item, drop.quantity, x, y, z);
            
            // Show notification
            const rarity = RARITY[drop.rarity?.toUpperCase()] || RARITY.COMMON;
            if (rarity.id !== 'common') {
                this.game.ui?.showMessage(
                    `✨ ${rarity.name} drop: ${drop.item} x${drop.quantity}!`,
                    2000
                );
            }
        }
    }
    
    // Roll and drop loot
    rollAndDrop(tableId, x, y, z, modifiers = {}) {
        const loot = this.rollLoot(tableId, modifiers);
        this.dropLoot(loot, x, y, z);
        return loot;
    }
    
    // Get table by entity type
    getTableForEntity(entityType) {
        const type = entityType.toLowerCase();
        
        // Check wildlife
        const wildlifeTable = `WILDLIFE_${type.toUpperCase()}`;
        if (LOOT_TABLES[wildlifeTable]) {
            return wildlifeTable;
        }
        
        // Check enemies
        const enemyMap = {
            'wolf': 'ENEMY_PREDATOR',
            'sabertooth': 'ENEMY_PREDATOR',
            'bear': 'ENEMY_PREDATOR',
            'goblin': 'ENEMY_BASIC',
            'skeleton': 'ENEMY_BASIC',
            'boss': 'ENEMY_BOSS'
        };
        
        return enemyMap[type] || 'ENEMY_BASIC';
    }
    
    // Set player luck modifier
    setLuckModifier(modifier) {
        this.luckModifier = modifier;
    }
    
    // Get rarity info
    getRarityInfo(rarityId) {
        return RARITY[rarityId?.toUpperCase()] || RARITY.COMMON;
    }
    
    // Serialize (no state to save, but keep for consistency)
    serialize() {
        return {
            luckModifier: this.luckModifier
        };
    }
    
    deserialize(data) {
        if (data?.luckModifier) {
            this.luckModifier = data.luckModifier;
        }
    }
    
    reset() {
        this.luckModifier = 1.0;
    }
}
